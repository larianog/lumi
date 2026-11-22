import { AgoraClient, Agent } from 'agora-agents';
import { RtcTokenBuilder } from 'agora-token';
import { NextRequest } from 'next/server';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

process.env.NEXT_PUBLIC_AGORA_APP_ID = '0123456789abcdef0123456789abcdef';
process.env.NEXT_AGORA_APP_CERTIFICATE = 'fedcba9876543210fedcba9876543210';

async function verifyGenerateAgoraTokenRoute() {
  const { GET: generateAgoraToken } =
    await import('../app/api/generate-agora-token/route');
  const originalBuildTokenWithRtm = RtcTokenBuilder.buildTokenWithRtm;
  let tokenBuilderArgs: unknown[] | null = null;

  RtcTokenBuilder.buildTokenWithRtm = ((...args: unknown[]) => {
    tokenBuilderArgs = args;
    return 'mock-rtc-rtm-token';
  }) as typeof RtcTokenBuilder.buildTokenWithRtm;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/generate-agora-token?uid=4321&channel=test-channel',
    );
    const response = await generateAgoraToken(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'GET /api/generate-agora-token should return 200',
    );
    assert(
      body.token === 'mock-rtc-rtm-token',
      'GET /api/generate-agora-token should return the built token',
    );
    assert(
      body.uid === '4321',
      'GET /api/generate-agora-token should preserve the requested uid',
    );
    assert(
      body.channel === 'test-channel',
      'GET /api/generate-agora-token should preserve the requested channel',
    );

    assert(
      Array.isArray(tokenBuilderArgs),
      'GET /api/generate-agora-token should call buildTokenWithRtm',
    );
    assert(
      tokenBuilderArgs?.[2] === 'test-channel',
      'buildTokenWithRtm should use the requested channel',
    );
    assert(
      tokenBuilderArgs?.[3] === '4321',
      'buildTokenWithRtm should receive the requested uid as account string',
    );
  } finally {
    RtcTokenBuilder.buildTokenWithRtm = originalBuildTokenWithRtm;
  }
}

async function verifyGenerateAgoraTokenReplacesZeroUid() {
  const { GET: generateAgoraToken } =
    await import('../app/api/generate-agora-token/route');
  const originalBuildTokenWithRtm = RtcTokenBuilder.buildTokenWithRtm;
  let tokenBuilderArgs: unknown[] | null = null;

  RtcTokenBuilder.buildTokenWithRtm = ((...args: unknown[]) => {
    tokenBuilderArgs = args;
    return 'mock-rtc-rtm-token';
  }) as typeof RtcTokenBuilder.buildTokenWithRtm;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/generate-agora-token?uid=0&channel=test-channel',
    );
    const response = await generateAgoraToken(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'GET /api/generate-agora-token?uid=0 should return 200',
    );
    assert(
      typeof body.uid === 'string' && body.uid !== '0',
      'GET /api/generate-agora-token?uid=0 should generate an RTM-safe uid',
    );
    assert(
      Array.isArray(tokenBuilderArgs) && tokenBuilderArgs[3] === body.uid,
      'buildTokenWithRtm should mint the token for the generated uid',
    );
  } finally {
    RtcTokenBuilder.buildTokenWithRtm = originalBuildTokenWithRtm;
  }
}

async function verifyAgoraParticipantUidBounds() {
  const { GET } = await import('../app/api/generate-agora-token/route');
  const { POST } = await import('../app/api/invite-agent/route');
  const originalToken = RtcTokenBuilder.buildTokenWithRtm;
  const originalSession = Agent.prototype.createSession;
  let tokens = 0;
  let starts = 0;
  RtcTokenBuilder.buildTokenWithRtm = (() => { tokens++; return 'mock-token'; }) as typeof RtcTokenBuilder.buildTokenWithRtm;
  Agent.prototype.createSession = function (options) {
    assert(options.remoteUids?.[0] === '2147483647', 'Invite must preserve the largest supported participant UID');
    return { start: async () => { starts++; return 'boundary-agent'; } } as ReturnType<Agent['createSession']>;
  };
  const invite = (uid: string) => POST(new NextRequest('http://localhost/api/invite-agent', {
    method: 'POST', body: JSON.stringify({ requester_id: uid, channel_name: 'uid-boundary', avatar_mode: 'local' }),
  }));
  try {
    for (const uid of ['2147483648', '2796831013', '2746931989', '4294967295']) {
      assert((await GET(new NextRequest(`http://localhost/api/generate-agora-token?uid=${uid}`))).status === 400, 'Reject unsupported token identity without silently changing it');
      assert((await invite(uid)).status === 400, 'Reject oversized participants before calling Agora');
    }
    assert(tokens === 0 && starts === 0, 'Invalid UIDs must not mint tokens or start an agent');
    const maximum = await GET(new NextRequest('http://localhost/api/generate-agora-token?uid=2147483647'));
    assert(maximum.status === 200 && (await maximum.json()).uid === '2147483647', 'Maximum participant UID is supported');
    assert((await invite('2147483647')).status === 200, 'Maximum participant UID reaches the agent contract');
  } finally {
    RtcTokenBuilder.buildTokenWithRtm = originalToken;
    Agent.prototype.createSession = originalSession;
  }
}

