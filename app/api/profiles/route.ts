import { NextRequest, NextResponse } from 'next/server';
import { addProfilesToFamily, createFamily, createSession, getFamilyForSession } from '@/lib/db';
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
  /** Signup step 2: several children at once (requires a family session). */
  children?: ProfileRequest[];
};

const MAX_CHILDREN_PER_REQUEST = 8;

function buildProfile(body: ProfileRequest, avatar: number, type: ProfileType): Profile {
  return {
    id: crypto.randomUUID(),
    type,
    firstName: body.firstName?.trim() ?? '',
    lastName: body.lastName?.trim() ?? '',
    birthDate: type === 'child' ? body.birthDate ?? '' : '',
    avatar,
    createdAt: new Date().toISOString(),
  };
}

function hasName(body: ProfileRequest) {
  return Boolean(body.firstName?.trim() && body.lastName?.trim());
}

/** Children need a real, past birth date (it drives age-adapted tutoring). */
function childError(child: ProfileRequest) {
  if (!hasName(child)) return 'Preencha nome e sobrenome de cada criança.';
  const birth = child.birthDate ? Date.parse(`${child.birthDate}T12:00:00`) : Number.NaN;
  if (Number.isNaN(birth)) return 'Informe a data de nascimento de cada criança.';
  if (birth > Date.now()) return 'A data de nascimento não pode ser no futuro.';
  if (Date.now() - birth > 18 * 365.25 * 24 * 60 * 60 * 1000) return 'O perfil infantil é para menores de 18 anos.';
  return null;
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
    const current = await getFamilyForSession(getSessionToken(request));

    // Signup step 2 / "add child": a signed-in family adds one or more children.
    if (current) {
      if (current.session.isDemo) {
        return NextResponse.json({ error: 'A família da demo não pode ser alterada.' }, { status: 403 });
      }
      const children = Array.isArray(body.children) ? body.children : [body];
      if (children.length === 0 || children.length > MAX_CHILDREN_PER_REQUEST) {
        return NextResponse.json({ error: `Cadastre de 1 a ${MAX_CHILDREN_PER_REQUEST} crianças por vez.` }, { status: 400 });
      }
      const problem = children.map(childError).find(Boolean);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });

      const profiles = children.map((child, index) =>
        buildProfile(child, current.family.profiles.length + index, 'child'));
      const family = await addProfilesToFamily(current.family.id, profiles);
      return NextResponse.json({ family, newProfiles: profiles, isDemo: false }, { status: 201 });
    }

    // Signup step 1: the parent creates the family account (adult profile).
    if (!hasName(body)) {
      return NextResponse.json({ error: 'Preencha seu nome e sobrenome.' }, { status: 400 });
    }
    if (!body.phone?.trim() || !body.password || body.password.length < 6) {
      return NextResponse.json({ error: 'Informe telefone e uma senha de pelo menos 6 caracteres.' }, { status: 400 });
    }

    const profile = buildProfile(body, 0, 'adult');
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
