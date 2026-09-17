import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, CalendarDays, FileText, QrCode, LogIn, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface Stats {
  total_users: number;
  users_by_role: Record<string, number>;
  total_events: number;
  registrations_by_status: Record<string, number>;
  total_gate_passes: number;
  checked_in: number;
}

export const AdminOverviewPage: FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    api<Stats>('/admin/stats')
      .then(setStats)
      .catch((err: Error) => setErrorMsg(err.message));
  }, []);

  if (errorMsg) {
    return <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-medium text-center">{errorMsg}</div>;
  }

  if (!stats) {
    return <div className="flex items-center justify-center gap-2 py-20 text-gray-500 text-sm font-medium"><Loader2 className="w-5 h-5 animate-spin" /> Loading application stats...</div>;
  }

  const cards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, bg: 'bg-blue-50 text-blue-600' },
    { label: 'Total Events', value: stats.total_events, icon: CalendarDays, bg: 'bg-sky-50 text-sky-600' },
    { label: 'Registrations (Pending)', value: stats.registrations_by_status.pending ?? 0, icon: FileText, bg: 'bg-amber-50 text-amber-600' },
    { label: 'Gate Passes Issued', value: stats.total_gate_passes, icon: QrCode, bg: 'bg-emerald-50 text-emerald-600' },
    { label: 'Checked In', value: stats.checked_in, icon: LogIn, bg: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Admin Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Full application control — users, events, passes and entry logs.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.bg}`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">{c.label}</p>
            </div>
          );
        })}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-sm font-semibold text-gray-900 mb-2">Users by role</p>
          <div className="space-y-1">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-gray-500 font-medium">{role}</span>
                <span className="font-bold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate('/dashboard/admin/users')}
        className="inline-flex items-center gap-2 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md transition-colors"
      >
        <Users className="w-4 h-4" /> Manage Users
      </button>
    </div>
  );
};

export default AdminOverviewPage;
