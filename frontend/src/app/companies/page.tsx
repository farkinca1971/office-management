/**
 * Companies List Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Phone, MapPin, CreditCard, StickyNote, Files, Network } from 'lucide-react';
import { CompaniesView } from '@/components/companies/CompaniesView';
import { Tabs } from '@/components/ui/Tabs';
import DocumentsTab from '@/components/documents/DocumentsTab';
import ContactsTab from '@/components/contacts/ContactsTab';
import AddressesTab from '@/components/addresses/AddressesTab';
import IdentificationsTab from '@/components/identifications/IdentificationsTab';
import NotesTab from '@/components/notes/NotesTab';
import AuditsTab from '@/components/audits/AuditsTab';
import ObjectRelationsTable from '@/components/relations/ObjectRelationsTable';
import AddRelationModal from '@/components/relations/AddRelationModal';
import QuickActionButton from '@/components/relations/QuickActionButton';
import CreateRelatedEntityModal from '@/components/relations/CreateRelatedEntityModal';
import type { QuickActionType } from '@/components/relations/QuickActionButton';
import { companyApi } from '@/lib/api/companies';
import { lookupApi } from '@/lib/api/lookups';
import { objectRelationApi } from '@/lib/api/objectRelations';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Company, ObjectRelation, CreateObjectRelationRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';

export default function CompaniesPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const searchParams = useSearchParams();

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('companies-view-mode');

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Lookup data for companies view
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

  // Quick actions state
  const [isCreateEntityModalOpen, setIsCreateEntityModalOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState<QuickActionType | null>(null);
  const [quickActionRelationTypeId, setQuickActionRelationTypeId] = useState<number | null>(null);
  const [quickActionTargetObjectTypeId, setQuickActionTargetObjectTypeId] = useState<number | null>(null);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        let [statusesRes, relationTypesRes, objectTypesRes] = await Promise.all([
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getObjectRelationTypes(language),
          lookupApi.getObjectTypes(language),
        ]);

        // IMPORTANT: n8n sometimes wraps the response in an array
        // If response is an array, take the first element
        if (Array.isArray(statusesRes) && statusesRes.length > 0 && !statusesRes[0]?.id) {
          statusesRes = statusesRes[0];
        }
        if (Array.isArray(relationTypesRes) && relationTypesRes.length > 0) {
          relationTypesRes = relationTypesRes[0];
        }
        if (Array.isArray(objectTypesRes) && objectTypesRes.length > 0) {
          objectTypesRes = objectTypesRes[0];
        }

        // Response structure: { success: true, data: LookupItem[], pagination?: {...} }
        const statusesList = Array.isArray(statusesRes?.data) ? statusesRes.data : [];
        const relationTypesList = Array.isArray(relationTypesRes?.data) ? relationTypesRes.data : [];
        const objectTypesList = Array.isArray(objectTypesRes?.data) ? objectTypesRes.data : [];

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

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      setCompaniesError(null);

      try {
        let response = await companyApi.getAll();

        // Handle n8n array wrapper: if response is array, extract first item
        if (Array.isArray(response) && response.length > 0) {
          response = response[0];
        }

        const data = response?.data || [];
        setCompanies(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load companies:', err);
        setCompaniesError(err?.error?.message || err?.message || t('companies.loadFailed'));
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, [t]);

  // Auto-select company from URL query param (e.g., /companies?id=123)
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam && companies.length > 0 && !isLoadingCompanies) {
      const companyId = parseInt(idParam, 10);
      if (!isNaN(companyId)) {
        const company = companies.find(c => c.id === companyId);
        if (company && (!selectedCompany || selectedCompany.id !== companyId)) {
          setSelectedCompany(company);
        }
      }
    }
  }, [searchParams, companies, isLoadingCompanies, selectedCompany]);

  // Load relations for selected object
  const loadRelations = async (objectId: number) => {
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
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  // Handle tab change - reload data when switching to specific tabs
  const handleTabChange = (tabId: string) => {
    if (!selectedCompany) return;

    // Reload relations when Relations tab is clicked
    if (tabId === 'relations') {
      loadRelations(selectedCompany.id);
    }
  };

  const handleEdit = (company: Company) => {
    // TODO: Implement edit functionality
    console.log('Edit company:', company);
  };

  const handleDelete = (company: Company) => {
    // TODO: Implement delete functionality
    console.log('Delete company:', company);
  };

  // Relations CRUD handlers
  const handleCreateRelation = async (data: {
    object_relation_type_id: number;
    object_to_id: number;
    note?: string;
  }) => {
    if (!selectedCompany) return;

    try {
      // Add object_from_id from selected company
      const createData: CreateObjectRelationRequest = {
        object_from_id: selectedCompany.id,
        object_relation_type_id: data.object_relation_type_id,
        object_to_id: data.object_to_id,
        note: data.note,
      };
      await objectRelationApi.create(createData);
      await loadRelations(selectedCompany.id);
      setIsAddRelationModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create relation:', err);
      throw err;
    }
  };

  const handleUpdateRelation = async (id: number, data: { note_old?: string; note_new?: string }) => {
    if (!selectedCompany) return;

    try {
      // Use updateNote API method for note updates
      if (data.note_old !== undefined && data.note_new !== undefined) {
        await objectRelationApi.updateNote(id, data.note_old, data.note_new);
      }
      await loadRelations(selectedCompany.id);
    } catch (err: any) {
      console.error('Failed to update relation:', err);
      throw err;
    }
  };

  const handleDeleteRelation = async (id: number) => {
    if (!selectedCompany) return;

    try {
      await objectRelationApi.delete(id);
      await loadRelations(selectedCompany.id);
    } catch (err: any) {
      console.error('Failed to delete relation:', err);
      throw err;
    }
  };

  // Quick action handler
  const handleQuickAction = (
    actionType: QuickActionType,
    relationTypeId: number,
    targetObjectTypeId: number
  ) => {
    setQuickActionType(actionType);
    setQuickActionRelationTypeId(relationTypeId);
    setQuickActionTargetObjectTypeId(targetObjectTypeId);
    setIsCreateEntityModalOpen(true);
  };

  // Handle entity creation success
  const handleEntityCreated = async (newEntityId: number) => {
    // Reload relations to show the new relation
    if (selectedCompany) {
      await loadRelations(selectedCompany.id);
    }
    setIsCreateEntityModalOpen(false);
  };

  // Find the object relation type ID for 'obj_rel_type_company_doc'
  const companyDocRelationType = objectRelationTypes.find(
    (rt) => rt.code === 'obj_rel_type_company_doc'
  );
  const companyDocRelationTypeId = companyDocRelationType?.id;
  
  // Log warning if relation type is not found (after lookups have loaded)
  useEffect(() => {
    if (!loadingLookups && objectRelationTypes.length > 0 && !companyDocRelationType) {
      console.warn('[CompaniesPage] Object relation type "obj_rel_type_company_doc" not found in loaded relation types');
    }
  }, [loadingLookups, objectRelationTypes, companyDocRelationType]);

  const tabs = [
    {
      id: 'documents',
      label: t('documents.title') || t('files.documents'),
      icon: <Files className="h-5 w-5" />,
      content: selectedCompany ? (
        <DocumentsTab 
          objectId={selectedCompany.id} 
          objectRelationTypeId={companyDocRelationTypeId}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'contacts',
      label: t('companies.contacts'),
      icon: <Phone className="h-5 w-5" />,
      content: selectedCompany ? (
        <ContactsTab objectId={selectedCompany.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'addresses',
      label: t('companies.addresses'),
      icon: <MapPin className="h-5 w-5" />,
      content: selectedCompany ? (
        <AddressesTab objectId={selectedCompany.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'identifications',
      label: t('companies.identifications'),
      icon: <CreditCard className="h-5 w-5" />,
      content: selectedCompany ? (
        <IdentificationsTab objectId={selectedCompany.id} objectTypeId={selectedCompany.object_type_id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'relations',
      label: t('companies.relations') || 'Relations',
      icon: <Network className="h-5 w-5" />,
      content: selectedCompany ? (
        <ObjectRelationsTable
          relations={relations}
          relationTypes={objectRelationTypes}
          objectTypes={objectTypes}
          currentObjectId={selectedCompany.id}
          onUpdate={handleUpdateRelation}
          onDelete={handleDeleteRelation}
          onAddNew={() => setIsAddRelationModalOpen(true)}
          isLoading={isLoadingRelations}
          error={relationsError}
          filterActive={filterActive}
          onFilterActiveChange={setFilterActive}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'notes',
      label: t('companies.notes'),
      icon: <StickyNote className="h-5 w-5" />,
      content: selectedCompany ? (
        <NotesTab objectId={selectedCompany.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
    {
      id: 'audits',
      label: t('audits.title'),
      icon: <FileText className="h-5 w-5" />,
      content: selectedCompany ? (
        <AuditsTab objectId={selectedCompany.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('companies.selectCompanyToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedCompany,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.companies')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('companies.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            gridLabel={t('lookup.gridView') || 'Grid View'}
            cardLabel={t('lookup.cardView') || 'Card View'}
          />
          <Link href="/companies/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('companies.addNew')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Companies View - Upper Half */}
      <div className="mb-6">
        <CompaniesView
          companies={companies}
          isLoading={isLoadingCompanies || loadingLookups}
          error={companiesError}
          viewMode={viewMode}
          onCompanySelect={handleCompanySelect}
          selectedCompanyId={selectedCompany?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          statuses={statuses}
        />
      </div>

      {/* Tabs - Lower Half */}
      <div className="flex-1">
        {!selectedCompany ? (
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('companies.selectCompanyToViewDetails')}
            </p>
          </div>
        ) : (
          <Tabs tabs={tabs} defaultTab="documents" onChange={handleTabChange} />
        )}
      </div>

      {/* Add Relation Modal */}
      {selectedCompany && selectedCompany.object_type_id && (
        <AddRelationModal
          isOpen={isAddRelationModalOpen}
          onClose={() => setIsAddRelationModalOpen(false)}
          onSubmit={handleCreateRelation}
          currentObjectId={selectedCompany.id}
          currentObjectTypeId={selectedCompany.object_type_id}
          existingRelationIds={relations.map(r =>
            r.object_from_id === selectedCompany.id ? r.object_to_id : r.object_from_id
          )}
        />
      )}

      {/* Create Related Entity Modal */}
      {selectedCompany && quickActionType && quickActionRelationTypeId && quickActionTargetObjectTypeId && (
        <CreateRelatedEntityModal
          isOpen={isCreateEntityModalOpen}
          onClose={() => setIsCreateEntityModalOpen(false)}
          actionType={quickActionType}
          currentObjectId={selectedCompany.id}
          relationTypeId={quickActionRelationTypeId}
          targetObjectTypeId={quickActionTargetObjectTypeId}
          onSuccess={handleEntityCreated}
        />
      )}
    </div>
  );
}
