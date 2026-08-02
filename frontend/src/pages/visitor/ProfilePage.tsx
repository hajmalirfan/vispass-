import { useCallback, useEffect, useState } from 'react';
import type { FC, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, Phone, Building2, Loader2, Save, BadgeCheck } from 'lucide-react';
import { api } from '../../services/api';
import { PageHeader, LoadingState, ErrorBanner, SuccessBanner } from '../../components/ui';

interface Profile {
  id: number;
  email: string;
  role: string;
  full_name: string;
  phone: string;
  organization: string;
}

export const ProfilePage: FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    try {
      const p = await api<Profile>('/users/profile');
      setProfile(p);
      setFullName(p.full_name ?? '');
      setPhone(p.phone ?? '');
      setOrganization(p.organization ?? '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await api<Profile>('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName, phone, organization }),
      });
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-sm text-gray-900 placeholder:text-gray-400';

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" subtitle="Manage your personal information" />

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}
      {success && <SuccessBanner message={success} />}

      {loading ? (
        <LoadingState label="Loading profile..." />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="h-1.5 bg-gradient-to-r from-blue-500 to-sky-400" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl">
                {(fullName || profile?.email || 'V').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{fullName || 'Your Profile'}</p>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {profile?.email}
                </p>
                <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  {profile?.role}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={inputClass}
                    placeholder="Your full name"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="Contact number"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Organization</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className={inputClass}
                      placeholder="Company / institution"
                    />
                  </div>
                </div>
              </div>

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
                    Save Profile
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
