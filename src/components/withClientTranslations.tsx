'use client';

import { ComponentType, useEffect, useState } from 'react';

/**
 * A higher-order component that ensures client components 
 * using translations are only rendered after hydration
 */
export function withClientTranslations<P extends object>(
  Component: ComponentType<P>
) {
  return function WithClientTranslationsWrapper(props: P) {
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setMounted(true);
    }, []);
    
    if (!mounted) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">
            <div className="h-4 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }
    
    return <Component {...props} />;
  };
} 