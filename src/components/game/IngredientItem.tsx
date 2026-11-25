'use client';

import React from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';

interface IngredientItemProps {
  ingredient: Ingredient;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  compact?: boolean;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, onClick, compact = false }) => {
  const t = useTranslations();

  // For AI/custom recipes, use name directly. For built-in ingredients, use translation.
  const isCustomOrAI = ingredient.id.startsWith('ai_') || ingredient.id.startsWith('custom_');
  const ingredientName = isCustomOrAI
    ? ingredient.name
    : safeTranslate(t, `ingredients.${ingredient.id}`, ingredient.name);
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ingredientId', ingredient.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (compact) {
    return (
      <button
        type="button"
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
        title={ingredientName}
        aria-label={ingredientName}
        className="bg-surface border border-line p-1 sm:p-1.5 rounded-xl shadow-soft cursor-grab active:cursor-grabbing hover:border-cobalt/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex flex-col items-center justify-center group"
      >
        <span className="text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200">
          {ingredient.emoji}
        </span>
        <span className="text-[8px] sm:text-[9px] text-muted truncate w-full text-center leading-tight mt-0.5">
          {ingredientName}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-surface border border-line p-2 sm:p-3 rounded-2xl shadow-soft cursor-grab active:cursor-grabbing hover:border-cobalt/40 hover:-translate-y-0.5 hover:shadow-lift active:scale-95 transition-all duration-200 flex flex-col items-center justify-center min-w-[70px] h-[76px] sm:min-w-[85px] sm:h-[88px] lg:min-w-[100px] lg:h-[100px] group"
    >
      <span
        aria-hidden="true"
        className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-tint flex items-center justify-center text-xl sm:text-2xl lg:text-[26px] mb-1 group-hover:scale-110 transition-transform duration-200"
      >
        {ingredient.emoji}
      </span>
      <span className="text-[11px] sm:text-xs lg:text-[13px] font-semibold text-ink truncate w-full text-center">
        {ingredientName}
      </span>
    </button>
  );
};

export default IngredientItem;
