import { getRequestConfig } from 'next-intl/server';

// Define the supported locales
export const locales = ['en', 'es', 'it', 'fr', 'de', 'nl', 'tr'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Map to full language names for UI
export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  it: 'Italiano',
  fr: 'Français',
  de: 'Deutsch',
  nl: 'Nederlands',
  tr: 'Türkçe'
};

// Map browser language codes to our supported locales
export const browserLocaleMap: Record<string, Locale> = {
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'it': 'it',
  'it-IT': 'it',
  'fr': 'fr',
  'fr-FR': 'fr',
  'de': 'de',
  'de-DE': 'de',
  'nl': 'nl',
  'nl-NL': 'nl',
  'tr': 'tr',
  'tr-TR': 'tr'
};

// Helper function to get locale from browser language
export function getLocaleFromBrowser(browserLanguage: string): Locale {
  // Try exact match first
  if (browserLocaleMap[browserLanguage]) {
    return browserLocaleMap[browserLanguage];
  }
  
  // Try base language match (e.g., 'en' from 'en-CA')
  const baseLanguage = browserLanguage.split('-')[0];
  if (browserLocaleMap[baseLanguage]) {
    return browserLocaleMap[baseLanguage];
  }
  
  return defaultLocale;
}

// Load messages for the requested locale
export default getRequestConfig(async ({ locale }) => {
  try {
    // Validate that the incoming locale parameter is valid
    const typedLocale = locale as Locale;
    
    // Check if locale is valid before attempting to load messages
    if (!locale || !locales.includes(typedLocale)) {
      console.warn(`Invalid locale requested: ${locale}, falling back to ${defaultLocale}`);
      const messages = (await import(`./locales/${defaultLocale}/common.json`)).default;
      return {
        locale: defaultLocale,
        messages,
        timeZone: 'UTC'
      };
    }

    // Load the messages
    const messages = (await import(`./locales/${typedLocale}/common.json`)).default;

    return {
      locale: typedLocale,
      messages,
      timeZone: 'UTC'
    };
  } catch (error) {
    console.error(`Error loading messages for locale: ${locale}`, error);
    // Fallback to English messages
    const messages = (await import('./locales/en/common.json')).default;
    return {
      locale: 'en' as Locale,
      messages,
      timeZone: 'UTC'
    };
  }
}); 