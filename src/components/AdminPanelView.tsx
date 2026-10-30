import React, { useState, useEffect, useRef } from 'react';
import { User, LoginLog, MadrasahIdentity, AdminSubTab, SystemBackupData, ExamPackage, GeneratedAdminDoc } from '../types';
import { LogoMadrasahSvg } from './KopMadrasah';
import {
  ShieldCheck,
  Server,
  Users,
  Activity,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Key,
  Clock,
  Cpu,
  HardDrive,
  RefreshCw,
  BookOpen,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Edit2,
  Check,
  X,
  Mail,
  Building2,
  MapPin,
  Globe,
  Phone,
  UserCheck,
  Hash,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Upload,
  Camera,
  Download,
  FileSpreadsheet,
  FileText,
  FileDown,
  FileUp,
  Sparkles,
  Layers,
  Table,
  CheckCheck,
  Copy,
  FolderDown,
  Database,
  Lock,
  ShieldAlert,
  KeyRound,
  RotateCcw,
  Terminal,
  FileCode,
  HardDriveDownload,
  UploadCloud,
  DownloadCloud,
  Boxes,
  AlertCircle,
} from 'lucide-react';

// PRESET TEMPLATES FOR MATA PELAJARAN
export const PRESET_MAPEL_TEMPLATES = {
  kemenag_lengkap: {
    id: 'kemenag_lengkap',
    name: 'Standar MA Kurikulum Merdeka (Lengkap 21 Mapel)',
    tag: 'Rekomendasi Utama Kemenag & LP Ma\'arif NU',
    description: 'Rumpun PAI, Bahasa Arab, Mata Pelajaran Umum, Pilihan Sains/Soshum, dan Muatan Lokal Aswaja.',
    mapels: [
      'Al-Qur\'an Hadits',
      'Akidah Akhlak',
      'Fiqih',
      'Sejarah Kebudayaan Islam (SKI)',
      'Bahasa Arab',
      'Bahasa Indonesia',
      'Matematika',
      'Bahasa Inggris',
      'Pendidikan Pancasila (PPKn)',
      'Sejarah',
      'Fisika',
      'Kimia',
      'Biologi',
      'Informatika',
      'Ekonomi',
      'Sosiologi',
      'Geografi',
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Seni Budaya',
      'Prakarya dan Kewirausahaan (PKWU)',
      'Aswaja / Ke-NU-an',
    ],
  },
  pai_arab: {
    id: 'pai_arab',
    name: 'Kelompok PAI & Bahasa Arab (Kemenag)',
    tag: 'Rumpun Keagamaan',
    description: 'Fokus rumpun mata pelajaran agama Islam dan pendalaman literasi bahasa Arab.',
    mapels: [
      'Al-Qur\'an Hadits',
      'Akidah Akhlak',
      'Fiqih',
      'Sejarah Kebudayaan Islam (SKI)',
      'Bahasa Arab',
      'Ushul Fiqih',
      'Ilmu Tafsir',
      'Ilmu Hadits',
      'Bahasa Arab Peminatan',
      'Aswaja / Ke-NU-an',
    ],
  },
  mipa_sains: {
    id: 'mipa_sains',
    name: 'Kelompok Peminatan MIPA / Sains',
    tag: 'Rumpun Sains & Teknologi',
    description: 'Fokus rumpun ilmu alam, matematika tingkat lanjut, dan informatika.',
    mapels: [
      'Matematika',
      'Matematika Tingkat Lanjut',
      'Fisika',
      'Kimia',
      'Biologi',
      'Informatika',
      'Riset & Karya Ilmiah Remaja (KIR)',
    ],
  },
  ips_soshum: {
    id: 'ips_soshum',
    name: 'Kelompok Peminatan IPS / Humaniora',
    tag: 'Rumpun Sosial Humaniora',
    description: 'Fokus bidang ekonomi, sosiologi, geografi, dan kajian kemasyarakatan.',
    mapels: [
      'Ekonomi',
      'Sosiologi',
      'Geografi',
      'Sejarah Tingkat Lanjut',
      'Antropologi',
      'Prakarya dan Kewirausahaan (PKWU)',
    ],
  },
};

// PRESET TEMPLATES FOR GURU
export const PRESET_GURU_TEMPLATES = {
  standar_manu01: {
    id: 'standar_manu01',
    name: 'Template Dewan Guru MA NU 01 Banyuputih (Standar Rumpun)',
    tag: 'Lengkap dengan Plotting & PIN Akses',
    description: 'Susunan tenaga pendidik berdasar rumpun mapel resmi LP Ma\'arif NU Kab. Batang.',
    gurus: [
      {
        name: 'Bpk. Hariyanto, S.Pd.',
        nip: '198604122011011008',
        role: 'guru' as const,
        mapel: ['Matematika', 'Fisika'],
        pin: '123456',
      },
      {
        name: 'Ibu Siti Fatimah, S.Ag.',
        nip: '198208152009122004',
        role: 'guru' as const,
        mapel: ['Fiqih', 'Al-Qur\'an Hadits', 'Bahasa Arab'],
        pin: '654321',
      },
      {
        name: 'Bpk. M. Zainal Arifin, S.Pd.I.',
        nip: '198903142015041003',
        role: 'guru' as const,
        mapel: ['Akidah Akhlak', 'Sejarah Kebudayaan Islam (SKI)', 'Aswaja / Ke-NU-an'],
        pin: '223344',
      },
      {
        name: 'Ibu Dra. Hj. Umi Kulsum, M.Pd.',
        nip: '197510202003122002',
        role: 'guru' as const,
        mapel: ['Bahasa Indonesia', 'Seni Budaya'],
        pin: '334455',
      },
      {
        name: 'Bpk. Ahmad Fauzi, S.Pd., M.Si.',
        nip: '198805092014021004',
        role: 'guru' as const,
        mapel: ['Kimia', 'Biologi'],
        pin: '445566',
      },
      {
        name: 'Ibu Rina Lestari, S.Pd.',
        nip: '199107192019032018',
        role: 'guru' as const,
        mapel: ['Bahasa Inggris'],
        pin: '556677',
      },
      {
        name: 'Bpk. Joko Susilo, S.E., M.M.',
        nip: '198302172010011012',
        role: 'guru' as const,
        mapel: ['Ekonomi', 'Sosiologi', 'Prakarya dan Kewirausahaan (PKWU)'],
        pin: '778899',
      },
      {
        name: 'Bpk. Hendra Gunawan, S.Kom.',
        nip: '199406122020121006',
        role: 'guru' as const,
        mapel: ['Informatika'],
        pin: '889900',
      },
      {
        name: 'Admin',
        nip: '-',
        role: 'admin' as const,
        mapel: ['Informatika'],
        pin: '888888',
      },
      {
        name: 'Ibu Nur Hidayah, A.Md.',
        nip: '199311052019032015',
        role: 'operator' as const,
        mapel: ['Tata Usaha & Distribusi Dokumen'],
        pin: '111111',
      },
    ],
  },
};

