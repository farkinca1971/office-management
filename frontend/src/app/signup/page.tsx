/**
 * Signup Page with Material Tailwind Dashboard design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useTranslation } from '@/lib/i18n';
import { UserPlus, User, Lock, LockCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, error, clearError } = useAuthStore();
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalSuccess(null);
    clearError();

    // Validation
    if (!username || !password || !confirmPassword) {
      setLocalError(t('auth.fillAllFields'));
      return;
    }

    if (username.length < 3) {
      setLocalError(t('auth.usernameMinLength'));
      return;
    }

    if (password.length < 6) {
      setLocalError(t('auth.passwordMinLength'));
      return;
    }

    if (password !== confirmPassword) {
      setLocalError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setIsLoading(true);
    try {
      await signup(username, password);
      setLocalSuccess(t('auth.accountCreated'));
      // Redirect will happen automatically via useEffect when isAuthenticated becomes true
    } catch (err: any) {
      setLocalError(err?.error?.message || t('auth.signupFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-bold text-2xl">O</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('auth.createAccount')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('auth.signUpToGetStarted')}</p>
        </div>

        <Card className="border-0 shadow-2xl">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {displayError && (
                <Alert
                  type="error"
                  message={displayError}
                  onClose={() => {
                    setLocalError(null);
                    clearError();
                  }}
                />
              )}

              {localSuccess && (
                <Alert
                  type="success"
                  message={localSuccess}
                />
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.username')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <Input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      disabled={isLoading}
                      placeholder={t('auth.username')}
                      className="pl-10"
                    />
                  </div>
                  {username && username.length < 3 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('auth.usernameMinLength')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t('auth.password')}
                      className="pl-10"
                    />
                  </div>
                  {password && password.length < 6 && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{t('auth.passwordMinLength')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {t('auth.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LockCheck className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    </div>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder={t('auth.confirmPassword')}
                      className="pl-10"
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-xs text-red-500">{t('auth.passwordsDoNotMatch')}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 text-base font-semibold"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {!isLoading && <UserPlus className="h-5 w-5 mr-2" />}
                {t('auth.signup')}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link
                  href="/login"
                  className="font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  {t('auth.signIn')}
                </Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

