import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileSpreadsheet,
  History,
  ShieldCheck,
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
  // Desktop navigation is unified inside Header.tsx.
  // On mobile (< md), render a fixed 4-item bottom navigation bar with >= 44px touch targets.
  const fourthItem =
    userRole === 'admin'
      ? { id: 'admin_panel' as NavTab, label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> }
      : { id: 'bank_soal' as NavTab, label: 'Bank Soal', icon: <History className="w-5 h-5" /> };

  const mobileItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'soal', label: 'Buat Soal', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'administrasi', label: 'Administrasi', icon: <FileSpreadsheet className="w-5 h-5" /> },
    fourthItem,
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#045f3b] border-t border-white/15 text-white no-print shadow-lg">
      <div className="grid grid-cols-4">
        {mobileItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`min-h-[54px] px-2 py-1.5 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold border-t-[3px] transition-colors cursor-pointer touch-manipulation ${
                isActive
                  ? 'border-amber-400 text-amber-300 font-bold bg-[#03482d]/60'
                  : 'border-transparent text-emerald-100/80 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="truncate max-w-full">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
