import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  IdCard,
  Mail,
  Settings,
  ArrowRight,
  Eye,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { CardPreviewModal } from '../../components/CardPreviewModal.js';

export const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePreviewCard, setActivePreviewCard] = useState<any>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getApplications({ limit: 10 });
      setCounts(res.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
      setRecentApplications(res.applications || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Welcome & Refresh Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
            Membership Dashboard
          </h1>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Overview of membership requests, approvals, and automated digital ID credential generation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:bg-cream-100 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gold-600 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          
          <Link
            to="/admin/templates"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow transition"
          >
            <IdCard className="w-3.5 h-3.5 text-charcoal-950" />
            <span>ID Card Designer</span>
          </Link>
        </div>
      </div>

      {/* Statistics 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total */}
        <div className="bg-white p-6 rounded-2xl border border-cream-300 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-charcoal-600 uppercase tracking-wider font-mono">
              Total Applications
            </span>
            <div className="w-9 h-9 rounded-xl bg-charcoal-100 text-charcoal-800 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-charcoal-950">
            {counts.total}
          </div>
          <div className="text-[11px] text-charcoal-600">
            Cumulative submitted registrations
          </div>
        </div>

        {/* Card 2: Pending (Actionable) */}
        <div className="bg-white p-6 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3 relative overflow-hidden bg-gradient-to-b from-amber-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Pending Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-950">
            {counts.pending}
          </div>
          <Link
            to="/admin/applications?status=Pending"
            className="text-[11px] font-bold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
          >
            <span>Review pending list</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 3: Approved */}
        <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-sm space-y-3 bg-gradient-to-b from-emerald-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
              Approved Members
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-emerald-950">
            {counts.approved}
          </div>
          <Link
            to="/admin/members"
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
          >
            <span>View member directory</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card 4: Rejected */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-sm space-y-3 bg-gradient-to-b from-rose-50/20 to-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider font-mono">
              Rejected
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-rose-950">
            {counts.rejected}
          </div>
          <div className="text-[11px] text-rose-700">
            Applications requiring clarification
          </div>
        </div>

      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
        
        <div className="px-6 py-5 border-b border-cream-200 flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-charcoal-950">
              Recent Applications
            </h3>
            <p className="text-xs text-charcoal-600 mt-0.5">
              Latest submissions awaiting review or recently processed
            </p>
          </div>
          <Link
            to="/admin/applications"
            className="text-xs font-bold text-gold-700 hover:text-gold-900 inline-flex items-center gap-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-charcoal-700 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3 px-6">Applicant</th>
                <th className="py-3 px-6">Reference No</th>
                <th className="py-3 px-6">Company & Role</th>
                <th className="py-3 px-6">Chapter</th>
                <th className="py-3 px-6">Submitted</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {recentApplications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-charcoal-600">
                    No applications submitted yet.
                  </td>
                </tr>
              ) : (
                recentApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-cream-50/60 transition">
                    
                    {/* Applicant */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.photo_url || '/placeholder.png'}
                          alt={app.full_name}
                          className="w-9 h-9 rounded-lg object-cover border border-gold-300 shrink-0 bg-charcoal-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4AF37"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
                          }}
                        />
                        <div>
                          <div className="font-bold text-charcoal-950">{app.full_name}</div>
                          <div className="text-[11px] text-charcoal-600">{app.mobile}</div>
                        </div>
                      </div>
                    </td>

                    {/* Ref No */}
                    <td className="py-4 px-6 font-mono font-medium text-charcoal-800">
                      {app.reference_no}
                      {app.membership_id && (
                        <div className="text-[10px] font-bold text-gold-700">
                          ID: {app.membership_id}
                        </div>
                      )}
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-charcoal-900">{app.company_name}</div>
                      <div className="text-[11px] text-charcoal-600">{app.designation}</div>
                    </td>

                    {/* Chapter */}
                    <td className="py-4 px-6 font-medium text-charcoal-800">
                      {app.chapter}
                    </td>

                    {/* Submitted Date */}
                    <td className="py-4 px-6 text-charcoal-600">
                      {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </Link>

                      {app.card_png_path && (
                        <button
                          onClick={() => setActivePreviewCard({
                            pngUrl: app.card_png_path,
                            pdfUrl: app.card_pdf_path,
                            mid: app.membership_id,
                            name: app.full_name
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gold-900 bg-gold-100 hover:bg-gold-200 border border-gold-300 transition"
                          title="Preview ID Card"
                        >
                          <IdCard className="w-3.5 h-3.5 text-gold-700" />
                          <span className="hidden sm:inline">Card</span>
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Card Preview Modal */}
      {activePreviewCard && (
        <CardPreviewModal
          isOpen={true}
          onClose={() => setActivePreviewCard(null)}
          cardPngUrl={activePreviewCard.pngUrl}
          cardPdfUrl={activePreviewCard.pdfUrl}
          membershipId={activePreviewCard.mid}
          memberName={activePreviewCard.name}
        />
      )}

    </div>
  );
};
