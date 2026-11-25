'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UndergroundPanel, { CustomRecipe, PendingRecipe } from '@/components/UndergroundPanel';
import AdminLoginModal from '@/components/AdminLoginModal';
import { initialIngredients } from '@/data/ingredients';
import { Ingredient } from '@/types/RecipeTypes';
import { AdminAuthError, adminActions, fetchAdminRecipes } from '@/services/adminApi';

const STORAGE_KEY_INGREDIENTS = 'global_game_ingredients';
const REFRESH_MS = 30_000;

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item) return JSON.parse(item);
  } catch (e) {
    console.error('Error loading from storage:', e);
  }
  return defaultValue;
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<PendingRecipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchAdminRecipes();
      setCustomRecipes(data.customRecipes);
      setPendingRecipes(data.pendingRecipes);
      setError(null);
    } catch (err) {
      if (err instanceof AdminAuthError) {
        setIsAuthenticated(false);
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load recipes');
      }
    }
  }, []);

  // Verify the session cookie on mount (also drop the old localStorage token).
  useEffect(() => {
    setIngredients(loadFromStorage<Ingredient[]>(STORAGE_KEY_INGREDIENTS, initialIngredients));
    localStorage.removeItem('admin_session_token');

    fetch('/api/admin/login', { method: 'GET', credentials: 'same-origin' })
      .then((res) => setIsAuthenticated(res.ok))
      .catch((err) => console.error('Session verification failed:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Load data while authenticated, and poll for new pending recipes.
  useEffect(() => {
    if (!isAuthenticated) return;
    refresh();
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, refresh]);

  // Runs an admin action, then reloads the lists.
  const run = useCallback(
    (fn: () => Promise<unknown>) => async () => {
      try {
        await fn();
      } catch (err) {
        if (err instanceof AdminAuthError) {
          setIsAuthenticated(false);
          return;
        }
        setError(err instanceof Error ? err.message : 'Action failed');
      }
      await refresh();
    },
    [refresh]
  );

  const handleLogin = useCallback(() => setIsAuthenticated(true), []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE', credentials: 'same-origin' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    setIsAuthenticated(false);
  }, []);

  const handleAddRecipe = useCallback(
    (recipe: CustomRecipe) => run(() => adminActions.add({ ingredients: recipe.ingredients, result: recipe.result }))(),
    [run]
  );
  const handleDeleteRecipe = useCallback((id: string) => run(() => adminActions.delete(id))(), [run]);
  const handleImportRecipes = useCallback(
    (recipes: CustomRecipe[]) =>
      run(() => adminActions.import(recipes.map((r) => ({ ingredients: r.ingredients, result: r.result }))))(),
    [run]
  );
  const handleClearAll = useCallback(() => run(() => adminActions.clearAll())(), [run]);
  const handleApprovePending = useCallback(
    (pending: PendingRecipe) => run(() => adminActions.approve(pending.id))(),
    [run]
  );
  const handleRejectPending = useCallback((id: string) => run(() => adminActions.reject(id))(), [run]);
  const handleClearAllPending = useCallback(() => run(() => adminActions.clearPending())(), [run]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-lg animate-pulse">
          Verifying access...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0f0a]">
        <AdminLoginModal
          isOpen={true}
          onClose={() => window.location.href = '/'}
          onSuccess={handleLogin}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {error && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[200] rounded bg-red-900/90 px-4 py-2 font-mono text-sm text-red-100">
          {error}
        </div>
      )}
      <UndergroundPanel
        isOpen={true}
        onClose={() => window.location.href = '/'}
        customRecipes={customRecipes}
        onAddRecipe={handleAddRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onImportRecipes={handleImportRecipes}
        onClearAll={handleClearAll}
        availableIngredients={ingredients}
        onLogout={handleLogout}
        pendingRecipes={pendingRecipes}
        onApprovePending={handleApprovePending}
        onRejectPending={handleRejectPending}
        onClearAllPending={handleClearAllPending}
      />
    </div>
  );
}
