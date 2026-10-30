import React, { useState } from 'react';
import { User } from '../types';
import { LogOut, ChevronDown, Check, UserCheck, Shield, Sparkles } from 'lucide-react';
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
  allUsers,
  onSelectUser,
  onLogout,
  serverStatus,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="bg-[#053b26] border-b-2 border-amber-500/30 text-white sticky top-0 z-40 no-print shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          
          {/* Brand Identity Zone */}
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-white/95 p-1.5 flex items-center justify-center shrink-0 shadow-xs border border-amber-400/40">
              <LogoMadrasahSvg className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white block truncate">
                  MA NU 01 BANYUPUTIH
                </span>
                <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  UNGGUL (A)
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/80 font-normal truncate flex items-center space-x-1.5 mt-0.5">
                <span>LP Ma'arif NU Batang</span>
                <span className="text-emerald-400/50">·</span>
                <span className="hidden sm:inline">Sistem Asesmen & Kurikulum Merdeka</span>
              </p>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            {/* User Switcher Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-emerald-400/20 text-left transition cursor-pointer"
                title="Klik untuk beralih akun pendidik"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 border border-emerald-300/40 text-amber-200 flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-amber-300" />
                  ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left min-w-0 max-w-[140px] md:max-w-[190px]">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-200/90 truncate flex items-center space-x-1 mt-0.5">
                    <span>{currentUser.role === 'guru' ? 'Guru Mapel' : 'Administrator'}</span>
                    <span className="text-emerald-400/60">·</span>
                    <span className="text-amber-300 truncate">{currentUser.mapel?.[0] || 'Umum'}</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200/80 shrink-0" />
              </button>

              {/* User Switcher Dropdown */}
              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ganti Akun Pendidik / Admin
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pilih profil guru untuk simulasi pembuatan soal & modul
                    </p>
                  </div>
                  <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => onSelectUser(u)}
                          className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-900 font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{u.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {u.role === 'guru' ? `Guru ${u.mapel?.join(', ')}` : 'Administrator'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Action */}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="h-9 px-3 rounded-xl bg-white/10 hover:bg-rose-600/80 hover:text-white border border-white/15 transition-all text-xs font-semibold flex items-center space-x-1.5 cursor-pointer text-emerald-100"
                title="Keluar dari sesi"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
