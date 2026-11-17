import React from 'react';
import { Mail, Phone, MapPin, Globe, ShieldCheck, Clock, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-100 border border-gold-300 text-gold-800 text-xs font-bold uppercase tracking-wider font-mono">
          <MessageSquare className="w-3.5 h-3.5 text-gold-600" />
          <span>Secretariat & Help Desk</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-charcoal-950">
          Contact VLBVN Community
        </h1>
        <p className="text-sm text-charcoal-700 max-w-lg mx-auto">
          Reach out to our membership verification officers or central chapter coordinators for assistance with registrations, chapter expansion, or corporate partnerships.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-charcoal-950">Membership Inquiries</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            For application status queries, photo corrections, or replacement digital ID cards:
          </p>
          <a href="mailto:membership@vlbvn.org" className="text-xs font-bold text-gold-700 hover:underline block">
            membership@vlbvn.org
          </a>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-charcoal-950">Secretariat Helpline</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            Monday through Saturday, 9:30 AM to 6:00 PM IST:
          </p>
          <div className="text-xs font-bold text-charcoal-950">
            +91 98800 12345 / +91 80 2345 6789
          </div>
        </div>

        <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-serif font-bold text-base text-charcoal-950">Central Secretariat</h3>
          <p className="text-xs text-charcoal-600 leading-relaxed">
            VLPN Central Bhavan, Near Basaveshwara Circle, High Grounds, Bengaluru, Karnataka 560001, India.
          </p>
        </div>

      </div>

      {/* Chapters Overview Box */}
      <div className="bg-cream-100/70 rounded-3xl p-8 border border-gold-300/60 space-y-4">
        <h3 className="font-serif font-bold text-lg text-charcoal-950">
          Regional Chapter Network
        </h3>
        <p className="text-xs text-charcoal-700 max-w-2xl">
          VLPN operates active chapters across Karnataka, Maharashtra, Telangana, Delhi NCR, and international chapters across North America, Europe, and the Middle East.
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {['Bengaluru Central', 'Hubballi - Dharwad', 'Belagavi', 'Mysuru', 'Kalaburagi', 'Vijayapura', 'Davanagere', 'Shivamogga', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi NCR', 'Global Overseas'].map((ch) => (
            <span key={ch} className="px-3 py-1 rounded-full text-xs font-medium bg-white text-charcoal-800 border border-cream-300 shadow-sm">
              {ch}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};
