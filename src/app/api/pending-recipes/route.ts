import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { checkLimits, clientIp, RULES } from '@/lib/server/rateLimit';
import { parseRecipe, validLocale } from '@/lib/server/recipeValidation';

/**
 * Public: the game submits AI-generated recipes here for admin review.
 * Validated and rate limited, then written with the Admin SDK, so the
 * browser never needs write access to Firestore.
 */
export async function POST(request: NextRequest) {
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: 'Not available' }, { status: 503 });

  const limit = await checkLimits([{ rule: RULES.pendingPerHour(), id: clientIp(request) }]);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const recipe = parseRecipe(body);
  if (!recipe) return NextResponse.json({ error: 'Invalid recipe' }, { status: 400 });

  const ref = await db.collection('pending_recipes').add({
    ...recipe,
    locale: validLocale(body.locale),
    createdAt: FieldValue.serverTimestamp(),
  });
  return NextResponse.json({ id: ref.id });
}
