/**
 * Theme Provider - Initializes theme on mount and handles system theme changes
 */

'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setEffectiveTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    const getEffectiveTheme = (): 'light' | 'dark' => {
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme === 'dark' ? 'dark' : 'light';
    };

    // Apply initial theme
    const effectiveTheme = getEffectiveTheme();
    root.classList.remove('light', 'dark');
    root.classList.add(effectiveTheme);
    setEffectiveTheme(effectiveTheme);

    // Listen for system theme changes if theme is 'system'
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        setEffectiveTheme(newTheme);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, setEffectiveTheme]);

  return <>{children}</>;
};

