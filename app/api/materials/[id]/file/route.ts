import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { getFamilyForSession, getStudyMaterial } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import { ownsStudyMaterial } from '@/lib/study-materials';

const MATERIAL_CACHE_DIR = path.join(process.cwd(), 'data', 'material-cache');

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

    const filePath = path.join(MATERIAL_CACHE_DIR, material.storageKey);

    try {
      const fileBuffer = await fs.readFile(filePath);

      // Determine content type from mimeType or file extension
      const contentType = material.mimeType || 'application/octet-stream';

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `inline; filename="${encodeURIComponent(material.originalName)}"`,
          'Cache-Control': 'no-cache',
        },
      });
    } catch (fileError) {
      console.error('Error reading material file:', fileError);
      return NextResponse.json({ error: 'Arquivo não encontrado.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error serving material file:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o arquivo.' }, { status: 500 });
  }
}
