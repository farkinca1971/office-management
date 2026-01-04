/**
 * FileFormModal Component - Modal for creating/editing files
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';

export interface FileFormData {
  filename: string;
  original_filename?: string;
  file_path: string;
  mime_type?: string;
  file_size?: number;
  checksum?: string;
  storage_type?: string;
  bucket_name?: string;
  storage_key?: string;
  parent_document_id?: number;
}

interface FileFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FileFormData) => Promise<void>;
  isSubmitting?: boolean;
  initialData?: FileFormData;
  parentDocumentId?: number;
}

export const FileFormModal: React.FC<FileFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  initialData,
  parentDocumentId,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FileFormData>({
    filename: '',
    original_filename: '',
    file_path: '',
    mime_type: '',
    file_size: undefined,
    checksum: '',
    storage_type: 'local',
    bucket_name: '',
    storage_key: '',
    parent_document_id: parentDocumentId,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        filename: '',
        original_filename: '',
        file_path: '',
        mime_type: '',
        file_size: undefined,
        checksum: '',
        storage_type: 'local',
        bucket_name: '',
        storage_key: '',
        parent_document_id: parentDocumentId,
      });
    }
    setError(null);
  }, [initialData, isOpen, parentDocumentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.filename.trim()) {
      setError(t('files.filenameRequired'));
      return;
    }

    if (!formData.file_path.trim()) {
      setError(t('files.filePathRequired'));
      return;
    }

    if (!initialData && !formData.parent_document_id) {
      setError(t('files.parentDocumentRequired'));
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err?.error?.message || t('files.saveFailed'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {initialData ? t('files.editFile') : t('files.addNew')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="p-4 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                  {error}
                </div>
              )}

              {/* Filename */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('files.filename')} *
                </label>
                <Input
                  type="text"
                  value={formData.filename}
                  onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                  placeholder={t('files.filenamePlaceholder')}
                  required
                />
              </div>

              {/* Original Filename */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('files.originalFilename')}
                </label>
                <Input
                  type="text"
                  value={formData.original_filename || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, original_filename: e.target.value }))}
                  placeholder={t('files.originalFilenamePlaceholder')}
                />
              </div>

              {/* File Path */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('files.filePath')} *
                </label>
                <Input
                  type="text"
                  value={formData.file_path}
                  onChange={(e) => setFormData(prev => ({ ...prev, file_path: e.target.value }))}
                  placeholder={t('files.filePathPlaceholder')}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* MIME Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('files.mimeType')}
                  </label>
                  <Input
                    type="text"
                    value={formData.mime_type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, mime_type: e.target.value }))}
                    placeholder="application/pdf"
                  />
                </div>

                {/* File Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('files.fileSize')} ({t('files.bytes')})
                  </label>
                  <Input
                    type="number"
                    value={formData.file_size?.toString() || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, file_size: parseInt(e.target.value) || undefined }))}
                    placeholder="0"
                  />
                </div>

                {/* Storage Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('files.storageType')}
                  </label>
                  <select
                    value={formData.storage_type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, storage_type: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                  >
                    <option value="local">Local</option>
                    <option value="s3">AWS S3</option>
                    <option value="azure">Azure Blob</option>
                    <option value="gcs">Google Cloud Storage</option>
                  </select>
                </div>

                {/* Checksum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('files.checksum')}
                  </label>
                  <Input
                    type="text"
                    value={formData.checksum || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, checksum: e.target.value }))}
                    placeholder="SHA-256 hash"
                  />
                </div>
              </div>

              {/* Cloud Storage Fields */}
              {formData.storage_type && formData.storage_type !== 'local' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('files.bucketName')}
                    </label>
                    <Input
                      type="text"
                      value={formData.bucket_name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, bucket_name: e.target.value }))}
                      placeholder="my-bucket"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('files.storageKey')}
                    </label>
                    <Input
                      type="text"
                      value={formData.storage_key || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, storage_key: e.target.value }))}
                      placeholder="path/to/file.pdf"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                {t('forms.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? t('forms.saving') : (initialData ? t('forms.save') : t('forms.create'))}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
