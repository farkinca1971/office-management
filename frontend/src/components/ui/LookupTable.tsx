/**
 * LookupTable Component - Editable grid for lookup table data
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { Plus, Save, X, Trash2, Edit2 } from 'lucide-react';
import type { LookupItem } from '@/types/common';

export interface LookupTableProps {
  title: string;
  data: LookupItem[];
  isLoading?: boolean;
  error?: string | null;
  onLoad: () => Promise<void>;
  onCreate: (data: { code: string; is_active?: boolean }) => Promise<void>;
  onUpdate: (id: number, data: { code?: string; is_active?: boolean }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const LookupTable: React.FC<LookupTableProps> = ({
  title,
  data,
  isLoading = false,
  error = null,
  onLoad,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<{ code: string; is_active: boolean }>({ code: '', is_active: true });
  const [newItem, setNewItem] = useState<{ code: string; is_active: boolean }>({ code: '', is_active: true });
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const handleEdit = (item: LookupItem) => {
    setEditingId(item.id);
    setEditingData({ code: item.code, is_active: item.is_active });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({ code: '', is_active: true });
    setShowNewForm(false);
    setNewItem({ code: '', is_active: true });
  };

  const handleSave = async () => {
    if (editingId) {
      setSaving(true);
      try {
        await onUpdate(editingId, editingData);
        setEditingId(null);
        setEditingData({ code: '', is_active: true });
      } catch (err) {
        console.error('Failed to update:', err);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCreate = async () => {
    if (!newItem.code.trim()) return;
    setSaving(true);
    try {
      await onCreate(newItem);
      setShowNewForm(false);
      setNewItem({ code: '', is_active: true });
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeleting(id);
    try {
      await onDelete(id);
    } catch (err) {
      console.error('Failed to delete:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage {title.toLowerCase()} data</p>
        </div>
        {!showNewForm && (
          <Button
            variant="primary"
            className="flex items-center gap-2"
            onClick={() => setShowNewForm(true)}
          >
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}

      {showNewForm && (
        <Card className="mb-4 p-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input
                label="Code"
                value={newItem.code}
                onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
                placeholder="Enter code"
                required
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="new-active"
                checked={newItem.is_active}
                onChange={(e) => setNewItem({ ...newItem, is_active: e.target.checked })}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label htmlFor="new-active" className="text-sm text-gray-700 dark:text-gray-300">
                Active
              </label>
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newItem.code.trim() || saving}
              isLoading={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="secondary" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>No data available</p>
            <p className="text-sm mt-2">Click "Add New" to create your first item</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {item.id}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <Input
                          value={editingData.code}
                          onChange={(e) => setEditingData({ ...editingData, code: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.code}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="checkbox"
                          checked={editingData.is_active}
                          onChange={(e) => setEditingData({ ...editingData, is_active: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      ) : (
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={handleSave}
                            disabled={!editingData.code.trim() || saving}
                            isLoading={saving}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleCancel}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(item)}
                            disabled={deleting === item.id}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            isLoading={deleting === item.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

