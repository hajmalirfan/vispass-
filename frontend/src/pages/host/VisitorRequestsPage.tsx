import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X, Building2, Phone, CalendarDays, Loader2, QrCode } from 'lucide-react';
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

export const VisitorRequestsPage: FC = () => {
  const [params] = useSearchParams();
  const eventFilter = params.get('event');

  const [requests, setRequests] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);
  const [showQr, setShowQr] = useState<Registration | null>(null);

  const load = useCallback(async () => {
    try {
      let path = '/api/registrations?status=pending';
      if (eventFilter) path += `&event_id=${eventFilter}`;
      setRequests(await api<Registration[]>(path));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  }, [eventFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const decide = async (regId: number, decision: 'accept' | 'reject') => {
    setBusyId(regId);
    setError('');
    try {
      const updated = await api<Registration>(`/api/registrations/${regId}/status?decision=${decision}`, {
        method: 'PUT',
      });
      setRequests((prev) => prev.filter((r) => r.id !== regId));
      if (decision === 'accept') {
        setShowQr(updated);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
    } finally {
      setBusyId(null);
    }
  };

  const downloadQr = async (regId: number) => {
    const { apiBlob } = await import('../../services/api');
    try {
      await apiBlob(`/api/registrations/${regId}/qr`, `gatepass-${regId}.png`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download QR pass');
    }
  };

  return (
    <div>
      <PageHeader
        title="Visitor Requests"
        subtitle="Approve or reject visitors waiting for access"
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading requests..." />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No pending requests"
            hint="New visitor registrations will appear here for your approval."
          />
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((reg, i) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
                  {reg.visitor_name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900">{reg.visitor_name}</h3>
                    <StatusBadge status={reg.status} />
                  </div>
                  <p className="text-sm text-gray-500 font-medium truncate">{reg.visitor_email}</p>

                  <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-500">
                    {reg.event && (
                      <span className="inline-flex items-center gap-1.5 font-medium text-gray-600">
                        <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                        {reg.event.title} · {formatDate(reg.event.event_date)}
                      </span>
                    )}
                    {reg.organization && (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {reg.organization}
                      </span>
                    )}
                    {reg.phone && (
                      <span className="inline-flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        {reg.phone}
                      </span>
                    )}
                    <span className="text-gray-400">Requested {formatDateTime(reg.created_at)}</span>
                  </div>

                  {reg.purpose && (
                    <p className="mt-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                      <span className="font-semibold text-gray-600">Purpose:</span> {reg.purpose}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 sm:flex-col lg:flex-row shrink-0">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => decide(reg.id, 'accept')}
                    disabled={busyId === reg.id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {busyId === reg.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </motion.button>
                  <button
                    onClick={() => decide(reg.id, 'reject')}
                    disabled={busyId === reg.id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowQr(null)}></div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Visitor Accepted</h3>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              {showQr.visitor_name} can now receive their gate pass.
            </p>
            <button
              onClick={() => downloadQr(showQr.id)}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-3 rounded-xl transition-colors"
            >
              <QrCode className="w-4 h-4" />
              Download QR Pass
            </button>
            <button
              onClick={() => setShowQr(null)}
              className="mt-2 w-full text-sm font-semibold text-gray-500 hover:text-gray-900 py-2 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default VisitorRequestsPage;
