'use client';

import React, { useMemo, useState } from 'react';
import { Ingredient, Achievement } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { BASIC_STARTER_INGREDIENTS } from '@/data/ingredients';
import { recipes } from '@/data/recipes';

interface DiscoveryHistoryItem {
  ingredients: string[];
  method: string;
  result: Ingredient;
  isNewDiscovery: boolean;
}

interface DiscoveryBookProps {
  ingredients: Ingredient[];
  history: DiscoveryHistoryItem[];
  achievements: Achievement[];
  onIngredientClick?: (ingredientId: string) => void;
}

const DiscoveryBook: React.FC<DiscoveryBookProps> = ({ ingredients, history, achievements, onIngredientClick }) => {
  const t = useTranslations();
  const [showUndiscovered, setShowUndiscovered] = useState(false);
  const [activeView, setActiveView] = useState<'discoveries' | 'achievements'>('discoveries');

  // Achievement stats
  const achievedCount = useMemo(() =>
    achievements.filter(a => a.achieved).length,
    [achievements]
  );

  // Get recipe for an ingredient
  const getRecipeFor = (ingredientId: string) => {
    const recipe = recipes.find(r => r.result === ingredientId);
    if (!recipe) return null;
    return recipe.ingredients.map(id => {
      const ing = ingredients.find(i => i.id === id);
      return ing ? { id, name: ing.name, emoji: ing.emoji } : { id, name: id, emoji: '?' };
    });
  };

  // Filter out base ingredients from encyclopedia
  const nonBaseIngredients = useMemo(() =>
    ingredients.filter(i => !BASIC_STARTER_INGREDIENTS.includes(i.id)),
    [ingredients]
  );

  const discoveredNonBaseIngredients = useMemo(() =>
    nonBaseIngredients.filter(i => i.discovered),
    [nonBaseIngredients]
  );

  const undiscoveredNonBaseIngredients = useMemo(() =>
    nonBaseIngredients.filter(i => !i.discovered),
    [nonBaseIngredients]
  );

  return (
    <div className="h-full bg-slate-900 border-l border-slate-800 flex flex-col">
      {/* Tab Header */}
      <div className="border-b border-slate-800">
        <div className="flex">
          <button
            onClick={() => setActiveView('discoveries')}
            className={`flex-1 py-3 px-4 transition-all flex flex-col items-center gap-1 ${
              activeView === 'discoveries'
                ? 'text-amber-500 border-b-2 border-amber-500 bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <span className="text-2xl">📖</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('game.almanac') || 'Almanac'}
            </span>
          </button>
          <button
            onClick={() => setActiveView('achievements')}
            className={`flex-1 py-3 px-4 transition-all flex flex-col items-center gap-1 relative ${
              activeView === 'achievements'
                ? 'text-amber-500 border-b-2 border-amber-500 bg-slate-800/50'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
            }`}
          >
            <span className="text-2xl">🏆</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {t('achievements.title') || 'Achievements'}
            </span>
            {achievedCount > 0 && (
              <span className="absolute top-2 right-2 text-[9px] bg-amber-500 text-slate-900 w-5 h-5 flex items-center justify-center rounded-full font-bold">
                {achievedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Discoveries View */}
        {activeView === 'discoveries' && (
          <>
            <section>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">
                {t('game.latestBreakthroughs') || 'Latest Breakthroughs'}
              </h3>
              {history.length === 0 ? (
                <p className="text-slate-600 text-sm italic">{t('game.noDiscoveries') || 'No discoveries yet. Start mixing!'}</p>
              ) : (
                <div className="space-y-3">
                  {[...history].reverse().slice(0, 15).map((discovery, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('ingredientId', discovery.result.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onIngredientClick?.(discovery.result.id)}
                      className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50 flex flex-col gap-2 group transition-all cursor-grab active:cursor-grabbing hover:border-amber-500/50 hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{discovery.result.emoji}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold">{discovery.result.name}</p>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[10px] text-slate-500">
                              {discovery.ingredients.join(' + ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {t('game.encyclopedia') || 'Encyclopedia'}
                </h3>
                <button
                  onClick={() => setShowUndiscovered(!showUndiscovered)}
                  className={`text-[10px] px-2 py-1 rounded-full transition-all ${
                    showUndiscovered
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {showUndiscovered ? '👁️' : '👁️‍🗨️'} {undiscoveredNonBaseIngredients.length}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {/* Discovered items with recipes */}
                {discoveredNonBaseIngredients.map((ing) => {
                  const recipe = getRecipeFor(ing.id);
                  return (
                    <div
                      key={ing.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('ingredientId', ing.id);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onClick={() => onIngredientClick?.(ing.id)}
                      className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800 transition-all group cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{ing.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-200">{ing.name}</p>
                          {recipe && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500">
                              {recipe.map((item, idx) => (
                                <span key={item.id} className="flex items-center">
                                  <span title={item.name}>{item.emoji}</span>
                                  {idx < recipe.length - 1 && <span className="mx-1 text-slate-600">+</span>}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Undiscovered items (when toggle is on) */}
                {showUndiscovered && undiscoveredNonBaseIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    className="p-3 rounded-lg bg-slate-800/20 border border-dashed border-slate-700/50 hover:border-amber-500/30 transition-all group opacity-60 hover:opacity-80"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl grayscale opacity-40 group-hover:opacity-60 transition-opacity">
                        {ing.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-500 group-hover:text-slate-400">{ing.name}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">???</p>
                      </div>
                      <span className="text-slate-600">🔒</span>
                    </div>
                  </div>
                ))}
              </div>

              {discoveredNonBaseIngredients.length === 0 && !showUndiscovered && (
                <p className="text-slate-600 text-sm italic mt-2">{t('game.noDiscoveries') || 'No discoveries yet. Start mixing!'}</p>
              )}

              {/* Progress indicator */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-slate-600">
                  {discoveredNonBaseIngredients.length} / {nonBaseIngredients.length}
                </p>
                <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${(discoveredNonBaseIngredients.length / nonBaseIngredients.length) * 100}%` }}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {/* Achievements View */}
        {activeView === 'achievements' && (
          <>
            {/* Progress overview */}
            <section>
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-300">{t('achievements.progress') || 'Progress'}</span>
                  <span className="text-amber-500 font-bold">{achievedCount} / {achievements.length}</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${(achievedCount / achievements.length) * 100}%` }}
                  />
                </div>
              </div>
            </section>

            {/* Achievement list */}
            <section className="space-y-2">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-3 rounded-lg border transition-all ${
                    achievement.achieved
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-slate-800/30 border-slate-700/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${
                      achievement.achieved
                        ? 'bg-amber-500/20'
                        : 'bg-slate-700/50'
                    }`}>
                      {achievement.achieved ? '🏆' : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${
                        achievement.achieved ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {t(`achievements.${achievement.id}`) || achievement.name}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {t(`achievements.descriptions.${achievement.id}`) || achievement.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscoveryBook;
