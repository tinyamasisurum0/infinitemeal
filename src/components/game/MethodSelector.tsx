'use client';

import React from 'react';
import { CookingMethod } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';
import MethodIcon from './MethodIcon';

interface MethodSelectorProps {
  methods: CookingMethod[];
  selected: CookingMethod | null;
  onSelect: (method: CookingMethod) => void;
  disabled?: boolean;
}

/** Cooking methods as pills, styled like the mobile app's filter pills. */
const MethodSelector: React.FC<MethodSelectorProps> = ({ methods, selected, onSelect, disabled }) => {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center w-full">
      <div
        role="radiogroup"
        aria-label={safeTranslate(t, 'cook.cookingMethods', 'Cooking Methods')}
        className="flex flex-wrap justify-center gap-2 px-2"
      >
        {methods.map((method) => {
          const isActive = selected?.id === method.id;
          return (
            <button
              key={method.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={disabled}
              onClick={() => onSelect(method)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
                ${isActive
                  ? 'bg-cobalt border-cobalt text-on-cobalt shadow-soft'
                  : 'bg-surface border-line text-ink hover:border-cobalt/50'}`}
            >
              <MethodIcon id={method.id} fallback={method.emoji} className="w-5 h-5 shrink-0" />
              {safeTranslate(t, `cookingMethods.${method.id}`, method.name)}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-5 px-4">
        {selected && (
          <p key={selected.id} className="text-sm text-muted text-center font-display italic animate-in fade-in">
            {selected.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default MethodSelector;
