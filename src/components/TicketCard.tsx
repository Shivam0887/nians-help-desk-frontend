import Link from 'next/link';
import type { Ticket } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityChip } from './PriorityChip';
import { Paperclip, Sparkles, Clock, ArrowUpRight } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const formattedDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="group block bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-xs transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
            {ticket.ticketId}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityChip priority={ticket.priority} />
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-500 border border-slate-200 capitalize">
            {ticket.category === 'other' ? (ticket.customCategory || 'Other') : ticket.category}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {ticket.aiSuggestion && (
            <span
              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200"
              title={`AI Confidence: ${Math.round(ticket.aiSuggestion.confidence * 100)}%`}
            >
              <Sparkles className="w-2.5 h-2.5 text-slate-500" />
              AI Triaged
            </span>
          )}
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </div>
      </div>

      <h3 className="text-[15px] font-semibold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1 mb-1.5">
        {ticket.title}
      </h3>

      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
        {ticket.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-700 border border-slate-200">
            {ticket.createdBy?.name ? ticket.createdBy.name[0].toUpperCase() : 'U'}
          </div>
          <span className="font-medium text-slate-700">
            {ticket.createdBy?.name ?? 'Anonymous'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {ticket.attachments && ticket.attachments.length > 0 && (
            <span className="flex items-center gap-1">
              <Paperclip className="w-3 h-3 text-slate-400" />
              {ticket.attachments.length}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
