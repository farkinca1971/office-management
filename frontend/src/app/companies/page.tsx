/**
 * Companies List Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Phone, MapPin, CreditCard, StickyNote, Files } from 'lucide-react';
import { CompaniesView } from '@/components/companies/CompaniesView';
import { Tabs } from '@/components/ui/Tabs';
import DocumentsTab from '@/components/documents/DocumentsTab';
import ContactsTab from '@/components/contacts/ContactsTab';
import AddressesTab from '@/components/addresses/AddressesTab';
import IdentificationsTab from '@/components/identifications/IdentificationsTab';
import NotesTab from '@/components/notes/NotesTab';
import AuditsTab from '@/components/audits/AuditsTab';
import { companyApi } from '@/lib/api/companies';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Company } from '@/types/entities';
import type { LookupItem } from '@/types/common';

export default function CompaniesPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

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
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [statusesRes, relationTypesRes] = await Promise.all([
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getObjectRelationTypes(language)
        ]);
        
        const statusesList = statusesRes?.data || statusesRes || [];
        setStatuses(Array.isArray(statusesList) ? statusesList : []);
        
        // Handle n8n array wrapper for relation types
        let relationTypesData = relationTypesRes;
        if (Array.isArray(relationTypesRes) && relationTypesRes.length > 0) {
          relationTypesData = relationTypesRes[0];
        }
        const relationTypesList = relationTypesData?.data || relationTypesData || [];
        setObjectRelationTypes(Array.isArray(relationTypesList) ? relationTypesList : []);
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

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
  };

  const handleEdit = (company: Company) => {
    // TODO: Implement edit functionality
    console.log('Edit company:', company);
  };

  const handleDelete = (company: Company) => {
    // TODO: Implement delete functionality
    console.log('Delete company:', company);
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
          <Tabs tabs={tabs} defaultTab="documents" />
        )}
      </div>
    </div>
  );
}
