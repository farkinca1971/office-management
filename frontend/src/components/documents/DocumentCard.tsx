/**
 * DocumentCard Component - Card view for a single document
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FileText, Calendar, Building2, Hash, Edit, Trash2 } from 'lucide-react';
import type { Document } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';

interface DocumentCardProps {
  document: Document;
  isSelected?: boolean;
  onSelect?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  documentTypes?: LookupItem[];
  statuses?: LookupItem[];
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  documentTypes = [],
  statuses = [],
}) => {
  const { t } = useTranslation();

  const getDocumentTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.name || docType?.code || '-';
  };

  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={() => onSelect?.(document)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-500" />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {getDocumentTypeName(document.document_type_id)}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            document.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {getStatusName(document.object_status_id)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
          {document.title}
        </h3>

        {/* Description */}
        {document.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {document.description}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm">
          {document.document_number && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Hash className="h-4 w-4" />
              <span>{document.document_number}</span>
            </div>
          )}
          {document.issuer && (
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Building2 className="h-4 w-4" />
              <span>{document.issuer}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {formatDate(document.document_date)}
              {document.expiry_date && (
                <span className="text-gray-400"> - {formatDate(document.expiry_date)}</span>
              )}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(document);
                }}
                className="text-primary-600 hover:text-primary-700"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(document);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
