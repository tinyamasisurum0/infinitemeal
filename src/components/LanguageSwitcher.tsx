'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n';
import { withClientTranslations } from './withClientTranslations';

function LanguageSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations('navigation');

  const changeLanguage = (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }
    
    // Create new path with different locale
    let newPath = pathname;
    
    // Handle the case where the current locale is not in the path yet
    if (!pathname.includes(`/${currentLocale}`)) {
      newPath = `/${locale}${pathname === '/' ? '' : pathname}`;
    } else {
      newPath = pathname.replace(`/${currentLocale}`, `/${locale}`);
    }
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="p-3 rounded-full shadow-lg transition-colors bg-blue-900 hover:bg-blue-800 text-white cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('language')}
      >
        🌐
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 overflow-hidden">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {locales.map((locale) => (
              <button
                key={locale}
                className={`w-full text-left px-4 py-2 text-sm ${
                  locale === currentLocale 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                } flex items-center`}
                onClick={() => changeLanguage(locale)}
                disabled={locale === currentLocale}
                role="menuitem"
              >
                {localeNames[locale]}
                {locale === currentLocale && (
                  <svg className="h-4 w-4 ml-auto" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Export the component wrapped with the client translations HOC
export default withClientTranslations(LanguageSwitcher); 