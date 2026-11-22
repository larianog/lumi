import { NextRequest, NextResponse } from 'next/server';
import { getFamilyForSession, getStudyMaterial } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { readMaterialFile } from '@/lib/material-storage';
import { ownsStudyMaterial } from '@/lib/study-materials';

type MaterialFileRouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: MaterialFileRouteContext) {
  try {
    const { id } = await context.params;
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);

    if (!result) {
      return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    }

    const material = await getStudyMaterial(id);
    if (!material || !ownsStudyMaterial(material, result.family.id, result.session)) {
      return NextResponse.json({ error: 'Material não encontrado.' }, { status: 404 });
    }

    if (!material.storageKey) {
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }

    const fileBuffer = await readMaterialFile(material.storageKey);
    if (!fileBuffer) return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': material.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${encodeURIComponent(material.originalName)}"`,
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error serving material file:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o arquivo.' }, { status: 500 });
  }
}
