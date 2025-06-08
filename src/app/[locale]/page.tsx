'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import AdvancedRecipeCrafting from '@/components/AdvancedRecipeCrafting';
import { withClientTranslations } from '@/components/withClientTranslations';
import Link from 'next/link';
import { useParams } from 'next/navigation';

function Home() {
  const t = useTranslations();
  const [darkMode, setDarkMode] = useState(false);
  const params = useParams();
  const locale = params.locale as string;
  
  // Initialize dark mode from localStorage or system preferences
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    } else {
      // Check if user prefers dark mode
      const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDarkMode);
    }
  }, []);
  
  // Use useCallback to prevent unnecessary re-renders
  const handleDarkModeChange = useCallback((isDarkMode: boolean) => {
    setDarkMode(isDarkMode);
  }, []);
  
  return (
    <main className={`min-h-screen p-0 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'} font-fredoka transition-colors duration-300`}>
      
      <AdvancedRecipeCrafting 
        onDarkModeChange={handleDarkModeChange} 
        initialDarkMode={darkMode}
      />
      
      <footer className={`mt-6 text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm w-full transition-colors duration-300`}>
        <p>{t('cook.subtitle')}</p>
        <p className="mt-2">© {new Date().getFullYear()} {t('app.title')}</p>
        <p className="mt-2 pb-8">
          <Link href={`/${locale}/about`} className="underline hover:text-blue-600 transition-colors duration-300">
            {t('navigation.about')}
          </Link>
        </p>
      </footer>
    </main>
  );
}

// Export the component wrapped with the client translations HOC
export default withClientTranslations(Home); 