import React from 'react';
import { Clock, UserCheck, PlayCircle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

export const STATUS_CONFIG = {
  'Pending Review': {
    label: 'Pending Review',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  'Rejected': {
    label: 'Rejected',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
    icon: XCircle,
  },
  'Pending': {
    label: 'Approved · Awaiting Assignment',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    icon: Clock,
  },
  'Assigned': {
    label: 'Assigned',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    icon: UserCheck,
  },
  'In Progress': {
    label: 'In Progress',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
    icon: PlayCircle,
  },
  'Resolved': {
    label: 'Resolved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  'Verified': {
    label: 'Verified',
    bg: 'bg-teal-50',
    text: 'text-teal-800',
    border: 'border-teal-300',
    dot: 'bg-teal-600',
    icon: ShieldCheck,
  },
};

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Pending'];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-medium gap-1.5',
    lg: 'px-3 py-1.5 text-sm font-medium gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-all duration-150 shadow-sm`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
