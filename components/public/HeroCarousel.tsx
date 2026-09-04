'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  ArrowRight,
  Pause,
  Play
} from 'lucide-react';
import { HeroBanner } from '@/services/banner.service';

interface HeroCarouselProps {
  banners: HeroBanner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = banners.length;

  // Navigasi Next & Prev
  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % (totalSlides || 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + (totalSlides || 1)) % (totalSlides || 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play Carousel (6 Detik)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    slideInterval.current = setInterval(() => {
      nextSlide();
    }, 6000);

    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [totalSlides, isPaused, nextSlide]);

  // Touch Swipe Support untuk Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  if (!banners || banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <section 
      className="relative min-h-[660px] md:min-h-[700px] lg:min-h-[740px] bg-dark text-white overflow-hidden flex items-center justify-center pt-36 pb-36 px-4 md:px-6 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-label="Hero Carousel Banner"
    >
      {/* Background Image Carousel Slides */}
      <div className="absolute inset-0 z-0">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <Image
                src={banner.image_url || '/hero-banner.jpg'}
                alt={banner.title}
                fill
                sizes="100vw"
                className={`object-cover transition-transform duration-1000 ease-out ${
                  isActive ? 'scale-100 opacity-75' : 'scale-105 opacity-0'
                }`}
                priority={index === 0}
              />
              {/* Overlay Gradien Pencahayaan */}
              <div className="absolute inset-0 bg-gradient-to-b from-dark/65 via-dark/45 to-dark/90" />
            </div>
          );
        })}
      </div>

      {/* Konten Utama Banner (Teks, Judul, Tombol Pencarian) */}
      <div className="relative z-20 w-full max-w-4xl text-center flex flex-col items-center gap-6">
        {/* Badge (Glassmorphism / Efek Kaca) */}
        {currentBanner.badge && (
          <span 
            key={`badge-${currentIndex}`}
            className="bg-white/15 backdrop-blur-md border border-white/30 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-1.5 rounded-full animate-in fade-in slide-in-from-top-2 duration-500 shadow-lg drop-shadow-sm inline-flex items-center justify-center"
          >
            {currentBanner.badge}
          </span>
        )}

        {/* Judul Utama */}
        <h1 
          key={`title-${currentIndex}`}
          className="font-handwriting text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-normal leading-tight max-w-4xl drop-shadow-lg text-white animate-in fade-in slide-in-from-bottom-3 duration-500"
        >
          {currentBanner.title}
        </h1>

        {/* Subjudul */}
        <p 
          key={`sub-${currentIndex}`}
          className="text-base md:text-xl text-gray-200 font-medium max-w-2xl leading-relaxed drop-shadow-md animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100"
        >
          {currentBanner.subtitle}
        </p>

        {/* CTA Link Opsional */}
        {currentBanner.cta_text && currentBanner.cta_link && (
          <div className="animate-in fade-in zoom-in-95 duration-500 delay-150">
            <Link
              href={currentBanner.cta_link}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-xs md:text-sm font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
            >
              <span>{currentBanner.cta_text}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Search Input Bar Terintegrasi */}
        <form 
          action="/informasi/berita"
          method="GET"
          className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-2 mt-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <div className="flex-1 flex items-center gap-2.5 px-3">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              name="q"
              placeholder="Cari informasi, berita, pengumuman, atau layanan warga..."
              className="w-full bg-transparent border-none text-dark text-xs md:text-sm focus:outline-none placeholder:text-gray-400 font-medium py-2.5"
            />
          </div>
          <button 
            type="submit"
            className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors shrink-0 shadow-md"
          >
            Cari
          </button>
        </form>
      </div>

      {/* ================= TOMBOL NAVIGASI SLIDER MANUAL ================= */}
      {totalSlides > 1 && (
        <>
          {/* Tombol Kiri (Prev) */}
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Banner Sebelumnya"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-30 p-2 text-white/80 hover:text-white transition-all duration-200 hover:scale-125 focus:outline-none cursor-pointer group"
          >
            <ChevronLeft className="w-8 h-8 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] group-hover:-translate-x-1 transition-transform" />
          </button>

          {/* Tombol Kanan (Next) */}
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Banner Selanjutnya"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-30 p-2 text-white/80 hover:text-white transition-all duration-200 hover:scale-125 focus:outline-none cursor-pointer group"
          >
            <ChevronRight className="w-8 h-8 md:w-11 md:h-11 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Indikator Titik / Kapsul Pagination di Bawah (Ditempatkan di atas kartu layanan -mt-24) */}
          <div className="absolute bottom-28 md:bottom-28 z-30 flex items-center gap-2 bg-black/55 backdrop-blur-md py-2 px-3.5 rounded-full border border-white/20 shadow-2xl">
            {banners.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Pindah ke Banner ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-primary shadow-sm'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
