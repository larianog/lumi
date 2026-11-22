import { NextRequest, NextResponse } from 'next/server';
import {
  AgoraClient,
  Agent,
  Area,
  DeepgramSTT,
  ExpiresIn,
  LemonSlice,
  MiniMaxTTS,
  OpenAI,
} from 'agora-agents';
import { DEFAULT_AGENT_UID, DEFAULT_AVATAR_UID } from '@/lib/agora';
import { buildAgentToken, buildAvatarToken } from '@/lib/agora-agent-token';
import { resolveLemonSliceSource } from '@/lib/lumi-avatar-source';
import { getLumiAvatar } from '@/lib/lumi-avatars';
import { getFamilyForSession, getStudyMaterial } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { defaultLiteracyLevel, formatHomeworkBrief } from '@/lib/material-extraction';
import { ownsStudyMaterial } from '@/lib/study-materials';
import type { HomeworkAnalysis, LiteracyLevel } from '@/types/database';
import { messages } from '@/packages/i18n';
import type { AgentResponse, ClientStartRequest } from '@/types/conversation';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(request: NextRequest) {
  try {
    const body: ClientStartRequest = await request.json();
    const { requester_id: requesterId, channel_name: channelName } = body;
    if (!channelName || !requesterId) {
      return NextResponse.json({ error: 'channel_name and requester_id are required' }, { status: 400 });
    }

    let profileName = body.profile_name?.trim().slice(0, 40) || 'explorador';
    let age = Math.min(10, Math.max(6, Number(body.age) || 8));
    const activityTitle = body.activity_title?.trim().slice(0, 80) || 'uma descoberta livre';
    let materialText: string | undefined;
    let homework: { analysis: HomeworkAnalysis; literacyLevel: LiteracyLevel } | undefined;

    if (body.material_id || body.profile_id) {
      if (!body.material_id || !body.profile_id) {
        return NextResponse.json({ error: 'profile_id and material_id must be provided together' }, { status: 400 });
      }
      const familyResult = await getFamilyForSession(getSessionToken(request));
      if (!familyResult) {
        return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
      }
      const material = await getStudyMaterial(body.material_id);
      const profile = familyResult.family.profiles.find((candidate) => candidate.id === body.profile_id);
      if (!material || !profile || material.profileId !== profile.id
        || !ownsStudyMaterial(material, familyResult.family.id, familyResult.session)) {
        return NextResponse.json({ error: 'Material não encontrado.' }, { status: 404 });
      }
      if (material.extractionStatus !== 'ready' || !material.extractedText || material.purgedAt) {
        return NextResponse.json({ error: 'O material ainda não está disponível.' }, { status: 409 });
      }
      profileName = profile.firstName.slice(0, 40);
      age = calculateAge(profile.birthDate);
      materialText = material.extractedText.slice(0, 40_000);
      // Materials analyzed for tutoring carry a server-only brief (with answers).
      if (material.analysis) {
        homework = {
          analysis: material.analysis,
          literacyLevel: material.literacyLevel ?? defaultLiteracyLevel(age),
        };
      }
    }

    const greeting = homework
      ? messages.voice.homeworkGreeting(profileName, homework.analysis.title)
      : messages.voice.agentGreeting(profileName);
    const instructions = homework
      ? messages.voice.homeworkPrompt(
          profileName,
          age,
          homework.literacyLevel,
          formatHomeworkBrief(homework.analysis),
        )
      : messages.voice.agentPrompt(profileName, age, activityTitle, materialText);

    const client = new AgoraClient({
      area: Area.US,
      appId: requireEnv('NEXT_PUBLIC_AGORA_APP_ID'),
      appCertificate: requireEnv('NEXT_AGORA_APP_CERTIFICATE'),
      // REST auth: the SDK's per-request token also expires after one second, which
      // fails large start requests with 401 "Token is expired" (lib/agora-agent-token.ts).
      authToken: buildAgentToken(channelName, DEFAULT_AGENT_UID),
    });

    let agent = new Agent({
      client,
      instructions,
      greeting,
      failureMessage: messages.voice.genericFailure,
      maxHistory: 30,
      turnDetection: {
        config: {
          speech_threshold: 0.5,
          start_of_speech: {
            mode: 'vad',
            vad_config: { interrupt_duration_ms: 160, prefix_padding_ms: 300 },
          },
          end_of_speech: {
            mode: 'vad',
            vad_config: { silence_duration_ms: 480 },
          },
        },
      },
      advancedFeatures: { enable_rtm: true, enable_tools: true },
      parameters: {
        audio_scenario: 'chorus',
        data_channel: 'rtm',
        enable_error_message: true,
        enable_metrics: true,
      },
    })
      .withStt(new DeepgramSTT({ model: 'nova-3', language: 'pt' }))
      .withLlm(
        new OpenAI({
          model: 'gpt-4o-mini',
          greetingMessage: greeting,
          failureMessage: messages.voice.genericFailure,
          maxHistory: 15,
          params: { max_tokens: 500, temperature: 0.65, top_p: 0.95 },
        }),
      )
      .withTts(
        new MiniMaxTTS({
          model: 'speech_2_6_turbo',
          voiceId: 'English_captivating_female1',
          // 4 = skip text inside [ ]: Lumi's [preencher …] commands for the answer grid.
          skipPatterns: [4],
        }),
      );

    const lemonSliceApiKey = process.env.NEXT_LEMONSLICE_API_KEY;
    if (lemonSliceApiKey) {
      // The child's chosen Lumi (lib/lumi-avatars.ts); unknown values fall back to the default.
      const avatarSource = await resolveLemonSliceSource(getLumiAvatar(body.avatar_id).id);
      agent = agent.withAvatar(
        new LemonSlice({
          apiKey: lemonSliceApiKey,
          agoraUid: String(DEFAULT_AVATAR_UID),
          agoraToken: buildAvatarToken(channelName, DEFAULT_AVATAR_UID),
          ...avatarSource,
        }),
      );
    }

    const session = agent.createSession({
      channel: channelName,
      agentUid: String(DEFAULT_AGENT_UID),
      // Pre-built: the SDK's own token expires after one second (see lib/agora-agent-token.ts).
      token: buildAgentToken(channelName, DEFAULT_AGENT_UID),
      remoteUids: [requesterId],
      idleTimeout: 60,
      expiresIn: ExpiresIn.hours(1),
      debug: false,
    });

    const agentId = await session.start();
    return NextResponse.json({
      agent_id: agentId,
      create_ts: Math.floor(Date.now() / 1000),
      state: 'RUNNING',
    } satisfies AgentResponse);
  } catch (error) {
    console.error('Error starting Lumi conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start Lumi conversation' },
      { status: 500 },
    );
  }
}

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(`${birthDate}T12:00:00`);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) age -= 1;
  return Math.min(17, Math.max(4, age));
}
