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

  // New Question Creator (Isi Soal Manual + Generate Gambar Langsung)
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState<boolean>(false);
  const [newQuestionData, setNewQuestionData] = useState<{
    text: string;
    type: 'single_choice' | 'multiple_choice' | 'short_answer' | 'ordering' | 'matching' | 'essay';
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
  const [autoGenerateImages, setAutoGenerateImages] = useState<boolean>(true);

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
      const res = await fetch('/api/v1/soal/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          questionText: q.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        const updated = questions.map((item) =>
          item.id === q.id ? { ...item, imageUrl: finalUrl, imagePrompt: promptToUse } : item
        );
        setQuestions(updated);
        setCbtText(formatExamToCbtText(formData, updated, { equationAsImage: equationAsImageInText, imageFormat }));
        setStatusMessage(`✨ Gambar diagram untuk Soal No. ${q.number} berhasil dibuat dan dipasang!`);
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
      const res = await fetch('/api/v1/soal/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToUse,
          questionText: activeQ.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        setPreviewImageUrl(finalUrl);
        // Automatically save to question directly so teacher doesn't have to click another button
        const updated = questions.map((q) =>
          q.id === activeQ.id ? { ...q, imageUrl: finalUrl, imagePrompt: promptToUse } : q
        );
        setQuestions(updated);
        setCbtText(formatExamToCbtText(formData, updated, { equationAsImage: equationAsImageInText, imageFormat }));
        if (editingQuestion && editingQuestion.id === activeQ.id) {
          setEditingQuestion({ ...editingQuestion, imageUrl: finalUrl });
        }
        setStatusMessage(`✨ Ilustrasi diagram Soal No. ${activeQ.number} siap digunakan!`);
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

  // Direct Image Generation while filling new question
  const handleGenerateImageForNewQuestion = async () => {
    if (!newQuestionData.text.trim()) {
      setStatusMessage('Silakan tuliskan teks soal terlebih dahulu untuk panduan AI merender diagram.');
      return;
    }
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch('/api/v1/soal/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: newQuestionData.imagePrompt || newQuestionData.text,
          questionText: newQuestionData.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      const finalUrl = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalUrl) {
        setNewQuestionData((prev) => ({
          ...prev,
          imageUrl: finalUrl,
          imagePrompt: prev.imagePrompt || data.promptUsed,
        }));
        setStatusMessage('Gambar diagram berhasil dibuat dan dipasang ke butir soal!');
      } else {
        setImageError(data.error || 'Gagal menghasilkan gambar');
      }
    } catch (err: any) {
      setImageError(err?.message || 'Koneksi ke server gagal');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Save New Question
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
    // Reset form
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

  // Generate Image Directly in Edit Question Modal
  const handleGenerateImageForEditQuestion = async () => {
    if (!editingQuestion || !editingQuestion.text.trim()) return;
    setIsGeneratingImage(true);
    setImageError(null);
    try {
      const res = await fetch('/api/v1/soal/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: editingQuestion.imagePrompt || editingQuestion.text,
          questionText: editingQuestion.text,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
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
        setStatusMessage('Gambar diagram soal berhasil diperbarui!');
      }
    } catch (e: any) {
      console.error(e);
      setStatusMessage('Gagal memperbarui diagram soal.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Insert Generated Image Directly into CBT Textbox
  const handleInsertCbtImage = async () => {
    if (!cbtImagePrompt.trim()) return;
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/v1/soal/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cbtImagePrompt,
          mapel: formData.mapel,
          style: imageStyle,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error(`Respons server non-JSON (${res.status}): ${text.slice(0, 100)}`);
      }
      const data = await res.json();
      const finalImg = data.proxyUrl || data.imageUrl || data.svgFallback;
      if (data.success && finalImg) {
        const imgTag = `\n[IMG]${finalImg}[/IMG]\n`;
        setCbtText((prev) => prev + imgTag);
        setIsCbtImageModalOpen(false);
        setCbtImagePrompt('');
        setStatusMessage('Tag gambar [IMG]...[/IMG] berhasil disisipkan ke kotak teks CBT.');
      }
    } catch (e: any) {
      console.error(e);
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

  const handleDirectQuotaChange = (
    typeKey: keyof ExamFormConfig['selectedTypes'],
    valStr: string
  ) => {
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

  // Generate Exam via Backend / Gemini API
  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage(null);
    setGenerationStep('Menganalisis Capaian Pembelajaran & materi target...');

    const progressSteps = [
      'Menghubungkan ke 9router AI Engine Fast-Track...',
      'Hermes Agent merumuskan naskah soal & opsi jawaban A-E...',
      'Memvalidasi format kunci RIGHT:, KaTeX LaTeX & RTL Arab...',
      'Menyusun naskah akhir & menyinkronkan ke dokumen Word & CBT...',
    ];
    let stepIdx = 0;
    const intervalId = setInterval(() => {
      stepIdx = (stepIdx + 1) % progressSteps.length;
      setGenerationStep(progressSteps[stepIdx]);
    }, 1800);

    try {
      const response = await fetch('/api/v1/soal/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          autoGenerateImages,
          imageStyle,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Respons server non-JSON (${response.status}): ${text.slice(0, 100)}`);
      }

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
      clearInterval(intervalId);
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
      {/* Top Header - Dignified Institutional Style */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Penyusunan Naskah Asesmen Madrasah
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase">
                6 Tipe Soal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              MA NU 01 Banyuputih Batang · Dilengkapi Generator Diagram Gambar AI & Ekspor Word .docx / CBT
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 shrink-0">
          {/* Quick Action: Tambah Butir Soal Baru */}
          <button
            type="button"
            onClick={() => setIsAddingNewQuestion(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Tambah butir soal baru dan buat diagram gambar langsung"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Tambah Soal & Gambar AI</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-xs font-bold text-slate-800 block">
                {formData.mapel || 'Pilih Mapel'} · Kelas {formData.kelas}
              </span>
              <span className="text-[10px] text-slate-500 block font-mono">
                {formData.jenisUjian}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-xs font-black tabular-nums">
              {questions.length} Soal
            </div>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Form Parameter */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-6 no-print">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <h2 className="font-heading font-bold text-sm sm:text-base text-slate-900 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-800" />
              <span>Konfigurasi Asesmen</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              MA NU 01 Banyuputih
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            {/* Mata Pelajaran & Jenis Ujian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 text-xs">Mata Pelajaran</label>
                <input
                  type="text"
                  value={formData.mapel}
                  onChange={(e) => handleInputChange('mapel', e.target.value)}
                  placeholder="Contoh: Fiqih, Biologi, Matematika"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition bg-slate-50/50 hover:bg-slate-50"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700 text-xs">Jenis Asesmen</label>
                <select
                  value={formData.jenisUjian}
                  onChange={(e) => handleInputChange('jenisUjian', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition font-medium"
                >
                  <option value="ASTS">ASTS (Tengah Semester)</option>
                  <option value="ASESGA">ASESGA (Akhir Semester)</option>
                  <option value="ASAS">ASAS (Akhir Satuan Pendidikan)</option>
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

            {/* Stimulus Gambar & Diagram AI Otomatis */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <label className="font-bold text-slate-900 text-xs block">
                      Stimulus Gambar & Diagram AI
                    </label>
                    <span className="text-[11px] text-slate-500 block">
                      Otomatis render diagram untuk soal eksak & biologi
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={(e) => setAutoGenerateImages(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer mt-1"
                />
              </div>

              {autoGenerateImages && (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-600 font-medium">Gaya Diagram:</span>
                  <select
                    value={imageStyle}
                    onChange={(e: any) => setImageStyle(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-amber-300 bg-white text-slate-800 font-semibold cursor-pointer"
                  >
                    <option value="diagram">Skematik Putih</option>
                    <option value="vector">Vektor Edukasi</option>
                    <option value="photo">Foto Realistis</option>
                    <option value="sketch">Garis Hitam Putih</option>
                  </select>
                </div>
              )}
            </div>

            {/* Konfigurasi 6 Tipe Soal (PRD Section 4.2.2) */}
            <div className="pt-3.5 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block font-semibold text-slate-800 text-xs">
                  Distribusi & Kuota Butir Soal (Maks 100)
                </label>
                <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md self-start sm:self-auto tabular-nums">
                  Total {Object.values(formData.selectedTypes).reduce((a, b) => a + b, 0)} Soal
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pb-1">
                <span className="text-xs text-slate-500 font-medium mr-1">Preset:</span>
                <button
                  type="button"
                  onClick={() => applyQuotaPreset(15)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  15 Soal
                </button>
                <button
                  type="button"
                  onClick={() => applyQuotaPreset(25)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  25 Soal
                </button>
                <button
                  type="button"
                  onClick={() => applyQuotaPreset(40)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  40 Soal (CBT)
                </button>
                <button
                  type="button"
                  onClick={() => applyQuotaPreset(50)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs transition cursor-pointer"
                >
                  50 Soal
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                {[
                  { key: 'single_choice' as const, label: 'PG Tunggal', sub: 'Pilihan Ganda A-E' },
                  { key: 'multiple_choice' as const, label: 'PG Jamak', sub: 'Multi Jawaban Benar' },
                  { key: 'short_answer' as const, label: 'Jawaban Singkat', sub: 'Isian Pendek' },
                  { key: 'ordering' as const, label: 'Mengurutkan', sub: 'Urutan Kronologis' },
                  { key: 'matching' as const, label: 'Menjodohkan', sub: 'Pasangan Pernyataan' },
                  { key: 'essay' as const, label: 'Uraian / Essay', sub: 'Rubrik Penilaian' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-900 text-xs truncate">{item.label}</div>
                      <div className="text-[11px] text-slate-500 truncate">{item.sub}</div>
                    </div>
                    <div className="flex items-center space-x-1 bg-white p-0.5 rounded-lg border border-slate-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTypeQuotaChange(item.key, -1)}
                        className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.selectedTypes[item.key]}
                        onChange={(e) => handleDirectQuotaChange(item.key, e.target.value)}
                        className="w-8 text-center font-semibold text-slate-900 text-xs tabular-nums bg-transparent focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleTypeQuotaChange(item.key, 1)}
                        className="w-6 h-6 rounded bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tingkat Kesulitan Proporsi */}
            <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between font-medium text-slate-800 text-xs">
                <span>Distribusi Tingkat Kesulitan</span>
                <span className="text-slate-600 font-mono text-xs tabular-nums">
                  {formData.difficultyProportion.mudah}% · {formData.difficultyProportion.sedang}% · {formData.difficultyProportion.sulit}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 flex overflow-hidden">
                <div style={{ width: `${formData.difficultyProportion.mudah}%` }} className="bg-emerald-600 transition-all duration-300" title="Mudah" />
                <div style={{ width: `${formData.difficultyProportion.sedang}%` }} className="bg-sky-600 transition-all duration-300" title="Sedang" />
                <div style={{ width: `${formData.difficultyProportion.sulit}%` }} className="bg-amber-600 transition-all duration-300" title="Sulit" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 pt-0.5">
                <span>Mudah ({formData.difficultyProportion.mudah}%)</span>
                <span>Sedang ({formData.difficultyProportion.sedang}%)</span>
                <span>Sulit ({formData.difficultyProportion.sulit}%)</span>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Menyusun Butir Soal Asesmen...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" />
                  <span>Generate Paket Soal Asesmen</span>
                </>
              )}
            </button>

            {/* Live Generation Progress Indicator */}
            {isGenerating && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center space-x-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-600 animate-ping shrink-0" />
                <span className="font-medium">{generationStep}</span>
              </div>
            )}

            {statusMessage && !isGenerating && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================
            RIGHT PANEL: Interactive CBT Text Box & Paper Preview
        ======================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Switcher & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-2xl no-print">
            {/* View Mode Toggle: Text Box CBT vs Pratinjau Kertas */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('textbox')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'textbox'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-800" />
                <span>Naskah CBT IDE</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('paper')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  viewMode === 'paper'
                    ? 'bg-white text-slate-900 shadow-xs'
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
                  {/* Sisipkan Gambar AI ke CBT */}
                  <button
                    type="button"
                    onClick={() => setIsCbtImageModalOpen(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition cursor-pointer"
                    title="Generate gambar AI dan sisipkan tag [IMG] langsung ke naskah CBT"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>+ Sisipkan Gambar AI ([IMG])</span>
                  </button>

                  {/* Salin CKEditor */}
                  <button
                    type="button"
                    onClick={handleCopyForCkEditor}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition cursor-pointer"
                    title="Salin rich text siap tempel di CKEditor CBT (Rumus otomatis jadi gambar)"
                  >
                    {copyCkSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Tersalin! Siap Tempel</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-200" />
                        <span>Salin Format CKEditor</span>
                      </>
                    )}
                  </button>

                  {/* Salin Teks CBT */}
                  <button
                    type="button"
                    onClick={handleCopyCbtText}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-medium transition cursor-pointer"
                    title="Salin naskah teks box standar CBT ke clipboard"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Salin Teks CBT</span>
                      </>
                    )}
                  </button>

                  {/* Download .txt */}
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                    title="Unduh berkas .txt standar CBT"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-400" />
                    <span>.txt</span>
                  </button>

                  {/* Download HTML */}
                  <button
                    type="button"
                    onClick={handleDownloadCkHtml}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                    title="Unduh berkas HTML siap impor CKEditor CBT"
                  >
                    <Code className="w-3.5 h-3.5 text-emerald-800" />
                    <span>HTML</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Tambah Soal Manual & Gambar AI */}
                  <button
                    type="button"
                    onClick={() => setIsAddingNewQuestion(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition cursor-pointer shadow-xs"
                    title="Tambah butir soal baru dan buat gambar diagram AI langsung"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>+ Tambah Soal & Gambar AI</span>
                  </button>

                  {/* Download Word */}
                  <button
                    type="button"
                    onClick={handleDownloadDocx}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 transition cursor-pointer"
                    title="Unduh berkas Word (.docx) naskah cetak"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh Word (.docx)</span>
                  </button>

                  {/* Cetak PDF */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition cursor-pointer"
                    title="Cetak langsung atau simpan sebagai PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-300" />
                    <span>Cetak PDF</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* VIEW MODE 1: TEKS BOX FORMAT CBT (SEDERHANA & UTAMA) */}
          {viewMode === 'textbox' ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
              {/* Header Info Bar */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2 text-xs font-semibold text-slate-800">
                  <span>{formData.jenisUjian}</span>
                  <span className="text-slate-300">·</span>
                  <span>{formData.mapel || 'Mata Pelajaran'}</span>
                  <span className="text-slate-300">·</span>
                  <span>Kelas {formData.kelas}</span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  <button
                    type="button"
                    onClick={handleLoadExample}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-semibold transition cursor-pointer touch-manipulation"
                    title="Muat format contoh persis seperti ketentuan guru"
                  >
                    Contoh Format
                  </button>
                  <button
                    type="button"
                    onClick={handleSyncFromConfig}
                    className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition flex items-center space-x-1.5 cursor-pointer touch-manipulation"
                    title="Format ulang teks dari parameter soal saat ini"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Ulang</span>
                  </button>
                </div>
              </div>

              {/* Sub-mode selector: Teks Biasa CBT vs Format CKEditor HTML */}
              <div className="px-3.5 sm:px-4 py-3 bg-slate-50/50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setCbtSubMode('standard')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer touch-manipulation ${
                      cbtSubMode === 'standard'
                        ? 'bg-emerald-800 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    Format Teks Standar (.txt)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCbtSubMode('ckeditor_html')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center space-x-1.5 cursor-pointer touch-manipulation ${
                      cbtSubMode === 'ckeditor_html'
                        ? 'bg-emerald-700 text-white shadow-3xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Mode CKEditor (Auto-Gambar)</span>
                  </button>
                </div>

                {/* Equation Image Format Selector */}
                <div className="flex items-center space-x-2 text-slate-600 text-xs">
                  <span className="text-slate-500 font-medium">Render Rumus:</span>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value as 'png' | 'svg')}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="png">PNG (Tajam)</option>
                    <option value="svg">SVG (Vektor)</option>
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
                  <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Keterangan Standar Format Soal CBT:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">1. PG Jawaban Tunggal</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:1)Jeruk adalah...<br/>
                      A:)Buah<br/>
                      B:)Hewan<br/>
                      RIGHT:A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">2. PG Jamak</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:2)Angka 10 dari...<br/>
                      A:)5+5<br/>
                      B:)6+4<br/>
                      RIGHT:A,B
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">3. Jawaban Singkat</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:3)Nama Ibukota...<br/>
                      A:)JAKARTA<br/>
                      RIGHT:A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">4. Mengurutkan Jawaban</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:4)Urutkan dari atas...<br/>
                      A:)Kepala<br/>
                      B:)Pundak<br/>
                      RIGHT:2,1
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">5. Menjodohkan</div>
                    <p className="text-slate-500 font-mono text-[10px] leading-snug">
                      Q:5)Jodohkan simbol...<br/>
                      1.&nbsp;&nbsp;Bintang<br/>
                      A:)Ketuhanan YME<br/>
                      RIGHT:1-A
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 space-y-1 shadow-2xs">
                    <div className="font-bold text-emerald-900">6. Uraian Panjang</div>
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
                          ? 'bg-emerald-800 text-white'
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
                          <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 tabular-nums">
                            {q.number}
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 leading-relaxed">
                              <MathText text={q.text} isArabic={q.isArabic} />
                            </div>

                            {/* Question Image if present */}
                            {q.imageUrl && (
                              <div className="my-3">
                                <div className="inline-block relative rounded-2xl overflow-hidden border-2 border-emerald-800/30 bg-emerald-950/5 shadow-sm group/img p-1 bg-white">
                                  <img
                                    src={q.imageUrl}
                                    alt={`Diagram Soal ${q.number}`}
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.src = getFallbackDiagramSvg(formData.mapel, q.text);
                                    }}
                                    className="max-h-60 max-w-full sm:max-w-lg object-contain rounded-xl border border-slate-200 bg-white"
                                    loading="lazy"
                                  />
                                  <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 opacity-90 group-hover/img:opacity-100 transition no-print bg-slate-900/80 p-1 rounded-xl backdrop-blur-xs">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenImageModal(q)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center space-x-1 cursor-pointer"
                                      title="Ubah / Ganti Gambar"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-300" />
                                      <span>Ganti Diagram</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveQuestionImage(q.id)}
                                      className="p-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-700 text-white text-[10px] cursor-pointer"
                                      title="Hapus Gambar"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Stimulus & 1-Click Diagram AI Generator Bar (Always available if question has no image) */}
                            {!q.imageUrl && (
                              <div className="my-2.5 p-3 rounded-2xl bg-[#093d25]/5 border border-emerald-800/20 flex flex-wrap items-center justify-between gap-2.5 no-print">
                                <div className="flex items-center space-x-2 text-emerald-950 text-xs">
                                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span className="text-[11px] leading-tight">
                                    {q.imagePrompt ? (
                                      <>
                                        <strong className="text-emerald-900 font-bold">Rekomendasi Diagram:</strong>{' '}
                                        <span className="text-slate-700">{q.imagePrompt}</span>
                                      </>
                                    ) : (
                                      <span className="text-slate-600">
                                        Stimulus diagram visual untuk soal ini belum ditambahkan.
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <button
                                    type="button"
                                    disabled={generatingImageQId === q.id}
                                    onClick={() => handleQuickGenerateQuestionImage(q, q.imagePrompt)}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                                  >
                                    {generatingImageQId === q.id ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                                        <span>Merender...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                        <span>✨ 1-Klik Generate Diagram AI</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenImageModal(q)}
                                    className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                                    title="Pilih style atau upload file sendiri"
                                  >
                                    Studio Gambar
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5 no-print">
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase bg-slate-100 text-slate-600">
                            {q.type.replace('_', ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenImageModal(q)}
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                              q.imageUrl
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                            title={q.imageUrl ? 'Kelola gambar soal' : 'Generate gambar/diagram AI untuk soal ini'}
                          >
                            <ImageIcon className="w-3 h-3 text-emerald-700" />
                            <span>{q.imageUrl ? 'Diagram ✓' : '+ Gambar AI'}</span>
                          </button>
                          <button
                            onClick={() => setEditingQuestion(q)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-800 hover:bg-slate-100 cursor-pointer"
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
                                <span className="font-bold text-emerald-900">{opt.key}.</span>
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
                                  <span className="font-bold text-emerald-900">{premise.id}.</span>
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
