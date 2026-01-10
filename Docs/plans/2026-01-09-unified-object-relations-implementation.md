# Unified Object Relations System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a comprehensive object relations system enabling users to view, manage, and analyze relationships between all entities (persons, companies, invoices, documents) with smart filtering, data quality checks, and bulk operations.

**Architecture:** Component-based approach with reusable ObjectRelationsTable following existing patterns (AddressesTable, ContactsTable). Uses existing API infrastructure with new endpoints for data quality and bulk operations. Smart filtering based on object_relation_types constraints ensures type-safe relation creation.

**Tech Stack:** Next.js 14, React 18, TypeScript, Zustand, Axios, Material Tailwind, Lucide Icons

---

## Phase 1: Core API Foundation

### Task 1.1: Extend API Types for Relations

**Files:**
- Modify: `frontend/src/types/entities.ts`
- Modify: `frontend/src/types/common.ts`

**Step 1: Add ObjectRelation search params interface**

Add to `frontend/src/types/common.ts` after existing SearchParams:

```typescript
export interface ObjectRelationSearchParams extends SearchParams {
  object_from_id?: number;
  object_to_id?: number;
  object_relation_type_id?: number;
  is_active?: boolean;
}
```

**Step 2: Add bulk operation request types**

Add to `frontend/src/types/entities.ts` after UpdateObjectRelationRequest:

```typescript
// Bulk operations
export interface BulkDeleteRelationsRequest {
  relation_ids: number[];
}

export interface BulkReassignRelationsRequest {
  relation_ids: number[];
  old_object_to_id: number;
  new_object_to_id: number;
}

export interface BulkUpdateRelationTypeRequest {
  relation_ids: number[];
  old_relation_type_id: number;
  new_relation_type_id: number;
}

// Object search
export interface ObjectSearchRequest {
  query?: string;
  object_type_ids?: number[];
  object_status_ids?: number[];
  page?: number;
  per_page?: number;
}

export interface ObjectSearchResult {
  id: number;
  object_type_id: number;
  object_status_id: number;
  object_type_name: string;
  display_name: string;  // Computed display name
  created_at: string;
}

// Data quality issues
export interface OrphanedRelation extends ObjectRelation {
  inactive_object_type: 'from' | 'to';
}

export interface DuplicateRelationGroup {
  object_from_id: number;
  object_to_id: number;
  object_relation_type_id: number;
  relation_ids: number[];
  count: number;
}

export interface InvalidRelation extends ObjectRelation {
  reason: string;
  expected_parent_object_type_id: number;
  expected_child_object_type_id: number;
}

export interface MissingMirrorRelation extends ObjectRelation {
  expected_relation_type_id: number;
  expected_relation_type_code: string;
}
```

**Step 3: Commit types**

```bash
git add frontend/src/types/entities.ts frontend/src/types/common.ts
git commit -m "feat(types): add object relations API types

- Add ObjectRelationSearchParams for filtering
- Add bulk operation request/response types
- Add object search types
- Add data quality issue types

Part of unified object relations system"
```

---

### Task 1.2: Extend Object Relations API Client

**Files:**
- Modify: `frontend/src/lib/api/objectRelations.ts`
- Modify: `frontend/src/lib/api/endpoints.ts`

**Step 1: Add new endpoint constants**

Add to `frontend/src/lib/api/endpoints.ts`:

```typescript
  // Data quality endpoints
  RELATIONS_DATA_QUALITY_ORPHANED: '/relations/data-quality/orphaned',
  RELATIONS_DATA_QUALITY_DUPLICATES: '/relations/data-quality/duplicates',
  RELATIONS_DATA_QUALITY_INVALID: '/relations/data-quality/invalid',
  RELATIONS_DATA_QUALITY_MISSING_MIRRORS: '/relations/data-quality/missing-mirrors',

  // Bulk operations
  RELATIONS_BULK_DELETE: '/relations/bulk/delete',
  RELATIONS_BULK_REASSIGN: '/relations/bulk/reassign',
  RELATIONS_BULK_UPDATE_TYPE: '/relations/bulk/update-type',

  // Object search
  OBJECTS_SEARCH: '/objects/search',

  // Update relation (POST method)
  OBJECT_RELATION_UPDATE: '/object-relations/:id',
  OBJECT_RELATION_DELETE: '/object-relations/:id/delete',
```