async function verifyChatCompletionsMissingEnv() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;

  delete process.env.NEXT_LLM_API_KEY;
  delete process.env.NEXT_LLM_URL;

  const handler = createChatCompletionsHandler({
    createOpenAIClient: (() => {
      throw new Error('createOpenAI should not be called when env is missing');
    }) as never,
    streamTextImpl: (() => {
      throw new Error('streamText should not be called when env is missing');
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: JSON.stringify({ messages: [] }),
        method: 'POST',
      },
    );
    const response = await handler(request);
    const body = await getJson(response);

    assert(
      response.status === 500,
      'POST /api/chat/completions should reject missing LLM env',
    );
    assert(
      body.error === 'NEXT_LLM_API_KEY and NEXT_LLM_URL must be set',
      'POST /api/chat/completions should explain missing LLM env',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyChatCompletionsInvalidJson() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;
  process.env.NEXT_LLM_API_KEY = 'test-key';
  process.env.NEXT_LLM_URL = 'https://example.test/v1/chat/completions';

  const handler = createChatCompletionsHandler({
    createOpenAIClient: (() => {
      throw new Error('createOpenAI should not be called for invalid JSON');
    }) as never,
    streamTextImpl: (() => {
      throw new Error('streamText should not be called for invalid JSON');
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: '{not json',
        method: 'POST',
      },
    );
    const response = await handler(request);
    const body = await getJson(response);

    assert(
      response.status === 400,
      'POST /api/chat/completions should reject invalid JSON',
    );
    assert(
      body.error === 'Invalid JSON body',
      'POST /api/chat/completions should explain invalid JSON',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyChatCompletionsSseDone() {
  const { createChatCompletionsHandler } =
    await import('../lib/chat-completions');
  const originalApiKey = process.env.NEXT_LLM_API_KEY;
  const originalUrl = process.env.NEXT_LLM_URL;
  process.env.NEXT_LLM_API_KEY = 'test-key';
  process.env.NEXT_LLM_URL = 'https://example.test/v1/chat/completions';

  let capturedBaseUrl: string | undefined;
  let capturedModelId: string | undefined;
  let capturedMessages: unknown;

  const handler = createChatCompletionsHandler({
    createOpenAIClient: ((options: { baseURL?: string }) => {
      capturedBaseUrl = options.baseURL;
      return (modelId: string) => {
        capturedModelId = modelId;
        return { modelId };
      };
    }) as never,
    streamTextImpl: ((options: { messages?: unknown }) => {
      capturedMessages = options.messages;
      return {
        textStream: (async function* () {
          yield 'hello';
          yield ' world';
        })(),
      };
    }) as never,
  });

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/chat/completions',
      {
        body: JSON.stringify({
          model: 'caller-model-ignored-for-routing',
          messages: [{ role: 'user', content: 'Hi' }],
        }),
        method: 'POST',
      },
    );
    const response = await handler(request);
    const text = await response.text();

    assert(
      response.status === 200,
      'POST /api/chat/completions should return 200 for a valid request',
    );
    assert(
      response.headers.get('content-type') === 'text/event-stream',
      'POST /api/chat/completions should return SSE content type',
    );
    assert(
      capturedBaseUrl === 'https://example.test/v1',
      'POST /api/chat/completions should pass base URL without /chat/completions',
    );
    assert(
      capturedModelId === 'gpt-4o',
      'POST /api/chat/completions should route to the pinned server model',
    );
    assert(
      JSON.stringify(capturedMessages) ===
        JSON.stringify([{ role: 'user', content: 'Hi' }]),
      'POST /api/chat/completions should pass request messages to streamText',
    );
    assert(
      text.includes('data: [DONE]'),
      'POST /api/chat/completions should terminate with [DONE]',
    );
    assert(
      text.includes('"content":"hello"') && text.includes('"content":" world"'),
      'POST /api/chat/completions should stream text chunks as OpenAI-compatible deltas',
    );
  } finally {
    if (originalApiKey === undefined) {
      delete process.env.NEXT_LLM_API_KEY;
    } else {
      process.env.NEXT_LLM_API_KEY = originalApiKey;
    }
    if (originalUrl === undefined) {
      delete process.env.NEXT_LLM_URL;
    } else {
      process.env.NEXT_LLM_URL = originalUrl;
    }
  }
}

async function verifyInviteAgentValidation() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const request = new NextRequest('http://localhost:3000/api/invite-agent', {
    body: JSON.stringify({ channel_name: 'missing-requester' }),
    method: 'POST',
  });
  const response = await inviteAgent(request);
  const body = await getJson(response);

  assert(
    response.status === 400,
    'POST /api/invite-agent should reject missing fields',
  );
  assert(
    body.error === 'channel_name and requester_id are required',
    'POST /api/invite-agent should explain validation failure',
  );
}

async function verifyInviteAgentSuccess() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const originalCreateSession = Agent.prototype.createSession;
  let capturedSessionConfig: {
    channel?: string;
    agentUid?: string;
    remoteUids?: string[];
  } | null = null;

  Agent.prototype.createSession = ((sessionConfig: unknown) => {
    capturedSessionConfig = sessionConfig as {
      channel?: string;
      agentUid?: string;
      remoteUids?: string[];
    };
    return {
      start: async () => 'mock-agent-id',
    };
  }) as unknown as typeof Agent.prototype.createSession;

  try {
    const request = new NextRequest('http://localhost:3000/api/invite-agent', {
      body: JSON.stringify({
        requester_id: '4321',
        channel_name: 'test-channel',
      }),
      method: 'POST',
    });
    const response = await inviteAgent(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'POST /api/invite-agent should return 200 on success',
    );
    assert(
      body.agent_id === 'mock-agent-id',
      'POST /api/invite-agent should return the started agent id',
    );
    assert(
      body.state === 'RUNNING',
      'POST /api/invite-agent should return RUNNING state',
    );
    assert(
      capturedSessionConfig !== null,
      'POST /api/invite-agent should call createSession',
    );
    const sessionConfig = capturedSessionConfig as {
      channel?: string;
      agentUid?: string;
      remoteUids?: string[];
    };

    assert(
      sessionConfig.channel === 'test-channel',
      'POST /api/invite-agent should pass the requested channel to createSession',
    );
    assert(
      sessionConfig.agentUid === '123456',
      'POST /api/invite-agent should use the shared default agent UID',
    );
    assert(
      JSON.stringify(sessionConfig.remoteUids) ===
        JSON.stringify(['4321']),
      'POST /api/invite-agent should scope the session to the requesting user',
    );
  } finally {
    Agent.prototype.createSession = originalCreateSession;
  }
}

async function verifyLocalAvatarInvite() {
  const { POST: inviteAgent } = await import('../app/api/invite-agent/route');
  const originalCreateSession = Agent.prototype.createSession;
  const originalKey = process.env.NEXT_LEMONSLICE_API_KEY;
  const configurations: ReturnType<Agent['toProperties']>[] = [];
  const request = (avatarMode: unknown) => new NextRequest('http://localhost:3000/api/invite-agent', {
    method: 'POST',
    body: JSON.stringify({ requester_id: '4321', channel_name: 'local-avatar-contract', avatar_mode: avatarMode }),
  });
  Agent.prototype.createSession = function (this: Agent) {
    configurations.push(this.toProperties({ channel: 'local-avatar-contract', agentUid: '123456', remoteUids: ['4321'], token: 'mock-token' }));
    return { start: async () => 'mock-local-avatar-agent' } as ReturnType<Agent['createSession']>;
  };
  try {
    process.env.NEXT_LEMONSLICE_API_KEY = 'mock-provider-key';
    for (const mode of [undefined, 'provider', 'local']) {
      assert((await inviteAgent(request(mode))).status === 200, 'Supported avatar modes must start a voice session');
      assert(Boolean(configurations.at(-1)?.avatar) === (mode !== 'local'), 'Local mode must omit Lemon Slice even when its key exists; other modes preserve the provider');
    }
    for (const mode of ['unknown', null, 123]) {
      assert((await inviteAgent(request(mode))).status === 400, 'Invalid avatar modes must be rejected');
    }
    assert(configurations.length === 3, 'Invalid modes must never start sessions');
  } finally {
    Agent.prototype.createSession = originalCreateSession;
    if (originalKey === undefined) delete process.env.NEXT_LEMONSLICE_API_KEY;
    else process.env.NEXT_LEMONSLICE_API_KEY = originalKey;
  }
}

async function verifyStopConversationValidation() {
  const { POST: stopConversation } =
    await import('../app/api/stop-conversation/route');
  const request = new NextRequest(
    'http://localhost:3000/api/stop-conversation',
    {
      body: JSON.stringify({}),
      method: 'POST',
    },
  );
  const response = await stopConversation(request);
  const body = await getJson(response);

  assert(
    response.status === 400,
    'POST /api/stop-conversation should reject missing agent_id',
  );
  assert(
    body.error === 'agent_id is required',
    'POST /api/stop-conversation should explain validation failure',
  );
}

async function verifyStopConversationSuccess() {
  const { POST: stopConversation } =
    await import('../app/api/stop-conversation/route');
  const originalStopAgent = AgoraClient.prototype.stopAgent;
  let stoppedAgentId: string | null = null;

  AgoraClient.prototype.stopAgent = async function (
    this: AgoraClient,
    agentId: string,
  ) {
    stoppedAgentId = agentId;
  } as typeof AgoraClient.prototype.stopAgent;

  try {
    const request = new NextRequest(
      'http://localhost:3000/api/stop-conversation',
      {
        body: JSON.stringify({ agent_id: 'mock-agent-id' }),
        method: 'POST',
      },
    );
    const response = await stopConversation(request);
    const body = await getJson(response);

    assert(
      response.status === 200,
      'POST /api/stop-conversation should return 200 on success',
    );
    assert(
      body.success === true,
      'POST /api/stop-conversation should return success',
    );
    assert(
      stoppedAgentId === 'mock-agent-id',
      'POST /api/stop-conversation should call stopAgent with the requested agent id',
    );
  } finally {
    AgoraClient.prototype.stopAgent = originalStopAgent;
  }
}

async function verifyProfileCreationValidation() {
  const { POST: createProfile } = await import('../app/api/profiles/route');
  const request = new NextRequest('http://localhost:3000/api/profiles', {
    body: JSON.stringify({ firstName: 'Lia' }),
    method: 'POST',
  });
  const response = await createProfile(request);

  assert(
    response.status === 400,
    'POST /api/profiles should reject incomplete profile data',
  );
}

async function verifyLoginValidation() {
  const { POST: login } = await import('../app/api/login/route');
  const request = new NextRequest('http://localhost:3000/api/login', {
    body: JSON.stringify({ phone: '(11) 99999-0000' }),
    method: 'POST',
  });
  const response = await login(request);

  assert(
    response.status === 400,
    'POST /api/login should require both phone and password',
  );
}

async function verifyAdultAccessValidation() {
  const { POST: verifyAdult } = await import('../app/api/adult-access/route');
  const request = new NextRequest('http://localhost:3000/api/adult-access', {
    body: JSON.stringify({}),
    method: 'POST',
  });
  const response = await verifyAdult(request);

  assert(
    response.status === 400,
    'POST /api/adult-access should require a password',
  );
}

async function verifyActivitiesRequireSession() {
  const { POST: createCompletion } = await import('../app/api/activities/route');
  const request = new NextRequest('http://localhost:3000/api/activities', {
    body: JSON.stringify({
      profileId: 'profile-1',
      activityId: 'school',
      activityTitle: 'Conteúdo escolar',
    }),
    method: 'POST',
  });
  const response = await createCompletion(request);

  assert(
    response.status === 401,
    'POST /api/activities should require an authenticated family session',
  );
}

async function verifyMaterialsRequireSession() {
  const { POST: uploadMaterial } = await import('../app/api/materials/route');
  const request = new NextRequest('http://localhost:3000/api/materials', {
    body: new FormData(),
    method: 'POST',
  });
  const response = await uploadMaterial(request);

  assert(
    response.status === 401,
    'POST /api/materials should require an authenticated family session',
  );
}

async function verifyMaterialAnalysis() {
  const { analyzeMaterial, MaterialExtractionError } = await import('../lib/material-extraction');
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.HOMEWORK_VISION_MODEL;
  process.env.OPENAI_API_KEY = 'test-openai-key';
  process.env.HOMEWORK_VISION_MODEL = 'test-vision-model';

  const analysis = {
    readable: true,
    unreadableReason: '',
    title: 'Somas até 10',
    subject: 'Matemática',
    estimatedGrade: '1º ano',
    generalInstructions: 'Resolva as continhas.',
    notesForTutor: '',
    questions: [{
      number: '1',
      statement: '3 + 4 = ___',
      visualElements: '',
      skill: 'adição',
      expectedAnswer: 'SECRET-ANSWER-7',
      steps: ['Conte 3', 'Conte mais 4'],
      hints: ['Use os dedos'],
    }],
  };

  let capturedUrl = '';
  let capturedAuthorization = '';
  let capturedBody = '';
  const fakeResponse = (payload: unknown) => (async (input: string | URL | Request, init?: RequestInit) => {
    capturedUrl = String(input);
    capturedAuthorization = new Headers(init?.headers).get('authorization') ?? '';
    capturedBody = String(init?.body);
    return Response.json({
      id: 'resp_test',
      object: 'response',
      created_at: 1,
      model: 'test-vision-model',
      status: 'completed',
      incomplete_details: null,
      output: [{
        type: 'message',
        id: 'msg_test',
        role: 'assistant',
        status: 'completed',
        content: [{ type: 'output_text', text: JSON.stringify(payload), annotations: [] }],
      }],
      usage: {
        input_tokens: 1,
        output_tokens: 1,
        input_tokens_details: { cached_tokens: 0 },
        output_tokens_details: { reasoning_tokens: 0 },
      },
    });
  }) as typeof fetch;

  try {
    const result = await analyzeMaterial(
      Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      'image/png',
      { age: 7, literacyLevel: 'emergent' },
      fakeResponse(analysis),
    );

    assert(capturedUrl.endsWith('/responses'), 'Material analysis should call the OpenAI Responses API');
    assert(capturedAuthorization === 'Bearer test-openai-key', 'Material analysis should send the server API key');
    assert(capturedBody.includes('"test-vision-model"'), 'Material analysis should use the configured model');
    assert(capturedBody.includes('data:image/png;base64,'), 'Material analysis should send the image as multimodal content');
    assert(result.analysis.questions[0]?.expectedAnswer === 'SECRET-ANSWER-7', 'Material analysis should keep the answer key server-side');
    assert(result.text.includes('3 + 4 = ___'), 'Child transcript should include the question');
    assert(!result.text.includes('SECRET-ANSWER-7'), 'Child transcript must never include expected answers');

    let unreadableCode = '';
    try {
      await analyzeMaterial(
        Buffer.from([0x89, 0x50, 0x4e, 0x47]),
        'image/png',
        { age: 7, literacyLevel: 'emergent' },
        fakeResponse({ ...analysis, readable: false, unreadableReason: 'Não é uma lição.', questions: [] }),
      );
    } catch (error) {
      unreadableCode = error instanceof MaterialExtractionError ? error.code : 'OTHER';
    }
    assert(unreadableCode === 'UNREADABLE', 'Non-homework uploads should be rejected as UNREADABLE');
  } finally {
    if (originalApiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalApiKey;
    if (originalModel === undefined) delete process.env.HOMEWORK_VISION_MODEL;
    else process.env.HOMEWORK_VISION_MODEL = originalModel;
  }
}

async function main() {
  await verifyGenerateAgoraTokenRoute();
  await verifyGenerateAgoraTokenReplacesZeroUid();
  await verifyAgoraParticipantUidBounds();
  const { verifyAgoraRtmSession } = await import('./verify-agora-rtm-session');
  await verifyAgoraRtmSession();
  await verifyChatCompletionsMissingEnv();
  await verifyChatCompletionsInvalidJson();
  await verifyChatCompletionsSseDone();
  await verifyInviteAgentValidation();
  await verifyInviteAgentSuccess();
  await verifyLocalAvatarInvite();
  const { verifyLumiSpeech } = await import('./verify-lumi-speech');
  verifyLumiSpeech();
  const { verifyLumiTransitions } = await import('./verify-lumi-transitions');
  await verifyLumiTransitions();
  const { verifyLumiMotion } = await import('./verify-lumi-motion');
  verifyLumiMotion();
  const { verifyLumiWebP } = await import('./verify-lumi-webp');
  await verifyLumiWebP();
  await verifyStopConversationValidation();
  await verifyStopConversationSuccess();
  const { verifyLumiAnimation } = await import('./verify-lumi-animation');
  await verifyLumiAnimation();
  await verifyProfileCreationValidation();
  await verifyLoginValidation();
  await verifyAdultAccessValidation();
  await verifyActivitiesRequireSession();
  await verifyMaterialsRequireSession();
  await verifyMaterialAnalysis();

  console.log('API contract checks passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
