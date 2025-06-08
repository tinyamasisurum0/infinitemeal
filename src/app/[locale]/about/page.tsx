'use client';

import { useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const AboutPage = () => {
  const aboutT = useTranslations('about');
  const navT = useTranslations('navigation');
  const params = useParams();
  const locale = params.locale as string;
  const [darkMode, setDarkMode] = useState(false);
  
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

  return (
    <main className={`min-h-screen p-8 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-b from-blue-50 to-white text-gray-800'} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto">
        <h1 className={`text-4xl font-bold mb-8 tracking-[-1.5px] ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>
          {aboutT('title')}
        </h1>
        
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-8 mb-8 transition-colors duration-300`}>
          <p className="text-xl font-medium mb-6 leading-relaxed">
            {aboutT('description')}
          </p>
          
          <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {aboutT('game_title')}
          </h2>
          <p className={`mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {aboutT('game_description')}
          </p>
          
          <h2 className={`text-2xl font-semibold mb-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
            {aboutT('team_title')}
          </h2>
          <p className={`mb-6 leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {aboutT('team_description')}
          </p>
        </div>
        
        <div className="text-center">
          <Link 
            href={`/${locale}`} 
            className={`px-6 py-3 rounded-full font-semibold ${
              darkMode 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            } transition-colors duration-300`}
          >
            {navT('home')}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AboutPage; 