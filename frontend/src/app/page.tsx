/**
 * Home Page / Dashboard with Material Tailwind design
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/lib/i18n';
import { Users, Building2, FileText, DollarSign, ArrowUpRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();

  const stats = [
    {
      titleKey: 'stats.persons',
      value: '-',
      change: '+12%',
      icon: <Users className="h-8 w-8" />,
      href: '/persons',
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      titleKey: 'stats.companies',
      value: '-',
      change: '+8%',
      icon: <Building2 className="h-8 w-8" />,
      href: '/companies',
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      titleKey: 'stats.invoices',
      value: '-',
      change: '+23%',
      icon: <FileText className="h-8 w-8" />,
      href: '/invoices',
      gradient: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      titleKey: 'stats.transactions',
      value: '-',
      change: '+15%',
      icon: <DollarSign className="h-8 w-8" />,
      href: '/transactions',
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.href} href={stat.href}>
            <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${stat.bgColor}`}>
                    <TrendingUp className={`h-4 w-4 ${stat.textColor}`} />
                    <span className={`text-xs font-semibold ${stat.textColor}`}>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{t(stat.titleKey)}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.quickActions')}</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => router.push('/persons/new')}
                className="w-full justify-between group"
              >
                <span>{t('dashboard.addNewPerson')}</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/companies/new')}
                className="w-full justify-between group"
              >
                <span>{t('dashboard.addNewCompany')}</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push('/invoices/new')}
                className="w-full justify-between group"
              >
                <span>{t('dashboard.createInvoice')}</span>
                <ArrowUpRight className="h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="border-0 shadow-lg lg:col-span-2">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t('dashboard.recentActivity')}</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{t('dashboard.noRecentActivity')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.startByAdding')}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

