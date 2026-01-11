/**
 * RelationStatsCards Component - Summary cards showing data quality issue counts
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { AlertTriangle, Copy, XCircle, Info } from 'lucide-react';

export interface RelationStats {
  orphanedCount: number;
  duplicatesCount: number;
  invalidCount: number;
  missingMirrorsCount: number;
}

export interface RelationStatsCardsProps {
  stats: RelationStats | null;
  isLoading: boolean;
  onCardClick?: (tab: 'orphaned' | 'duplicates' | 'invalid' | 'missing-mirrors') => void;
}

export const RelationStatsCards: React.FC<RelationStatsCardsProps> = ({
  stats,
  isLoading,
  onCardClick,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-center h-20">
              <LoadingSpinner size="sm" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Orphaned Relations',
      count: stats?.orphanedCount ?? 0,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      tab: 'orphaned' as const,
    },
    {
      title: 'Duplicate Relations',
      count: stats?.duplicatesCount ?? 0,
      icon: Copy,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      tab: 'duplicates' as const,
    },
    {
      title: 'Invalid Relations',
      count: stats?.invalidCount ?? 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      tab: 'invalid' as const,
    },
    {
      title: 'Missing Mirrors',
      count: stats?.missingMirrorsCount ?? 0,
      icon: Info,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      tab: 'missing-mirrors' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const hasIssues = card.count > 0;

        return (
          <Card
            key={card.tab}
            className={`p-6 transition-all ${
              onCardClick && hasIssues
                ? 'cursor-pointer hover:shadow-lg hover:scale-105'
                : ''
            }`}
            onClick={() => hasIssues && onCardClick?.(card.tab)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${hasIssues ? card.color : 'text-gray-400'}`}>
                  {card.count}
                </p>
              </div>
              <div className={`p-3 rounded-full ${hasIssues ? card.bgColor : 'bg-gray-100'}`}>
                <Icon className={`h-6 w-6 ${hasIssues ? card.color : 'text-gray-400'}`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
