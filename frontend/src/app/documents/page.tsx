/**
 * Documents List Page
 */

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Files, Network, CreditCard, StickyNote } from 'lucide-react';
import { DocumentsView } from '@/components/documents/DocumentsView';
import { DocumentFormModal, DocumentFormData } from '@/components/documents/DocumentFormModal';
import { Tabs } from '@/components/ui/Tabs';
import DocumentFilesTab from '@/components/documents/DocumentFilesTab';
import IdentificationsTab from '@/components/identifications/IdentificationsTab';
import NotesTab from '@/components/notes/NotesTab';
import AuditsTab from '@/components/audits/AuditsTab';
import ObjectRelationsTable from '@/components/relations/ObjectRelationsTable';
import AddRelationModal from '@/components/relations/AddRelationModal';
import { documentsApi } from '@/lib/api/documents';
import { lookupApi } from '@/lib/api/lookups';
import { objectRelationApi } from '@/lib/api/objectRelations';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Document, UpdateDocumentRequest, ObjectRelation, CreateObjectRelationRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('documents-view-mode');

  // Documents state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  // Lookup data for documents view
  const [documentTypes, setDocumentTypes] = useState<LookupItem[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [objectRelationTypes, setObjectRelationTypes] = useState<LookupItem[]>([]);
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Relations state
  const [relations, setRelations] = useState<ObjectRelation[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(false);
  const [relationsError, setRelationsError] = useState<string | null>(null);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Audit tab reload trigger
  const [auditReloadTrigger, setAuditReloadTrigger] = useState(0);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        // First, load object types to find the document object type ID
        const objectTypesRes = await lookupApi.getObjectTypes(language);
        let objectTypesData = objectTypesRes;

        // IMPORTANT: n8n sometimes wraps the response in an array
        if (Array.isArray(objectTypesRes) && objectTypesRes.length > 0 && !objectTypesRes[0]?.id) {
          objectTypesData = objectTypesRes[0];
        }

        const objectTypesList = Array.isArray(objectTypesData?.data) ? objectTypesData.data : [];
        const documentObjectType = objectTypesList.find(ot => ot.code === 'document');
        const documentObjectTypeId = documentObjectType?.id;

        // Load document types, statuses, and relation types
        let [typesRes, statusesRes, relationTypesRes] = await Promise.all([
          lookupApi.getDocumentTypes(language),
          lookupApi.getObjectStatuses(documentObjectTypeId, language),
          lookupApi.getObjectRelationTypes(language),
        ]);

        // IMPORTANT: n8n sometimes wraps the response in an array
        // If response is an array, take the first element
        if (Array.isArray(typesRes) && typesRes.length > 0 && !typesRes[0]?.id) {
          typesRes = typesRes[0];
        }
        if (Array.isArray(statusesRes) && statusesRes.length > 0 && !statusesRes[0]?.id) {
          statusesRes = statusesRes[0];
        }
        if (Array.isArray(relationTypesRes) && relationTypesRes.length > 0) {
          relationTypesRes = relationTypesRes[0];
        }

        // Response structure: { success: true, data: LookupItem[], pagination?: {...} }
        const typesList = Array.isArray(typesRes?.data) ? typesRes.data : [];
        const statusesList = Array.isArray(statusesRes?.data) ? statusesRes.data : [];
        const relationTypesList = Array.isArray(relationTypesRes?.data) ? relationTypesRes.data : [];

        setDocumentTypes(typesList);
        setStatuses(statusesList);
        setObjectRelationTypes(relationTypesList);
        setObjectTypes(objectTypesList);
      } catch (err) {
        console.error('Failed to load lookup data:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [language]);

  // Load documents
  const loadDocuments = async () => {
    setIsLoadingDocuments(true);
    setDocumentsError(null);

    try {
      let response: any = await documentsApi.getAll();

      // IMPORTANT: n8n sometimes wraps the response in an array
      // If response is an array, take the first element
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      // Response structure: { success: true, data: Document[], pagination?: {...} }
      const documentsData = Array.isArray(response?.data) ? response.data : [];
      setDocuments(documentsData);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
      setDocumentsError(err?.error?.message || err?.message || t('documents.loadFailed'));
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [t]);

  // Auto-select document from URL parameter (supports both ?id= and ?documentId=)
  useEffect(() => {
    const idParam = searchParams.get('id') || searchParams.get('documentId');
    if (idParam && documents.length > 0 && !isLoadingDocuments) {
      const documentId = parseInt(idParam, 10);
      if (!isNaN(documentId)) {
        const document = documents.find(d => d.id === documentId);
        // Only set if not already selected or if it's a different document
        if (document && (!selectedDocument || selectedDocument.id !== documentId)) {
          setSelectedDocument(document);
        }
      }
    }
  }, [searchParams, documents, isLoadingDocuments, selectedDocument]);

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleEdit = (document: Document) => {
    // TODO: Implement edit functionality
    console.log('Edit document:', document);
  };

  const handleUpdate = async (id: number, data: UpdateDocumentRequest) => {
    try {
      await documentsApi.update(id, data);
      await loadDocuments();
      // Update selected document if it's the one being edited
      if (selectedDocument && selectedDocument.id === id) {
        // Reload the selected document to get latest data
        try {
          const updatedDoc = await documentsApi.getById(id);
          if (updatedDoc.success && updatedDoc.data) {
            setSelectedDocument(updatedDoc.data);
          }
        } catch (err) {
          console.error('Failed to reload selected document:', err);
        }
      }
      // Reload audit tab after successful update
      setAuditReloadTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error('Failed to update document:', err);
      throw err;
    }
  };

  const handleDelete = async (document: Document) => {
    if (confirm(t('documents.confirmDelete'))) {
      try {
        await documentsApi.delete(document.id);
        if (selectedDocument?.id === document.id) {
          setSelectedDocument(null);
        }
        await loadDocuments();
      } catch (err: any) {
        console.error('Failed to delete document:', err);
      }
    }
  };

  const handleCreateDocument = async (formData: DocumentFormData) => {
    setIsSubmitting(true);
    try {
      // Get document object type ID from lookups
      const objectTypesRes = await lookupApi.getObjectTypes(language);
      let objectTypesData = objectTypesRes;

      // IMPORTANT: n8n sometimes wraps the response in an array
      if (Array.isArray(objectTypesRes) && objectTypesRes.length > 0 && !objectTypesRes[0]?.id) {
        objectTypesData = objectTypesRes[0];
      }

      const objectTypesList = Array.isArray(objectTypesData?.data) ? objectTypesData.data : [];
      const documentObjectType = objectTypesList.find(ot => ot.code === 'document');
      const documentObjectTypeId = documentObjectType?.id;

      if (!documentObjectTypeId) {
        throw new Error('Document object type not found');
      }

      if (!formData.object_status_id) {
        throw new Error('Status is required');
      }

      await documentsApi.create({
        object_type_id: documentObjectTypeId,
        object_status_id: formData.object_status_id,
        title: formData.title,
        document_type_id: formData.document_type_id,
        document_date: formData.document_date,
        document_number: formData.document_number,
        expiry_date: formData.expiry_date,
      });

      setIsModalOpen(false);
      await loadDocuments();
    } catch (err: any) {
      console.error('Failed to create document:', err);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load relations for selected object
  const loadRelations = useCallback(async (objectId: number) => {
    setIsLoadingRelations(true);
    setRelationsError(null);

    try {
      let response = await objectRelationApi.getByObjectId(objectId);

      // Handle n8n array wrapping
      if (Array.isArray(response) && response.length > 0) {
        response = response[0];
      }

      const relationsData = Array.isArray(response?.data) ? response.data : [];
      setRelations(relationsData);
    } catch (err: any) {
      console.error('Failed to load relations:', err);
      setRelationsError(err?.error?.message || err?.message || 'Failed to load relations');
    } finally {
      setIsLoadingRelations(false);
    }
  }, []);

  // Track the current active tab
  const [activeTab, setActiveTab] = useState<string>('files');

  // Handle tab change - load relations when Relations tab is clicked
  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);

    if (!selectedDocument) return;

    // Load relations when Relations tab is clicked
    if (tabId === 'relations') {
      loadRelations(selectedDocument.id);
    }
  }, [selectedDocument, loadRelations]);

  // Reset active tab and load relations when document changes
  useEffect(() => {
    // Reset to files tab when document changes
    setActiveTab('files');
    // Clear relations for the new document
    setRelations([]);
  }, [selectedDocument?.id]);

  // Relations CRUD handlers
  const handleCreateRelation = async (data: {
    object_relation_type_id: number;
    object_to_id: number;
    note?: string;
  }) => {
    if (!selectedDocument) return;

    try {
      // Add object_from_id from selected document
      const createData: CreateObjectRelationRequest = {
        object_from_id: selectedDocument.id,
        object_relation_type_id: data.object_relation_type_id,
        object_to_id: data.object_to_id,
        note: data.note,
      };
      await objectRelationApi.create(createData);
      await loadRelations(selectedDocument.id);
      setIsAddRelationModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create relation:', err);
      throw err;
    }
  };

  const handleUpdateRelation = useCallback(async (id: number, data: { note_old?: string; note_new?: string }) => {
    if (!selectedDocument) return;

    try {
      // Use updateNote API method for note updates
      if (data.note_old !== undefined && data.note_new !== undefined) {
        await objectRelationApi.updateNote(id, data.note_old, data.note_new);
      }
      await loadRelations(selectedDocument.id);
    } catch (err: any) {
      console.error('Failed to update relation:', err);
      throw err;
    }
  }, [selectedDocument, loadRelations]);

  const handleDeleteRelation = useCallback(async (id: number) => {
    if (!selectedDocument) return;

    try {
      await objectRelationApi.delete(id);
      await loadRelations(selectedDocument.id);
    } catch (err: any) {
      console.error('Failed to delete relation:', err);
      throw err;
    }
  }, [selectedDocument, loadRelations]);

  const placeholderContent = useCallback((icon: React.ReactNode) => (
    <div className="p-8 text-center text-gray-500 dark:text-gray-400">
      {icon}
      <p className="mt-4">{t('documents.selectToViewDetails')}</p>
    </div>
  ), [t]);

  // Memoize tabs to prevent unnecessary re-renders
  const tabs = useMemo(() => [
    {
      id: 'files',
      label: t('documents.files'),
      icon: <Files className="h-5 w-5" />,
      content: selectedDocument ? (
        <DocumentFilesTab documentId={selectedDocument.id} onDataChange={loadDocuments} />
      ) : placeholderContent(<Files className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedDocument,
    },
    {
      id: 'relations',
      label: t('companies.relations') || 'Relations',
      icon: <Network className="h-5 w-5" />,
      content: selectedDocument ? (
        <ObjectRelationsTable
          relations={relations}
          relationTypes={objectRelationTypes}
          objectTypes={objectTypes}
          currentObjectId={selectedDocument.id}
          onUpdate={handleUpdateRelation}
          onDelete={handleDeleteRelation}
          onAddNew={() => setIsAddRelationModalOpen(true)}
          isLoading={isLoadingRelations}
          error={relationsError}
          filterActive={filterActive}
          onFilterActiveChange={setFilterActive}
        />
      ) : placeholderContent(<Network className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedDocument,
    },
    {
      id: 'identifications',
      label: t('persons.identifications'),
      icon: <CreditCard className="h-5 w-5" />,
      content: selectedDocument ? (
        <IdentificationsTab objectId={selectedDocument.id} objectTypeId={selectedDocument.object_type_id} />
      ) : placeholderContent(<CreditCard className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedDocument,
    },
    {
      id: 'notes',
      label: t('persons.notes'),
      icon: <StickyNote className="h-5 w-5" />,
      content: selectedDocument ? (
        <NotesTab objectId={selectedDocument.id} onDataChange={loadDocuments} />
      ) : placeholderContent(<StickyNote className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedDocument,
    },
    {
      id: 'audits',
      label: t('audits.title'),
      icon: <FileText className="h-5 w-5" />,
      content: selectedDocument ? (
        <AuditsTab objectId={selectedDocument.id} reloadTrigger={auditReloadTrigger} />
      ) : placeholderContent(<FileText className="h-12 w-12 mx-auto opacity-50" />),
      disabled: !selectedDocument,
    },
  ], [
    t,
    selectedDocument,
    loadDocuments,
    placeholderContent,
    relations,
    objectRelationTypes,
    objectTypes,
    handleUpdateRelation,
    handleDeleteRelation,
    isLoadingRelations,
    relationsError,
    filterActive,
    auditReloadTrigger,
  ]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.documents')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('documents.subtitle')}</p>
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
            <Plus className="h-4 w-4" />
            {t('documents.addNew')}
          </Button>
        </div>
      </div>

      {/* Documents View - Upper Half */}
      <div className="mb-6">
        <DocumentsView
          documents={documents}
          isLoading={isLoadingDocuments || loadingLookups}
          error={documentsError}
          viewMode={viewMode}
          onDocumentSelect={handleDocumentSelect}
          selectedDocumentId={selectedDocument?.id}
          onEdit={handleEdit}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          documentTypes={documentTypes}
          statuses={statuses}
        />
      </div>

      {/* Tabs - Lower Half */}
      <div className="flex-1">
        {!selectedDocument ? (
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('documents.selectToViewDetails')}
            </p>
          </div>
        ) : (
          <Tabs
            key={selectedDocument.id}
            tabs={tabs}
            defaultTab="files"
            onChange={handleTabChange}
          />
        )}
      </div>

      {/* Add Relation Modal */}
      {selectedDocument && selectedDocument.object_type_id && (
        <AddRelationModal
          isOpen={isAddRelationModalOpen}
          onClose={() => setIsAddRelationModalOpen(false)}
          onSubmit={handleCreateRelation}
          currentObjectId={selectedDocument.id}
          currentObjectTypeId={selectedDocument.object_type_id}
          existingRelationIds={relations.map(r =>
            r.object_from_id === selectedDocument.id ? r.object_to_id : r.object_from_id
          )}
        />
      )}

      {/* Create Document Modal */}
      <DocumentFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDocument}
        documentTypes={documentTypes}
        statuses={statuses}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
