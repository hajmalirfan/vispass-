import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { QrCode, Download, CheckCircle2 } from 'lucide-react';
import { api, apiBlob } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState } from '../../components/ui';
import { RegistrationCard } from '../../components/RegistrationCard';

export const AcceptedVisitorsPage: FC = () => {
  const [visitors, setVisitors] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setVisitors(await api<Registration[]>('/api/registrations?status=accepted'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load accepted visitors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const downloadQr = async (regId: number) => {
    try {
      await apiBlob(`/api/registrations/${regId}/qr`, `gatepass-${regId}.png`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download QR pass');
    }
  };

  return (
    <div>
      <PageHeader
        title="Accepted Visitors"
        subtitle="Visitors approved with an active gate pass"
        action={
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            {visitors.length} accepted
          </span>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading accepted visitors..." />
      ) : visitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No accepted visitors yet" hint="Approved visitors will appear here with their QR passes." />
        </div>
      ) : (
        <div className="grid gap-4">
          {visitors.map((reg) => (
            <RegistrationCard
              key={reg.id}
              reg={reg}
              actions={() => (
                <div className="flex flex-col gap-2 shrink-0 sm:flex-row lg:flex-col">
                  <button
                    onClick={() => downloadQr(reg.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Pass
                  </button>
                  <a
                    href={`http://127.0.0.1:8000/api/registrations/verify/${reg.qr_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Verify
                  </a>
                </div>
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AcceptedVisitorsPage;
