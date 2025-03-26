'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { withClientTranslations } from './withClientTranslations';
import LanguageSwitcher from './LanguageSwitcher';
import { 
  Ingredient, 
  CookingMethod, 
  RecipeHint,
  Achievement,
  DiscoveryItem,
  AdvancedRecipeCraftingProps,
  categories
} from '../types/RecipeTypes';
import { 
  initialIngredients,
  BASIC_STARTER_INGREDIENTS 
} from '../data/ingredients';
import { cookingMethods } from '../data/cookingMethods';
import { recipes } from '../data/recipes';
import { initialAchievements } from '../data/achievements';
import emailjs from '@emailjs/browser';

// Cookie management functions
const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  // Use root path and domain-level cookies to ensure they work across language paths
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
  console.log(`[Cookie Debug] Set cookie: ${name} at root path (/)`);
};

const getCookie = (name: string): string | null => {
  if (typeof window === 'undefined') return null;
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(cookieName) === 0) {
      const value = decodeURIComponent(cookie.substring(cookieName.length, cookie.length));
      console.log(`[Cookie Debug] Found cookie: ${name} with value length: ${value.length}`);
      return value;
    }
  }
  console.log(`[Cookie Debug] Cookie not found: ${name}`);
  return null;
};

const deleteCookie = (name: string) => {
  if (typeof window === 'undefined') return;
  // Ensure the cookie is deleted from the root path
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  console.log(`[Cookie Debug] Deleted cookie: ${name} from root path (/)`);
};

// Global storage keys - use consistent keys for all languages
const STORAGE_KEY_INGREDIENTS = 'global_game_ingredients';
const STORAGE_KEY_ACHIEVEMENTS = 'global_game_achievements';

// Storage management functions (uses localStorage with fallback to cookies)
const saveToStorage = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  // Use global key instead of language-dependent key
  const globalKey = key === 'gameIngredients' ? STORAGE_KEY_INGREDIENTS : 
                   key === 'gameAchievements' ? STORAGE_KEY_ACHIEVEMENTS : key;
  
  console.log(`[Storage Debug] Saving data to storage with global key '${globalKey}'`);
  
  try {
    // Ensure we're not trying to save null or undefined
    if (value === null || value === undefined) {
      console.error(`[Storage Debug] Attempted to save null/undefined value to '${globalKey}'`);
      return;
    }
    
    // First attempt to use localStorage (more storage space)
    const serializedValue = JSON.stringify(value);
    
    // Verify we're not storing an empty array or object
    if (serializedValue === '[]' || serializedValue === '{}') {
      console.warn(`[Storage Debug] Saving empty value to '${globalKey}', might be unintentional`);
    }
    
    localStorage.setItem(globalKey, serializedValue);
    console.log(`[Storage Debug] Successfully saved to localStorage with key '${globalKey}' (${serializedValue.length} chars)`);
    
    // Also save as cookie for extra reliability
    try {
      setCookie(globalKey, serializedValue);
    } catch (err) {
      console.error(`[Storage Debug] Failed to set backup cookie for '${globalKey}':`, err);
    }
  } catch (e) {
    console.error(`[Storage Debug] Error saving to localStorage for key '${globalKey}':`, e);
    // Fallback to cookies if localStorage fails (e.g., private browsing mode)
    try {
      const serializedValue = JSON.stringify(value);
      setCookie(globalKey, serializedValue);
      console.log(`[Storage Debug] Successfully saved to cookies with key '${globalKey}' (localStorage fallback)`);
    } catch (cookieError) {
      console.error(`[Storage Debug] Error saving to cookies for key '${globalKey}':`, cookieError);
    }
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  // Use global key instead of language-dependent key
  const globalKey = key === 'gameIngredients' ? STORAGE_KEY_INGREDIENTS : 
                   key === 'gameAchievements' ? STORAGE_KEY_ACHIEVEMENTS : key;
  
  console.log(`[Storage Debug] Attempting to load global key '${globalKey}' from storage`);
  
  try {
    // First try localStorage
    console.log(`[Storage Debug] Checking localStorage for '${globalKey}'`);
    const item = localStorage.getItem(globalKey);
    if (item) {
      try {
        const parsed = JSON.parse(item);
        console.log(`[Storage Debug] Successfully loaded '${globalKey}' from localStorage (${item.length} chars)`);
        return parsed;
      } catch (parseErr) {
        console.error(`[Storage Debug] Error parsing localStorage item for '${globalKey}':`, parseErr);
      }
    } else {
      console.log(`[Storage Debug] No item found in localStorage for '${globalKey}'`);
      
      // For legacy migrations, also check for the non-global key
      const legacyItem = localStorage.getItem(key);
      if (legacyItem) {
        try {
          const parsed = JSON.parse(legacyItem);
          console.log(`[Storage Debug] Found legacy item for '${key}', migrating to global key`);
          // Migrate to global key
          localStorage.setItem(globalKey, legacyItem);
          return parsed;
        } catch (parseErr) {
          console.error(`[Storage Debug] Error parsing legacy localStorage item:`, parseErr);
        }
      }
    }
    
    // Fallback to cookies
    console.log(`[Storage Debug] Checking cookies for '${globalKey}'`);
    const cookieValue = getCookie(globalKey);
    if (cookieValue) {
      try {
        const parsed = JSON.parse(cookieValue);
        console.log(`[Storage Debug] Successfully loaded '${globalKey}' from cookies`);
        return parsed;
      } catch (parseErr) {
        console.error(`[Storage Debug] Error parsing cookie value for '${globalKey}':`, parseErr);
      }
    } else {
      console.log(`[Storage Debug] No cookie found for '${globalKey}'`);
      
      // For legacy migrations, also check for the non-global key cookie
      const legacyCookie = getCookie(key);
      if (legacyCookie) {
        try {
          const parsed = JSON.parse(legacyCookie);
          console.log(`[Storage Debug] Found legacy cookie for '${key}', migrating to global key`);
          // Migrate to global key
          setCookie(globalKey, legacyCookie);
          return parsed;
        } catch (parseErr) {
          console.error(`[Storage Debug] Error parsing legacy cookie:`, parseErr);
        }
      }
    }
    
    console.log(`[Storage Debug] No data found for '${globalKey}', returning default value`);
  } catch (e) {
    console.error(`[Storage Debug] Error loading from storage for '${globalKey}':`, e);
  }
  
  return defaultValue;
};

const clearStorage = (key: string): void => {
  if (typeof window === 'undefined') return;
  
  // Use global key instead of language-dependent key
  const globalKey = key === 'gameIngredients' ? STORAGE_KEY_INGREDIENTS : 
                   key === 'gameAchievements' ? STORAGE_KEY_ACHIEVEMENTS : key;
  
  console.log(`[Storage Debug] Clearing storage for global key '${globalKey}'`);
  
  try {
    localStorage.removeItem(globalKey);
    console.log(`[Storage Debug] Successfully removed from localStorage: '${globalKey}'`);
    
    // Also clear the legacy key
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`[Storage Debug] Error clearing localStorage for key '${globalKey}':`, e);
  }
  
  // Also clear the cookie version if it exists
  try {
    deleteCookie(globalKey);
    console.log(`[Storage Debug] Successfully removed cookie: '${globalKey}'`);
    
    // Also clear the legacy cookie
    deleteCookie(key);
  } catch (e) {
    console.error(`[Storage Debug] Error clearing cookie for key '${globalKey}':`, e);
  }
};

