'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ChartSegment {
  label: string;
  value: number;
  color: string;
  unit?: string;
}

interface InteractiveDonutChartProps {
  title?: string;
  subtitle?: string;
  data: ChartSegment[];
  centerLabel: string;
  centerValue?: number;
  unit?: string;
  tooltipTheme?: 'dark' | 'light';
}

export default function InteractiveDonutChart({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  unit = 'orang',
  tooltipTheme = 'dark',
}: InteractiveDonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartBoxRef = useRef<HTMLDivElement>(null);

  const totalSum = data.reduce((sum, item) => sum + item.value, 0);
  const finalCenterValue = centerValue !== undefined ? centerValue : totalSum;

  // Trigger animasi saat masuk ke viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animasi angka counter di tengah saat pertama kali muncul
  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const duration = 900;
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = finalCenterValue / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= finalCenterValue) {
        setDisplayValue(finalCenterValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isVisible, finalCenterValue]);

  // Handle klik / sentuh di luar kontainer untuk menutup tooltip
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveIndex(null);
        setTooltipPos(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Dimensi SVG & Geometri Donut
  const viewBoxSize = 280;
  const center = viewBoxSize / 2; // 140
  const strokeWidth = 22;
  const radius = 92;
  const circumference = 2 * Math.PI * radius; // ~578.05px

  // Jarak gap sudut antar segmen
  const numSegments = data.length;
  const gapAngleDeg = numSegments === 2 ? 18 : 12; // Gap visual yang tegas dan bersih
  const totalGapDegrees = numSegments * gapAngleDeg;
  const availableDegrees = Math.max(0, 360 - totalGapDegrees);

  // Alokasi sudut dengan batas minimum agar segmen kecil tetap terlihat sebagai kapsul rapi
  const minAngleDeg = 14;
  let allocatedAngles: number[] = [];
  
  if (totalSum > 0) {
    const smallSegmentsCount = data.filter(d => (d.value / totalSum) * availableDegrees < minAngleDeg).length;
    const remainingDegrees = availableDegrees - (smallSegmentsCount * minAngleDeg);
    const largeTotalSum = data
      .filter(d => (d.value / totalSum) * availableDegrees >= minAngleDeg)
      .reduce((s, d) => s + d.value, 0);

    allocatedAngles = data.map((item) => {
      const naturalAngle = (item.value / totalSum) * availableDegrees;
      if (naturalAngle < minAngleDeg) {
        return minAngleDeg;
      }
      return largeTotalSum > 0 ? (item.value / largeTotalSum) * remainingDegrees : naturalAngle;
    });
  } else {
    allocatedAngles = data.map(() => availableDegrees / (data.length || 1));
  }

  // Hitung sudut awal, akhir, dan koordinat tengah busur
  let currentAngle = -90; // Mulai dari jam 12 (atas)

  const segments = data.map((item, index) => {
    const percentage = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
    const spanAngle = allocatedAngles[index] || 0;
    
    // Panjang busur dalam pixel
    const rawArcLength = (spanAngle / 360) * circumference;
    const strokeArcLength = Math.max(2, rawArcLength - strokeWidth);

    // Titik awal goresan (ditambah setengah gap dan setengah cap)
    const capAngle = (strokeWidth / 2 / circumference) * 360;
    const startAngle = currentAngle + gapAngleDeg / 2 + capAngle;

    // Sudut tengah busur
    const midAngle = currentAngle + gapAngleDeg / 2 + spanAngle / 2;
    const midRad = (midAngle * Math.PI) / 180;

    // Koordinat pusat busur segmen (dalam skala box 270x270)
    const arcMidX = (center + radius * Math.cos(midRad)) * (270 / viewBoxSize);
    const arcMidY = (center + radius * Math.sin(midRad)) * (270 / viewBoxSize);

    // Majukan currentAngle untuk segmen berikutnya
    currentAngle += spanAngle + gapAngleDeg;

    return {
      ...item,
      percentage: Number(percentage.toFixed(1)),
      strokeArcLength,
      startAngle,
      midAngle,
      arcMidX,
      arcMidY,
      index,
    };
  });

  const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

  // Helper untuk update posisi kursor saat mouse bergerak di atas segmen
  const updateCursorPosition = (e: React.MouseEvent) => {
    if (chartBoxRef.current) {
      const rect = chartBoxRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setTooltipPos({ x, y });
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex flex-col items-center w-full select-none"
    >
      {title && (
        <div className="text-center mb-4">
          <h3 className="text-base md:text-lg font-bold text-dark">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
      )}

      {/* Area Diagram Donut SVG & Tooltip */}
      <div 
        ref={chartBoxRef}
        className="relative flex items-center justify-center w-[270px] h-[270px]"
        onMouseLeave={() => {
          setActiveIndex(null);
          setTooltipPos(null);
        }}
      >
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full transform transition-all duration-700 overflow-visible"
          style={{
            transform: isVisible ? 'scale(1)' : 'scale(0.9)',
            opacity: isVisible ? 1 : 0,
            transition: 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease-out',
          }}
        >
          {/* Track Latar Belakang Abu-abu */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            className="opacity-70 pointer-events-none"
          />

          {/* Segmen-segmen Donut Interaktif */}
          {segments.map((seg) => {
            const isSelected = activeIndex === seg.index;
            const isOtherSelected = activeIndex !== null && !isSelected;

            return (
              <circle
                key={seg.label}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                pointerEvents="stroke"
                stroke={seg.color}
                strokeWidth={isSelected ? strokeWidth + 6 : strokeWidth}
                strokeLinecap="round"
                strokeDasharray={
                  isVisible 
                    ? `${seg.strokeArcLength} ${circumference - seg.strokeArcLength}`
                    : `0 ${circumference}`
                }
                strokeDashoffset={0}
                transform={`rotate(${seg.startAngle} ${center} ${center})`}
                className="cursor-pointer transition-all duration-200 ease-out"
                style={{
                  opacity: isOtherSelected ? 0.35 : 1,
                  filter: isSelected ? `drop-shadow(0 4px 14px ${seg.color}90)` : 'none',
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  setActiveIndex(seg.index);
                  updateCursorPosition(e);
                }}
                onMouseMove={(e) => {
                  updateCursorPosition(e);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeIndex === seg.index) {
                    setActiveIndex(null);
                    setTooltipPos(null);
                  } else {
                    setActiveIndex(seg.index);
                    setTooltipPos({ x: seg.arcMidX, y: seg.arcMidY });
                  }
                }}
              />
            );
          })}
        </svg>

        {/* Zona Tengah Lingkaran: Saat kursor di sini, tooltip langsung tertutup */}
        <div 
          className="absolute inset-[46px] rounded-full flex flex-col items-center justify-center z-10 cursor-default bg-transparent transition-transform duration-200"
          onMouseEnter={() => {
            setActiveIndex(null);
            setTooltipPos(null);
          }}
        >
          <span className="text-4xl md:text-5xl font-black text-dark tracking-tight leading-none drop-shadow-xs pointer-events-none transition-all duration-200">
            {activeSegment ? activeSegment.value : displayValue}
          </span>
          <span className="text-xs md:text-sm font-bold text-gray-400 mt-1 uppercase tracking-wider pointer-events-none transition-all duration-200">
            {activeSegment ? activeSegment.label : centerLabel}
          </span>
        </div>

        {/* Floating Tooltip Popover (Mengikuti Kursor dengan Pointer Arrow) */}
        {activeSegment && tooltipPos && (
          <div
            className={`absolute z-30 pointer-events-none transition-all duration-75 ease-out transform -translate-x-1/2 -translate-y-full mb-3 ${
              tooltipTheme === 'light'
                ? 'bg-white/95 backdrop-blur-md text-dark border border-neutral-gray shadow-xl ring-1 ring-black/5'
                : 'bg-gray-900/95 backdrop-blur-md text-white border border-gray-700/80 shadow-2xl'
            } rounded-2xl px-4 py-2.5 text-left animate-in fade-in zoom-in-95 whitespace-nowrap`}
            style={{
              left: `${Math.max(50, Math.min(220, tooltipPos.x))}px`,
              top: `${Math.max(30, Math.min(210, tooltipPos.y))}px`,
            }}
          >
            {/* Header Tooltip */}
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                style={{ backgroundColor: activeSegment.color }}
              />
              <span className="text-xs font-bold leading-none tracking-tight">
                {activeSegment.label}
              </span>
            </div>

            {/* Nilai & Persentase */}
            <div className={`text-xs font-semibold ${tooltipTheme === 'light' ? 'text-gray-600' : 'text-gray-300'} flex items-center gap-1.5`}>
              <span>{activeSegment.value} {activeSegment.unit || unit}</span>
              <span className="text-[10px] opacity-60">•</span>
              <span className="font-extrabold text-primary">{activeSegment.percentage}%</span>
            </div>

            {/* Panah Indikator Tooltip */}
            <div 
              className={`absolute w-2.5 h-2.5 rotate-45 ${
                tooltipTheme === 'light' 
                  ? 'bg-white border-b border-r border-neutral-gray' 
                  : 'bg-gray-900 border-b border-r border-gray-700'
              } bottom-[-5px] left-1/2 -translate-x-1/2`} 
            />
          </div>
        )}
      </div>

      {/* Legenda Bawah Interaktif */}
      <div className={`mt-6 w-full max-w-sm px-2 ${
        data.length === 2 
          ? 'flex items-center justify-center gap-6' 
          : 'grid grid-cols-2 gap-2.5'
      }`}>
        {segments.map((seg) => {
          const isSelected = activeIndex === seg.index;
          return (
            <button
              key={seg.label}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (activeIndex === seg.index) {
                  setActiveIndex(null);
                  setTooltipPos(null);
                } else {
                  setActiveIndex(seg.index);
                  setTooltipPos({ x: seg.arcMidX, y: seg.arcMidY });
                }
              }}
              onMouseEnter={() => {
                setActiveIndex(seg.index);
                setTooltipPos({ x: seg.arcMidX, y: seg.arcMidY });
              }}
              onMouseLeave={() => {
                setActiveIndex(null);
                setTooltipPos(null);
              }}
              className={`flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer outline-none focus:outline-none focus-visible:outline-none border-none ring-0 select-none ${
                isSelected 
                  ? 'bg-neutral-bg/80 scale-[1.03]' 
                  : 'hover:bg-neutral-bg/50 bg-transparent'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 transition-transform duration-200"
                style={{ 
                  backgroundColor: seg.color,
                  transform: isSelected ? 'scale(1.2)' : 'scale(1)'
                }}
              />
              <div className="flex items-center justify-between flex-1 gap-1 text-left">
                <span className={`text-xs ${isSelected ? 'font-extrabold text-dark' : 'font-semibold text-gray-600'}`}>
                  {seg.label}
                </span>
                <span className="text-[11px] font-bold text-primary/80">
                  {seg.value}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
