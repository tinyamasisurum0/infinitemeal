import { NextRequest, NextResponse } from 'next/server';
import {
  clearSessionCookie,
  createSessionToken,
  isAdminRequest,
  safeEqual,
  setSessionCookie,
} from '@/lib/server/adminSession';
import { checkLimits, clientIp, RULES } from '@/lib/server/rateLimit';

// POST: log in. Sets a signed httpOnly cookie; nothing is kept in server memory.
export async function POST(request: NextRequest) {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminUsername || !adminPassword) {
    console.error('[Admin Login] ADMIN_USERNAME or ADMIN_PASSWORD not configured');
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 });
  }

  const limit = await checkLimits([{ rule: RULES.loginPer15Min(), id: clientIp(request) }]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  let username: unknown;
  let password: unknown;
  try {
    ({ username, password } = await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const userOk = typeof username === 'string' && safeEqual(username, adminUsername);
  const passOk = typeof password === 'string' && safeEqual(password, adminPassword);
  if (!userOk || !passOk) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const session = createSessionToken();
  if (!session) {
    return NextResponse.json({ error: 'Admin access not configured' }, { status: 503 });
  }
  const res = NextResponse.json({ success: true, expiresAt: session.expiresAt });
  setSessionCookie(res, session.token);
  return res;
}

// GET: is the current cookie a valid admin session?
export async function GET(request: NextRequest) {
  const valid = isAdminRequest(request);
  return NextResponse.json({ valid }, { status: valid ? 200 : 401 });
}

// DELETE: log out.
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
