'use client';

import { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

interface IntlClientProviderProps {
  locale: string;
  messages: Record<string, unknown>;
  children: ReactNode;
}

export default function IntlClientProvider({
  locale,
  messages,
  children
}: IntlClientProviderProps) {
  // Keep this simple - the client components themselves will handle
  // their own mounting state through withClientTranslations HOC
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 