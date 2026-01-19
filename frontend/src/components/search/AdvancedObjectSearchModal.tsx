/**
 * AdvancedObjectSearchModal Component
 *
 * Universal object search modal with filters
 * Features:
 * - Search by query string
 * - Filter by object types (multi-select)
 * - Filter by object statuses
 * - Paginated results table
 * - Returns selected object to parent
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { objectRelationApi, lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { ObjectSearchResult, ObjectSearchRequest } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AdvancedObjectSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (object: ObjectSearchResult) => void;
  allowedObjectTypeIds?: number[]; // Filter to specific object types
  title?: string;
}

export default function AdvancedObjectSearchModal({
  isOpen,
  onClose,
  onSelect,
  allowedObjectTypeIds,
  title = 'Search Objects',
}: AdvancedObjectSearchModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<number[]>(allowedObjectTypeIds || []);
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [objectStatuses, setObjectStatuses] = useState<LookupItem[]>([]);
  const [results, setResults] = useState<ObjectSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 20;

  // Load lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [typesRes, statusesRes] = await Promise.all([
          lookupApi.getObjectTypes(language),
          lookupApi.getObjectStatuses(undefined, language),
        ]);

        const types = typesRes?.data || [];
        const statuses = statusesRes?.data || [];

        setObjectTypes(Array.isArray(types) ? types : []);
        setObjectStatuses(Array.isArray(statuses) ? statuses : []);
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };

    if (isOpen) {
      loadLookups();
    }
  }, [isOpen, language]);

  // Perform search
  const handleSearch = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchRequest: ObjectSearchRequest = {
        query: searchQuery.trim() || undefined,
        object_type_ids: selectedObjectTypes.length > 0 ? selectedObjectTypes : undefined,
        page,
        per_page: perPage,
      };

      const response = await objectRelationApi.searchObjects(searchRequest);

      if (response.success && response.data) {
        setResults(response.data);
        setTotalPages(response.pagination?.total_pages || 1);
      } else {
        setResults([]);
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to search objects');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedObjectTypes, page, perPage]);

  // Auto-search on mount and when filters change
  useEffect(() => {
    if (isOpen) {
      handleSearch();
    }
  }, [isOpen, page, handleSearch]);

  // Handle object type toggle
  const handleToggleObjectType = (typeId: number) => {
    setSelectedObjectTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
    setPage(1); // Reset to first page
  };

  // Handle select
  const handleSelectObject = (object: ObjectSearchResult) => {
    onSelect(object);
    onClose();
  };

  // Reset and close
  const handleClose = () => {
    setSearchQuery('');
    setSelectedObjectTypes(allowedObjectTypeIds || []);
    setResults([]);
    setPage(1);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b dark:border-gray-700 space-y-3">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by name, email, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="primary" onClick={handleSearch}>
              <Search className="h-4 w-4" />
              {t('common.search')}
            </Button>
          </div>

          {/* Object Type Filters */}
          {!allowedObjectTypeIds && objectTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                {t('relations.filterByObjectType')}
              </label>
              <div className="flex flex-wrap gap-2">
                {objectTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleToggleObjectType(type.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedObjectTypes.includes(type.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type.name || type.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && <Alert variant="error">{error}</Alert>}

          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('common.noResultsFound')}
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleSelectObject(obj)}
                  className="w-full text-left p-3 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {obj.display_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {obj.object_type_name} • ID: {obj.id}
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">
                      {t('common.select')}
                    </Button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('common.previous')}
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
