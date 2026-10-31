import React, { useState, useRef, useEffect } from 'react';
import { AdminDocConfig, AdminDocType, GeneratedAdminDoc, User, MadrasahIdentity } from '../types';
import { exportAdminDocToDocx } from '../utils/docxExport';
import { fetchApiJson } from '../utils/apiClient';
import { AdminMarkdownRenderer } from './AdminMarkdownRenderer';
import { KopMadrasah } from './KopMadrasah';
import { MADRASAH_IDENTITY } from '../data/mockAndPresets';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const PANCA_CINTA_KBC = [
  {
    nilai: 'Cinta kepada Allah dan Rasul-Nya',
    deskripsi: 'Fondasi spiritual yang menempatkan niat belajar serta mengajar sebagai ibadah dan keteladanan akhlak Rasulullah SAW.',
    defaultInsersi: 'Niat thalabul ilmi karena Allah SWT, mengawali KBM dengan doa & tadabbur ayat/hadis terkait materi.',
  },
  {
    nilai: 'Cinta kepada Ilmu Pengetahuan',
    deskripsi: 'Semangat belajar mendalam (Deep Learning) dengan hati terbuka untuk menjadikan ilmu sebagai sarana pencerahan dan kemaslahatan.',
    defaultInsersi: 'Membiasakan tabayyun (verifikasi ilmiah), berpikir kritis-analitis, dan adab menghormati guru serta sumber ilmu.',
  },
  {
    nilai: 'Cinta kepada Diri dan Sesama',
    deskripsi: 'Sikap welas asih (rahmah), menjaga kesehatan mental/fisik, empati, kolaborasi santun, dan ukhuwah tanpa perundungan.',
    defaultInsersi: 'Kerja kelompok kolaboratif saling membantu (ta\'awun), menghargai perbedaan pendapat (tasamuh), dan tutor sebaya.',
  },
  {
    nilai: 'Cinta kepada Lingkungan (Alam)',
    deskripsi: 'Kesadaran ekoteologis bahwa manusia adalah khalifah di bumi yang wajib merawat kelestarian dan kebersihan alam ciptaan Tuhan.',
    defaultInsersi: 'Menjaga kebersihan kelas/madrasah, hemat energi & kertas, serta mengaitkan materi dengan pelestarian ekosistem.',
  },
  {
    nilai: 'Cinta kepada Tanah Air',
    deskripsi: 'Tanggung jawab menjaga persatuan bangsa (ukhuwah wathaniyah), menghormati kearifan lokal, dan berkarya nyata untuk negeri.',
    defaultInsersi: 'Studi kasus kontekstual Indonesia/lokal, menumbuhkan sikap moderat (tawassuth) dan cinta produk/budaya bangsa.',
  },
];

// 8 Dimensi Profil Lulusan (Pembelajaran Mendalam & KMA 1503/2025 + Kepdirjen Pendis 6077/2025)
export const DELAPAN_DIMENSI_PROFIL_LULUSAN = [
  '1. Keimanan & Ketakwaan terhadap Tuhan YME serta Akhlak Mulia',
  '2. Kewargaan (Berkebinekaan & Moderasi Beragama / Tawassuth)',
  '3. Penalaran Kritis',
  '4. Kreativitas',
  '5. Kolaborasi (Gotong Royong)',
  '6. Kemandirian',
  '7. Kesehatan (Jasmani & Mental / Well-being)',
  '8. Komunikasi (Berkeadaban / Ta\'addub)',
];

// 4 Jenis Asesmen KBC (termasuk Asesmen Sikap / Jurnal Anekdotal Karakter KBC)
export const JENIS_ASESMEN_KBC = [
  {
    key: 'Asesmen Diagnostik (Awal Pembelajaran)',
    desc: 'Pemetaan kesiapan awal kognitif, gaya belajar, dan kondisi afektif/kesejahteraan siswa',
  },
  {
    key: 'Asesmen Sikap & Karakter KBC (Jurnal Anekdotal / Observasi Adab)',
    desc: 'Observasi pengamalan Panca Cinta, adab thalabul ilmi, empati, dan catatan kejadian anekdotal',
  },
  {
    key: 'Asesmen Formatif (Proses KBM & LKPD)',
    desc: 'Unjuk kerja diskusi, penyelesaian LKPD, dan umpan balik reflektif selama pembelajaran',
  },
  {
    key: 'Asesmen Sumatif (Akhir Lingkup Materi / TP)',
    desc: 'Tes tertulis / proyek akhir untuk mengukur ketercapaian Tujuan Pembelajaran (KKTP)',
  },
];

