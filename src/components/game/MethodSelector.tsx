'use client';

import React from 'react';
import { CookingMethod } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';

interface MethodSelectorProps {
  methods: CookingMethod[];
  selected: CookingMethod | null;
  onSelect: (method: CookingMethod) => void;
  disabled?: boolean;
}

const MethodSelector: React.FC<MethodSelectorProps> = ({ methods, selected, onSelect, disabled }) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-wrap justify-center gap-3">
        {methods.map((method) => {
          const isActive = selected?.id === method.id;
          return (
            <button
              key={method.id}
              disabled={disabled}
              onClick={() => onSelect(method)}
              className={`
                group relative flex flex-col items-center justify-center w-20 h-20 rounded-2xl border transition-all duration-300
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isActive
                  ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)] scale-110 z-10'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'}
              `}
            >
              <span className={`text-2xl mb-1 transition-transform group-hover:scale-110 ${isActive ? '' : 'opacity-60'}`}>
                {method.emoji}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-amber-500' : 'text-slate-600'}`}>
                {safeTranslate(t, `cookingMethods.${method.id}`, method.name)}
              </span>

              {isActive && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-[20px]">
        {selected && (
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-[0.2em] animate-in fade-in duration-300">
            {selected.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MethodSelector;
