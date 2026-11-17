import React from 'react';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const normalized = (status || '').toLowerCase();

  if (normalized === 'approved') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm ${className}`}>
        {showIcon && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
        Approved
      </span>
    );
  }

  if (normalized === 'rejected') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 shadow-sm ${className}`}>
        {showIcon && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
        Rejected
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
      Pending Review
    </span>
  );
};
