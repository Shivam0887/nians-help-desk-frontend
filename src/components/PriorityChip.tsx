import type { Priority } from '../types';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityChipProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const PRIORITY_MAP: Record<
  Priority,
  { label: string; bg: string; text: string; border: string; icon: typeof ArrowDown }
> = {
  low: {
    label: 'Low',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
    icon: ArrowDown,
  },
  medium: {
    label: 'Medium',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: ArrowUp,
  },
  high: {
    label: 'High',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200/60',
    icon: AlertTriangle,
  },
  urgent: {
    label: 'Urgent',
    bg: 'bg-rose-50',
    text: 'text-rose-800',
    border: 'border-rose-200/60',
    icon: AlertCircle,
  },
};

export function PriorityChip({ priority, size = 'sm' }: PriorityChipProps) {
  const config = PRIORITY_MAP[priority] ?? PRIORITY_MAP.medium;
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm' ? 'text-[11px] px-2.5 py-0.5 gap-1.5' : 'text-xs px-3 py-1 gap-2';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {config.label}
    </span>
  );
}
