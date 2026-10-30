export type Role = 'guru' | 'admin' | 'operator';

export interface User {
  id: string;
  name: string;
  nip: string;
  email?: string;
  role: Role;
  mapel: string[];
  avatar?: string;
  lastLogin?: string;
  pin?: string; // PIN akses login
}

export interface LoginLog {
  id: string;
  userId: string;
  userName: string;
  role: Role;
  ip: string;
  timestamp: string;
  userAgent: string;
  action: string;
}

export type ExamType = 'ASTS' | 'ASESGA' | 'ASAS';

export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'short_answer'
  | 'ordering'
  | 'matching'
  | 'essay';

export type DifficultyLevel = 'mudah' | 'sedang' | 'sulit';

export type LanguageOption = 'indonesia' | 'arab' | 'campuran';

export interface OptionItem {
  key: string;
  text: string;
  isRtl?: boolean;
}

export interface OrderingItem {
  id: number;
  text: string;
  isRtl?: boolean;
}

export interface MatchingPremise {
  id: number;
  text: string;
  isRtl?: boolean;
}

export interface MatchingResponse {
  key: string;
  text: string;
  isRtl?: boolean;
}

export interface EssayRubricItem {
  scoreRange: string;
  criteria: string;
}

export interface QuestionItem {
  id: string;
  number: number;
  type: QuestionType;
  text: string;
  hasLatex?: boolean;
  isArabic?: boolean;
  imageUrl?: string;
  imagePrompt?: string;
  options?: OptionItem[];
  orderingItems?: OrderingItem[];
  matchingPremises?: MatchingPremise[];
  matchingResponses?: MatchingResponse[];
  rawRightAnswer: string; // e.g. "RIGHT:A" or "RIGHT:A,B" or "RIGHT:2,1,3,4" or "RIGHT:1-B,2-C"
  essayRubric?: EssayRubricItem[];
  essaySampleAnswer?: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  kompetensiTarget?: string;
}

export interface ExamFormConfig {
  mapel: string;
  kelas: 'X' | 'XI' | 'XII';
  semester: '1' | '2';
  tahunPelajaran: string;
  jenisUjian: ExamType;
  bahasa: LanguageOption;
  capaianPembelajaran: string;
  alokasiWaktuMenit: number;
  selectedTypes: {
    single_choice: number;
    multiple_choice: number;
    short_answer: number;
    ordering: number;
    matching: number;
    essay: number;
  };
  difficultyProportion: {
    mudah: number;
    sedang: number;
    sulit: number;
  };
  includeAnswerKeyInPrint: boolean;
  includeRubricInPrint: boolean;
}

export interface ExamPackage {
  id: string;
  title: string;
  config: ExamFormConfig;
  questions: QuestionItem[];
  createdAt: string;
  createdBy: string;
  nip: string;
}

export interface MadrasahIdentity {
  yayasan?: string;
  nama: string;
  singkatan: string;
  akreditasi?: string;
  alamat: string;
  npsn: string;
  tahunAjaran: string;
  semester: string;
  modeJadwal: string;
  kabupaten: string;
  telepon?: string;
  email?: string;
  website?: string;
  kepalaMadrasah: string;
  nipKepala: string;
  logoUrl?: string;
}

export type AdminDocType =
  | 'rpp'
  | 'cp'
  | 'atp'
  | 'prota'
  | 'prosem'
  | 'prota_prosem'
  | 'kktp'
  | 'modul_ajar'
  | 'umpan_balik'
  | 'presensi_kbm';

export interface AdminDocConfig {
  docType: AdminDocType;
  mapel: string;
  fase: 'E' | 'F';
  kelas: 'X' | 'XI' | 'XII';
  semester: '1' | '2' | '1 & 2';
  tahunPelajaran: string;
  topikMateri: string;
  alokasiWaktu: string;
  guruPengampu: string;
  nipGuru: string;
  kepalaMadrasah: string;
  nipKepala: string;
  nilaiKBC: string[];
  modelPembelajaran: string;
  customNotes?: string;
  capaianPembelajaranTeks?: string;
  instruksiKhusus?: string;
  // RPP Merdeka fields
  karakteristikPesertaDidik?: string;
  dimensiProfilLulusan?: string[];
  jumlahPertemuan?: string;
  jamPerPertemuan?: string;
  jenisAsesmen?: string[];
}

export interface GeneratedAdminDoc {
  id: string;
  type: AdminDocType;
  title: string;
  config: AdminDocConfig;
  contentMarkdown: string;
  structuredSections?: {
    heading: string;
    body: string;
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  createdAt: string;
  createdBy: string;
}

export type AdminSubTab = 'mapel' | 'guru' | 'identitas' | 'server' | 'pengaturan';

export interface SystemBackupData {
  version: string;
  backupDate: string;
  platform: string;
  madrasahName: string;
  totalUsers: number;
  totalMapel: number;
  totalExams: number;
  totalDocs: number;
  data: {
    users: User[];
    madrasahIdentity: MadrasahIdentity;
    mapelList: string[];
    exams: ExamPackage[];
    docs: GeneratedAdminDoc[];
    logs?: LoginLog[];
  };
}
