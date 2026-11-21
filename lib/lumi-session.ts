import type { NextRequest, NextResponse } from 'next/server';

export const LUMI_SESSION_COOKIE = 'lumi_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSessionToken(request: NextRequest) {
  return request.cookies.get(LUMI_SESSION_COOKIE)?.value;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set(LUMI_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
    priority: 'high',
  });
  return response;
}
