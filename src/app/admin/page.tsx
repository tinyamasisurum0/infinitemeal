'use client';

import React, { useState, useEffect, useCallback } from 'react';
import UndergroundPanel, { CustomRecipe, STORAGE_KEY_CUSTOM_RECIPES } from '@/components/UndergroundPanel';
import AdminLoginModal from '@/components/AdminLoginModal';
import { initialIngredients } from '@/data/ingredients';
import { Ingredient } from '@/types/RecipeTypes';

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

const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  // Custom recipes state
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);

  // Load data on mount
  useEffect(() => {
    setCustomRecipes(loadFromStorage<CustomRecipe[]>(STORAGE_KEY_CUSTOM_RECIPES, []));
    setIngredients(loadFromStorage<Ingredient[]>(STORAGE_KEY_INGREDIENTS, initialIngredients));
  }, []);

  // Persist custom recipes
  useEffect(() => {
    if (customRecipes.length > 0 || localStorage.getItem(STORAGE_KEY_CUSTOM_RECIPES)) {
      saveToStorage(STORAGE_KEY_CUSTOM_RECIPES, customRecipes);
    }
  }, [customRecipes]);

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

  // Custom recipe handlers
  const handleAddRecipe = useCallback((recipe: CustomRecipe) => {
    setCustomRecipes(prev => [...prev, recipe]);
  }, []);

  const handleDeleteRecipe = useCallback((id: string) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleImportRecipes = useCallback((recipes: CustomRecipe[]) => {
    setCustomRecipes(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const newRecipes = recipes.filter(r => !existingIds.has(r.id));
      return [...prev, ...newRecipes];
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setCustomRecipes([]);
  }, []);

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
        customRecipes={customRecipes}
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
