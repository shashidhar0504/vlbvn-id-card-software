import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Download,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api.js';
import { StatusBadge } from '../components/StatusBadge.js';
import { CardPreviewModal } from '../components/CardPreviewModal.js';

export const StatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || searchParams.get('ref') || searchParams.get('id') || '';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (queryText?: string) => {
    const q = (queryText !== undefined ? queryText : searchQuery).trim();
    if (!q) {
      setError('Please enter your Application Reference Number, Membership ID, or registered Email.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await api.getStatus(q);
      setResult(data.application);
    } catch (err: any) {
      setError(err.message || 'No application record found. Please verify the entered details.');
    } finally {
      setIsLoading(false);
    }
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gold-100 border border-gold-300 text-gold-800 text-xs font-bold uppercase tracking-wider font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
          <span>Membership Verification & ID Tracking</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-charcoal-950">
          Check Membership Application Status
        </h1>
        <p className="text-sm text-charcoal-700 max-w-lg mx-auto">
          Enter your Application Reference Number, Membership ID, or registered email address to view real-time status and download approved ID cards.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={onFormSubmit} className="relative flex items-center shadow-lg rounded-2xl overflow-hidden border-2 border-gold-300 bg-white">
          <div className="pl-5 text-gray-400">
            <Search className="w-5 h-5 text-gold-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. VLBVN-APP-2026-0001, VLBVN-2026-0001, or registered email..."
            className="w-full py-4 pl-3 pr-32 text-sm text-charcoal-900 outline-none bg-transparent"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="absolute right-2 px-6 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow transition-all disabled:opacity-50"
          >
            {isLoading ? 'Checking...' : 'Check Status'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-bold">Lookup Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Result Display */}
      {result && (
        <div className="bg-white rounded-3xl border border-cream-300 shadow-xl overflow-hidden divide-y divide-cream-200 animate-fade-in">
          
          {/* Status Header Banner */}
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-50/70">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-charcoal-600 font-mono uppercase">
                  Reference: {result.reference_no}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-charcoal-950">
                {result.full_name}
              </h2>
              <p className="text-xs text-charcoal-600 mt-0.5">
                {result.designation} • {result.company_name} ({result.chapter} Chapter)
              </p>
            </div>
            
            <div className="flex sm:flex-col items-start sm:items-end justify-between gap-2">
              <StatusBadge status={result.status} className="text-sm px-4 py-1.5" />
              <span className="text-[11px] text-charcoal-600">
                Applied on {new Date(result.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Conditional Body: Approved, Pending, or Rejected */}

          {/* 1. APPROVED STATUS */}
          {result.status === 'Approved' && (
            <div className="p-6 sm:p-10 space-y-8 bg-gradient-to-b from-white to-gold-50/20">
              
              <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-950 rounded-2xl p-6 sm:p-8 text-white border-2 border-gold-400 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-3 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-gold-400/20 text-gold-300 text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Active Verified Credential</span>
                  </div>
                  <div>
                    <span className="text-xs text-gold-200 block uppercase font-mono tracking-wider">Official Membership ID</span>
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-gold-400 tracking-wider">
                      {result.membership_id}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 max-w-md">
                    Valid Thru: <strong className="text-white">{result.valid_until || 'Life Member'}</strong> • {result.membership_type}
                  </p>
                </div>

                {/* ID Card Visual Thumbnail */}
                {result.card_png_path && (
                  <div 
                    onClick={() => setIsPreviewOpen(true)}
                    className="cursor-pointer group relative rounded-xl overflow-hidden border border-gold-400 shadow-lg max-w-[240px] shrink-0 transform hover:scale-105 transition"
                  >
                    <img
                      src={result.card_png_path}
                      alt="Digital ID Card Thumbnail"
                      className="w-full object-contain"
                    />
                    <div className="absolute inset-0 bg-charcoal-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-gold-300 transition">
                      <Eye className="w-4 h-4 mr-1" /> Click to Expand
                    </div>
                  </div>
                )}
              </div>

              {/* Download Buttons Section */}
              <div className="bg-cream-100/70 p-6 rounded-2xl border border-gold-300/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-charcoal-950">
                    Download Your Official ID Card
                  </h4>
                  <p className="text-xs text-charcoal-600 mt-0.5">
                    Available in high-resolution image (PNG) and print-ready PDF formats.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-900 bg-white hover:bg-cream-200 border border-cream-300 shadow-sm transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Card</span>
                  </button>

                  <a
                    href={`/api/download/card/png/${encodeURIComponent(result.membership_id)}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 border border-cream-300 shadow-sm transition"
                  >
                    <Download className="w-4 h-4 text-charcoal-800" />
                    <span>Download PNG</span>
                  </a>

                  <a
                    href={`/api/download/card/pdf/${encodeURIComponent(result.membership_id)}`}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition"
                  >
                    <FileText className="w-4 h-4 text-charcoal-950" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

            </div>
          )}

          {/* 2. PENDING STATUS */}
          {result.status === 'Pending' && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-1 animate-pulse" />
                <div className="space-y-2 text-sm text-charcoal-800">
                  <h4 className="font-bold text-base text-amber-950">Application Under Administrative Scrutiny</h4>
                  <p className="leading-relaxed text-xs text-charcoal-700">
                    Your application for the <strong>{result.chapter} Chapter</strong> has been received and is currently being verified by our chapter governing committee.
                  </p>
                  <p className="text-xs text-charcoal-600">
                    Turnaround time is typically <strong>24 to 48 business hours</strong>. Once approved, your personalized Digital Membership Card will be automatically generated and emailed to <strong>{result.email}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. REJECTED STATUS */}
          {result.status === 'Rejected' && (
            <div className="p-6 sm:p-10 space-y-6">
              <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 flex items-start gap-4">
                <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-1" />
                <div className="space-y-3 text-sm text-charcoal-800">
                  <h4 className="font-bold text-base text-rose-950">Application Not Approved</h4>
                  <p className="text-xs text-charcoal-700 leading-relaxed">
                    We regret to inform you that your membership application could not be approved by the Chapter Committee at this time.
                  </p>
                  
                  {result.rejection_reason && (
                    <div className="p-3.5 bg-white rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
                      <span className="font-bold block uppercase tracking-wider text-[10px] text-rose-700">Administrative Remarks</span>
                      <p>{result.rejection_reason}</p>
                    </div>
                  )}

                  <p className="text-xs text-charcoal-600">
                    If you wish to provide clarified business documents or discuss this with the chapter secretariat, please contact <a href="mailto:membership@vlbvn.org" className="text-gold-700 font-bold underline">membership@vlbvn.org</a>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Details Summary Grid */}
          <div className="p-6 sm:p-8 bg-cream-50/40">
            <h4 className="text-xs font-bold text-charcoal-700 uppercase tracking-wider mb-4 font-mono">
              Application Details Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-charcoal-600 block">Registered Email</span>
                <span className="font-semibold text-charcoal-900 truncate block">{result.email}</span>
              </div>
              <div>
                <span className="text-charcoal-600 block">Mobile Number</span>
                <span className="font-semibold text-charcoal-900">{result.mobile}</span>
              </div>
              <div>
                <span className="text-charcoal-600 block">Chapter</span>
                <span className="font-semibold text-charcoal-900">{result.chapter}</span>
              </div>
              <div>
                <span className="text-charcoal-600 block">Membership Type</span>
                <span className="font-semibold text-charcoal-900">{result.membership_type}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modal for viewing card */}
      {result && result.card_png_path && (
        <CardPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          cardPngUrl={result.card_png_path}
          cardPdfUrl={result.card_pdf_path}
          membershipId={result.membership_id}
          memberName={result.full_name}
        />
      )}

    </div>
  );
};
