import { NextRequest, NextResponse } from 'next/server';
import {
  getCompletionsByFamily,
  getCompletionsByProfile,
  getFamilyForSession,
  recordCompletion,
} from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';

export const runtime = 'nodejs';

type CompletionRequest = {
  profileId?: string;
  activityId?: string;
  activityTitle?: string;
};

export async function GET(request: NextRequest) {
  try {
    const token = getSessionToken(request);
    const result = await getFamilyForSession(token);
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const profileId = request.nextUrl.searchParams.get('profileId');
    const familyScope = request.nextUrl.searchParams.get('scope') === 'family';

    if (profileId) {
      const ownsProfile = result.family.profiles.some((profile) => profile.id === profileId);
      if (!ownsProfile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
      return NextResponse.json(await getCompletionsByProfile(result.family.id, profileId));
    }

    if (familyScope) {
      return NextResponse.json(await getCompletionsByFamily(result.family.id));
    }

    return NextResponse.json({ error: 'Informe profileId ou scope=family.' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return NextResponse.json({ error: 'Não foi possível carregar o progresso.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CompletionRequest;
    if (!body.profileId || !body.activityId || !body.activityTitle) {
      return NextResponse.json({ error: 'Dados da atividade incompletos.' }, { status: 400 });
    }

    const result = await getFamilyForSession(getSessionToken(request));
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });
    const ownsProfile = result.family.profiles.some((profile) => profile.id === body.profileId);
    if (!ownsProfile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });

    const completion = await recordCompletion(
      result.family.id,
      body.profileId,
      body.activityId,
      body.activityTitle,
    );
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    console.error('Error recording completion:', error);
    return NextResponse.json({ error: 'Não foi possível salvar a atividade.' }, { status: 500 });
  }
}