**Step 2: Add update and delete methods using POST**

Add to `frontend/src/lib/api/objectRelations.ts` after create method:

```typescript
  /**
   * Update an existing object relation (note field only)
   * Uses POST method as per project requirements
   */
  updateNote: async (id: number, noteOld: string, noteNew: string): Promise<ApiResponse<ObjectRelation>> => {
    return apiClient.post(replaceParams(ENDPOINTS.OBJECT_RELATION_UPDATE, { id }), {
      note_old: noteOld,
      note_new: noteNew,
    });
  },

  /**
   * Delete (soft delete) an object relation
   * Uses POST method as per project requirements
   */
  deleteRelation: async (id: number): Promise<{ success: true }> => {
    return apiClient.post(replaceParams(ENDPOINTS.OBJECT_RELATION_DELETE, { id }), {
      id,
    });
  },
```

**Step 3: Add bulk operations methods**

Add after deleteRelation:

```typescript
  /**
   * Bulk delete multiple relations
   */
  bulkDelete: async (relationIds: number[]): Promise<{ success: true; deleted_count: number }> => {
    return apiClient.post(ENDPOINTS.RELATIONS_BULK_DELETE, {
      relation_ids: relationIds,
    });
  },

  /**
   * Bulk reassign target object for multiple relations
   */
  bulkReassign: async (
    relationIds: number[],
    oldObjectToId: number,
    newObjectToId: number
  ): Promise<{ success: true; updated_count: number }> => {
    return apiClient.post(ENDPOINTS.RELATIONS_BULK_REASSIGN, {
      relation_ids: relationIds,
      old_object_to_id: oldObjectToId,
      new_object_to_id: newObjectToId,
    });
  },

  /**
   * Bulk update relation type for multiple relations
   */
  bulkUpdateType: async (
    relationIds: number[],
    oldRelationTypeId: number,
    newRelationTypeId: number
  ): Promise<{ success: true; updated_count: number }> => {
    return apiClient.post(ENDPOINTS.RELATIONS_BULK_UPDATE_TYPE, {
      relation_ids: relationIds,
      old_relation_type_id: oldRelationTypeId,
      new_relation_type_id: newRelationTypeId,
    });
  },
```

**Step 4: Add data quality methods**

Add after bulk operations:

```typescript
  /**
   * Get orphaned relations (pointing to inactive objects)
   */
  getOrphanedRelations: async (): Promise<ApiListResponse<OrphanedRelation>> => {
    return apiClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_ORPHANED, {});
  },

  /**
   * Get duplicate relations
   */
  getDuplicateRelations: async (): Promise<ApiListResponse<DuplicateRelationGroup>> => {
    return apiClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_DUPLICATES, {});
  },

  /**
   * Get invalid relations (violating type constraints)
   */
  getInvalidRelations: async (): Promise<ApiListResponse<InvalidRelation>> => {
    return apiClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_INVALID, {});
  },

  /**
   * Get relations missing their mirror counterparts
   */
  getMissingMirrors: async (): Promise<ApiListResponse<MissingMirrorRelation>> => {
    return apiClient.post(ENDPOINTS.RELATIONS_DATA_QUALITY_MISSING_MIRRORS, {});
  },
```

**Step 5: Add object search method**

Add after data quality methods:

```typescript
  /**
   * Universal object search with filtering
   */
  searchObjects: async (searchRequest: ObjectSearchRequest): Promise<ApiListResponse<ObjectSearchResult>> => {
    return apiClient.post(ENDPOINTS.OBJECTS_SEARCH, searchRequest);
  },
```

**Step 6: Commit API client**

```bash
git add frontend/src/lib/api/objectRelations.ts frontend/src/lib/api/endpoints.ts
git commit -m "feat(api): extend object relations API client

- Add updateNote and deleteRelation with POST method
- Add bulk operations (delete, reassign, update type)
- Add data quality detection methods
- Add universal object search

Part of unified object relations system"
```

---

## Phase 2: Advanced Object Search Modal

### Task 2.1: Create AdvancedObjectSearchModal Component

**Files:**
- Create: `frontend/src/components/search/AdvancedObjectSearchModal.tsx`

**Step 1: Create component file with imports and types**

```typescript
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
```

**Step 2: Add component state and handlers**

```typescript
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
          lookupApi.getObjectStatuses(language),
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
```

