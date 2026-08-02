import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, QrCode, Clock, FileText } from 'lucide-react';
import { api } from '../../services/api';
import type { Registration } from '../../services/types';
import {
  PageHeader,
  LoadingState,
  ErrorBanner,
  EmptyState,
  StatusBadge,
  formatDateTime,
  formatDate,
} from '../../components/ui';

export const MyApplicationsPage: FC = () => {
  const [apps, setApps] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setApps(await api<Registration[]>('/api/registrations'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = apps.filter((a) => a.status === 'pending').length;
  const accepted = apps.filter((a) => a.status === 'accepted').length;

  return (
    <div>
      <PageHeader
        title="My Applications"
        subtitle="Track the status of your event applications"
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-600 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {pending} pending
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold">
              <QrCode className="w-3.5 h-3.5" />
              {accepted} accepted
            </span>
          </div>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading applications..." />
      ) : apps.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No applications yet" hint="Browse available events and apply to register for a visit." />
        </div>
      ) : (
        <div className="grid gap-4">
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {app.visitor_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{app.event?.title ?? `Event #${app.event_id}`}</h3>
                    <StatusBadge status={app.status} />
                  </div>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
                    {app.event?.event_date && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {formatDate(app.event.event_date)}
                      </span>
                    )}
                    {app.event?.location && (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {app.event.location}
                      </span>
                    )}
                    {app.purpose && (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-gray-400" />
                        {app.purpose}
                      </span>
                    )}
                    <span className="text-gray-400">Applied {formatDateTime(app.created_at)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplicationsPage;
