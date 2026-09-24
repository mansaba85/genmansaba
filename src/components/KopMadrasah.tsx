import React from 'react';
import { MadrasahIdentity } from '../types';
import { MADRASAH_IDENTITY } from '../data/mockAndPresets';

interface KopMadrasahProps {
  rightTitle?: string;
  rightSubtitle?: string;
  ta?: string;
  className?: string;
  identity?: MadrasahIdentity;
}

export const LogoMadrasahSvg: React.FC<{ className?: string }> = ({ className = 'w-14 h-14' }) => (
  <svg
    viewBox="0 0 100 100"
    className={`${className} shrink-0`}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Logo MA NU 01 Banyuputih"
  >
    {/* Outer Green Ring & Crest */}
    <circle cx="50" cy="50" r="47" fill="#006837" stroke="#0f4826" strokeWidth="2" />
    <circle cx="50" cy="50" r="43" fill="#ffffff" />
    <circle cx="50" cy="50" r="41" fill="#006837" />
    <circle cx="50" cy="50" r="32" fill="#ffffff" />
    <circle cx="50" cy="50" r="30" fill="#006837" />

    {/* Text around circle */}
    <path id="curveTop" d="M 18,50 A 32,32 0 1,1 82,50" fill="none" />
    <path id="curveBottom" d="M 82,50 A 32,32 0 1,1 18,50" fill="none" />
    
    <text fill="#ffffff" fontSize="5.2" fontWeight="bold" letterSpacing="0.8">
      <textPath href="#curveTop" startOffset="50%" textAnchor="middle">
        MA NU 01 BANYUPUTIH
      </textPath>
    </text>
    <text fill="#ffffff" fontSize="4.6" fontWeight="bold" letterSpacing="0.5">
      <textPath href="#curveBottom" startOffset="50%" textAnchor="middle">
        KAB. BATANG
      </textPath>
    </text>

    {/* Globe & Star (Nahdlatul Ulama 9 Stars Motif) */}
    {/* Central Globe */}
    <circle cx="50" cy="50" r="16" fill="#008044" stroke="#ffffff" strokeWidth="1" />
    {/* Globe Latitude & Longitude */}
    <ellipse cx="50" cy="50" rx="9" ry="15" fill="none" stroke="#ffffff" strokeWidth="0.75" strokeDasharray="1,0.5" />
    <line x1="34" y1="50" x2="66" y2="50" stroke="#ffffff" strokeWidth="0.75" />
    <path d="M 38,42 Q 50,47 62,42" fill="none" stroke="#ffffff" strokeWidth="0.6" />
    <path d="M 38,58 Q 50,53 62,58" fill="none" stroke="#ffffff" strokeWidth="0.6" />

    {/* Tali Ikatan Tambang Bawah */}
    <path d="M 40,65 Q 50,68 60,65 Q 50,62 40,65" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />

    {/* 9 Stars */}
    {/* Big Top Star */}
    <polygon points="50,23 52,28 57,28 53,31 55,36 50,33 45,36 47,31 43,28 48,28" fill="#facc15" />
    
    {/* 4 Stars Left */}
    <polygon points="36,29 37.5,32 40.5,32 38,34 39,37 36,35 33,37 34,34 31.5,32 34.5,32" fill="#facc15" transform="scale(0.8) translate(8, 4)" />
    <polygon points="27,38 28.5,41 31.5,41 29,43 30,46 27,44 24,46 25,43 22.5,41 25.5,41" fill="#facc15" transform="scale(0.7) translate(10, 8)" />
    <polygon points="23,50 24.5,53 27.5,53 25,55 26,58 23,56 20,58 21,55 18.5,53 21.5,53" fill="#facc15" transform="scale(0.7) translate(8, 12)" />
    <polygon points="27,62 28.5,65 31.5,65 29,67 30,70 27,68 24,70 25,67 22.5,65 25.5,65" fill="#facc15" transform="scale(0.7) translate(8, 16)" />

    {/* 4 Stars Right */}
    <polygon points="64,29 65.5,32 68.5,32 66,34 67,37 64,35 61,37 62,34 59.5,32 62.5,32" fill="#facc15" transform="scale(0.8) translate(14, 4)" />
    <polygon points="73,38 74.5,41 77.5,41 75,43 76,46 73,44 70,46 71,43 68.5,41 71.5,41" fill="#facc15" transform="scale(0.7) translate(28, 8)" />
    <polygon points="77,50 78.5,53 81.5,53 79,55 80,58 77,56 74,58 75,55 72.5,53 75.5,53" fill="#facc15" transform="scale(0.7) translate(30, 12)" />
    <polygon points="73,62 74.5,65 77.5,65 75,67 76,70 73,68 70,70 71,67 68.5,65 71.5,65" fill="#facc15" transform="scale(0.7) translate(28, 16)" />
  </svg>
);

