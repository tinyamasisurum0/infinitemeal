'use client';

import React, { useState, useMemo } from 'react';
import { Ingredient, categories } from '../types/RecipeTypes';
import { initialIngredients } from '../data/ingredients';

// Custom Recipe type for admin-created recipes
export interface CustomRecipe {
  id: string;
  ingredients: string[];
  result: {
    id: string;
    name: string;
    emoji: string;
    description: string;
    category: string;
    difficulty: number;
  };
  createdAt: number;
}

// Storage key for custom recipes
export const STORAGE_KEY_CUSTOM_RECIPES = 'underground_custom_recipes';

interface UndergroundPanelProps {
  isOpen: boolean;
  onClose: () => void;
  customRecipes: CustomRecipe[];
  onAddRecipe: (recipe: CustomRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onImportRecipes: (recipes: CustomRecipe[]) => void;
  onClearAll: () => void;
  availableIngredients: Ingredient[];
}

type TabType = 'ledger' | 'creator' | 'settings';

const UndergroundPanel: React.FC<UndergroundPanelProps> = ({
  isOpen,
  onClose,
  customRecipes,
  onAddRecipe,
  onDeleteRecipe,
  onImportRecipes,
  onClearAll,
  availableIngredients
}) => {
  // Tab state
  const [activeTab, setActiveTab] = useState<TabType>('ledger');

  // Search/Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Creator form state
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [resultName, setResultName] = useState('');
  const [resultEmoji, setResultEmoji] = useState('');
  const [resultDescription, setResultDescription] = useState('');
  const [resultCategory, setResultCategory] = useState(categories.DISH);
  const [resultDifficulty, setResultDifficulty] = useState(2);

  // Confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Export state
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // All available ingredients (discovered + all initial)
  const allIngredients = useMemo(() => {
    const seen = new Set<string>();
    const result: Ingredient[] = [];

    [...availableIngredients, ...initialIngredients].forEach(ing => {
      if (!seen.has(ing.id)) {
        seen.add(ing.id);
        result.push(ing);
      }
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableIngredients]);

  // Filtered recipes
  const filteredRecipes = useMemo(() => {
    return customRecipes.filter(recipe => {
      const matchesSearch =
        recipe.result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(ing => ing.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        filterCategory === 'all' || recipe.result.category === filterCategory;

      return matchesSearch && matchesCategory;
    });
  }, [customRecipes, searchTerm, filterCategory]);

  // Handle ingredient toggle in creator
  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredients(prev => {
      if (prev.includes(ingredientId)) {
        return prev.filter(id => id !== ingredientId);
      }
      if (prev.length >= 3) return prev;
      return [...prev, ingredientId];
    });
  };

  // Generate result ID from name
  const generateResultId = (name: string): string => {
    return `custom_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  };

  // Handle recipe creation
  const handleCreateRecipe = () => {
    if (selectedIngredients.length < 2 || !resultName || !resultEmoji) {
      return;
    }

    const newRecipe: CustomRecipe = {
      id: `recipe_${Date.now()}`,
      ingredients: selectedIngredients,
      result: {
        id: generateResultId(resultName),
        name: resultName,
        emoji: resultEmoji,
        description: resultDescription || `A custom creation made from ${selectedIngredients.join(' + ')}`,
        category: resultCategory,
        difficulty: resultDifficulty
      },
      createdAt: Date.now()
    };

    onAddRecipe(newRecipe);

    // Reset form
    setSelectedIngredients([]);
    setResultName('');
    setResultEmoji('');
    setResultDescription('');
    setResultCategory(categories.DISH);
    setResultDifficulty(2);
    setActiveTab('ledger');
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(customRecipes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', `underground_recipes_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportStatus('Exported successfully!');
    setTimeout(() => setExportStatus(null), 3000);
  };

  // Handle import
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const recipes = JSON.parse(e.target?.result as string);
        if (Array.isArray(recipes)) {
          onImportRecipes(recipes);
          setExportStatus(`Imported ${recipes.length} recipes!`);
          setTimeout(() => setExportStatus(null), 3000);
        }
      } catch (err) {
        console.error('Import error:', err);
        setExportStatus('Import failed: Invalid JSON');
        setTimeout(() => setExportStatus(null), 3000);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Get ingredient display info
  const getIngredientInfo = (id: string) => {
    const ing = allIngredients.find(i => i.id === id);
    return ing ? { name: ing.name, emoji: ing.emoji } : { name: id, emoji: '?' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-5xl h-[90vh] mx-4 bg-[#0a0f0a] border border-emerald-900/50 rounded-lg overflow-hidden flex flex-col shadow-2xl shadow-emerald-900/20">

        {/* Header - Terminal Style */}
        <div className="bg-[#0d120d] border-b border-emerald-900/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="font-mono text-emerald-400 text-sm">
                <span className="text-emerald-600">root@</span>
                <span className="text-emerald-400">underground-lab</span>
                <span className="text-emerald-600">:~$</span>
                <span className="ml-2 text-amber-400 animate-pulse">_</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-emerald-600 hover:text-emerald-400 transition-colors font-mono text-lg"
            >
              [ESC]
            </button>
          </div>

          {/* Title */}
          <div className="mt-4 flex items-center gap-3">
            <span className="text-3xl">🧪</span>
            <div>
              <h1 className="text-2xl font-bold text-emerald-400 font-mono tracking-wider">
                UNDERGROUND LAB
              </h1>
              <p className="text-emerald-700 text-xs font-mono">
                {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
                {'// Admin Recipe Management System v1.0'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            {[
              { id: 'ledger', label: 'LEDGER', icon: '📜' },
              { id: 'creator', label: 'CREATOR', icon: '⚗️' },
              { id: 'settings', label: 'SETTINGS', icon: '⚙️' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-4 py-2 font-mono text-sm rounded transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50'
                    : 'text-emerald-700 hover:text-emerald-500 border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}

            {/* Recipe Count Badge */}
            <div className="ml-auto flex items-center gap-2 text-amber-500/80 font-mono text-sm">
              <span className="text-emerald-700">{'//'}</span>
              <span>{customRecipes.length} recipes loaded</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">

          {/* LEDGER TAB */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700">🔍</span>
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-10 py-2 text-emerald-300 font-mono text-sm placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
                  />
                </div>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono text-sm focus:outline-none focus:border-emerald-700"
                >
                  <option value="all">All Categories</option>
                  {Object.values(categories).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                {/* Import/Export */}
                <button
                  onClick={handleExport}
                  className="px-3 py-2 bg-emerald-900/30 border border-emerald-800/50 rounded text-emerald-400 font-mono text-sm hover:bg-emerald-900/50 transition-colors"
                >
                  📤 Export
                </button>

                <label className="px-3 py-2 bg-amber-900/30 border border-amber-800/50 rounded text-amber-400 font-mono text-sm hover:bg-amber-900/50 transition-colors cursor-pointer">
                  📥 Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
              </div>

              {exportStatus && (
                <div className="text-center text-amber-400 font-mono text-sm py-2">
                  {exportStatus}
                </div>
              )}

              {/* Recipe List */}
              {filteredRecipes.length === 0 ? (
                <div className="text-center py-12 text-emerald-700 font-mono">
                  <div className="text-4xl mb-4">📭</div>
                  <p>No custom recipes found</p>
                  <p className="text-sm mt-2">Create your first recipe in the CREATOR tab</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredRecipes.map(recipe => (
                    <div
                      key={recipe.id}
                      className="bg-[#0d120d] border border-emerald-900/30 rounded-lg p-4 hover:border-emerald-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{recipe.result.emoji}</span>
                          <div>
                            <h3 className="text-emerald-300 font-mono font-bold">
                              {recipe.result.name}
                            </h3>
                            <p className="text-emerald-700 text-sm font-mono">
                              {recipe.result.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-emerald-800 bg-emerald-900/30 px-2 py-1 rounded">
                            {recipe.result.category}
                          </span>
                          <span className="text-xs font-mono text-amber-700 bg-amber-900/30 px-2 py-1 rounded">
                            Diff: {recipe.result.difficulty}
                          </span>
                        </div>
                      </div>

                      {/* Ingredients */}
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-emerald-700 font-mono">INPUT:</span>
                        {recipe.ingredients.map((ing, idx) => {
                          const info = getIngredientInfo(ing);
                          return (
                            <React.Fragment key={ing}>
                              <span className="bg-emerald-900/20 px-2 py-1 rounded text-emerald-400">
                                {info.emoji} {info.name}
                              </span>
                              {idx < recipe.ingredients.length - 1 && (
                                <span className="text-emerald-700">+</span>
                              )}
                            </React.Fragment>
                          );
                        })}
                        <span className="text-emerald-700 mx-2">→</span>
                        <span className="text-amber-400">
                          {recipe.result.emoji} {recipe.result.name}
                        </span>
                      </div>

                      {/* Delete */}
                      <div className="mt-3 flex justify-end">
                        {showDeleteConfirm === recipe.id ? (
                          <div className="flex items-center gap-2">
                            <span className="text-red-400 text-sm font-mono">Confirm delete?</span>
                            <button
                              onClick={() => {
                                onDeleteRecipe(recipe.id);
                                setShowDeleteConfirm(null);
                              }}
                              className="px-2 py-1 bg-red-900/50 border border-red-700 rounded text-red-400 text-sm font-mono hover:bg-red-800/50"
                            >
                              YES
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-2 py-1 bg-emerald-900/30 border border-emerald-800 rounded text-emerald-500 text-sm font-mono hover:bg-emerald-900/50"
                            >
                              NO
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(recipe.id)}
                            className="text-red-700 hover:text-red-500 text-sm font-mono transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CREATOR TAB */}
          {activeTab === 'creator' && (
            <div className="space-y-6">
              {/* Ingredient Selector */}
              <div>
                <h3 className="text-emerald-400 font-mono mb-3 flex items-center gap-2">
                  <span className="text-amber-500">01.</span>
                  SELECT INGREDIENTS
                  <span className="text-emerald-700 text-sm">
                    ({selectedIngredients.length}/3 selected)
                  </span>
                </h3>

                <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-[#0d120d] border border-emerald-900/30 rounded">
                  {allIngredients.map(ing => (
                    <button
                      key={ing.id}
                      onClick={() => toggleIngredient(ing.id)}
                      disabled={selectedIngredients.length >= 3 && !selectedIngredients.includes(ing.id)}
                      className={`p-2 rounded text-center transition-all ${
                        selectedIngredients.includes(ing.id)
                          ? 'bg-emerald-800/50 border-2 border-emerald-500 text-emerald-300'
                          : 'bg-emerald-900/20 border border-emerald-900/50 text-emerald-600 hover:border-emerald-700 disabled:opacity-30'
                      }`}
                    >
                      <div className="text-xl">{ing.emoji}</div>
                      <div className="text-xs font-mono truncate">{ing.name}</div>
                    </button>
                  ))}
                </div>

                {/* Selected Preview */}
                {selectedIngredients.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-emerald-700 font-mono text-sm">SELECTED:</span>
                    {selectedIngredients.map((id, idx) => {
                      const info = getIngredientInfo(id);
                      return (
                        <React.Fragment key={id}>
                          <span className="bg-emerald-800/50 px-2 py-1 rounded text-emerald-300 text-sm">
                            {info.emoji} {info.name}
                          </span>
                          {idx < selectedIngredients.length - 1 && (
                            <span className="text-emerald-700">+</span>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Result Definition */}
              <div>
                <h3 className="text-emerald-400 font-mono mb-3 flex items-center gap-2">
                  <span className="text-amber-500">02.</span>
                  DEFINE RESULT
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-emerald-700 font-mono text-sm mb-1">NAME *</label>
                    <input
                      type="text"
                      value={resultName}
                      onChange={(e) => setResultName(e.target.value)}
                      placeholder="e.g., Dragon Roll"
                      className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-700 font-mono text-sm mb-1">EMOJI *</label>
                    <input
                      type="text"
                      value={resultEmoji}
                      onChange={(e) => setResultEmoji(e.target.value)}
                      placeholder="e.g., 🐉"
                      className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-emerald-700 font-mono text-sm mb-1">DESCRIPTION</label>
                    <textarea
                      value={resultDescription}
                      onChange={(e) => setResultDescription(e.target.value)}
                      placeholder="A delicious creation..."
                      rows={2}
                      className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono placeholder:text-emerald-800 focus:outline-none focus:border-emerald-700 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-700 font-mono text-sm mb-1">CATEGORY</label>
                    <select
                      value={resultCategory}
                      onChange={(e) => setResultCategory(e.target.value)}
                      className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-700"
                    >
                      {Object.values(categories).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-emerald-700 font-mono text-sm mb-1">DIFFICULTY</label>
                    <select
                      value={resultDifficulty}
                      onChange={(e) => setResultDifficulty(Number(e.target.value))}
                      className="w-full bg-[#0d120d] border border-emerald-900/50 rounded px-3 py-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-700"
                    >
                      {[1, 2, 3, 4, 5].map(d => (
                        <option key={d} value={d}>Level {d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Preview & Create */}
              <div>
                <h3 className="text-emerald-400 font-mono mb-3 flex items-center gap-2">
                  <span className="text-amber-500">03.</span>
                  PREVIEW & CREATE
                </h3>

                <div className="bg-[#0d120d] border border-emerald-900/30 rounded-lg p-4">
                  {selectedIngredients.length >= 2 && resultName && resultEmoji ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Input */}
                        <div className="flex items-center gap-2">
                          {selectedIngredients.map((id, idx) => {
                            const info = getIngredientInfo(id);
                            return (
                              <React.Fragment key={id}>
                                <span className="text-2xl">{info.emoji}</span>
                                {idx < selectedIngredients.length - 1 && (
                                  <span className="text-emerald-700">+</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        <span className="text-emerald-500 text-2xl">→</span>

                        {/* Output */}
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">{resultEmoji}</span>
                          <div>
                            <div className="text-amber-400 font-mono font-bold">{resultName}</div>
                            <div className="text-emerald-700 text-xs">{resultCategory} | Diff {resultDifficulty}</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleCreateRecipe}
                        className="px-6 py-3 bg-emerald-700 hover:bg-emerald-600 text-black font-mono font-bold rounded transition-colors"
                      >
                        ⚡ CREATE RECIPE
                      </button>
                    </div>
                  ) : (
                    <div className="text-center text-emerald-700 font-mono py-4">
                      Select at least 2 ingredients and define name + emoji to preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-[#0d120d] border border-red-900/30 rounded-lg p-6">
                <h3 className="text-red-400 font-mono mb-2 flex items-center gap-2">
                  <span>⚠️</span>
                  DANGER ZONE
                </h3>
                <p className="text-red-700 text-sm font-mono mb-4">
                  These actions are irreversible. Proceed with caution.
                </p>

                {showClearAllConfirm ? (
                  <div className="flex items-center gap-4">
                    <span className="text-red-400 font-mono">
                      Delete ALL {customRecipes.length} custom recipes?
                    </span>
                    <button
                      onClick={() => {
                        onClearAll();
                        setShowClearAllConfirm(false);
                      }}
                      className="px-4 py-2 bg-red-800 border border-red-600 rounded text-white font-mono hover:bg-red-700"
                    >
                      YES, DELETE ALL
                    </button>
                    <button
                      onClick={() => setShowClearAllConfirm(false)}
                      className="px-4 py-2 bg-emerald-900/30 border border-emerald-800 rounded text-emerald-400 font-mono hover:bg-emerald-900/50"
                    >
                      CANCEL
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearAllConfirm(true)}
                    disabled={customRecipes.length === 0}
                    className="px-4 py-2 bg-red-900/30 border border-red-800 rounded text-red-400 font-mono hover:bg-red-900/50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    🗑️ Clear All Custom Recipes ({customRecipes.length})
                  </button>
                )}
              </div>

              <div className="bg-[#0d120d] border border-emerald-900/30 rounded-lg p-6">
                <h3 className="text-emerald-400 font-mono mb-2">📊 STATISTICS</h3>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <div className="text-3xl font-mono text-amber-400">{customRecipes.length}</div>
                    <div className="text-emerald-700 text-sm font-mono">Total Recipes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-mono text-amber-400">
                      {new Set(customRecipes.map(r => r.result.category)).size}
                    </div>
                    <div className="text-emerald-700 text-sm font-mono">Categories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-mono text-amber-400">
                      {new Set(customRecipes.flatMap(r => r.ingredients)).size}
                    </div>
                    <div className="text-emerald-700 text-sm font-mono">Unique Ingredients</div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d120d] border border-emerald-900/30 rounded-lg p-6">
                <h3 className="text-emerald-400 font-mono mb-2">ℹ️ ABOUT</h3>
                <p className="text-emerald-700 text-sm font-mono">
                  Underground Lab v1.0<br />
                  Custom recipes are checked BEFORE the AI generation.<br />
                  Priority: Base Recipes → Custom Recipes → Gemini AI
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#0d120d] border-t border-emerald-900/50 p-3 text-center">
          <span className="text-emerald-800 font-mono text-xs">
            🔒 AUTHORIZED ACCESS ONLY • Press ESC to exit
          </span>
        </div>
      </div>
    </div>
  );
};

export default UndergroundPanel;
