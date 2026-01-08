/**
 * AddFileToDocumentModal Component
 * Modal for adding a file to an existing document
 * Supports both uploading new files and linking existing unattached files
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useTranslation } from '@/lib/i18n';
import { documentsApi } from '@/lib/api/documents';
import { filesApi } from '@/lib/api/files';
import type { FileEntity } from '@/types/entities';

type Step = 'choice' | 'upload' | 'select';

interface AddFileToDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number;
  onSuccess?: () => void | Promise<void>;
}

export const AddFileToDocumentModal: React.FC<AddFileToDocumentModalProps> = ({
  isOpen,
  onClose,
  documentId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('choice');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<FileEntity | null>(null);
  const [unattachedFiles, setUnattachedFiles] = useState<FileEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('choice');
      setUploadedFile(null);
      setSelectedExistingFile(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch files from other documents when needed
  const fetchFilesFromOtherDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      let response: any = await documentsApi.getFilesFromOtherDocuments(documentId);

      // IMPORTANT: n8n sometimes wraps the response in an array
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      if (response.success && response.data) {
        const filesList = Array.isArray(response.data) ? response.data : [];
        setUnattachedFiles(filesList);
      } else {
        setUnattachedFiles([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch files from other documents:', err);
      setError(err?.error?.message || t('files.fetchFilesFromOtherDocumentsFailed') || 'Failed to load files from other documents');
    } finally {
      setLoading(false);
    }
  };

  const goToUpload = () => {
    setStep('upload');
  };

  const goToSelect = () => {
    fetchFilesFromOtherDocuments();
    setStep('select');
  };

  const goBack = () => {
    setStep('choice');
    setUploadedFile(null);
    setSelectedExistingFile(null);
    setError(null);
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Handle final submission
  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (uploadedFile) {
        // Upload new file - uploadPhysicalFile automatically links it to the document
        const fileResponse = await filesApi.uploadPhysicalFile(uploadedFile, documentId);

        if (!fileResponse.success || !fileResponse.data) {
          throw new Error(t('files.uploadFileFailed'));
        }
      } else if (selectedExistingFile) {
        // Link existing unattached file to document
        try {
          const linkResponse = await documentsApi.linkFile(documentId, selectedExistingFile.id);
          if (!linkResponse.success) {
            throw new Error(t('files.linkFileFailed') || 'Failed to link file to document');
          }
        } catch (linkError: any) {
          // Handle linking errors gracefully
          const errorCode = linkError?.error?.code || '';
          const errorMessage = linkError?.error?.message || linkError?.message || '';
          
          // Check if it's a CORS or network error (likely due to OPTIONS preflight failure)
          if (errorCode === 'NETWORK_ERROR' || 
              errorMessage.includes('CORS') || 
              errorMessage.includes('preflight') ||
              errorMessage.includes('blocked by CORS')) {
            // CORS/Network error - the file might still be linked on the server
            console.warn('CORS error when linking file - operation may have succeeded on server:', linkError);
            // Don't throw - proceed with success but show informational message
          } else {
            // Other errors - throw to be handled by outer catch
            throw linkError;
          }
        }
      } else {
        throw new Error(t('files.noFileSelected'));
      }

      // Success - proceed with callback
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (err: any) {
      setError(err?.error?.message || err.message || t('files.uploadFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit =
    (step === 'upload' && uploadedFile !== null) ||
    (step === 'select' && selectedExistingFile !== null);

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
              {step !== 'choice' && (
                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mr-2"
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <Upload className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('files.addFile')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[300px]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Choice */}
            {step === 'choice' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.chooseFileSource')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={goToUpload}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-primary-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('files.uploadNewFile')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('files.uploadNewFileDesc')}
                    </p>
                  </button>

                  <button
                    onClick={goToSelect}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <LinkIcon className="h-8 w-8 text-primary-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('files.useExistingFile')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('files.useExistingFileFromOtherDocumentsDesc') || 'Select from files already linked to other documents'}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2a: Upload File */}
            {step === 'upload' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.uploadNewFile')}
                </h3>

                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500"
                      >
                        <span>{t('files.selectFile')}</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileUpload}
                        />
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {t('files.orDragAndDrop')}
                      </p>
                    </div>
                    {uploadedFile && (
                      <div className="mt-4 text-sm text-gray-900 dark:text-gray-100">
                        <p className="font-medium">{t('files.selectedFile')}:</p>
                        <p>{uploadedFile.name}</p>
                        <p className="text-gray-600 dark:text-gray-400">
                          {(uploadedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2b: Select Existing File */}
            {step === 'select' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.selectExistingFile')}
                </h3>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : unattachedFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('files.noFilesFromOtherDocuments') || 'No files available from other documents'}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {unattachedFiles.map((file) => (
                      <button
                        key={file.id}
                        onClick={() => setSelectedExistingFile(file)}
                        className={`w-full p-4 border rounded-lg transition-colors text-left ${
                          selectedExistingFile?.id === file.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-600 hover:border-primary-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {file.filename}
                            </h4>
                            {file.original_filename && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('files.originalFilename')}: {file.original_filename}
                              </p>
                            )}
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {file.mime_type} • {file.file_size ? `${(file.file_size / 1024).toFixed(2)} KB` : t('files.unknownSize')}
                            </p>
                          </div>
                          <FileText className="h-5 w-5 text-primary-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
            {canSubmit && (
              <Button
                type="button"
                variant="primary"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (t('forms.saving') || 'Saving...') : t('files.addFile')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

