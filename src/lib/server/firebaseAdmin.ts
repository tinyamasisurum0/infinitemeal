import 'server-only';
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

/**
 * Server-side Firestore (Admin SDK). Bypasses security rules, so it must only
 * be used from API routes after the caller has been authorised.
 *
 * Credentials come from FIREBASE_SERVICE_ACCOUNT: the service-account JSON,
 * either raw or base64-encoded.
 */
let cached: Firestore | null | undefined;

function loadServiceAccount(): Record<string, string> | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  try {
    const json = raw.trim().startsWith('{')
      ? raw
      : Buffer.from(raw, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    console.error('[firebaseAdmin] FIREBASE_SERVICE_ACCOUNT is not valid JSON/base64 JSON');
    return null;
  }
}

export function getAdminDb(): Firestore | null {
  if (cached !== undefined) return cached;
  const sa = loadServiceAccount();
  if (!sa) {
    cached = null;
    return cached;
  }
  const app: App =
    getApps()[0] ??
    initializeApp({
      credential: cert({
        projectId: sa.project_id,
        clientEmail: sa.client_email,
        privateKey: sa.private_key,
      }),
    });
  cached = getFirestore(app);
  return cached;
}

export function requireAdminDb(): Firestore {
  const db = getAdminDb();
  if (!db) throw new Error('FIREBASE_SERVICE_ACCOUNT is not configured');
  return db;
}
