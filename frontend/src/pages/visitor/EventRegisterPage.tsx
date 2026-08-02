import { useCallback, useEffect, useRef, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays, MapPin, Users, Loader2, UserPlus, Shield, FileUp, FileText, X } from 'lucide-react';
import { api, getUser } from '../../services/api';
import type { Event } from '../../services/types';
import { LoadingState, ErrorBanner, SuccessBanner, formatDate } from '../../components/ui';

export const EventRegisterPage: FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const user = getUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      setEvent(await api<Event>(`/events/${id}`));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load event');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('visitor_name', name);
    formData.append('visitor_email', user?.email ?? '');
    formData.append('phone', phone);
    formData.append('organization', organization);
    formData.append('purpose', purpose);
    if (idFile) {
      formData.append('id_proof', idFile);
    }

    try {
      await api(`/api/events/${id}/register`, {
        method: 'POST',
        body: formData,
      });
      setSuccess('Application submitted! Awaiting host approval.');
      setTimeout(() => navigate('/dashboard/visitor/applications'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-xl">
          <Shield className="text-white w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Visitor Gate Pass</p>
          <p className="text-[11px] text-gray-400 font-medium">Event Application</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/visitor')}
          className="ml-auto text-sm font-medium text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      <main className="flex-1 p-4 md:p-8 flex justify-center">
        {loading ? (
          <LoadingState label="Loading event..." />
        ) : !event ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10">
            <ErrorBanner message={error || 'Event not found'} />
          </div>
        ) : (
          <div className="w-full max-w-2xl space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-400" />
              <div className="p-6 md:p-8">
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                {event.description && <p className="text-sm text-gray-500 mt-2">{event.description}</p>}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    {formatDate(event.event_date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {event.location || 'No location set'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Capacity {event.capacity > 0 ? event.capacity : 'Unlimited'}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">Apply for this event</h2>
              <p className="text-sm text-gray-500 mb-6">Your application will be sent to the host for approval.</p>

              {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
              {success && <SuccessBanner message={success} />}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Phone</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder="Contact number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Organization</label>
                    <input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400"
                      placeholder="Company / institution"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Purpose of visit</label>
                  <textarea
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400 resize-none"
                    placeholder="Why are you visiting?"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">ID Proof (optional)</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                    onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                  {idFile ? (
                    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <span className="text-sm font-semibold text-blue-800 truncate">{idFile.name}</span>
                        <span className="text-xs text-blue-500 font-medium shrink-0">
                          {(idFile.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIdFile(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="shrink-0 p-1.5 rounded-lg text-blue-500 hover:bg-blue-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <FileUp className="w-4 h-4" />
                      Upload an ID document (optional)
                    </button>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-xl shadow-md shadow-blue-600/20 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Submit Application
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default EventRegisterPage;
