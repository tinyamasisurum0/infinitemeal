'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'im_theme';

type Theme = 'light' | 'dark';

function systemTheme(): Theme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Switches between light and dark. With no saved choice the page follows the OS;
 * once the visitor picks one it is stored and applied as <html data-theme>.
 */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const t = useTranslations('navigation');
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const saved = document.documentElement.dataset.theme as Theme | undefined;
    setTheme(saved === 'light' || saved === 'dark' ? saved : systemTheme());

    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (!document.documentElement.dataset.theme) setTheme(systemTheme());
    };
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
      // Keep the older recipes page (which reads 'darkMode') in step.
      localStorage.setItem('darkMode', String(next === 'dark'));
    } catch {
      // Storage may be unavailable (private mode); the choice still applies for this visit.
    }
    setTheme(next);
  };

  const label = theme === 'dark' ? t('lightMode') : t('darkMode');

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`w-10 h-10 rounded-full bg-surface text-ink shadow-soft border border-line flex items-center justify-center hover:-translate-y-0.5 active:scale-95 transition-transform ${className}`}
    >
      {/* Render nothing theme-specific until mounted so server and client markup match */}
      <span aria-hidden="true" className="text-base leading-none">
        {theme === null ? '◐' : theme === 'dark' ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