// Helper function to normalize category keys
const normalizeCategoryKey = (category: string): string => {
  // Handle case where category has 'categories.' prefix
  if (category.startsWith('categories.')) {
    return category.replace('categories.', '');
  }
  
  // Find the key in the categories object that matches this value
  for (const [key, value] of Object.entries(categories)) {
    if (value === category) {
      return key;
    }
  }
  
  return category;
};

const AdvancedRecipeCrafting: React.FC<AdvancedRecipeCraftingProps> = ({ 
  onDarkModeChange,
  initialDarkMode
}) => {
  // Add translation hook
  const t = useTranslations();
  
  // Change useState initialization to use a lazy initializer function
  // Use imported data instead of redefining
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    if (typeof window === 'undefined') return initialIngredients;
    
    try {
      console.log('[Storage Debug] Initializing ingredients state...');
      const savedIngredients = loadFromStorage<Ingredient[]>('gameIngredients', initialIngredients);
      
      if (savedIngredients && savedIngredients.length > 0) {
        console.log('[Storage Debug] Initial load of ingredients:', savedIngredients.length, 'items');
        // Ensure all required properties are present
        return savedIngredients.map((item) => ({
          ...item,
          discovered: item.discovered ?? false,
          difficulty: item.difficulty ?? 1,
          category: item.category ?? 'BASIC'
        })) as Ingredient[];
      }
    } catch (e) {
      console.error('[Storage Debug] Error initializing ingredients:', e);
    }
    
    return initialIngredients;
  });
  
  const [workspace, setWorkspace] = useState<Ingredient[]>([]);
  const [mixWorkspace, setMixWorkspace] = useState<Ingredient[]>([]);
  const [discoveredItems, setDiscoveredItems] = useState<Ingredient[]>([]);
  const [message, setMessage] = useState<string>('');
  const [selectedMethod, setSelectedMethod] = useState<CookingMethod | null>(cookingMethods[1]);
  const [newDiscovery, setNewDiscovery] = useState<DiscoveryItem | null>(null);
  const [showHints, setShowHints] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    if (typeof window === 'undefined') return initialAchievements;
    
    try {
      console.log('[Storage Debug] Initializing achievements state...');
      const savedAchievements = loadFromStorage<Achievement[]>('gameAchievements', initialAchievements);
      
      if (savedAchievements && savedAchievements.length > 0) {
        console.log('[Storage Debug] Initial load of achievements:', savedAchievements.length, 'items');
        // Ensure all required properties are present
        return savedAchievements.map((item) => ({
          ...item,
          achieved: item.achieved ?? false
        })) as Achievement[];
      }
    } catch (e) {
      console.error('[Storage Debug] Error initializing achievements:', e);
    }
    
    return initialAchievements;
  });
  const [showResetConfirmation, setShowResetConfirmation] = useState<boolean>(false);
  const [showContactForm, setShowContactForm] = useState<boolean>(false);
  const [contactEmail, setContactEmail] = useState<string>('');
  const [featureRequest, setFeatureRequest] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const [formSubmitSuccess, setFormSubmitSuccess] = useState<boolean>(false);
  const [formSubmitError, setFormSubmitError] = useState<string | null>(null);
  
  // Add a ref to track previous discovered count
  const prevDiscoveredCountRef = useRef<number>(0);
  const prevCategoriesCountRef = useRef<number>(0);
  const prevHighestDifficultyRef = useRef<number>(1);
  
  // Add at the top of the component, near other useStates:
  const [debugMode] = useState<boolean>(process.env.NODE_ENV === 'development');
  
  // Add after initial state setup
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Log initial state on first render
    console.log('[Storage Debug] Initial state loaded:');
    console.log('- Ingredients discovered:', ingredients.filter(i => i.discovered).length);
    console.log('- Achievements unlocked:', achievements.filter(a => a.achieved).length);
    
    // Dump the first few discovered ingredients for debugging
    const discoveredIngredients = ingredients.filter(i => i.discovered);
    console.log('- First few discovered ingredients:',
      discoveredIngredients.slice(0, 5).map(i => i.name)
    );
    
    // Dump the achieved achievements for debugging
    const achievedItems = achievements.filter(a => a.achieved);
    console.log('- Unlocked achievements:', achievedItems.map(a => a.id));
    
  }, []);
  
  // Save game state whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Save all ingredient changes - don't use conditional checks that might prevent saving
    console.log('[Storage Debug] Saving ingredients state with', ingredients.filter(i => i.discovered).length, 'discovered items');
    saveToStorage('gameIngredients', ingredients);
  }, [ingredients]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Save all achievement changes - don't use conditional checks that might prevent saving
    console.log('[Storage Debug] Saving achievements state with', achievements.filter(a => a.achieved).length, 'achieved items');
    saveToStorage('gameAchievements', achievements);
  }, [achievements]);

  // Add a periodic auto-save effect to ensure state is always saved
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const autoSaveInterval = setInterval(() => {
      console.log('[Storage Debug] Auto-save: Saving ingredients state');
      saveToStorage('gameIngredients', ingredients);
      
      console.log('[Storage Debug] Auto-save: Saving achievements state');
      saveToStorage('gameAchievements', achievements);
    }, 30000); // Auto-save every 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [ingredients, achievements]);
  
  // Update discovered items from ingredients list
  useEffect(() => {
    // Set discovered items
    setDiscoveredItems(ingredients.filter(item => item.discovered));
    
    // Get current counts for achievements
    const discoveredCount = ingredients.filter(item => item.discovered && item.difficulty > 1).length;
    
    // Fix for Gourmet achievement - only count non-basic created items
    const createdCategories = new Set(
      ingredients
        .filter(item => 
          item.discovered && 
          !BASIC_STARTER_INGREDIENTS.includes(item.id) &&
          item.difficulty > 1
        )
        .map(item => item.category)
    ).size;
    
    const highestDifficulty = Math.max(...ingredients.filter(item => item.discovered).map(item => item.difficulty || 1));
    
    console.log(`[Achievement Debug] Current stats: discovered=${discoveredCount}, categories=${createdCategories}, difficulty=${highestDifficulty}`);
    console.log(`[Achievement Debug] Previous stats: discovered=${prevDiscoveredCountRef.current}, categories=${prevCategoriesCountRef.current}, difficulty=${prevHighestDifficultyRef.current}`);
    
    // Create a local copy of achievements to track changes
    let updatedAchievements = [...achievements];
    let hasChanges = false;
    
    // First Combo Achievement
    if (discoveredCount >= 1 && !achievements.find(a => a.id === 'first_combo')?.achieved) {
      console.log('[Achievement Debug] Unlocked: First Combination');
      updatedAchievements = updatedAchievements.map(a => 
        a.id === 'first_combo' ? {...a, achieved: true} : a
      );
      setMessage('Achievement unlocked: First Combination! 🏆');
      hasChanges = true;
    }
    
    // Explorer Achievement 
    if (discoveredCount >= 5 && !achievements.find(a => a.id === 'explorer')?.achieved) {
      console.log('[Achievement Debug] Unlocked: Culinary Explorer');
      updatedAchievements = updatedAchievements.map(a => 
        a.id === 'explorer' ? {...a, achieved: true} : a
      );
      setMessage('Achievement unlocked: Culinary Explorer! 🏆');
      hasChanges = true;
    }
    
    // Gourmet Achievement
    if (createdCategories >= 5 && !achievements.find(a => a.id === 'gourmet')?.achieved) {
      console.log('[Achievement Debug] Unlocked: Gourmet');
      updatedAchievements = updatedAchievements.map(a => 
        a.id === 'gourmet' ? {...a, achieved: true} : a
      );
      setMessage('Achievement unlocked: Gourmet! 🏆');
      hasChanges = true;
    }
    
    // Master Chef Achievement
    if (highestDifficulty >= 4 && !achievements.find(a => a.id === 'master_chef')?.achieved) {
      console.log('[Achievement Debug] Unlocked: Master Chef');
      updatedAchievements = updatedAchievements.map(a => 
        a.id === 'master_chef' ? {...a, achieved: true} : a
      );
      setMessage('Achievement unlocked: Master Chef! 🏆');
      hasChanges = true;
    }
    
    // Only update achievements if there were changes
    if (hasChanges) {
      console.log('[Achievement Debug] Saving updated achievements');
      setAchievements(updatedAchievements);
    }
    
    // Always update refs for next comparison
    prevDiscoveredCountRef.current = discoveredCount;
    prevCategoriesCountRef.current = createdCategories;
    prevHighestDifficultyRef.current = highestDifficulty;
    
  }, [ingredients]); // Keep achievements out of the dependency array to prevent loops
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: Ingredient | CookingMethod) => {
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleClick = (ingredient: Ingredient) => {
    if (mixWorkspace.length < 3) {
      const newMixWorkspace = [...mixWorkspace, ingredient];
      setMixWorkspace(newMixWorkspace);
      
      // Check for recipe matches
      if (newMixWorkspace.length === 2) {
        // Check for a recipe match with 2 ingredients
        setTimeout(() => {
          checkRecipeMatch(newMixWorkspace);
        }, 500);
      } else if (newMixWorkspace.length === 3) {
        // Check for a recipe match with 3 ingredients
        setTimeout(() => {
          checkRecipeWith3Ingredients(newMixWorkspace);
        }, 500);
      }
    } else {
      setMessage("You can only combine up to 3 ingredients at a time!");
      setTimeout(() => setMessage(""), 2000);
    }
  };
  
  // Handle drop in workspace
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    
    // Find the dropped item
    const droppedItem = [...ingredients, ...cookingMethods].find(item => item.id === id);
    if (!droppedItem) return;

    // Check if the drop target is the Mix area
    const isMixArea = (e.currentTarget as HTMLElement).closest('.mix-area') !== null;

    // If it's a cooking method
    if ('transformations' in droppedItem) {
      const method = droppedItem as CookingMethod;
      if (isMixArea) {
        setMessage("Cooking methods can't be used in the Mix area!");
        setTimeout(() => setMessage(""), 2000);
        return;
      }

      if (workspace.length === 1) {
        const ingredient = workspace[0];
        
        // Check if this method can transform the ingredient
        if (method.transformations[ingredient.id]) {
          const result = method.transformations[ingredient.id];
          
          // Find if this result exists in ingredients
          const resultIngredient = ingredients.find(i => i.id === result.id);
          
          if (resultIngredient) {
            // Mark as discovered if not already
            if (!resultIngredient.discovered) {
              setNewDiscovery({...resultIngredient, method: method.name});
              
              setIngredients(ingredients.map(item => 
                item.id === result.id ? {...item, discovered: true} : item
              ));
              
              setMessage(`You created ${result.name} by applying ${method.name}! 🎉`);
            } else {
              setMessage(`${method.name} created ${result.name}!`);
            }
          } else {
            // Add the new ingredient
            const newIngredient = {
              ...result,
              discovered: true,
              difficulty: ingredient.difficulty + 1
            };
            
            setNewDiscovery({...newIngredient, method: method.name});
            setIngredients([...ingredients, newIngredient]);
            setMessage(`You discovered ${result.name} by applying ${method.name}! 🎉`);
          }
          
          // Clear workspace after a delay
          setTimeout(() => {
            setWorkspace([]);
          }, 1000);
        } else {
          setMessage(`${method.name} had no effect on ${ingredient.name}. Try something else!`);
          
          // Clear workspace after a delay
          setTimeout(() => {
            setWorkspace([]);
          }, 1000);
        }
      } else if (workspace.length === 0) {
        setSelectedMethod(method);
      } else if (workspace.length >= 2) {
        setMessage(`You can only apply ${method.name} to one ingredient at a time. Please clear the workspace first.`);
      }
      return;
    }

    // If it's an ingredient
    const ingredient = droppedItem as Ingredient;
    if (isMixArea) {
      // Handle ingredient drop in Mix area
      if (mixWorkspace.length < 3) {
        const newMixWorkspace = [...mixWorkspace, ingredient];
        setMixWorkspace(newMixWorkspace);
        
        // Check for recipe matches
        if (newMixWorkspace.length === 2) {
          // Check for a recipe match with 2 ingredients
          setTimeout(() => {
            checkRecipeMatch(newMixWorkspace);
          }, 500);
        } else if (newMixWorkspace.length === 3) {
          // Check for a recipe match with 3 ingredients
          setTimeout(() => {
            checkRecipeWith3Ingredients(newMixWorkspace);
          }, 500);
        }
      } else {
        setMessage("You can only combine up to 3 ingredients at a time!");
        setTimeout(() => setMessage(""), 2000);
      }
      return;
    }

    // Handle ingredient drop in cooking method workspace
    if (workspace.length < 3) {
      const newWorkspace = [...workspace, ingredient];
      setWorkspace(newWorkspace);
      
      // If there's a selected cooking method, try to apply it
      if (selectedMethod && selectedMethod.id !== 'mix') {
        if (newWorkspace.length === 1) {
          // Check if this method can transform the ingredient
          if (selectedMethod.transformations[ingredient.id]) {
            const result = selectedMethod.transformations[ingredient.id];
            
            // Find if this result exists in ingredients
            const resultIngredient = ingredients.find(i => i.id === result.id);
            
            if (resultIngredient) {
              // Mark as discovered if not already
              if (!resultIngredient.discovered) {
                setNewDiscovery({...resultIngredient, method: selectedMethod.name});
                
                setIngredients(ingredients.map(item => 
                  item.id === result.id ? {...item, discovered: true} : item
                ));
                
                setMessage(`You created ${result.name} by applying ${selectedMethod.name}! 🎉`);
              } else {
                setMessage(`${selectedMethod.name} created ${result.name}!`);
              }
            } else {
              // Add the new ingredient
              const newIngredient = {
                ...result,
                discovered: true,
                difficulty: ingredient.difficulty + 1
              };
              
              setNewDiscovery({...newIngredient, method: selectedMethod.name});
              setIngredients([...ingredients, newIngredient]);
              setMessage(`You discovered ${result.name} by applying ${selectedMethod.name}! 🎉`);
            }
            
            // Clear workspace after a delay
            setTimeout(() => {
              setWorkspace([]);
            }, 1000);
            return;
          } else {
            setMessage(`${selectedMethod.name} had no effect on ${ingredient.name}. Try something else!`);
            setTimeout(() => {
              setWorkspace([]);
            }, 1000);
            return;
          }
        }
      }
    } else {
      setMessage("You can only combine up to 3 ingredients at a time!");
      setTimeout(() => setMessage(""), 2000);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  // Check for recipes with 3 ingredients
  const checkRecipeWith3Ingredients = (currentWorkspace: Ingredient[]) => {
    if (currentWorkspace.length !== 3) return;
    
    const ids = currentWorkspace.map(item => item.id).sort();
    
    // Find a matching recipe with 3 ingredients
    const matchedRecipe = recipes.find(recipe => {
      if (recipe.ingredients.length !== 3) return false;
      
      const recipeIds = [...recipe.ingredients].sort();
      // Check if all ingredients in the recipe match the workspace
      return recipeIds.every((id, index) => id === ids[index]);
    });
    
    if (matchedRecipe) {
      // Find the result ingredient
      const resultIngredient = ingredients.find(i => i.id === matchedRecipe.result);
      
      if (resultIngredient) {
        // Mark as discovered if not already
        if (!resultIngredient.discovered) {
          // Set a small delay to ensure the message is recognized by the UI
          setTimeout(() => {
            setMessage(`You discovered ${resultIngredient.name}! 🎉`);
          }, 100);
          
          setNewDiscovery(resultIngredient);
          
          setIngredients(ingredients.map(item => 
            item.id === matchedRecipe.result ? {...item, discovered: true} : item
          ));
        } else {
          setTimeout(() => {
            setMessage(`You created ${resultIngredient.name} again!`);
          }, 100);
        }
      }
    } else {
      const ingredientNames = currentWorkspace.map(item => item.name).join(', ');
      setMessage(`No recipe found with ${ingredientNames}. Try different combinations!`);
    }
    
    // Clear workspace after a delay
    setTimeout(() => {
      setWorkspace([]);
      setMixWorkspace([]);
    }, 1000);
  };
  
  // Check if current workspace items match a recipe
  const checkRecipeMatch = (currentWorkspace: Ingredient[]) => {
    if (currentWorkspace.length !== 2) return;
    
    const ids = currentWorkspace.map(item => item.id).sort();
    
    // Find a matching recipe
    const matchedRecipe = recipes.find(recipe => {
      // Only match recipes with exactly 2 ingredients
      if (recipe.ingredients.length !== 2) return false;
      
      const recipeIds = [...recipe.ingredients].sort();
      return recipeIds[0] === ids[0] && recipeIds[1] === ids[1];
    });
    
    if (matchedRecipe) {
      // Find the result ingredient
      const resultIngredient = ingredients.find(i => i.id === matchedRecipe.result);
      
      if (resultIngredient) {
        // Mark as discovered if not already
        if (!resultIngredient.discovered) {
          // Set a small delay to ensure the message is recognized by the UI
          setTimeout(() => {
            setMessage(`You discovered ${resultIngredient.name}! 🎉`);
          }, 100);
          
          setNewDiscovery(resultIngredient);
          
          setIngredients(ingredients.map(item => 
            item.id === matchedRecipe.result ? {...item, discovered: true} : item
          ));
        } else {
          setTimeout(() => {
            setMessage(`You created ${resultIngredient.name} again!`);
          }, 100);
        }
      }
    } else {
      const ingredientNames = currentWorkspace.map(item => item.name).join(' and ');
      setMessage(`No recipe found with ${ingredientNames}. Try different combinations!`);
    }
    
    // Clear workspace after a delay
    setTimeout(() => {
      setWorkspace([]);
      setMixWorkspace([]);
    }, 1000);
  };
  
  // Get available recipe hints
  const getRecipeHints = (): RecipeHint[] => {
    const discoveredIds = new Set(discoveredItems.map(item => item.id));
    
    return recipes
      .filter(recipe => {
        // Only show hints for recipes where at least one ingredient is discovered
        // but the result is not yet discovered
        const hasDiscoveredIngredient = recipe.ingredients.some(id => discoveredIds.has(id));
        const resultDiscovered = ingredients.find(i => i.id === recipe.result)?.discovered;
        return hasDiscoveredIngredient && !resultDiscovered;
      })
      .map(recipe => {
        const knownIngredients = recipe.ingredients.filter(id => discoveredIds.has(id));
        const unknownIngredients = recipe.ingredients.filter(id => !discoveredIds.has(id));
        
        return {
          ...recipe,
          knownCount: knownIngredients.length,
          knownIngredients: knownIngredients.map(id => ingredients.find(i => i.id === id)?.name || id),
          unknownCount: unknownIngredients.length
        };
      })
      .sort((a, b) => b.knownCount - a.knownCount)
      .slice(0, 3); // Show top 3 hints
  };
  
  // Dismiss new discovery notification
  const dismissDiscovery = () => {
    setNewDiscovery(null);
  };
  
  // Toggle hints
  const toggleHints = () => {
    setShowHints(!showHints);
  };
  
  // Filter ingredients by selected category
  const getFilteredIngredients = () => {
    if (selectedCategory === "All") {
      return discoveredItems;
    }
    return discoveredItems.filter(item => item.category === selectedCategory);
  };
  
  const [darkMode, setDarkMode] = useState<boolean>(initialDarkMode || false);
  
  // Initialize dark mode from localStorage only on first render
  useEffect(() => {
    // If initialDarkMode is provided, use that value and don't initialize from localStorage
    if (initialDarkMode !== undefined) {
      return;
    }
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []); // Empty dependency array means this only runs once on mount
  
  // Sync with parent component when initialDarkMode changes
  useEffect(() => {
    if (initialDarkMode !== undefined) {
      setDarkMode(initialDarkMode);
    }
  }, [initialDarkMode]);
  
  // Toggle dark mode and save to localStorage
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Notify parent component about dark mode change
    if (onDarkModeChange) {
      onDarkModeChange(newDarkMode);
    }
  };
  
  // Update the resetApp function
  const resetApp = () => {
    // Reset workspaces and UI states
    setWorkspace([]);
    setMixWorkspace([]);
    setMessage('');
    setSelectedMethod(cookingMethods[1]); // Reset to Boil
    setNewDiscovery(null);
    
    // Reset all ingredients to initial discovery state
    setIngredients(initialIngredients.map((item: Ingredient) => {
      // Keep basic ingredients discovered, reset others
      return {
        ...item,
        discovered: BASIC_STARTER_INGREDIENTS.includes(item.id)
      };
    }));
    
    // Reset all achievements to initial state
    setAchievements(initialAchievements);
    
    // Reset stat tracking refs
    prevDiscoveredCountRef.current = 0;
    prevCategoriesCountRef.current = 0;
    prevHighestDifficultyRef.current = 1;

    // Clear saved game state
    clearStorage('gameIngredients');
    clearStorage('gameAchievements');
    
    // Hide the confirmation dialog
    setShowResetConfirmation(false);
  };
  
  // Toggle reset confirmation dialog
  const toggleResetConfirmation = () => {
    setShowResetConfirmation(!showResetConfirmation);
  };
  
  // Toggle contact form popup
  const toggleContactForm = () => {
    setShowContactForm(!showContactForm);
    // Reset form state when toggling
    if (!showContactForm) {
      setFormSubmitSuccess(false);
      setFormSubmitError(null);
    }
  };

  // Handle form submission
  const handleSubmitFeatureRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Set submitting state
    setFormSubmitting(true);
    
    // EmailJS service ID, template ID, and public key
    // You need to replace these with your actual EmailJS credentials
    const serviceId = 'service_fgloi99';  // Replace with your Service ID
    const templateId = 'template_wy33sq9'; // Replace with your Template ID
    const publicKey = '_2Mckm7tXag_Zc3aw';   // Replace with your Public Key
    
    // Template parameters
    const templateParams = {
      name: contactEmail,
      message: featureRequest
    };
    
    // Send email using EmailJS
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully:', response);
        setFormSubmitting(false);
        setFormSubmitSuccess(true);
        
        // Reset form after short delay to show success message
        setTimeout(() => {
          setContactEmail('');
          setFeatureRequest('');
          setFormSubmitSuccess(false);
          setShowContactForm(false);
        }, 2000);
      })
      .catch((error) => {
        console.error('Error sending email:', error);
        setFormSubmitting(false);
        setFormSubmitError('Failed to send email. Please try again.');
      });
  };
  
  // Modify the activeTab type to include 'achievements'
  const [activeTab, setActiveTab] = useState<'cook' | 'discover' | 'achievements'>('cook');

  // Add a helper function to get recipe steps for a dish
  const getRecipeSteps = (dishId: string): { steps: string[], ingredients: string[] } => {
    const steps: string[] = [];
    const usedIngredients: Set<string> = new Set();
    const processedResults: Set<string> = new Set();
    
    const findRecipeForResult = (resultId: string) => {
      // Find recipe that produces this result
      const recipe = recipes.find(r => r.result === resultId);
      if (!recipe) return null;
      
      // Track ingredients used in this recipe
      recipe.ingredients.forEach(ing => usedIngredients.add(ing));
      
      return recipe;
    };
    
    const buildSteps = (resultId: string, indent: number = 0): void => {
      // Avoid processing the same result multiple times
      if (processedResults.has(resultId)) return;
      processedResults.add(resultId);
      
      const recipe = findRecipeForResult(resultId);
      if (!recipe) return;
      
      // Get the name of the result ingredient
      const resultItem = ingredients.find(i => i.id === resultId);
      if (!resultItem) return;
      
      // Recursively build steps for ingredients first
      for (const ingredientId of recipe.ingredients) {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        if (ingredient && ingredient.difficulty > 1) {
          buildSteps(ingredientId, indent + 2);
        }
      }
      
      // Get names of all ingredients used in this recipe with their emojis
      const ingredientDetails = recipe.ingredients.map(id => {
        const ing = ingredients.find(i => i.id === id);
        return ing ? { name: ing.name, emoji: ing.emoji } : { name: id, emoji: '❓' };
      });
      
      // Add this step with emojis
      if (ingredientDetails.length === 2) {
        steps.push(`${' '.repeat(indent)}🔄 Combine ${ingredientDetails[0].emoji} ${ingredientDetails[0].name} and ${ingredientDetails[1].emoji} ${ingredientDetails[1].name} to create ${resultItem.emoji} ${resultItem.name}`);
      } else if (ingredientDetails.length === 3) {
        steps.push(`${' '.repeat(indent)}🔄 Combine ${ingredientDetails[0].emoji} ${ingredientDetails[0].name}, ${ingredientDetails[1].emoji} ${ingredientDetails[1].name}, and ${ingredientDetails[2].emoji} ${ingredientDetails[2].name} to create ${resultItem.emoji} ${resultItem.name}`);
      }
    };
    
    // Start building steps from the dish
    buildSteps(dishId);
    
    return { 
      steps, 
      ingredients: Array.from(usedIngredients)
    };
  };

  // Helper function to count non-basic discovered items
  const getNonBasicDiscoveredCount = () => {
    return ingredients.filter(item => 
      item.discovered && 
      !BASIC_STARTER_INGREDIENTS.includes(item.id) &&
      item.category !== categories.BASIC
    ).length;
  };

  // Function to get the total count of all ingredients
  const getTotalCount = () => {
    return 64; // Updated correct value for total count of non-basic ingredients
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full font-fredoka ${darkMode ? 'bg-gray-900 text-white' : ''}`}>
      {/* Reset Confirmation Dialog */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg max-w-md text-center shadow-xl`}>
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className={`text-xl font-bold mb-3 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>{t('reset.warning')}</h2>
            <p className={`mb-5 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('reset.message')}
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={toggleResetConfirmation}
                className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-800 py-2 px-6 rounded-lg font-medium transition-colors cursor-pointer`}
              >
                {t('reset.cancel')}
              </button>
              <button 
                onClick={resetApp}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg font-medium transition-colors cursor-pointer"
              >
                {t('reset.confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Contact Form Popup */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg max-w-md w-full shadow-xl`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>{t('contact.title')}</h2>
              <button 
                onClick={toggleContactForm}
                className="text-gray-500 hover:text-gray-700 text-xl"
                disabled={formSubmitting}
              >
                ×
              </button>
            </div>
            
            {formSubmitSuccess ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-4">✅</div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-green-300' : 'text-green-600'}`}>{t('contact.success')}</h3>
                <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {t('contact.successMessage')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeatureRequest}>
                {formSubmitError && (
                  <div className={`mb-4 p-3 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                    {formSubmitError}
                  </div>
                )}
                
                <div className="mb-4">
                  <label 
                    htmlFor="email" 
                    className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('contact.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="your@email.com"
                    required
                    disabled={formSubmitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label 
                    htmlFor="feature" 
                    className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    {t('contact.feature')}
                  </label>
                  <textarea
                    id="feature"
                    value={featureRequest}
                    onChange={(e) => setFeatureRequest(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Describe the feature you'd like to see..."
                    rows={5}
                    required
                    disabled={formSubmitting}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button" 
                    onClick={toggleContactForm}
                    className={`mr-2 py-2 px-4 rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    }`}
                    disabled={formSubmitting}
                  >
                    {t('contact.cancel')}
                  </button>
                  <button 
                    type="submit"
                    className={`py-2 px-4 rounded-lg flex items-center ${
                      darkMode 
                        ? 'bg-blue-700 hover:bg-blue-600 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } ${formSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    disabled={formSubmitting}
                  >
                    {formSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('contact.sending')}
                      </>
                    ) : t('contact.send')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      
      {/* Tab Navigation - Fixed at the top */}
      <div className={`w-full sticky top-0 z-40 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab('cook')}
            className={`flex-1 py-4 text-center text-lg font-bold transition-all cursor-pointer ${
              activeTab === 'cook'
                ? darkMode 
                  ? 'text-blue-300 border-b-2 border-blue-400 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]' 
                  : 'text-blue-700 border-b-2 border-blue-500 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]'
                : darkMode 
                  ? 'text-gray-400 border-b-2 border-white hover:text-gray-200' 
                  : 'text-gray-500 border-b-2 border-white hover:text-gray-700'
            }`}
          >
            👨‍🍳 {t('navigation.cook')}
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`flex-1 py-4 text-center text-lg font-bold transition-all cursor-pointer ${
              activeTab === 'discover'
                ? darkMode 
                  ? 'text-blue-300 border-b-2 border-blue-400 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]' 
                  : 'text-blue-700 border-b-2 border-blue-500 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]'
                : darkMode 
                  ? 'text-gray-400 border-b-2 border-white hover:text-gray-200' 
                  : 'text-gray-500 border-b-2 border-white hover:text-gray-700'
            }`}
          >
            🔍 {t('navigation.discover')}
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex-1 py-4 text-center text-lg font-bold transition-all cursor-pointer ${
              activeTab === 'achievements'
                ? darkMode 
                  ? 'text-blue-300 border-b-2 border-blue-400 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]' 
                  : 'text-blue-700 border-b-2 border-blue-500 shadow-[inset_0_2px_2px_rgba(0,0,0,0.35)]'
                : darkMode 
                  ? 'text-gray-400 border-b-2 border-white hover:text-gray-200' 
                  : 'text-gray-500 border-b-2 border-white hover:text-gray-700'
            }`}
          >
            🏆 {t('navigation.achievements')}
          </button>
        </div>
      </div>

      {/* Cook Tab Content */}
      {activeTab === 'cook' && (
        <div className="w-full pt-4">
          {/* New discovery popup */}
          {newDiscovery && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg max-w-md text-center shadow-xl`}>
                <h2 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>{t('cook.newDiscovery')} 🎉</h2>
                <div className="text-7xl my-5">{newDiscovery.emoji}</div>
                <h3 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>
                  {t(`ingredients.${newDiscovery.id}`, { fallback: newDiscovery.name })}
                </h3>
                <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  {t('cook.category')}: {t(`categories.${normalizeCategoryKey(newDiscovery.category)}`, { fallback: newDiscovery.category })}
                </p>
                {newDiscovery.method && (
                  <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                    {t('cook.createdBy')}: {t(`cookingMethods.${newDiscovery.method}`, { fallback: newDiscovery.method })}
                  </p>
                )}
                <p className="text-base mb-5">{t('cook.difficulty')}: {Array(newDiscovery.difficulty).fill('⭐').join('')}</p>
                <button 
                  onClick={dismissDiscovery}
                  className={`${darkMode ? 'bg-blue-700 hover:bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} text-white py-3 px-6 rounded-lg text-lg font-medium transition-colors cursor-pointer`}
                >
                  {t('cook.continueCooking')}
                </button>
              </div>
            </div>
          )}
          
          {/* Main content area - 2 column layout */}
          <div className="flex flex-col md:flex-row w-full px-4 gap-4">
            {/* Left column - Workspace, Cooking Methods, and Mix Area */}
            <div className="w-full md:w-2/3 order-1">
              {/* Mix Area */}
              <div className="w-full mb-4">
                <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('cook.mixArea')}:</h2>
                <div 
                  className={`mix-area flex items-center justify-center gap-4 p-6 border-4 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'} rounded-lg w-full h-64 mb-4 relative shadow-md z-10`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  {mixWorkspace.length === 0 ? (
                    <div className="text-center relative z-10">
                      <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                        {t('cook.dragIngredientsHere')}
                      </p>
                      <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                        {t('cook.upToThreeIngredients')}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-6 w-full flex-wrap relative z-10">
                      {mixWorkspace.map((item, index) => (
                        <div key={index} className={`flex flex-col items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-white bg-opacity-80'} p-3 rounded-lg shadow-sm`}>
                          <span className="text-6xl mb-2">{item.emoji}</span>
                          <span className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                            {t(`ingredients.${item.id}`, { fallback: item.name })}
                          </span>
                          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'} mt-1`}>
                            {t(`categories.${normalizeCategoryKey(item.category)}`, { fallback: item.category })}
                          </span>
                        </div>
                      ))}
                      {mixWorkspace.length < 3 && (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <span className="text-6xl mb-2">+</span>
                          <span className="text-base font-medium">{t('cook.addMore')}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute opacity-10 text-9xl pointer-events-none">
                    🥄
                  </div>
                  {mixWorkspace.length > 0 && (
                    <button 
                      onClick={() => {
                        setMixWorkspace([]);
                        setMessage('');
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-sm w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-md z-20"
                      aria-label={t('cook.clear')}
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback Area */}
              <div className="w-full mb-4 h-20 flex flex-col justify-center z-20">
                {/* Warning message */}
                <div className={`${darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'} px-4 py-2 rounded-lg shadow-md transition-opacity duration-300 flex items-center justify-center ${message.includes("No recipe found") || message.includes("You can only combine") || message.includes("don't combine") || message.includes("had no effect") || message.includes("You can only apply") ? 'opacity-100' : 'opacity-0 absolute'}`}>
                  <span className="text-xl mr-2">⚠️</span>
                  <span className="font-medium">
                    {message.includes("No recipe found") || message.includes("You can only combine") || message.includes("don't combine") || message.includes("had no effect") || message.includes("You can only apply") ? message : ''}
                  </span>
                </div>

                {/* Success message */}
                <div className={`${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'} px-4 py-2 rounded-lg shadow-md transition-opacity duration-300 flex items-center justify-center mt-2 ${(message.includes("discovered") || message.includes("created")) && !message.includes("Achievement unlocked") ? 'opacity-100' : 'opacity-0 absolute'}`}>
                  <span className="text-xl mr-2">🎉</span>
                  <span className="font-medium">
                    {(message.includes("discovered") || message.includes("created")) && !message.includes("Achievement unlocked") ? message : ''}
                  </span>
                </div>
              </div>

              {/* Cooking Methods */}
              <div className="mb-2 w-full">
                <h2 className={`text-xl font-bold mb-1 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('cook.cookingMethods')}</h2>
                <div className="flex flex-nowrap gap-2 overflow-x-auto pb-2 pt-2 px-1">
                  {cookingMethods.slice(1).map((method: CookingMethod) => (
                    <div 
                      key={method.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, method)}
                      onClick={() => {
                        setSelectedMethod(method);
                      }}
                      className={`flex-1 flex items-center justify-center p-1 border min-w-[100px] ${
                        method.id === 'boil'
                          ? `${darkMode ? 'border-red-700 bg-red-900 hover:bg-red-800' : 'border-red-200 bg-red-50 hover:bg-red-100'}`
                          : method.id === 'fry'
                          ? `${darkMode ? 'border-orange-700 bg-orange-900 hover:bg-orange-800' : 'border-orange-200 bg-orange-50 hover:bg-orange-100'}`
                          : method.id === 'bake'
                          ? `${darkMode ? 'border-yellow-700 bg-yellow-900 hover:bg-yellow-800' : 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100'}`
                          : method.id === 'chop'
                          ? `${darkMode ? 'border-green-700 bg-green-900 hover:bg-green-800' : 'border-green-200 bg-green-50 hover:bg-green-100'}`
                          : `${darkMode ? 'border-purple-700 bg-purple-900 hover:bg-purple-800' : 'border-purple-200 bg-purple-50 hover:bg-purple-100'}`
                      } rounded-lg cursor-grab ${selectedMethod?.id === method.id ? 'ring-2 ring-blue-600' : ''}`}
                    >
                      <span className="text-xl mr-1">{method.emoji}</span>
                      <div className="text-center">
                        <span className={`text-xs font-bold block ${
                          method.id === 'boil'
                            ? `${darkMode ? 'text-red-200' : 'text-red-800'}`
                            : method.id === 'fry'
                            ? `${darkMode ? 'text-orange-200' : 'text-orange-800'}`
                            : method.id === 'bake'
                            ? `${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`
                            : method.id === 'chop'
                            ? `${darkMode ? 'text-green-200' : 'text-green-800'}`
                            : `${darkMode ? 'text-purple-200' : 'text-purple-800'}`
                        }`}>{t(`cookingMethods.${method.id}`)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Workspace */}
              <div 
                className={`flex items-center justify-center gap-4 p-6 border-4 border-dashed ${
                  selectedMethod 
                    ? selectedMethod.id === 'boil'
                      ? `${darkMode ? 'border-red-700 bg-red-900' : 'border-red-200 bg-red-50'}`
                      : selectedMethod.id === 'fry'
                      ? `${darkMode ? 'border-orange-700 bg-orange-900' : 'border-orange-200 bg-orange-50'}`
                      : selectedMethod.id === 'bake'
                      ? `${darkMode ? 'border-yellow-700 bg-yellow-900' : 'border-yellow-200 bg-yellow-50'}`
                      : selectedMethod.id === 'chop'
                      ? `${darkMode ? 'border-green-700 bg-green-900' : 'border-green-200 bg-green-50'}`
                      : `${darkMode ? 'border-purple-700 bg-purple-900' : 'border-purple-200 bg-purple-50'}`
                    : `${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`
                } rounded-lg w-full h-64 mb-4 relative shadow-md z-10`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {workspace.length === 0 ? (
                  <div className="text-center relative z-10">
                    <p className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                      {selectedMethod 
                        ? t('cook.dragIngredientMethod', {method: selectedMethod.name.toLowerCase()})
                        : t('cook.dragIngredientToStart')}
                    </p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                      {selectedMethod 
                        ? t('cook.selectedMethod', {method: selectedMethod.name})
                        : t('cook.selectMethodFirst')}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-6 w-full flex-wrap relative z-10">
                    {workspace.map((item, index) => (
                      <div key={index} className={`flex flex-col items-center justify-center ${darkMode ? 'bg-gray-700' : 'bg-white bg-opacity-80'} p-3 rounded-lg shadow-sm`}>
                        <span className="text-6xl mb-2">{item.emoji}</span>
                        <span className={`text-base font-medium ${darkMode ? 'text-gray-200' : 'text-black'}`}>
                          {t(`ingredients.${item.id}`, { fallback: item.name })}
                        </span>
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'} mt-1`}>
                          {t(`categories.${normalizeCategoryKey(item.category)}`, { fallback: item.category })}
                        </span>
                      </div>
                    ))}
                    {workspace.length < 3 && (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <span className="text-6xl mb-2">+</span>
                        <span className="text-base font-medium">{t('cook.addMore')}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute opacity-10 text-9xl pointer-events-none">
                  {selectedMethod?.emoji || '🍳'}
                </div>
              </div>
            </div>
            
            {/* Right column - Ingredients */}
            <div className="w-full md:w-1/3 order-2">
              {/* Title and Description */}
              <div className="mb-6">
                <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  👨‍🍳 {t('cook.title')}
                </h1>
                <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {t('cook.subtitle')}
                </p>
              </div>

              {/* Ingredients by category */}
              <div className="mb-4 w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className={`text-xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('cook.ingredients')}:</h2>
                  <div className="flex items-center gap-2">
                    {/* All categories: BASIC, VEGETABLE, etc. */}
                    <select 
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className={`text-sm border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-white text-black'} rounded-md px-2 py-1 font-medium`}
                    >
                      <option value="All">{t('discover.all')}</option>
                      {Object.entries(categories).map(([key, category]: [string, string]) => (
                        <option key={category} value={category} className={darkMode ? 'text-white' : 'text-black'}>
                          {t(`categories.${key}`, {fallback: category})}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={toggleHints}
                      className={`text-base ${darkMode ? 'bg-blue-900 hover:bg-blue-800 text-blue-200' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'} px-3 py-2 rounded-lg font-medium transition-colors`}
                    >
                      {showHints ? t('cook.hideHints') : t('cook.showHints')}
                    </button>
                  </div>
                </div>
                
                {/* Recipe hints */}
                {showHints && (
                  <div className={`${darkMode ? 'bg-yellow-900 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} p-4 rounded-lg mb-5 border shadow-sm`}>
                    <h3 className={`font-bold mb-2 text-lg ${darkMode ? 'text-yellow-200' : 'text-yellow-800'}`}>{t('cook.recipeHints')}:</h3>
                    {getRecipeHints().length > 0 ? (
                      <ul className="list-disc pl-6 space-y-2">
                        {getRecipeHints().map((hint, idx) => (
                          <li key={idx} className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {t('cook.tryCombining', { ingredients: hint.knownIngredients.join(' and ') })}
                            {hint.unknownCount > 0 && t('cook.withSomethingElse')}
                            {hint.difficulty && t('cook.difficultyLevel', { level: hint.difficulty })}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('cook.discoverMoreForHints')}</p>
                    )}
                  </div>
                )}
                
                {/* Ingredients list */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-4 rounded-lg shadow-sm border`}>
                  <div className="flex flex-wrap">
                    {getFilteredIngredients().map(item => (
                      <div 
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onClick={() => handleClick(item)}
                        className={`inline-flex items-center p-2 mr-2 mb-2 border ${darkMode ? 'border-gray-700 bg-gray-700 hover:bg-gray-600' : 'border-gray-200 bg-white hover:bg-blue-50'} rounded-lg cursor-grab shadow-sm hover:shadow-md transition-colors`}
                      >
                        <span className="text-2xl mr-2">{item.emoji}</span>
                        <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          {t(`ingredients.${item.id}`, { fallback: item.name })}
                        </span>
                        {item.difficulty > 1 && (
                          <span className="text-xs text-yellow-500 ml-1">
                            {Array(item.difficulty).fill('⭐').join('')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Status area */}
          <div className="flex justify-between w-full px-4 mb-4">
            <div className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {t('cook.discovered')}: {getNonBasicDiscoveredCount()}/{getTotalCount()}
            </div>
            <div className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <button 
                onClick={() => setActiveTab('achievements')}
                className="flex items-center hover:underline"
              >
                <span className="mr-1">🏆</span>
                <span>
                  {achievements.filter(a => a.achieved).length}/{achievements.length} {t('achievements.title')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discover Tab Content */}
      {activeTab === 'discover' && (
        <div className="w-full p-6">
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <h2 className="text-3xl font-bold mb-6 text-center">🔍 {t('discover.title')}</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Sidebar - All Discoverable Items */}
              <div className="w-full md:w-1/4">
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4 top-24`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('discover.discoveredItems')}</h3>
                  
                  {/* Group items by category */}
                  {Object.entries(categories)
                    .filter(([categoryKey, category]: [string, string]) => 
                      categoryKey !== 'BASIC' && 
                      ingredients.some(i => i.discovered && i.category === category && i.difficulty > 1)
                    )
                    .map(([categoryKey, category]: [string, string]) => {
                    const categoryItems = ingredients.filter(i => 
                      i.discovered && 
                      i.category === category && 
                      i.difficulty > 1
                    );
                    if (categoryItems.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-4">
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t(`categories.${categoryKey}`, {fallback: category})}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {categoryItems.map(item => (
                            <div 
                              key={item.id}
                              className={`flex items-center p-1 rounded ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} cursor-pointer transition-colors`}
                              title={`${t(`ingredients.${item.id}`, {fallback: item.name})} (${t(`categories.${categoryKey}`, {fallback: category})})`}
                            >
                              <span className="text-lg mr-1">{item.emoji}</span>
                              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t(`ingredients.${item.id}`, {fallback: item.name})}
                              </span>
                              {item.difficulty > 1 && (
                                <span className="text-xs text-yellow-500 ml-1">
                                  {Array(item.difficulty).fill('⭐').join('')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {t('discover.totalDiscovered')}:
                      </span>
                      <span className={`font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                        {getNonBasicDiscoveredCount()}/{getTotalCount()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Discoverable Items Section */}
                <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4 mt-4`}>
                  <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('discover.discoverableItems')}</h3>
                  
                  {/* Group undiscovered items by category */}
                  {Object.entries(categories)
                    .filter(([categoryKey, category]: [string, string]) => 
                      categoryKey !== 'BASIC' && 
                      ingredients.some(i => !i.discovered && i.category === category && i.difficulty > 1)
                    )
                    .map(([categoryKey, category]: [string, string]) => {
                    const categoryItems = ingredients.filter(i => 
                      !i.discovered && 
                      i.category === category && 
                      i.difficulty > 1
                    );
                    if (categoryItems.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-4">
                        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {t(`categories.${categoryKey}`, {fallback: category})}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {categoryItems.map(item => (
                            <div 
                              key={item.id}
                              className={`flex items-center p-1 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} opacity-50`}
                              title={`${t(`ingredients.${item.id}`, {fallback: item.name})} (${t(`categories.${categoryKey}`, {fallback: category})})`}
                            >
                              <span className="text-lg mr-1">❓</span>
                              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                {t(`ingredients.${item.id}`, {fallback: item.name})}
                              </span>
                              {item.difficulty > 1 && (
                                <span className="text-xs text-yellow-500 ml-1">
                                  {Array(item.difficulty).fill('⭐').join('')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Main content - Recipe Cards */}
              <div className="w-full md:w-3/4">
                {ingredients.filter(i => i.discovered && (i.category === categories.DISH || i.category === categories.DESSERT)).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-xl mb-4">{t('discover.noMealsYet')}</p>
                    <p className="text-lg">{t('discover.goToCookTab')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ingredients
                      .filter(i => i.discovered && (i.category === categories.DISH || i.category === categories.DESSERT))
                      .map(dish => {
                        const { steps } = getRecipeSteps(dish.id);
                        return (
                          <div 
                            key={dish.id} 
                            className={`rounded-lg overflow-hidden shadow-md ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-transform hover:scale-[1.02]`}
                          >
                            <div className={`p-4 ${darkMode ? 'bg-blue-900' : 'bg-blue-50'}`}>
                              <div className="flex items-center">
                                <span className="text-5xl mr-4">{dish.emoji}</span>
                                <div>
                                  <h3 className={`text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>
                                    {t(`ingredients.${dish.id}`, { fallback: dish.name })}
                                  </h3>
                                  <p className={`${darkMode ? 'text-blue-200' : 'text-blue-700'}`}>
                                    {t('discover.difficulty')}: {Array(dish.difficulty).fill('⭐').join('')}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-4">
                              <h4 className={`font-bold text-lg mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('discover.recipeSteps')}:</h4>
                              <ol className="list-decimal pl-5 space-y-2">
                                {steps.map((step, idx) => (
                                  <li key={idx} className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                              <div className={`mt-4 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm italic`}>
                                  ✨ {recipes.find(r => r.result === dish.id)?.description || t('discover.readyToEnjoy', {
                                    dish: t(`ingredients.${dish.id}`, { fallback: dish.name })
                                  })} ✨
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    }
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Achievements Tab Content */}
      {activeTab === 'achievements' && (
        <div className="w-full p-6">
          <div className={`${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <h2 className="text-3xl font-bold mb-6 text-center">🏆 {t('achievements.title')}</h2>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{t('achievements.progress')}</h3>
                <div className={`text-lg font-medium ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  {achievements.filter(a => a.achieved).length}/{achievements.length} {t('achievements.title')}
                </div>
              </div>
              
              <div className={`w-full h-4 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(achievements.filter(a => a.achieved).length / achievements.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Achievement Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Progression */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4`}>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('achievements.basicProgression')}</h3>
                <div className="space-y-2">
                  {achievements.slice(0, 4).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-2 rounded-lg border ${achievement.achieved 
                        ? `${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-300'}` 
                        : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="text-xl mr-2">{achievement.achieved ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t(`achievements.${achievement.id}`)}</h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t(`achievements.descriptions.${achievement.id}`)}</p>
                          {achievement.achieved && (
                            <div className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{t('achievements.completed')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Discovery Milestones */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4`}>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('achievements.discoveryMilestones')}</h3>
                <div className="space-y-2">
                  {achievements.slice(4, 9).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-2 rounded-lg border ${achievement.achieved 
                        ? `${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-300'}` 
                        : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="text-xl mr-2">{achievement.achieved ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t(`achievements.${achievement.id}`)}</h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t(`achievements.descriptions.${achievement.id}`)}</p>
                          {achievement.achieved && (
                            <div className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{t('achievements.completed')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cooking Methods */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4`}>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('achievements.cookingMethods')}</h3>
                <div className="space-y-2">
                  {achievements.slice(9, 15).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-2 rounded-lg border ${achievement.achieved 
                        ? `${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-300'}` 
                        : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="text-xl mr-2">{achievement.achieved ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t(`achievements.${achievement.id}`)}</h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t(`achievements.descriptions.${achievement.id}`)}</p>
                          {achievement.achieved && (
                            <div className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{t('achievements.completed')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categories */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4`}>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('achievements.categories')}</h3>
                <div className="space-y-2">
                  {achievements.slice(15, 21).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-2 rounded-lg border ${achievement.achieved 
                        ? `${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-300'}` 
                        : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="text-xl mr-2">{achievement.achieved ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t(`achievements.${achievement.id}`)}</h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t(`achievements.descriptions.${achievement.id}`)}</p>
                          {achievement.achieved && (
                            <div className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{t('achievements.completed')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Achievements */}
              <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-md border p-4 col-span-1 lg:col-span-2`}>
                <h3 className={`text-lg font-bold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t('achievements.advanced')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {achievements.slice(21).map(achievement => (
                    <div 
                      key={achievement.id}
                      className={`p-2 rounded-lg border ${achievement.achieved 
                        ? `${darkMode ? 'bg-green-900 border-green-800' : 'bg-green-50 border-green-300'}` 
                        : `${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'}`} transition-all hover:shadow-md`}
                    >
                      <div className="flex items-start">
                        <div className="text-xl mr-2">{achievement.achieved ? '🏆' : '🔒'}</div>
                        <div>
                          <h4 className={`text-sm font-bold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{t(`achievements.${achievement.id}`)}</h4>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t(`achievements.descriptions.${achievement.id}`)}</p>
                          {achievement.achieved && (
                            <div className={`mt-1 text-xs ${darkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>{t('achievements.completed')}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Dark mode toggle and utility buttons */}
      <div className="fixed bottom-4 right-4 z-30 flex gap-2">
        <LanguageSwitcher />
        <button 
          onClick={toggleContactForm}
          className={`p-3 rounded-full shadow-lg transition-colors bg-blue-900 hover:bg-blue-800 text-white cursor-pointer`}
          aria-label={t('contact.title')}
        >
          📨
        </button>
        <button 
          onClick={toggleResetConfirmation}
          className={`p-3 rounded-full shadow-lg transition-colors bg-blue-900 hover:bg-blue-800 text-white cursor-pointer`}
          aria-label={t('navigation.reset')}
        >
          🗑️
        </button>
        <button 
          onClick={toggleDarkMode}
          className={`p-3 rounded-full shadow-lg transition-colors bg-blue-900 hover:bg-blue-800 text-white cursor-pointer`}
          aria-label={darkMode ? t('navigation.lightMode') : t('navigation.darkMode')}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </div>
      
      {/* Debug info - only shown in development */}
      {/* Commented out debug panel
      {debugMode && (
        <div className="fixed bottom-28 left-4 bg-black bg-opacity-80 text-white p-2 rounded-lg text-xs z-50">
          <div>Storage Status:</div>
          <div>Ingredients: {ingredients.filter(i => i.discovered).length} discovered</div>
          <div>Achievements: {achievements.filter(a => a.achieved).length} achieved</div>
          <div>Using: {window.localStorage ? 'localStorage' : 'cookies'}</div>
          <button 
            onClick={() => {
              console.log('[Storage Debug] Manual storage check');
              console.log('localStorage.getItem(STORAGE_KEY_INGREDIENTS):', localStorage.getItem(STORAGE_KEY_INGREDIENTS));
              console.log('localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS):', localStorage.getItem(STORAGE_KEY_ACHIEVEMENTS));
            }}
            className="mt-1 bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
          >
            Check Storage
          </button>
        </div>
      )}
      */}
    </div>
  );
};

export default withClientTranslations(AdvancedRecipeCrafting); 