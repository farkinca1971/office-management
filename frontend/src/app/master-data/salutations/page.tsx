/**
 * Salutations Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function SalutationsPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);
  const language = useLanguageStore((state) => state.language);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getSalutations(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load salutations');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load salutations');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.createSalutation(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create salutation');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.updateSalutation(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update salutation');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteSalutation(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete salutation');
    }
  };

  React.useEffect(() => {
    if (data.length > 0) {
      const maxPage = Math.ceil(data.length / perPage) || 1;
      if (page > maxPage || page < 1) {
        setPage(1);
      }
    }
  }, [data.length, perPage]);

  return (
    <LookupTable
      title="Salutations"
      data={data}
      isLoading={isLoading}
      error={error}
      onLoad={loadData}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      pagination={data.length > 0 ? {
        page,
        perPage,
        total: data.length,
        totalPages: Math.ceil(data.length / perPage),
        onPageChange: setPage,
        onPerPageChange: (newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        },
      } : undefined}
    />
  );
}

