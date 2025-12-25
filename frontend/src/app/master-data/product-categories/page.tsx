/**
 * Product Categories Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import type { LookupItem } from '@/types/common';

export default function ProductCategoriesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getProductCategories();
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
  };

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createProductCategory(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create product category');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
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
    />
  );
}

