/**
 * DocumentFilesTab Component
 *
 * Manages files linked to a document
 * Features:
 * - Loads files linked to the document
 * - Displays files in a table
 * - Allows linking/unlinking files
 * - Shows file upload modal for new files
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Link2, Unlink, File, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AddFileToDocumentModal } from './AddFileToDocumentModal';
import { documentsApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import type { FileEntity } from '@/types/entities';

interface DocumentFilesTabProps {
  documentId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function DocumentFilesTab({ documentId, onDataChange }: DocumentFilesTabProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response: any = await documentsApi.getFiles(documentId);
      const filesData = response?.data;

      let filesArray: FileEntity[] = [];
      if (Array.isArray(filesData)) {
        filesArray = filesData;
      } else if (filesData && typeof filesData === 'object') {
        filesArray = [filesData as FileEntity];
      }

      setFiles(filesArray);
    } catch (err: any) {
      console.error('[DocumentFilesTab] Error loading files:', err);
      setError(err?.error?.message || t('files.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUnlinkFile = async (fileId: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await documentsApi.unlinkFile(documentId, fileId);

      await loadData();

      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('files.unlinkSuccess'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[DocumentFilesTab] Error unlinking file:', err);
      setError(err?.error?.message || t('files.unlinkFailed'));
    }
  };

  const handleFileClick = (file: FileEntity) => {
    // Navigate to files page with the file ID as a query parameter
    router.push(`/files?fileId=${file.id}`);
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getFileIcon = (mimeType?: string): React.ReactNode => {
    if (!mimeType) return <File className="h-5 w-5 text-gray-400" />;
    if (mimeType.startsWith('image/')) return <File className="h-5 w-5 text-blue-500" />;
    if (mimeType.startsWith('video/')) return <File className="h-5 w-5 text-purple-500" />;
    if (mimeType.includes('pdf')) return <File className="h-5 w-5 text-red-500" />;
    if (mimeType.includes('word') || mimeType.includes('document')) return <File className="h-5 w-5 text-blue-600" />;
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return <File className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Files Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.filename')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.mimeType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.fileSize')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.uploadDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lookup.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {files.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('files.noFilesLinked')}
                  </td>
                </tr>
              ) : (
                files.map((file) => (
                  <tr 
                    key={file.id} 
                    onClick={() => handleFileClick(file)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {file.mime_type || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatFileSize(file.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDateTime(file.upload_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {file.file_path && (
                          <a
                            href={file.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                            title={t('files.openFile')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnlinkFile(file.id);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title={t('files.unlink')}
                        >
                          <Unlink className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add File Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsAddFileModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('files.addFile')}
        </Button>
      </div>

      {/* Add File to Document Modal */}
      <AddFileToDocumentModal
        isOpen={isAddFileModalOpen}
        onClose={() => setIsAddFileModalOpen(false)}
        documentId={documentId}
        onSuccess={async () => {
          await loadData();
          if (onDataChange) {
            await onDataChange();
          }
          setSuccessMessage(t('files.addFileSuccess') || 'File added to document successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
    </div>
  );
}
