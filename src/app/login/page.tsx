'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { apiRequest } from '../../lib/api';
import { useAuthStore } from '../../lib/store';
import type { User } from '../../types';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [portal, setPortal] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const flattened = result.error.flatten().fieldErrors;
      setErrors({
        email: flattened.email?.[0],
        password: flattened.password?.[0],
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiRequest<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuth(res.user, res.token);

      if (res.user.role === 'admin') {
        toast.success(`Welcome back, Admin ${res.user.name}!`);
        router.push('/dashboard');
      } else {
        if (portal === 'admin') {
          toast.info(`Signed in as Customer (${res.user.name}). Note: this account has customer permissions.`);
        } else {
          toast.success(`Welcome back, ${res.user.name}!`);
        }
        router.push('/tickets');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid login credentials';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#f8fafc]">
      {/* Brand Header */}
      <div className="flex flex-col items-center mb-6 text-center select-none">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Aura Desk
            </span>
            {portal === 'admin' ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                Admin Console
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                Customer Portal
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {portal === 'admin'
            ? 'Sign in to access the administrator operations console'
            : 'Sign in to access your customer support portal'}
        </p>
      </div>

      {/* Central Login Card */}
      <div className="w-full max-w-sm bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-7 shadow-xs">
        {/* Workspace Portal Selector */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Select Portal Mode
            </span>
            {portal === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                <Lock className="w-2.5 h-2.5" /> Staff Access
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200">
                Public Access
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setPortal('customer')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                portal === 'customer'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setPortal('admin')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                portal === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900 font-medium'
              }`}
            >
              <Lock className="w-3 h-3" />
              <span>Admin / Staff</span>
            </button>
          </div>
        </div>

        {/* Sign In / Create Account Tab Toggle (Customer Portal Only) */}
        {portal === 'customer' && (
          <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              className="flex-1 py-1.5 text-center text-xs rounded-lg bg-white text-slate-900 shadow-2xs font-semibold cursor-default"
            >
              Sign In
            </button>
            <Link
              href="/signup"
              className="flex-1 py-1.5 text-center text-xs rounded-lg text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}

        {/* Google OAuth Option (Customer Portal Only) */}
        {portal === 'customer' && (
          <>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 transition-colors shadow-2xs active:scale-[0.99] cursor-pointer"
            >
              <svg aria-hidden="true" className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  fill="#4285F4"
                />
                <path
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  fill="#34A853"
                />
                <path
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  fill="#EA4335"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Clean Divider */}
            <div className="relative flex items-center justify-center my-5">
              <div className="w-full h-px bg-slate-200" />
              <span className="absolute px-3 bg-white text-[11px] text-slate-400 select-none">
                or sign in with email
              </span>
            </div>
          </>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="email">
              {portal === 'admin' ? 'Administrator Email' : 'Email address'}
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value;
                  setEmail(val);
                  if (val.toLowerCase().startsWith('admin@') && portal !== 'admin') {
                    setPortal('admin');
                  }
                }}
                placeholder={portal === 'admin' ? 'admin@helpdesk.com' : 'name@company.com'}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50/70 text-slate-900 placeholder-slate-400 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                required
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5" htmlFor="password">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 text-slate-400 pointer-events-none" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 rounded-xl bg-slate-50/70 text-slate-900 placeholder-slate-400 text-xs border border-slate-200 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium tracking-tight shadow-xs transition-all duration-150 active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-60 cursor-pointer"
          >
            {portal === 'admin' ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Authenticating Admin...' : 'Sign In as Administrator'}</span>
              </>
            ) : (
              <>
                <span>{isLoading ? 'Signing in...' : 'Sign In as Customer'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