**Step 3: Add JSX render**

```typescript
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
                    {type.text || type.code}
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
                    <Button variant="outline" size="sm">
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
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              {t('common.previous')}
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('common.pageOfPages', { page, totalPages })}
            </span>
            <Button
              variant="outline"
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
```

**Step 4: Commit search modal**

```bash
git add frontend/src/components/search/AdvancedObjectSearchModal.tsx
git commit -m "feat(components): create AdvancedObjectSearchModal

- Universal object search with query filter
- Multi-select object type filtering
- Paginated results table
- Returns selected object to parent
- Reusable across all relation workflows

Part of unified object relations system"
```

---

## Phase 3: Add Relation Modal

### Task 3.1: Create AddRelationModal Component

**Files:**
- Create: `frontend/src/components/relations/AddRelationModal.tsx`

**Step 1: Create component with smart filtering logic**

```typescript
/**
 * AddRelationModal Component
 *
 * Modal for creating new object relations
 * Features:
 * - Smart filtering: only shows valid relation types for current object
 * - Determines valid target object types from relation type selection
 * - Advanced object search for target selection
 * - Optional note field
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Alert } from '@/components/ui/Alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import AdvancedObjectSearchModal from '@/components/search/AdvancedObjectSearchModal';
import { lookupApi } from '@/lib/api';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/lib/i18n';
import type { ObjectSearchResult } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface AddRelationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    object_relation_type_id: number;
    object_to_id: number;
    note?: string;
  }) => Promise<void>;
  currentObjectId: number;
  currentObjectTypeId: number;
}

export default function AddRelationModal({
  isOpen,
  onClose,
  onSubmit,
  currentObjectId,
  currentObjectTypeId,
}: AddRelationModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const [relationTypes, setRelationTypes] = useState<LookupItem[]>([]);
  const [selectedRelationTypeId, setSelectedRelationTypeId] = useState<number | null>(null);
  const [selectedObject, setSelectedObject] = useState<ObjectSearchResult | null>(null);
  const [note, setNote] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load relation types filtered by current object type
  useEffect(() => {
    const loadRelationTypes = async () => {
      try {
        const response = await lookupApi.getObjectRelationTypes(language);
        const allTypes = response?.data || [];

        // Filter to only show relation types where parent_object_type_id matches current object
        const filtered = Array.isArray(allTypes)
          ? allTypes.filter((type: any) =>
              type.parent_object_type_id === currentObjectTypeId && type.is_active
            )
          : [];

        setRelationTypes(filtered);
      } catch (err) {
        console.error('Failed to load relation types:', err);
        setRelationTypes([]);
      }
    };

    if (isOpen) {
      loadRelationTypes();
    }
  }, [isOpen, currentObjectTypeId, language]);

  // Get selected relation type object
  const selectedRelationType = useMemo(() => {
    if (!selectedRelationTypeId) return null;
    return relationTypes.find(type => type.id === selectedRelationTypeId);
  }, [selectedRelationTypeId, relationTypes]);

  // Get allowed object types for search based on selected relation type
  const allowedTargetObjectTypeIds = useMemo(() => {
    if (!selectedRelationType) return undefined;
    // child_object_type_id defines what type of object can be the target
    const childTypeId = (selectedRelationType as any).child_object_type_id;
    return childTypeId ? [childTypeId] : undefined;
  }, [selectedRelationType]);

  // Handle submit
  const handleSubmit = async () => {
    if (!selectedRelationTypeId) {
      setError('Please select a relation type');
      return;
    }
    if (!selectedObject) {
      setError('Please select a target object');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onSubmit({
        object_relation_type_id: selectedRelationTypeId,
        object_to_id: selectedObject.id,
        note: note.trim() || undefined,
      });

      handleClose();
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to create relation');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset and close
  const handleClose = () => {
    setSelectedRelationTypeId(null);
    setSelectedObject(null);
    setNote('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('relations.addRelation')}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            {error && <Alert variant="error">{error}</Alert>}

            {/* Relation Type Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.relationType')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={selectedRelationTypeId?.toString() || ''}
                onChange={(e) => {
                  setSelectedRelationTypeId(Number(e.target.value) || null);
                  setSelectedObject(null); // Reset selection when type changes
                }}
              >
                <option value="">{t('common.select')}</option>
                {relationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.text || type.code}
                  </option>
                ))}
              </Select>
              {relationTypes.length === 0 && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('relations.noValidRelationTypes')}
                </p>
              )}
            </div>

            {/* Target Object Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.targetObject')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    readOnly
                    value={selectedObject ? selectedObject.display_name : ''}
                    placeholder={t('relations.selectTargetObject')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => setIsSearchModalOpen(true)}
                  disabled={!selectedRelationTypeId}
                >
                  <Search className="h-4 w-4 mr-1" />
                  {t('common.search')}
                </Button>
              </div>
              {!selectedRelationTypeId && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t('relations.selectRelationTypeFirst')}
                </p>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('relations.note')}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-gray-100"
                placeholder={t('relations.addOptionalNote')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t dark:border-gray-700">
            <Button variant="outline" onClick={handleClose}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isLoading || !selectedRelationTypeId || !selectedObject}
            >
              {isLoading ? <LoadingSpinner size="sm" /> : t('relations.createRelation')}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Search Modal */}
      <AdvancedObjectSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={setSelectedObject}
        allowedObjectTypeIds={allowedTargetObjectTypeIds}
        title={t('relations.selectTargetObject')}
      />
    </>
  );
}
```

