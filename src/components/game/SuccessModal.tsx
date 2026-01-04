'use client';

import React from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';

interface SuccessModalProps {
  discovery: Ingredient;
  isNew: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ discovery, isNew, onClose }) => {
  const t = useTranslations();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      {/* Radiance Aura Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className={`bg-slate-900 border-2 w-full max-w-sm rounded-3xl p-8 text-center relative overflow-hidden shadow-2xl animate-in zoom-in duration-300 border-slate-700`}>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-slate-500 to-transparent"></div>

        <div className="flex flex-col items-center gap-3 mb-4">
          {isNew && (
            <span className="bg-amber-500 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
              {t('game.newDiscovery') || 'New Discovery'}
            </span>
          )}
        </div>

        <div className="text-8xl mb-6 transform hover:scale-110 transition-transform cursor-default drop-shadow-2xl relative inline-block">
          {discovery.emoji}
          {isNew && (
            <div className="absolute -inset-4 bg-amber-500/20 blur-2xl rounded-full -z-10 animate-pulse"></div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-slate-100 mb-2">{safeTranslate(t, `ingredients.${discovery.id}`, discovery.name)}</h2>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed italic">
          {safeTranslate(t, `categories.${discovery.category}`, discovery.category)}
        </p>

        <button
          onClick={onClose}
          className="w-full font-bold py-4 rounded-2xl transition-all duration-200 transform active:scale-95 shadow-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
        >
          {t('game.addToCollection') || 'Add to Collection'}
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
