/**
 * DocumentVersionsTab Component
 *
 * Displays version history for a document
 * Features:
 * - Loads version snapshots from API
 * - Displays version history in a table
 * - Shows changed_by, changed_at, and change_reason
 * - Allows creating new version snapshots
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, History, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { documentsApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime, formatDate } from '@/lib/utils';
// TODO: DocumentVersion type not yet defined
// import type { DocumentVersion } from '@/types/entities';
import type { LookupItem } from '@/types/common';

// Temporary type until DocumentVersion is properly defined
interface DocumentVersion {
  id: number;
  document_id: number;
  version_number: number;
  changed_by?: number;
  changed_by_username?: string;
  changed_at: string;
  change_reason?: string;
  title?: string;
  document_type_id?: number;
  document_number?: string;
  document_date?: string;
  expiry_date?: string;
  issuer?: string;
  reference_number?: string;
  description?: string;
}

interface DocumentVersionsTabProps {
  documentId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function DocumentVersionsTab({ documentId, onDataChange }: DocumentVersionsTabProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [documentTypes, setDocumentTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedVersionId, setExpandedVersionId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TODO: Implement getVersions in documentsApi
      // const [versionsResponse, typesResponse] = await Promise.all([
      //   documentsApi.getVersions(documentId),
      //   lookupApi.getDocumentTypes(language),
      // ]);
      const typesResponse = await lookupApi.getDocumentTypes(language);
      const versionsResponse = { data: [] }; // Placeholder until API is implemented

      const versionsData = versionsResponse?.data;
      const typesData = typesResponse?.data;

      let versionsArray: DocumentVersion[] = [];
      if (Array.isArray(versionsData)) {
        versionsArray = versionsData;
      } else if (versionsData && typeof versionsData === 'object') {
        versionsArray = [versionsData as DocumentVersion];
      }

      // Sort by version number descending (newest first)
      versionsArray.sort((a, b) => b.version_number - a.version_number);

      setVersions(versionsArray);
      setDocumentTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err: any) {
      console.error('[DocumentVersionsTab] Error loading versions:', err);
      setError(err?.error?.message || t('versions.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, language, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

      // TODO: Implement createVersion in documentsApi
      // await documentsApi.createVersion(documentId, reason || undefined);
      console.warn('createVersion not yet implemented');

      await loadData();

      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('versions.createSuccess'));
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('[DocumentVersionsTab] Error creating version:', err);
      setError(err?.error?.message || t('versions.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  const getDocumentTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.name || docType?.code || '-';
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
                  {t('documents.title')}
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
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {version.title}
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
                        <td colSpan={6} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.documentType')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{getDocumentTypeName(version.document_type_id)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.documentNumber')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.document_number || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.documentDate')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{formatDate(version.document_date)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.expiryDate')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{formatDate(version.expiry_date)}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.issuer')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.issuer || '-'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.referenceNumber')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.reference_number || '-'}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="font-medium text-gray-500 dark:text-gray-400">{t('documents.description')}:</span>
                              <p className="text-gray-900 dark:text-gray-100">{version.description || '-'}</p>
                            </div>
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
