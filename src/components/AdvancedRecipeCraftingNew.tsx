'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { flyEmoji } from '@/utils/flyEmoji';
import {
  Ingredient,
  CookingMethod,
  Achievement,
  AdvancedRecipeCraftingProps,
} from '../types/RecipeTypes';
import {
  initialIngredients,
} from '../data/ingredients';
import { cookingMethods } from '../data/cookingMethods';
import { recipes } from '../data/recipes';
import { initialAchievements } from '../data/achievements';
import {
  IngredientItem,
  MixingBowl,
  MethodSelector,
  SuccessModal,
  DiscoveryBook,
  type GameStatus
} from './game';
import { CustomRecipe } from './UndergroundPanel';
import { safeTranslate } from '@/utils/translations';
import { addPendingRecipe, subscribeToCustomRecipes, FirestoreCustomRecipe } from '@/services/recipeFirestore';

// Storage keys
const STORAGE_KEY_INGREDIENTS = 'global_game_ingredients';
const STORAGE_KEY_ACHIEVEMENTS = 'global_game_achievements';
export const STORAGE_KEY_PENDING_AI_RECIPES = 'pending_ai_recipes';

// Pending AI recipe type
export interface PendingAIRecipe {
  id: string;
  ingredients: string[]; // ingredient IDs used
  result: {
    id: string;
    name: string;
    emoji: string;
    category: string;
    difficulty: number;
  };
  createdAt: string;
  locale: string;
}

// Storage management functions
const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to storage:', e);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item);
    }
  } catch (e) {
    console.error('Error loading from storage:', e);
  }
  return defaultValue;
};

interface DiscoveryHistoryItem {
  ingredients: string[];
  method: string;
  result: Ingredient;
  isNewDiscovery: boolean;
}

