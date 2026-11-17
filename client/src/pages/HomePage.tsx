import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Award,
  Users,
  Building2,
  ArrowRight,
  CheckCircle,
  IdCard,
  Sparkles
} from 'lucide-react';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-20 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-cream-200/60 via-cream-100 to-cream-50 -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* Top Logo & Badge */}
            <div className="flex flex-col items-center gap-3">
              <img
                src="/vlbvn_logo.jpg"
                alt="VLBVN Official Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-gold-400 shadow-xl"
              />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100/80 border border-gold-300 shadow-sm text-xs font-bold text-gold-800 tracking-wide uppercase font-mono">
                <Sparkles className="w-3.5 h-3.5 text-gold-600" />
                <span>Veerashaiva Lingayat Business Visionary Network</span>
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black text-charcoal-950 tracking-tight leading-[1.15]">
              VLBVN Community <br />
              <span className="text-gold-gradient drop-shadow-sm">Digital Membership & ID Card</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-charcoal-700 max-w-3xl mx-auto leading-relaxed">
              Uniting business leaders, industrialists, startups, and visionary professionals under a unified global ecosystem. Submit your registration online to receive your clean, minimalist official <strong className="text-charcoal-900 font-semibold">VLBVN Digital Membership ID Card</strong>.
            </p>

            {/* Call to Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/apply"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-base font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <span>Apply for Membership</span>
                <ArrowRight className="w-5 h-5 text-charcoal-950" />
              </Link>
              
              <Link
                to="/status"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-base font-semibold text-charcoal-800 bg-white hover:bg-cream-100 border border-cream-300 shadow-sm hover:shadow transition-all"
              >
                <ShieldCheck className="w-5 h-5 text-gold-600" />
                <span>Check Application Status</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-semibold text-charcoal-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Single 2-Minute Form</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Clean Light Minimalist Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Automated PDF & PNG Delivery</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Live Clean Minimalist Digital ID Card Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-charcoal-950 border-2 border-gold-300 shadow-xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-gold-50 text-gold-800 text-xs font-mono uppercase font-bold border border-gold-300">
                <IdCard className="w-3.5 h-3.5 text-gold-600" />
                <span>Official Digital Credential</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-serif font-bold text-charcoal-950 leading-tight">
                Clean, Minimalist Light Theme ID Card <br />
                <span className="text-gold-700 font-sans font-normal text-xl sm:text-2xl block mt-1">
                  Generated Automatically Upon Approval
                </span>
              </h2>

              <p className="text-charcoal-700 text-sm sm:text-base leading-relaxed">
                Featuring the official VLBVN emblem, refined gold hairlines, and high-contrast typography on a clean pearl-white background. Designed for international business conventions, smartphone wallets, and high-resolution print.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200 space-y-1">
                  <div className="text-gold-800 font-bold text-sm">Unique Membership ID</div>
                  <div className="text-xs text-charcoal-600">Assigned sequentially for life-time identity verification.</div>
                </div>
                <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200 space-y-1">
                  <div className="text-gold-800 font-bold text-sm">Official VLBVN Emblem</div>
                  <div className="text-xs text-charcoal-600">Exact high-resolution seal printed on every card.</div>
                </div>
                <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200 space-y-1">
                  <div className="text-gold-800 font-bold text-sm">QR Code Authentication</div>
                  <div className="text-xs text-charcoal-600">Instant scan authentication of active member standing.</div>
                </div>
                <div className="bg-cream-50 p-3.5 rounded-xl border border-cream-200 space-y-1">
                  <div className="text-gold-800 font-bold text-sm">Automated Email Dispatch</div>
                  <div className="text-xs text-charcoal-600">Both PNG image and print-ready PDF delivered to your inbox.</div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/apply"
                  className="inline-flex items-center gap-2 text-sm font-bold text-gold-700 hover:text-gold-900 transition-colors"
                >
                  <span>Register to get your card</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Card Visual Preview */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="relative group max-w-lg w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-gold-300 to-amber-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-500" />
                
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-gold-400 bg-white">
                  <img
                    src="/uploads/templates/vlbvn_light_template.png"
                    alt="VLBVN Official Clean Light ID Card Template"
                    className="w-full object-cover shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="p-3 bg-cream-100 text-center text-xs font-mono text-charcoal-800 font-bold border-t border-cream-300">
                    Official VLBVN Clean Minimalist Light Card Template
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-gold-700 uppercase tracking-widest font-mono">Simple & Fast Workflow</span>
          <h2 className="text-3xl font-serif font-bold text-charcoal-950">
            How to Get Your Digital ID Card
          </h2>
          <p className="text-sm text-charcoal-700">
            A frictionless, transparent process designed specifically for busy entrepreneurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-lg font-serif">
              01
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal-950">Submit Details</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              Complete the single registration form with your business profile, chapter preference, and a clear portrait photograph.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-lg font-serif">
              02
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal-950">Email Confirmation</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              Receive an instant acknowledgement email containing your unique Application Reference Number for tracking.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-cream-300 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold-100 text-gold-800 flex items-center justify-center font-bold text-lg font-serif">
              03
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal-950">Admin Verification</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              The Chapter Committee reviews submitted professional credentials and grants official community membership approval.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-gold-300 bg-gold-50/30 shadow-sm relative space-y-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold-400 text-charcoal-950 flex items-center justify-center font-bold text-lg font-serif">
              04
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal-950">Card Generated & Sent</h3>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              The system automatically renders your personalized card and delivers the PDF and PNG files straight to your email.
            </p>
          </div>

        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-cream-200/80 border border-gold-300/80 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
            Ready to Connect with Visionary Lingayat Entrepreneurs?
          </h2>
          <p className="text-charcoal-700 max-w-xl mx-auto text-sm leading-relaxed">
            Join hundreds of visionary business leaders across manufacturing, technology, agriculture, infrastructure, and healthcare.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition-all"
            >
              <span>Start Membership Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/status"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-charcoal-800 bg-white hover:bg-cream-100 border border-cream-300 transition-all"
            >
              <span>Check Application Status</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
