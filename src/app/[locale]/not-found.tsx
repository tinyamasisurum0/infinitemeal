'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

// This fixed approach guarantees consistent state and rendering
export default function LocaleNotFound() {
  // These hooks must be called unconditionally at the top level
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  
  // Only render the component after it has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Content that will be shown based on mounted state
  const content = mounted ? (
    // Actual content with translations
    <>
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">
        {t('errors.pageNotFound')}
      </h2>
      <p className="text-gray-600 mb-8">
        {t('errors.pageNotFoundDescription')}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        {t('navigation.home')}
      </Link>
    </>
  ) : (
    // Loading state without translations
    <>
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <div className="animate-pulse h-6 bg-gray-200 rounded mb-4"></div>
      <div className="animate-pulse h-4 bg-gray-200 rounded mb-8"></div>
      <div className="animate-pulse h-10 w-32 bg-gray-200 rounded-lg mx-auto"></div>
    </>
  );
  
  // The outer container is consistent across all renders
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {content}
      </div>
    </div>
  );
} 