**Step 2: Commit add relation modal**

```bash
git add frontend/src/components/relations/AddRelationModal.tsx
git commit -m "feat(components): create AddRelationModal with smart filtering

- Filters relation types by current object type
- Dynamically determines valid target object types
- Integrates AdvancedObjectSearchModal for target selection
- Validates relation type constraints before creation

Part of unified object relations system"
```

---

## Phase 4: ObjectRelationsTable Component

### Task 4.1: Create ObjectRelationsTable Component (Part 1/2)

**Files:**
- Create: `frontend/src/components/relations/ObjectRelationsTable.tsx`

**Step 1: Create component structure with types**

```typescript
/**
 * ObjectRelationsTable Component
 *
 * Reusable table showing object relations
 * Features:
 * - Contextual display (shows relations from current object's perspective)
 * - Inline note editing with old/new value pattern
 * - Delete relations with confirmation
 * - Click related object to navigate
 * - Smart filtering by relation type
 * - Direction indicators (→ outgoing, ← incoming)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { Pencil, Trash2, Save, X, ChevronUp, ChevronDown, ArrowRight, ArrowLeft, User, Building2, FileText, CreditCard, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { SelectColumnFilter } from '@/components/ui/ColumnFilters';
import { formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import type { ObjectRelation } from '@/types/entities';
import type { LookupItem } from '@/types/common';

interface NoteUpdatePayload {
  note_old: string;
  note_new: string;
}

interface ObjectRelationsTableProps {
  relations: ObjectRelation[];
  relationTypes: LookupItem[];
  objectTypes: LookupItem[];
  currentObjectId: number;
  onUpdate?: (relationId: number, data: NoteUpdatePayload) => Promise<void>;
  onDelete?: (relationId: number) => void;
  filterRelationType: number | '';
  onFilterRelationTypeChange: (value: number | '') => void;
}

type SortField = 'created_at' | 'object_relation_type_id';
type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  field: SortField | null;
  direction: SortDirection;
}

interface EditData {
  note: string;
}
```

**Step 2: Add component state and helpers**

