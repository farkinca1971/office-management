/**
 * FileCard Component - Card view for a single file
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { File, Calendar, HardDrive, ExternalLink, Edit, Trash2 } from 'lucide-react';
import type { FileEntity } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';

interface FileCardProps {
  file: FileEntity;
  isSelected?: boolean;
  onSelect?: (file: FileEntity) => void;
  onEdit?: (file: FileEntity) => void;
  onDelete?: (file: FileEntity) => void;
  statuses?: LookupItem[];
}

export const FileCard: React.FC<FileCardProps> = ({
  file,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();

  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = (mimeType?: string): React.ReactNode => {
    const iconClass = "h-6 w-6";
    if (!mimeType) return <File className={`${iconClass} text-gray-400`} />;
    if (mimeType.startsWith('image/')) return <File className={`${iconClass} text-blue-500`} />;
    if (mimeType.startsWith('video/')) return <File className={`${iconClass} text-purple-500`} />;
    if (mimeType.includes('pdf')) return <File className={`${iconClass} text-red-500`} />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className={`${iconClass} text-blue-600`} />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <File className={`${iconClass} text-green-600`} />;
    return <File className={`${iconClass} text-gray-400`} />;
  };

  const getStorageLabel = (storageType?: string): string => {
    switch (storageType) {
      case 'local': return 'Local';
      case 's3': return 'AWS S3';
      case 'azure': return 'Azure Blob';
      case 'gcs': return 'Google Cloud';
      default: return storageType || 'Unknown';
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20' : ''
      }`}
      onClick={() => onSelect?.(file)}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getFileIcon(file.mime_type)}
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {file.mime_type || t('files.unknownType')}
            </span>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${
            file.is_active
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {getStatusName(file.object_status_id)}
          </span>
        </div>

        {/* Filename */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
          {file.filename}
        </h3>

        {/* Original filename if different */}
        {file.original_filename && file.original_filename !== file.filename && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
            {file.original_filename}
          </p>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <HardDrive className="h-4 w-4" />
            <span>{formatFileSize(file.file_size)}</span>
            {file.storage_type && (
              <span className="text-gray-400">({getStorageLabel(file.storage_type)})</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>{formatDateTime(file.upload_date)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {file.file_path && (
            <a
              href={file.file_path}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
            >
              <ExternalLink className="h-4 w-4" />
              {t('files.openFile')}
            </a>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(file);
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
                  onDelete(file);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
