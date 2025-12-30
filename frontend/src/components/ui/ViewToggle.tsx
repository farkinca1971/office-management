/**
 * ViewToggle Component
 * Toggle between grid and card view modes
 */

'use client';

import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { Button } from './Button';
import type { ViewMode } from '@/hooks/useViewMode';

interface ViewToggleProps {
  viewMode: ViewMode;
  onToggle: () => void;
  className?: string;
  gridLabel?: string;
  cardLabel?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onToggle,
  className = '',
  gridLabel = 'Grid View',
  cardLabel = 'Card View',
}) => {
  return (
    <div className={`flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 ${className}`}>
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'ghost'}
        size="sm"
        onClick={viewMode === 'card' ? onToggle : undefined}
        className={`flex items-center gap-2 ${viewMode === 'grid' ? '' : 'text-gray-600 dark:text-gray-400'}`}
        title={gridLabel}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden sm:inline">{gridLabel}</span>
      </Button>
      <Button
        variant={viewMode === 'card' ? 'primary' : 'ghost'}
        size="sm"
        onClick={viewMode === 'grid' ? onToggle : undefined}
        className={`flex items-center gap-2 ${viewMode === 'card' ? '' : 'text-gray-600 dark:text-gray-400'}`}
        title={cardLabel}
      >
        <LayoutList className="h-4 w-4" />
        <span className="hidden sm:inline">{cardLabel}</span>
      </Button>
    </div>
  );
};
