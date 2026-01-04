'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UndergroundPanel, { CustomRecipe, PendingRecipe } from '@/components/UndergroundPanel';
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

  // Convert Firestore pending recipes to PendingRecipe format for UndergroundPanel
  const pendingRecipesForPanel: PendingRecipe[] = pendingRecipes.map(r => ({
    id: r.id || '',
    ingredients: r.ingredients,
    result: r.result,
    createdAt: r.createdAt?.toDate() || new Date(),
    locale: r.locale || 'en'
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
        pendingRecipes={pendingRecipesForPanel}
        onApprovePending={handleApprovePending}
        onRejectPending={handleRejectPending}
        onClearAllPending={handleClearAllPending}
      />
    </div>
  );
}