interface AdministrationViewProps {
  currentUser: User;
  onSaveDocument: (doc: GeneratedAdminDoc) => void;
  savedDocs: GeneratedAdminDoc[];
  madrasahIdentity?: MadrasahIdentity;
}

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  currentUser,
  onSaveDocument,
  savedDocs,
  madrasahIdentity = MADRASAH_IDENTITY,
}) => {
  const [activeDocType, setActiveDocType] = useState<AdminDocType>('rpp');
  const [config, setConfig] = useState<AdminDocConfig>({
    docType: 'rpp',
    mapel: currentUser.mapel[0] || 'Fiqih',
    fase: 'E',
    kelas: 'X',
    semester: '1',
    tahunPelajaran: madrasahIdentity.tahunAjaran || '2026/2027',
    topikMateri: 'Ketentuan Thaharah dan Kesucian Lahir Batin Berbasis Kasih Sayang',
    alokasiWaktu: '4 JP (2 Pertemuan x 45 Menit)',
    guruPengampu: currentUser.name,
    nipGuru: currentUser.nip,
    kepalaMadrasah: madrasahIdentity.kepalaMadrasah || 'H. Mukhsin, S.Ag., M.Pd.I.',
    nipKepala: madrasahIdentity.nipKepala || '197206151998031002',
    nilaiKBC: [
      'Cinta kepada Allah dan Rasul-Nya',
      'Cinta kepada Ilmu Pengetahuan',
      'Cinta kepada Diri dan Sesama',
    ],
    insersiKBC: {
      'Cinta kepada Allah dan Rasul-Nya':
        'Niat thalabul ilmi karena Allah SWT, mengawali KBM dengan doa & tadabbur ayat/hadis terkait materi.',
      'Cinta kepada Ilmu Pengetahuan':
        'Membiasakan tabayyun (verifikasi ilmiah), berpikir kritis-analitis, dan adab menghormati guru serta sumber ilmu.',
      'Cinta kepada Diri dan Sesama':
        'Kerja kelompok kolaboratif saling membantu (ta\'awun), menghargai perbedaan pendapat (tasamuh), dan tutor sebaya.',
    },
    modelPembelajaran: 'Problem Based Learning (PBL) & Pendekatan Pembelajaran Mendalam (Mindful, Meaningful, Joyful)',
    capaianPembelajaranTeks: '',
    tujuanPembelajaranTeks: '',
    lintasDisiplinIlmu: 'Bahasa Indonesia/Arab (Literasi Teks), Ekologi/Sains (Konteks Alam), Tradisi Aswaja & Moderasi Beragama',
    instruksiKhusus: '',
    karakteristikPesertaDidik:
      'Kemampuan awal heterogen, kecenderungan gaya belajar visual dan kinestetik, santun dan aktif dalam diskusi kelompok.',
    dimensiProfilLulusan: [
      '1. Keimanan & Ketakwaan terhadap Tuhan YME serta Akhlak Mulia',
      '3. Penalaran Kritis',
      '5. Kolaborasi (Gotong Royong)',
      '6. Kemandirian',
      '8. Komunikasi (Berkeadaban / Ta\'addub)',
    ],
    jumlahPertemuan: '2 Pertemuan',
    jamPerPertemuan: '2 JP (2 x 45 menit)',
    jenisAsesmen: [
      'Asesmen Diagnostik (Awal Pembelajaran)',
      'Asesmen Sikap & Karakter KBC (Jurnal Anekdotal / Observasi Adab)',
      'Asesmen Formatif (Proses KBM & LKPD)',
      'Asesmen Sumatif (Akhir Lingkup Materi / TP)',
    ],
    agendaMadrasah:
      'Minggu ke-1 Juli: MATSAMA & Awal Tahun Ajaran; Minggu ke-3 September: ASTS (Asesmen Sumatif Tengah Semester); Minggu ke-1 & 2 Desember: ASESGA/ASAS; Minggu ke-3 Desember: Pengolahan Rapor & Libur Semester.',
    intervalKKTP:
      '0 - 60% (Perlu Bimbingan / Belum Mencapai), 61 - 74% (Cukup / Layak dengan Remedial Terbatas), 75 - 87% (Baik / Cakap & Tuntas), 88 - 100% (Sangat Baik / Mahir & Pengayaan)',
    respondenSurvei: 'Peserta Didik (Refleksi Suasana Kelas Berbasis Cinta)',
    skalaSurvei: 'Skala Likert 1 - 4 (1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Sangat Baik)',
    aspekUmpanBalik:
      'Suasana Kelas Ramah & Penuh Kasih Sayang (Joyful & Welcoming), Kejelasan & Kebermaknaan Materi (Meaningful Learning), Keteladanan Adab & Empati Guru (Panca Cinta KBC), Keadilan & Dukungan Belajar bagi Semua Siswa',
  });

  const handleKelasChange = (newKelas: 'X' | 'XI' | 'XII') => {
    const autoFase: 'E' | 'F' = newKelas === 'X' ? 'E' : 'F';
    setConfig((prev) => ({
      ...prev,
      kelas: newKelas,
      fase: autoFase,
    }));
  };

  const getSampleCPText = (mapel: string): string => {
    const m = (mapel || '').toLowerCase();
    if (m.includes('matematika')) {
      return `Pada akhir Fase ${config.fase}, peserta didik dapat menggeneralisasi sifat-sifat operasi bilangan berpangkat (eksponen) dan logaritma, serta menggunakan barisan dan deret (aritmetika dan geometri). Peserta didik dapat menyelesaikan sistem persamaan linear tiga variabel dan sistem pertidaksamaan linear dua variabel, serta perbandingan trigonometri pada segitiga siku-siku.

Elemen Bilangan:
Peserta didik dapat menggeneralisasi sifat-sifat bilangan berpangkat serta menerapkan barisan dan deret aritmetika dan geometri dalam berbagai konteks masalah nyata.

Elemen Aljabar dan Fungsi:
Peserta didik dapat menyelesaikan sistem persamaan linear tiga variabel, sistem pertidaksamaan linear dua variabel, serta fungsi kuadrat.

Elemen Geometri & Trigonometri:
Peserta didik dapat menyelesaikan permasalahan segitiga siku-siku yang melibatkan perbandingan trigonometri dan aplikasinya.

Elemen Analisis Data dan Peluang:
Peserta didik dapat merepresentasikan dan menginterpretasi data serta menentukan peluang kejadian saling lepas dan bersyarat.`;
    }
    if (m.includes('arab')) {
      return `Pada akhir Fase ${config.fase}, peserta didik memiliki kemampuan berbahasa Arab reseptif dan produktif dalam konteks kehidupan sehari-hari, madrasah, dan nilai-nilai Islam Aswaja.

Elemen Menyimak (Istima'):
Peserta didik mampu mengeksplorasi informasi yang didengar tentang perkenalan diri (ta'aruf), keluarga, dan madrasah.

Elemen Berbicara (Kalam):
Peserta didik mampu berdialog sederhana dan menyampaikan gagasan secara lisan dengan makharijul huruf yang tepat dan santun.

Elemen Membaca dan Memirsa (Qira'ah):
Peserta didik mampu membaca dan memahami teks naratif, deskriptif, dan percakapan bahasa Arab serta menemukan gagasan utama.

Elemen Menulis dan Mempresentasikan (Kitabah):
Peserta didik mampu menyusun kalimat dan paragraf sederhana menggunakan kaidah tarkib dasar dengan tulisan Arab yang benar.`;
    }
    if (m.includes('indonesia')) {
      return `Pada akhir Fase ${config.fase}, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja.

Elemen Menyimak:
Peserta didik mampu mengevaluasi dan mengkreasi informasi berupa gagasan, pikiran, pandangan, atau pesan yang akurat dari menyimak berbagai tipe teks.

Elemen Membaca dan Memirsa:
Peserta didik mampu mengevaluasi informasi dari berbagai tipe teks (deskripsi, laporan hasil observasi, eksposisi, negosiasi, dan sastra).

Elemen Berbicara dan Mempresentasikan:
Peserta didik mampu mengolah dan menyajikan gagasan untuk pengajuan usul, perumusan masalah, dan solusi secara logis, runtut, kritis, dan santun.

Elemen Menulis:
Peserta didik mampu menulis gagasan, pikiran, dan pengetahuan metakognisi secara logis, kritis, dan kreatif dalam bentuk teks fiksi maupun nonfiksi.`;
    }
    return `Pada akhir Fase ${config.fase}, peserta didik memiliki kemampuan menganalisis ketentuan bersuci (thaharah), ibadah mahdhah dan ghairu mahdhah, serta muamalah sesuai syariat Islam berlandaskan nilai-nilai Aswaja An-Nahdliyah dan Kurikulum Berbasis Cinta (KBC).

Elemen Fiqih Ibadah:
Peserta didik mampu menganalisis tata cara bersuci (thaharah) dari hadas dan najis, ketertiban shalat fardhu dan sunnah, zakat, serta pengurusan jenazah berlandaskan dalil Al-Qur'an dan hadis.

Elemen Fiqih Muamalah:
Peserta didik mampu mengidentifikasi prinsip kepemilikan harta dalam Islam, akad jual beli, khiyar, dan kerja sama ekonomi dengan semangat kejujuran, kasih sayang (rahmah), dan kemaslahatan umat.

Elemen Adab dan Kemasyarakatan:
Peserta didik mampu menginternalisasikan nilai tasamuh (toleransi), tawassuth (moderat), dan kepedulian sosial-lingkungan dalam mempraktikkan syariat di madrasah dan masyarakat.`;
  };

  const handleLoadSampleCP = () => {
    const sampleText = getSampleCPText(config.mapel);
    setConfig((prev) => ({
      ...prev,
      capaianPembelajaranTeks: sampleText,
    }));
  };

  const handleFillDefaultInsersiKBC = () => {
    const nextInsersi: Record<string, string> = { ...(config.insersiKBC || {}) };
    PANCA_CINTA_KBC.forEach((item) => {
      if (config.nilaiKBC.includes(item.nilai)) {
        nextInsersi[item.nilai] = `${item.defaultInsersi} (Konteks materi: ${config.topikMateri || config.mapel}).`;
      }
    });
    setConfig((prev) => ({
      ...prev,
      insersiKBC: nextInsersi,
    }));
  };

  useEffect(() => {
    setConfig((prev) => ({
      ...prev,
      tahunPelajaran: madrasahIdentity.tahunAjaran || prev.tahunPelajaran,
      kepalaMadrasah: madrasahIdentity.kepalaMadrasah || prev.kepalaMadrasah,
      nipKepala: madrasahIdentity.nipKepala || prev.nipKepala,
    }));
  }, [madrasahIdentity]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [docMeta, setDocMeta] = useState<{ isFallback?: boolean; source?: string; fallbackReason?: string }>({});
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>(
    savedDocs.find((d) => d.type === activeDocType)?.contentMarkdown || ''
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const printCardRef = useRef<HTMLDivElement>(null);

  const getDocRightTitle = (docType: AdminDocType) => {
    switch (docType) {
      case 'rpp':
        return 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KBC';
      case 'modul_ajar':
        return 'MODUL AJAR KURIKULUM BERBASIS CINTA (KBC)';
      case 'cp':
        return 'ANALISIS CAPAIAN PEMBELAJARAN (CP) & KBC';
      case 'atp':
        return 'ALUR TUJUAN PEMBELAJARAN (ATP) & KBC';
      case 'prota':
        return 'PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA & KBC';
      case 'prosem':
        return 'PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA & KBC';
      case 'prota_prosem':
        return 'PROGRAM TAHUNAN & SEMESTER';
      case 'kktp':
        return 'KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)';
      case 'lkpd':
        return 'LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS KBC';
      case 'presensi_kbm':
        return 'JURNAL MENGAJAR & PRESENSI HARIAN KBM (KBC)';
      case 'umpan_balik':
        return 'INSTRUMEN REFLEKSI & UMPAN BALIK PEMBELAJARAN KBC';
      default:
        return 'DOKUMEN ADMINISTRASI GURU';
    }
  };

  const getDocRightSubtitle = (docType: AdminDocType) => {
    if (docType === 'rpp' || docType === 'modul_ajar' || docType === 'lkpd') {
      return `KELAS ${config.kelas} (FASE ${config.fase}) | ${config.jumlahPertemuan || '2 Pertemuan'} @ ${config.jamPerPertemuan || '2 JP'} | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'cp') {
      return `FASE ${config.fase} | ANALISIS ELEMEN CP & INSERSI KBC | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'atp') {
      return `FASE ${config.fase} | ALOKASI: ${config.alokasiWaktu || '72 JP'} | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'prota') {
      return `FASE ${config.fase} KELAS ${config.kelas} | DISTRIBUSI TAHUNAN & TEMA KBC | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'prosem') {
      return `FASE ${config.fase} KELAS ${config.kelas} | SEMESTER ${config.semester === '2' ? 'GENAP' : 'GASAL'} | TA: ${config.tahunPelajaran}`;
    }
    return `TA: ${config.tahunPelajaran} | KELAS ${config.kelas} / FASE ${config.fase}`;
  };

  useEffect(() => {
    const existing = savedDocs.find(
      (d) =>
        d.type === activeDocType &&
        d.config.mapel.toLowerCase() === config.mapel.toLowerCase() &&
        d.config.kelas === config.kelas &&
        d.config.semester === config.semester &&
        d.createdBy === currentUser.name
    );
    if (existing) {
      setGeneratedMarkdown(existing.contentMarkdown);
    } else {
      setGeneratedMarkdown('');
    }
  }, [activeDocType, config.mapel, config.kelas, config.semester, currentUser.name, savedDocs]);

  const handleSelectDocType = (type: AdminDocType) => {
    setActiveDocType(type);
    setDocMeta({});
    setConfig((prev) => ({
      ...prev,
      docType: type,
      alokasiWaktu:
        (type === 'cp' || type === 'atp' || type === 'prota') &&
        (!prev.alokasiWaktu || prev.alokasiWaktu.includes('Pertemuan'))
          ? '72 JP (2 JP x 36 Minggu Efektif)'
          : type === 'prosem'
          ? '36 JP (18 Minggu Efektif x 2 JP)'
          : (type === 'rpp' || type === 'modul_ajar' || type === 'lkpd') &&
            (!prev.alokasiWaktu || prev.alokasiWaktu.includes('72 JP') || prev.alokasiWaktu.includes('36 JP'))
          ? '4 JP (2 Pertemuan x 45 Menit)'
          : prev.alokasiWaktu,
    }));
  };

  const handleGenerate = async () => {
    let activeConfig = { ...config, docType: activeDocType };
    if (
      (activeDocType === 'cp' ||
        activeDocType === 'atp' ||
        activeDocType === 'rpp' ||
        activeDocType === 'modul_ajar' ||
        activeDocType === 'prota' ||
        activeDocType === 'prosem') &&
      (!activeConfig.capaianPembelajaranTeks || activeConfig.capaianPembelajaranTeks.trim().length === 0)
    ) {
      const sampleText = getSampleCPText(activeConfig.mapel);
      activeConfig = { ...activeConfig, capaianPembelajaranTeks: sampleText };
      setConfig(activeConfig);
    }

    setIsGenerating(true);
    setGenerationError(null);
    try {
      const data = await fetchApiJson('/api/v1/admin/generate-document', {
        method: 'POST',
        body: JSON.stringify(activeConfig),
      });

      if (!data.success) {
        setGenerationError(data.error || 'Gagal menyusun dokumen administrasi. Silakan coba lagi.');
        return;
      }

      if (data.markdown) {
        setGeneratedMarkdown(data.markdown);
        setDocMeta({
          isFallback: Boolean(data.isFallback),
          source: data.source || 'AI Gateway',
          fallbackReason: data.fallbackReason || '',
        });
        const newDoc: GeneratedAdminDoc = {
          id: `doc-${Date.now()}`,
          type: activeDocType,
          title:
            activeDocType === 'rpp'
              ? `RPP KBC ${activeConfig.mapel} Kelas ${activeConfig.kelas} (Fase ${activeConfig.fase})`
              : activeDocType === 'modul_ajar'
              ? `Modul Ajar KBC ${activeConfig.mapel} Kelas ${activeConfig.kelas} (Fase ${activeConfig.fase})`
              : activeDocType === 'cp'
              ? `Analisis CP & KBC ${activeConfig.mapel} Fase ${activeConfig.fase}`
              : activeDocType === 'atp'
              ? `ATP & KBC ${activeConfig.mapel} Fase ${activeConfig.fase}`
              : activeDocType === 'lkpd'
              ? `LKPD Berbasis KBC ${activeConfig.mapel} Kelas ${activeConfig.kelas}`
              : activeDocType === 'presensi_kbm'
              ? `Jurnal Mengajar & Presensi KBM ${activeConfig.mapel} Kelas ${activeConfig.kelas}`
              : `${activeDocType.toUpperCase().replace('_', ' ')} ${activeConfig.mapel} Kelas ${activeConfig.kelas}`,
          config: activeConfig,
          contentMarkdown: data.markdown,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.name,
        };
        onSaveDocument(newDoc);
      }
    } catch (err: any) {
      setGenerationError(err?.message || 'Gagal menghasilkan dokumen administrasi. Silakan periksa kembali konfigurasi.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadDocx = async () => {
    if (!generatedMarkdown) return;
    const docData: GeneratedAdminDoc = {
      id: `doc-${Date.now()}`,
      type: activeDocType,
      title: `${getDocRightTitle(activeDocType)} - ${config.mapel} Kelas ${config.kelas}`,
      config,
      contentMarkdown: generatedMarkdown,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    await exportAdminDocToDocx(docData);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handlePrintNewTab = () => {
    if (!generatedMarkdown || !printCardRef.current) return;

    const isLandscape = activeDocType === 'prosem';
    const docTypeLabel = getDocRightTitle(activeDocType);
    const docTitle = `${docTypeLabel} - ${config.mapel} Kelas ${config.kelas} - MA NU 01 Banyuputih`;
    const contentHtml = printCardRef.current.innerHTML;

    const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #ffffff;
      border-bottom: 1px solid #cbd5e1;
      padding: 10px 20px;
    }
    .toolbar-container {
      max-width: ${isLandscape ? '1200px' : '960px'};
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .sheet-wrapper {
      max-width: ${isLandscape ? '297mm' : '210mm'};
      min-height: ${isLandscape ? '210mm' : '297mm'};
      margin: 20px auto;
      background: #ffffff;
      padding: ${isLandscape ? '10mm 12mm' : '18mm 16mm'};
      border-radius: 6px;
      border: 1px solid #cbd5e1;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 10px;
    }
    @media print {
      .no-print, .top-toolbar { display: none !important; }
      body { background: #ffffff !important; padding: 0 !important; margin: 0 !important; }
      .sheet-wrapper { margin: 0 !important; padding: 0 !important; border: none !important; max-width: 100% !important; }
      @page {
        size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
        margin: ${isLandscape ? '8mm' : '14mm 12mm'};
      }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }
      .break-inside-avoid { page-break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  <div class="no-print top-toolbar">
    <div class="toolbar-container">
      <div>
        <strong style="font-size: 13px; color: #045f3b;">MA NU 01 BANYUPUTIH</strong> —
        <span style="font-size: 13px; color: #0f172a;">${docTitle}</span>
      </div>
      <div style="display: flex; gap: 8px;">
        <button onclick="window.print()" style="padding: 6px 14px; background: #045f3b; color: #fff; font-weight: 600; font-size: 12px; border: none; border-radius: 4px; cursor: pointer;">
          Cetak / Simpan PDF
        </button>
        <button onclick="window.close()" style="padding: 6px 12px; background: #fff; color: #334155; font-size: 12px; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer;">
          Tutup Tab
        </button>
      </div>
    </div>
  </div>
  <div class="sheet-wrapper">
    ${contentHtml}
  </div>
  <script>
    window.addEventListener('load', () => { setTimeout(() => { window.print(); }, 500); });
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  };

  // Reusable Panca Cinta KBC & Materi Insersi Table Editor
  const renderPancaCintaEditor = () => (
    <div className="border border-slate-300 rounded overflow-hidden bg-white">
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-bold text-xs text-slate-800">
            Panca Cinta KBC & Materi Insersi (KMA 1503/2025 & Kepdirjen Pendis 6077/2025)
          </span>
          <p className="text-[11px] text-slate-500">
            Centang pilar cinta yang ditargetkan dan isi materi insersi (konteks integrasi / dalil pendukung) untuk dokumen ini.
          </p>
        </div>
        <button
          type="button"
          onClick={handleFillDefaultInsersiKBC}
          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-[#045f3b] font-semibold text-[11px] cursor-pointer shrink-0"
        >
          Isi Contoh Insersi Otomatis
        </button>
      </div>

      <div className="divide-y divide-slate-200">
        {PANCA_CINTA_KBC.map((item) => {
          const isChecked = config.nilaiKBC.includes(item.nilai);
          const insersiVal = config.insersiKBC?.[item.nilai] || '';
          return (
            <div key={item.nilai} className={`p-2.5 space-y-1.5 ${isChecked ? 'bg-white' : 'bg-slate-50/60'}`}>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setConfig((prev) => ({
                        ...prev,
                        nilaiKBC: [...prev.nilaiKBC, item.nilai],
                        insersiKBC: {
                          ...(prev.insersiKBC || {}),
                          [item.nilai]: prev.insersiKBC?.[item.nilai] || item.defaultInsersi,
                        },
                      }));
                    } else {
                      setConfig((prev) => ({
                        ...prev,
                        nilaiKBC: prev.nilaiKBC.filter((n) => n !== item.nilai),
                      }));
                    }
                  }}
                  className="mt-0.5 rounded border-slate-300 text-[#045f3b] focus:ring-[#045f3b]"
                />
                <div className="flex-1">
                  <div className="font-semibold text-xs text-slate-900">{item.nilai}</div>
                  <div className="text-[11px] text-slate-500 leading-snug">{item.deskripsi}</div>
                </div>
              </label>

              {isChecked && (
                <div className="pl-6">
                  <input
                    type="text"
                    value={insersiVal}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        insersiKBC: {
                          ...(prev.insersiKBC || {}),
                          [item.nilai]: e.target.value,
                        },
                      }))
                    }
                    placeholder={`Materi insersi / dalil / pembiasaan untuk ${item.nilai}...`}
                    className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#045f3b] text-[11px] text-slate-800"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Reusable CP Textarea Block
  const renderCPInputBlock = (label = 'Teks Capaian Pembelajaran (CP) Elemen Acuan') => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="font-semibold text-slate-700 text-xs">
          {label} <span className="text-rose-600">*</span>
        </label>
        <div className="flex items-center gap-2">
          <a
            href="https://kurikulum.kemendikdasmen.go.id/panduan-mapel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-[#045f3b] underline"
          >
            <span>Referensi CP</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            type="button"
            onClick={handleLoadSampleCP}
            className="px-2 py-0.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-[#045f3b] font-semibold text-[11px] cursor-pointer"
          >
            Muat Standar CP {config.mapel}
          </button>
        </div>
      </div>
      <textarea
        rows={4}
        value={config.capaianPembelajaranTeks || ''}
        onChange={(e) => setConfig({ ...config, capaianPembelajaranTeks: e.target.value })}
        placeholder="Tempel teks Capaian Pembelajaran (CP) resmi atau klik 'Muat Standar CP' di kanan atas..."
        className="w-full p-2.5 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-xs font-mono leading-relaxed text-slate-900"
      />
    </div>
  );

  const DOC_TABS: { id: AdminDocType; label: string }[] = [
    { id: 'rpp', label: '1. RPP Merdeka' },
    { id: 'modul_ajar', label: '2. Modul Ajar KBC' },
    { id: 'cp', label: '3. Analisis CP' },
    { id: 'atp', label: '4. Alur (ATP)' },
    { id: 'prota', label: '5. PROTA' },
    { id: 'prosem', label: '6. PROSEM' },
    { id: 'kktp', label: '7. KKTP Interval' },
    { id: 'lkpd', label: '8. LKPD KBC' },
    { id: 'presensi_kbm', label: '9. Jurnal & Presensi' },
    { id: 'umpan_balik', label: '10. Umpan Balik' },
  ];

  return (
    <div className="space-y-4">
      {/* ========================================================
          BOOTSTRAP HEADER & NAV-TABS (10 Perangkat KBC & Merdeka)
      ======================================================== */}
      <div className="bg-white rounded-md border border-slate-300 overflow-hidden no-print">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-base font-bold text-slate-900">
              Generator Perangkat Administrasi Guru & Kurikulum Berbasis Cinta (KBC)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Rujukan: KMA 1503/2025 & Kepdirjen Pendis 6077/2025 · Panca Cinta Kemenag RI · 8 Dimensi Profil Lulusan (Pembelajaran Mendalam)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedMarkdown}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5 text-[#045f3b]" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={!generatedMarkdown}
              className="px-3 py-1.5 rounded bg-[#045f3b] hover:bg-[#03482d] text-white font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Word (.docx)</span>
            </button>
            <button
              type="button"
              onClick={handlePrintNewTab}
              disabled={!generatedMarkdown}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Bootstrap .nav-tabs for 10 Document Types */}
        <div className="px-3 pt-2 bg-slate-100 border-b border-slate-300 flex items-center gap-1 overflow-x-auto">
          {DOC_TABS.map((t) => {
            const isActive = activeDocType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectDocType(t.id)}
                className={`px-3 py-2 text-xs font-semibold rounded-t-md border transition cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white border-slate-300 border-b-white text-[#045f3b] -mb-px font-bold'
                    : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          TWO-PANEL BOOTSTRAP LAYOUT: Form Left (5 cols), Preview Right (7 cols)
      ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start print:block print:w-full">
        {/* LEFT PANEL: Form Konfigurasi */}
        <div className="lg:col-span-5 bg-white rounded-md border border-slate-300 overflow-hidden no-print text-xs">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">
              Form Konfigurasi: {getDocRightTitle(activeDocType)}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Common Identity Fields for ALL Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran *</label>
                <input
                  type="text"
                  value={config.mapel}
                  onChange={(e) => setConfig({ ...config, mapel: e.target.value })}
                  placeholder="Contoh: Fiqih, Matematika, Bahasa Arab"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kelas & Fase *</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['X', 'XI', 'XII'] as const).map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKelasChange(k)}
                      className={`py-2 px-2 rounded border font-semibold cursor-pointer ${
                        config.kelas === k
                          ? 'bg-[#045f3b] text-white border-[#045f3b]'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                      }`}
                    >
                      {k} ({k === 'X' ? 'Fase E' : 'Fase F'})
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Semester *</label>
                <select
                  value={config.semester}
                  onChange={(e) => setConfig({ ...config, semester: e.target.value as any })}
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                >
                  <option value="1">Semester 1 (Gasal)</option>
                  <option value="2">Semester 2 (Genap)</option>
                  <option value="1 & 2">Semester 1 & 2 (Tahunan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alokasi Waktu (JP) *</label>
                <input
                  type="text"
                  value={config.alokasiWaktu}
                  onChange={(e) => setConfig({ ...config, alokasiWaktu: e.target.value })}
                  placeholder="Contoh: 4 JP (2 Pertemuan) atau 72 JP"
                  className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            {/* Topik / Materi Pokok */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Topik / Materi Pokok Pembelajaran *
              </label>
              <input
                type="text"
                value={config.topikMateri}
                onChange={(e) => setConfig({ ...config, topikMateri: e.target.value })}
                placeholder="Contoh: Ketentuan Thaharah dan Kebersihan Lingkungan dalam Bingkai Kasih Sayang"
                className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-slate-900"
              />
            </div>

            {/* ========================================================
                TAB-SPECIFIC FIELDS:
                1. RPP & 2. MODUL AJAR KBC & 8. LKPD KBC
            ======================================================== */}
            {(activeDocType === 'rpp' || activeDocType === 'modul_ajar' || activeDocType === 'lkpd') && (
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                {renderCPInputBlock('Capaian Pembelajaran (CP) Elemen')}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rumusan Tujuan Pembelajaran (TP) / Indikator Spesifik (Opsional — jika kosong disusun dari CP)
                  </label>
                  <textarea
                    rows={2}
                    value={config.tujuanPembelajaranTeks || ''}
                    onChange={(e) => setConfig({ ...config, tujuanPembelajaranTeks: e.target.value })}
                    placeholder="Contoh: 1. Menganalisis ketentuan bersuci dari hadas; 2. Mempraktikkan thaharah dengan hemat air (ekoteologi KBC)..."
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                {activeDocType === 'modul_ajar' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Lintas Disiplin Ilmu (Konektivitas Materi)
                    </label>
                    <input
                      type="text"
                      value={config.lintasDisiplinIlmu || ''}
                      onChange={(e) => setConfig({ ...config, lintasDisiplinIlmu: e.target.value })}
                      placeholder="Contoh: Biologi/Kesehatan (Higienitas), Ekologi (Konservasi Air), Bahasa Arab"
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jumlah Pertemuan</label>
                    <select
                      value={config.jumlahPertemuan || '2 Pertemuan'}
                      onChange={(e) => {
                        const jm = e.target.value;
                        const jpPer = config.jamPerPertemuan || '2 JP (2 x 45 menit)';
                        const numPertemuan = parseInt(jm) || 2;
                        const jpNum = parseInt(jpPer) || 2;
                        setConfig({
                          ...config,
                          jumlahPertemuan: jm,
                          alokasiWaktu: `${numPertemuan * jpNum} JP (${jm} x ${jpNum} JP)`,
                        });
                      }}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="1 Pertemuan">1 Pertemuan</option>
                      <option value="2 Pertemuan">2 Pertemuan</option>
                      <option value="3 Pertemuan">3 Pertemuan</option>
                      <option value="4 Pertemuan">4 Pertemuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jam per Pertemuan</label>
                    <select
                      value={config.jamPerPertemuan || '2 JP (2 x 45 menit)'}
                      onChange={(e) => {
                        const jpPer = e.target.value;
                        const jm = config.jumlahPertemuan || '2 Pertemuan';
                        const numPertemuan = parseInt(jm) || 2;
                        const jpNum = parseInt(jpPer) || 2;
                        setConfig({
                          ...config,
                          jamPerPertemuan: jpPer,
                          alokasiWaktu: `${numPertemuan * jpNum} JP (${jm} x ${jpNum} JP)`,
                        });
                      }}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="2 JP (2 x 45 menit)">2 JP (2 x 45 menit)</option>
                      <option value="3 JP (3 x 45 menit)">3 JP (3 x 45 menit)</option>
                      <option value="4 JP (4 x 45 menit)">4 JP (4 x 45 menit)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Model & Pendekatan Pembelajaran Mendalam
                  </label>
                  <input
                    type="text"
                    value={config.modelPembelajaran}
                    onChange={(e) => setConfig({ ...config, modelPembelajaran: e.target.value })}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Karakteristik Peserta Didik & Strategi Diferensiasi
                  </label>
                  <textarea
                    rows={2}
                    value={config.karakteristikPesertaDidik || ''}
                    onChange={(e) => setConfig({ ...config, karakteristikPesertaDidik: e.target.value })}
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                {/* 8 Dimensi Profil Lulusan (Pembelajaran Mendalam) */}
                <div className="border border-slate-300 rounded overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                    8 Dimensi Profil Lulusan (Pembelajaran Mendalam & KBC)
                  </div>
                  <div className="p-2.5 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white">
                    {DELAPAN_DIMENSI_PROFIL_LULUSAN.map((dimensi) => {
                      const isSelected = (config.dimensiProfilLulusan || []).includes(dimensi);
                      return (
                        <label
                          key={dimensi}
                          className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = config.dimensiProfilLulusan || [];
                              setConfig({
                                ...config,
                                dimensiProfilLulusan: e.target.checked
                                  ? [...current, dimensi]
                                  : current.filter((d) => d !== dimensi),
                              });
                            }}
                            className="mt-0.5 rounded border-slate-300 text-[#045f3b] focus:ring-[#045f3b]"
                          />
                          <span className="text-[11px] text-slate-800 leading-snug">{dimensi}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Jenis Asesmen (termasuk Asesmen Sikap / Jurnal Anekdotal KBC) */}
                <div className="border border-slate-300 rounded overflow-hidden">
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                    Rencana Asesmen (Kognitif & Karakter/Sikap KBC)
                  </div>
                  <div className="p-2.5 space-y-1.5 bg-white">
                    {JENIS_ASESMEN_KBC.map((asesmen) => {
                      const isSelected = (config.jenisAsesmen || []).includes(asesmen.key);
                      return (
                        <label
                          key={asesmen.key}
                          className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              const current = config.jenisAsesmen || [];
                              setConfig({
                                ...config,
                                jenisAsesmen: e.target.checked
                                  ? [...current, asesmen.key]
                                  : current.filter((a) => a !== asesmen.key),
                              });
                            }}
                            className="mt-0.5 rounded border-slate-300 text-[#045f3b] focus:ring-[#045f3b]"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 text-[11px]">{asesmen.key}</div>
                            <div className="text-[10.5px] text-slate-500">{asesmen.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                3. ANALISIS CP & 4. ATP & 5. PROTA & 6. PROSEM
            ======================================================== */}
            {(activeDocType === 'cp' ||
              activeDocType === 'atp' ||
              activeDocType === 'prota' ||
              activeDocType === 'prosem') && (
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                {renderCPInputBlock(
                  activeDocType === 'prota' || activeDocType === 'prosem'
                    ? 'Teks Capaian Pembelajaran (CP) Acuan Distribusi Materi'
                    : 'Teks Capaian Pembelajaran (CP) Seluruh Elemen'
                )}

                {activeDocType === 'prosem' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Agenda / Kalender Non-Efektif Madrasah (ASTS, ASAS, Libur, PHBI)
                    </label>
                    <textarea
                      rows={2}
                      value={config.agendaMadrasah || ''}
                      onChange={(e) => setConfig({ ...config, agendaMadrasah: e.target.value })}
                      placeholder="Contoh: Minggu 3 Sept: ASTS; Minggu 1-2 Des: ASESGA; Minggu 3-4 Des: Rapor & Libur Semester..."
                      className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Instruksi Khusus Penyusunan {activeDocType.toUpperCase()} (Aktif di Prompt & Template)
                  </label>
                  <textarea
                    rows={2}
                    value={config.instruksiKhusus || ''}
                    onChange={(e) => setConfig({ ...config, instruksiKhusus: e.target.value })}
                    placeholder="Contoh: Urutkan materi dari konkret ke abstrak, petakan tema Panca Cinta per unit, atau sesuaikan dengan kitab rujukan madrasah..."
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                7. KKTP INTERVAL
            ======================================================== */}
            {activeDocType === 'kktp' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daftar Tujuan Pembelajaran (TP) / Indikator yang Dibuatkan Rubrik KKTP *
                  </label>
                  <textarea
                    rows={3}
                    value={config.tujuanPembelajaranTeks || ''}
                    onChange={(e) => setConfig({ ...config, tujuanPembelajaranTeks: e.target.value })}
                    placeholder="Tuliskan TP atau indikator yang akan diukur (pisahkan per baris), misal:&#10;1. Menganalisis ketentuan dan hikmah thaharah&#10;2. Mempraktikkan tata cara bersuci sesuai syariat & penghematan air&#10;3. Menunjukkan adab kasih sayang dan kebersihan lingkungan"
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rentang Interval Nilai & Kategori Ketuntasan (Bisa Disesuaikan)
                  </label>
                  <input
                    type="text"
                    value={config.intervalKKTP || ''}
                    onChange={(e) => setConfig({ ...config, intervalKKTP: e.target.value })}
                    placeholder="Contoh: 0-60% (Perlu Bimbingan), 61-74% (Cukup), 75-87% (Baik/Tuntas), 88-100% (Mahir)"
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                9. JURNAL MENGAJAR & PRESENSI KBM
            ======================================================== */}
            {activeDocType === 'presensi_kbm' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Catatan Jurnal KBM & Kejadian Anekdotal Karakter KBC (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={config.instruksiKhusus || ''}
                    onChange={(e) => setConfig({ ...config, instruksiKhusus: e.target.value })}
                    placeholder="Contoh: Pertemuan berjalan kondusif, santri antusias berdiskusi kelompok, terdapat 2 siswa yang menjadi tutor sebaya penuh empati..."
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                10. UMPAN BALIK & REFLEKSI KBC
            ======================================================== */}
            {activeDocType === 'umpan_balik' && (
              <div className="space-y-3.5 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Responden Instrumen</label>
                    <select
                      value={config.respondenSurvei || 'Peserta Didik (Refleksi Suasana Kelas Berbasis Cinta)'}
                      onChange={(e) => setConfig({ ...config, respondenSurvei: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="Peserta Didik (Refleksi Suasana Kelas Berbasis Cinta)">
                        Peserta Didik (Siswa)
                      </option>
                      <option value="Rekan Sejawat / Observer Supervisi KBC">
                        Rekan Sejawat / Supervisi
                      </option>
                      <option value="Refleksi Mandiri Guru Pengampu">
                        Refleksi Mandiri Guru
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Skala Penilaian</label>
                    <select
                      value={config.skalaSurvei || 'Skala Likert 1 - 4 (1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Sangat Baik)'}
                      onChange={(e) => setConfig({ ...config, skalaSurvei: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="Skala Likert 1 - 4 (1 = Kurang, 2 = Cukup, 3 = Baik, 4 = Sangat Baik)">
                        Skala Likert 1 - 4
                      </option>
                      <option value="Skala Likert 1 - 5 (Sangat Kurang s.d. Sangat Memuaskan)">
                        Skala Likert 1 - 5
                      </option>
                      <option value="Skala Guttman (Ya / Tidak beserta Catatan Reflektif)">
                        Ya / Tidak + Refleksi
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Aspek yang Dinilai dalam Instrumen Umpan Balik KBC
                  </label>
                  <textarea
                    rows={2}
                    value={config.aspekUmpanBalik || ''}
                    onChange={(e) => setConfig({ ...config, aspekUmpanBalik: e.target.value })}
                    placeholder="Contoh: Suasana kelas penuh kasih sayang (nir-kekerasan), kejelasan materi Deep Learning, keteladanan adab guru, keadilan..."
                    className="w-full p-2.5 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            )}

            {/* ========================================================
                PANCA CINTA KBC & MATERI INSERSI (Tampil di SEMUA Tab!)
            ======================================================== */}
            <div className="pt-2 border-t border-slate-200">
              {renderPancaCintaEditor()}
            </div>

            {/* Pengesahan Guru & Kepala Madrasah */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Guru Pengampu</label>
                <input
                  type="text"
                  value={config.guruPengampu}
                  onChange={(e) => setConfig({ ...config, guruPengampu: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Kepala Madrasah</label>
                <input
                  type="text"
                  value={config.kepalaMadrasah}
                  onChange={(e) => setConfig({ ...config, kepalaMadrasah: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 text-slate-800"
                />
              </div>
            </div>

            {generationError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded text-rose-800 text-xs">
                <strong>Gagal:</strong> {generationError}
              </div>
            )}

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-2.5 px-4 rounded bg-[#045f3b] hover:bg-[#03482d] text-white font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menyusun {getDocRightTitle(activeDocType)}...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate {getDocRightTitle(activeDocType)}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Pratinjau Dokumen & Lembar Cetak A4 */}
        <div className="lg:col-span-7 space-y-3 print:w-full">
          {/* Bootstrap Alert for AI vs Emergency Fallback */}
          {generatedMarkdown && docMeta.source && (
            <div
              className={`px-4 py-2.5 rounded-md border text-xs flex flex-wrap items-center justify-between gap-2 no-print ${
                docMeta.isFallback
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}
            >
              <div>
                {docMeta.isFallback ? (
                  <>
                    <strong>Mode Template Darurat (KBC Terintegrasi):</strong> Gateway AI belum merespons
                    {docMeta.fallbackReason ? ` (${docMeta.fallbackReason})` : ''}. Naskah tetap menyertakan pilihan Panca Cinta & Materi Insersi Anda.
                  </>
                ) : (
                  <>
                    <strong>Hasil Generate AI ({docMeta.source}):</strong> Naskah disusun sesuai KMA 1503/2025, Kepdirjen Pendis 6077/2025, dan Panca Cinta KBC pilihan Anda.
                  </>
                )}
              </div>
            </div>
          )}

          <div
            ref={printCardRef}
            className={`admin-print-card bg-white p-6 sm:p-8 rounded-md border border-slate-300 space-y-6 print:w-full print:p-0 print:border-none print:shadow-none print:m-0 ${
              activeDocType === 'prosem' ? 'overflow-x-auto' : ''
            }`}
          >
            {/* Kop Resmi Madrasah */}
            <KopMadrasah
              identity={madrasahIdentity}
              rightTitle={getDocRightTitle(activeDocType)}
              rightSubtitle={getDocRightSubtitle(activeDocType)}
              ta={config.tahunPelajaran}
            />

            {generatedMarkdown ? (
              <div className="space-y-4">
                {/* Institutional Document Info Table */}
                <div className="border border-slate-300 rounded p-3 bg-slate-50/70 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-800 print:bg-slate-100/50 print:text-[10px] print:p-2">
                  <div>
                    <span className="font-semibold text-slate-900">Mata Pelajaran:</span> {config.mapel} (Fase {config.fase} / Kelas {config.kelas})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Tahun Pelajaran:</span> {config.tahunPelajaran} (Semester {config.semester})
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Topik / Materi:</span> {config.topikMateri}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900">Alokasi Waktu:</span> {config.alokasiWaktu}
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200 mt-1">
                    <span className="font-semibold text-slate-900">Target Panca Cinta (KBC):</span>{' '}
                    {config.nilaiKBC.length > 0 ? config.nilaiKBC.join(' · ') : 'Panca Cinta Kemenag RI'}
                  </div>
                  <div className="sm:col-span-2 pt-1 border-t border-slate-200 mt-0.5 flex justify-between">
                    <span>
                      <span className="font-semibold text-slate-900">Guru Pengampu:</span> {config.guruPengampu} (NIP. {config.nipGuru})
                    </span>
                    <span className="hidden sm:inline text-slate-500 text-[10px]">MA NU 01 Banyuputih</span>
                  </div>
                </div>

                {/* Rich Markdown & Real Tables Body */}
                <AdminMarkdownRenderer content={generatedMarkdown} />

                {/* Official 2-Column Signature Block */}
                <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-2 text-xs text-slate-900 mt-8 break-inside-avoid print:mt-8 print:text-[11px]">
                  <div>
                    <p className="text-slate-600">Mengetahui,</p>
                    <p className="font-semibold text-slate-900">Kepala MA NU 01 Banyuputih</p>
                    <div className="h-16 sm:h-20" />
                    <p className="font-bold underline text-slate-900">{config.kepalaMadrasah}</p>
                    <p className="text-slate-500 text-[11px] print:text-[10px]">NIP. {config.nipKepala}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-600">Banyuputih, 21 September 2026</p>
                    <p className="font-semibold text-slate-900">Guru Pengampu Mata Pelajaran</p>
                    <div className="h-16 sm:h-20" />
                    <p className="font-bold underline text-slate-900">{config.guruPengampu}</p>
                    <p className="text-slate-500 text-[11px] print:text-[10px]">NIP. {config.nipGuru}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-2">
                <FileSpreadsheet className="w-9 h-9 mx-auto opacity-40 text-slate-400" />
                <p className="text-sm font-semibold text-slate-700">
                  Belum ada naskah {getDocRightTitle(activeDocType)} untuk mata pelajaran ini.
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Lengkapi parameter dan Materi Insersi Panca Cinta KBC di panel kiri, lalu klik tombol <strong>Generate</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
