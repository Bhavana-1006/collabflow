import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Mail, Lock, ArrowRight, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEMO_USERS = [
  {
    name: 'Alex Rivera',
    email: 'alex@collabflow.io',
    password: 'Password123!',
    role: 'Lead Architect & Founder',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bhavana Sharma',
    email: 'bhavana@collabflow.io',
    password: 'Password123!',
    role: 'Senior Frontend Engineer',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tejaswi Rao',
    email: 'tejaswi@collabflow.io',
    password: 'Password123!',
    role: 'Principal Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
  },
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back!', 'Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      error('Login Failed', err.response?.data?.message || err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoUser) => {
    setEmail(demoUser.email);
    setPassword(demoUser.password);
    setLoading(true);
    try {
      await login(demoUser.email, demoUser.password);
      success(`Logged in as ${demoUser.name}`, demoUser.role);
      navigate('/dashboard');
    } catch (err) {
      error('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-brand-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center shadow-xl shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">
            Collab<span className="text-brand-400">Flow</span>
          </span>
        </Link>
        <h2 className="mt-6 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Sign in to your workspace
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors">
            create a new account for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Quick Demo 1-Click Login Card */}
        <div className="mb-6 p-4 rounded-2xl bg-brand-950/40 border border-brand-500/30 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-300 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-4 h-4 text-brand-400" />
            Instant 1-Click Demo Login
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Open multiple browser tabs or incognito windows and log in as different personas to test real-time Socket.IO collaboration!
          </p>

          <div className="space-y-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => handleQuickDemoLogin(demo)}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-surface-900/80 hover:bg-surface-800 border border-slate-700/80 text-left transition-all hover:scale-[1.01] group"
              >
                <div className="flex items-center gap-2.5">
                  <img src={demo.avatar} alt={demo.name} className="w-7 h-7 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-brand-300">{demo.name}</p>
                    <p className="text-[10px] text-slate-400">{demo.role}</p>
                  </div>
                </div>
                <UserCheck className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="p-6 sm:p-8 rounded-2xl bg-surface-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-surface-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-brand-400 hover:text-brand-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-950 border border-slate-700/80 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded bg-surface-950 border-slate-700 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                Remember my session
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-600/30 transition-all hover:scale-[1.02] text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
