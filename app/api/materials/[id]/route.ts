import { NextRequest, NextResponse } from 'next/server';
import { completeStudyMaterial, getFamilyForSession, getStudyMaterial } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';
import {
  cleanupExpiredStudyMaterialContent,
  ownsStudyMaterial,
  toStudyMaterialDto,
} from '@/lib/study-materials';

export const runtime = 'nodejs';

type MaterialRouteContext = { params: Promise<{ id: string }> };

async function getAuthorizedMaterial(request: NextRequest, context: MaterialRouteContext) {
  const [{ id }, result] = await Promise.all([
    context.params,
    getFamilyForSession(getSessionToken(request)),
  ]);
  if (!result) return { error: NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 }) };

  const material = await getStudyMaterial(id);
  if (!material || !ownsStudyMaterial(material, result.family.id, result.session)) {
    return { error: NextResponse.json({ error: 'Material não encontrado.' }, { status: 404 }) };
  }
  return { material };
}

export async function GET(request: NextRequest, context: MaterialRouteContext) {
  try {
    await cleanupExpiredStudyMaterialContent();
    const result = await getAuthorizedMaterial(request, context);
    if ('error' in result) return result.error;
    return NextResponse.json(toStudyMaterialDto(result.material, true));
  } catch (error) {
    console.error('Error fetching study material:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o material.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: MaterialRouteContext) {
  try {
    const result = await getAuthorizedMaterial(request, context);
    if ('error' in result) return result.error;
    if (result.material.extractionStatus !== 'ready') {
      return NextResponse.json({ error: 'O material ainda não está pronto.' }, { status: 409 });
    }

    const body = await request.json().catch(() => null) as { completed?: boolean } | null;
    if (body?.completed !== true) {
      return NextResponse.json({ error: 'Informe completed=true.' }, { status: 400 });
    }

    const material = await completeStudyMaterial(result.material.id);
    return NextResponse.json(toStudyMaterialDto(material, true));
  } catch (error) {
    console.error('Error completing study material:', error);
    return NextResponse.json({ error: 'Não foi possível concluir a atividade.' }, { status: 500 });
  }
}
