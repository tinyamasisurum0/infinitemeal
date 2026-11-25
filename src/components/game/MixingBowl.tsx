'use client';

import React, { useEffect, useId, useState } from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';
import { getVessel } from './vessels';

export type GameStatus = 'idle' | 'mixing' | 'success' | 'failure';

interface MixingBowlProps {
  onDrop: (ingredientId: string) => void;
  items: Ingredient[];
  status: GameStatus;
  onClear: () => void;
  onPlusClick?: () => void;
  /** The pot element, used as the landing point for emojis flying in. */
  potRef?: React.Ref<HTMLDivElement>;
  /** Selected cooking method: picks the vessel (bowl, pan, oven…). */
  methodId?: string;
}

const W = 240;
const H = 170;

/**
 * The cooking vessel, drawn in the enamel style ported from the mobile app.
 * It changes with the selected method (bowl, pot, pan, oven, griddle, board,
 * blender) and animates while cooking: lid closes, flames, steam, stirring,
 * chopping or whirling, depending on the vessel.
 */
const MixingBowl: React.FC<MixingBowlProps> = ({ onDrop, items, status, onClear, onPlusClick, potRef, methodId = 'boil' }) => {
  const [isOver, setIsOver] = useState(false);
  const [bumpKey, setBumpKey] = useState(0);
  const t = useTranslations();
  const uid = useId().replace(/:/g, '');
  const enamel = `enamel-${uid}`;
  const flame = `flame-${uid}`;

  const cooking = status === 'mixing';
  const count = items.length;

  // Pot "bumps" every time an ingredient lands.
  useEffect(() => {
    if (count > 0) setBumpKey((k) => k + 1);
  }, [count]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const id = e.dataTransfer.getData('ingredientId');
    if (id) onDrop(id);
  };

  const nameOf = (item: Ingredient) =>
    item.id.startsWith('ai_') || item.id.startsWith('custom_')
      ? item.name
      : safeTranslate(t, `ingredients.${item.id}`, item.name);

  const ingredientsLabel = safeTranslate(t, 'cook.ingredients', 'Ingredients');
  const emptyLabel = safeTranslate(t, 'game.dropElement', 'Drop Element');

  const defs = (
    <defs>
      <linearGradient id={enamel} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style={{ stopColor: 'var(--im-pot-lo)' }} />
        <stop offset="0.22" style={{ stopColor: 'var(--im-pot)' }} />
        <stop offset="0.36" style={{ stopColor: 'var(--im-pot-hi)' }} />
        <stop offset="0.55" style={{ stopColor: 'var(--im-pot)' }} />
        <stop offset="1" style={{ stopColor: 'var(--im-pot-lo)' }} />
      </linearGradient>
      <linearGradient id={flame} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" style={{ stopColor: 'var(--im-cobalt)' }} />
        <stop offset="1" style={{ stopColor: 'var(--im-brass)' }} />
      </linearGradient>
    </defs>
  );

  const layer = 'absolute inset-0 w-full h-full';
  const vessel = getVessel(methodId, enamel);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={potRef}
        role="button"
        tabIndex={0}
        aria-label={count > 0 ? `${count} ${ingredientsLabel}: ${items.map(nameOf).join(', ')}` : emptyLabel}
        onClick={count === 0 ? onPlusClick : undefined}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && count === 0) {
            e.preventDefault();
            onPlusClick?.();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsOver(false)}
        onDrop={handleDrop}
        data-cooking={cooking}
        data-method={methodId}
        data-filled={count > 0}
        data-over={isOver}
        key={status === 'failure' ? 'fail' : 'ok'}
        className={`pot relative select-none w-60 sm:w-72 lg:w-80 aspect-[240/170] outline-none rounded-3xl
          ${count === 0 ? 'cursor-pointer lg:cursor-default' : ''}
          ${status === 'failure' ? 'shake' : ''}`}
      >
        {/* Drop halo */}
        <div
          aria-hidden="true"
          className={`absolute -inset-4 rounded-full transition-opacity duration-300 pointer-events-none ${
            isOver ? 'opacity-100' : status === 'success' ? 'opacity-70' : 'opacity-0'
          }`}
          style={{ background: 'radial-gradient(circle at 50% 60%, color-mix(in srgb, var(--im-pot-hi) 35%, transparent), transparent 65%)' }}
        />

        {/* Vessel for the selected method; swaps with a small pop */}
        <div key={methodId} className="absolute inset-0 vessel-swap">
          {/* Steam / heat */}
          {vessel.steam?.xs.map((x, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="pot-steam"
              style={{ left: `${x * 100}%`, top: vessel.steam!.top, animationDelay: `${-(i / 3) * 1.1}s` }}
            />
          ))}

          {/* Flames */}
          {vessel.flames && (
            <svg className={`${layer} pot-flames`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {defs}
              <g fill={`url(#${flame})`} transform={`translate(0 ${-vessel.flames.shift})`}>
                <path d="M84 168q-6-9 2-17 1 6 5 8 0-8 6-12-1 8 4 12 5 4 1 9z" />
                <path d="M112 168q-7-10 2-20 1 7 6 9 0-9 7-14-1 9 5 14 5 5 0 11z" />
                <path d="M144 168q-6-9 2-17 1 6 5 8 0-8 6-12-1 8 4 12 5 4 1 9z" />
              </g>
            </svg>
          )}

          {vessel.back && (
            <svg className={`${layer} pot-body`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {defs}
              {vessel.back}
            </svg>
          )}

          {vessel.toolBack && (
            <svg className={`${layer} ${vessel.toolBack.className}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {defs}
              {vessel.toolBack.node}
            </svg>
          )}

          {/* Ingredients in the vessel */}
          <div
            aria-hidden="true"
            className={`absolute flex justify-center transition-opacity duration-300 ${
              vessel.emojis.align === 'end' ? 'items-end' : 'items-center'
            } ${cooking && vessel.emojis.hideWhenCooking ? 'opacity-0' : 'opacity-100'}`}
            style={{ left: vessel.emojis.left, right: vessel.emojis.right, top: vessel.emojis.top, height: vessel.emojis.height }}
          >
            <div
              key={bumpKey}
              className={`flex items-end pot-bump ${cooking && vessel.emojis.cookingClass ? vessel.emojis.cookingClass : ''}`}
            >
              {items.slice(-7).map((item, i) => (
                <span
                  key={`${item.id}-${i}`}
                  className="emoji-item text-2xl sm:text-3xl lg:text-[34px] -mx-0.5 drop-shadow-sm"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {item.emoji}
                </span>
              ))}
            </div>
          </div>

          {vessel.front && (
            <svg className={`${layer} pot-body`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {defs}
              {vessel.front}
            </svg>
          )}

          {vessel.toolFront && (
            <svg className={`${layer} ${vessel.toolFront.className}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
              {defs}
              {vessel.toolFront.node}
            </svg>
          )}

          {/* Bubbles on the enamel */}
          {vessel.bubbles && (
            <div
              aria-hidden="true"
              className="absolute pointer-events-none"
              style={{ left: vessel.bubbles.left, right: vessel.bubbles.right, top: vessel.bubbles.top, height: vessel.bubbles.height }}
            >
              {[
                { l: '8%', s: 6, d: 0 },
                { l: '38%', s: 8, d: 0.8 },
                { l: '64%', s: 5, d: 1.5 },
                { l: '86%', s: 7, d: 0.4 },
              ].map((b, i) => (
                <span
                  key={i}
                  className="pot-bubble"
                  style={{ left: b.l, width: b.s, height: b.s, animationDelay: `${b.d}s` }}
                />
              ))}
            </div>
          )}

          {/* Live counter */}
          <div
            aria-hidden="true"
            className={`absolute flex items-center pointer-events-none -translate-x-1/2 whitespace-nowrap ${
              vessel.label.ink ? 'text-[#14203A]' : 'text-on-pot'
            } ${vessel.label.compact ? 'flex-row gap-1.5' : 'flex-col'}`}
            style={{ top: vessel.label.top, left: vessel.label.center ?? '50%' }}
          >
            {count > 0 && (
              <span
                key={bumpKey}
                className={`font-display leading-none pot-bump ${vessel.label.compact ? 'text-lg lg:text-xl' : 'text-3xl lg:text-4xl'}`}
              >
                {count}
              </span>
            )}
            <span
              className={`text-[10px] font-bold tracking-[0.16em] uppercase opacity-85 ${
                vessel.label.compact ? '' : count > 0 ? 'mt-0.5' : 'mt-3'
              }`}
            >
              {count > 0 ? ingredientsLabel : emptyLabel}
            </span>
          </div>
        </div>
      </div>

      {/* What's in the pot */}
      <div className="mt-4 min-h-10 flex flex-wrap items-center justify-center gap-2 px-2" aria-live="polite">
        {count === 0 ? (
          <p className="text-sm text-muted text-center max-w-xs">
            {safeTranslate(t, 'cook.dragIngredientToStart', 'Drag an ingredient here to start cooking')}
          </p>
        ) : (
          <>
            {items.map((item, idx) => (
              <span
                key={`${item.id}-${idx}`}
                className="animate-in slide-in-from-bottom-2 inline-flex items-center gap-1.5 rounded-full bg-surface border border-line shadow-soft pl-2 pr-3 py-1 text-sm font-semibold text-ink"
              >
                <span aria-hidden="true">{item.emoji}</span>
                {nameOf(item)}
              </span>
            ))}
            {status === 'idle' && (
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted hover:text-miss hover:bg-miss-soft transition-colors"
              >
                {safeTranslate(t, 'game.clear', 'Clear')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MixingBowl;
