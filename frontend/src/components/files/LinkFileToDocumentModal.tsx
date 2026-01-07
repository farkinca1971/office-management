/**
 * LinkFileToDocumentModal Component
 * Modal for linking a file to an existing document
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/lib/i18n';
import { documentsApi } from '@/lib/api/documents';
import { formatDate } from '@/lib/utils';
import type { Document } from '@/types/entities';

interface LinkFileToDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: number;
  onSuccess?: () => void | Promise<void>;
}

export const LinkFileToDocumentModal: React.FC<LinkFileToDocumentModalProps> = ({
  isOpen,
  onClose,
  fileId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      setSelectedDocument(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      let response: any = await documentsApi.getAll({ is_active: 1 });

      // IMPORTANT: n8n sometimes wraps the response in an array
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      if (response.success && response.data) {
        const documentsList = Array.isArray(response.data) ? response.data : [];
        setDocuments(documentsList);
      } else {
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err?.error?.message || t('files.fetchDocumentsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedDocument) {
      setError(t('files.selectDocument') || 'Please select a document');
      return;
    }

    setIsLinking(true);
    setError(null);

    try {
      await documentsApi.linkFile(selectedDocument.id, fileId);

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (err: any) {
      console.error('Failed to link file to document:', err);
      
      // Handle CORS errors gracefully
      const errorCode = err?.error?.code || '';
      const errorMessage = err?.error?.message || err?.message || '';
      
      if (errorCode === 'NETWORK_ERROR' || 
          errorMessage.includes('CORS') || 
          errorMessage.includes('preflight') ||
          errorMessage.includes('blocked by CORS')) {
        // CORS error - operation may have succeeded on server
        console.warn('CORS error when linking file - operation may have succeeded on server:', err);
        // Still show success since the link might have been created
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      } else {
        setError(err?.error?.message || err?.message || t('files.linkFileFailed'));
      }
    } finally {
      setIsLinking(false);
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('files.linkToDocument')}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              disabled={isLinking}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                {t('files.noDocumentsAvailable')}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('files.selectDocumentToLink') || 'Select a document to link this file to:'}
                </p>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {documents.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`w-full p-4 border rounded-lg transition-colors text-left ${
                        selectedDocument?.id === doc.id
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-primary-500'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {doc.title}
                          </h4>
                          {doc.document_number && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('files.documentNumber')}: {doc.document_number}
                            </p>
                          )}
                          {doc.document_date && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {t('files.documentDate')}: {formatDate(doc.document_date)}
                            </p>
                          )}
                        </div>
                        <FileText className="h-5 w-5 text-primary-500" />
                      </div>
                    </button>
                  ))}
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
              disabled={isLinking}
            >
              {t('forms.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleLink}
              disabled={!selectedDocument || isLinking || loading}
            >
              {isLinking ? t('forms.saving') : t('files.link') || 'Link'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

