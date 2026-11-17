import React, { useState, useEffect } from 'react';
import { Mail, Search, Filter, RefreshCw, Send, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api.js';

export const AdminEmailLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getEmails({
        status: statusFilter,
        type: typeFilter,
        search: searchTerm,
        page,
        limit: 25
      });
      setLogs(res.logs || []);
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [statusFilter, typeFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const handleResend = async (logId: number, recipientEmail: string) => {
    try {
      setActionNotice(`Resending notification to ${recipientEmail}...`);
      await api.resendEmail(logId);
      setActionNotice(`Notification resent to ${recipientEmail}.`);
      await loadLogs();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-950">
            Email Delivery Audit Trail
          </h1>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Real-time delivery status for application confirmations, ID card dispatches, and rejections
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={isLoading}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-cream-300 text-charcoal-800 hover:bg-cream-100 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-gold-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-gold-50 border border-gold-300 text-gold-900 text-xs flex items-center gap-2 shadow-sm">
          <Mail className="w-4 h-4 text-gold-600 shrink-0" />
          <span className="font-semibold">{actionNotice}</span>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-300 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by recipient email, name, or subject..."
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
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl border border-gray-200 text-xs text-charcoal-800 outline-none bg-white"
          >
            <option value="all">All Delivery Statuses</option>
            <option value="SENT">Sent</option>
            <option value="SIMULATED">Simulated</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 rounded-xl border border-gray-200 text-xs text-charcoal-800 outline-none bg-white"
          >
            <option value="all">All Email Types</option>
            <option value="APPLICATION_RECEIVED">Application Submission</option>
            <option value="CARD_APPROVED">ID Card Approved</option>
            <option value="APPLICATION_REJECTED">Application Rejected</option>
          </select>
        </div>
      </div>

      {/* Email Table */}
      <div className="bg-white rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-charcoal-700 uppercase font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Recipient</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Dispatched At</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-600">
                    <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading email logs...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-charcoal-600">
                    No email logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-cream-50/60 transition">
                    
                    <td className="py-4 px-6">
                      <div className="font-bold text-charcoal-950">{log.recipient_name}</div>
                      <div className="text-[11px] text-charcoal-600 font-mono">{log.recipient_email}</div>
                    </td>

                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-medium text-charcoal-900 truncate">{log.subject}</div>
                      {log.error_message && (
                        <div className="text-[10px] text-amber-700 truncate mt-0.5">
                          {log.error_message}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 font-mono text-[11px] text-charcoal-700">
                      {log.email_type}
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.status === 'SENT'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : log.status === 'SIMULATED'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {log.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-charcoal-600">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleResend(log.id, log.recipient_email)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 transition"
                      >
                        <Send className="w-3 h-3 text-gold-600" />
                        <span>Resend</span>
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
