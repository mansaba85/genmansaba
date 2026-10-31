import React, { useState, useRef, useEffect } from 'react';
import { AdminDocConfig, AdminDocType, GeneratedAdminDoc, User, MadrasahIdentity } from '../types';
import { exportAdminDocToDocx } from '../utils/docxExport';
import { fetchApiJson } from '../utils/apiClient';
import { AdminMarkdownRenderer } from './AdminMarkdownRenderer';
import { KopMadrasah } from './KopMadrasah';
import { MADRASAH_IDENTITY } from '../data/mockAndPresets';
import {
  FileSpreadsheet,
  BookOpen,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Download,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Award,
  ExternalLink,
  Users,
} from 'lucide-react';

export const PANCA_CINTA_KBC = [
  {
    nilai: 'Cinta kepada Allah dan Rasul-Nya',
    deskripsi: 'Sumber dan fondasi utama spiritual yang menempatkan niat belajar serta mengajar sebagai bentuk ibadah.'
  },
  {
    nilai: 'Cinta kepada Ilmu Pengetahuan',
    deskripsi: 'Semangat belajar dengan hati terbuka untuk menjadikan ilmu sebagai sarana pencerahan, bukan sekadar hafalan atau alat dominasi.'
  },
  {
    nilai: 'Cinta kepada Diri dan Sesama',
    deskripsi: 'Sikap welas asih yang seimbang pada diri sendiri serta menumbuhkan empati, kepedulian, dan persaudaraan antarmanusia.'
  },
  {
    nilai: 'Cinta kepada Lingkungan (Alam)',
    deskripsi: 'Kesadaran ekoteologis bahwa manusia adalah bagian dari sistem kehidupan yang bertanggung jawab merawat alam ciptaan Tuhan.'
  },
  {
    nilai: 'Cinta kepada Tanah Air',
    deskripsi: 'Rasa tanggung jawab untuk menjaga persatuan, menghormati perbedaan, dan membangun negeri melalui karya nyata.'
  }
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
      'Cinta kepada Diri dan Sesama'
    ],
    modelPembelajaran: 'Problem Based Learning (PBL) & Understanding by Design (UbD)',
    capaianPembelajaranTeks: '',
    instruksiKhusus: '',
    karakteristikPesertaDidik: 'Kemampuan awal heterogen, kecenderungan gaya belajar visual dan kinestetik, santun dan aktif dalam diskusi kelompok.',
    dimensiProfilLulusan: [
      'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
      'Bernalar Kritis',
      'Mandiri',
      'Bergotong Royong',
      'Berkeadaban (Ta\'addub)',
    ],
    jumlahPertemuan: '2 Pertemuan',
    jamPerPertemuan: '2 JP (2 x 45 menit)',
    jenisAsesmen: [
      'Asesmen Diagnostik (Awal Pembelajaran)',
      'Asesmen Formatif (Proses KBM & LKPD)',
      'Asesmen Sumatif (Akhir TP)',
    ],
  });

  // Handler for Kelas change that automatically fills Fase (X -> E, XI/XII -> F)
  const handleKelasChange = (newKelas: 'X' | 'XI' | 'XII') => {
    const autoFase: 'E' | 'F' = newKelas === 'X' ? 'E' : 'F';
    setConfig((prev) => ({
      ...prev,
      kelas: newKelas,
      fase: autoFase,
    }));
  };

  // Sample CP Provider by Subject
  const getSampleCPText = (mapel: string): string => {
    const m = (mapel || '').toLowerCase();
    if (m.includes('matematika')) {
      return `Pada akhir Fase E, peserta didik dapat menggeneralisasi sifat-sifat operasi bilangan berpangkat (eksponen) dan logaritma, serta menggunakan barisan dan deret (aritmetika dan geometri). Peserta didik dapat menyelesaikan sistem persamaan linear tiga variabel dan sistem pertidaksamaan linear dua variabel. Peserta didik dapat menyelesaikan masalah yang berkaitan dengan perbandingan trigonometri pada segitiga siku-siku.

Elemen Bilangan:
Peserta didik dapat menggeneralisasi sifat-sifat bilangan berpangkat (termasuk bilangan pangkat pecahan). Mereka dapat menerapkan barisan dan deret aritmetika dan geometri dalam berbagai konteks masalah kontekstual termasuk bunga majemuk dan anuitas.

Elemen Aljabar dan Fungsi:
Peserta didik dapat menyelesaikan sistem persamaan linear tiga variabel dan sistem pertidaksamaan linear dua variabel. Mereka dapat memodelkan fenomena hubungan kuadratik dan menyelesaikan persamaan serta fungsi kuadrat.

Elemen Geometri & Trigonometri:
Peserta didik dapat menyelesaikan permasalahan segitiga siku-siku yang melibatkan perbandingan trigonometri dan aplikasinya dalam pengukuran nyata di lingkungan madrasah.

Elemen Analisis Data dan Peluang:
Peserta didik dapat merepresentasikan dan menginterpretasi data dengan sajian diagram yang sesuai serta menentukan peluang kejadian saling lepas dan bersyarat.`;
    }
    if (m.includes('arab')) {
      return `Pada akhir Fase E, peserta didik memiliki kemampuan berbahasa Arab reseptif dan produktif dalam konteks kehidupan sehari-hari, madrasah, dan nilai-nilai Islam Aswaja.

Elemen Menyimak (Istima'):
Peserta didik mampu mengeksplorasi informasi yang didengar tentang perkenalan diri (ta'aruf), keluarga dan madrasah, serta fasilitas belajar dengan memahami ide pokok dan detail informasi.

Elemen Berbicara (Kalam):
Peserta didik mampu berdialog sederhana, mengajukan pertanyaan, dan menyampaikan pendapat atau pengalaman secara lisan dengan pelafalan makharijul huruf yang fasih dan percaya diri.

Elemen Membaca dan Memirsa (Qira'ah):
Peserta didik mampu membaca dan memahami teks naratif, deskriptif, dan dialog Arab berharakat maupun gundul sederhana serta menemukan gagasan utama.

Elemen Menulis dan Mempresentasikan (Kitabah):
Peserta didik mampu menyusun kalimat dan paragraf sederhana menggunakan kaidah tarkib dasar (dhamir, isim isyarah, jumlah ismiyyah, jumlah fi'liyyah) dengan tulisan Arab yang rapi dan benar.`;
    }
    if (m.includes('indonesia')) {
      return `Pada akhir Fase E, peserta didik memiliki kemampuan berbahasa untuk berkomunikasi dan bernalar sesuai dengan tujuan, konteks sosial, akademis, dan dunia kerja.

Elemen Menyimak:
Peserta didik mampu mengevaluasi dan mengkreasi informasi berupa gagasan, pikiran, perasaan, pandangan, arahan atau pesan yang akurat dari menyimak berbagai tipe teks lisan dan audiovisual.

Elemen Membaca dan Memirsa:
Peserta didik mampu mengevaluasi informasi berupa gagasan, pikiran, pandangan, arahan atau pesan dari berbagai tipe teks (deskripsi, laporan, narasi, eksposisi, dan puisi) dari teks visual dan audiovisual.

Elemen Berbicara dan Mempresentasikan:
Peserta didik mampu mengolah dan menyajikan gagasan, pikiran, pandangan, arahan atau pesan untuk tujuan pengajuan usul, perumusan masalah, dan solusi dalam bentuk monolog, dialog, dan gelar wicara secara logis, runtut, kritis, dan kreatif.

Elemen Menulis:
Peserta didik mampu menulis gagasan, pikiran, pandangan, pengetahuan metakognisi untuk berbagai tujuan secara logis, kritis, dan kreatif dalam bentuk teks fiksi maupun nonfiksi.`;
    }
    // Default Fiqih / Mapel Keagamaan Madrasah
    return `Pada akhir Fase E, peserta didik memiliki kemampuan menganalisis ketentuan bersuci (thaharah), shalat fardhu dan sunnah, pengurusan jenazah, serta zakat, haji dan umrah sesuai mazhab Syafi'i berlandaskan nilai-nilai Aswaja An-Nahdliyah.

Elemen Fiqih Ibadah:
Peserta didik mampu menganalisis tata cara bersuci (thaharah) dari hadas dan najis, mendiagnosis hal-hal yang membatalkan wudhu dan tayamum, serta memahami rukun shalat, shalat berjamaah, dan pengurusan jenazah berlandaskan dalil Al-Qur'an dan hadits shahih.

Elemen Fiqih Muamalah:
Peserta didik mampu mengidentifikasi prinsip-prinsip kepemilikan harta dalam Islam, akad jual beli, khiyar, dan pencegahan transaksi terlarang (riba, gharar, maysir) dengan semangat kasih sayang, kejujuran, dan kemaslahatan umat.

Elemen Adab dan Kemasyarakatan:
Peserta didik mampu menginternalisasikan nilai tasamuh (toleransi) dan tawassuth (moderat) dalam mempraktikkan ibadah di tengah keberagaman masyarakat madrasah.`;
  };

  const handleLoadSampleCP = () => {
    const sampleText = getSampleCPText(config.mapel);
    setConfig((prev) => ({
      ...prev,
      capaianPembelajaranTeks: sampleText,
      alokasiWaktu:
        prev.alokasiWaktu ||
        (activeDocType === 'rpp' ? '4 JP (2 Pertemuan x 45 Menit)' : '72 JP (2 JP x 36 Minggu)'),
    }));
  };

  // Sync config when madrasahIdentity updates
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
  const [generatedMarkdown, setGeneratedMarkdown] = useState<string>(
    savedDocs.find((d) => d.type === activeDocType)?.contentMarkdown || ''
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const printCardRef = useRef<HTMLDivElement>(null);

  const getDocRightTitle = (docType: AdminDocType) => {
    switch (docType) {
      case 'rpp':
        return 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)';
      case 'modul_ajar':
        return 'MODUL AJAR KURIKULUM MERDEKA';
      case 'cp':
        return 'ANALISIS CAPAIAN PEMBELAJARAN (CP) ELEMEN';
      case 'atp':
        return 'ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA';
      case 'prota':
        return 'PROGRAM TAHUNAN (PROTA)';
      case 'prosem':
        return 'PROGRAM SEMESTER (PROSEM)';
      case 'prota_prosem':
        return 'PROGRAM TAHUNAN & SEMESTER';
      case 'kktp':
        return 'KRITERIA KETERCAPAIAN TP (KKTP)';
      case 'umpan_balik':
        return 'LEMBAR REFLEKSI & UMPAN BALIK';
      default:
        return 'DOKUMEN ADMINISTRASI GURU';
    }
  };

  const getDocRightSubtitle = (docType: AdminDocType) => {
    if (docType === 'rpp') {
      return `KELAS ${config.kelas} (FASE ${config.fase}) | ${config.jumlahPertemuan || '2 Pertemuan'} @ ${config.jamPerPertemuan || '2 JP'} | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'cp') {
      return `FASE ${config.fase} | ANALISIS CAPAIAN PEMBELAJARAN ELEMEN | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'atp') {
      return `FASE ${config.fase} | ALOKASI: ${config.alokasiWaktu || '72 JP'} | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'prota') {
      return `FASE ${config.fase} KELAS ${config.kelas} | DISTRIBUSI ALOKASI WAKTU TAHUNAN | TA: ${config.tahunPelajaran}`;
    }
    if (docType === 'prosem') {
      return `FASE ${config.fase} KELAS ${config.kelas} | SEMESTER ${config.semester === '2' ? 'GENAP' : 'GASAL'} | TA: ${config.tahunPelajaran}`;
    }
    return `TA: ${config.tahunPelajaran} | KELAS ${config.kelas} / FASE ${config.fase}`;
  };

  // Load correct saved document based on active type, mapel, kelas, semester, and teacher
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

  // Sync when activeDocType changes
  const handleSelectDocType = (type: AdminDocType) => {
    setActiveDocType(type);
    setConfig((prev) => ({
      ...prev,
      docType: type,
      alokasiWaktu:
        (type === 'cp' || type === 'atp') && (!prev.alokasiWaktu || prev.alokasiWaktu.includes('Pertemuan'))
          ? '72 JP (2 JP x 36 Minggu)'
          : type === 'prota'
          ? '72 JP (2 JP x 36 Minggu Efektif)'
          : type === 'prosem'
          ? '36 JP (18 Minggu Efektif x 2 JP)'
          : type === 'rpp' && (!prev.alokasiWaktu || prev.alokasiWaktu.includes('72 JP'))
          ? '4 JP (2 Pertemuan x 45 Menit)'
          : prev.alokasiWaktu,
      topikMateri:
        type === 'rpp'
          ? (prev.topikMateri || `Ketentuan Pokok Pembelajaran ${prev.mapel} Kelas ${prev.kelas}`)
          : type === 'cp'
          ? `Analisis Capaian Pembelajaran ${config.mapel} Fase ${config.fase}`
          : type === 'atp'
          ? `Alur Tujuan Pembelajaran ${config.mapel} Fase ${config.fase}`
          : type === 'prota'
          ? `Distribusi Alokasi Waktu Efektif Tahunan ${config.mapel}`
          : type === 'prosem'
          ? `Matriks Distribusi Alokasi Waktu Semester ${config.semester === '2' ? 'Genap' : 'Gasal'} ${config.mapel}`
          : type === 'kktp'
          ? `Kriteria Interval Ketuntasan ${config.mapel}`
          : type === 'modul_ajar'
          ? `Modul Ajar Deep Learning & KBC ${config.mapel}`
          : `Instrumen Refleksi & Umpan Balik Siswa ${config.mapel}`,
    }));
  };

  // Generate Admin Document via Server
  const handleGenerate = async () => {
    let activeConfig = { ...config };
    if (
      (activeDocType === 'cp' || activeDocType === 'atp' || activeDocType === 'rpp') &&
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
        const newDoc: GeneratedAdminDoc = {
          id: `doc-${Date.now()}`,
          type: activeDocType,
          title:
            activeDocType === 'rpp'
              ? `RPP ${activeConfig.mapel} Kelas ${activeConfig.kelas} (Fase ${activeConfig.fase})`
              : activeDocType === 'cp'
              ? `Analisis CP Elemen ${activeConfig.mapel} Fase ${activeConfig.fase}`
              : activeDocType === 'atp'
              ? `ATP Kurikulum Merdeka ${activeConfig.mapel} Fase ${activeConfig.fase}`
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

  // Download DOCX
  const handleDownloadDocx = async () => {
    if (!generatedMarkdown) return;
    const docData: GeneratedAdminDoc = {
      id: `doc-${Date.now()}`,
      type: activeDocType,
      title:
        activeDocType === 'rpp'
          ? `RPP ${config.mapel} Kelas ${config.kelas} - MA NU 01 Banyuputih`
          : `${activeDocType.toUpperCase().replace('_', ' ')} ${config.mapel} Kelas ${config.kelas}`,
      config,
      contentMarkdown: generatedMarkdown,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
    };
    await exportAdminDocToDocx(docData);
  };

  // Copy Markdown
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMarkdown);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Open and print document in a new tab (Cetak PDF Tab Baru)
  const handlePrintNewTab = () => {
    if (!generatedMarkdown || !printCardRef.current) return;

    const isLandscape = activeDocType === 'prosem';
    const docTypeLabel =
      activeDocType === 'rpp'
        ? 'RENCANA PELAKSANAAN PEMBELAJARAN (RPP)'
        : activeDocType === 'prota'
        ? 'PROGRAM TAHUNAN (PROTA)'
        : activeDocType === 'prosem'
        ? 'PROGRAM SEMESTER (PROSEM)'
        : activeDocType.toUpperCase().replace('_', ' ');
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
  <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            heading: ['"Plus Jakarta Sans"', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #e2e8f0;
      padding: 12px 20px;
      box-shadow: 0 2px 8px -2px rgba(0,0,0,0.06);
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
    .toolbar-btn-print {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 9px 18px;
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      color: #ffffff;
      font-weight: 600;
      font-size: 13px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(5, 150, 105, 0.25);
      transition: all 0.2s;
    }
    .toolbar-btn-print:hover {
      opacity: 0.92;
      transform: translateY(-1px);
    }
    .toolbar-btn-close {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #ffffff;
      color: #475569;
      font-weight: 500;
      font-size: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .toolbar-btn-close:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .sheet-wrapper {
      max-width: ${isLandscape ? '297mm' : '210mm'};
      min-height: ${isLandscape ? '210mm' : '297mm'};
      margin: 24px auto;
      background: #ffffff;
      padding: ${isLandscape ? '10mm 12mm' : '20mm 18mm'};
      border-radius: 12px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04);
      border: 1px solid #e2e8f0;
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
      .no-print, .top-toolbar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .sheet-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        box-shadow: none !important;
        max-width: 100% !important;
        min-height: auto !important;
      }
      @page {
        size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'};
        margin: ${isLandscape ? '8mm 8mm 8mm 8mm' : '15mm 12mm 15mm 12mm'};
      }
      table {
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      thead {
        display: table-header-group;
      }
      .break-inside-avoid {
        page-break-inside: avoid !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print top-toolbar">
    <div class="toolbar-container">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: #045f3b; letter-spacing: 0.02em;">
          MA NU 01 BANYUPUTIH
        </span>
        <span style="color: #94a3b8;">·</span>
        <span style="font-size: 13px; font-weight: 600; color: #0f172a;">
          ${docTitle}
        </span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <button onclick="window.print()" class="toolbar-btn-print">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          <span>Cetak / Simpan PDF</span>
        </button>
        <button onclick="window.close()" class="toolbar-btn-close">
          Tutup Tab
        </button>
      </div>
    </div>
    <div style="max-width: 960px; margin: 8px auto 0; font-size: 11px; color: #64748b;">
      💡 <em>Petunjuk Simpan PDF:</em> Pada jendela dialog cetak browser, ubah <strong>Destination / Tujuan</strong> menjadi <strong>"Save as PDF"</strong> atau <strong>"Simpan sebagai PDF"</strong>, lalu klik Simpan.
    </div>
  </div>

  <div class="sheet-wrapper">
    ${contentHtml}
  </div>

  <script>
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>`;

    // Attempt direct window.open
    let opened = false;
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(fullHtml);
        printWindow.document.close();
        opened = true;
      }
    } catch (e) {
      console.warn('Direct window.open document write failed, falling back to Blob URL:', e);
    }

    // Fallback: Blob URL
    if (!opened) {
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Institutional Header */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Perangkat Administrasi Guru & Kurikulum Merdeka
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 uppercase">
                Resmi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              MA NU 01 Banyuputih · Modul Ajar Deep Learning, CP, ATP, Prota, Prosem, KKTP & KBC Panca Cinta
            </p>
          </div>
        </div>

        {/* Global Export actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            disabled={!generatedMarkdown}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition disabled:opacity-40 cursor-pointer"
          >
            {copySuccess ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copySuccess ? 'Tersalin!' : 'Salin Teks'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={!generatedMarkdown}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold transition disabled:opacity-40 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .docx</span>
          </button>
          <button
            type="button"
            onClick={handlePrintNewTab}
            disabled={!generatedMarkdown}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition disabled:opacity-40 cursor-pointer group"
            title="Buka dokumen di tab baru untuk cetak atau simpan ke PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-800 transition-colors" />
            <span>Cetak PDF</span>
            <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* 8 Document Category Selector Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-2xs no-print overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max sm:min-w-0 sm:grid sm:grid-cols-4 lg:grid-cols-8">
          {[
            { id: 'rpp', label: 'RPP Merdeka', icon: FileSpreadsheet },
            { id: 'modul_ajar', label: 'Modul Ajar KBC', icon: HeartHandshake },
            { id: 'cp', label: 'Capaian (CP)', icon: BookOpen },
            { id: 'atp', label: 'Alur (ATP)', icon: Sparkles },
            { id: 'prota', label: 'PROTA', icon: Calendar },
            { id: 'prosem', label: 'PROSEM', icon: Layers },
            { id: 'kktp', label: 'KKTP Interval', icon: CheckCircle2 },
            { id: 'umpan_balik', label: 'Umpan Balik', icon: MessageSquare },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeDocType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectDocType(t.id as AdminDocType)}
                className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 cursor-pointer touch-manipulation whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Panel Layout: Parameters Left, Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block print:w-full">
        {/* LEFT PANEL: Form parameters */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4 no-print text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="font-heading font-bold text-sm text-slate-900 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Konfigurasi: {activeDocType === 'rpp' ? 'RPP Kurikulum Merdeka' : activeDocType.toUpperCase().replace('_', ' ')}</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              Dokumen Administrasi
            </span>
          </div>

          {activeDocType === 'rpp' ? (
            /* Dedicated Form for RPP Kurikulum Merdeka */
            <div className="space-y-4">
              {/* Header Info Banner */}
              <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 rounded-2xl text-xs text-emerald-950 flex items-start space-x-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="font-bold text-emerald-950 text-xs">Generator RPP Kurikulum Merdeka & KBC</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Menyusun naskah RPP terintegrasi diferensiasi KBM, profil lulusan, alokasi jam, dan nilai Kurikulum Berbasis Cinta.
                  </p>
                </div>
              </div>

              {/* SECTION 1: Identitas & Kurikulum */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                  <span>1. Identitas Kelas & Mata Pelajaran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Kelas */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Kelas <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['X', 'XI', 'XII'] as const).map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleKelasChange(k)}
                          className={`py-1.5 px-2 text-xs font-bold rounded-xl border transition cursor-pointer text-center ${
                            config.kelas === k
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Kelas {k}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fase */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block font-semibold text-slate-700 text-xs">
                        Fase Kurikulum
                      </label>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        Otomatis
                      </span>
                    </div>
                    <div className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/80 text-slate-700 font-medium text-xs flex items-center justify-between h-[34px]">
                      <span>{config.fase === 'E' ? 'Fase E (Kelas X)' : 'Fase F (Kelas XI / XII)'}</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        Fase {config.fase}
                      </span>
                    </div>
                  </div>

                  {/* Semester */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Semester <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={config.semester}
                      onChange={(e) => setConfig({ ...config, semester: e.target.value as any })}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs h-[34px]"
                    >
                      <option value="1">Semester 1 (Gasal / Ganjil)</option>
                      <option value="2">Semester 2 (Genap)</option>
                      <option value="1 & 2">Semester 1 & 2 (Tahunan)</option>
                    </select>
                  </div>

                  {/* Mata Pelajaran */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Mata Pelajaran <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={config.mapel}
                      onChange={(e) => setConfig({ ...config, mapel: e.target.value })}
                      placeholder="Fiqih / Matematika / lainnya"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs h-[34px]"
                    />
                  </div>
                </div>

                {/* Quick Mapel Selector */}
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium mr-1">Pilihan Cepat:</span>
                  {['Fiqih', 'Al-Qur\'an Hadits', 'Akidah Akhlak', 'SKI', 'Bahasa Arab', 'Matematika', 'Bahasa Indonesia', 'Informatika'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setConfig({ ...config, mapel: s })}
                      className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                        config.mapel === s
                          ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Materi & Capaian Pembelajaran */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                  <span>2. Materi Pokok & Capaian Pembelajaran (CP)</span>
                </div>

                {/* Topik / Materi */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                    Topik / Materi Pokok Pembelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.topikMateri}
                    onChange={(e) => setConfig({ ...config, topikMateri: e.target.value })}
                    placeholder="Contoh: Ketentuan Thaharah dan Kebersihan Lingkungan dalam Bingkai Kasih Sayang"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs"
                  />
                </div>

                {/* Capaian Pembelajaran (CP) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1.5">
                    <label className="font-semibold text-slate-700 text-xs">
                      Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <a
                        href="https://kurikulum.kemendikdasmen.go.id/panduan-mapel"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-[10px] text-slate-500 hover:text-emerald-700 transition"
                      >
                        <span>Referensi CP</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      <button
                        type="button"
                        onClick={handleLoadSampleCP}
                        className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg border border-emerald-200 transition cursor-pointer flex items-center space-x-1"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Muat Standar CP {config.mapel}</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={config.capaianPembelajaranTeks || ''}
                    onChange={(e) => setConfig({ ...config, capaianPembelajaranTeks: e.target.value })}
                    placeholder="Masukkan atau muat standar CP elemen yang diajarkan..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-xs font-mono leading-relaxed"
                  />
                </div>
              </div>

              {/* SECTION 3: Desain Pembelajaran & Alokasi Waktu */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                  <span>3. Alokasi Waktu & Desain Pembelajaran</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Jumlah Pertemuan */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Jumlah Pertemuan <span className="text-rose-500">*</span>
                    </label>
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
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs h-[34px]"
                    >
                      <option value="1 Pertemuan">1 Pertemuan</option>
                      <option value="2 Pertemuan">2 Pertemuan</option>
                      <option value="3 Pertemuan">3 Pertemuan</option>
                      <option value="4 Pertemuan">4 Pertemuan</option>
                      <option value="5 Pertemuan">5 Pertemuan</option>
                      <option value="6 Pertemuan">6 Pertemuan</option>
                    </select>
                  </div>

                  {/* Jam per Pertemuan */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                      Jam per Pertemuan <span className="text-rose-500">*</span>
                    </label>
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
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs h-[34px]"
                    >
                      <option value="2 JP (2 x 45 menit)">2 JP (2 x 45 menit)</option>
                      <option value="3 JP (3 x 45 menit)">3 JP (3 x 45 menit)</option>
                      <option value="4 JP (4 x 45 menit)">4 JP (4 x 45 menit)</option>
                      <option value="1 JP (1 x 45 menit)">1 JP (1 x 45 menit)</option>
                    </select>
                  </div>
                </div>

                {/* Model Pembelajaran */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                    Model Pembelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.modelPembelajaran}
                    onChange={(e) => setConfig({ ...config, modelPembelajaran: e.target.value })}
                    placeholder="Contoh: Problem Based Learning (PBL) & Understanding by Design (UbD)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium text-xs mb-2"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Problem Based Learning (PBL)',
                      'Project Based Learning (PjBL)',
                      'Discovery Learning',
                      'Understanding by Design (UbD)',
                    ].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setConfig({ ...config, modelPembelajaran: m })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border transition cursor-pointer ${
                          config.modelPembelajaran === m
                            ? 'bg-emerald-600 text-white border-emerald-600 font-semibold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Karakteristik Peserta Didik */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-semibold text-slate-700 text-xs">
                      Karakteristik Siswa & Diferensiasi <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Dasar Diferensiasi KBM</span>
                  </div>
                  <textarea
                    rows={2}
                    value={config.karakteristikPesertaDidik || ''}
                    onChange={(e) => setConfig({ ...config, karakteristikPesertaDidik: e.target.value })}
                    placeholder="Deskripsikan kesiapan awal, gaya belajar (visual/auditori/kinestetik), dan kebutuhan peserta didik..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-xs mb-1.5"
                  />
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Kemampuan awal heterogen',
                      'Dominan gaya visual & kinestetik',
                      'Santun dan aktif berkolaborasi',
                    ].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const current = config.karakteristikPesertaDidik || '';
                          if (!current.includes(tag)) {
                            setConfig({
                              ...config,
                              karakteristikPesertaDidik: current ? `${current}, ${tag}` : tag,
                            });
                          }
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 border border-slate-200 transition cursor-pointer"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 4: Profil Lulusan & Asesmen */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 border-b border-slate-100 pb-2">
                  <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full"></span>
                  <span>4. Dimensi Profil Lulusan (P5RA & KBC) & Asesmen</span>
                </div>

                {/* Dimensi Profil Lulusan */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                    Pilih Dimensi Target Profil Lulusan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {[
                      'Beriman, Bertakwa kepada Tuhan YME, & Berakhlak Mulia',
                      'Bernalar Kritis',
                      'Mandiri',
                      'Bergotong Royong',
                      'Berkebinekaan Global',
                      'Kreatif',
                      'Berkeadaban (Ta\'addub) / Nilai KBC',
                    ].map((dimensi) => {
                      const isSelected = (config.dimensiProfilLulusan || []).includes(dimensi);
                      return (
                        <button
                          key={dimensi}
                          type="button"
                          onClick={() => {
                            const current = config.dimensiProfilLulusan || [];
                            if (isSelected) {
                              setConfig({
                                ...config,
                                dimensiProfilLulusan: current.filter((d) => d !== dimensi),
                              });
                            } else {
                              setConfig({
                                ...config,
                                dimensiProfilLulusan: [...current, dimensi],
                              });
                            }
                          }}
                          className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                              : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <span className="text-[11px] leading-snug">{dimensi}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Jenis Asesmen */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5 text-xs">
                    Rencana Asesmen Pembelajaran:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { key: 'Asesmen Diagnostik (Awal Pembelajaran)', desc: 'Pemetaan kesiapan awal kognitif dan non-kognitif' },
                      { key: 'Asesmen Formatif (Proses KBM & LKPD)', desc: 'Observasi keaktifan, unjuk kerja LKPD, dan adab santri KBC' },
                      { key: 'Asesmen Sumatif (Akhir TP)', desc: 'Tes tertulis / penilaian produk akhir untuk mengukur ketercapaian KKTP' },
                    ].map((asesmen) => {
                      const isSelected = (config.jenisAsesmen || []).includes(asesmen.key);
                      return (
                        <button
                          key={asesmen.key}
                          type="button"
                          onClick={() => {
                            const current = config.jenisAsesmen || [];
                            if (isSelected) {
                              setConfig({
                                ...config,
                                jenisAsesmen: current.filter((a) => a !== asesmen.key),
                              });
                            } else {
                              setConfig({
                                ...config,
                                jenisAsesmen: [...current, asesmen.key],
                              });
                            }
                          }}
                          className={`w-full flex items-start space-x-2.5 p-2 rounded-xl border text-left transition cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                              : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 mt-0.5 rounded flex items-center justify-center text-[10px] shrink-0 ${
                            isSelected ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </div>
                          <div>
                            <p className="font-semibold text-xs leading-snug">{asesmen.key}</p>
                            <p className="text-[10.5px] text-slate-500">{asesmen.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Pengesahan Guru & Kepala Madrasah */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <label className="block font-medium text-slate-500 mb-1 text-[11px]">Guru Pengampu (Otomatis)</label>
                    <input
                      type="text"
                      disabled
                      value={config.guruPengampu}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-500 mb-1 text-[11px]">Kepala Madrasah</label>
                    <input
                      type="text"
                      value={config.kepalaMadrasah}
                      onChange={(e) => setConfig({ ...config, kepalaMadrasah: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (activeDocType === 'cp' || activeDocType === 'atp') ? (
            /* Dedicated Form for Capaian Pembelajaran & Alur Tujuan Pembelajaran */
            <div className="space-y-4">
              {/* 1. Mapel & 2. Fase */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Mata Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={config.mapel}
                    onChange={(e) => setConfig({ ...config, mapel: e.target.value })}
                    placeholder="Contoh: Fiqih, Matematika..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Fase & Jenjang <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={config.fase}
                    onChange={(e) => setConfig({ ...config, fase: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
                  >
                    <option value="E">Fase E (Kelas X)</option>
                    <option value="F">Fase F (Kelas XI & XII)</option>
                  </select>
                </div>
              </div>

              {/* 3. Alokasi Jam Pelajaran */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-800">
                    Alokasi Jam Pelajaran <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Total JP Fase / Tahunan</span>
                </div>
                <input
                  type="text"
                  value={config.alokasiWaktu || ''}
                  onChange={(e) => setConfig({ ...config, alokasiWaktu: e.target.value })}
                  placeholder="Contoh: 72 JP (2 JP x 36 Minggu) atau 108 JP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              {/* 4. Capaian Pembelajaran (CP) * (lihat referensi CP) */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <div className="flex items-center space-x-1.5 flex-wrap">
                    <label className="font-bold text-slate-900 text-xs">
                      Capaian Pembelajaran (CP) <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <a
                      href="https://kurikulum.kemendikdasmen.go.id/panduan-mapel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors border border-emerald-200/60"
                      title="Buka Referensi CP Resmi Kemendikdasmen di tab baru"
                    >
                      <span>(lihat referensi CP)</span>
                      <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadSampleCP}
                    className="text-[10px] text-emerald-700 hover:text-emerald-800 underline font-medium cursor-pointer"
                  >
                    Muat Contoh Teks CP
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed">
                  <p className="font-semibold flex items-center space-x-1">
                    <span>💡</span>
                    <span>Panduan Pengisian:</span>
                  </p>
                  <p className="mt-0.5">
                    Tempel seluruh teks CP mata pelajaran ini (semua elemen sekaligus) — AI akan memecahnya menjadi ATP.
                  </p>
                </div>

                <textarea
                  rows={6}
                  value={config.capaianPembelajaranTeks || ''}
                  onChange={(e) => setConfig({ ...config, capaianPembelajaranTeks: e.target.value })}
                  placeholder="Tempel seluruh teks CP mata pelajaran di sini (Capaian Umum Fase beserta semua Elemen sekaligus: misal Elemen Pemahaman, Elemen Keterampilan Proses, dll.)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-xs font-mono leading-relaxed"
                />

                <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                  <span>Karakter: {(config.capaianPembelajaranTeks || '').length}</span>
                  {config.capaianPembelajaranTeks && (
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, capaianPembelajaranTeks: '' })}
                      className="text-slate-400 hover:text-rose-600 transition underline cursor-pointer"
                    >
                      Kosongkan Teks CP
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Instruksi Khusus (opsional) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-800">
                    Instruksi Khusus <span className="text-slate-400 font-normal">(opsional)</span>
                  </label>
                  <span className="text-[10px] text-slate-400">Preferensi & Fokus</span>
                </div>
                <textarea
                  rows={2}
                  value={config.instruksiKhusus || ''}
                  onChange={(e) => setConfig({ ...config, instruksiKhusus: e.target.value })}
                  placeholder="Contoh: Urutkan alur dari yang mudah ke kompleks, sertakan asesmen diagnostik di awal, atau tekankan adab dan nilai Aswaja..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-xs"
                />
              </div>

              {/* Nilai KBC */}
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nilai KBC (Kurikulum Berbasis Cinta)</label>
                <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-[11px]">
                  {PANCA_CINTA_KBC.map((item) => (
                    <label key={item.nilai} className="block p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          checked={config.nilaiKBC.includes(item.nilai)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({ ...config, nilaiKBC: [...config.nilaiKBC, item.nilai] });
                            } else {
                              setConfig({
                                ...config,
                                nilaiKBC: config.nilaiKBC.filter((n) => n !== item.nilai),
                              });
                            }
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.nilai}</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">{item.deskripsi}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Guru & Kepala Madrasah Info */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Guru Pengampu</label>
                  <input
                    type="text"
                    value={config.guruPengampu}
                    onChange={(e) => setConfig({ ...config, guruPengampu: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Kepala Madrasah</label>
                  <input
                    type="text"
                    value={config.kepalaMadrasah}
                    onChange={(e) => setConfig({ ...config, kepalaMadrasah: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            /* General Form for Other Document Types */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={config.mapel}
                    onChange={(e) => setConfig({ ...config, mapel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Fase & Jenjang</label>
                  <select
                    value={config.fase}
                    onChange={(e) => setConfig({ ...config, fase: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="E">Fase E (Kelas X)</option>
                    <option value="F">Fase F (Kelas XI & XII)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Kelas</label>
                  <select
                    value={config.kelas}
                    onChange={(e) => setConfig({ ...config, kelas: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Semester</label>
                  <select
                    value={config.semester}
                    onChange={(e) => setConfig({ ...config, semester: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  >
                    <option value="1">Semester 1 (Gasal)</option>
                    <option value="2">Semester 2 (Genap)</option>
                    <option value="1 & 2">Satu Tahun Penuh (1 & 2)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Topik Materi Pokok</label>
                <input
                  type="text"
                  value={config.topikMateri}
                  onChange={(e) => setConfig({ ...config, topikMateri: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Alokasi Jam Pelajaran (JP)</label>
                <input
                  type="text"
                  value={config.alokasiWaktu}
                  onChange={(e) => setConfig({ ...config, alokasiWaktu: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Nilai KBC (Kurikulum Berbasis Cinta)</label>
                <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 text-[11px]">
                  {PANCA_CINTA_KBC.map((item) => (
                    <label key={item.nilai} className="block p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-transparent hover:border-slate-200">
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          checked={config.nilaiKBC.includes(item.nilai)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setConfig({ ...config, nilaiKBC: [...config.nilaiKBC, item.nilai] });
                            } else {
                              setConfig({
                                ...config,
                                nilaiKBC: config.nilaiKBC.filter((n) => n !== item.nilai),
                              });
                            }
                          }}
                          className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <span className="font-semibold text-slate-900 block">{item.nilai}</span>
                          <span className="text-[10px] text-slate-500 block leading-normal mt-0.5">{item.deskripsi}</span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pendekatan Pembelajaran</label>
                <input
                  type="text"
                  value={config.modelPembelajaran}
                  onChange={(e) => setConfig({ ...config, modelPembelajaran: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-medium text-slate-600 mb-1 text-[11px]">Guru Pengampu (Otomatis)</label>
                  <input
                    type="text"
                    disabled
                    value={config.guruPengampu}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 text-xs cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Kepala Madrasah</label>
                  <input
                    type="text"
                    value={config.kepalaMadrasah}
                    onChange={(e) => setConfig({ ...config, kepalaMadrasah: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>
            </div>
          )}

          {generationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <span className="font-bold shrink-0">Info:</span>
              <span className="flex-1">{generationError}</span>
            </div>
          )}

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerate}
            className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-2 shadow-xs"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Sedang Menyusun Perangkat Administrasi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate Dokumen Administrasi</span>
              </>
            )}
          </button>
        </div>

        {/* RIGHT PANEL: Document Preview (Formatted for screen and high-precision A4 Print/PDF) */}
        <div ref={printCardRef} className={`admin-print-card lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-6 print:w-full print:p-0 print:border-none print:shadow-none print:m-0 ${activeDocType === 'prosem' ? 'overflow-x-auto' : ''}`}>
          {/* Header Kop Resmi Madrasah Sesuai Format Resmi MA NU 01 Banyuputih */}
          <KopMadrasah
            identity={madrasahIdentity}
            rightTitle={getDocRightTitle(activeDocType)}
            rightSubtitle={getDocRightSubtitle(activeDocType)}
            ta={config.tahunPelajaran}
          />

          {generatedMarkdown ? (
            <div className="space-y-4">
              {/* Institutional Document Info Table */}
              <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/70 text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-slate-800 print:bg-slate-100/50 print:text-[10px] print:p-2">
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
                <div className="sm:col-span-2 pt-1 border-t border-slate-200 mt-1 flex justify-between">
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
            <div className="py-16 text-center text-slate-400 space-y-2">
              <FileSpreadsheet className="w-10 h-10 mx-auto opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">Belum ada dokumen administrasi yang digenerate.</p>
              <p className="text-xs text-slate-400">
                Pilih tab dokumen di atas (RPP Merdeka, Modul Ajar, CP & ATP, PROTA, PROSEM, KKTP, Umpan Balik) lalu klik "Generate Dokumen Administrasi".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
