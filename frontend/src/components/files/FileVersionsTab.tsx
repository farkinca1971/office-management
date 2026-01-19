/**
 * FileVersionsTab Component
 *
 * Displays version history for a file
 * Features:
 * - Loads version snapshots from API
 * - Displays version history in a table
 * - Shows changed_by, changed_at, and change_reason
 * - Allows creating new version snapshots
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, History, Eye, File } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { filesApi } from '@/lib/api';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';
import type { FileVersion } from '@/types/entities';

interface FileVersionsTabProps {
  fileId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function FileVersionsTab({ fileId, onDataChange }: FileVersionsTabProps) {
  const { t } = useTranslation();
  const [versions, setVersions] = useState<FileVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const versionsResponse = await filesApi.getVersions(fileId);
      
      // Handle case where response is wrapped in an array (n8n webhook sometimes returns arrays)
      let actualResponse = versionsResponse;
      if (Array.isArray(versionsResponse) && versionsResponse.length > 0) {
        // If response is an array, get the first element
        actualResponse = versionsResponse[0];
      }
      
      // Check if response indicates success
      if (actualResponse && typeof actualResponse === 'object' && 'success' in actualResponse) {
        const response = actualResponse as { success: boolean; data?: any; error?: any };
        if (!response.success) {
          console.error('[FileVersionsTab] API returned error:', response.error);
          setError(response.error?.message || t('versions.loadFailed'));
          setVersions([]);
          return;
        }
      }
      
      // Extract data - handle both direct response and wrapped response
      const versionsData = (actualResponse.success && actualResponse.data) ? actualResponse.data : [];
      
      let versionsArray: FileVersion[] = [];
      if (Array.isArray(versionsData)) {
        versionsArray = versionsData;
      } else if (versionsData && typeof versionsData === 'object') {
        versionsArray = [versionsData as FileVersion];
      }

      // Sort by version number descending (newest first)
      if (versionsArray.length > 0) {
        versionsArray.sort((a, b) => b.version_number - a.version_number);
      }

      setVersions(versionsArray);
    } catch (err: any) {
      console.error('[FileVersionsTab] Error loading versions:', err);
      setError(err?.error?.message || t('versions.loadFailed'));
      setVersions([]); // Clear versions on error
    } finally {
      setIsLoading(false);
    }
  }, [fileId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debug: Log when versions state changes
  useEffect(() => {
    console.log('[FileVersionsTab] Versions state changed:', versions);
    console.log('[FileVersionsTab] Versions length:', versions.length);
  }, [versions]);

  const handleCreateVersion = async () => {
    try {
      setIsCreating(true);
      setError(null);
      setSuccessMessage(null);

      const reason = prompt(t('versions.enterReason'));
      if (reason === null) {
        setIsCreating(false);
        return; // User cancelled
      }

      await filesApi.createVersion(fileId, reason || undefined);

      await loadData();

      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('versions.createSuccess'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[FileVersionsTab] Error creating version:', err);
      setError(err?.error?.message || t('versions.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const toggleExpand = (versionId: number) => {
    setExpandedVersionId(prev => prev === versionId ? null : versionId);
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

      {/* Versions List */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('versions.versionNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.filename')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('files.fileSize')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('versions.changedBy')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('versions.changedAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('versions.changeReason')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lookup.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {versions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('versions.noVersions')}
                  </td>
                </tr>
              ) : (
                versions.map((version) => (
                  <React.Fragment key={version.id}>
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <History className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            v{version.version_number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {version.filename}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatFileSize(version.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {version.changed_by_username || version.changed_by || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {formatDateTime(version.changed_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <span className="line-clamp-1">{version.change_reason || '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(version.id)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title={t('versions.viewDetails')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                    {/* Expanded Details Row */}
                    {expandedVersionId === version.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.originalFilename')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.original_filename || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.mimeType')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.mime_type || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.storageType')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.storage_type || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.checksum')}:</span>
                              <p className="text-gray-900 dark:text-gray-100 font-mono text-xs truncate">{version.checksum || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.filePath')}:</span>
                              <p className="text-gray-900 dark:text-gray-100 truncate">{version.file_path}</p>
                            </div>
                            {version.bucket_name && (
                              <div>
                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.bucketName')}:</span>
                                <p className="text-gray-900 dark:text-gray-100">{version.bucket_name}</p>
                              </div>
                            )}
                            {version.storage_key && (
                              <div>
                                <span className="font-medium text-gray-500 dark:text-gray-400">{t('files.storageKey')}:</span>
                                <p className="text-gray-900 dark:text-gray-100 truncate">{version.storage_key}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Version Button */}
      <div className="border-t pt-4">
        <Button
          variant="secondary"
          onClick={handleCreateVersion}
          disabled={isCreating}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? t('versions.creating') : t('versions.createSnapshot')}
        </Button>
      </div>
    </div>
  );
}
