import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { motion } from 'framer-motion';
import { Download, Printer, QrCode as QrIcon, Shield, CalendarDays, User as UserIcon, Hash } from 'lucide-react';
import { api, apiBlob, apiObjectUrl } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState, StatusBadge, formatDate } from '../../components/ui';

export const QrPassPage: FC = () => {
  const [passes, setPasses] = useState<Registration[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const accepted = await api<Registration[]>('/api/registrations?status=accepted');
      setPasses(accepted);
      if (accepted.length > 0) {
        setSelectedId(accepted[0].id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load passes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selected = passes.find((p) => p.id === selectedId) ?? null;

  const loadQr = useCallback(async () => {
    if (!selected) return;
    try {
      const url = await apiObjectUrl(`/api/registrations/${selected.id}/qr`);
      setQrUrl(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load QR code');
    }
  }, [selected]);

  useEffect(() => {
    setQrUrl('');
    loadQr();
  }, [loadQr]);

  const downloadQr = async () => {
    if (!selected) return;
    try {
      await apiBlob(`/api/registrations/${selected.id}/qr`, `gatepass-${selected.id}.png`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download QR pass');
    }
  };

  const printPass = () => {
    window.print();
  };

  return (
    <div>
      <PageHeader title="QR Pass" subtitle="Your digital gate pass for approved visits" />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading your pass..." />
      ) : passes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No active pass"
            hint="Once a host approves your application, your digital gate pass will appear here."
          />
        </div>
      ) : (
        <div className="max-w-3xl">
          {passes.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {passes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    p.id === selectedId
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {p.event?.title ?? `Event #${p.event_id}`}
                </button>
              ))}
            </div>
          )}

          {selected && (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="print-area bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-blue-600 via-sky-500 to-sky-400" />
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-xl">
                      <Shield className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 leading-tight">Visitor Gate Pass</p>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                        Official Access Pass
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="grid sm:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Visitor Name</p>
                        <p className="text-base font-bold text-gray-900">{selected.visitor_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Event</p>
                        <p className="text-base font-bold text-gray-900">{selected.event?.title ?? `Event #${selected.event_id}`}</p>
                        <p className="text-sm text-gray-500 font-medium">{formatDate(selected.event?.event_date ?? null)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <Hash className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">QR ID</p>
                        <p className="text-sm font-mono font-semibold text-gray-900 break-all">
                          {selected.qr_code ?? '—'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl shadow-sm">
                      {qrUrl ? (
                        <img src={qrUrl} alt="QR pass code" className="w-44 h-44" />
                      ) : (
                        <div className="w-44 h-44 flex items-center justify-center text-gray-300">
                          <QrIcon className="w-12 h-12 animate-pulse" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-medium text-center">
                      Present this code at the gate for verification
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selected && (
            <div className="no-print flex flex-col sm:flex-row gap-3 mt-5">
              <button
                onClick={downloadQr}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-colors flex-1"
              >
                <Download className="w-4 h-4" />
                Download QR
              </button>
              <button
                onClick={printPass}
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-5 py-3 rounded-xl transition-colors flex-1"
              >
                <Printer className="w-4 h-4" />
                Print Pass
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QrPassPage;