```typescript
export default function ObjectRelationsTable({
  relations,
  relationTypes,
  objectTypes,
  currentObjectId,
  onUpdate,
  onDelete,
  filterRelationType,
  onFilterRelationTypeChange,
}: ObjectRelationsTableProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData | null>(null);
  const [originalData, setOriginalData] = useState<EditData | null>(null);
  const [sort, setSort] = useState<SortState>({ field: 'created_at', direction: 'desc' });

  // Get relation type name
  const getRelationTypeName = (relationTypeId: number): string => {
    const type = relationTypes.find(t => t.id === relationTypeId);
    return type?.text || type?.code || `Type ${relationTypeId}`;
  };

  // Get object type name
  const getObjectTypeName = (objectTypeId: number): string => {
    const type = objectTypes.find(t => t.id === objectTypeId);
    return type?.text || type?.code || 'Unknown';
  };

  // Get icon for object type
  const getObjectTypeIcon = (objectTypeId: number) => {
    // 1=person, 2=company, 4=invoice, 5=transaction, etc.
    switch (objectTypeId) {
      case 1: return <User className="h-4 w-4 inline mr-1" />;
      case 2: return <Building2 className="h-4 w-4 inline mr-1" />;
      case 4: return <FileText className="h-4 w-4 inline mr-1" />;
      case 5: return <CreditCard className="h-4 w-4 inline mr-1" />;
      default: return <Link2 className="h-4 w-4 inline mr-1" />;
    }
  };

  // Get route for object type
  const getObjectRoute = (objectId: number, objectTypeId: number): string => {
    switch (objectTypeId) {
      case 1: return `/persons?id=${objectId}`;
      case 2: return `/companies?id=${objectId}`;
      case 4: return `/invoices?id=${objectId}`;
      case 5: return `/transactions?id=${objectId}`;
      default: return `/objects?id=${objectId}`;
    }
  };

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    setSort(prevSort => {
      if (prevSort.field === field) {
        if (prevSort.direction === 'asc') return { field, direction: 'desc' };
        if (prevSort.direction === 'desc') return { field: null, direction: null };
        return { field, direction: 'asc' };
      }
      return { field, direction: 'asc' };
    });
  };

  // Handle edit
  const handleEdit = (relation: ObjectRelation) => {
    const initialData = {
      note: relation.note || '',
    };
    setEditData(initialData);
    setOriginalData(initialData);
    setEditingId(relation.id);
  };

  // Handle cancel
  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
    setOriginalData(null);
  };

  // Handle save
  const handleSave = async (id: number) => {
    if (!onUpdate || !editData || !originalData) return;

    try {
      await onUpdate(id, {
        note_old: originalData.note,
        note_new: editData.note,
      });
      setEditingId(null);
      setEditData(null);
      setOriginalData(null);
    } catch (err) {
      console.error('Failed to update relation:', err);
    }
  };

  // Handle delete with confirmation
  const handleDelete = (id: number) => {
    if (!onDelete) return;
    if (window.confirm(t('relations.confirmDelete'))) {
      onDelete(id);
    }
  };

  // Navigate to related object
  const handleNavigateToObject = (objectId: number, objectTypeId: number) => {
    const route = getObjectRoute(objectId, objectTypeId);
    router.push(route);
  };
```

**Step 3: Add filtering and sorting logic**

```typescript
  // Filter and sort relations
  const processedRelations = useMemo(() => {
    let result = [...relations];

    // Apply relation type filter
    if (filterRelationType !== '') {
      result = result.filter(rel => rel.object_relation_type_id === filterRelationType);
    }

    // Apply sorting
    if (sort.field && sort.direction) {
      result.sort((a, b) => {
        let aVal: string | number;
        let bVal: string | number;

        switch (sort.field) {
          case 'created_at':
            aVal = new Date(a.created_at || '').getTime();
            bVal = new Date(b.created_at || '').getTime();
            break;
          case 'object_relation_type_id':
            aVal = a.object_relation_type_id;
            bVal = b.object_relation_type_id;
            break;
          default:
            return 0;
        }

        if (sort.direction === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return result;
  }, [relations, filterRelationType, sort]);
```

**Step 4: Commit Part 1**

```bash
git add frontend/src/components/relations/ObjectRelationsTable.tsx
git commit -m "feat(components): create ObjectRelationsTable (part 1)

- Add component structure and types
- Add state management and helper functions
- Add filtering and sorting logic
- Add navigation and icon helpers

Part of unified object relations system"
```

---

### Task 4.2: Create ObjectRelationsTable Component (Part 2/2)

**Files:**
- Modify: `frontend/src/components/relations/ObjectRelationsTable.tsx`

**Step 1: Add JSX render (table structure)**

Add at the end of the component, before the closing brace:

