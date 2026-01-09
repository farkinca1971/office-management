/**
 * DocumentsTab Component
 *
 * Displays documents related to an object (company, person, etc.)
 * Features:
 * - Loads documents from object relations
 * - Displays documents in a table
 * - Allows navigating to document details
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ExternalLink, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { objectRelationApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';
import AddDocumentRelationModal from './AddDocumentRelationModal';
import type { Document } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface DocumentsTabProps {
  objectId: number;
  onDataChange?: () => void | Promise<void>;
  objectRelationTypeId?: number; // Optional: Filter by specific relation type
}

export default function DocumentsTab({ objectId, onDataChange, objectRelationTypeId }: DocumentsTabProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentTypes, setDocumentTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if objectRelationTypeId is provided (required for the API call)
      if (!objectRelationTypeId) {
        console.warn('[DocumentsTab] objectRelationTypeId is required to load documents');
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      // Get documents using the object relations endpoint
      // API endpoint: GET /api/v1/objects/:id/relations
      // Query params: object_from_id, object_relation_type_id, language_id
      // This endpoint returns documents data directly from object relations
      const documentsResponse = await objectRelationApi.getDocumentsByObjectId(
        objectId,
        objectRelationTypeId
      );

      // Handle n8n array wrapper
      let documentsData: any = documentsResponse;
      if (Array.isArray(documentsResponse) && documentsResponse.length > 0) {
        documentsData = documentsResponse[0];
      }

      // Extract documents from response
      // The response structure may vary:
      // - Array of documents directly: [...]
      // - Object with data property: { data: [...], success: true, ... }
      // - Object with nested structure: { data: { data: [...] } }
      let documents: Document[] = [];
      if (Array.isArray(documentsData)) {
        documents = documentsData;
      } else if (documentsData?.success && documentsData.data) {
        // Check if it has a data property
        if (Array.isArray(documentsData.data)) {
          documents = documentsData.data;
        } else if (documentsData.data.data && Array.isArray(documentsData.data.data)) {
          // Handle nested data structure
          documents = documentsData.data.data;
        }
      }
      
      // Load document types
      try {
        const typesResponse = await lookupApi.getDocumentTypes(language);
        const typesData = typesResponse?.data || typesResponse || [];
        setDocumentTypes(Array.isArray(typesData) ? typesData : []);
      } catch (err) {
        console.error('[DocumentsTab] Error loading document types:', err);
      }

      // Set documents - ensure it's an array
      setDocuments(Array.isArray(documents) ? documents : []);
    } catch (err: any) {
      console.error('[DocumentsTab] Error loading documents:', err);
      setError(err?.error?.message || t('documents.loadFailed'));
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  }, [objectId, objectRelationTypeId, language, t]);

  useEffect(() => {
    if (objectId) {
      loadData();
    }
  }, [loadData, objectId]);

  const getDocumentTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.name || docType?.code || '-';
  };

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

  const handleModalSuccess = async () => {
    await loadData();
    if (onDataChange) {
      await onDataChange();
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* Add Relation Button */}
      {objectRelationTypeId && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {t('documents.addRelation')}
          </Button>
        </div>
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
                    {t('documents.noDocuments')}
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

      {/* Add Document Relation Modal */}
      {objectRelationTypeId && (
        <AddDocumentRelationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          objectId={objectId}
          objectRelationTypeId={objectRelationTypeId}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
}

