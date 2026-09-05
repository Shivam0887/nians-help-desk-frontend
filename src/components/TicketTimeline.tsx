import type { StatusHistory } from '../types';
import { StatusBadge } from './StatusBadge';
import { ArrowRight, MessageSquare } from 'lucide-react';

interface TicketTimelineProps {
  history: StatusHistory[];
}

export function TicketTimeline({ history }: TicketTimelineProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        No status changes recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
      {history.map((item) => {
        const formattedDate = new Date(item.changedAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={item.id} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
            </div>

            <div className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80">
              <div className="flex items-center justify-between gap-4 flex-wrap mb-2">
                <div className="flex items-center gap-2">
                  <StatusBadge status={item.from} size="sm" />
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                  <StatusBadge status={item.to} size="sm" />
                </div>
                <span className="text-[11px] text-slate-400">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                <span className="font-medium text-slate-900">
                  {item.changedBy.name}
                </span>
                <span>updated the status</span>
              </div>

              {item.note && (
                <div className="mt-2 text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 flex items-start gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-[11px]">{item.note}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
