'use client';

import React, { useEffect, useRef } from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';

interface SuccessModalProps {
  discovery: Ingredient;
  isNew: boolean;
  onClose: () => void;
}

/** Result card: a bottom sheet on phones, a centred card on larger screens. */
const SuccessModal: React.FC<SuccessModalProps> = ({ discovery, isNew, onClose }) => {
  const t = useTranslations();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const isCustomOrAI = discovery.id.startsWith('ai_') || discovery.id.startsWith('custom_');
  const displayName = isCustomOrAI
    ? discovery.name
    : safeTranslate(t, `ingredients.${discovery.id}`, discovery.name);

  useEffect(() => {
    buttonRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-[#0C1322]/55 backdrop-blur-sm backdrop-in sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discovery-title"
        onClick={(e) => e.stopPropagation()}
        className="sheet-up w-full sm:max-w-sm bg-surface text-ink rounded-t-[28px] sm:rounded-[28px] px-6 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:p-8 text-center shadow-lift relative overflow-hidden"
      >
        {/* Grab handle (phones) */}
        <div aria-hidden="true" className="sm:hidden mx-auto mb-5 h-1 w-10 rounded-full bg-line" />

        <div className="flex justify-center mb-4 min-h-6">
          {isNew ? (
            <span className="rounded-full bg-have-soft text-have px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              {safeTranslate(t, 'game.newDiscovery', 'New Discovery')}
            </span>
          ) : (
            <span className="rounded-full bg-sunk text-muted px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]">
              {safeTranslate(t, `categories.${discovery.category}`, discovery.category)}
            </span>
          )}
        </div>

        <div className="relative mx-auto mb-5 w-28 h-28 sm:w-32 sm:h-32">
          {isNew && (
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full animate-pulse"
              style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--im-brass) 30%, transparent), transparent 70%)' }}
            />
          )}
          <div className="relative w-full h-full rounded-full bg-tint flex items-center justify-center text-6xl sm:text-7xl animate-in zoom-in">
            <span aria-hidden="true">{discovery.emoji}</span>
          </div>
        </div>

        <h2 id="discovery-title" className="font-display font-medium text-3xl leading-tight mb-2">
          {displayName}
        </h2>
        {discovery.description && (
          <p className="text-muted text-[15px] leading-relaxed mb-2">{discovery.description}</p>
        )}
        {isNew && (
          <p className="text-muted text-xs mb-1">
            {safeTranslate(t, `categories.${discovery.category}`, discovery.category)}
          </p>
        )}

        <button
          ref={buttonRef}
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl bg-cta text-on-cta py-3.5 px-5 shadow-soft font-display italic font-medium text-xl active:scale-[0.985] hover:brightness-110 transition-all"
        >
          {safeTranslate(t, 'game.addToCollection', 'Add to Collection')}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
