'use client';

import React, { useState } from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';

export type GameStatus = 'idle' | 'mixing' | 'success' | 'failure';

interface MixingBowlProps {
  onDrop: (ingredientId: string) => void;
  items: Ingredient[];
  status: GameStatus;
  onClear: () => void;
  onPlusClick?: () => void;
}

const MixingBowl: React.FC<MixingBowlProps> = ({ onDrop, items, status, onClear, onPlusClick }) => {
  const [isOver, setIsOver] = useState(false);
  const [isJiggling, setIsJiggling] = useState(false);
  const t = useTranslations();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData('ingredientId');
    if (id) {
      onDrop(id);
      setIsJiggling(true);
      setTimeout(() => setIsJiggling(false), 300);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full border-4 transition-all duration-500 flex flex-col items-center justify-center shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]
        ${isOver ? 'border-amber-400 bg-slate-800/80 scale-105 rotate-3' : 'border-slate-800 bg-slate-900/40'}
        ${status === 'mixing' ? 'animate-pulse scale-105 border-amber-500/50' : ''}
        ${status === 'success' ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : ''}
        ${isJiggling ? 'jiggle' : ''}
      `}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-transparent to-black/20 pointer-events-none"></div>

      {items.length === 0 ? (
        <div
          className="text-center text-slate-600 lg:pointer-events-none z-10 cursor-pointer lg:cursor-default"
          onClick={onPlusClick}
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-slate-800/50 mx-auto flex items-center justify-center mb-3 lg:mb-4 active:scale-95 lg:active:scale-100 transition-transform">
            <span className="text-xl lg:text-2xl opacity-40">+</span>
          </div>
          <p className="font-bold text-xs lg:text-xs uppercase tracking-widest">{t('game.dropElement') || 'Drop Element'}</p>
        </div>
      ) : (
        <div className="flex gap-2 sm:gap-3 lg:gap-4 items-center z-10 px-2 sm:px-4">
          {items.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex flex-col items-center animate-in fade-in duration-200">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl shadow-xl mb-1 sm:mb-2 hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-center max-w-[60px] sm:max-w-[70px] lg:max-w-[80px] truncate">{item.name}</span>
            </div>
          ))}
          {items.length === 1 && (
            <div
              className="flex flex-col items-center opacity-40 cursor-pointer lg:cursor-default"
              onClick={onPlusClick}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl border-2 border-dashed border-slate-700 flex items-center justify-center text-lg lg:text-xl text-slate-700 active:scale-95 lg:active:scale-100 transition-transform">
                <span>+</span>
              </div>
              <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-bold text-slate-600 mt-1 sm:mt-2 uppercase">{t('game.next') || 'Next'}</span>
            </div>
          )}
        </div>
      )}

      {items.length > 0 && status === 'idle' && (
        <button
          onClick={onClear}
          className="absolute -bottom-5 lg:-bottom-6 bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-slate-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-widest px-3 lg:px-4 py-1.5 lg:py-2 rounded-full border border-slate-700 transition-all z-20 shadow-lg"
        >
          {t('game.clear') || 'Clear'}
        </button>
      )}

      {status === 'mixing' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 rounded-full z-30 backdrop-blur-md">
           <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
              <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
           </div>
           <p className="mt-3 lg:mt-4 text-[10px] lg:text-xs font-black text-amber-500 uppercase tracking-[0.15em] lg:tracking-[0.2em] animate-pulse">{t('game.forging') || 'Forging...'}</p>
        </div>
      )}
    </div>
  );
};

export default MixingBowl;
