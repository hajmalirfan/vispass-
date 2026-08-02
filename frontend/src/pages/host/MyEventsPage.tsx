import { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin, Users, Plus, Pencil, Trash2, ArrowRight, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import type { Event, Registration } from '../../services/types';
import { PageHeader, LoadingState, ErrorBanner, EmptyState, formatDate } from '../../components/ui';

export const MyEventsPage: FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const list = await api<Event[]>('/events/mine');
      setEvents(list);
      const regs = await api<Registration[]>('/api/registrations');
      const map: Record<number, number> = {};
      for (const r of regs) {
        map[r.event_id] = (map[r.event_id] ?? 0) + 1;
      }
      setCounts(map);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (eventId: number) => {
    if (!window.confirm('Delete this event and all its registrations?')) return;
    setDeletingId(eventId);
    try {
      await api(`/events/${eventId}`, { method: 'DELETE' });
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Events"
        subtitle="Manage the events you host"
        action={
          <Link
            to="/dashboard/host/events/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Event
          </Link>
        }
      />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {loading ? (
        <LoadingState label="Loading your events..." />
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyState
            title="No events yet"
            hint="Create your first event to start accepting visitor registrations."
          />
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-600 to-sky-400" />
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug">{event.title}</h3>
                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                    <UserCheck className="w-3.5 h-3.5" />
                    {counts[event.id] ?? 0} registered
                  </span>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{event.description}</p>
                )}

                <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span>{formatDate(event.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{event.location || 'No location set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Capacity {event.capacity > 0 ? event.capacity : 'Unlimited'}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2 pt-4 border-t border-gray-50">
                  <Link
                    to={`/dashboard/host/events/${event.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                  <button
                    onClick={() => navigate(`/dashboard/host/visitor-requests?event=${event.id}`)}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    View Requests
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEventsPage;
