/**
 * AuditsTable Component - Display audit logs for an object
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TextColumnFilter, SelectColumnFilter, DateColumnFilter } from '@/components/ui/ColumnFilters';
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
  const [filterAction, setFilterAction] = useState<number | ''>('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [filterCreatedAt, setFilterCreatedAt] = useState('');
  const [filterOldValues, setFilterOldValues] = useState('');
  const [filterNewValues, setFilterNewValues] = useState('');
  const [filterNotes, setFilterNotes] = useState('');

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

  // Filtering and Sorting
  const filteredAndSortedAudits = useMemo(() => {
    let result = [...audits];

    // Apply client-side filters
    if (filterAction !== '') {
      result = result.filter(a => a.audit_action_id === filterAction);
    }
    if (filterCreatedBy) {
      result = result.filter(a =>
        a.created_by_username?.toLowerCase().includes(filterCreatedBy.toLowerCase())
      );
    }
    if (filterCreatedAt) {
      result = result.filter(a => {
        if (!a.created_at) return false;
        // Extract date part from timestamp (YYYY-MM-DD)
        const auditDate = a.created_at.split(' ')[0];
        return auditDate === filterCreatedAt;
      });
    }
    if (filterOldValues) {
      result = result.filter(a => {
        if (!a.old_values) return false;
        const jsonString = JSON.stringify(a.old_values).toLowerCase();
        return jsonString.includes(filterOldValues.toLowerCase());
      });
    }
    if (filterNewValues) {
      result = result.filter(a => {
        if (!a.new_values) return false;
        const jsonString = JSON.stringify(a.new_values).toLowerCase();
        return jsonString.includes(filterNewValues.toLowerCase());
      });
    }
    if (filterNotes) {
      result = result.filter(a =>
        a.notes?.toLowerCase().includes(filterNotes.toLowerCase())
      );
    }

    // Apply sorting
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
  }, [audits, sortState, filterAction, filterCreatedBy, filterCreatedAt, filterOldValues, filterNewValues, filterNotes]);

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
          {filteredAndSortedAudits.length} {filteredAndSortedAudits.length === 1 ? t('audits.audit') : t('audits.audits')}
          {filteredAndSortedAudits.length !== audits.length && (
            <span className="ml-2 text-gray-500">
              (filtered from {audits.length})
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            {/* Header Row */}
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
            {/* Filter Row */}
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-6 py-2">
                {/* No filter for ID */}
              </th>
              <th className="px-6 py-2">
                <SelectColumnFilter
                  value={filterAction}
                  onChange={(val) => setFilterAction(val === '' || val === 0 ? '' : val as number)}
                  options={auditActions.map(action => ({
                    value: action.id,
                    label: action.name || action.code
                  }))}
                  placeholder="All Actions"
                />
              </th>
              <th className="px-6 py-2">
                <DateColumnFilter
                  value={filterCreatedAt}
                  onChange={setFilterCreatedAt}
                  placeholder="YYYY-MM-DD"
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterCreatedBy}
                  onChange={setFilterCreatedBy}
                  placeholder="Created by..."
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterOldValues}
                  onChange={setFilterOldValues}
                  placeholder="Search old values..."
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterNewValues}
                  onChange={setFilterNewValues}
                  placeholder="Search new values..."
                />
              </th>
              <th className="px-6 py-2">
                <TextColumnFilter
                  value={filterNotes}
                  onChange={setFilterNotes}
                  placeholder="Search notes..."
                />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedAudits.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('audits.noAudits')}
                </td>
              </tr>
            ) : (
              filteredAndSortedAudits.map((audit) => (
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
