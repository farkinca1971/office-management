/**
 * AuditsTable Component - Display audit logs for an object
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import type { ObjectAudit } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDateTime } from '@/lib/utils';

export interface AuditsTableProps {
  audits: ObjectAudit[];
  isLoading?: boolean;
  error?: string | null;
  auditActions?: LookupItem[];
}

type SortField = 'id' | 'created_at' | 'audit_action_id' | 'created_by_username';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

export const AuditsTable: React.FC<AuditsTableProps> = ({
  audits,
  isLoading = false,
  error = null,
  auditActions = [],
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: 'created_at', direction: 'desc' });

  const getActionName = (actionId: number): string => {
    const action = auditActions.find(a => a.id === actionId);
    return action?.name || action?.code || t('audits.unknownAction');
  };

  const formatJsonValue = (value: Record<string, any> | undefined | null): string => {
    if (!value) return '-';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return '-';
    }
  };

  // Sorting logic
  const handleSort = (field: SortField) => {
    setSortState(prev => {
      if (prev.field === field) {
        // Cycle through: asc -> desc -> null
        if (prev.direction === 'asc') return { field, direction: 'desc' };
        if (prev.direction === 'desc') return { field: null, direction: null };
      }
      return { field, direction: 'asc' };
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortState.field !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortState.direction === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortState.direction === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  // Sorting
  const sortedAudits = useMemo(() => {
    let result = [...audits];

    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof ObjectAudit;
        const aVal = a[field] || '';
        const bVal = b[field] || '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [audits, sortState]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12 text-red-500">
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {sortedAudits.length} {sortedAudits.length === 1 ? t('audits.audit') : t('audits.audits')}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  {t('lookup.id')}
                  {getSortIcon('id')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('audit_action_id')}
              >
                <div className="flex items-center gap-2">
                  {t('audits.action')}
                  {getSortIcon('audit_action_id')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-2">
                  {t('audits.timestamp')}
                  {getSortIcon('created_at')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_by_username')}
              >
                <div className="flex items-center gap-2">
                  {t('audits.createdBy')}
                  {getSortIcon('created_by_username')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('audits.oldValues')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('audits.newValues')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('audits.notes')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedAudits.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('audits.noAudits')}
                </td>
              </tr>
            ) : (
              sortedAudits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {audit.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                      {getActionName(audit.audit_action_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDateTime(audit.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {audit.created_by_username || '-'}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-700 dark:text-gray-300 max-w-xs">
                    {audit.old_values ? (
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {formatJsonValue(audit.old_values)}
                      </pre>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-700 dark:text-gray-300 max-w-xs">
                    {audit.new_values ? (
                      <pre className="overflow-x-auto whitespace-pre-wrap break-words bg-green-50 dark:bg-green-900/20 p-2 rounded">
                        {formatJsonValue(audit.new_values)}
                      </pre>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs">
                    <div className="whitespace-pre-wrap break-words">
                      {audit.notes || '-'}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
