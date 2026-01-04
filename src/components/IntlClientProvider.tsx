'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider, IntlErrorCode } from 'next-intl';

interface IntlClientProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

// Handle missing translation errors gracefully (for AI-generated content)
function onError(error: { code: string }) {
  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    // Silently ignore missing messages - we'll use fallback
    return;
  }
  console.error(error);
}

// Return a readable fallback for missing translations
function getMessageFallback({ key, namespace }: { key: string; namespace?: string }) {
  // For AI-generated ingredients, convert "ai_shepherd_s_pie" to "Shepherd's Pie"
  const fullKey = namespace ? `${namespace}.${key}` : key;
  const lastPart = fullKey.split('.').pop() || key;

  // Convert snake_case to Title Case and handle AI prefix
  return lastPart
    .replace(/^ai_/, '')
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function IntlClientProvider({
  locale,
  messages,
  children
}: IntlClientProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={onError}
      getMessageFallback={getMessageFallback}
    >
      {children}
    </NextIntlClientProvider>
  );
} 