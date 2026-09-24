import React from 'react';
import { User, ExamPackage, MadrasahIdentity, LoginLog } from '../types';
import { NavTab } from './Navigation';
import {
  BookOpen,
  FileSpreadsheet,
  ArrowRight,
  Cpu,
  Layers,
  Building2,
  Users,
  Terminal,
  Activity,
  ShieldCheck,
  Server,
} from 'lucide-react';

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
  madrasahIdentity,
  users = [],
  docs = [],
  logs = [],
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'operator';

  // For Admin: Calculate actual statistics
  const totalTeachers = users.filter((u) => u.role === 'guru').length;
  const totalAdmins = users.filter((u) => u.role === 'admin' || u.role === 'operator').length;

  if (isAdmin) {
    return (
      <div className="py-4 sm:py-6 max-w-6xl mx-auto space-y-8 animate-fade-in">
        {/* Welcome Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-[#1e4d7b]/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md inline-block">
                Sesi Administrator Aktif
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Selamat Datang, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">Panel Utama Admin</span>
              </h1>
              <p className="text-slate-400 text-xs max-w-2xl leading-relaxed">
                Anda login sebagai <span className="text-white font-bold">{currentUser.name}</span>. Gunakan panel ini untuk mengelola data guru ampu, penugasan mata pelajaran, identitas KOP surat, dan memantau log aktivitas sistem.
              </p>
            </div>

            <div className="flex items-center space-x-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 shrink-0 self-start md:self-center">
              <Server className="w-8 h-8 text-emerald-400" />
              <div>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Host Infrastruktur</span>
                <span className="text-xs font-bold text-slate-200 block">Proxmox LXC Container</span>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping mr-1"></span>
                  <span>Server Status: Online & Stabil</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Stat 1 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Tenaga Pendidik</span>
              <span className="text-lg font-black text-slate-800 block mt-0.5">{totalTeachers} Guru</span>
              <span className="text-[9px] text-slate-500 block leading-none mt-0.5">Aktif Mengampu</span>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Kurikulum Terdaftar</span>
              <span className="text-lg font-black text-slate-800 block mt-0.5">14 Mata Pelajaran</span>
              <span className="text-[9px] text-slate-500 block leading-none mt-0.5">Kelompok Umum & Keagamaan</span>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Identitas Sekolah</span>
              <span className="text-sm font-black text-slate-800 block mt-1 truncate max-w-[150px]">MA NU 01 Banyuputih</span>
              <span className="text-[9px] text-blue-600 font-bold block leading-none mt-0.5">TA: {madrasahIdentity?.tahunAjaran || '2026/2027'} ({madrasahIdentity?.semester || 'Ganjil'})</span>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition flex items-center space-x-4">
            <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Staf TU / Operator</span>
              <span className="text-lg font-black text-slate-800 block mt-0.5">{totalAdmins} Operator</span>
              <span className="text-[9px] text-slate-500 block leading-none mt-0.5">Hak Akses Modul Penuh</span>
            </div>
          </div>
        </div>

        {/* Recent Activity Logs (Full Width) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-2.5">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full"></div>
              <h3 className="font-heading text-sm font-bold text-slate-800 uppercase tracking-wide">
                Log Log-In & Aktivitas Guru Terkini
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-md flex items-center space-x-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Real-time Log</span>
            </span>
          </div>

          {/* Log items */}
          <div className="divide-y divide-slate-100 mt-2">
            {logs.slice(0, 6).map((log) => (
              <div key={log.id} className="py-3.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-slate-500 font-medium capitalize">
                      {log.role === 'guru' ? 'Guru Mapel' : 'Administrator'}
                    </span>
                  </div>
                  <p className="text-slate-600 font-medium">
                    Aksi: <span className="text-[#1e4d7b] font-bold">{log.action}</span>
                  </p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    <span>IP: {log.ip}</span>
                    <span>•</span>
                    <span className="truncate max-w-[200px] sm:max-w-md">{log.userAgent}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400 font-semibold shrink-0 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {log.timestamp}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-5 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
            <span>Hanya Admin yang dapat memantau log aktivitas</span>
            <span className="text-emerald-600">Sistem Terenkripsi & Terlindungi Proxmox CT</span>
          </div>
        </div>

        {/* Elegant System Footer note */}
        <div className="pt-4 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <span>MA NU 01 Banyuputih Batang</span>
          <span>•</span>
          <span>Terakreditasi "A"</span>
          <span>•</span>
          <span className="font-medium text-slate-500">Sistem Informasi Kurikulum Merdeka</span>
        </div>
      </div>
    );
  }

  // Otherwise: Render standard Teacher Dashboard
  return (
    <div className="py-6 sm:py-12 max-w-5xl mx-auto px-4 animate-fade-in">
      {/* High-fidelity Header Segment */}
      <div className="text-center mb-10 sm:mb-12 space-y-4">
        <div className="text-[11px] font-bold text-[#1e4d7b] tracking-wider uppercase flex items-center justify-center space-x-1.5">
          <span>Sistem Informasi Madrasah</span>
          <span>·</span>
          <span className="text-emerald-700">Kurikulum Merdeka</span>
        </div>

        <h1 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Selamat Datang, <span className="bg-gradient-to-r from-[#1e4d7b] via-[#2563eb] to-[#0ea5e9] bg-clip-text text-transparent">{currentUser.name}</span>
        </h1>
        
        <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
          Penyusunan naskah soal asesmen dan administrasi pembelajaran guru MA NU 01 Banyuputih Batang. Terintegrasi, modern, dan sesuai standar LP Ma'arif NU.
        </p>

        {/* Elegant unboxed technical features */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-400 font-medium">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>Format Ekspor Kompatibel CBT</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Ekspor Word .docx & PDF</span>
          </span>
        </div>
      </div>

      {/* TAMPILAN DUA ICON UTAMA (1: Generate Soal, 2: Admin Guru) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* ICON 1: GENERATE SOAL */}
        <button
          type="button"
          onClick={() => onNavigate('soal')}
          className="group relative text-left glass-panel rounded-3xl p-7 sm:p-9 border border-slate-200/90 hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Subtle Background Mesh */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-blue-500/15 transition-all duration-500 pointer-events-none"></div>

          <div>
            {/* Number & Icon Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-50 to-indigo-50 border border-blue-200/60 text-[#1e4d7b] group-hover:from-[#1e4d7b] group-hover:to-[#2563eb] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-xs">
                <BookOpen className="w-8 h-8 transition-transform group-hover:scale-105" />
              </div>
              <div className="text-right">
                <span className="text-3xl font-heading font-black text-slate-200 group-hover:text-blue-500/20 transition-colors">
                  01
                </span>
                <div className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
                  Modul Soal
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#1e4d7b] flex items-center space-x-1">
                <span>Asesmen Utama</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#1e4d7b] transition-colors">
                Generate Soal Ujian
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Penyusunan naskah soal asesmen madrasah (ASTS, ASESGA, ASAS) dengan 6 tipe soal standar, rumus matematika KaTeX LaTeX, teks Arab RTL, dan ekspor .docx Word.
              </p>

              {/* Classic Tech Tags */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['6 Tipe Soal', 'KaTeX Math', 'Arabic RTL', 'CBT CKEditor', 'Ekspor .docx'].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#1e4d7b]">
            <span className="group-hover:translate-x-0.5 transition-transform">Buka Generator Soal</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 group-hover:bg-[#1e4d7b] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>

        {/* ICON 2: ADMIN GURU */}
        <button
          type="button"
          onClick={() => onNavigate('administrasi')}
          className="group relative text-left glass-panel rounded-3xl p-7 sm:p-9 border border-slate-200/90 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
        >
          {/* Subtle Background Mesh */}
          <div className="absolute -top-16 -right-16 w-44 h-44 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all duration-500 pointer-events-none"></div>

          <div>
            {/* Number & Icon Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-50 to-teal-50 border border-emerald-200/60 text-[#2d7a5f] group-hover:from-[#065f46] group-hover:to-[#10b981] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-8 h-8 transition-transform group-hover:scale-105" />
              </div>
              <div className="text-right">
                <span className="text-3xl font-heading font-black text-slate-200 group-hover:text-emerald-500/20 transition-colors">
                  02
                </span>
                <div className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">
                  Modul Administrasi
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#065f46] flex items-center space-x-1">
                <span>Administrasi Guru</span>
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-[#065f46] transition-colors">
                Administrasi Guru
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Penyusunan perangkat kurikulum merdeka terintegrasi: Modul Ajar KBC, CP/ATP, PROTA/PROSEM, KKTP interval 3 dimensi, dan instrumen umpan balik siswa.
              </p>

              {/* Classic Tech Tags */}
              <div className="pt-2 flex flex-wrap gap-1.5">
                {['Modul Ajar KBC', 'Deep Learning', 'CP & ATP', 'PROTA / PROSEM', 'KKTP 3 Dimensi'].map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium group-hover:bg-emerald-50 group-hover:text-emerald-800 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-semibold text-[#065f46]">
            <span className="group-hover:translate-x-0.5 transition-transform">Buka Administrasi Guru</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 group-hover:bg-[#065f46] group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </button>
      </div>

      {/* Elegant System Footer note */}
      <div className="mt-12 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
        <span>MA NU 01 Banyuputih Batang</span>
        <span>•</span>
        <span>Terakreditasi "A"</span>
        <span>•</span>
        <span className="font-medium text-slate-500">Sistem Informasi Kurikulum Merdeka</span>
      </div>
    </div>
  );
};
