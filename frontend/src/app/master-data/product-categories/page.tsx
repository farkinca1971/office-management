/**
 * Product Categories Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import type { LookupItem } from '@/types/common';

export default function ProductCategoriesPage() {
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
      const response = await lookupApi.getProductCategories(language);
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load product categories');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load product categories');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async (item: { code: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.createProductCategory(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create product category');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean; text?: string; language_id?: number }) => {
    const response = await lookupApi.updateProductCategory(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update product category');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteProductCategory(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete product category');
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
      title="Product Categories"
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

