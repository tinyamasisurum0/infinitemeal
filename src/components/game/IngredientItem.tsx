'use client';

import React from 'react';
import { Ingredient } from '@/types/RecipeTypes';

interface IngredientItemProps {
  ingredient: Ingredient;
  onClick?: () => void;
  compact?: boolean;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ ingredient, onClick, compact = false }) => {
  const onDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('ingredientId', ingredient.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  if (compact) {
    return (
      <div
        draggable
        onDragStart={onDragStart}
        onClick={onClick}
        title={ingredient.name}
        className="bg-slate-800 border border-slate-700 p-1.5 rounded-lg shadow-md cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-all duration-200 flex flex-col items-center justify-center group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform duration-200">
          {ingredient.emoji}
        </span>
        <span className="text-[9px] text-slate-400 truncate w-full text-center leading-tight mt-0.5">
          {ingredient.name}
        </span>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-slate-800 border border-slate-700 p-3 rounded-xl shadow-md cursor-grab active:cursor-grabbing hover:bg-slate-700 transition-all duration-200 flex flex-col items-center justify-center min-w-[100px] h-[100px] group"
    >
      <span className="text-3xl mb-1 group-hover:scale-125 transition-transform duration-200">
        {ingredient.emoji}
      </span>
      <span className="text-sm font-semibold text-slate-200 truncate w-full text-center">
        {ingredient.name}
      </span>
    </div>
  );
};

export default IngredientItem;
