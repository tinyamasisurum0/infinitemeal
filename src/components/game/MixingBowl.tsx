'use client';

import React, { useEffect, useId, useState } from 'react';
import { Ingredient } from '@/types/RecipeTypes';
import { useTranslations } from 'next-intl';
import { safeTranslate } from '@/utils/translations';

export type GameStatus = 'idle' | 'mixing' | 'success' | 'failure';

interface MixingBowlProps {
  onDrop: (ingredientId: string) => void;
  items: Ingredient[];
  status: GameStatus;
  onClear: () => void;
  onPlusClick?: () => void;
  /** The pot element, used as the landing point for emojis flying in. */
  potRef?: React.Ref<HTMLDivElement>;
}

const W = 240;
const H = 170;

/**
 * Enamel pot (ported from the mobile app). The lid sits ajar while idle and
 * closes when cooking: the flame lights, steam rises and the pot rattles.
 */
const MixingBowl: React.FC<MixingBowlProps> = ({ onDrop, items, status, onClear, onPlusClick, potRef }) => {
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

        {/* Steam */}
        {[0.3, 0.48, 0.66].map((x, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="pot-steam"
            style={{ left: `${x * 100}%`, animationDelay: `${-(i / 3) * 1.1}s` }}
          />
        ))}

        {/* Flames */}
        <svg className={`${layer} pot-flames`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {defs}
          <g fill={`url(#${flame})`}>
            <path d="M84 168q-6-9 2-17 1 6 5 8 0-8 6-12-1 8 4 12 5 4 1 9z" />
            <path d="M112 168q-7-10 2-20 1 7 6 9 0-9 7-14-1 9 5 14 5 5 0 11z" />
            <path d="M144 168q-6-9 2-17 1 6 5 8 0-8 6-12-1 8 4 12 5 4 1 9z" />
          </g>
        </svg>

        {/* Lid */}
        <svg className={`${layer} pot-lid`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {defs}
          <path d="M38 58Q120 20 202 58Z" fill={`url(#${enamel})`} />
          <rect x={34} y={55} width={172} height={6} rx={3} style={{ fill: 'var(--im-tin)' }} />
          <rect x={113} y={24} width={14} height={10} rx={3} style={{ fill: 'var(--im-brass)' }} />
          <ellipse cx={120} cy={23} rx={12} ry={5} style={{ fill: 'var(--im-brass)' }} />
        </svg>

        {/* Emojis peeking over the rim */}
        <div
          key={bumpKey}
          aria-hidden="true"
          className={`absolute left-[18%] right-[18%] top-[10%] h-[25%] flex justify-center items-end pot-bump transition-opacity duration-300 ${
            cooking ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {items.slice(-7).map((item, i) => (
            <span key={`${item.id}-${i}`} className="text-2xl sm:text-3xl lg:text-[34px] -mx-0.5 drop-shadow-sm">
              {item.emoji}
            </span>
          ))}
        </div>

        {/* Body */}
        <svg className={`${layer} pot-body`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          {defs}
          <path d="M6 84q0-10 12-10h14v9H20q-4 0-4 4t4 4h12v9H18q-12 0-12-10z" style={{ fill: 'var(--im-brass)' }} />
          <path d="M234 84q0-10-12-10h-14v9h12q4 0 4 4t-4 4h-12v9h14q12 0 12-10z" style={{ fill: 'var(--im-brass)' }} />
          <path d="M30 62H210V112Q210 152 170 152H70Q30 152 30 112Z" fill={`url(#${enamel})`} />
          <path d="M30 62H210V74Q120 84 30 74Z" style={{ fill: 'var(--im-pot-lo)' }} opacity={0.35} />
          <rect x={52} y={78} width={10} height={52} rx={5} style={{ fill: 'var(--im-on-pot)' }} opacity={0.16} />
          <rect x={24} y={56} width={192} height={11} rx={5.5} style={{ fill: 'var(--im-tin)' }} />
        </svg>

        {/* Bubbles on the enamel */}
        <div aria-hidden="true" className="absolute left-[30%] right-[30%] top-[62%] h-[20%] pointer-events-none">
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

        {/* Live counter */}
        <div aria-hidden="true" className="absolute inset-x-0 top-[50%] flex flex-col items-center pointer-events-none text-on-pot">
          {count > 0 && (
            <span key={bumpKey} className="font-display text-3xl lg:text-4xl leading-none pot-bump">
              {count}
            </span>
          )}
          <span className={`text-[10px] font-bold tracking-[0.16em] uppercase opacity-85 ${count > 0 ? 'mt-0.5' : 'mt-3'}`}>
            {count > 0 ? ingredientsLabel : emptyLabel}
          </span>
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
