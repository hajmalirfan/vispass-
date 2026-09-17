import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Search, Trash2, Loader2, ShieldCheck } from 'lucide-react';
import { api, getUser } from '../../services/api';

interface AdminUser {
  id: number;
  email: string;
  role: string;
}

export const AdminUsersPage: FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [removingId, setRemovingId] = useState<number | null>(null);
  const me = getUser();

  const load = () => {
    setLoading(true);
    setErrorMsg('');
    api<AdminUser[]>('/admin/users')
      .then(setUsers)
      .catch((err: Error) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRemove = async (u: AdminUser) => {
    if (u.id === me?.id) return;
    if (!window.confirm(`Remove user ${u.email}? This cannot be undone.`)) return;
    setRemovingId(u.id);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await api<{ message: string }>(`/admin/users/${u.id}`, { method: 'DELETE' });
      setSuccessMsg(data.message);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Remove failed.');
    } finally {
      setRemovingId(null);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(query.toLowerCase()) ||
      u.role.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">View and remove any Visitor, Host or Checker account.</p>
      </div>

      {errorMsg && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center">{errorMsg}</div>}
      {successMsg && <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-medium text-center">{successMsg}</div>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by email or role..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-500 text-sm font-medium">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 font-semibold">ID</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-5 py-3 text-gray-500 font-medium">#{u.id}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        {u.email}
                        {u.id === me?.id && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> YOU
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">{u.role}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleRemove(u)}
                        disabled={u.id === me?.id || removingId === u.id}
                        title={u.id === me?.id ? 'You cannot remove yourself' : `Remove ${u.email}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {removingId === u.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-gray-400 font-medium">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
