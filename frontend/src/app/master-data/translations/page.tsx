/**
 * Translations Lookup Page
 * Note: Translations have a different structure (code, language_id, text)
 * This page uses a simplified version of the LookupTable pattern
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Plus, Save, X, Trash2, Edit2 } from 'lucide-react';
import { lookupApi } from '@/lib/api';
import type { Translation } from '@/types/common';

export default function TranslationsPage() {
  const [data, setData] = React.useState<Translation[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [editingKey, setEditingKey] = React.useState<{ code: string; languageId: number } | null>(null);
  const [editingData, setEditingData] = React.useState<{ text: string }>({ text: '' });
  const [newItem, setNewItem] = React.useState<{ code: string; language_id: number; text: string }>({
    code: '',
    language_id: 1,
    text: '',
  });
  const [showNewForm, setShowNewForm] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await lookupApi.getTranslations();
      if (response.success) {
        setData(response.data);
      } else {
        setError('Failed to load translations');
      }
    } catch (err: any) {
      setError(err?.error?.message || 'Failed to load translations');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item: Translation) => {
    setEditingKey({ code: item.code, languageId: item.language_id });
    setEditingData({ text: item.text });
  };

  const handleSave = async () => {
    if (!editingKey) return;
    setSaving(true);
    try {
      const response = await lookupApi.updateTranslation(editingKey.code, editingKey.languageId, editingData);
      if (response.success) {
        await loadData();
        setEditingKey(null);
        setEditingData({ text: '' });
      } else {
        throw new Error('Failed to update translation');
      }
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newItem.code.trim() || !newItem.text.trim()) return;
    setSaving(true);
    try {
      const response = await lookupApi.createTranslation(newItem);
      if (response.success) {
        await loadData();
        setShowNewForm(false);
        setNewItem({ code: '', language_id: 1, text: '' });
      } else {
        throw new Error('Failed to create translation');
      }
    } catch (err) {
      console.error('Failed to create:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code: string, languageId: number) => {
    if (!confirm('Are you sure you want to delete this translation?')) return;
    try {
      const response = await lookupApi.deleteTranslation(code, languageId);
      if (response.success) {
        await loadData();
      } else {
        throw new Error('Failed to delete translation');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Translations</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Manage translation data</p>
        </div>
        {!showNewForm && (
          <Button variant="primary" className="flex items-center gap-2" onClick={() => setShowNewForm(true)}>
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
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Code"
              value={newItem.code}
              onChange={(e) => setNewItem({ ...newItem, code: e.target.value })}
              placeholder="Enter code"
              required
            />
            <Input
              label="Language ID"
              type="number"
              value={newItem.language_id}
              onChange={(e) => setNewItem({ ...newItem, language_id: parseInt(e.target.value) || 1 })}
              required
            />
            <Input
              label="Text"
              value={newItem.text}
              onChange={(e) => setNewItem({ ...newItem, text: e.target.value })}
              placeholder="Enter translation text"
              required
            />
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="primary" onClick={handleCreate} disabled={!newItem.code.trim() || !newItem.text.trim() || saving} isLoading={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="secondary" onClick={() => { setShowNewForm(false); setNewItem({ code: '', language_id: 1, text: '' }); }} disabled={saving}>
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
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Language ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Text</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((item, idx) => {
                  const isEditing = editingKey?.code === item.code && editingKey?.languageId === item.language_id;
                  return (
                    <tr key={`${item.code}-${item.language_id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{item.language_id}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            value={editingData.text}
                            onChange={(e) => setEditingData({ text: e.target.value })}
                            className="w-full"
                          />
                        ) : (
                          <span className="text-sm text-gray-900 dark:text-gray-100">{item.text}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="primary" size="sm" onClick={handleSave} disabled={!editingData.text.trim() || saving} isLoading={saving}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => { setEditingKey(null); setEditingData({ text: '' }); }} disabled={saving}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(item.code, item.language_id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