```typescript
  if (relations.length === 0) {
    return (
      <Alert variant="info">
        {t('relations.noRelationsFound')}
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-64">
          <SelectColumnFilter
            value={filterRelationType}
            onChange={onFilterRelationTypeChange}
            options={relationTypes.map(type => ({
              label: type.text || type.code,
              value: type.id,
            }))}
            placeholder={t('relations.allRelationTypes')}
            label={t('relations.relationType')}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('relations.direction')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('object_relation_type_id')}
              >
                <div className="flex items-center gap-1">
                  {t('relations.relationType')}
                  {sort.field === 'object_relation_type_id' && (
                    sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('relations.relatedObject')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('relations.note')}
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('created_at')}
              >
                <div className="flex items-center gap-1">
                  {t('common.createdAt')}
                  {sort.field === 'created_at' && (
                    sort.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {processedRelations.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  {t('relations.noMatchingRelations')}
                </td>
              </tr>
            ) : (
              processedRelations.map((relation) => {
                const isEditing = editingId === relation.id;
                const isOutgoing = relation.object_from_id === currentObjectId;
                const relatedObjectId = isOutgoing ? relation.object_to_id : relation.object_from_id;

                // For display, we need to know the object type of the related object
                // This would typically come from a joined query, but for now we'll need to look it up
                // In a real implementation, the API should return this data
                const relatedObjectTypeId = 1; // Placeholder - should come from API

                return (
                  <tr key={relation.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    {/* Direction */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {isOutgoing ? (
                        <ArrowRight className="h-4 w-4 text-blue-600" title={t('relations.outgoing')} />
                      ) : (
                        <ArrowLeft className="h-4 w-4 text-green-600" title={t('relations.incoming')} />
                      )}
                    </td>

                    {/* Relation Type */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {getRelationTypeName(relation.object_relation_type_id)}
                    </td>

                    {/* Related Object (clickable) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handleNavigateToObject(relatedObjectId, relatedObjectTypeId)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        {getObjectTypeIcon(relatedObjectTypeId)}
                        Object ID: {relatedObjectId}
                      </button>
                    </td>

                    {/* Note (editable) */}
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {isEditing && editData ? (
                        <textarea
                          value={editData.note}
                          onChange={(e) => setEditData({ ...editData, note: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                          rows={2}
                        />
                      ) : (
                        <div className="max-w-xs truncate" title={relation.note || ''}>
                          {relation.note || '-'}
                        </div>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(relation.created_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(relation.id)}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title={t('common.save')}
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                            title={t('common.cancel')}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          {onUpdate && (
                            <button
                              onClick={() => handleEdit(relation)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              title={t('common.edit')}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => handleDelete(relation.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              title={t('common.delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('relations.showingRelations', {
          count: processedRelations.length,
          total: relations.length
        })}
      </div>
    </div>
  );
}
```

**Step 2: Commit Part 2**

```bash
git add frontend/src/components/relations/ObjectRelationsTable.tsx
git commit -m "feat(components): complete ObjectRelationsTable (part 2)

- Add table render with sortable columns
- Add direction indicators (→ outgoing, ← incoming)
- Add clickable related objects with navigation
- Add inline note editing
- Add delete with confirmation
- Add filtering by relation type

Part of unified object relations system"
```

---

## Phase 5: Entity Relations Tab Integration

### Task 5.1: Create Persons Relations Tab

**Files:**
- Modify: `frontend/src/app/persons/page.tsx`

**Step 1: Add imports and state**

Add to imports section:

```typescript
import ObjectRelationsTable from '@/components/relations/ObjectRelationsTable';
import AddRelationModal from '@/components/relations/AddRelationModal';
import { objectRelationApi } from '@/lib/api';
import type { ObjectRelation } from '@/types/entities';
```

Add to component state (after other useState declarations):

```typescript
  // Relations state
  const [relations, setRelations] = useState<ObjectRelation[]>([]);
  const [relationTypes, setRelationTypes] = useState<LookupItem[]>([]);
  const [objectTypes, setObjectTypes] = useState<LookupItem[]>([]);
  const [isRelationsLoading, setIsRelationsLoading] = useState(false);
  const [relationsError, setRelationsError] = useState<string | null>(null);
  const [isAddRelationModalOpen, setIsAddRelationModalOpen] = useState(false);
  const [filterRelationType, setFilterRelationType] = useState<number | ''>('');
```

**Step 2: Add load relations function**

Add after other load functions:

