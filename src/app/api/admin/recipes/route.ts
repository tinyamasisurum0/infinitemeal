import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { isAdminRequest } from '@/lib/server/adminSession';
import { getAdminDb } from '@/lib/server/firebaseAdmin';
import { parseRecipe } from '@/lib/server/recipeValidation';

/**
 * Admin-only recipe management. All Firestore writes for the admin panel go
 * through here (Admin SDK) so the Firestore rules can deny browser writes.
 */
const CUSTOM = 'custom_recipes';
const PENDING = 'pending_recipes';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

function millis(v: unknown): number {
  return v instanceof Timestamp ? v.toMillis() : Date.now();
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: 'Server Firestore not configured' }, { status: 503 });

  const [custom, pending] = await Promise.all([
    db.collection(CUSTOM).orderBy('createdAt', 'desc').get(),
    db.collection(PENDING).orderBy('createdAt', 'desc').limit(500).get(),
  ]);

  return NextResponse.json({
    customRecipes: custom.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: millis(d.get('createdAt')) })),
    pendingRecipes: pending.docs.map((d) => ({ ...d.data(), id: d.id, createdAt: millis(d.get('createdAt')) })),
  });
}

type Action =
  | { action: 'add'; recipe: unknown }
  | { action: 'import'; recipes: unknown[] }
  | { action: 'delete'; id: string }
  | { action: 'clearAll' }
  | { action: 'approve'; id: string }
  | { action: 'reject'; id: string }
  | { action: 'clearPending' };

async function deleteAll(db: FirebaseFirestore.Firestore, collection: string) {
  const snap = await db.collection(collection).get();
  for (let i = 0; i < snap.docs.length; i += 400) {
    const batch = db.batch();
    snap.docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return snap.size;
}

function validId(id: unknown): id is string {
  return typeof id === 'string' && /^[A-Za-z0-9_-]{1,64}$/.test(id);
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) return unauthorized();
  const db = getAdminDb();
  if (!db) return NextResponse.json({ error: 'Server Firestore not configured' }, { status: 503 });

  let body: Action;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const bad = (msg = 'Invalid request') => NextResponse.json({ error: msg }, { status: 400 });

  try {
    switch (body.action) {
      case 'add': {
        const recipe = parseRecipe(body.recipe);
        if (!recipe) return bad('Invalid recipe');
        const ref = await db.collection(CUSTOM).add({ ...recipe, createdAt: FieldValue.serverTimestamp() });
        return NextResponse.json({ id: ref.id });
      }
      case 'import': {
        if (!Array.isArray(body.recipes) || body.recipes.length > 1000) return bad();
        const parsed = body.recipes.map(parseRecipe);
        if (parsed.some((r) => !r)) return bad('One or more recipes are invalid');
        for (let i = 0; i < parsed.length; i += 400) {
          const batch = db.batch();
          parsed.slice(i, i + 400).forEach((r) =>
            batch.set(db.collection(CUSTOM).doc(), { ...r, createdAt: FieldValue.serverTimestamp() })
          );
          await batch.commit();
        }
        return NextResponse.json({ imported: parsed.length });
      }
      case 'delete': {
        if (!validId(body.id)) return bad();
        await db.collection(CUSTOM).doc(body.id).delete();
        return NextResponse.json({ success: true });
      }
      case 'clearAll':
        return NextResponse.json({ deleted: await deleteAll(db, CUSTOM) });
      case 'approve': {
        if (!validId(body.id)) return bad();
        const pendingRef = db.collection(PENDING).doc(body.id);
        const newId = await db.runTransaction(async (tx) => {
          const snap = await tx.get(pendingRef);
          if (!snap.exists) return null;
          const data = snap.data() as { ingredients: string[]; result: Record<string, unknown> };
          const newRef = db.collection(CUSTOM).doc();
          tx.set(newRef, {
            ingredients: data.ingredients,
            result: {
              ...data.result,
              description: data.result.description || data.ingredients.join(' + '),
            },
            createdAt: FieldValue.serverTimestamp(),
          });
          tx.delete(pendingRef);
          return newRef.id;
        });
        if (!newId) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json({ id: newId });
      }
      case 'reject': {
        if (!validId(body.id)) return bad();
        await db.collection(PENDING).doc(body.id).delete();
        return NextResponse.json({ success: true });
      }
      case 'clearPending':
        return NextResponse.json({ deleted: await deleteAll(db, PENDING) });
      default:
        return bad('Unknown action');
    }
  } catch (err) {
    console.error('[Admin recipes] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
