import React from 'react';
import { X, Download, FileText, CheckCircle, ExternalLink } from 'lucide-react';

interface CardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardPngUrl: string;
  cardPdfUrl?: string;
  membershipId: string;
  memberName?: string;
}

export const CardPreviewModal: React.FC<CardPreviewModalProps> = ({
  isOpen,
  onClose,
  cardPngUrl,
  cardPdfUrl,
  membershipId,
  memberName
}) => {
  if (!isOpen) return null;

  const downloadPng = () => {
    const a = document.createElement('a');
    a.href = `/api/download/card/png/${encodeURIComponent(membershipId)}`;
    a.download = `VLBVN_Card_${membershipId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadPdf = () => {
    const a = document.createElement('a');
    a.href = `/api/download/card/pdf/${encodeURIComponent(membershipId)}`;
    a.download = `VLBVN_Card_${membershipId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gold-300 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-charcoal-900 to-charcoal-950 text-white flex items-center justify-between border-b border-gold-400">
          <div>
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span className="text-gold-300">★</span> Official Digital Membership ID Card
            </h3>
            <p className="text-xs text-gold-200 font-mono mt-0.5">
              ID: {membershipId} {memberName ? `• ${memberName}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Display Area */}
        <div className="p-6 bg-cream-100 flex flex-col items-center justify-center">
          <div className="relative group max-w-full rounded-xl overflow-hidden shadow-xl border-2 border-gold-400/80 bg-charcoal-900">
            <img
              src={cardPngUrl}
              alt={`ID Card for ${membershipId}`}
              className="w-full max-h-[380px] object-contain transition-transform duration-300 group-hover:scale-[1.01]"
              onError={(e) => {
                // If relative path fails, try prepend or fallback
                console.error('Image load error on card preview modal');
              }}
            />
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-charcoal-700 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Cryptographically sealed & digitally signed by VLPN Governing Secretariat</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-white border-t border-cream-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-charcoal-600 font-medium hidden sm:inline">
            Standard ISO/IEC 7810 CR80 Card Dimensions
          </span>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={downloadPng}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-900 bg-cream-200 hover:bg-cream-300 border border-cream-300 transition-all shadow-sm"
            >
              <Download className="w-4 h-4 text-charcoal-800" />
              Download PNG
            </button>
            <button
              onClick={downloadPdf}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-charcoal-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 shadow-md transition-all"
            >
              <FileText className="w-4 h-4 text-charcoal-950" />
              Download PDF (Print)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
