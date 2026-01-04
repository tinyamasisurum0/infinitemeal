'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UndergroundPanel, { CustomRecipe } from '@/components/UndergroundPanel';
import AdminLoginModal from '@/components/AdminLoginModal';
import { initialIngredients } from '@/data/ingredients';
import { Ingredient } from '@/types/RecipeTypes';
import {
  FirestoreCustomRecipe,
  FirestorePendingRecipe,
  subscribeToCustomRecipes,
  subscribeToPendingRecipes,
  addCustomRecipe,
  deleteCustomRecipe,
  deletePendingRecipe,
  approvePendingRecipe,
} from '@/services/recipeFirestore';

const ADMIN_SESSION_KEY = 'admin_session_token';
const STORAGE_KEY_INGREDIENTS = 'global_game_ingredients';

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
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Firestore state
  const [customRecipes, setCustomRecipes] = useState<FirestoreCustomRecipe[]>([]);
  const [pendingRecipes, setPendingRecipes] = useState<FirestorePendingRecipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);

  // Subscribe to Firestore on mount
  useEffect(() => {
    setIngredients(loadFromStorage<Ingredient[]>(STORAGE_KEY_INGREDIENTS, initialIngredients));

    // Subscribe to realtime updates
    const unsubCustom = subscribeToCustomRecipes((recipes) => {
      setCustomRecipes(recipes);
    });

    const unsubPending = subscribeToPendingRecipes((recipes) => {
      setPendingRecipes(recipes);
    });

    return () => {
      unsubCustom();
      unsubPending();
    };
  }, []);

  // Verify session on mount
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem(ADMIN_SESSION_KEY);
      if (!savedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/login', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });

        if (res.ok) {
          setAdminToken(savedToken);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        }
      } catch (err) {
        console.error('Session verification failed:', err);
      }
      setIsLoading(false);
    };

    verifySession();
  }, []);

  // Handle login
  const handleLogin = useCallback((token: string) => {
    setAdminToken(token);
    localStorage.setItem(ADMIN_SESSION_KEY, token);
    setIsAuthenticated(true);
  }, []);

  // Handle logout
  const handleLogout = useCallback(async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/login', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        });
      } catch (err) {
        console.error('Logout error:', err);
      }
    }
    setAdminToken(null);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
  }, [adminToken]);

  // Custom recipe handlers (Firestore)
  const handleAddRecipe = useCallback(async (recipe: CustomRecipe) => {
    await addCustomRecipe({
      ingredients: recipe.ingredients,
      result: recipe.result
    });
  }, []);

  const handleDeleteRecipe = useCallback(async (id: string) => {
    await deleteCustomRecipe(id);
  }, []);

  const handleImportRecipes = useCallback(async (recipes: CustomRecipe[]) => {
    for (const recipe of recipes) {
      await addCustomRecipe({
        ingredients: recipe.ingredients,
        result: recipe.result
      });
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    for (const recipe of customRecipes) {
      if (recipe.id) {
        await deleteCustomRecipe(recipe.id);
      }
    }
  }, [customRecipes]);

  // Pending recipe handlers (Firestore)
  const handleApprovePending = useCallback(async (pending: FirestorePendingRecipe) => {
    await approvePendingRecipe(pending);
  }, []);

  const handleRejectPending = useCallback(async (pendingId: string) => {
    await deletePendingRecipe(pendingId);
  }, []);

  const handleClearAllPending = useCallback(async () => {
    for (const pending of pendingRecipes) {
      if (pending.id) {
        await deletePendingRecipe(pending.id);
      }
    }
  }, [pendingRecipes]);

  // Convert Firestore recipes to CustomRecipe format for UndergroundPanel
  const customRecipesForPanel: CustomRecipe[] = customRecipes.map(r => ({
    id: r.id || '',
    ingredients: r.ingredients,
    result: r.result,
    createdAt: r.createdAt?.toMillis() || Date.now()
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f0a] flex items-center justify-center">
        <div className="text-emerald-500 font-mono text-lg animate-pulse">
          Verifying access...
        </div>
      </div>
    );
  }

  // Not authenticated - show login
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

  // Authenticated - show panel
  return (
    <div className="min-h-screen bg-[#0a0f0a]">
      {/* Pending AI Recipes Section */}
      {pendingRecipes.length > 0 && (
        <div className="border-b border-emerald-900/50 bg-[#0a0f0a] p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-emerald-400 font-mono text-lg flex items-center gap-2">
                <span>🤖</span>
                <span>Bekleyen AI Tarifleri</span>
                <span className="bg-amber-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingRecipes.length}
                </span>
              </h2>
              <button
                onClick={handleClearAllPending}
                className="text-red-400 hover:text-red-300 text-sm font-mono"
              >
                Tümünü Sil
              </button>
            </div>

            <div className="space-y-2">
              {pendingRecipes.map((pending) => (
                <div
                  key={pending.id}
                  className="bg-slate-900/50 border border-emerald-900/30 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{pending.result.emoji}</span>
                    <div>
                      <p className="text-white font-medium">{pending.result.name}</p>
                      <p className="text-slate-500 text-sm">
                        {pending.ingredients.map(id => {
                          const ing = ingredients.find(i => i.id === id);
                          return ing ? ing.name : id;
                        }).join(' + ')} → {pending.result.category}
                      </p>
                      <p className="text-slate-600 text-xs">
                        {pending.createdAt?.toDate().toLocaleString('tr-TR')} • {pending.locale?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => pending.id && handleRejectPending(pending.id)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Reddet"
                    >
                      ✕
                    </button>
                    <button
                      onClick={() => handleApprovePending(pending)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
                    >
                      ✓ Onayla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <UndergroundPanel
        isOpen={true}
        onClose={() => window.location.href = '/'}
        customRecipes={customRecipesForPanel}
        onAddRecipe={handleAddRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        onImportRecipes={handleImportRecipes}
        onClearAll={handleClearAll}
        availableIngredients={ingredients}
        onLogout={handleLogout}
      />
    </div>
  );
}
