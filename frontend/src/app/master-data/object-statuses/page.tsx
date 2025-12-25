/**
 * Object Statuses Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function ObjectStatusesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const language = useLanguageStore((state) => state.language);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getObjectStatuses(undefined, language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load object statuses');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load object statuses');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createObjectStatus(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create object status');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateObjectStatus(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update object status');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteObjectStatus(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete object status');
    }
  };

  return (
    <LookupTable
      title="Object Statuses"
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

