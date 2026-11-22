import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/db';
import { clearSessionCookie, getSessionToken } from '@/lib/lumi-session';

export const runtime = 'nodejs';

/** Sign out: delete the server session and clear the cookie. Idempotent. */
export async function POST(request: NextRequest) {
  try {
    await deleteSession(getSessionToken(request));
  } catch (error) {
    console.error('Error deleting session:', error);
  }
  return clearSessionCookie(NextResponse.json({ success: true }));
}
