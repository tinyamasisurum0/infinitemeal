import 'server-only';
import type { NextRequest } from 'next/server';
import { getAdminDb } from './firebaseAdmin';

/**
 * Fixed-window rate limiter with two layers:
 *  1. In-memory (per serverless instance): free and instant, catches bursts.
 *  2. Firestore (shared by all instances): the real limit on Vercel, used
 *     when FIREBASE_SERVICE_ACCOUNT is configured. Docs live in the
 *     `rate_limits` collection with an `expiresAt` field, so a Firestore TTL
 *     policy on that field cleans them up automatically.
 *
 * If Firestore is unavailable we fail open on layer 2 (layer 1 still applies),
 * so a Firestore outage never takes the game down.
 */
export interface LimitRule {
  /** Bucket name, e.g. "ai-ip". */
  name: string;
  /** Max requests per window. */
  limit: number;
  /** Window length in seconds. */
  windowSec: number;
}

export interface LimitResult {
  ok: boolean;
  retryAfterSec: number;
}

const memory = new Map<string, number>();
let lastSweep = 0;

function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const key of memory.keys()) {
    const end = Number(key.split('|').pop());
    if (end < now) memory.delete(key);
  }
}

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

async function hit(rule: LimitRule, id: string): Promise<LimitResult> {
  const now = Date.now();
  const windowMs = rule.windowSec * 1000;
  const windowEnd = (Math.floor(now / windowMs) + 1) * windowMs;
  const retryAfterSec = Math.max(1, Math.ceil((windowEnd - now) / 1000));
  const memKey = `${rule.name}|${id}|${windowEnd}`;

  sweep(now);
  const local = (memory.get(memKey) ?? 0) + 1;
  memory.set(memKey, local);
  if (local > rule.limit) return { ok: false, retryAfterSec };

  const db = getAdminDb();
  if (!db) return { ok: true, retryAfterSec };

  // Doc ids can't contain "/"; IPv6 colons are fine.
  const docId = `${rule.name}_${id.replace(/\//g, '_')}_${windowEnd}`;
  const ref = db.collection('rate_limits').doc(docId);
  try {
    const count = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const next = ((snap.exists ? (snap.get('count') as number) : 0) || 0) + 1;
      if (next <= rule.limit + 1) {
        tx.set(ref, { count: next, expiresAt: new Date(windowEnd + 60_000) });
      }
      return next;
    });
    return { ok: count <= rule.limit, retryAfterSec };
  } catch (err) {
    console.error('[rateLimit] Firestore check failed, allowing request:', err);
    return { ok: true, retryAfterSec };
  }
}

/** Checks every rule in order; stops at the first one that is exceeded. */
export async function checkLimits(
  checks: Array<{ rule: LimitRule; id: string }>
): Promise<LimitResult> {
  for (const { rule, id } of checks) {
    const res = await hit(rule, id);
    if (!res.ok) return res;
  }
  return { ok: true, retryAfterSec: 0 };
}

function envInt(name: string, fallback: number): number {
  const v = Number(process.env[name]);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}

export const RULES = {
  aiPerMinute: (): LimitRule => ({ name: 'ai-ip-min', limit: envInt('AI_RATE_PER_MINUTE', 10), windowSec: 60 }),
  aiPerDay: (): LimitRule => ({ name: 'ai-ip-day', limit: envInt('AI_RATE_PER_DAY', 200), windowSec: 86_400 }),
  aiGlobalDay: (): LimitRule => ({ name: 'ai-global-day', limit: envInt('AI_GLOBAL_PER_DAY', 5000), windowSec: 86_400 }),
  pendingPerHour: (): LimitRule => ({ name: 'pending-ip-hour', limit: 60, windowSec: 3600 }),
  loginPer15Min: (): LimitRule => ({ name: 'login-ip', limit: 5, windowSec: 900 }),
};
