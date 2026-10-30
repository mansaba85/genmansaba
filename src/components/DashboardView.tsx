import React from 'react';
import { User, ExamPackage, MadrasahIdentity, LoginLog } from '../types';
import { NavTab } from './Navigation';
import {
  BookOpen,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Building,
  Image as ImageIcon,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Calendar,
  Award,
  Users,
  ShieldCheck,
  History,
  FileText
} from 'lucide-react';
import { LogoMadrasahSvg } from './KopMadrasah';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: NavTab) => void;
  recentExams?: ExamPackage[];
  onSelectExamPreset?: (presetIndex: number) => void;
  madrasahIdentity?: MadrasahIdentity;
  users?: User[];
  docs?: any[];
  logs?: LoginLog[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  recentExams = [],
  onSelectExamPreset,
  madrasahIdentity,
  users = [],
  logs = [],
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'operator';
  const totalTeachers = users.filter((u) => u.role === 'guru').length;

  return (
    <div className="py-6 sm:py-8 max-w-6xl mx-auto px-4 sm:px-6 space-y-8 select-none">
      
      {/* INSTITUTIONAL HERO BANNER: Deep Islamic Pine Green with Gold Border */}
      <div className="bg-gradient-to-br from-[#064e3b] via-[#043d2e] to-[#022c22] rounded-3xl p-7 sm:p-10 text-white relative overflow-hidden shadow-xl border-2 border-amber-400/40">
        
        {/* Subtle Decorative Aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            {/* Top Institutional Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wider shadow-sm">
                <Award className="w-3.5 h-3.5 mr-1 text-slate-950" />
                AKREDITASI A (UNGGUL)
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-200 border border-emerald-600/40">
                LP Ma'arif NU Batang · TP {madrasahIdentity?.tahunAjaran || '2026/2027'}
              </span>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Mode Administrator
                </span>
              )}
            </div>

            {/* Greeting & Title */}
            <div>
              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Selamat Datang, {currentUser.name}
              </h1>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed mt-2 font-normal">
                {isAdmin
                  ? 'Pusat Kendali Sistem Asesmen CBT & Administrasi Kurikulum Merdeka MA NU 01 Banyuputih Batang. Kelola akun pendidik, penugasan mata pelajaran, generator diagram AI, dan arsip dokumen madrasah.'
                  : 'Portal Mandiri Guru MA NU 01 Banyuputih: Penyusunan naskah asesmen madrasah 6 tipe soal lengkap gambar AI & rumus matematika KaTeX, serta perangkat administrasi Kurikulum Merdeka (Modul Ajar Deep Learning & KBC Panca Cinta).'}
              </p>
            </div>

            {/* Teacher Details Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-emerald-200/90">
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                <GraduationCap className="w-4 h-4 text-amber-300" />
                <span>Mapel: <strong className="text-white">{currentUser.mapel.join(', ')}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>Semester: <strong className="text-white">{madrasahIdentity?.semester || 'Gasal'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 bg-black/25 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>Format: <strong className="text-white">CBT & Word .docx</strong></span>
              </div>
            </div>
          </div>

          {/* Right Emblem Card */}
          <div className="flex flex-col items-center justify-center p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 text-center shrink-0 lg:w-64 shadow-md">
            <div className="w-20 h-20 rounded-2xl bg-white p-2.5 shadow-md flex items-center justify-center mb-3 border-2 border-amber-300">
              <LogoMadrasahSvg className="w-full h-full" />
            </div>
            <div className="font-heading font-black text-white text-sm tracking-wide">
              MA NU 01 BANYUPUTIH
            </div>
            <div className="text-[11px] text-amber-300 font-bold mt-0.5">
              NPSN: 20364930
            </div>
            <div className="text-[10px] text-emerald-200/80 mt-1">
              Banyuputih, Kab. Batang
            </div>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT: NEW AI IMAGE & DIAGRAM FEATURE BANNER */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-amber-400/50 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-5 bg-white shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-[#093d25] text-amber-300 flex items-center justify-center shrink-0 shadow-sm border border-amber-400/40">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-heading font-black text-sm sm:text-base text-slate-900">
                Fitur Baru: Generator Gambar & Diagram AI Edukasi Soal
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase shadow-2xs">
                Tersedia
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
              Bapak/Ibu guru kini dapat langsung membuat diagram skematik kurikulum merdeka (biologi, fisika, matematika geometri, kimia, geografi) secara otomatis dengan 1-klik saat menyusun maupun mengedit soal ujian!
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('soal')}
          className="px-5 py-2.5 rounded-xl bg-[#093d25] hover:bg-[#072f1c] text-amber-300 hover:text-white text-xs font-bold flex items-center space-x-2 shrink-0 cursor-pointer shadow-md border border-amber-400/40 transition-all"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Buka Naskah Asesmen</span>
        </button>
      </div>

      {/* TWO CORE WORKSPACE MODULES: Distinctive, Tactile, High-Identity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Module 1: Penyusunan Naskah Asesmen & Bank Soal */}
        <div
          onClick={() => onNavigate('soal')}
          className="group bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200/90 hover:border-emerald-700/60 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl relative overflow-hidden"
        >
          {/* Top Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-[#093d25]" />

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#093d25] border border-emerald-200 flex items-center justify-center group-hover:bg-[#093d25] group-hover:text-amber-300 transition-colors duration-200 shadow-xs">
                <BookOpen className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 uppercase tracking-wider">
                ASTS · ASESGA · ASAS
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900 group-hover:text-emerald-900 transition-colors">
                Penyusunan Naskah Asesmen
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Pembuatan naskah soal asesmen resmi 6 tipe soal (PG Tunggal, PG Jamak, B/S, Jodohkan, Isian Singkat, Uraian). Dilengkapi rumus matematika KaTeX LaTeX, teks Arab RTL, generator diagram gambar visual, dan ekspor instan Word (.docx) & CBT (.txt).
              </p>
            </div>

            {/* Checklist Feature Highlights */}
            <div className="pt-2 text-xs text-slate-700 space-y-2 border-t border-slate-100">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">6 Tipe Soal standar Asesmen Kurikulum Merdeka</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Dukungan 1-Klik Generator Diagram & Gambar Soal AI</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Format siap impor Beesmart, Candy CBT, ARD Kemenag</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-900 group-hover:text-emerald-700">
            <span>Mulai Buat Naskah Soal Asesmen</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 group-hover:bg-[#093d25] group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Module 2: Administrasi Pembelajaran Guru */}
        <div
          onClick={() => onNavigate('administrasi')}
          className="group bg-white rounded-3xl p-7 sm:p-8 border-2 border-slate-200/90 hover:border-blue-700/60 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl relative overflow-hidden"
        >
          {/* Top Blue/Navy Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900" />

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-900 border border-blue-200 flex items-center justify-center group-hover:bg-blue-900 group-hover:text-white transition-colors duration-200 shadow-xs">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-black px-3 py-1 rounded-full bg-blue-100 text-blue-900 uppercase tracking-wider">
                KURIKULUM MERDEKA
              </span>
            </div>

            <div className="space-y-2">
              <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                Administrasi Guru & Modul Ajar
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Penyusunan dokumen kurikulum merdeka komprehensif: Modul Ajar Deep Learning (Mindful, Meaningful, Joyful), KBC Panca Cinta, Capaian Pembelajaran (CP), Alur Tujuan (ATP), Program Tahunan (Prota), Prosem, dan KKTP 3 dimensi.
              </p>
            </div>

            {/* Checklist Feature Highlights */}
            <div className="pt-2 text-xs text-slate-700 space-y-2 border-t border-slate-100">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">Modul Ajar Deep Learning & KBC Panca Cinta</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">Perumusan CP, ATP, Prota, Prosem, KKTP Terpadu</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="font-semibold">Ekspor Word (.docx) lengkap Kop Resmi & Tanda Tangan</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-blue-950 group-hover:text-blue-800">
            <span>Buka Administrasi Guru</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 group-hover:bg-blue-900 group-hover:text-white flex items-center justify-center transition-all">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

      </div>

      {/* ADMIN CONSOLE STRIP (For Administrator / Operator) */}
      {isAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-800/20 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#093d25] flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-slate-900 text-sm sm:text-base">
                  Pusat Manajemen Administrator Madrasah
                </h3>
                <p className="text-xs text-slate-500">
                  Data pendidik ({totalTeachers} Guru aktif), kurikulum ({users.length} total akun), dan konfigurasi lembaga
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => onNavigate('admin_panel')}
                className="px-4 py-2 rounded-xl bg-[#093d25] hover:bg-[#072f1c] text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                <span>Panel Administrator</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('identitas_madrasah')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Identitas Resmi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pendidik Aktif</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums block mt-1">{totalTeachers}</span>
              <span className="text-[11px] text-emerald-700 font-medium">Akun Guru Terdaftar</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mata Pelajaran</span>
              <span className="text-2xl font-black text-slate-900 tabular-nums block mt-1">14</span>
              <span className="text-[11px] text-slate-600">MIPA, Agama & Bahasa</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Tahun Pelajaran</span>
              <span className="text-base font-black text-slate-900 block mt-1">{madrasahIdentity?.tahunAjaran || '2026/2027'}</span>
              <span className="text-[11px] text-slate-600">Semester {madrasahIdentity?.semester || 'Gasal'}</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Status Sistem</span>
              <span className="text-base font-black text-emerald-700 flex items-center space-x-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Aktif Terhubung</span>
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Proxmox CT Engine</span>
            </div>
          </div>
        </div>
      )}

      {/* RECENT ACTIVITY & ARSIP STRIP */}
      {logs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-emerald-800" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Aktivitas Sistem & Pendidik Terkini
              </span>
            </div>
            <span className="text-[11px] text-slate-400">MA NU 01 Banyuputih Batang</span>
          </div>
          <div className="divide-y divide-slate-100">
            {logs.slice(0, 4).map((log) => (
              <div key={log.id} className="px-6 py-3 flex items-center justify-between text-xs hover:bg-slate-50/50">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {log.userName.charAt(0)}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-slate-400 mx-1.5">·</span>
                    <span className="text-slate-600">{log.action}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 shrink-0 ml-4">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INSTITUTIONAL FOOTER STRIP */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center space-x-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center p-1.5 shrink-0">
            <LogoMadrasahSvg className="w-full h-full" />
          </div>
          <div>
            <div className="font-bold text-slate-900">
              {madrasahIdentity?.yayasan || "YAYASAN LP MA'ARIF NU KABUPATEN BATANG"}
            </div>
            <div className="text-[11px] text-slate-500">
              {madrasahIdentity?.alamat || 'Jl. Lapangan 9A Banyuputih, Kab. Batang'} · Kepala: {madrasahIdentity?.kepalaMadrasah || 'H. Mukhsin, S.Ag., M.Pd.I.'}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
            NPSN {madrasahIdentity?.npsn || '20364930'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
            Akreditasi A
          </span>
        </div>
      </div>

    </div>
  );
};
