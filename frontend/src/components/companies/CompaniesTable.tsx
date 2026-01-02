/**
 * CompaniesTable Component - Display and manage companies with sorting/filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle, Edit, Trash2, Save, X } from 'lucide-react';
import type { Company } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

export interface CompaniesTableProps {
  companies: Company[];
  isLoading?: boolean;
  error?: string | null;
  onCompanySelect?: (company: Company) => void;
  selectedCompanyId?: number;
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  statuses?: LookupItem[];
}

type SortField = 'company_id' | 'company_name';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterState {
  companyId: string;
  companyName: string;
  status: string;
}

export const CompaniesTable: React.FC<CompaniesTableProps> = ({
  companies,
  isLoading = false,
  error = null,
  onCompanySelect,
  selectedCompanyId,
  onEdit,
  onDelete,
  statuses = [],
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const [filters, setFilters] = useState<FilterState>({
    companyId: '',
    companyName: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Company>>({});

  // Start editing a row
  const handleStartEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm({ ...company });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  // Save changes
  const handleSaveEdit = () => {
    if (editingId && onEdit) {
      onEdit(editForm as Company);
    }
    setEditingId(null);
    setEditForm({});
  };

  // Helper functions
  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
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

  // Filtering and sorting
  const filteredAndSortedCompanies = useMemo(() => {
    let result = [...companies];

    // Apply filters
    if (filters.companyId) {
      result = result.filter(c =>
        c.company_id.toLowerCase().includes(filters.companyId.toLowerCase())
      );
    }
    if (filters.companyName) {
      result = result.filter(c =>
        c.company_name.toLowerCase().includes(filters.companyName.toLowerCase())
      );
    }
    if (filters.status) {
      result = result.filter(c => {
        const statusName = getStatusName(c.object_status_id).toLowerCase();
        return statusName.includes(filters.status.toLowerCase());
      });
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof Company;
        const aVal = a[field] || '';
        const bVal = b[field] || '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [companies, filters, sortState]);

  const clearFilters = () => {
    setFilters({
      companyId: '',
      companyName: '',
      status: '',
    });
  };

  const hasActiveFilters = filters.companyId || filters.companyName || filters.status;

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
      {/* Filter Toggle and Clear */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? t('lookup.hideFilters') : t('lookup.filters')}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
            >
              <XCircle className="h-4 w-4" />
              {t('lookup.clearFilters')}
            </Button>
          )}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {filteredAndSortedCompanies.length} {filteredAndSortedCompanies.length === 1 ? t('lookup.items') : t('lookup.itemsPlural')}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder={t('companies.filterByCompanyId')}
              value={filters.companyId}
              onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={t('companies.filterByCompanyName')}
              value={filters.companyName}
              onChange={(e) => setFilters(prev => ({ ...prev, companyName: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('forms.status')}...`}
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('company_id')}
              >
                <div className="flex items-center gap-2">
                  {t('companies.companyId')}
                  {getSortIcon('company_id')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('company_name')}
              >
                <div className="flex items-center gap-2">
                  {t('companies.companyName')}
                  {getSortIcon('company_name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('forms.status')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('lookup.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedCompanies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? t('lookup.noResultsMatch') : t('lookup.noDataAvailable')}
                </td>
              </tr>
            ) : (
              filteredAndSortedCompanies.map((company) => {
                const isEditing = editingId === company.id;

                return (
                  <tr
                    key={company.id}
                    onClick={() => !isEditing && onCompanySelect?.(company)}
                    className={`${!isEditing ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'bg-yellow-50 dark:bg-yellow-900/20'} transition-colors ${
                      selectedCompanyId === company.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm.company_id || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, company_id: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[150px]"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{company.company_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm.company_name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, company_name: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[200px]"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{company.company_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <select
                          value={editForm.object_status_id?.toString() || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, object_status_id: parseInt(e.target.value) || undefined }))}
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                        >
                          <option value="">-</option>
                          {statuses.map(s => (
                            <option key={s.id} value={s.id}>{s.name || s.code}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{getStatusName(company.object_status_id)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit();
                              }}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEdit();
                              }}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            {onEdit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(company);
                                }}
                                className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(company);
                                }}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
