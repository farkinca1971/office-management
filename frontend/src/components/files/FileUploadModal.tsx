/**
 * FileUploadModal Component - Two-step modal for uploading files
 *
 * Step 1: Choose document attachment method
 *   - Attach to existing document (shows document list)
 *   - Create new document (shows document form)
 *
 * Step 2: Choose file source
 *   - Upload new file (file picker)
 *   - Use existing unattached file (shows file list from n8n)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, Plus, Link as LinkIcon, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTranslation } from '@/lib/i18n';
import { documentsApi } from '@/lib/api/documents';
import { filesApi } from '@/lib/api/files';
import { lookupApi } from '@/lib/api';
import type { Document, FileEntity } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { formatDate } from '@/lib/utils';

type Step = 'document-choice' | 'existing-document' | 'new-document' | 'file-choice' | 'upload-file' | 'select-file';

interface DocumentFormData {
  title: string;
  document_type_id?: number;
  document_date?: string;
  document_number?: string;
  expiry_date?: string;
}

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (documentId: number, fileId: number) => Promise<void>;
  isSubmitting?: boolean;
  objectTypeId: number;
  objectStatusId: number;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  objectTypeId,
  objectStatusId,
}) => {
  const { t } = useTranslation();

  // State
  const [step, setStep] = useState<Step>('document-choice');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocumentData, setNewDocumentData] = useState<DocumentFormData>({
    title: '',
    document_type_id: undefined,
    document_date: '',
    document_number: '',
    expiry_date: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedExistingFile, setSelectedExistingFile] = useState<FileEntity | null>(null);

  // Data fetching state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [unattachedFiles, setUnattachedFiles] = useState<FileEntity[]>([]);
  const [documentTypes, setDocumentTypes] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('document-choice');
      setSelectedDocument(null);
      setNewDocumentData({
        title: '',
        document_type_id: undefined,
        document_date: '',
        document_number: '',
        expiry_date: '',
      });
      setUploadedFile(null);
      setSelectedExistingFile(null);
      setError(null);
    }
  }, [isOpen]);

  // Fetch documents when needed
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
        console.log('Documents loaded:', documentsList.length);
      } else {
        console.warn('No documents in response:', response);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch documents:', err);
      setError(err?.error?.message || t('files.fetchDocumentsFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch unattached files when needed
  const fetchUnattachedFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      let response: any = await filesApi.getUnattachedFiles();

      // IMPORTANT: n8n sometimes wraps the response in an array
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      if (response.success && response.data) {
        const filesList = Array.isArray(response.data) ? response.data : [];
        setUnattachedFiles(filesList);
        console.log('Unattached files loaded:', filesList.length);
      } else {
        console.warn('No unattached files in response:', response);
        setUnattachedFiles([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch unattached files:', err);
      setError(err?.error?.message || t('files.fetchUnattachedFilesFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch document types when needed
  const fetchDocumentTypes = async () => {
    try {
      const response = await lookupApi.getDocumentTypes();
      if (response.success && response.data) {
        setDocumentTypes(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch document types:', err);
    }
  };

  // Handle step navigation
  const goToExistingDocument = () => {
    fetchDocuments();
    setStep('existing-document');
  };

  const goToNewDocument = () => {
    fetchDocumentTypes();
    setStep('new-document');
  };

  const goToFileChoice = () => {
    setStep('file-choice');
  };

  const goToUploadFile = () => {
    setStep('upload-file');
  };

  const goToSelectFile = () => {
    fetchUnattachedFiles();
    setStep('select-file');
  };

  const goBack = () => {
    if (step === 'existing-document' || step === 'new-document') {
      setStep('document-choice');
    } else if (step === 'upload-file' || step === 'select-file') {
      setStep('file-choice');
    } else if (step === 'file-choice') {
      if (selectedDocument) {
        setStep('existing-document');
      } else {
        setStep('new-document');
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Handle final submission
  const handleFinalSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      let documentId: number;
      let fileId: number;

      // Step 1: Get or create document
      if (selectedDocument) {
        documentId = selectedDocument.id;
      } else {
        // Create new document
        const docResponse = await documentsApi.create({
          object_type_id: objectTypeId,
          object_status_id: objectStatusId,
          title: newDocumentData.title,
          document_type_id: newDocumentData.document_type_id,
          document_date: newDocumentData.document_date,
          document_number: newDocumentData.document_number,
          expiry_date: newDocumentData.expiry_date,
        });

        if (!docResponse.success || !docResponse.data) {
          throw new Error(t('files.createDocumentFailed'));
        }

        documentId = docResponse.data.id;
      }

      // Step 2: Get or upload file
      if (selectedExistingFile) {
        fileId = selectedExistingFile.id;
      } else if (uploadedFile) {
        // Upload new file
        const fileResponse = await filesApi.uploadPhysicalFile(uploadedFile, documentId);

        if (!fileResponse.success || !fileResponse.data) {
          throw new Error(t('files.uploadFileFailed'));
        }

        fileId = fileResponse.data.id;
      } else {
        throw new Error(t('files.noFileSelected'));
      }

      // Step 3: Link file to document
      await documentsApi.linkFile(documentId, fileId);

      // Success
      await onSubmit(documentId, fileId);
      onClose();
    } catch (err: any) {
      setError(err?.error?.message || err.message || t('files.uploadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const canSubmit =
    (step === 'upload-file' && uploadedFile !== null) ||
    (step === 'select-file' && selectedExistingFile !== null);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              {step !== 'document-choice' && (
                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 mr-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              <Upload className="h-5 w-5 text-primary-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {t('files.uploadFile')}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Step 1a: Document Choice */}
            {step === 'document-choice' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.chooseDocumentOption')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={goToExistingDocument}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <LinkIcon className="h-8 w-8 text-primary-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('files.attachToExisting')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('files.attachToExistingDesc')}
                    </p>
                  </button>

                  <button
                    onClick={goToNewDocument}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <Plus className="h-8 w-8 text-primary-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('files.createNewDocument')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('files.createNewDocumentDesc')}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 1b: Select Existing Document */}
            {step === 'existing-document' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.selectExistingDocument')}
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('common.loading')}
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('files.noDocumentsAvailable')}
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocument(doc);
                          goToFileChoice();
                        }}
                        className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors text-left"
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
                )}
              </div>
            )}

            {/* Step 1c: Create New Document */}
            {step === 'new-document' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.createNewDocument')}
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('documents.title')} *
                  </label>
                  <Input
                    type="text"
                    value={newDocumentData.title}
                    onChange={(e) => setNewDocumentData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={t('documents.titlePlaceholder')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('documents.documentType')}
                    </label>
                    <select
                      value={newDocumentData.document_type_id || ''}
                      onChange={(e) => setNewDocumentData(prev => ({
                        ...prev,
                        document_type_id: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100"
                    >
                      <option value="">{t('files.selectType')}</option>
                      {documentTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('documents.documentNumber')}
                    </label>
                    <Input
                      type="text"
                      value={newDocumentData.document_number || ''}
                      onChange={(e) => setNewDocumentData(prev => ({ ...prev, document_number: e.target.value }))}
                      placeholder={t('documents.documentNumberPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('documents.documentDate')}
                    </label>
                    <Input
                      type="date"
                      value={newDocumentData.document_date || ''}
                      onChange={(e) => setNewDocumentData(prev => ({ ...prev, document_date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('documents.expiryDate')}
                    </label>
                    <Input
                      type="date"
                      value={newDocumentData.expiry_date || ''}
                      onChange={(e) => setNewDocumentData(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="primary"
                    onClick={goToFileChoice}
                    disabled={!newDocumentData.title.trim()}
                  >
                    {t('common.next')}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2a: File Choice */}
            {step === 'file-choice' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.chooseFileSource')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={goToUploadFile}
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
                    onClick={goToSelectFile}
                    className="p-6 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
                  >
                    <FileText className="h-8 w-8 text-primary-500 mb-3" />
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {t('files.useExistingFile')}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('files.useExistingFileDesc')}
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2b: Upload File */}
            {step === 'upload-file' && (
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

            {/* Step 2c: Select Existing File */}
            {step === 'select-file' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {t('files.selectExistingFile')}
                </h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('common.loading')}
                  </div>
                ) : unattachedFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('files.noUnattachedFiles')}
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
              disabled={loading}
            >
              {t('forms.cancel')}
            </Button>
            {canSubmit && (
              <Button
                type="button"
                variant="primary"
                onClick={handleFinalSubmit}
                disabled={loading || isSubmitting}
              >
                {loading || isSubmitting ? t('forms.saving') : t('files.complete')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
