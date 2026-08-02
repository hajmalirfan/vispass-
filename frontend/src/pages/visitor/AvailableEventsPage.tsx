import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users, ChevronRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { Event } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState, formatDate } from '../../components/ui';

export const AvailableEventsPage: FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setEvents(await api<Event[]>('/events'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
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
        title="Available Events"
        subtitle="Browse events hosted by organizations and apply to register"
        action={
          <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold">
            <ShieldCheck className="w-4 h-4" />
            {events.length} open
          </span>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading events..." />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState title="No events available" hint="Events will appear here once hosts publish them." />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, i) => (
            <motion.button
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/events/${event.id}/register`)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col group"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-400" />
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-blue-700 transition-colors">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{event.description}</p>
                )}
                <div className="space-y-1.5 text-sm text-gray-500 mt-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    {formatDate(event.event_date)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {event.location || 'No location set'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Capacity {event.capacity > 0 ? event.capacity : 'Unlimited'}
                  </div>
                </div>
                <span className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                  Apply for Event
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableEventsPage;
