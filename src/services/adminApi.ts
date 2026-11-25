import type { CustomRecipe, PendingRecipe } from '@/components/UndergroundPanel';

// Client wrapper for the admin API. Auth rides on the httpOnly session cookie.

export interface AdminRecipeLists {
  customRecipes: CustomRecipe[];
  pendingRecipes: PendingRecipe[];
}

export class AdminAuthError extends Error {}

async function call<T>(method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const res = await fetch('/api/admin/recipes', {
    method,
    credentials: 'same-origin',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) throw new AdminAuthError('Session expired');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export async function fetchAdminRecipes(): Promise<AdminRecipeLists> {
  const data = await call<{
    customRecipes: CustomRecipe[];
    pendingRecipes: Array<Omit<PendingRecipe, 'createdAt'> & { createdAt: number }>;
  }>('GET');
  return {
    customRecipes: data.customRecipes,
    pendingRecipes: data.pendingRecipes.map((p) => ({
      ...p,
      locale: p.locale || 'en',
      createdAt: new Date(p.createdAt),
    })),
  };
}

type RecipeInput = Pick<CustomRecipe, 'ingredients' | 'result'>;

export const adminActions = {
  add: (recipe: RecipeInput) => call('POST', { action: 'add', recipe }),
  import: (recipes: RecipeInput[]) => call('POST', { action: 'import', recipes }),
  delete: (id: string) => call('POST', { action: 'delete', id }),
  clearAll: () => call('POST', { action: 'clearAll' }),
  approve: (id: string) => call('POST', { action: 'approve', id }),
  reject: (id: string) => call('POST', { action: 'reject', id }),
  clearPending: () => call('POST', { action: 'clearPending' }),
};
