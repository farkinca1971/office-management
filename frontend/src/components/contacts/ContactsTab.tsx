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
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ViewToggle } from '@/components/ui/ViewToggle';
import ContactsTable from './ContactsTable';
import { ContactCard } from './ContactCard';
import { contactApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useViewMode } from '@/hooks/useViewMode';
import type { Contact } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface ContactsTabProps {
  objectId: number;
}

export default function ContactsTab({ objectId }: ContactsTabProps) {
  console.log('🔵 ContactsTab component rendered with objectId:', objectId);

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactTypes, setContactTypes] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter state (managed here for server-side filtering)
  const [filterActive, setFilterActive] = useState<boolean | ''>('');

  // New contact form state
  const [showNewForm, setShowNewForm] = useState(false);
  const [newContactType, setNewContactType] = useState<number | ''>('');
  const [newContactValue, setNewContactValue] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const language = useLanguageStore((state) => state.language);

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
        setSuccessMessage('Contact updated successfully');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error updating contact:', err);
      setError(err?.error?.message || 'Failed to update contact');
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
      setSuccessMessage('Contact deleted successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error deleting contact:', err);
      setError(err?.error?.message || 'Failed to delete contact');
      throw err; // Re-throw to let ContactsTable handle it
    }
  };

  // Handle create new contact
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newContactType || !newContactValue.trim()) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);
      setSuccessMessage(null);

      const response = await contactApi.create(objectId, {
        object_id: objectId,
        contact_type_id: Number(newContactType),
        contact_value: newContactValue.trim(),
      });

      if (response.success && response.data) {
        // Reload contacts to get the complete data with proper IDs
        await loadData();

        // Reset form
        setNewContactType('');
        setNewContactValue('');
        setShowNewForm(false);
        setSuccessMessage('Contact created successfully');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      console.error('Error creating contact:', err);
      setError(err?.error?.message || 'Failed to create contact');
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
          gridLabel="Table View"
          cardLabel="Card View"
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
              Loading contacts...
            </div>
          ) : contacts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-400">
              No contacts found
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

      {/* New Contact Section */}
      <div className="border-t pt-4">
        {!showNewForm ? (
          <Button
            variant="primary"
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Contact
          </Button>
        ) : (
          <Card>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                New Contact
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={newContactType.toString()}
                    onChange={(e) => setNewContactType(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    options={contactTypes
                      .filter(type => type.is_active)
                      .map((type) => ({
                        value: type.id,
                        label: type.name || type.code
                      }))}
                    placeholder="Select contact type..."
                  />
                </div>

                {/* Contact Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Value <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newContactValue}
                    onChange={(e) => setNewContactValue(e.target.value)}
                    placeholder="e.g., email@example.com or +1-555-1234"
                    required
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isCreating}
                  className="flex items-center gap-2"
                >
                  {isCreating ? 'Creating...' : 'Create Contact'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewContactType('');
                    setNewContactValue('');
                    setError(null);
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
