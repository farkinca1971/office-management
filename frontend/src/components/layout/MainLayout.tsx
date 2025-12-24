/**
 * Main Layout Component - Wraps application with header and sidebar
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check auth only once on mount, but skip if already authenticated
  useEffect(() => {
    // Only check auth if we haven't checked yet
    // If already authenticated (from login), skip the check
    if (!hasCheckedAuth) {
      if (isAuthenticated) {
        // Already authenticated from login, just mark as checked
        setHasCheckedAuth(true);
      } else {
        // Not authenticated, check if we have a stored token
        checkAuth().finally(() => {
          setHasCheckedAuth(true);
        });
      }
    }
  }, [checkAuth, hasCheckedAuth, isAuthenticated]);

  // Handle redirects for unauthenticated users
  useEffect(() => {
    const publicPaths = ['/login', '/signup'];
    if (hasCheckedAuth && !isLoading && !isAuthenticated && !publicPaths.includes(pathname)) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router, hasCheckedAuth]);

  // Show loading spinner while checking auth (but not if already authenticated)
  if ((!hasCheckedAuth && !isAuthenticated) || (isLoading && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't show layout on login or signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return <>{children}</>;
  }

  // Show layout for authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="md:ml-64">
          <Header />
          <main className="min-h-screen">
            <div className="px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Return null while redirecting (shouldn't reach here, but safety check)
  return null;
};

