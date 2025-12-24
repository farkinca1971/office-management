/**
 * Theme Store - Zustand store for theme (light/dark mode) state
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const defaultTheme: Theme = 'system';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: defaultTheme,
      effectiveTheme: 'light', // Will be set correctly on mount
      setTheme: (theme: Theme) => {
        const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
        set({ theme, effectiveTheme });
        // Update DOM
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(effectiveTheme);
        }
      },
      setEffectiveTheme: (theme: 'light' | 'dark') => {
        set({ effectiveTheme: theme });
        // Update DOM
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          root.classList.remove('light', 'dark');
          root.classList.add(theme);
        }
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize theme on rehydrate
        if (state && typeof window !== 'undefined') {
          const effectiveTheme = state.theme === 'system' ? getSystemTheme() : state.theme;
          state.setEffectiveTheme(effectiveTheme);
        }
      },
    }
  )
);

