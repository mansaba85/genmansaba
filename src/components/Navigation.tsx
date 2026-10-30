import React from 'react';
import {
  BookOpen,
  FileSpreadsheet,
  History,
  ShieldCheck,
  ChevronLeft,
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
    <div className="bg-[#093d25] border-b-2 border-amber-400 text-white sticky top-0 z-20 shadow-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between py-2 gap-3 overflow-x-auto no-scrollbar">
          {/* Back to Dashboard */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 hover:text-white hover:bg-emerald-800/80 transition-colors cursor-pointer whitespace-nowrap border border-amber-400/30"
            >
              <ChevronLeft className="w-4 h-4 text-amber-300" />
              <span>← Menu Utama</span>
            </button>
          </div>

          {/* Primary Segments */}
          <div className="flex items-center space-x-1.5 p-1 bg-emerald-950/70 rounded-2xl border border-emerald-700/60 shrink-0">
            <button
              type="button"
              onClick={() => onTabChange('soal')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'soal'
                  ? 'bg-amber-400 text-emerald-950 shadow-sm font-black'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <BookOpen className={`w-4 h-4 ${activeTab === 'soal' ? 'text-emerald-950' : 'text-amber-300'}`} />
              <span>Naskah Asesmen CBT</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('administrasi')}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'administrasi'
                  ? 'bg-amber-400 text-emerald-950 shadow-sm font-black'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
              }`}
            >
              <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'administrasi' ? 'text-emerald-950' : 'text-amber-300'}`} />
              <span>Administrasi Guru (KBC)</span>
            </button>
          </div>

          {/* Secondary tabs for Admin */}
          {userRole !== 'guru' && (
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onTabChange('identitas_madrasah')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'identitas_madrasah'
                    ? 'bg-white text-emerald-950'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                }`}
                title="Identitas Madrasah"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Identitas</span>
              </button>

              <button
                type="button"
                onClick={() => onTabChange('bank_soal')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'bank_soal'
                    ? 'bg-white text-emerald-950'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                }`}
                title="Riwayat & Bank Soal"
              >
                <History className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Bank Soal</span>
              </button>

              {userRole === 'admin' && (
                <button
                  type="button"
                  onClick={() => onTabChange('admin_panel')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    activeTab === 'admin_panel'
                      ? 'bg-white text-emerald-950'
                      : 'text-emerald-100 hover:text-white hover:bg-emerald-800/60'
                  }`}
                  title="Panel Admin"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span className="hidden sm:inline">Panel Admin</span>
                </button>
              )}
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};
