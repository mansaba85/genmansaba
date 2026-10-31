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
import { fetchApiJson } from '../utils/apiClient';
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
  AlertTriangle,
  Sliders,
  Code,
  Languages,
  Image as ImageIcon,
  Upload,
  Wand2,
  ImagePlus,
  ExternalLink,
  X,
} from 'lucide-react';

export function getFallbackDiagramSvg(mapel?: string, title?: string): string {
  const cleanTitle = (title || 'Diagram Soal')
    .replace(/Q:\d+\)/gi, '')
    .replace(/[<>&"']/g, '')
    .trim()
    .slice(0, 80);
  const cleanMapel = (mapel || 'Kurikulum Merdeka')
    .replace(/[<>&"']/g, '')
    .slice(0, 35);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 512" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8fafc"/>
      </linearGradient>
      <linearGradient id="hGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#093d25"/>
        <stop offset="100%" stop-color="#15803d"/>
      </linearGradient>
    </defs>
    <rect width="768" height="512" fill="url(#bgGrad2)"/>
    <rect x="12" y="12" width="744" height="488" rx="14" fill="none" stroke="#093d25" stroke-width="2"/>
    <rect x="20" y="20" width="728" height="52" rx="8" fill="url(#hGrad2)"/>
    <text x="36" y="52" font-family="sans-serif" font-weight="900" font-size="15" fill="#fef08a">MA NU 01 BANYUPUTIH</text>
    <text x="280" y="52" font-family="sans-serif" font-weight="600" font-size="12" fill="#86efac">· DIAGRAM STIMULUS RESMI ·</text>
    <rect x="620" y="32" width="112" height="28" rx="6" fill="#052e16" stroke="#fbbf24" stroke-width="1"/>
    <text x="676" y="50" font-family="sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">${cleanMapel}</text>
    <g transform="translate(48, 96)">
      <rect x="0" y="0" width="672" height="320" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      <circle cx="210" cy="155" r="95" fill="#ecfdf5" stroke="#059669" stroke-width="2"/>
      <circle cx="210" cy="155" r="55" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5" stroke-dasharray="3,3"/>
      <circle cx="210" cy="155" r="22" fill="#dcfce7" stroke="#047857" stroke-width="2"/>
      <line x1="90" y1="155" x2="330" y2="155" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
      <line x1="210" y1="35" x2="210" y2="275" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
      <path d="M 270 100 L 390 70 L 460 70" fill="none" stroke="#0f766e" stroke-width="2"/>
      <circle cx="270" cy="100" r="4" fill="#0f766e"/>
      <rect x="470" y="56" width="180" height="30" rx="6" fill="#f0fdfa" stroke="#0d9488" stroke-width="1"/>
      <text x="480" y="76" font-family="sans-serif" font-weight="700" font-size="12" fill="#134e4a">Komponen [A] Pengamatan</text>
      <path d="M 225 155 L 390 155 L 460 155" fill="none" stroke="#2563eb" stroke-width="2"/>
      <circle cx="225" cy="155" r="4" fill="#2563eb"/>
      <rect x="470" y="140" width="180" height="30" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1"/>
      <text x="480" y="160" font-family="sans-serif" font-weight="700" font-size="12" fill="#1e3a8a">Komponen [B] Pusat Reaksi</text>
      <path d="M 270 210 L 390 240 L 460 240" fill="none" stroke="#d97706" stroke-width="2"/>
      <circle cx="270" cy="210" r="4" fill="#d97706"/>
      <rect x="470" y="225" width="180" height="30" rx="6" fill="#fffbeb" stroke="#f59e0b" stroke-width="1"/>
      <text x="480" y="245" font-family="sans-serif" font-weight="700" font-size="12" fill="#78350f">Komponen [C] Variabel Uji</text>
      <rect x="0" y="280" width="672" height="40" rx="0 0 10 10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="18" y="304" font-family="sans-serif" font-weight="700" font-size="12" fill="#334155">Stimulus Soal:</text>
      <text x="110" y="304" font-family="sans-serif" font-weight="500" font-size="12" fill="#475569">${cleanTitle}</text>
    </g>
    <text x="48" y="475" font-family="sans-serif" font-size="10" fill="#64748b">Asesmen Standar MA NU 01 Banyuputih · LP Ma'arif NU Batang</text>
    <text x="720" y="475" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669" text-anchor="end">OTENTIK</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface ExamGeneratorViewProps {
  currentUser: User;
  currentPackage: ExamPackage;
  onSavePackage: (pkg: ExamPackage) => void;
  madrasahIdentity?: MadrasahIdentity;
}

type QuestionTypeKey = keyof ExamFormConfig['selectedTypes'];

const QUESTION_TYPE_META: Record<
  QuestionTypeKey,
  {
    label: string;
    shortLabel: string;
    sub: string;
    badgeBg: string;
    lightBg: string;
    borderAccent: string;
    dotColor: string;
  }
> = {
  single_choice: {
    label: 'PG Tunggal',
    shortLabel: 'PG Tunggal',
    sub: 'Pilihan Ganda A–E',
    badgeBg: 'bg-[#045f3b] text-white',
    lightBg: 'bg-[#045f3b]/10 text-[#045f3b] border-[#045f3b]/25',
    borderAccent: 'border-l-4 border-l-[#045f3b]',
    dotColor: 'bg-[#045f3b]',
  },
  multiple_choice: {
    label: 'PG Jamak',
    shortLabel: 'PG Jamak',
    sub: 'Multi Kunci Jawaban',
    badgeBg: 'bg-[#1d4ed8] text-white',
    lightBg: 'bg-[#1d4ed8]/10 text-[#1d4ed8] border-[#1d4ed8]/25',
    borderAccent: 'border-l-4 border-l-[#1d4ed8]',
    dotColor: 'bg-[#1d4ed8]',
  },
  short_answer: {
    label: 'Jawaban Singkat',
    shortLabel: 'Singkat',
    sub: 'Isian Pendek Presisi',
    badgeBg: 'bg-[#b45309] text-white',
    lightBg: 'bg-[#b45309]/10 text-[#b45309] border-[#b45309]/25',
    borderAccent: 'border-l-4 border-l-[#b45309]',
    dotColor: 'bg-[#b45309]',
  },
  ordering: {
    label: 'Mengurutkan',
    shortLabel: 'Ordering',
    sub: 'Urutan Kronologis',
    badgeBg: 'bg-[#6d28d9] text-white',
    lightBg: 'bg-[#6d28d9]/10 text-[#6d28d9] border-[#6d28d9]/25',
    borderAccent: 'border-l-4 border-l-[#6d28d9]',
    dotColor: 'bg-[#6d28d9]',
  },
  matching: {
    label: 'Menjodohkan',
    shortLabel: 'Matching',
    sub: 'Pasangan Pernyataan',
    badgeBg: 'bg-[#0f766e] text-white',
    lightBg: 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/25',
    borderAccent: 'border-l-4 border-l-[#0f766e]',
    dotColor: 'bg-[#0f766e]',
  },
  essay: {
    label: 'Uraian / Essay',
    shortLabel: 'Essay',
    sub: 'Analisis & Rubrik',
    badgeBg: 'bg-[#be123c] text-white',
    lightBg: 'bg-[#be123c]/10 text-[#be123c] border-[#be123c]/25',
    borderAccent: 'border-l-4 border-l-[#be123c]',
    dotColor: 'bg-[#be123c]',
  },
};

interface BatchProgressItem {
  batchIndex: number;
  startNum: number;
  endNum: number;
  count: number;
  selectedTypes: ExamFormConfig['selectedTypes'];
  typesSummary: string;
  status: 'pending' | 'running' | 'success' | 'fallback';
  source?: string;
  fallbackReason?: string;
  durationMs?: number;
}

function buildClientBatches(selectedTypes: ExamFormConfig['selectedTypes'], maxPerBatch = 7): BatchProgressItem[] {
  const expanded: QuestionTypeKey[] = [];
  const order: QuestionTypeKey[] = [
    'single_choice',
    'multiple_choice',
    'short_answer',
    'ordering',
    'matching',
    'essay',
  ];

  for (const key of order) {
    const qty = Math.max(0, Number(selectedTypes[key]) || 0);
    for (let i = 0; i < qty; i++) {
      expanded.push(key);
    }
  }

  if (expanded.length === 0) {
    expanded.push('single_choice', 'single_choice', 'single_choice', 'single_choice', 'essay');
  }

  const batches: BatchProgressItem[] = [];
  for (let i = 0; i < expanded.length; i += maxPerBatch) {
    const chunk = expanded.slice(i, i + maxPerBatch);
    const batchTypes: ExamFormConfig['selectedTypes'] = {
      single_choice: 0,
      multiple_choice: 0,
      short_answer: 0,
      ordering: 0,
      matching: 0,
      essay: 0,
    };
    chunk.forEach((t) => {
      batchTypes[t] += 1;
    });

    const summaryParts = order
      .filter((k) => batchTypes[k] > 0)
      .map((k) => `${batchTypes[k]} ${QUESTION_TYPE_META[k].shortLabel}`);

    batches.push({
      batchIndex: batches.length + 1,
      startNum: i + 1,
      endNum: i + chunk.length,
      count: chunk.length,
      selectedTypes: batchTypes,
      typesSummary: summaryParts.join(', '),
      status: 'pending',
    });
  }

  return batches;
}

function renderDifficultyDots(difficulty?: string) {
  const norm = (difficulty || 'sedang').toLowerCase();
  if (norm === 'mudah') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800" title="Tingkat Kesulitan: Mudah">
        <span className="inline-flex items-center gap-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span className="w-2 h-2 rounded-full bg-slate-300" />
        </span>
        <span>Mudah</span>
      </span>
    );
  }
  if (norm === 'sulit' || norm === 'hots') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-800" title="Tingkat Kesulitan: Sulit / HOTS">
        <span className="inline-flex items-center gap-0.5">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <span className="w-2 h-2 rounded-full bg-rose-600" />
        </span>
        <span>Sulit (HOTS)</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-900" title="Tingkat Kesulitan: Sedang">
      <span className="inline-flex items-center gap-0.5">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span className="w-2 h-2 rounded-full bg-slate-300" />
      </span>
      <span>Sedang</span>
    </span>
  );
}

