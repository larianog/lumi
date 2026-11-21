import { NextRequest, NextResponse } from 'next/server';
import { verifyAdultAccess } from '@/lib/db';
import { getSessionToken } from '@/lib/lumi-session';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { password?: string };
    if (!body.password) {
      return NextResponse.json({ error: 'A senha é obrigatória.' }, { status: 400 });
    }

    const verified = await verifyAdultAccess(getSessionToken(request), body.password);
    if (!verified) {
      return NextResponse.json({ error: 'Senha incorreta.' }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying adult access:', error);
    return NextResponse.json({ error: 'Não foi possível verificar a senha.' }, { status: 500 });
  }
}
