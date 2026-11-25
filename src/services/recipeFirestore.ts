import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Browser-side Firestore access is read-only: custom recipes are public.
// All writes go through API routes (see src/app/api/*), and the admin panel
// uses src/services/adminApi.ts.

// Types
export interface FirestoreCustomRecipe {
  id?: string;
  ingredients: string[];
  result: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    category: string;
    difficulty: number;
  };
  createdAt: Timestamp;
}

export interface FirestorePendingRecipe {
  id?: string;
  ingredients: string[];
  result: {
    id: string;
    name: string;
    emoji: string;
    category: string;
    difficulty: number;
    description?: string;
  };
  createdAt: Timestamp;
  locale: string;
}

const customRecipesRef = collection(db, 'custom_recipes');

// ============ CUSTOM RECIPES (public read) ============

export async function getCustomRecipes(): Promise<FirestoreCustomRecipe[]> {
  const q = query(customRecipesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestoreCustomRecipe));
}

export function subscribeToCustomRecipes(
  callback: (recipes: FirestoreCustomRecipe[]) => void
): () => void {
  const q = query(customRecipesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreCustomRecipe));
    callback(recipes);
  }, (error) => {
    console.error('[Firestore] Custom recipes subscription error:', error);
  });
}

// ============ PENDING RECIPES (submit via API) ============

export async function addPendingRecipe(
  recipe: Omit<FirestorePendingRecipe, 'id' | 'createdAt'>
): Promise<string> {
  const res = await fetch('/api/pending-recipes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recipe),
  });
  if (!res.ok) throw new Error(`Pending recipe rejected (${res.status})`);
  const data = await res.json();
  return data.id as string;
}
