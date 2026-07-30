import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Building, Mail, Lock, Eye, EyeOff, Shield, UserPlus, Loader2 } from 'lucide-react';

type Role = 'Visitor' | 'Host';

export const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('Visitor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    // Simulate login
    setTimeout(() => {
      setIsSigningIn(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
         style={{ background: 'linear-gradient(135deg, #f3f4f6 0%, #ffffff 100%)' }}>
      
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
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg">
            <Shield className="text-white w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
          Visitor Entry & Gate Pass System
        </h1>
        <p className="text-gray-500 mt-2 font-medium">
          Secure Visitor Access & Digital Gate Pass Platform
        </p>
      </motion.div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-[460px] glass-card rounded-[20px] p-8 md:p-10 z-10 relative"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700">Login As</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('Visitor')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  role === 'Visitor' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:bg-gray-50/50'
                }`}
              >
                <User className="w-6 h-6 mb-2" />
                <span className="font-medium">Visitor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('Host')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 ${
                  role === 'Host' 
                    ? 'border-blue-500 bg-blue-50/50 text-blue-600 shadow-sm' 
                    : 'border-gray-200 hover:border-blue-300 text-gray-500 hover:bg-gray-50/50'
                }`}
              >
                <Building className="w-6 h-6 mb-2" />
                <span className="font-medium">Host</span>
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
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500/50 transition-colors cursor-pointer" />
              <span className="text-gray-600 group-hover:text-gray-800 transition-colors font-medium">Remember Me</span>
            </label>
            <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={isSigningIn}
            className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/60"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-transparent text-gray-400 font-medium tracking-widest backdrop-blur-sm">OR</span>
          </div>
        </div>

        {/* Create New User */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={() => navigate('/register')}
          className="w-full bg-white/40 hover:bg-white/60 border border-white/50 text-gray-700 font-semibold py-3.5 rounded-xl shadow-sm transition-all duration-300 flex items-center justify-center space-x-2 backdrop-blur-md"
        >
          <UserPlus className="w-5 h-5 text-gray-500" />
          <span>Create New User</span>
        </motion.button>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 text-center text-sm text-gray-500 z-10"
      >
        <p>© 2026 Visitor Entry & Gate Pass Management System</p>
        <p className="mt-1 flex items-center justify-center space-x-2 font-medium">
          <span>Secure</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>Reliable</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>Fast</span>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
