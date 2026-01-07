/**
 * Files List Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Files, StickyNote, History, Upload } from 'lucide-react';
import { FilesView } from '@/components/files/FilesView';
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { Tabs } from '@/components/ui/Tabs';
import FileDocumentsTab from '@/components/files/FileDocumentsTab';
import FileVersionsTab from '@/components/files/FileVersionsTab';
import NotesTab from '@/components/notes/NotesTab';
import AuditsTab from '@/components/audits/AuditsTab';
import { filesApi } from '@/lib/api/files';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { FileEntity, UpdateFileRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';

export default function FilesPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('files-view-mode');

  // Files state
  const [files, setFiles] = useState<FileEntity[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(true);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileEntity | null>(null);

  // Lookup data
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        let statusesRes = await lookupApi.getObjectStatuses(undefined, language);

        // IMPORTANT: n8n sometimes wraps the response in an array
        // If response is an array, take the first element
        if (Array.isArray(statusesRes) && statusesRes.length > 0 && !statusesRes[0]?.id) {
          statusesRes = statusesRes[0];
        }

        // Response structure: { success: true, data: LookupItem[], pagination?: {...} }
        const statusesList = Array.isArray(statusesRes?.data) ? statusesRes.data : [];
        setStatuses(statusesList);
      } catch (err) {
        console.error('Failed to load lookup data:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [language]);

  // Load files
  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setFilesError(null);

    try {
      let response: any = await filesApi.getAll();

      // IMPORTANT: n8n sometimes wraps the response in an array
      // If response is an array, take the first element
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      // Response structure: { success: true, data: FileEntity[], pagination?: {...} }
      const filesData = Array.isArray(response?.data) ? response.data : [];
      setFiles(filesData);
    } catch (err: any) {
      console.error('Failed to load files:', err);
      setFilesError(err?.error?.message || err?.message || t('files.loadFailed'));
    } finally {
      setIsLoadingFiles(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [t]);

  // Auto-select file from URL parameter
  useEffect(() => {
    const fileIdParam = searchParams.get('fileId');
    if (fileIdParam && files.length > 0) {
      const fileId = parseInt(fileIdParam, 10);
      const file = files.find(f => f.id === fileId);
      // Only set if not already selected or if it's a different file
      if (file && (!selectedFile || selectedFile.id !== fileId)) {
        setSelectedFile(file);
      }
    }
  }, [searchParams, files]);

  const handleFileSelect = (file: FileEntity) => {
    setSelectedFile(file);
  };

  const handleEdit = (file: FileEntity) => {
    // TODO: Implement edit functionality
    console.log('Edit file:', file);
  };

  const handleUpdate = async (id: number, data: UpdateFileRequest) => {
    try {
      await filesApi.update(id, data);
      await loadFiles();
    } catch (err: any) {
      console.error('Failed to update file:', err);
      throw err;
    }
  };

  const handleDelete = async (file: FileEntity) => {
    if (confirm(t('files.confirmDelete'))) {
      try {
        await filesApi.delete(file.id);
        if (selectedFile?.id === file.id) {
          setSelectedFile(null);
        }
        await loadFiles();
      } catch (err: any) {
        console.error('Failed to delete file:', err);
        // Show error - file might have only one parent document
        alert(err?.error?.message || t('files.deleteFailed'));
      }
    }
  };

  const handleFileUpload = async (documentId: number, fileId: number) => {
    console.log('File uploaded successfully:', { documentId, fileId });
    setIsModalOpen(false);
    await loadFiles();
  };

  const placeholderContent = (icon: React.ReactNode) => (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      {icon}
      <p className="mt-4">{t('files.selectToViewDetails')}</p>
    </div>
  );

  const tabs = [
    {
      id: 'documents',
      label: t('files.documents'),
      icon: <Files className="h-5 w-5" />,
      content: selectedFile ? (
        <FileDocumentsTab fileId={selectedFile.id} onDataChange={loadFiles} />
      ) : placeholderContent(<Files className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedFile,
    },
    {
      id: 'notes',
      label: t('persons.notes'),
      icon: <StickyNote className="h-5 w-5" />,
      content: selectedFile ? (
        <NotesTab objectId={selectedFile.id} onDataChange={loadFiles} />
      ) : placeholderContent(<StickyNote className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedFile,
    },
    {
      id: 'versions',
      label: t('versions.title'),
      icon: <History className="h-5 w-5" />,
      content: selectedFile ? (
        <FileVersionsTab fileId={selectedFile.id} onDataChange={loadFiles} />
      ) : placeholderContent(<History className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedFile,
    },
    {
      id: 'audits',
      label: t('audits.title'),
      icon: <FileText className="h-5 w-5" />,
      content: selectedFile ? (
        <AuditsTab objectId={selectedFile.id} />
      ) : placeholderContent(<FileText className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedFile,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.files')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('files.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            gridLabel={t('lookup.gridView') || 'Grid View'}
            cardLabel={t('lookup.cardView') || 'Card View'}
          />
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            <Upload className="h-4 w-4" />
            {t('files.addNew')}
          </Button>
        </div>
      </div>

      {/* Files View - Upper Half */}
      <div className="mb-6">
        <FilesView
          files={files}
          isLoading={isLoadingFiles || loadingLookups}
          error={filesError}
          viewMode={viewMode}
          onFileSelect={handleFileSelect}
          selectedFileId={selectedFile?.id}
          onEdit={handleEdit}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          statuses={statuses}
        />
      </div>

      {/* Tabs - Lower Half */}
      <div className="flex-1">
        {!selectedFile ? (
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('files.selectToViewDetails')}
            </p>
          </div>
        ) : (
          <Tabs tabs={tabs} defaultTab="documents" />
        )}
      </div>

      {/* Upload File Modal */}
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFileUpload}
        isSubmitting={isSubmitting}
        objectTypeId={11} // File object type ID
        objectStatusId={1} // Default active status
      />
    </div>
  );
}
