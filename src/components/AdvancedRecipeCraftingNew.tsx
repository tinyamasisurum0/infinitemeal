'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from './LanguageSwitcher';
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
import UndergroundPanel, { CustomRecipe, STORAGE_KEY_CUSTOM_RECIPES } from './UndergroundPanel';
import PasswordModal from './PasswordModal';

// Storage keys
const STORAGE_KEY_INGREDIENTS = 'global_game_ingredients';
const STORAGE_KEY_ACHIEVEMENTS = 'global_game_achievements';

// Secret access config
const SECRET_CLICK_COUNT = 6;
const SECRET_CLICK_TIMEOUT = 2000; // ms
const MASTER_KEY = '847291';

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

  // Underground Lab (Secret Admin Panel) state
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadFromStorage<CustomRecipe[]>(STORAGE_KEY_CUSTOM_RECIPES, []);
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUndergroundPanel, setShowUndergroundPanel] = useState(false);
  const secretClickCountRef = useRef(0);
  const secretClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Persist custom recipes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    saveToStorage(STORAGE_KEY_CUSTOM_RECIPES, customRecipes);
  }, [customRecipes]);

  // ESC key to close panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUndergroundPanel) setShowUndergroundPanel(false);
        else if (showPasswordModal) setShowPasswordModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUndergroundPanel, showPasswordModal]);

  // Secret click handler for logo/title
  const handleSecretClick = useCallback(() => {
    secretClickCountRef.current += 1;

    // Clear existing timeout
    if (secretClickTimeoutRef.current) {
      clearTimeout(secretClickTimeoutRef.current);
    }

    // Check if reached required clicks
    if (secretClickCountRef.current >= SECRET_CLICK_COUNT) {
      secretClickCountRef.current = 0;
      setShowPasswordModal(true);
    } else {
      // Reset count after timeout
      secretClickTimeoutRef.current = setTimeout(() => {
        secretClickCountRef.current = 0;
      }, SECRET_CLICK_TIMEOUT);
    }
  }, []);

  // Custom recipe management functions
  const handleAddCustomRecipe = useCallback((recipe: CustomRecipe) => {
    setCustomRecipes(prev => [...prev, recipe]);
  }, []);

  const handleDeleteCustomRecipe = useCallback((id: string) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  const handleImportCustomRecipes = useCallback((recipes: CustomRecipe[]) => {
    setCustomRecipes(prev => {
      // Avoid duplicates by id
      const existingIds = new Set(prev.map(r => r.id));
      const newRecipes = recipes.filter(r => !existingIds.has(r.id));
      return [...prev, ...newRecipes];
    });
  }, []);

  const handleClearAllCustomRecipes = useCallback(() => {
    setCustomRecipes([]);
  }, []);

  // Handle successful password entry
  const handlePasswordSuccess = useCallback(() => {
    setShowPasswordModal(false);
    setShowUndergroundPanel(true);
  }, []);

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
            ingredients: [ingredient.name],
            method: selectedMethod.name,
            result: resultIngredient,
            isNewDiscovery: isNew
          }]);

          setLastDiscovery({ ingredient: resultIngredient, isNew });
          setStatus('success');
          setCurrentMixingIds([]);
        }, 800);
      } else {
        setTimeout(() => {
          setError(t('game.noEffect') || `${selectedMethod.name} has no effect on ${ingredient.name}`);
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
              ingredients: itemsToMix.map(i => i.name),
              method: 'mix',
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
            ingredients: itemsToMix.map(i => i.name),
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
              cookingMethod: selectedMethod.id !== 'mix' ? selectedMethod.id : undefined
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
                difficulty: 3
              };

              // Add to ingredients if not exists
              setIngredients(prev => {
                const exists = prev.find(i => i.id === aiId);
                if (exists) {
                  return prev.map(i => i.id === aiId ? { ...i, discovered: true } : i);
                }
                return [...prev, resultIngredient];
              });

              setDiscoveryHistory(prev => [...prev, {
                ingredients: itemsToMix.map(i => i.name),
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
          const names = itemsToMix.map(i => i.name).join(' + ');
          setError(t('game.noRecipe') || `No recipe found for ${names}`);
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

  return (
    <div className="flex h-screen w-full bg-[#0f172a] text-slate-100 overflow-hidden">
            {/* Left Sidebar - Ingredient Shelf */}
      <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
              <input
                type="text"
                placeholder={t('game.filterIngredients') || 'Filter ingredients...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setCompactView(!compactView)}
              className={`p-2 rounded-lg border transition-all ${
                compactView
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title={compactView ? 'Normal view' : 'Compact view'}
            >
              {compactView ? '⊞' : '⊟'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <div className={`grid gap-2 ${compactView ? 'grid-cols-4' : 'grid-cols-2 gap-3'}`}>
            {filteredIngredients.map((ing) => (
              <IngredientItem
                key={ing.id}
                ingredient={ing}
                onClick={() => handleDrop(ing.id)}
                compact={compactView}
              />
            ))}
          </div>
        </div>

        <div className="p-4 bg-slate-900 border-t border-slate-800">
          {/* Stats row */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 mb-3">
            <div className="flex items-center gap-1">
              <span className="text-amber-500">🔥</span>
              <span className="font-bold text-slate-300">{discoveryHistory.length}</span>
            </div>
            <span>{discoveredIngredients.length} {t('game.discovered') || 'Discovered'}</span>
          </div>
          {/* Action buttons row */}
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setShowContactForm(true)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all"
              title={t('navigation.contact') || 'Contact'}
            >
              <span className="text-sm">✉️</span>
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 bg-slate-800 hover:bg-red-900/50 text-slate-400 hover:text-red-400 rounded-lg transition-all"
              title={t('navigation.reset') || 'Reset'}
            >
              <span className="text-sm">🗑️</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Area - Synthesizer */}
      <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="z-10 text-center mb-8">
          <h1
            className="text-4xl font-light tracking-widest text-slate-100 uppercase cursor-default select-none"
            onClick={handleSecretClick}
          >
            {t('app.title') || 'Infinite Meal'}
          </h1>
          <div className="h-14 mt-2 flex flex-col items-center justify-center">
            {error && (
              <div className="flex flex-col items-center animate-in slide-in-from-top duration-300">
                <p className="text-red-400 font-medium text-sm mb-2">{error}</p>
              </div>
            )}
            {!error && (
              <p className="text-slate-500 text-xs italic tracking-widest opacity-60">
                {t('game.masterIngredients') || 'Master the ingredients, discover new recipes.'}
              </p>
            )}
          </div>
        </div>

        <div className="z-10 flex flex-col items-center gap-12 w-full max-w-2xl">
          <MethodSelector
            methods={cookingMethods}
            selected={selectedMethod}
            onSelect={setSelectedMethod}
            disabled={status === 'mixing'}
          />

          <div className="relative group">
            <MixingBowl
              items={mixingIngredients}
              onDrop={handleDrop}
              status={status}
              onClear={handleClear}
            />
            {/* Cook button for single ingredient + cooking method */}
            {mixingIngredients.length === 1 && status === 'idle' && selectedMethod.id !== 'mix' && (
              <button
                onClick={handleApplyMethod}
                className="absolute -right-20 top-1/2 -translate-y-1/2 bg-amber-500 text-slate-900 font-black p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all animate-bounce"
                title={`Apply ${selectedMethod.name}`}
              >
                <span className="text-2xl">⚡</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Discovery Book */}
      <div className="w-80">
        <DiscoveryBook
          ingredients={ingredients}
          history={discoveryHistory}
          achievements={achievements}
          onIngredientClick={handleDrop}
        />
      </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-400 mb-3">{t('reset.warning') || 'Warning: Progress Reset'}</h2>
            <p className="text-slate-400 text-sm mb-6">
              {t('reset.message') || 'You are about to reset all your progress. This action cannot be undone.'}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
              >
                {t('reset.cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
              >
                {t('reset.confirm') || 'Reset Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-amber-500">{t('contact.title') || 'Feature Request'}</h2>
              <button
                onClick={() => setShowContactForm(false)}
                className="text-slate-500 hover:text-white text-xl"
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
                <label className="block text-sm text-slate-400 mb-1">{t('contact.email') || 'Your Email'}</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-1">{t('contact.feature') || 'Feature Description'}</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  placeholder="Describe the feature you'd like to see..."
                  required
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                >
                  {t('contact.cancel') || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-all"
                >
                  {t('contact.send') || 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secret Password Modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
        masterKey={MASTER_KEY}
      />

      {/* Underground Lab Panel */}
      <UndergroundPanel
        isOpen={showUndergroundPanel}
        onClose={() => setShowUndergroundPanel(false)}
        customRecipes={customRecipes}
        onAddRecipe={handleAddCustomRecipe}
        onDeleteRecipe={handleDeleteCustomRecipe}
        onImportRecipes={handleImportCustomRecipes}
        onClearAll={handleClearAllCustomRecipes}
        availableIngredients={ingredients}
      />
    </div>
  );
};

export default AdvancedRecipeCraftingNew;
