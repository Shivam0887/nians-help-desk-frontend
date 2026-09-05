'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useCreateTicketModal } from '../../lib/store';
import { apiRequest } from '../../lib/api';
import type { PaginatedTickets, TicketFilters as Filters } from '../../types';
import { Navbar } from '../../components/Navbar';
import { TicketCard } from '../../components/TicketCard';
import { TicketFilters } from '../../components/TicketFilters';
import { Plus, Ticket as TicketIcon, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@heroui/react';

export default function TicketsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { openModal } = useCreateTicketModal();

  const [filters, setFilters] = useState<Filters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.status) queryParams.set('status', filters.status);
  if (filters.priority) queryParams.set('priority', filters.priority);
  if (filters.category) queryParams.set('category', filters.category);
  if (filters.page) queryParams.set('page', String(filters.page));
  if (filters.limit) queryParams.set('limit', String(filters.limit));

  const { data, isLoading, isError, error } = useQuery<PaginatedTickets>({
    queryKey: ['tickets', filters],
    queryFn: () => apiRequest<PaginatedTickets>(`/tickets?${queryParams.toString()}`),
    enabled: Boolean(user),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const tickets = data?.tickets ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {isAdmin ? 'Ticket Operations' : 'Customer Support'}
              </h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  <Shield className="w-3 h-3 text-slate-500" />
                  Admin Overview
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isAdmin
                ? 'Manage, assign, and update status for customer submissions'
                : 'Track active support incidents, audit resolution traces, and create new requests'}
            </p>
          </div>

          {!isAdmin && (
            <Button
              onPress={openModal}
              className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl px-4 py-2 flex items-center gap-2 text-xs shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Raise Ticket</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <TicketFilters filters={filters} onChange={setFilters} />

        {/* Tickets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 w-20 bg-slate-100 rounded-md" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full" />
                </div>
                <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
                <div className="h-3 w-full bg-slate-50 rounded mb-4" />
                <div className="h-3 w-1/3 bg-slate-50 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-rose-200 p-8">
            <p className="text-xs font-medium text-rose-600">
              {error instanceof Error ? error.message : 'Failed to load tickets'}
            </p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 p-8">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3 border border-slate-200">
              <TicketIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              No tickets found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
              {filters.search || filters.status || filters.priority || filters.category
                ? 'No tickets match the selected filters. Try adjusting your query.'
                : isAdmin
                  ? 'There are currently no customer support tickets in the system queue.'
                  : 'You have not submitted any support tickets yet. Click below to create your first one.'}
            </p>
            {!isAdmin && (
              <Button
                size="sm"
                onPress={openModal}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs px-4 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Create Ticket
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-200/80 pt-6 mt-8">
                <p className="text-xs text-slate-500">
                  Showing page <span className="font-semibold text-slate-800">{pagination.page}</span> of{' '}
                  <span className="font-semibold text-slate-800">{pagination.totalPages}</span> ({pagination.total} tickets)
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    isDisabled={pagination.page <= 1}
                    onPress={() => setFilters({ ...filters, page: (filters.page ?? 1) - 1 })}
                    className="p-2 min-w-0 rounded-xl bg-white border border-slate-200 text-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    isDisabled={pagination.page >= pagination.totalPages}
                    onPress={() => setFilters({ ...filters, page: (filters.page ?? 1) + 1 })}
                    className="p-2 min-w-0 rounded-xl bg-white border border-slate-200 text-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
