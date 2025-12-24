/**
 * i18n utilities and translation hook
 */

import { useLanguageStore } from '@/store/languageStore';
import { en } from './translations/en';
import { hu } from './translations/hu';
import { de } from './translations/de';

const translations = {
  en,
  hu,
  de,
};

export type TranslationKey = keyof typeof en;

/**
 * Get translation for a nested key (e.g., 'auth.login')
 */
export function getTranslation(
  language: 'en' | 'hu' | 'de',
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k as keyof typeof value];
    } else {
      console.warn(`Translation key not found: ${key} for language ${language}`);
      // Fallback to English
      value = translations.en;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey as keyof typeof value];
        } else {
          return key; // Return key if translation not found
        }
      }
      return key;
    }
  }

  return typeof value === 'string' ? value : key;
}

/**
 * Hook to use translations in components
 */
export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = (key: string): string => {
    return getTranslation(language, key);
  };

  return { t, language };
}

/**
 * Get all available languages
 */
export const languages = [
  { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  { code: 'hu' as const, name: 'Magyar', flag: '🇭🇺' },
  { code: 'de' as const, name: 'Deutsch', flag: '🇩🇪' },
] as const;

