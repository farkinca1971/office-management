/**
 * Address Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function AddressTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const language = useLanguageStore((state) => state.language);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getAddressTypes(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load address types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load address types');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createAddressType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create address type');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateAddressType(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update address type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteAddressType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete address type');
    }
  };

  return (
    <LookupTable
      title="Address Types"
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