interface AdminPanelViewProps {
  users: User[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<User[]>>;
  logs: LoginLog[];
  madrasahIdentity: MadrasahIdentity;
  onUpdateIdentity: (identity: MadrasahIdentity) => void;
  activeSubTab?: AdminSubTab;
  onChangeSubTab?: (subTab: AdminSubTab) => void;
  currentUser?: User;
  onUpdateCurrentUser?: (user: User) => void;
  exams?: ExamPackage[];
  onUpdateExams?: React.Dispatch<React.SetStateAction<ExamPackage[]>>;
  docs?: GeneratedAdminDoc[];
  onUpdateDocs?: React.Dispatch<React.SetStateAction<GeneratedAdminDoc[]>>;
  onShowToast?: (msg: string, type?: 'success' | 'error' | 'warning') => void;
}

export const AdminPanelView: React.FC<AdminPanelViewProps> = ({
  users,
  onUpdateUsers,
  logs,
  madrasahIdentity,
  onUpdateIdentity,
  activeSubTab,
  onChangeSubTab,
  currentUser,
  onUpdateCurrentUser,
  exams = [],
  onUpdateExams,
  docs = [],
  onUpdateDocs,
  onShowToast,
}) => {
  // Local active sub-tab state if external is not supplied
  const [localSubTab, setLocalSubTab] = useState<AdminSubTab>('mapel');
  const subTab = activeSubTab !== undefined ? activeSubTab : localSubTab;
  const setSubTab = onChangeSubTab !== undefined ? onChangeSubTab : setLocalSubTab;

  // Find Admin Account
  const adminAccount = users.find((u) => u.role === 'admin') || users[0] || {
    id: 'user-admin',
    name: 'Administrator MA NU 01',
    nip: '-',
    role: 'admin' as const,
    mapel: ['Informatika'],
    pin: '888888',
  };

  // Admin Account & Password Edit Form State
  const [adminFormName, setAdminFormName] = useState(adminAccount.name);
  const [adminFormCurrentPin, setAdminFormCurrentPin] = useState('');
  const [adminFormNewPin, setAdminFormNewPin] = useState('');
  const [adminFormConfirmPin, setAdminFormConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [adminSaveMessage, setAdminSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (adminAccount) {
      setAdminFormName(adminAccount.name);
    }
  }, [adminAccount.id, adminAccount.name]);

  // Backup & Restore System State
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [parsedBackupData, setParsedBackupData] = useState<SystemBackupData | null>(null);
  const [restoreFeedback, setRestoreFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Factory Reset State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetError, setResetError] = useState('');

  // Proxmox & Portainer Docker Guide Modal
  const [showDockerModal, setShowDockerModal] = useState(false);
  const [dockerGuideTab, setDockerGuideTab] = useState<'compose' | 'dockerfile' | 'env' | 'proxmox'>('compose');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Subjects (Mata Pelajaran) State
  const [mapelList, setMapelList] = useState<string[]>(() => {
    const saved = localStorage.getItem('manu01_admin_mapel_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      'Fiqih',
      'Al-Qur\'an Hadits',
      'Akidah Akhlak',
      'Sejarah Kebudayaan Islam (SKI)',
      'Bahasa Arab',
      'Matematika',
      'Bahasa Indonesia',
      'Bahasa Inggris',
      'Fisika',
      'Kimia',
      'Biologi',
      'Informatika',
      'Sejarah',
      'Pendidikan Pancasila (PPKn)',
      'Ekonomi',
      'Sosiologi',
      'Kewirausahaan (PKWU)',
    ];
  });

  useEffect(() => {
    localStorage.setItem('manu01_admin_mapel_list', JSON.stringify(mapelList));
  }, [mapelList]);

  // Input States
  const [newMapelName, setNewMapelName] = useState('');
  const [mapelSuccess, setMapelSuccess] = useState('');
  const [mapelError, setMapelError] = useState('');

  // Modals / Editors
  const [showAddGuruModal, setShowAddGuruModal] = useState(false);
  const [showAddMapelModal, setShowAddMapelModal] = useState(false);
  const [editingGuruId, setEditingGuruId] = useState<string | null>(null);

  // New Guru form states
  const [newGuruName, setNewGuruName] = useState('');
  const [newGuruNip, setNewGuruNip] = useState('');
  const [newGuruRole, setNewGuruRole] = useState<'guru' | 'admin' | 'operator'>('guru');
  const [newGuruPin, setNewGuruPin] = useState('');
  const [newGuruMapel, setNewGuruMapel] = useState<string[]>([]);

  // Edit Guru form states
  const [editGuruName, setEditGuruName] = useState('');
  const [editGuruNip, setEditGuruNip] = useState('');
  const [editGuruRole, setEditGuruRole] = useState<'guru' | 'admin' | 'operator'>('guru');
  const [editGuruPin, setEditGuruPin] = useState('');
  const [editGuruMapel, setEditGuruMapel] = useState<string[]>([]);

  // School settings form states
  const [schoolForm, setSchoolForm] = useState<MadrasahIdentity>({ ...madrasahIdentity });
  const [schoolSaveSuccess, setSchoolSaveSuccess] = useState(false);

  // Template & Import Modals State
  const [showPresetMapelModal, setShowPresetMapelModal] = useState(false);
  const [showImportMapelModal, setShowImportMapelModal] = useState(false);
  const [mapelImportText, setMapelImportText] = useState('');
  const [mapelImportMode, setMapelImportMode] = useState<'merge' | 'replace'>('merge');
  const [mapelImportFeedback, setMapelImportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const mapelFileInputRef = useRef<HTMLInputElement>(null);

  const [showPresetGuruModal, setShowPresetGuruModal] = useState(false);
  const [showImportGuruModal, setShowImportGuruModal] = useState(false);
  const [guruImportText, setGuruImportText] = useState('');
  const [guruImportMode, setGuruImportMode] = useState<'merge' | 'replace'>('merge');
  const [guruImportFeedback, setGuruImportFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const guruFileInputRef = useRef<HTMLInputElement>(null);

  // CSV Trigger Download Helper
  const triggerFileDownload = (content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') => {
    const blob = new Blob(['\uFEFF' + content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Mapel Template Downloaders & Presets
  const handleDownloadTemplateMapel = () => {
    const csvContent = [
      '# TEMPLATE IMPORT DATA MATA PELAJARAN MA NU 01 BANYUPUTIH',
      '# Panduan: Masukkan satu nama mata pelajaran per baris',
      'Nama Mata Pelajaran',
      'Al-Qur\'an Hadits',
      'Akidah Akhlak',
      'Fiqih',
      'Sejarah Kebudayaan Islam (SKI)',
      'Bahasa Arab',
      'Bahasa Indonesia',
      'Matematika',
      'Bahasa Inggris',
      'Pendidikan Pancasila (PPKn)',
      'Fisika',
      'Kimia',
      'Biologi',
      'Informatika',
      'Ekonomi',
      'Sosiologi',
      'Geografi',
      'Pendidikan Jasmani, Olahraga, dan Kesehatan (PJOK)',
      'Seni Budaya',
      'Prakarya dan Kewirausahaan (PKWU)',
      'Aswaja / Ke-NU-an',
    ].join('\n');
    triggerFileDownload(csvContent, 'template_mata_pelajaran.csv');
  };

  const handleExportMapel = () => {
    const lines = ['Nama Mata Pelajaran', ...mapelList];
    triggerFileDownload(lines.join('\n'), `data_mapel_manu01_${Date.now()}.csv`);
  };

  const handleApplyMapelPreset = (presetKey: keyof typeof PRESET_MAPEL_TEMPLATES, mode: 'merge' | 'replace' = 'merge') => {
    const preset = PRESET_MAPEL_TEMPLATES[presetKey];
    if (!preset) return;

    if (mode === 'replace') {
      if (confirm(`Ganti seluruh daftar mata pelajaran dengan template "${preset.name}"?`)) {
        setMapelList([...preset.mapels]);
        setShowPresetMapelModal(false);
      }
    } else {
      // Merge unique
      const merged = Array.from(new Set([...mapelList, ...preset.mapels]));
      setMapelList(merged);
      setShowPresetMapelModal(false);
    }
  };

  const handleProcessImportMapel = () => {
    setMapelImportFeedback(null);
    if (!mapelImportText.trim()) {
      setMapelImportFeedback({ type: 'error', text: 'Silakan tempel atau upload data terlebih dahulu.' });
      return;
    }

    const lines = mapelImportText
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^["']|["']$/g, ''))
      .filter((l) => l.length > 0 && !l.startsWith('#') && l.toLowerCase() !== 'nama mata pelajaran');

    if (lines.length === 0) {
      setMapelImportFeedback({ type: 'error', text: 'Tidak ada baris mata pelajaran yang valid ditemukan.' });
      return;
    }

    if (mapelImportMode === 'replace') {
      const uniqueList = Array.from(new Set(lines));
      setMapelList(uniqueList);
      setMapelImportFeedback({
        type: 'success',
        text: `Berhasil mengganti daftar dengan ${uniqueList.length} mata pelajaran.`,
      });
    } else {
      const merged = Array.from(new Set([...mapelList, ...lines]));
      const addedCount = merged.length - mapelList.length;
      setMapelList(merged);
      setMapelImportFeedback({
        type: 'success',
        text: `Berhasil menambahkan ${addedCount} mata pelajaran baru (Total sekarang: ${merged.length}).`,
      });
    }

    setTimeout(() => {
      setShowImportMapelModal(false);
      setMapelImportText('');
      setMapelImportFeedback(null);
    }, 1200);
  };

  const handleMapelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMapelImportText(content);
    };
    reader.readAsText(file);
  };

  // 2. Guru Template Downloaders & Presets
  const handleDownloadTemplateGuru = () => {
    const csvContent = [
      '# TEMPLATE IMPORT DATA GURU & PLOTTING MAPEL MA NU 01 BANYUPUTIH',
      '# Panduan: Pisahkan mata pelajaran dengan titik koma (;), Hak Akses pilih (guru / operator / admin), PIN harus 6 digit angka',
      'Nama Lengkap,NIP/NUPTK,Hak Akses,Mata Pelajaran,PIN Akses',
      '"Bpk. Hariyanto, S.Pd.","198604122011011008","guru","Matematika; Fisika","123456"',
      '"Ibu Siti Fatimah, S.Ag.","198208152009122004","guru","Fiqih; Al-Qur\'an Hadits; Bahasa Arab","654321"',
      '"Bpk. M. Zainal Arifin, S.Pd.I.","198903142015041003","guru","Akidah Akhlak; Sejarah Kebudayaan Islam (SKI); Aswaja / Ke-NU-an","223344"',
      '"Ibu Dra. Hj. Umi Kulsum, M.Pd.","197510202003122002","guru","Bahasa Indonesia; Seni Budaya","334455"',
      '"Admin","-","admin","Informatika","888888"',
      '"Ibu Nur Hidayah, A.Md.","199311052019032015","operator","Tata Usaha & Distribusi Dokumen","111111"',
    ].join('\n');
    triggerFileDownload(csvContent, 'template_data_guru.csv');
  };

  const handleExportGuru = () => {
    const header = 'Nama Lengkap,NIP/NUPTK,Hak Akses,Mata Pelajaran,PIN Akses';
    const rows = users.map((u) => {
      const mapelsStr = (u.mapel || []).join('; ');
      return `"${u.name.replace(/"/g, '""')}","${u.nip || '-'}","${u.role}","${mapelsStr.replace(/"/g, '""')}","${u.pin || '123456'}"`;
    });
    const csvContent = [header, ...rows].join('\n');
    triggerFileDownload(csvContent, `data_guru_manu01_${Date.now()}.csv`);
  };

  const handleApplyGuruPreset = (mode: 'merge' | 'replace' = 'merge') => {
    const preset = PRESET_GURU_TEMPLATES.standar_manu01;
    const presetUsers: User[] = preset.gurus.map((g, idx) => ({
      id: `user-preset-${idx}-${Date.now()}`,
      name: g.name,
      nip: g.nip,
      role: g.role,
      mapel: g.mapel,
      pin: g.pin,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(g.name)}`,
      lastLogin: 'Template Preset',
    }));

    if (mode === 'replace') {
      if (confirm('Ganti seluruh daftar tenaga pendidik dengan Template Standar MA NU 01 Banyuputih?')) {
        onUpdateUsers(presetUsers);
        setShowPresetGuruModal(false);
      }
    } else {
      // Merge unique by name
      onUpdateUsers((prev) => {
        const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
        const toAdd = presetUsers.filter((p) => !existingNames.has(p.name.toLowerCase()));
        return [...prev, ...toAdd];
      });
      setShowPresetGuruModal(false);
    }
  };

  const handleProcessImportGuru = () => {
    setGuruImportFeedback(null);
    if (!guruImportText.trim()) {
      setGuruImportFeedback({ type: 'error', text: 'Silakan masukkan teks data CSV atau upload file.' });
      return;
    }

    try {
      const lines = guruImportText.split(/\r?\n/).filter((l) => l.trim().length > 0 && !l.startsWith('#'));
      if (lines.length === 0) {
        setGuruImportFeedback({ type: 'error', text: 'Format data kosong.' });
        return;
      }

      // Simple CSV splitter
      const parsedGurus: User[] = [];
      for (const line of lines) {
        // Skip header if present
        if (line.toLowerCase().includes('nama lengkap') && line.toLowerCase().includes('nip')) continue;

        // Parse line respecting quotes
        const match = line.match(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g);
        if (!match || match.length < 1) continue;

        const cols = match.map((c) =>
          c.replace(/^,/, '').trim().replace(/^"|"$/g, '').replace(/""/g, '"')
        );

        const name = cols[0]?.trim();
        if (!name) continue;

        const nip = cols[1]?.trim() || '-';
        let role = (cols[2]?.trim().toLowerCase() as 'guru' | 'admin' | 'operator') || 'guru';
        if (!['guru', 'admin', 'operator'].includes(role)) role = 'guru';

        const mapelRaw = cols[3]?.trim() || 'Umum';
        const mapels = mapelRaw
          .split(/[;,]/)
          .map((m) => m.trim())
          .filter((m) => m.length > 0);

        const pin = cols[4]?.trim() || '123456';

        parsedGurus.push({
          id: `user-import-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name,
          nip,
          role,
          mapel: mapels.length > 0 ? mapels : ['Umum'],
          pin,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          lastLogin: 'Baru diimport',
        });
      }

      if (parsedGurus.length === 0) {
        setGuruImportFeedback({ type: 'error', text: 'Tidak ada baris data guru yang berhasil dibaca. Pastikan format sesuai template.' });
        return;
      }

      if (guruImportMode === 'replace') {
        onUpdateUsers(parsedGurus);
        setGuruImportFeedback({ type: 'success', text: `Berhasil mengganti data dengan ${parsedGurus.length} guru.` });
      } else {
        onUpdateUsers((prev) => {
          const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
          const toAdd = parsedGurus.filter((p) => !existingNames.has(p.name.toLowerCase()));
          return [...prev, ...toAdd];
        });
        setGuruImportFeedback({ type: 'success', text: `Berhasil mengimpor data ${parsedGurus.length} guru.` });
      }

      setTimeout(() => {
        setShowImportGuruModal(false);
        setGuruImportText('');
        setGuruImportFeedback(null);
      }, 1200);
    } catch (err: any) {
      setGuruImportFeedback({ type: 'error', text: err?.message || 'Gagal memproses data CSV guru.' });
    }
  };

  const handleGuruFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setGuruImportText(content);
    };
    reader.readAsText(file);
  };

  // 9router Connection Test States
  const [isTesting9Router, setIsTesting9Router] = useState(false);
  const [test9RouterResult, setTest9RouterResult] = useState<{
    connected?: boolean;
    endpoint?: string;
    model?: string;
    latencyMs?: number;
    responseSample?: string;
    discoveredModels?: string[];
    message?: string;
    tip?: string;
    errorRaw?: string;
  } | null>(null);

  const handleTest9Router = async () => {
    setIsTesting9Router(true);
    setTest9RouterResult(null);
    try {
      const res = await fetch('/api/v1/ninerouter/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        const isHtmlFallback = text.trim().toLowerCase().startsWith('<!doctype html') || text.includes('<html');
        if (isHtmlFallback) {
          throw new Error(
            `Server mengembalikan halaman HTML (index.html), bukan JSON API. Artinya container/server yang sedang Anda akses masih menjalankan build versi lama (sebelum endpoint /api/v1/ninerouter/test ada) atau berjalan sebagai static server tanpa backend Express (dist/server.cjs). Solusi di Portainer/Docker: lakukan Rebuild / Pull ulang container (docker compose up -d --build).`
          );
        }
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 120)}`);
      }
      const data = await res.json();
      setTest9RouterResult(data);
    } catch (err: any) {
      setTest9RouterResult({
        connected: false,
        message: 'Gagal mengirim permintaan tes ke backend server.',
        tip: err?.message || 'Pastikan backend Express (server.ts / dist/server.cjs) berjalan.',
      });
    } finally {
      setIsTesting9Router(false);
    }
  };

  // Synchronize school form when madrasahIdentity prop changes
  useEffect(() => {
    setSchoolForm({ ...madrasahIdentity });
  }, [madrasahIdentity]);

  // Revealed PIN state mapper (key is userId, value is boolean)
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});

  // Sorting States
  const [sortMapelField, setSortMapelField] = useState<'name' | 'teachers'>('name');
  const [sortMapelDirection, setSortMapelDirection] = useState<'asc' | 'desc'>('asc');

  const [sortGuruField, setSortGuruField] = useState<'name' | 'nip' | 'role' | 'mapelCount'>('name');
  const [sortGuruDirection, setSortGuruDirection] = useState<'asc' | 'desc'>('asc');

  const handleSortMapel = (field: 'name' | 'teachers') => {
    if (sortMapelField === field) {
      setSortMapelDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortMapelField(field);
      setSortMapelDirection('asc');
    }
  };

  const handleSortGuru = (field: 'name' | 'nip' | 'role' | 'mapelCount') => {
    if (sortGuruField === field) {
      setSortGuruDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortGuruField(field);
      setSortGuruDirection('asc');
    }
  };

  // Helper to count teachers for a subject
  const getMapelTeacherCount = (subjectName: string) => {
    return users.filter((u) => u.mapel.includes(subjectName)).length;
  };

  // 1. Mata Pelajaran Handlers
  const handleAddMapel = (e: React.FormEvent) => {
    e.preventDefault();
    setMapelSuccess('');
    setMapelError('');

    const formattedName = newMapelName.trim();
    if (!formattedName) return;

    if (mapelList.some((m) => m.toLowerCase() === formattedName.toLowerCase())) {
      setMapelError('Mata pelajaran tersebut sudah terdaftar.');
      return;
    }

    setMapelList((prev) => [...prev, formattedName]);
    setNewMapelName('');
    setMapelSuccess(`Mata pelajaran "${formattedName}" berhasil ditambahkan!`);
    setTimeout(() => {
      setMapelSuccess('');
      setShowAddMapelModal(false);
    }, 1200);
  };

  const handleDeleteMapel = (mapel: string) => {
    const isAssigned = users.some((u) => u.mapel.includes(mapel));
    if (isAssigned) {
      alert(`Mata pelajaran "${mapel}" tidak dapat dihapus karena masih digunakan / di-plot pada guru pengampu.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus mata pelajaran "${mapel}"?`)) {
      setMapelList((prev) => prev.filter((m) => m !== mapel));
    }
  };

  // 2. Guru Handlers
  const togglePinReveal = (userId: string) => {
    setRevealedPins((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenAddGuru = () => {
    setNewGuruName('');
    setNewGuruNip('');
    setNewGuruRole('guru');
    setNewGuruPin(Math.floor(100000 + Math.random() * 900000).toString()); // Random 6 digit
    setNewGuruMapel([]);
    setShowAddGuruModal(true);
  };

  const handleAddGuruMapelCheckbox = (mapel: string) => {
    setNewGuruMapel((prev) =>
      prev.includes(mapel) ? prev.filter((m) => m !== mapel) : [...prev, mapel]
    );
  };

  const handleCreateGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuruName.trim()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newGuruName.trim(),
      nip: newGuruNip.trim() || '-',
      role: newGuruRole,
      mapel: newGuruMapel.length > 0 ? newGuruMapel : ['Umum'],
      pin: newGuruPin.trim() || '123456',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(newGuruName)}`,
      lastLogin: 'Baru dibuat',
    };

    onUpdateUsers((prev) => [...prev, newUser]);
    setShowAddGuruModal(false);
  };

