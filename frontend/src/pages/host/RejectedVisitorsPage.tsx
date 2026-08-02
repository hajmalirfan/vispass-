import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { XCircle } from 'lucide-react';
import { api } from '../../services/api';
import type { Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState } from '../../components/ui';
import { RegistrationCard } from '../../components/RegistrationCard';

export const RejectedVisitorsPage: FC = () => {
  const [visitors, setVisitors] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setVisitors(await api<Registration[]>('/api/registrations?status=rejected'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load rejected visitors');
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
        title="Rejected Visitors"
        subtitle="Visitor requests that were declined"
        action={
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            {visitors.length} rejected
          </span>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading rejected visitors..." />
      ) : visitors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No rejected visitors" hint="Declined requests will appear here for your records." />
        </div>
      ) : (
        <div className="grid gap-4">
          {visitors.map((reg) => (
            <RegistrationCard key={reg.id} reg={reg} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RejectedVisitorsPage;
