/**
 * useViewMode Hook
 * Manages view mode state (grid/card) with responsive defaults
 */

'use client';

import { useState, useEffect } from 'react';
import { useDefaultViewMode } from './useMediaQuery';

export type ViewMode = 'grid' | 'card';

interface UseViewModeReturn {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isGridView: boolean;
  isCardView: boolean;
}

export function useViewMode(storageKey?: string): UseViewModeReturn {
  const defaultViewMode = useDefaultViewMode();
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultViewMode);
  const [mounted, setMounted] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    setMounted(true);
    if (storageKey && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved === 'grid' || saved === 'card') {
        setViewModeState(saved);
      } else {
        setViewModeState(defaultViewMode);
      }
    } else {
      setViewModeState(defaultViewMode);
    }
  }, [storageKey, defaultViewMode]);

  // Save preference when changed
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, mode);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'card' : 'grid');
  };

  return {
    viewMode: mounted ? viewMode : defaultViewMode,
    setViewMode,
    toggleViewMode,
    isGridView: mounted ? viewMode === 'grid' : defaultViewMode === 'grid',
    isCardView: mounted ? viewMode === 'card' : defaultViewMode === 'card',
  };
}
