import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserPlus, Menu, X, Lock } from 'lucide-react';
import { getAuthToken } from '../services/api.js';

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isAdmin = !!getAuthToken();
  const isAdminRoute = location.pathname.startsWith('/admin');

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Apply for Membership', path: '/apply', highlight: true },
    { name: 'Check Status', path: '/status' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-300 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3.5 group">
            <img
              src="/vlbvn_logo.jpg"
              alt="VLBVN Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-gold-400 shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-extrabold text-xl text-charcoal-950 tracking-wide">
                  VLBVN COMMUNITY
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-gold-100 text-gold-800 rounded border border-gold-300">
                  Business Network
                </span>
              </div>
              <p className="text-[11px] text-charcoal-700 hidden sm:block font-medium tracking-tight">
                Veerashaiva Lingayat Business Visionary Network
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-sm hover:shadow transition-all"
                  >
                    <UserPlus className="w-4 h-4 text-charcoal-950" />
                    {link.name}
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-charcoal-950 bg-cream-200/80 font-semibold'
                      : 'text-charcoal-700 hover:text-charcoal-950 hover:bg-cream-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Admin Portal Button */}
            <div className="pl-3 border-l border-cream-300 ml-1">
              <Link
                to={isAdmin ? '/admin/dashboard' : '/admin/login'}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isAdminRoute
                    ? 'bg-charcoal-900 text-gold-300 border-charcoal-900 shadow-sm'
                    : 'bg-white text-charcoal-700 border-gray-200 hover:border-gold-400 hover:text-charcoal-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-gold-500" />
                {isAdmin ? 'Admin Console' : 'Admin Login'}
              </Link>
            </div>
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/apply"
              className="px-3 py-1.5 text-xs font-semibold rounded-md bg-gold-400 text-charcoal-950"
            >
              Apply
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-charcoal-700 hover:bg-cream-200 focus:outline-none"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-cream-300 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-base font-medium ${
                location.pathname === link.path
                  ? 'bg-gold-50 text-gold-700 font-semibold'
                  : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 border-t border-cream-200">
            <Link
              to={isAdmin ? '/admin/dashboard' : '/admin/login'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium text-charcoal-800 bg-cream-100"
            >
              <Lock className="w-4 h-4 text-gold-500" />
              {isAdmin ? 'Go to Admin Console' : 'Admin Portal Login'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
