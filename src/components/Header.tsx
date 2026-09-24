import React from 'react';
import { User } from '../types';
import { LogOut } from 'lucide-react';
import { LogoMadrasahSvg } from './KopMadrasah';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onLogout?: () => void;
  serverStatus: {
    online: boolean;
    geminiConfigured: boolean;
    gateway: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
}) => {
  return (
    <header className="glass-panel border-b border-slate-200/80 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Institution Logo & Identity */}
          <div className="flex items-center space-x-3">
            <LogoMadrasahSvg className="w-9 h-9" />
            <div>
              <span className="font-heading font-extrabold text-sm sm:text-base text-slate-900 tracking-tight block">
                MA NU 01 BANYUPUTIH
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide block">
                Sistem Asesmen & Administrasi Kurikulum Merdeka
              </span>
            </div>
          </div>

          {/* Connection status & Secure Logout */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Elegant Connection Indicator (Unboxed, Minimalist) */}
            <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Sistem Terhubung</span>
            </div>

            {/* Logged in User Pill + Logout Button */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="w-6 h-6 rounded-md bg-[#1e4d7b] text-white flex items-center justify-center text-xs font-extrabold">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-bold text-slate-800 leading-none">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[9px] text-[#1e4d7b] font-bold uppercase tracking-wider mt-0.5">
                    {currentUser.role === 'guru'
                      ? 'Guru Mapel'
                      : currentUser.role === 'admin'
                      ? 'Admin Madrasah'
                      : 'Operator TU'}
                  </div>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-900 transition-all shadow-2xs flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
