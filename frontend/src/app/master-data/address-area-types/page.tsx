/**
 * Address Area Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import type { LookupItem } from '@/types/common';

export default function AddressAreaTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getAddressAreaTypes();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load address area types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load address area types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createAddressAreaType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create address area type');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateAddressAreaType(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update address area type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteAddressAreaType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete address area type');
    }
  };

  return (
    <LookupTable
      title="Address Area Types"
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

