import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  FileText,
  IdCard,
  Mail,
  RefreshCw,
  Eye,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../../services/api.js';
import { CardPreviewModal } from '../../components/CardPreviewModal.js';

export const AdminMembers: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chapterFilter, setChapterFilter] = useState('all');
  const [chapters, setChapters] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [activePreviewCard, setActivePreviewCard] = useState<any>(null);

  useEffect(() => {
    api.getMeta().then(res => {
      if (res.chapters) setChapters(res.chapters);
    });
  }, []);

  const loadMembers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getMembers({
        search: searchTerm,
        chapter: chapterFilter,
        page,
        limit: 25
      });
      setMembers(res.members || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [chapterFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadMembers();
  };

  const handleRegenerate = async (memberId: number, memberName: string) => {
    try {
      setActionMessage(`Regenerating card for ${memberName}...`);
      await api.regenerateCard(memberId);
      setActionMessage(`ID Card regenerated successfully for ${memberName}.`);
      await loadMembers();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  const handleResend = async (memberId: number, memberName: string) => {
    try {
      setActionMessage(`Resending email for ${memberName}...`);
      await api.resendCard(memberId);
      setActionMessage(`ID Card email dispatched to ${memberName}.`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
            Approved Members Directory
          </h1>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Active community members with verified digital credentials and assigned IDs
          </p>
        </div>

        <button
          onClick={loadMembers}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:bg-cream-100 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gold-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-2xl bg-gold-50 border border-gold-300 text-gold-900 text-xs flex items-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
          <span className="font-semibold">{actionMessage}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Membership ID, name, email, mobile, or company..."
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

      {/* Members Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-charcoal-700 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Member</th>
                <th className="py-3.5 px-6">Membership ID</th>
                <th className="py-3.5 px-6">Company & Role</th>
                <th className="py-3.5 px-6">Chapter</th>
                <th className="py-3.5 px-6">Approved Date</th>
                <th className="py-3.5 px-6 text-right">Card Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-600">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading members directory...</span>
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-600">
                    No approved members found.
                  </td>
                </tr>
              ) : (
                members.map((m) => (
                  <tr key={m.id} className="hover:bg-cream-50/60 transition">
                    
                    {/* Member */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photo_url || '/placeholder.png'}
                          alt={m.full_name}
                          className="w-10 h-10 rounded-lg object-cover border border-gold-400 shrink-0 bg-charcoal-800"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4AF37"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
                          }}
                        />
                        <div>
                          <div className="font-bold text-charcoal-950 text-sm">{m.full_name}</div>
                          <div className="text-[11px] text-charcoal-600">{m.email}</div>
                          <div className="text-[11px] text-charcoal-600 font-mono">{m.mobile}</div>
                        </div>
                      </div>
                    </td>

                    {/* Membership ID */}
                    <td className="py-4 px-6 font-mono">
                      <span className="font-extrabold text-charcoal-950 text-sm tracking-wide bg-gold-100/70 border border-gold-300 px-2.5 py-1 rounded-lg">
                        {m.membership_id}
                      </span>
                      <div className="text-[10px] text-gold-800 font-semibold mt-1">
                        {m.valid_until || 'Life Member'}
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-charcoal-900">{m.company_name}</div>
                      <div className="text-[11px] text-charcoal-600">{m.designation}</div>
                    </td>

                    {/* Chapter */}
                    <td className="py-4 px-6 font-medium text-charcoal-800">
                      {m.chapter}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-charcoal-600">
                      {new Date(m.approved_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-1.5">
                      {m.card_png_path && (
                        <button
                          onClick={() => setActivePreviewCard({
                            pngUrl: m.card_png_path,
                            pdfUrl: m.card_pdf_path,
                            mid: m.membership_id,
                            name: m.full_name
                          })}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-charcoal-800 bg-cream-200 hover:bg-cream-300 transition"
                          title="Preview ID Card"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                      )}

                      <a
                        href={`/api/download/card/png/${encodeURIComponent(m.membership_id)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-charcoal-800 bg-white border border-gray-200 hover:bg-cream-100 transition"
                        title="Download PNG"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG</span>
                      </a>

                      <a
                        href={`/api/download/card/pdf/${encodeURIComponent(m.membership_id)}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-charcoal-950 bg-gold-400 hover:bg-gold-500 shadow-sm transition"
                        title="Download PDF"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </a>

                      <button
                        onClick={() => handleRegenerate(m.id, m.full_name)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200 transition"
                        title="Regenerate Card from Active Template"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-gold-600" />
                      </button>

                      <button
                        onClick={() => handleResend(m.id, m.full_name)}
                        className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200 transition"
                        title="Resend ID Card Email"
                      >
                        <Mail className="w-3.5 h-3.5 text-gold-600" />
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-cream-200 flex items-center justify-between text-xs text-charcoal-600">
          <span>Total: {totalCount} members</span>
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
              disabled={members.length < 25}
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