export const ExamGeneratorView: React.FC<ExamGeneratorViewProps> = ({
  currentUser,
  currentPackage,
  onSavePackage,
  madrasahIdentity,
}) => {
  const [formData, setFormData] = useState<ExamFormConfig>(currentPackage.config);
  const [questions, setQuestions] = useState<QuestionItem[]>(currentPackage.questions);
  const [isFallbackMode, setIsFallbackMode] = useState<boolean>(Boolean(currentPackage.isFallback));
  const [fallbackReason, setFallbackReason] = useState<string>(currentPackage.fallbackReason || '');
  const [packageSource, setPackageSource] = useState<string>(currentPackage.source || '');
  const [cbtText, setCbtText] = useState<string>(() =>
    formatExamToCbtText(currentPackage.config, currentPackage.questions)
  );

  // 3-Step Wizard State: 1 = Konfigurasi, 2 = Proses Batch, 3 = Review & Ekspor
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [batchProgressList, setBatchProgressList] = useState<BatchProgressItem[]>([]);
  const [currentBatchIdx, setCurrentBatchIdx] = useState<number>(0);
  const [activeModelName, setActiveModelName] = useState<string>('9router AI (komoboku)');

  // Step 3 Review Sub-Mode: 'cards' (Review Kartu Soal), 'textbox' (CBT IDE), 'paper' (Pratinjau Kertas Cetak)
  const [viewMode, setViewMode] = useState<'cards' | 'textbox' | 'paper'>('cards');
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

  // New Question Creator (Isi Soal Manual + Generate Gambar Langsung)
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState<boolean>(false);
  const [newQuestionData, setNewQuestionData] = useState<{
    text: string;
    type: QuestionTypeKey;
    options: { key: string; text: string }[];
    rawRightAnswer: string;
    explanation: string;
    imageUrl: string;
    imagePrompt: string;
  }>({
    text: '',
    type: 'single_choice',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
      { key: 'E', text: '' },
    ],
    rawRightAnswer: 'RIGHT:A',
    explanation: '',
    imageUrl: '',
    imagePrompt: '',
  });

  // CBT Textbox Direct Image Inserter Modal
  const [isCbtImageModalOpen, setIsCbtImageModalOpen] = useState<boolean>(false);
  const [cbtImagePrompt, setCbtImagePrompt] = useState<string>('');

  // Auto-generate images on bulk generation
  const [autoGenerateImages, setAutoGenerateImages] = useState<boolean>(false);

  // Image Generator & Manager States
  const [imageModalQuestion, setImageModalQuestion] = useState<QuestionItem | null>(null);
  const [imageModalTab, setImageModalTab] = useState<'ai' | 'upload' | 'url'>('ai');
  const [imagePrompt, setImagePrompt] = useState<string>('');
  const [imageStyle, setImageStyle] = useState<'diagram' | 'vector' | 'photo' | 'sketch'>('diagram');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatingImageQId, setGeneratingImageQId] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string>('');
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);

  const handleOpenImageModal = (q: QuestionItem) => {
    setImageModalQuestion(q);
    setImageModalTab('ai');
    setImageError(null);
    setPreviewImageUrl(q.imageUrl || '');
    setCustomImageUrl(q.imageUrl || '');
    if (q.imagePrompt) {
      setImagePrompt(q.imagePrompt);
    } else {
      const clean = q.text.replace(/Q:\d+\)/gi, '').replace(/\[IMG\].*?\[\/IMG\]/gi, '').trim().slice(0, 140);
      setImagePrompt(`Diagram ilustrasi untuk ${formData.mapel || 'mata pelajaran'}: ${clean}`);
    }
  };

  // Quick 1-click generator for ANY question directly from its card
  const handleQuickGenerateQuestionImage = async (q: QuestionItem, customPrompt?: string) => {
    setGeneratingImageQId(q.id);
    setStatusMessage(`Sedang merender ilustrasi diagram untuk Soal No. ${q.number}...`);
    try {
      const cleanText = q.text.replace(/Q:\d+\)/gi, '').replace(/\[IMG\].*?\[\/IMG\]/gi, '').replace(/<[^>]*>/g, '').trim().slice(0, 150);
      const promptToUse = customPrompt || q.imagePrompt || `Diagram edukasi kurikulum merdeka untuk ${formData.mapel || 'asesmen'}: ${cleanText}`;
      const data = await fetchApiJson('/api/v1/soal/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: promptToUse,
          questionText: q.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        const updated = questions.map((item) =>
          item.id === q.id ? { ...item, imageUrl: finalUrl, imagePrompt: promptToUse } : item
        );
        setQuestions(updated);
        setCbtText(formatExamToCbtText(formData, updated, { equationAsImage: equationAsImageInText, imageFormat }));
        setStatusMessage(`Gambar diagram untuk Soal No. ${q.number} berhasil dibuat dan dipasang.`);
      } else {
        setStatusMessage(`Gagal membuat gambar: ${data.error || 'Server tidak merespons'}`);
      }
    } catch (err: any) {
      setStatusMessage(`Gagal membuat gambar: ${err?.message || 'Koneksi terputus'}`);
    } finally {
      setGeneratingImageQId(null);
    }
  };

  const handleGenerateAiImage = async (customPrompt?: string, targetQ?: QuestionItem) => {
    const activeQ = targetQ || imageModalQuestion;
    if (!activeQ) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const promptToUse = customPrompt || imagePrompt || activeQ.imagePrompt || activeQ.text;
      const data = await fetchApiJson('/api/v1/soal/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: promptToUse,
          questionText: activeQ.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        setPreviewImageUrl(finalUrl);
        const updated = questions.map((q) =>
          q.id === activeQ.id ? { ...q, imageUrl: finalUrl, imagePrompt: promptToUse } : q
        );
        setQuestions(updated);
        setCbtText(formatExamToCbtText(formData, updated, { equationAsImage: equationAsImageInText, imageFormat }));
        if (editingQuestion && editingQuestion.id === activeQ.id) {
          setEditingQuestion({ ...editingQuestion, imageUrl: finalUrl });
        }
        setStatusMessage(`Ilustrasi diagram Soal No. ${activeQ.number} siap digunakan.`);
      } else {
        setImageError(data.error || 'Gagal menghasilkan gambar dengan AI');
      }
    } catch (err: any) {
      setImageError(err?.message || 'Koneksi ke server gagal');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleApplyImageToQuestion = (imgUrl: string) => {
    if (!imageModalQuestion) return;
    const updated = questions.map((q) =>
      q.id === imageModalQuestion.id ? { ...q, imageUrl: imgUrl } : q
    );
    setQuestions(updated);
    setCbtText(
      formatExamToCbtText(formData, updated, {
        equationAsImage: equationAsImageInText,
        imageFormat,
      })
    );
    if (editingQuestion && editingQuestion.id === imageModalQuestion.id) {
      setEditingQuestion({ ...editingQuestion, imageUrl: imgUrl });
    }
    setImageModalQuestion(null);
  };

  const handleRemoveQuestionImage = (qId: string) => {
    const updated = questions.map((q) =>
      q.id === qId ? { ...q, imageUrl: undefined } : q
    );
    setQuestions(updated);
    setCbtText(
      formatExamToCbtText(formData, updated, {
        equationAsImage: equationAsImageInText,
        imageFormat,
      })
    );
    if (editingQuestion && editingQuestion.id === qId) {
      setEditingQuestion({ ...editingQuestion, imageUrl: undefined });
    }
    if (imageModalQuestion && imageModalQuestion.id === qId) {
      setPreviewImageUrl('');
    }
  };

  const handleGenerateImageForNewQuestion = async () => {
    if (!newQuestionData.text.trim()) {
      setStatusMessage('Silakan tuliskan teks soal terlebih dahulu untuk panduan AI merender diagram.');
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const data = await fetchApiJson('/api/v1/soal/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: newQuestionData.imagePrompt || newQuestionData.text,
          questionText: newQuestionData.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        setNewQuestionData((prev) => ({
          ...prev,
          imageUrl: finalUrl,
          imagePrompt: prev.imagePrompt || data.promptUsed,
        }));
        setStatusMessage('Gambar diagram berhasil dibuat dan dipasang ke butir soal.');
      } else {
        setImageError(data.error || 'Gagal menghasilkan gambar');
      }
    } catch (err: any) {
      setImageError(err?.message || 'Koneksi ke server gagal');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleSaveNewQuestion = () => {
    if (!newQuestionData.text.trim()) {
      setStatusMessage('Teks butir soal tidak boleh kosong.');
      return;
    }
    const nextNum = questions.length + 1;
    const newQ: QuestionItem = {
      id: `q-${Date.now()}`,
      number: nextNum,
      type: newQuestionData.type,
      text: newQuestionData.text,
      isArabic: formData.bahasa === 'arab',
      hasLatex: newQuestionData.text.includes('$'),
      difficulty: 'sedang',
      kompetensiTarget: 'Materi Butir Soal Guru',
      explanation: newQuestionData.explanation,
      imageUrl: newQuestionData.imageUrl || undefined,
      imagePrompt: newQuestionData.imagePrompt || undefined,
      options: newQuestionData.options.filter((o) => o.text.trim()),
      rawRightAnswer: newQuestionData.rawRightAnswer,
    };
    const updated = [...questions, newQ];
    setQuestions(updated);
    setCbtText(
      formatExamToCbtText(formData, updated, {
        equationAsImage: equationAsImageInText,
        imageFormat,
      })
    );
    setIsAddingNewQuestion(false);
    setNewQuestionData({
      text: '',
      type: 'single_choice',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
        { key: 'E', text: '' },
      ],
      rawRightAnswer: 'RIGHT:A',
      explanation: '',
      imageUrl: '',
      imagePrompt: '',
    });
    setStatusMessage(`Butir soal No. ${nextNum} berhasil ditambahkan ke naskah.`);
  };

  const handleGenerateImageForEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const data = await fetchApiJson('/api/v1/soal/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: editingQuestion.imagePrompt || editingQuestion.text,
          questionText: editingQuestion.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        setEditingQuestion((prev) =>
          prev
            ? {
                ...prev,
                imageUrl: finalUrl,
                imagePrompt: prev.imagePrompt || data.promptUsed,
              }
            : null
        );
        setStatusMessage('Gambar diagram soal berhasil diperbarui.');
      }
    } catch {
      setStatusMessage('Gagal memperbarui diagram soal.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleInsertCbtImage = async () => {
    if (!cbtImagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const data = await fetchApiJson('/api/v1/soal/generate-image', {
        method: 'POST',
        body: JSON.stringify({
          prompt: cbtImagePrompt,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const finalImg = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalImg) {
        const imgTag = `\n[IMG]${finalImg}[/IMG]\n`;
        setCbtText((prev) => prev + imgTag);
        setIsCbtImageModalOpen(false);
        setCbtImagePrompt('');
        setStatusMessage('Tag gambar [IMG]...[/IMG] berhasil disisipkan ke kotak teks CBT.');
      }
    } catch {
      setStatusMessage('Gagal menyisipkan gambar diagram.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setImageError('Ukuran file terlalu besar. Maksimal 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setPreviewImageUrl(result);
        setImageError(null);
      }
    };
    reader.onerror = () => {
      setImageError('Gagal membaca berkas gambar.');
    };
    reader.readAsDataURL(file);
  };

  // Sync when currentPackage changes from presets / Dashboard load
  React.useEffect(() => {
    setFormData(currentPackage.config);
    setQuestions(currentPackage.questions);
    setIsFallbackMode(Boolean(currentPackage.isFallback));
    setFallbackReason(currentPackage.fallbackReason || '');
    setPackageSource(currentPackage.source || '');
    setCbtText(
      formatExamToCbtText(currentPackage.config, currentPackage.questions, {
        equationAsImage: equationAsImageInText,
        imageFormat,
      })
    );
  }, [currentPackage, equationAsImageInText, imageFormat]);

  const handleInputChange = (field: keyof ExamFormConfig, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeQuotaChange = (typeKey: QuestionTypeKey, delta: number) => {
    setFormData((prev) => {
      const currentVal = prev.selectedTypes[typeKey] || 0;
      const newVal = Math.max(0, Math.min(100, currentVal + delta));
      return {
        ...prev,
        selectedTypes: {
          ...prev.selectedTypes,
          [typeKey]: newVal,
        },
      };
    });
  };

  const handleDirectQuotaChange = (typeKey: QuestionTypeKey, valStr: string) => {
    const parsed = parseInt(valStr, 10);
    const newVal = isNaN(parsed) ? 0 : Math.max(0, Math.min(100, parsed));
    setFormData((prev) => ({
      ...prev,
      selectedTypes: {
        ...prev.selectedTypes,
        [typeKey]: newVal,
      },
    }));
  };

  const applyQuotaPreset = (totalPreset: 15 | 25 | 40 | 50) => {
    setFormData((prev) => {
      let selectedTypes = {
        single_choice: 10,
        multiple_choice: 2,
        short_answer: 1,
        ordering: 0,
        matching: 0,
        essay: 2,
      };
      if (totalPreset === 25) {
        selectedTypes = { single_choice: 20, multiple_choice: 2, short_answer: 1, ordering: 0, matching: 0, essay: 2 };
      } else if (totalPreset === 40) {
        selectedTypes = { single_choice: 35, multiple_choice: 0, short_answer: 0, ordering: 0, matching: 0, essay: 5 };
      } else if (totalPreset === 50) {
        selectedTypes = { single_choice: 40, multiple_choice: 5, short_answer: 0, ordering: 0, matching: 0, essay: 5 };
      }
      return { ...prev, selectedTypes };
    });
  };

  // Real Per-Batch Exam Generation (Step 1 -> Step 2 -> Step 3)
  const handleGenerate = async () => {
    const batches = buildClientBatches(formData.selectedTypes, 7);
    setBatchProgressList(batches);
    setCurrentBatchIdx(0);
    setWizardStep(2);
    setIsGenerating(true);
    setStatusMessage(null);
    setGenerationStep(`Menyiapkan ${batches.length} batch penyusunan soal...`);

    const accumulatedQuestions: QuestionItem[] = [];
    let anyFallback = false;
    const fallbackReasons: string[] = [];
    const sourcesUsed = new Set<string>();

    try {
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        setCurrentBatchIdx(i + 1);
        setGenerationStep(
          `Memproses Batch ${i + 1} dari ${batches.length} (Soal #${batch.startNum}–#${batch.endNum}: ${batch.typesSummary})...`
        );

        setBatchProgressList((prev) =>
          prev.map((item, idx) => (idx === i ? { ...item, status: 'running' } : item))
        );

        const batchStartMs = Date.now();
        try {
          const data = await fetchApiJson('/api/v1/soal/generate', {
            method: 'POST',
            body: JSON.stringify({
              ...formData,
              selectedTypes: batch.selectedTypes,
              autoGenerateImages: i === 0 ? autoGenerateImages : false,
              imageStyle,
            }),
          });

          const elapsedMs = Date.now() - batchStartMs;
          if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
            const batchIsFallback = Boolean(data.isFallback);
            if (batchIsFallback) {
              anyFallback = true;
              if (data.fallbackReason) fallbackReasons.push(data.fallbackReason);
            }
            if (data.source) {
              sourcesUsed.add(data.source);
              setActiveModelName(data.source);
            }

            // Renumber progressively
            const renumberedBatch = data.questions.map((q: QuestionItem, idx: number) => ({
              ...q,
              id: `q-${Date.now()}-${accumulatedQuestions.length + idx + 1}`,
              number: accumulatedQuestions.length + idx + 1,
            }));

            accumulatedQuestions.push(...renumberedBatch);
            setQuestions([...accumulatedQuestions]);

            setBatchProgressList((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? {
                      ...item,
                      status: batchIsFallback ? 'fallback' : 'success',
                      source: data.source || 'AI Gateway',
                      fallbackReason: data.fallbackReason,
                      durationMs: elapsedMs,
                    }
                  : item
              )
            );
          } else {
            anyFallback = true;
            const reason = data.error || 'Respons batch kosong';
            fallbackReasons.push(reason);
            setBatchProgressList((prev) =>
              prev.map((item, idx) =>
                idx === i
                  ? {
                      ...item,
                      status: 'fallback',
                      source: 'Template Darurat',
                      fallbackReason: reason,
                      durationMs: elapsedMs,
                    }
                  : item
              )
            );
          }
        } catch (batchErr: any) {
          const elapsedMs = Date.now() - batchStartMs;
          anyFallback = true;
          const reason = batchErr?.message || 'Timeout / gangguan jaringan pada batch ini';
          fallbackReasons.push(reason);
          setBatchProgressList((prev) =>
            prev.map((item, idx) =>
              idx === i
                ? {
                    ...item,
                    status: 'fallback',
                    source: 'Gangguan Koneksi',
                    fallbackReason: reason,
                    durationMs: elapsedMs,
                  }
                : item
            )
          );
        }
      }

      if (accumulatedQuestions.length > 0) {
        const finalQuestions = accumulatedQuestions.map((q, idx) => ({
          ...q,
          number: idx + 1,
        }));
        setQuestions(finalQuestions);
        const formatted = formatExamToCbtText(formData, finalQuestions, {
          equationAsImage: equationAsImageInText,
          imageFormat,
        });
        setCbtText(formatted);
        setIsFallbackMode(anyFallback);
        const combinedReason = Array.from(new Set(fallbackReasons)).join('; ');
        setFallbackReason(combinedReason);
        const finalSource = Array.from(sourcesUsed).join(' + ') || '9router AI';
        setPackageSource(finalSource);

        const updatedPackage: ExamPackage = {
          ...currentPackage,
          id: `exam-${Date.now()}`,
          title: `Paket Soal ${formData.jenisUjian} ${formData.mapel} — Kelas ${formData.kelas}`,
          config: formData,
          questions: finalQuestions,
          createdAt: new Date().toISOString(),
          createdBy: currentUser.name,
          nip: currentUser.nip,
          source: finalSource,
          isFallback: anyFallback,
          fallbackReason: combinedReason,
        };
        onSavePackage(updatedPackage);

        if (anyFallback) {
          setStatusMessage(
            `Perhatian: Sebagian/seluruh batch memakai Bank Template Darurat (${combinedReason || 'Koneksi Gateway'}).`
          );
        } else {
          setStatusMessage(
            `Berhasil menyusun ${finalQuestions.length} butir soal melalui ${batches.length} batch (${finalSource}).`
          );
        }

        // Transition to Step 3 (Review & Ekspor) after brief completion view
        setTimeout(() => {
          setWizardStep(3);
        }, 550);
      } else {
        setIsFallbackMode(true);
        setFallbackReason(fallbackReasons.join('; ') || 'Gagal menyusun soal.');
        setStatusMessage('Gagal menyusun soal. Silakan periksa koneksi AI di Beranda atau Panel Admin.');
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleCopyCbtText = () => {
    navigator.clipboard.writeText(cbtText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

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

  const handleLoadExample = () => {
    setCbtText(CBT_FORMAT_EXAMPLE);
    setStatusMessage('Format contoh soal CBT standar berhasil dimuat ke teks box.');
  };

  const handleSyncFromConfig = () => {
    const formatted = formatExamToCbtText(formData, questions, {
      equationAsImage: equationAsImageInText,
      imageFormat,
    });
    setCbtText(formatted);
    setStatusMessage('Teks box berhasil disinkronkan kembali dari paket soal.');
  };

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

  const handleToggleEquationInText = (enabled: boolean) => {
    setEquationAsImageInText(enabled);
    const updated = formatExamToCbtText(formData, questions, {
      equationAsImage: enabled,
      imageFormat,
    });
    setCbtText(updated);
  };

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

  const handlePrint = () => {
    window.print();
  };

  const filteredQuestions = questions.filter((q) => {
    if (activeFilterType === 'all') return true;
    return q.type === activeFilterType;
  });

  const handleSaveEditQuestion = () => {
    if (!editingQuestion) return;
    const updated = questions.map((q) => (q.id === editingQuestion.id ? editingQuestion : q));
    setQuestions(updated);
    setCbtText(formatExamToCbtText(formData, updated));
    setEditingQuestion(null);
  };

  const totalConfiguredQuestions = Object.values(formData.selectedTypes).reduce((a, b) => a + b, 0);
  const completedBatchesCount = batchProgressList.filter(
    (b) => b.status === 'success' || b.status === 'fallback'
  ).length;
  const batchProgressPercent =
    batchProgressList.length > 0
      ? Math.round((completedBatchesCount / batchProgressList.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* ========================================================
          BOOTSTRAP HEADER & NAV-TABS (3 Langkah)
      ======================================================== */}
      <div className="bg-white rounded-md border border-slate-300 overflow-hidden no-print">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="font-heading text-base font-bold text-slate-900">
              Penyusunan Soal Asesmen Madrasah
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {formData.jenisUjian} · {formData.mapel || 'Belum pilih mapel'} · Kelas {formData.kelas} · Semester {formData.semester} ({formData.tahunPelajaran})
            </p>
          </div>
          <div className="text-xs text-slate-600 font-medium">
            Rencana: <strong className="text-slate-900">{totalConfiguredQuestions} butir</strong> · Tersusun: <strong className="text-[#045f3b]">{questions.length} soal</strong>
          </div>
        </div>

        {/* Bootstrap .nav-tabs */}
        <div className="px-4 pt-2 bg-slate-100 border-b border-slate-300 flex items-center gap-1 overflow-x-auto">
          {[
            {
              step: 1 as const,
              label: `1. Konfigurasi Soal (${totalConfiguredQuestions})`,
            },
            {
              step: 2 as const,
              label: isGenerating
                ? `2. Proses Generate (Batch ${currentBatchIdx}/${batchProgressList.length})`
                : `2. Proses Generate (${completedBatchesCount}/${batchProgressList.length || Math.ceil(totalConfiguredQuestions / 7)} Batch)`,
            },
            {
              step: 3 as const,
              label: `3. Hasil & Ekspor (${questions.length} Soal)`,
            },
          ].map((tab) => {
            const active = wizardStep === tab.step;
            return (
              <button
                key={tab.step}
                type="button"
                onClick={() => setWizardStep(tab.step)}
                className={`px-4 py-2 text-xs font-semibold rounded-t-md border transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white border-slate-300 border-b-white text-[#045f3b] -mb-px font-bold'
                    : 'bg-slate-200/70 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          LANGKAH 1: KONFIGURASI SOAL (Bootstrap Cards & Table)
      ======================================================== */}
      {wizardStep === 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start no-print">
          {/* Left Card: Identitas & CP */}
          <div className="lg:col-span-6 bg-white rounded-md border border-slate-300 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-800">
              Identitas Mata Pelajaran & Capaian Pembelajaran
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mata Pelajaran</label>
                  <input
                    type="text"
                    value={formData.mapel}
                    onChange={(e) => handleInputChange('mapel', e.target.value)}
                    placeholder="Contoh: Fiqih, Biologi, Matematika"
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Asesmen</label>
                  <select
                    value={formData.jenisUjian}
                    onChange={(e) => handleInputChange('jenisUjian', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-slate-900"
                  >
                    <option value="ASTS">ASTS (Tengah Semester)</option>
                    <option value="ASESGA">ASESGA (Akhir Semester)</option>
                    <option value="ASAS">ASAS (Akhir Satuan Pendidikan)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={formData.kelas}
                    onChange={(e) => handleInputChange('kelas', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => handleInputChange('semester', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="1">1 (Gasal)</option>
                    <option value="2">2 (Genap)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tahun Pelajaran</label>
                  <input
                    type="text"
                    value={formData.tahunPelajaran}
                    onChange={(e) => handleInputChange('tahunPelajaran', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bahasa Pengantar</label>
                  <select
                    value={formData.bahasa}
                    onChange={(e) => handleInputChange('bahasa', e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="indonesia">Bahasa Indonesia</option>
                    <option value="arab">Bahasa Arab (RTL Amiri)</option>
                    <option value="campuran">Campuran (Arab & Indonesia)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Alokasi Waktu (Menit)</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    value={formData.alokasiWaktuMenit}
                    onChange={(e) => handleInputChange('alokasiWaktuMenit', parseInt(e.target.value) || 90)}
                    className="w-full px-3 py-2 rounded border border-slate-300 bg-white text-slate-900 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Capaian Pembelajaran (CP) / Materi Spesifik yang Diujikan
                </label>
                <textarea
                  rows={4}
                  value={formData.capaianPembelajaran}
                  onChange={(e) => handleInputChange('capaianPembelajaran', e.target.value)}
                  placeholder="Tuliskan rincian materi, bab, atau indikator soal yang ingin diujikan..."
                  className="w-full p-3 rounded border border-slate-300 bg-white focus:outline-none focus:border-[#045f3b] text-slate-900 leading-relaxed resize-y"
                />
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={(e) => setAutoGenerateImages(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#045f3b] focus:ring-[#045f3b]"
                />
                <span className="text-slate-700 font-medium">
                  Otomatis buat diagram/gambar pendukung saat generate (opsional)
                </span>
              </label>
            </div>
          </div>

          {/* Right Card: Tabel Komposisi Tipe Soal */}
          <div className="lg:col-span-6 bg-white rounded-md border border-slate-300 overflow-hidden">
            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800">
                Komposisi Tipe Soal
              </span>
              <span className="text-xs font-bold text-[#045f3b]">
                Total: {totalConfiguredQuestions} Butir
              </span>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              {/* Preset Buttons (Bootstrap btn-group style) */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-semibold text-slate-700">Preset Jumlah:</span>
                <div className="inline-flex rounded border border-slate-300 overflow-hidden">
                  {([15, 25, 40, 50] as const).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => applyQuotaPreset(preset)}
                      className={`px-3 py-1.5 text-xs font-semibold border-r last:border-r-0 border-slate-300 transition cursor-pointer ${
                        totalConfiguredQuestions === preset
                          ? 'bg-[#045f3b] text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {preset} Soal
                    </button>
                  ))}
                </div>
              </div>

              {/* Bootstrap Table for 6 Question Types */}
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">Jenis Soal</th>
                      <th className="py-2 px-3 hidden sm:table-cell">Keterangan</th>
                      <th className="py-2 px-3 text-right w-32">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {(Object.keys(QUESTION_TYPE_META) as QuestionTypeKey[]).map((typeKey) => {
                      const meta = QUESTION_TYPE_META[typeKey];
                      const qty = formData.selectedTypes[typeKey] || 0;
                      return (
                        <tr key={typeKey} className={qty > 0 ? 'bg-white' : 'bg-slate-50/50 text-slate-500'}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{meta.label}</td>
                          <td className="py-2 px-3 text-slate-500 hidden sm:table-cell">{meta.sub}</td>
                          <td className="py-1.5 px-3 text-right">
                            <div className="inline-flex items-center border border-slate-300 rounded bg-white overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleTypeQuotaChange(typeKey, -1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-bold border-r border-slate-300 cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={qty}
                                onChange={(e) => handleDirectQuotaChange(typeKey, e.target.value)}
                                className="w-10 text-center font-bold text-slate-900 text-xs tabular-nums focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleTypeQuotaChange(typeKey, 1)}
                                className="px-2 py-1 hover:bg-slate-100 text-slate-700 font-bold border-l border-slate-300 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Simple Difficulty Summary */}
              <div className="flex items-center justify-between px-3 py-2 rounded bg-slate-50 border border-slate-200 text-slate-700">
                <span className="font-semibold">Proporsi Kesulitan:</span>
                <span className="tabular-nums">
                  Mudah {formData.difficultyProportion.mudah}% · Sedang {formData.difficultyProportion.sedang}% · Sulit {formData.difficultyProportion.sulit}%
                </span>
              </div>

              {/* Primary Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <button
                  type="button"
                  disabled={isGenerating || totalConfiguredQuestions === 0}
                  onClick={handleGenerate}
                  className="flex-1 py-2.5 px-4 rounded bg-[#045f3b] hover:bg-[#03482d] text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    Generate Soal Sekarang ({totalConfiguredQuestions} Butir / {Math.ceil(totalConfiguredQuestions / 7)} Batch)
                  </span>
                </button>

                {questions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="py-2.5 px-3.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
                  >
                    Lihat Hasil ({questions.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          LANGKAH 2: PROSES GENERATE PER BATCH (Bootstrap Progress & Table)
      ======================================================== */}
      {wizardStep === 2 && (
        <div className="bg-white rounded-md border border-slate-300 overflow-hidden no-print">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {isGenerating
                  ? `Menyusun Soal: Batch ${currentBatchIdx} dari ${batchProgressList.length}...`
                  : `Proses Penyusunan Selesai (${questions.length} Soal)`}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {generationStep || `Engine: ${activeModelName} · Eksekusi bertahap maksimal 7 soal per batch`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                Progres: {completedBatchesCount}/{batchProgressList.length} Batch ({batchProgressPercent}%)
              </span>
              {!isGenerating && questions.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWizardStep(3)}
                  className="px-3.5 py-1.5 rounded bg-[#045f3b] hover:bg-[#03482d] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Lihat Hasil Soal →
                </button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Standard Bootstrap Progress Bar */}
            <div className="w-full h-2.5 rounded bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-[#045f3b] transition-all duration-300"
                style={{ width: `${Math.max(4, batchProgressPercent)}%` }}
              />
            </div>

            {batchProgressList.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded border border-slate-200 space-y-2">
                <p className="text-xs text-slate-600">Belum ada proses generate yang berjalan.</p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3.5 py-2 rounded bg-[#045f3b] text-white text-xs font-semibold cursor-pointer"
                >
                  Mulai Generate Soal
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <th className="py-2 px-3">Batch</th>
                      <th className="py-2 px-3">Rentang Nomor</th>
                      <th className="py-2 px-3">Komposisi</th>
                      <th className="py-2 px-3">Sumber / Durasi</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {batchProgressList.map((batch) => (
                      <tr
                        key={batch.batchIndex}
                        className={batch.status === 'running' ? 'bg-emerald-50/50' : 'bg-white'}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          Batch #{batch.batchIndex}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 tabular-nums">
                          Soal {batch.startNum} s.d. {batch.endNum} ({batch.count} butir)
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{batch.typesSummary}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                          {batch.source ? (
                            <>
                              {batch.source}
                              {batch.durationMs ? ` (${(batch.durationMs / 1000).toFixed(1)}s)` : ''}
                            </>
                          ) : (
                            '-'
                          )}
                          {batch.fallbackReason && (
                            <div className="text-amber-800 font-sans mt-0.5">
                              Info: {batch.fallbackReason}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold">
                          {batch.status === 'running' && (
                            <span className="text-[#045f3b]">Sedang memproses...</span>
                          )}
                          {batch.status === 'success' && (
                            <span className="text-emerald-700">Selesai (AI)</span>
                          )}
                          {batch.status === 'fallback' && (
                            <span className="text-amber-700">Template Cadangan</span>
                          )}
                          {batch.status === 'pending' && (
                            <span className="text-slate-400">Menunggu</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          LANGKAH 3: HASIL & EKSPOR (Bootstrap Alerts, Toolbar & Clean Cards)
      ======================================================== */}
      {wizardStep === 3 && (
        <div className="space-y-4">
          {/* Simple Bootstrap Alert Box for AI vs Emergency Template */}
          {isFallbackMode ? (
            <div className="px-4 py-3 rounded-md bg-amber-50 border border-amber-300 text-amber-900 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
              <div>
                <strong>Perhatian (Mode Template Cadangan):</strong> Gateway AI belum merespons
                {fallbackReason ? ` (${fallbackReason})` : ''}. Soal di bawah menggunakan bank template darurat.
              </div>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs cursor-pointer shrink-0"
              >
                Coba Generate Ulang AI
              </button>
            </div>
          ) : (
            questions.length > 0 && (
              <div className="px-4 py-2.5 rounded-md bg-emerald-50 border border-emerald-300 text-emerald-900 flex flex-wrap items-center justify-between gap-2 text-xs no-print">
                <span>
                  <strong>Status Naskah:</strong> Berhasil disusun oleh AI ({packageSource || '9router / komoboku'}) — {questions.length} butir soal sesuai CP.
                </span>
              </div>
            )
          )}

          {/* Clean Bootstrap Toolbar */}
          <div className="bg-white p-3 rounded-md border border-slate-300 flex flex-wrap items-center justify-between gap-3 no-print">
            {/* View Mode Button Group */}
            <div className="inline-flex rounded border border-slate-300 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 font-semibold border-r border-slate-300 cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-[#045f3b] text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                Daftar Soal ({questions.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('textbox')}
                className={`px-3 py-1.5 font-semibold border-r border-slate-300 cursor-pointer ${
                  viewMode === 'textbox'
                    ? 'bg-[#045f3b] text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                Teks CBT
              </button>
              <button
                type="button"
                onClick={() => setViewMode('paper')}
                className={`px-3 py-1.5 font-semibold cursor-pointer ${
                  viewMode === 'paper'
                    ? 'bg-[#045f3b] text-white'
                    : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
              >
                Lembar Cetak (Kop)
              </button>
            </div>

            {/* Filter Select + Show Answer Key Toggle + Export Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                value={activeFilterType}
                onChange={(e) => setActiveFilterType(e.target.value as 'all' | QuestionTypeKey)}
                className="px-2.5 py-1.5 rounded border border-slate-300 bg-white text-slate-700 font-medium"
              >
                <option value="all">Semua Tipe Soal ({questions.length})</option>
                {(Object.keys(QUESTION_TYPE_META) as QuestionTypeKey[]).map((tKey) => {
                  const count = questions.filter((q) => q.type === tKey).length;
                  if (count === 0) return null;
                  return (
                    <option key={tKey} value={tKey}>
                      {QUESTION_TYPE_META[tKey].label} ({count})
                    </option>
                  );
                })}
              </select>

              <button
                type="button"
                onClick={() => setShowAnswerKeys(!showAnswerKeys)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
              >
                {showAnswerKeys ? 'Sembunyikan Kunci' : 'Tampilkan Kunci'}
              </button>

              <button
                type="button"
                onClick={() => setIsAddingNewQuestion(true)}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
              >
                + Tambah Soal
              </button>

              <button
                type="button"
                onClick={handleCopyCbtText}
                className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer"
              >
                {copySuccess ? 'Tersalin!' : 'Salin CBT'}
              </button>

              <button
                type="button"
                onClick={handleDownloadDocx}
                className="px-3 py-1.5 rounded bg-[#045f3b] hover:bg-[#03482d] text-white font-semibold cursor-pointer"
              >
                Unduh Word (.docx)
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-900 text-white font-semibold cursor-pointer"
              >
                Cetak PDF
              </button>
            </div>
          </div>

          {/* ========================================================
              SUB-MODE A: DAFTAR SOAL (Bootstrap Card per Question, Zero Badges)
          ======================================================== */}
          {viewMode === 'cards' && (
            <div className="space-y-3 no-print">
              {filteredQuestions.map((q) => {
                const meta = QUESTION_TYPE_META[q.type as QuestionTypeKey] || QUESTION_TYPE_META.single_choice;
                return (
                  <div
                    key={q.id}
                    className="bg-white rounded-md border border-slate-300 overflow-hidden"
                  >
                    {/* Bootstrap .card-header */}
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-700">
                        <strong className="text-slate-900">Soal No. {q.number}</strong>
                        <span className="mx-1.5 text-slate-400">·</span>
                        <span>{meta.label}</span>
                        <span className="mx-1.5 text-slate-400">·</span>
                        <span className="text-slate-500">Tingkat: {q.difficulty || 'Sedang'}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={generatingImageQId === q.id}
                          onClick={() => handleQuickGenerateQuestionImage(q, q.imagePrompt)}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium cursor-pointer disabled:opacity-50"
                        >
                          {generatingImageQId === q.id
                            ? 'Membuat Gambar...'
                            : q.imageUrl
                            ? 'Ubah Gambar'
                            : '+ Gambar AI'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenImageModal(q)}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium cursor-pointer"
                        >
                          Studio Gambar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingQuestion(q)}
                          className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-[11px] font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {/* Bootstrap .card-body */}
                    <div className="p-4 space-y-3">
                      <div className="text-sm text-slate-900 leading-relaxed max-w-3xl">
                        <MathText text={q.text} isArabic={q.isArabic} />
                      </div>

                      {q.imageUrl && (
                        <div className="my-2">
                          <div className="inline-block rounded border border-slate-200 bg-slate-50 p-2">
                            <img
                              src={q.imageUrl}
                              alt={`Diagram Soal ${q.number}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, q.text);
                              }}
                              className="max-h-60 max-w-full sm:max-w-lg object-contain bg-white"
                              loading="lazy"
                            />
                            <div className="mt-1.5 flex items-center justify-end gap-2 text-[11px]">
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestionImage(q.id)}
                                className="text-rose-700 hover:underline font-medium cursor-pointer"
                              >
                                Hapus Gambar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Options for PG Tunggal / PG Jamak */}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-w-3xl">
                          {q.options.map((opt) => {
                            const isCorrectOpt =
                              showAnswerKeys &&
                              q.rawRightAnswer
                                ?.replace(/RIGHT:/i, '')
                                .split(',')
                                .map((s) => s.trim().toUpperCase())
                                .includes(opt.key.toUpperCase());
                            return (
                              <div
                                key={opt.key}
                                className={`flex items-start gap-2 px-3 py-2 rounded border text-xs leading-relaxed ${
                                  isCorrectOpt
                                    ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-semibold'
                                    : 'bg-slate-50/60 border-slate-200 text-slate-800'
                                }`}
                              >
                                <span className="font-bold text-slate-900 shrink-0">{opt.key}.</span>
                                <div className="flex-1">
                                  <MathText text={opt.text} isArabic={opt.isRtl || q.isArabic} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Ordering Items */}
                      {q.type === 'ordering' && q.orderingItems && (
                        <div className="space-y-1 max-w-2xl pt-1 text-xs">
                          {q.orderingItems.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded bg-slate-50 border border-slate-200"
                            >
                              <span className="font-bold text-slate-700">{item.id}.</span>
                              <span className="text-slate-800">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Matching Items */}
                      {q.type === 'matching' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl text-xs pt-1">
                          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-700">Premis (Kiri):</div>
                            {q.matchingPremises?.map((premise) => (
                              <div key={premise.id} className="flex items-start gap-1.5">
                                <span className="font-bold">{premise.id}.</span>
                                <span>{premise.text}</span>
                              </div>
                            ))}
                          </div>
                          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
                            <div className="font-bold text-slate-700">Pasangan Respons (Kanan):</div>
                            {q.matchingResponses?.map((resp) => (
                              <div key={resp.key} className="flex items-start gap-1.5">
                                <span className="font-bold">{resp.key}.</span>
                                <span>{resp.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Answer Key & Explanation */}
                      {showAnswerKeys && (
                        <div className="px-3 py-2 rounded bg-slate-50 border border-slate-200 text-xs text-slate-700 max-w-3xl space-y-1">
                          <div>
                            <strong>Kunci Jawaban:</strong>{' '}
                            <code className="font-mono text-[#045f3b] font-bold">
                              {q.rawRightAnswer || '(Uraian)'}
                            </code>
                          </div>
                          {q.explanation && (
                            <div className="text-slate-600">
                              <strong>Pembahasan:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================
              SUB-MODE B: NASKAH TEKS BOX CBT
          ======================================================== */}
          {viewMode === 'textbox' && (
            <div className="bg-white rounded-md border border-slate-300 overflow-hidden no-print">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="font-bold text-slate-800">
                  Editor Naskah Teks CBT ({formData.jenisUjian} · {formData.mapel})
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCbtSubMode(cbtSubMode === 'standard' ? 'ckeditor_html' : 'standard')}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    {cbtSubMode === 'standard' ? 'Mode CKEditor (Gambar)' : 'Mode Teks Standar (.txt)'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyForCkEditor}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    {copyCkSuccess ? 'CKEditor Tersalin!' : 'Salin CKEditor'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Unduh .txt
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncFromConfig}
                    className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium cursor-pointer"
                  >
                    Sync Ulang
                  </button>
                </div>
              </div>

              {cbtSubMode === 'standard' ? (
                <div className="p-4 space-y-2">
                  <textarea
                    id="cbt-textarea"
                    rows={18}
                    value={cbtText}
                    onChange={(e) => setCbtText(e.target.value)}
                    placeholder="Naskah soal CBT akan muncul di sini..."
                    className="w-full font-mono text-xs leading-relaxed p-3 rounded border border-slate-300 bg-slate-950 text-emerald-400 focus:outline-none resize-y"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="p-4 rounded border border-slate-200 bg-white max-h-[480px] overflow-y-auto text-sm text-slate-900 leading-relaxed">
                    <div
                      className="font-mono text-xs space-y-0.5 select-text"
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
            </div>
          )}

          {/* ========================================================
              SUB-MODE C & PRINT SHEET: LEMBAR CETAK RESMI (KOP MADRASAH)
              (Kop & @media print TIDAK DISENTUH)
          ======================================================== */}
          <div className={viewMode === 'paper' ? 'block' : 'hidden print:block'}>
            <div className="bg-white p-6 sm:p-8 rounded-md border border-slate-300 space-y-6">
              <KopMadrasah
                identity={madrasahIdentity}
                rightTitle={`NASKAH SOAL ${formData.jenisUjian}`}
                rightSubtitle={`TA: ${formData.tahunPelajaran} | KELAS ${formData.kelas}`}
                ta={formData.tahunPelajaran}
              />

              <div className="text-center">
                <h3 className="font-heading font-bold text-base text-slate-900 uppercase">
                  Naskah Soal {formData.jenisUjian === 'ASTS' ? 'Asesmen Sumatif Tengah Semester (ASTS)' : formData.jenisUjian === 'ASESGA' ? 'Asesmen Sumatif Akhir Semester (ASESGA)' : 'Asesmen Sumatif Akhir Sekolah (ASAS)'}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  Tahun Pelajaran {formData.tahunPelajaran}
                </p>
              </div>

              <div className="grid grid-cols-2 text-xs text-slate-700 bg-slate-50/70 p-3 rounded border border-slate-200">
                <div>
                  <div><span className="font-semibold">Mata Pelajaran:</span> {formData.mapel}</div>
                  <div><span className="font-semibold">Kelas / Semester:</span> {formData.kelas} / Semester {formData.semester}</div>
                </div>
                <div className="text-right">
                  <div><span className="font-semibold">Alokasi Waktu:</span> {formData.alokasiWaktuMenit} Menit</div>
                  <div><span className="font-semibold">Guru Pengampu:</span> {currentUser.name}</div>
                </div>
              </div>

              <div className="space-y-6 divide-y divide-slate-100">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="pt-4 first:pt-0 space-y-3">
                    <div className="flex items-start space-x-2.5">
                      <span className="w-6 h-6 rounded bg-[#045f3b] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 tabular-nums">
                        {q.number}
                      </span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-900 leading-relaxed">
                          <MathText text={q.text} isArabic={q.isArabic} />
                        </div>

                        {q.imageUrl && (
                          <div className="my-3">
                            <img
                              src={q.imageUrl}
                              alt={`Diagram Soal ${q.number}`}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, q.text);
                              }}
                              className="max-h-60 max-w-full sm:max-w-lg object-contain rounded border border-slate-200 bg-white p-1"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {(q.type === 'single_choice' || q.type === 'multiple_choice') && q.options && (
                      <div className="pl-9 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt) => (
                            <div
                              key={opt.key}
                              className="flex items-start space-x-2 text-xs text-slate-800 p-2 rounded bg-slate-50/60 border border-slate-200/60"
                            >
                              <span className="font-bold text-[#045f3b]">{opt.key}.</span>
                              <div className="flex-1">
                                <MathText text={opt.text} isArabic={opt.isRtl || q.isArabic} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === 'short_answer' && (
                      <div className="pl-9 text-xs">
                        <div className="h-8 border-b border-dashed border-slate-400 flex items-center text-slate-400">
                          <span>Tuliskan jawaban Anda di sini: ....................................................</span>
                        </div>
                      </div>
                    )}

                    {q.type === 'ordering' && q.orderingItems && (
                      <div className="pl-9 space-y-1.5 text-xs">
                        {q.orderingItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-2 p-2 rounded bg-slate-50 border border-slate-200"
                          >
                            <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-bold text-slate-700">
                              {item.id}
                            </span>
                            <span className="text-slate-800">{item.text}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {q.type === 'matching' && (
                      <div className="pl-9 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="font-semibold text-slate-700">Kolom Premis (Kiri):</div>
                          {q.matchingPremises?.map((premise) => (
                            <div key={premise.id} className="flex items-start space-x-2">
                              <span className="font-bold text-[#045f3b]">{premise.id}.</span>
                              <span>{premise.text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="font-semibold text-slate-700">Kolom Pasangan (Kanan):</div>
                          {q.matchingResponses?.map((resp) => (
                            <div key={resp.key} className="flex items-start space-x-2">
                              <span className="font-bold text-amber-700">{resp.key}.</span>
                              <span>{resp.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {q.type === 'essay' && (
                      <div className="pl-9 text-xs">
                        <div className="h-16 border border-slate-200 rounded p-2 text-slate-400 bg-slate-50/40">
                          Ruang jawaban uraian siswa...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-medium text-slate-700">Teks Soal</label>
                  <button
                    type="button"
                    onClick={handleGenerateImageForEditQuestion}
                    disabled={isGeneratingImage || !editingQuestion.text.trim()}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isGeneratingImage ? 'Merender...' : '✨ Generate Gambar AI untuk Teks Ini'}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={editingQuestion.text}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, text: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
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

              {/* Lampiran Gambar / Diagram Soal */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-800" />
                    <span>Gambar / Diagram Stimulus Soal:</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handleGenerateImageForEditQuestion}
                      disabled={isGeneratingImage || !editingQuestion.text.trim()}
                      className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{isGeneratingImage ? 'Merender...' : 'Generate Cepat'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenImageModal(editingQuestion)}
                      className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center space-x-1 cursor-pointer"
                    >
                      <span>Studio Gambar</span>
                    </button>
                  </div>
                </div>
                {editingQuestion.imageUrl ? (
                  <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200">
                    <img
                      src={editingQuestion.imageUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, editingQuestion.text);
                      }}
                      className="h-16 w-24 object-contain rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-[11px] text-slate-600 truncate">
                      {editingQuestion.imagePrompt || editingQuestion.imageUrl}
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenImageModal(editingQuestion)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Ganti
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingQuestion({ ...editingQuestion, imageUrl: undefined, imagePrompt: undefined })
                        }
                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Belum ada gambar terpasang. Klik "Generate Cepat" di atas untuk menghasilkan diagram otomatis berdasarkan teks soal ini.
                  </p>
                )}
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
                className="px-4 py-2 rounded-lg bg-emerald-800 text-white text-xs font-semibold hover:bg-emerald-900 cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TAMBAH BUTIR SOAL BARU (DENGAN GENERATOR GAMBAR AI LANGSUNG) */}
      {isAddingNewQuestion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto border-2 border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-base">
                    Tambah Butir Soal Baru #{questions.length + 1}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ketik teks soal dan langsung buat ilustrasi diagram sains / gambar visual via AI
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingNewQuestion(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4 text-xs">
              {/* Tipe Soal & Mata Pelajaran */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipe Soal Kurikulum Merdeka</label>
                  <select
                    value={newQuestionData.type}
                    onChange={(e: any) => setNewQuestionData({ ...newQuestionData, type: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-800"
                  >
                    <option value="single_choice">Pilihan Ganda Tunggal (A-E)</option>
                    <option value="multiple_choice">Pilihan Ganda Jamak (Multi Kunci)</option>
                    <option value="short_answer">Isian Singkat</option>
                    <option value="essay">Uraian / Essay</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kunci Jawaban CBT</label>
                  <input
                    type="text"
                    value={newQuestionData.rawRightAnswer}
                    onChange={(e) => setNewQuestionData({ ...newQuestionData, rawRightAnswer: e.target.value })}
                    placeholder="Contoh: RIGHT:A atau RIGHT:A,B"
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-bold text-emerald-800"
                  />
                </div>
              </div>

              {/* Teks Soal + Direct AI Image Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-slate-700">Teks Pertanyaan Soal</label>
                  <button
                    type="button"
                    onClick={handleGenerateImageForNewQuestion}
                    disabled={isGeneratingImage || !newQuestionData.text.trim()}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold transition shadow-xs cursor-pointer disabled:opacity-40"
                    title="Klik untuk otomatis membuat gambar diagram dari teks soal ini"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isGeneratingImage ? 'Sedang Merender Diagram...' : '✨ Generate Gambar AI untuk Soal Ini'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={newQuestionData.text}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, text: e.target.value })}
                  placeholder="Ketik soal di sini (Contoh: Perhatikan gambar penampang daun dikotil di bawah ini. Bagian yang berfungsi fotosintesis ditunjukkan oleh...)"
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 text-xs sm:text-sm"
                />
              </div>

              {/* Box Lampiran Gambar AI yang Telah Digenerate */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    <span>Gambar / Diagram Soal:</span>
                  </span>
                  {newQuestionData.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewQuestionData({ ...newQuestionData, imageUrl: '' })}
                      className="text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                    >
                      Hapus Gambar
                    </button>
                  )}
                </div>

                {newQuestionData.imageUrl ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-amber-200">
                    <img
                      src={newQuestionData.imageUrl}
                      alt="Diagram Soal"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, newQuestionData.text);
                      }}
                      className="h-20 w-28 object-contain rounded-lg border border-slate-100 bg-slate-50 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-xs">Gambar Diagram Berhasil Dipasang ✓</div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">{newQuestionData.imageUrl}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] italic bg-white/70 p-2.5 rounded-xl border border-dashed border-amber-200 flex items-center justify-between">
                    <span>Belum ada gambar. Ketik soal lalu klik tombol <strong>"✨ Generate Gambar AI untuk Soal Ini"</strong> di atas.</span>
                  </div>
                )}
              </div>

              {/* Opsi Jawaban (Khusus Single Choice / Multiple Choice) */}
              {(newQuestionData.type === 'single_choice' || newQuestionData.type === 'multiple_choice') && (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block font-bold text-slate-700">Pilihan Opsi Jawaban A - E:</label>
                  <div className="space-y-1.5">
                    {newQuestionData.options.map((opt, idx) => (
                      <div key={opt.key} className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {opt.key}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const updated = [...newQuestionData.options];
                            updated[idx].text = e.target.value;
                            setNewQuestionData({ ...newQuestionData, options: updated });
                          }}
                          placeholder={`Jawaban opsi ${opt.key}...`}
                          className="flex-1 p-2 rounded-xl border border-slate-200 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pembahasan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pembahasan / Catatan Soal (Opsional)</label>
                <textarea
                  rows={2}
                  value={newQuestionData.explanation}
                  onChange={(e) => setNewQuestionData({ ...newQuestionData, explanation: e.target.value })}
                  placeholder="Catatan pembahasan atau kata kunci jawaban..."
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Soal otomatis disinkronkan ke dokumen cetak & format CBT
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNewQuestion(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveNewQuestion}
                  disabled={!newQuestionData.text.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  Simpan & Tambah ke Naskah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: SISIPKAN GAMBAR AI KE CBT TEXTBOX ([IMG]) */}
      {isCbtImageModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border-2 border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                  <ImageIcon className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-slate-900 text-base">
                    Sisipkan Gambar AI ke Naskah CBT
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otomatis generate gambar dan sematkan tag format [IMG]url[/IMG]
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCbtImageModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Deskripsi / Konsep Gambar yang Diinginkan
                </label>
                <textarea
                  rows={3}
                  value={cbtImagePrompt}
                  onChange={(e) => setCbtImagePrompt(e.target.value)}
                  placeholder="Contoh: Diagram jaring-jaring makanan ekosistem laut dengan fitoplankton, zooplankton, dan ikan..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gaya Ilustrasi</label>
                <select
                  value={imageStyle}
                  onChange={(e: any) => setImageStyle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="diagram">Diagram Skematik Edukasi (Background Putih)</option>
                  <option value="vector">Vektor Minimalis 2D</option>
                  <option value="photo">Foto Dokumenter Realistis</option>
                  <option value="sketch">Garis Hitam Putih (Buku Ujian)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCbtImageModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertCbtImage}
                disabled={isGeneratingImage || !cbtImagePrompt.trim()}
                className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs disabled:opacity-40 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGeneratingImage ? 'Merender Gambar...' : '✨ Generate & Sisipkan ke CBT'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Studio Gambar & Diagram Soal */}
      {imageModalQuestion && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[92vh] overflow-y-auto border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    Studio Gambar & Diagram Soal No. {imageModalQuestion.number}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Sematkan ilustrasi edukasi, diagram ilmiah, atau foto untuk stimulus soal
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageModalQuestion(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 rounded-xl bg-slate-100 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setImageModalTab('ai')}
                className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  imageModalTab === 'ai'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-amber-500" />
                <span>1. Generate Gambar AI</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('upload')}
                className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  imageModalTab === 'upload'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>2. Upload Berkas</span>
              </button>
              <button
                type="button"
                onClick={() => setImageModalTab('url')}
                className={`flex-1 py-2 px-3 rounded-lg transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  imageModalTab === 'url'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                <span>3. Input Link URL</span>
              </button>
            </div>

            {/* Tab Contents */}
            {imageModalTab === 'ai' && (
              <div className="space-y-3.5 text-xs">
                {/* Gaya Gambar Preset */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">
                    Pilih Gaya Tampilan Ilustrasi
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'diagram', label: '📐 Diagram Ilmiah', desc: 'Skema, label, latar putih' },
                      { id: 'vector', label: '🎨 Vektor Edukasi', desc: 'Grafis datar bersih & jelas' },
                      { id: 'photo', label: '📷 Foto Realistis', desc: 'Dokumenter fotografi' },
                      { id: 'sketch', label: '✏️ Sketsa Garis', desc: 'Hitam-putih naskah cetak' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setImageStyle(st.id as any)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                          imageStyle === st.id
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600/20 text-blue-900'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="font-bold text-xs">{st.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Input */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                      Perintah / Prompt Ilustrasi AI
                    </label>
                    <span className="text-[10px] text-slate-400">Dapat disesuaikan bebas</span>
                  </div>
                  <textarea
                    rows={2}
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Contoh: Diagram struktur penampang daun dikotil dengan bagian stomata dan kloroplas..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition"
                  />
                </div>

                {/* Generate Button */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-slate-500 italic">
                    AI akan menghasilkan gambar beresolusi tajam siap pakai untuk CBT & naskah cetak.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleGenerateAiImage()}
                    disabled={isGeneratingImage}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isGeneratingImage ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Sedang Merender...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>✨ Generate Sekarang (AI)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {imageModalTab === 'upload' && (
              <div className="space-y-3 text-xs">
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 text-center space-y-2 bg-slate-50/50 hover:bg-blue-50/20 transition cursor-pointer relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    Klik untuk memilih gambar atau seret file ke sini
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mendukung format PNG, JPG, JPEG, SVG, WebP (Maksimal 3 MB)
                  </p>
                </div>
              </div>
            )}

            {imageModalTab === 'url' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">
                    Tautan / URL Gambar Online
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      placeholder="https://contoh.com/gambar-soal.png"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customImageUrl.trim()) {
                          setPreviewImageUrl(customImageUrl.trim());
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition cursor-pointer"
                    >
                      Cek Gambar
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bisa menggunakan tautan gambar publik (Wikimedia Commons, Google Drive publik, repositori madrasah).
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {imageError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{imageError}</span>
              </div>
            )}

            {/* Preview Area */}
            {previewImageUrl && (
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Pratinjau Gambar Hasil:</span>
                  </span>
                  {imageModalTab === 'ai' && (
                    <button
                      type="button"
                      onClick={() => handleGenerateAiImage()}
                      disabled={isGeneratingImage}
                      className="text-[11px] text-blue-700 hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Coba Variasi Lain</span>
                    </button>
                  )}
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <img
                    src={previewImageUrl}
                    alt="Pratinjau Hasil"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, imagePrompt || imageModalQuestion?.text);
                    }}
                    className="max-h-64 max-w-full mx-auto object-contain rounded-xl shadow-xs border border-slate-200 bg-white"
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
              <div>
                {imageModalQuestion.imageUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      handleRemoveQuestionImage(imageModalQuestion.id);
                      setImageModalQuestion(null);
                    }}
                    className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Gambar dari Soal</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setImageModalQuestion(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!previewImageUrl}
                  onClick={() => handleApplyImageToQuestion(previewImageUrl)}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-200" />
                  <span>Pasang Gambar ke Soal No. {imageModalQuestion.number}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
