import React from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  History,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
  Zap,
  Building2,
} from 'lucide-react';
import { Role } from '../types';

export type NavTab = 'dashboard' | 'soal' | 'administrasi' | 'bank_soal' | 'admin_panel' | 'identitas_madrasah';

interface NavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: Role;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  userRole,
}) => {
  if (activeTab === 'dashboard') {
    return null;
  }

  return (
    <div className="glass-panel border-b border-slate-200/80 sticky top-16 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-2.5 overflow-x-auto scrollbar-none">
          {/* Tombol Kembali ke Menu Utama (Tampilan Awal 2 Icon Besar) */}
          <div className="flex items-center space-x-2 mr-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 border border-slate-200 transition-all duration-150 shadow-2xs group cursor-pointer"
              title="Kembali ke Menu Utama"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>Menu Utama</span>
            </button>
          </div>

          {/* Tab Utama: 1. Generate Soal & 2. Admin Guru (Segmented Futuristic Pill) */}
          <div className="flex items-center space-x-2 sm:space-x-2.5 bg-slate-100/70 p-1 rounded-2xl border border-slate-200/70">
            <button
              onClick={() => onTabChange('soal')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'soal'
                  ? 'bg-gradient-to-r from-[#1e4d7b] to-[#2563eb] text-white shadow-md shadow-blue-900/15'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'soal' ? 'text-blue-200' : 'text-[#1e4d7b]'}`} />
              <span>1. Generate Soal</span>
              {activeTab === 'soal' && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse hidden sm:inline-block"></span>
              )}
            </button>

            <button
              onClick={() => onTabChange('administrasi')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                activeTab === 'administrasi'
                  ? 'bg-gradient-to-r from-[#065f46] to-[#10b981] text-white shadow-md shadow-emerald-900/15'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'administrasi' ? 'text-emerald-200' : 'text-emerald-600'}`} />
              <span>2. Admin Guru</span>
              {activeTab === 'administrasi' && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse hidden sm:inline-block"></span>
              )}
            </button>
          </div>

          {/* Menu Pendukung (Hanya untuk Admin/Operator) */}
          {userRole !== 'guru' && (
            <div className="flex items-center space-x-2 ml-3">
              <button
                onClick={() => onTabChange('identitas_madrasah')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  activeTab === 'identitas_madrasah'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-purple-700 bg-purple-50/90 hover:bg-purple-100 hover:text-purple-900 border border-purple-200/80 shadow-2xs'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Identitas Madrasah</span>
                <span className="sm:hidden">Identitas</span>
              </button>

              <button
                onClick={() => onTabChange('bank_soal')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                  activeTab === 'bank_soal'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Riwayat Dokumen</span>
                <span className="sm:hidden">Riwayat</span>
              </button>

              {userRole === 'admin' && (
                <button
                  onClick={() => onTabChange('admin_panel')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                    activeTab === 'admin_panel'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Server & Akun</span>
                  <span className="sm:hidden">Server</span>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};
