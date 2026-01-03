import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Generate a simple session token
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// In-memory session store (resets on server restart)
// For production, use Redis or database
const activeSessions = new Map<string, { expiresAt: number }>();

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Get credentials from environment variables
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if credentials are configured
    if (!adminUsername || !adminPassword) {
      console.error('[Admin Login] ADMIN_USERNAME or ADMIN_PASSWORD not configured');
      return NextResponse.json(
        { error: 'Admin access not configured' },
        { status: 503 }
      );
    }

    // Validate credentials
    if (username === adminUsername && password === adminPassword) {
      // Generate session token
      const token = generateToken();
      const expiresAt = Date.now() + SESSION_DURATION;

      // Store session
      activeSessions.set(token, { expiresAt });

      // Clean up expired sessions periodically
      for (const [key, session] of activeSessions.entries()) {
        if (session.expiresAt < Date.now()) {
          activeSessions.delete(key);
        }
      }

      return NextResponse.json({
        success: true,
        token,
        expiresAt
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('[Admin Login] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Verify token endpoint
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const session = activeSessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    activeSessions.delete(token || '');
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({ valid: true });
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    activeSessions.delete(token);
  }

  return NextResponse.json({ success: true });
}
