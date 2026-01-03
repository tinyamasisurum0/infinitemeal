import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale, getLocaleFromBrowser } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

// This function handles the root path redirect as a fallback
function rootPathRedirect(request: NextRequest) {
  // If it's the root path with no locale
  if (request.nextUrl.pathname === '/') {
    // Get the preferred language from the browser
    const browserLanguage = request.headers.get('accept-language')?.split(',')[0] || defaultLocale;
    const locale = getLocaleFromBrowser(browserLanguage);
    
    // Create a new URL with the detected locale
    const newUrl = new URL(`/${locale}`, request.url);
    return NextResponse.redirect(newUrl);
  }
  return null;
}

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales,
  
  // The default locale to use when a non-locale-prefixed 
  // path is visited (e.g., /about instead of /en/about)
  defaultLocale,
  
  // If this locale is matched, pathnames work without a prefix
  // (e.g., /about)
  localePrefix: 'always',
  
  // Enable automatic locale detection based on the user's browser language
  localeDetection: true
});

export default function middleware(request: NextRequest) {
  // First check if it's the root path that needs direct handling
  const rootRedirect = rootPathRedirect(request);
  if (rootRedirect) return rootRedirect;
  
  // Otherwise use the next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - files with extensions (e.g., static files)
  // - API routes
  // - _next system paths
  // - admin page
  matcher: ['/((?!api|_next|_vercel|admin|.*\\..*).*)']
}; 