import type { FC, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Inbox } from 'lucide-react';

export const PageHeader: FC<{ title: string; subtitle?: string; action?: ReactNode }> = ({
  title,
  subtitle,
  action,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const LoadingState: FC<{ label?: string }> = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-20 text-gray-400">
    <Loader2 className="w-8 h-8 animate-spin mb-3" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export const ErrorBanner: FC<{ message: string; onDismiss?: () => void }> = ({ message, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 p-3.5 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium flex items-center justify-between gap-3"
  >
    <span>{message}</span>
    {onDismiss && (
      <button onClick={onDismiss} className="shrink-0 text-red-400 hover:text-red-600 font-semibold">
        Dismiss
      </button>
    )}
  </motion.div>
);

export const SuccessBanner: FC<{ message: string }> = ({ message }) => (
  <motion.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-5 p-3.5 bg-green-50 border border-green-100 text-green-700 rounded-xl text-sm font-medium"
  >
    {message}
  </motion.div>
);

export const EmptyState: FC<{ title: string; hint?: string }> = ({ title, hint }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
      <Inbox className="w-7 h-7 text-gray-400" />
    </div>
    <p className="text-sm font-semibold text-gray-700">{title}</p>
    {hint && <p className="text-xs text-gray-400 mt-1 font-medium max-w-xs">{hint}</p>}
  </div>
);

export const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
      {label}
    </span>
  );
};

export const formatDate = (value: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (value: string | null): string => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
