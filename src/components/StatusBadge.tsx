import { getStatusColor } from '@/lib/utils';
import type { BuildStatus } from '@/types';
import { Loader2 } from 'lucide-react';

interface StatusBadgeProps {
  status: BuildStatus;
  className?: string;
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)} ${className}`}>
      {status === 'running' && <Loader2 className="w-3 h-3 animate-spin" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
