/**
 * Transaction Types Lookup Page
 */

'use client';

import React from 'react';
import { LookupTable } from '@/components/ui/LookupTable';
import { lookupApi } from '@/lib/api';
import type { LookupItem } from '@/types/common';

export default function TransactionTypesPage() {
  const [data, setData] = React.useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getTransactionTypes();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load transaction types');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load transaction types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (item: { code: string; is_active?: boolean }) => {
    const response = await lookupApi.createTransactionType(item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to create transaction type');
    }
  };

  const handleUpdate = async (id: number, item: { code?: string; is_active?: boolean }) => {
    const response = await lookupApi.updateTransactionType(id, item);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to update transaction type');
    }
  };

  const handleDelete = async (id: number) => {
    const response = await lookupApi.deleteTransactionType(id);
    if (response.success) {
      await loadData();
    } else {
      throw new Error('Failed to delete transaction type');
    }
  };

  return (
    <LookupTable
      title="Transaction Types"
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

