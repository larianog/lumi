import { NextRequest, NextResponse } from 'next/server';
import { authenticateFamily, createSession, getDemoFamily } from '@/lib/db';
import { setSessionCookie } from '@/lib/lumi-session';

export const runtime = 'nodejs';

type LoginRequest = {
  phone?: string;
  password?: string;
  demo?: boolean;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequest;
    if (body.demo === true) {
      const family = getDemoFamily();
      const token = await createSession(family.id, true);
      const response = NextResponse.json({ family, isDemo: true });
      return setSessionCookie(response, token);
    }

    if (!body.phone?.trim() || !body.password) {
      return NextResponse.json({ error: 'Telefone e senha são obrigatórios.' }, { status: 400 });
    }

    const family = await authenticateFamily(body.phone, body.password);
    if (!family) {
      return NextResponse.json({ error: 'Telefone ou senha incorretos.' }, { status: 401 });
    }

    const token = await createSession(family.id);
    const response = NextResponse.json({ family, isDemo: false });
    return setSessionCookie(response, token);
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: 'Não foi possível entrar.' }, { status: 500 });
  }
}
