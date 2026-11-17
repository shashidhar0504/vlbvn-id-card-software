import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';
import { api, setAuthToken, getAuthToken } from '../../services/api.js';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getAuthToken()) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await api.login({ email, password });
      setAuthToken(res.token);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCreds = () => {
    setEmail('admin@vlpn.org');
    setPassword('admin123');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-cream-300 shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-950 p-8 text-center text-white border-b-4 border-gold-400">
          <img
            src="/vlbvn_logo.jpg"
            alt="VLBVN Logo"
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-gold-400 shadow-lg"
          />
          <h1 className="font-serif text-2xl font-bold text-white tracking-wide">
            VLBVN Admin Portal
          </h1>
          <p className="text-xs text-gold-200 mt-1">
            Veerashaiva Lingayat Business Visionary Network
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5 font-mono">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4 text-gold-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vlpn.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 uppercase tracking-wider mb-1.5 font-mono">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 text-gold-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:border-gold-500 focus:ring-2 focus:ring-gold-200 outline-none text-sm transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In to Admin Console</span>
                </>
              )}
            </button>

          </form>

          {/* Quick Demo Credentials Autofill Pill */}
          <div className="pt-4 border-t border-cream-200 text-center">
            <button
              type="button"
              onClick={fillDemoCreds}
              className="text-xs font-semibold text-gold-700 hover:text-gold-900 bg-gold-50 hover:bg-gold-100 border border-gold-300 px-3 py-1.5 rounded-lg transition"
            >
              Autofill Default Credentials (admin@vlpn.org / admin123)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
