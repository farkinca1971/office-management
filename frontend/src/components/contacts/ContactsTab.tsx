/**
 * ContactsTab Component
 *
 * Manages contacts for a given object (employee, person, company, etc.)
 * Features:
 * - Loads contacts from API
 * - Loads contact types (lookup data)
 * - Handles create, update, delete operations
 * - Shows ContactsTable or ContactCards based on view mode
 * - New contact form at the bottom
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import ContactsTable from './ContactsTable';
import { ContactCard } from './ContactCard';
import { ContactFormModal } from './ContactFormModal';
import type { ContactFormData } from './ContactFormModal';
import { contactApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import { useTranslation } from '@/lib/i18n';
import type { Contact } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface ContactsTabProps {
  objectId: number;
  onDataChange?: () => void | Promise<void>;
}

export default function ContactsTab({ objectId, onDataChange }: ContactsTabProps) {
  console.log('🔵 ContactsTab component rendered with objectId:', objectId);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactTypes, setContactTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state (managed here for server-side filtering)
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const language = useLanguageStore((state) => state.language);
  const { t } = useTranslation();

  // View mode management
  const { viewMode, toggleViewMode } = useViewMode('contacts-view-mode');

  // Load contacts and contact types
  const loadData = useCallback(async () => {
    console.log('[ContactsTab] loadData called for objectId:', objectId, 'filterActive:', filterActive);
    try {
      setIsLoading(true);
      setError(null);

      // Build params based on filter
      // Convert boolean to 0/1 for API
      const params: { is_active?: number } = {};
      if (filterActive !== '') {
        params.is_active = filterActive ? 1 : 0;
      }

      console.log('[ContactsTab] Making API calls with params:', params);

      // Load contacts and contact types in parallel
      const [contactsResponse, typesResponse] = await Promise.all([
        contactApi.getByObjectId(objectId, params),
        lookupApi.getContactTypes(language),
      ]);

      console.log('[ContactsTab] Contacts response:', contactsResponse);
      console.log('[ContactsTab] Contacts response RAW:', JSON.stringify(contactsResponse, null, 2));
      console.log('[ContactsTab] Types response:', typesResponse);

      // Ensure we always set an array, even if the response is undefined or not an array
      const contactsData = contactsResponse?.data;
      const typesData = typesResponse?.data;

      console.log('[ContactsTab] contactsData:', contactsData);
      console.log('[ContactsTab] contactsData is array?', Array.isArray(contactsData));
      console.log('[ContactsTab] contactsData length:', contactsData?.length);

      // Handle both array and single object responses
      let contactsArray: Contact[] = [];
      if (Array.isArray(contactsData)) {
        contactsArray = contactsData;
      } else if (contactsData && typeof contactsData === 'object') {
        // Single object returned, wrap it in an array
        contactsArray = [contactsData as Contact];
      }

      setContacts(contactsArray);
      setContactTypes(Array.isArray(typesData) ? typesData : []);

      console.log('[ContactsTab] State set - contacts count:', contactsArray.length);
    } catch (err: any) {
      console.error('[ContactsTab] Error loading contacts:', err);
      setError(err?.error?.message || 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  }, [objectId, language, filterActive]);

  useEffect(() => {
    console.log('[ContactsTab] useEffect triggered');
    loadData();
  }, [loadData]);

  // Handle contact update
  const handleUpdate = async (
    id: number,
    data: {
      contact_type_id_old: number;
      contact_type_id_new: number;
      contact_value_old: string;
      contact_value_new: string;
      is_active_old: boolean;
      is_active_new: boolean;
    }
  ) => {
    try {
      setError(null);
      setSuccessMessage(null);

      // Send the full payload with old and new values to the API
      const response = await contactApi.update(id, data);

      if (response.success) {
        // Reload contacts to get the complete updated data
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('contacts.updated'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating contact:', err);
      setError(err?.error?.message || t('contacts.loadFailed'));
      throw err; // Re-throw to let ContactsTable handle it
    }
  };

  // Handle contact delete (soft delete)
  const handleDelete = async (id: number) => {
    try {
      setError(null);
      setSuccessMessage(null);

      await contactApi.delete(id);

      // Reload contacts to reflect the soft delete (is_active = false)
      await loadData();

      // Trigger audit reload on parent
      if (onDataChange) {
        await onDataChange();
      }

      setSuccessMessage(t('contacts.deleted'));

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      setError(err?.error?.message || t('contacts.loadFailed'));
      throw err; // Re-throw to let ContactsTable handle it
    }
  };

  // Handle create new contact
  const handleCreateContact = async (data: ContactFormData) => {
    setIsCreating(true);
    try {
      setError(null);
      setSuccessMessage(null);

      const response = await contactApi.create(objectId, {
        object_id: objectId,
        contact_type_id: data.contact_type_id,
        contact_value: data.contact_value.trim(),
      });

      if (response.success && response.data) {
        // Close modal
        setIsModalOpen(false);

        // Reload contacts to get the complete data with proper IDs
        await loadData();

        // Trigger audit reload on parent
        if (onDataChange) {
          await onDataChange();
        }

        setSuccessMessage(t('contacts.created'));

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating contact:', err);
      setError(err?.error?.message || t('contacts.loadFailed'));
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {/* Error Message */}
      {error && <Alert variant="error">{error}</Alert>}

      {/* View Toggle */}
      <div className="flex justify-end">
        <ViewToggle
          viewMode={viewMode}
          onToggle={toggleViewMode}
          gridLabel={t('contacts.tableView')}
          cardLabel={t('contacts.cardView')}
        />
      </div>

      {/* Contacts View - Table or Card Grid */}
      {viewMode === 'grid' ? (
        <Card>
          <ContactsTable
            contacts={contacts}
            contactTypes={contactTypes}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isLoading={isLoading}
            error={error}
            filterActive={filterActive}
            onFilterActiveChange={setFilterActive}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              {t('contacts.loading')}
            </div>
          ) : contacts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              {t('contacts.noContacts')}
            </div>
          ) : (
            contacts.map((contact) => (
              <ContactCard
                key={contact.id}
                contact={contact}
                contactTypes={contactTypes}
                onEdit={(c) => {
                  // For card view, we'll need to implement a modal/form for editing
                  // For now, just log
                  console.log('Edit contact:', c);
                }}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {/* New Contact Button */}
      <div className="border-t pt-4">
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('contacts.addNew')}
        </Button>
      </div>

      {/* Contact Form Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateContact}
        contactTypes={contactTypes}
        isSubmitting={isCreating}
      />
    </div>
  );
}
