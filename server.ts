import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Helper: Resilient Gemini generation with exponential retry & automatic model fallback
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateWithModelFallback(
  ai: GoogleGenAI,
  params: {
    prompt: string;
    responseMimeType?: string;
    temperature?: number;
  }
): Promise<{ text: string; modelUsed: string } | null> {
  for (const model of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.prompt,
          config: {
            responseMimeType: params.responseMimeType,
            temperature: params.temperature ?? 0.7,
          },
        });

        if (response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: any) {
        const isTransient =
          err?.status === 'UNAVAILABLE' ||
          err?.status === 503 ||
          String(err?.message || '').includes('503') ||
          String(err?.message || '').includes('high demand') ||
          String(err?.message || '').includes('UNAVAILABLE') ||
          err?.status === 429 ||
          String(err?.message || '').includes('RESOURCE_EXHAUSTED');

        if (isTransient && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 800 * attempt));
          continue;
        }

        if (isTransient) {
          console.info(`9router / Gemini Fallback: Model ${model} is busy (503 high demand), trying next fallback model...`);
          break;
        } else {
          console.info(`9router / Gemini Fallback: Model ${model} returned non-transient status, trying next model...`);
          break;
        }
      }
    }
  }
  return null;
}

// Helper: Extract OpenAI / 9router configuration from environment
function getRouterConfig() {
  const baseUrl = (process.env.OPENAI_BASE_URL || process.env.NINEROUTER_BASE_URL || '').trim();
  const apiKey = (process.env.OPENAI_API_KEY || process.env.NINEROUTER_API_KEY || '').trim();
  const model = (process.env.OPENAI_MODEL || process.env.NINEROUTER_MODEL || process.env.MODEL_NAME || '').trim();
  return { baseUrl, apiKey, model };
}

// Auto-discovery cache for active 9router model
let cachedResolvedModel = '';
async function resolveRouterModel(baseUrl: string, apiKey: string, preferredModel?: string): Promise<string> {
  if (preferredModel) return preferredModel;
  if (cachedResolvedModel) return cachedResolvedModel;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const modelEndpoints = [
    cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`,
    `${cleanBase}/models`,
  ];

  for (const mUrl of modelEndpoints) {
    try {
      const res = await fetch(mUrl, { method: 'GET', headers });
      if (res.ok) {
        const data = (await res.json()) as any;
        const list: string[] = Array.isArray(data?.data)
          ? data.data.map((m: any) => m.id || m.name).filter(Boolean)
          : Array.isArray(data)
          ? data.map((m: any) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean)
          : [];

        if (list.length > 0) {
          // If komoboku exists, prioritize it
          const komobokuMatch = list.find((m) => m.toLowerCase().includes('komoboku') || m.toLowerCase().includes('komboku'));
          if (komobokuMatch) {
            cachedResolvedModel = komobokuMatch;
            return komobokuMatch;
          }
          // Prioritize any combo model or auto model
          const autoMatch = list.find((m) => m.includes('auto') || m.includes('combo') || m.includes('gemini'));
          if (autoMatch) {
            cachedResolvedModel = autoMatch;
            return autoMatch;
          }
          cachedResolvedModel = list[0];
          return list[0];
        }
      }
    } catch {}
  }

  return 'komoboku';
}

// Helper: Extract text from either standard JSON or Server-Sent Events (SSE data: ...) stream
function extractTextFromRouterResponse(rawText: string): string {
  const trimmed = rawText.trim();
  if (!trimmed) return '';

  // 1. Try standard JSON object
  if (trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed);
      const content =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.text ||
        data?.choices?.[0]?.delta?.content;
      if (typeof content === 'string' && content.trim()) {
        return content.trim();
      }
    } catch {}
  }

  // 2. Handle Server-Sent Events (SSE) data: chunks
  if (trimmed.includes('data:')) {
    const lines = trimmed.split('\n');
    let accumulated = '';
    for (const line of lines) {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('data:') && !cleanLine.includes('[DONE]')) {
        const jsonStr = cleanLine.replace(/^data:\s*/, '').trim();
        try {
          const chunk = JSON.parse(jsonStr);
          const delta =
            chunk?.choices?.[0]?.delta?.content ||
            chunk?.choices?.[0]?.message?.content ||
            chunk?.choices?.[0]?.text ||
            '';
          accumulated += delta;
        } catch {}
      }
    }
    if (accumulated.trim()) {
      return accumulated.trim();
    }
  }

  return trimmed;
}

// Unified Generator supporting 9router Combo Model & Gemini SDK
async function generateViaUnifiedAI(params: {
  prompt: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<{ text: string; modelUsed: string } | null> {
  // 1. Try 9router / OpenAI-compatible Gateway if configured
  const { baseUrl, apiKey, model: explicitModel } = getRouterConfig();

  if (baseUrl) {
    try {
      const activeModel = await resolveRouterModel(baseUrl, apiKey, explicitModel);
      const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
      const endpoint = cleanBaseUrl.endsWith('/chat/completions')
        ? cleanBaseUrl
        : cleanBaseUrl.endsWith('/v1')
        ? `${cleanBaseUrl}/chat/completions`
        : `${cleanBaseUrl}/v1/chat/completions`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const bodyPayload: any = {
        model: activeModel,
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.temperature ?? 0.7,
        stream: false,
      };

      if (params.responseMimeType === 'application/json') {
        bodyPayload.response_format = { type: 'json_object' };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(bodyPayload),
      });

      if (response.ok) {
        const rawText = await response.text();
        const text = extractTextFromRouterResponse(rawText);
        if (text) {
          return { text, modelUsed: `9router (${activeModel})` };
        }
      } else {
        const errorText = await response.text();
        console.warn(`9router status ${response.status}:`, errorText);
      }
    } catch (err) {
      console.warn('9router connection error, attempting Gemini direct fallback:', err);
    }
  }

  // 2. Direct Gemini SDK fallback
  const ai = getGeminiClient();
  if (ai) {
    return generateWithModelFallback(ai, params);
  }

  return null;
}

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  const { baseUrl, apiKey, model: explicitModel } = getRouterConfig();
  let resolvedModel = explicitModel;
  if (baseUrl && !resolvedModel) {
    resolvedModel = await resolveRouterModel(baseUrl, apiKey);
  }

  res.json({
    status: 'ok',
    institution: 'MA NU 01 Banyuputih Batang',
    gateway: baseUrl ? `9router (${baseUrl})` : '9router AI Gateway',
    orchestrator: resolvedModel ? `Combo Model (${resolvedModel})` : '9router Combo Model',
    nineRouterConfigured: Boolean(baseUrl),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    model: resolvedModel || 'komoboku',
    timestamp: new Date().toISOString(),
  });
});

// Dedicated 9router Connection Test Endpoint
app.post('/api/v1/ninerouter/test', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { baseUrl, apiKey, model: explicitModel } = getRouterConfig();

  if (!baseUrl) {
    return res.status(400).json({
      connected: false,
      message: 'Variabel OPENAI_BASE_URL atau NINEROUTER_BASE_URL belum diatur di environment server.',
      tip: 'Pastikan OPENAI_BASE_URL dan OPENAI_API_KEY sudah diisi dan tombol "Apply" sudah diklik.',
    });
  }

  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  // Probe available models from 9router /models or /v1/models
  let discoveredModels: string[] = [];
  const modelEndpoints = [
    cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`,
    `${cleanBase}/models`,
  ];

  for (const mUrl of modelEndpoints) {
    try {
      const mRes = await fetch(mUrl, { method: 'GET', headers });
      if (mRes.ok) {
        const mData = (await mRes.json()) as any;
        if (Array.isArray(mData?.data)) {
          discoveredModels = mData.data.map((m: any) => m.id || m.name).filter(Boolean);
          break;
        } else if (Array.isArray(mData)) {
          discoveredModels = mData.map((m: any) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean);
          break;
        }
      }
    } catch {}
  }

  // If no explicit model provided, auto-select from discovered list
  let routerModel = explicitModel;
  if (!routerModel) {
    if (discoveredModels.includes('komoboku')) {
      routerModel = 'komoboku';
    } else if (discoveredModels.length > 0) {
      routerModel = discoveredModels[0];
    } else {
      routerModel = 'komoboku';
    }
  }

  // Candidate chat completion endpoints
  const chatEndpoints = [
    cleanBase.endsWith('/chat/completions')
      ? cleanBase
      : cleanBase.endsWith('/v1')
      ? `${cleanBase}/chat/completions`
      : `${cleanBase}/v1/chat/completions`,
    `${cleanBase}/chat/completions`,
  ];

  const uniqueEndpoints = Array.from(new Set(chatEndpoints));
  let lastStatus = 404;
  let lastErrorText = '';

  const testPayload = {
    model: routerModel,
    messages: [
      {
        role: 'user',
        content: 'Halo, respon dengan 1 kalimat singkat: "Koneksi 9router MA NU 01 Banyuputih berhasil."',
      },
    ],
    max_tokens: 60,
    temperature: 0.3,
    stream: false,
  };

  for (const endpoint of uniqueEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(testPayload),
      });

      lastStatus = response.status;
      const rawText = await response.text();

      if (response.ok) {
        const reply = extractTextFromRouterResponse(rawText) || 'Sukses terhubung';
        const latency = Date.now() - startTime;
        cachedResolvedModel = routerModel;
        return res.json({
          connected: true,
          endpoint,
          model: routerModel,
          latencyMs: latency,
          responseSample: reply,
          discoveredModels: discoveredModels.length > 0 ? discoveredModels : undefined,
          message: `Koneksi ke 9router berhasil! Menggunakan model "${routerModel}".`,
        });
      } else {
        lastErrorText = rawText;
      }
    } catch (err: any) {
      lastErrorText = err?.message || 'Network error';
    }
  }

  const latency = Date.now() - startTime;
  let tipMessage = 'Periksa konfigurasi 9router Anda.';
  if (discoveredModels.length > 0) {
    tipMessage = `Model "${routerModel}" tidak merespon. Model yang aktif di 9router Anda: [ ${discoveredModels.slice(0, 8).join(', ')}... ].`;
  }

  return res.status(lastStatus >= 400 && lastStatus < 600 ? lastStatus : 500).json({
    connected: false,
    endpoint: uniqueEndpoints[0],
    model: routerModel,
    statusCode: lastStatus,
    errorRaw: lastErrorText,
    discoveredModels: discoveredModels.length > 0 ? discoveredModels : undefined,
    message: `9router mengembalikan status error HTTP ${lastStatus}.`,
    tip: tipMessage,
  });
});

