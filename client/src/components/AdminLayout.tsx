import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  IdCard,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  FileCheck
} from 'lucide-react';
import { getAuthToken, removeAuthToken, api } from '../services/api.js';

export const AdminLayout: React.FC = () => {
  const [adminUser, setAdminUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      navigate('/admin/login');
      return;
    }

    api.getMe()
      .then(res => setAdminUser(res.admin))
      .catch(() => {
        removeAuthToken();
        navigate('/admin/login');
      });
  }, [navigate]);

  const handleLogout = () => {
    removeAuthToken();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Applications', path: '/admin/applications', icon: FileCheck },
    { label: 'Approved Members', path: '/admin/members', icon: Users },
    { label: 'ID Card Designer', path: '/admin/templates', icon: IdCard, badge: 'Key' },
    { label: 'Email Logs', path: '/admin/emails', icon: Mail },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col text-charcoal-900">
      
      {/* Top Admin Header Bar */}
      <header className="bg-charcoal-950 text-white border-b-2 border-gold-400 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <Link to="/admin/dashboard" className="flex items-center gap-2.5">
                <img
                  src="/vlbvn_logo.jpg"
                  alt="VLBVN Logo"
                  className="w-10 h-10 rounded-full object-cover border border-gold-400 shadow"
                />
                <div>
                  <span className="font-serif font-bold text-base text-white tracking-wide flex items-center gap-1.5">
                    VLBVN ADMIN <span className="text-gold-400 text-xs px-1.5 py-0.5 rounded bg-charcoal-800 border border-charcoal-700">PORTAL</span>
                  </span>
                  <p className="text-[10px] text-gold-200 hidden sm:block">Membership & Credential Console</p>
                </div>
              </Link>
            </div>

            {/* Right: Quick actions & user menu */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                target="_blank"
                className="hidden md:flex items-center gap-1 text-xs text-gray-300 hover:text-gold-300 transition-colors"
              >
                <span>View Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex items-center gap-2 pl-3 border-l border-charcoal-800">
                <div className="w-7 h-7 rounded-full bg-gold-500/20 text-gold-300 flex items-center justify-center border border-gold-400 text-xs font-bold">
                  {adminUser?.name ? adminUser.name[0] : 'A'}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-semibold text-white truncate max-w-[120px]">
                    {adminUser?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-gold-300">Super Admin</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-charcoal-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="bg-charcoal-900 border-t border-charcoal-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2 scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gold-400 text-charcoal-950 shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-charcoal-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-charcoal-950' : 'text-gold-400'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                        isActive ? 'bg-charcoal-900 text-gold-300' : 'bg-gold-400/20 text-gold-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Admin View Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-cream-200 bg-white py-4 text-center text-xs text-charcoal-600">
        VLBVN Community Administration Console • Secure Verification & ID Generation Engine
      </footer>

    </div>
  );
};
