import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal-950 text-white pt-14 pb-8 border-t-2 border-gold-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/vlbvn_logo.jpg"
                alt="VLBVN Logo"
                className="w-12 h-12 rounded-full object-cover border border-gold-400 shadow"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  VLBVN COMMUNITY
                </h3>
                <p className="text-xs text-gold-300 font-medium">
                  Veerashaiva Lingayat Business Visionary Network
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 max-w-md leading-relaxed">
              Empowering Veerashaiva & Lingayat entrepreneurs, industrial leaders, and professionals across the globe through purposeful networking, mutual trade synergy, and leadership development.
            </p>
            <div className="flex items-center gap-2 text-xs text-gold-200">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <span>Official Digital Credential & Membership Authority</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 font-mono">
              Member Services
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/apply" className="hover:text-gold-300 transition-colors">
                  Apply for Membership
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-gold-300 transition-colors">
                  Check Application Status
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold-300 transition-colors">
                  Chapter Directory
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-gold-300 transition-colors">
                  Admin Verification Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 mb-4 font-mono">
              Help Desk
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                <span className="truncate">membership@vlbvn.org</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                <span>+91 98800 12345</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>VLBVN Central Secretariat, Bengaluru, Karnataka, India</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-charcoal-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>&copy; {new Date().getFullYear()} Veerashaiva Lingayat Business Visionary Network (VLBVN). All rights reserved.</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms & Conditions</span>
            <span>Code of Ethics</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
