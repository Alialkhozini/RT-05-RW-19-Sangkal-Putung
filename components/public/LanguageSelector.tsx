'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface Language {
  code: string;
  label: string;
  name: string;
  flagUrl: string;
}

const languages: Language[] = [
  { code: 'id', label: 'ID', name: 'Indonesia', flagUrl: 'https://flagcdn.com/w40/id.png' },
  { code: 'en', label: 'EN', name: 'English', flagUrl: 'https://flagcdn.com/w40/gb.png' },
];

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: any;
  }
}

// Fungsi pembantu untuk mengatur cookie googtrans
function setGoogleTranslateCookie(lang: string) {
  const hostname = window.location.hostname;
  if (lang === 'id') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${hostname}; path=/;`;
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.${hostname}; path=/;`;
    document.cookie = 'googtrans=/id/id; path=/;';
    document.cookie = `googtrans=/id/id; domain=${hostname}; path=/;`;
  } else {
    document.cookie = `googtrans=/id/${lang}; path=/;`;
    document.cookie = `googtrans=/id/${lang}; domain=${hostname}; path=/;`;
  }
}

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState('id');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat dropdown terbuka
  useEffect(() => {
    if (isOpen && panelRef.current) {
      const timer = setTimeout(() => {
        panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Inisialisasi Google Translate script dan sinkronisasi preferensi bahasa
  useEffect(() => {
    // 1. Buat div kontainer Google Translate di body jika belum ada
    let translateDiv = document.getElementById('google_translate_element');
    if (!translateDiv) {
      translateDiv = document.createElement('div');
      translateDiv.id = 'google_translate_element';
      document.body.appendChild(translateDiv);
    }

    // 2. Tentukan fungsi inisialisasi callback
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'id',
            includedLanguages: 'id,en',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    // 3. Muat script Google Translate jika belum ada di document
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }

    // 4. Deteksi bahasa saat ini dari cookie atau localStorage
    const cookieMatch = document.cookie.match(/googtrans=\/id\/([a-zA-Z-]+)/);
    const initialLang = (cookieMatch ? cookieMatch[1] : null) || localStorage.getItem('preferredLanguage') || 'id';
    
    if (initialLang === 'en') {
      setCurrentLang('en');
      setGoogleTranslateCookie('en');
    } else {
      setCurrentLang('id');
      setGoogleTranslateCookie('id');
    }

    // 5. Pastikan body tidak terdorong turun dan banner iframe dinonaktifkan
    const suppressBanner = () => {
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.top = '0px';
      }
      const bannerFrames = document.querySelectorAll('iframe.goog-te-banner-frame, iframe.skiptranslate');
      bannerFrames.forEach((frame) => {
        const el = frame as HTMLElement;
        el.style.display = 'none';
        el.style.visibility = 'hidden';
      });
    };

    const interval = setInterval(suppressBanner, 100);
    return () => clearInterval(interval);
  }, []);

  // Tutup dropdown jika pengguna mengklik di luar area komponen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Penanganan klik saat berpindah bahasa
  const handleLanguageChange = (langCode: string) => {
    if (langCode === currentLang) {
      setIsOpen(false);
      return;
    }

    setCurrentLang(langCode);
    localStorage.setItem('preferredLanguage', langCode);
    setGoogleTranslateCookie(langCode);
    setIsOpen(false);

    if (langCode === 'id') {
      // Kembali ke Bahasa Indonesia asli secara bersih
      window.location.reload();
      return;
    }

    // Berpindah ke Bahasa Inggris
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const activeLanguage = languages.find((lang) => lang.code === currentLang) || languages[0];

  return (
    <div className="relative inline-block text-left font-semibold text-xs notranslate" translate="no" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notranslate flex items-center gap-1.5 hover:bg-neutral-bg px-3 py-2 rounded-xl transition-all text-gray-700 hover:text-primary cursor-pointer font-bold select-none active:scale-95 duration-150 text-[14px] relative z-50"
        title={isOpen ? 'Tutup Pilihan Bahasa' : 'Pilih Bahasa / Select Language'}
        aria-label={isOpen ? 'Tutup Pilihan Bahasa' : 'Pilih Bahasa / Select Language'}
        translate="no"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={activeLanguage.flagUrl}
          alt={activeLanguage.label}
          className="w-5.5 h-3.5 object-cover rounded-[2px] shadow-2xs notranslate"
        />
        <span className="text-sm font-bold uppercase text-gray-800 notranslate" translate="no">
          {activeLanguage.label}
        </span>
        {isOpen ? (
          <X className="w-4 h-4 text-gray-700 animate-in spin-in-90 duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500 opacity-70 transition-transform duration-200" />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div
            ref={panelRef}
            className="notranslate absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-neutral-gray p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-0.5"
            translate="no"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`notranslate w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left font-bold transition-all text-gray-600 hover:text-primary hover:bg-neutral-bg cursor-pointer ${
                  currentLang === lang.code ? 'text-primary bg-primary/5 font-extrabold' : ''
                }`}
                translate="no"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lang.flagUrl}
                  alt={lang.label}
                  className="w-5.5 h-3.5 object-cover rounded-xs border border-gray-100 shrink-0 notranslate"
                />
                <span className="text-xs font-bold notranslate" translate="no">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
