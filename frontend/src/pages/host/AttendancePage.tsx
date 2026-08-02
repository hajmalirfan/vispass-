import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, Loader2, ClipboardCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState, formatDateTime } from '../../components/ui';
import { RegistrationCard } from '../../components/RegistrationCard';

export const AttendancePage: FC = () => {
  const [visitors, setVisitors] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setVisitors(await api<Registration[]>('/api/registrations?status=accepted'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mark = async (regId: number, action: 'checkin' | 'checkout') => {
    setBusyId(regId);
    setError('');
    try {
      const updated = await api<Registration>(`/api/registrations/${regId}/${action}`, { method: 'PUT' });
      setVisitors((prev) => prev.map((v) => (v.id === regId ? updated : v)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update attendance');
    } finally {
      setBusyId(null);
    }
  };

  const checkedIn = visitors.filter((v) => v.checked_in).length;
  const checkedOut = visitors.filter((v) => v.checked_out).length;

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Track check-ins and check-outs for accepted visitors"
        action={
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold">
            <ClipboardCheck className="w-4 h-4" />
            {checkedIn} checked in · {checkedOut} checked out
          </span>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading attendance..." />
      ) : visitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No accepted visitors" hint="Mark attendance once you have accepted visitors." />
        </div>
      ) : (
        <div className="grid gap-4">
          {visitors.map((reg) => (
            <RegistrationCard
              key={reg.id}
              reg={reg}
              actions={() => (
                <div className="shrink-0">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${reg.checked_in ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                      {reg.checked_in ? `In ${formatDateTime(reg.checked_in_at)}` : 'Not checked in'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className={`w-2 h-2 rounded-full ${reg.checked_out ? 'bg-sky-500' : 'bg-gray-200'}`} />
                      {reg.checked_out ? 'Out' : 'Not checked out'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => mark(reg.id, 'checkin')}
                      disabled={busyId === reg.id || reg.checked_in}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                      Check In
                    </motion.button>
                    <button
                      onClick={() => mark(reg.id, 'checkout')}
                      disabled={busyId === reg.id || !reg.checked_in || reg.checked_out}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyId === reg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                      Check Out
                    </button>
                  </div>
                </div>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
