/**
 * Relations Manager Page - System-wide relation management with data quality checks
 *
 * Route: /relations
 * Protected: Admin users only
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RelationStatsCards, RelationStats } from '@/components/relations-manager/RelationStatsCards';
import { DataQualityTab } from '@/components/relations-manager/DataQualityTab';
import { objectRelationApi } from '@/lib/api/objectRelations';
import type {
  OrphanedRelation,
  DuplicateRelationGroup,
  InvalidRelation,
  MissingMirrorRelation,
} from '@/types/entities';

type TabType = 'orphaned' | 'duplicates' | 'invalid' | 'missing-mirrors';

export default function RelationsManagerPage() {
  const [activeTab, setActiveTab] = useState<TabType>('orphaned');
  const [stats, setStats] = useState<RelationStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [orphanedData, setOrphanedData] = useState<OrphanedRelation[]>([]);
  const [duplicatesData, setDuplicatesData] = useState<DuplicateRelationGroup[]>([]);
  const [invalidData, setInvalidData] = useState<InvalidRelation[]>([]);
  const [missingMirrorsData, setMissingMirrorsData] = useState<MissingMirrorRelation[]>([]);

  const [isLoadingTab, setIsLoadingTab] = useState(false);
  const [tabError, setTabError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  // Load tab data when tab changes
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadStats = async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      // Fetch all data quality endpoints in parallel
      const [orphaned, duplicates, invalid, missingMirrors] = await Promise.all([
        objectRelationApi.getOrphanedRelations(),
        objectRelationApi.getDuplicateRelations(),
        objectRelationApi.getInvalidRelations(),
        objectRelationApi.getMissingMirrors(),
      ]);

      setStats({
        orphanedCount: orphaned.data?.length ?? 0,
        duplicatesCount: duplicates.data?.length ?? 0,
        invalidCount: invalid.data?.length ?? 0,
        missingMirrorsCount: missingMirrors.data?.length ?? 0,
      });

      // Cache the data to avoid re-fetching
      setOrphanedData(orphaned.data ?? []);
      setDuplicatesData(duplicates.data ?? []);
      setInvalidData(invalid.data ?? []);
      setMissingMirrorsData(missingMirrors.data ?? []);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setStatsError(error?.error?.message || 'Failed to load data quality stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadTabData = async (tab: TabType) => {
    // If data is already loaded from stats fetch, skip
    if (tab === 'orphaned' && orphanedData.length > 0) return;
    if (tab === 'duplicates' && duplicatesData.length > 0) return;
    if (tab === 'invalid' && invalidData.length > 0) return;
    if (tab === 'missing-mirrors' && missingMirrorsData.length > 0) return;

    try {
      setIsLoadingTab(true);
      setTabError(null);

      let data: any;
      switch (tab) {
        case 'orphaned':
          data = await objectRelationApi.getOrphanedRelations();
          setOrphanedData(data.data ?? []);
          break;
        case 'duplicates':
          data = await objectRelationApi.getDuplicateRelations();
          setDuplicatesData(data.data ?? []);
          break;
        case 'invalid':
          data = await objectRelationApi.getInvalidRelations();
          setInvalidData(data.data ?? []);
          break;
        case 'missing-mirrors':
          data = await objectRelationApi.getMissingMirrors();
          setMissingMirrorsData(data.data ?? []);
          break;
      }
    } catch (error: any) {
      console.error(`Error loading ${tab} data:`, error);
      setTabError(error?.error?.message || `Failed to load ${tab} relations`);
    } finally {
      setIsLoadingTab(false);
    }
  };

  const handleCardClick = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    loadStats();
    loadTabData(activeTab);
  };

  const handleDelete = async (ids: number[]) => {
    try {
      await objectRelationApi.bulkDelete(ids);
      // Refresh data after deletion
      handleRefresh();
    } catch (error: any) {
      console.error('Error deleting relations:', error);
      throw error;
    }
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case 'orphaned':
        return orphanedData;
      case 'duplicates':
        return duplicatesData;
      case 'invalid':
        return invalidData;
      case 'missing-mirrors':
        return missingMirrorsData;
      default:
        return [];
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relations Manager</h1>
            <p className="text-gray-600 mt-1">
              Detect and fix data quality issues in object relations
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={isLoadingStats || isLoadingTab}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingStats || isLoadingTab ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>

        {/* Stats Cards */}
        {statsError ? (
          <Card className="p-6 mb-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{statsError}</span>
            </div>
          </Card>
        ) : (
          <RelationStatsCards
            stats={stats}
            isLoading={isLoadingStats}
            onCardClick={handleCardClick}
          />
        )}

        {/* Tabs */}
        <Card className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { key: 'orphaned' as const, label: 'Orphaned' },
                { key: 'duplicates' as const, label: 'Duplicates' },
                { key: 'invalid' as const, label: 'Invalid' },
                { key: 'missing-mirrors' as const, label: 'Missing Mirrors' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-6 py-3 text-sm font-medium border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                  {stats && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-100">
                      {tab.key === 'orphaned' && stats.orphanedCount}
                      {tab.key === 'duplicates' && stats.duplicatesCount}
                      {tab.key === 'invalid' && stats.invalidCount}
                      {tab.key === 'missing-mirrors' && stats.missingMirrorsCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        <DataQualityTab
          type={activeTab}
          data={getCurrentTabData()}
          isLoading={isLoadingTab}
          error={tabError}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
        />
      </div>
    </MainLayout>
  );
}
