import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, LogIn, LogOut, Clock } from 'lucide-react';
import { api } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState, StatusBadge, formatDate, formatDateTime } from '../../components/ui';

export const TodaysEntriesPage: FC = () => {
  const [entries, setEntries] = useState<Registration[]>([]);
  const [summary, setSummary] = useState<{ total_entries: number; checked_in: number; checked_out: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [list, sum] = await Promise.all([
        api<Registration[]>('/api/checker/today'),
        api<{ total_entries: number; checked_in: number; checked_out: number }>('/api/checker/summary'),
      ]);
      setEntries(list);
      setSummary(sum);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load today\'s entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Today's Entries"
        subtitle="Visitors verified and checked in today"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold">
              <CalendarCheck className="w-4 h-4" />
              {summary?.total_entries ?? entries.length} entries
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold">
              <LogIn className="w-4 h-4" />
              {summary?.checked_in ?? 0} inside
            </span>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 text-sm font-semibold">
              <LogOut className="w-4 h-4" />
              {summary?.checked_out ?? 0} out
            </span>
          </div>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading today's entries..." />
      ) : entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No entries yet today"
            hint="Once you scan and mark a visitor's entry, they will appear here."
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3.5">Visitor</th>
                  <th className="px-5 py-3.5">Event</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Entry Time</th>
                  <th className="px-5 py-3.5">Exit Time</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <motion.tr
                    key={entry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">
                          {entry.visitor_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{entry.visitor_name}</p>
                          <p className="text-xs text-gray-400 font-medium truncate">{entry.visitor_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">{entry.event?.title ?? `Event #${entry.event_id}`}</p>
                      <p className="text-xs text-gray-400 font-medium">{formatDate(entry.event?.event_date ?? null)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={entry.status} />
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${entry.checked_out ? 'text-sky-600' : entry.checked_in ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {entry.checked_out ? 'Exited' : entry.checked_in ? 'Inside' : '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-gray-700 font-medium">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {entry.checked_in_at ? formatDateTime(entry.checked_in_at) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {entry.checked_out_at ? formatDateTime(entry.checked_out_at) : '—'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodaysEntriesPage;
