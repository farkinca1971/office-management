/**
 * Object Relation Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function ObjectRelationTypesPage() {
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
      const response = await lookupApi.getObjectRelationTypes(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load object relation types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load object relation types');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.createObjectRelationType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create object relation type');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.updateObjectRelationType(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update object relation type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteObjectRelationType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete object relation type');
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
      title="Object Relation Types"
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

