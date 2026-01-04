/**
 * DocumentsTable Component - Display and manage documents with sorting/filtering
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ArrowUp, ArrowDown, ArrowUpDown, Filter, XCircle, Edit, Trash2, Save, X } from 'lucide-react';
import type { Document, UpdateDocumentRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';
import { useTranslation } from '@/lib/i18n';
import { formatDate } from '@/lib/utils';

export interface DocumentsTableProps {
  documents: Document[];
  isLoading?: boolean;
  error?: string | null;
  onDocumentSelect?: (document: Document) => void;
  selectedDocumentId?: number;
  onEdit?: (document: Document) => void;
  onUpdate?: (id: number, data: UpdateDocumentRequest) => Promise<void>;
  onDelete?: (document: Document) => void;
  documentTypes?: LookupItem[];
  statuses?: LookupItem[];
}

type SortField = 'title' | 'document_number' | 'document_date' | 'expiry_date' | 'issuer';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface FilterState {
  title: string;
  documentType: string;
  documentNumber: string;
  issuer: string;
  status: string;
}

interface EditFormData {
  title: string;
  description: string;
  document_type_id?: number;
  document_date: string;
  document_number: string;
  expiry_date: string;
  issuer: string;
  reference_number: string;
  external_reference: string;
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  isLoading = false,
  error = null,
  onDocumentSelect,
  selectedDocumentId,
  onEdit,
  onUpdate,
  onDelete,
  documentTypes = [],
  statuses = [],
}) => {
  const { t } = useTranslation();
  const [sortState, setSortState] = useState<SortState>({ field: null, direction: null });
  const [filters, setFilters] = useState<FilterState>({
    title: '',
    documentType: '',
    documentNumber: '',
    issuer: '',
    status: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditFormData | null>(null);
  const [originalData, setOriginalData] = useState<EditFormData | null>(null);

  // Start editing a row
  const handleStartEdit = (document: Document) => {
    const formData: EditFormData = {
      title: document.title,
      description: document.description || '',
      document_type_id: document.document_type_id,
      document_date: document.document_date || '',
      document_number: document.document_number || '',
      expiry_date: document.expiry_date || '',
      issuer: document.issuer || '',
      reference_number: document.reference_number || '',
      external_reference: document.external_reference || '',
    };
    setEditingId(document.id);
    setEditForm(formData);
    setOriginalData(formData);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
    setOriginalData(null);
  };

  // Save changes
  const handleSaveEdit = async () => {
    if (editingId && editForm && originalData && onUpdate) {
      const updatePayload: UpdateDocumentRequest = {
        title_old: originalData.title,
        title_new: editForm.title,
        description_old: originalData.description,
        description_new: editForm.description,
        document_type_id_old: originalData.document_type_id,
        document_type_id_new: editForm.document_type_id,
        document_date_old: originalData.document_date,
        document_date_new: editForm.document_date,
        document_number_old: originalData.document_number,
        document_number_new: editForm.document_number,
        expiry_date_old: originalData.expiry_date,
        expiry_date_new: editForm.expiry_date,
        issuer_old: originalData.issuer,
        issuer_new: editForm.issuer,
        reference_number_old: originalData.reference_number,
        reference_number_new: editForm.reference_number,
        external_reference_old: originalData.external_reference,
        external_reference_new: editForm.external_reference,
      };
      await onUpdate(editingId, updatePayload);
    }
    setEditingId(null);
    setEditForm(null);
    setOriginalData(null);
  };

  // Helper functions
  const getDocumentTypeName = (typeId?: number): string => {
    if (!typeId) return '-';
    const docType = documentTypes.find(t => t.id === typeId);
    return docType?.name || docType?.code || '-';
  };

  const getStatusName = (statusId?: number): string => {
    if (!statusId) return '-';
    const status = statuses.find(s => s.id === statusId);
    return status?.name || status?.code || '-';
  };

  // Sorting logic
  const handleSort = (field: SortField) => {
    setSortState(prev => {
      if (prev.field === field) {
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
  const filteredAndSortedDocuments = useMemo(() => {
    let result = [...documents];

    // Apply filters
    if (filters.title) {
      result = result.filter(d =>
        d.title.toLowerCase().includes(filters.title.toLowerCase())
      );
    }
    if (filters.documentType) {
      result = result.filter(d => {
        const typeName = getDocumentTypeName(d.document_type_id).toLowerCase();
        return typeName.includes(filters.documentType.toLowerCase());
      });
    }
    if (filters.documentNumber) {
      result = result.filter(d =>
        (d.document_number || '').toLowerCase().includes(filters.documentNumber.toLowerCase())
      );
    }
    if (filters.issuer) {
      result = result.filter(d =>
        (d.issuer || '').toLowerCase().includes(filters.issuer.toLowerCase())
      );
    }
    if (filters.status) {
      result = result.filter(d => {
        const statusName = getStatusName(d.object_status_id).toLowerCase();
        return statusName.includes(filters.status.toLowerCase());
      });
    }

    // Apply sorting
    if (sortState.field && sortState.direction) {
      result.sort((a, b) => {
        const field = sortState.field as keyof Document;
        const aVal = a[field] || '';
        const bVal = b[field] || '';

        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortState.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [documents, filters, sortState]);

  const clearFilters = () => {
    setFilters({
      title: '',
      documentType: '',
      documentNumber: '',
      issuer: '',
      status: '',
    });
  };

  const hasActiveFilters = filters.title || filters.documentType || filters.documentNumber ||
    filters.issuer || filters.status;

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
          {filteredAndSortedDocuments.length} {filteredAndSortedDocuments.length === 1 ? t('lookup.items') : t('lookup.itemsPlural')}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Input
              type="text"
              placeholder={`${t('documents.title')}...`}
              value={filters.title}
              onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('documents.documentType')}...`}
              value={filters.documentType}
              onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('documents.documentNumber')}...`}
              value={filters.documentNumber}
              onChange={(e) => setFilters(prev => ({ ...prev, documentNumber: e.target.value }))}
            />
            <Input
              type="text"
              placeholder={`${t('documents.issuer')}...`}
              value={filters.issuer}
              onChange={(e) => setFilters(prev => ({ ...prev, issuer: e.target.value }))}
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
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center gap-2">
                  {t('documents.title')}
                  {getSortIcon('title')}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('documents.documentType')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('document_number')}
              >
                <div className="flex items-center gap-2">
                  {t('documents.documentNumber')}
                  {getSortIcon('document_number')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('document_date')}
              >
                <div className="flex items-center gap-2">
                  {t('documents.documentDate')}
                  {getSortIcon('document_date')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('expiry_date')}
              >
                <div className="flex items-center gap-2">
                  {t('documents.expiryDate')}
                  {getSortIcon('expiry_date')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('issuer')}
              >
                <div className="flex items-center gap-2">
                  {t('documents.issuer')}
                  {getSortIcon('issuer')}
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
            {filteredAndSortedDocuments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? t('lookup.noResultsMatch') : t('lookup.noDataAvailable')}
                </td>
              </tr>
            ) : (
              filteredAndSortedDocuments.map((document) => {
                const isEditing = editingId === document.id;

                return (
                  <tr
                    key={document.id}
                    onClick={() => !isEditing && onDocumentSelect?.(document)}
                    className={`${!isEditing ? 'hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer' : 'bg-yellow-50 dark:bg-yellow-900/20'} transition-colors ${
                      selectedDocumentId === document.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                  >
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm?.title || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, title: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[150px]"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{document.title}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <select
                          value={editForm?.document_type_id?.toString() || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, document_type_id: parseInt(e.target.value) || undefined } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-gray-100 text-sm"
                        >
                          <option value="">-</option>
                          {documentTypes.map(t => (
                            <option key={t.id} value={t.id}>{t.name || t.code}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{getDocumentTypeName(document.document_type_id)}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm?.document_number || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, document_number: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[100px]"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{document.document_number || '-'}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm?.document_date || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, document_date: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{formatDate(document.document_date)}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="date"
                          value={editForm?.expiry_date || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, expiry_date: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{formatDate(document.expiry_date)}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <Input
                          type="text"
                          value={editForm?.issuer || ''}
                          onChange={(e) => setEditForm(prev => prev ? { ...prev, issuer: e.target.value } : null)}
                          onClick={(e) => e.stopPropagation()}
                          className="min-w-[120px]"
                        />
                      ) : (
                        <span className="text-gray-700 dark:text-gray-300">{document.issuer || '-'}</span>
                      )}
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-sm">
                      <span className="text-gray-700 dark:text-gray-300">{getStatusName(document.object_status_id)}</span>
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
                            {(onEdit || onUpdate) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(document);
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
                                  onDelete(document);
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
