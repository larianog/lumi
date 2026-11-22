import { NextRequest, NextResponse } from 'next/server';
import { deleteRecording, getFamilyForSession } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { deleteRecordingFiles } from '@/lib/recording-storage';
import { getDemoSessionScope } from '@/lib/study-materials';

export const runtime = 'nodejs';

type RecordingRouteContext = { params: Promise<{ id: string }> };

/** Parent area: delete a recording and its audio file. */
export async function DELETE(request: NextRequest, context: RecordingRouteContext) {
  try {
    const { id } = await context.params;
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    const storageKey = await deleteRecording(id, result.family.id, getDemoSessionScope(result.session));
    if (!storageKey) return NextResponse.json({ error: 'Gravação não encontrada.' }, { status: 404 });
    await deleteRecordingFiles([storageKey]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recording:', error);
    return NextResponse.json({ error: 'Não foi possível apagar a gravação.' }, { status: 500 });
  }
}
