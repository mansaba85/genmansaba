import React, { useState } from 'react';
import { User } from '../types';
import { NavTab } from './Navigation';
import {
  LogOut,
  ChevronDown,
  Check,
  Shield,
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  History,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { LogoMadrasahSvg } from './KopMadrasah';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  onLogout?: () => void;
  activeTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
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
  activeTab = 'dashboard',
  onTabChange,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'soal', label: 'Buat Soal', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'administrasi', label: 'Administrasi', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'bank_soal', label: 'Bank Soal', icon: <History className="w-4 h-4" /> },
    {
      id: 'identitas_madrasah',
      label: 'Identitas',
      icon: <Building2 className="w-4 h-4" />,
      adminOnly: true,
    },
    {
      id: 'admin_panel',
      label: 'Panel Admin',
      icon: <ShieldCheck className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.adminOnly || currentUser.role !== 'guru'
  );

  return (
    <header className="bg-[#045f3b] border-b border-white/15 text-white sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Identity (Left) */}
          <button
            type="button"
            onClick={() => onTabChange?.('dashboard')}
            className="flex items-center space-x-3 min-w-0 text-left cursor-pointer focus:outline-none shrink-0"
          >
            <div className="w-9 h-9 rounded-[10px] bg-white p-1 flex items-center justify-center shrink-0">
              <LogoMadrasahSvg className="w-full h-full" />
            </div>
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white whitespace-nowrap">
              MA NU 01 BANYUPUTIH
            </span>
          </button>

          {/* Zone 2: Primary Navigation (Center — Desktop) */}
          <nav className="hidden md:flex items-center h-full space-x-1 overflow-x-auto no-scrollbar">
            {visibleNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange?.(item.id)}
                  className={`h-full px-3.5 inline-flex items-center space-x-2 text-xs font-semibold border-b-[3px] transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-white font-bold bg-[#03482d]/50'
                      : 'border-transparent text-emerald-100/80 hover:text-white hover:border-white/25'
                  }`}
                >
                  <span className={isActive ? 'text-amber-400' : 'text-emerald-200/75'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: User Profile & Logout (Right) */}
          <div className="flex items-center space-x-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2.5 px-3 py-1.5 min-h-[40px] rounded-[10px] bg-[#03482d] hover:bg-black/25 border border-white/15 text-left transition cursor-pointer"
                title="Klik untuk beralih akun pendidik"
              >
                <div className="w-7 h-7 rounded-[10px] bg-[#045f3b] border border-amber-400/40 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <span>{currentUser.name.charAt(0)}</span>
                  )}
                </div>
                <div className="hidden sm:block text-left min-w-0 max-w-[150px]">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {currentUser.name.split(',')[0]}
                  </div>
                  <div className="text-[10px] text-emerald-100/80 truncate leading-tight mt-0.5">
                    {currentUser.role === 'guru' ? currentUser.mapel?.[0] || 'Guru' : 'Administrator'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-200/80 shrink-0" />
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-[16px] shadow-lg border border-[#e2e8f0] py-2 z-50 text-slate-900"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Ganti Akun Pendidik / Admin
                    </span>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-0.5">
                    {allUsers.map((u) => {
                      const isSelected = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => onSelectUser(u)}
                          className={`w-full px-3 py-2 rounded-[10px] text-left flex items-center justify-between text-xs transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#045f3b]/10 text-[#045f3b] font-bold'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate font-semibold">{u.name}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {u.role === 'guru' ? `Guru ${u.mapel?.join(', ')}` : 'Administrator'}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#045f3b] shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="min-h-[40px] px-3 rounded-[10px] bg-[#03482d] hover:bg-rose-700 text-emerald-100 hover:text-white border border-white/15 transition-colors text-xs font-semibold flex items-center space-x-1.5 cursor-pointer"
                title="Keluar dari sesi"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden lg:inline">Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
