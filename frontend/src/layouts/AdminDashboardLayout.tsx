import { useEffect, useState } from 'react';
import type { FC, ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { getUser, clearSession } from '../services/api';

const navItems = [
  { to: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/admin/users', label: 'Users', icon: Users, end: false },
];

export const AdminDashboardLayout: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== 'Admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  const sidebar = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo shrink-0" />
        <div>
          <p className="text-sm font-bold text-gray-900 leading-tight">Visitor Gate Pass</p>
          <p className="text-[11px] text-gray-400 font-medium">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-[11px] text-gray-400 font-medium">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)}></div>
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-y-0 left-0 w-[min(18rem,calc(100vw-1rem))] bg-white shadow-2xl"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebar}
          </motion.aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100 lg:hidden flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo w-24 h-10 shrink-0" />
            <span className="text-sm font-bold text-gray-900">Admin Dashboard</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-900 rounded-lg border border-gray-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <main className="p-3 sm:p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
