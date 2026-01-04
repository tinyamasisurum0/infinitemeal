import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// Collection references
const customRecipesRef = collection(db, 'custom_recipes');
const pendingRecipesRef = collection(db, 'pending_recipes');

// ============ CUSTOM RECIPES ============

// Get all custom recipes
export async function getCustomRecipes(): Promise<FirestoreCustomRecipe[]> {
  const q = query(customRecipesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestoreCustomRecipe));
}

// Subscribe to custom recipes (realtime)
export function subscribeToCustomRecipes(
  callback: (recipes: FirestoreCustomRecipe[]) => void
): () => void {
  const q = query(customRecipesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestoreCustomRecipe));
    console.log('[Firestore] Custom recipes:', recipes.length);
    callback(recipes);
  }, (error) => {
    console.error('[Firestore] Custom recipes subscription error:', error);
  });
}

// Add custom recipe
export async function addCustomRecipe(
  recipe: Omit<FirestoreCustomRecipe, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(customRecipesRef, {
    ...recipe,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

// Delete custom recipe
export async function deleteCustomRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, 'custom_recipes', id));
}

// ============ PENDING RECIPES ============

// Get all pending recipes
export async function getPendingRecipes(): Promise<FirestorePendingRecipe[]> {
  const q = query(pendingRecipesRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as FirestorePendingRecipe));
}

// Subscribe to pending recipes (realtime)
export function subscribeToPendingRecipes(
  callback: (recipes: FirestorePendingRecipe[]) => void
): () => void {
  const q = query(pendingRecipesRef, orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirestorePendingRecipe));
    console.log('[Firestore] Pending recipes:', recipes.length);
    callback(recipes);
  }, (error) => {
    console.error('[Firestore] Pending recipes subscription error:', error);
  });
}

// Add pending recipe
export async function addPendingRecipe(
  recipe: Omit<FirestorePendingRecipe, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(pendingRecipesRef, {
    ...recipe,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

// Delete pending recipe
export async function deletePendingRecipe(id: string): Promise<void> {
  await deleteDoc(doc(db, 'pending_recipes', id));
}

// Approve pending recipe (move to custom)
export async function approvePendingRecipe(
  pending: FirestorePendingRecipe
): Promise<string> {
  // Add to custom recipes
  const customRecipeId = await addCustomRecipe({
    ingredients: pending.ingredients,
    result: {
      ...pending.result,
      description: pending.result.description || `${pending.ingredients.join(' + ')}`
    }
  });

  // Delete from pending
  if (pending.id) {
    await deletePendingRecipe(pending.id);
  }

  return customRecipeId;
}
