import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { Agent, AgoraClient, Area, DeepgramSTT, ExpiresIn, LemonSlice, MiniMaxTTS, OpenAI } from 'agora-agents';
import { DEFAULT_AGENT_UID, DEFAULT_AVATAR_UID } from '@/lib/agora';
import { lemonSliceParameters, readAnimationSettings } from '@/lib/lumi-animation';
import { messages } from '@/packages/i18n';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.NEXT_PUBLIC_AGORA_APP_ID && process.env.NEXT_AGORA_APP_CERTIFICATE && process.env.NEXT_LEMONSLICE_API_KEY),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > 8000) return NextResponse.json({ error: 'Configuração muito longa.' }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Invalid body');
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Envie uma configuração JSON válida.' }, { status: 400 });
  }

  const settings = readAnimationSettings(body.animation);
  const uid = body.requester_id;
  const channel = body.channel_name;
  if (!settings || typeof uid !== 'string' || !/^[1-9]\d{0,9}$/.test(uid) || Number(uid) > 4294967295 ||
    [String(DEFAULT_AGENT_UID), String(DEFAULT_AVATAR_UID)].includes(uid) ||
    typeof channel !== 'string' || !/^lumi-animation-[a-zA-Z0-9-]{1,48}$/.test(channel)) {
    return NextResponse.json({ error: 'Canal, participante ou parâmetros de animação inválidos.' }, { status: 400 });
  }

  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
  const appCertificate = process.env.NEXT_AGORA_APP_CERTIFICATE;
  const apiKey = process.env.NEXT_LEMONSLICE_API_KEY;
  if (!appId || !appCertificate || !apiKey) {
    return NextResponse.json({ error: 'Configure as credenciais Agora e NEXT_LEMONSLICE_API_KEY no servidor para testar ao vivo.' }, { status: 503 });
  }

  try {
    const image = await readFile(join(process.cwd(), 'public/assets/lumi-avatar.png'));
    const client = new AgoraClient({ area: Area.US, appId, appCertificate });
    const greeting = 'Oi! Eu sou a Lumi! Vamos imaginar uma aventura? Podemos explorar uma floresta, descobrir uma estrela e comemorar cada descoberta juntos!';
    // Intentionally isolated from the production invite route: playground prompts never change the app defaults.
    const agent = new Agent({
      client,
      instructions: messages.voice.agentPrompt('explorador', 8, 'testar movimentos contando uma história curta'),
      greeting,
      failureMessage: messages.voice.genericFailure,
      maxHistory: 15,
      turnDetection: { config: {
        speech_threshold: 0.5,
        start_of_speech: { mode: 'vad', vad_config: { interrupt_duration_ms: 160, prefix_padding_ms: 300 } },
        end_of_speech: { mode: 'vad', vad_config: { silence_duration_ms: 480 } },
      } },
      advancedFeatures: { enable_rtm: true },
      parameters: { audio_scenario: 'chorus', data_channel: 'rtm', enable_error_message: true, enable_metrics: true },
    })
      .withStt(new DeepgramSTT({ model: 'nova-3', language: 'pt' }))
      .withLlm(new OpenAI({ model: 'gpt-4o-mini', greetingMessage: greeting, failureMessage: messages.voice.genericFailure, maxHistory: 15, params: { max_tokens: 500, temperature: 0.65 } }))
      .withTts(new MiniMaxTTS({ model: 'speech_2_6_turbo', voiceId: 'English_captivating_female1' }))
      .withAvatar(new LemonSlice({ apiKey, agoraUid: String(DEFAULT_AVATAR_UID), additionalParams: {
        agent_image_base64: image.toString('base64'),
        ...lemonSliceParameters(settings),
      } }));
    const session = agent.createSession({
      channel, agentUid: String(DEFAULT_AGENT_UID), remoteUids: [uid],
      idleTimeout: 60, expiresIn: ExpiresIn.hours(1), debug: false,
    });
    const agentId = await session.start();
    return NextResponse.json({ agent_id: agentId, create_ts: Math.floor(Date.now() / 1000), state: 'RUNNING' });
  } catch {
    return NextResponse.json({ error: 'Não foi possível iniciar o teste. Confira as credenciais, o saldo e a disponibilidade do Lemon Slice e da Agora.' }, { status: 502 });
  }
}
