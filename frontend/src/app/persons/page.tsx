/**
 * Persons List Page
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ViewToggle } from '@/components/ui/ViewToggle';
import { Plus, FileText, Phone, MapPin, Briefcase, CreditCard, Network, StickyNote } from 'lucide-react';
import { PersonsView } from '@/components/persons/PersonsView';
import { AuditsTable } from '@/components/audits/AuditsTable';
import { Tabs } from '@/components/ui/Tabs';
import ContactsTab from '@/components/contacts/ContactsTab';
import IdentificationsTab from '@/components/identifications/IdentificationsTab';
import AddressesTab from '@/components/addresses/AddressesTab';
import { personApi } from '@/lib/api/persons';
import { auditApi } from '@/lib/api/audits';
import { lookupApi } from '@/lib/api/lookups';
import { useTranslation } from '@/lib/i18n';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Person, ObjectAudit } from '@/types/entities';
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

  // Audits state
  const [audits, setAudits] = useState<ObjectAudit[]>([]);
  const [isLoadingAudits, setIsLoadingAudits] = useState(false);
  const [auditsError, setAuditsError] = useState<string | null>(null);

  // Lookup data
  const [salutations, setSalutations] = useState<LookupItem[]>([]);
  const [sexes, setSexes] = useState<LookupItem[]>([]);
  const [statuses, setStatuses] = useState<LookupItem[]>([]);
  const [auditActions, setAuditActions] = useState<LookupItem[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(true);

  // Load lookup data
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [salutationsRes, sexesRes, statusesRes, auditActionsRes] = await Promise.all([
          lookupApi.getSalutations(language),
          lookupApi.getSexes(language),
          lookupApi.getObjectStatuses(undefined, language),
          lookupApi.getAuditActions(undefined, language),
        ]);

        const salutationsList = salutationsRes?.data || salutationsRes || [];
        const sexesList = sexesRes?.data || sexesRes || [];
        const statusesList = statusesRes?.data || statusesRes || [];
        const auditActionsList = auditActionsRes?.data || auditActionsRes || [];

        setSalutations(Array.isArray(salutationsList) ? salutationsList : []);
        setSexes(Array.isArray(sexesList) ? sexesList : []);
        setStatuses(Array.isArray(statusesList) ? statusesList : []);
        setAuditActions(Array.isArray(auditActionsList) ? auditActionsList : []);
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
        const response = await personApi.getAll();
        const data = response?.data || response || [];
        setPersons(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load persons:', err);
        setPersonsError(err?.error?.message || err?.message || t('persons.loadFailed'));
      } finally {
        setIsLoadingPersons(false);
      }
    };

    loadPersons();
  }, [t]);

  // Load audits when person is selected
  useEffect(() => {
    if (!selectedPerson) {
      setAudits([]);
      return;
    }

    const loadAudits = async () => {
      setIsLoadingAudits(true);
      setAuditsError(null);

      try {
        const response = await auditApi.getByObjectId(selectedPerson.id);
        const data = response?.data || response || [];
        setAudits(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error('Failed to load audits:', err);
        setAuditsError(err?.error?.message || err?.message || t('audits.loadFailed'));
      } finally {
        setIsLoadingAudits(false);
      }
    };

    loadAudits();
  }, [selectedPerson, t]);

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

  const tabs = [
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
      content: (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          <StickyNote className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{t('persons.notes')} - {t('persons.comingSoon')}</p>
        </div>
      ),
      disabled: !selectedPerson,
    },
    {
      id: 'audits',
      label: t('audits.title'),
      icon: <FileText className="h-5 w-5" />,
      content: (
        <AuditsTable
          audits={audits}
          isLoading={isLoadingAudits}
          error={auditsError}
          auditActions={auditActions}
        />
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
          <Tabs tabs={tabs} defaultTab="contacts" />
        )}
      </div>
    </div>
  );
}
