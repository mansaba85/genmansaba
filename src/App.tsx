import React, { useState, useEffect } from 'react';
import { User, ExamPackage, GeneratedAdminDoc, LoginLog, MadrasahIdentity, AdminSubTab } from './types';
import {
  INITIAL_USERS,
  INITIAL_LOGIN_LOGS,
  SAMPLE_EXAM_PACKAGES,
  SAMPLE_ADMIN_DOCS,
  MADRASAH_IDENTITY,
} from './data/mockAndPresets';
import {
  fetchServerData,
  syncToServer,
  saveExamToServer,
  saveDocToServer,
  appendLogToServer,
} from './services/storageService';
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

  // Fetch centralized server database on initial load
  useEffect(() => {
    fetchServerData().then((serverData) => {
      if (serverData) {
        if (serverData.users && serverData.users.length > 0) {
          setUsers(serverData.users);
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(serverData.users));
          setCurrentUser((curr) => {
            const found = serverData.users.find((u) => u.id === curr.id);
            return found || curr;
          });
        }
        if (serverData.madrasahIdentity) {
          setMadrasahIdentity(serverData.madrasahIdentity);
          localStorage.setItem(STORAGE_KEY_MADRASAH, JSON.stringify(serverData.madrasahIdentity));
        }
        if (Array.isArray(serverData.exams) && serverData.exams.length > 0) {
          setExams(serverData.exams);
          setCurrentExamPackage(serverData.exams[0]);
          localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(serverData.exams));
        }
        if (Array.isArray(serverData.docs) && serverData.docs.length > 0) {
          setDocs(serverData.docs);
          localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(serverData.docs));
        }
        if (Array.isArray(serverData.logs) && serverData.logs.length > 0) {
          setLogs(serverData.logs);
        }
      }
    });
  }, []);

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
      ip: 'Tunnel Web Access',
      userAgent: navigator.userAgent.substring(0, 30) + '...',
      action: 'Otorisasi PIN Berhasil',
    };
    setLogs((prev) => [newLog, ...prev]);
    appendLogToServer(newLog);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('manu01_is_logged_in');
    showToast('Berhasil keluar dari sistem.', 'success');
  };

  // Fetch server health on mount
  useEffect(() => {
    fetch('/api/health')
      .then((r) => {
        const ct = r.headers.get('content-type') || '';
        if (r.ok && ct.includes('application/json')) {
          return r.json();
        }
        throw new Error(`Non-JSON health response (${r.status})`);
      })
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

  // Periodic Auto-save sync to server
  useEffect(() => {
    const timer = setInterval(() => {
      syncToServer({
        users,
        madrasahIdentity,
        exams,
        docs,
      });
    }, 30000);
    return () => clearInterval(timer);
  }, [exams, docs, madrasahIdentity, users]);

  const handleUpdateMadrasahIdentity = (newIdentity: MadrasahIdentity) => {
    setMadrasahIdentity(newIdentity);
    localStorage.setItem(STORAGE_KEY_MADRASAH, JSON.stringify(newIdentity));
    syncToServer({ madrasahIdentity: newIdentity });
  };

  const handleUpdateUsers = (newUsersOrUpdater: any) => {
    setUsers((prev) => {
      const updated = typeof newUsersOrUpdater === 'function' ? newUsersOrUpdater(prev) : newUsersOrUpdater;
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
      syncToServer({ users: updated });
      return updated;
    });
  };

  const handleUpdateExams = (newExamsOrUpdater: any) => {
    setExams((prev) => {
      const updated = typeof newExamsOrUpdater === 'function' ? newExamsOrUpdater(prev) : newExamsOrUpdater;
      localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(updated));
      syncToServer({ exams: updated });
      return updated;
    });
  };

  const handleUpdateDocs = (newDocsOrUpdater: any) => {
    setDocs((prev) => {
      const updated = typeof newDocsOrUpdater === 'function' ? newDocsOrUpdater(prev) : newDocsOrUpdater;
      localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(updated));
      syncToServer({ docs: updated });
      return updated;
    });
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
      saveExamToServer(updatedPkg);
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
      saveDocToServer(newDoc);
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
      ip: 'Tunnel Web Access',
      timestamp: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WIB',
      userAgent: navigator.userAgent.slice(0, 30),
      action: 'Beralih Profil Pengguna',
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 19)]);
    appendLogToServer(newLog);
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
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-[#0f172a] pb-14 md:pb-0">
      {!isLoggedIn ? (
        <PinLoginView
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onShowToast={showToast}
        />
      ) : (
        <>
          {/* Unified Topbar (Header + Desktop Navigation) */}
          <Header
            currentUser={currentUser}
            allUsers={users}
            onSelectUser={handleSelectUser}
            onLogout={handleLogout}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            serverStatus={serverStatus}
          />

          {/* Mobile 4-Item Bottom Navigation */}
          <Navigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            userRole={currentUser.role}
          />

          {/* Unified Main Container (max-w-7xl across all pages) */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                currentUser={currentUser}
                onNavigate={setActiveTab}
                recentExams={exams}
                onSelectExamPreset={handleSelectExamPreset}
                onLoadExam={handleLoadExamFromBank}
                madrasahIdentity={madrasahIdentity}
                users={users}
                docs={docs}
                logs={logs}
                serverStatus={serverStatus}
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

          {/* Clean Institutional Footer (no-print) */}
          <footer className="bg-[#03482d] text-emerald-100/90 border-t border-white/15 py-5 text-xs no-print mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-white tracking-wide">
                  MA NU 01 BANYUPUTIH BATANG
                </span>
                <span className="text-emerald-400/50">·</span>
                <span className="text-emerald-100/80">Sistem Asesmen CBT & Administrasi Kurikulum Merdeka</span>
              </div>
              <div className="flex items-center space-x-3 text-emerald-200/80 font-medium">
                <span>LP Ma'arif NU Kab. Batang</span>
                <span className="text-emerald-400/50">·</span>
                <span className="text-amber-300 font-semibold">Terakreditasi A (Unggul)</span>
              </div>
            </div>
          </footer>
        </>
      )}

      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-3 rounded-[16px] border shadow-md max-w-sm text-xs font-bold transition-all duration-200 ${
              t.type === 'success'
                ? 'bg-[#045f3b] text-white border-[#03482d]'
                : t.type === 'error'
                ? 'bg-rose-800 text-white border-rose-900'
                : 'bg-amber-600 text-slate-950 border-amber-700'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />}
            {t.type === 'warning' && <AlertTriangle className="w-4 h-4 text-slate-950 shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
