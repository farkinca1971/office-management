/**
 * PersonsTable Component - Display and manage persons with sorting/filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle, Edit, Trash2 } from 'lucide-react';
import type { Person } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';

export interface PersonsTableProps {
  persons: Person[];
  isLoading?: boolean;
  error?: string | null;
  onPersonSelect?: (person: Person) => void;
  selectedPersonId?: number;
  onEdit?: (person: Person) => void;
  onDelete?: (person: Person) => void;
  salutations?: LookupItem[];
  sexes?: LookupItem[];
  statuses?: LookupItem[];
}

type SortField = 'id' | 'first_name' | 'last_name' | 'birth_date';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterState {
  firstName: string;
  lastName: string;
  motherName: string;
}

export const PersonsTable: React.FC<PersonsTableProps> = ({
  persons,
  isLoading = false,
  error = null,
  onPersonSelect,
  selectedPersonId,
  onEdit,
  onDelete,
  salutations = [],
  sexes = [],
  statuses = [],
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const [filters, setFilters] = useState<FilterState>({
    firstName: '',
    lastName: '',
    motherName: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Helper functions
  const getSalutationName = (salutationId?: number): string => {
    if (!salutationId) return '-';
    const salutation = salutations.find(s => s.id === salutationId);
    return salutation?.name || salutation?.code || '-';
  };

  const getSexName = (sexId?: number): string => {
    if (!sexId) return '-';
    const sex = sexes.find(s => s.id === sexId);
    return sex?.name || sex?.code || '-';
  };

  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
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

  // Filtering and sorting
  const filteredAndSortedPersons = useMemo(() => {
    let result = [...persons];

    // Apply filters
    if (filters.firstName) {
      result = result.filter(p =>
        p.first_name.toLowerCase().includes(filters.firstName.toLowerCase())
      );
    }
    if (filters.lastName) {
      result = result.filter(p =>
        p.last_name.toLowerCase().includes(filters.lastName.toLowerCase())
      );
    }
    if (filters.motherName) {
      result = result.filter(p =>
        (p.mother_name || '').toLowerCase().includes(filters.motherName.toLowerCase())
      );
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof Person;
        const aVal = a[field] || '';
        const bVal = b[field] || '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [persons, filters, sortState]);

  const clearFilters = () => {
    setFilters({
      firstName: '',
      lastName: '',
      motherName: '',
    });
  };

  const hasActiveFilters = filters.firstName || filters.lastName || filters.motherName;

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
          {filteredAndSortedPersons.length} {filteredAndSortedPersons.length === 1 ? t('lookup.items') : t('lookup.itemsPlural')}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder={t('persons.filterByFirstName')}
              value={filters.firstName}
              onChange={(e) => setFilters(prev => ({ ...prev, firstName: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={t('persons.filterByLastName')}
              value={filters.lastName}
              onChange={(e) => setFilters(prev => ({ ...prev, lastName: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={t('persons.filterByMotherName')}
              value={filters.motherName}
              onChange={(e) => setFilters(prev => ({ ...prev, motherName: e.target.value }))}
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
                onClick={() => handleSort('id')}
              >
                <div className="flex items-center gap-2">
                  {t('lookup.id')}
                  {getSortIcon('id')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('persons.salutation')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('first_name')}
              >
                <div className="flex items-center gap-2">
                  {t('persons.firstName')}
                  {getSortIcon('first_name')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('last_name')}
              >
                <div className="flex items-center gap-2">
                  {t('persons.lastName')}
                  {getSortIcon('last_name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('persons.motherName')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('persons.sex')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('birth_date')}
              >
                <div className="flex items-center gap-2">
                  {t('persons.birthDate')}
                  {getSortIcon('birth_date')}
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
            {filteredAndSortedPersons.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? t('lookup.noResultsMatch') : t('lookup.noDataAvailable')}
                </td>
              </tr>
            ) : (
              filteredAndSortedPersons.map((person) => (
                <tr
                  key={person.id}
                  onClick={() => onPersonSelect?.(person)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                    selectedPersonId === person.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {person.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getSalutationName(person.salutation_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {person.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {person.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {person.mother_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getSexName(person.sex_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(person.birth_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {getStatusName(person.object_status_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {onEdit && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(person);
                          }}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(person);
                          }}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
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