  const handleOpenEditGuru = (u: User) => {
    setEditingGuruId(u.id);
    setEditGuruName(u.name);
    setEditGuruNip(u.nip);
    setEditGuruRole(u.role);
    setEditGuruPin(u.pin || '123456');
    setEditGuruMapel(u.mapel || []);
  };

  const handleEditGuruMapelCheckbox = (mapel: string) => {
    setEditGuruMapel((prev) =>
      prev.includes(mapel) ? prev.filter((m) => m !== mapel) : [...prev, mapel]
    );
  };

  const handleSaveEditGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuruId) return;

    onUpdateUsers((prev) =>
      prev.map((u) => {
        if (u.id === editingGuruId) {
          return {
            ...u,
            name: editGuruName.trim(),
            nip: editGuruNip.trim() || '-',
            role: editGuruRole,
            pin: editGuruPin.trim() || '123456',
            mapel: editGuruMapel.length > 0 ? editGuruMapel : ['Umum'],
          };
        }
        return u;
      })
    );

    setEditingGuruId(null);
  };

  const handleDeleteGuru = (userId: string, userName: string) => {
    if (users.length <= 1) {
      alert('Sistem harus menyisakan minimal satu akun pengelola aktif.');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus akun pengampu "${userName}" secara permanen? Tindakan ini tidak dapat dibatalkan.`)) {
      onUpdateUsers((prev) => prev.filter((u) => u.id !== userId));
    }
  };

  // 3. School Settings Handler
  const handleSaveSchoolSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateIdentity(schoolForm);
    setSchoolSaveSuccess(true);
    setTimeout(() => setSchoolSaveSuccess(false), 4000);
  };

  // 4. Admin Account & Security Handlers
  const handleUpdateAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSaveMessage(null);

    if (!adminFormName.trim()) {
      setAdminSaveMessage({ type: 'error', text: 'Nama admin tidak boleh kosong.' });
      return;
    }

    let updatedPin = adminAccount.pin || '888888';

    // If changing PIN/password
    if (adminFormNewPin.trim() || adminFormCurrentPin.trim()) {
      if (adminFormCurrentPin.trim() !== (adminAccount.pin || '888888')) {
        setAdminSaveMessage({ type: 'error', text: 'PIN / Password lama yang Anda masukkan tidak sesuai.' });
        return;
      }
      if (adminFormNewPin.trim().length < 4) {
        setAdminSaveMessage({ type: 'error', text: 'PIN baru minimal harus 4 digit angka/karakter.' });
        return;
      }
      if (adminFormNewPin.trim() !== adminFormConfirmPin.trim()) {
        setAdminSaveMessage({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok dengan PIN baru.' });
        return;
      }
      updatedPin = adminFormNewPin.trim();
    }

    const updatedAdmin: User = {
      ...adminAccount,
      name: adminFormName.trim(),
      pin: updatedPin,
    };

    onUpdateUsers((prev) =>
      prev.map((u) => (u.id === adminAccount.id || u.role === 'admin' ? updatedAdmin : u))
    );

    if (currentUser && (currentUser.id === adminAccount.id || currentUser.role === 'admin')) {
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedAdmin);
      }
      localStorage.setItem('manu01_active_user_v1', JSON.stringify(updatedAdmin));
    }

    setAdminFormCurrentPin('');
    setAdminFormNewPin('');
    setAdminFormConfirmPin('');
    setAdminSaveMessage({ type: 'success', text: 'Profil & Kredensial Administrator berhasil diperbarui!' });
    if (onShowToast) {
      onShowToast('Kredensial Admin & PIN berhasil disimpan!', 'success');
    }
    setTimeout(() => setAdminSaveMessage(null), 4000);
  };

  // 5. Full System Backup (JSON Snapshot)
  const handleGenerateFullBackup = () => {
    try {
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const formattedDate = now.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const backupData: SystemBackupData = {
        version: '1.0.0',
        backupDate: formattedDate,
        platform: 'Sistem Asesmen & Administrasi Guru MA NU 01 Banyuputih',
        madrasahName: madrasahIdentity.nama,
        totalUsers: users.length,
        totalMapel: mapelList.length,
        totalExams: exams.length,
        totalDocs: docs.length,
        data: {
          users,
          madrasahIdentity,
          mapelList,
          exams,
          docs,
          logs,
        },
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const filename = `backup_manu01_banyuputih_${dateStr}.json`;
      triggerFileDownload(jsonStr, filename, 'application/json');

      if (onShowToast) {
        onShowToast(`Backup sistem (${users.length} akun, ${exams.length} soal, ${docs.length} dokumen) berhasil diunduh!`, 'success');
      }
    } catch (err: any) {
      alert(`Gagal membuat file backup: ${err.message}`);
    }
  };

  // 6. Restore Backup from JSON File
  const handleBackupFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed: SystemBackupData = JSON.parse(content);

        // Validation of backup file integrity
        if (!parsed.data || (!parsed.data.users && !parsed.data.madrasahIdentity)) {
          alert('File yang dipilih bukan format backup sistem yang valid.');
          return;
        }

        setParsedBackupData(parsed);
        setRestoreFeedback(null);
        setShowRestoreModal(true);
      } catch (err: any) {
        alert('Gagal membaca file backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const handleExecuteRestore = () => {
    if (!parsedBackupData || !parsedBackupData.data) return;

    setIsRestoring(true);
    setRestoreFeedback(null);

    try {
      const { users: bUsers, madrasahIdentity: bIdentity, mapelList: bMapel, exams: bExams, docs: bDocs } = parsedBackupData.data;

      if (restoreMode === 'replace') {
        // Replace all
        if (Array.isArray(bUsers) && bUsers.length > 0) {
          onUpdateUsers(bUsers);
          localStorage.setItem('manu01_users_v2', JSON.stringify(bUsers));
        }
        if (bIdentity && bIdentity.nama) {
          onUpdateIdentity(bIdentity);
          localStorage.setItem('manu01_madrasah_identity_v1', JSON.stringify(bIdentity));
        }
        if (Array.isArray(bMapel) && bMapel.length > 0) {
          setMapelList(bMapel);
          localStorage.setItem('manu01_admin_mapel_list', JSON.stringify(bMapel));
        }
        if (Array.isArray(bExams) && onUpdateExams) {
          onUpdateExams(bExams);
          localStorage.setItem('manu01_exams_v1', JSON.stringify(bExams));
        }
        if (Array.isArray(bDocs) && onUpdateDocs) {
          onUpdateDocs(bDocs);
          localStorage.setItem('manu01_docs_v1', JSON.stringify(bDocs));
        }
      } else {
        // Merge mode
        if (Array.isArray(bUsers)) {
          onUpdateUsers((prev) => {
            const existingIds = new Set(prev.map((u) => u.id));
            const existingNames = new Set(prev.map((u) => u.name.toLowerCase()));
            const toAdd = bUsers.filter((u) => !existingIds.has(u.id) && !existingNames.has(u.name.toLowerCase()));
            const merged = [...prev, ...toAdd];
            localStorage.setItem('manu01_users_v2', JSON.stringify(merged));
            return merged;
          });
        }
        if (Array.isArray(bMapel)) {
          setMapelList((prev) => {
            const merged = Array.from(new Set([...prev, ...bMapel]));
            localStorage.setItem('manu01_admin_mapel_list', JSON.stringify(merged));
            return merged;
          });
        }
        if (Array.isArray(bExams) && onUpdateExams) {
          onUpdateExams((prev: ExamPackage[]) => {
            const existingIds = new Set(prev.map((e: ExamPackage) => e.id));
            const toAdd = bExams.filter((e: ExamPackage) => !existingIds.has(e.id));
            const merged = [...toAdd, ...prev];
            localStorage.setItem('manu01_exams_v1', JSON.stringify(merged));
            return merged;
          });
        }
        if (Array.isArray(bDocs) && onUpdateDocs) {
          onUpdateDocs((prev: GeneratedAdminDoc[]) => {
            const existingIds = new Set(prev.map((d: GeneratedAdminDoc) => d.id));
            const toAdd = bDocs.filter((d: GeneratedAdminDoc) => !existingIds.has(d.id));
            const merged = [...toAdd, ...prev];
            localStorage.setItem('manu01_docs_v1', JSON.stringify(merged));
            return merged;
          });
        }
      }

      setRestoreFeedback({
        type: 'success',
        text: `Sistem berhasil dipulihkan dari snapshot (${parsedBackupData.backupDate || 'File Backup'})!`,
      });

      if (onShowToast) {
        onShowToast('Data berhasil dipulihkan sepenuhnya!', 'success');
      }

      setTimeout(() => {
        setIsRestoring(false);
        setShowRestoreModal(false);
        setParsedBackupData(null);
      }, 1400);
    } catch (err: any) {
      setIsRestoring(false);
      setRestoreFeedback({
        type: 'error',
        text: 'Terjadi kesalahan saat memulihkan data: ' + err.message,
      });
    }
  };

  // 7. Factory Reset System
  const handleExecuteFactoryReset = () => {
    if (resetConfirmText.trim() !== 'RESET') {
      setResetError('Ketik kata "RESET" dengan huruf kapital untuk mengonfirmasi.');
      return;
    }

    try {
      localStorage.removeItem('manu01_admin_mapel_list');
      localStorage.removeItem('manu01_exams_v1');
      localStorage.removeItem('manu01_docs_v1');
      localStorage.removeItem('manu01_users_v2');
      localStorage.removeItem('manu01_madrasah_identity_v1');

      const defaultMapels = PRESET_MAPEL_TEMPLATES.kemenag_lengkap.mapels;
      setMapelList(defaultMapels);

      setShowResetModal(false);
      setResetConfirmText('');
      setResetError('');

      if (onShowToast) {
        onShowToast('Sistem telah di-reset ke konfigurasi awal standar madrasah.', 'warning');
      }

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      setResetError('Gagal melakukan reset: ' + err.message);
    }
  };

  // Sorting Indicators Helpers
  const renderSortIndicator = (field: 'name' | 'teachers') => {
    if (sortMapelField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1 shrink-0" />;
    }
    return sortMapelDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-800 ml-1 shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-800 ml-1 shrink-0" />
    );
  };

  const renderGuruSortIndicator = (field: 'name' | 'nip' | 'role' | 'mapelCount') => {
    if (sortGuruField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-400 ml-1 shrink-0" />;
    }
    return sortGuruDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-emerald-800 ml-1 shrink-0" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-emerald-800 ml-1 shrink-0" />
    );
  };

  // Sorted on the fly
  const sortedMapelList = [...mapelList].sort((a, b) => {
    if (sortMapelField === 'name') {
      const comp = a.localeCompare(b, 'id', { sensitivity: 'base' });
      return sortMapelDirection === 'asc' ? comp : -comp;
    } else if (sortMapelField === 'teachers') {
      const countA = getMapelTeacherCount(a);
      const countB = getMapelTeacherCount(b);
      return sortMapelDirection === 'asc' ? countA - countB : countB - countA;
    }
    return 0;
  });

  const sortedUsersList = [...users].sort((a, b) => {
    let comp = 0;
    if (sortGuruField === 'name') {
      comp = a.name.localeCompare(b.name, 'id', { sensitivity: 'base' });
    } else if (sortGuruField === 'nip') {
      const nipA = a.nip || '';
      const nipB = b.nip || '';
      comp = nipA.localeCompare(nipB, 'id', { sensitivity: 'base' });
    } else if (sortGuruField === 'role') {
      comp = a.role.localeCompare(b.role, 'id', { sensitivity: 'base' });
    } else if (sortGuruField === 'mapelCount') {
      comp = (a.mapel || []).length - (b.mapel || []).length;
    }
    return sortGuruDirection === 'asc' ? comp : -comp;
  });

  return (
    <div className="space-y-6">
      {/* Admin Panel Quick Sub-Tabs Nav */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-1.5 overflow-x-auto no-scrollbar no-print">
        {[
          { id: 'mapel' as AdminSubTab, label: 'Mata Pelajaran', icon: BookOpen, count: mapelList.length },
          { id: 'guru' as AdminSubTab, label: 'Data Guru & Plotting', icon: Users, count: users.length },
          { id: 'server' as AdminSubTab, label: 'Server & AI Gateway', icon: Cpu },
          { id: 'pengaturan' as AdminSubTab, label: 'Pengaturan & Backup', icon: Settings },
        ].map((tabItem) => {
          const Icon = tabItem.icon;
          const isActive = subTab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setSubTab(tabItem.id)}
              className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 touch-manipulation ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tabItem.label}</span>
              {tabItem.count !== undefined && (
                <span className={`text-[11px] font-mono tabular-nums ${
                  isActive ? 'text-white/80' : 'text-slate-400'
                }`}>
                  ({tabItem.count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: DATA MAPEL */}
      {subTab === 'mapel' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action & Template Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#1e4d7b]">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Manajemen Mata Pelajaran & Kurikulum
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Gunakan template standar Kemenag / LP Ma'arif NU, impor file CSV, atau unduh format template untuk pengisian massal.
                </p>
              </div>

              {/* Template & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplateMapel}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Unduh file template CSV untuk diisi di Excel"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMapelImportText('');
                    setMapelImportFeedback(null);
                    setShowImportMapelModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Impor mata pelajaran dari file atau teks CSV"
                >
                  <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import dari File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresetMapelModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 shadow-2xs transition cursor-pointer"
                  title="Pilih template preset kurikulum standar"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Template Preset</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportMapel}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Ekspor seluruh mata pelajaran aktif ke CSV"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewMapelName('');
                    setMapelSuccess('');
                    setMapelError('');
                    setShowAddMapelModal(true);
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1e4d7b] hover:bg-[#153a5e] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Mapel</span>
                </button>
              </div>
            </div>
          </div>

          {/* List Mapel Grid Full Width */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-[#1e4d7b]" />
                <h2 className="font-heading font-semibold text-xs sm:text-sm text-slate-900">
                  Daftar Mata Pelajaran Aktif ({mapelList.length} Mapel)
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold text-[#1e4d7b] bg-blue-50/80 border border-blue-100/50 px-2.5 py-1 rounded-md">
                  Status: Siap Digunakan
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 w-16 text-center">No</th>
                    <th 
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition"
                      onClick={() => handleSortMapel('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nama Mata Pelajaran</span>
                        {renderSortIndicator('name')}
                      </div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition"
                      onClick={() => handleSortMapel('teachers')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Jumlah Guru Pengampu</span>
                        {renderSortIndicator('teachers')}
                      </div>
                    </th>
                    <th className="p-4 text-right w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedMapelList.map((mapel, index) => {
                    const teacherCount = getMapelTeacherCount(mapel);
                    return (
                      <tr key={mapel} className="hover:bg-slate-50/40 transition">
                        <td className="p-4 text-center font-mono text-slate-400 font-bold">
                          {index + 1}
                        </td>
                        <td className="p-4 font-bold text-slate-800 text-xs sm:text-sm">
                          {mapel}
                        </td>
                        <td className="p-4">
                          {teacherCount > 0 ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100/60">
                              Diampu oleh {teacherCount} Guru
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-400 border border-slate-100">
                              Belum ada guru pengampu
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteMapel(mapel)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                            title="Hapus Mata Pelajaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {sortedMapelList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        Tidak ada mata pelajaran aktif.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: DATA GURU & PLOTTING */}
      {subTab === 'guru' && (
        <div className="space-y-6 animate-fade-in">
          {/* Action & Template Bar */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Users className="w-4 h-4" />
                  </span>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Manajemen Tenaga Pendidik & Plotting Mapel
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kelola penugasan mata pelajaran, PIN login mandiri, gunakan template data guru MA NU 01, atau impor massal via file Excel/CSV.
                </p>
              </div>

              {/* Template & Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadTemplateGuru}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Unduh format template CSV data guru untuk diisi di Excel"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Download Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGuruImportText('');
                    setGuruImportFeedback(null);
                    setShowImportGuruModal(true);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Impor data guru secara massal dari file CSV"
                >
                  <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Import dari File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPresetGuruModal(true)}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-2xs transition cursor-pointer"
                  title="Terapkan template dewan guru standar madrasah"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Template Guru</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportGuru}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 shadow-2xs transition cursor-pointer"
                  title="Ekspor seluruh akun guru aktif beserta PIN ke file CSV"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-600" />
                  <span>Ekspor CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenAddGuru}
                  className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-[#1e4d7b] hover:bg-[#153a5e] text-white text-xs font-semibold transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Guru</span>
                </button>
              </div>
            </div>
          </div>

          {/* Guru Data Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th 
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition"
                      onClick={() => handleSortGuru('name')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Nama Lengkap & NIP</span>
                        {renderGuruSortIndicator('name')}
                      </div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition"
                      onClick={() => handleSortGuru('role')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Hak Akses</span>
                        {renderGuruSortIndicator('role')}
                      </div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer select-none hover:bg-slate-100 hover:text-slate-800 transition"
                      onClick={() => handleSortGuru('mapelCount')}
                    >
                      <div className="flex items-center space-x-1">
                        <span>Plotting Mata Pelajaran</span>
                        {renderGuruSortIndicator('mapelCount')}
                      </div>
                    </th>
                    <th className="p-4">PIN Login</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedUsersList.map((u) => {
                    const isPinVisible = !!revealedPins[u.id];
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/40 transition">
                        <td className="p-4">
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`}
                              alt={u.name}
                              className="w-8 h-8 rounded-full border border-slate-100 object-cover"
                            />
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                NIP/NUPTK: {u.nip}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'guru'
                                ? 'bg-blue-100 text-[#1e4d7b]'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {u.mapel.map((mapel) => (
                              <span
                                key={mapel}
                                className="inline-block bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-medium border border-slate-200/40"
                              >
                                {mapel}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4 font-mono">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-slate-800">
                              {isPinVisible ? u.pin || '123456' : '••••••'}
                            </span>
                            <button
                              onClick={() => togglePinReveal(u.id)}
                              className="p-1 rounded text-slate-400 hover:text-[#1e4d7b] cursor-pointer"
                              title={isPinVisible ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                            >
                              {isPinVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenEditGuru(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#1e4d7b] hover:bg-slate-100 cursor-pointer"
                              title="Edit Profil & Plotting"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteGuru(u.id, u.name)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Hapus Akun"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 3: IDENTITAS MADRASAH */}
      {subTab === 'identitas' && (
        <form onSubmit={handleSaveSchoolSettings} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-heading font-bold text-slate-900 text-base">
              Identitas & Parameter Resmi Sekolah
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data yang dikonfigurasi di sini akan disinkronkan langsung pada Kop Surat resmi madrasah, RPP, Prota, Prosem, dan naskah ujian.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Bagian 1: Identitas Pokok */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-[#1e4d7b] border-b border-slate-100 pb-1.5 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>1. Identitas Pokok & Logo</span>
              </h3>

              {/* Logo Preview & Upload */}
              <div className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex items-center space-x-3">
                <div className="w-14 h-14 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
                  {schoolForm.logoUrl ? (
                    <img src={schoolForm.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <LogoMadrasahSvg className="w-10 h-10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold text-slate-800">
                    {schoolForm.logoUrl ? 'Logo Kustom Terpasang' : 'Logo Resmi MA NU'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <label className="inline-flex items-center space-x-1 px-2 py-1 rounded bg-[#1e4d7b] text-white text-[10px] font-semibold cursor-pointer hover:bg-[#153a5e] transition">
                      <Upload className="w-2.5 h-2.5" />
                      <span>Ganti Logo</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const result = event.target?.result as string;
                              if (result) {
                                setSchoolForm((prev) => ({ ...prev, logoUrl: result }));
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    {schoolForm.logoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setSchoolForm((prev) => {
                            const updated = { ...prev };
                            delete updated.logoUrl;
                            return updated;
                          });
                        }}
                        className="px-2 py-1 rounded bg-slate-200 text-slate-700 hover:text-red-600 text-[10px] font-semibold transition"
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Yayasan / Badan Penyelenggara (KOP)</label>
                <input
                  type="text"
                  value={schoolForm.yayasan || ''}
                  onChange={(e) => setSchoolForm({ ...schoolForm, yayasan: e.target.value.toUpperCase() })}
                  placeholder="YAYASAN LP MA'ARIF NU KABUPATEN BATANG"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Madrasah Lengkap</label>
                <input
                  type="text"
                  required
                  value={schoolForm.nama}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nama: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Singkatan / Sebutan Nama</label>
                  <input
                    type="text"
                    required
                    value={schoolForm.singkatan}
                    onChange={(e) => setSchoolForm({ ...schoolForm, singkatan: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Akreditasi</label>
                  <input
                    type="text"
                    value={schoolForm.akreditasi || ''}
                    onChange={(e) => setSchoolForm({ ...schoolForm, akreditasi: e.target.value })}
                    placeholder="TERAKREDITASI A (UNGGUL)"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN / Nomor Statistik</label>
                <input
                  type="text"
                  required
                  value={schoolForm.npsn}
                  onChange={(e) => setSchoolForm({ ...schoolForm, npsn: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                />
              </div>
            </div>

            {/* Bagian 2: Kontak & Media */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-[#1e4d7b] border-b border-slate-100 pb-1.5 flex items-center space-x-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>2. Kontak & Lokasi</span>
              </h3>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Lembaga</label>
                <input
                  type="text"
                  required
                  value={schoolForm.alamat}
                  onChange={(e) => setSchoolForm({ ...schoolForm, alamat: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  required
                  value={schoolForm.kabupaten}
                  onChange={(e) => setSchoolForm({ ...schoolForm, kabupaten: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telepon Madrasah</label>
                <input
                  type="text"
                  value={schoolForm.telepon}
                  onChange={(e) => setSchoolForm({ ...schoolForm, telepon: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Website</label>
                  <input
                    type="text"
                    value={schoolForm.website}
                    onChange={(e) => setSchoolForm({ ...schoolForm, website: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Kurikulum & Kepemimpinan */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-[#1e4d7b] border-b border-slate-100 pb-1.5 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5" />
                <span>3. Kalender & Kepemimpinan</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                  <input
                    type="text"
                    required
                    value={schoolForm.tahunAjaran}
                    onChange={(e) => setSchoolForm({ ...schoolForm, tahunAjaran: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester Aktif</label>
                  <select
                    value={schoolForm.semester}
                    onChange={(e) => setSchoolForm({ ...schoolForm, semester: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Ganjil">Ganjil (Gasal)</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mode Jadwal KBM</label>
                <input
                  type="text"
                  required
                  value={schoolForm.modeJadwal}
                  onChange={(e) => setSchoolForm({ ...schoolForm, modeJadwal: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Madrasah & Gelar</label>
                <input
                  type="text"
                  required
                  value={schoolForm.kepalaMadrasah}
                  onChange={(e) => setSchoolForm({ ...schoolForm, kepalaMadrasah: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Madrasah</label>
                <input
                  type="text"
                  required
                  value={schoolForm.nipKepala}
                  onChange={(e) => setSchoolForm({ ...schoolForm, nipKepala: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              {schoolSaveSuccess && (
                <span className="text-emerald-700 text-xs font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Identitas Madrasah berhasil disimpan & disinkronkan!</span>
                </span>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-semibold text-xs rounded-lg transition-all duration-150 flex items-center space-x-1.5 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Perubahan Identitas</span>
            </button>
          </div>
        </form>
      )}

      {/* SUBTAB 4: SERVER MONITORING & LOGS */}
      {subTab === 'server' && (
        <div className="space-y-6">
          {/* Proxmox CT & Infrastructure Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Proxmox CT (LXC 104)</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Running
                </span>
              </div>
              <div className="font-heading font-bold text-lg text-slate-900">
                9router API Gateway
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Uptime: 99.98%</span>
                <span>Latency: 42ms</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">AI Orchestration Layer</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  Combo Router Active
                </span>
              </div>
              <div className="font-heading font-bold text-lg text-slate-900">
                9router Combo Model
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Routing: Dynamic Fallback & Multi-Provider</span>
                <span>Tier: Proxmox High-Throughput</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-medium">Keamanan & Autentikasi</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                  JWT Protected
                </span>
              </div>
              <div className="font-heading font-bold text-lg text-slate-900">
                RBAC (Admin, Guru, TU)
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Token Expiry: 8 Jam</span>
                <span>Refresh: 7 Hari</span>
              </div>
            </div>
          </div>

          {/* 9router Gateway Connectivity Diagnostic & Live Test Box */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl border border-slate-700/80 p-5 text-white shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Uji Diagnostik Koneksi 9router (Combo Model)</span>
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Kirim tes payload langsung ke endpoint 9router untuk memverifikasi API Key, status gateway, model <code className="bg-slate-800 text-emerald-300 px-1.5 py-0.5 rounded text-[11px]">komboku</code>, dan waktu respon (latensi).
                </p>
              </div>

              <button
                type="button"
                onClick={handleTest9Router}
                disabled={isTesting9Router}
                className="shrink-0 inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting9Router ? 'animate-spin' : ''}`} />
                <span>{isTesting9Router ? 'Menguji Koneksi...' : 'Tes Koneksi Sekarang'}</span>
              </button>
            </div>

            {/* Test Result Display */}
            {test9RouterResult && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 animate-in fade-in slide-in-from-top-2 ${
                  test9RouterResult.connected
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/50 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center space-x-2">
                    {test9RouterResult.connected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <span>
                      {test9RouterResult.connected
                        ? 'BERHASIL TERHUBUNG KE 9ROUTER!'
                        : 'KONEKSI GAGAL ATAU BELUM TERHUBUNG'}
                    </span>
                  </div>
                  {test9RouterResult.latencyMs !== undefined && (
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/40 text-slate-300">
                      Latensi: {test9RouterResult.latencyMs} ms
                    </span>
                  )}
                </div>

                <p className="text-slate-200 text-xs">{test9RouterResult.message}</p>

                {test9RouterResult.responseSample && (
                  <div className="bg-black/50 p-2.5 rounded-lg border border-white/10 font-mono text-[11px] text-emerald-300">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans mb-0.5">Respon Uji dari Model:</span>
                    "{test9RouterResult.responseSample}"
                  </div>
                )}

                {test9RouterResult.discoveredModels && test9RouterResult.discoveredModels.length > 0 && (
                  <div className="bg-black/40 p-2.5 rounded-lg border border-white/10 space-y-1.5">
                    <span className="text-slate-300 block text-[10px] uppercase font-sans font-bold">
                      Daftar Model Ditemukan di 9router Anda:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {test9RouterResult.discoveredModels.map((m) => (
                        <span
                          key={m}
                          className="px-2 py-0.5 rounded bg-blue-900/60 border border-blue-400/40 text-blue-200 font-mono text-[10px]"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {test9RouterResult.errorRaw && (
                  <div className="bg-black/60 p-2.5 rounded-lg border border-red-500/30 font-mono text-[11px] text-red-300">
                    <span className="text-slate-400 block text-[10px] uppercase font-sans mb-0.5">Pesan Detail dari Server 9router:</span>
                    {test9RouterResult.errorRaw}
                  </div>
                )}

                {test9RouterResult.tip && (
                  <div className="text-[11px] text-slate-300 pt-1 border-t border-white/10">
                    💡 <strong>Petunjuk:</strong> {test9RouterResult.tip}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Audit Log Table (AUTH-05) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center space-x-2 bg-slate-50/50">
              <Activity className="w-4 h-4 text-[#1e4d7b]" />
              <h2 className="font-heading font-semibold text-sm text-slate-900">
                Log Aktivitas & Audit Keamanan Sistem (AUTH-05)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                  <tr>
                    <th className="p-3">Waktu (WIB)</th>
                    <th className="p-3">Pengguna</th>
                    <th className="p-3">IP Address (Proxmox LAN)</th>
                    <th className="p-3">Klien / User Agent</th>
                    <th className="p-3">Aksi Terakhir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px] text-slate-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 text-slate-500">{log.timestamp}</td>
                      <td className="p-3 font-sans font-medium text-slate-900">{log.userName}</td>
                      <td className="p-3 text-blue-700">{log.ip}</td>
                      <td className="p-3 text-slate-500">{log.userAgent}</td>
                      <td className="p-3 font-sans text-slate-800">{log.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 5: PENGATURAN ADMIN, KREDENSIAL, BACKUP & RESTORE */}
      {subTab === 'pengaturan' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-slate-900 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-slate-900 text-base">
                    Pengaturan Administrator, Keamanan, & Pusat Cadangan Data
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola kredensial akun admin, ubah PIN/password login, unduh backup snapshot sistem (.json), pulihkan data, dan lihat panduan deploy ke Proxmox & Portainer.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowDockerModal(true)}
                className="shrink-0 inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition cursor-pointer border border-slate-700"
              >
                <Boxes className="w-4 h-4 text-cyan-400" />
                <span>Panduan Portainer & Proxmox</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KARTU 1: EDIT KREDENSIAL & PASSWORD ADMIN */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
              <div className="p-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-blue-50 text-[#1e4d7b]">
                    <KeyRound className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                      Kredensial & PIN / Password Login Admin
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Perbarui nama akun administrator dan kode PIN / password akses login utama.
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Role: Super Admin
                </span>
              </div>

              <form onSubmit={handleUpdateAdminCredentials} className="p-5 space-y-4 flex-1 flex flex-col justify-between text-xs">
                <div className="space-y-4">
                  {/* Nama Admin */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nama Lengkap Administrator
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={adminFormName}
                        onChange={(e) => setAdminFormName(e.target.value)}
                        placeholder="Nama Lengkap Administrator"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:bg-white focus:border-[#1e4d7b] transition outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Divider PIN */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Ganti PIN / Password Login</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        (Kosongkan jika tidak ingin mengganti PIN)
                      </span>
                    </div>

                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      {/* PIN Saat Ini */}
                      <div>
                        <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                          PIN / Password Saat Ini
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPin ? 'text' : 'password'}
                            value={adminFormCurrentPin}
                            onChange={(e) => setAdminFormCurrentPin(e.target.value)}
                            placeholder="Masukkan PIN aktif saat ini"
                            className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPin(!showCurrentPin)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {/* PIN Baru */}
                        <div>
                          <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                            PIN Baru (Min. 4 Digit)
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPin ? 'text' : 'password'}
                              value={adminFormNewPin}
                              onChange={(e) => setAdminFormNewPin(e.target.value)}
                              placeholder="PIN Baru"
                              className="w-full p-2.5 pr-10 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPin(!showNewPin)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showNewPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Konfirmasi PIN Baru */}
                        <div>
                          <label className="block font-medium text-slate-600 mb-1 text-[11px]">
                            Konfirmasi PIN Baru
                          </label>
                          <input
                            type={showNewPin ? 'text' : 'password'}
                            value={adminFormConfirmPin}
                            onChange={(e) => setAdminFormConfirmPin(e.target.value)}
                            placeholder="Ulangi PIN Baru"
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {adminSaveMessage && (
                    <div
                      className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold animate-fade-in ${
                        adminSaveMessage.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}
                    >
                      {adminSaveMessage.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <span>{adminSaveMessage.text}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    PIN Admin Aktif: <strong className="font-mono text-slate-700">{adminAccount.pin || '888888'}</strong>
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-bold text-xs shadow-md shadow-blue-900/15 transition cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Simpan Kredensial Admin</span>
                  </button>
                </div>
              </form>
            </div>

            {/* KARTU 2: BACKUP & RESTORE PUSAT DATA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div className="p-4.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                    <Database className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-900">
                      Pencadangan & Pemulihan Sistem (Backup & Restore)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ekspor snapshot database lokal ke file JSON atau pulihkan data dari file cadangan.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-5 text-xs">
                {/* Ringkasan Data Aktif Saat Ini */}
                <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2">
                  <div className="font-bold text-slate-700 text-[11px] uppercase tracking-wider flex items-center justify-between">
                    <span>Status Snapshot Data Saat Ini:</span>
                    <span className="text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded text-[10px]">
                      Siap Di-Backup
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="font-heading font-black text-slate-900 text-sm">{users.length}</div>
                      <div className="text-[10px] text-slate-500">Akun Guru & TU</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="font-heading font-black text-slate-900 text-sm">{mapelList.length}</div>
                      <div className="text-[10px] text-slate-500">Mata Pelajaran</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="font-heading font-black text-slate-900 text-sm">{exams.length}</div>
                      <div className="text-[10px] text-slate-500">Paket Soal Ujian</div>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                      <div className="font-heading font-black text-slate-900 text-sm">{docs.length}</div>
                      <div className="text-[10px] text-slate-500">Dokumen Guru</div>
                    </div>
                  </div>
                </div>

                {/* Section Download Backup */}
                <div className="border border-emerald-200/80 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                      <HardDriveDownload className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs">
                        1. Download Cadangan Lengkap (Full Backup Snapshot)
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Menghasilkan 1 file cadangan format JSON berisi seluruh data akun, kurikulum, identitas, bank soal, dan dokumen administrasi guru yang dapat disimpan di komputer/flashdisk.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateFullBackup}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/15 transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>Unduh File Backup Sistem (.JSON)</span>
                  </button>
                </div>

                {/* Section Restore Backup */}
                <div className="border border-blue-200/80 bg-blue-50/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-[#1e4d7b] text-white shrink-0 mt-0.5">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs">
                        2. Pulihkan Data dari File Cadangan (Restore Snapshot)
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Unggah file cadangan <code className="bg-white px-1 py-0.5 rounded text-blue-700 border border-blue-200 font-mono text-[10px]">.json</code> hasil backup sebelumnya untuk memulihkan seluruh data dan konfigurasi madrasah.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={backupFileInputRef}
                    onChange={handleBackupFileUpload}
                    accept=".json,application/json"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => backupFileInputRef.current?.click()}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs transition flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-[#1e4d7b]" />
                    <span>Pilih & Upload File Backup (.JSON)</span>
                  </button>
                </div>
              </div>

              {/* Zona Reset Pabrik */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ingin mengosongkan / mulai dari awal?</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResetConfirmText('');
                    setResetError('');
                    setShowResetModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px] transition cursor-pointer"
                >
                  Factory Reset Sistem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RESTORE BACKUP PREVIEW & CONFIRMATION */}
      {showRestoreModal && parsedBackupData && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-sm">
                    Konfirmasi Pemulihan Data (Restore Snapshot)
                  </h3>
                  <p className="text-xs text-slate-500">
                    File backup valid terdeteksi. Silakan periksa isi snapshot sebelum dipulihkan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Snapshot Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Waktu Pembuatan Backup:</span>
                  <strong className="text-slate-800">{parsedBackupData.backupDate || 'Tidak diketahui'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Nama Madrasah / Satuan:</span>
                  <strong className="text-slate-800">{parsedBackupData.madrasahName || parsedBackupData.data?.madrasahIdentity?.nama || 'MA NU 01 Banyuputih'}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-center text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">
                    {parsedBackupData.data?.users?.length || 0}
                  </span>
                  <span className="text-slate-500 text-[10px]">Akun Guru</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">
                    {parsedBackupData.data?.mapelList?.length || 0}
                  </span>
                  <span className="text-slate-500 text-[10px]">Mapel</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">
                    {parsedBackupData.data?.exams?.length || 0}
                  </span>
                  <span className="text-slate-500 text-[10px]">Paket Soal</span>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-900 block text-sm">
                    {parsedBackupData.data?.docs?.length || 0}
                  </span>
                  <span className="text-slate-500 text-[10px]">Dokumen</span>
                </div>
              </div>
            </div>

            {/* Mode Pemulihan Radio */}
            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-800 block">
                Pilih Mode Pemulihan:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                  restoreMode === 'replace'
                    ? 'bg-blue-50 border-[#1e4d7b] text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="replace"
                    checked={restoreMode === 'replace'}
                    onChange={() => setRestoreMode('replace')}
                    className="mt-0.5 text-[#1e4d7b]"
                  />
                  <div>
                    <span className="font-bold block text-xs">Timpa Total (Clean Replace)</span>
                    <span className="text-[10px] text-slate-500">
                      Ganti seluruh data saat ini secara bersih sesuai file backup.
                    </span>
                  </div>
                </label>

                <label className={`p-3 rounded-xl border flex items-start space-x-2.5 cursor-pointer transition ${
                  restoreMode === 'merge'
                    ? 'bg-blue-50 border-[#1e4d7b] text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}>
                  <input
                    type="radio"
                    name="restoreMode"
                    value="merge"
                    checked={restoreMode === 'merge'}
                    onChange={() => setRestoreMode('merge')}
                    className="mt-0.5 text-[#1e4d7b]"
                  />
                  <div>
                    <span className="font-bold block text-xs">Gabungkan (Merge Data)</span>
                    <span className="text-[10px] text-slate-500">
                      Tambahkan data backup tanpa menghapus data yang ada.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {restoreFeedback && (
              <div
                className={`p-3 rounded-xl border flex items-center space-x-2 text-xs font-semibold ${
                  restoreFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {restoreFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{restoreFeedback.text}</span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 text-xs">
              <button
                type="button"
                disabled={isRestoring}
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isRestoring}
                onClick={handleExecuteRestore}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-700/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memulihkan Data...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Pulihkan Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FACTORY RESET CONFIRMATION */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-red-200 animate-scale-up text-xs">
            <div className="flex items-center space-x-3 pb-3 border-b border-red-100">
              <div className="p-2.5 rounded-xl bg-red-100 text-red-700 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-red-950 text-sm">
                  Konfirmasi Reset Pabrik (Factory Reset)
                </h3>
                <p className="text-[11px] text-red-600">
                  Tindakan ini akan mengembalikan data sistem ke konfigurasi awal standar.
                </p>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-xs">
              Pastikan Anda sudah mengunduh file <strong>Backup (.JSON)</strong> terlebih dahulu jika masih membutuhkan data ujian atau dokumen administrasi sebelumnya.
            </p>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-800 text-[11px]">
                Ketik kata <span className="font-mono text-red-600">RESET</span> untuk mengonfirmasi:
              </label>
              <input
                type="text"
                value={resetConfirmText}
                onChange={(e) => {
                  setResetConfirmText(e.target.value);
                  setResetError('');
                }}
                placeholder="Ketik RESET"
                className="w-full p-2.5 rounded-xl border border-red-300 bg-red-50/40 font-mono text-center font-bold tracking-widest text-slate-900"
              />
            </div>

            {resetError && (
              <div className="text-red-600 text-[11px] font-bold">
                {resetError}
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteFactoryReset}
                disabled={resetConfirmText !== 'RESET'}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold shadow-md shadow-red-700/20 transition cursor-pointer"
              >
                Reset Semua Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PANDUAN DEPLOYMENT PROXMOX & PORTAINER */}
      {showDockerModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 text-slate-200 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-700 animate-scale-up max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/50">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-white text-sm sm:text-base">
                    Panduan Deployment: GitHub ➔ Portainer ➔ Proxmox
                  </h3>
                  <p className="text-xs text-slate-400">
                    Konfigurasi siap pakai untuk deploy stack aplikasi di Proxmox (LXC Container / Docker VM) melalui Portainer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDockerModal(false)}
                className="text-slate-400 hover:text-white font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Guide Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
              {[
                { id: 'compose' as const, label: 'docker-compose.yml' },
                { id: 'env' as const, label: '.env (Environment)' },
                { id: 'dockerfile' as const, label: 'Dockerfile' },
                { id: 'proxmox' as const, label: 'Langkah Deploy Portainer' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setDockerGuideTab(t.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    dockerGuideTab === t.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Guide Content */}
            <div className="flex-1 overflow-y-auto space-y-4 text-xs font-mono pr-1 scrollbar-thin">
              {dockerGuideTab === 'compose' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-sans text-xs">
                    <span>Gunakan konfigurasi berikut pada menu <strong>Portainer ➔ Stacks ➔ Add stack (Web editor)</strong>:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`version: '3.8'

services:
  manu01-merdeka-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: manu01_merdeka_app
    restart: unless-stopped
    ports:
      # Port otomatis: Docker & Portainer otomatis memilihkan port host yang kosong (anti-bentrok)
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OPENAI_BASE_URL=\${OPENAI_BASE_URL:-https://9router.manubanyuputih.id/v1}
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - OPENAI_MODEL=\${OPENAI_MODEL:-komoboku}
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}
    networks:
      - proxmox_lan

networks:
  proxmox_lan:
    driver: bridge`, 'compose')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-sans transition cursor-pointer"
                    >
                      {copiedKey === 'compose' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'compose' ? 'Tersalin!' : 'Salin Compose'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
{`version: '3.8'

services:
  manu01-merdeka-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: manu01_merdeka_app
    restart: unless-stopped
    ports:
      # Port otomatis: Portainer otomatis memberikan port host yang belum terpakai
      - "3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - OPENAI_BASE_URL=\${OPENAI_BASE_URL:-https://9router.manubanyuputih.id/v1}
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - OPENAI_MODEL=\${OPENAI_MODEL:-komoboku}
      - GEMINI_API_KEY=\${GEMINI_API_KEY:-}
    networks:
      - proxmox_lan

networks:
  proxmox_lan:
    driver: bridge`}
                  </pre>
                </div>
              )}

              {dockerGuideTab === 'env' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-sans text-xs">
                    <span>File <strong>.env</strong> di root project atau masukkan pada Environment Variables di Portainer Stack:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`# Port Konfigurasi
PORT=3000
HOST_PORT=3000

# Mode Produksi
NODE_ENV=production

# 9router / OpenAI Gateway (MA NU 01)
OPENAI_BASE_URL=https://9router.manubanyuputih.id/v1
OPENAI_API_KEY=sk-...
OPENAI_MODEL=komoboku

# Gemini Fallback (Opsional)
# GEMINI_API_KEY=AIzaSy...`, 'env')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-sans transition cursor-pointer"
                    >
                      {copiedKey === 'env' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'env' ? 'Tersalin!' : 'Salin .env'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-emerald-300 overflow-x-auto text-[11px] leading-relaxed">
{`# Port Konfigurasi (Bebas disesuaikan agar tidak bentrok)
PORT=3000
HOST_PORT=3000

# Mode Produksi
NODE_ENV=production

# 9router / OpenAI Gateway (MA NU 01)
OPENAI_BASE_URL=https://9router.manubanyuputih.id/v1
OPENAI_API_KEY=sk-...
OPENAI_MODEL=komoboku

# Gemini Fallback (Opsional)
# GEMINI_API_KEY=AIzaSy...`}
                  </pre>
                </div>
              )}

              {dockerGuideTab === 'dockerfile' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-sans text-xs">
                    <span>File <strong>Dockerfile</strong> standar Node 20 LTS multi-stage build:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`, 'dockerfile')}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-sans transition cursor-pointer"
                    >
                      {copiedKey === 'dockerfile' ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'dockerfile' ? 'Tersalin!' : 'Salin Dockerfile'}</span>
                    </button>
                  </div>
                  <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-amber-300 overflow-x-auto text-[11px] leading-relaxed">
{`FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "dist/server.cjs"]`}
                  </pre>
                </div>
              )}

              {dockerGuideTab === 'proxmox' && (
                <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                      <span>Push Project ke GitHub</span>
                    </h4>
                    <p className="text-slate-400">
                      Inisialisasi git pada repository lokal dan push ke GitHub repository pribadi atau organisasi MA NU 01.
                    </p>
                    <code className="block bg-black/60 p-2 rounded text-cyan-300 font-mono text-[11px]">
                      git add .<br/>
                      git commit -m "feat: initial commit ready for proxmox portainer deploy"<br/>
                      git push origin main
                    </code>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
                      <span>Deploy Melalui Portainer di Proxmox</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                      <li>Buka dashboard Portainer Anda (misal <code className="text-white">https://10.10.10.x:9443</code>).</li>
                      <li>Masuk ke menu <strong>Stacks ➔ Add stack</strong>.</li>
                      <li>Pilih metode <strong>Repository</strong> (masukkan URL GitHub repo Anda) atau gunakan <strong>Web editor</strong> dengan menempelkan <code className="text-white">docker-compose.yml</code>.</li>
                      <li>Tambahkan Environment Variable <code className="text-cyan-300">GEMINI_API_KEY</code> pada bagian Environment variables.</li>
                      <li>Klik <strong>Deploy the stack</strong>. Portainer akan otomatis melakukan build dan menjalankan container di port 3000.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDockerModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold font-sans cursor-pointer"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD GURU DIALOG / MODAL */}
      {showAddGuruModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span className="p-1.5 rounded bg-blue-50 text-[#1e4d7b]">
                  <Users className="w-4 h-4" />
                </span>
                <span>Tambah Akun Pengajar Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGuruModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuru} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={newGuruName}
                    onChange={(e) => setNewGuruName(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Dahlan, S.Pd.I."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={newGuruNip}
                    onChange={(e) => setNewGuruNip(e.target.value)}
                    placeholder="Contoh: 198501012015011001"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Akses Peran</label>
                  <select
                    value={newGuruRole}
                    onChange={(e) => setNewGuruRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="guru">Guru Mapel</option>
                    <option value="operator">Operator TU</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Akses Login Mandiri (6-Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={newGuruPin}
                    onChange={(e) => setNewGuruPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-Digit angka login"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-4">
                <span className="block font-semibold text-slate-700 mb-1">
                  Plotting Mata Pelajaran (Ceklis yang Diampu)
                </span>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-2 gap-1.5 scrollbar-thin">
                  {mapelList.map((mapel) => (
                    <label
                      key={mapel}
                      className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={newGuruMapel.includes(mapel)}
                        onChange={() => handleAddGuruMapelCheckbox(mapel)}
                        className="rounded border-slate-300 text-[#1e4d7b] focus:ring-[#1e4d7b]"
                      />
                      <span>{mapel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddGuruModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-medium shadow-2xs cursor-pointer"
                >
                  Buat Akun Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT GURU DIALOG / MODAL */}
      {editingGuruId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span className="p-1.5 rounded bg-blue-50 text-[#1e4d7b]">
                  <Edit2 className="w-4 h-4" />
                </span>
                <span>Edit Profil & Plotting Guru</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingGuruId(null)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditGuru} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={editGuruName}
                    onChange={(e) => setEditGuruName(e.target.value)}
                    placeholder="Contoh: Bpk. Ahmad Dahlan, S.Pd.I."
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP / NUPTK</label>
                  <input
                    type="text"
                    value={editGuruNip}
                    onChange={(e) => setEditGuruNip(e.target.value)}
                    placeholder="Contoh: 198501012015011001"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Akses Peran</label>
                  <select
                    value={editGuruRole}
                    onChange={(e) => setEditGuruRole(e.target.value as any)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="guru">Guru Mapel</option>
                    <option value="operator">Operator TU</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">PIN Akses Login (6-Digit)</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={editGuruPin}
                    onChange={(e) => setEditGuruPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6-Digit angka login"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2 border-l border-slate-100 pl-0 md:pl-4">
                <span className="block font-semibold text-slate-700 mb-1">
                  Plotting Mata Pelajaran (Ceklis yang Diampu)
                </span>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg p-2.5 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-2 gap-1.5 scrollbar-thin">
                  {mapelList.map((mapel) => (
                    <label
                      key={mapel}
                      className="flex items-center space-x-2 p-1.5 rounded hover:bg-slate-100 cursor-pointer text-[11px]"
                    >
                      <input
                        type="checkbox"
                        checked={editGuruMapel.includes(mapel)}
                        onChange={() => handleEditGuruMapelCheckbox(mapel)}
                        className="rounded border-slate-300 text-[#1e4d7b] focus:ring-[#1e4d7b]"
                      />
                      <span>{mapel}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingGuruId(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-medium shadow-2xs cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MAPEL DIALOG / MODAL */}
      {showAddMapelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-sm flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#1e4d7b]">
                  <BookOpen className="w-4 h-4" />
                </span>
                <span>Tambah Mata Pelajaran Baru</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMapelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMapel} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  required
                  value={newMapelName}
                  onChange={(e) => setNewMapelName(e.target.value)}
                  placeholder="Contoh: Akidah Akhlak, Sejarah"
                  className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1e4d7b] bg-slate-50/50"
                />
              </div>

              {mapelSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] border border-emerald-100 flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{mapelSuccess}</span>
                </div>
              )}

              {mapelError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-[11px] border border-red-100 flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{mapelError}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMapelModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-medium shadow-2xs cursor-pointer"
                >
                  Simpan Pelajaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1: PRESET TEMPLATE MAPEL */}
      {showPresetMapelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    Pilihan Template Preset Kurikulum & Mapel
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih paket mata pelajaran standar resmi Kemenag & LP Ma'arif NU
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetMapelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {Object.entries(PRESET_MAPEL_TEMPLATES).map(([key, template]) => (
                <div
                  key={key}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 bg-slate-50/50 hover:bg-purple-50/20 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-heading font-bold text-slate-900 text-sm">
                          {template.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                          {template.tag}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{template.description}</p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApplyMapelPreset(key as any, 'merge')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1e4d7b] bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs transition cursor-pointer"
                        title="Tambahkan mapel ini tanpa menghapus mapel yang sudah ada"
                      >
                        + Gabungkan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyMapelPreset(key as any, 'replace')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 shadow-2xs transition cursor-pointer"
                        title="Ganti seluruh daftar mapel aktif dengan template ini"
                      >
                        Terapkan Penuh
                      </button>
                    </div>
                  </div>

                  {/* List sample tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200/60">
                    {template.mapels.map((m) => (
                      <span
                        key={m}
                        className="text-[10.5px] px-2 py-0.5 rounded-md bg-white border border-slate-200/80 text-slate-700 font-medium"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPresetMapelModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT FILE / TEKS MAPEL */}
      {showImportMapelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Import Data Mata Pelajaran
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportMapelModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* File upload trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Pilih File CSV / TXT</span>
                    <span className="text-[10px] text-slate-400">Atau tempel baris nama mapel di bawah</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={mapelFileInputRef}
                  accept=".csv,.txt"
                  onChange={handleMapelFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => mapelFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs cursor-pointer"
                >
                  Pilih File
                </button>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tempel Daftar Nama Mata Pelajaran (1 baris per mapel):
                </label>
                <textarea
                  rows={6}
                  value={mapelImportText}
                  onChange={(e) => setMapelImportText(e.target.value)}
                  placeholder={`Al-Qur'an Hadits\nAkidah Akhlak\nFiqih\nSejarah Kebudayaan Islam\nBahasa Arab\nMatematika`}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-xs focus:ring-1 focus:ring-[#1e4d7b] focus:outline-none"
                />
              </div>

              {/* Mode Selection */}
              <div className="flex items-center space-x-4 pt-1">
                <span className="font-semibold text-slate-700">Metode Simpan:</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mapelImportMode"
                    value="merge"
                    checked={mapelImportMode === 'merge'}
                    onChange={() => setMapelImportMode('merge')}
                    className="text-[#1e4d7b]"
                  />
                  <span>Gabungkan (Merge)</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mapelImportMode"
                    value="replace"
                    checked={mapelImportMode === 'replace'}
                    onChange={() => setMapelImportMode('replace')}
                    className="text-[#1e4d7b]"
                  />
                  <span>Ganti Seluruhnya (Replace)</span>
                </label>
              </div>

              {mapelImportFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-medium border flex items-center space-x-2 ${
                    mapelImportFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {mapelImportFeedback.type === 'success' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{mapelImportFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportMapelModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessImportMapel}
                  className="px-4 py-2 rounded-xl bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-semibold shadow-2xs cursor-pointer"
                >
                  Simpan Hasil Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRESET TEMPLATE GURU */}
      {showPresetGuruModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    Template Dewan Guru Standar MA NU 01 Banyuputih
                  </h3>
                  <p className="text-xs text-slate-500">
                    Susunan lengkap guru mapel PAI, Sains, Bahasa, Sosial, Ke-NU-an, dan Operator
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPresetGuruModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-heading font-bold text-slate-900 text-sm block">
                    {PRESET_GURU_TEMPLATES.standar_manu01.name}
                  </span>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    {PRESET_GURU_TEMPLATES.standar_manu01.description} (Total: {PRESET_GURU_TEMPLATES.standar_manu01.gurus.length} Akun)
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApplyGuruPreset('merge')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1e4d7b] bg-white hover:bg-blue-50 border border-blue-200 shadow-2xs transition cursor-pointer"
                    title="Tambahkan guru ini ke daftar akun yang sudah ada"
                  >
                    + Gabungkan Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGuruPreset('replace')}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 shadow-2xs transition cursor-pointer"
                    title="Ganti seluruh daftar akun guru dengan template ini"
                  >
                    Terapkan Standar
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Nama Lengkap & NIP</th>
                      <th className="p-3">Hak Akses</th>
                      <th className="p-3">Plotting Mapel</th>
                      <th className="p-3">PIN Akses</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {PRESET_GURU_TEMPLATES.standar_manu01.gurus.map((g, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{g.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">NIP: {g.nip}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                            {g.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {g.mapel.map((m) => (
                              <span key={m} className="px-1.5 py-0.5 rounded bg-blue-50 text-[#1e4d7b] text-[10px] font-medium border border-blue-100">
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3 font-mono font-bold text-slate-700">
                          {g.pin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPresetGuruModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: IMPORT FILE / TEKS GURU */}
      {showImportGuruModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-100 animate-scale-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <FileUp className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm">
                  Import Data Guru & Plotting Mapel (Massal)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowImportGuruModal(false)}
                className="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* File upload trigger */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Pilih File CSV Data Guru</span>
                    <span className="text-[10px] text-slate-400">File CSV hasil ekspor atau format template Excel</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={guruFileInputRef}
                  accept=".csv,.txt"
                  onChange={handleGuruFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => guruFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs shadow-2xs cursor-pointer"
                >
                  Pilih File
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Atau Tempel Baris CSV Data Guru:
                  </label>
                  <button
                    type="button"
                    onClick={handleDownloadTemplateGuru}
                    className="text-[11px] text-[#1e4d7b] hover:underline font-medium flex items-center space-x-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Unduh Format Template</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 font-mono mb-1">
                  Kolom: Nama Lengkap, NIP, Hak Akses (guru/admin/operator), Mata Pelajaran (pisahkan titik koma ;), PIN Akses
                </p>
                <textarea
                  rows={6}
                  value={guruImportText}
                  onChange={(e) => setGuruImportText(e.target.value)}
                  placeholder={`"Bpk. Hariyanto, S.Pd.","198604122011011008","guru","Matematika; Fisika","123456"\n"Ibu Siti Fatimah, S.Ag.","198208152009122004","guru","Fiqih; Al-Qur'an Hadits","654321"`}
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-mono text-xs focus:ring-1 focus:ring-[#1e4d7b] focus:outline-none"
                />
              </div>

              {/* Mode Selection */}
              <div className="flex items-center space-x-4 pt-1">
                <span className="font-semibold text-slate-700">Metode Simpan:</span>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="guruImportMode"
                    value="merge"
                    checked={guruImportMode === 'merge'}
                    onChange={() => setGuruImportMode('merge')}
                    className="text-[#1e4d7b]"
                  />
                  <span>Gabungkan dengan Akun Ada</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="guruImportMode"
                    value="replace"
                    checked={guruImportMode === 'replace'}
                    onChange={() => setGuruImportMode('replace')}
                    className="text-[#1e4d7b]"
                  />
                  <span>Ganti Seluruh Data Guru</span>
                </label>
              </div>

              {guruImportFeedback && (
                <div
                  className={`p-2.5 rounded-xl text-[11px] font-medium border flex items-center space-x-2 ${
                    guruImportFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}
                >
                  {guruImportFeedback.type === 'success' ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  )}
                  <span>{guruImportFeedback.text}</span>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowImportGuruModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleProcessImportGuru}
                  className="px-4 py-2 rounded-xl bg-[#1e4d7b] hover:bg-[#153a5e] text-white font-semibold shadow-2xs cursor-pointer"
                >
                  Simpan Hasil Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
