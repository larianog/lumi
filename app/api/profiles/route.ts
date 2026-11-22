import { NextRequest, NextResponse } from 'next/server';
import { addProfileToFamily, createFamily, createSession, getFamilyForSession } from '@/lib/db';
import { getSessionToken, setSessionCookie } from '@/lib/lumi-session';
import type { Profile, ProfileType } from '@/types/database';

export const runtime = 'nodejs';

type ProfileRequest = {
  type?: ProfileType;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
  birthDate?: string;
};

function buildProfile(body: ProfileRequest, avatar: number): Profile {
  return {
    id: crypto.randomUUID(),
    type: body.type === 'child' ? 'child' : 'adult',
    firstName: body.firstName?.trim() ?? '',
    lastName: body.lastName?.trim() ?? '',
    birthDate: body.birthDate ?? '',
    avatar,
    createdAt: new Date().toISOString(),
  };
}

function isCompleteProfile(body: ProfileRequest) {
  return Boolean(body.firstName?.trim() && body.lastName?.trim() && body.birthDate);
}

export async function GET(request: NextRequest) {
  try {
    const result = await getFamilyForSession(getSessionToken(request));
    if (!result) return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 401 });

    const profileId = request.nextUrl.searchParams.get('profileId');
    if (profileId) {
      const profile = result.family.profiles.find((candidate) => candidate.id === profileId);
      if (!profile) return NextResponse.json({ error: 'Perfil não encontrado.' }, { status: 404 });
      return NextResponse.json({ profile, family: result.family, isDemo: result.session.isDemo });
    }

    return NextResponse.json({ family: result.family, isDemo: result.session.isDemo });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json({ error: 'Não foi possível carregar os perfis.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ProfileRequest;
    if (!isCompleteProfile(body)) {
      return NextResponse.json({ error: 'Preencha todos os campos obrigatórios.' }, { status: 400 });
    }

    const current = await getFamilyForSession(getSessionToken(request));
    if (current) {
      if (current.session.isDemo) {
        return NextResponse.json({ error: 'A família da demo não pode ser alterada.' }, { status: 403 });
      }

      const profile = buildProfile(body, current.family.profiles.length);
      profile.type = 'child';
      const family = await addProfileToFamily(current.family.id, profile);
      return NextResponse.json({ family, newProfile: profile, isDemo: false }, { status: 201 });
    }

    if (!body.phone?.trim() || !body.password || body.password.length < 6) {
      return NextResponse.json({ error: 'Informe telefone e uma senha de pelo menos 6 caracteres.' }, { status: 400 });
    }

    const profile = buildProfile(body, 0);
    const family = await createFamily(body.phone, body.password, profile);
    const sessionToken = await createSession(family.id);
    const response = NextResponse.json({ family, newProfile: profile, isDemo: false }, { status: 201 });
    return setSessionCookie(response, sessionToken);
  } catch (error) {
    if (error instanceof Error && error.message === 'PHONE_ALREADY_EXISTS') {
      return NextResponse.json({ error: 'Já existe uma família com esse telefone.' }, { status: 409 });
    }
    console.error('Error creating profile:', error);
    return NextResponse.json({ error: 'Não foi possível criar o perfil.' }, { status: 500 });
  }
}
