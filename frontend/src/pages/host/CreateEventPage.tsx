import { useCallback, useEffect, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Users, Loader2, Save, FileText } from 'lucide-react';
import { api } from '../../services/api';
import type { Event } from '../../services/types';
import { PageHeader, ErrorBanner, SuccessBanner } from '../../components/ui';

export const CreateEventPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadEvent = useCallback(async () => {
    if (!id) return;
    try {
      const event = await api<Event>(`/events/${id}`);
      setTitle(event.title);
      setDescription(event.description ?? '');
      setEventDate(event.event_date ?? '');
      setLocation(event.location ?? '');
      setCapacity(event.capacity > 0 ? String(event.capacity) : '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEdit) loadEvent();
  }, [isEdit, loadEvent]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const body = {
      title,
      description,
      event_date: eventDate || null,
      location,
      capacity: capacity ? Number(capacity) : 0,
    };

    try {
      if (isEdit) {
        await api(`/events/${id}`, { method: 'PUT', body: JSON.stringify(body) });
        setSuccess('Event updated successfully.');
      } else {
        const created = await api<Event>('/events', { method: 'POST', body: JSON.stringify(body) });
        setSuccess('Event created successfully.');
        setTimeout(() => navigate(`/dashboard/host/visitor-requests?event=${created.id}`), 800);
        return;
      }
      setTimeout(() => navigate('/dashboard/host'), 900);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
      setSaving(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400';

  return (
    <div className="max-w-2xl">
      <Link
        to="/dashboard/host"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Events
      </Link>

      <PageHeader title={isEdit ? 'Edit Event' : 'Create Event'} subtitle={isEdit ? 'Update the details of your event' : 'Set up a new event for visitor registration'} />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
      {success && <SuccessBanner message={success} />}

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Event Title *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Product Launch 2026"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none"
                placeholder="Short description of the event"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Location</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Conference Hall A"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Capacity</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="number"
                  min={0}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className={inputClass}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {isEdit ? 'Save Changes' : 'Create Event'}
                  </>
                )}
              </motion.button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/host')}
                className="px-4 py-3 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default CreateEventPage;
