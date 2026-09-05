import type { TicketStatus } from '../types';

interface StatusBadgeProps {
  status: TicketStatus;
  size?: 'sm' | 'md';
}

const STATUS_MAP: Record<
  TicketStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  open: {
    label: 'Open',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200/60',
    dot: 'bg-amber-500',
  },
  resolved: {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200/60',
    dot: 'bg-emerald-500',
  },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? STATUS_MAP.open;

  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5 gap-1.5' : 'text-xs px-3 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
