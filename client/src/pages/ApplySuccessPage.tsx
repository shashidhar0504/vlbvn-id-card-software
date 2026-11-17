import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Mail,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ApplySuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refNo = searchParams.get('ref') || 'VLBVN-APP-2026-0001';
  const name = searchParams.get('name') || 'Respected Member';
  const email = searchParams.get('email') || '';
  const chapter = searchParams.get('chapter') || 'VLBVN Central';

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#B8860B', '#F3E5AB', '#0F172A']
    });
  }, []);

  const copyRef = () => {
    navigator.clipboard.writeText(refNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      <div className="bg-white rounded-3xl border border-cream-300 shadow-2xl overflow-hidden">
        
        {/* Top Celebration Header */}
        <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-charcoal-950 p-8 sm:p-10 text-center text-white border-b-4 border-gold-400 relative">
          <div className="w-16 h-16 rounded-2xl bg-gold-400 text-charcoal-950 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle2 className="w-10 h-10 text-charcoal-950" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Application Submitted Successfully!
          </h1>
          <p className="text-gold-200 text-sm mt-1 max-w-md mx-auto">
            Welcome to the VLBVN Community onboarding process.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8">
          
          <div className="text-center space-y-2">
            <p className="text-sm text-charcoal-700">
              Thank you, <strong className="text-charcoal-950">{name}</strong>. Your membership registration for the <strong className="text-charcoal-950">{chapter} Chapter</strong> has been recorded in our secure registry.
            </p>
          </div>

          {/* Reference Number Box */}
          <div className="bg-gold-50/70 border-2 border-dashed border-gold-400 rounded-2xl p-6 text-center space-y-2">
            <span className="text-xs font-bold text-gold-800 uppercase tracking-widest font-mono">
              Your Application Reference Number
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-charcoal-950 tracking-wider">
                {refNo}
              </span>
              <button
                onClick={copyRef}
                title="Copy Reference Number"
                className="p-2 rounded-lg bg-gold-200 hover:bg-gold-300 text-charcoal-900 transition flex items-center gap-1 text-xs font-bold"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-charcoal-600">
              Please save this reference number. You can use it to track your approval status at any time.
            </p>
          </div>

          {/* Timeline / Next Steps */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-charcoal-800 uppercase tracking-wider font-mono">
              What Happens Next?
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-charcoal-900">Acknowledgement Email Dispatched</div>
                  <div className="text-charcoal-600">
                    A formal confirmation email has been sent to <span className="font-semibold text-charcoal-800">{email || 'your registered email'}</span>.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-charcoal-900">Chapter Scrutiny & Approval</div>
                  <div className="text-charcoal-600">
                    The VLPN Chapter Review Committee scrutinizes submitted business information. Review takes 24–48 hours.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3.5 rounded-xl bg-cream-50 border border-cream-200">
                <div className="w-7 h-7 rounded-full bg-gold-200 text-gold-900 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-charcoal-900">Automated Digital ID Card Generation & Delivery</div>
                  <div className="text-charcoal-600">
                    Immediately upon approval, the system assigns your unique Member ID, renders your personalized card, and delivers the PDF & PNG files to your email.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={`/status?query=${encodeURIComponent(refNo)}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition"
            >
              <Clock className="w-4 h-4" />
              <span>Track Application Status Now</span>
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-semibold text-charcoal-800 bg-cream-100 hover:bg-cream-200 transition"
            >
              <span>Back to Home</span>
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
