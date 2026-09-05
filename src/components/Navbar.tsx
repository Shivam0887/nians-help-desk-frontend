'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store';
import { BarChart3, LogOut, Shield, User } from 'lucide-react';
import { Button } from '@heroui/react';
import { CreateTicketModal } from './CreateTicketModal';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = mounted && user?.role === 'admin';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={isAdmin ? '/dashboard' : '/tickets'} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs transition-transform duration-200 group-hover:scale-105">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold tracking-tight text-slate-900">
                Aura Desk
              </span>
              {mounted && (
                isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                    <Shield className="w-2.5 h-2.5 text-slate-300" /> Admin Console
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                    Customer Portal
                  </span>
                )
              )}
            </div>
          </Link>

          {mounted && user && (
            <nav className="hidden md:flex items-center gap-1">
              {isAdmin && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Analytics
                </Link>
              )}

              {isAdmin && <Link
                href="/tickets"
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  pathname.startsWith('/tickets') && pathname !== '/tickets/new'
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                All Tickets
              </Link>}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {mounted ? (
            user ? (
              <>
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border ${
                      isAdmin
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-medium text-slate-900 truncate max-w-35">
                      {user.name}
                    </span>
                    <span className="text-[10px] flex items-center gap-1">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1 text-slate-900 font-semibold">
                          <Shield className="w-2.5 h-2.5 text-slate-700" /> Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                          <User className="w-2.5 h-2.5 text-slate-400" /> Customer
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onPress={handleLogout}
                  className="text-slate-400 hover:text-slate-900 p-2 min-w-0 rounded-lg cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="font-medium text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 cursor-pointer"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-xs cursor-pointer"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )
          ) : (
            <div className="h-8 w-24" />
          )}
        </div>
      </div>
    </header>
    <CreateTicketModal />
  </>
  );
}
