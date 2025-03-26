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