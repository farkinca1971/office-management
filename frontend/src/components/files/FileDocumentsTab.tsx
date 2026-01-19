/**
 * FileDocumentsTab Component
 *
 * Manages parent documents for a file
 * Features:
 * - Loads parent documents from API
 * - Displays documents in a table
 * - Shows warning if only one parent (cannot remove)
 * - Allows adding more parent documents
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Calendar, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { LinkFileToDocumentModal } from './LinkFileToDocumentModal';
import { filesApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import type { Document } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface FileDocumentsTabProps {
  fileId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function FileDocumentsTab({ fileId, onDataChange }: FileDocumentsTabProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert language code to language ID (en=1, de=2, hu=3)
      const languageMap: Record<string, number> = { en: 1, de: 2, hu: 3 };
      const languageId = languageMap[language] || 1;

      const [docsResponse, typesResponse] = await Promise.all([
        filesApi.getDocuments(fileId, language, languageId),
        lookupApi.getDocumentTypes(language),
      ]);

      const docsData = (docsResponse.success && docsResponse.data) ? docsResponse.data : [];
      const typesData = typesResponse?.data;

      let docsArray: Document[] = [];
      if (Array.isArray(docsData)) {
        docsArray = docsData;
      } else if (docsData && typeof docsData === 'object') {
        docsArray = [docsData as Document];
      }

      setDocuments(docsArray);
      setDocumentTypes(Array.isArray(typesData) ? typesData : []);
    } catch (err: any) {
      console.error('[FileDocumentsTab] Error loading documents:', err);
      setError(err?.error?.message || t('documents.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [fileId, language, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getDocumentTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.name || docType?.code || '-';
  };

  // Check if we can remove documents (need more than one)
  const canRemoveDocuments = documents.length > 1;

  const handleDocumentClick = (document: Document) => {
    // Navigate to documents page with the document ID as a query parameter
    router.push(`/documents?documentId=${document.id}`);
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

      {/* Warning for single parent */}
      {!canRemoveDocuments && documents.length > 0 && (
        <Alert variant="warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{t('files.singleParentWarning')}</span>
          </div>
        </Alert>
      )}

      {/* Documents Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.documentType')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.documentNumber')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('documents.documentDate')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('lookup.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('files.noParentDocuments')}
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr 
                    key={doc.id} 
                    onClick={() => handleDocumentClick(doc)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-primary-500" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {doc.title}
                          </div>
                          {doc.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {getDocumentTypeName(doc.document_type_id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {doc.document_number || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(doc.document_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        href={`/documents?documentId=${doc.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        title={t('documents.viewDocument')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Info about parent count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('files.parentDocumentCount')}: {documents.length}
      </div>

      {/* Link to Document Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsLinkModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('files.linkToDocument')}
        </Button>
      </div>

      {/* Link File to Document Modal */}
      <LinkFileToDocumentModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        fileId={fileId}
        onSuccess={async () => {
          await loadData();
          if (onDataChange) {
            await onDataChange();
          }
          setSuccessMessage(t('files.linkSuccess') || 'File linked to document successfully');
          setTimeout(() => setSuccessMessage(null), 3000);
        }}
      />
    </div>
  );
}
