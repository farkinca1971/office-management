/**
 * Persons List Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Phone, MapPin, Briefcase, CreditCard, Network, StickyNote, Files } from 'lucide-react';
import { PersonsView } from '@/components/persons/PersonsView';
import { Tabs } from '@/components/ui/Tabs';
import DocumentsTab from '@/components/documents/DocumentsTab';
import ContactsTab from '@/components/contacts/ContactsTab';
import AddressesTab from '@/components/addresses/AddressesTab';
import IdentificationsTab from '@/components/identifications/IdentificationsTab';
import NotesTab from '@/components/notes/NotesTab';
import AuditsTab from '@/components/audits/AuditsTab';
import { personApi } from '@/lib/api/persons';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Person } from '@/types/entities';
import type { LookupItem } from '@/types/common';

export default function PersonsPage() {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('persons-view-mode');

  // Persons state
  const [persons, setPersons] = useState<Person[]>([]);
  const [isLoadingPersons, setIsLoadingPersons] = useState(true);
  const [personsError, setPersonsError] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  // Lookup data for persons view
  const [salutations, setSalutations] = useState<LookupItem[]>([]);
  const [sexes, setSexes] = useState<LookupItem[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [objectRelationTypes, setObjectRelationTypes] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        let [salutationsRes, sexesRes, statusesRes, relationTypesRes] = await Promise.all([
          lookupApi.getSalutations(language),
          lookupApi.getSexes(language),
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getObjectRelationTypes(language),
        ]);

        // IMPORTANT: n8n sometimes wraps the response in an array
        // If response is an array, take the first element
        if (Array.isArray(salutationsRes) && salutationsRes.length > 0 && !salutationsRes[0]?.id) {
          salutationsRes = salutationsRes[0];
        }
        if (Array.isArray(sexesRes) && sexesRes.length > 0 && !sexesRes[0]?.id) {
          sexesRes = sexesRes[0];
        }
        if (Array.isArray(statusesRes) && statusesRes.length > 0 && !statusesRes[0]?.id) {
          statusesRes = statusesRes[0];
        }
        if (Array.isArray(relationTypesRes) && relationTypesRes.length > 0) {
          relationTypesRes = relationTypesRes[0];
        }

        // Response structure: { success: true, data: LookupItem[], pagination?: {...} }
        const salutationsList = Array.isArray(salutationsRes?.data) ? salutationsRes.data : [];
        const sexesList = Array.isArray(sexesRes?.data) ? sexesRes.data : [];
        const statusesList = Array.isArray(statusesRes?.data) ? statusesRes.data : [];
        const relationTypesList = Array.isArray(relationTypesRes?.data) ? relationTypesRes.data : [];

        setSalutations(salutationsList);
        setSexes(sexesList);
        setStatuses(statusesList);
        setObjectRelationTypes(relationTypesList);
      } catch (err) {
        console.error('Failed to load lookup data:', err);
      } finally {
        setLoadingLookups(false);
      }
    };

    loadLookups();
  }, [language]);

  // Load persons
  useEffect(() => {
    const loadPersons = async () => {
      setIsLoadingPersons(true);
      setPersonsError(null);

      try {
        let response = await personApi.getAll();

        // IMPORTANT: n8n sometimes wraps the response in an array
        // If response is an array, take the first element
        if (Array.isArray(response) && response.length > 0) {
          response = response[0];
        }

        // Response structure: { success: true, data: Person[], pagination?: {...} }
        const personsData = Array.isArray(response?.data) ? response.data : [];
        setPersons(personsData);
      } catch (err: any) {
        console.error('Failed to load persons:', err);
        setPersonsError(err?.error?.message || err?.message || t('persons.loadFailed'));
      } finally {
        setIsLoadingPersons(false);
      }
    };

    loadPersons();
  }, [t]);

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person);
  };

  const handleEdit = (person: Person) => {
    // TODO: Implement edit functionality
    console.log('Edit person:', person);
  };

  const handleDelete = (person: Person) => {
    // TODO: Implement delete functionality
    console.log('Delete person:', person);
  };

  // Find the object relation type ID for 'obj_rel_type_person_doc'
  const personDocRelationType = objectRelationTypes.find(
    (rt) => rt.code === 'obj_rel_type_person_doc'
  );
  const personDocRelationTypeId = personDocRelationType?.id;
  
  // Log warning if relation type is not found (after lookups have loaded)
  useEffect(() => {
    if (!loadingLookups && objectRelationTypes.length > 0 && !personDocRelationType) {
      console.warn('[PersonsPage] Object relation type "obj_rel_type_person_doc" not found in loaded relation types');
    }
  }, [loadingLookups, objectRelationTypes, personDocRelationType]);

  const tabs = [
    {
      id: 'documents',
      label: t('documents.title') || t('files.documents'),
      icon: <Files className="h-5 w-5" />,
      content: selectedPerson ? (
        <DocumentsTab 
          objectId={selectedPerson.id} 
          objectRelationTypeId={personDocRelationTypeId}
        />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Files className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'contacts',
      label: t('persons.contacts'),
      icon: <Phone className="h-5 w-5" />,
      content: selectedPerson ? (
        <ContactsTab objectId={selectedPerson.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'addresses',
      label: t('persons.addresses'),
      icon: <MapPin className="h-5 w-5" />,
      content: selectedPerson ? (
        <AddressesTab objectId={selectedPerson.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'employers',
      label: t('persons.employers'),
      icon: <Briefcase className="h-5 w-5" />,
      content: (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.employers')} - {t('persons.comingSoon')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'identifications',
      label: t('persons.identifications'),
      icon: <CreditCard className="h-5 w-5" />,
      content: selectedPerson ? (
        <IdentificationsTab objectId={selectedPerson.id} objectTypeId={selectedPerson.object_type_id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'relationships',
      label: t('persons.relationships'),
      icon: <Network className="h-5 w-5" />,
      content: (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.relationships')} - {t('persons.comingSoon')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'notes',
      label: t('persons.notes'),
      icon: <StickyNote className="h-5 w-5" />,
      content: selectedPerson ? (
        <NotesTab objectId={selectedPerson.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'audits',
      label: t('audits.title'),
      icon: <FileText className="h-5 w-5" />,
      content: selectedPerson ? (
        <AuditsTab objectId={selectedPerson.id} />
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.selectPersonToViewDetails')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('nav.persons')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('persons.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle
            viewMode={viewMode}
            onToggle={toggleViewMode}
            gridLabel={t('lookup.gridView') || 'Grid View'}
            cardLabel={t('lookup.cardView') || 'Card View'}
          />
          <Link href="/persons/new">
            <Button variant="primary" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('persons.addNew')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Persons View - Upper Half */}
      <div className="mb-6">
        <PersonsView
          persons={persons}
          isLoading={isLoadingPersons || loadingLookups}
          error={personsError}
          viewMode={viewMode}
          onPersonSelect={handlePersonSelect}
          selectedPersonId={selectedPerson?.id}
          onEdit={handleEdit}
          onDelete={handleDelete}
          salutations={salutations}
          sexes={sexes}
          statuses={statuses}
        />
      </div>

      {/* Tabs - Lower Half */}
      <div className="flex-1">
        {!selectedPerson ? (
          <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {t('persons.selectPersonToViewDetails')}
            </p>
          </div>
        ) : (
          <Tabs tabs={tabs} defaultTab="documents" />
        )}
      </div>
    </div>
  );
}
