/**
 * DocumentsView Component
 * Handles both grid (table) and card view modes for documents
 */

'use client';

import React from 'react';
import { DocumentsTable } from './DocumentsTable';
import { DocumentCard } from './DocumentCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Card } from '@/components/ui/Card';
import type { Document } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import type { ViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';

interface DocumentsViewProps {
  documents: Document[];
  isLoading?: boolean;
  error?: string | null;
  viewMode: ViewMode;
  onDocumentSelect?: (document: Document) => void;
  selectedDocumentId?: number;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  documentTypes?: LookupItem[];
  statuses?: LookupItem[];
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  isLoading = false,
  error = null,
  viewMode,
  onDocumentSelect,
  selectedDocumentId,
  onEdit,
  onDelete,
  documentTypes = [],
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
      <DocumentsTable
        documents={documents}
        isLoading={isLoading}
        error={error}
        onDocumentSelect={onDocumentSelect}
        selectedDocumentId={selectedDocumentId}
        onEdit={onEdit}
        onDelete={onDelete}
        documentTypes={documentTypes}
        statuses={statuses}
      />
    );
  }

  // Card view - responsive grid layout
  return (
    <div>
      {documents.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>{t('lookup.noDataAvailable')}</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              isSelected={selectedDocumentId === document.id}
              onSelect={onDocumentSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              documentTypes={documentTypes}
              statuses={statuses}
            />
          ))}
        </div>
      )}
    </div>
  );
};
