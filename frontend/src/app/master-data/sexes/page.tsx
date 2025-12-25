/**
 * Sexes Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function SexesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const language = useLanguageStore((state) => state.language);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getSexes(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load sexes');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load sexes');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createSex(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create sex');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateSex(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update sex');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteSex(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete sex');
    }
  };

  return (
    <LookupTable
      title="Sexes"
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