export const KopMadrasah: React.FC<KopMadrasahProps> = ({
  rightTitle = 'PRESENSI HARIAN SISWA KBM',
  rightSubtitle = 'HARI & TANGGAL: Senin, 21 September 2026',
  ta,
  className = '',
  identity = MADRASAH_IDENTITY,
}) => {
  const displayTa = ta || identity.tahunAjaran;
  return (
    <div className={`kop-madrasah w-full pb-1 text-black select-none ${className}`}>
      {/* Kop Surat Header (Logo Left, Info Centered) */}
      <div className="flex flex-col sm:flex-row items-center justify-center relative pb-2 gap-4">
        {/* Logo Left */}
        <div className="sm:absolute sm:left-0 sm:top-1 flex items-center justify-center shrink-0">
          {identity.logoUrl ? (
            <img
              src={identity.logoUrl}
              alt={identity.nama}
              className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain shrink-0 drop-shadow-xs"
            />
          ) : (
            <LogoMadrasahSvg className="w-16 h-16 sm:w-[72px] sm:h-[72px]" />
          )}
        </div>

        {/* Center School Identity */}
        <div className="text-center sm:px-20 leading-tight">
          {identity.yayasan && (
            <h3 className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              {identity.yayasan}
            </h3>
          )}
          <h1 className="text-lg sm:text-2xl font-black text-black uppercase tracking-tight my-1 leading-none">
            {identity.nama}
          </h1>
          {identity.akreditasi && (
            <div className="inline-block bg-slate-100 px-2 py-0.5 rounded-md text-[9px] font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 border border-slate-200">
              STATUS: {identity.akreditasi}
            </div>
          )}
          <p className="text-[10px] sm:text-xs text-slate-900 font-semibold">
            {identity.alamat} | NPSN: {identity.npsn}
          </p>
          <p className="text-[9.5px] sm:text-[10.5px] text-slate-600 font-medium mt-0.5">
            Telp: {identity.telepon || '(0285) 666789'} | Email: {identity.email || 'manubanyuputih@gmail.com'} | Web: {identity.website || 'manu01banyuputih.sch.id'}
          </p>
        </div>
      </div>

      {/* Garis Pembatas Ganda Khas Kop Resmi (Atas Tebal 2.5px, Bawah Tipis 1px) */}
      <div className="mt-2 space-y-[2px] print:mt-1.5">
        <div className="w-full h-[2.5px] bg-black"></div>
        <div className="w-full h-[1px] bg-black"></div>
      </div>

      {/* Document Title & Subtitle Centered Below Double Line */}
      <div className="text-center mt-4 sm:mt-5">
        <h2 className="text-sm sm:text-base font-black text-black uppercase tracking-normal leading-snug">
          {rightTitle}
        </h2>
        {rightSubtitle && (
          <p className="text-[10.5px] sm:text-xs font-bold text-slate-700 uppercase mt-1 tracking-wide">
            {rightSubtitle}
          </p>
        )}
      </div>
    </div>
  );
};

/**
 * Generate Standalone HTML string for new-tab Print/PDF document
 */
