'use client';

import { useState } from 'react';
import { Share2, Check, Copy, MessageCircle } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return url || window.location.href;
    }
    return url || 'https://www.rt5rw19.my.id';
  };

  const handleCopy = async () => {
    const fullUrl = getShareUrl();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleWhatsAppShare = () => {
    const fullUrl = getShareUrl();
    const text = encodeURIComponent(`*${title}*\n\nBaca informasi selengkapnya di website resmi RT 05 RW 19 Sangkal Putung:\n${fullUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-4 px-5 bg-neutral-bg/60 rounded-2xl border border-neutral-gray">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
        <Share2 className="w-4 h-4 text-primary" />
        <span>Bagikan Informasi Ini:</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleWhatsAppShare}
          className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white px-3.5 py-2 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
          title="Bagikan ke WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>

        <button
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all border cursor-pointer active:scale-95 ${
            copied
              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : 'bg-white hover:bg-neutral-bg text-gray-700 border-neutral-gray'
          }`}
          title="Salin Tautan Halaman"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-500" />
              <span>Salin Link</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
