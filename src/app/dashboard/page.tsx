'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../lib/store';
import { apiRequest } from '../../lib/api';
import type { DashboardStats, Category } from '../../types';
import { Navbar } from '../../components/Navbar';
import { StatusBadge } from '../../components/StatusBadge';
import { PriorityChip } from '../../components/PriorityChip';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
import {
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Inbox,
  AlertCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_COLORS: Record<Category, string> = {
  bug: '#ef4444',
  feature: '#3b82f6',
  question: '#8b5cf6',
  uncategorized: '#94a3b8',
  other: '#0ea5e9',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        toast.error('Only administrators can access the analytics dashboard');
        router.push('/tickets');
      }
    }
  }, [user, authLoading, router]);

  const { data: stats, isLoading, isError, error } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard'],
    queryFn: () => apiRequest<DashboardStats>('/analytics/dashboard'),
    enabled: Boolean(user?.role === 'admin'),
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !stats) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">
            Failed to load dashboard
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            {error instanceof Error ? error.message : 'Could not fetch analytics data'}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-xs font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const openCount = stats.byStatus.find((s) => s.status === 'open')?.count ?? 0;
  const inProgressCount = stats.byStatus.find((s) => s.status === 'in_progress')?.count ?? 0;
  const resolvedCount = stats.byStatus.find((s) => s.status === 'resolved')?.count ?? 0;
  const totalCategorized = stats.byCategory.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Operations & Analytics
              </h1>
              <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                Admin Console
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time metrics, queue distribution, and recent operational activity.
            </p>
          </div>

          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-2xs w-fit"
          >
            <span>Manage All Tickets</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Core KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tickets */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Total Inquiries
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                {stats.totalTickets}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Total recorded tickets</p>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Resolution Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                {stats.resolutionRate}%
              </p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.resolutionRate}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">{resolvedCount} resolved of {stats.totalTickets}</p>
            </div>
          </div>

          {/* Open Queue */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                Open Queue
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                {openCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting assignment</p>
            </div>
          </div>

          {/* In Progress */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                In Progress
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                {inProgressCount}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Active investigation</p>
            </div>
          </div>
        </div>

        {/* Analytics & Trend Charts */}
        <AnalyticsCharts
          ticketsOverTime={stats.ticketsOverTime ?? []}
          byCategory={stats.byCategory ?? []}
          byStatus={stats.byStatus ?? []}
          byPriority={stats.byPriority ?? []}
        />

        {/* Breakdown Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Status Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Status Distribution
              </h3>
            </div>
            <div className="space-y-3">
              {stats.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <StatusBadge status={item.status} size="sm" />
                  <span className="font-mono font-semibold text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Priority Distribution
              </h3>
            </div>
            <div className="space-y-3">
              {stats.byPriority.map((item) => (
                <div key={item.priority} className="flex items-center justify-between text-xs">
                  <PriorityChip priority={item.priority} size="sm" />
                  <span className="font-mono font-semibold text-slate-900">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Inbox className="w-4 h-4 text-slate-500" />
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category Breakdown
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              {stats.byCategory.map((item) => {
                const pct = Math.round((item.count / totalCategorized) * 100);
                const color = CATEGORY_COLORS[item.category] ?? '#94a3b8';

                return (
                  <div key={item.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="capitalize font-medium text-slate-700">
                        {item.category}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500">
                      {item.count} <span className="text-[11px] text-slate-400">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recently Raised Tickets Table */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Recently Raised Tickets
              </h3>
              <p className="text-xs text-slate-400">
                Latest customer submissions entering the operations queue
              </p>
            </div>
            <Link
              href="/tickets"
              className="text-xs font-medium text-slate-700 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              <span>View all tickets</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats.recentTickets.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No tickets recorded yet</p>
            ) : (
              stats.recentTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="font-mono text-xs font-semibold text-slate-500 shrink-0">
                      {ticket.ticketId}
                    </span>
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-xs font-medium text-slate-900 hover:text-slate-600 truncate max-w-sm"
                    >
                      {ticket.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:inline text-[11px] text-slate-400">
                      {ticket.createdBy?.name || 'Customer'}
                    </span>
                    <StatusBadge status={ticket.status} size="sm" />
                    <PriorityChip priority={ticket.priority} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