export function generateKopMadrasahHtml(
  rightTitle: string = 'PRESENSI HARIAN SISWA KBM',
  rightSubtitle: string = 'HARI & TANGGAL: Senin, 21 September 2026',
  ta: string = '2026/2027',
  identity: MadrasahIdentity = MADRASAH_IDENTITY
): string {
  const logoHtml = identity.logoUrl
    ? `<img src="${identity.logoUrl}" style="width: 72px; height: 72px; object-fit: contain;" alt="${identity.nama}" />`
    : `
        <svg style="width: 72px; height: 72px;" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="47" fill="#006837" stroke="#0f4826" stroke-width="2"/>
          <circle cx="50" cy="50" r="43" fill="#ffffff"/>
          <circle cx="50" cy="50" r="41" fill="#006837"/>
          <circle cx="50" cy="50" r="32" fill="#ffffff"/>
          <circle cx="50" cy="50" r="30" fill="#006837"/>
          <circle cx="50" cy="50" r="16" fill="#008044" stroke="#ffffff" stroke-width="1"/>
          <line x1="34" y1="50" x2="66" y2="50" stroke="#ffffff" stroke-width="0.75"/>
          <polygon points="50,23 52,28 57,28 53,31 55,36 50,33 45,36 47,31 43,28 48,28" fill="#facc15"/>
          <polygon points="36,29 37.5,32 40.5,32 38,34 39,37 36,35 33,37 34,34 31.5,32 34.5,32" fill="#facc15"/>
          <polygon points="64,29 65.5,32 68.5,32 66,34 67,37 64,35 61,37 62,34 59.5,32 62.5,32" fill="#facc15"/>
        </svg>
    `;

  return `
  <div style="width: 100%; margin-bottom: 20px; font-family: 'Arial', sans-serif; color: #000000; text-align: center; select-none;">
    <!-- Kop Surat Resmi Centered -->
    <div style="position: relative; display: flex; justify-content: center; align-items: center; min-height: 80px; padding-bottom: 8px;">
      <!-- Logo Kiri -->
      <div style="position: absolute; left: 0; top: 0;">
        ${logoHtml}
      </div>
      <!-- Teks Kop Tengah -->
      <div style="text-align: center; padding: 0 80px; line-height: 1.35;">
        ${
          identity.yayasan
            ? `<div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569;">${identity.yayasan}</div>`
            : ''
        }
        <div style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.01em; color: #000000; margin: 2px 0;">
          ${identity.nama}
        </div>
        ${
          identity.akreditasi
            ? `<div style="display: inline-block; background-color: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 9px; font-weight: 800; color: #0f172a; text-transform: uppercase; margin-bottom: 3px; border: 1px solid #cbd5e1;">STATUS: ${identity.akreditasi}</div>`
            : ''
        }
        <div style="font-size: 11px; font-weight: 700; color: #0f172a;">
          ${identity.alamat} | NPSN: ${identity.npsn}
        </div>
        <div style="font-size: 10px; font-weight: 500; color: #475569; margin-top: 2px;">
          Telp: ${identity.telepon || '(0285) 666789'} | Email: ${identity.email || 'manubanyuputih@gmail.com'} | Web: ${identity.website || 'manu01banyuputih.sch.id'}
        </div>
      </div>
    </div>

    <!-- Double Line Pembatas -->
    <div style="margin-top: 4px; margin-bottom: 16px;">
      <div style="width: 100%; height: 2.5px; background-color: #000000;"></div>
      <div style="width: 100%; height: 1px; background-color: #000000; margin-top: 2px;"></div>
    </div>

    <!-- Judul Dokumen Centered di Bawah Kop -->
    <div style="text-align: center; margin-top: 14px;">
      <div style="font-size: 15px; font-weight: 900; text-transform: uppercase; color: #000000; letter-spacing: 0.02em; line-height: 1.35;">
        ${rightTitle}
      </div>
      ${rightSubtitle ? `
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #334155; margin-top: 4px; letter-spacing: 0.02em;">
        ${rightSubtitle}
      </div>
      ` : ''}
    </div>
  </div>
  `;
}
