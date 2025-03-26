import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';
import { NextRequest, NextResponse } from 'next/server';

// This function handles the root path redirect as a fallback
function rootPathRedirect(request: NextRequest) {
  // If it's the root path with no locale
  if (request.nextUrl.pathname === '/') {
    // Create a new URL with the default locale
    const newUrl = new URL(`/${defaultLocale}`, request.url);
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
  
  // Force default locale to always have a prefix
  // This ensures that the middleware always handles the root path
  localeDetection: false
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
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 