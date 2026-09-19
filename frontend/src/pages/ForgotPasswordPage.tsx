import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, KeyRound, Lock, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import API_URL from '../services/api';

type Step = 'email' | 'otp' | 'reset';

export const ForgotPasswordPage: FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const post = async (path: string, body: object) => {
    const res = await fetch(`${API_URL}/users${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail || 'Request failed.');
    return data;
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = await post('/forgot-password', { email });
      setSuccessMsg(`${data.message} Check your inbox for the 4-digit code.`);
      setStep('otp');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(otp.trim())) {
      setErrorMsg('OTP must be exactly 4 digits.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await post('/verify-otp', { email, otp: otp.trim() });
      setSuccessMsg('OTP verified. Set your new password.');
      setStep('reset');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await post('/reset-password', { email, otp: otp.trim(), new_password: newPassword });
      setSuccessMsg(`${data.message} Redirecting to login...`);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gray-50 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      </div>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 z-10">
        <div className="flex justify-center mb-4">
          <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo w-48 h-28" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
        <p className="text-sm text-gray-500 mt-1">Works for Visitor, Host &amp; Checker accounts</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[420px] z-10">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl p-5 sm:p-8">
          <div className="flex items-center gap-2 mb-6 text-xs font-semibold text-gray-500">
            {(['email', 'otp', 'reset'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{i + 1}</span>
                <span className="capitalize hidden sm:inline">{s === 'email' ? 'Email' : s === 'otp' ? 'OTP' : 'New password'}</span>
                {i < 2 && <span className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>

          {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm text-center font-medium">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-sm text-center font-medium">{successMsg}</div>}

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Mail className="w-4 h-4" /> Registered email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
              <button type="submit" disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : 'Send 4-digit OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><KeyRound className="w-4 h-4" /> 4-digit OTP sent to {email}</label>
              <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} inputMode="numeric"
                placeholder="••••" maxLength={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
              <button type="submit" disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify OTP'}
              </button>
              <button type="button" onClick={handleSendOtp} className="w-full text-sm text-blue-600 font-semibold hover:text-blue-700">Resend OTP</button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleReset} className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Lock className="w-4 h-4" /> New password (min 8 chars)</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} required minLength={8} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password"
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}

          <button type="button" onClick={() => navigate('/')}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
