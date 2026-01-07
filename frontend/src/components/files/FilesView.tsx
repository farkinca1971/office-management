/**
 * FilesView Component
 * Handles both grid (table) and card view modes for files
 */

'use client';

import React from 'react';
import { FilesTable } from './FilesTable';
import { FileCard } from './FileCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import type { FileEntity } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import type { ViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';

interface FilesViewProps {
  files: FileEntity[];
  isLoading?: boolean;
  error?: string | null;
  viewMode: ViewMode;
  onFileSelect?: (file: FileEntity) => void;
  selectedFileId?: number;
  onEdit?: (file: FileEntity) => void;
  onUpdate?: (id: number, data: any) => Promise<void>;
  onDelete?: (file: FileEntity) => void;
  statuses?: LookupItem[];
}

export const FilesView: React.FC<FilesViewProps> = ({
  files,
  isLoading = false,
  error = null,
  viewMode,
  onFileSelect,
  selectedFileId,
  onEdit,
  onUpdate,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  // Grid view - use table component
  if (viewMode === 'grid') {
    return (
      <FilesTable
        files={files}
        isLoading={isLoading}
        error={error}
        onFileSelect={onFileSelect}
        selectedFileId={selectedFileId}
        onEdit={onEdit}
        onUpdate={onUpdate}
        onDelete={onDelete}
        statuses={statuses}
      />
    );
  }

  // Card view - responsive grid layout
  return (
    <div>
      {files.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t('lookup.noDataAvailable')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {files.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              isSelected={selectedFileId === file.id}
              onSelect={onFileSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};
