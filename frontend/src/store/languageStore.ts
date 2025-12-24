/**
 * Language Store - Zustand store for language/i18n state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'hu' | 'de';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

const defaultLanguage: Language = 'en';

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: defaultLanguage,
      setLanguage: (language: Language) => {
        set({ language });
      },
    }),
    {
      name: 'language-storage',
      partialize: (state) => ({
        language: state.language,
      }),
    }
  )
);

