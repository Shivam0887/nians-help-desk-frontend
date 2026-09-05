'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../../lib/store';
import { apiRequest } from '../../../lib/api';
import type { Ticket, TicketStatus } from '../../../types';
import { Navbar } from '../../../components/Navbar';
import { StatusBadge } from '../../../components/StatusBadge';
import { PriorityChip } from '../../../components/PriorityChip';
import { TicketTimeline } from '../../../components/TicketTimeline';
import { AiSuggestionCard } from '../../../components/AiSuggestionCard';
import { Button } from '@heroui/react';
import {
  ArrowLeft,
  Clock,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Shield,
  Trash2,
  Send,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const id = params?.id as string;

  const [newStatus, setNewStatus] = useState<TicketStatus>('in_progress');
  const [statusNote, setStatusNote] = useState('');

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<{ ticket: Ticket } | Ticket>({
    queryKey: ['ticket', id],
    queryFn: () => apiRequest<{ ticket: Ticket } | Ticket>(`/tickets/${id}`),
    enabled: Boolean(id),
  });

  const ticket: Ticket | undefined = data
    ? ('ticket' in data && data.ticket ? (data.ticket as Ticket) : (data as Ticket))
    : undefined;

  useEffect(() => {
    if (ticket?.status) {
      setNewStatus(ticket.status);
    }
  }, [ticket?.status]);

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { status: TicketStatus; note?: string }) =>
      apiRequest<{ ticket: Ticket } | Ticket>(`/tickets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      const updated = 'ticket' in res && res.ticket ? res.ticket : (res as Ticket);
      queryClient.setQueryData(['ticket', id], { ticket: updated });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(`Status updated to ${updated.status}`);
      setStatusNote('');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      toast.error(msg);
    },
  });

  const applyAiMutation = useMutation({
    mutationFn: () =>
      apiRequest<{ ticket: Ticket } | Ticket>(`/tickets/${id}/apply-ai-suggestion`, {
        method: 'POST',
      }),
    onSuccess: (res) => {
      const updated = 'ticket' in res && res.ticket ? res.ticket : (res as Ticket);
      queryClient.setQueryData(['ticket', id], { ticket: updated });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('AI classification applied to ticket');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to apply suggestion';
      toast.error(msg);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiRequest(`/tickets/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('Ticket deleted successfully');
      router.push('/tickets');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete ticket';
      toast.error(msg);
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-7 h-7 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8fafc]">
        <Navbar />
        <div className="flex-1 max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-slate-900 mb-1">Error Loading Ticket</h2>
          <p className="text-xs text-slate-500 mb-6">
            {error instanceof Error ? error.message : 'Ticket not found or permission denied'}
          </p>
          <Link href="/tickets">
            <Button size="sm" className="bg-slate-900 text-white rounded-xl text-xs">
              Back to Tickets
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = ticket.createdAt && !isNaN(new Date(ticket.createdAt).getTime())
    ? new Date(ticket.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const isAdmin = user?.role === 'admin';

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus === ticket.status) {
      toast.error(`Ticket is already ${ticket.status}`);
      return;
    }
    updateStatusMutation.mutate({ status: newStatus, note: statusNote.trim() || undefined });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Tickets
          </Link>

          {isAdmin && (
            <Button
              size="sm"
              variant="ghost"
              isDisabled={deleteMutation.isPending}
              onPress={() => {
                if (confirm('Are you sure you want to permanently delete this ticket?')) {
                  deleteMutation.mutate();
                }
              }}
              className="text-rose-600 hover:bg-rose-50 text-xs px-3 rounded-lg cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Delete Ticket
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {ticket.ticketId}
                </span>
                <StatusBadge status={ticket.status} size="md" />
                <PriorityChip priority={ticket.priority} size="md" />
                <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                  {ticket.category === 'other' ? (ticket.customCategory || 'Other') : ticket.category}
                </span>
              </div>

              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-4">
                {ticket.title}
              </h1>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-medium text-slate-700 text-[10px] border border-slate-200">
                    {ticket.createdBy?.name ? ticket.createdBy.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium text-slate-800">
                    {ticket.createdBy?.name || 'Customer'}
                  </span>
                  {ticket.createdBy?.email && (
                    <span className="text-slate-400">({ticket.createdBy.email})</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formattedDate}</span>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-4">
                Description
              </h2>
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {ticket.description}
              </div>
            </div>

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
                <h2 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attachments ({ticket.attachments.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ticket.attachments.map((file) => {
                    const isImage = file.mimetype.startsWith('image/');
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 truncate">
                          {isImage ? (
                            <ImageIcon className="w-4 h-4 text-slate-600 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <div className="truncate">
                            <p className="text-xs font-medium text-slate-800 truncate">
                              {file.filename}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {Math.round(file.size / 1024)} KB
                            </p>
                          </div>
                        </div>

                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                          title="Open / Download attachment"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Status History Timeline */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-6">
                Status History & Audit Trail
              </h2>
              <TicketTimeline history={ticket.statusHistory ?? []} />
            </div>
          </div>

          {/* Sidebar (Right col) */}
          <div className="space-y-6">
            {/* AI Suggestion Card */}
            {ticket.aiSuggestion && (
              <AiSuggestionCard
                suggestion={ticket.aiSuggestion}
                isAdmin={isAdmin}
                onApply={() => applyAiMutation.mutate()}
                isApplying={applyAiMutation.isPending}
              />
            )}

            {/* Admin Status Management Box */}
            {isAdmin ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-slate-700" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Update Ticket Status
                  </h3>
                </div>

                <form onSubmit={handleStatusSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      New status
                    </label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as TicketStatus)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:bg-white focus:border-slate-900 transition-colors"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Audit note (optional)
                    </label>
                    <textarea
                      rows={3}
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Issue confirmed and hotfix deployed to staging..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-900 leading-relaxed transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    isDisabled={updateStatusMutation.isPending}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl py-2 text-xs shadow-xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Save & Update
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
                <h3 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Ticket Workflow
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Support engineers are actively reviewing your ticket. Status changes and notes are logged in the audit trail.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
