import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building2, Mail, Lock, Eye, EyeOff, UserPlus, Loader2, BadgeCheck, ShieldCheck, KeyRound } from 'lucide-react';
import API_URL from '../services/api';

type Role = 'Visitor' | 'Host' | 'Checker' | 'Admin';

const ADMIN_EMAIL = 'kinghajmalirfan@gmail.com';

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>('Visitor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [adminStep, setAdminStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState('');

  const selectRole = (value: Role) => {
    // Clicking the selected role again un-selects it.
    setRole((prev) => {
      const next = prev === value ? null : value;
      if (next === 'Admin') {
        setEmail(ADMIN_EMAIL);
        setAdminStep('credentials');
        setOtp('');
      }
      return next;
    });
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) {
      setErrorMsg('Please select a role (Visitor, Host, Checker or Admin) to continue.');
      return;
    }
    if (role === 'Admin') {
      await handleAdminSendOtp(e);
      return;
    }
    setIsSigningIn(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please check your credentials.');
      }

      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccessMsg(`Welcome back! Logged in as ${data.user.role}.`);

      setTimeout(() => {
        if (data.user.role === 'Host') {
          navigate('/dashboard/host');
        } else if (data.user.role === 'Checker') {
          navigate('/dashboard/checker');
        } else {
          navigate('/dashboard/visitor');
        }
      }, 800);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_URL}/admin/login-otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Could not send OTP.');
      }
      setSuccessMsg('4-digit OTP sent to the admin email. Enter it below.');
      setAdminStep('otp');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleAdminVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp.trim())) {
      setErrorMsg('OTP must be exactly 4 digits.');
      return;
    }
    setIsSigningIn(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const response = await fetch(`${API_URL}/admin/login-otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'OTP verification failed.');
      }
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMsg('Welcome back, Admin! Opening dashboard...');
      setTimeout(() => navigate('/dashboard/admin'), 800);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const roles: { value: Role; label: string; icon: any; color: string; desc: string }[] = [
    { value: 'Visitor', label: 'Visitor', icon: User, color: 'text-blue-600', desc: 'Access & pass requests' },
    { value: 'Host', label: 'Host', icon: Building2, color: 'text-blue-600', desc: 'Manage visitors & passes' },
    { value: 'Checker', label: 'Checker', icon: BadgeCheck, color: 'text-blue-600', desc: 'Verify at gate points' },
    { value: 'Admin', label: 'Admin', icon: ShieldCheck, color: 'text-blue-600', desc: 'Full control via email OTP' },
  ];

  const selectedRole = roles.find(r => r.value === role);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      {/* Brand Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex justify-center mb-4">
          <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo w-48 h-28" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Visitor Gate Pass
        </h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Secure Access Management Platform
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[420px] z-10"
      >
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl shadow-gray-200/50 p-5 sm:p-8 md:p-10">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm font-medium text-center"
            >
              {successMsg}
            </motion.div>
          )}

          <form onSubmit={role === 'Admin' ? (adminStep === 'otp' ? handleAdminVerifyOtp : handleAdminSendOtp) : handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">Login As</label>
              <div className="grid grid-cols-4 gap-2">
                {roles.map((r) => {
                  const isSelected = role === r.value;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => selectRole(r.value)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all duration-200 group ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-colors duration-200 ${isSelected ? r.color : 'text-gray-400 group-hover:text-gray-500'}`} />
                      <span className="text-xs font-semibold tracking-wide">{r.label}</span>
                    </button>
                  );
                })}
              </div>
              {selectedRole ? (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-400 text-center font-medium"
                >
                  {selectedRole.desc} — tap again to un-select
                </motion.p>
              ) : (
                <p className="text-xs text-amber-600 text-center font-semibold">
                  No role selected — pick one above to continue
                </p>
              )}
            </div>

            {/* Email (hidden for Admin — fixed server-side, never displayed) */}
            {role !== 'Admin' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className={`relative rounded-xl border transition-all duration-200 bg-white ${
                isFocused === 'email' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className={`h-4 w-4 transition-colors duration-200 ${isFocused === 'email' ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="name@organization.com"
                />
              </div>
            </div>
            )}

            {/* Admin OTP notice */}
            {role === 'Admin' && adminStep === 'credentials' && (
              <div className="p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-xl text-xs font-medium text-center">
                Admin sign-in is passwordless — click Send OTP and enter the 4-digit code mailed to you.
              </div>
            )}

            {/* Password (password login is not used for Admin) */}
            {role !== 'Admin' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className={`relative rounded-xl border transition-all duration-200 bg-white ${
                isFocused === 'password' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className={`h-4 w-4 transition-colors duration-200 ${isFocused === 'password' ? 'text-blue-500' : 'text-gray-400'}`} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setIsFocused('password')}
                  onBlur={() => setIsFocused(null)}
                  className="w-full pl-10 pr-12 py-3 bg-transparent focus:outline-none text-sm text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            )}

            {/* Admin OTP entry */}
            {role === 'Admin' && adminStep === 'otp' && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">4-digit OTP</label>
              <div className="relative rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  className="w-full pl-10 pr-4 py-3 bg-transparent focus:outline-none text-center text-xl tracking-[0.5em] font-bold text-gray-900 placeholder:text-gray-300"
                />
              </div>
              <div className="flex items-center justify-between text-sm pt-1">
                <button
                  type="button"
                  onClick={() => { setAdminStep('credentials'); setOtp(''); setErrorMsg(''); setSuccessMsg(''); }}
                  className="text-gray-500 hover:text-gray-800 font-semibold text-sm transition-colors"
                >
                  ← Change email
                </button>
                <button
                  type="button"
                  onClick={handleAdminSendOtp}
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                  Resend OTP
                </button>
              </div>
            </div>
            )}

            {/* Remember & Forgot */}
            {role !== 'Admin' && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/30 transition-colors cursor-pointer" />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors font-medium text-sm">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
              >
                Forgot password?
              </button>
            </div>
            )}

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: isSigningIn ? 1 : 1.01 }}
              whileTap={{ scale: isSigningIn ? 1 : 0.99 }}
              type="submit"
              disabled={isSigningIn}
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{role === 'Admin' ? (adminStep === 'otp' ? 'Verifying...' : 'Sending OTP...') : 'Signing in...'}</span>
                </>
              ) : (
                <span>{role === 'Admin' ? (adminStep === 'otp' ? 'Verify OTP & Sign In' : 'Send OTP') : 'Sign In'}</span>
              )}
            </motion.button>
          </form>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Create new account
          </button>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center text-xs text-gray-400 z-10 font-medium"
      >
        <p>Visitor Entry &amp; Gate Pass Management System</p>
        <button type="button" onClick={() => navigate('/privacy-policy')} className="mt-2 text-blue-600 hover:text-blue-700 transition-colors">
          Privacy Policy
        </button>
      </motion.div>
    </div>
  );
};

export default LoginPage;
