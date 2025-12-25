/**
 * Contact Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import type { LookupItem } from '@/types/common';

export default function ContactTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getContactTypes();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load contact types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load contact types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createContactType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create contact type');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateContactType(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update contact type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteContactType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete contact type');
    }
  };

  return (
    <LookupTable
      title="Contact Types"
      data={data}
      isLoading={isLoading}
      error={error}
      onLoad={loadData}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}