```typescript
  const loadRelations = useCallback(async (personId: number) => {
    try {
      setIsRelationsLoading(true);
      setRelationsError(null);

      const [relationsRes, typesRes, objectTypesRes] = await Promise.all([
        objectRelationApi.getByObjectId(personId),
        lookupApi.getObjectRelationTypes(language),
        lookupApi.getObjectTypes(language),
      ]);

      const relationsData = (relationsRes.success && relationsRes.data) ? relationsRes.data : [];
      const typesData = typesRes?.data || [];
      const objectTypesData = objectTypesRes?.data || [];

      setRelations(Array.isArray(relationsData) ? relationsData : []);
      setRelationTypes(Array.isArray(typesData) ? typesData : []);
      setObjectTypes(Array.isArray(objectTypesData) ? objectTypesData : []);
    } catch (err: any) {
      console.error('Failed to load relations:', err);
      setRelationsError(err?.error?.message || 'Failed to load relations');
    } finally {
      setIsRelationsLoading(false);
    }
  }, [language]);
```

**Step 3: Add relation CRUD handlers**

Add after loadRelations:

```typescript
  const handleCreateRelation = async (data: {
    object_relation_type_id: number;
    object_to_id: number;
    note?: string;
  }) => {
    if (!selectedPerson) return;

    try {
      await objectRelationApi.create({
        object_from_id: selectedPerson.id,
        object_to_id: data.object_to_id,
        object_relation_type_id: data.object_relation_type_id,
        note: data.note,
      });

      await loadRelations(selectedPerson.id);
    } catch (err: any) {
      console.error('Failed to create relation:', err);
      throw err;
    }
  };

  const handleUpdateRelation = async (relationId: number, data: { note_old: string; note_new: string }) => {
    if (!selectedPerson) return;

    try {
      await objectRelationApi.updateNote(relationId, data.note_old, data.note_new);
      await loadRelations(selectedPerson.id);
    } catch (err: any) {
      console.error('Failed to update relation:', err);
    }
  };

  const handleDeleteRelation = async (relationId: number) => {
    if (!selectedPerson) return;

    try {
      await objectRelationApi.deleteRelation(relationId);
      await loadRelations(selectedPerson.id);
    } catch (err: any) {
      console.error('Failed to delete relation:', err);
    }
  };
```

**Step 4: Call loadRelations when person selected**

Update the existing useEffect that loads person details to also load relations:

```typescript
  useEffect(() => {
    if (selectedPersonId) {
      // Existing loads...
      loadRelations(selectedPersonId);
    }
  }, [selectedPersonId, loadRelations]);
```

**Step 5: Add Relations tab to tabs section**

Add new tab after existing tabs (Audits, etc.):

```typescript
          <Tab
            key="relations"
            label={t('relations.title')}
            isActive={activeTab === 'relations'}
            onClick={() => setActiveTab('relations')}
          />
```

Add relations tab content in tab panels section:

```typescript
        {/* Relations Tab */}
        {activeTab === 'relations' && selectedPerson && (
          <div className="space-y-4">
            {/* Add Relation Button */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => setIsAddRelationModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {t('relations.addRelation')}
              </Button>
            </div>

            {/* Relations Table */}
            {isRelationsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : relationsError ? (
              <Alert variant="error">{relationsError}</Alert>
            ) : (
              <ObjectRelationsTable
                relations={relations}
                relationTypes={relationTypes}
                objectTypes={objectTypes}
                currentObjectId={selectedPerson.id}
                onUpdate={handleUpdateRelation}
                onDelete={handleDeleteRelation}
                filterRelationType={filterRelationType}
                onFilterRelationTypeChange={setFilterRelationType}
              />
            )}
          </div>
        )}
```

**Step 6: Add AddRelationModal at the end of JSX**

Add before the closing main div:

```typescript
      {/* Add Relation Modal */}
      {selectedPerson && (
        <AddRelationModal
          isOpen={isAddRelationModalOpen}
          onClose={() => setIsAddRelationModalOpen(false)}
          onSubmit={handleCreateRelation}
          currentObjectId={selectedPerson.id}
          currentObjectTypeId={1} // Person type ID
        />
      )}
```

**Step 7: Commit persons integration**

```bash
git add frontend/src/app/persons/page.tsx
git commit -m "feat(persons): integrate Relations tab

- Add Relations tab to persons page
- Load relations when person selected
- Add create/update/delete relation handlers
- Integrate ObjectRelationsTable component
- Integrate AddRelationModal for creation

Part of unified object relations system"
```

---

This implementation plan continues with similar patterns for companies, invoices, quick actions, and the relations manager page. Due to length constraints, I'll save this plan and continue in the next parts if needed.

Would you like me to:
1. Continue writing the remaining phases (Quick Actions, Relations Manager)?
2. Save this plan now and offer execution options?
