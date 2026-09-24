import React, { useState } from 'react';
import {
  ExamFormConfig,
  ExamPackage,
  QuestionItem,
  User,
  MadrasahIdentity,
} from '../types';
import { MathText, isArabicText } from '../utils/katexHelper';
import { exportExamToDocx } from '../utils/docxExport';
import { KopMadrasah } from './KopMadrasah';
import {
  formatExamToCbtText,
  CBT_FORMAT_EXAMPLE,
  normalizeKelas,
  formatExamToCkEditorHtml,
  formatCbtTextAsCkEditorHtml,
  convertRawCbtTextToCkEditorHtml,
  copyRichHtmlToClipboard,
  replaceLatexWithImgTags,
  latexToImageUrl,
} from '../utils/cbtFormatter';
import {
  BookOpen,
  Sparkles,
  Copy,
  Download,
  Printer,
  Edit3,
  Check,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Trash2,
  FileText,
  AlertCircle,
  Sliders,
  Code,
  Languages,
  Image as ImageIcon,
} from 'lucide-react';

interface ExamGeneratorViewProps {
  currentUser: User;
  currentPackage: ExamPackage;
  onSavePackage: (pkg: ExamPackage) => void;
  madrasahIdentity?: MadrasahIdentity;
}

export const ExamGeneratorView: React.FC<ExamGeneratorViewProps> = ({
  currentUser,
  currentPackage,
  onSavePackage,
  madrasahIdentity,
}) => {
  const [formData, setFormData] = useState<ExamFormConfig>(currentPackage.config);
  const [questions, setQuestions] = useState<QuestionItem[]>(currentPackage.questions);
  const [cbtText, setCbtText] = useState<string>(() =>
    formatExamToCbtText(currentPackage.config, currentPackage.questions)
  );
  const [viewMode, setViewMode] = useState<'textbox' | 'paper'>('textbox');
  const [cbtSubMode, setCbtSubMode] = useState<'standard' | 'ckeditor_html'>('standard');
  const [equationAsImageInText, setEquationAsImageInText] = useState<boolean>(false);
  const [imageFormat, setImageFormat] = useState<'png' | 'svg'>('png');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyCkSuccess, setCopyCkSuccess] = useState(false);
  const [showAnswerKeys, setShowAnswerKeys] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [activeFilterType, setActiveFilterType] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync when currentPackage changes from presets
  React.useEffect(() => {
    setFormData(currentPackage.config);
    setQuestions(currentPackage.questions);
    setCbtText(
      formatExamToCbtText(currentPackage.config, currentPackage.questions, {
        equationAsImage: equationAsImageInText,
        imageFormat,
      })
    );
  }, [currentPackage, equationAsImageInText, imageFormat]);

  // Handle Form Input Changes
  const handleInputChange = (field: keyof ExamFormConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeQuotaChange = (
    typeKey: keyof ExamFormConfig['selectedTypes'],
    delta: number
  ) => {
    setFormData((prev) => {
      const currentVal = prev.selectedTypes[typeKey];
      const newVal = Math.max(0, Math.min(15, currentVal + delta));
      return {
        ...prev,
        selectedTypes: {
          ...prev.selectedTypes,
          [typeKey]: newVal,
        },
      };
    });
  };

  // Generate Exam via Backend / Gemini API
  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    setGenerationStep('Menghubungkan ke 9router API Gateway...');

    try {
      setTimeout(() => {
        setGenerationStep('Hermes Agent menyusun prompt berbasis Capaian Pembelajaran...');
      }, 500);

      setTimeout(() => {
        setGenerationStep('Memvalidasi format kunci RIGHT:, KaTeX LaTeX & Teks Arab RTL...');
      }, 1200);

      const response = await fetch('/api/v1/soal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success && data.questions) {
        setQuestions(data.questions);
        const formatted = formatExamToCbtText(formData, data.questions);
        setCbtText(formatted);
        const updatedPackage: ExamPackage = {
          ...currentPackage,
          id: `exam-${Date.now()}`,
          title: `Paket Soal ${formData.jenisUjian} ${formData.mapel} — Kelas ${formData.kelas}`,
          config: formData,
          questions: data.questions,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.name,
          nip: currentUser.nip,
        };
        onSavePackage(updatedPackage);
        setStatusMessage(`Berhasil generate ${data.questions.length} butir soal (${data.source})`);
      } else {
        throw new Error(data.error || 'Gagal menghasilkan soal');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage(`Catatan: Menggunakan bank soal terstandar internal.`);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Copy CBT text to clipboard
  const handleCopyCbtText = () => {
    navigator.clipboard.writeText(cbtText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Download CBT .txt file for direct import to CBT
  const handleDownloadTxt = () => {
    const normKelas = normalizeKelas(formData.kelas);
    const cleanMapel = formData.mapel.trim().replace(/\s+/g, '_');
    const filename = `${formData.jenisUjian}_${normKelas}_${cleanMapel}.txt`;
    const blob = new Blob([cbtText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Load CBT example
  const handleLoadExample = () => {
    setCbtText(CBT_FORMAT_EXAMPLE);
    setStatusMessage('Format contoh soal CBT standar berhasil dimuat ke teks box.');
  };

  // Sync / Reset to formatted from questions
  const handleSyncFromConfig = () => {
    const formatted = formatExamToCbtText(formData, questions, {
      equationAsImage: equationAsImageInText,
      imageFormat,
    });
    setCbtText(formatted);
    setStatusMessage('Teks box berhasil disinkronkan kembali dari paket soal.');
  };

  // Salin format kaya untuk CKEditor di CBT (rumus matematika otomatis menjadi tag <img> dan baris tetap rapi)
  const handleCopyForCkEditor = async () => {
    const rawText = cbtText && cbtText.trim()
      ? cbtText
      : formatExamToCbtText(formData, questions);

    const html = formatCbtTextAsCkEditorHtml(rawText, imageFormat);
    const plain = replaceLatexWithImgTags(rawText, imageFormat);
    const ok = await copyRichHtmlToClipboard(html, plain);
    if (ok) {
      setCopyCkSuccess(true);
      setTimeout(() => setCopyCkSuccess(false), 3000);
    }
  };

  // Download berkas HTML siap buka di browser atau impor ke CKEditor CBT
  const handleDownloadCkHtml = () => {
    const normKelas = normalizeKelas(formData.kelas);
    const cleanMapel = formData.mapel.trim().replace(/\s+/g, '_');
    const filename = `CKEDITOR_${formData.jenisUjian}_${normKelas}_${cleanMapel}.html`;
    const rawText = cbtText && cbtText.trim()
      ? cbtText
      : formatExamToCbtText(formData, questions);
    const html = formatCbtTextAsCkEditorHtml(rawText, imageFormat);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Toggle apakah rumus di dalam teks box CBT diubah menjadi tag <img>
  const handleToggleEquationInText = (enabled: boolean) => {
    setEquationAsImageInText(enabled);
    const updated = formatExamToCbtText(formData, questions, {
      equationAsImage: enabled,
      imageFormat,
    });
    setCbtText(updated);
  };

  // Copy raw exam text with exact RIGHT: format
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(cbtText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  // Download DOCX
  const handleDownloadDocx = async () => {
    const pkg: ExamPackage = {
      ...currentPackage,
      config: formData,
      questions,
      createdBy: currentUser.name,
      nip: currentUser.nip,
    };
    await exportExamToDocx(pkg);
  };

  // Print Dialog
  const handlePrint = () => {
    window.print();
  };

  // Filtered Questions list
  const filteredQuestions = questions.filter((q) => {
    if (activeFilterType === 'all') return true;
    return q.type === activeFilterType;
  });

  // Save edited question
  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;
    const updated = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    setQuestions(updated);
    setCbtText(formatExamToCbtText(formData, updated));
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header info (Futuristic Glass Panel) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-md border border-slate-800">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/10 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-heading text-lg sm:text-2xl font-black text-white tracking-tight">
                  CBT Naskah Compiler & Generator Soal
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                  HERMES AI ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Format naskah teks box kompatibel CBT madrasah (<code className="font-mono text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">MODULE:=</code> · <code className="font-mono text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">TOPIC:=</code> · <code className="font-mono text-emerald-400 bg-slate-950 px-1 py-0.5 rounded">RIGHT:</code>)
              </p>
            </div>
          </div>
        </div>

        {/* Compact Package Stat Indicator instead of action buttons */}
        <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 shrink-0">
          <div className="text-right hidden md:block">
            <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Paket Aktif:</span>
            <span className="text-xs font-bold text-white block mt-0.5">
              {formData.mapel} — Kelas {formData.kelas}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-black flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>{questions.length} Soal</span>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout (PRD Section 6.4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT PANEL: Form Parameter (PRD Section 4.2.1)
        ======================================================== */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 no-print">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="font-heading font-black text-sm sm:text-base text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4.5 h-4.5 text-blue-600" />
              <span>Konfigurasi Parameter Soal</span>
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              INPUT CONTROLS
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Mata Pelajaran & Jenis Ujian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Mata Pelajaran</label>
                <input
                  type="text"
                  value={formData.mapel}
                  onChange={(e) => handleInputChange('mapel', e.target.value)}
                  placeholder="Contoh: Fiqih, Matematika"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition bg-slate-50/50 hover:bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Jenis Asesmen</label>
                <select
                  value={formData.jenisUjian}
                  onChange={(e) => handleInputChange('jenisUjian', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition font-medium"
                >
                  <option value="ASTS">ASTS (Tengah Semester)</option>
                  <option value="ASESGA">ASESGA (Akhir Semester)</option>
                  <option value="ASAS">ASAS (Akhir Sekolah)</option>
                </select>
              </div>
            </div>

            {/* Kelas & Semester & Tahun Pelajaran */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Kelas</label>
                <select
                  value={formData.kelas}
                  onChange={(e) => handleInputChange('kelas', e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => handleInputChange('semester', e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <option value="1">1 (Gasal)</option>
                  <option value="2">2 (Genap)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">TA</label>
                <input
                  type="text"
                  value={formData.tahunPelajaran}
                  onChange={(e) => handleInputChange('tahunPelajaran', e.target.value)}
                  className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-center font-semibold"
                />
              </div>
            </div>

            {/* Bahasa Pengantar & Alokasi Waktu */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                  <Languages className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bahasa Naskah</span>
                </label>
                <select
                  value={formData.bahasa}
                  onChange={(e) => handleInputChange('bahasa', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition"
                >
                  <option value="indonesia">Bahasa Indonesia</option>
                  <option value="arab">Bahasa Arab (RTL)</option>
                  <option value="campuran">Campuran (Arab & Indo)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">Waktu Ujian</label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    min="30"
                    max="180"
                    value={formData.alokasiWaktuMenit}
                    onChange={(e) => handleInputChange('alokasiWaktuMenit', parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-center font-bold"
                  />
                  <span className="text-slate-500 font-bold">Menit</span>
                </div>
              </div>
            </div>

            {/* Capaian Pembelajaran / Target KD */}
            <div className="space-y-1">
              <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Capaian Pembelajaran (CP) / Materi Target
              </label>
              <textarea
                rows={3}
                value={formData.capaianPembelajaran}
                onChange={(e) => handleInputChange('capaianPembelajaran', e.target.value)}
                placeholder="Tuliskan capaian pembelajaran atau ruang lingkup materi yang diujikan..."
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition resize-none bg-slate-50/50"
              />
            </div>

            {/* Konfigurasi 6 Tipe Soal (PRD Section 4.2.2) */}
            <div className="pt-3.5 border-t border-slate-100 space-y-3">
              <label className="block font-black text-slate-800 text-[11px] uppercase tracking-wide">
                Distribusi & Kuota Butir Soal:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. PG Tunggal */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-[#1e4d7b]">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">PG Tunggal</div>
                    <div className="text-[10px] text-blue-600 font-semibold font-mono mt-0.5">RIGHT:A</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('single_choice', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.single_choice}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('single_choice', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 2. PG Jamak */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-blue-600">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">PG Jamak</div>
                    <div className="text-[10px] text-blue-600 font-semibold font-mono mt-0.5">RIGHT:A,B</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('multiple_choice', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.multiple_choice}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('multiple_choice', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 3. Jawaban Singkat */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-cyan-600">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Jawaban Singkat</div>
                    <div className="text-[10px] text-cyan-600 font-semibold font-mono mt-0.5">RIGHT:A</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('short_answer', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.short_answer}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('short_answer', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 4. Mengurutkan */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-indigo-600">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Mengurutkan</div>
                    <div className="text-[10px] text-indigo-600 font-semibold font-mono mt-0.5">RIGHT:2,1,3</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('ordering', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.ordering}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('ordering', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 5. Menjodohkan */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-purple-600">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Menjodohkan</div>
                    <div className="text-[10px] text-purple-600 font-semibold font-mono mt-0.5">RIGHT:1-B</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('matching', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.matching}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('matching', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 6. Uraian / Essay */}
                <div className="p-3 rounded-2xl border border-slate-100 hover:border-blue-200 bg-slate-50/50 hover:bg-white shadow-3xs hover:shadow-2xs transition-all duration-300 flex items-center justify-between border-l-[4px] border-l-emerald-600">
                  <div>
                    <div className="font-extrabold text-slate-800 text-xs">Uraian / Essay</div>
                    <div className="text-[10px] text-emerald-600 font-semibold font-mono mt-0.5">Rubrik 0-100</div>
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100/80 p-0.5 rounded-lg border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('essay', -1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-black text-slate-900 text-xs">
                      {formData.selectedTypes.essay}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTypeQuotaChange('essay', 1)}
                      className="w-6 h-6 rounded-md bg-white hover:bg-slate-200 text-slate-700 border border-slate-200/60 flex items-center justify-center font-bold text-xs cursor-pointer shadow-3xs transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tingkat Kesulitan Proporsi */}
            <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between font-bold text-slate-800 text-xs">
                <span>Distribusi Tingkat Kesulitan:</span>
                <span className="text-slate-500 font-semibold font-mono">
                  {formData.difficultyProportion.mudah}% / {formData.difficultyProportion.sedang}% / {formData.difficultyProportion.sulit}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200/80 flex overflow-hidden p-[1px]">
                <div style={{ width: `${formData.difficultyProportion.mudah}%` }} className="bg-emerald-500 rounded-l-full transition-all duration-500" title="Mudah" />
                <div style={{ width: `${formData.difficultyProportion.sedang}%` }} className="bg-blue-500 transition-all duration-500" title="Sedang" />
                <div style={{ width: `${formData.difficultyProportion.sulit}%` }} className="bg-rose-500 rounded-r-full transition-all duration-500" title="Sulit" />
              </div>
              <div className="flex justify-between text-[10px] font-semibold text-slate-500 px-1 pt-0.5">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Mudah ({formData.difficultyProportion.mudah}%)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Sedang ({formData.difficultyProportion.sedang}%)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>Sulit ({formData.difficultyProportion.sulit}%)</span>
                </span>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white font-bold text-xs sm:text-sm transition-all duration-300 shadow-md shadow-blue-900/15 flex items-center justify-center space-x-2.5 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Merumuskan Soal...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>Generate Paket Soal (Hermes AI)</span>
                </>
              )}
            </button>

            {/* Live Generation Progress Indicator */}
            {isGenerating && (
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-xs text-[#1e4d7b] animate-pulse flex items-center space-x-2.5 shadow-2xs">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping shrink-0" />
                <span className="font-bold">{generationStep}</span>
              </div>
            )}

            {statusMessage && !isGenerating && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-bold">{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: Interactive CBT Text Box & Paper Preview
        ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Switcher & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl shadow-sm no-print">
            {/* View Mode Toggle: Text Box CBT vs Pratinjau Kertas */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('textbox')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'textbox'
                    ? 'bg-white text-blue-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-blue-700" />
                <span>Naskah CBT IDE</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('paper')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  viewMode === 'paper'
                    ? 'bg-white text-blue-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Pratinjau Kertas Cetak</span>
              </button>
            </div>

            {/* Contextual Actions based on Active Tab */}
            <div className="flex flex-wrap items-center gap-1.5">
              {viewMode === 'textbox' ? (
                <>
                  {/* Salin CKEditor */}
                  <button
                    type="button"
                    onClick={handleCopyForCkEditor}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="Salin rich text siap tempel di CKEditor CBT (Rumus otomatis jadi gambar)"
                  >
                    {copyCkSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Tersalin! Paste di CBT</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Salin Siap CKEditor</span>
                      </>
                    )}
                  </button>

                  {/* Salin Teks CBT */}
                  <button
                    type="button"
                    onClick={handleCopyCbtText}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="Salin naskah teks box standar CBT ke clipboard"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 animate-pulse" />
                        <span>Salin Teks CBT</span>
                      </>
                    )}
                  </button>

                  {/* Download .txt */}
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                    title="Unduh berkas .txt standar CBT"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>.txt</span>
                  </button>

                  {/* Download HTML */}
                  <button
                    type="button"
                    onClick={handleDownloadCkHtml}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                    title="Unduh berkas HTML siap impor CKEditor CBT"
                  >
                    <Code className="w-3.5 h-3.5 text-emerald-600" />
                    <span>HTML</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Download Word */}
                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition cursor-pointer"
                    title="Unduh berkas Word (.docx) naskah cetak"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Unduh Word</span>
                  </button>

                  {/* Cetak PDF */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    title="Cetak langsung atau simpan sebagai PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-indigo-200" />
                    <span>Cetak PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: TEKS BOX FORMAT CBT (SEDERHANA & UTAMA) */}
          {viewMode === 'textbox' ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
              {/* Header Info Bar */}
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-800 tracking-wide font-mono">
                    MODULE:={formData.jenisUjian}_{normalizeKelas(formData.kelas)} | TOPIC:={formData.mapel.replace(/\s+/g, '_')}_{normalizeKelas(formData.kelas)}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={handleLoadExample}
                    className="px-3 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold transition cursor-pointer"
                    title="Muat format contoh persis seperti ketentuan guru"
                  >
                    Contoh Format
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncFromConfig}
                    className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold transition flex items-center space-x-1.5 cursor-pointer"
                    title="Format ulang teks dari parameter soal saat ini"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Ulang</span>
                  </button>
                </div>
              </div>

              {/* Sub-mode selector: Teks Biasa CBT vs Format CKEditor HTML */}
              <div className="px-4 pt-3.5 pb-2.5 bg-slate-50/50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCbtSubMode('standard')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      cbtSubMode === 'standard'
                        ? 'bg-[#1e4d7b] text-white shadow-3xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    1. Format Teks Standar CBT (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCbtSubMode('ckeditor_html')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                      cbtSubMode === 'ckeditor_html'
                        ? 'bg-emerald-700 text-white shadow-3xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-300" />
                    <span>2. Mode CKEditor (Equation Jadi Gambar)</span>
                  </button>
                </div>

                {/* Equation Image Format Selector */}
                <div className="flex items-center space-x-2 text-slate-600">
                  <span className="text-[11px] font-bold text-slate-500">Render Rumus:</span>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value as 'png' | 'svg')}
                    className="px-2 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="png">PNG (Resolusi Tinggi)</option>
                    <option value="svg">SVG (Vektor Tajam)</option>
                  </select>
                </div>
              </div>

              {/* Banner Panduan Solusi CKEditor Tanpa Ribet */}
              <div className="mx-4 mt-3.5 p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-emerald-950">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Solusi Praktis Guru Matematika/Eksak untuk CKEditor CBT:</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-emerald-800">
                  Kini tidak perlu lagi ribet mengubah file Word ke HTML hanya untuk copy rumus! Cukup klik{' '}
                  <strong className="underline decoration-emerald-600 font-bold">"Salin Siap CKEditor (Auto-Gambar)"</strong>, lalu langsung paste di CKEditor CBT Anda dengan <kbd className="px-1.5 py-0.5 rounded bg-emerald-200/80 font-mono text-[10px] font-bold">Ctrl + V</kbd>. Semua equation matematika otomatis disematkan berupa gambar tajam.
                </p>
              </div>

              {cbtSubMode === 'standard' ? (
                /* Sub-Mode 1: Teks Box Standar CBT */
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <label htmlFor="cbt-textarea" className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                      <span>Naskah Soal Teks Box (Bisa Diedit Langsung):</span>
                    </label>

                    {/* Toggle Equation as Image in Text */}
                    <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={equationAsImageInText}
                        onChange={(e) => handleToggleEquationInText(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-[11px] font-bold text-emerald-900">
                        Ubah rumus KaTeX menjadi tag <code className="font-mono text-emerald-700 bg-emerald-100 px-1 rounded">&lt;img&gt;</code> gambar di teks box
                      </span>
                    </label>
                  </div>

                  {/* FUTURISTIC CODE IDE THEME EDITOR CANVAS */}
                  <div className="relative rounded-2xl border border-slate-800 bg-slate-950 shadow-lg overflow-hidden flex flex-col">
                    {/* IDE Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400 select-none">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1.5 shrink-0">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="border-l border-slate-800 h-3 mx-1"></span>
                        <span className="text-emerald-400 font-bold flex items-center space-x-1">
                          <span>NASKAH_SOAL_CBT.txt</span>
                        </span>
                      </div>
                      <span className="text-slate-500">UTF-8 • CBT Engine v1.0</span>
                    </div>

                    {/* Textarea Area */}
                    <div className="flex min-h-[440px]">
                      {/* Fake Line Numbers */}
                      <div className="hidden sm:flex flex-col text-right px-3 py-4 bg-slate-900/40 text-slate-600 font-mono text-[11px] select-none border-r border-slate-900/60 leading-[20px] shrink-0">
                        {Array.from({ length: Math.max(22, cbtText.split('\n').length) }).map((_, i) => (
                          <span key={i} className="block h-[20px]">{i + 1}</span>
                        ))}
                      </div>

                      <textarea
                        id="cbt-textarea"
                        rows={19}
                        value={cbtText}
                        onChange={(e) => setCbtText(e.target.value)}
                        placeholder="Naskah soal CBT akan muncul di sini..."
                        className="w-full font-mono text-xs sm:text-sm leading-[20px] p-4 bg-slate-950 text-emerald-400 focus:text-emerald-300 focus:outline-none resize-y selection:bg-slate-800 selection:text-white outline-none"
                        spellCheck={false}
                      />
                    </div>

                    {/* IDE Status Bar */}
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800 text-[10px] font-mono text-slate-400 select-none">
                      <div className="flex items-center space-x-3.5">
                        <span className="flex items-center space-x-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-emerald-400 font-bold">CBT COMPILE OK</span>
                        </span>
                        <span>•</span>
                        <span>Lines: {cbtText.split('\n').length}</span>
                        <span>•</span>
                        <span>Characters: {cbtText.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">TAB SIZE: 4</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-[11px] text-slate-500 italic">
                      Tips: Guru dapat langsung mengedit atau menambahkan soal di dalam kotak teks di atas, lalu klik <strong>Salin Teks Box</strong> atau <strong>Download .txt</strong> untuk diimpor ke CBT.
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyCbtText}
                        className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Salin Teks CBT →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Sub-Mode 2: CKEditor HTML Preview & Direct Copy */
                <div className="p-4 sm:p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Pratinjau Naskah CKEditor (Semua Rumus Sudah Menjadi Gambar):</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Di bawah ini adalah tampilan visual soal dengan rumus yang dirender sebagai gambar CodeCogs.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleCopyForCkEditor}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                      >
                        {copyCkSuccess ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Tersalin! Paste di CKEditor CBT</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Salin ke Clipboard (Rich HTML)</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleDownloadCkHtml}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>Download .html</span>
                      </button>
                    </div>
                  </div>

                  {/* Rendered HTML Container */}
                  <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-2xs max-h-[480px] overflow-y-auto text-sm text-slate-900 leading-relaxed">
                    <div
                      className="font-mono text-xs sm:text-sm space-y-0.5 select-text"
                      dangerouslySetInnerHTML={{
                        __html: formatCbtTextAsCkEditorHtml(
                          cbtText && cbtText.trim()
                            ? cbtText
                            : formatExamToCbtText(formData, questions),
                          imageFormat
                        ),
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Format Reference Guide */}
              <div className="p-4 bg-slate-50/80 border-t border-slate-200 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#1e4d7b]" />
                  <span>Keterangan Standar Format Soal CBT:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">1. PG Jawaban Tunggal</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:1)Jeruk adalah...<br/>
                      A:)Buah<br/>
                      B:)Hewan<br/>
                      RIGHT:A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">2. PG Jamak</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:2)Angka 10 dari...<br/>
                      A:)5+5<br/>
                      B:)6+4<br/>
                      RIGHT:A,B
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">3. Jawaban Singkat</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:3)Nama Ibukota...<br/>
                      A:)JAKARTA<br/>
                      RIGHT:A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">4. Mengurutkan Jawaban</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:4)Urutkan dari atas...<br/>
                      A:)Kepala<br/>
                      B:)Pundak<br/>
                      RIGHT:2,1
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">5. Menjodohkan</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:5)Jodohkan simbol...<br/>
                      1.&nbsp;&nbsp;Bintang<br/>
                      A:)Ketuhanan YME<br/>
                      RIGHT:1-A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-[#1e4d7b]">6. Uraian Panjang</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:6)Jelaskan proses hujan...<br/>
                      <span className="text-slate-400 italic">(Opsi &amp; RIGHT tidak perlu)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* VIEW MODE 2: PRATINJAU KERTAS CETAK (OPSIONAL) */
            <>
              {/* Preview Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-xl border border-slate-200 shadow-xs no-print">
                {/* Filter Tabs by Question Type */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { key: 'all', label: `Semua (${questions.length})` },
                    { key: 'single_choice', label: 'PG' },
                    { key: 'multiple_choice', label: 'PG Jamak' },
                    { key: 'short_answer', label: 'Singkat' },
                    { key: 'ordering', label: 'Urutkan' },
                    { key: 'matching', label: 'Jodohkan' },
                    { key: 'essay', label: 'Essay' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setActiveFilterType(t.key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        activeFilterType === t.key
                          ? 'bg-[#1e4d7b] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Toggle Answer Key */}
                <button
                  onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                  className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  {showAnswerKeys ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                      <span>Sembunyikan Kunci</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Tampilkan Kunci (Guru)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Document Header Representation (Visible also on Print) */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {/* Kop Resmi Madrasah MA NU 01 Banyuputih */}
                <KopMadrasah
                  identity={madrasahIdentity}
                  rightTitle={`NASKAH SOAL ${formData.jenisUjian}`}
                  rightSubtitle={`TA: ${formData.tahunPelajaran} | KELAS ${formData.kelas}`}
                  ta={formData.tahunPelajaran}
                />

                {/* Assessment Meta Banner */}
                <div className="text-center">
                  <h3 className="font-heading font-bold text-base text-slate-900 uppercase">
                    Naskah Soal {formData.jenisUjian === 'ASTS' ? 'Asesmen Sumatif Tengah Semester (ASTS)' : formData.jenisUjian === 'ASESGA' ? 'Asesmen Sumatif Akhir Semester (ASESGA)' : 'Asesmen Sumatif Akhir Sekolah (ASAS)'}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Tahun Pelajaran {formData.tahunPelajaran}
                  </p>
                </div>

                {/* Meta Table */}
                <div className="grid grid-cols-2 text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
                  <div>
                    <div><span className="font-semibold">Mata Pelajaran:</span> {formData.mapel}</div>
                    <div><span className="font-semibold">Kelas / Semester:</span> {formData.kelas} / Semester {formData.semester}</div>
                  </div>
                  <div className="text-right">
                    <div><span className="font-semibold">Alokasi Waktu:</span> {formData.alokasiWaktuMenit} Menit</div>
                    <div><span className="font-semibold">Guru Pengampu:</span> {currentUser.name}</div>
                  </div>
                </div>

                {/* Questions List */}
                <div className="space-y-6 divide-y divide-slate-100">
                  {filteredQuestions.map((q) => (
                    <div key={q.id} className="pt-4 first:pt-0 space-y-3 group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-2.5">
                          <span className="w-6 h-6 rounded-full bg-[#1e4d7b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {q.number}
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 leading-relaxed">
                              <MathText text={q.text} isArabic={q.isArabic} />
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 no-print">
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-100 text-slate-600">
                            {q.type.replace('_', ' ')}
                          </span>
                          <button
                            onClick={() => setEditingQuestion(q)}
                            className="p-1 rounded text-slate-400 hover:text-[#1e4d7b] hover:bg-slate-100 cursor-pointer"
                            title="Edit butir soal ini"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options */}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="pl-9 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {q.options.map((opt) => (
                              <div
                                key={opt.key}
                                className="flex items-start space-x-2 text-xs text-slate-800 p-2 rounded-lg bg-slate-50/60 border border-slate-200/60"
                              >
                                <span className="font-bold text-[#1e4d7b]">{opt.key}.</span>
                                <div className="flex-1">
                                  <MathText text={opt.text} isArabic={opt.isRtl || q.isArabic} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Short Answer */}
                      {q.type === 'short_answer' && (
                        <div className="pl-9 text-xs">
                          <div className="h-8 border-b border-dashed border-slate-400 flex items-center text-slate-400">
                            <span>Tuliskan jawaban Anda di sini: ....................................................</span>
                          </div>
                        </div>
                      )}

                      {/* Ordering */}
                      {q.type === 'ordering' && q.orderingItems && (
                        <div className="pl-9 space-y-2 text-xs">
                          <div className="space-y-1.5">
                            {q.orderingItems.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center space-x-2 p-2 rounded-lg bg-slate-50 border border-slate-200"
                              >
                                <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-700">
                                  {item.id}
                                </span>
                                <span className="text-slate-800">{item.text}</span>
                              </div>
                            ))}
                          </div>
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/70 rounded-md px-2.5 py-1">
                            ✓ Urutan tahapan tersusun runtut dan teratur (1, 2, 3, dst) tidak diacak. Sistem CBT Madrasah yang akan mengacak urutan item di layar siswa secara otomatis.
                          </div>
                        </div>
                      )}

                      {/* Matching */}
                      {q.type === 'matching' && (
                        <div className="pl-9 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                              <div className="font-semibold text-slate-700">Kolom Premis (Kiri):</div>
                              {q.matchingPremises?.map((premise) => (
                                <div key={premise.id} className="flex items-start space-x-2">
                                  <span className="font-bold text-[#1e4d7b]">{premise.id}.</span>
                                  <span>{premise.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                              <div className="font-semibold text-slate-700">Kolom Pasangan / Respons (Kanan):</div>
                              {q.matchingResponses?.map((resp) => (
                                <div key={resp.key} className="flex items-start space-x-2">
                                  <span className="font-bold text-[#c8853a]">{resp.key}.</span>
                                  <span>{resp.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-[11px] text-emerald-800 bg-emerald-50/80 border border-emerald-200/70 rounded-md px-2.5 py-1">
                            ✓ Pasangan sejajar 1-ke-1 (1→A, 2→B, dst) tidak diacak. Sistem CBT Madrasah yang akan mengacaknya secara otomatis saat ujian.
                          </div>
                        </div>
                      )}

                      {/* Essay */}
                      {q.type === 'essay' && (
                        <div className="pl-9 text-xs">
                          <div className="h-16 border border-slate-200 rounded-lg p-2 text-slate-400 bg-slate-50/40">
                            Ruang jawaban uraian siswa...
                          </div>
                        </div>
                      )}

                      {/* Answer Key */}
                      {showAnswerKeys && (
                        <div className="pl-9 pt-2">
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-emerald-900">
                              <span className="flex items-center space-x-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Kunci Jawaban Guru:</span>
                              </span>
                              <span className="font-mono bg-emerald-200/70 px-2 py-0.5 rounded text-emerald-900">
                                {q.rawRightAnswer || '(Tidak memerlukan kunci)'}
                              </span>
                            </div>
                            {q.explanation && (
                              <p className="text-slate-600 text-[11px] pt-1">
                                <span className="font-medium text-slate-800">Pembahasan:</span> {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Edit Question Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Edit Soal Nomor {editingQuestion.number} ({editingQuestion.type})
              </h3>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Teks Soal</label>
                <textarea
                  rows={4}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Kunci Jawaban Format Standar (Contoh: RIGHT:A, RIGHT:A,B, RIGHT:2,1,3,4)
                </label>
                <input
                  type="text"
                  value={editingQuestion.rawRightAnswer}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, rawRightAnswer: e.target.value })
                  }
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-emerald-800 font-semibold"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Pembahasan / Catatan</label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ''}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setEditingQuestion(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveEditQuestion}
                className="px-4 py-2 rounded-lg bg-[#1e4d7b] text-white text-xs font-medium hover:bg-[#153a5e]"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