const AdvancedRecipeCraftingNew: React.FC<AdvancedRecipeCraftingProps> = () => {
  const t = useTranslations();
  const locale = useLocale();

  // Core game state
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (typeof window === 'undefined') return initialIngredients;
    const saved = loadFromStorage<Ingredient[]>(STORAGE_KEY_INGREDIENTS, initialIngredients);
    return saved.map((item) => ({
      ...item,
      discovered: item.discovered ?? false,
      difficulty: item.difficulty ?? 1,
      category: item.category ?? 'BASIC'
    }));
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === 'undefined') return initialAchievements;
    return loadFromStorage<Achievement[]>(STORAGE_KEY_ACHIEVEMENTS, initialAchievements);
  });

  // UI state
  const [currentMixingIds, setCurrentMixingIds] = useState<string[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod>(cookingMethods[0]);
  const [status, setStatus] = useState<GameStatus>('idle');
  const [lastDiscovery, setLastDiscovery] = useState<{ ingredient: Ingredient; isNew: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [discoveryHistory, setDiscoveryHistory] = useState<DiscoveryHistoryItem[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [mobileTab, setMobileTab] = useState<'ingredients' | 'game' | 'discoveries'>('game');

  // Custom recipes from Firestore (managed via /admin page)
  const [firestoreRecipes, setFirestoreRecipes] = useState<FirestoreCustomRecipe[]>([]);

  // Subscribe to Firestore custom recipes
  useEffect(() => {
    const unsubscribe = subscribeToCustomRecipes((recipes) => {
      setFirestoreRecipes(recipes);
    });
    return () => unsubscribe();
  }, []);

  // Convert Firestore recipes to CustomRecipe format for matching
  const customRecipes: CustomRecipe[] = useMemo(() =>
    firestoreRecipes.map(r => ({
      id: r.id || '',
      ingredients: r.ingredients,
      result: r.result,
      createdAt: r.createdAt?.toMillis() || Date.now()
    })),
    [firestoreRecipes]
  );

  // Computed values
  const discoveredIngredients = useMemo(() =>
    ingredients.filter(i => i.discovered),
    [ingredients]
  );

  const mixingIngredients = useMemo(() =>
    currentMixingIds.map(id => discoveredIngredients.find(i => i.id === id)).filter(Boolean) as Ingredient[],
    [currentMixingIds, discoveredIngredients]
  );

  const filteredIngredients = useMemo(() =>
    discoveredIngredients.filter(ing =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [discoveredIngredients, searchTerm]
  );

  // Persist state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToStorage(STORAGE_KEY_INGREDIENTS, ingredients);
  }, [ingredients]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToStorage(STORAGE_KEY_ACHIEVEMENTS, achievements);
  }, [achievements]);

  // Check and unlock achievements based on discoveries
  useEffect(() => {
    // Count non-basic discovered ingredients (difficulty > 1)
    const discoveredCount = ingredients.filter(i => i.discovered && i.difficulty > 1).length;

    console.log('[Achievement] Discovered count:', discoveredCount);

    let updated = false;
    let newAchievements = [...achievements];

    // First Combo - create first new ingredient
    if (discoveredCount >= 1 && !achievements.find(a => a.id === 'first_combo')?.achieved) {
      console.log('[Achievement] Unlocking: First Combination');
      newAchievements = newAchievements.map(a =>
        a.id === 'first_combo' ? { ...a, achieved: true } : a
      );
      updated = true;
    }

    // Explorer - discover 5 ingredients
    if (discoveredCount >= 5 && !achievements.find(a => a.id === 'explorer')?.achieved) {
      console.log('[Achievement] Unlocking: Culinary Explorer');
      newAchievements = newAchievements.map(a =>
        a.id === 'explorer' ? { ...a, achieved: true } : a
      );
      updated = true;
    }

    // Novice Chef - discover 10 ingredients
    if (discoveredCount >= 10 && !achievements.find(a => a.id === 'novice_chef')?.achieved) {
      console.log('[Achievement] Unlocking: Novice Chef');
      newAchievements = newAchievements.map(a =>
        a.id === 'novice_chef' ? { ...a, achieved: true } : a
      );
      updated = true;
    }

    // Master Chef - create difficulty 4+ item
    const highestDifficulty = Math.max(...ingredients.filter(i => i.discovered).map(i => i.difficulty || 1));
    if (highestDifficulty >= 4 && !achievements.find(a => a.id === 'master_chef')?.achieved) {
      console.log('[Achievement] Unlocking: Master Chef');
      newAchievements = newAchievements.map(a =>
        a.id === 'master_chef' ? { ...a, achieved: true } : a
      );
      updated = true;
    }

    if (updated) {
      setAchievements(newAchievements);
    }
  }, [ingredients, achievements]);

  // Note: Custom recipes are now synced via Firestore realtime subscription

  // Handle ingredient drop
  const handleDrop = (ingredientId: string) => {
    if (status === 'mixing') return;
    if (currentMixingIds.length >= 3) return;
    if (currentMixingIds.includes(ingredientId)) return;

    const newMixingIds = [...currentMixingIds, ingredientId];
    setCurrentMixingIds(newMixingIds);
    setError(null);

    // Auto-mix when we have 2 ingredients
    if (newMixingIds.length === 2) {
      setTimeout(() => handleMix(newMixingIds), 500);
    }
  };

  // Click/tap on an ingredient: toss its emoji into the pot (or onto the Cook
  // tab on phones, where the pot is on another screen), then add it as usual.
  const potRef = useRef<HTMLDivElement>(null);
  const cookTabRef = useRef<HTMLButtonElement>(null);
  const handlePick = (ingredientId: string, e?: React.MouseEvent<HTMLElement>) => {
    const willAdd =
      status !== 'mixing' && currentMixingIds.length < 3 && !currentMixingIds.includes(ingredientId);
    if (willAdd && e) {
      const ing = discoveredIngredients.find(i => i.id === ingredientId);
      const pot = potRef.current;
      const target = pot && pot.getBoundingClientRect().width > 0 ? pot : cookTabRef.current;
      if (ing) flyEmoji(ing.emoji, e.currentTarget, target);
    }
    handleDrop(ingredientId);
  };

  // Handle mixing/cooking
  const handleMix = async (mixIds?: string[]) => {
    const idsToUse = mixIds || currentMixingIds;
    const itemsToMix = idsToUse.map(id => discoveredIngredients.find(i => i.id === id)).filter(Boolean) as Ingredient[];

    if (itemsToMix.length === 0) return;

    // For cooking methods (single ingredient transformation)
    if (selectedMethod.id !== 'mix' && itemsToMix.length === 1) {
      setStatus('mixing');

      const ingredient = itemsToMix[0];
      const transformation = selectedMethod.transformations[ingredient.id];

      if (transformation) {
        setTimeout(() => {
          // Find if result exists
          const existingResult = ingredients.find(i => i.id === transformation.id);
          const isNew = !existingResult?.discovered;

          const resultIngredient: Ingredient = existingResult || {
            id: transformation.id,
            name: transformation.name,
            emoji: transformation.emoji,
            category: transformation.category,
            discovered: true,
            difficulty: ingredient.difficulty + 1
          };

          if (isNew) {
            setIngredients(prev => {
              if (existingResult) {
                return prev.map(i => i.id === transformation.id ? { ...i, discovered: true } : i);
              }
              return [...prev, { ...resultIngredient, discovered: true }];
            });
          }

          setDiscoveryHistory(prev => [...prev, {
            ingredients: [safeTranslate(t, `ingredients.${ingredient.id}`, ingredient.name)],
            method: safeTranslate(t, `cookingMethods.${selectedMethod.id}`, selectedMethod.name),
            result: resultIngredient,
            isNewDiscovery: isNew
          }]);

          setLastDiscovery({ ingredient: resultIngredient, isNew });
          setStatus('success');
          setCurrentMixingIds([]);
        }, 800);
      } else {
        setTimeout(() => {
          setError(safeTranslate(t, 'game.noEffect', `${safeTranslate(t, `cookingMethods.${selectedMethod.id}`, selectedMethod.name)} has no effect on ${safeTranslate(t, `ingredients.${ingredient.id}`, ingredient.name)}`));
          setStatus('failure');
          setTimeout(() => {
            setStatus('idle');
            setError(null);
          }, 2000);
        }, 500);
      }
      return;
    }

    // For mixing (2+ ingredients)
    if (itemsToMix.length >= 2) {
      setStatus('mixing');

      const ids = idsToUse.sort();

      // Find matching recipe
      const matchedRecipe = recipes.find(recipe => {
        if (recipe.ingredients.length !== ids.length) return false;
        const recipeIds = [...recipe.ingredients].sort();
        return recipeIds.every((id, index) => id === ids[index]);
      });

      if (matchedRecipe) {
        setTimeout(() => {
          const existingResult = ingredients.find(i => i.id === matchedRecipe.result);
          const isNew = !existingResult?.discovered;

          const resultIngredient = existingResult || ingredients.find(i => i.id === matchedRecipe.result);

          if (resultIngredient) {
            if (isNew) {
              setIngredients(prev =>
                prev.map(i => i.id === matchedRecipe.result ? { ...i, discovered: true } : i)
              );
            }

            setDiscoveryHistory(prev => [...prev, {
              ingredients: itemsToMix.map(i => safeTranslate(t, `ingredients.${i.id}`, i.name)),
              method: safeTranslate(t, 'cookingMethods.mix', 'mix'),
              result: resultIngredient,
              isNewDiscovery: isNew
            }]);

            setLastDiscovery({ ingredient: resultIngredient, isNew });
            setStatus('success');
            setCurrentMixingIds([]);
          }
        }, 800);
        return;
      }

      // Check custom recipes (Underground Lab) BEFORE AI generation
      const matchedCustomRecipe = customRecipes.find(recipe => {
        if (recipe.ingredients.length !== ids.length) return false;
        const recipeIds = [...recipe.ingredients].sort();
        return recipeIds.every((id, index) => id === ids[index]);
      });

      if (matchedCustomRecipe) {
        setTimeout(() => {
          const customResult = matchedCustomRecipe.result;
          const existingResult = ingredients.find(i => i.id === customResult.id);
          const isNew = !existingResult?.discovered;

          const resultIngredient: Ingredient = existingResult || {
            id: customResult.id,
            name: customResult.name,
            emoji: customResult.emoji,
            category: customResult.category,
            discovered: true,
            difficulty: customResult.difficulty
          };

          // Add new ingredient to list or mark as discovered
          if (isNew) {
            setIngredients(prev => {
              const exists = prev.find(i => i.id === customResult.id);
              if (exists) {
                return prev.map(i => i.id === customResult.id ? { ...i, discovered: true } : i);
              }
              return [...prev, { ...resultIngredient, discovered: true }];
            });
          }

          setDiscoveryHistory(prev => [...prev, {
            ingredients: itemsToMix.map(i => safeTranslate(t, `ingredients.${i.id}`, i.name)),
            method: 'custom',
            result: resultIngredient,
            isNewDiscovery: isNew
          }]);

          setLastDiscovery({ ingredient: resultIngredient, isNew });
          setStatus('success');
          setCurrentMixingIds([]);
        }, 800);
        return;
      }

      // No hardcoded or custom recipe - try AI generation
      {
        try {
          const res = await fetch('/api/generate-recipe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ingredients: itemsToMix.map(i => ({ name: i.name, emoji: i.emoji })),
              cookingMethod: selectedMethod.id !== 'mix' ? selectedMethod.id : undefined,
              locale
            })
          });

          if (res.ok) {
            const aiResult = await res.json();

            if (aiResult.name) {
              // Create new AI-generated ingredient
              const aiId = `ai_${aiResult.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30)}`;

              const resultIngredient: Ingredient = {
                id: aiId,
                name: aiResult.name,
                emoji: aiResult.emoji,
                category: aiResult.category || 'Dish',
                discovered: true,
                difficulty: 3,
                description: aiResult.description
              };

              // Save to pending AI recipes in Firestore for admin review
              addPendingRecipe({
                ingredients: idsToUse,
                result: {
                  id: aiId,
                  name: aiResult.name,
                  emoji: aiResult.emoji,
                  category: aiResult.category || 'Dish',
                  difficulty: 3,
                  description: aiResult.description
                },
                locale
              }).catch(err => console.error('Failed to save pending recipe:', err));

              // Add to ingredients if not exists
              setIngredients(prev => {
                const exists = prev.find(i => i.id === aiId);
                if (exists) {
                  return prev.map(i => i.id === aiId ? { ...i, discovered: true } : i);
                }
                return [...prev, resultIngredient];
              });

              setDiscoveryHistory(prev => [...prev, {
                ingredients: itemsToMix.map(i => safeTranslate(t, `ingredients.${i.id}`, i.name)),
                method: 'AI',
                result: resultIngredient,
                isNewDiscovery: true
              }]);

              setLastDiscovery({ ingredient: resultIngredient, isNew: true });
              setStatus('success');
              setCurrentMixingIds([]);
              return;
            }
          }
        } catch (err) {
          console.error('AI generation failed:', err);
        }

        // AI also failed - show error
        setTimeout(() => {
          const names = itemsToMix.map(i => safeTranslate(t, `ingredients.${i.id}`, i.name)).join(' + ');
          setError(safeTranslate(t, 'game.noRecipe', `No recipe found for ${names}`));
          setStatus('failure');
          setTimeout(() => {
            setStatus('idle');
            setError(null);
          }, 2000);
        }, 500);
      }
    }
  };

  // Clear mixing bowl
  const handleClear = () => {
    setCurrentMixingIds([]);
    setStatus('idle');
    setError(null);
  };

  // Dismiss discovery modal
  const dismissDiscovery = () => {
    setLastDiscovery(null);
    setStatus('idle');
  };

  // Apply cooking method to single ingredient
  const handleApplyMethod = () => {
    if (mixingIngredients.length === 1 && selectedMethod.id !== 'mix') {
      handleMix();
    }
  };

  // Reset all progress
  const handleReset = () => {
    console.log('[Reset] Clearing all progress...');

    // Clear storage first
    localStorage.removeItem(STORAGE_KEY_INGREDIENTS);
    localStorage.removeItem(STORAGE_KEY_ACHIEVEMENTS);

    // Reset state
    setIngredients(initialIngredients);
    setAchievements(initialAchievements.map(a => ({ ...a, achieved: false })));
    setDiscoveryHistory([]);
    setCurrentMixingIds([]);
    setShowResetConfirm(false);

    console.log('[Reset] Complete');
  };

  const navTabs: { id: 'ingredients' | 'game' | 'discoveries'; emoji: string; label: string }[] = [
    { id: 'ingredients', emoji: '🧂', label: safeTranslate(t, 'cook.ingredients', 'Ingredients') },
    { id: 'game', emoji: '🍲', label: safeTranslate(t, 'cook.cook', 'Cook') },
    { id: 'discoveries', emoji: '📖', label: safeTranslate(t, 'game.almanac', 'Almanac') },
  ];

  const iconButton =
    'w-10 h-10 rounded-full bg-surface border border-line shadow-soft text-ink flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-transform';

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-canvas text-ink overflow-hidden">
      {/* Mobile Bottom Navigation */}
      <nav
        aria-label={safeTranslate(t, 'app.title', 'Infinite Meal')}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-md border-t border-line safe-area-inset-bottom"
      >
        <div className="flex justify-around items-center py-2">
          {navTabs.map((tab) => {
            const active = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={tab.id === 'game' ? cookTabRef : undefined}
                type="button"
                onClick={() => setMobileTab(tab.id)}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center py-1.5 px-4 rounded-2xl transition-colors min-w-[84px] ${
                  active ? 'text-cobalt bg-cobalt/10' : 'text-muted'
                }`}
              >
                <span aria-hidden="true" className="text-xl leading-none">{tab.emoji}</span>
                <span className="text-[11px] font-semibold mt-1 max-w-[96px] truncate">{tab.label}</span>
                {tab.id === 'game' && currentMixingIds.length > 0 && (
                  <span
                    key={currentMixingIds.length}
                    aria-label={`${currentMixingIds.length}`}
                    className="badge-pop absolute -top-0.5 right-3 min-w-5 h-5 px-1 rounded-full bg-pot text-on-pot text-[11px] font-bold flex items-center justify-center"
                  >
                    {currentMixingIds.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Left Sidebar - Ingredient Shelf (Desktop) / Full Screen (Mobile) */}
      <aside className={`
        ${mobileTab === 'ingredients' ? 'flex' : 'hidden'} lg:flex
        w-full lg:w-80 flex-col lg:border-r border-line bg-surface
        h-[calc(100vh-72px)] lg:h-screen
      `}>
        <div className="px-4 pt-4 pb-3 border-b border-line">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="font-display font-medium text-2xl leading-none">
              {safeTranslate(t, 'cook.ingredients', 'Ingredients')}
            </h2>
            <span className="text-xs font-semibold text-muted tabular-nums">
              {discoveredIngredients.length} {safeTranslate(t, 'game.discovered', 'discovered')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
              <input
                type="search"
                aria-label={safeTranslate(t, 'game.filterIngredients', 'Filter ingredients...')}
                placeholder={safeTranslate(t, 'game.filterIngredients', 'Filter ingredients...')}
                className="w-full bg-sunk border border-transparent rounded-full py-2 pl-9 pr-4 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-cobalt/50 focus:bg-surface"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => setCompactView(!compactView)}
              aria-pressed={compactView}
              className={`w-9 h-9 rounded-full border transition-colors flex items-center justify-center ${
                compactView
                  ? 'bg-cobalt border-cobalt text-on-cobalt'
                  : 'bg-surface border-line text-muted hover:text-ink'
              }`}
              title={compactView ? 'Normal view' : 'Compact view'}
              aria-label={compactView ? 'Normal view' : 'Compact view'}
            >
              {compactView ? '⊞' : '⊟'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 lg:p-4 scroll-smooth bg-canvas">
          {filteredIngredients.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <p className="font-display text-xl text-ink mb-1">
                {safeTranslate(t, 'cook.noResultsFound', 'No ingredients found')}
              </p>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-sm font-semibold text-cobalt hover:underline"
                >
                  {safeTranslate(t, 'cook.clearSearch', 'Clear search')}
                </button>
              )}
            </div>
          ) : (
            <div className={`grid gap-2 ${compactView ? 'grid-cols-5 sm:grid-cols-6 lg:grid-cols-4' : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-2 gap-3'}`}>
              {filteredIngredients.map((ing) => (
                <IngredientItem
                  key={ing.id}
                  ingredient={ing}
                  onClick={(e) => handlePick(ing.id, e)}
                  compact={compactView}
                />
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-surface border-t border-line">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted" title={safeTranslate(t, 'game.latestBreakthroughs', 'Latest Breakthroughs')}>
              <span aria-hidden="true">🔥</span>
              <span className="font-bold text-ink tabular-nums">{discoveryHistory.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => setShowContactForm(true)}
                className={iconButton}
                title={safeTranslate(t, 'navigation.contact', 'Contact')}
                aria-label={safeTranslate(t, 'navigation.contact', 'Contact')}
              >
                <span aria-hidden="true" className="text-sm">✉️</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className={`${iconButton} hover:text-miss hover:bg-miss-soft`}
                title={safeTranslate(t, 'navigation.reset', 'Reset')}
                aria-label={safeTranslate(t, 'navigation.reset', 'Reset')}
              >
                <span aria-hidden="true" className="text-sm">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area - the pot */}
      <section className={`
        ${mobileTab === 'game' ? 'flex' : 'hidden'} lg:flex
        flex-1 relative flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-4
        h-[calc(100vh-72px)] lg:h-screen pb-4 lg:pb-0
      `}>
        {/* Soft kitchen-light backdrop */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 45% at 50% 58%, color-mix(in srgb, var(--im-pot-hi) 14%, transparent), transparent 70%)' }}
        />

        <div className="absolute top-3 right-3 lg:top-5 lg:right-5 z-20">
          <ThemeToggle />
        </div>

        <header className="z-10 text-center mb-5 lg:mb-8">
          <h1 className="font-display font-medium text-4xl lg:text-5xl tracking-tight text-ink">
            {safeTranslate(t, 'app.title', 'Infinite Meal')}
          </h1>
          <p className="text-muted text-sm lg:text-[15px] mt-2 px-4">
            {safeTranslate(t, 'game.masterIngredients', 'Master the ingredients, discover new recipes.')}
          </p>
        </header>

        <div className="z-10 flex flex-col items-center gap-6 lg:gap-10 w-full max-w-2xl">
          <MethodSelector
            methods={cookingMethods}
            selected={selectedMethod}
            onSelect={setSelectedMethod}
            disabled={status === 'mixing'}
          />

          <MixingBowl
            potRef={potRef}
            methodId={selectedMethod.id}
            items={mixingIngredients}
            onDrop={handleDrop}
            status={status}
            onClear={handleClear}
            onPlusClick={() => setMobileTab('ingredients')}
          />

          {/* Cook button for single ingredient + cooking method */}
          <div className="min-h-14 -mt-2 lg:-mt-4">
            {mixingIngredients.length === 1 && status === 'idle' && selectedMethod.id !== 'mix' && (
              <button
                type="button"
                onClick={handleApplyMethod}
                className="animate-in slide-in-from-bottom-2 inline-flex items-center gap-3 rounded-2xl bg-cta text-on-cta pl-5 pr-6 py-3 shadow-soft hover:brightness-110 active:scale-[0.985] transition-all"
              >
                <span aria-hidden="true" className="text-xl">{selectedMethod.emoji}</span>
                <span className="font-display italic font-medium text-xl">
                  {safeTranslate(t, `cookingMethods.${selectedMethod.id}`, selectedMethod.name)}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Right Sidebar - Discovery Book */}
      <div className={`
        ${mobileTab === 'discoveries' ? 'block' : 'hidden'} lg:block
        w-full lg:w-80
        h-[calc(100vh-72px)] lg:h-screen
      `}>
        <DiscoveryBook
          ingredients={ingredients}
          history={discoveryHistory}
          achievements={achievements}
          onIngredientClick={handlePick}
        />
      </div>

      {/* Toast for "no recipe" / "no effect" */}
      {error && (
        <div
          role="status"
          className="toast-in fixed left-1/2 bottom-24 lg:bottom-8 z-[70] max-w-[90vw] w-max flex items-center gap-2.5 rounded-2xl bg-ink text-canvas pl-4 pr-5 py-3 shadow-lift"
        >
          <span aria-hidden="true" className="text-lg">🤔</span>
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Success Modal */}
      {lastDiscovery && (
        <SuccessModal
          discovery={lastDiscovery.ingredient}
          isNew={lastDiscovery.isNew}
          onClose={dismissDiscovery}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#0C1322]/55 backdrop-blur-sm backdrop-in sm:p-4">
          <div role="alertdialog" aria-modal="true" aria-labelledby="reset-title" className="sheet-up bg-surface text-ink w-full sm:max-w-sm rounded-t-[28px] sm:rounded-[28px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 text-center shadow-lift">
            <div aria-hidden="true" className="mx-auto mb-4 w-16 h-16 rounded-full bg-miss-soft flex items-center justify-center text-3xl">⚠️</div>
            <h2 id="reset-title" className="font-display font-medium text-2xl mb-2">{t('reset.warning') || 'Warning: Progress Reset'}</h2>
            <p className="text-muted text-[15px] mb-6">
              {t('reset.message') || 'You are about to reset all your progress. This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-5 py-3 rounded-2xl bg-sunk text-ink font-semibold hover:brightness-95 transition-all"
              >
                {t('reset.cancel') || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 px-5 py-3 rounded-2xl bg-miss text-white font-semibold hover:brightness-110 transition-all"
              >
                {t('reset.confirm') || 'Reset Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#0C1322]/55 backdrop-blur-sm backdrop-in sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="contact-title" className="sheet-up bg-surface text-ink w-full sm:max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:pb-6 shadow-lift">
            <div className="flex justify-between items-center mb-4">
              <h2 id="contact-title" className="font-display font-medium text-2xl">{t('contact.title') || 'Feature Request'}</h2>
              <button
                type="button"
                onClick={() => setShowContactForm(false)}
                aria-label={t('contact.cancel') || 'Cancel'}
                className="w-9 h-9 rounded-full bg-sunk text-muted hover:text-ink text-xl flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              // Handle form submission here
              setShowContactForm(false);
              setContactEmail('');
              setContactMessage('');
            }}>
              <div className="mb-4">
                <label htmlFor="contact-email" className="block text-sm font-semibold text-muted mb-1">{t('contact.email') || 'Your Email'}</label>
                <input
                  id="contact-email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-sunk border border-transparent rounded-xl px-3 py-2.5 text-sm text-ink focus:outline-none focus:border-cobalt/50 focus:bg-surface"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="mb-5">
                <label htmlFor="contact-message" className="block text-sm font-semibold text-muted mb-1">{t('contact.feature') || 'Feature Description'}</label>
                <textarea
                  id="contact-message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-sunk border border-transparent rounded-xl px-3 py-2.5 text-sm text-ink h-28 resize-none focus:outline-none focus:border-cobalt/50 focus:bg-surface"
                  placeholder="Describe the feature you'd like to see..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-5 py-2.5 rounded-2xl bg-sunk text-ink font-semibold hover:brightness-95 transition-all"
                >
                  {t('contact.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-cta text-on-cta font-semibold hover:brightness-110 transition-all"
                >
                  {t('contact.send') || 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedRecipeCraftingNew;
