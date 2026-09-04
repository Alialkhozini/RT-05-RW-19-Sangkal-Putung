'use client';

import { useState, useEffect, useRef } from 'react';
import { Eye, Type, ZapOff, RefreshCw, Check, X } from 'lucide-react';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [textSize, setTextSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat panel terbuka agar seluruh opsi terlihat jelas
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const timer = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Muat preferensi dari localStorage pada render pertama
  useEffect(() => {
    const savedTextSize = localStorage.getItem('access-text-size') as any;
    const savedContrast = localStorage.getItem('access-high-contrast') === 'true';
    const savedMotion = localStorage.getItem('access-reduce-motion') === 'true';

    if (savedTextSize) handleTextSizeChange(savedTextSize);
    if (savedContrast) handleContrastToggle(savedContrast);
    if (savedMotion) handleMotionToggle(savedMotion);
  }, []);

  const handleTextSizeChange = (size: 'normal' | 'large' | 'xlarge') => {
    setTextSize(size);
    localStorage.setItem('access-text-size', size);
    
    const html = document.documentElement;
    html.classList.remove('accessibility-text-large', 'accessibility-text-xlarge');
    
    if (size === 'large') {
      html.classList.add('accessibility-text-large');
    } else if (size === 'xlarge') {
      html.classList.add('accessibility-text-xlarge');
    }
  };

  const handleContrastToggle = (active: boolean) => {
    setHighContrast(active);
    localStorage.setItem('access-high-contrast', String(active));
    
    const html = document.documentElement;
    if (active) {
      html.classList.add('accessibility-high-contrast');
    } else {
      html.classList.remove('accessibility-high-contrast');
    }
  };

  const handleMotionToggle = (active: boolean) => {
    setReduceMotion(active);
    localStorage.setItem('access-reduce-motion', String(active));
    
    const html = document.documentElement;
    if (active) {
      html.classList.add('accessibility-reduce-motion');
    } else {
      html.classList.remove('accessibility-reduce-motion');
    }
  };

  const handleReset = () => {
    handleTextSizeChange('normal');
    handleContrastToggle(false);
    handleMotionToggle(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-neutral-gray text-dark focus:outline-none transition-colors border border-transparent hover:border-neutral-gray relative z-50 flex items-center justify-center"
        title={isOpen ? 'Tutup Pengaturan Aksesibilitas' : 'Pengaturan Aksesibilitas'}
        aria-label={isOpen ? 'Tutup Pengaturan Aksesibilitas' : 'Pengaturan Aksesibilitas'}
      >
        <span className="sr-only">Aksesibilitas</span>
        {isOpen ? (
          <X className="w-6 h-6 text-dark animate-in spin-in-90 duration-200" />
        ) : (
          <svg
            className="w-6 h-6 text-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            ref={panelRef}
            className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-neutral-gray p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between border-b border-neutral-gray pb-2 mb-4">
              <h3 className="text-sm font-semibold text-dark">
                Aksesibilitas & Keterbacaan
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-dark rounded-lg hover:bg-neutral-gray transition-colors"
                title="Tutup"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pengaturan Ukuran Teks */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Type className="w-3.5 h-3.5" /> Ukuran Teks
              </span>
              <div className="grid grid-cols-3 gap-1">
                {(['normal', 'large', 'xlarge'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => handleTextSizeChange(size)}
                    className={`text-xs py-1.5 px-2 rounded-lg border transition-all text-center capitalize ${
                      textSize === size
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-neutral-gray hover:bg-neutral-bg text-dark'
                    }`}
                  >
                    {size === 'normal' ? 'Normal' : size === 'large' ? 'Besar' : 'Sgt Besar'}
                  </button>
                ))}
              </div>
            </div>

            {/* Pengaturan Kontras */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5" /> Kontras Halaman
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleContrastToggle(false)}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg border transition-all flex items-center justify-between ${
                    !highContrast
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-neutral-gray hover:bg-neutral-bg text-dark'
                  }`}
                >
                  Normal {!highContrast && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleContrastToggle(true)}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg border transition-all flex items-center justify-between ${
                    highContrast
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-neutral-gray hover:bg-neutral-bg text-dark'
                  }`}
                >
                  Tinggi {highContrast && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Kurangi Gerakan */}
            <div className="mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ZapOff className="w-3.5 h-3.5" /> Efek Animasi
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleMotionToggle(false)}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg border transition-all flex items-center justify-between ${
                    !reduceMotion
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-neutral-gray hover:bg-neutral-bg text-dark'
                  }`}
                >
                  Aktif {!reduceMotion && <Check className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleMotionToggle(true)}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg border transition-all flex items-center justify-between ${
                    reduceMotion
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-neutral-gray hover:bg-neutral-bg text-dark'
                  }`}
                >
                  Kurangi {reduceMotion && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Atur Ulang */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-red-600 hover:bg-red-50 py-2 rounded-xl transition-colors border border-transparent hover:border-red-200 mt-2 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Atur Ulang Semua
            </button>
          </div>
        </>
      )}
    </div>
  );
}