// Generator Soal API Endpoint
app.post('/api/v1/soal/generate', async (req: Request, res: Response) => {
  try {
    const {
      mapel,
      kelas,
      semester,
      tahunPelajaran,
      jenisUjian,
      bahasa,
      capaianPembelajaran,
      selectedTypes,
      difficultyProportion,
    } = req.body;

    const prompt = `Anda bertindak sebagai AI Engine Madrasah (9router Combo Model) untuk MA NU 01 Banyuputih Batang.
Hasilkan paket soal ujian madrasah berkualitas tinggi sesuai Kurikulum Merdeka dan standar Kemenag RI dengan ketentuan:
- Mata Pelajaran: ${mapel}
- Kelas: ${kelas} | Semester: ${semester} | Tahun Pelajaran: ${tahunPelajaran}
- Jenis Ujian: ${jenisUjian} (ASTS/ASESGA/ASAS)
- Bahasa Pengantar Sistem: ${bahasa}
- Capaian Pembelajaran / Materi Target: ${capaianPembelajaran || 'Standar Capaian Pembelajaran Kurikulum Merdeka'}

================================================================================
HIERARKI KONTEKS GENERASI SOAL (SANGAT KETAT & WAJIB DITAATI):
================================================================================
1. PRIORITAS UTAMA (LEVEL 1): IDENTITAS MATA PELAJARAN & BAHASA ALAMI MAPEL
   Mata pelajaran memegang kendali tertinggi atas domain keilmuan dan bahasa naskah. Pilihan dropdown bahasa diabaikan jika bertentangan dengan bahasa alami mata pelajaran:
   - JIKA MAPEL = "BAHASA JAWA" (atau Muatan Lokal Bahasa Jawa, Sastra Jawa):
     * SELURUH naskah soal, stimulus teks bacaan (Geguritan, Cerkak, Tembang Macapat, Pawarta, Sandhangan Aksara Jawa), opsi jawaban A-E, petunjuk soal, kunci, dan pembahasan HARUS 100% MURNI DALAM BAHASA JAWA (Basa Jawa standar Kurikulum Muatan Lokal Jawa Tengah SMA/MA Kelas ${kelas}).
     * DILARANG KERAS menggunakan bahasa Indonesia untuk soal Bahasa Jawa, MESKIPUN dropdown bahasa sistem dipilih 'Indonesia'!
   - JIKA MAPEL = "BAHASA INGGRIS" (atau English, Sastra Inggris):
     * SELURUH naskah soal, stimulus reading passage, opsi jawaban A-E, petunjuk, dan pembahasan HARUS 100% MURNI DALAM BAHASA INGGRIS (Standard English) sesuai Kurikulum Merdeka Kelas ${kelas} (Descriptive text, Recount, Congratulation/Compliment, Grammar, dll).
     * DILARANG KERAS mencampuradukkan materi pelajaran Bahasa Indonesia (seperti Teks Argumentasi Pangan Lokal, Paragraf Deduktif, dll).
   - JIKA MAPEL = "BAHASA ARAB":
     * SELURUH naskah soal, teks qira'ah, opsi jawaban HARUS 100% MURNI DALAM BAHASA ARAB (Fusha berharakat lengkap, RTL).
   - JIKA MAPEL EKSAK/UMUM (Matematika, Fisika, Kimia, Biologi, Geografi, Sosiologi, Ekonomi, Sejarah, Informatika, Fiqih, SKI, Quran Hadis):
     * Materi soal harus 100% murni konsep mata pelajaran tersebut tanpa analogi yang salah sasaran (misal Matematika tidak boleh memuat istilah fikih/zakat).

2. PRIORITAS KEDUA (LEVEL 2): KELAS & TINGKAT KOGNITIF SISWA
   - Sesuaikan kedalaman materi, kompleksitas bacaan, dan proporsi kognitif (LOTS/MOTS/HOTS) dengan jenjang Kelas ${kelas} (Fase ${kelas === '10' ? 'E' : 'F'}).

3. PRIORITAS KETIGA (LEVEL 3): MATERI / CAPAIAN PEMBELAJARAN
   - Fokuskan stimulus dan butir-butir pertanyaan pada materi: "${capaianPembelajaran || mapel}".

DISIPLIN SOAL CBT:
- DILARANG KERAS mengulang atau menduplikasi pertanyaan yang identik/mirip. Setiap butir soal (Q:1, Q:2, dst.) harus unik dan menargetkan sub-kompetensi bervariasi.
- Soal Uraian/Essay untuk Matematika/Sains HARUS berupa pemecahan masalah matematis nyata (HOTS).

ATURAN KHUSUS SOAL MENGURUTKAN (ORDERING):
- Butir tahapan/langkah dalam orderingItems JANGAN DIACAK! Tuliskan langkah-langkah dalam urutan yang benar dan runtut dari awal ke akhir (id: 1 adalah langkah pertama yang benar, id: 2 adalah langkah kedua yang benar, dst). Opsi HANYA berisi teks murni tanpa embel-embel/penjelasan. Sistem CBT Madrasah yang akan mengacak tampilan item secara otomatis saat ujian berlangsung. Baris rawRightAnswer diisi "RIGHT:".

ATURAN KHUSUS SOAL MENJODOHKAN (MATCHING):
- Antara Premis dan Pilihan/Pasangan Respons (matchingPremises dan matchingResponses) JANGAN DIACAK! Susunlah berpasangan langsung secara lurus 1-ke-1 (Premis index 0 berpasangan benar dengan Respons index 0 / key "A", Premis index 1 dengan Respons index 1 / key "B", Premis index 2 dengan Respons index 2 / key "C", dst).
- Pada soal menjodohkan, field rawRightAnswer diisi "RIGHT:".

SINTAKS MATEMATIKA:
- Jika memuat rumus matematika atau fisika, wajib gunakan sintaks LaTeX diapit tanda dollar $...$ atau $$...$$. Contoh: $2^{2x} - 6 \\cdot 2^x + 8 = 0$, $\\frac{a^3b^{-2}}{a^{-1}b}$.

- Konfigurasi Tipe Soal sesuai format impor CBT Madrasah:
  * Pilihan Ganda Tunggal: ${selectedTypes?.single_choice ?? 2} butir (Opsi A:) s.d E:), Kunci: RIGHT:A)
  * Pilihan Ganda Jamak: ${selectedTypes?.multiple_choice ?? 1} butir (Opsi A:) s.d E:), Kunci: RIGHT:A,B tanpa spasi)
  * Jawaban Singkat: ${selectedTypes?.short_answer ?? 1} butir (Satu opsi A:) jawaban huruf kapital, Kunci: RIGHT:A)
  * Mengurutkan: ${selectedTypes?.ordering ?? 1} butir (Item berurutan runtut 1..n tidak diacak, Kunci: RIGHT: kosong)
  * Menjodohkan: ${selectedTypes?.matching ?? 1} butir (Premis dan Pasangan 1-to-1 lurus tidak diacak, Kunci: RIGHT: kosong)
  * Uraian/Essay: ${selectedTypes?.essay ?? 1} butir (Hanya teks soal, tanpa opsi dan tanpa RIGHT:)

Kembalikan respon DALAM FORMAT JSON MURNI tanpa markdown block backticks dengan struktur:
{
  "questions": [
    {
      "id": "q-1",
      "number": 1,
      "type": "single_choice" | "multiple_choice" | "short_answer" | "ordering" | "matching" | "essay",
      "text": "Teks soal lengkap",
      "isArabic": false,
      "hasLatex": false,
      "difficulty": "mudah" | "sedang" | "sulit",
      "kompetensiTarget": "Indikator KD",
      "options": [{"key": "A", "text": "opsi A", "isRtl": false}],
      "orderingItems": [{"id": 1, "text": "item urutan"}],
      "matchingPremises": [{"id": 1, "text": "premis"}],
      "matchingResponses": [{"key": "A", "text": "respons"}],
      "rawRightAnswer": "RIGHT:A" (atau "RIGHT:A,B" atau "RIGHT:" untuk ordering/matching atau "" untuk essay),
      "explanation": "Pembahasan singkat",
      "essaySampleAnswer": "Narasi jawaban",
      "essayRubric": [{"scoreRange": "80-100", "criteria": "Kriteria penilaian"}]
    }
  ]
}`;

    const genResult = await generateViaUnifiedAI({
      prompt,
      responseMimeType: 'application/json',
      temperature: 0.7,
    });

    if (genResult) {
      try {
        const rawText = genResult.text || '';
        const parsed = JSON.parse(rawText);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return res.json({
            success: true,
            source: `${genResult.modelUsed}`,
            questions: parsed.questions,
          });
        }
      } catch {
        console.info('9router / AI: JSON parse issue on response, using fallback engine.');
      }
    }

    // Fallback template generator if offline, busy, or key absent
    const fallbackQuestions = generateFallbackExamQuestions(
      mapel,
      kelas,
      semester,
      jenisUjian,
      bahasa,
      selectedTypes
    );

    return res.json({
      success: true,
      source: 'Hermes Agent Local Template Engine',
      questions: fallbackQuestions,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

function cleanMarkdownAdminOutput(text: string): string {
  if (!text) return '';
  let str = text;

  // Decode common HTML entities
  str = str
    .replace(/&bull;/gi, '•')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&ndash;/gi, '–')
    .replace(/&mdash;/gi, '—');

  // Strip script and style blocks
  str = str.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  str = str.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

  // Convert bold and italic tags
  str = str.replace(/<(?:strong|b)\b[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**');
  str = str.replace(/<(?:em|i)\b[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*');
  str = str.replace(/<u\b[^>]*>([\s\S]*?)<\/u>/gi, '$1');

  // Remove wrapper HTML tags like div, span, p, header, footer, etc.
  // Outside tables convert <br> to newline, inside table rows preserve clean line
  const lines = str.split(/\r?\n/);
  const cleanedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      return line
        .replace(/<\/?br\s*\/?>/gi, '<br/>')
        .replace(/<\/?(?:div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');
    } else {
      return line
        .replace(/<\/?br\s*\/?>/gi, '\n')
        .replace(/<\/?(?:div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');
    }
  });

  str = cleanedLines.join('\n');
  str = str.replace(/<\/?(?:html|body|head|meta|link|div|p|span|section|header|footer|font|center)\b[^>]*>/gi, '');
  str = str.replace(/\n{3,}/g, '\n\n');

  return str.trim();
}

// Generator Perangkat Administrasi Guru API Endpoint
app.post('/api/v1/admin/generate-document', async (req: Request, res: Response) => {
  try {
    const {
      docType,
      mapel,
      fase,
      kelas,
      semester,
      tahunPelajaran,
      topikMateri,
      alokasiWaktu,
      guruPengampu,
      nipGuru,
      kepalaMadrasah,
      nipKepala,
      nilaiKBC,
      modelPembelajaran,
      capaianPembelajaranTeks,
      instruksiKhusus,
      karakteristikPesertaDidik,
      dimensiProfilLulusan,
      jumlahPertemuan,
      jamPerPertemuan,
      jenisAsesmen,
    } = req.body;

    let structureGuide = '';
      if (docType === 'rpp') {
        const dimensiList = Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length > 0
          ? dimensiProfilLulusan.join(', ')
          : 'Beriman, Bertakwa kepada Tuhan YME, Berakhlak Mulia, Bernalar Kritis, Mandiri, Bergotong Royong, Berkeadaban (Ta\'addub)';
        const asesmenList = Array.isArray(jenisAsesmen) && jenisAsesmen.length > 0
          ? jenisAsesmen.join(', ')
          : 'Asesmen Diagnostik (Awal), Asesmen Formatif (Proses KBM & LKPD), Asesmen Sumatif (Akhir TP)';

        structureGuide = `
Khusus untuk DOKUMEN RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA:
KOMPONEN DAN DATA MASUKAN GURU:
- Kelas & Fase : Kelas ${kelas} (Fase ${fase}) [Catatan: Fase terisi otomatis berdasarkan kelas]
- Semester : Semester ${semester}
- Mata Pelajaran : ${mapel}
- Capaian Pembelajaran (CP) yang menjadi acuan:
"""
${capaianPembelajaranTeks || 'Siswa mampu menganalisis konsep inti ' + mapel + ', menerapkan pemecahan masalah kontekstual, dan mengamalkan nilai akhlak mulia serta adab thalabul ilmi.'}
"""
- Topik / Materi Pembelajaran : ${topikMateri}
- Karakteristik Peserta Didik : ${karakteristikPesertaDidik || 'Kemampuan awal beragam (heterogen), preferensi gaya belajar bervariasi (visual, auditori, kinestetik), berkarakter santun dan antusias'}
- Dimensi Profil Lulusan (Profil Pelajar Pancasila & Rahmatan lil Alamin / KBC) : ${dimensiList}
- Jumlah Pertemuan : ${jumlahPertemuan || '2 Pertemuan'}
- Jumlah Jam per Pertemuan : ${jamPerPertemuan || '2 JP (2 x 45 menit)'} (Total JP: ${alokasiWaktu || '4 JP'})
- Model Pembelajaran : ${modelPembelajaran || 'Problem Based Learning (PBL) & Understanding by Design (UbD)'}
- Jenis Asesmen : ${asesmenList}

SUSUN DOKUMEN RPP LENGKAP SECARA RINCI DALAM FORMAT MARKDOWN RESMI BERIKUT:
# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berpedoman pada Panduan Pembelajaran dan Asesmen BSKAP Kemendikbudristek & Kemenag RI*

---

### I. ANALISIS KESIAPAN & KARAKTERISTIK PESERTA DIDIK
1. **Profil Kesiapan Belajar & Gaya Belajar:**
   Uraikan analisis mendalam tentang: ${karakteristikPesertaDidik || 'Gaya belajar visual, auditori, kinestetik, dan kesiapan pemahaman awal santri'}
2. **Strategi Pembelajaran Berdiferensiasi:**
   - *Diferensiasi Konten:* Penyediaan variasi bahan ajar (modul ringkas, bahan tayang visual, studi kasus kontekstual).
   - *Diferensiasi Proses:* Pendampingan bertingkat (scaffolding) dan pembentukan kelompok heterogen.
   - *Diferensiasi Produk:* Fleksibilitas penyajian hasil kerja (laporan tertulis, infografis/peta konsep, atau presentasi).

---

### II. CAPAIAN PEMBELAJARAN & TUJUAN PEMBELAJARAN
1. **Capaian Pembelajaran (CP) Elemen Terkait:**
   Uraikan capaian pembelajaran dan elemen CP yang dibidik.
2. **Tujuan Pembelajaran (TP):**
   Rumuskan 2-4 Tujuan Pembelajaran yang operasional (KKO Bloom/Marzano).
3. **Indikator Ketercapaian Tujuan Pembelajaran (IKTP):**
   Rincian bukti ketercapaian kompetensi peserta didik.
4. **Pemahaman Bermakna (Deep Learning):**
   - *Mindful Learning:* Kesadaran batin memaknai ilmu sebagai sarana mendekatkan diri kepada Allah SWT.
   - *Meaningful Learning:* Manfaat konkret materi ${topikMateri} dalam kehidupan nyata peserta didik.
   - *Joyful Learning:* Suasana belajar ramah, apresiatif, menyenangkan, dan memicu rasa ingin tahu.
5. **Pertanyaan Pemantik (Essential Questions):**
   Rumuskan 2-3 pertanyaan pemantik pemantik nalar kritis.
6. **Dimensi Profil Lulusan & KBC:**
   ${dimensiList} serta integrasi nilai Kurikulum Berbasis Cinta (Kasih Sayang/Rahmah, Adab Terhadap Guru & Lingkungan).

---

### III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN (RINCIAN PER PERTEMUAN)
Sajikan langkah-langkah kegiatan secara mendetail untuk setiap pertemuan (${jumlahPertemuan || '2 Pertemuan'}).

Untuk setiap pertemuan, buat tabel rincian kegiatan:
| Tahapan Kegiatan | Deskripsi Aktivitas Guru & Peserta Didik (Sintaks ${modelPembelajaran || 'PBL'}) | Alokasi Waktu |
|:---|:---|:---:|
- **1. Kegiatan Pendahuluan (10-15 Menit):**
  - Pembukaan santun (salam, tadarus Al-Qur'an/doa, pembiasaan asmaul husna, cek kehadiran dengan sapaan kasih sayang).
  - Apersepsi & Kesiapan (mengaitkan materi sebelumnya, asesmen diagnostik singkat).
  - Motivasi & Pertanyaan Pemantik kontekstual.
  - Penyampaian tujuan dan skenario pembelajaran.
- **2. Kegiatan Inti (60-70 Menit):**
  - Langkah-langkah runtut sesuai sintaks ${modelPembelajaran || 'Problem Based Learning'}.
  - Penerapan diferensiasi proses/konten berbasis karakteristik peserta didik.
  - Diskusi kelompok, kolaborasi, eksplorasi sumber belajar, presentasi karya, dan penanaman adab thalabul ilmi.
- **3. Kegiatan Penutup (10-15 Menit):**
  - Refleksi terbimbing bersama peserta didik (apa yang dipahami, apa yang perlu ditingkatkan).
  - Simpulan materi pokok secara komprehensif.
  - Tindak lanjut penugasan mandiri / info pertemuan selanjutnya.
  - Doa penutup majelis (Kaffaratul Majlis) & salam penuh keramahan.

---

### IV. RANCANGAN ASESMEN PEMBELAJARAN
Sajikan instrumen asesmen sesuai yang dipilih guru: ${asesmenList}
1. **Asesmen Diagnostik (Awal Pembelajaran):** Kuesioner/tanya jawab pemantik kesiapan kognitif dan non-kognitif.
2. **Asesmen Formatif (Proses Pembelajaran):** Lembar observasi keaktifan diskusi, LKPD, rubrik penilaian adab santri KBC.
3. **Asesmen Sumatif (Akhir TP):** Tes tertulis/penugasan proyek beserta kunci jawaban atau kriteria penilaian.
4. **Tabel Rubrik Interval Ketercapaian (KKTP):**
   | Interval Skor | Kategori | Deskripsi Ketercapaian | Tindak Lanjut |
`;
      } else if (docType === 'presensi_kbm') {
        structureGuide = `
Khusus untuk PRESENSI HARIAN SISWA KBM, ikuti struktur resmi MA NU 01 Banyuputih:
# PRESENSI HARIAN SISWA KBM
**MA NU 01 BANYUPUTIH**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | TA: ${tahunPelajaran}*

Memuat secara lengkap:
1. INFORMASI KEGIATAN BELAJAR MENGAJAR (KBM): Hari & Tanggal, Mapel, Kelas/Fase, Jam Pelajaran, Materi Pokok, Guru Pengampu.
2. TABEL DAFTAR PRESENSI PESERTA DIDIK (No, NISN, Nama Siswa, L/P, Status Kehadiran Hadir/Sakit/Izin/Alpa, Catatan Karakter & Keaktifan KBC).
3. REKAPITULASI KEHADIRAN KBM (Total Siswa, Hadir, Sakit, Izin, Alpa beserta persentasenya).
4. JURNAL REFLEKSI GURU (DEEP LEARNING & KBC): Pencapaian Pembelajaran, Karakter Kasih Sayang & Adab, Tindak Lanjut.
`;
      } else if (docType === 'cp') {
        structureGuide = `
Khusus untuk DOKUMEN ANALISIS CAPAIAN PEMBELAJARAN (CP) ELEMEN KURIKULUM MERDEKA:
TEKS CAPAIAN PEMBELAJARAN (CP) LENGKAP YANG DITEMPEL GURU (SELURUH ELEMEN):
"""
${capaianPembelajaranTeks || 'Standar CP Kurikulum Merdeka Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""

TUGAS UTAMA ANDA SEBAGAI HERMES AI ENGINE:
1. Analisis seluruh teks Capaian Pembelajaran (CP) dan rincian per elemen secara saksama.
2. Sajikan rincian elemen, kalimat Capaian Pembelajaran Elemen, Kompetensi Utama, dan Ruang Lingkup Materi Esensial secara mendalam.
3. Hubungkan secara filosofis dengan nilai-nilai Kurikulum Berbasis Cinta (KBC: Lima Pilar Panca Cinta Kemenag RI: Cinta kepada Allah & Rasul-Nya, Cinta kepada Ilmu Pengetahuan, Cinta kepada Diri & Sesama, Cinta kepada Lingkungan, Cinta kepada Tanah Air).

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN BERIKUT:
# ANALISIS CAPAIAN PEMBELAJARAN (CP) ELEMEN
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Rujukan: Panduan Pembelajaran & Asesmen BSKAP Kemendikbudristek & Kemenag RI*

### A. DESKRIPSI CAPAIAN PEMBELAJARAN (CP) FASE ${fase}
Sajikan analisis deskriptif tentang Capaian Pembelajaran (CP) Fase ${fase} Mata Pelajaran ${mapel}.

### B. TABEL RINCIAN ELEMEN CAPAIAN PEMBELAJARAN (CP)
Sajikan tabel Markdown komprehensif:
| No | Elemen CP | Kalimat Capaian Pembelajaran Elemen | Kompetensi Utama | Ruang Lingkup Materi Esensial |

### C. INTEGRASI NILAI KHAS MADRASAH & KURIKULUM BERBASIS CINTA (KBC)
Uraikan bagaimana setiap elemen CP selaras dengan nilai-nilai moderasi beragama (Tawassuth, Tasamuh, Tawazun) dan pengembangan karakter berbasis kasih sayang.
`;
      } else if (docType === 'atp') {
        structureGuide = `
Khusus untuk DOKUMEN ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA:
TEKS CAPAIAN PEMBELAJARAN (CP) SEBAGAI RUJUKAN:
"""
${capaianPembelajaranTeks || 'Standar CP Kurikulum Merdeka Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""

ALOKASI JAM PELAJARAN: ${alokasiWaktu || '72 JP (2 JP x 36 Minggu)'}
${instruksiKhusus ? `INSTRUKSI KHUSUS DARI GURU:\n"${instruksiKhusus}"\n` : ''}

TUGAS UTAMA ANDA SEBAGAI HERMES AI ENGINE:
1. Turunkan teks Capaian Pembelajaran (CP) di atas menjadi Tujuan Pembelajaran (TP) yang jelas, terukur, dan operasional (menggunakan Kata Kerja Operasional Bloom/Marzano).
2. Susun Alur Tujuan Pembelajaran (ATP) yang logis, sistematis (misal: dari konkret ke abstrak, mudah ke kompleks), lengkap dengan alokasi Jam Pelajaran (JP), Indikator Ketercapaian (IKTP), rencana asesmen formatif/sumatif, serta integrasi Dimensi Profil Lulusan / P5RA dan nilai KBC (Kurikulum Berbasis Cinta: Panca Cinta Kemenag RI).

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN BERIKUT:
# ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Rujukan: Panduan Pembelajaran & Asesmen Kemendikdasmen & Kemenag RI*

### A. TABEL ALUR TUJUAN PEMBELAJARAN (ATP) LENGKAP
Sajikan alur logis terstruktur dengan tabel Markdown:
| Alur | Kode TP | Rumusan Tujuan Pembelajaran (TP) | Alokasi Waktu (JP) | Indikator Ketercapaian (IKTP) | Rencana Asesmen (Formatif & Sumatif) | Dimensi Profil Lulusan / P5RA & Nilai KBC |
(Pastikan akumulasi JP per alur sesuai dengan total ${alokasiWaktu || '72 JP'}).

### B. RASIONAL PENYUSUNAN ALUR TUJUAN PEMBELAJARAN
Jelaskan alasan pengurutan materi (prosedural, konkret ke abstrak, dsb.), diferensiasi belajar, dan integrasi pembelajaran bermakna (Deep Learning: Mindful, Meaningful, Joyful).
`;
      } else if (docType === 'modul_ajar') {
        structureGuide = `
Khusus untuk MODUL AJAR, Anda WAJIB mengikuti format resmi MA NU 01 Banyuputih Batang:
# MODUL AJAR ${mapel.toUpperCase()}
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

---

## A. IDENTIFIKASI KESIAPAN PESERTA DIDIK (Pengetahuan Awal, Minat melalui media/game interaktif, Latar Belakang, Kebutuhan Belajar diferensiasi visual/auditori/kinestetik/analitis)
## B. KARAKTERISTIK MATERI PELAJARAN (Jenis Pengetahuan: Faktual, Konseptual, Prosedural, Metakognitif; Relevansi Kehidupan Nyata; Tingkat Kesulitan; Struktur Materi; Integrasi Nilai dan Karakter)
## C. DIMENSI PROFIL LULUSAN PEMBELAJARAN (Keimanan dan Ketakwaan, Penalaran Kritis, Kreativitas, Kolaborasi, Komunikasi)
## DESAIN PEMBELAJARAN
### A. CAPAIAN PEMBELAJARAN (Deskripsi & Tabel Elemen Capaian Pembelajaran)
### B. LINTAS DISIPLIN ILMU
### C. TUJUAN PEMBELAJARAN (Dirinci per pertemuan: Pertemuan 1, Pertemuan 2, Pertemuan 3)
### D. TOPIK PEMBELAJARAN KONTEKSTUAL
### E. KERANGKA PEMBELAJARAN (Praktik Pedagogik, Kemitraan Pembelajaran, Lingkungan Belajar Deep Learning: Mindful Learning, Meaningful Learning, Joyful Learning, Pemanfaatan Digital)
### F. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSI (Tabel Kegiatan dan Alokasi Waktu per Pertemuan yang memuat: 1. Kegiatan Pendahuluan [Orientasi, Apersepsi, Motivasi], 2. Kegiatan Inti [Eksplorasi - Diferensiasi Konten, Identifikasi & Klasifikasi - Diferensiasi Proses & Produk, Diskusi & Konfirmasi - Merefleksi], 3. Kegiatan Penutup)
### G. ASESMEN PEMBELAJARAN (1. Asesmen Awal [Tes Lisan, Kuesioner, Observasi], 2. Asesmen Proses [Observasi Kinerja Game, Penilaian Produk, Jurnal Refleksi], 3. Asesmen Akhir)
`;
      } else if (docType === 'prota' || docType === 'prota_prosem') {
        structureGuide = `
Khusus untuk PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA, Anda WAJIB mengikuti format resmi MA NU 01 Banyuputih Batang sesuai standar panduan:

# PROGRAM TAHUNAN KURIKULUM MERDEKA
**MA NU 01 BANYUPUTIH**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | TA: ${tahunPelajaran}*

---

### A. CAPAIAN PEMBELAJARAN FASE ${fase}
Tuliskan rumusan Capaian Pembelajaran Fase ${fase} secara utuh untuk mata pelajaran ${mapel}.

---

### B. ELEMEN CAPAIAN PEMBELAJARAN
Sajikan tabel 2 kolom elemen dan capaian pembelajaran mata pelajaran ${mapel}:
| ELEMEN | CAPAIAN PEMBELAJARAN |
|---|---|
(Sajikan semua elemen mapel ini beserta deskripsi capaian pembelajarannya secara lengkap).

---

### C. DISTRIBUSI ALOKASI WAKTU PROGRAM TAHUNAN

#### SEMESTER I (GANJIL)
- **Mata Pelajaran :** ${mapel}
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** ${tahunPelajaran}
- **Fase & Kelas / Semester :** Fase ${fase}, Kelas ${kelas} / I (Ganjil)

Sajikan tabel distribusi Semester I dengan kolom persis:
| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
(Bagi materi semester I ke dalam unit-unit pembelajaran, nomor sub materi 1, 2, 3, nomor Alur Tujuan Pembelajaran 1, 2, dan cantumkan alokasi waktu JP per unit).
| **JUMLAH** | | | | **... JP** |

---

#### SEMESTER II (GENAP)
- **Mata Pelajaran :** ${mapel}
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** ${tahunPelajaran}
- **Fase & Kelas / Semester :** Fase ${fase}, Kelas ${kelas} / II (Genap)

Sajikan tabel distribusi Semester II dengan kolom persis:
| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
(Bagi materi semester II ke dalam unit-unit pembelajaran lanjutan, sub materi, alur tujuan pembelajaran, dan alokasi JP per unit).
| **JUMLAH** | | | | **... JP** |

---

### REKAPITULASI TOTAL ALOKASI WAKTU TAHUNAN
- **Total Alokasi Semester I (Ganjil) :** ... JP
- **Total Alokasi Semester II (Genap) :** ... JP
- **TOTAL KESELURUHAN 1 TAHUN PELAJARAN :** ... JP (${alokasiWaktu || '36 - 72 JP'})
`;
      } else if (docType === 'prosem') {
        structureGuide = `
Khusus untuk PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA, Anda WAJIB mengikuti format resmi MA NU 01 Banyuputih Batang:
Sajikan dokumen dengan struktur:
# PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

### MATRIKS DISTRIBUSI ALOKASI WAKTU SEMESTER ${semester === '2' ? 'GENAP' : 'GASAL'}
Sajikan tabel Markdown komprehensif dengan kolom:
| No | BAB / Materi Pokok | Tujuan Pembelajaran (TP) | Alokasi JP | ${semester === '2' ? 'Jan (1-5) | Feb (1-4) | Mar (1-5) | Apr (1-5) | Mei (1-5) | Jun (1-5)' : 'Jul (1-4) | Agu (1-5) | Sep (1-5) | Okt (1-5) | Nov (1-5) | Des (1-5)'} |
- Distribusikan alokasi jam tatap muka mingguan (misal 2 JP per minggu).
- Tandai agenda non-efektif (Libur Awal/Akhir Semester, ASTS, Asesmen Sumatif Akhir Semester, Pengolahan Nilai & Rapor).
- Buat baris TOTAL di akhir tabel.
`;
      }

      const prompt = `Anda adalah Hermes Agent AI Spesialis Kurikulum Merdeka untuk MA NU 01 Banyuputih Batang.
Buatlah naskah dokumen administrasi resmi untuk:
- Jenis Dokumen: ${docType} (Pilihan: rpp, cp_atp, prota, prosem, kktp, modul_ajar, umpan_balik)
- Mata Pelajaran: ${mapel} | Fase ${fase} | Kelas ${kelas} | Semester ${semester} | TP ${tahunPelajaran}
- Topik Materi Pokok: ${topikMateri}
- Guru Pengampu: ${guruPengampu}
- Pendekatan: Deep Learning (Mindful, Meaningful, Joyful Learning) dan Kurikulum Berbasis Cinta (KBC: Lima Pilar Panca Cinta Kemenag RI)
- Nilai KBC yang ditargetkan: ${Array.isArray(nilaiKBC) ? nilaiKBC.join(', ') : 'Kasih sayang dan adab'}
- Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning & Cooperative Learning'}
${structureGuide}
PENTING & WAJIB DIPATUHI:
1. WAJIB menggunakan format teks MARKDOWN MURNI. DILARANG KERAS menyertakan tag HTML mentah seperti <div>, </div>, <br>, <br/>, <p>, <span>, <style>, atau atribut HTML lainnya. Gunakan sintaks Markdown standar (misal baris baru untuk jeda baris, format tabel markdown | ... | ... |, **teks tebal**, *teks miring*, dan heading #, ##, ###) agar dokumen bersih saat dicetak dan diekspor ke Word.
2. JANGAN menyertakan bagian atau bullet list 'IDENTITAS DOKUMEN / IDENTITAS MODUL / IDENTITAS MATA PELAJARAN' di awal dokumen markdown, karena sistem aplikasi otomatis menyematkan tabel Identitas Institusi resmi di bagian atas lembar cetak (di bawah Kop Surat). Dokumen harus langsung dimulai dari Judul (#), lalu masuk ke analisis/materi inti.
3. JANGAN menambahkan teks atau tabel 'LEMBAR PENGESAHAN' atau blok tanda tangan di akhir dokumen markdown, karena sistem aplikasi otomatis menyematkan blok tanda tangan resmi institusi MA NU 01 Banyuputih di bagian bawah lembar cetak.`;

    const genResult = await generateViaUnifiedAI({
      prompt,
      temperature: 0.6,
    });

    if (genResult && genResult.text) {
      const cleanMarkdown = cleanMarkdownAdminOutput(genResult.text);
      return res.json({
        success: true,
        source: `${genResult.modelUsed}`,
        markdown: cleanMarkdown,
      });
    }

    // Fallback template for administration document
    const fallbackMarkdown = generateFallbackAdminDoc(
      docType,
      mapel,
      fase,
      kelas,
      semester,
      tahunPelajaran,
      topikMateri,
      guruPengampu,
      nipGuru,
      kepalaMadrasah,
      nipKepala,
      alokasiWaktu,
      capaianPembelajaranTeks,
      instruksiKhusus,
      karakteristikPesertaDidik,
      dimensiProfilLulusan,
      jumlahPertemuan,
      jamPerPertemuan,
      modelPembelajaran,
      jenisAsesmen
    );

    const cleanFallback = cleanMarkdownAdminOutput(fallbackMarkdown);
    return res.json({
      success: true,
      source: 'Hermes Agent Local Template Engine',
      markdown: cleanFallback,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Fallback logic for Questions generator
function generateFallbackExamQuestions(
  mapel: string,
  kelas: string,
  semester: string,
  jenisUjian: string,
  bahasa: string,
  selectedTypes: any
) {
  const mapelLower = mapel.toLowerCase().trim();
  
  // High precision subject matching covering all Madrasah & National curriculum domains
  const isJawaSubject = (mapelLower.includes('jawa') || mapelLower.includes('jw') || mapelLower === 'bjw' || mapelLower.includes('mulok jawa')) && !mapelLower.includes('barat');
  const isEnglishSubject = (mapelLower.includes('inggris') || mapelLower.includes('english') || mapelLower === 'big' || mapelLower === 'eng') && !isJawaSubject;
  const isArabicSubject = (mapelLower.includes('arab') || bahasa === 'arab') && !isEnglishSubject && !isJawaSubject;
  const isQuranHadisSubject = (mapelLower.includes('qur') || mapelLower.includes('hadis') || mapelLower.includes('hadits') || mapelLower.includes('quran')) && !isArabicSubject;
  const isAkidahAkhlakSubject = (mapelLower.includes('akidah') || mapelLower.includes('aqidah') || mapelLower.includes('akhlak') || mapelLower.includes('tauhid'));
  const isSkiSubject = (mapelLower.includes('ski') || mapelLower.includes('kebudayaan islam') || mapelLower.includes('tarikh') || mapelLower.includes('sejarah islam'));
  const isFiqihSubject = (mapelLower.includes('fiqih') || mapelLower.includes('fikh') || mapelLower.includes('ushul') || mapelLower.includes('fathul') || mapelLower.includes('ibadah')) && !isEnglishSubject && !isJawaSubject && !isQuranHadisSubject;
  const isAswajaSubject = (mapelLower.includes('aswaja') || mapelLower.includes('ke-nu-an') || mapelLower.includes('nu ') || mapelLower === 'nu');
  const isGeoSubject = (mapelLower.includes('geo') || mapelLower === 'geografi') && !isEnglishSubject;
  const isSosiologiSubject = (mapelLower.includes('sosio') || mapelLower === 'sos') && !isEnglishSubject;
  const isEkonomiSubject = (mapelLower.includes('ekonomi') || mapelLower === 'eko' || mapelLower.includes('akuntan')) && !isEnglishSubject;
  const isSejarahSubject = (mapelLower.includes('sejarah') || mapelLower.includes('history') || mapelLower.includes('sjr')) && !isSkiSubject && !isEnglishSubject;
  const isBiologiSubject = (mapelLower.includes('biologi') || mapelLower === 'bio') && !isEnglishSubject;
  const isFisikaSubject = (mapelLower.includes('fisika') || mapelLower === 'fis') && !isEnglishSubject;
  const isKimiaSubject = (mapelLower.includes('kimia') || mapelLower === 'kim') && !isEnglishSubject;
  const isInformaticsSubject = (mapelLower.includes('info') || mapelLower.includes('komp') || mapelLower.includes('it') || mapelLower.includes('tekno') || mapelLower.includes('ict') || mapelLower.includes('rpl') || mapelLower.includes('jaringan') || mapelLower.includes('algoritma')) && !isEnglishSubject && !isJawaSubject;
  const isPpknSubject = (mapelLower.includes('pancasila') || mapelLower.includes('ppkn') || mapelLower.includes('pkn') || mapelLower.includes('kewarganegaraan'));
  const isPjokSubject = (mapelLower.includes('pjok') || mapelLower.includes('penjas') || mapelLower.includes('olahraga') || mapelLower.includes('penjaskes'));
  const isSeniSubject = (mapelLower.includes('seni') || mapelLower.includes('rupa') || mapelLower.includes('musik') || mapelLower.includes('tari') || mapelLower.includes('teater'));
  const isPkwuSubject = (mapelLower.includes('pkwu') || mapelLower.includes('prakarya') || mapelLower.includes('kewirausahaan') || mapelLower.includes('usaha'));
  const isIndoSubject = (mapelLower.includes('indo') || mapelLower.includes('bhs') || mapelLower.includes('bahasa') || mapelLower === 'bi') && !isArabicSubject && !isEnglishSubject && !isJawaSubject && !isGeoSubject && !isSosiologiSubject;
  const isMathSubject = (mapelLower.includes('matematika') || mapelLower.startsWith('mat') || mapelLower === 'mtk') && !isInformaticsSubject && !isIndoSubject && !isArabicSubject && !isFiqihSubject && !isEnglishSubject && !isJawaSubject && !isGeoSubject && !isFisikaSubject && !isKimiaSubject;

  const questions: any[] = [];
  let num = 1;

  // ==========================================
  // 1. SINGLE CHOICE (PILIHAN GANDA TUNGGAL)
  // ==========================================
  const pgCount = selectedTypes?.single_choice ?? 2;

  const informaticsSinglePool = [
    {
      text: "Dalam berpikir komputasional, proses memecah masalah yang kompleks menjadi bagian-bagian yang lebih kecil, terstruktur, dan lebih mudah dikelola disebut...",
      kompetensi: "Berpikir Komputasional (Dekomposisi)",
      options: [
        { key: "A", text: "Dekomposisi" },
        { key: "B", text: "Abstraksi" },
        { key: "C", text: "Pengenalan Pola" },
        { key: "D", text: "Perancangan Algoritma" },
        { key: "E", text: "Evaluasi Kritis" }
      ],
      ans: "RIGHT:A",
      exp: "Dekomposisi adalah pilar berpikir komputasional yang memecah masalah besar menjadi sub-masalah kecil."
    },
    {
      text: "Manakah di bawah ini yang merupakan unit terkecil dari penyimpanan data digital pada komputer?",
      kompetensi: "Sistem Komputer (Representasi Data)",
      options: [
        { key: "A", text: "Bit (Binary Digit)" },
        { key: "B", text: "Byte" },
        { key: "C", text: "Megabyte" },
        { key: "D", text: "Kilobyte" },
        { key: "E", text: "Gigabyte" }
      ],
      ans: "RIGHT:A",
      exp: "Satu bit adalah unit terkecil data biner (0 atau 1) dalam sistem komputer digital."
    },
    {
      text: "Topologi jaringan komputer yang menghubungkan seluruh komputer anggota ke sebuah perangkat konsentrator pusat (seperti switch/hub) dinamakan...",
      kompetensi: "Jaringan Komputer dan Internet (Topologi)",
      options: [
        { key: "A", text: "Topologi Star" },
        { key: "B", text: "Topologi Bus" },
        { key: "C", text: "Topologi Ring" },
        { key: "D", text: "Topologi Mesh" },
        { key: "E", text: "Topologi Tree" }
      ],
      ans: "RIGHT:A",
      exp: "Topologi Star menghubungkan semua perangkat secara radial ke satu node pusat."
    },
    {
      text: "Jenis lisensi perangkat lunak yang memperbolehkan siapa pun untuk melihat, mengubah, dan mendistribusikan kode sumbernya secara bebas disebut...",
      kompetensi: "Dampak Sosial Informatika (Lisensi)",
      options: [
        { key: "A", text: "Open Source" },
        { key: "B", text: "Proprietary" },
        { key: "C", text: "Shareware" },
        { key: "D", text: "Adware" },
        { key: "E", text: "Freeware" }
      ],
      ans: "RIGHT:A",
      exp: "Lisensi Open Source mengizinkan akses terbuka ke kode sumber untuk kolaborasi komunitas."
    },
    {
      text: "Fungsi dari struktur kontrol percabangan (if-else) dalam sebuah algoritma pemrograman adalah...",
      kompetensi: "Algoritma dan Pemrograman (Struktur Kontrol)",
      options: [
        { key: "A", text: "Menentukan jalannya instruksi berdasarkan pemenuhan suatu kondisi biner" },
        { key: "B", text: "Mengulang-ulang suatu blok instruksi sampai batas waktu tertentu" },
        { key: "C", text: "Membagi program utama menjadi sub-program yang lebih kecil" },
        { key: "D", text: "Menghapus memori variabel yang sudah tidak digunakan" },
        { key: "E", text: "Mengimpor modul pustaka eksternal ke dalam kode" }
      ],
      ans: "RIGHT:A",
      exp: "Percabangan if-else mengarahkan aliran eksekusi program berdasarkan evaluasi kondisi boolean."
    }
  ];

  const indoSinglePool = [
    {
      text: "Manakah di bawah ini yang merupakan ciri paling utama dari sebuah kalimat fakta dalam naskah teks argumentasi?",
      kompetensi: "Membaca Kritis & Membedakan Fakta-Opini",
      options: [
        { key: "A", text: "Menyajikan data riil berupa angka, statistik, atau peristiwa nyata yang dapat diverifikasi" },
        { key: "B", text: "Berisi ungkapan perasaan subyektif dan kata-kata sifat yang berlebih" },
        { key: "C", text: "Menggunakan kata pemandu seperti 'sepertinya', 'mungkin', atau 'seharusnya'" },
        { key: "D", text: "Merupakan prediksi atau estimasi masa depan dari penulis naskah" },
        { key: "E", text: "Mengabaikan referensi sumber ilmiah atau data otoritas" }
      ],
      ans: "RIGHT:A",
      exp: "Kalimat fakta wajib objektif, dapat diuji kebenarannya, dan biasanya dilengkapi data angka atau kesaksian aktual."
    },
    {
      text: "Dalam mempromosikan produk pangan lokal Indonesia melalui media poster, kalimat persuasi yang digunakan sebaiknya memiliki sifat...",
      kompetensi: "Memahami Poster Media Persuasi Pangan Lokal",
      options: [
        { key: "A", text: "Singkat, komunikatif, estetik, dan langsung mengajak pembaca bertindak positif" },
        { key: "B", text: "Sangat panjang, formal, dan dipenuhi istilah-istilah biologi tanaman" },
        { key: "C", text: "Menakut-nakuti pembaca dengan konsekuensi hukum jika tidak membeli" },
        { key: "D", text: "Sarkastik, bernada menyindir produk pangan impor secara berlebihan" },
        { key: "E", text: "Pasif, kaku, dan hanya menyajikan daftar harga bahan mentah" }
      ],
      ans: "RIGHT:A",
      exp: "Kalimat persuasi poster harus memikat nalar dan emosi pembaca dengan diksi yang segar, padat, dan estetis."
    },
    {
      text: "Unsur kelengkapan berita inovasi yang merujuk pada latar belakang alasan mengapa inovasi tersebut diciptakan adalah...",
      kompetensi: "Unsur-Unsur Teks Berita (5W+1H)",
      options: [
        { key: "A", text: "Why (Mengapa)" },
        { key: "B", text: "What (Apa)" },
        { key: "C", text: "Who (Siapa)" },
        { key: "D", text: "When (Kapan)" },
        { key: "E", text: "How (Bagaimana)" }
      ],
      ans: "RIGHT:A",
      exp: "Unsur 'Why' (Mengapa) menerangkan latar belakang masalah, alasan kausalitas, dan tujuan suatu aksi inovasi."
    },
    {
      text: "Letak ide pokok yang berada di awal paragraf membuat paragraf tersebut dikategorikan sebagai paragraf...",
      kompetensi: "Menemukan Ide Pokok Paragraf",
      options: [
        { key: "A", text: "Deduktif" },
        { key: "B", text: "Induktif" },
        { key: "C", text: "Campuran" },
        { key: "D", text: "Ineratif" },
        { key: "E", text: "Naratif" }
      ],
      ans: "RIGHT:A",
      exp: "Paragraf Deduktif menempatkan gagasan utama atau tesis di awal kalimat, diikuti penjelasan rinci."
    }
  ];

  const englishSinglePool = [
    {
      text: "Read the following text:\n'Karimunjawa is an archipelago of 27 islands in the Java Sea, Indonesia. It is renowned for its breathtaking coral reefs, crystal-clear turquoise waters, and diverse marine life. Visitors can enjoy snorkeling, diving, and observing endangered green turtles in their natural habitat.'\n\nWhat is the main communicative purpose of the text above?",
      kompetensi: "Identifying Main Purpose of Descriptive Text",
      options: [
        { key: "A", text: "To describe the beauty and attractions of Karimunjawa archipelago" },
        { key: "B", text: "To persuade readers to move and live permanently in Karimunjawa" },
        { key: "C", text: "To explain the geological process of how coral reefs are formed" },
        { key: "D", text: "To report the chronological history of Java Sea island discovery" },
        { key: "E", text: "To give step-by-step instructions on how to dive safely" }
      ],
      ans: "RIGHT:A",
      exp: "Descriptive text aims to describe a specific place, person, or thing in detail."
    },
    {
      text: "Complete the sentence with the most appropriate verb form:\n'A healthy lifestyle and regular physical exercise ... essential to maintain our body's immune system.'",
      kompetensi: "Subject-Verb Agreement in Simple Present Tense",
      options: [
        { key: "A", text: "are" },
        { key: "B", text: "is" },
        { key: "C", text: "were" },
        { key: "D", text: "being" },
        { key: "E", text: "was" }
      ],
      ans: "RIGHT:A",
      exp: "Compound subject joined by 'and' ('A healthy lifestyle and regular physical exercise') takes a plural verb 'are'."
    },
    {
      text: "Rani: 'I heard that you won first place in the National English Speech Contest! Congratulations, Farhan!'\nFarhan: '...'\n\nWhat is the best response for Farhan to express gratitude?",
      kompetensi: "Responding to Congratulation Expression",
      options: [
        { key: "A", text: "Thank you so much, Rani! I really appreciate your support." },
        { key: "B", text: "I don't think I did well enough to win that contest." },
        { key: "C", text: "You should have participated in the speech contest instead." },
        { key: "D", text: "I am sorry to hear that from you." },
        { key: "E", text: "Never mind, it was completely useless anyway." }
      ],
      ans: "RIGHT:A",
      exp: "The appropriate response to a congratulatory statement is expressing gratitude politely."
    },
    {
      text: "Which of the following sentences correctly uses an adjective clause to describe an eco-friendly school?",
      kompetensi: "Using Adjective Clauses in Descriptive Context",
      options: [
        { key: "A", text: "MA NU 01 Banyuputih is a green madrasah which implements an innovative waste management system." },
        { key: "B", text: "MA NU 01 Banyuputih is green because students throw garbage everywhere." },
        { key: "C", text: "Although the madrasah is green, nobody cares about planting trees." },
        { key: "D", text: "The madrasah was built ten years ago without any trees." },
        { key: "E", text: "Students study hard so that they pass the final examination." }
      ],
      ans: "RIGHT:A",
      exp: "The relative clause 'which implements an innovative waste management system' properly defines the noun phrase."
    }
  ];

  const jawaSinglePool = [
    {
      text: "Gatekna pethikan geguritan ing ngisor iki:\n'Bumi Pertiwi nangis getih\nWit-witan padha cures dening tangan jail\nKali asat tanpa banyu bening\nManungsa mung mikir awake dhewe.'\n\nSwasana (rasa pangrasa) kang kagambar ana ing pethikan geguritan kasebut yaiku...",
      kompetensi: "Menganalisis Rasa Pangrasa Teks Geguritan",
      options: [
        { key: "A", text: "Prihatin lan sedhih ndeleng rusaking alam" },
        { key: "B", text: "Bungah lan mongkog atine amarga wit-witan ngrembaka" },
        { key: "C", text: "Semangat makarya golek bandha donya" },
        { key: "D", text: "Tentrem ayem tanpa anane dredah" },
        { key: "E", text: "Kuciwa amarga kalah ing pasanggiri" }
      ],
      ans: "RIGHT:A",
      exp: "Geguritan ing dhuwur nggambarake kahanan bumi kang rusak amarga tumindake manungsa saengga nuwuhake rasa prihatin."
    },
    {
      text: "Dimas arep nyuwun pirsa marang Bu Guru babagan tugas Basa Jawa. Ukara kang paling trep manut unggah-ungguh basa krama alus yaiku...",
      kompetensi: "Penerapan Unggah-Ungguh Basa Krama Alus",
      options: [
        { key: "A", text: "Nyuwun pangapunten Bu, kula badhe nyuwun pirsa babagan tugas Basa Jawa." },
        { key: "B", text: "Nyuwun pangapunten Bu, kula badhe takon babagan tugas Basa Jawa." },
        { key: "C", text: "Bu Guru, kula ajeng takon tugas Basa Jawa sing wingi." },
        { key: "D", text: "Pangapunten Bu, sampeyan badhe tanglet tugas Basa Jawa napa mboten?" },
        { key: "E", text: "Bu, tugas Basa Jawa wingi kula dereng mudheng, tulung kandhani." }
      ],
      ans: "RIGHT:A",
      exp: "Nalika matur marang wong tuwa utawa guru, tembung kang trep nggunakake krama alus (kula nyuwun pirsa)."
    },
    {
      text: "Paugeran baku tembang Macapat Pocung yaiku dumadi saka ... gatra.",
      kompetensi: "Paugeran Tembang Macapat Pocung",
      options: [
        { key: "A", text: "4 gatra (12u, 6a, 8i, 12a)" },
        { key: "B", text: "6 gatra (8u, 8i, 8a, 8i, 8a, 8i)" },
        { key: "C", text: "5 gatra (7u, 10u, 12i, 8u, 8o)" },
        { key: "D", text: "7 gatra (8a, 11i, 8u, 7a, 12u, 8a, 8i)" },
        { key: "E", text: "9 gatra (8a, 8i, 8a, 8i, 7i, 8u, 7a, 8i, 12a)" }
      ],
      ans: "RIGHT:A",
      exp: "Tembang Pocung nduweni 4 gatra kanthi guru wilangan lan guru lagu: 12u, 6a, 8i, 12a."
    }
  ];

  const geoSinglePool = [
    {
      text: "Fenomena banjir rob yang kerap melanda wilayah pesisir utara Pulau Jawa dapat dianalisis dengan mengaitkan pasang air laut, kenaikan muka air laut, dan penurunan muka tanah akibat eksploitasi air tanah berlebihan. Prinsip geografi yang paling tepat untuk menganalisis keterkaitan antarfenomena tersebut adalah...",
      kompetensi: "Prinsip Geografi (Interrelasi)",
      options: [
        { key: "A", text: "Prinsip Interrelasi" },
        { key: "B", text: "Prinsip Deskripsi" },
        { key: "C", text: "Prinsip Distribusi" },
        { key: "D", text: "Prinsip Korologi" },
        { key: "E", text: "Prinsip Aglomerasi" }
      ],
      ans: "RIGHT:A",
      exp: "Prinsip interrelasi mengkaji hubungan saling keterkaitan timbal balik antara satu fenomena geosfer dengan fenomena geosfer lainnya."
    },
    {
      text: "Penduduk perkotaan cenderung bertempat tinggal mengelompok di kawasan perumahan dekat pusat perbelanjaan dan akses transportasi utama. Fenomena spasial keruangan ini paling sesuai dengan konsep esensial geografi yaitu...",
      kompetensi: "Konsep Esensial Geografi (Aglomerasi)",
      options: [
        { key: "A", text: "Konsep Aglomerasi" },
        { key: "B", text: "Konsep Morfologi" },
        { key: "C", text: "Konsep Keterjangkauan" },
        { key: "D", text: "Konsep Diferensiasi Area" },
        { key: "E", text: "Konsep Keterkaitan Keruangan" }
      ],
      ans: "RIGHT:A",
      exp: "Konsep aglomerasi menjelaskan kecenderungan pengelompokan aktivitas manusia atau pemukiman dalam suatu wilayah tertentu."
    },
    {
      text: "Komponen penginderaan jauh yang bertindak sebagai perekam pantulan radiasi gelombang elektromagnetik dari objek di permukaan bumi adalah...",
      kompetensi: "Komponen Penginderaan Jauh",
      options: [
        { key: "A", text: "Sensor" },
        { key: "B", text: "Wahana" },
        { key: "C", text: "Sumber Tenaga" },
        { key: "D", text: "Atmosfer" },
        { key: "E", text: "Citra Foto" }
      ],
      ans: "RIGHT:A",
      exp: "Sensor adalah alat yang dipasang pada wahana (satelit/pesawat) untuk merekam pantulan gelombang dari objek bumi."
    },
    {
      text: "Lapisan bumi yang berupa batuan padat penyusun kerak bumi dan tempat terjadinya fenomena tektonisme, vulkanisme, serta seisme dinamakan...",
      kompetensi: "Objek Material Geosfer (Litosfer)",
      options: [
        { key: "A", text: "Litosfer" },
        { key: "B", text: "Atmosfer" },
        { key: "C", text: "Hidrosfer" },
        { key: "D", text: "Biosfer" },
        { key: "E", text: "Antroposfer" }
      ],
      ans: "RIGHT:A",
      exp: "Litosfer adalah lapisan batuan padat terluar bumi yang membentuk kerak benua dan kerak samudera."
    }
  ];

  const sosiologiSinglePool = [
    {
      text: "Proses interaksi sosial yang mengarah pada penyatuan dan kerja sama antarindividu atau kelompok untuk mencapai tujuan bersama disebut bentuk interaksi...",
      kompetensi: "Bentuk Interaksi Sosial Asosiatif",
      options: [
        { key: "A", text: "Asosiatif (Kerja Sama & Akulturasi)" },
        { key: "B", text: "Disosiatif (Konflik & Kontravensi)" },
        { key: "C", text: "Akomodasi koersif" },
        { key: "D", text: "Kompetisi destruktif" },
        { key: "E", text: "Asimilasi paksaan" }
      ],
      ans: "RIGHT:A",
      exp: "Interaksi asosiatif adalah proses sosial positif yang mengarah pada persatuan dan keharmonisan."
    }
  ];

  const ekonomiSinglePool = [
    {
      text: "Kondisi di mana kebutuhan manusia yang tidak terbatas dihadapkan dengan ketersediaan alat pemuas kebutuhan yang terbatas dalam ilmu ekonomi disebut...",
      kompetensi: "Konsep Dasar Kelangkaan Ekonomi",
      options: [
        { key: "A", text: "Kelangkaan (Scarcity)" },
        { key: "B", text: "Biaya Peluang (Opportunity Cost)" },
        { key: "C", text: "Inflasi Moneter" },
        { key: "D", text: "Elastisitas Permintaan" },
        { key: "E", text: "Keseimbangan Pasar" }
      ],
      ans: "RIGHT:A",
      exp: "Kelangkaan (scarcity) adalah masalah inti ekonomi yaitu keterbatasan sumber daya dibanding kebutuhan."
    }
  ];

  const sejarahSinglePool = [
    {
      text: "Konsep berpikir dalam sejarah yang menitikberatkan pada penelitian peristiwa yang memanjang dalam waktu tetapi terbatas dalam ruang disebut cara berpikir...",
      kompetensi: "Konsep Berpikir Diakronik dalam Sejarah",
      options: [
        { key: "A", text: "Diakronik (Kronologis)" },
        { key: "B", text: "Sinkronik" },
        { key: "C", text: "Periodisasi statis" },
        { key: "D", text: "Kausalitas tunggal" },
        { key: "E", text: "Anakronisme" }
      ],
      ans: "RIGHT:A",
      exp: "Berpikir diakronik/kronologis melihat urutan peristiwa dari waktu ke waktu secara runut."
    }
  ];

  const biologiSinglePool = [
    {
      text: "Tingkat keanekaragaman hayati yang terlihat dari adanya variasi warna, bentuk, dan ukuran pada spesies yang sama (misalnya variasi warna bunga mawar) adalah keanekaragaman tingkat...",
      kompetensi: "Tingkat Keanekaragaman Hayati",
      options: [
        { key: "A", text: "Gen" },
        { key: "B", text: "Spesies (Jenis)" },
        { key: "C", text: "Ekosistem" },
        { key: "D", text: "Biosfer" },
        { key: "E", text: "Komunitas" }
      ],
      ans: "RIGHT:A",
      exp: "Variasi susunan genetik dalam satu spesies yang sama menimbulkan keanekaragaman tingkat gen."
    }
  ];

  const mathSinglePool = [
    {
      text: "Tentukan nilai batas limit fungsi trigonometri berikut: $\\lim_{x \\to 0} \\frac{\\sin(6x)}{2x}$ adalah...",
      kompetensi: "Limit Fungsi Trigonometri",
      options: [
        { key: "A", text: "3" },
        { key: "B", text: "2" },
        { key: "C", text: "6" },
        { key: "D", text: "1.5" },
        { key: "E", text: "0" }
      ],
      ans: "RIGHT:A",
      exp: "Berdasarkan teorema limit fungsi trigonometri, $\\lim_{x \\to 0} \\frac{\\sin(ax)}{bx} = \\frac{a}{b} = \\frac{6}{2} = 3$."
    },
    {
      text: "Jika diketahui fungsi posisi suatu partikel adalah $s(t) = 3t^2 - 4t + 8$ (dalam meter), tentukan kecepatan partikel saat $t = 3$ sekon!",
      kompetensi: "Aplikasi Turunan (Kecepatan)",
      options: [
        { key: "A", text: "14 m/s" },
        { key: "B", text: "12 m/s" },
        { key: "C", text: "10 m/s" },
        { key: "D", text: "8 m/s" },
        { key: "E", text: "6 m/s" }
      ],
      ans: "RIGHT:A",
      exp: "Kecepatan $v(t) = s'(t) = 6t - 4$. Pada $t = 3$, $v(3) = 6(3) - 4 = 14$ m/s."
    },
    {
      text: "Sederhanakan ekspresi eksponen berikut: $\\frac{a^3 \\cdot b^4}{a^{-1} \\cdot b^2}$ menjadi...",
      kompetensi: "Sifat-Sifat Eksponen Aljabar",
      options: [
        { key: "A", text: "$a^4 b^2$" },
        { key: "B", text: "$a^2 b^2$" },
        { key: "C", text: "$a^4 b^6$" },
        { key: "D", text: "$a^{-4} b^{-2}$" },
        { key: "E", text: "$a^2 b^6$" }
      ],
      ans: "RIGHT:A",
      exp: "$\\frac{a^3 \\cdot b^4}{a^{-1} \\cdot b^2} = a^{3 - (-1)} \\cdot b^{4 - 2} = a^4 \\cdot b^2$."
    },
    {
      text: "Tentukan himpunan penyelesaian dari persamaan kuadrat berikut: $x^2 - 7x + 12 = 0$!",
      kompetensi: "Persamaan Kuadrat dan Akar-akarnya",
      options: [
        { key: "A", text: "$\\{3, 4\\}$" },
        { key: "B", text: "$\\{2, 6\\}$" },
        { key: "C", text: "$\\{-3, -4\\}$" },
        { key: "D", text: "$\\{1, 12\\}$" },
        { key: "E", text: "$\\{2, 5\\}$" }
      ],
      ans: "RIGHT:A",
      exp: "$x^2 - 7x + 12 = (x-3)(x-4) = 0$. Maka $x=3$ atau $x=4$."
    }
  ];

  const arabicFiqihSinglePool = [
    {
      text: "Air yang suci zatnya tetapi tidak dapat mensucikan benda atau hadas lain (seperti air kopi, air teh, atau air musta'mal) disebut...",
      kompetensi: "Klasifikasi Hukum Air dalam Fiqih Thaharah",
      options: [
        { key: "A", text: "Air Thahir Ghairu Muthahhir" },
        { key: "B", text: "Air Muthlaq (Thahir Muthahhir)" },
        { key: "C", text: "Air Musyammas" },
        { key: "D", text: "Air Mutanajjis" },
        { key: "E", text: "Air Musta'mal Makruh" }
      ],
      ans: "RIGHT:A",
      exp: "Air suci secara zatnya tetapi tidak mensucikan benda/hadas lain disebut air Thahir Ghairu Muthahhir."
    },
    {
      text: "مَا هُوَ الرُّكْنُ الْأَوَّلُ مِنْ أَرْكَانِ الْوُضُوْءِ فِي الْمَذْهَبِ الشَّافِعِيِّ؟",
      isArabic: true,
      kompetensi: "Fardhu Wudhu dalam Teks Arab Kitab Fathul Qarib",
      options: [
        { key: "A", text: "النِّيَّةُ عِنْدَ غَسْلِ الْوَجْهِ", isRtl: true },
        { key: "B", text: "غَسْلُ الْيَدَيْنِ إِلَى الْمِرْفَقَيْنِ", isRtl: true },
        { key: "C", text: "مَسْحُ بَعْضِ الرَّأْسِ", isRtl: true },
        { key: "D", text: "التَّرْتِيْبُ بَيْنَ الْأَعْضَاءِ", isRtl: true },
        { key: "E", text: "غَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ", isRtl: true }
      ],
      ans: "RIGHT:A",
      exp: "Rukun pertama wudhu dalam mazhab Syafi'i adalah niat bersamaan dengan awal basuhan wajah."
    },
    {
      text: "Najis yang berasal dari air kencing bayi laki-laki yang belum berumur dua tahun dan hanya mengonsumsi ASI dikategorikan sebagai najis...",
      kompetensi: "Macam-Macam Najis dan Cara Mensucikannya",
      options: [
        { key: "A", text: "Mukhaffafah (Ringan)" },
        { key: "B", text: "Mutawassithah (Sedang)" },
        { key: "C", text: "Mughalladhah (Berat)" },
        { key: "D", text: "Hukmiyah" },
        { key: "E", text: "Ainiyah" }
      ],
      ans: "RIGHT:A",
      exp: "Air kencing bayi laki-laki berumur di bawah 2 tahun yang belum makan apapun selain ASI adalah najis Mukhaffafah."
    },
    {
      text: "Berapakah batas minimal volume air (dalam satuan wadah tradisional) agar dikategorikan sebagai 'air banyak' sehingga tidak najis sekadar kejatuhan benda kotor?",
      kompetensi: "Konsep Dua Qullah dalam Fiqih Syafi'iyyah",
      options: [
        { key: "A", text: "Dua Qullah (kurang lebih 216 liter)" },
        { key: "B", text: "Satu Qullah (kurang lebih 108 liter)" },
        { key: "C", text: "Empat Qullah (kurang lebih 432 liter)" },
        { key: "D", text: "Setengah Qullah" },
        { key: "E", text: "Sepuluh Qullah" }
      ],
      ans: "RIGHT:A",
      exp: "Dua qullah adalah batas minimal air banyak (volume sekitar wadah kubus berukuran panjang sisi 1.25 hasta atau ~216 liter)."
    }
  ];

  const fisikaSinglePool = [
    {
      text: "Sebuah mobil bergerak dengan kecepatan awal $10\\text{ m/s}$ kemudian mengalami percepatan konstan sebesar $2\\text{ m/s}^2$ selama $5\\text{ detik}$. Jarak total yang ditempuh mobil tersebut adalah...",
      kompetensi: "Kinematika Gerak Lurus Berubah Beraturan (GLBB)",
      options: [
        { key: "A", text: "$75\\text{ meter}$" },
        { key: "B", text: "$50\\text{ meter}$" },
        { key: "C", text: "$60\\text{ meter}$" },
        { key: "D", text: "$85\\text{ meter}$" },
        { key: "E", text: "$100\\text{ meter}$" }
      ],
      ans: "RIGHT:A",
      exp: "Gunakan rumus $s = v_0 t + \\frac{1}{2} a t^2 = 10(5) + \\frac{1}{2}(2)(5^2) = 50 + 25 = 75\\text{ m}$."
    },
    {
      text: "Berdasarkan Hukum II Newton, jika resultan gaya total yang bekerja pada suatu benda bermassa $m$ adalah sebesar $F$, maka percepatan $a$ yang timbul akan bernilai...",
      kompetensi: "Dinamika Gerak & Hukum II Newton",
      options: [
        { key: "A", text: "Berbanding lurus dengan resultan gaya dan berbanding terbalik dengan massa benda ($a = \\frac{\\Sigma F}{m}$)" },
        { key: "B", text: "Berbanding terbalik dengan gaya dan berbanding lurus dengan massa benda" },
        { key: "C", text: "Selalu konstan tidak tergantung pada massa benda" },
        { key: "D", text: "Berbanding lurus dengan kuadrat massa benda" },
        { key: "E", text: "Nol jika benda mengalami percepatan" }
      ],
      ans: "RIGHT:A",
      exp: "Hukum II Newton menyatakan $\\Sigma F = m \\cdot a$ sehingga percepatan $a = \\frac{\\Sigma F}{m}$."
    }
  ];

  const kimiaSinglePool = [
    {
      text: "Suatu unsur memiliki nomor atom 17 (Klorin). Konfigurasi elektron model Bohr dan letak golongan serta periodenya dalam tabel periodik unsur adalah...",
      kompetensi: "Konfigurasi Elektron dan Sistem Periodik Unsur",
      options: [
        { key: "A", text: "2, 8, 7 (Golongan VIIA, Periode 3)" },
        { key: "B", text: "2, 8, 8 (Golongan VIIIA, Periode 3)" },
        { key: "C", text: "2, 7 (Golongan VIIA, Periode 2)" },
        { key: "D", text: "2, 8, 6, 1 (Golongan IA, Periode 4)" },
        { key: "E", text: "2, 8, 18, 7 (Golongan VIIA, Periode 4)" }
      ],
      ans: "RIGHT:A",
      exp: "Atom nomor 17 memiliki susunan kulit 2, 8, 7 dengan 3 kulit elektron (Periode 3) dan 7 elektron valensi (Golongan VIIA / Halogen)."
    }
  ];

  const quranHadisSinglePool = [
    {
      text: "Hukum bacaan tajwid yang terjadi apabila terdapat huruf Nun Sukun (نْ) atau Tanwin bertemu dengan huruf Ba (ب) adalah...",
      kompetensi: "Kaidah Ilmu Tajwid (Iqlab)",
      options: [
        { key: "A", text: "Iqlab (mengganti bunyi nun menjadi mim disertai ghunnah)" },
        { key: "B", text: "Izhar Halqi (membaca jelas tanpa dengung)" },
        { key: "C", text: "Idgham Bighunnah (memasukkan bunyi dengan dengung)" },
        { key: "D", text: "Ikhfa Haqiqi (menyamarkan bunyi)" },
        { key: "E", text: "Idgham Bilaghunnah" }
      ],
      ans: "RIGHT:A",
      exp: "Nun sukun/tanwin bertemu Ba dibaca Iqlab, yakni merubah bunyi 'n' menjadi 'm' samar berdengung."
    }
  ];

  const akidahAkhlakSinglePool = [
    {
      text: "Sikap batin dan perbuatan terpuji yang mencerminkan kerendahan hati, tidak sombong, dan senantiasa menyadari kekurangan diri di hadapan Allah SWT dan sesama manusia dinamakan...",
      kompetensi: "Akhlak Terpuji Mahmudah (Tawadhu)",
      options: [
        { key: "A", text: "Tawadhu' (Rendah Hati)" },
        { key: "B", text: "Takabur (Sombong)" },
        { key: "C", text: "Riya' (Pamer Ibadah)" },
        { key: "D", text: "Ujub (Membanggakan Diri)" },
        { key: "E", text: "Hasad (Iri Hati)" }
      ],
      ans: "RIGHT:A",
      exp: "Tawadhu' adalah sifat terpuji akhlak mahmudah yang menjauhkan penuntut ilmu dari sifat sombong dan ujub."
    }
  ];

  const skiSinglePool = [
    {
      text: "Piagam Madinah (Mitsaq al-Madinah) yang dirumuskan oleh Rasulullah SAW pasca-hijrah menjadi bukti sejarah peradaban Islam awal yang monumental karena...",
      kompetensi: "Substansi Piagam Madinah dalam Sejarah Islam",
      options: [
        { key: "A", text: "Menjamin kebebasan beragama, hak asasi, dan persatuan masyarakat majemuk dalam konstitusi bernegara" },
        { key: "B", text: "Mewajibkan seluruh penduduk Madinah untuk memeluk agama Islam secara paksa" },
        { key: "C", text: "Menghapuskan hubungan perdagangan antarsuku di Jazirah Arab" },
        { key: "D", text: "Menyerahkan kekuasaan politik tertinggi kepada kaum musyrikin Quraisy" },
        { key: "E", text: "Membatasi hak kepemilikan tanah bagi kaum Muhajirin" }
      ],
      ans: "RIGHT:A",
      exp: "Piagam Madinah adalah konstitusi tertulis pertama di dunia yang menjamin hak masyarakat majemuk, kebebasan beragama, dan pertahanan bersama."
    }
  ];

  const aswajaSinglePool = [
    {
      text: "Salah satu prinsip sikap kemasyarakatan Ahlussunnah wal Jama'ah an-Nahdliyyah yang mengedepankan sikap moderat, tidak condong ke ekstrem kanan (tatharruf dini) maupun ekstrem kiri adalah...",
      kompetensi: "Prinsip Kemasyarakatan Aswaja NU (Tawasuth)",
      options: [
        { key: "A", text: "Tawassuth (Sikap Moderat di Jalan Tengah)" },
        { key: "B", text: "Tatharruf (Ekstremisme Radikal)" },
        { key: "C", text: "Jumud (Stagnasi Berpikir)" },
        { key: "D", text: "Taqlid Buta (Fanatisme Buta)" },
        { key: "E", text: "Ifrath (Berlebih-lebihan)" }
      ],
      ans: "RIGHT:A",
      exp: "Tawassuth bersama I'tidal, Tasamuh, dan Tawazun adalah empat pilar sikap kemasyarakatan Nahdlatul Ulama."
    }
  ];

  const ppknSinglePool = [
    {
      text: "Berdasarkan Undang-Undang Nomor 12 Tahun 2011, hierarki tata urutan peraturan perundang-undangan tertinggi di Negara Kesatuan Republik Indonesia adalah...",
      kompetensi: "Hierarki Peraturan Perundang-undangan RI",
      options: [
        { key: "A", text: "Undang-Undang Dasar Negara Republik Indonesia Tahun 1945" },
        { key: "B", text: "Ketetapan Majelis Permusyawaratan Rakyat (TAP MPR)" },
        { key: "C", text: "Undang-Undang / Peraturan Pemerintah Pengganti Undang-Undang" },
        { key: "D", text: "Peraturan Pemerintah (PP)" },
        { key: "E", text: "Peraturan Presiden (Perpres)" }
      ],
      ans: "RIGHT:A",
      exp: "UUD NRI Tahun 1945 berkedudukan sebagai hukum dasar tertinggi (groundnorm) dalam tata urutan peraturan di Indonesia."
    }
  ];

  const pjokSinglePool = [
    {
      text: "Komponen kebugaran jasmani yang menggambarkan kemampuan otot untuk melakukan kontraksi maksimal dalam menahan beban dalam satu waktu disebut...",
      kompetensi: "Komponen Kebugaran Jasmani (Kekuatan Otot)",
      options: [
        { key: "A", text: "Kekuatan Otot (Strength)" },
        { key: "B", text: "Kelenturan (Flexibility)" },
        { key: "C", text: "Kecepatan (Speed)" },
        { key: "D", text: "Daya Tahan Paru-Jantung (Cardiorespiratory Endurance)" },
        { key: "E", text: "Keseimbangan (Balance)" }
      ],
      ans: "RIGHT:A",
      exp: "Kekuatan (strength) adalah kemampuan otot atau sekumpulan otot menahan beban maksimal saat berkontraksi."
    }
  ];

  const seniSinglePool = [
    {
      text: "Unsur fisik seni rupa dua dimensi yang merupakan lintasan dari suatu titik yang bergerak dan berfungsi memberikan batas bidang adalah...",
      kompetensi: "Unsur-Unsur Dasar Seni Rupa (Garis)",
      options: [
        { key: "A", text: "Garis (Line)" },
        { key: "B", text: "Tekstur" },
        { key: "C", text: "Gelap Terang" },
        { key: "D", text: "Ruang Maya" },
        { key: "E", text: "Gradasi Warna" }
      ],
      ans: "RIGHT:A",
      exp: "Garis adalah unsur dasar seni rupa yang terbentuk dari pergerakan titik bersambung dan membatasi bentuk/bidang."
    }
  ];

  const pkwuSinglePool = [
    {
      text: "Dalam analisis kelayakan usaha dan pemasaran produk kerajinan/pengolahan, analisis SWOT yang mengidentifikasi faktor keunggulan internal produk dinamakan...",
      kompetensi: "Analisis SWOT dalam Perencanaan Usaha",
      options: [
        { key: "A", text: "Strengths (Kekuatan / Keunggulan Internal)" },
        { key: "B", text: "Weaknesses (Kelemahan Internal)" },
        { key: "C", text: "Opportunities (Peluang Pasar Eksternal)" },
        { key: "D", text: "Threats (Ancaman Pesaing Eksternal)" },
        { key: "E", text: "Break Even Point (Titik Impas)" }
      ],
      ans: "RIGHT:A",
      exp: "Strengths dalam SWOT adalah kekuatan atau keunggulan komparatif internal yang dimiliki produk usaha."
    }
  ];

  let currentSinglePool = [
    {
      text: `Dalam kajian materi ${mapel} kelas ${kelas}, fokus analisis ilmiah yang paling fundamental dan komprehensif adalah...`,
      kompetensi: `Struktur Keilmuan & Analisis Konsep ${mapel}`,
      options: [
        { key: "A", text: `Menguasai konsep dasar, prinsip analitis, dan keterkaitan aplikatif dalam konteks nyata ${mapel}` },
        { key: "B", text: `Menghafal istilah tanpa memahami korelasi dan metode pembuktian logisnya` },
        { key: "C", text: `Mengabaikan data faktual dan hanya mengandalkan spekulasi tanpa dasar ilmiah` },
        { key: "D", text: `Membatasi pengujian konsep hanya pada hafalan mekanis semata` },
        { key: "E", text: `Menolak integrasi antara teori dasar dengan pemecahan masalah empiris` }
      ],
      ans: "RIGHT:A",
      exp: `Penguasaan ${mapel} menitikberatkan pada pemahaman konseptual yang kokoh dan kemampuan berpikir kritis aplikatif.`
    },
    {
      text: `Metodologi pemecahan masalah yang paling valid dan terstruktur dalam mendalami materi '${mapel}' adalah...`,
      kompetensi: `Metodologi Pemecahan Masalah ${mapel}`,
      options: [
        { key: "A", text: `Merumuskan pertanyaan penelitian, mengumpulkan bukti faktual, menganalisis data, dan menyimpulkan solusi` },
        { key: "B", text: `Mengambil kesimpulan langsung tanpa proses pengujian bukti yang terverifikasi` },
        { key: "C", text: `Menolak perbandingan data pendukung dengan literatur ilmiah terpercaya` },
        { key: "D", text: `Mengabaikan variabel pengganggu dalam analisis hubungan fenomena` },
        { key: "E", text: `Menyerahkan penyusunan argumen tanpa kerangka penalaran logis` }
      ],
      ans: "RIGHT:A",
      exp: `Langkah analisis ilmiah dalam ${mapel} menuntut pembuktian berbasis data dan logika kritis yang terstruktur.`
    }
  ];

  if (isJawaSubject) currentSinglePool = jawaSinglePool;
  else if (isEnglishSubject) currentSinglePool = englishSinglePool;
  else if (isGeoSubject) currentSinglePool = geoSinglePool;
  else if (isSosiologiSubject) currentSinglePool = sosiologiSinglePool;
  else if (isEkonomiSubject) currentSinglePool = ekonomiSinglePool;
  else if (isSejarahSubject) currentSinglePool = sejarahSinglePool;
  else if (isBiologiSubject) currentSinglePool = biologiSinglePool;
  else if (isFisikaSubject) currentSinglePool = fisikaSinglePool;
  else if (isKimiaSubject) currentSinglePool = kimiaSinglePool;
  else if (isQuranHadisSubject) currentSinglePool = quranHadisSinglePool;
  else if (isAkidahAkhlakSubject) currentSinglePool = akidahAkhlakSinglePool;
  else if (isSkiSubject) currentSinglePool = skiSinglePool;
  else if (isAswajaSubject) currentSinglePool = aswajaSinglePool;
  else if (isPpknSubject) currentSinglePool = ppknSinglePool;
  else if (isPjokSubject) currentSinglePool = pjokSinglePool;
  else if (isSeniSubject) currentSinglePool = seniSinglePool;
  else if (isPkwuSubject) currentSinglePool = pkwuSinglePool;
  else if (isInformaticsSubject) currentSinglePool = informaticsSinglePool;
  else if (isIndoSubject) currentSinglePool = indoSinglePool;
  else if (isMathSubject) currentSinglePool = mathSinglePool;
  else if (isArabicSubject || isFiqihSubject) currentSinglePool = arabicFiqihSinglePool;

  for (let i = 0; i < pgCount; i++) {
    const item = currentSinglePool[i % currentSinglePool.length];
    let textStr = item.text;
    if (i >= currentSinglePool.length) {
      textStr += ` (Variasi Soal Model ${Math.floor(i / currentSinglePool.length) + 1})`;
    }

    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'single_choice',
      text: textStr,
      isArabic: !!(item as any).isArabic,
      hasLatex: isMathSubject,
      difficulty: i % 3 === 0 ? 'mudah' : i % 3 === 1 ? 'sedang' : 'sulit',
      kompetensiTarget: item.kompetensi,
      options: item.options.map(opt => ({ ...opt })),
      rawRightAnswer: item.ans,
      explanation: item.exp
    });
    num++;
  }

  // ==========================================
  // 2. MULTIPLE CHOICE (PILIHAN GANDA JAMAK)
  // ==========================================
  const multiCount = selectedTypes?.multiple_choice ?? 1;
  const informaticsMultiPool = [
    {
      text: "Di antara perangkat keras komputer (hardware) berikut, manakah yang dikategorikan murni sebagai perangkat masukan (input devices)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Identifikasi Perangkat Input Komputer",
      options: [
        { key: "A", text: "Keyboard" },
        { key: "B", text: "Mouse" },
        { key: "C", text: "Printer laser" },
        { key: "D", text: "Scanner" },
        { key: "E", text: "Monitor LCD" }
      ],
      ans: "RIGHT:A,B,D"
    },
    {
      text: "Struktur kontrol utama apa sajakah yang diakui dalam penulisan logika pemrograman dan algoritma terstruktur? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Struktur Kontrol Algoritma",
      options: [
        { key: "A", text: "Sekuensial / Urutan (Sequence)" },
        { key: "B", text: "Percabangan / Pemilihan (Branching / Selection)" },
        { key: "C", text: "Pengulangan / Iterasi (Looping / Iteration)" },
        { key: "D", text: "Instruksi acak tanpa syarat (GoTo statement)" },
        { key: "E", text: "Deklarasi kelas statis" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const indoMultiPool = [
    {
      text: "Manakah di antara pernyataan berikut yang tergolong sebagai kalimat opini dalam teks pembahasan pangan lokal? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Analisis Kalimat Opini Kontekstual",
      options: [
        { key: "A", text: "Sagu sangat layak menggantikan beras sebagai makanan pokok utama" },
        { key: "B", text: "Kandungan karbohidrat per 100 gram singkong kering setara dengan nasi putih" },
        { key: "C", text: "Sepertinya masyarakat perkotaan lebih memilih tiwul instan karena kepraktisannya" },
        { key: "D", text: "Tanaman sukun dapat dibudidayakan di daerah lahan marginal kering" },
        { key: "E", text: "Inovasi makanan olahan talas dirasa belum maksimal dipromosikan oleh instansi terkait" }
      ],
      ans: "RIGHT:A,C,E"
    }
  ];

  const englishMultiPool = [
    {
      text: "Which of the following language features are commonly used in an English Descriptive Text? (Choose all correct answers)",
      kompetensi: "Language Features of Descriptive Text",
      options: [
        { key: "A", text: "Use of Simple Present Tense" },
        { key: "B", text: "Use of detailed descriptive adjectives and sensory imagery" },
        { key: "C", text: "Focus on a specific participant (e.g., a specific landmark or animal)" },
        { key: "D", text: "Heavy use of Past Perfect Continuous tense for all verbs" },
        { key: "E", text: "Use of generic rhyming couplets in every sentence" }
      ],
      ans: "RIGHT:A,B,C"
    },
    {
      text: "Which of the following actions directly contribute to reducing carbon footprint and preserving our surrounding environment? (Choose all correct answers)",
      kompetensi: "Contextual Environmental Vocabulary & Actions",
      options: [
        { key: "A", text: "Using reusable tumblers and lunch boxes instead of single-use plastics" },
        { key: "B", text: "Turning off electrical appliances and lights when not in use" },
        { key: "C", text: "Planting trees and creating green spaces in the madrasah garden" },
        { key: "D", text: "Burning plastic waste openly in the school yard" },
        { key: "E", text: "Leaving water taps running continuously in the restroom" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const jawaMultiPool = [
    {
      text: "Ing ngisor iki kang kalebu titikane (ciri-ciri) teks geguritan gagrag anyar yaiku... (Pilihen kabeh wangsulan kang bener)",
      kompetensi: "Titikane Geguritan Gagrag Anyar",
      options: [
        { key: "A", text: "Ora kaiket paugeran guru gatra, guru wilangan, lan guru lagu" },
        { key: "B", text: "Nggunakake tembung-tembung kawi utawa endah (basa rinengga)" },
        { key: "C", text: "Isine ngemot piwulang luhur, kritik sosial, utawa rasa pangrasa panggurit" },
        { key: "D", text: "Kudu diwiwiti nganggo ukara 'Sun Gegurit'" },
        { key: "E", text: "Cacahe larik kudu padha saben sapadane" }
      ],
      ans: "RIGHT:A,B,C"
    },
    {
      text: "Manungsa kudu ngugemi unggah-ungguh basa nalika pacelathon. Manakah ing ngisor iki ukara kang migunakake Basa Krama Alus kanthi bener? (Pilihen kabeh wangsulan kang bener)",
      kompetensi: "Panganggone Basa Krama Alus",
      options: [
        { key: "A", text: "Bapak Kepala Madrasah saweg rawuh wonten ing aula." },
        { key: "B", text: "Kula badhe siram rumiyin saderengipun tindak sekolah." },
        { key: "C", text: "Eyang kakung saweg sare wonten ing kamar ngajeng." },
        { key: "D", text: "Ibu mundhut beras lan lisah wonten ing peken." },
        { key: "E", text: "Kula sampun dhahar kalawau enjang." }
      ],
      ans: "RIGHT:A,C,D"
    }
  ];

  const geoMultiPool = [
    {
      text: "Manakah di antara konsep-konsep berikut yang termasuk ke dalam 10 Konsep Esensial Geografi menurut Ikatan Geograf Indonesia (IGI)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Konsep Esensial Geografi (IGI)",
      options: [
        { key: "A", text: "Konsep Lokasi dan Jarak" },
        { key: "B", text: "Konsep Morfologi dan Keterjangkauan" },
        { key: "C", text: "Konsep Aglomerasi dan Diferensiasi Area" },
        { key: "D", text: "Konsep Fotosintesis Tumbuhan" },
        { key: "E", text: "Konsep Termodinamika Fluida" }
      ],
      ans: "RIGHT:A,B,C"
    },
    {
      text: "Berikut ini yang merupakan objek material kajian geosfer dalam ilmu geografi adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Objek Material Kajian Geosfer",
      options: [
        { key: "A", text: "Litosfer (lapisan kerak bumi dan batuan)" },
        { key: "B", text: "Atmosfer (lapisan udara dan cuaca/iklim)" },
        { key: "C", text: "Hidrosfer (lapisan perairan darat dan laut)" },
        { key: "D", text: "Stratifikasi kasta sosial masyarakat" },
        { key: "E", text: "Laju inflasi pasar modal" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const sosiologiMultiPool = [
    {
      text: "Manakah di antara faktor-faktor berikut yang menjadi syarat mutlak terjadinya interaksi sosial menurut teori sosiologi? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Syarat Terjadinya Interaksi Sosial",
      options: [
        { key: "A", text: "Adanya kontak sosial (baik langsung maupun tidak langsung)" },
        { key: "B", text: "Adanya komunikasi antarpelaku yang saling dipahami" },
        { key: "C", text: "Adanya persamaan status sosial ekonomi" },
        { key: "D", text: "Tinggal di wilayah administratif yang sama" },
        { key: "E", text: "Menggunakan pakaian tradisional seragam" }
      ],
      ans: "RIGHT:A,B"
    }
  ];

  const ekonomiMultiPool = [
    {
      text: "Berikut ini yang merupakan faktor-faktor utama yang memengaruhi tingkat permintaan (demand) suatu barang di pasar adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Faktor yang Memengaruhi Permintaan",
      options: [
        { key: "A", text: "Tingkat pendapatan masyarakat" },
        { key: "B", text: "Harga barang substitusi dan komplementer" },
        { key: "C", text: "Selera atau preferensi konsumen" },
        { key: "D", text: "Biaya produksi bahan mentah pabrik" },
        { key: "E", text: "Jumlah produsen yang memproduksi barang sejenis" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const sejarahMultiPool = [
    {
      text: "Manakah di antara sumber-sumber berikut yang dapat diklasifikasikan sebagai sumber primer (primary sources) dalam penelitian sejarah? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Klasifikasi Sumber Primer Sejarah",
      options: [
        { key: "A", text: "Prasasti sezaman bertarikh tahun peristiwa" },
        { key: "B", text: "Naskah proklamasi bertanda tangan asli tokoh pelaku sejarah" },
        { key: "C", text: "Rekaman wawancara dengan saksi mata langsung peristiwa" },
        { key: "D", text: "Buku teks sejarah yang ditulis sejarawan modern puluhan tahun kemudian" },
        { key: "E", text: "Artikel opini di blog internet" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const biologiMultiPool = [
    {
      text: "Manakah di antara karakteristik berikut yang dimiliki oleh sel prokariotik (seperti bakteri) jika dibandingkan dengan sel eukariotik? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Karakteristik Struktur Sel Prokariotik",
      options: [
        { key: "A", text: "Tidak memiliki membran inti sel (nukleus sejati)" },
        { key: "B", text: "Materi genetik (DNA) berada bebas di daerah nukleoid" },
        { key: "C", text: "Memiliki organel ribosom untuk sintesis protein" },
        { key: "D", text: "Memiliki membran inti ganda dan retikulum endoplasma" },
        { key: "E", text: "Memiliki kloroplas multiseluler" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const mathMultiPool = [
    {
      text: "Manakah di bawah ini yang merupakan sifat-sifat eksponen dan pangkat yang benar dalam aljabar matematika? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Identifikasi Sifat Eksponensial",
      options: [
        { key: "A", text: "$a^m \\cdot a^n = a^{m+n}$" },
        { key: "B", text: "$(a^m)^n = a^{m \\cdot n}$" },
        { key: "C", text: "$\\frac{a^m}{a^n} = a^{m-n}$" },
        { key: "D", text: "$a^m + a^n = a^{m+n}$" },
        { key: "E", text: "$(ab)^m = a^m + b^m$" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const arabicFiqihMultiPool = [
    {
      text: "Di antara perkara-perkara basuhan berikut ini, manakah yang merupakan fardhu (rukun wajib) dalam pelaksanaan ibadah wudhu menurut mazhab Syafi'i? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Identifikasi Rukun Wajib Wudhu",
      options: [
        { key: "A", text: "Niat saat pertama kali membasuh muka" },
        { key: "B", text: "Membasuh kedua telapak tangan sebelum berkumur" },
        { key: "C", text: "Membasuh kedua belah tangan beserta siku-sikunya" },
        { key: "D", text: "Mengusap sebagian dari kulit atau rambut kepala" },
        { key: "E", text: "Membasuh sela-sela jari tangan dan kaki" }
      ],
      ans: "RIGHT:A,C,D"
    }
  ];

  const fisikaMultiPool = [
    {
      text: "Manakah di antara besaran-besaran fisika berikut yang tergolong sebagai besaran vektor (memiliki nilai dan arah)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Klasifikasi Besaran Vektor dan Skalar",
      options: [
        { key: "A", text: "Kecepatan (Velocity)" },
        { key: "B", text: "Percepatan (Acceleration)" },
        { key: "C", text: "Gaya (Force)" },
        { key: "D", text: "Massa benda (Mass)" },
        { key: "E", text: "Suhu mutlak (Temperature)" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const kimiaMultiPool = [
    {
      text: "Berikut ini yang merupakan ciri-ciri umum dari senyawa yang memiliki ikatan kovalen adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Sifat Karakteristik Ikatan Kovalen",
      options: [
        { key: "A", text: "Terbentuk dari pemakaian bersama pasangan elektron antar-atom non-logam" },
        { key: "B", text: "Umumnya memiliki titik leleh dan titik didih yang relatif lebih rendah dibanding senyawa ionik" },
        { key: "C", text: "Dalam bentuk lelehan umumnya tidak menghantarkan arus listrik" },
        { key: "D", text: "Terjadi perpindahan serah-terima elektron dari logam ke non-logam" },
        { key: "E", text: "Membentuk kisi kristal raksasa yang sangat keras dan rapuh" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const quranHadisMultiPool = [
    {
      text: "Manakah di antara huruf-huruf hijaiyah berikut yang termasuk ke dalam kelompok huruf Qalqalah (bacaan memantul saat sukun)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Kaidah Hukum Bacaan Qalqalah",
      options: [
        { key: "A", text: "Qaf (ق)" },
        { key: "B", text: "Tha (ط)" },
        { key: "C", text: "Jim (ج)" },
        { key: "D", text: "Sin (س)" },
        { key: "E", text: "Fa (ف)" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const akidahAkhlakMultiPool = [
    {
      text: "Manakah di antara sifat-sifat berikut yang tergolong ke dalam Sifat Wajib bagi Allah SWT (Sifat Salbiyah)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Klasifikasi Sifat Wajib Allah (Salbiyah)",
      options: [
        { key: "A", text: "Qidam (Maha Terdahulu / Tanpa Awal)" },
        { key: "B", text: "Baqa' (Maha Kekal / Tanpa Akhir)" },
        { key: "C", text: "Mukhalafatu lil Hawaditsi (Berbeda dengan Ciptaan-Nya)" },
        { key: "D", text: "Ajzun (Lemah)" },
        { key: "E", text: "Jahlun (Bodoh)" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const skiMultiPool = [
    {
      text: "Berikut ini yang merupakan nama-nama sahabat Rasulullah SAW yang termasuk ke dalam Khulafaur Rasyidin adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Kepemimpinan Khulafaur Rasyidin",
      options: [
        { key: "A", text: "Abu Bakar ash-Shiddiq RA" },
        { key: "B", text: "Umar bin Khattab RA" },
        { key: "C", text: "Ali bin Abi Thalib RA" },
        { key: "D", text: "Muawiyah bin Abu Sufyan" },
        { key: "E", text: "Harun ar-Rasyid" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const aswajaMultiPool = [
    {
      text: "Manakah di antara 4 Imam Mazhab Fiqih Mu'tabar berikut yang menjadi rujukan utama Ahlussunnah wal Jama'ah an-Nahdliyyah dalam bidang fiqih ibadah? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Empat Mazhab Fiqih Aswaja",
      options: [
        { key: "A", text: "Imam Syafi'i (Muhammad bin Idris asy-Syafi'i)" },
        { key: "B", text: "Imam Hanafi (Nu'man bin Tsabit)" },
        { key: "C", text: "Imam Maliki (Malik bin Anas)" },
        { key: "D", text: "Karl Marx" },
        { key: "E", text: "Niccolo Machiavelli" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const ppknMultiPool = [
    {
      text: "Manakah di antara pernyataan berikut yang mencerminkan pengamalan nilai-nilai Sila Ketiga Pancasila 'Persatuan Indonesia'? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Pengamalan Sila-Sila Pancasila",
      options: [
        { key: "A", text: "Mengutamakan kepentingan bangsa dan negara di atas kepentingan pribadi/golongan" },
        { key: "B", text: "Mengembangkan rasa cinta tanah air dan bangga bertanah air Indonesia" },
        { key: "C", text: "Memelihara ketertiban dunia berdasarkan kemerdekaan dan perdamaian abadi" },
        { key: "D", text: "Memaksakan kehendak kelompok sendiri dalam musyawarah" },
        { key: "E", text: "Menolak keberagaman adat istiadat suku lain" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const pjokMultiPool = [
    {
      text: "Berikut ini yang merupakan keterampilan teknik dasar permainan bola voli adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Teknik Dasar Permainan Bola Voli",
      options: [
        { key: "A", text: "Passing bawah dan Passing atas" },
        { key: "B", text: "Servis atas / Servis bawah" },
        { key: "C", text: "Smash / Spike dan Block (Bendungan)" },
        { key: "D", text: "Dribbling zig-zag kaki bagian luar" },
        { key: "E", text: "Lay-up shoot" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const seniMultiPool = [
    {
      text: "Manakah di antara warna-warna berikut yang termasuk ke dalam kelompok Warna Primer (warna pokok yang tidak dapat dihasilkan dari campuran warna lain)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Teori Warna Seni Rupa (Warna Primer)",
      options: [
        { key: "A", text: "Merah (Red)" },
        { key: "B", text: "Kuning (Yellow)" },
        { key: "C", text: "Biru (Blue)" },
        { key: "D", text: "Hijau (Campuran Biru dan Kuning)" },
        { key: "E", text: "Oranye (Campuran Merah dan Kuning)" }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  const pkwuMultiPool = [
    {
      text: "Dalam strategi bauran pemasaran (Marketing Mix 4P), unsur-unsur pokok yang wajib direncanakan wirausahawan adalah... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Bauran Pemasaran (Marketing Mix 4P)",
      options: [
        { key: "A", text: "Product (Produk dan Kualitas)" },
        { key: "B", text: "Price (Penetapan Harga Jual)" },
        { key: "C", text: "Place (Saluran Distribusi & Lokasi)" },
        { key: "D", text: "Promotion (Promosi & Iklan)" },
        { key: "E", text: "Plagiarism (Peniruan Hak Cipta)" }
      ],
      ans: "RIGHT:A,B,C,D"
    }
  ];

  let currentMultiPool = [
    {
      text: `Manakah di antara pernyataan berikut yang merupakan prinsip analitis dan karakteristik esensial materi '${mapel}'? (Pilihlah semua jawaban yang benar)`,
      kompetensi: `Karakteristik Esensial & Konsep Analitis ${mapel}`,
      options: [
        { key: "A", text: `Menerapkan penalaran logis dan pembuktian berbasis data faktual pada ${mapel}` },
        { key: "B", text: `Mengaitkan konsep dasar dengan studi kasus kontekstual di lingkungan nyata` },
        { key: "C", text: `Mengevaluasi keabsahan informasi sebelum menarik kesimpulan ilmiah` },
        { key: "D", text: `Menolak analisis komparatif antarteori yang relevan` },
        { key: "E", text: `Mengabaikan verifikasi sumber pustaka yang sahih` }
      ],
      ans: "RIGHT:A,B,C"
    }
  ];

  if (isJawaSubject) currentMultiPool = jawaMultiPool;
  else if (isEnglishSubject) currentMultiPool = englishMultiPool;
  else if (isGeoSubject) currentMultiPool = geoMultiPool;
  else if (isSosiologiSubject) currentMultiPool = sosiologiMultiPool;
  else if (isEkonomiSubject) currentMultiPool = ekonomiMultiPool;
  else if (isSejarahSubject) currentMultiPool = sejarahMultiPool;
  else if (isBiologiSubject) currentMultiPool = biologiMultiPool;
  else if (isFisikaSubject) currentMultiPool = fisikaMultiPool;
  else if (isKimiaSubject) currentMultiPool = kimiaMultiPool;
  else if (isQuranHadisSubject) currentMultiPool = quranHadisMultiPool;
  else if (isAkidahAkhlakSubject) currentMultiPool = akidahAkhlakMultiPool;
  else if (isSkiSubject) currentMultiPool = skiMultiPool;
  else if (isAswajaSubject) currentMultiPool = aswajaMultiPool;
  else if (isPpknSubject) currentMultiPool = ppknMultiPool;
  else if (isPjokSubject) currentMultiPool = pjokMultiPool;
  else if (isSeniSubject) currentMultiPool = seniMultiPool;
  else if (isPkwuSubject) currentMultiPool = pkwuMultiPool;
  else if (isInformaticsSubject) currentMultiPool = informaticsMultiPool;
  else if (isIndoSubject) currentMultiPool = indoMultiPool;
  else if (isMathSubject) currentMultiPool = mathMultiPool;
  else if (isArabicSubject || isFiqihSubject) currentMultiPool = arabicFiqihMultiPool;

  for (let i = 0; i < multiCount; i++) {
    const item = currentMultiPool[i % currentMultiPool.length];
    let textStr = item.text;
    if (i >= currentMultiPool.length) {
      textStr += ` (Variasi Pilihan Ganda Kompleks ${Math.floor(i / currentMultiPool.length) + 1})`;
    }

    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'multiple_choice',
      text: textStr,
      isArabic: isArabicSubject,
      hasLatex: isMathSubject,
      difficulty: 'sedang',
      kompetensiTarget: item.kompetensi,
      options: item.options.map(opt => ({ ...opt })),
      rawRightAnswer: item.ans,
      explanation: "Jawaban yang benar mencakup butir-butir teoretis yang valid secara ilmiah."
    });
    num++;
  }

  // ==========================================
  // 3. SHORT ANSWER (JAWABAN SINGKAT)
  // ==========================================
  const shortCount = selectedTypes?.short_answer ?? 1;
  const informaticsShortPool = [
    {
      text: "Sistem operasi komputer open-source yang memiliki maskot ikonik berupa pinguin bernama Tux adalah...",
      kompetensi: "Sistem Operasi Komputer",
      ans: "RIGHT:LINUX",
      exp: "Linux adalah kernel/sistem operasi bersumber terbuka yang dilambangkan dengan pinguin Tux."
    }
  ];

  const jawaShortPool = [
    {
      text: "Sandhangan swara ing aksara Jawa kang gunane kanggo ngowahi swara legena dadi swara vokal 'i' arane...",
      kompetensi: "Sandhangan Aksara Jawa",
      ans: "RIGHT:WULU",
      exp: "Sandhangan wulu awujud bunderan cilik ing sandhuwure aksara kanggo ngunekake vokal 'i'."
    },
    {
      text: "Tembung krama alus (inggil) saka tembung 'omah' utawa 'griya' yaiku...",
      kompetensi: "Kamus Basa Krama Inggil",
      ans: "RIGHT:DALEM",
      exp: "Tembung 'omah' krama lugune yaiku 'griya', dene krama inggile yaiku 'dalem'."
    }
  ];

  const englishShortPool = [
    {
      text: "The grammatical tense predominantly used in a descriptive text to express general truths, permanent situations, and current states is called...",
      kompetensi: "Identifying Tense in Descriptive Text",
      ans: "RIGHT:SIMPLE PRESENT",
      exp: "Descriptive texts use the Simple Present Tense to describe attributes and facts."
    },
    {
      text: "What is the opposite meaning (antonym) of the adjective 'CLEAN' in the context of healthy environment?",
      kompetensi: "Vocabulary & Antonyms",
      ans: "RIGHT:DIRTY",
      exp: "The antonym of 'clean' is 'dirty' or 'polluted'."
    }
  ];

  const indoShortPool = [
    {
      text: "Kalimat dalam teks argumentasi yang menyajikan data nyata, angka, statistik atau kejadian yang dapat dibuktikan kebenarannya secara objektif disebut kalimat...",
      kompetensi: "Bahasa Teks Argumentasi",
      ans: "RIGHT:FAKTA",
      exp: "Kalimat fakta didasarkan pada kenyataan objektif yang dapat diverifikasi datanya."
    }
  ];

  const mathShortPool = [
    {
      text: "Jika fungsi kuadrat $f(x) = x^2 - 4x + 7$, maka berapakah nilai dari $f(3)$?",
      kompetensi: "Evaluasi Nilai Fungsi Kuadrat",
      ans: "RIGHT:4",
      exp: "$f(3) = 3^2 - 4(3) + 7 = 9 - 12 + 7 = 4$."
    }
  ];

  const geoShortPool = [
    {
      text: "Sistem komputer berbasis spasial yang dirancang untuk mengumpulkan, menyimpan, memanipulasi, menganalisis, dan menyajikan data georeferensi keruangan dinamakan...",
      kompetensi: "Sistem Informasi Geografis (SIG)",
      ans: "RIGHT:SIG",
      exp: "SIG (Sistem Informasi Geografis) atau GIS adalah sistem berbasis komputer untuk pemrosesan data spasial."
    },
    {
      text: "Prinsip geografi yang memadukan prinsip persebaran, interrelasi, dan deskripsi dalam ruang wilayah yang komprehensif disebut prinsip...",
      kompetensi: "Prinsip Korologi",
      ans: "RIGHT:KOROLOGI",
      exp: "Prinsip korologi merupakan prinsip geografi yang komprehensif menggabungkan distribusi, interrelasi, dan deskripsi."
    }
  ];

  const sosiologiShortPool = [
    {
      text: "Aturan tidak tertulis yang berisi petunjuk tingkah laku dalam masyarakat dan disertai sanksi moral bagi pelanggarnya disebut...",
      kompetensi: "Norma Sosial",
      ans: "RIGHT:NORMA",
      exp: "Norma sosial adalah pedoman perilaku dalam kelompok masyarakat."
    }
  ];

  const ekonomiShortPool = [
    {
      text: "Nilai barang atau jasa terbaik yang harus dikorbankan karena memilih alternatif keputusan ekonomi lainnya dinamakan biaya...",
      kompetensi: "Biaya Peluang (Opportunity Cost)",
      ans: "RIGHT:PELUANG",
      exp: "Opportunity cost (biaya peluang) adalah nilai kesempatan terbaik yang dilepaskan."
    }
  ];

  const sejarahShortPool = [
    {
      text: "Pembagian babakan waktu sejarah ke dalam beberapa kurun masa berdasarkan ciri atau tema tertentu disebut...",
      kompetensi: "Konsep Periodisasi Sejarah",
      ans: "RIGHT:PERIODISASI",
      exp: "Periodisasi adalah pembabakan waktu peristiwa sejarah agar runtut dan mudah dikaji."
    }
  ];

  const biologiShortPool = [
    {
      text: "Organel sel yang berfungsi sebagai tempat respirasi seluler dan menghasilkan energi utama dalam bentuk ATP adalah...",
      kompetensi: "Organel Sel (Mitokondria)",
      ans: "RIGHT:MITOKONDRIA",
      exp: "Mitokondria adalah the powerhouse of cell penghasil energi seluler."
    }
  ];

  const arabicFiqihShortPool = [
    {
      text: "Bersuci dengan debu tanah yang suci sebagai alternatif pengganti wudhu atau mandi wajib saat tidak ada air dinamakan...",
      kompetensi: "Konsep Tayamum dalam Thaharah",
      ans: "RIGHT:TAYAMUM",
      exp: "Tayamum adalah rukhsah bersuci menggunakan debu tanah yang suci bagi orang yang berhalangan menggunakan air."
    }
  ];

  const fisikaShortPool = [
    {
      text: "Satuan Internasional (SI) untuk besaran gaya dalam sistem metrik adalah...",
      kompetensi: "Satuan Internasional Besaran Fisika",
      ans: "RIGHT:NEWTON",
      exp: "Satuan gaya dalam SI adalah Newton (N) yang setara dengan kg m/s²."
    }
  ];

  const kimiaShortPool = [
    {
      text: "Jenis ikatan kimia yang terbentuk akibat gaya tarik-menarik elektrostatis antara kation logam bermuatan positif dengan anion non-logam bermuatan negatif dinamakan ikatan...",
      kompetensi: "Ikatan Ionik",
      ans: "RIGHT:ION",
      exp: "Ikatan ion terbentuk karena serah terima elektron antara ion positif dan negatif."
    }
  ];

  const quranHadisShortPool = [
    {
      text: "Membaca huruf hijaiyah dengan cara menyamarkan bacaan antara izhar dan idgham disertai dengung dinamakan hukum...",
      kompetensi: "Hukum Tajwid Ikhfa",
      ans: "RIGHT:IKHFA",
      exp: "Ikhfa artinya menyamarkan bunyi nun mati atau tanwin."
    }
  ];

  const akidahAkhlakShortPool = [
    {
      text: "Sikap batin senantiasa merasa cukup dan rela menerima segala rezeki dan ketetapan takdir Allah SWT dinamakan...",
      kompetensi: "Akhlak Mahmudah Qana'ah",
      ans: "RIGHT:QANA'AH",
      exp: "Qana'ah adalah merasa ridha dan cukup dengan rezeki pemberian Allah."
    }
  ];

  const skiShortPool = [
    {
      text: "Peristiwa hijrah kaum Muslimin bersama Nabi Muhammad SAW pada tahun 622 Masehi berpindah dari kota Makkah menuju kota...",
      kompetensi: "Sejarah Hijrah Nabawi",
      ans: "RIGHT:MADINAH",
      exp: "Nabi Muhammad SAW dan para sahabat berhijrah dari Makkah ke Madinah (Yatsrib)."
    }
  ];

  const aswajaShortPool = [
    {
      text: "Pilar sikap kemasyarakatan Nahdlatul Ulama yang berarti bersikap adil dan tegak lurus pada kebenaran disebut...",
      kompetensi: "Pilar Aswaja I'tidal",
      ans: "RIGHT:I'TIDAL",
      exp: "I'tidal berarti tegak lurus, menempatkan sesuatu pada proporsinya, dan menjunjung keadilan."
    }
  ];

  const ppknShortPool = [
    {
      text: "Lembaga tinggi negara yang berwenang menguji undang-undang terhadap Undang-Undang Dasar (Judicial Review) di Indonesia adalah Mahkamah...",
      kompetensi: "Lembaga Mahkamah Konstitusi",
      ans: "RIGHT:KONSTITUSI",
      exp: "Mahkamah Konstitusi (MK) berwenang menguji UU terhadap UUD 1945."
    }
  ];

  const pjokShortPool = [
    {
      text: "Pukulan keras menukik ke arah lapangan lawan untuk mematikan bola dalam permainan bola voli disebut...",
      kompetensi: "Teknik Smash Bola Voli",
      ans: "RIGHT:SMASH",
      exp: "Smash atau spike adalah teknik serangan mematikan dalam bola voli."
    }
  ];

  const seniShortPool = [
    {
      text: "Unsur seni rupa yang menyatakan tingkat kualitas permukaan suatu benda (halus, kasar, licin) saat diraba dinamakan...",
      kompetensi: "Unsur Tekstur Seni Rupa",
      ans: "RIGHT:TEKSTUR",
      exp: "Tekstur adalah nilai raba permukaan karya seni rupa."
    }
  ];

  const pkwuShortPool = [
    {
      text: "Titik impas kondisi usaha di mana total pendapatan sama persis dengan total biaya yang dikeluarkan (tidak laba dan tidak rugi) dinamakan...",
      kompetensi: "Break Even Point (BEP)",
      ans: "RIGHT:BEP",
      exp: "Break Even Point (BEP) adalah kondisi titik impas usaha."
    }
  ];

  let currentShortPool = [
    {
      text: `Sebutkan istilah ilmiah utama yang menjadi objek kajian fundamental dalam materi '${mapel}'!`,
      kompetensi: `Terminologi Kunci ${mapel}`,
      ans: "RIGHT:KONSEPTUAL",
      exp: `Pemahaman terminologi inti merupakan fondasi dasar dalam penguasaan bidang keilmuan ${mapel}.`
    }
  ];

  if (isJawaSubject) currentShortPool = jawaShortPool;
  else if (isEnglishSubject) currentShortPool = englishShortPool;
  else if (isGeoSubject) currentShortPool = geoShortPool;
  else if (isSosiologiSubject) currentShortPool = sosiologiShortPool;
  else if (isEkonomiSubject) currentShortPool = ekonomiShortPool;
  else if (isSejarahSubject) currentShortPool = sejarahShortPool;
  else if (isBiologiSubject) currentShortPool = biologiShortPool;
  else if (isFisikaSubject) currentShortPool = fisikaShortPool;
  else if (isKimiaSubject) currentShortPool = kimiaShortPool;
  else if (isQuranHadisSubject) currentShortPool = quranHadisShortPool;
  else if (isAkidahAkhlakSubject) currentShortPool = akidahAkhlakShortPool;
  else if (isSkiSubject) currentShortPool = skiShortPool;
  else if (isAswajaSubject) currentShortPool = aswajaShortPool;
  else if (isPpknSubject) currentShortPool = ppknShortPool;
  else if (isPjokSubject) currentShortPool = pjokShortPool;
  else if (isSeniSubject) currentShortPool = seniShortPool;
  else if (isPkwuSubject) currentShortPool = pkwuShortPool;
  else if (isInformaticsSubject) currentShortPool = informaticsShortPool;
  else if (isIndoSubject) currentShortPool = indoShortPool;
  else if (isMathSubject) currentShortPool = mathShortPool;
  else if (isArabicSubject || isFiqihSubject) currentShortPool = arabicFiqihShortPool;

  for (let i = 0; i < shortCount; i++) {
    const item = currentShortPool[i % currentShortPool.length];
    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'short_answer',
      text: item.text,
      isArabic: isArabicSubject,
      hasLatex: isMathSubject,
      difficulty: 'sedang',
      kompetensiTarget: item.kompetensi,
      options: [{ key: 'A', text: item.ans.replace("RIGHT:", "") }],
      rawRightAnswer: item.ans,
      explanation: item.exp
    });
    num++;
  }

  // ==========================================
  // 4. ORDERING (MENGURUTKAN)
  // ==========================================
  const orderingCount = selectedTypes?.ordering ?? 1;
  const informaticsOrderingPool = [
    {
      text: "Urutkan kapasitas penyimpanan media digital berikut dari yang paling kecil hingga yang paling besar!",
      kompetensi: "Urutan Satuan Memori Digital",
      items: [
        { id: 1, text: "Kilobyte (KB)" },
        { id: 2, text: "Megabyte (MB)" },
        { id: 3, text: "Gigabyte (GB)" },
        { id: 4, text: "Terabyte (TB)" }
      ]
    }
  ];

  const jawaOrderingPool = [
    {
      text: "Urutna struktur teks pawarta Basa Jawa ing ngisor iki kanthi runtut saka wiwitan nganti pungkasan!",
      kompetensi: "Struktur Teks Pawarta Basa Jawa",
      items: [
        { id: 1, text: "Irah-irahan (Headline / Judhul pawarta)" },
        { id: 2, text: "Teras / Alinea Pambuka (Lead pawarta kang ngemot inti 5W+1H)" },
        { id: 3, text: "Awak Pawarta (Body pawarta kang ngandharake kronologi kanthi cetha)" },
        { id: 4, text: "Panutup Pawarta (Andharan tambahan utawa dudutan)" }
      ]
    }
  ];

  const geoOrderingPool = [
    {
      text: "Urutkan tahapan kerja Sistem Informasi Geografis (SIG) dalam pemrosesan data spasial keruangan dari awal hingga akhir!",
      kompetensi: "Tahapan Kerja SIG",
      items: [
        { id: 1, text: "Tahap Masukan Data (Input data spasial peta dan data atribut)" },
        { id: 2, text: "Tahap Pengelolaan & Penyimpanan Data (Data Management Basis Data)" },
        { id: 3, text: "Tahap Manipulasi & Analisis Spasial (Overlay / Buffering)" },
        { id: 4, text: "Tahap Keluaran / Penyajian Peta (Output Visualisasi Layout)" }
      ]
    }
  ];

  const sosiologiOrderingPool = [
    {
      text: "Urutkan tahapan sosialisasi primer hingga sekunder individu menurut sosiologi dari masa kanak-kanak hingga dewasa!",
      kompetensi: "Tahapan Sosialisasi Individu",
      items: [
        { id: 1, text: "Tahap Persiapan (Preparatory Stage)" },
        { id: 2, text: "Tahap Meniru (Play Stage)" },
        { id: 3, text: "Tahap Siap Bertindak (Game Stage)" },
        { id: 4, text: "Tahap Penerimaan Norma Kolektif (Generalized Other)" }
      ]
    }
  ];

  const ekonomiOrderingPool = [
    {
      text: "Urutkan tahapan siklus akuntansi keuangan perusahaan jasa dari awal transaksi hingga laporan akhir!",
      kompetensi: "Siklus Akuntansi Keuangan",
      items: [
        { id: 1, text: "Pencatatan Bukti Transaksi ke dalam Jurnal Umum" },
        { id: 2, text: "Pemindahbukuan (Posting) ke Buku Besar" },
        { id: 3, text: "Penyusunan Neraca Saldo dan Jurnal Penyesuaian" },
        { id: 4, text: "Penyusunan Laporan Keuangan (Laba Rugi & Neraca)" }
      ]
    }
  ];

  const sejarahOrderingPool = [
    {
      text: "Urutkan tahapan metode penelitian sejarah menurut kaidah historiografi ilmiah dari tahap pertama hingga terakhir!",
      kompetensi: "Tahapan Metode Penelitian Sejarah",
      items: [
        { id: 1, text: "Heuristik (Pengumpulan Sumber & Bukti Sejarah)" },
        { id: 2, text: "Kritik Sumber / Verifikasi (Ekstern dan Intern)" },
        { id: 3, text: "Interpretasi (Penafsiran Fakta Sejarah)" },
        { id: 4, text: "Historiografi (Penulisan Kisah Sejarah Ilmiah)" }
      ]
    }
  ];

  const biologiOrderingPool = [
    {
      text: "Urutkan tingkatan hierarki organisasi kehidupan dari tingkat mikroskopis terkecil hingga biosfer!",
      kompetensi: "Hierarki Organisasi Kehidupan",
      items: [
        { id: 1, text: "Molekul & Sel" },
        { id: 2, text: "Jaringan & Organ" },
        { id: 3, text: "Individu & Populasi" },
        { id: 4, text: "Komunitas, Ekosistem & Biosfer" }
      ]
    }
  ];

  const englishOrderingPool = [
    {
      text: "Arrange the following generic structure elements of an English Descriptive Text in the correct logical order!",
      kompetensi: "Generic Structure of Descriptive Text",
      items: [
        { id: 1, text: "Title (An engaging headline introducing the subject)" },
        { id: 2, text: "Identification (Introducing the specific person, place, or object to be described)" },
        { id: 3, text: "Description (Detailed elaboration of physical characteristics, qualities, and special features)" },
        { id: 4, text: "Concluding Impression / Evaluation (Final summarizing thought or emotional remark)" }
      ]
    }
  ];

  const indoOrderingPool = [
    {
      text: "Urutkan susunan struktur naskah teks berita berdasar kaidah piramida terbalik dari yang paling penting/utama ke penunjang!",
      kompetensi: "Struktur Piramida Terbalik Teks Berita",
      items: [
        { id: 1, text: "Kepala Berita / Lead (Memuat unsur 5W+1H inti secara padat)" },
        { id: 2, text: "Tubuh Berita (Berisi uraian kronologi detail dan latar belakang)" },
        { id: 3, text: "Ekor Berita (Informasi tambahan penunjang yang kurang penting)" }
      ]
    }
  ];

  const mathOrderingPool = [
    {
      text: "Urutkan nilai dari bilangan berpangkat (eksponen) berikut dari nilai numerik yang terkecil hingga terbesar!",
      kompetensi: "Urutan Nilai Eksponensial",
      items: [
        { id: 1, text: "$2^2$ (Sama dengan 4)" },
        { id: 2, text: "$5^1$ (Sama dengan 5)" },
        { id: 3, text: "$2^3$ (Sama dengan 8)" },
        { id: 4, text: "$3^2$ (Sama dengan 9)" }
      ]
    }
  ];

  const arabicFiqihOrderingPool = [
    {
      text: "Urutkan langkah-langkah fardhu wudhu berikut ini dari awal hingga akhir sesuai kaidah tertib yang sah dalam mazhab Syafi'i!",
      kompetensi: "Urutan Tertib Fardhu Wudhu",
      items: [
        { id: 1, text: "Mengucapkan niat di dalam hati bersamaan dengan membasuh wajah" },
        { id: 2, text: "Membasuh kedua belah tangan beserta siku-sikunya" },
        { id: 3, text: "Mengusap sebagian kecil dari rambut atau kulit kepala" },
        { id: 4, text: "Membasuh kedua kaki beserta kedua mata kaki" }
      ]
    }
  ];

  const fisikaOrderingPool = [
    {
      text: "Urutkan tahapan metode ilmiah dalam penelitian eksperimen fisika laboratorium secara runtut!",
      kompetensi: "Tahapan Metode Ilmiah Fisika",
      items: [
        { id: 1, text: "Merumuskan masalah dan melakukan observasi awal" },
        { id: 2, text: "Menyusun hipotesis dan mengidentifikasi variabel penelitian" },
        { id: 3, text: "Melaksanakan eksperimen serta mengumpulkan data pengukuran" },
        { id: 4, text: "Menganalisis data, menarik kesimpulan, dan mempublikasikan hasil" }
      ]
    }
  ];

  const kimiaOrderingPool = [
    {
      text: "Urutkan perkembangan teori atom dari model paling klasik hingga model mekanika kuantum modern!",
      kompetensi: "Perkembangan Model Atom Kimia",
      items: [
        { id: 1, text: "Model Atom John Dalton (Bola pejal tak terbagi)" },
        { id: 2, text: "Model Atom J.J. Thomson (Roti kismis bertabur elektron)" },
        { id: 3, text: "Model Atom Ernest Rutherford (Inti atom bermuatan positif)" },
        { id: 4, text: "Model Atom Niels Bohr & Mekanika Kuantum (Lintasan stasioner & orbital)" }
      ]
    }
  ];

  const quranHadisOrderingPool = [
    {
      text: "Urutkan tingkatan derajat kualitas hadis nabawi dari yang paling tinggi otentisitasnya hingga yang tidak dapat dijadikan hujjah!",
      kompetensi: "Derajat Kualitas Hadis",
      items: [
        { id: 1, text: "Hadis Shahih (Sanad bersambung, perawi adil dan dhabith, tanpa syadz dan illat)" },
        { id: 2, text: "Hadis Hasan (Memenuhi syarat shahih namun kedhabithan perawi sedikit di bawahnya)" },
        { id: 3, text: "Hadis Dha'if (Hadis lemah yang kehilangan satu atau lebih syarat hadis maqbul)" },
        { id: 4, text: "Hadis Maudhu' (Hadis palsu yang dinisbatkan secara dusta kepada Nabi SAW)" }
      ]
    }
  ];

  const akidahAkhlakOrderingPool = [
    {
      text: "Urutkan tahapan alam ghaib peristiwa Hari Kiamat (Yaumul Akhir) yang akan dilalui manusia secara kronologis!",
      kompetensi: "Kronologi Peristiwa Yaumul Akhir",
      items: [
        { id: 1, text: "Yaumul Ba'ats (Hari Kebangkitan dari alam kubur)" },
        { id: 2, text: "Yaumul Mahsyar (Hari Berkumpul di Padang Mahsyar)" },
        { id: 3, text: "Yaumul Hisab & Mizan (Hari Perhitungan dan Penimbangan Amal)" },
        { id: 4, text: "Yaumul Jaza' (Hari Pembalasan di Surga atau Neraka)" }
      ]
    }
  ];

  const skiOrderingPool = [
    {
      text: "Urutkan urutan masa kepemimpinan Khulafaur Rasyidin pasca-wafatnya Rasulullah SAW secara kronologis!",
      kompetensi: "Kronologi Khulafaur Rasyidin",
      items: [
        { id: 1, text: "Khalifah Abu Bakar ash-Shiddiq RA (632–634 M)" },
        { id: 2, text: "Khalifah Umar bin Khattab RA (634–644 M)" },
        { id: 3, text: "Khalifah Utsman bin Affan RA (644–656 M)" },
        { id: 4, text: "Khalifah Ali bin Abi Thalib RA (656–661 M)" }
      ]
    }
  ];

  const aswajaOrderingPool = [
    {
      text: "Urutkan tahapan historis pembentukan dan pendirian Jam'iyyah Nahdlatul Ulama secara kronologis!",
      kompetensi: "Sejarah Berdirinya Jam'iyyah Nahdlatul Ulama",
      items: [
        { id: 1, text: "Pendirian Nahdlatut Tujjar (Kebangkitan Saudagar 1918)" },
        { id: 2, text: "Pendirian Tashwirul Afkar (Gerakan Diskusi Pemikiran Islam)" },
        { id: 3, text: "Pembentukan Komite Hijaz oleh KH. Hasyim Asy'ari & KH. Wahab Chasbullah" },
        { id: 4, text: "Deklarasi Resmi Berdirinya Nahdlatul Ulama (16 Rajab 1344 H / 31 Januari 1926)" }
      ]
    }
  ];

  const ppknOrderingPool = [
    {
      text: "Urutkan tata urutan hierarki peraturan perundang-undangan di Indonesia dari kedudukan tertinggi hingga peraturan daerah!",
      kompetensi: "Hierarki Peraturan Perundang-undangan RI",
      items: [
        { id: 1, text: "UUD NRI Tahun 1945 & TAP MPR" },
        { id: 2, text: "Undang-Undang (UU) / Perppu" },
        { id: 3, text: "Peraturan Pemerintah (PP) & Peraturan Presiden (Perpres)" },
        { id: 4, text: "Peraturan Daerah Provinsi & Kabupaten/Kota" }
      ]
    }
  ];

  const pjokOrderingPool = [
    {
      text: "Urutkan tahapan pelaksanaan rangkaian gerak lompat jauh gaya menggantung secara runtut!",
      kompetensi: "Rangkaian Gerak Lompat Jauh",
      items: [
        { id: 1, text: "Awalan lari cepat (Approach run)" },
        { id: 2, text: "Tolakan kaki pada papan tumpu (Take-off)" },
        { id: 3, text: "Sikap melayang di udara (Flight phase)" },
        { id: 4, text: "Pendaratan pada bak pasir dengan kedua kaki mengeper (Landing)" }
      ]
    }
  ];

  const seniOrderingPool = [
    {
      text: "Urutkan tahapan proses penciptaan karya seni rupa dua dimensi dari ide hingga karya selesai!",
      kompetensi: "Tahapan Berkarya Seni Rupa",
      items: [
        { id: 1, text: "Eksplorasi gagasan dan pencarian ide inspiratif" },
        { id: 2, text: "Pembuatan sketsa rancangan awal (sketching)" },
        { id: 3, text: "Pewarnaan dan penataan komposisi gelap-terang (rendering)" },
        { id: 4, text: "Finishing dan penyajian/pameran karya" }
      ]
    }
  ];

  const pkwuOrderingPool = [
    {
      text: "Urutkan tahapan perancangan dan pengembangan produk wirausaha dari konsep hingga peluncuran pasar!",
      kompetensi: "Tahapan Pengembangan Produk Usaha",
      items: [
        { id: 1, text: "Riset pasar dan identifikasi kebutuhan konsumen" },
        { id: 2, text: "Perancangan desain prototipe produk" },
        { id: 3, text: "Uji coba fungsi prototipe dan revisi desain" },
        { id: 4, text: "Produksi massal dan pemasaran produk ke pasar sasaran" }
      ]
    }
  ];

  let currentOrderingPool = [
    {
      text: `Urutkan tahapan analisis dan prosedur pemecahan masalah dalam bidang '${mapel}' secara runtut dan sistematis!`,
      kompetensi: `Alur Metodologis & Prosedur Analitis ${mapel}`,
      items: [
        { id: 1, text: "Identifikasi fenomena awal dan perumusan pertanyaan fokus" },
        { id: 2, text: "Pengumpulan bukti faktual, data pendukung, dan landasan teori" },
        { id: 3, text: "Analisis relasi sebab-akibat serta sintesis alternatif solusi" },
        { id: 4, text: "Penyimpulan hasil, verifikasi keabsahan, dan evaluasi dampak" }
      ]
    }
  ];

  if (isJawaSubject) currentOrderingPool = jawaOrderingPool;
  else if (isEnglishSubject) currentOrderingPool = englishOrderingPool;
  else if (isGeoSubject) currentOrderingPool = geoOrderingPool;
  else if (isSosiologiSubject) currentOrderingPool = sosiologiOrderingPool;
  else if (isEkonomiSubject) currentOrderingPool = ekonomiOrderingPool;
  else if (isSejarahSubject) currentOrderingPool = sejarahOrderingPool;
  else if (isBiologiSubject) currentOrderingPool = biologiOrderingPool;
  else if (isFisikaSubject) currentOrderingPool = fisikaOrderingPool;
  else if (isKimiaSubject) currentOrderingPool = kimiaOrderingPool;
  else if (isQuranHadisSubject) currentOrderingPool = quranHadisOrderingPool;
  else if (isAkidahAkhlakSubject) currentOrderingPool = akidahAkhlakOrderingPool;
  else if (isSkiSubject) currentOrderingPool = skiOrderingPool;
  else if (isAswajaSubject) currentOrderingPool = aswajaOrderingPool;
  else if (isPpknSubject) currentOrderingPool = ppknOrderingPool;
  else if (isPjokSubject) currentOrderingPool = pjokOrderingPool;
  else if (isSeniSubject) currentOrderingPool = seniOrderingPool;
  else if (isPkwuSubject) currentOrderingPool = pkwuOrderingPool;
  else if (isInformaticsSubject) currentOrderingPool = informaticsOrderingPool;
  else if (isIndoSubject) currentOrderingPool = indoOrderingPool;
  else if (isMathSubject) currentOrderingPool = mathOrderingPool;
  else if (isArabicSubject || isFiqihSubject) currentOrderingPool = arabicFiqihOrderingPool;

  for (let i = 0; i < orderingCount; i++) {
    const item = currentOrderingPool[i % currentOrderingPool.length];
    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'ordering',
      text: item.text,
      isArabic: isArabicSubject,
      hasLatex: isMathSubject,
      difficulty: 'sedang',
      kompetensiTarget: item.kompetensi,
      orderingItems: item.items.map(t => ({ ...t })),
      rawRightAnswer: 'RIGHT:',
      explanation: "Urutan di atas merupakan alur logis fungsional yang benar."
    });
    num++;
  }

  // ==========================================
  // 5. MATCHING (MENJODOHKAN)
  // ==========================================
  const matchingCount = selectedTypes?.matching ?? 1;
  const informaticsMatchingPool = [
    {
      text: "Jodohkanlah komponen komputer berikut dengan fungsinya yang sesuai secara tepat!",
      kompetensi: "Kecocokan Fungsi Komponen Komputer",
      premises: [
        { id: 1, text: "Processor (CPU)" },
        { id: 2, text: "RAM" },
        { id: 3, text: "SSD / Hard Disk" }
      ],
      responses: [
        { key: "A", text: "Unit pemroses utama yang menjadi 'otak' sistem komputer" },
        { key: "B", text: "Memori penyimpanan kerja sementara yang bersifat volatile" },
        { key: "C", text: "Media penyimpanan data secara permanen berkapasitas besar" }
      ]
    }
  ];

  const jawaMatchingPool = [
    {
      text: "Jodhokna dasanama tembung Basa Jawa ing sisih kiwa karo tegese kang trep ing sisih tengen!",
      kompetensi: "Dasanama Tembung Basa Jawa",
      premises: [
        { id: 1, text: "Surya / Baskara" },
        { id: 2, text: "Tirta / Warih" },
        { id: 3, text: "Bantala / Siti" }
      ],
      responses: [
        { key: "A", text: "Srengenge (Matahari)" },
        { key: "B", text: "Banyu (Air)" },
        { key: "C", text: "Bumi / Lemah (Tanah)" }
      ]
    }
  ];

  const geoMatchingPool = [
    {
      text: "Jodohkan 4 Prinsip Utama Geografi dengan definisi operasionalnya yang tepat!",
      kompetensi: "Kesesuaian Prinsip Geografi",
      premises: [
        { id: 1, text: "Prinsip Distribusi (Persebaran)" },
        { id: 2, text: "Prinsip Interrelasi" },
        { id: 3, text: "Prinsip Deskripsi" }
      ],
      responses: [
        { key: "A", text: "Fenomena geosfer tersebar secara tidak merata di permukaan bumi" },
        { key: "B", text: "Hubungan timbal balik dan saling keterkaitan antarfenomena geosfer" },
        { key: "C", text: "Penjelasan mendalam fenomena geosfer dengan grafik, tabel, dan peta" }
      ]
    }
  ];

  const sosiologiMatchingPool = [
    {
      text: "Jodohkan jenis-jenis norma sosial berikut dengan tingkat kekuatan daya ikat sanksinya!",
      kompetensi: "Klasifikasi Norma Sosial",
      premises: [
        { id: 1, text: "Cara (Usage)" },
        { id: 2, text: "Kebiasaan (Folkways)" },
        { id: 3, text: "Tata Kelakuan (Mores)" }
      ],
      responses: [
        { key: "A", text: "Daya ikat paling lemah, sanksi hanya berupa celaan atau teguran ringan" },
        { key: "B", text: "Perbuatan yang diulang-ulang secara sadar, sanksi berupa sindiran" },
        { key: "C", text: "Aturan pengatur perilaku moral yang mengikat, sanksi tegas dari kelompok" }
      ]
    }
  ];

  const ekonomiMatchingPool = [
    {
      text: "Jodohkan faktor produksi dalam ekonomi dengan imbalan balas jasa yang diterimanya!",
      kompetensi: "Balas Jasa Faktor Produksi",
      premises: [
        { id: 1, text: "Faktor Alam / Tanah (Land)" },
        { id: 2, text: "Faktor Tenaga Kerja (Labor)" },
        { id: 3, text: "Faktor Modal (Capital)" }
      ],
      responses: [
        { key: "A", text: "Sewa (Rent)" },
        { key: "B", text: "Upah / Gaji (Wage)" },
        { key: "C", text: "Bunga Modal (Interest)" }
      ]
    }
  ];

  const sejarahMatchingPool = [
    {
      text: "Jodohkan konsep waktu dalam sejarah berikut dengan pengertian dasarnya!",
      kompetensi: "Konsep Waktu dalam Sejarah",
      premises: [
        { id: 1, text: "Perkembangan (Development)" },
        { id: 2, text: "Kesinambungan (Continuity)" },
        { id: 3, text: "Pengulangan (Repetition)" }
      ],
      responses: [
        { key: "A", text: "Masyarakat bergerak berturut-turut dari bentuk sederhana ke kompleks" },
        { key: "B", text: "Adopsi lembaga atau kebiasaan lama yang diteruskan oleh generasi baru" },
        { key: "C", text: "Fenomena dengan pola serupa yang terjadi kembali pada kurun waktu berbeda" }
      ]
    }
  ];

  const biologiMatchingPool = [
    {
      text: "Jodohkan organel sel berikut dengan fungsi vitalnya di dalam sel hidup!",
      kompetensi: "Fungsi Organel Sel",
      premises: [
        { id: 1, text: "Nukleus (Inti Sel)" },
        { id: 2, text: "Kloroplas" },
        { id: 3, text: "Ribosom" }
      ],
      responses: [
        { key: "A", text: "Pusat pengendali seluruh aktivitas sel dan penyimpan materi genetik DNA" },
        { key: "B", text: "Tempat berlangsungnya fotosintesis menghasilkan glukosa pada tumbuhan" },
        { key: "C", text: "Tempat sintesis pembentukan molekul protein" }
      ]
    }
  ];

  const englishMatchingPool = [
    {
      text: "Match each English environmental / health term with its correct definition!",
      kompetensi: "Environmental Vocabulary Matching",
      premises: [
        { id: 1, text: "Biodiversity" },
        { id: 2, text: "Renewable Energy" },
        { id: 3, text: "Conservation" }
      ],
      responses: [
        { key: "A", text: "The variety of plant and animal life in a particular habitat or the world" },
        { key: "B", text: "Energy derived from natural resources that replenish constantly (solar, wind)" },
        { key: "C", text: "The prevention of wasteful use and protection of natural resources" }
      ]
    }
  ];

  const indoMatchingPool = [
    {
      text: "Jodohkan jenis kalimat dalam teks bertema pangan lokal berikut dengan kategori jenis kalimatnya!",
      kompetensi: "Kecocokan Jenis Kalimat Bahasa Indonesia",
      premises: [
        { id: 1, text: "Berdasarkan rilis Kemenkes, konsumsi sagu memiliki indeks glikemik rendah." },
        { id: 2, text: "Menurut hemat saya, singkong adalah solusi terbaik kedaulatan pangan." },
        { id: 3, text: "Marilah kita bersama-sama beralih mengonsumsi jagung asli nusantara!" }
      ],
      responses: [
        { key: "A", text: "Kalimat Fakta (Sesuai data resmi)" },
        { key: "B", text: "Kalimat Opini (Pendapat subjektif)" },
        { key: "C", text: "Kalimat Persuasi / Ajakan" }
      ]
    }
  ];

  const mathMatchingPool = [
    {
      text: "Jodohkan operasi logaritma berikut dengan hasil numerik yang benar!",
      kompetensi: "Sifat Logaritma Numerik",
      premises: [
        { id: 1, text: "$^2\\log 8$" },
        { id: 2, text: "$^3\\log 81$" },
        { id: 3, text: "$^5\\log 125$" }
      ],
      responses: [
        { key: "A", text: "3 (karena $2^3 = 8$)" },
        { key: "B", text: "4 (karena $3^4 = 81$)" },
        { key: "C", text: "3 (karena $5^3 = 125$)" }
      ]
    }
  ];

  const arabicFiqihMatchingPool = [
    {
      text: "Jodohkanlah istilah bersuci (thaharah) berikut dengan makna teologis/praktisnya yang tepat!",
      kompetensi: "Kecocokan Istilah Thaharah",
      premises: [
        { id: 1, text: "Wudhu" },
        { id: 2, text: "Mandi Wajib" },
        { id: 3, text: "Istinja" }
      ],
      responses: [
        { key: "A", text: "Bersuci dari hadas kecil dengan membasuh anggota tubuh tertentu" },
        { key: "B", text: "Mengalirkan air suci ke seluruh permukaan tubuh untuk hadas besar" },
        { key: "C", text: "Membersihkan tempat keluarnya kotoran dari najis kecil" }
      ]
    }
  ];

  const fisikaMatchingPool = [
    {
      text: "Jodohkan Hukum-Hukum Gerak Newton berikut dengan formulasi/prinsip fisika dasarnya!",
      kompetensi: "Kesesuaian Hukum Newton tentang Gerak",
      premises: [
        { id: 1, text: "Hukum I Newton (Kelembaman / Inersia)" },
        { id: 2, text: "Hukum II Newton (Dinamika Gerak)" },
        { id: 3, text: "Hukum III Newton (Aksi - Reaksi)" }
      ],
      responses: [
        { key: "A", text: "Benda mempertahankan keadaannya ($\Sigma F = 0$)" },
        { key: "B", text: "Percepatan berbanding lurus gaya dan terbalik massa ($\Sigma F = m \cdot a$)" },
        { key: "C", text: "Gaya aksi menimbulkan gaya reaksi sama besar berlawanan arah ($F_{aksi} = -F_{reaksi}$)" }
      ]
    }
  ];

  const kimiaMatchingPool = [
    {
      text: "Jodohkan jenis partikel penyusun subatomik berikut dengan muatan listrik dasarnya!",
      kompetensi: "Partikel Dasar Penyusun Atom",
      premises: [
        { id: 1, text: "Proton" },
        { id: 2, text: "Elektron" },
        { id: 3, text: "Neutron" }
      ],
      responses: [
        { key: "A", text: "Partikel bermuatan positif (+1) di dalam inti atom" },
        { key: "B", text: "Partikel bermuatan negatif (-1) yang mengelilingi inti" },
        { key: "C", text: "Partikel netral (tidak bermuatan) di dalam inti atom" }
      ]
    }
  ];

  const quranHadisMatchingPool = [
    {
      text: "Jodohkan pembagian hukum bacaan Mim Mati (مْ) berikut dengan cara pelafalannya!",
      kompetensi: "Hukum Bacaan Mim Mati",
      premises: [
        { id: 1, text: "Ikhfa Syafawi (Mim sukun bertemu Ba)" },
        { id: 2, text: "Idgham Mimi / Mitslain (Mim sukun bertemu Mim)" },
        { id: 3, text: "Izhar Syafawi (Mim sukun bertemu selain Mim dan Ba)" }
      ],
      responses: [
        { key: "A", text: "Disamarkan di bibir disertai dengung (ghunnah)" },
        { key: "B", text: "Dimasukkan ke huruf mim kedua disertai dengung" },
        { key: "C", text: "Dibaca jelas di bibir tanpa dengung" }
      ]
    }
  ];

  const akidahAkhlakMatchingPool = [
    {
      text: "Jodohkan nama-nama Asmaul Husna berikut dengan arti keagungan Allah SWT!",
      kompetensi: "Asmaul Husna dan Maknanya",
      premises: [
        { id: 1, text: "Al-Karim" },
        { id: 2, text: "Al-Mu'min" },
        { id: 3, text: "Al-Wakil" }
      ],
      responses: [
        { key: "A", text: "Maha Pemurah / Maha Mulia" },
        { key: "B", text: "Maha Pemberi Rasa Aman" },
        { key: "C", text: "Maha Memelihara / Maha Berserah Diri" }
      ]
    }
  ];

  const skiMatchingPool = [
    {
      text: "Jodohkan nama Dinasti Islam abad pertengahan dengan pusat ibu kota pemerintahannya!",
      kompetensi: "Pusat Peradaban Dinasti Islam",
      premises: [
        { id: 1, text: "Dinasti Umayyah" },
        { id: 2, text: "Dinasti Abbasiyah" },
        { id: 3, text: "Dinasti Fatimiyah" }
      ],
      responses: [
        { key: "A", text: "Damaskus (Suriah)" },
        { key: "B", text: "Baghdad (Irak)" },
        { key: "C", text: "Kairo (Mesir)" }
      ]
    }
  ];

  const aswajaMatchingPool = [
    {
      text: "Jodohkan 4 Sikap Kemasyarakatan Nahdlatul Ulama berikut dengan maknanya!",
      kompetensi: "Empat Sikap Kemasyarakatan NU",
      premises: [
        { id: 1, text: "Tawasuth" },
        { id: 2, text: "Tawazun" },
        { id: 3, text: "Tasamuh" }
      ],
      responses: [
        { key: "A", text: "Sikap moderat di jalan tengah dan menghindari ekstremisme" },
        { key: "B", text: "Sikap seimbang dalam segala hal (duniawi & ukhrawi)" },
        { key: "C", text: "Sikap toleran terhadap perbedaan pandangan yang furu'iyah" }
      ]
    }
  ];

  const ppknMatchingPool = [
    {
      text: "Jodohkan pilar pokok Kebangsaan Indonesia berikut dengan kedudukan fungsinya!",
      kompetensi: "Empat Pilar Kebangsaan Indonesia",
      premises: [
        { id: 1, text: "Pancasila" },
        { id: 2, text: "UUD NRI 1945" },
        { id: 3, text: "Bhinneka Tunggal Ika" }
      ],
      responses: [
        { key: "A", text: "Dasar Ideologi dan Falsafah Negara Republik Indonesia" },
        { key: "B", text: "Hukum Dasar Tertulis Konstitusi Negara" },
        { key: "C", text: "Semboyan Pemersatu Keragaman Suku, Agama, dan Budaya" }
      ]
    }
  ];

  const pjokMatchingPool = [
    {
      text: "Jodohkan cabang olahraga atletik berikut dengan nomor perlombaan yang sesuai!",
      kompetensi: "Nomor-Nomor Olahraga Atletik",
      premises: [
        { id: 1, text: "Lari Jarak Pendek (Sprint)" },
        { id: 2, text: "Lompat" },
        { id: 3, text: "Lempar" }
      ],
      responses: [
        { key: "A", text: "Nomor 100 meter, 200 meter, dan 400 meter" },
        { key: "B", text: "Nomor Lompat Jauh, Lompat Tinggi, dan Lompat Jangkit" },
        { key: "C", text: "Nomor Tolak Peluru, Lempar Lembing, dan Lempar Cakram" }
      ]
    }
  ];

  const seniMatchingPool = [
    {
      text: "Jodohkan cabang seni berikut dengan media ekspresi utamanya!",
      kompetensi: "Media Ekspresi Cabang Seni",
      premises: [
        { id: 1, text: "Seni Rupa" },
        { id: 2, text: "Seni Musik" },
        { id: 3, text: "Seni Tari" }
      ],
      responses: [
        { key: "A", text: "Media visual (garis, bidang, bentuk, warna, dan tekstur)" },
        { key: "B", text: "Media auditif (bunyi, nada, ritme, dan melodi)" },
        { key: "C", text: "Media kinestetik (gerak tubuh berirama dan ekspresi wiraga)" }
      ]
    }
  ];

  const pkwuMatchingPool = [
    {
      text: "Jodohkan istilah perencanaan usaha berikut dengan deskripsi tujuannya!",
      kompetensi: "Istilah Perencanaan Usaha PKWU",
      premises: [
        { id: 1, text: "Target Market (Pasar Sasaran)" },
        { id: 2, text: "Unique Selling Proposition (USP)" },
        { id: 3, text: "Cash Flow (Arus Kas)" }
      ],
      responses: [
        { key: "A", text: "Kelompok konsumen spesifik yang menjadi sasaran penjualan produk" },
        { key: "B", text: "Keunggulan unik produk yang membedakannya dari pesaing" },
        { key: "C", text: "Laporan keluar masuknya uang tunai dalam operasional usaha" }
      ]
    }
  ];

  let currentMatchingPool = [
    {
      text: `Jodohkan aspek penting dalam bidang '${mapel}' dengan fokus fungsi dan peranannya!`,
      kompetensi: `Struktur Hubungan Aspek ${mapel}`,
      premises: [
        { id: 1, text: "Dimensi Teoretis & Konseptual" },
        { id: 2, text: "Dimensi Metodologis & Prosedural" },
        { id: 3, text: "Dimensi Aplikatif & Kontekstual" }
      ],
      responses: [
        { key: "A", text: "Pemahaman landasan hukum, prinsip dasar, dan konsep keilmuan" },
        { key: "B", text: "Tata cara, prosedur sistematis, dan langkah kerja pemecahan masalah" },
        { key: "C", text: "Penerapan nyata dalam kehidupan sehari-hari dan pemecahan kasus empiris" }
      ]
    }
  ];

  if (isJawaSubject) currentMatchingPool = jawaMatchingPool;
  else if (isEnglishSubject) currentMatchingPool = englishMatchingPool;
  else if (isGeoSubject) currentMatchingPool = geoMatchingPool;
  else if (isSosiologiSubject) currentMatchingPool = sosiologiMatchingPool;
  else if (isEkonomiSubject) currentMatchingPool = ekonomiMatchingPool;
  else if (isSejarahSubject) currentMatchingPool = sejarahMatchingPool;
  else if (isBiologiSubject) currentMatchingPool = biologiMatchingPool;
  else if (isFisikaSubject) currentMatchingPool = fisikaMatchingPool;
  else if (isKimiaSubject) currentMatchingPool = kimiaMatchingPool;
  else if (isQuranHadisSubject) currentMatchingPool = quranHadisMatchingPool;
  else if (isAkidahAkhlakSubject) currentMatchingPool = akidahAkhlakMatchingPool;
  else if (isSkiSubject) currentMatchingPool = skiMatchingPool;
  else if (isAswajaSubject) currentMatchingPool = aswajaMatchingPool;
  else if (isPpknSubject) currentMatchingPool = ppknMatchingPool;
  else if (isPjokSubject) currentMatchingPool = pjokMatchingPool;
  else if (isSeniSubject) currentMatchingPool = seniMatchingPool;
  else if (isPkwuSubject) currentMatchingPool = pkwuMatchingPool;
  else if (isInformaticsSubject) currentMatchingPool = informaticsMatchingPool;
  else if (isIndoSubject) currentMatchingPool = indoMatchingPool;
  else if (isMathSubject) currentMatchingPool = mathMatchingPool;
  else if (isArabicSubject || isFiqihSubject) currentMatchingPool = arabicFiqihMatchingPool;

  for (let i = 0; i < matchingCount; i++) {
    const item = currentMatchingPool[i % currentMatchingPool.length];
    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'matching',
      text: item.text,
      isArabic: isArabicSubject,
      hasLatex: isMathSubject,
      difficulty: 'sedang',
      kompetensiTarget: item.kompetensi,
      matchingPremises: item.premises.map(p => ({ ...p })),
      matchingResponses: item.responses.map(r => ({ ...r })),
      rawRightAnswer: 'RIGHT:',
      explanation: "Penjodohan di atas divalidasi lurus satu-ke-satu sebagai jawaban yang sah."
    });
    num++;
  }

  // ==========================================
  // 6. ESSAY (SOAL URAIAN / ESAY)
  // ==========================================
  const essayCount = selectedTypes?.essay ?? 1;
  const informaticsEssayPool = [
    {
      text: "Uraikan konsep computational thinking (berpikir komputasional) dan jelaskan secara singkat empat pilar utamanya (Dekomposisi, Pengenalan Pola, Abstraksi, dan Perancangan Algoritma) beserta contoh penerapannya dalam kehidupan sehari-hari!",
      kompetensi: "Penerapan 4 Pilar Computational Thinking",
      ans: "Computational thinking adalah metode pemecahan masalah dengan menerapkan teknik ilmu komputer. 4 pilarnya adalah: 1) Dekomposisi (memecah masalah), 2) Pengenalan Pola (mencari kesamaan), 3) Abstraksi (fokus info penting dan abaikan tidak penting), 4) Algoritma (menyusun langkah solusi). Contoh: membuat resep masakan.",
      rubric: "Skor 90-100 jika menyebutkan 4 pilar lengkap dengan contoh logis. Skor 50-80 jika pilar kurang lengkap."
    },
    {
      text: "Jelaskan perbedaan mendasar antara pencarian berurutan (Sequential Search) dan pencarian biner (Binary Search) dalam sistem algoritma komputer, serta jelaskan syarat mutlak agar Binary Search dapat dilaksanakan!",
      kompetensi: "Perbandingan Algoritma Pencarian",
      ans: "Sequential search membandingkan elemen satu per satu dari awal sampai ketemu (bisa untuk data acak). Binary search membagi dua ruang pencarian secara berulang (hanya bisa jika data SUDAH TERURUT secara menaik/menurun).",
      rubric: "Skor 90-100 jika menerangkan perbedaan dan syarat data terurut secara gamblang."
    }
  ];

  const geoEssayPool = [
    {
      text: "Jelaskan 4 prinsip utama geografi (Prinsip Distribusi, Prinsip Interrelasi, Prinsip Deskripsi, dan Prinsip Korologi) dan berikan masing-masing 1 contoh penerapannya dalam menganalisis fenomena bencana alam (seperti banjir bandang atau tanah longsor) di Indonesia!",
      kompetensi: "Penerapan 4 Prinsip Geografi pada Bencana Alam",
      ans: "1) Distribusi: persebaran lokasi rawan banjir di pulau Jawa. 2) Interrelasi: hubungan antara penggundulan hutan di hulu dengan intensitas sedimentasi dan luapan sungai di hilir. 3) Deskripsi: penyajian data curah hujan dan peta genangan air. 4) Korologi: kajian komprehensif mengintegrasikan lokasi, sebab-akibat, dan dampaknya terhadap masyarakat secara spasial.",
      rubric: "Skor 90-100 jika menguraikan keempat prinsip lengkap dengan contoh aplikatif geosfer yang logis."
    }
  ];

  const sosiologiEssayPool = [
    {
      text: "Jelaskan perbedaan mendasar antara interaksi sosial asosiatif dan interaksi sosial disosiatif, serta berikan masing-masing dua contoh nyata bentuk interaksi tersebut di lingkungan sekolah/madrasah!",
      kompetensi: "Analisis Bentuk Interaksi Sosial",
      ans: "Asosiatif: proses sosial yang mengarah pada kesatuan/kerja sama (contoh: gotong royong membersihkan kelas, musyawarah OSIS). Disosiatif: proses yang mengarah pada perpecahan/pertentangan (contoh: persaingan tidak sehat saat ujian, perselisihan antarkelompok).",
      rubric: "Skor 90-100 jika konsep asosiatif dan disosiatif dijelaskan tepat beserta contoh nyata sekolah."
    }
  ];

  const ekonomiEssayPool = [
    {
      text: "Jelaskan konsep Hukum Permintaan (Law of Demand) dan Hukum Penawaran (Law of Supply), serta gambarkan secara konseptual bagaimana titik keseimbangan pasar (Equilibrium) dapat terbentuk!",
      kompetensi: "Mekanisme Pasar dan Keseimbangan Harga",
      ans: "Hukum Permintaan: jika harga naik maka jumlah permintaan turun (ceteris paribus). Hukum Penawaran: jika harga naik maka jumlah penawaran naik. Titik keseimbangan (equilibrium) tercapai ketika kurva permintaan berpotongan dengan kurva penawaran (jumlah yang diminta sama dengan jumlah yang ditawarkan pada tingkat harga tertentu).",
      rubric: "Skor 90-100 jika hukum permintaan, penawaran, dan titik potong equilibrium diuraikan komprehensif."
    }
  ];

  const sejarahEssayPool = [
    {
      text: "Jelaskan 4 tahapan metodologi penelitian sejarah (Heuristik, Verifikasi/Kritik, Interpretasi, dan Historiografi) serta jelaskan mengapa kritik sumber (eksternal dan internal) sangat penting bagi seorang sejarawan!",
      kompetensi: "Metodologi Penelitian dan Historiografi Sejarah",
      ans: "1) Heuristik: melacak sumber sejarah. 2) Verifikasi/Kritik: menguji keaslian fisik sumber (ekstern) dan kebenaran isi (intern) agar bebas dari hoaks/manipulasi. 3) Interpretasi: menafsirkan keterkaitan fakta. 4) Historiografi: merekonstruksi kisah sejarah dalam karya tulis ilmiah.",
      rubric: "Skor 90-100 jika keempat tahap dijelaskan runtut beserta urgensi kritik sumber."
    }
  ];

  const biologiEssayPool = [
    {
      text: "Jelaskan 3 tingkatan keanekaragaman hayati (Genetik, Spesies, dan Ekosistem) beserta contoh organisme konkretnya yang ada di wilayah kepulauan Indonesia!",
      kompetensi: "Tingkat Keanekaragaman Hayati Indonesia",
      ans: "1) Keanekaragaman Gen: variasi dalam satu spesies (contoh varietas padi Cianjur, Rojolele). 2) Keanekaragaman Spesies: perbedaan antarspesies dalam satu famili (contoh kucing, harimau, singa). 3) Keanekaragaman Ekosistem: variasi habitat (contoh ekosistem hutan hujan tropis Kalimantan, ekosistem terumbu karang Raja Ampat).",
      rubric: "Skor 90-100 jika ketiga tingkatan didefinisikan akurat disertai contoh khas Indonesia."
    }
  ];

  const jawaEssayPool = [
    {
      text: "Andharna kanthi gamblang bedane panganggone Basa Ngoko Lugu, Ngoko Alus, Krama Lugu, lan Krama Alus, banjur gawea tuladha ukara siji-siji nalika matur marang Bapak/Ibu Guru ing lingkungan Madrasah!",
      kompetensi: "Analisis Unggah-Ungguh Basa Jawa",
      ans: "1) Ngoko Lugu: kanggo kanca sapantaran. 2) Ngoko Alus: ngoko kacampur krama kanggo ngurmati kanca akrab. 3) Krama Lugu: basa krama netral. 4) Krama Alus: basa krama kanthi tembung krama inggil kanggo wong tuwa/guru. Tuladha krama alus: 'Nyuwun pangapunten Bapak/Ibu Guru, kula badhe nyuwun pirsa babagan materi punika.'",
      rubric: "Skor 90-100 yen njlentrehake 4 tingkatan unggah-ungguh kanthi tuladha ukara kang trep."
    }
  ];

  const englishEssayPool = [
    {
      text: "Write a short descriptive paragraph (4–6 sentences) describing a natural tourist destination in Indonesia (e.g., Mount Bromo, Karimunjawa, or Raja Ampat). Make sure to include an identification sentence, vivid sensory details (adjectives), and proper simple present tense!",
      kompetensi: "Writing a Short Descriptive Paragraph",
      ans: "Karimunjawa is a captivating tropical paradise located in Central Java. The islands are surrounded by crystal-clear turquoise waters and pristine white sandy beaches. Vibrant coral reefs provide a sanctuary for colorful marine life and majestic sea turtles. Gentle sea breezes and breathtaking sunsets create a truly serene atmosphere. Visiting Karimunjawa is an unforgettable experience for nature lovers.",
      rubric: "Score 90-100 if the paragraph contains clear identification, vivid adjectives, accurate simple present tense, and coherent organization."
    }
  ];

  const indoEssayPool = [
    {
      text: "Jelaskan perbedaan esensial antara kalimat fakta dan kalimat opini yang sering Anda jumpai dalam teks argumentasi, lalu buatlah masing-masing satu contoh kalimat bertema promosi diversifikasi pangan lokal nusantara!",
      kompetensi: "Sintesis Contoh Fakta-Opini",
      ans: "Fakta bersifat objektif, memiliki data riil dan teruji kebenarannya. Contoh: 'Sagu mengandung serat pangan larut yang baik untuk usus'. Opini bersifat subjektif dan berupa saran/keyakinan penulis. Contoh: 'Sagu terasa lebih lezat jika diolah menjadi kudapan modern'.",
      rubric: "Skor 90-100 jika definisi tepat dan contoh relevan pangan lokal."
    }
  ];

  const mathEssayPool = [
    {
      text: "Sebuah komunitas bakteri berkembang biak secara eksponensial mengikuti persamaan fungsional $N(t) = 100 \\cdot 2^{0.5t}$, di mana $t$ adalah waktu dalam satuan jam. Hitunglah jumlah bakteri yang terbentuk setelah $t = 6$ jam dan uraikan langkah penyelesaian matematisnya!",
      kompetensi: "Aplikasi Persamaan Eksponensial Riil",
      ans: "Diketahui $t = 6$. Masukkan ke rumus: $N(6) = 100 \\cdot 2^{0.5(6)} = 100 \\cdot 2^3 = 100 \\cdot 8 = 800$ bakteri.",
      rubric: "Skor 90-100 jika langkah substitusi eksponen ditulis lengkap dan hasil akhir 800 benar."
    }
  ];

  const arabicFiqihEssayPool = [
    {
      text: "Uraikan secara komprehensif perbedaan status hukum bersuci antara air mutlaq (Thahir Muthahhir), air musta'mal, dan air mutanajjis menurut ketentuan fiqih madzhab Syafi'i, serta sebutkan contoh penerapannya!",
      kompetensi: "Analisis Komprehensif Hukum Jenis Air",
      ans: "1) Air Mutlaq: suci zatnya dan mensucikan benda/hadas lain (contoh air sumur, hujan). 2) Air Musta'mal: suci zatnya tetapi sudah bekas wudhu/mandi fardhu sehingga tidak bisa mensucikan lagi. 3) Air Mutanajjis: air kurang dua qullah yang terkena najis atau air banyak yang sifatnya berubah karena najis.",
      rubric: "Skor 90-100 jika penjelasan ketiga jenis air akurat berdasarkan fikih madzhab Syafi'i."
    }
  ];

  const fisikaEssayPool = [
    {
      text: "Sebuah balok bermassa $4\\text{ kg}$ ditarik oleh gaya mendatar sebesar $20\\text{ N}$ di atas lantai kasar dengan koefisien gesek kinetis $\\mu_k = 0.2$ (percepatan gravitasi $g = 10\\text{ m/s}^2$). Hitunglah gaya gesek kinetis yang bekerja pada balok dan tentukan percepatan gerak balok tersebut secara runtut!",
      kompetensi: "Penerapan Hukum II Newton dan Gaya Gesek",
      ans: "1) Gaya normal: $N = m \\cdot g = 4 \\times 10 = 40\\text{ N}$. 2) Gaya gesek kinetis: $f_k = \\mu_k \\cdot N = 0.2 \\times 40 = 8\\text{ N}$. 3) Resultan gaya: $\\Sigma F = F - f_k = 20 - 8 = 12\\text{ N}$. 4) Percepatan: $a = \\frac{\\Sigma F}{m} = \\frac{12}{4} = 3\\text{ m/s}^2$.",
      rubric: "Skor 90-100 jika rumus gaya normal, gaya gesek kinetis 8 N, dan percepatan 3 m/s² diuraikan lengkap."
    }
  ];

  const kimiaEssayPool = [
    {
      text: "Jelaskan perbedaan mendasar antara pembentukan Ikatan Ionik dan Ikatan Kovalen, serta berikan masing-masing 2 contoh rumus kimia senyawa nyata dalam kehidupan sehari-hari!",
      kompetensi: "Analisis Pembentukan Ikatan Kimia",
      ans: "Ikatan Ionik terbentuk akibat serah terima (transfer) elektron dari atom logam ke non-logam sehingga timbul gaya tarik elektrostatik kation-anion (contoh: NaCl / garam dapur, MgCl₂). Ikatan Kovalen terbentuk karena pemakaian bersama pasangan elektron antar atom-atom non-logam (contoh: H₂O / air, CO₂ / karbon dioksida).",
      rubric: "Skor 90-100 jika mekanisme elektron dan 2 contoh senyawa dijelaskan secara akurat."
    }
  ];

  const quranHadisEssayPool = [
    {
      text: "Jelaskan perbedaan karakteristik antara Ayat/Surah Makkiyah dan Ayat/Surah Madaniyah baik dari segi ciri redaksional (uslub), tema pokok bahasan, maupun periode turunnya!",
      kompetensi: "Karakteristik Surah Makkiyah dan Madaniyah",
      ans: "Makkiyah: turun sebelum hijrah, ayatnya pendek dan tegas, banyak seruan 'Yaa Ayyuhan Naas', fokus pada penanaman Tauhid, Akidah, dan kisah umat terdahulu. Madaniyah: turun pasca-hijrah, ayatnya relatif panjang, banyak seruan 'Yaa Ayyuhalladziina Aamanuu', fokus pada hukum syariat, muamalah, tata negara, dan hubungan kemasyarakatan.",
      rubric: "Skor 90-100 jika ciri redaksi, tema materi, dan periode Makkiyah-Madaniyah diuraikan lengkap."
    }
  ];

  const akidahAkhlakEssayPool = [
    {
      text: "Jelaskan makna iman kepada Hari Akhir (Kiamat) dan bagaimana internalisasi keyakinan tersebut dapat membentuk perilaku akhlak terpuji (mahmudah) serta integritas seorang penuntut ilmu dalam kehidupan sehari-hari!",
      kompetensi: "Hikmah dan Internalisasi Iman kepada Hari Akhir",
      ans: "Iman kepada Hari Akhir adalah meyakini sepenuh hati bahwa seluruh alam semesta akan hancur dan manusia akan dibangkitkan untuk mempertanggungjawabkan amal perbuatannya. Internalisasi ini melahirkan kesadaran moral tinggi (muraqabah), menjauhkan dari kecurangan/maksiat, mendorong etos belajar ikhlas, serta senantiasa berbuat adil dan berakhlak mulia.",
      rubric: "Skor 90-100 jika korelasi teologis dan implementasi akhlak harian dijelaskan mendalam."
    }
  ];

  const skiEssayPool = [
    {
      text: "Jelaskan strategi dan substansi dakwah Rasulullah SAW pada periode Makkah (fase sembunyi-sembunyi dan terang-terangan) serta tantangan terbesar yang dihadapi dari kaum kafir Quraisy!",
      kompetensi: "Strategi Dakwah Rasulullah Periode Makkah",
      ans: "Dakwah Sirriyah (sembunyi-sembunyi selama 3 tahun) berpusat di Darul Arqam menyasar keluarga dan sahabat dekat (As-Sabiqunal Awwalun). Dakwah Jahriyah (terang-terangan) dimulai setelah turun QS. Al-Hijr: 94. Tantangan kaum Quraisy meliputi boikot ekonomi-sosial terhadap Bani Hasyim, penyiksaan fisik terhadap budak dan sahabat lemah, serta tuduhan sihir dan penyair gila.",
      rubric: "Skor 90-100 jika tahapan sirriyah, jahriyah, dan bentuk penentangan Quraisy diuraikan runtut."
    }
  ];

  const aswajaEssayPool = [
    {
      text: "Jelaskan 4 pilar Sikap Kemasyarakatan Ahlussunnah wal Jama'ah an-Nahdliyyah (Tawassuth, I'tidal, Tasamuh, dan Tawazun) dan berikan contoh konkret penerapannya dalam kehidupan berbangsa di Indonesia!",
      kompetensi: "Empat Pilar Karakter Aswaja an-Nahdliyyah",
      ans: "1) Tawassuth (moderat/jalan tengah): tidak ekstrem dalam beragama. 2) I'tidal (tegak lurus & adil): menjunjung tinggi keadilan hukum. 3) Tasamuh (toleransi): menghormati perbedaan suku, agama, dan adat. 4) Tawazun (seimbang): menjaga harmoni antara ibadah vertikal (hablum minallah) dan relasi sosial horizontal (hablum minannas) serta cinta tanah air (Hubbul Wathan minal Iman).",
      rubric: "Skor 90-100 jika keempat prinsip didefinisikan tepat disertai contoh nyata kehidupan bermasyarakat."
    }
  ];

  const ppknEssayPool = [
    {
      text: "Jelaskan konsep Wawasan Nusantara sebagai geopolitik bangsa Indonesia, serta uraikan bagaimana penerapan asas Wawasan Nusantara dalam wadah Negara Kesatuan Republik Indonesia (NKRI) di era globalisasi!",
      kompetensi: "Hakikat dan Implementasi Wawasan Nusantara",
      ans: "Wawasan Nusantara adalah cara pandang bangsa Indonesia mengenai diri dan lingkungannya sebagai satu kesatuan utuh wilayah nusantara (ideologi, politik, ekonomi, sosial budaya, dan pertahanan keamanan). Penerapannya mencakup menjaga kedaulatan perbatasan wilayah, memperkuat integrasi nasional di tengah keragaman suku bangsa, serta memprioritaskan kepentingan nasional dalam pergaulan internasional.",
      rubric: "Skor 90-100 jika definisi, kesatuan panca gatra, dan tantangan era global diuraikan secara analitis."
    }
  ];

  const pjokEssayPool = [
    {
      text: "Jelaskan konsep Kebugaran Jasmani (Physical Fitness) beserta komponen utamanya (daya tahan kardiorespirasi, kekuatan otot, kelenturan, dan komposisi tubuh), serta rancang satu program latihan sirkuit (circuit training) sederhana untuk siswa madrasah!",
      kompetensi: "Konsep Kebugaran Jasmani dan Circuit Training",
      ans: "Kebugaran jasmani adalah kesanggupan tubuh melakukan aktivitas tanpa kelelahan berlebih dan masih memiliki cadangan energi. Program Circuit Training: Pos 1 Push-up (kekuatan lengan), Pos 2 Sit-up (kekuatan perut), Pos 3 Shuttle run (kelincahan), Pos 4 Jumping jacks (daya tahan kardio) dilakukan selama 30 detik per pos dengan istirahat 15 detik.",
      rubric: "Skor 90-100 jika konsep komponen kebugaran dan rancangan pos circuit training dijelaskan runtut."
    }
  ];

  const seniEssayPool = [
    {
      text: "Jelaskan prinsip-prinsip penataan komposisi dalam seni rupa (Kesatuan/Unity, Keseimbangan/Balance, Irama/Rhythm, dan Penekanan/Center of Interest) serta bagaimana pengaruhnya terhadap nilai estetis suatu karya!",
      kompetensi: "Prinsip-Prinsip Komposisi Estetika Seni Rupa",
      ans: "1) Kesatuan (Unity): perpaduan harmonis antarunsur rupa sehingga tidak tampak terpisah. 2) Keseimbangan (Balance): kesetaraan bobot visual simetris maupun asimetris. 3) Irama (Rhythm): pengulangan unsur secara teratur yang menghasilkan kesan gerak. 4) Penekanan (Center of Interest): titik fokus utama yang pertama kali menarik perhatian pengamat karya seni.",
      rubric: "Skor 90-100 jika keempat prinsip komposisi dijelaskan mendalam beserta peran estetisnya."
    }
  ];

  const pkwuEssayPool = [
    {
      text: "Jelaskan pengertian analisis Break Even Point (BEP) dalam kewirausahaan, sebutkan komponen rumus BEP Unit dan BEP Rupiah (Fixed Cost, Variable Cost, Price), serta jelaskan manfaat perhitungan BEP bagi kelangsungan usaha rintisan!",
      kompetensi: "Analisis dan Perhitungan Break Even Point (BEP)",
      ans: "BEP adalah titik impas kondisi di mana penerimaan total sama dengan biaya total. Rumus BEP Unit = $\\frac{\\text{Fixed Cost}}{\\text{Price} - \\text{Variable Cost}}$. Rumus BEP Rupiah = $\\frac{\\text{Fixed Cost}}{1 - (\\text{Variable Cost}/\\text{Price})}$. Manfaat BEP: menentukan target penjualan minimum, mengendalikan biaya operasional, dan merencanakan margin laba yang ingin dicapai.",
      rubric: "Skor 90-100 jika konsep, rumus FC/VC/Price, dan manfaat manajerial BEP diuraikan tepat."
    }
  ];

  let currentEssayPool = [
    {
      text: `Jelaskan konsep dasar, prinsip kerja ilmiah, dan tantangan implementasi dalam materi '${mapel}' kelas ${kelas}, serta berikan alternatif solusi terukur berbasis bukti faktual!`,
      kompetensi: `Sintesis Komprehensif & Pemecahan Masalah ${mapel}`,
      ans: `Pemahaman mendalam mengenai ${mapel} mencakup analisis teoritis terhadap konsep fundamental, verifikasi melalui data empiris, serta penerapan solusi analitis yang dapat dipertanggungjawabkan secara ilmiah.`,
      rubric: "Skor 90-100 jika mampu menjelaskan konsep teoritis, problem analitis, dan rekomendasi solusi sistematis."
    }
  ];

  if (isJawaSubject) currentEssayPool = jawaEssayPool;
  else if (isEnglishSubject) currentEssayPool = englishEssayPool;
  else if (isGeoSubject) currentEssayPool = geoEssayPool;
  else if (isSosiologiSubject) currentEssayPool = sosiologiEssayPool;
  else if (isEkonomiSubject) currentEssayPool = ekonomiEssayPool;
  else if (isSejarahSubject) currentEssayPool = sejarahEssayPool;
  else if (isBiologiSubject) currentEssayPool = biologiEssayPool;
  else if (isFisikaSubject) currentEssayPool = fisikaEssayPool;
  else if (isKimiaSubject) currentEssayPool = kimiaEssayPool;
  else if (isQuranHadisSubject) currentEssayPool = quranHadisEssayPool;
  else if (isAkidahAkhlakSubject) currentEssayPool = akidahAkhlakEssayPool;
  else if (isSkiSubject) currentEssayPool = skiEssayPool;
  else if (isAswajaSubject) currentEssayPool = aswajaEssayPool;
  else if (isPpknSubject) currentEssayPool = ppknEssayPool;
  else if (isPjokSubject) currentEssayPool = pjokEssayPool;
  else if (isSeniSubject) currentEssayPool = seniEssayPool;
  else if (isPkwuSubject) currentEssayPool = pkwuEssayPool;
  else if (isInformaticsSubject) currentEssayPool = informaticsEssayPool;
  else if (isIndoSubject) currentEssayPool = indoEssayPool;
  else if (isMathSubject) currentEssayPool = mathEssayPool;
  else if (isArabicSubject || isFiqihSubject) currentEssayPool = arabicFiqihEssayPool;

  for (let i = 0; i < essayCount; i++) {
    const item = currentEssayPool[i % currentEssayPool.length];
    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'essay',
      text: item.text,
      isArabic: isArabicSubject,
      hasLatex: isMathSubject,
      difficulty: 'sulit',
      kompetensiTarget: item.kompetensi,
      rawRightAnswer: '',
      essaySampleAnswer: item.ans,
      essayRubric: [
        { scoreRange: '80-100', criteria: item.rubric || 'Penjelasan lengkap, tepat, sistematis dan memiliki argumentasi logis.' },
        { scoreRange: '50-79', criteria: 'Penjelasan kurang lengkap atau beberapa argumen kurang konsisten.' }
      ]
    });
    num++;
  }

  return questions;
}

// Fallback logic for Admin Documents
function generateFallbackAdminDoc(
  docType: string,
  mapel: string,
  fase: string,
  kelas: string,
  semester: string,
  tahunPelajaran: string,
  topikMateri: string,
  guruPengampu: string,
  nipGuru?: string,
  kepalaMadrasah?: string,
  nipKepala?: string,
  alokasiWaktu?: string,
  capaianPembelajaranTeks?: string,
  instruksiKhusus?: string,
  karakteristikPesertaDidik?: string,
  dimensiProfilLulusan?: string[],
  jumlahPertemuan?: string,
  jamPerPertemuan?: string,
  modelPembelajaran?: string,
  jenisAsesmen?: string[]
) {
  if (docType === 'rpp') {
    const jpPtm = jamPerPertemuan || '2 JP (2 x 45 menit)';
    const jmlPtm = jumlahPertemuan || '2 Pertemuan';
    const totalJp = alokasiWaktu || '4 JP';
    const model = modelPembelajaran || 'Problem Based Learning (PBL)';
    const dimensiList = Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length > 0
      ? dimensiProfilLulusan.join(', ')
      : 'Beriman, Bertakwa kepada Tuhan YME & Berakhlak Mulia, Bernalar Kritis, Mandiri, Bergotong Royong, Berkeadaban (Ta\'addub)';
    const asesmenList = Array.isArray(jenisAsesmen) && jenisAsesmen.length > 0
      ? jenisAsesmen.join(', ')
      : 'Asesmen Diagnostik (Awal), Asesmen Formatif (Proses & LKPD), Asesmen Sumatif (Akhir TP)';
    const karakteristik = karakteristikPesertaDidik || 'Kemampuan awal heterogen, kecenderungan gaya belajar visual dan kinestetik, santun dan aktif dalam berdiskusi kelompok.';

    return `# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Penyusunan Berdasarkan Panduan Pembelajaran dan Asesmen BSKAP Kemendikbudristek & KMA 347/450 Kemenag RI*

---

### I. ANALISIS KESIAPAN & KARAKTERISTIK PESERTA DIDIK
- **Karakteristik & Gaya Belajar :** ${karakteristik}
- **Penerapan Diferensiasi Pembelajaran :**
  - **Diferensiasi Konten :** Guru menyajikan materi dalam format modul ajar teks ringkas, tayangan salindia/video infografis, dan studi kasus nyata di lingkungan sekitar.
  - **Diferensiasi Proses :** Peserta didik dikelompokkan secara heterogen dengan scaffolding; siswa yang membutuhkan bimbingan lebih mendapatkan bimbingan terbimbing, sedangkan siswa dengan kesiapan mahir diarahkan menjadi tutor sebaya.
  - **Diferensiasi Produk :** Peserta didik diberikan kebebasan memilih bentuk penyajian laporan hasil penugasan (peta konsep visual, resume tertulis terstruktur, atau presentasi lisan singkat).

---

### II. KOMPONEN INTI PEMBELAJARAN
#### 1. Capaian Pembelajaran (CP) Acuan
${capaianPembelajaranTeks || `Pada akhir Fase ${fase}, peserta didik memiliki kemampuan menganalisis, mengonstruksi, dan menerapkan konsep materi ${mapel} dengan penalaran logis, mandiri, berkarakter santun, serta mengamalkan nilai-nilai Aswaja An-Nahdliyah.`}

#### 2. Tujuan Pembelajaran (TP)
1. Peserta didik mampu menjelaskan konsep dasar dan urgensi materi **${topikMateri}** secara komprehensif melalui kajian literatur dan diskusi santun.
2. Peserta didik mampu menganalisis permasalahan kontekstual terkait **${topikMateri}** dengan bernalar kritis dan teliti.
3. Peserta didik mampu merumuskan solusi dan mempresentasikan karya/kesimpulan kelompok dengan adab komunikasi yang baik dan penuh percaya diri.

#### 3. Indikator Ketercapaian Tujuan Pembelajaran (IKTP)
- Menyebutkan dan mengklasifikasikan istilah dan prinsip pokok materi dengan benar (akurasi minimal 75%).
- Menemukan korelasi antara konsep teori dengan problematika kontekstual yang dihadapi.
- Mengomunikasikan kesimpulan pemecahan masalah dengan bahasa yang santun, logis, dan argumentatif.

#### 4. Penguatan Deep Learning & Nilai Kurikulum Berbasis Cinta (KBC)
- **Mindful Learning :** Mengajak peserta didik memfokuskan niat thalabul ilmi semata-mata mengharap ridha Allah SWT dan menghargai anugerah akal budi.
- **Meaningful Learning :** Menghubungkan setiap konsep ke dalam implementasi kehidupan sehari-hari siswa di madrasah dan masyarakat.
- **Joyful Learning :** Menciptakan suasana belajar yang hangat, ramah anak, dialogis, apresiatif, dan tanpa kecemasan.
- **Dimensi Profil Lulusan :** ${dimensiList}.

---

### III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN

#### PERTEMUAN 1: Eksplorasi Konsep & Orientasi Masalah (${jpPtm})

| Tahap Kegiatan | Rincian Aktivitas Guru dan Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Guru mengucapkan salam hangat penuh kasih sayang, membimbing doa pembuka, dan mengajak tadarus Al-Qur'an singkat.<br>2. Melakukan mindfulness breathing (30 detik) untuk memusatkan konsentrasi santri.<br>3. Mengecek kehadiran dan kesiapan belajar dengan menyapa keadaan peserta didik (Prinsip KBC: Welcoming with Love).<br>4. Apersepsi: Guru mengaitkan pengalaman nyata santri dengan materi **${topikMateri}**.<br>5. Menyampaikan Tujuan Pembelajaran dan alur KBM yang akan dilaksanakan. | 15 Menit |
| **Kegiatan Inti**<br>*(Sintaks ${model})* | **Fase 1: Orientasi Siswa pada Masalah**<br>- Guru menyajikan stimulus berupa artikel kontekstual/video studi kasus mengenai tantangan nyata pada topik ${topikMateri}.<br>- Peserta didik mencermati tayangan dan mengajukan pertanyaan kritis.<br><br>**Fase 2: Mengorganisasi Peserta Didik untuk Belajar**<br>- Peserta didik dibagi ke dalam 4-5 kelompok kecil berdasarkan gaya belajar dan heterogenitas kemampuan.<br>- Guru membagikan LKPD (Lembar Kerja Peserta Didik) berbasis diferensiasi konten.<br><br>**Fase 3: Membimbing Penyelidikan Mandiri dan Kelompok**<br>- Peserta didik berkolaborasi mengumpulkan data, membaca literatur rujukan, dan berdiskusi dengan adab saling menghargai.<br>- Guru berkeliling memberikan scaffolding (bimbingan afektif dan kognitif) sesuai kesiapan masing-masing kelompok. | 60 Menit |
| **Penutup** | 1. Peserta didik bersama guru menyimpulkan poin-poin utama materi yang telah dipelajari.<br>2. Guru dan siswa melakukan refleksi singkat: *"Hal baru apa yang paling berkesan dan bermanfaat dari pertemuan ini?"*<br>3. Guru memberikan apresiasi atas dedikasi dan adab santri selama pembelajaran.<br>4. Menyampaikan gambaran agenda pertemuan kedua.<br>5. Doa penutup majelis dan salam penutup. | 15 Menit |

---

#### PERTEMUAN 2: Elaborasi, Karya Nyata, dan Asesmen Ketercapaian (${jpPtm})

| Tahap Kegiatan | Rincian Aktivitas Guru dan Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Membuka KBM dengan salam, doa bersama, dan pembacaan shalawat/asmaul husna.<br>2. Menanyakan tindak lanjut dan persiapan hasil kerja kelompok dari pertemuan sebelumnya.<br>3. Ice breaking edukatif ringan untuk membangkitkan suasana joyful learning. | 10 Menit |
| **Kegiatan Inti**<br>*(Sintaks ${model})* | **Fase 4: Mengembangkan dan Menyajikan Hasil Karya**<br>- Setiap kelompok menyusun dan merapikan produk laporan/peta konsep hasil penyelidikan masalah ${topikMateri}.<br>- Kelompok mempresentasikan hasil diskusi secara bergiliran.<br>- Kelompok lain menyimak dengan adab santun dan memberikan tanggapan konstruktif.<br><br>**Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah**<br>- Guru memfasilitasi klarifikasi konseptual, memberi penguatan pada bagian yang esensial, dan meluruskan miskonsepsi.<br>- Peserta didik mengerjakan asesmen formatif akhir TP untuk mengukur pemahaman individu. | 65 Menit |
| **Penutup** | 1. Refleksi bermakna mengenai aplikasi nilai adab dan kasih sayang dalam kehidupan nyata.<br>2. Guru memberikan umpan balik menyeluruh terhadap performa kelompok.<br>3. Menutup pembelajaran dengan doa bersama dan salam. | 15 Menit |

---

### IV. RANCANGAN ASESMEN PEMBELAJARAN
- **Jenis Asesmen yang Diterapkan :** ${asesmenList}

#### 1. Asesmen Diagnostik (Awal Pembelajaran)
- **Teknik :** Tanya jawab interaktif lisan dan kuesioner singkat kesiapan belajar.
- **Instrumen :** 3 butir pertanyaan pemantik terkait konsep prasyarat materi ${topikMateri}.

#### 2. Asesmen Formatif (Selama Proses KBM)
- **Teknik :** Observasi sikap/adab thalabul ilmi dan lembar unjuk kerja LKPD kelompok.
- **Rubrik Penilaian Sikap & Adab KBC:**
  | Dimensi Karakter | Indikator Teramati | Skor (1-4) |
  |---|---|:---:|
  | Kasih Sayang (Rahmah) | Membantu rekan kelompok yang kesulitan, tutur kata santun | 4 |
  | Adab Menuntut Ilmu | Memperhatikan penjelasan, tidak menyela, menjaga sopan santun | 4 |
  | Nalar Kritis & Tanggung Jawab | Mengemukakan argumen logis, menyelesaikan tugas tepat waktu | 4 |

#### 3. Asesmen Sumatif (Akhir TP)
- **Teknik :** Tes tertulis uraian kontekstual / lembar penilaian produk karya.
- **Kriteria Ketercapaian Tujuan Pembelajaran (KKTP):**
  | Interval Nilai | Kategori Ketercapaian | Tindak Lanjut |
  |:---:|:---:|:---|
  | 0 - 65% | Perlu Bimbingan | Remedial pendampingan individual pada indikator yang belum tuntas |
  | 66% - 75% | Cukup | Remedial mandiri melalui resume dan latihan terbimbing |
  | 76% - 85% | Baik | Telah tuntas, melanjutkan materi pengayaan reguler |
  | 86% - 100% | Sangat Baik | Pengayaan berupa studi kasus mandiri tingkat lanjut atau tutor sebaya |`;
  }

  if (docType === 'presensi_kbm') {
    return `# PRESENSI HARIAN SISWA KBM
**MA NU 01 BANYUPUTIH**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | TA: ${tahunPelajaran}*

---

### INFORMASI KEGIATAN BELAJAR MENGAJAR (KBM)
- **Hari & Tanggal :** Senin, 21 September 2026
- **Mata Pelajaran :** ${mapel}
- **Kelas / Fase :** ${kelas} / Fase ${fase}
- **Semester :** Semester ${semester}
- **Materi Pokok :** ${topikMateri}
- **Guru Pengampu :** ${guruPengampu}

---

### DAFTAR PRESENSI PESERTA DIDIK KELAS ${kelas}

| No | NISN | Nama Peserta Didik | L/P | Status Kehadiran | Catatan Karakter & Keaktifan (KBC) |
|:---:|:---:|:---|:---:|:---:|:---|
| 1 | 0087421101 | Ahmad Fadlil Maulana | L | **Hadir** | Antusias dan aktif berdiskusi |
| 2 | 0087421102 | Aisyah Nur Kamila | P | **Hadir** | Mampu menjawab pemantik lisan dengan santun |
| 3 | 0087421103 | Bagas Dwi Prasetyo | L | **Hadir** | Kerja sama kelompok sangat baik |
| 4 | 0087421104 | Dina Khoirunnisa | P | **Sakit** | Izin sakit surat dokter terlampir |
| 5 | 0087421105 | Farhan Maulana Malik | L | **Hadir** | Memimpin doa pembuka dengan khusyuk |
| 6 | 0087421106 | Fatimatuz Zahra | P | **Hadir** | Catatan LKPD rapi dan runtut |
| 7 | 0087421107 | Ilham Syarif Hidayat | L | **Izin** | Dispensasi kegiatan olimpiade madrasah |
| 8 | 0087421108 | Khusnul Khotimah | P | **Hadir** | Menunjukkan adab santun dan sopan |
| 9 | 0087421109 | M. Rizqi Firmansyah | L | **Hadir** | Mengikuti mindful learning dengan tertib |
| 10 | 0087421110 | Nabila Ayu Lestari | P | **Hadir** | Kreatif dalam menyusun simpulan materi |

---

### REKAPITULASI KEHADIRAN KBM
- **Total Siswa :** 10 Siswa
- **Hadir (H) :** 8 Siswa (80%)
- **Sakit (S) :** 1 Siswa (10%)
- **Izin (I) :** 1 Siswa (10%)
- **Alpa (A) :** 0 Siswa (0%)

---

### JURNAL REFLEKSI GURU (DEEP LEARNING & KBC)
1. **Pencapaian Pembelajaran:** Peserta didik mampu memahami konsep esensial materi ${topikMateri} melalui pendekatan mindful dan joyful learning.
2. **Karakter Kasih Sayang & Adab:** Interaksi antarpeserta didik berlangsung santun, saling menghargai pendapat, dan tidak ada diskriminasi.
3. **Tindak Lanjut:** Melakukan penguatan bagi siswa yang memerlukan pendampingan khusus pada pertemuan berikutnya.`;
  }

  if (docType === 'prota' || docType === 'prota_prosem') {
    return `# PROGRAM TAHUNAN KURIKULUM MERDEKA
**MA NU 01 BANYUPUTIH**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | TA: ${tahunPelajaran}*

---

### A. CAPAIAN PEMBELAJARAN FASE ${fase}
Pada akhir Fase ${fase}, peserta didik mampu menginterpretasi, mengaitkan, membandingkan pemahaman konsep dasar dan keterampilan aplikatif mata pelajaran ${mapel} sebagai pengetahuan dasar untuk memecahkan persoalan kontekstual secara individu ataupun kelompok sebagai wujud aktualisasi diri.

---

### B. ELEMEN CAPAIAN PEMBELAJARAN

| ELEMEN | CAPAIAN PEMBELAJARAN |
|---|---|
| **Mengalami (Experiencing)** | Peserta didik menginterpretasi dan mengaitkan konsep utama pada materi ${mapel} dalam kehidupan sehari-hari. |
| **Merefleksikan (Reflecting)** | Peserta didik membandingkan konsep dasar dengan mengapresiasi keragaman pandangan serta membuat ide-ide baru ke dalam karyanya. |
| **Berpikir & Bekerja Kritis (Thinking and Working)** | Peserta didik merancang dan menunjukkan hasil analisis ${mapel} secara individu maupun berkelompok. |
| **Menciptakan (Creating)** | Peserta didik merancang dan menghasilkan produk/karya aplikatif berdasarkan konsep materi yang dipelajari. |
| **Berdampak (Impacting)** | Peserta didik mengaktualisasikan diri dan menginternalisasi nilai adab serta akhlak mulia dalam bermasyarakat. |

---

### C. PROGRAM TAHUNAN TAHUN PELAJARAN ${tahunPelajaran}

#### DISTRIBUSI SEMESTER I (GANJIL)
- **Mata Pelajaran :** ${mapel}
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** ${tahunPelajaran}
- **Fase & Kelas / Semester :** Fase ${fase}, Kelas ${kelas} / I (Ganjil)

| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 1** | Landasan & Konsep Pokok ${mapel} | 1. Pengertian dan Ruang Lingkup<br>2. Nilai Dasar dan Karakteristik<br>3. Hubungan Konseptual & Konteks | 1. Peserta didik mampu menginterpretasi dan mengaitkan konsep pokok ${mapel} secara mendalam.<br>2. Peserta didik mampu menyajikan hasil telaah konsep secara sistematis. | **10 JP** |
| **Unit 2** | Aplikasi & Eksplorasi Kontekstual | 1. Identifikasi Studi Kasus Nyata<br>2. Analisis Kritis Masalah Kontekstual<br>3. Perumusan Solusi & Ide Kreatif | 1. Peserta didik mampu membandingkan berbagai pendekatan pemecahan masalah serta membuat alternatif gagasan.<br>2. Peserta didik mampu mempresentasikan analisis kontekstual secara kolaboratif. | **9 JP** |
| **JUMLAH** | | | | **19 JP** |

---

#### DISTRIBUSI SEMESTER II (GENAP)
- **Mata Pelajaran :** ${mapel}
- **Satuan Pendidikan :** MA NU 01 Banyuputih
- **Tahun Pelajaran :** ${tahunPelajaran}
- **Fase & Kelas / Semester :** Fase ${fase}, Kelas ${kelas} / II (Genap)

| Unit | Materi Pokok | Sub Materi | Alur Tujuan Pembelajaran | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 3** | Kolaborasi Proyek & Kreasi Aplikatif | 1. Menemukan Ide atau Gagasan Proyek<br>2. Perencanaan Proyek Individu & Kelompok<br>3. Eksplorasi & Pelaksanaan Proyek<br>4. Uji Coba & Penyempurnaan Karya<br>5. Evaluasi Kinerja dan Refleksi | 1. Peserta didik mampu merancang hasil karya/proyek aplikatif ${mapel} secara individu maupun kelompok.<br>2. Peserta didik mampu menampilkan dan mengevaluasi hasil proyek berbasis umpan balik rekan sejawat. | **17 JP** |
| **JUMLAH** | | | | **17 JP** |

---

### REKAPITULASI TOTAL ALOKASI WAKTU TAHUNAN
- **Alokasi Semester I (Ganjil) :** 19 JP
- **Alokasi Semester II (Genap) :** 17 JP
- **TOTAL KESELURUHAN 1 TAHUN PELAJARAN :** 36 JP
`;
  }

  if (docType === 'prosem') {
    const isSemester2 = semester === '2';
    const semName = isSemester2 ? 'II (Genap)' : 'I (Ganjil)';
    return `<div style="background-color: #65a30d; color: white; padding: 10px 14px; text-align: center; border-radius: 4px; font-weight: bold; margin-bottom: 14px;">
  <div style="font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">PROGRAM SEMESTER KURIKULUM MERDEKA</div>
  <div style="font-size: 13px; text-transform: uppercase; margin-top: 2px;">${mapel.toUpperCase()} FASE ${fase} KELAS ${kelas}</div>
</div>

<div style="font-size: 11px; margin-bottom: 14px; line-height: 1.6; font-weight: 500;">
  <table style="border: none; border-collapse: collapse; width: 100%; max-width: 480px;">
    <tr><td style="border:none; padding: 1px 0; width: 170px; font-weight: 600;">Mata Pelajaran</td><td style="border:none; padding: 1px 0;">: ${mapel}</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Satuan Pendidikan</td><td style="border:none; padding: 1px 0;">: MA NU 01 Banyuputih</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Tahun Pelajaran</td><td style="border:none; padding: 1px 0;">: ${tahunPelajaran}</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Fase &amp; Kelas/Semester</td><td style="border:none; padding: 1px 0;">: ${kelas} / ${semName}</td></tr>
  </table>
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #1e293b;">
  <thead>
    <tr style="background-color: #f8fafc;">
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 4px; width: 110px; text-align: center; font-weight: bold;">BAB</th>
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 6px; width: 230px; text-align: center; font-weight: bold;">Alur dan Tujuan Pembelajaran</th>
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 4px; width: 55px; text-align: center; font-weight: bold;">Alokasi Waktu</th>
      <th colspan="4" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'Januari' : 'Juli'}</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'Februari' : 'Agustus'}</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'Maret' : 'September'}</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'April' : 'Oktober'}</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'Mei' : 'November'}</th>
      <th colspan="5" style="border: 1px solid #1e293b; padding: 4px; text-align: center; font-weight: bold;">${isSemester2 ? 'Juni' : 'Desember'}</th>
    </tr>
    <tr style="background-color: #f1f5f9; font-size: 8.5px;">
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">1</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">2</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">3</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">4</th>
      <th style="border: 1px solid #1e293b; width: 18px; text-align: center;">5</th>
    </tr>
  </thead>
  <tbody>
    <!-- BAB 1 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 1 Pendalaman Konsep Pokok ${mapel}</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">1. Peserta didik mampu menginterpretasi dan mengaitkan konsep utama pada materi ${mapel} dalam kehidupan nyata.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Semester' : 'Libur Akhir Tahun'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Semester' : 'Libur Akhir Tahun'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Awal KBM' : 'Kegiatan Peserta didik'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Awal KBM' : 'Kegiatan Peserta didik'}</div>
      </td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8.5px; font-weight: bold; margin: auto;">ASTS</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8.5px; font-weight: bold; margin: auto;">ASTS</div>
      </td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">${isSemester2 ? 'Asesmen Sumatif Akhir Tahun' : 'Asesmen Sumatif Akhir Semester'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">${isSemester2 ? 'Asesmen Sumatif Akhir Tahun' : 'Asesmen Sumatif Akhir Semester'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Pengolahan Nilai & Raport</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Akhir TP' : 'Libur Akhir Semester Gasal'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Akhir TP' : 'Libur Akhir Semester Gasal'}</div>
      </td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">2. Peserta didik mampu menyajikan telaah kritis materi ${mapel} berbasis dalil dan argumentasi ilmiah.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>

    <!-- BAB 2 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 2 Aplikasi &amp; Eksplorasi Kontekstual</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu membandingkan metode analisis untuk menyelesaikan masalah kontekstual.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu menginternalisasi nilai adab, kolaborasi, dan tanggung jawab sosial.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>

    <!-- BAB 3 -->
    <tr>
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 3 Proyek Kreasi &amp; Pemecahan Masalah</td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu merancang karya inovatif berbasis konsep ${mapel} secara kolaboratif.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">10 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
    </tr>
    <tr>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">&bull; Peserta didik mampu menampilkan dan mengevaluasi hasil proyek berbasis umpan balik rekan dan guru.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">10 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center;"></td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center; font-weight: bold;">2</td>
    </tr>

    <!-- ROW TOTAL -->
    <tr style="background-color: #fef08a; font-weight: bold; border-top: 2px solid #1e293b;">
      <td colspan="2" style="border: 1px solid #1e293b; padding: 6px; text-align: center; font-weight: bold;">TOTAL</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; font-weight: bold;">36 JP</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">2</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
      <td style="border: 1px solid #1e293b; text-align: center;">0</td>
    </tr>
  </tbody>
</table>`;
  }

  if (docType === 'kktp') {
    return `# KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

---

### TABEL RUBRIK INTERVAL KRITERIA KETERCAPAIAN

| Tujuan Pembelajaran (TP) | Indikator Ketercapaian | Baru Berkembang (0-60%) | Layak (61-75%) | Cakap (76-85%) | Mahir (86-100%) |
|---|---|---|---|---|---|
| Menganalisis konsep utama ${topikMateri} | Menjelaskan definisi dan ruang lingkup secara sistematis | Belum mampu mendefinisikan dengan tepat | Menjelaskan definisi dengan bantuan bimbingan guru | Menjelaskan secara mandiri dan runtut | Mampu menjelaskan serta mengaitkan dengan contoh analogis |
| Menginternalisasi Nilai KBC & Adab | Menunjukkan sikap saling menyayangi, toleran, dan santun saat berdiskusi | Pasif dan kurang memperhatikan adab rekan | Mulai menunjukkan sikap menghargai | Konsisten menunjukkan adab santun dan empati | Menjadi teladan (qudwah hasanah) dalam adab madrasah |
| Memecahkan Persoalan Nyata | Mampu menyelesaikan studi kasus aplikatif ${mapel} | Belum menemukan solusi | Menemukan solusi sebagian | Solusi tepat dan logis | Solusi kreatif, inovatif, dan berwawasan kemaslahatan |

**Catatan Tindak Lanjut:**
- 0 - 60%: Remedial di seluruh bagian materi dengan bimbingan tutor sebaya.
- 61 - 75%: Remedial pada indikator yang belum tuntas.
- 76 - 85%: Sudah mencapai ketuntasan, melanjutkan materi berikutnya.
- 86 - 100%: Diberikan program pengayaan dan studi literatur Bahtsul Masail/Karya Ilmiah.`;
  }

  if (docType === 'umpan_balik') {
    return `# INSTRUMEN SURVEI UMPAN BALIK PEMBELAJARAN SISWA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

**Pengantar:**  
Angket ini bertujuan untuk meningkatkan mutu pembelajaran ${mapel} bersama Guru Pengampu (${guruPengampu}). Isilah dengan jujur, obyektif, dan penuh kasih sayang. Identitas responden dijamin kerahasiaannya.

---

### A. ASPEK PENILAIAN PEMBELAJARAN (Skala 1 - 4)
*Keterangan: 1 = Sangat Kurang | 2 = Cukup | 3 = Baik | 4 = Sangat Memuaskan*

| No | Pernyataan Instrumen Umpan Balik | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| 1 | Guru menyampaikan materi dengan jelas, runtut, dan mudah dipahami. | [ ] | [ ] | [ ] | [ ] |
| 2 | Guru selalu menyapa dengan senyuman dan menciptakan suasana kelas yang menyenangkan (Kurikulum Berbasis Cinta). | [ ] | [ ] | [ ] | [ ] |
| 3 | Guru memberi kesempatan bertanya dan menghargai pendapat setiap siswa tanpa membeda-bedakan. | [ ] | [ ] | [ ] | [ ] |
| 4 | Penggunaan media (LCD, modul, simulasi) membantu pemahaman saya secara mendalam (Deep Learning). | [ ] | [ ] | [ ] | [ ] |
| 5 | Guru memberikan umpan balik dan dorongan semangat saat saya mengalami kesulitan belajar. | [ ] | [ ] | [ ] | [ ] |

---

### B. PERTANYAAN TERBUKA & REFLEKSI SISWA
1. **Hal apa yang paling kamu sukai dari cara mengajar guru pada materi ini?**  
   ...........................................................................................................................................................
2. **Saran atau masukan apa yang ingin kamu sampaikan agar kelas kita semakin asyik dan berkah?**  
   ...........................................................................................................................................................`;
  }

  if (docType === 'modul_ajar') {
    return `# MODUL AJAR ${mapel.toUpperCase()}
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

---

## A. IDENTIFIKASI KESIAPAN PESERTA DIDIK
Sebelum memulai pembelajaran tentang ${topikMateri}, asesmen diagnostik akan dilakukan untuk mengidentifikasi kesiapan peserta didik, meliputi:
- **Pengetahuan Awal:**
  - Pengenalan terhadap konsep dasar ${topikMateri}.
  - Pemahaman dasar tentang elemen dan istilah kunci dalam materi.
  - Kemampuan menghubungkan materi dengan pengalaman belajar terdahulu.
- **Minat:**
  - Menggali antusiasme peserta didik melalui media visual, studi kasus kontekstual madrasah, dan game interaktif (Educaplay / Memory Challenge).
  - Ketertarikan peserta didik dalam berdiskusi kelompok memecahkan teka-teki konsep.
- **Latar Belakang:**
  - Latar belakang pemahaman dan lingkungan keagamaan/budaya santri madrasah.
  - Minat terhadap pemanfaatan teknologi digital dalam pembelajaran.
- **Kebutuhan Belajar:**
  - Peserta didik bergaya visual difasilitasi dengan infografis, salindia, dan bagan alur.
  - Peserta didik bergaya auditori difasilitasi melalui pemaparan diskusi dan audio-visual.
  - Peserta didik bergaya kinestetik/praktik difasilitasi dengan simulasi aktif dan kartu konsep.

---

## B. KARAKTERISTIK MATERI PELAJARAN
Materi "${topikMateri}" memiliki karakteristik sebagai berikut:
- **Jenis Pengetahuan yang Akan Dicapai:**
  - **Faktual:** Mengenal fakta, istilah, dalil, dan data pendukung seputar ${topikMateri}.
  - **Konseptual:** Memahami prinsip, teori, dan hubungan kausalitas antar konsep materi.
  - **Prosedural:** Mampu menjalankan tahapan analisis, pemecahan masalah, atau kaidah pengamalan secara sistematis.
  - **Metakognitif:** Merefleksikan manfaat ilmu bagi perbaikan diri, adab, dan kemaslahatan umat.
- **Relevansi dengan Kehidupan Nyata Peserta Didik:**
  - Materi ini sangat aplikatif dalam kehidupan beribadah, bermasyarakat, dan berakhlak mulia di madrasah.
- **Integrasi Nilai dan Karakter (KBC & Aswaja):**
  - **Apresiasi & Kasih Sayang:** Menghargai keragaman pemikiran dengan bingkai tasamuh.
  - **Penalaran Kritis:** Membiasakan tabayyun dan berargumen logis.
  - **Mindfulness & Adab:** Melatih keheningan batin, ketawadhu'an, dan fokus saat menuntut ilmu.

---

## C. DIMENSI PROFIL LULUSAN PEMBELAJARAN
- **Keimanan dan Ketakwaan terhadap Tuhan YME & Berakhlak Mulia:** Menjadikan ilmu sebagai sarana mendekatkan diri kepada Allah SWT.
- **Penalaran Kritis:** Mampu membedakan argumen yang valid dan menganalisis persoalan secara mendalam.
- **Kreativitas & Kolaborasi:** Mampu bekerja sama saling mengasihi dalam tim untuk menghasilkan karya solutif.
- **Komunikasi:** Menyampaikan gagasan secara santun dan terstruktur.

---

## DESAIN PEMBELAJARAN

### A. CAPAIAN PEMBELAJARAN
Pada akhir Fase ${fase}, peserta didik mampu menganalisis, menginternalisasi, dan menerapkan kompetensi ${topikMateri} dalam memecahkan masalah kontekstual berlandaskan nilai keilmuan dan akhlakul karimah.

| Elemen | Capaian Pembelajaran |
|---|---|
| **Pemahaman Konseptual** | Peserta didik memahami dan menganalisis hakikat ${topikMateri} secara komprehensif. |
| **Keterampilan Berpikir Kritis** | Peserta didik mengevaluasi masalah kontekstual dan merumuskan solusi berbasis dalil/fakta. |
| **Aksi Nyata & Karakter (KBC)** | Peserta didik mewujudkan pemahaman melalui sikap peduli, adab santun, dan karya bermanfaat. |

---

### B. LINTAS DISIPLIN ILMU
- **Bahasa Indonesia & Arab:** Penguatan literasi teks dan pemaknaan istilah keilmuan.
- **Teknologi Informasi (TIK):** Pemanfaatan platform kuis digital (Educaplay) dan riset materi online.
- **Pendidikan Karakter & Aswaja:** Penguatan nilai tawasuth (moderat) dan tawazun (seimbang).

---

### C. TUJUAN PEMBELAJARAN
- **Pertemuan 1:** Peserta didik mampu mengidentifikasi dan menjelaskan konsep dasar ${topikMateri} melalui eksplorasi studi kasus dan diskusi kelompok.
- **Pertemuan 2:** Peserta didik mampu menganalisis permasalahan kontekstual ${topikMateri} dan mempresentasikannya dengan penalaran logis.
- **Pertemuan 3:** Peserta didik mampu mengaitkan nilai adab dan etika materi dalam bentuk refleksi karya nyata.

---

### D. KERANGKA PEMBELAJARAN
- **Model & Metode:** Problem Based Learning, Cooperative Learning, dan Gamifikasi Edukatif.
- **Budaya Belajar (Deep Learning):**
  - **Mindful Learning:** Melatih fokus mengamati fenomena secara hening dan mendalam.
  - **Meaningful Learning:** Mengaitkan setiap konsep dengan realitas keseharian peserta didik.
  - **Joyful Learning:** Proses belajar dikemas dalam suasana gembira penuh apresiasi dan senyuman.

---

### E. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSI

#### Pertemuan 1: Eksplorasi & Pemahaman Konseptual

| Kegiatan | Alokasi Waktu |
|---|---|
| **1. KEGIATAN PENDAHULUAN**<br>- Guru membuka dengan salam santun dan doa bersama.<br>- Presensi dan ice breaking penyemangat suasana belajar.<br>- Apersepsi mengaitkan materi sebelumnya dengan ${topikMateri}.<br>- Menyampaikan tujuan pembelajaran dan manfaatnya bagi kehidupan. | 20 Menit |
| **2. KEGIATAN INTI**<br>**Eksplorasi (Diferensiasi Konten):**<br>- Guru memaparkan stimulus materi melalui tayangan slide/video studi kasus.<br>- Memberikan pertanyaan pemantik yang merangsang daya kritis peserta didik.<br><br>**Identifikasi & Diskusi (Diferensiasi Proses & Produk):**<br>- Peserta didik dibagi dalam kelompok kecil heterogen.<br>- Melakukan penyelidikan mandiri dan diskusi kelompok dengan panduan LKPD.<br>- Presentasi kelompok dan tanggapan dari kelompok lain secara santun.<br><br>**Konfirmasi & Refleksi:**<br>- Guru bersama siswa menyimpulkan poin-poin utama materi. | 50 Menit |
| **3. KEGIATAN PENUTUP**<br>- Refleksi perasaan belajar (mindful check-in).<br>- Menyampaikan arahan untuk pertemuan berikutnya.<br>- Doa penutup majelis dan salam. | 10 Menit |

---

### F. ASESMEN PEMBELAJARAN
1. **Asesmen Awal (Diagnostik):** Tanya jawab pemantik lisan untuk mengukur pemahaman awal peserta didik.
2. **Asesmen Proses (Formatif):** Observasi keaktifan diskusi, sikap kerja sama, kesantunan bertutur, serta penugasan LKPD.
3. **Asesmen Akhir (Sumatif):** Kuis pemahaman konsep dan lembar refleksi diri peserta didik.`;
  }

  // Fallback for CP (Capaian Pembelajaran)
  if (docType === 'cp') {
    const cpContent = capaianPembelajaranTeks && capaianPembelajaranTeks.trim().length > 15
      ? capaianPembelajaranTeks.trim()
      : `Pada akhir Fase ${fase} (Kelas ${kelas}), peserta didik MA NU 01 Banyuputih Batang memiliki kemampuan bernalar kritis, mandiri, dan kreatif dalam menguasai kompetensi mata pelajaran ${mapel}. Peserta didik mampu memadukan sains modern dengan khazanah keilmuan Islam berhaluan Ahlussunnah wal Jama'ah An-Nahdliyah serta menginternalisasikan nilai-nilai kasih sayang (rahmah) dan adab mulia.`;

    return `# ANALISIS CAPAIAN PEMBELAJARAN (CP) ELEMEN
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berdasarkan Panduan Pembelajaran dan Asesmen Kemendikdasmen & Kemenag RI (Kurikulum Merdeka)*

---

### A. DESKRIPSI CAPAIAN PEMBELAJARAN (CP) FASE ${fase}
${cpContent}

---

### B. TABEL RINCIAN ELEMEN CAPAIAN PEMBELAJARAN (CP)
| No | Elemen CP | Kalimat Capaian Pembelajaran Elemen | Kompetensi Utama | Ruang Lingkup Materi Esensial |
|:---:|:---|:---|:---|:---|
| 1 | **Pemahaman Konseptual** | Peserta didik memahami dan menganalisis hakikat konsep dasar ${mapel}. | Menganalisis, Mengidentifikasi, Membedakan | Landasan fundamental dan kaidah dasar ${mapel} |
| 2 | **Keterampilan Proses** | Peserta didik menerapkan prinsip pemecahan masalah pada studi kasus nyata di lingkungan sekitar. | Menerapkan, Menyelesaikan, Merancang | Studi kasus aplikatif dan penalaran logis |

---

### C. INTEGRASI NILAI KHAS MADRASAH & KURIKULUM BERBASIS CINTA (KBC)
1. **Tawassuth (Moderat):** Menumbuhkan pemahaman materi yang seimbang, tidak ekstrim, serta menghargai tradisi keilmuan.
2. **Tasamuh (Toleran):** Mengedepankan sikap saling menghormati pendapat dalam berdiskusi kelompok.
3. **Rahmah (Kasih Sayang):** Menginternalisasikan empati sosial dan adab mulia thalabul ilmi di lingkungan madrasah.`;
  }

  // Fallback for ATP (Alur Tujuan Pembelajaran)
  if (docType === 'atp') {
    return `# ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berdasarkan Panduan Pembelajaran dan Asesmen Kemendikdasmen & Kemenag RI (Kurikulum Merdeka)*

---

### A. TABEL ALUR TUJUAN PEMBELAJARAN (ATP) LENGKAP

| Alur | Kode TP | Rumusan Tujuan Pembelajaran (TP) | Alokasi Waktu (JP) | Indikator Ketercapaian (IKTP) | Rencana Asesmen | Dimensi Profil Lulusan / P5RA & KBC |
|:---:|:---:|:---|:---:|:---|:---:|:---|
| **1** | **TP 10.1** | Mengidentifikasi dan menjelaskan konsep fundamental ${mapel} secara mendalam | 16 JP | • Menyebutkan definisi & ruang lingkup materi<br>• Menjelaskan dalil/prinsip dasar yang relevan | **Formatif:** Tanya jawab lisan & kuis pemantik<br>**Sumatif:** Tes tertulis (pilihan ganda CBT) | Beriman, Bertakwa, Penalaran Kritis, Berkeadaban (*Ta'addub*) |
| **2** | **TP 10.2** | Mengaitkan konsep materi dengan fenomena sosial dan nilai etika Islam | 18 JP | • Menganalisis keterkaitan teori dengan realitas<br>• Menilai masalah dengan etika Aswaja | **Formatif:** Diskusi kelompok & resume bacaan<br>**Sumatif:** Penugasan analisis artikel/kasus | Gotong Royong, Toleransi (*Tasamuh*), Kasih Sayang (*Rahmah*) |
| **3** | **TP 10.3** | Memecahkan persoalan kontekstual melalui penalaran kritis dan prosedural | 22 JP | • Merumuskan hipotesis/langkah pemecahan | **Formatif:** Observasi kinerja problem solving<br>**Sumatif:** Asesmen Sumatif Tengah Semester (ASTS) | Mandiri, Penalaran Kritis, Keteladanan (*Qudwah*) |
| **4** | **TP 10.4** | Menginternalisasikan nilai kasih sayang, kolaborasi, dan kemanfaatan sosial | 16 JP | • Bekerja sama harmonis dalam kelompok | **Formatif:** Penilaian antarteman & jurnal refleksi<br>**Sumatif:** Asesmen Sumatif Akhir Semester (ASESGA) | Kreatif, Komunikatif, Dinamis & Inovatif (*Tathawwur wa Ibtikar*) |
| | | **TOTAL ALOKASI WAKTU FASE** | **${alokasiWaktu || '72 JP'}** | | | |

---

### B. RASIONAL PENYUSUNAN ALUR TUJUAN PEMBELAJARAN
1. **Prinsip Progresi Konsep:** Alur disusun secara berjenjang dari penguasaan konsep fundamental (konkret), menuju analisis relasional, hingga pemecahan masalah tingkat tinggi (HOTS dan aplikasi nyata).
2. **Pendekatan Deep Learning:**
   - *Mindful Learning:* Melatih fokus dan kesadaran penuh dalam memahami hakikat ilmu sebagai amanah ilahi.
   - *Meaningful Learning:* Menghubungkan setiap materi dengan kebermanfaatan hidup di dunia dan akhirat.
   - *Joyful Learning:* Pembelajaran dirancang interaktif, kolaboratif, dan membahagiakan tanpa intimidasi.`;
  }

  // Default fallback (e.g. for compatibility)
  return `# DOKUMEN ADMINISTRASI GURU
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
Dokumen ini disusun untuk mata pelajaran ${mapel} kelas ${kelas}.`;
}

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MA NU 01 Banyuputih Batang AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
