import React, { useState, useEffect } from 'react';
import { User, ExamPackage, GeneratedAdminDoc, LoginLog, MadrasahIdentity, AdminSubTab } from './types';
import {
  INITIAL_USERS,
  INITIAL_LOGIN_LOGS,
  SAMPLE_EXAM_PACKAGES,
  SAMPLE_ADMIN_DOCS,
  MADRASAH_IDENTITY,
} from './data/mockAndPresets';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { ExamGeneratorView } from './components/ExamGeneratorView';
import { AdministrationView } from './components/AdministrationView';
import { BankSoalAndHistoryView } from './components/BankSoalAndHistoryView';
import { AdminPanelView } from './components/AdminPanelView';
import { IdentitasMadrasahView } from './components/IdentitasMadrasahView';
import { PinLoginView } from './components/PinLoginView';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  PenTool,
  FileSpreadsheet,
  History,
  Cpu,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  Database
} from 'lucide-react';

const STORAGE_KEY_EXAMS = 'manu01_exams_v1';
const STORAGE_KEY_DOCS = 'manu01_docs_v1';
const STORAGE_KEY_USER = 'manu01_active_user_v1';
const STORAGE_KEY_MADRASAH = 'manu01_madrasah_identity_v1';
const STORAGE_KEY_USERS = 'manu01_users_v2';
const STORAGE_KEY_ACTIVE_TAB = 'manu01_active_tab_v2';
const STORAGE_KEY_ADMIN_SUB_TAB = 'manu01_admin_sub_tab_v2';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_TAB);
    if (saved) return saved as NavTab;
    return 'dashboard';
  });
  const [adminSubTab, setAdminSubTab] = useState<AdminSubTab>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN_SUB_TAB);
    if (saved) return saved as AdminSubTab;
    return 'mapel';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((u: User) => {
          if (u.id === 'user-zainal') {
            return { ...u, name: 'Admin', nip: '-' };
          }
          return u;
        });
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.id === 'user-zainal') {
          return { ...parsed, name: 'Admin', nip: '-' };
        }
        const savedUsers = localStorage.getItem(STORAGE_KEY_USERS);
        const activeUsersList = savedUsers ? JSON.parse(savedUsers) : INITIAL_USERS;
        const match = activeUsersList.find((u: any) => u.id === parsed.id);
        if (match) {
          if (match.id === 'user-zainal') {
            return { ...match, name: 'Admin', nip: '-' };
          }
          return match;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_USERS[0]; // Bpk. Hariyanto
  });

  const [exams, setExams] = useState<ExamPackage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EXAMS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SAMPLE_EXAM_PACKAGES;
  });

  const [docs, setDocs] = useState<GeneratedAdminDoc[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_DOCS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SAMPLE_ADMIN_DOCS;
  });

  const [madrasahIdentity, setMadrasahIdentity] = useState<MadrasahIdentity>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_MADRASAH);
    if (saved) {
      try {
        return { ...MADRASAH_IDENTITY, ...JSON.parse(saved) };
      } catch (e) {
        console.error(e);
      }
    }
    return MADRASAH_IDENTITY;
  });

  const [currentExamPackage, setCurrentExamPackage] = useState<ExamPackage>(
    SAMPLE_EXAM_PACKAGES[0]
  );
  const [logs, setLogs] = useState<LoginLog[]>(INITIAL_LOGIN_LOGS);
  const [serverStatus, setServerStatus] = useState({
    online: true,
    geminiConfigured: true,
    gateway: '9router API (Proxmox CT)',
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('manu01_is_logged_in') === 'true';
  });

  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'warning' }[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem('manu01_is_logged_in', 'true');

    // Ensure teacher and admin always land on Dashboard (Menu Utama 2 Icon Besar)
    setActiveTab('dashboard');
    localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, 'dashboard');

    // Add login log
    const newLog: LoginLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      timestamp: new Date().toLocaleTimeString('id-ID') + ' WIB',
      ip: '10.10.10.104 (LXC LAN)',
      userAgent: navigator.userAgent.substring(0, 30) + '...',
      action: 'Otorisasi PIN Berhasil',
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('manu01_is_logged_in');
    showToast('Berhasil keluar dari sistem.', 'success');
  };

  // Fetch server health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        setServerStatus({
          online: data.status === 'ok',
          geminiConfigured: data.geminiConfigured,
          gateway: data.gateway || '9router API',
        });
      })
      .catch((err) => {
        console.warn('API health check fallback:', err);
      });
  }, []);

  // Save active tab & sub-tab on every selection
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADMIN_SUB_TAB, adminSubTab);
  }, [adminSubTab]);

  // 30-Second Auto-save draft (PRD Section 5.3: REL-03)
  useEffect(() => {
    const timer = setInterval(() => {
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(docs));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
      localStorage.setItem(STORAGE_KEY_MADRASAH, JSON.stringify(madrasahIdentity));
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }, 30000);
    return () => clearInterval(timer);
  }, [exams, docs, currentUser, madrasahIdentity, users]);

  // Save users to localStorage instantly on changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }, [users]);

  const handleUpdateMadrasahIdentity = (newIdentity: MadrasahIdentity) => {
    setMadrasahIdentity(newIdentity);
    localStorage.setItem(STORAGE_KEY_MADRASAH, JSON.stringify(newIdentity));
  };

  // Persist immediately on saves
  const handleSaveExam = (updatedPkg: ExamPackage) => {
    setExams((prev) => {
      const idx = prev.findIndex((p) => {
        const isSameId = p.id === updatedPkg.id;
        const isDuplicateConfig =
          p.config.jenisUjian === updatedPkg.config.jenisUjian &&
          p.config.mapel.toLowerCase() === updatedPkg.config.mapel.toLowerCase() &&
          p.config.kelas === updatedPkg.config.kelas &&
          p.config.semester === updatedPkg.config.semester &&
          p.createdBy === updatedPkg.createdBy;
        return isSameId || isDuplicateConfig;
      });
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedPkg;
      } else {
        next = [updatedPkg, ...prev];
      }
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(next));
      return next;
    });
    setCurrentExamPackage(updatedPkg);
  };

  const handleSaveDoc = (newDoc: GeneratedAdminDoc) => {
    setDocs((prev) => {
      const filtered = prev.filter((d) => {
        const isSameId = d.id === newDoc.id;
        const isDuplicateConfig =
          d.type === newDoc.type &&
          d.config.mapel.toLowerCase() === newDoc.config.mapel.toLowerCase() &&
          d.config.kelas === newDoc.config.kelas &&
          d.config.semester === newDoc.config.semester &&
          d.createdBy === newDoc.createdBy;
        return !isSameId && !isDuplicateConfig;
      });
      const next = [newDoc, ...filtered];
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(next));
      return next;
    });
  };

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));

    // Log action
    const newLog: LoginLog = {
      id: `log-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      role: user.role,
      ip: '192.168.10.24 (Proxmox LAN)',
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB',
      userAgent: navigator.userAgent.slice(0, 30),
      action: 'Beralih Profil Pengguna',
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const handleSelectExamPreset = (presetIndex: number) => {
    if (SAMPLE_EXAM_PACKAGES[presetIndex]) {
      setCurrentExamPackage(SAMPLE_EXAM_PACKAGES[presetIndex]);
      setActiveTab('soal');
    }
  };

  const handleLoadExamFromBank = (exam: ExamPackage) => {
    setCurrentExamPackage(exam);
    setActiveTab('soal');
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col font-sans text-[#1a1f2e]">
      {!isLoggedIn ? (
        <PinLoginView
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
      ) : currentUser.role === 'guru' ? (
        <>
          {/* STANDARD TEACHER LAYOUT */}
          {/* Institutional Top Header */}
          <Header
            currentUser={currentUser}
            allUsers={users}
            onSelectUser={handleSelectUser}
            onLogout={handleLogout}
            serverStatus={serverStatus}
          />

          {/* Navigation Tab Bar (no-print) */}
          <div className="no-print">
            <Navigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              userRole={currentUser.role}
            />
          </div>

          {/* Main Container */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                onNavigate={setActiveTab}
                recentExams={exams}
                onSelectExamPreset={handleSelectExamPreset}
                madrasahIdentity={madrasahIdentity}
                users={users}
                docs={docs}
                logs={logs}
              />
            )}

            {activeTab === 'soal' && (
              <ExamGeneratorView
                currentUser={currentUser}
                currentPackage={currentExamPackage}
                onSavePackage={handleSaveExam}
                madrasahIdentity={madrasahIdentity}
              />
            )}

            {activeTab === 'administrasi' && (
              <AdministrationView
                currentUser={currentUser}
                onSaveDocument={handleSaveDoc}
                savedDocs={docs}
                madrasahIdentity={madrasahIdentity}
              />
            )}

            {activeTab === 'identitas_madrasah' && (
              <IdentitasMadrasahView
                identity={madrasahIdentity}
                onUpdateIdentity={handleUpdateMadrasahIdentity}
              />
            )}

            {activeTab === 'bank_soal' && (
              <BankSoalAndHistoryView
                exams={exams}
                documents={docs}
                onLoadExam={handleLoadExamFromBank}
              />
            )}

            {activeTab === 'admin_panel' && (
              <AdminPanelView
                users={users}
                onUpdateUsers={setUsers}
                logs={logs}
                madrasahIdentity={madrasahIdentity}
                onUpdateIdentity={handleUpdateMadrasahIdentity}
                activeSubTab={adminSubTab}
                onChangeSubTab={setAdminSubTab}
              />
            )}
          </main>

          {/* Institutional Footer (no-print) */}
          <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 no-print">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-[#1e4d7b]">
                  MA NU 01 BANYUPUTIH BATANG
                </span>
                <span>•</span>
                <span>Sistem Asesmen & Administrasi Kurikulum Merdeka</span>
              </div>
              <div className="flex items-center space-x-4 text-slate-400">
                <span>Kabupaten Batang · Akreditasi A</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </footer>
        </>
      ) : (
        <>
          {/* MODERN DEDICATED ADMIN SIDEBAR LAYOUT */}
          <div className="flex min-h-screen relative bg-slate-50">
            {/* Desktop Fixed Left Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-slate-950 text-slate-200 border-r border-slate-800 fixed inset-y-0 left-0 z-30 no-print">
              <div className="p-5 border-b border-slate-900 flex items-center space-x-3">
                <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                  <Building2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-xs text-white tracking-widest uppercase">
                    MA NU 01
                  </h2>
                  <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">
                    PANEL ADMINISTRATOR
                  </p>
                </div>
              </div>

              {/* Sidebar Navigation Items */}
              <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6 scrollbar-thin">
                {[
                  {
                    group: 'KONTROL UTAMA',
                    items: [
                      { label: 'Dashboard Utama', tab: 'dashboard' as NavTab, subTab: null, icon: LayoutDashboard },
                      { label: 'Data Mata Pelajaran', tab: 'admin_panel' as NavTab, subTab: 'mapel' as any, icon: BookOpen },
                      { label: 'Data Guru & Plotting', tab: 'admin_panel' as NavTab, subTab: 'guru' as any, icon: Users },
                      { label: 'Identitas Madrasah', tab: 'identitas_madrasah' as NavTab, subTab: null, icon: Building2 },
                    ]
                  },
                  {
                    group: 'MODUL AKADEMIK',
                    items: [
                      { label: 'Generate Soal Ujian', tab: 'soal' as NavTab, subTab: null, icon: PenTool },
                      { label: 'Administrasi Guru', tab: 'administrasi' as NavTab, subTab: null, icon: FileSpreadsheet },
                    ]
                  },
                  {
                    group: 'ARSIP & SISTEM',
                    items: [
                      { label: 'Riwayat Dokumen', tab: 'bank_soal' as NavTab, subTab: null, icon: History },
                      { label: 'Server & Log Akses', tab: 'admin_panel' as NavTab, subTab: 'server' as any, icon: Cpu },
                      { label: 'Pengaturan & Backup', tab: 'admin_panel' as NavTab, subTab: 'pengaturan' as any, icon: Settings },
                    ]
                  }
                ].map((g) => (
                  <div key={g.group} className="space-y-1.5">
                    <span className="px-3.5 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
                      {g.group}
                    </span>
                    <div className="space-y-1">
                      {g.items.map((item) => {
                        const Icon = item.icon;
                        const isTabActive = activeTab === item.tab;
                        const isSubActive = item.subTab ? (activeTab === item.tab && adminSubTab === item.subTab) : true;
                        const isActive = isTabActive && isSubActive;

                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => {
                              setActiveTab(item.tab);
                              if (item.subTab) setAdminSubTab(item.subTab);
                            }}
                            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-950/40 via-[#1e4d7b]/30 to-blue-950/20 text-white border border-slate-800/80 shadow-inner'
                                : 'text-slate-400 hover:text-white hover:bg-slate-900/60 border border-transparent'
                            }`}
                          >
                            {isActive && (
                              <div className="absolute left-0 top-2.5 bottom-2.5 w-1 bg-emerald-400 rounded-r-full"></div>
                            )}
                            <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Sidebar Footer / Current Admin Card */}
              <div className="p-4 border-t border-slate-900 space-y-3">
                <div className="flex items-center space-x-2.5 bg-slate-900/60 p-2.5 rounded-xl border border-slate-900">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-inner">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-white truncate leading-none">
                      {currentUser.name.split(',')[0]}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-extrabold tracking-wider uppercase mt-1">
                      {currentUser.role === 'admin' ? 'Admin Utama' : 'Operator TU'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full py-2 px-3 rounded-xl border border-red-950/60 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all text-xs font-extrabold flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Sistem</span>
                </button>
              </div>
            </aside>

            {/* Mobile Sidebar Overlay Drawer */}
            {mobileSidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-40 flex no-print">
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileSidebarOpen(false)}
                ></div>

                {/* Drawer Menu Body */}
                <aside className="relative flex-1 flex flex-col max-w-[260px] w-full bg-slate-950 text-slate-300 border-r border-slate-800 animate-slide-in">
                  <div className="p-5 border-b border-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span className="font-heading font-extrabold text-xs text-white tracking-widest uppercase">
                        MA NU 01
                      </span>
                    </div>
                    <button
                      onClick={() => setMobileSidebarOpen(false)}
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
                    {[
                      {
                        group: 'KONTROL UTAMA',
                        items: [
                          { label: 'Dashboard Utama', tab: 'dashboard' as NavTab, subTab: null, icon: LayoutDashboard },
                          { label: 'Data Mata Pelajaran', tab: 'admin_panel' as NavTab, subTab: 'mapel' as any, icon: BookOpen },
                          { label: 'Data Guru & Plotting', tab: 'admin_panel' as NavTab, subTab: 'guru' as any, icon: Users },
                          { label: 'Identitas Madrasah', tab: 'identitas_madrasah' as NavTab, subTab: null, icon: Building2 },
                        ]
                      },
                      {
                        group: 'MODUL AKADEMIK',
                        items: [
                          { label: 'Generate Soal Ujian', tab: 'soal' as NavTab, subTab: null, icon: PenTool },
                          { label: 'Administrasi Guru', tab: 'administrasi' as NavTab, subTab: null, icon: FileSpreadsheet },
                        ]
                      },
                      {
                        group: 'ARSIP & SISTEM',
                        items: [
                          { label: 'Riwayat Dokumen', tab: 'bank_soal' as NavTab, subTab: null, icon: History },
                          { label: 'Server & Log Akses', tab: 'admin_panel' as NavTab, subTab: 'server' as any, icon: Cpu },
                          { label: 'Pengaturan & Backup', tab: 'admin_panel' as NavTab, subTab: 'pengaturan' as any, icon: Settings },
                        ]
                      }
                    ].map((g) => (
                      <div key={g.group} className="space-y-1">
                        <span className="px-3.5 text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block">
                          {g.group}
                        </span>
                        <div className="space-y-0.5">
                          {g.items.map((item) => {
                            const Icon = item.icon;
                            const isTabActive = activeTab === item.tab;
                            const isSubActive = item.subTab ? (activeTab === item.tab && adminSubTab === item.subTab) : true;
                            const isActive = isTabActive && isSubActive;

                            return (
                              <button
                                key={item.label}
                                type="button"
                                onClick={() => {
                                  setActiveTab(item.tab);
                                  if (item.subTab) setAdminSubTab(item.subTab);
                                  setMobileSidebarOpen(false);
                                }}
                                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                                  isActive
                                    ? 'bg-gradient-to-r from-emerald-950/40 to-[#1e4d7b]/20 text-white border border-slate-900'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                                }`}
                              >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </nav>

                  <div className="p-4 border-t border-slate-900">
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 px-3 rounded-xl border border-red-950/60 bg-red-950/20 text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-all text-xs font-extrabold flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Sistem</span>
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {/* Desktop / Mobile Main Viewport Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
              {/* Top Mobile Bar & Navigation Header */}
              <header className="bg-white border-b border-slate-200/80 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20 no-print shadow-2xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  
                  {/* Current Section Title */}
                  <div className="hidden sm:block">
                    <span className="text-[10px] text-emerald-700 font-extrabold tracking-wider uppercase">
                      MA NU 01 Banyuputih
                    </span>
                    <h1 className="text-sm font-black text-slate-800 leading-tight">
                      {activeTab === 'dashboard' && 'Dashboard Manajemen Madrasah'}
                      {activeTab === 'soal' && 'Sistem Pembuat Soal Ujian'}
                      {activeTab === 'administrasi' && 'Sistem Dokumen Administrasi Guru'}
                      {activeTab === 'identitas_madrasah' && 'Konfigurasi Profil Satuan Resmi'}
                      {activeTab === 'bank_soal' && 'Riwayat & Bank Arsip Dokumen'}
                      {activeTab === 'admin_panel' && (
                        <>
                          {adminSubTab === 'mapel' && 'Manajemen Kurikulum: Mata Pelajaran'}
                          {adminSubTab === 'guru' && 'Manajemen Sumber Daya: Akun & Plotting Guru'}
                          {adminSubTab === 'server' && 'Manajemen Sistem: Pemantauan Proxmox & Log'}
                          {adminSubTab === 'pengaturan' && 'Pengaturan Administrator, Keamanan & Backup Data'}
                        </>
                      )}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Server Health Status Ring */}
                  <div className="hidden md:flex items-center space-x-2 text-[11px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>Proxmox: Online</span>
                  </div>

                  {/* Profile Indicator */}
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="w-5 h-5 rounded-md bg-[#1e4d7b] text-white flex items-center justify-center text-[10px] font-black">
                      {currentUser.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-slate-700 hidden sm:inline">
                      {currentUser.name.split(',')[0]}
                    </span>
                  </div>
                </div>
              </header>

              {/* Main Contents */}
              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                {activeTab === 'dashboard' && (
                  <DashboardView
                    currentUser={currentUser}
                    onNavigate={(tab) => {
                      if (tab === 'identitas_madrasah') {
                        setActiveTab('identitas_madrasah');
                      } else {
                        setActiveTab(tab);
                      }
                    }}
                    recentExams={exams}
                    onSelectExamPreset={handleSelectExamPreset}
                    madrasahIdentity={madrasahIdentity}
                    users={users}
                    docs={docs}
                    logs={logs}
                  />
                )}

                {activeTab === 'soal' && (
                  <ExamGeneratorView
                    currentUser={currentUser}
                    currentPackage={currentExamPackage}
                    onSavePackage={handleSaveExam}
                    madrasahIdentity={madrasahIdentity}
                  />
                )}

                {activeTab === 'administrasi' && (
                  <AdministrationView
                    currentUser={currentUser}
                    onSaveDocument={handleSaveDoc}
                    savedDocs={docs}
                    madrasahIdentity={madrasahIdentity}
                  />
                )}

                {activeTab === 'identitas_madrasah' && (
                  <IdentitasMadrasahView
                    identity={madrasahIdentity}
                    onUpdateIdentity={handleUpdateMadrasahIdentity}
                  />
                )}

                {activeTab === 'bank_soal' && (
                  <BankSoalAndHistoryView
                    exams={exams}
                    documents={docs}
                    onLoadExam={handleLoadExamFromBank}
                  />
                )}

                {activeTab === 'admin_panel' && (
                  <AdminPanelView
                    users={users}
                    onUpdateUsers={setUsers}
                    logs={logs}
                    madrasahIdentity={madrasahIdentity}
                    onUpdateIdentity={handleUpdateMadrasahIdentity}
                    activeSubTab={adminSubTab}
                    onChangeSubTab={setAdminSubTab}
                    currentUser={currentUser}
                    onUpdateCurrentUser={setCurrentUser}
                    exams={exams}
                    onUpdateExams={setExams}
                    docs={docs}
                    onUpdateDocs={setDocs}
                    onShowToast={showToast}
                  />
                )}
              </main>

              {/* Small Admin Footer */}
              <footer className="bg-white border-t border-slate-200/60 py-4 px-6 text-center text-[10px] text-slate-400 no-print">
                © 2026 MA NU 01 Banyuputih Batang · Sistem Kurikulum Merdeka Terintegrasi Proxmox LXC
              </footer>
            </div>
          </div>
        </>
      )}

      {/* Modern Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4.5 py-3.5 rounded-2xl border shadow-xl animate-slide-in max-w-sm text-xs font-bold transition-all duration-300 ${
              t.type === 'success'
                ? 'bg-slate-900 text-white border-slate-800'
                : t.type === 'error'
                ? 'bg-rose-950 text-rose-200 border-rose-900'
                : 'bg-amber-950 text-amber-200 border-amber-900'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
