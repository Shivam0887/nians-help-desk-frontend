'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../lib/store';
import { apiRequest } from '../../../lib/api';
import type { User } from '../../../types';
import { toast } from 'sonner';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error || !token) {
      toast.error('Authentication via Google was cancelled or failed');
      router.push('/login');
      return;
    }

    localStorage.setItem('helpdesk_token', token);

    // Fetch user profile
    apiRequest<{ user: User }>('/auth/me')
      .then((res) => {
        setAuth(res.user, token);
        toast.success(`Welcome, ${res.user.name}!`);
        router.push(res.user.role === 'admin' ? '/dashboard' : '/tickets');
      })
      .catch(() => {
        toast.error('Failed to retrieve user session');
        router.push('/login');
      });
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="text-center">
        <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-medium text-slate-600">
          Completing sign in...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
