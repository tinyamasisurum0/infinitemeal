/**
 * Safe translation helper that returns fallback for missing keys
 * Useful for AI-generated ingredients that don't have translations
 */
export function safeTranslate(
  t: (key: string) => string,
  key: string,
  fallback: string
): string {
  try {
    const result = t(key);
    // next-intl returns the key itself if not found in some configs
    if (result === key || result.startsWith('MISSING_MESSAGE')) {
      return fallback;
    }
    return result;
  } catch {
    return fallback;
  }
}
