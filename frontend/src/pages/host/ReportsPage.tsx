import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Download, CalendarRange, Users, Clock, CheckCircle2, XCircle, ClipboardCheck } from 'lucide-react';
import { api, apiBlob } from '../../services/api';
import type { ReportsSummary } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState } from '../../components/ui';

const StatCard: FC<{ label: string; value: number | string; icon: FC<{ className?: string }>; color: string }> = ({
  label,
  value,
  icon: Icon,
  color,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
    <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
    <p className="text-sm text-gray-500 font-medium mt-1.5">{label}</p>
  </motion.div>
);

export const ReportsPage: FC = () => {
  const [report, setReport] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setReport(await api<ReportsSummary>('/reports/summary'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    try {
      await apiBlob('/reports/export', 'visitor-report.csv');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Analytics and insights for your events"
        action={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Compiling reports..." />
      ) : !report || report.total_events === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No report data" hint="Create events and review visitor requests to see analytics here." />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard label="Events" value={report.total_events} icon={CalendarRange} color="bg-blue-50 text-blue-600" />
            <StatCard label="Total Registrations" value={report.total_registrations} icon={Users} color="bg-blue-50 text-blue-600" />
            <StatCard label="Pending" value={report.pending} icon={Clock} color="bg-amber-50 text-amber-600" />
            <StatCard label="Accepted" value={report.accepted} icon={CheckCircle2} color="bg-blue-50 text-blue-600" />
            <StatCard label="Rejected" value={report.rejected} icon={XCircle} color="bg-red-50 text-red-600" />
            <StatCard label="Checked In" value={report.checked_in} icon={ClipboardCheck} color="bg-sky-50 text-sky-600" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-bold text-gray-900">Per-Event Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3 text-center">Total</th>
                    <th className="px-5 py-3 text-center">Pending</th>
                    <th className="px-5 py-3 text-center">Accepted</th>
                    <th className="px-5 py-3 text-center">Rejected</th>
                    <th className="px-5 py-3 text-center">Checked In</th>
                  </tr>
                </thead>
                <tbody>
                  {report.per_event.map((row) => (
                    <tr key={row.event_id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-gray-900">{row.title}</td>
                      <td className="px-5 py-3.5 text-center font-bold text-gray-900">{row.total}</td>
                      <td className="px-5 py-3.5 text-center text-amber-600 font-semibold">{row.pending}</td>
                      <td className="px-5 py-3.5 text-center text-blue-600 font-semibold">{row.accepted}</td>
                      <td className="px-5 py-3.5 text-center text-red-500 font-semibold">{row.rejected}</td>
                      <td className="px-5 py-3.5 text-center text-sky-600 font-semibold">{row.checked_in}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
