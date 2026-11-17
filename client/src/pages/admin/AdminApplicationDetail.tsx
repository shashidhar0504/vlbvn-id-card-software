import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  IdCard,
  Download,
  Mail,
  Building2,
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  FileText,
  AlertCircle,
  RefreshCw,
  Send
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { CardPreviewModal } from '../../components/CardPreviewModal.js';

export const AdminApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<any>(null);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rejection modal state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Card preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const loadApplication = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await api.getApplication(id);
      setApplication(res.application);
      setEmailLogs(res.emailLogs || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load application details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplication();
  }, [id]);

  const handleApprove = async () => {
    if (!application) return;
    if (!window.confirm(`Are you sure you want to approve ${application.full_name}? This will assign a unique Membership ID, generate their official ID card, and automatically dispatch the welcome email.`)) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await api.approveApplication(application.id);
      setSuccessMessage(`Application approved successfully! Assigned Membership ID: ${res.membership_id}`);
      await loadApplication();
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while approving application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!application) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await api.rejectApplication(application.id, rejectionReason);
      setIsRejectModalOpen(false);
      setSuccessMessage('Application rejected and notification email sent to applicant.');
      await loadApplication();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reject application.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendEmail = async () => {
    if (!application || !application.member_table_id) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await api.resendCard(application.member_table_id);
      setSuccessMessage('Membership ID card email resent successfully.');
      await loadApplication();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to resend email.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-charcoal-600">
        <div className="w-8 h-8 border-3 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium">Loading applicant dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm text-rose-700">Application not found.</p>
        <Link to="/admin/applications" className="text-xs font-bold text-gold-700 underline">
          Back to Applications List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-charcoal-700 hover:text-charcoal-950 transition"
        >
          <ArrowLeft className="w-4 h-4 text-gold-600" />
          <span>Back to Applications</span>
        </Link>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {application.status === 'Pending' && (
            <>
              <button
                onClick={() => setIsRejectModalOpen(true)}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Application</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition transform hover:-translate-y-0.5 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 text-charcoal-950" />
                <span>{isProcessing ? 'Processing Approval...' : 'Approve & Issue ID Card'}</span>
              </button>
            </>
          )}

          {application.status === 'Approved' && (
            <>
              {application.card_png_path && (
                <button
                  onClick={() => setIsPreviewOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-900 bg-white border border-cream-300 hover:bg-cream-100 shadow-sm transition"
                >
                  <IdCard className="w-4 h-4 text-gold-600" />
                  <span>Preview ID Card</span>
                </button>
              )}

              {application.membership_id && (
                <>
                  <a
                    href={`/api/download/card/png/${encodeURIComponent(application.membership_id)}`}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PNG</span>
                  </a>

                  <a
                    href={`/api/download/card/pdf/${encodeURIComponent(application.membership_id)}`}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-gold-400 hover:bg-gold-500 shadow-sm transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  <button
                    onClick={handleResendEmail}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-charcoal-800 bg-white border border-gray-200 hover:bg-cream-100 transition"
                    title="Resend ID Card to applicant's email"
                  >
                    <Mail className="w-3.5 h-3.5 text-gold-600" />
                    <span>Resend Email</span>
                  </button>
                </>
              )}
            </>
          )}

          {application.status === 'Rejected' && (
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Re-evaluate & Approve</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMessage}</span>
        </div>
      )}

      {/* Header Profile Dossier Card */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-6">
          <div className="relative group shrink-0">
            <img
              src={application.photo_url || '/placeholder.png'}
              alt={application.full_name}
              className="w-24 h-28 rounded-2xl object-cover border-2 border-gold-400 shadow-md bg-charcoal-900"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4AF37"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
              }}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-charcoal-600 uppercase">
                {application.reference_no}
              </span>
              <StatusBadge status={application.status} />
            </div>
            
            <h1 className="text-2xl font-serif font-bold text-charcoal-950">
              {application.full_name}
            </h1>

            <p className="text-xs text-charcoal-700 font-medium">
              {application.designation} • <strong className="text-charcoal-900">{application.company_name}</strong>
            </p>

            <p className="text-xs text-gold-800 font-semibold">
              {application.membership_type} • {application.chapter} Chapter
            </p>
          </div>
        </div>

        {/* Member ID Highlight Box if Approved */}
        {application.membership_id && (
          <div className="bg-gold-50 border-2 border-dashed border-gold-400 rounded-2xl p-4 text-center space-y-1 w-full md:w-auto shrink-0">
            <span className="text-[10px] font-bold text-gold-800 uppercase font-mono tracking-wider">
              Assigned Membership ID
            </span>
            <div className="text-2xl font-mono font-extrabold text-charcoal-950 tracking-wider">
              {application.membership_id}
            </div>
            <span className="text-[10px] text-charcoal-600 block">
              Approved by: {application.reviewer_name || 'Admin'}
            </span>
          </div>
        )}

      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
            <User className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-950">Personal Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Full Name:</span>
              <span className="font-semibold text-charcoal-900">{application.full_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Email Address:</span>
              <span className="font-semibold text-charcoal-900">{application.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Mobile Number:</span>
              <span className="font-semibold text-charcoal-900">{application.mobile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">WhatsApp:</span>
              <span className="font-semibold text-charcoal-900">{application.whatsapp || application.mobile}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Date of Birth:</span>
              <span className="font-semibold text-charcoal-900">{application.dob || 'Not specified'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Gender:</span>
              <span className="font-semibold text-charcoal-900">{application.gender || 'Not specified'}</span>
            </div>
            <div className="pt-1">
              <span className="text-charcoal-600 block mb-1">Residential Address:</span>
              <p className="p-2.5 rounded-xl bg-cream-50 text-charcoal-800 font-medium">
                {application.residential_address}
              </p>
            </div>
          </div>
        </div>

        {/* Business & Enterprise Details */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-7 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-cream-200">
            <Building2 className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-950">Professional & Business Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Company Name:</span>
              <span className="font-semibold text-charcoal-900">{application.company_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Business Category:</span>
              <span className="font-semibold text-charcoal-900">{application.business_category}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Designation / Role:</span>
              <span className="font-semibold text-charcoal-900">{application.designation}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">City & State:</span>
              <span className="font-semibold text-charcoal-900">{application.city}, {application.state}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Website:</span>
              <span className="font-semibold text-charcoal-900">
                {application.website ? (
                  <a href={application.website} target="_blank" rel="noreferrer" className="text-gold-700 hover:underline">
                    {application.website}
                  </a>
                ) : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-cream-100">
              <span className="text-charcoal-600">Chapter Association:</span>
              <span className="font-semibold text-charcoal-900">{application.chapter}</span>
            </div>
            <div className="pt-1">
              <span className="text-charcoal-600 block mb-1">Business Address:</span>
              <p className="p-2.5 rounded-xl bg-cream-50 text-charcoal-800 font-medium">
                {application.business_address || 'Same as residential / Not specified'}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Rejection Remarks Notice if Rejected */}
      {application.status === 'Rejected' && application.rejection_reason && (
        <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-rose-800">
            <XCircle className="w-4 h-4" />
            <span>Administrative Rejection Reason</span>
          </div>
          <p className="text-xs leading-relaxed">{application.rejection_reason}</p>
        </div>
      )}

      {/* Email Delivery Audit Trail */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-7 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-cream-200">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gold-600" />
            <h3 className="font-serif font-bold text-base text-charcoal-950">
              Email Notifications History
            </h3>
          </div>
          <span className="text-xs text-charcoal-600">
            {emailLogs.length} logged dispatches
          </span>
        </div>

        {emailLogs.length === 0 ? (
          <p className="text-xs text-charcoal-600 italic py-2">No email delivery logs recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {emailLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-cream-50 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <div className="font-semibold text-charcoal-900">{log.subject}</div>
                  <div className="text-[11px] text-charcoal-600">
                    To: {log.recipient_email} • {new Date(log.sent_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.status === 'SENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : log.status === 'SIMULATED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Reject Membership Application</span>
            </div>
            <p className="text-xs text-charcoal-700 leading-relaxed">
              Enter an optional rejection reason. This reason will be included in the automated notification email sent to <strong>{application.email}</strong>.
            </p>
            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="e.g. Incomplete business address or photograph does not meet specifications..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-200 text-xs outline-none resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-700 hover:bg-cream-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition"
                >
                  Confirm Rejection & Send Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Card Preview Modal */}
      {application.card_png_path && (
        <CardPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          cardPngUrl={application.card_png_path}
          cardPdfUrl={application.card_pdf_path}
          membershipId={application.membership_id}
          memberName={application.full_name}
        />
      )}

    </div>
  );
};
