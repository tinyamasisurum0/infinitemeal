import 'server-only';
import crypto from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';

/**
 * Stateless admin sessions: an HMAC-signed token in an httpOnly cookie.
 * Works across serverless instances because nothing is stored server-side.
 *
 * The signing key is ADMIN_SESSION_SECRET, falling back to ADMIN_PASSWORD.
 * Changing either one invalidates every existing session.
 */
export const ADMIN_COOKIE = 'im_admin';
export const SESSION_TTL_SECONDS = 12 * 60 * 60; // 12 hours

function secret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, key: string): string {
  return crypto.createHmac('sha256', key).update(payload).digest('base64url');
}

/** Constant-time string comparison (hashes first so lengths don't leak). */
export function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export function createSessionToken(): { token: string; expiresAt: number } | null {
  const key = secret();
  if (!key) return null;
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ sub: 'admin', exp: expiresAt })).toString('base64url');
  return { token: `${payload}.${sign(payload, key)}`, expiresAt };
}

export function verifySessionToken(token: string | undefined | null): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload, key))) return false;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return sub === 'admin' && typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

export function isAdminRequest(request: NextRequest): boolean {
  return verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value);
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
}
