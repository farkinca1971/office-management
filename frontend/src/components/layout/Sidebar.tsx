/**
 * Sidebar Component - Navigation sidebar with Material Tailwind design
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import {
  Users,
  Building2,
  FileText,
  DollarSign,
  Menu,
  X,
  Home,
  Briefcase,
  Database,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NavSubItem {
  href: string;
  labelKey: string;
}

interface NavItem {
  href?: string;
  labelKey: string;
  icon: React.ReactNode;
  subItems?: NavSubItem[];
}

const navItems: NavItem[] = [
  { href: '/', labelKey: 'nav.dashboard', icon: <Home className="h-5 w-5" /> },
  { href: '/persons', labelKey: 'nav.persons', icon: <Users className="h-5 w-5" /> },
  { href: '/companies', labelKey: 'nav.companies', icon: <Building2 className="h-5 w-5" /> },
  { href: '/employees', labelKey: 'nav.employees', icon: <Briefcase className="h-5 w-5" /> },
  {
    labelKey: 'nav.masterData',
    icon: <Database className="h-5 w-5" />,
    subItems: [
      { href: '/master-data/languages', labelKey: 'nav.languages' },
      { href: '/master-data/object-types', labelKey: 'nav.objectTypes' },
      { href: '/master-data/object-statuses', labelKey: 'nav.objectStatuses' },
      { href: '/master-data/sexes', labelKey: 'nav.sexes' },
      { href: '/master-data/salutations', labelKey: 'nav.salutations' },
      { href: '/master-data/product-categories', labelKey: 'nav.productCategories' },
      { href: '/master-data/countries', labelKey: 'nav.countries' },
      { href: '/master-data/address-types', labelKey: 'nav.addressTypes' },
      { href: '/master-data/address-area-types', labelKey: 'nav.addressAreaTypes' },
      { href: '/master-data/contact-types', labelKey: 'nav.contactTypes' },
      { href: '/master-data/transaction-types', labelKey: 'nav.transactionTypes' },
      { href: '/master-data/currencies', labelKey: 'nav.currencies' },
      { href: '/master-data/object-relation-types', labelKey: 'nav.objectRelationTypes' },
      { href: '/master-data/translations', labelKey: 'nav.translations' },
    ],
  },
  { href: '/invoices', labelKey: 'nav.invoices', icon: <FileText className="h-5 w-5" /> },
  { href: '/transactions', labelKey: 'nav.transactions', icon: <DollarSign className="h-5 w-5" /> },
];

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  // Auto-expand menu if any sub-item is active
  const getInitialExpandedMenus = React.useCallback(() => {
    const expanded = new Set<string>();
    navItems.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubItem = item.subItems.some(
          (subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href + '/')
        );
        if (hasActiveSubItem) {
          expanded.add(item.labelKey);
        }
      }
    });
    return expanded;
  }, [pathname]);

  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(getInitialExpandedMenus());

  // Update expanded menus when pathname changes
  React.useEffect(() => {
    setExpandedMenus(getInitialExpandedMenus());
  }, [getInitialExpandedMenus]);

  const toggleMenu = (labelKey: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(labelKey)) {
      newExpanded.delete(labelKey);
    } else {
      newExpanded.add(labelKey);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuExpanded = (labelKey: string) => expandedMenus.has(labelKey);

  const isSubItemActive = (subItems?: NavSubItem[]) => {
    if (!subItems) return false;
    return subItems.some((subItem) => pathname === subItem.href || pathname?.startsWith(subItem.href + '/'));
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-64 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-xl z-40 transform transition-transform duration-300 ease-in-out',
          'md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Office</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (item.subItems) {
                const isExpanded = isMenuExpanded(item.labelKey);
                const hasActiveSubItem = isSubItemActive(item.subItems);
                return (
                  <div key={item.labelKey}>
                    <button
                      onClick={() => toggleMenu(item.labelKey)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                        hasActiveSubItem
                          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/50'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <span className={cn(hasActiveSubItem ? 'text-white' : 'text-gray-600 dark:text-gray-400')}>
                          {item.icon}
                        </span>
                        <span>{t(item.labelKey)}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className={cn('h-4 w-4', hasActiveSubItem ? 'text-white' : 'text-gray-600 dark:text-gray-400')} />
                      ) : (
                        <ChevronRight className={cn('h-4 w-4', hasActiveSubItem ? 'text-white' : 'text-gray-600 dark:text-gray-400')} />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.subItems.map((subItem) => {
                          const isActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                'flex items-center px-4 py-2 rounded-lg text-sm transition-all duration-200',
                                isActive
                                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                              )}
                            >
                              <span className="ml-6">{t(subItem.labelKey)}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href || '#'}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/50'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary-600 dark:hover:text-primary-400'
                  )}
                >
                  <span className={cn(isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400')}>
                    {item.icon}
                  </span>
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

