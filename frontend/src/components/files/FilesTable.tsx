/**
 * FilesTable Component - Display and manage files with sorting/filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle, Edit, Trash2, Save, X, File, ExternalLink } from 'lucide-react';
import type { FileEntity, UpdateFileRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';

export interface FilesTableProps {
  files: FileEntity[];
  isLoading?: boolean;
  error?: string | null;
  onFileSelect?: (file: FileEntity) => void;
  selectedFileId?: number;
  onEdit?: (file: FileEntity) => void;
  onUpdate?: (id: number, data: UpdateFileRequest) => Promise<void>;
  onDelete?: (file: FileEntity) => void;
  statuses?: LookupItem[];
}

type SortField = 'filename' | 'mime_type' | 'file_size' | 'upload_date';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterState {
  filename: string;
  mimeType: string;
  storageType: string;
}

interface EditFormData {
  filename: string;
  original_filename: string;
  file_path: string;
  mime_type: string;
  storage_type: string;
  bucket_name: string;
  storage_key: string;
}

export const FilesTable: React.FC<FilesTableProps> = ({
  files,
  isLoading = false,
  error = null,
  onFileSelect,
  selectedFileId,
  onEdit,
  onUpdate,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const [filters, setFilters] = useState<FilterState>({
    filename: '',
    mimeType: '',
    storageType: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [originalData, setOriginalData] = useState<EditFormData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Start editing a row
  const handleStartEdit = (file: FileEntity) => {
    const formData: EditFormData = {
      filename: file.filename,
      original_filename: file.original_filename || '',
      file_path: file.file_path,
      mime_type: file.mime_type || '',
      storage_type: file.storage_type || '',
      bucket_name: file.bucket_name || '',
      storage_key: file.storage_key || '',
    };
    setEditingId(file.id);
    setEditForm(formData);
    setOriginalData(formData);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setOriginalData(null);
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (!editingId || !editForm || !originalData || !onUpdate || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const updatePayload: UpdateFileRequest = {
        filename_old: originalData.filename,
        filename_new: editForm.filename,
        original_filename_old: originalData.original_filename,
        original_filename_new: editForm.original_filename,
        file_path_old: originalData.file_path,
        file_path_new: editForm.file_path,
        mime_type_old: originalData.mime_type,
        mime_type_new: editForm.mime_type,
        storage_type_old: originalData.storage_type,
        storage_type_new: editForm.storage_type,
        bucket_name_old: originalData.bucket_name,
        bucket_name_new: editForm.bucket_name,
        storage_key_old: originalData.storage_key,
        storage_key_new: editForm.storage_key,
      };
      await onUpdate(editingId, updatePayload);
      // Success - clear editing state
      setEditingId(null);
      setEditForm(null);
      setOriginalData(null);
    } catch (err: any) {
      console.error('Failed to save file changes:', err);
      // Show error to user
      const errorMessage = err?.error?.message || err?.message || t('files.updateFailed') || 'Failed to update file';
      alert(errorMessage);
      // Keep editing state so user can retry
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function
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
    if (!mimeType) return <File className="h-4 w-4 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <File className="h-4 w-4 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <File className="h-4 w-4 text-purple-500" />;
    if (mimeType.includes('pdf')) return <File className="h-4 w-4 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-4 w-4 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <File className="h-4 w-4 text-green-600" />;
    return <File className="h-4 w-4 text-gray-400" />;
  };

  // Sorting logic
  const handleSort = (field: SortField) => {
    setSortState(prev => {
      if (prev.field === field) {
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortState.direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortState.direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Filtering and sorting
  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Apply filters
    if (filters.filename) {
      result = result.filter(f =>
        f.filename.toLowerCase().includes(filters.filename.toLowerCase()) ||
        (f.original_filename || '').toLowerCase().includes(filters.filename.toLowerCase())
      );
    }
    if (filters.mimeType) {
      result = result.filter(f =>
        (f.mime_type || '').toLowerCase().includes(filters.mimeType.toLowerCase())
      );
    }
    if (filters.storageType) {
      result = result.filter(f =>
        (f.storage_type || '').toLowerCase().includes(filters.storageType.toLowerCase())
      );
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof FileEntity;
        const aVal = a[field] || '';
        const bVal = b[field] || '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [files, filters, sortState]);

  const clearFilters = () => {
    setFilters({
      filename: '',
      mimeType: '',
      storageType: '',
    });
  };

  const hasActiveFilters = filters.filename || filters.mimeType || filters.storageType;

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

  return (
    <Card>
      {/* Filter Toggle and Clear */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? t('lookup.hideFilters') : t('lookup.filters')}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <XCircle className="h-4 w-4" />
              {t('lookup.clearFilters')}
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedFiles.length} {filteredAndSortedFiles.length === 1 ? t('lookup.items') : t('lookup.itemsPlural')}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder={`${t('files.filename')}...`}
              value={filters.filename}
              onChange={(e) => setFilters(prev => ({ ...prev, filename: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('files.mimeType')}...`}
              value={filters.mimeType}
              onChange={(e) => setFilters(prev => ({ ...prev, mimeType: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('files.storageType')}...`}
              value={filters.storageType}
              onChange={(e) => setFilters(prev => ({ ...prev, storageType: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('filename')}
              >
                <div className="flex items-center gap-2">
                  {t('files.filename')}
                  {getSortIcon('filename')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('mime_type')}
              >
                <div className="flex items-center gap-2">
                  {t('files.mimeType')}
                  {getSortIcon('mime_type')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('file_size')}
              >
                <div className="flex items-center gap-2">
                  {t('files.fileSize')}
                  {getSortIcon('file_size')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('upload_date')}
              >
                <div className="flex items-center gap-2">
                  {t('files.uploadDate')}
                  {getSortIcon('upload_date')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('files.storageType')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('forms.status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('lookup.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedFiles.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? t('lookup.noResultsMatch') : t('lookup.noDataAvailable')}
                </td>
              </tr>
            ) : (
              filteredAndSortedFiles.map((file) => {
                const isEditing = editingId === file.id;

                return (
                  <tr
                    key={file.id}
                    onClick={() => !isEditing && onFileSelect?.(file)}
                    className={`${!isEditing ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'bg-yellow-50 dark:bg-yellow-900/20'} transition-colors ${
                      selectedFileId === file.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-2 py-2 whitespace-nowrap">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm?.filename || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, filename: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[150px]"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.mime_type)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {file.filename}
                            </div>
                            {file.original_filename && file.original_filename !== file.filename && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {file.original_filename}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {file.mime_type || '-'}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(file.upload_date)}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <select
                          value={editForm?.storage_type || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, storage_type: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                        >
                          <option value="">-</option>
                          <option value="local">Local</option>
                          <option value="s3">S3</option>
                          <option value="azure">Azure</option>
                          <option value="gcs">GCS</option>
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{file.storage_type || '-'}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{getStatusName(file.object_status_id)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                              }}
                              disabled={isSaving}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              title={isSaving ? t('common.saving') || 'Saving...' : t('common.save') || 'Save'}
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {file.file_path && (
                              <a
                                href={file.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Open file"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                            {(onEdit || onUpdate) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(file);
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(file);
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
