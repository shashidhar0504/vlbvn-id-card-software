import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Eye,
  IdCard,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { CardPreviewModal } from '../../components/CardPreviewModal.js';

export const AdminApplications: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [chapters, setChapters] = useState<string[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activePreviewCard, setActivePreviewCard] = useState<any>(null);

  useEffect(() => {
    api.getMeta().then(res => {
      if (res.chapters) setChapters(res.chapters);
    });
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await api.getApplications({
        status: statusFilter,
        search: searchTerm,
        chapter: chapterFilter,
        page,
        limit: 25
      });
      setApplications(res.applications || []);
      setCounts(res.counts || { total: 0, pending: 0, approved: 0, rejected: 0 });
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, chapterFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleTabChange = (st: string) => {
    setStatusFilter(st);
    setPage(1);
    setSearchParams(st === 'all' ? {} : { status: st });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
            Membership Applications
          </h1>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Review applicant personal, professional details, scrutinize documents, and grant approvals
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:bg-cream-100 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gold-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-300 overflow-x-auto scrollbar-none pb-px">
        {[
          { key: 'all', label: 'All Applications', count: counts.total },
          { key: 'Pending', label: 'Pending Review', count: counts.pending, highlight: true },
          { key: 'Approved', label: 'Approved', count: counts.approved },
          { key: 'Rejected', label: 'Rejected', count: counts.rejected },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-gold-500 text-charcoal-950 bg-white shadow-sm'
                  : 'border-transparent text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isActive
                  ? 'bg-gold-100 text-gold-900'
                  : 'bg-cream-200 text-charcoal-700'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Chapter Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, ref no, email, mobile, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-24 py-2 rounded-xl border border-gray-200 focus:border-gold-500 focus:ring-1 focus:ring-gold-300 text-xs outline-none"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-bold bg-cream-200 hover:bg-cream-300 text-charcoal-800 transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={chapterFilter}
            onChange={(e) => { setChapterFilter(e.target.value); setPage(1); }}
            className="w-full md:w-48 py-2 px-3 rounded-xl border border-gray-200 text-xs text-charcoal-800 outline-none bg-white"
          >
            <option value="all">All Chapters</option>
            {chapters.map((ch) => (
              <option key={ch} value={ch}>{ch}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-charcoal-700 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Applicant</th>
                <th className="py-3.5 px-6">Reference No</th>
                <th className="py-3.5 px-6">Company & Role</th>
                <th className="py-3.5 px-6">Chapter</th>
                <th className="py-3.5 px-6">Submission Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-600">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading application records...</span>
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-charcoal-600">
                    No matching applications found.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id} className="hover:bg-cream-50/60 transition">
                    
                    {/* Applicant */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.photo_url || '/placeholder.png'}
                          alt={app.full_name}
                          className="w-10 h-10 rounded-lg object-cover border border-gold-300 shrink-0 bg-charcoal-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4AF37"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
                          }}
                        />
                        <div>
                          <div className="font-bold text-charcoal-950 text-sm">{app.full_name}</div>
                          <div className="text-[11px] text-charcoal-600">{app.email}</div>
                          <div className="text-[11px] text-charcoal-600 font-mono">{app.mobile}</div>
                        </div>
                      </div>
                    </td>

                    {/* Reference No & Member ID */}
                    <td className="py-4 px-6 font-mono">
                      <div className="font-semibold text-charcoal-900">{app.reference_no}</div>
                      {app.membership_id && (
                        <div className="text-[11px] font-bold text-gold-700">
                          {app.membership_id}
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

                    {/* Submission Date */}
                    <td className="py-4 px-6 text-charcoal-600">
                      {new Date(app.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <StatusBadge status={app.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 transition shadow-sm"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-gold-900 bg-gold-100 hover:bg-gold-200 border border-gold-300 transition shadow-sm"
                          title="Preview ID Card"
                        >
                          <IdCard className="w-3.5 h-3.5 text-gold-700" />
                          <span>Card</span>
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-cream-200 flex items-center justify-between text-xs text-charcoal-600">
          <span>Showing Page {page}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-cream-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={applications.length < 25}
              className="p-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-cream-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
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
