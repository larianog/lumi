import { NextRequest, NextResponse } from 'next/server';
import { getFamilyForSession, getRecording } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { readRecordingFile } from '@/lib/recording-storage';
import { getDemoSessionScope } from '@/lib/study-materials';

export const runtime = 'nodejs';

type RecordingFileRouteContext = { params: Promise<{ id: string }> };

/**
 * Parent area: stream a recording's audio. Supports `Range` so the player can
 * seek. Private (`no-store`) and only for the same family.
 */
export async function GET(request: NextRequest, context: RecordingFileRouteContext) {
  try {
    const { id } = await context.params;
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    const recording = await getRecording(id, result.family.id, getDemoSessionScope(result.session));
    if (!recording) return NextResponse.json({ error: 'Gravação não encontrada.' }, { status: 404 });

    const bytes = await readRecordingFile(recording.storageKey);
    if (!bytes) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });

    const headers = {
      'Content-Type': recording.mimeType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
    };
    const range = request.headers.get('range')?.match(/^bytes=(\d*)-(\d*)$/);
    if (!range) {
      return new NextResponse(new Uint8Array(bytes), { status: 200, headers: { ...headers, 'Content-Length': String(bytes.length) } });
    }

    const size = bytes.length;
    let start = range[1] ? Number(range[1]) : size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    return new NextResponse(new Uint8Array(bytes.subarray(start, end + 1)), {
      status: 206,
      headers: {
        ...headers,
        'Content-Range': `bytes ${start}-${end}/${size}`,
        'Content-Length': String(end - start + 1),
      },
    });
  } catch (error) {
    console.error('Error reading recording:', error);
    return NextResponse.json({ error: 'Não foi possível abrir a gravação.' }, { status: 500 });
  }
}
