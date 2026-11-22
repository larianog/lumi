import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { NextRequest } from 'next/server';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  const originalCwd = process.cwd();
  const sandbox = await mkdtemp(path.join(tmpdir(), 'lumi-family-flow-'));
  process.chdir(sandbox);

  try {
    const { createSession } = await import('../lib/db.ts' as string) as typeof import('../lib/db');
    const profiles = await import('../app/api/profiles/route.ts' as string) as typeof import('../app/api/profiles/route');
    const recordings = await import('../app/api/recordings/route.ts' as string) as typeof import('../app/api/recordings/route');
    const recordingFile = await import('../app/api/recordings/[id]/file/route.ts' as string) as typeof import('../app/api/recordings/[id]/file/route');
    const recordingDetail = await import('../app/api/recordings/[id]/route.ts' as string) as typeof import('../app/api/recordings/[id]/route');
    const makeRequest = (url: string, method: string, body: unknown, token?: string) => new NextRequest(`http://localhost${url}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Cookie: `lumi_session=${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const demoA = await createSession('demo-family', true);
    const demoB = await createSession('demo-family', true);
    const avatarSave = await profiles.PATCH(makeRequest('/api/profiles', 'PATCH', { profileId: 'demo-lia', lumiAvatar: 'alien' }, demoA));
    assert(avatarSave.status === 200, 'Demo child can choose a catalog avatar');
    const selected = await profiles.GET(makeRequest('/api/profiles?profileId=demo-lia', 'GET', undefined, demoA));
    const untouched = await profiles.GET(makeRequest('/api/profiles?profileId=demo-lia', 'GET', undefined, demoB));
    assert((await selected.json()).profile.lumiAvatar === 'alien', 'Demo choice is visible in its own session');
    assert(!(await untouched.json()).profile.lumiAvatar, 'Another demo session keeps the Plush default');
    assert((await profiles.PATCH(makeRequest('/api/profiles', 'PATCH', { profileId: 'demo-adult', lumiAvatar: 'hero' }, demoA))).status === 404, 'Adult profile cannot change the child avatar');
    assert((await profiles.PATCH(makeRequest('/api/profiles', 'PATCH', { profileId: 'demo-lia', lumiAvatar: 'unknown' }, demoA))).status === 400, 'Unknown avatar is rejected');

    const adult = await profiles.POST(makeRequest('/api/profiles', 'POST', {
      firstName: 'Ana', lastName: 'Silva', phone: '11999990000', password: 'example123',
    }));
    assert(adult.status === 201, 'Sign-up creates the adult account without a birth date');
    const familyToken = adult.cookies.get('lumi_session')?.value;
    assert(familyToken, 'Adult sign-up creates a family session');
    const children = await profiles.POST(makeRequest('/api/profiles', 'POST', {
      children: [
        { firstName: 'Lia', lastName: 'Silva', birthDate: '2018-08-12' },
        { firstName: 'Caio', lastName: 'Silva', birthDate: '2016-03-03' },
      ],
    }, familyToken));
    assert(children.status === 201 && (await children.json()).newProfiles.length === 2, 'Step two adds both children');
    const family = await profiles.GET(makeRequest('/api/profiles', 'GET', undefined, familyToken));
    assert((await family.json()).family.profiles.length === 3, 'Family contains the adult and both children');

    const form = new FormData();
    form.set('profileId', 'demo-lia');
    form.set('title', 'Lição de teste');
    form.set('durationMs', '4000');
    form.set('file', new File([new Uint8Array([1, 2, 3, 4])], 'session.webm', { type: 'audio/webm' }));
    const upload = await recordings.POST(new NextRequest('http://localhost/api/recordings', {
      method: 'POST', headers: { Cookie: `lumi_session=${demoA}` }, body: form,
    }));
    assert(upload.status === 201, 'Demo voice recording uploads');
    const recordingId = (await upload.json()).id as string;
    const listA = await recordings.GET(makeRequest('/api/recordings', 'GET', undefined, demoA));
    const listB = await recordings.GET(makeRequest('/api/recordings', 'GET', undefined, demoB));
    assert((await listA.json()).length === 1, 'Recording appears in its demo session');
    assert((await listB.json()).length === 0, 'Recording is private from other demo sessions');
    const context = { params: Promise.resolve({ id: recordingId }) };
    const audio = await recordingFile.GET(new NextRequest(`http://localhost/api/recordings/${recordingId}/file`, {
      headers: { Cookie: `lumi_session=${demoA}`, Range: 'bytes=0-2' },
    }), context);
    assert(audio.status === 206 && (await audio.arrayBuffer()).byteLength === 3, 'Report audio supports private byte-range playback');
    assert((await recordingDetail.DELETE(makeRequest(`/api/recordings/${recordingId}`, 'DELETE', undefined, demoA), context)).status === 200, 'Report can delete its recording');

    process.stdout.write('Family sign-up, demo avatar and report recording checks passed\n');
  } finally {
    process.chdir(originalCwd);
    await rm(sandbox, { recursive: true, force: true });
  }
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
