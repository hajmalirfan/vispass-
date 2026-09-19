import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building, Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, CheckSquare } from 'lucide-react';

type Role = 'Visitor' | 'Host' | 'Checker';

export const RegistrationPage: FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('Visitor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await fetch('http://localhost:8000/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      setSuccessMsg('User registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during registration');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8 z-10"
      >
        <div className="flex justify-center mb-4">
          <img src="/vispass-logo.png" alt="VisPass logo" className="brand-logo w-48 h-28" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Create New User
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Join the Visitor Entry & Gate Pass System
        </p>
      </motion.div>

      {/* Registration Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[460px] glass-card rounded-[20px] p-5 sm:p-8 md:p-10 z-10 relative"
      >
        <button 
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="text-center mb-8 mt-2">
          <h2 className="text-2xl font-bold text-gray-800">Register</h2>
          <p className="text-gray-500 mt-1">Fill in the details to create an account</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm font-medium text-center">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Account Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole('Visitor')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  role === 'Visitor' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <User className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Visitor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Host')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  role === 'Host' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <Building className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Host</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Checker')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  role === 'Checker' 
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:bg-gray-50'
                }`}
              >
                <CheckSquare className="w-5 h-5 mb-1.5" />
                <span className="text-xs font-semibold">Checker</span>
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm placeholder:text-gray-400"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Register Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isRegistering}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating User...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;
