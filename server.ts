import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server Persistent Database Layer (JSON File Storage in /data volume)
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create data directory:', e);
  }
}

const DEFAULT_MADRASAH_IDENTITY = {
  yayasan: "YAYASAN LP MA'ARIF NU KABUPATEN BATANG",
  nama: 'MA NU 01 BANYUPUTIH',
  singkatan: 'MA NU 01 Banyuputih',
  akreditasi: 'TERAKREDITASI A (UNGGUL)',
  alamat: 'Jl. Lapangan 9A Banyuputih, Kab. Batang',
  npsn: '20364930',
  tahunAjaran: '2026/2027',
  semester: 'Ganjil',
  modeJadwal: 'Reguler (Normal)',
  kabupaten: 'Kab. Batang',
  kepalaMadrasah: 'H. Mukhsin, S.Ag., M.Pd.I.',
  nipKepala: '197206151998031002',
  telepon: '(0285) 666789',
  email: 'manubanyuputih@gmail.com',
  website: 'https://manu01banyuputih.sch.id',
};

const DEFAULT_USERS = [
  {
    id: 'user-hariyanto',
    name: 'Bpk. Hariyanto, S.Pd.',
    nip: '198604122011011008',
    role: 'guru',
    mapel: ['Matematika', 'Fisika'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 07:15 WIB',
    pin: '123456',
  },
  {
    id: 'user-siti-fatimah',
    name: 'Ibu Siti Fatimah, S.Ag.',
    nip: '198208152009122004',
    role: 'guru',
    mapel: ['Fiqih', 'Bahasa Arab', "Al-Qur'an Hadits"],
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 08:30 WIB',
    pin: '654321',
  },
  {
    id: 'user-zainal',
    name: 'Admin',
    nip: '-',
    role: 'admin',
    mapel: ['Informatika', 'Kewirausahaan'],
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 06:45 WIB',
    pin: '888888',
  },
  {
    id: 'user-nur-hidayah',
    name: 'Ibu Nur Hidayah, A.Md.',
    nip: '199311052019032015',
    role: 'operator',
    mapel: ['Tata Usaha & Distribusi Dokumen'],
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    lastLogin: '21 Sep 2026, 07:00 WIB',
    pin: '111111',
  },
];

const DEFAULT_MAPEL_LIST = [
  'Matematika',
  'Bahasa Indonesia',
  'Bahasa Inggris',
  'Bahasa Arab',
  'Bahasa Jawa',
  'Fisika',
  'Kimia',
  'Biologi',
  'Geografi',
  'Ekonomi',
  'Sosiologi',
  'Sejarah',
  'Informatika',
  'Pendidikan Pancasila',
  'Pendidikan Jasmani & Olahraga',
  'Seni Budaya',
  'Prakarya & Kewirausahaan (PKWU)',
  "Al-Qur'an Hadis",
  'Akidah Akhlak',
  'Fiqih',
  'Sejarah Kebudayaan Islam (SKI)',
  'Aswaja & Ke-NU-an',
  'Riset & Karya Ilmiah Remaja',
];

function readDb(): {
  users: any[];
  madrasahIdentity: any;
  exams: any[];
  docs: any[];
  logs: any[];
  mapelList: string[];
} {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        users: Array.isArray(parsed.users) ? parsed.users : DEFAULT_USERS,
        madrasahIdentity: parsed.madrasahIdentity || DEFAULT_MADRASAH_IDENTITY,
        exams: Array.isArray(parsed.exams) ? parsed.exams : [],
        docs: Array.isArray(parsed.docs) ? parsed.docs : [],
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
        mapelList: Array.isArray(parsed.mapelList) ? parsed.mapelList : DEFAULT_MAPEL_LIST,
      };
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  const initialDb = {
    users: DEFAULT_USERS,
    madrasahIdentity: DEFAULT_MADRASAH_IDENTITY,
    exams: [],
    docs: [],
    logs: [],
    mapelList: DEFAULT_MAPEL_LIST,
  };
  writeDb(initialDb);
  return initialDb;
}

function writeDb(data: any): boolean {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Failed to write database file:', err);
    return false;
  }
}

// REST Endpoints for Centralized Server Storage
app.get('/api/v1/storage', (req: Request, res: Response) => {
  const db = readDb();
  res.json(db);
});

app.post('/api/v1/storage/sync', (req: Request, res: Response) => {
  const db = readDb();
  const body = req.body || {};

  if (Array.isArray(body.users)) db.users = body.users;
  if (body.madrasahIdentity) db.madrasahIdentity = body.madrasahIdentity;
  if (Array.isArray(body.exams)) db.exams = body.exams;
  if (Array.isArray(body.docs)) db.docs = body.docs;
  if (Array.isArray(body.logs)) db.logs = body.logs;
  if (Array.isArray(body.mapelList)) db.mapelList = body.mapelList;

  const success = writeDb(db);
  res.json({ success, db });
});

app.post('/api/v1/exams', (req: Request, res: Response) => {
  const db = readDb();
  const exam = req.body;
  if (!exam || !exam.id) {
    return res.status(400).json({ success: false, message: 'Invalid exam data' });
  }
  const existingIdx = db.exams.findIndex((e: any) => e.id === exam.id);
  if (existingIdx >= 0) {
    db.exams[existingIdx] = exam;
  } else {
    db.exams.unshift(exam);
  }
  writeDb(db);
  res.json({ success: true, count: db.exams.length });
});

app.delete('/api/v1/exams/:id', (req: Request, res: Response) => {
  const db = readDb();
  const id = req.params.id;
  db.exams = db.exams.filter((e: any) => e.id !== id);
  writeDb(db);
  res.json({ success: true, count: db.exams.length });
});

app.post('/api/v1/docs', (req: Request, res: Response) => {
  const db = readDb();
  const doc = req.body;
  if (!doc || !doc.id) {
    return res.status(400).json({ success: false, message: 'Invalid doc data' });
  }
  const existingIdx = db.docs.findIndex((d: any) => d.id === doc.id);
  if (existingIdx >= 0) {
    db.docs[existingIdx] = doc;
  } else {
    db.docs.unshift(doc);
  }
  writeDb(db);
  res.json({ success: true, count: db.docs.length });
});

app.delete('/api/v1/docs/:id', (req: Request, res: Response) => {
  const db = readDb();
  const id = req.params.id;
  db.docs = db.docs.filter((d: any) => d.id !== id);
  writeDb(db);
  res.json({ success: true, count: db.docs.length });
});

app.post('/api/v1/logs', (req: Request, res: Response) => {
  const db = readDb();
  const log = req.body;
  if (log && log.id) {
    db.logs.unshift(log);
    if (db.logs.length > 200) db.logs = db.logs.slice(0, 200); // keep last 200 logs
    writeDb(db);
  }
  res.json({ success: true });
});

app.post('/api/v1/storage/reset', (req: Request, res: Response) => {
  const initialDb = {
    users: DEFAULT_USERS,
    madrasahIdentity: DEFAULT_MADRASAH_IDENTITY,
    exams: [],
    docs: [],
    logs: [],
    mapelList: DEFAULT_MAPEL_LIST,
  };
  writeDb(initialDb);
  res.json({ success: true, db: initialDb });
});

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

        if (response.text && response.text.trim()) {
          const cleanText = response.text.trim();
          if (isAiApologyOrRefusal(cleanText)) {
            continue;
          }
          if (params.responseMimeType === 'application/json') {
            const parsed = parseJsonFromAiResponse(cleanText);
            if (!parsed) continue;
          }
          return { text: cleanText, modelUsed: model };
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

// Track exhausted models (e.g. models that reached monthly quota / 402 / limit)
const exhaustedModels = new Map<string, number>();

function isModelExhausted(model: string): boolean {
  if (!model) return false;
  const expiry = exhaustedModels.get(model);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    exhaustedModels.delete(model);
    return false;
  }
  return true;
}

function markModelExhausted(model: string, durationMinutes = 30): void {
  if (!model) return;
  exhaustedModels.set(model, Date.now() + durationMinutes * 60 * 1000);
  if (cachedResolvedModel === model) {
    cachedResolvedModel = '';
  }
}

// Auto-discovery cache for active 9router model
let cachedResolvedModel = '';
async function resolveRouterModel(baseUrl: string, apiKey: string, preferredModel?: string): Promise<string> {
  if (preferredModel && !isModelExhausted(preferredModel)) return preferredModel;
  if (cachedResolvedModel && !isModelExhausted(cachedResolvedModel)) return cachedResolvedModel;

  const cleanBase = baseUrl.replace(/\/+$/, '');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const modelEndpoints = [
    cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`,
    `${cleanBase}/models`,
  ];

  for (const mUrl of modelEndpoints) {
    try {
      const res = await fetch(mUrl, { method: 'GET', headers, signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = (await res.json()) as any;
        const list: string[] = Array.isArray(data?.data)
          ? data.data.map((m: any) => m.id || m.name).filter(Boolean)
          : Array.isArray(data)
          ? data.map((m: any) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean)
          : [];

        const available = list.filter((m) => !isModelExhausted(m));
        if (available.length > 0) {
          // Priority 1: High-reliability Gemini models on 9router
          const geminiMatch = available.find((m) => m.startsWith('gemini/') || m.includes('gemini-3.6') || m.includes('gemini'));
          if (geminiMatch) {
            cachedResolvedModel = geminiMatch;
            return geminiMatch;
          }
          // Priority 2: Komoboku if not exhausted
          const komobokuMatch = available.find((m) => m.toLowerCase().includes('komoboku') || m.toLowerCase().includes('komboku'));
          if (komobokuMatch) {
            cachedResolvedModel = komobokuMatch;
            return komobokuMatch;
          }
          // Priority 3: Free / OpenRouter models
          const freeMatch = available.find((m) => m.startsWith('openrouter/') || m.includes(':free'));
          if (freeMatch) {
            cachedResolvedModel = freeMatch;
            return freeMatch;
          }
          // Priority 4: Any first non-exhausted model
          cachedResolvedModel = available[0];
          return available[0];
        }
      }
    } catch {}
  }

  return 'gemini/gemini-3.6-flash';
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

  // 2. Handle Server-Sent Events (SSE) data: chunks (both newline-separated and concatenated)
  if (trimmed.includes('data:')) {
    let accumulated = '';
    const regex = /data:\s*({.+?})(?=(?:\s*data:|$))/g;
    let match;
    while ((match = regex.exec(trimmed)) !== null) {
      try {
        const chunk = JSON.parse(match[1]);
        const delta =
          chunk?.choices?.[0]?.delta?.content ||
          chunk?.choices?.[0]?.message?.content ||
          chunk?.choices?.[0]?.text ||
          '';
        accumulated += delta;
      } catch {}
    }
    if (accumulated.trim()) {
      return accumulated.trim();
    }
  }

  return trimmed;
}

// Detect if the model outputted an AI apology, quota/rate-limit notice, or refusal instead of valid content
function isAiApologyOrRefusal(text: string): boolean {
  if (!text || typeof text !== 'string') return true;
  const t = text.trim().toLowerCase();
  if (t.length < 5) return true;

  return (
    t.startsWith('maaf') ||
    t.startsWith('mohon maaf') ||
    t.startsWith('sorry') ||
    t.startsWith('i cannot') ||
    t.startsWith('i am unable') ||
    t.startsWith('i am sorry') ||
    t.startsWith('as an ai') ||
    t.startsWith('peringatan:') ||
    t.includes('permintaan anda tidak dapat') ||
    t.includes('kuota telah habis') ||
    t.includes('melebihi batas') ||
    t.includes('limit reached') ||
    t.includes('rate limit') ||
    t.includes('monthly_request_count') ||
    t.includes('terjadi kesalahan saat memproses')
  );
}

// Robust JSON parser for AI outputs (handles markdown wrappers, leading narrative text, trailing commas, array roots)
function parseJsonFromAiResponse(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') return null;

  // Immediate refusal / apology check: do not parse plain refusals
  if (isAiApologyOrRefusal(rawText)) {
    return null;
  }

  let clean = rawText.trim();

  // Strip markdown codeblock delimiters (```json ... ``` or ``` ...)
  clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // Check if text has any JSON structure indicators
  const firstBrace = clean.indexOf('{');
  const firstBracket = clean.indexOf('[');

  // If there are no braces or brackets at all, it's plain text, not JSON
  if (firstBrace === -1 && firstBracket === -1) {
    return null;
  }

  // Determine outermost JSON container (object {...} or array [...])
  let jsonSubstring = clean;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    const lastBrace = clean.lastIndexOf('}');
    if (lastBrace > firstBrace) {
      jsonSubstring = clean.substring(firstBrace, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    const lastBracket = clean.lastIndexOf(']');
    if (lastBracket > firstBracket) {
      jsonSubstring = clean.substring(firstBracket, lastBracket + 1);
    }
  }

  // Attempt 1: direct parse
  try {
    return JSON.parse(jsonSubstring);
  } catch {}

  // Attempt 2: clean trailing commas before closing braces/brackets
  try {
    const sanitized = jsonSubstring.replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(sanitized);
  } catch {}

  // Attempt 3: fix Python/relaxed JSON values (None, True, False)
  try {
    const relaxed = jsonSubstring
      .replace(/:\s*None\b/g, ': null')
      .replace(/:\s*True\b/g, ': true')
      .replace(/:\s*False\b/g, ': false')
      .replace(/,\s*([}\]])/g, '$1');
    return JSON.parse(relaxed);
  } catch {}

  // Non-JSON response received, return null cleanly without triggering false-positive SyntaxError warnings
  return null;
}

// Standard browser User-Agent to prevent Cloudflare Tunnel 403 blocks (error 1010)
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

function getRouterHeaders(apiKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': BROWSER_USER_AGENT,
    'Accept': 'application/json, text/plain, */*',
  };
  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

// Global diagnostic reason tracker for AI generation attempts
let lastAiGatewayDiagnostic = '';

// Helper to discover candidate models from 9router API with high-pedagogy model prioritization
async function fetchRouterModelCandidates(baseUrl: string, apiKey: string, explicitModel?: string): Promise<string[]> {
  const candidates: string[] = [];

  // Priority 1: User's explicitly configured model in environment (if healthy)
  if (explicitModel && explicitModel.trim() && !isModelExhausted(explicitModel.trim())) {
    candidates.push(explicitModel.trim());
  }
  // Priority 2: Cached known working model (if healthy)
  if (cachedResolvedModel && cachedResolvedModel.trim() && !isModelExhausted(cachedResolvedModel.trim()) && !candidates.includes(cachedResolvedModel.trim())) {
    candidates.push(cachedResolvedModel.trim());
  }

  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const headers = getRouterHeaders(apiKey);

  let discoveredList: string[] = [];
  try {
    const mUrl = cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`;
    const res = await fetch(mUrl, { method: 'GET', headers, signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = (await res.json()) as any;
      discoveredList = Array.isArray(data?.data)
        ? data.data.map((m: any) => m.id || m.name).filter(Boolean)
        : Array.isArray(data)
        ? data.map((m: any) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean)
        : [];
    }
  } catch {}

  const availableDiscovered = discoveredList.filter((m) => !isModelExhausted(m));

  // High capability pedagogical models on 9router:
  // 1. Gemini on 9router (tested and verified 200 OK via Cloudflare)
  const geminiOnRouter = availableDiscovered.find(
    (m) => m === 'gemini/gemini-3.6-flash' || m === 'gemini/gemini-4-argon' || m.startsWith('gemini/')
  );
  if (geminiOnRouter && !candidates.includes(geminiOnRouter)) {
    candidates.push(geminiOnRouter);
  }

  // 2. Komoboku or Auto combo model
  const komobokuOrAuto = availableDiscovered.find(
    (m) => (m === 'komoboku' || m === 'kr/auto') && !candidates.includes(m)
  );
  if (komobokuOrAuto && !candidates.includes(komobokuOrAuto)) {
    candidates.push(komobokuOrAuto);
  }

  // Ultimate defaults if discovery was completely empty
  if (candidates.length === 0) {
    candidates.push('gemini/gemini-3.6-flash', 'komoboku');
  }

  return candidates;
}

// Unified Generator supporting 9router Combo Model & Gemini SDK
async function generateViaUnifiedAI(params: {
  prompt: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<{ text: string; modelUsed: string } | null> {
  lastAiGatewayDiagnostic = '';
  // 1. Try 9router / OpenAI-compatible Gateway if configured
  const { baseUrl, apiKey, model: explicitModel } = getRouterConfig();

  if (baseUrl) {
    try {
      const candidateModels = await fetchRouterModelCandidates(baseUrl, apiKey, explicitModel);
      const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, '');
      const endpoint = cleanBaseUrl.endsWith('/chat/completions')
        ? cleanBaseUrl
        : cleanBaseUrl.endsWith('/v1')
        ? `${cleanBaseUrl}/chat/completions`
        : `${cleanBaseUrl}/v1/chat/completions`;

      const headers = getRouterHeaders(apiKey);

      for (const modelToTry of candidateModels) {
        if (isModelExhausted(modelToTry)) continue;

        try {
          const bodyPayload: any = {
            model: modelToTry,
            messages: [{ role: 'user', content: params.prompt }],
            temperature: params.temperature ?? 0.7,
            max_tokens: 8192,
            stream: false,
          };

          if (params.responseMimeType === 'application/json') {
            bodyPayload.response_format = { type: 'json_object' };
          }

          const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(bodyPayload),
            signal: AbortSignal.timeout(90000), // 90s timeout per model attempt
          });

          if (response.ok) {
            const rawText = await response.text();
            const text = extractTextFromRouterResponse(rawText);
            if (text && text.length > 5) {
              // Check if the model returned an apology or quota refusal
              if (isAiApologyOrRefusal(text)) {
                console.info(`Model 9router '${modelToTry}' mengembalikan respons penolakan: "${text.slice(0, 100)}...".`);
                if (text.toLowerCase().includes('kuota') || text.toLowerCase().includes('limit') || text.toLowerCase().includes('permintaan')) {
                  markModelExhausted(modelToTry, 30);
                }
                lastAiGatewayDiagnostic = `9router (${modelToTry}) menolak permintaan: ${text.slice(0, 80)}`;
                continue;
              }

              // If JSON is expected, make sure it parses as valid JSON
              if (params.responseMimeType === 'application/json') {
                const parsedCheck = parseJsonFromAiResponse(text);
                if (!parsedCheck) {
                  console.info(`Model 9router '${modelToTry}' mengembalikan teks bukan format JSON saat diminta JSON.`);
                  lastAiGatewayDiagnostic = `9router (${modelToTry}) menghasilkan output non-JSON`;
                  continue;
                }
              }

              cachedResolvedModel = modelToTry;
              return { text, modelUsed: `9router (${modelToTry})` };
            }
          } else {
            const errorText = await response.text();
            if (response.status === 401) {
              lastAiGatewayDiagnostic = '9router HTTP 401 Unauthorized: API Key ditolak gateway (remote API access required)';
              console.warn('9router API Key ditolak (HTTP 401):', errorText.slice(0, 150));
            } else if (response.status === 403) {
              lastAiGatewayDiagnostic = 'Cloudflare HTTP 403 Forbidden: Diblokir firewall Cloudflare Tunnel';
              console.warn('Cloudflare memblokir request (HTTP 403):', errorText.slice(0, 150));
            } else if (response.status === 402 || response.status === 429 || response.status === 503) {
              markModelExhausted(modelToTry, 30);
              lastAiGatewayDiagnostic = `9router HTTP ${response.status}: Batas kuota atau antrean model '${modelToTry}' padat`;
            } else {
              lastAiGatewayDiagnostic = `9router HTTP ${response.status}: ${errorText.slice(0, 100)}`;
            }
          }
        } catch (err: any) {
          const isTimeout = err?.name === 'TimeoutError' || String(err?.message || '').includes('timeout') || String(err?.message || '').includes('aborted');
          lastAiGatewayDiagnostic = isTimeout ? `9router Timeout (>90 detik)` : `9router Network Error: ${err?.message || err}`;
          console.info(`9router attempt for model '${modelToTry}' ended:`, err?.message || err);
        }
      }
    } catch (err: any) {
      lastAiGatewayDiagnostic = `9router Gateway Error: ${err?.message || err}`;
      console.info('9router connection ended, proceeding to fallback engine:', err);
    }
  }

  // 2. Direct Gemini SDK fallback
  const ai = getGeminiClient();
  if (ai) {
    try {
      const geminiRes = await generateWithModelFallback(ai, params);
      if (geminiRes) {
        return geminiRes;
      } else {
        lastAiGatewayDiagnostic = (lastAiGatewayDiagnostic ? lastAiGatewayDiagnostic + ' | ' : '') + 'Gemini SDK fallback exhausted';
      }
    } catch (gErr: any) {
      lastAiGatewayDiagnostic = (lastAiGatewayDiagnostic ? lastAiGatewayDiagnostic + ' | ' : '') + `Gemini SDK Error: ${gErr?.message || gErr}`;
    }
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

// Dedicated 9router Connection Test Endpoint (Supports GET & POST)
app.all('/api/v1/ninerouter/test', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const { baseUrl, apiKey, model: explicitModel } = getRouterConfig();

  if (!baseUrl) {
    return res.status(400).json({
      connected: false,
      message: 'Variabel OPENAI_BASE_URL atau NINEROUTER_BASE_URL belum diatur di environment server.',
      tip: 'Pastikan OPENAI_BASE_URL dan OPENAI_API_KEY sudah diisi dan disimpan.',
    });
  }

  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const headers = getRouterHeaders(apiKey);

  // Probe available models from 9router /models or /v1/models (6s timeout)
  let discoveredModels: string[] = [];
  const modelEndpoints = [
    cleanBase.endsWith('/v1') ? `${cleanBase}/models` : `${cleanBase}/v1/models`,
    `${cleanBase}/models`,
  ];

  for (const mUrl of modelEndpoints) {
    try {
      const mRes = await fetch(mUrl, { method: 'GET', headers, signal: AbortSignal.timeout(6000) });
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

  const availableModels = discoveredModels.filter((m) => !isModelExhausted(m));

  // Determine list of test candidate models (preferred first, then healthy alternatives)
  const modelsToTest: string[] = [];
  if (explicitModel && !isModelExhausted(explicitModel)) {
    modelsToTest.push(explicitModel);
  }
  if (cachedResolvedModel && !isModelExhausted(cachedResolvedModel) && !modelsToTest.includes(cachedResolvedModel)) {
    modelsToTest.push(cachedResolvedModel);
  }
  const healthyGemini = availableModels.find((m) => m === 'gemini/gemini-3.6-flash' || m.startsWith('gemini/'));
  if (healthyGemini && !modelsToTest.includes(healthyGemini)) {
    modelsToTest.push(healthyGemini);
  }
  const healthyKomoboku = availableModels.find((m) => m === 'komoboku' || m === 'kr/auto');
  if (healthyKomoboku && !modelsToTest.includes(healthyKomoboku)) {
    modelsToTest.push(healthyKomoboku);
  }
  if (modelsToTest.length === 0) {
    modelsToTest.push('gemini/gemini-3.6-flash', 'komoboku');
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
  let modelTested = modelsToTest[0];

  for (const currentModel of modelsToTest) {
    modelTested = currentModel;
    const testPayload = {
      model: currentModel,
      messages: [
        {
          role: 'user',
          content: 'Halo, respon singkat 1 kalimat: "Koneksi 9router MA NU 01 Banyuputih aktif."',
        },
      ],
      max_tokens: 150,
      temperature: 0.3,
      stream: false,
    };

    for (const endpoint of uniqueEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(testPayload),
          signal: AbortSignal.timeout(20000), // 20s timeout
        });

        lastStatus = response.status;
        const rawText = await response.text();

        if (response.ok) {
          const reply = extractTextFromRouterResponse(rawText) || 'Koneksi 9router MA NU 01 Banyuputih aktif.';
          const latency = Date.now() - startTime;
          cachedResolvedModel = currentModel;
          return res.json({
            connected: true,
            endpoint,
            model: currentModel,
            latencyMs: latency,
            responseSample: reply,
            discoveredModels: discoveredModels.length > 0 ? discoveredModels : undefined,
            geminiFallbackActive: Boolean(process.env.GEMINI_API_KEY),
            message: `Koneksi ke 9router berhasil! Menggunakan model aktif "${currentModel}".`,
          });
        } else {
          lastErrorText = rawText;
          const isQuota =
            response.status === 402 ||
            response.status === 429 ||
            (response.status === 503 &&
              (rawText.includes('limit') || rawText.includes('quota') || rawText.includes('MONTHLY_REQUEST_COUNT')));
          if (isQuota) {
            markModelExhausted(currentModel, 30);
          }
        }
      } catch (err: any) {
        lastErrorText = err?.message || 'Network error';
      }
    }
  }

  const latency = Date.now() - startTime;
  let tipMessage = 'Periksa konfigurasi 9router Anda.';
  if (lastStatus === 401) {
    tipMessage = 'HTTP 401 Unauthorized: API key 9router ditolak. Pastikan OPENAI_API_KEY di environment server diisi dengan remote API key yang sah.';
  } else if (lastStatus === 403) {
    tipMessage = 'HTTP 403 Forbidden: Diblokir Cloudflare Tunnel. Header User-Agent browser sudah otomatis dipasang oleh server.';
  } else if (discoveredModels.length > 0) {
    tipMessage = `Model "${modelTested}" tidak dapat diakses (status ${lastStatus}). Tersedia ${discoveredModels.length} model lain di gateway 9router Anda.`;
  }

  return res.status(200).json({
    connected: false,
    endpoint: uniqueEndpoints[0],
    model: modelTested,
    statusCode: lastStatus,
    errorRaw: lastErrorText,
    discoveredModels: discoveredModels.length > 0 ? discoveredModels : undefined,
    geminiFallbackActive: Boolean(process.env.GEMINI_API_KEY),
    message: `9router mengembalikan status error HTTP ${lastStatus}.`,
    tip: tipMessage,
  });
});

// Generator Soal API Endpoint (with Parallel Wave Batching, User-Agent, and Transparent Fallback Metadata)
app.all(['/api/v1/soal/generate', '/api/v1/ninerouter/generate-questions'], async (req: Request, res: Response) => {
  try {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const {
      mapel = 'Bahasa Indonesia',
      kelas = '10',
      semester = 'Ganjil',
      tahunPelajaran = '2025/2026',
      jenisUjian = 'ASESGA',
      bahasa = 'indonesia',
      capaianPembelajaran = '',
      selectedTypes = { single_choice: 10, multiple_choice: 2, short_answer: 1, ordering: 0, matching: 0, essay: 2 },
      autoGenerateImages = false,
    } = body;

    // 1. Calculate requested counts per question type
    const sCount = Math.max(0, parseInt(selectedTypes?.single_choice ?? 0, 10));
    const mCount = Math.max(0, parseInt(selectedTypes?.multiple_choice ?? 0, 10));
    const shCount = Math.max(0, parseInt(selectedTypes?.short_answer ?? 0, 10));
    const oCount = Math.max(0, parseInt(selectedTypes?.ordering ?? 0, 10));
    const matCount = Math.max(0, parseInt(selectedTypes?.matching ?? 0, 10));
    const eCount = Math.max(0, parseInt(selectedTypes?.essay ?? 0, 10));

    const totalRequested = sCount + mCount + shCount + oCount + matCount + eCount;

    // 2. Prepare batches (max 6-8 questions per batch to avoid token truncation & timeouts)
    interface BatchItem {
      batchIndex: number;
      startNum: number;
      types: Record<string, number>;
      total: number;
    }

    const batches: BatchItem[] = [];
    let currentNum = 1;

    const queueType = (typeKey: string, count: number, maxChunk = 7) => {
      let remaining = count;
      while (remaining > 0) {
        const chunk = Math.min(remaining, maxChunk);
        batches.push({
          batchIndex: batches.length,
          startNum: currentNum,
          types: { [typeKey]: chunk },
          total: chunk,
        });
        currentNum += chunk;
        remaining -= chunk;
      }
    };

    queueType('single_choice', sCount || (totalRequested === 0 ? 15 : 0), 8);
    queueType('multiple_choice', mCount, 5);
    queueType('short_answer', shCount, 5);
    if (oCount > 0 || matCount > 0) {
      const combinedTypes: Record<string, number> = {};
      if (oCount > 0) combinedTypes.ordering = oCount;
      if (matCount > 0) combinedTypes.matching = matCount;
      batches.push({
        batchIndex: batches.length,
        startNum: currentNum,
        types: combinedTypes,
        total: oCount + matCount,
      });
      currentNum += oCount + matCount;
    }
    queueType('essay', eCount, 5);

    // 3. Execute batches in parallel waves of up to 3 at a time so 25-50 questions finish quickly
    let primaryModelUsed = '';
    const batchResults: Map<number, any[]> = new Map();
    let batchFailed = false;
    let failureDetail = '';

    const runSingleBatch = async (b: BatchItem) => {
      const endNum = b.startNum + b.total - 1;
      const typesList = Object.entries(b.types)
        .map(([t, count]) => {
          if (t === 'single_choice') return `- Pilihan Ganda Tunggal (single_choice): ${count} butir (Opsi A s.d E, kunci RIGHT:A / RIGHT:B / RIGHT:C / RIGHT:D / RIGHT:E)`;
          if (t === 'multiple_choice') return `- Pilihan Ganda Jamak (multiple_choice): ${count} butir (Opsi A s.d E, kunci multi opsi misal RIGHT:A,C,E)`;
          if (t === 'short_answer') return `- Jawaban Singkat (short_answer): ${count} butir (Satu kata kunci kapital misal RIGHT:FAKTA)`;
          if (t === 'ordering') return `- Mengurutkan (ordering): ${count} butir (orderingItems berurutan id 1..n)`;
          if (t === 'matching') return `- Menjodohkan (matching): ${count} butir (matchingPremises dan matchingResponses 1-ke-1)`;
          if (t === 'essay') return `- Uraian / Essay (essay): ${count} butir (essaySampleAnswer dan essayRubric)`;
          return `- ${t}: ${count} butir`;
        })
        .join('\n');

      const batchPrompt = `Anda adalah Pakar Kurikulum Merdeka & Engine Pembuat Soal Ujian untuk MA NU 01 Banyuputih Batang.
Hasilkan paket naskah soal ujian yang SANGAT PRESISI, KAYA VARIATIF, BERBOBOT AKADEMIK, dan BEBAS DUPLIKASI berdasarkan Capaian Pembelajaran (CP).

INFORMASI UJIAN:
- Mata Pelajaran: ${mapel} | Kelas: ${kelas} (Fase ${kelas === '10' ? 'E' : 'F'}) | Semester: ${semester} | Jenis Ujian: ${jenisUjian}
- Bahasa Pengantar: ${bahasa || 'Indonesia'}

CAPAIAN PEMBELAJARAN (CP) / MATERI TARGET (WAJIB DIBEDAH TUNTAS):
"${capaianPembelajaran || 'Standar Capaian Pembelajaran Kurikulum Merdeka ' + mapel}"

TUGAS KHUSUS BATCH KE-${b.batchIndex + 1} DARI TOTAL ${batches.length} BATCH:
Hasilkan soal nomor #${b.startNum} sampai #${endNum} (total ${b.total} butir) dengan alokasi tipe:
${typesList}

ATURAN WAJIB:
1. Soal HARUS menguji konsep keilmuan riil sesuai poin Capaian Pembelajaran. DILARANG membuat pertanyaan meta-pedagogi seperti "Dalam materi X, pemahaman mendalam berfokus pada...".
2. Khusus Mata Pelajaran Bahasa Jawa / Bahasa Inggris / Bahasa Arab: Gunakan 100% bahasa asli mata pelajaran tersebut!
3. Kosongkan imagePrompt ("") kecuali jika soal benar-benar membutuhkan diagram skematik ilmiah.

Format keluaran WAJIB MURNI JSON valid tanpa markdown codeblock dengan struktur:
{
  "questions": [
    {
      "id": "q-${b.startNum}",
      "number": ${b.startNum},
      "type": "${Object.keys(b.types)[0]}",
      "text": "Teks pertanyaan lengkap yang mendalam & spesifik",
      "isArabic": false,
      "hasLatex": false,
      "difficulty": "sedang",
      "kompetensiTarget": "Sub-materi/indikator spesifik dari CP yang diuji",
      "explanation": "Pembahasan ringkas 1-2 kalimat",
      "imagePrompt": "",
      "options": [{"key": "A", "text": "opsi A"}, {"key": "B", "text": "opsi B"}, {"key": "C", "text": "opsi C"}, {"key": "D", "text": "opsi D"}, {"key": "E", "text": "opsi E"}],
      "rawRightAnswer": "RIGHT:A"
    }
  ]
}`;

      const genResult = await generateViaUnifiedAI({
        prompt: batchPrompt,
        responseMimeType: 'application/json',
        temperature: 0.6,
      });

      if (!genResult || !genResult.text) {
        return { ok: false, reason: lastAiGatewayDiagnostic || 'Gateway AI tidak merespons atau menolak request' };
      }

      const parsed = parseJsonFromAiResponse(genResult.text);
      const rawList = Array.isArray(parsed?.questions)
        ? parsed.questions
        : Array.isArray(parsed)
        ? parsed
        : [];

      if (rawList.length === 0) {
        return { ok: false, reason: 'Respons AI tidak dapat diparse sebagai daftar soal JSON yang valid' };
      }

      if (!primaryModelUsed) {
        primaryModelUsed = genResult.modelUsed;
      }

      const numbered = rawList.map((q: any, idx: number) => {
        const qNum = b.startNum + idx;
        return {
          ...q,
          number: qNum,
          id: `q-${qNum}`,
        };
      });

      return { ok: true, questions: numbered };
    };

    const WAVE_SIZE = 3;
    for (let i = 0; i < batches.length; i += WAVE_SIZE) {
      const wave = batches.slice(i, i + WAVE_SIZE);
      const waveOutcomes = await Promise.all(wave.map((b) => runSingleBatch(b)));

      for (let wIdx = 0; wIdx < waveOutcomes.length; wIdx++) {
        const outcome = waveOutcomes[wIdx];
        if (!outcome.ok || !outcome.questions) {
          batchFailed = true;
          failureDetail = outcome.reason || 'Koneksi AI terputus pada saat memproses batch soal';
          break;
        }
        batchResults.set(wave[wIdx].batchIndex, outcome.questions);
      }

      if (batchFailed) break;
    }

    const allAiQuestions: any[] = [];
    for (let i = 0; i < batches.length; i++) {
      const qList = batchResults.get(i);
      if (qList) allAiQuestions.push(...qList);
    }

    if (!batchFailed && allAiQuestions.length > 0) {
      const enrichedQuestions = allAiQuestions.map((q: any) => {
        const rawPrompt = typeof q.imagePrompt === 'string' ? q.imagePrompt.trim() : '';
        const isDummyPrompt =
          !rawPrompt ||
          /^(tidak diperlukan|tidak ada|none|null|-|kosong|opsional)$/i.test(rawPrompt);

        if (isDummyPrompt) {
          delete q.imagePrompt;
        } else if (autoGenerateImages && !q.imageUrl) {
          const cleanP = `Educational high school textbook diagram for ${mapel || 'exam'}: ${rawPrompt}`;
          const seed = Math.floor(Math.random() * 900000) + 100000;
          q.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanP)}?width=768&height=512&nologo=true&seed=${seed}`;
        }
        return q;
      });

      return res.status(200).json({
        success: true,
        isFallback: false,
        source: primaryModelUsed || '9router AI',
        questions: enrichedQuestions,
      });
    }

    // Fallback template generator if offline, busy, key absent, or gateway rejected
    const fallbackQuestions = generateFallbackExamQuestions(
      mapel,
      kelas,
      semester,
      jenisUjian,
      bahasa,
      selectedTypes,
      capaianPembelajaran
    );

    return res.status(200).json({
      success: true,
      isFallback: true,
      source: 'Hermes Emergency Template Engine (Bukan AI)',
      fallbackReason: failureDetail || lastAiGatewayDiagnostic || 'Koneksi 9router / Gemini gagal (HTTP 401/403/Timeout)',
      questions: fallbackQuestions,
    });
  } catch (error: any) {
    res.status(200).json({
      success: false,
      isFallback: true,
      error: error?.message || 'Terjadi kesalahan internal saat memproses soal.',
    });
  }
});

// Endpoint: Generate Gambar / Ilustrasi Diagram Khusus Soal Asesmen
app.post('/api/v1/soal/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, questionText, mapel, style } = req.body;

    if (!prompt && !questionText) {
      return res.status(400).json({
        success: false,
        error: 'Teks soal atau prompt gambar harus disertakan.',
      });
    }

    let basePrompt = (prompt || '').trim();
    if (!basePrompt && questionText) {
      const clean = questionText
        .replace(/Q:\d+\)/gi, '')
        .replace(/\[IMG\].*?\[\/IMG\]/gi, '')
        .replace(/<[^>]*>/g, '')
        .replace(/RIGHT:.*$/gim, '')
        .replace(/\n+/g, ' ')
        .trim()
        .slice(0, 160);
      basePrompt = `Educational high school exam diagram or illustration about ${mapel || 'general study'}: ${clean}`;
    }

    let stylePrefix = 'Educational textbook schematic diagram, clean white background, detailed, sharp: ';
    if (style === 'vector') {
      stylePrefix = 'Clean 2D vector graphic educational illustration for textbook, minimal, clear: ';
    } else if (style === 'photo') {
      stylePrefix = 'Realistic educational documentary photography, clear lighting, sharp detail: ';
    } else if (style === 'sketch') {
      stylePrefix = 'Clear black and white technical line art schematic diagram for school exam: ';
    }

    const fullPrompt = `${stylePrefix}${basePrompt}`.slice(0, 320);
    const seed = Math.floor(Math.random() * 900000) + 100000;
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=768&height=512&nologo=true&seed=${seed}`;
    const proxyUrl = `/api/v1/soal/image-proxy?url=${encodeURIComponent(pollinationsUrl)}&mapel=${encodeURIComponent(mapel || 'Pendidikan')}&title=${encodeURIComponent(basePrompt.slice(0, 50))}`;
    const svgFallback = generateEducationalDiagramSvg(mapel || 'Pendidikan', basePrompt || 'Diagram Pembelajaran');

    return res.json({
      success: true,
      imageUrl: proxyUrl, // Use proxyUrl as primary to ensure CORS & iframe compatibility
      originalUrl: pollinationsUrl,
      proxyUrl,
      svgFallback,
      promptUsed: fullPrompt,
      seed,
    });
  } catch (error: any) {
    console.error('Error generating image for question:', error);
    const svgFallback = generateEducationalDiagramSvg('Pendidikan', 'Ilustrasi Soal Asesmen');
    return res.json({
      success: true,
      imageUrl: svgFallback,
      proxyUrl: svgFallback,
      svgFallback,
      promptUsed: 'Ilustrasi Diagram Edukasi Terstandar',
    });
  }
});

// Endpoint: Image Proxy to prevent CORS/Referrer issues in iframe/sandboxes
app.get('/api/v1/soal/image-proxy', async (req: Request, res: Response) => {
  const mapel = (req.query.mapel as string) || 'Pendidikan';
  const title = (req.query.title as string) || 'Diagram Pembelajaran';
  const serveSvgFallback = () => {
    const fallbackSvg = generateEducationalDiagramSvg(mapel, title);
    const base64Data = fallbackSvg.replace(/^data:image\/svg\+xml;base64,/, '');
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.send(Buffer.from(base64Data, 'base64'));
  };

  try {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return serveSvgFallback();
    }
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(8000), // 8s timeout to avoid slow hanging
    });
    if (!response.ok) {
      return serveSvgFallback();
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    const buffer = await response.arrayBuffer();
    return res.send(Buffer.from(buffer));
  } catch (err: any) {
    return serveSvgFallback();
  }
});

// Helper: Generate vector SVG educational diagram
function generateEducationalDiagramSvg(mapel: string, title: string): string {
  const cleanTitle = (title || 'Diagram Soal')
    .replace(/[<>&"']/g, '')
    .slice(0, 90);
  const cleanMapel = (mapel || 'Kurikulum Merdeka')
    .replace(/[<>&"']/g, '')
    .slice(0, 40);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 768 512" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fdfdfb"/>
        <stop offset="100%" stop-color="#f4f6f0"/>
      </linearGradient>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#093d25"/>
        <stop offset="100%" stop-color="#14532d"/>
      </linearGradient>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#e2e8f0" stroke-width="0.8"/>
      </pattern>
    </defs>
    <!-- Background -->
    <rect width="768" height="512" fill="url(#bgGrad)"/>
    <rect width="768" height="512" fill="url(#grid)" opacity="0.6"/>
    <!-- Outer Border -->
    <rect x="16" y="16" width="736" height="480" rx="16" fill="none" stroke="#093d25" stroke-width="2.5" stroke-opacity="0.8"/>
    <rect x="22" y="22" width="724" height="468" rx="12" fill="none" stroke="#d97706" stroke-width="1" stroke-dasharray="4,4"/>
    
    <!-- Top Institutional Banner -->
    <rect x="24" y="24" width="720" height="56" rx="10" fill="url(#headerGrad)"/>
    <text x="44" y="58" font-family="sans-serif" font-weight="900" font-size="16" fill="#fef08a" letter-spacing="1">MA NU 01 BANYUPUTIH</text>
    <text x="320" y="58" font-family="sans-serif" font-weight="600" font-size="12" fill="#86efac">· DIAGRAM STIMULUS ASESMEN ·</text>
    <rect x="610" y="38" width="116" height="28" rx="6" fill="#052e16" stroke="#fbbf24" stroke-width="1"/>
    <text x="668" y="56" font-family="sans-serif" font-weight="700" font-size="11" fill="#ffffff" text-anchor="middle">${cleanMapel}</text>

    <!-- Main Schematic Canvas -->
    <g transform="translate(48, 105)">
      <!-- Central Focus Plate -->
      <rect x="0" y="0" width="672" height="315" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5"/>
      
      <!-- Educational Diagram Graphics -->
      <circle cx="210" cy="155" r="95" fill="#ecfdf5" stroke="#059669" stroke-width="2.5"/>
      <circle cx="210" cy="155" r="55" fill="#f0fdf4" stroke="#10b981" stroke-width="1.8" stroke-dasharray="3,3"/>
      <circle cx="210" cy="155" r="22" fill="#dcfce7" stroke="#047857" stroke-width="2"/>
      
      <!-- Coordinate / Component Axes -->
      <line x1="90" y1="155" x2="330" y2="155" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2,2"/>
      <line x1="210" y1="35" x2="210" y2="275" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="2,2"/>
      
      <!-- Pointer Line 1 -->
      <path d="M 270 100 L 390 70 L 460 70" fill="none" stroke="#0f766e" stroke-width="2"/>
      <circle cx="270" cy="100" r="4" fill="#0f766e"/>
      <rect x="470" y="56" width="180" height="30" rx="6" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.2"/>
      <text x="480" y="76" font-family="sans-serif" font-weight="700" font-size="12" fill="#134e4a">Bagian [A] Komponen Utama</text>

      <!-- Pointer Line 2 -->
      <path d="M 225 155 L 390 155 L 460 155" fill="none" stroke="#2563eb" stroke-width="2"/>
      <circle cx="225" cy="155" r="4" fill="#2563eb"/>
      <rect x="470" y="140" width="180" height="30" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.2"/>
      <text x="480" y="160" font-family="sans-serif" font-weight="700" font-size="12" fill="#1e3a8a">Bagian [B] Struktur Pusat</text>

      <!-- Pointer Line 3 -->
      <path d="M 270 210 L 390 240 L 460 240" fill="none" stroke="#d97706" stroke-width="2"/>
      <circle cx="270" cy="210" r="4" fill="#d97706"/>
      <rect x="470" y="225" width="180" height="30" rx="6" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.2"/>
      <text x="480" y="245" font-family="sans-serif" font-weight="700" font-size="12" fill="#78350f">Bagian [C] Lapisan Luar</text>

      <!-- Bottom Caption Bar -->
      <rect x="0" y="275" width="672" height="40" rx="0 0 12 12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1"/>
      <text x="18" y="299" font-family="sans-serif" font-weight="700" font-size="12" fill="#334155">Stimulus Soal:</text>
      <text x="110" y="299" font-family="sans-serif" font-weight="500" font-size="12" fill="#475569">${cleanTitle}</text>
    </g>

    <!-- Footer Note -->
    <text x="48" y="475" font-family="sans-serif" font-size="10" fill="#64748b">Dokumen Ujian Resmi MA NU 01 Banyuputih Batang · Berstandar BSNP &amp; Kemenag RI</text>
    <text x="720" y="475" font-family="sans-serif" font-size="10" font-weight="700" fill="#059669" text-anchor="end">ASLI / VALID</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

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
      insersiKBC,
      modelPembelajaran,
      capaianPembelajaranTeks,
      tujuanPembelajaranTeks,
      lintasDisiplinIlmu,
      instruksiKhusus,
      karakteristikPesertaDidik,
      dimensiProfilLulusan,
      jumlahPertemuan,
      jamPerPertemuan,
      jenisAsesmen,
      agendaMadrasah,
      intervalKKTP,
      respondenSurvei,
      skalaSurvei,
      aspekUmpanBalik,
    } = req.body;

    const selectedKBCList: string[] =
      Array.isArray(nilaiKBC) && nilaiKBC.length > 0
        ? nilaiKBC
        : [
            'Cinta kepada Allah dan Rasul-Nya',
            'Cinta kepada Ilmu Pengetahuan',
            'Cinta kepada Diri dan Sesama',
          ];

    const insersiKBCMap: Record<string, string> =
      insersiKBC && typeof insersiKBC === 'object' ? insersiKBC : {};

    const kbcInsersiPromptBlock = selectedKBCList
      .map((pilar, idx) => {
        const detail =
          insersiKBCMap[pilar] ||
          `Integrasi nilai ${pilar} ke dalam materi ${topikMateri || mapel} melalui keteladanan, pembiasaan adab, dan refleksi kontekstual.`;
        return `${idx + 1}. **${pilar}**: ${detail}`;
      })
      .join('\n');

    const dimensiList =
      Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length > 0
        ? dimensiProfilLulusan.join(', ')
        : 'Keimanan & Ketakwaan terhadap Tuhan YME serta Akhlak Mulia, Kewargaan (Moderasi Beragama), Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi (Berkeadaban/Ta\'addub)';

    const asesmenList =
      Array.isArray(jenisAsesmen) && jenisAsesmen.length > 0
        ? jenisAsesmen.join(', ')
        : 'Asesmen Diagnostik (Awal), Asesmen Sikap & Karakter KBC (Jurnal Anekdotal), Asesmen Formatif (Proses KBM & LKPD), Asesmen Sumatif (Akhir TP)';

    let structureGuide = '';
    if (docType === 'rpp') {
      structureGuide = `
Khusus untuk DOKUMEN RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA & KBC (KMA 1503/2025 & KEPDIRJEN PENDIS 6077/2025):
KOMPONEN DAN DATA MASUKAN GURU:
- Kelas & Fase : Kelas ${kelas} (Fase ${fase})
- Semester : Semester ${semester}
- Mata Pelajaran : ${mapel}
- Capaian Pembelajaran (CP) Acuan:
"""
${capaianPembelajaranTeks || 'Siswa mampu menganalisis konsep inti ' + mapel + ', menerapkan pemecahan masalah kontekstual, dan mengamalkan nilai akhlak mulia serta adab thalabul ilmi.'}
"""
${tujuanPembelajaranTeks ? `- Tujuan Pembelajaran (TP) Spesifik dari Guru:\n"${tujuanPembelajaranTeks}"` : ''}
- Topik / Materi Pembelajaran : ${topikMateri}
- Karakteristik Peserta Didik : ${karakteristikPesertaDidik || 'Kemampuan awal beragam (heterogen), preferensi gaya belajar bervariasi (visual, auditori, kinestetik), berkarakter santun dan antusias'}
- 8 Dimensi Profil Lulusan (Pembelajaran Mendalam & KBC) : ${dimensiList}
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}
- Jumlah Pertemuan : ${jumlahPertemuan || '2 Pertemuan'} @ ${jamPerPertemuan || '2 JP (2 x 45 menit)'} (Total JP: ${alokasiWaktu || '4 JP'})
- Model Pembelajaran : ${modelPembelajaran || 'Problem Based Learning (PBL) & Pembelajaran Mendalam'}
- Jenis Asesmen : ${asesmenList}

SUSUN DOKUMEN RPP LENGKAP SECARA RINCI DALAM FORMAT MARKDOWN RESMI BERIKUT:
# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) KURIKULUM MERDEKA & KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berpedoman pada KMA 1503/2025, Kepdirjen Pendis 6077/2025 (Kurikulum Berbasis Cinta), dan Panduan Pembelajaran Mendalam*

---

### I. ANALISIS KESIAPAN & KARAKTERISTIK PESERTA DIDIK
1. **Profil Kesiapan Belajar & Gaya Belajar:** Uraikan analisis mendalam tentang ${karakteristikPesertaDidik || 'gaya belajar visual, auditori, kinestetik, dan kesiapan awal santri'}.
2. **Strategi Pembelajaran Berdiferensiasi (Konten, Proses, Produk):** Uraikan langkah konkret diferensiasi yang ramah anak.

---

### II. CAPAIAN PEMBELAJARAN, TUJUAN PEMBELAJARAN & TABEL MATERI INSERSI KBC
1. **Capaian Pembelajaran (CP) Elemen Terkait**
2. **Tujuan Pembelajaran (TP) & Indikator Ketercapaian (IKTP)**
3. **Pemahaman Bermakna (Deep Learning: Mindful, Meaningful, Joyful Learning) & Pertanyaan Pemantik**
4. **8 Dimensi Profil Lulusan yang Dikembangkan:** ${dimensiList}
5. **Tabel Materi Insersi Kurikulum Berbasis Cinta (KBC - Panca Cinta Kemenag RI):**
   Wajib sajikan tabel Markdown berikut berdasarkan input insersi guru:
   | No | Pilar Panca Cinta (KBC) | Materi Insersi & Konteks Integrasi pada Topik ${topikMateri} | Dalil / Nilai Aswaja & Pembiasaan Adab |
   |:---:|:---|:---|:---|

---

### III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN (${jumlahPertemuan || '2 Pertemuan'})
Untuk setiap pertemuan, buat tabel rincian kegiatan:
| Tahapan Kegiatan | Deskripsi Aktivitas Guru & Peserta Didik (Sintaks ${modelPembelajaran || 'PBL'} & Insersi KBC) | Alokasi Waktu |
|:---|:---|:---:|
(Memuat Kegiatan Pendahuluan [Welcoming with Love, Doa, Mindful Check-in], Kegiatan Inti [Sintaks Model, Diferensiasi, Kolaborasi Empatik], dan Kegiatan Penutup [Refleksi Panca Cinta & Doa]).

---

### IV. RANCANGAN ASESMEN PEMBELAJARAN (KOGNITIF & SIKAP/KARAKTER KBC)
Sajikan instrumen asesmen lengkap sesuai pilihan guru (${asesmenList}):
1. **Asesmen Diagnostik (Awal Pembelajaran)**
2. **Asesmen Sikap / Karakter KBC (Format Jurnal Anekdotal & Rubrik Observasi Adab Panca Cinta):**
   | No | Pilar Panca Cinta / Dimensi Sikap | Indikator Perilaku Teramati | Catatan Jurnal Anekdotal / Tindak Lanjut Pembinaan |
3. **Asesmen Formatif (Proses & LKPD) & Asesmen Sumatif (Akhir TP)**
4. **Tabel Rubrik Interval Ketercapaian (KKTP)**
`;
    } else if (docType === 'modul_ajar') {
      structureGuide = `
Khusus untuk MODUL AJAR KURIKULUM BERBASIS CINTA (KBC) & PEMBELAJARAN MENDALAM (KMA 1503/2025 & KEPDIRJEN PENDIS 6077/2025):
DATA MASUKAN GURU:
- Kelas & Fase : Kelas ${kelas} (Fase ${fase}) | Semester ${semester}
- Mata Pelajaran : ${mapel} | Topik : ${topikMateri}
- Alokasi Waktu : ${alokasiWaktu || '4 JP'} (${jumlahPertemuan || '2 Pertemuan'} @ ${jamPerPertemuan || '2 JP'})
- Teks Capaian Pembelajaran (CP) Resmi dari Guru:
"""
${capaianPembelajaranTeks || 'Pada akhir Fase ' + fase + ', peserta didik mampu menganalisis dan menerapkan konsep ' + mapel + ' secara kontekstual berlandaskan akhlakul karimah.'}
"""
${tujuanPembelajaranTeks ? `- Tujuan Pembelajaran (TP) dari Guru:\n"${tujuanPembelajaranTeks}"` : ''}
- Lintas Disiplin Ilmu : ${lintasDisiplinIlmu || 'Bahasa, Sains/Ekologi, Sosial-Kemasyarakatan, dan Keislaman Aswaja'}
- Karakteristik Peserta Didik : ${karakteristikPesertaDidik || 'Heterogen, aktif, gaya belajar visual-auditori-kinestetik'}
- 8 Dimensi Profil Lulusan : ${dimensiList}
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}
- Model Pembelajaran : ${modelPembelajaran || 'Problem Based Learning (PBL) & Deep Learning'}
- Rencana Asesmen : ${asesmenList}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN RESMI BERIKUT:
# MODUL AJAR KURIKULUM BERBASIS CINTA (KBC) & DEEP LEARNING
## MATA PELAJARAN ${mapel.toUpperCase()} — KELAS ${kelas} (FASE ${fase})
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Rujukan: KMA 1503/2025 & Kepdirjen Pendis 6077/2025 tentang Implementasi Kurikulum Berbasis Cinta di Madrasah*

---

## A. IDENTIFIKASI KESIAPAN PESERTA DIDIK & KARAKTERISTIK MATERI
1. **Identifikasi Kesiapan & Karakteristik Peserta Didik:** (${karakteristikPesertaDidik})
2. **Karakteristik Materi Pelajaran (${topikMateri}):** Pengetahuan Faktual, Konseptual, Prosedural, dan Metakognitif.
3. **8 Dimensi Profil Lulusan Pembelajaran Mendalam:** ${dimensiList}

---

## B. DESAIN PEMBELAJARAN & TABEL MATERI INSERSI KBC
### 1. Capaian Pembelajaran (CP) & Tabel Elemen CP
Uraikan CP berdasarkan teks CP guru dan sajikan tabel elemen CP.
### 2. Lintas Disiplin Ilmu
Uraikan keterkaitan topik dengan: ${lintasDisiplinIlmu || 'lintas disiplin ilmu terkait'}.
### 3. Tujuan Pembelajaran (TP) & Indikator (IKTP) per Pertemuan
### 4. Tabel Materi Insersi Kurikulum Berbasis Cinta (KBC - Panca Cinta Kemenag RI)
Wajib sajikan tabel Markdown:
| No | Pilar Panca Cinta (KBC) | Materi Insersi & Integrasi Konsep pada ${topikMateri} | Dalil Al-Qur'an/Hadis / Nilai Aswaja | Indikator Sikap Santri |
|:---:|:---|:---|:---|:---|
### 5. Kerangka Pembelajaran Mendalam (Mindful, Meaningful, Joyful Learning)

---

## C. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSIASI (${jumlahPertemuan || '2 Pertemuan'})
Sajikan tabel rincian kegiatan Pendahuluan, Inti (Sintaks ${modelPembelajaran}), dan Penutup untuk setiap pertemuan.

---

## D. ASESMEN PEMBELAJARAN KOMPREHENSIF (${asesmenList})
1. **Asesmen Diagnostik (Awal)**
2. **Asesmen Sikap & Karakter KBC (Jurnal Anekdotal & Rubrik Panca Cinta)**
3. **Asesmen Formatif (LKPD & Diskusi) & Asesmen Sumatif (Akhir Modul)**
`;
    } else if (docType === 'cp') {
      structureGuide = `
Khusus untuk DOKUMEN ANALISIS CAPAIAN PEMBELAJARAN (CP) ELEMEN & INSERSI KBC:
TEKS CAPAIAN PEMBELAJARAN (CP) LENGKAP YANG DITEMPEL GURU:
"""
${capaianPembelajaranTeks || 'Standar CP Kurikulum Merdeka Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""
${instruksiKhusus ? `\nINSTRUKSI KHUSUS DARI GURU (WAJIB DITERAPKAN DALAM ANALISIS CP INI):\n"${instruksiKhusus}"\n` : ''}
TARGET PANCA CINTA & MATERI INSERSI KBC:
${kbcInsersiPromptBlock}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN BERIKUT:
# ANALISIS CAPAIAN PEMBELAJARAN (CP) & MATERI INSERSI KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Rujukan: KMA 1503/2025 & Kepdirjen Pendis 6077/2025 (Kurikulum Berbasis Cinta)*

### A. DESKRIPSI CAPAIAN PEMBELAJARAN (CP) FASE ${fase}
Sajikan analisis deskriptif CP Fase ${fase} Mata Pelajaran ${mapel}${instruksiKhusus ? ` sesuai fokus instruksi guru (${instruksiKhusus})` : ''}.

### B. TABEL RINCIAN ELEMEN CAPAIAN PEMBELAJARAN (CP)
| No | Elemen CP | Kalimat Capaian Pembelajaran Elemen | Kompetensi Utama | Ruang Lingkup Materi Esensial |

### C. TABEL PEMETAAN MATERI INSERSI KURIKULUM BERBASIS CINTA (PANCA CINTA) & MODERASI BERAGAMA
| No | Pilar Panca Cinta (KBC) | Kaitan Filosofis dengan Elemen CP ${mapel} | Materi Insersi & Nilai Aswaja (Tawassuth, Tasamuh, Tawazun) |
`;
    } else if (docType === 'atp') {
      structureGuide = `
Khusus untuk DOKUMEN ALUR TUJUAN PEMBELAJARAN (ATP) & INSERSI KBC:
TEKS CAPAIAN PEMBELAJARAN (CP) SEBAGAI RUJUKAN:
"""
${capaianPembelajaranTeks || 'Standar CP Kurikulum Merdeka Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""
ALOKASI JAM PELAJARAN: ${alokasiWaktu || '72 JP (2 JP x 36 Minggu)'}
${instruksiKhusus ? `INSTRUKSI KHUSUS DARI GURU:\n"${instruksiKhusus}"\n` : ''}
TARGET PANCA CINTA & MATERI INSERSI KBC:
${kbcInsersiPromptBlock}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN BERIKUT:
# ALUR TUJUAN PEMBELAJARAN (ATP) & INSERSI PANCA CINTA (KBC)
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Rujukan: KMA 1503/2025 & Kepdirjen Pendis 6077/2025*

### A. TABEL ALUR TUJUAN PEMBELAJARAN (ATP) LENGKAP
| Alur | Kode TP | Rumusan Tujuan Pembelajaran (TP) | Alokasi Waktu (JP) | Indikator Ketercapaian (IKTP) | Rencana Asesmen | 8 Dimensi Profil Lulusan & Materi Insersi Panca Cinta (KBC) |
(Pastikan akumulasi JP per alur sesuai dengan total ${alokasiWaktu || '72 JP'}).

### B. RASIONAL PENYUSUNAN ALUR & INTEGRASI DEEP LEARNING (MINDFUL, MEANINGFUL, JOYFUL)
`;
    } else if (docType === 'prota' || docType === 'prota_prosem') {
      structureGuide = `
Khusus untuk PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA & KBC:
TEKS CAPAIAN PEMBELAJARAN (CP) ACUAN DARI GURU:
"""
${capaianPembelajaranTeks || 'Standar CP Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""
${instruksiKhusus ? `CATATAN / INSTRUKSI KHUSUS GURU:\n"${instruksiKhusus}"\n` : ''}
TARGET PANCA CINTA & MATERI INSERSI KBC:
${kbcInsersiPromptBlock}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN RESMI BERIKUT:
# PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA & KBC
**MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}**

### A. CAPAIAN PEMBELAJARAN FASE ${fase} & TABEL ELEMEN CP
| ELEMEN | CAPAIAN PEMBELAJARAN |
|---|---|

### B. DISTRIBUSI ALOKASI WAKTU & PEMETAAN TEMA PANCA CINTA (KBC) TAHUNAN
#### 1. SEMESTER I (GASAL)
| Unit | Materi Pokok & Sub Materi (Sesuai CP) | Alur Tujuan Pembelajaran (ATP) | Tema Panca Cinta & Materi Insersi KBC | Alokasi Waktu (JP) |
|:---:|:---|:---|:---|:---:|
| **JUMLAH SEMESTER I** | | | | **... JP** |

#### 2. SEMESTER II (GENAP)
| Unit | Materi Pokok & Sub Materi (Sesuai CP) | Alur Tujuan Pembelajaran (ATP) | Tema Panca Cinta & Materi Insersi KBC | Alokasi Waktu (JP) |
|:---:|:---|:---|:---|:---:|
| **JUMLAH SEMESTER II** | | | | **... JP** |

### C. REKAPITULASI TOTAL ALOKASI WAKTU TAHUNAN (${alokasiWaktu || '72 JP'})
`;
    } else if (docType === 'prosem') {
      structureGuide = `
Khusus untuk PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA & KBC:
TEKS CAPAIAN PEMBELAJARAN (CP) ACUAN DARI GURU:
"""
${capaianPembelajaranTeks || 'Standar CP Fase ' + fase + ' Mata Pelajaran ' + mapel}
"""
AGENDA & KALENDER NON-EFEKTIF MADRASAH DARI GURU:
"${agendaMadrasah || 'Minggu 1 Juli: MATSAMA; Minggu 3 Sept: ASTS; Minggu 1-2 Des: ASESGA/ASAS; Minggu 3-4 Des: Pengolahan Rapor & Libur Semester'}"
${instruksiKhusus ? `INSTRUKSI KHUSUS GURU: "${instruksiKhusus}"` : ''}
TARGET PANCA CINTA & MATERI INSERSI KBC:
${kbcInsersiPromptBlock}

SUSUN DOKUMEN DENGAN STRUKTUR:
# PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA & KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

### A. MATRIKS DISTRIBUSI ALOKASI WAKTU SEMESTER ${semester === '2' ? 'GENAP' : 'GASAL'}
| No | BAB / Materi Pokok (Sesuai CP) | Tujuan Pembelajaran (TP) & Tema Insersi KBC | Alokasi JP | ${semester === '2' ? 'Jan | Feb | Mar | Apr | Mei | Jun' : 'Jul | Agu | Sep | Okt | Nov | Des'} |
- Distribusikan alokasi jam tatap muka mingguan sesuai total ${alokasiWaktu || '36 JP'}.
- Wajib masukkan baris/penanda agenda non-efektif sesuai input kalender guru: ${agendaMadrasah}.
- Buat baris TOTAL di akhir tabel.

### B. KETERANGAN AGENDA MADRASAH & INSERSI KBC PER UNIT
`;
    } else if (docType === 'kktp') {
      structureGuide = `
Khusus untuk DOKUMEN KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) INTERVAL & KARAKTER KBC:
DATA MASUKAN GURU:
- Topik / Lingkup Materi : ${topikMateri}
- Daftar Tujuan Pembelajaran (TP) / Indikator yang Dinilai :
"""
${tujuanPembelajaranTeks || `1. Menganalisis konsep dasar ${topikMateri}\n2. Menerapkan pemecahan masalah kontekstual ${topikMateri}\n3. Mengamalkan adab dan nilai Panca Cinta KBC dalam pembelajaran`}
"""
- Rentang Interval Ketuntasan yang Ditetapkan Guru :
"${intervalKKTP || '0-60% (Perlu Bimbingan), 61-74% (Cukup), 75-87% (Baik/Tuntas), 88-100% (Sangat Baik/Mahir)'}"
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN RESMI BERIKUT:
# KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP)
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berpedoman pada Panduan Pembelajaran dan Asesmen & KMA 1503/2025 (Kurikulum Berbasis Cinta)*

### A. TABEL RUBRIK INTERVAL KRITERIA KETERCAPAIAN (KOGNITIF & KETERAMPILAN)
Gunakan persis rentang interval yang ditetapkan guru (${intervalKKTP}):
| No | Tujuan Pembelajaran (TP) | Indikator Ketercapaian (IKTP) | Rubrik Interval 1 (Perlu Bimbingan) | Rubrik Interval 2 (Cukup / Layak) | Rubrik Interval 3 (Baik / Cakap - Tuntas) | Rubrik Interval 4 (Sangat Baik / Mahir) |
|:---:|:---|:---|:---|:---|:---|:---|

### B. RUBRIK KETERCAPAIAN SIKAP & INSERSI PANCA CINTA (KBC)
| No | Pilar Panca Cinta (KBC) | Materi Insersi pada Topik ${topikMateri} | Indikator Sikap Mulai Terlihat | Indikator Sikap Membudaya (Teladan / Qudwah) |
|:---:|:---|:---|:---|:---|

### C. PEDOMAN TINDAK LANJUT (REMEDIAL & PENGAYAAN BERBASIS KASIH SAYANG)
`;
    } else if (docType === 'lkpd') {
      structureGuide = `
Khusus untuk LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS KBC & DEEP LEARNING:
DATA MASUKAN GURU:
- Mata Pelajaran : ${mapel} | Kelas ${kelas} (Fase ${fase}) | Semester ${semester}
- Topik Materi : ${topikMateri}
- Alokasi Waktu : ${alokasiWaktu || '2 JP (90 Menit)'}
- Capaian Pembelajaran (CP) : ${capaianPembelajaranTeks || 'Sesuai CP Fase ' + fase}
- Tujuan Pembelajaran (TP) : ${tujuanPembelajaranTeks || 'Menganalisis dan memecahkan masalah kontekstual ' + topikMateri}
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}

SUSUN NASKAH LKPD SIAP CETAK DALAM FORMAT MARKDOWN BERIKUT:
# LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS KBC & DEEP LEARNING
## MATA PELAJARAN ${mapel.toUpperCase()} — KELAS ${kelas} (FASE ${fase})
*Topik: ${topikMateri}*

### A. IDENTITAS KELOMPOK & PENGANTAR DOA (MINDFUL CHECK-IN)
- Nama Kelompok / Anggota : ......................................................
- Doa Thalabul Ilmi & Niat Belajar Ikhlas (Panca Cinta KBC)

### B. TUJUAN PEMBELAJARAN & MATERI INSERSI KBC
Sajikan tujuan kegiatan dan tabel ringkas nilai Panca Cinta yang diamalkan selama mengerjakan LKPD.

### C. STIMULUS KONTEKSTUAL / WACANA KASUS (MEANINGFUL LEARNING)
Sajikan wacana studi kasus nyata yang menarik dan relevan dengan ${topikMateri}.

### D. AKTIVITAS KOLABORATIF & PERTANYAAN EKSPLORASI (HOTS)
Sajikan 4-5 tugas/pertanyaan analisis terstruktur beserta ruang jawaban bagi peserta didik.

### E. REFLEKSI DIRI & AKSI NYATA PANCA CINTA (JOYFUL & REFLECTIVE)
### F. RUBRIK PENILAIAN LKPD (KOGNITIF, KOLABORASI & ADAB KBC)
`;
    } else if (docType === 'presensi_kbm') {
      structureGuide = `
Khusus untuk JURNAL MENGAJAR & PRESENSI HARIAN SISWA KBM (BERBASIS KBC):
DATA MASUKAN GURU:
- Mata Pelajaran : ${mapel} | Kelas ${kelas} (Fase ${fase}) | Semester ${semester}
- Topik Materi : ${topikMateri}
- Catatan Jurnal / Kejadian Anekdotal dari Guru : "${instruksiKhusus || 'KBM berlangsung kondusif, santun, dan kolaboratif'}"
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}

SUSUN OUTPUT DALAM FORMAT MARKDOWN RESMI:
# JURNAL MENGAJAR & PRESENSI HARIAN KBM (KBC)
**MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}**

### A. AGENDA & JURNAL PELAKSANAAN PEMBELAJARAN
| Komponen | Keterangan Pelaksanaan KBM |
|:---|:---|
(Memuat Hari/Tanggal, Jam Ke-, Topik Materi, Model Pembelajaran, Ringkasan Materi Insersi KBC yang Disampaikan, danKetercapaian KBM).

### B. TABEL DAFTAR PRESENSI & OBSERVASI ADAB PESERTA DIDIK
| No | NISN | Nama Peserta Didik | L/P | Kehadiran (H/S/I/A) | Catatan Sikap / Jurnal Anekdotal Panca Cinta (KBC) |
|:---:|:---:|:---|:---:|:---:|:---|

### C. REKAPITULASI KEHADIRAN & REFLEKSI GURU (DEEP LEARNING & KBC)
`;
    } else if (docType === 'umpan_balik') {
      structureGuide = `
Khusus untuk INSTRUMEN REFLEKSI & UMPAN BALIK PEMBELAJARAN BERBASIS CINTA (KBC):
DATA MASUKAN GURU:
- Responden : ${respondenSurvei || 'Peserta Didik (Siswa)'}
- Skala Penilaian : ${skalaSurvei || 'Skala Likert 1 - 4'}
- Fokus Aspek Evaluasi : ${aspekUmpanBalik || 'Suasana kelas berbasis cinta, kejelasan materi Deep Learning, keteladanan adab guru, keadilan & empati'}
- Target Panca Cinta & Materi Insersi KBC :
${kbcInsersiPromptBlock}

SUSUN OUTPUT LENGKAP DALAM FORMAT MARKDOWN RESMI BERIKUT:
# INSTRUMEN REFLEKSI & UMPAN BALIK PEMBELAJARAN (KBC)
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Responden: ${respondenSurvei || 'Peserta Didik'} | Skala: ${skalaSurvei || 'Likert 1-4'}*

### A. PENGANTAR & PETUNJUK PENGISIAN
### B. TABEL INSTRUMEN PENILAIAN SUASANA KELAS & PEMBELAJARAN MENDALAM (KBC)
Susun minimal 10 butir pernyataan yang mencakup seluruh aspek (${aspekUmpanBalik}) dan kelima pilar Panca Cinta yang dipilih (${selectedKBCList.join(', ')}):
| No | Dimensi KBC / Deep Learning | Pernyataan Refleksi & Umpan Balik | Pilihan Respons (${skalaSurvei || '1 / 2 / 3 / 4'}) |
|:---:|:---|:---|:---:|

### C. PERTANYAAN REFLEKTIF TERBUKA & RENCANA TINDAK LANJUT GURU
`;
    }

    const prompt = `Anda adalah Hermes Agent AI Spesialis Kurikulum Merdeka & Kurikulum Berbasis Cinta (KBC - KMA 1503/2025 & Kepdirjen Pendis 6077/2025) untuk MA NU 01 Banyuputih Batang.
Buatlah naskah dokumen administrasi resmi untuk:
- Jenis Dokumen: ${docType}
- Mata Pelajaran: ${mapel} | Fase ${fase} | Kelas ${kelas} | Semester ${semester} | TP ${tahunPelajaran}
- Topik Materi Pokok: ${topikMateri}
- Guru Pengampu: ${guruPengampu}
- Pendekatan: Pembelajaran Mendalam / Deep Learning (Mindful, Meaningful, Joyful Learning) dan Kurikulum Berbasis Cinta (KBC: Lima Pilar Panca Cinta Kemenag RI)
- Nilai Panca Cinta KBC yang ditargetkan: ${selectedKBCList.join(', ')}
- Model Pembelajaran: ${modelPembelajaran || 'Problem Based Learning & Cooperative Learning'}
${structureGuide}
PENTING & WAJIB DIPATUHI:
1. WAJIB menggunakan format teks MARKDOWN MURNI. DILARANG KERAS menyertakan tag HTML mentah seperti <div>, </div>, <br>, <br/>, <p>, <span>, <style>, atau atribut HTML lainnya. Gunakan sintaks Markdown standar (baris baru untuk jeda baris, format tabel markdown | ... | ... |, **teks tebal**, *teks miring*, dan heading #, ##, ###) agar dokumen bersih saat dicetak dan diekspor ke Word.
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
        isFallback: false,
        source: `${genResult.modelUsed}`,
        markdown: cleanMarkdown,
      });
    }

    // Fallback template for administration document (preserves all KBC & custom fields!)
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
      jenisAsesmen,
      selectedKBCList,
      insersiKBCMap,
      tujuanPembelajaranTeks,
      lintasDisiplinIlmu,
      agendaMadrasah,
      intervalKKTP,
      respondenSurvei,
      skalaSurvei,
      aspekUmpanBalik
    );

    const cleanFallback = cleanMarkdownAdminOutput(fallbackMarkdown);
    return res.json({
      success: true,
      isFallback: true,
      source: 'Hermes Emergency Template Engine (KBC Terintegrasi)',
      fallbackReason:
        lastAiGatewayDiagnostic || 'AI Gateway 9router tidak dapat dihubungi atau API Key ditolak',
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
  selectedTypes: any,
  capaianPembelajaran?: string
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
  const isTariSubject = mapelLower.includes('tari');
  const isMusikSubject = mapelLower.includes('musik');
  const isTeaterSubject = mapelLower.includes('teater');
  const isRupaSubject = mapelLower.includes('rupa');
  const isSeniSubject = (mapelLower.includes('seni') || isTariSubject || isMusikSubject || isTeaterSubject || isRupaSubject);
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
        { key: "A", text: "Sangat panjang, formal, dan dipenuhi istilah-istilah biologi tanaman" },
        { key: "B", text: "Singkat, komunikatif, estetik, dan langsung mengajak pembaca bertindak positif" },
        { key: "C", text: "Menakut-nakuti pembaca dengan konsekuensi hukum jika tidak membeli" },
        { key: "D", text: "Sarkastik, bernada menyindir produk pangan impor secara berlebihan" },
        { key: "E", text: "Pasif, kaku, dan hanya menyajikan daftar harga bahan mentah" }
      ],
      ans: "RIGHT:B",
      exp: "Kalimat persuasi poster harus memikat nalar dan emosi pembaca dengan diksi yang segar, padat, dan estetis."
    },
    {
      text: "Unsur kelengkapan berita inovasi yang merujuk pada latar belakang alasan mengapa inovasi tersebut diciptakan adalah...",
      kompetensi: "Unsur-Unsur Teks Berita (5W+1H)",
      options: [
        { key: "A", text: "What (Apa)" },
        { key: "B", text: "Who (Siapa)" },
        { key: "C", text: "Why (Mengapa)" },
        { key: "D", text: "When (Kapan)" },
        { key: "E", text: "How (Bagaimana)" }
      ],
      ans: "RIGHT:C",
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
    },
    {
      text: "Cermatilah kutipan paragraf deskripsi berikut:\n'Hembusan angin senja membawa aroma tanah basah seusai hujan lebat. Dedaunan pinus bergoyang gemerisik, sementara kabut tipis mulai turun menyelimuti lereng bukit yang kian temaram.'\n\nPencerapan pancaindra yang paling dominan dalam kutipan teks deskripsi di atas adalah...",
      kompetensi: "Pencerapan Pancaindra dalam Teks Deskripsi",
      options: [
        { key: "A", text: "Pengecapan dan perabaan" },
        { key: "B", text: "Pendengaran dan pengecapan" },
        { key: "C", text: "Penciuman semata" },
        { key: "D", text: "Penciuman, pendengaran, dan penglihatan" },
        { key: "E", text: "Perabaan dan gerak semata" }
      ],
      ans: "RIGHT:D",
      exp: "Kutipan memuat aroma tanah basah (penciuman), gemerisik daun (pendengaran), dan kabut menyelimuti lereng temaram (penglihatan)."
    },
    {
      text: "Manakah kutipan kalimat berikut yang menggunakan citraan penglihatan (visual imagery) secara paling jelas dan konkret?",
      kompetensi: "Analisis Citraan Visual Teks Deskripsi",
      options: [
        { key: "A", text: "Suara riak air sungai memecah keheningan dini hari yang dingin" },
        { key: "B", text: "Rasa manis legit ubi bakar meleleh lembut di lidah saat digigit" },
        { key: "C", text: "Hamparan sawah terasering membentang hijau royo-royo dibingkai sinar mentari fajar" },
        { key: "D", text: "Hawa panas menyengat kulit punggung para pemetik teh di perkebunan" },
        { key: "E", text: "Bau sangit jerami terbakar tercium samar dari kejauhan desa" }
      ],
      ans: "RIGHT:C",
      exp: "Frasa 'hamparan sawah membentang hijau royo-royo dibingkai sinar mentari fajar' menstimulasi persepsi mata pembaca."
    },
    {
      text: "Dalam teks eksplanasi ilmiah mengenai proses terjadinya hujan asam, bagian yang menguraikan rentetan hubungan sebab-akibat pembentukan senyawa sulfur dioksida di atmosfer dikelompokkan ke dalam struktur...",
      kompetensi: "Struktur Kausalitas Teks Eksplanasi",
      options: [
        { key: "A", text: "Pernyataan umum (identifikasi fenomena)" },
        { key: "B", text: "Deretan penjelas (kausalitas)" },
        { key: "C", text: "Orientasi tokoh" },
        { key: "D", text: "Interpretasi / simpulan opsional" },
        { key: "E", text: "Abstraksi peristiwa" }
      ],
      ans: "RIGHT:B",
      exp: "Rangkaian urutan kausalitas (sebab-akibat) yang memicu fenomena dipaparkan pada struktur deretan penjelas."
    },
    {
      text: "Konjungsi antarkalimat yang paling tepat untuk menyatakan hubungan akibat dalam mengonstruksi teks eksplanasi ilmiah adalah...",
      kompetensi: "Kaidah Konjungsi Kausalitas Teks Eksplanasi",
      options: [
        { key: "A", text: "Meskipun demikian" },
        { key: "B", text: "Bahkan" },
        { key: "C", text: "Akan tetapi" },
        { key: "D", text: "Sebaliknya" },
        { key: "E", text: "Oleh karena itu" }
      ],
      ans: "RIGHT:E",
      exp: "'Oleh karena itu' dan 'oleh sebab itu' merupakan konjungsi antarkalimat yang menyatakan hubungan konsekuensi logis atau akibat."
    },
    {
      text: "Cermatilah kutipan cerpen berikut:\n'Pak Darmo menatap nanar hamparan hutan jati yang kini luluh lantak rata dengan tanah. Tangannya gemetar mencengkeram cangkul tua miliknya. Tiada sepatah kata pun terucap, namun kedua matanya yang basah merefleksikan kepedihan mendalam atas hilangnya mata air desa.'\n\nMetode penokohan yang digunakan pengarang untuk menggambarkan karakter Pak Darmo adalah teknik...",
      kompetensi: "Teknik Penokohan Prosa Fiksi",
      options: [
        { key: "A", text: "Analitik langsung tanpa tindakan" },
        { key: "B", text: "Narasi historis kronologis" },
        { key: "C", text: "Monolog batin intelektual" },
        { key: "D", text: "Dramatik melalui tindakan, ekspresi fisik, dan gestur tokoh" },
        { key: "E", text: "Percakapan verbal dengan tokoh sampingan" }
      ],
      ans: "RIGHT:D",
      exp: "Teknik dramatik memperlihatkan karakter tokoh melalui tingkah laku jasmaniah, tatapan mata, dan gestur tanpa pernyataan langsung pengarang."
    },
    {
      text: "Dalam apresiasi prosa fiksi bertema lingkungan hidup (ekokritik sastra), amanat moral yang paling hakiki yang lazim diinternalisasikan pembaca adalah...",
      kompetensi: "Apresiasi Nilai Ekologis Prosa Fiksi",
      options: [
        { key: "A", text: "Kewajiban menjaga keseimbangan ekosistem dan kearifan lokal demi kelestarian generasi mendatang" },
        { key: "B", text: "Pemanfaatan sumber daya alam secara eksploitatif demi mengejar surplus ekonomi maksimal" },
        { key: "C", text: "Penolakan terhadap seluruh bentuk kemajuan teknologi dan infrastruktur modern" },
        { key: "D", text: "Pelimpahan seluruh tanggung jawab kebersihan lingkungan hanya kepada aparat pemerintah" },
        { key: "E", text: "Keharusan merelokasi seluruh populasi masyarakat adat ke kawasan metropolitan" }
      ],
      ans: "RIGHT:A",
      exp: "Prosa bertema lingkungan menekankan pesan etika ekologis (ekosentrisme), tanggung jawab kemanusiaan, dan pelestarian bumi."
    },
    {
      text: "Cermatilah bait puisi berikut:\n'Derak ranting kering terinjak langkahku\nAngin pegunungan membelai lembut kulit pipi\nDinginnya meresap hingga ke celah sumsum tulang.'\n\nCitraan yang mendominasi baris kedua dan ketiga puisi di atas adalah citraan...",
      kompetensi: "Analisis Citraan Taktil / Perabaan dalam Puisi",
      options: [
        { key: "A", text: "Penglihatan (visual)" },
        { key: "B", text: "Penciuman (olfaktori)" },
        { key: "C", text: "Perabaan (taktil)" },
        { key: "D", text: "Pencecapan (gustatori)" },
        { key: "E", text: "Gerak kinetik semata" }
      ],
      ans: "RIGHT:C",
      exp: "'Membelai lembut kulit pipi' dan 'dinginnya meresap hingga ke celah sumsum' merupakan stimuli indra peraba (taktil)."
    },
    {
      text: "Larik puisi yang memanfaatkan majas personifikasi secara tepat di bawah ini adalah...",
      kompetensi: "Gaya Bahasa Personifikasi Puisi",
      options: [
        { key: "A", text: "Suaranya menggelegar membelah angkasa raya" },
        { key: "B", text: "Malam merayap sunyi memeluk keluh kesah para musafir" },
        { key: "C", text: "Wajahnya laksana rembulan purnama di langit kelam" },
        { key: "D", text: "Seribu pulau menyatu dalam ikatan nusantara nan permai" },
        { key: "E", text: "Darahnya mendidih mendengar fitnah keji yang beredar" }
      ],
      ans: "RIGHT:B",
      exp: "'Malam merayap sunyi memeluk' memberikan sifat insani (merayap, memeluk) kepada entitas non-manusia (malam), yakni majas personifikasi."
    },
    {
      text: "Dalam apresiasi puisi tingkat lanjut, kata konkret (concrete words) memiliki peranan vital untuk...",
      kompetensi: "Fungsi Kata Konkret dalam Struktur Fisik Puisi",
      options: [
        { key: "A", text: "Menyamarkan arti sebenarnya agar pembaca merasa bingung" },
        { key: "B", text: "Memenuhi jumlah suku kata agar rima pantun terbentuk sempurna" },
        { key: "C", text: "Menggantikan seluruh kosakata bahasa baku dengan istilah asing" },
        { key: "D", text: "Menghilangkan keharusan interpretasi makna konotatif puisi" },
        { key: "E", text: "Membangkitkan daya imajinasi pencerapan indra pembaca secara nyata dan terukur" }
      ],
      ans: "RIGHT:E",
      exp: "Kata konkret berfungsi memperjelas pengimajian pembaca sehingga objek puitik dapat dibayangkan secara inderawi."
    },
    {
      text: "Penyusunan tata letak larik, kerapatan bait, tanda baca, serta penggunaan huruf kapital dalam puisi modern dikenal dengan istilah...",
      kompetensi: "Struktur Fisik Puisi (Tipografi)",
      options: [
        { key: "A", text: "Diksi" },
        { key: "B", text: "Rima" },
        { key: "C", text: "Asonansi" },
        { key: "D", text: "Tipografi" },
        { key: "E", text: "Enjambemen" }
      ],
      ans: "RIGHT:D",
      exp: "Tipografi merupakan perwajahan fisik puisi, meliputi susunan baris, bait, tepi halaman, dan bentuk visual teks."
    },
    {
      text: "Cermatilah paragraf argumentasi berikut:\n'Singkong mengandung karbohidrat kompleks yang ramah lambung. Ubi jalar kaya akan serat larut dan antioksidan alami. Talas dan sukun terbukti memiliki indeks glikemik rendah yang cocok bagi penderita diabetes. Dengan demikian, aneka umbi-umbian lokal Indonesia memiliki potensi nutrisi unggul untuk mewujudkan diversifikasi pangan sehat.'\n\nPola penalaran yang digunakan dalam menyusun paragraf argumentasi di atas adalah...",
      kompetensi: "Penalaran Induktif Teks Argumentasi",
      options: [
        { key: "A", text: "Deduktif silogistis" },
        { key: "B", text: "Induktif generalisasi" },
        { key: "C", text: "Kausalitas terbalik" },
        { key: "D", text: "Analogi komparatif fiktif" },
        { key: "E", text: "Kronologis naratif" }
      ],
      ans: "RIGHT:B",
      exp: "Paragraf diawali proposisi khusus (singkong, ubi, talas, sukun) dan diakhiri simpulan umum (aneka umbi lokal berpotensi unggul)."
    },
    {
      text: "Struktur teks berita inovasi yang menampung inti informasi terpenting dan memuat rangkuman unsur 5W+1H pada alur piramida terbalik disebut...",
      kompetensi: "Struktur Kepala Berita (Lead)",
      options: [
        { key: "A", text: "Judul berita (Headline)" },
        { key: "B", text: "Tubuh berita (Body text)" },
        { key: "C", text: "Kepala berita (Lead)" },
        { key: "D", text: "Ekor berita (Tail)" },
        { key: "E", text: "Kaki berita (Footnote)" }
      ],
      ans: "RIGHT:C",
      exp: "Lead (Kepala Berita) menyajikan intisari terpenting berita (5W+1H) pada bagian pembuka sesuai konvensi piramida terbalik."
    },
    {
      text: "Penulisan kalimat langsung dalam naskah berita inovasi yang sesuai dengan kaidah tata bahasa Indonesia baku adalah...",
      kompetensi: "Kaidah Kebahasaan Kalimat Langsung Berita",
      options: [
        { key: "A", text: "\"Inovasi beras singkong ini mampu menghemat devisa impor pangan hingga miliaran rupiah,\" kata Kepala BRIN." },
        { key: "B", text: "\"Inovasi beras singkong ini mampu menghemat devisa impor pangan hingga miliaran rupiah\" Kata Kepala BRIN." },
        { key: "C", text: "Kepala BRIN berkata; \"Inovasi beras singkong ini mampu menghemat devisa impor pangan\"." },
        { key: "D", text: "\"Inovasi beras singkong ini mampu menghemat devisa\", kata: Kepala BRIN." },
        { key: "E", text: "Kepala BRIN mengatakan: 'bahwa beras singkong menghemat devisa'." }
      ],
      ans: "RIGHT:A",
      exp: "Tanda koma diletakkan di dalam tanda petik penutup sebelum keterangan pengiring dengan huruf awal kecil."
    },
    {
      text: "Kepaduan makna antarkalimat dalam sebuah paragraf yang dibangun melalui hubungan semantis yang logis dan harmonis dinamakan...",
      kompetensi: "Koherensi Paragraf Bahasa Indonesia",
      options: [
        { key: "A", text: "Kohesi leksikal semata" },
        { key: "B", text: "Subordinasi kalimat" },
        { key: "C", text: "Variasi sintaksis" },
        { key: "D", text: "Asindeton" },
        { key: "E", text: "Koherensi" }
      ],
      ans: "RIGHT:E",
      exp: "Koherensi adalah keterpaduan jalinan makna antarkalimat, sedangkan kohesi adalah keterpaduan bentuk fisik/gramatikal."
    },
    {
      text: "Di bawah ini yang merupakan ciri khas teks eksplanasi fenomena sosial adalah...",
      kompetensi: "Karakteristik Teks Eksplanasi Sosial",
      options: [
        { key: "A", text: "Berisi konflik antar-tokoh fiksi yang diakhiri resolusi bahagia" },
        { key: "B", text: "Menggunakan kalimat perintah persuasif untuk membeli komoditas" },
        { key: "C", text: "Memuat alur pengembaraan petualangan imajinatif seorang ksatria" },
        { key: "D", text: "Memaparkan hubungan kausalitas dan kronologi terjadinya fenomena kemasyarakatan berbasis fakta ilmiah" },
        { key: "E", text: "Mengedepankan diksi puitis konotatif berima rima ganda" }
      ],
      ans: "RIGHT:D",
      exp: "Teks eksplanasi sosial menguraikan kronologi dan kausalitas kemunculan suatu fenomena masyarakat berdasarkan fakta objektif."
    },
    {
      text: "Jika seorang narator cerpen terlibat langsung sebagai tokoh protagonis yang menuturkan pengalaman pribadinya menggunakan kata ganti orang pertama ('aku' atau 'saya'), sudut pandang yang digunakan adalah...",
      kompetensi: "Sudut Pandang Prosa Fiksi",
      options: [
        { key: "A", text: "Orang pertama pelaku utama" },
        { key: "B", text: "Orang pertama pelaku sampingan" },
        { key: "C", text: "Orang ketiga serba tahu" },
        { key: "D", text: "Orang ketiga terarah / pengamat" },
        { key: "E", text: "Orang kedua jamak" }
      ],
      ans: "RIGHT:A",
      exp: "Sudut pandang orang pertama pelaku utama menempatkan narator 'aku' sebagai poros penggerak utama jalan cerita."
    },
    {
      text: "Nilai kearifan lokal dalam sebuah karya sastra prosa fiksi yang mengedepankan tradisi gotong royong warga desa saat musim panen padi tergolong ke dalam nilai...",
      kompetensi: "Nilai Sosial Budaya dalam Prosa Fiksi",
      options: [
        { key: "A", text: "Politik praktis" },
        { key: "B", text: "Sosial dan budaya" },
        { key: "C", text: "Estetika individualis" },
        { key: "D", text: "Biologis murni" },
        { key: "E", text: "Hukum positif kenegaraan" }
      ],
      ans: "RIGHT:B",
      exp: "Tradisi sambatan dan gotong royong merupakan cerminan luhur nilai sosial dan kebudayaan masyarakat nusantara."
    },
    {
      text: "Persamaan bunyi akhir suku kata pada larik-larik puisi yang menciptakan harmoni keindahan auditif disebut...",
      kompetensi: "Unsur Musikalitas Puisi (Rima)",
      options: [
        { key: "A", text: "Diksi" },
        { key: "B", text: "Latar" },
        { key: "C", text: "Rima" },
        { key: "D", text: "Tema" },
        { key: "E", text: "Majas" }
      ],
      ans: "RIGHT:C",
      exp: "Rima (persajakan) adalah pengulangan bunyi yang berselang, baik di dalam larik maupun pada akhir bait puisi."
    },
    {
      text: "Penulisan kata depan 'di' dan awalan 'di-' yang benar menurut Pedoman Umum Ejaan Bahasa Indonesia (EYD Edisi V) adalah...",
      kompetensi: "Penerapan Ejaan EYD Edisi V (Kata Depan vs Awalan)",
      options: [
        { key: "A", text: "Beras lokal itu di pasarkan diwarung tradisional sekitarnya." },
        { key: "B", text: "Beras lokal itu dipasarkan diwarung tradisional sekitarnya." },
        { key: "C", text: "Beras lokal itu di pasarkan di warung tradisional sekitarnya." },
        { key: "D", text: "Beras lokal itu dipasarkan, di mana-mana di sukai warga." },
        { key: "E", text: "Beras lokal itu dipasarkan di warung tradisional sekitarnya." }
      ],
      ans: "RIGHT:E",
      exp: "Awalan 'di-' pada kata kerja pasif ditulis serangkai (dipasarkan), sedangkan kata depan 'di' penunjuk tempat ditulis terpisah (di warung)."
    },
    {
      text: "Tanda baca titik koma (;) yang digunakan secara tepat menurut kaidah bahasa Indonesia baku berfungsi untuk...",
      kompetensi: "Kaidah Penggunaan Tanda Baca Titik Koma",
      options: [
        { key: "A", text: "Mengakhiri kalimat tanya retoris yang tidak butuh jawaban" },
        { key: "B", text: "Mengapit keterangan aposisi yang disisipkan di tengah kalimat" },
        { key: "C", text: "Menghubungkan dua suku kata yang terpotong oleh batas ujung baris" },
        { key: "D", text: "Memisahkan bagian-bagian kalimat sejenis dan setara pengganti kata penghubung" },
        { key: "E", text: "Menandai kutipan langsung yang bersumber dari pembicaraan narasumber" }
      ],
      ans: "RIGHT:D",
      exp: "Tanda titik koma (;) dapat dipakai sebagai pengganti kata penghubung untuk memisahkan kalimat setara dalam kalimat majemuk."
    },
    {
      text: "Cermatilah kalimat berikut:\n'Banyak murid-murid saling tolong-menolong dalam rangka demi membantu korban bencana banjir.'\n\nPerbaikan kalimat di atas agar menjadi kalimat efektif yang hemat dan lugas adalah...",
      kompetensi: "Penyuntingan Kalimat Efektif Baku",
      options: [
        { key: "A", text: "Murid-murid tolong-menolong demi membantu korban bencana banjir." },
        { key: "B", text: "Para murid saling tolong-menolong demi untuk membantu korban banjir." },
        { key: "C", text: "Banyak murid-murid tolong-menolong untuk membantu korban banjir." },
        { key: "D", text: "Murid-murid saling tolong-menolong membantu korban bencana banjir." },
        { key: "E", text: "Semua para murid saling tolong-menolong dalam membantu korban." }
      ],
      ans: "RIGHT:D",
      exp: "Opsi D menghilangkan pemborosan kata (pleonasme 'banyak murid-murid' -> 'murid-murid', serta 'dalam rangka demi' -> 'membantu')."
    },
    {
      text: "Dalam teks eksplanasi tentang fenomena urbanisasi, kalimat yang menyatakan hubungan sebab-akibat (kausalitas) adalah...",
      kompetensi: "Kalimat Kausalitas Eksplanasi Sosial",
      options: [
        { key: "A", text: "Kota Jakarta didirikan pada tanggal 22 Juni berabad-abad silam." },
        { key: "B", text: "Minimnya lapangan kerja di pedesaan menyebabkan laju perpindahan penduduk ke kota semakin meningkat." },
        { key: "C", text: "Pemerintah pusat memindahkan ibu kota baru ke Pulau Kalimantan Timur." },
        { key: "D", text: "Gedung-gedung pencakar langit menjulang tinggi di sepanjang jalan protokol." },
        { key: "E", text: "Masyarakat urban terbiasa menggunakan moda transportasi kereta rel listrik." }
      ],
      ans: "RIGHT:B",
      exp: "Kata kerja kausatif 'menyebabkan' menghubungkan klausa sebab (minimnya lapangan kerja) dan akibat (laju perpindahan meningkat)."
    },
    {
      text: "Penokohan analitik dalam cerpen ditandai dengan...",
      kompetensi: "Karakteristik Penokohan Analitik",
      options: [
        { key: "A", text: "Perilaku tokoh yang dibiarkan disimpulkan sendiri oleh pembaca" },
        { key: "B", text: "Dialog antar-tokoh yang saling berselisih paham" },
        { key: "C", text: "Pengarang secara langsung memaparkan watak dan kepribadian tokoh kepada pembaca" },
        { key: "D", text: "Penggambaran busana dan lingkungan tempat tinggal tokoh" },
        { key: "E", text: "Perubahan psikologis tokoh setelah mengalami bencana" }
      ],
      ans: "RIGHT:C",
      exp: "Metode analitik (langsung) adalah cara pengarang mendeskripsikan sifat tokoh secara eksplisit tanpa melalui perantara tindakan."
    },
    {
      text: "Cermatilah bait puisi berikut:\n'Hati ini remuk redam laksana pualam pecah\nMelihat ladang bapak kekeringan menanti setetes embun\nKapankah musim semi kan singgah kembali?'\n\nSuasana batin yang terbangun dalam bait puisi tersebut adalah...",
      kompetensi: "Menentukan Suasana Batin Puisi",
      options: [
        { key: "A", text: "Gembira ria menyambut keberhasilan panen" },
        { key: "B", text: "Penuh semangat juang merebut kemerdekaan" },
        { key: "C", text: "Santai dan tenang menikmati keindahan sore" },
        { key: "D", text: "Acuh tak acuh terhadap nasib sesama petani" },
        { key: "E", text: "Duka lara, prihatin, dan penuh keputusasaan" }
      ],
      ans: "RIGHT:E",
      exp: "Diksi 'remuk redam', 'kekeringan', dan pertanyaan retoris ratapan menggambarkan suasana keprihatinan mendalam (duka lara)."
    },
    {
      text: "Kesesatan berpikir (logical fallacy) dalam teks argumentasi yang menyerang pribadi lawan bicara dan bukan membantah argumennya dinamakan...",
      kompetensi: "Evaluasi Kritis Argumen (Logical Fallacy)",
      options: [
        { key: "A", text: "Hasty generalization (generalisasi tergesa-gesa)" },
        { key: "B", text: "False dichotomy (dilema palsu)" },
        { key: "C", text: "Straw man fallacy (argumen orang-orangan jerami)" },
        { key: "D", text: "Argumentum ad hominem" },
        { key: "E", text: "Post hoc ergo propter hoc" }
      ],
      ans: "RIGHT:D",
      exp: "Ad hominem adalah kecacatan logika di mana seseorang menyerang karakter/pribadi pihak lawan ketimbang substansi dalilnya."
    },
    {
      text: "Dalam teks persuasi, kata-kata yang berfungsi mengajak atau mengimbau pembaca untuk melakukan sesuatu secara sadar disebut kata kerja...",
      kompetensi: "Diksi Imperatif / Persuasif Ajakan",
      options: [
        { key: "A", text: "Deskriptif material" },
        { key: "B", text: "Imperatif ajakan (persuasif) seperti 'ayo' dan 'marilah'" },
        { key: "C", text: "Mental reflektif seperti 'merasa' dan 'mengira'" },
        { key: "D", text: "Relasional penjelas seperti 'merupakan' dan 'adalah'" },
        { key: "E", text: "Pasif inversi" }
      ],
      ans: "RIGHT:B",
      exp: "Kata ajakan seperti 'marilah', 'ayo', 'hendaknya' adalah penanda gramatikal khas teks persuasi untuk memengaruhi sikap pembaca."
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

  const seniTariSinglePool = [
    {
      text: "Unsur utama dalam seni tari yang berkaitan erat dengan gerak seluruh anggota tubuh manusia sebagai media ungkapan estetis dinamakan...",
      kompetensi: "Unsur Utama Seni Tari (Wiraga)",
      options: [
        { key: "A", text: "Wiraga (Raga / Gerak Tubuh)" },
        { key: "B", text: "Wirama (Irama / Musik Pengiring)" },
        { key: "C", text: "Wirasa (Penjiwaan / Rasa Emosional)" },
        { key: "D", text: "Wirupa (Tata Rias dan Busana)" },
        { key: "E", text: "Tata Panggung" }
      ],
      ans: "RIGHT:A",
      exp: "Wiraga adalah unsur utama seni tari yang merujuk pada keindahan gerak raga/tubuh penari."
    },
    {
      text: "Kesesuaian ritme, tempo, dan ketukan antara gerak tari dengan alunan musik pengiring dinamakan unsur...",
      kompetensi: "Unsur Musikalitas Seni Tari (Wirama)",
      options: [
        { key: "A", text: "Wirama (Irama Musik)" },
        { key: "B", text: "Wiraga (Raga Gerak)" },
        { key: "C", text: "Wirasa (Ekspresi Wajah)" },
        { key: "D", text: "Pola Lantai" },
        { key: "E", text: "Properti Tari" }
      ],
      ans: "RIGHT:A",
      exp: "Wirama menuntut penari menyesuaikan dinamika dan tempo geraknya secara harmonis dengan alunan musik pengiring."
    },
    {
      text: "Garis-garis di atas panggung yang dilalui oleh penari atau formasi kelompok penari saat melakukan pergerakan pertunjukan disebut...",
      kompetensi: "Desain Ruang & Formasi Tari (Pola Lantai)",
      options: [
        { key: "A", text: "Pola Lantai (Floor Pattern)" },
        { key: "B", text: "Desain Bawah" },
        { key: "C", text: "Level Ketinggian" },
        { key: "D", text: "Desain Atas" },
        { key: "E", text: "Arah Hadap" }
      ],
      ans: "RIGHT:A",
      exp: "Pola lantai adalah denah atau lintasan panggung yang dibentuk oleh penari untuk memperindah susunan kelompok."
    },
    {
      text: "Penjiwaan emosional, penggambaran karakter, dan penghayatan ekspresi wajah penari saat membawakan suatu tarian dinamakan unsur...",
      kompetensi: "Ekspresi & Penjiwaan Seni Tari (Wirasa)",
      options: [
        { key: "A", text: "Wirasa (Penyampaian Rasa)" },
        { key: "B", text: "Wiraga" },
        { key: "C", text: "Wirama" },
        { key: "D", text: "Pola Panggung" },
        { key: "E", text: "Level Gerak" }
      ],
      ans: "RIGHT:A",
      exp: "Wirasa adalah kemampuan penari menyampaikan pesan rasa dan emosi tarian melalui penjiwaan wajah dan mimik."
    },
    {
      text: "Fungsi utama tata rias dan tata busana dalam pementasan seni tari tradisi maupun kreasi adalah...",
      kompetensi: "Pendukung Pertunjukan Tari (Tata Rias & Busana)",
      options: [
        { key: "A", text: "Pertegas karakter tokoh, wujud peran, dan estetika penampilan penari" },
        { key: "B", text: "Menggantikan peran irama musik pengiring tari" },
        { key: "C", text: "Menentukan arah lintasan pola lantai di atas panggung" },
        { key: "D", text: "Mengatur intensitas pencahayaan lampu panggung" },
        { key: "E", text: "Menutupi kesalahan teknik gerak kaki penari" }
      ],
      ans: "RIGHT:A",
      exp: "Tata rias dan busana membantu memperjelas watak, usia, status sosial, dan tema tarian yang dibawakan penari."
    }
  ];

  const seniMusikSinglePool = [
    {
      text: "Elemen musik yang menunjukkan tingkatan panjang pendeknya bunyi yang terdengar berulang secara teratur dinamakan...",
      kompetensi: "Unsur-Unsur Musik (Ritme / Irama)",
      options: [
        { key: "A", text: "Ritme / Irama" },
        { key: "B", text: "Melodi" },
        { key: "C", text: "Harmoni" },
        { key: "D", text: "Timbre" },
        { key: "E", text: "Dinamika" }
      ],
      ans: "RIGHT:A",
      exp: "Ritme adalah penataan urutan nada berdasarkan durasi waktu yang berulang secara teratur."
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
    },
    {
      text: "Seorang wirausahawan Prakarya yang bekerja dengan sungguh-sungguh tanpa terpengaruh oleh perasaan emosional negatif serta selalu introspeksi diri menerapkan bentuk kerja prestatif...",
      kompetensi: "Sikap Kerja Prestatif Wirausaha",
      options: [
        { key: "A", text: "Kerja Mawas (Emosional Terkendali)" },
        { key: "B", text: "Kerja Ikhlas" },
        { key: "C", text: "Kerja Cerdas" },
        { key: "D", text: "Kerja Keras Fisik" },
        { key: "E", text: "Kerja Tuntas" }
      ],
      ans: "RIGHT:A",
      exp: "Kerja mawas diri artinya mampu mengendalikan emosi, introspeksi, dan mengutamakan profesionalisme."
    },
    {
      text: "Tingkat penjualan di mana total pendapatan usaha kerajinan tepat sama dengan total biaya yang dikeluarkan (tidak untung dan tidak rugi) disebut...",
      kompetensi: "Perhitungan Titik Impas / Break Even Point (BEP)",
      options: [
        { key: "A", text: "Break Even Point (BEP)" },
        { key: "B", text: "Return on Investment (ROI)" },
        { key: "C", text: "Margin of Safety" },
        { key: "D", text: "Payback Period" },
        { key: "E", text: "Net Present Value" }
      ],
      ans: "RIGHT:A",
      exp: "BEP (Break Even Point) adalah titik impas di mana total revenue sama dengan total cost."
    },
    {
      text: "Menggali ide produk kerajinan yang terinspirasi dari cerita rakyat, mitos, tarian daerah, atau lagu tradisional tergolong dalam kelompok kerajinan berdasarkan inspirasi...",
      kompetensi: "Kerajinan Inspirasi Budaya Lokal Nonbenda",
      options: [
        { key: "A", text: "Budaya Lokal Nonbenda (Nirmatra)" },
        { key: "B", text: "Artefak / Objek Budaya Fisik" },
        { key: "C", text: "Rekayasa Mekanik Modern" },
        { key: "D", text: "Teknologi Tepat Guna" },
        { key: "E", text: "Grafika Digital Vektor" }
      ],
      ans: "RIGHT:A",
      exp: "Cerita rakyat, mitos, tarian, dan lagu adalah warisan budaya takbenda (nonbenda) yang dapat menginspirasi bentuk kerajinan."
    },
    {
      text: "Proses mengolah kembali limbah plastik bekas kemasan minuman menjadi tas atau dompet belanja tanpa mengubah struktur molekul dasarnya dinamakan prinsip...",
      kompetensi: "Pengolahan Bahan Limbah (Recycle & Reuse)",
      options: [
        { key: "A", text: "Recycle (Daur Ulang Kreatif)" },
        { key: "B", text: "Redefine" },
        { key: "C", text: "Recharge" },
        { key: "D", text: "Replacement" },
        { key: "E", text: "Refining" }
      ],
      ans: "RIGHT:A",
      exp: "Recycle adalah mendaur ulang sampah/limbah menjadi barang kerajinan baru yang memiliki nilai guna dan nilai ekonomi."
    },
    {
      text: "Dalam pembuatan kerajinan tekstil, prinsip hiasan yang menitikberatkan pada pembuatan ragam hias pada permukaan kain setelah kain selesai dibuat dinamakan...",
      kompetensi: "Prinsip Desain Kerajinan Tekstil",
      options: [
        { key: "A", text: "Desain Hias (Decorative Design)" },
        { key: "B", text: "Desain Struktural (Structural Design)" },
        { key: "C", text: "Desain Geometris Murni" },
        { key: "D", text: "Desain Industri Masal" },
        { key: "E", text: "Desain Ergonomis Otomatis" }
      ],
      ans: "RIGHT:A",
      exp: "Decorative design (desain hias) adalah sentuhan hiasan (sulam, bordir, sablon) yang ditambahkan pada permukaan kerajinan tekstil."
    },
    {
      text: "Tahapan produksi kerajinan di mana ide-ide kreatif dituangkan dalam bentuk visual berupa gambar visualisasi awal sebelum dijadikan produk nyata disebut...",
      kompetensi: "Tahapan Produksi & Sketsa Kerajinan",
      options: [
        { key: "A", text: "Pembuatan Sketsa (Rancang Visual)" },
        { key: "B", text: "Finishing & Pengemasan" },
        { key: "C", text: "Perakitan Komponen" },
        { key: "D", text: "Analisis Pasar Eksternal" },
        { key: "E", text: "Pembahanan Baku" }
      ],
      ans: "RIGHT:A",
      exp: "Membuat sketsa adalah langkah menerjemahkan ide pemikiran menjadi rancangan gambar visual."
    },
    {
      text: "Teknik cetak dalam produk grafika yang menggunakan acuan cetak berupa kasa/screen yang dilapisi bahan peka cahaya (emulsi) seperti pada sablon dinamakan...",
      kompetensi: "Produk Grafika & Teknik Cetak Saring",
      options: [
        { key: "A", text: "Cetak Saring (Screen Printing / Sablon)" },
        { key: "B", text: "Cetak Tinggi (Relief Print / Woodcut)" },
        { key: "C", text: "Cetak Dalam (Intaglio / Etching)" },
        { key: "D", text: "Cetak Datar (Lithography / Offset)" },
        { key: "E", text: "Cetak Fotografi Analog" }
      ],
      ans: "RIGHT:A",
      exp: "Cetak saring (sablon) menggunakan screen bermesh halus untuk mentransfer tinta ke media cetak."
    },
    {
      text: "Alat pengatur gerak sederhana berbasis sistem mekanik/elektronik yang berfungsi memutus dan menghubungkan arus listrik secara otomatis dinamakan...",
      kompetensi: "Rekayasa Sistem Alat Pengatur Gerak",
      options: [
        { key: "A", text: "Sakelar / Relay Otomatis" },
        { key: "B", text: "Transformator Step-Down" },
        { key: "C", text: "Resistor Tetap" },
        { key: "D", text: "Kapasitor Elektrolit" },
        { key: "E", text: "Induktor Ferit" }
      ],
      ans: "RIGHT:A",
      exp: "Sakelar atau sakelar otomatis (relay) berfungsi mengendalikan aliran arus listrik dalam sistem rekayasa."
    },
    {
      text: "Penggunaan alat pelindung diri (APD) seperti kacamata goggle, sarung tangan, dan masker saat proses pengamplasan dan pemotongan bahan kerajinan merupakan penerapan standar...",
      kompetensi: "Keselamatan dan Kesehatan Kerja (K3)",
      options: [
        { key: "A", text: "K3 (Keselamatan dan Kesehatan Kerja)" },
        { key: "B", text: "BOM (Bill of Materials)" },
        { key: "C", text: "SOP Distribusi" },
        { key: "D", text: "TQM (Total Quality Management)" },
        { key: "E", text: "ISO 9001 Manajemen Administrasi" }
      ],
      ans: "RIGHT:A",
      exp: "Penerapan K3 bertujuan melindungi tenaga kerja dari bahaya kecelakaan dan penyakit akibat kerja."
    },
    {
      text: "Dalam wirausaha rekayasa alat elektronik sederhana, sumber arus listrik yang berasal dari baterai atau akumulator (aki) dinamakan arus...",
      kompetensi: "Kelistrikan Dasar Produk Rekayasa",
      options: [
        { key: "A", text: "DC (Direct Current / Arus Searah)" },
        { key: "B", text: "AC (Alternating Current / Arus Bolak-Balik)" },
        { key: "C", text: "Arus Induksi Magnetik High Frequency" },
        { key: "D", text: "Arus Reaktansi Kapasitif" },
        { key: "E", text: "Arus Tiga Fasa" }
      ],
      ans: "RIGHT:A",
      exp: "Baterai dan aki menghasilkan arus searah atau Direct Current (DC)."
    },
    {
      text: "Metode pemasaran langsung produk kerajinan di mana produsen menjual barang secara tatap muka atau melalui pameran tanpa perantara grosir dinamakan...",
      kompetensi: "Strategi Pemasaran Langsung (Direct Marketing)",
      options: [
        { key: "A", text: "Pemasaran Langsung (Direct Selling)" },
        { key: "B", text: "Pemasaran Konsinyasi Bertingkat" },
        { key: "C", text: "Distribusi Grosir Skala Besar" },
        { key: "D", text: "Importir Tunggal" },
        { key: "E", text: "Franchise Lisensi Internasional" }
      ],
      ans: "RIGHT:A",
      exp: "Direct selling adalah penjualan langsung produk kerajinan dari wirausahawan ke konsumen akhir."
    },
    {
      text: "Karakteristik wirausahawan yang siap menanggung risiko terhitung (calculated risk) atas keputusan usaha kerajinan yang diambil disebut...",
      kompetensi: "Karakteristik Wirausahawan Sukses",
      options: [
        { key: "A", text: "Berani Mengambil Risiko Terukur" },
        { key: "B", text: "Pengambil Risiko Tanpa Perhitungan" },
        { key: "C", text: "Sifat Konservatif Pasif" },
        { key: "D", text: "Ketergantungan pada Investor" },
        { key: "E", text: "Sikap Egosentris" }
      ],
      ans: "RIGHT:A",
      exp: "Wirausahawan unggul tidak takut mengambil risiko, namun risiko tersebut telah dikalkulasi dengan matang."
    },
    {
      text: "Hasil cetakan pada teknik cetak tinggi (relief print) diperoleh dari bagian acuan cetak yang...",
      kompetensi: "Produk Grafika Cetak Tinggi (Relief)",
      options: [
        { key: "A", text: "Menjolak / Timbul (Lebih Tinggi dari Permukaan Dasar)" },
        { key: "B", text: "Cekung / Terdalam ke Dalam Acuan" },
        { key: "C", text: "Rata Sama Tinggi dengan Seluruh Acuan" },
        { key: "D", text: "Berlubang-lubang Mikroskopis" },
        { key: "E", text: "Cair Transparan" }
      ],
      ans: "RIGHT:A",
      exp: "Cetak tinggi (seperti stempel/woodcut) memanfaatkan bagian acuan yang menonjol untuk menerima tinta."
    },
    {
      text: "Membuat sampel awal produk kerajinan dalam bentuk 3D yang berfungsi untuk diuji kekuatan struktur dan estetika fungsinya dinamakan proses...",
      kompetensi: "Prototyping Produk Kerajinan",
      options: [
        { key: "A", text: "Prototyping (Pembuatan Model Tiruan Awal)" },
        { key: "B", text: "Mass Production" },
        { key: "C", text: "Brainstorming Curah Pendapat" },
        { key: "D", text: "Quality Audit SNI" },
        { key: "E", text: "Pemasaran Konsinyasi" }
      ],
      ans: "RIGHT:A",
      exp: "Prototyping adalah tahapan membuat sampel fisik awal (model tiruan 3D) untuk evaluasi dan uji coba produk."
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

  if (isTariSubject) currentSinglePool = seniTariSinglePool;
  else if (isMusikSubject) currentSinglePool = seniMusikSinglePool;
  else if (isJawaSubject) currentSinglePool = jawaSinglePool;
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
  else if (isSeniSubject || isRupaSubject) currentSinglePool = seniSinglePool;
  else if (isPkwuSubject) currentSinglePool = pkwuSinglePool;
  else if (isInformaticsSubject) currentSinglePool = informaticsSinglePool;
  else if (isIndoSubject) currentSinglePool = indoSinglePool;
  else if (isMathSubject) currentSinglePool = mathSinglePool;
  else if (isArabicSubject || isFiqihSubject) currentSinglePool = arabicFiqihSinglePool;

  for (let i = 0; i < pgCount; i++) {
    // Pure curricular question rotation without synthetic meta-pedagogy questions
    const item = currentSinglePool[i % currentSinglePool.length];
    const textStr = item.text;
    const kompetensiTarget = item.kompetensi;
    const options = item.options.map(opt => ({ ...opt }));
    const ans = item.ans;
    const exp = item.exp;

    questions.push({
      id: `gen-q-${num}`,
      number: num,
      type: 'single_choice',
      text: textStr,
      isArabic: !!(item as any).isArabic,
      hasLatex: isMathSubject,
      difficulty: i % 3 === 0 ? 'mudah' : i % 3 === 1 ? 'sedang' : 'sulit',
      kompetensiTarget: kompetensiTarget,
      options: options,
      rawRightAnswer: ans,
      explanation: exp
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
        { key: "A", text: "Sagu sangat layak menggantikan beras sebagai makanan pokok utama masyarakat" },
        { key: "B", text: "Kandungan karbohidrat per 100 gram singkong kering setara dengan nasi putih" },
        { key: "C", text: "Sepertinya masyarakat perkotaan lebih memilih tiwul instan karena kepraktisannya" },
        { key: "D", text: "Tanaman sukun dapat dibudidayakan di daerah lahan marginal kering" },
        { key: "E", text: "Inovasi makanan olahan talas dirasa belum maksimal dipromosikan oleh instansi terkait" }
      ],
      ans: "RIGHT:A,C,E"
    },
    {
      text: "Manakah di antara ciri-ciri kebahasaan berikut yang menjadi karakteristik baku teks eksplanasi ilmiah? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Kaidah Kebahasaan Teks Eksplanasi",
      options: [
        { key: "A", text: "Menggunakan istilah ilmiah/teknis yang relevan dengan bidang ilmu yang dibahas" },
        { key: "B", text: "Menggunakan konjungsi kausalitas (seperti: sebab, karena, oleh karena itu)" },
        { key: "C", text: "Menggunakan kata ganti orang pertama (aku, saya) secara dominan dalam narasi" },
        { key: "D", text: "Banyak memakai kalimat pasif dan kata kerja material atau relasional" },
        { key: "E", text: "Memuat alur pengembaraan tokoh fiktif dengan dialog dramatik" }
      ],
      ans: "RIGHT:A,B,D"
    },
    {
      text: "Dalam kajian apresiasi puisi, manakah butir-butir berikut yang tergolong ke dalam struktur batin (hakikat puisi)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Klasifikasi Struktur Batin Puisi",
      options: [
        { key: "A", text: "Tipografi dan tata wajah larik" },
        { key: "B", text: "Tema (gagasan pokok/sense)" },
        { key: "C", text: "Rasa / perasaan penyair (feeling)" },
        { key: "D", text: "Diksi dan asonansi rima" },
        { key: "E", text: "Amanat / pesan moral (intention)" }
      ],
      ans: "RIGHT:B,C,E"
    },
    {
      text: "Manakah di antara unsur-unsur berikut yang memperkuat keotentikan cerita pendek bertema lingkungan dan kearifan lokal nusantara? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Unsur Cerpen Kearifan Lokal & Lingkungan",
      options: [
        { key: "A", text: "Penggambaran latar tempat alamiah pedesaan atau pesisir secara detail dan hidup" },
        { key: "B", text: "Penyertaan nilai tradisi adat istiadat leluhur dalam menjaga ekosistem hutan atau mata air" },
        { key: "C", text: "Penggunaan istilah sains antariksa yang sama sekali tidak berhubungan dengan konteks" },
        { key: "D", text: "Penyajian konflik batin masyarakat adat menghadapi ancaman deforestasi modern" },
        { key: "E", text: "Peniadaan penokohan dan alur cerita demi estetika abstrak" }
      ],
      ans: "RIGHT:A,B,D"
    },
    {
      text: "Manakah di antara syarat-syarat berikut yang wajib dipenuhi agar suatu kalimat dinyatakan sebagai kalimat efektif? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Syarat-Syarat Kalimat Efektif Baku",
      options: [
        { key: "A", text: "Kesepadanan struktur (memiliki unsur subjek dan predikat yang jelas)" },
        { key: "B", text: "Menggunakan pengulangan kata bersinonim (pleonasme) agar lebih puitis" },
        { key: "C", text: "Kehematan kata (tidak bertele-tele atau menggunakan kata jamak berulang)" },
        { key: "D", text: "Keparalelan bentuk (kesamaan bentuk gramatikal kata dalam perincian)" },
        { key: "E", text: "Penghapusan tanda baca koma dan titik di sepanjang paragraf" }
      ],
      ans: "RIGHT:A,C,D"
    },
    {
      text: "Manakah larik-larik kutipan puisi berikut yang memanfaatkan majas perbandingan (metafora atau simile)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Majas Perbandingan Puisi",
      options: [
        { key: "A", text: "Matahari memancarkan sinar ultraviolet setiap siang" },
        { key: "B", text: "Senyummu laksana telaga zamrud di tengah padang pasir" },
        { key: "C", text: "Waktu adalah pedang bermata dua yang tak kenal ampun" },
        { key: "D", text: "Angin bertiup kencang dengan kecepatan empat puluh knot" },
        { key: "E", text: "Bocah malang itu adalah bintang kejora bagi kedua orang tuanya" }
      ],
      ans: "RIGHT:B,C,E"
    },
    {
      text: "Manakah di antara unsur 5W+1H berikut yang wajib ada pada bagian kepala berita (lead) teks berita inovasi? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Kelengkapan Unsur Kepala Berita",
      options: [
        { key: "A", text: "What (Peristiwa/inovasi apa yang diciptakan)" },
        { key: "B", text: "Who (Siapa tokoh/lembaga pencipta inovasi)" },
        { key: "C", text: "Why (Mengapa inovasi tersebut urgen dikembangkan)" },
        { key: "D", text: "Gossip pribadi kehidupan asmara sang ilmuwan" },
        { key: "E", text: "Prediksi astronomi ratusan tahun mendatang" }
      ],
      ans: "RIGHT:A,B,C"
    },
    {
      text: "Manakah di bawah ini yang merupakan ciri-ciri dari penalaran deduktif dalam sebuah esai argumentasi? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Karakteristik Penalaran Deduktif",
      options: [
        { key: "A", text: "Diawali dari premis-premis pengamatan kasus khusus baru disimpulkan di akhir" },
        { key: "B", text: "Dimulai dari pernyataan umum atau dalil teoretis (tesis) sebagai premis mayor" },
        { key: "C", text: "Kesimpulan bersifat spekulatif tanpa jaminan kebenaran dari premisnya" },
        { key: "D", text: "Diikuti penjelasan terperinci, contoh bukti, dan data penjelas sebagai premis minor" },
        { key: "E", text: "Menghasilkan simpulan logis yang diturunkan langsung dari premis dasarnya" }
      ],
      ans: "RIGHT:B,D,E"
    },
    {
      text: "Manakah di antara kutipan teks deskripsi berikut yang memuat pencerapan indra penglihatan (visual) dan pendengaran (auditif)? (Pilihlah semua jawaban yang benar)",
      kompetensi: "Identifikasi Citraan Pancaindra Teks Deskripsi",
      options: [
        { key: "A", text: "Air terjun perak itu bergemuruh deras menghantam bebatuan hitam di dasar lembah" },
        { key: "B", text: "Rasa asin air laut terasa pekat di lidah nelayan yang sedang melaut" },
        { key: "C", text: "Kilatan petir menyilaukan mata disusul dentuman guntur yang memekakkan telinga" },
        { key: "D", text: "Aroma melati semerbak tercium lembut dari sanggul pengantin" },
        { key: "E", text: "Ombak putih berbuih mendesir merdu menyapu pasir pantai yang keemasan" }
      ],
      ans: "RIGHT:A,C,E"
    },
    {
      text: "Dalam mengapresiasi teks prosa fiksi kearifan lokal, nilai-nilai kehidupan yang dapat diidentifikasi pembaca mencakup... (Pilihlah semua jawaban yang benar)",
      kompetensi: "Nilai Kehidupan dalam Prosa Fiksi",
      options: [
        { key: "A", text: "Nilai religius (hubungan transendental hamba dengan Sang Pencipta)" },
        { key: "B", text: "Nilai moral / etika (kebajikan bersikap dan menghormati sesama makhluk)" },
        { key: "C", text: "Nilai anarkisme dan permusuhan antargolongan" },
        { key: "D", text: "Nilai sosial gotong royong dan kepedulian lingkungan hidup" },
        { key: "E", text: "Nilai kepasrahan fatalistis tanpa ikhtiar" }
      ],
      ans: "RIGHT:A,B,D"
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
    const textStr = item.text;

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
    },
    {
      text: "Paragraf yang kalimat utamanya atau ide pokoknya terletak di bagian akhir paragraf dinamakan paragraf...",
      kompetensi: "Identifikasi Paragraf Induktif",
      ans: "RIGHT:INDUKTIF",
      exp: "Paragraf induktif meletakkan gagasan pokok di akhir sebagai kesimpulan dari rincian penjelas."
    },
    {
      text: "Kumpulan larik bersajak yang membentuk satu kesatuan unit utuh dalam struktur fisik teks puisi dinamakan...",
      kompetensi: "Struktur Fisik Puisi (Bait)",
      ans: "RIGHT:BAIT",
      exp: "Bait adalah satu kesatuan dalam puisi yang terdiri atas beberapa baris larik."
    },
    {
      text: "Majas atau gaya bahasa yang mengumpamakan benda-benda mati seolah-olah memiliki sifat, perilaku, atau nyawa seperti manusia disebut...",
      kompetensi: "Majas Personifikasi Puisi",
      ans: "RIGHT:PERSONIFIKASI",
      exp: "Personifikasi melekatkan watak insani pada objek nirnyawa."
    },
    {
      text: "Tahapan awal struktur naskah cerita fiksi (cerpen/novel) yang berfungsi mengenalkan tokoh, watak dasar, serta latar ruang dan waktu cerita dinamakan...",
      kompetensi: "Struktur Orientasi Prosa Fiksi",
      ans: "RIGHT:ORIENTASI",
      exp: "Orientasi adalah bagian pengenalan situasi, tokoh, dan latar cerita."
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
    },
    {
      text: "Urutkan susunan tahapan struktur teks eksplanasi ilmiah secara runtut dan logis!",
      kompetensi: "Urutan Struktur Teks Eksplanasi",
      items: [
        { id: 1, text: "Pernyataan Umum (Identifikasi fenomena alam/sosial yang akan diterangkan)" },
        { id: 2, text: "Deretan Penjelas / Kausalitas (Rangkaian proses sebab-akibat terjadinya fenomena)" },
        { id: 3, text: "Interpretasi / Ulasan (Simpulan atau pandangan reflektif atas dampak fenomena)" }
      ]
    },
    {
      text: "Urutkan tahapan alur dramatik (tahapan plot) dalam karya prosa fiksi naratif dari awal hingga akhir!",
      kompetensi: "Urutan Alur Plot Prosa Fiksi",
      items: [
        { id: 1, text: "Pengenalan Situasi Cerita / Orientasi (Introduction)" },
        { id: 2, text: "Pemunculan Masalah / Konflik (Rising Action)" },
        { id: 3, text: "Puncak Ketegangan / Klimaks (Climax)" },
        { id: 4, text: "Penyelesaian Masalah / Resolusi (Resolution / Ending)" }
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
    },
    {
      text: "Jodohkan kutipan baris puisi berikut dengan gaya bahasa (majas) dominan yang digunakannya!",
      kompetensi: "Kecocokan Majas Puisi",
      premises: [
        { id: 1, text: "Ombak lautan berlari mengejar bayang-bayang sampan nelayan." },
        { id: 2, text: "Buku adalah jendela dunia yang membuka cakrawala pemikiran." },
        { id: 3, text: "Teriakan semangatnya mengguncang langit dan meretakkan bumi." }
      ],
      responses: [
        { key: "A", text: "Majas Personifikasi (Sifat insani pada objek mati)" },
        { key: "B", text: "Majas Metafora (Perbandingan langsung tanpa kata pembanding)" },
        { key: "C", text: "Majas Hiperbola (Pernyataan berlebih-lebihan melampaui kenyataan)" }
      ]
    },
    {
      text: "Jodohkan bagian struktur teks eksplanasi ilmiah berikut dengan fungsi utamanya!",
      kompetensi: "Kecocokan Fungsi Struktur Eksplanasi",
      premises: [
        { id: 1, text: "Pernyataan Umum" },
        { id: 2, text: "Deretan Penjelas" },
        { id: 3, text: "Interpretasi" }
      ],
      responses: [
        { key: "A", text: "Mengenalkan identitas fenomena alam/sosial yang akan diterangkan" },
        { key: "B", text: "Menguraikan tahapan proses sebab-akibat (kausalitas) secara terperinci" },
        { key: "C", text: "Memberikan simpulan, ulasan, atau evaluasi konsekuensi dari fenomena" }
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
      ans: "Fakta bersifat objektif, memiliki data riil dan teruji kebenarannya. Contoh: 'Sagu mengandung serat pangan larut yang baik untuk kesehatan usus'. Opini bersifat subjektif dan berupa saran/keyakinan penulis. Contoh: 'Sagu terasa jauh lebih nikmat dan lezat jika diolah menjadi kudapan modern'.",
      rubric: "Skor 90-100 jika definisi tepat dan kedua contoh kalimat relevan dengan tema pangan lokal."
    },
    {
      text: "Dalam apresiasi puisi tingkat lanjut, jelaskan bagaimana pemanfaatan kata konkret dan citraan (visual, auditif, atau taktil) dapat membangkitkan suasana batin (mood) pembaca, serta berikan contoh larik puisi yang mengilustrasikannya!",
      kompetensi: "Analisis Citraan dan Diksi Konkret Puisi",
      ans: "Kata konkret dan citraan mengonstruksi imajinasi inderawi pembaca sehingga gagasan abstrak puisi terasa hidup. Contoh: larik 'embun dingin menetes di ujung ranting kering' memadukan citraan penglihatan dan perabaan untuk menciptakan suasana hening dan kesyahduan.",
      rubric: "Skor 90-100 jika penjelasan fungsi citraan mendalam dan disertai contoh larik yang tepat."
    },
    {
      text: "Susunlah sebuah paragraf deretan penjelas (kausalitas) teks eksplanasi ilmiah yang menjelaskan mengapa alih fungsi lahan hutan menjadi perkebunan monokultur dapat memicu bencana banjir bandang dan tanah longsor!",
      kompetensi: "Konstruksi Hubungan Kausalitas Teks Eksplanasi",
      ans: "Penggundulan hutan menghilangkan tajuk pohon penahan laju air hujan dan mengurangi kapasitas infiltrasi tanah karena akar tanaman monokultur dangkal. Akibatnya, air larian permukaan (runoff) meluap drastis, mengikis lapisan tanah humus, dan bermuara menjadi limpasan banjir bandang ke wilayah hilir.",
      rubric: "Skor 90-100 jika memuat hubungan sebab-akibat yang runtut secara ilmiah dengan konjungsi kausalitas yang tepat."
    },
    {
      text: "Bandingkan metode penggambaran karakter tokoh secara analitik (langsung) dan dramatik (tidak langsung) dalam cerpen bertema pelestarian lingkungan hidup! Manakah yang lebih menggugah emosi pembaca beserta alasannya?",
      kompetensi: "Analisis Komparatif Teknik Penokohan Prosa",
      ans: "Metode analitik memaparkan watak secara langsung oleh narator, sedangkan dramatik memperlihatkannya lewat lakuan fisik, dialog, tatapan, dan respon lingkungan. Teknik dramatik umumnya lebih menggugah karena memberikan ruang imajinasi bagi pembaca untuk menyimpulkan kepedihan atau keteguhan tokoh secara langsung.",
      rubric: "Skor 90-100 jika pembandingan kedua teknik akurat disertai argumentasi kritis yang meyakinkan."
    },
    {
      text: "Cermatilah paragraf rumpang berikut:\n'Pemerintah daerah daripada kabupaten Batang di harapkan agar supaya segera merelokasi para pedagang-pedagang ke pasar darurat.'\nIdentifikasi kesalahan kaidah tata bahasa dan ejaan (EYD V) pada kalimat tersebut, lalu tuliskan perbaikan kalimatnya menjadi kalimat yang efektif dan baku!",
      kompetensi: "Penyuntingan Kalimat Efektif dan EYD V",
      ans: "Kesalahan: 1) Pemborosan kata 'daripada', 2) Penulisan kata kerja pasif 'di harapkan' harusnya serangkai 'diharapkan', 3) Pleonasme 'agar supaya' harus dipilih salah satu, 4) Pengulangan jamak 'para pedagang-pedagang' harusnya 'para pedagang'. Perbaikan efektif: 'Pemerintah Kabupaten Batang diharapkan segera merelokasi para pedagang ke pasar darurat.'",
      rubric: "Skor 90-100 jika seluruh kesalahan berhasil diidentifikasi dan hasil penyuntingan memenuhi standar EYD V."
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

// Fallback logic for Admin Documents (KMA 1503/2025 & Kepdirjen Pendis 6077/2025)
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
  jenisAsesmen?: string[],
  selectedKBCList?: string[],
  insersiKBCMap?: Record<string, string>,
  tujuanPembelajaranTeks?: string,
  lintasDisiplinIlmu?: string,
  agendaMadrasah?: string,
  intervalKKTP?: string,
  respondenSurvei?: string,
  skalaSurvei?: string,
  aspekUmpanBalik?: string
) {
  const kbcPillars = Array.isArray(selectedKBCList) && selectedKBCList.length > 0
    ? selectedKBCList
    : ['Cinta Allah & Rasul-Nya', 'Cinta Ilmu', 'Cinta Diri & Sesama'];

  const kbcInsersiRows = kbcPillars.map((pilar, idx) => {
    const customInsersi = insersiKBCMap && insersiKBCMap[pilar] && insersiKBCMap[pilar].trim().length > 0
      ? insersiKBCMap[pilar].trim()
      : `Menginternalisasikan nilai ${pilar} melalui keteladanan adab, diskusi reflektif, dan aksi nyata pada topik ${topikMateri}.`;
    return `| ${idx + 1} | **${pilar}** | ${customInsersi} | Terintegrasi pada kegiatan pendahuluan, diskusi kelompok, dan refleksi penutup |`;
  }).join('\n');

  const kbcInsersiTableMarkdown = `#### Tabel Materi Insersi Kurikulum Berbasis Cinta (KBC — Kepdirjen Pendis 6077/2025)
| No | Pilar Panca Cinta KBC | Materi Insersi, Dalil & Konteks Pembiasaan | Strategi Implementasi KBM |
|:---:|:---|:---|:---|
${kbcInsersiRows}`;

  const dimensi8Default = 'Keimanan dan Ketakwaan terhadap Tuhan YME, Kewargaan (Moderasi Beragama), Penalaran Kritis, Kreativitas, Kolaborasi, Kemandirian, Kesehatan, Komunikasi (Berkeadaban / Ta\'addub)';
  const dimensiList = Array.isArray(dimensiProfilLulusan) && dimensiProfilLulusan.length > 0
    ? dimensiProfilLulusan.join(', ')
    : dimensi8Default;

  if (docType === 'rpp') {
    const jpPtm = jamPerPertemuan || '2 JP (2 x 45 menit)';
    const jmlPtm = jumlahPertemuan || '2 Pertemuan';
    const totalJp = alokasiWaktu || '4 JP';
    const model = modelPembelajaran || 'Problem Based Learning (PBL)';
    const asesmenList = Array.isArray(jenisAsesmen) && jenisAsesmen.length > 0
      ? jenisAsesmen.join(', ')
      : 'Asesmen Diagnostik (Awal), Asesmen Formatif (Proses & LKPD), Asesmen Sikap & Karakter KBC (Jurnal Anekdotal / Observasi Adab), Asesmen Sumatif (Akhir TP)';
    const karakteristik = karakteristikPesertaDidik || 'Kemampuan awal heterogen, kecenderungan gaya belajar visual dan kinestetik, santun dan aktif dalam berdiskusi kelompok.';
    const customTPBlock = tujuanPembelajaranTeks && tujuanPembelajaranTeks.trim().length > 0
      ? tujuanPembelajaranTeks.trim()
      : `1. Peserta didik mampu menjelaskan konsep dasar dan urgensi materi **${topikMateri}** secara komprehensif melalui kajian literatur dan diskusi santun.\n2. Peserta didik mampu menganalisis permasalahan kontekstual terkait **${topikMateri}** dengan bernalar kritis dan teliti.\n3. Peserta didik mampu merumuskan solusi dan mempresentasikan karya/kesimpulan kelompok dengan adab komunikasi yang baik dan penuh percaya diri.`;

    return `# RENCANA PELAKSANAAN PEMBELAJARAN (RPP) PENDEKATAN MENDALAM & KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Penyusunan Berdasarkan KMA 1503/2025 & Kepdirjen Pendis 6077/2025 (Kurikulum Berbasis Cinta & Deep Learning)*

---

### I. ANALISIS KESIAPAN & KARAKTERISTIK PESERTA DIDIK
- **Alokasi Waktu :** ${totalJp} (${jmlPtm} @ ${jpPtm})
- **Karakteristik & Gaya Belajar :** ${karakteristik}
- **Penerapan Diferensiasi Pembelajaran :**
  - **Diferensiasi Konten :** Guru menyajikan materi dalam format modul ajar teks ringkas, tayangan salindia/video infografis, dan studi kasus nyata di lingkungan sekitar.
  - **Diferensiasi Proses :** Peserta didik dikelompokkan secara heterogen dengan scaffolding; siswa yang membutuhkan bimbingan lebih mendapatkan pendampingan intensif, sedangkan siswa mahir diarahkan menjadi tutor sebaya (*peer teaching* berbasis kasih sayang).
  - **Diferensiasi Produk :** Peserta didik diberikan kebebasan memilih bentuk penyajian laporan hasil penugasan (peta konsep visual, resume tertulis terstruktur, atau presentasi lisan).

---

### II. KOMPONEN INTI PEMBELAJARAN
#### 1. Capaian Pembelajaran (CP) Acuan
${capaianPembelajaranTeks || `Pada akhir Fase ${fase}, peserta didik memiliki kemampuan menganalisis, mengonstruksi, dan menerapkan konsep materi ${mapel} dengan penalaran logis, mandiri, berkarakter santun, serta mengamalkan nilai-nilai Panca Cinta KBC dan Aswaja An-Nahdliyah.`}

#### 2. Tujuan Pembelajaran (TP)
${customTPBlock}

#### 3. Indikator Ketercapaian Tujuan Pembelajaran (IKTP)
- Menyebutkan dan mengklasifikasikan istilah serta prinsip pokok materi **${topikMateri}** dengan benar (akurasi minimal 75%).
- Menemukan korelasi antara konsep teori dengan problematika kontekstual yang dihadapi.
- Mengomunikasikan kesimpulan pemecahan masalah dengan bahasa yang santun, logis, dan menghargai perbedaan pendapat (*tasamuh*).

#### 4. Penguatan 8 Dimensi Profil Lulusan & Deep Learning
- **8 Dimensi Profil Lulusan :** ${dimensiList}.
- **Mindful Learning (Berkesadaran) :** Mengajak peserta didik memfokuskan niat *thalabul ilmi* semata-mata mengharap ridha Allah SWT dan menghargai anugerah akal budi.
- **Meaningful Learning (Bermakna) :** Menghubungkan setiap konsep **${topikMateri}** ke dalam kemaslahatan kehidupan sehari-hari di madrasah dan masyarakat.
- **Joyful Learning (Menggembirakan) :** Menciptakan suasana belajar yang hangat, ramah anak, dialogis, apresiatif, dan bebas perundungan.

${kbcInsersiTableMarkdown}

---

### III. LANGKAH-LANGKAH KEGIATAN PEMBELAJARAN

#### PERTEMUAN 1: Eksplorasi Konsep & Orientasi Masalah (${jpPtm})

| Tahap Kegiatan | Rincian Aktivitas Guru dan Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Guru mengucapkan salam hangat penuh kasih sayang, membimbing doa pembuka, dan mengajak tadarus Al-Qur'an singkat.<br>2. Melakukan *mindfulness check-in* (30 detik) untuk memusatkan konsentrasi santri.<br>3. Mengecek kehadiran dan menyapa keadaan peserta didik secara empatik (*Welcoming with Love*).<br>4. Apersepsi: Guru mengaitkan pengalaman nyata santri dengan materi **${topikMateri}** serta nilai **${kbcPillars.join(', ')}**.<br>5. Menyampaikan Tujuan Pembelajaran dan alur KBM yang akan dilaksanakan. | 15 Menit |
| **Kegiatan Inti**<br>*(Sintaks ${model})* | **Fase 1: Orientasi Siswa pada Masalah (Mindful)**<br>- Guru menyajikan stimulus berupa artikel kontekstual/studi kasus mengenai tantangan nyata pada topik ${topikMateri}.<br>- Peserta didik mencermati tayangan dan mengajukan pertanyaan kritis.<br><br>**Fase 2: Mengorganisasi Peserta Didik untuk Belajar (Joyful)**<br>- Peserta didik dibagi ke dalam 4-5 kelompok kecil berdasarkan gaya belajar dan heterogenitas kemampuan.<br>- Guru membagikan LKPD berbasis diferensiasi konten dan nilai KBC.<br><br>**Fase 3: Membimbing Penyelidikan Mandiri dan Kelompok (Meaningful)**<br>- Peserta didik berkolaborasi mengumpulkan data, membaca literatur rujukan, dan berdiskusi dengan adab saling menghargai.<br>- Guru berkeliling memberikan *scaffolding* afektif dan kognitif serta mencatat jurnal anekdotal sikap santri. | 60 Menit |
| **Penutup** | 1. Peserta didik bersama guru menyimpulkan poin-poin utama materi yang telah dipelajari.<br>2. Refleksi Panca Cinta: *"Nilai cinta dan kebaikan apa yang kalian rasakan dan pelajari hari ini?"*<br>3. Guru memberikan apresiasi atas dedikasi dan adab santri selama pembelajaran.<br>4. Menyampaikan agenda pertemuan berikutnya, doa kafaratul majelis, dan salam. | 15 Menit |

---

#### PERTEMUAN 2: Elaborasi, Karya Nyata, dan Asesmen Ketercapaian (${jpPtm})

| Tahap Kegiatan | Rincian Aktivitas Guru dan Peserta Didik | Alokasi Waktu |
|:---|:---|:---:|
| **Pendahuluan** | 1. Membuka KBM dengan salam, doa bersama, dan pembacaan shalawat.<br>2. Menanyakan tindak lanjut dan kesiapan hasil kerja kelompok dari pertemuan sebelumnya.<br>3. *Ice breaking* edukatif ringan untuk membangkitkan suasana *joyful learning*. | 10 Menit |
| **Kegiatan Inti**<br>*(Sintaks ${model})* | **Fase 4: Mengembangkan dan Menyajikan Hasil Karya**<br>- Setiap kelompok menyusun produk laporan/peta konsep hasil penyelidikan masalah ${topikMateri}.<br>- Kelompok mempresentasikan hasil diskusi secara bergiliran.<br>- Kelompok lain menyimak dengan adab santun (*ta'addub*) dan memberikan tanggapan konstruktif.<br><br>**Fase 5: Menganalisis dan Mengevaluasi Proses Pemecahan Masalah**<br>- Guru memfasilitasi klarifikasi konseptual, memberi penguatan materi insersi KBC, dan meluruskan miskonsepsi.<br>- Peserta didik mengerjakan asesmen formatif akhir TP untuk mengukur pemahaman individu. | 65 Menit |
| **Penutup** | 1. Refleksi bermakna mengenai komitmen pengamalan nilai **${kbcPillars[0]}** dalam kehidupan nyata.<br>2. Guru memberikan umpan balik menyeluruh terhadap performa kelompok.<br>3. Menutup pembelajaran dengan doa bersama dan salam. | 15 Menit |

---

### IV. RANCANGAN ASESMEN PEMBELAJARAN
- **Jenis Asesmen yang Diterapkan :** ${asesmenList}

#### 1. Asesmen Diagnostik (Awal Pembelajaran)
- **Teknik :** Tanya jawab interaktif lisan dan pemetaan kesiapan belajar.
- **Instrumen :** 3 butir pertanyaan pemantik terkait konsep prasyarat materi ${topikMateri}.

#### 2. Asesmen Sikap & Karakter KBC (Jurnal Anekdotal & Observasi Adab)
| No | Pilar Panca Cinta & Karakter | Indikator Sikap Teramati | Kategori (MB / SB / BSH / SAB) |
|:---:|:---|:---|:---:|
| 1 | **${kbcPillars[0] || 'Cinta Allah & Rasul-Nya'}** | Memulai kegiatan dengan doa khusyuk, jujur, dan menjaga adab majelis ilmu | BSH / SAB |
| 2 | **Cinta Ilmu & Nalar Kritis** | Antusias mencari kebenaran ilmiah (*tabayyun*) dan menyelesaikan tugas tepat waktu | BSH / SAB |
| 3 | **Cinta Sesama (*Rahmah & Tasamuh*)** | Membantu rekan kelompok yang kesulitan dan bertutur kata santun tanpa merendahkan | BSH / SAB |

#### 3. Asesmen Formatif & Sumatif (Kognitif / Produk)
| Interval Nilai | Kategori Ketercapaian | Tindak Lanjut Pendampingan Berbasis Kasih Sayang |
|:---:|:---:|:---|
| 0 - 65% | Perlu Bimbingan | Remedial pendampingan individual (*coaching* empatik) pada indikator yang belum tuntas |
| 66% - 75% | Cukup | Remedial terbimbing melalui diskusi tutor sebaya (*peer support*) |
| 76% - 85% | Baik (Tuntas) | Telah mencapai ketuntasan, melanjutkan ke materi berikutnya |
| 86% - 100% | Sangat Baik (Mahir) | Pengayaan berupa eksplorasi studi kasus lanjutan dan peran tutor sebaya |`;
  }

  if (docType === 'modul_ajar') {
    const model = modelPembelajaran || 'Problem Based Learning (PBL)';
    const asesmenList = Array.isArray(jenisAsesmen) && jenisAsesmen.length > 0
      ? jenisAsesmen.join(', ')
      : 'Asesmen Diagnostik (Awal), Asesmen Formatif (Proses & LKPD), Asesmen Sikap & Karakter KBC (Jurnal Anekdotal / Observasi Adab), Asesmen Sumatif (Akhir TP)';
    const karakteristik = karakteristikPesertaDidik || 'Peserta didik memiliki keragaman kesiapan belajar dan gaya belajar (visual, auditori, kinestetik) dengan latar belakang santri madrasah yang responsif terhadap pembelajaran kolaboratif.';
    const lintasIlmu = lintasDisiplinIlmu && lintasDisiplinIlmu.trim().length > 0
      ? lintasDisiplinIlmu.trim()
      : 'Bahasa Indonesia (Literasi Teks), Teknologi Informasi (Literasi Digital), serta Akidah Akhlak / Aswaja (Etika & Moderasi Beragama).';
    const customTPBlock = tujuanPembelajaranTeks && tujuanPembelajaranTeks.trim().length > 0
      ? tujuanPembelajaranTeks.trim()
      : `- **Pertemuan 1:** Peserta didik mampu mengidentifikasi dan menjelaskan konsep dasar **${topikMateri}** melalui eksplorasi studi kasus dan diskusi kelompok secara santun.\n- **Pertemuan 2:** Peserta didik mampu menganalisis permasalahan kontekstual **${topikMateri}** dan merumuskan solusi kolaboratif berlandaskan nilai **${kbcPillars.join(', ')}**.`;
    const cpAcuan = capaianPembelajaranTeks && capaianPembelajaranTeks.trim().length > 10
      ? capaianPembelajaranTeks.trim()
      : `Pada akhir Fase ${fase}, peserta didik mampu menganalisis, menginternalisasi, dan menerapkan kompetensi ${topikMateri} pada mata pelajaran ${mapel} dalam memecahkan masalah kontekstual berlandaskan nilai keilmuan dan akhlakul karimah.`;

    return `# MODUL AJAR KURIKULUM BERBASIS CINTA (KBC) & DEEP LEARNING
## MATA PELAJARAN: ${mapel.toUpperCase()} — FASE ${fase} KELAS ${kelas}
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Disusun Sesuai KMA 1503/2025 & Kepdirjen Pendis 6077/2025*

---

## A. IDENTIFIKASI KESIAPAN PESERTA DIDIK & MATERI
- **Karakteristik Peserta Didik :** ${karakteristik}
- **Alokasi Waktu :** ${alokasiWaktu || '4 JP (2 Pertemuan)'}
- **Model Pembelajaran Utama :** ${model}
- **Pendekatan Pembelajaran :** Deep Learning (*Mindful, Meaningful, Joyful Learning*) terintegrasi Panca Cinta KBC.

${kbcInsersiTableMarkdown}

---

## B. 8 DIMENSI PROFIL LULUSAN (PEMBELAJARAN MENDALAM)
Dimensi Profil Lulusan yang dikuatkan dalam Modul Ajar ini meliputi:
**${dimensiList}**

---

## C. DESAIN PEMBELAJARAN

### 1. Capaian Pembelajaran (CP) Acuan
${cpAcuan}

| Elemen CP | Deskripsi Capaian Pembelajaran & Kompetensi Target |
|:---|:---|
| **Pemahaman Konseptual** | Peserta didik memahami dan menganalisis hakikat **${topikMateri}** secara komprehensif dan berkesadaran (*mindful*). |
| **Keterampilan Proses & Penalaran** | Peserta didik mengevaluasi masalah kontekstual dan merumuskan solusi berbasis dalil/fakta ilmiah (*meaningful*). |
| **Internalisasi Karakter Panca Cinta (KBC)** | Peserta didik mewujudkan pemahaman melalui sikap kasih sayang, adab santun, dan karya bermanfaat (*joyful*) sesuai pilar **${kbcPillars.join(', ')}**. |

### 2. Lintas Disiplin Ilmu
${lintasIlmu}

### 3. Tujuan Pembelajaran (TP)
${customTPBlock}

---

## D. LANGKAH-LANGKAH PEMBELAJARAN BERDIFERENSIASI (DEEP LEARNING & KBC)

| Tahapan Kegiatan | Deskripsi Aktivitas Pembelajaran (Mindful, Meaningful, Joyful) | Alokasi Waktu |
|:---|:---|:---:|
| **1. PENDAHULUAN**<br>*(Mindful & Welcoming with Love)* | - Guru membuka kelas dengan salam hangat, senyuman tulus, dan doa tholabul ilmi.<br>- Melaksanakan *mindfulness check-in* singkat untuk menata niat belajar karena Allah SWT.<br>- Apersepsi kontekstual mengaitkan fenomena nyata dengan **${topikMateri}** dan nilai **${kbcPillars[0]}**.<br>- Menyampaikan Tujuan Pembelajaran dan kesepakatan adab belajar bersama. | 15 Menit |
| **2. KEGIATAN INTI**<br>*(Sintaks ${model})* | **A. Eksplorasi Berkesadaran (Diferensiasi Konten):**<br>- Guru menyajikan bahan bacaan, infografis, dan studi kasus nyata terkait **${topikMateri}**.<br>- Peserta didik mengamati dan mencatat pertanyaan pemantik secara kritis.<br><br>**B. Kolaborasi Bermakna (Diferensiasi Proses):**<br>- Peserta didik berdiskusi dalam kelompok heterogen menggunakan panduan LKPD KBC.<br>- Guru mendampingi kelompok yang memerlukan *scaffolding* dengan sabar dan penuh kasih sayang.<br><br>**C. Kreasi & Presentasi Menggembirakan (Diferensiasi Produk):**<br>- Kelompok menyajikan gagasan/solusi dalam bentuk peta konsep, ringkasan, atau demonstrasi.<br>- Apresiasi silang antarkelompok dengan bahasa yang santun (*ta'addub*). | 60 Menit |
| **3. PENUTUP**<br>*(Refleksi Panca Cinta)* | - Peserta didik bersama guru menyimpulkan esensi keilmuan dan hikmah materi **${topikMateri}**.<br>- Refleksi afektif: *"Bagaimana materi hari ini menumbuhkan rasa cinta kita kepada Tuhan, ilmu, dan sesama?"*<br>- Penyampaian agenda berikutnya, doa kafaratul majelis, dan salam. | 15 Menit |

---

## E. ASESMEN PEMBELAJARAN KOMPREHENSIF
- **Cakupan Asesmen :** ${asesmenList}
1. **Asesmen Diagnostik (Awal):** Pemetaan kesiapan awal dan minat belajar siswa melalui pertanyaan pemantik.
2. **Asesmen Formatif (Proses):** Penilaian kinerja diskusi kelompok dan ketuntasan LKPD.
3. **Asesmen Sikap & Karakter KBC (Jurnal Anekdotal):** Observasi adab menuntut ilmu, empati terhadap teman, dan kejujuran akademik.
4. **Asesmen Sumatif (Akhir Modul):** Evaluasi ketercapaian Tujuan Pembelajaran berbasis rubrik interval KKTP.`;
  }

  if (docType === 'lkpd') {
    const cpAcuan = capaianPembelajaranTeks && capaianPembelajaranTeks.trim().length > 10
      ? capaianPembelajaranTeks.trim()
      : `Peserta didik mampu menganalisis konsep dan memecahkan persoalan kontekstual pada materi ${topikMateri} (${mapel}) secara kritis, kolaboratif, dan berakhlak mulia.`;
    const customTP = tujuanPembelajaranTeks && tujuanPembelajaranTeks.trim().length > 0
      ? tujuanPembelajaranTeks.trim()
      : `Melalui diskusi kelompok berbasis kasih sayang dan nalar kritis, peserta didik mampu menganalisis permasalahan kontekstual **${topikMateri}** serta menyusun solusi aplikatif dengan tepat.`;

    return `# LEMBAR KERJA PESERTA DIDIK (LKPD) BERBASIS KBC & DEEP LEARNING
## MATA PELAJARAN: ${mapel.toUpperCase()} — KELAS ${kelas} (FASE ${fase})
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

---

### A. IDENTITAS KELOMPOK SANTRI
- **Nama Kelompok :** ............................................................................
- **Anggota Kelompok :**
  1. ...................................................... (No. Absen: ......)
  2. ...................................................... (No. Absen: ......)
  3. ...................................................... (No. Absen: ......)
  4. ...................................................... (No. Absen: ......)
- **Topik / Materi Pokok :** **${topikMateri}**
- **Alokasi Waktu Pengerjaan :** ${alokasiWaktu || '2 x 45 Menit'}

---

### B. LANDASAN CAPAIAN & TUJUAN PEMBELAJARAN
- **Capaian Pembelajaran Acuan :** ${cpAcuan}
- **Tujuan Pembelajaran (TP) :** ${customTP}
- **Pilar Panca Cinta KBC yang Dikuatkan :** **${kbcPillars.join(', ')}**
${instruksiKhusus ? `- **Instruksi Khusus Guru :** ${instruksiKhusus}` : ''}

---

### C. PETUNJUK BELAJar & ADAB THALABUL ILMI (MINDFULNESS KBC)
1. Mulailah kegiatan kerja kelompok dengan membaca *Basmalah* dan menata niat menuntut ilmu karena Allah SWT.
2. Bacalah wacana stimulus dengan saksama (*Mindful Reading*).
3. Berdiskusilah dengan santun, hargai pendapat setiap rekan kelompok, dan saling membantulah dalam memahami materi (*Ta'awun & Rahmah*).

${kbcInsersiTableMarkdown}

---

### D. WACANA STIMULUS KONTEKSTUAL (MEANINGFUL LEARNING)
> **Studi Kasus Kontekstual: "${topikMateri} dalam Kehidupan Sehari-hari"**  
> Dalam kehidupan masyarakat modern saat ini, pemahaman yang mendalam mengenai **${topikMateri}** menjadi sangat penting agar ilmu yang dipelajari di madrasah tidak berhenti sebagai teori hafalan semata, melainkan mampu menghadirkan solusi yang membawa kemaslahatan (*maslahah ammah*). Namun, masih sering dijumpai kurangnya kesadaran dalam menerapkan prinsip **${topikMateri}** secara bijaksana dan bertanggung jawab. Bagaimana kelompok kalian menganalisis fenomena tersebut dari sudut pandang keilmuan **${mapel}** dan nilai kasih sayang (**${kbcPillars[0]}**)?

---

### E. AKTIVITAS PENYELIDIKAN & DISKUSI KELOMPOK

#### Aktivitas 1: Identifikasi Konsep Kunci (Mindful Exploration)
Berdasarkan wacana dan buku sumber yang kalian pelajari, tuliskan 3 konsep penting dalam materi **${topikMateri}**:
| No | Konsep / Istilah Kunci | Penjelasan Menurut Kelompok Kalian | Contoh Nyata di Lingkungan Sekitar |
|:---:|:---|:---|:---|
| 1 | ........................................... | ........................................................................ | ........................................................................ |
| 2 | ........................................... | ........................................................................ | ........................................................................ |
| 3 | ........................................... | ........................................................................ | ........................................................................ |

#### Aktivitas 2: Analisis Masalah & Pemecahan Kasus (HOTS & Deep Learning)
1. **Mengapa pemahaman yang keliru terhadap ${topikMateri} dapat menimbulkan masalah dalam praktik kehidupan?**  
   *Jawaban Kelompok:*  
   ..............................................................................................................................................................................  
   ..............................................................................................................................................................................
2. **Rumuskan solusi konkret dan inovatif yang dapat dilakukan oleh pelajar madrasah terkait ${topikMateri}!**  
   *Jawaban Kelompok:*  
   ..............................................................................................................................................................................  
   ..............................................................................................................................................................................

---

### F. REFLEKSI DIRI & AKSI CINTA (PANCA CINTA KBC)
| Pertanyaan Refleksi Batin | Jawaban / Komitmen Diri Santri |
|:---|:---|
| **1. Hikmah apa yang membuat kalian semakin bersyukur dan mencintai ilmu setelah mempelajari ${topikMateri}?** | .......................................................................................................... |
| **2. Aksi nyata apa yang akan kalian terapkan minggu ini sebagai wujud nilai ${kbcPillars.join(' & ')}?** | .......................................................................................................... |

---

### G. RUBRIK PENILAIAN LKPD (DIISI OLEH GURU)
| Aspek Penilaian | Bobot | Skor (0-100) | Catatan Apresiasi Guru |
|:---|:---:|:---:|:---|
| Ketepatan Konsep & Kedalaman Analisis | 40% | ........ | ................................................................................ |
| Kreativitas Solusi & Kejelasan Argumen | 30% | ........ | ................................................................................ |
| Kolaborasi, Adab Diskusi & Refleksi KBC | 30% | ........ | ................................................................................ |
| **TOTAL NILAI KELOMPOK** | **100%** | **........** | |`;
  }

  if (docType === 'presensi_kbm') {
    return `# JURNAL MENGAJAR & PRESENSI HARIAN KBM (BERBASIS KBC)
**MA NU 01 BANYUPUTIH BATANG**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | Tahun Pelajaran: ${tahunPelajaran}*

---

### A. IDENTITAS & AGENDA JURNAL MENGAJAR HARIAN
- **Mata Pelajaran :** ${mapel}
- **Kelas / Fase / Semester :** ${kelas} / Fase ${fase} / Semester ${semester}
- **Materi Pokok / Topik :** ${topikMateri}
- **Alokasi Waktu :** ${alokasiWaktu || '2 JP (2 x 45 Menit)'}
- **Fokus Panca Cinta KBC :** ${kbcPillars.join(', ')}
- **Guru Pengampu :** ${guruPengampu}
${instruksiKhusus ? `- **Kondisi Khusus Kelas :** ${instruksiKhusus}` : ''}

| Pertemuan Ke- | Hari / Tanggal | Jam Ke- | Ringkasan Materi & Aktivitas Deep Learning | Ketercapaian TP | Tindak Lanjut |
|:---:|:---:|:---:|:---|:---:|:---|
| 1 | .......................... | 1 - 2 | Eksplorasi konsep **${topikMateri}** dengan diskusi kelompok dan penguatan nilai **${kbcPillars[0]}** | Tuntas (85%) | Pendampingan 2 siswa yang izin |

---

### B. DAFTAR PRESENSI & OBSERVASI ADAB PESERTA DIDIK KELAS ${kelas}

| No | NISN | Nama Peserta Didik | L/P | Status (H/S/I/A) | Catatan Jurnal Anekdotal Sikap & Karakter KBC |
|:---:|:---:|:---|:---:|:---:|:---|
| 1 | 0087421101 | Ahmad Fadlil Maulana | L | **H** | Antusias berdiskusi dan membantu teman memahami materi (*Cinta Sesama*) |
| 2 | 0087421102 | Aisyah Nur Kamila | P | **H** | Menjawab pertanyaan pemantik dengan santun dan argumentatif (*Cinta Ilmu*) |
| 3 | 0087421103 | Bagas Dwi Prasetyo | L | **H** | Kerja sama kelompok sangat baik dan menjaga kebersihan meja kelas (*Cinta Lingkungan*) |
| 4 | 0087421104 | Dina Khoirunnisa | P | **S** | Izin sakit (surat keterangan terlampir — didoakan kesembuhan bersama di kelas) |
| 5 | 0087421105 | Farhan Maulana Malik | L | **H** | Memimpin doa pembuka KBM dengan khusyuk dan tertib (*Cinta Allah & Rasul-Nya*) |
| 6 | 0087421106 | Fatimatuz Zahra | P | **H** | Catatan LKPD sangat rapi, runtut, dan mandiri |
| 7 | 0087421107 | Ilham Syarif Hidayat | L | **I** | Dispensasi mengikuti pembinaan olimpiade madrasah |
| 8 | 0087421108 | Khusnul Khotimah | P | **H** | Menunjukkan adab *ta'addub* dan menghargai pendapat kelompok lain |
| 9 | 0087421109 | M. Rizqi Firmansyah | L | **H** | Mengikuti sesi *mindful learning* dengan fokus dan aktif bertanya |
| 10 | 0087421110 | Nabila Ayu Lestari | P | **H** | Kreatif dalam menyusun kesimpulan peta konsep materi |

---

### C. REKAPITULASI KEHADIRAN KBM
- **Jumlah Peserta Didik :** 10 Siswa | **Hadir (H) :** 8 Siswa | **Sakit (S) :** 1 Siswa | **Izin (I) :** 1 Siswa | **Alpa (A) :** 0 Siswa

---

### D. REFLEKSI GURU (DEEP LEARNING & KURIKULUM BERBASIS CINTA)
1. **Keterlaksanaan Mindful, Meaningful & Joyful Learning:** Peserta didik memahami esensi **${topikMateri}** dengan suasana kelas yang kondusif, hangat, dan interaktif.
2. **Evaluasi Insersi Panca Cinta KBC:** Nilai **${kbcPillars.join(', ')}** tampak nyata dalam adab bertanya, kejujuran mengerjakan tugas, serta doa bersama bagi rekan yang sedang sakit.
3. **Rencana Tindak Lanjut:** Memberikan ringkasan materi mandiri kepada siswa yang berhalangan hadir agar tidak tertinggal pada pertemuan berikutnya.`;
  }

  if (docType === 'prota' || docType === 'prota_prosem') {
    const cpAcuan = capaianPembelajaranTeks && capaianPembelajaranTeks.trim().length > 10
      ? capaianPembelajaranTeks.trim()
      : `Pada akhir Fase ${fase}, peserta didik mampu menginterpretasi, mengaitkan, dan menerapkan pemahaman konsep dasar serta keterampilan aplikatif mata pelajaran ${mapel} untuk memecahkan persoalan kontekstual secara individu maupun kelompok berlandaskan nilai Panca Cinta KBC.`;

    return `# PROGRAM TAHUNAN (PROTA) KURIKULUM MERDEKA & KBC
**MA NU 01 BANYUPUTIH BATANG**  
*Jl. Lapangan 9A Banyuputih, Kab. Batang | NPSN: 20364930 | Tahun Pelajaran: ${tahunPelajaran}*

---

### A. CAPAIAN PEMBELAJARAN (CP) ACUAN FASE ${fase}
${cpAcuan}

${kbcInsersiTableMarkdown}

---

### B. MATRIKS DISTRIBUSI PROGRAM TAHUNAN (${tahunPelajaran})
- **Mata Pelajaran :** ${mapel}
- **Fase / Kelas :** Fase ${fase} / Kelas ${kelas}
- **Target Total Alokasi Waktu :** ${alokasiWaktu || '72 JP / Tahun'}

#### 1. SEMESTER I (GANJIL)
| Unit / Bab | Materi Pokok / Ruang Lingkup | Alur Tujuan Pembelajaran (ATP) | Fokus Panca Cinta KBC & Materi Insersi | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 1** | Landasan & Konsep Pokok ${mapel} (${topikMateri}) | 1.1 Mengidentifikasi dan menjelaskan konsep fundamental serta dalil/prinsip dasar ${mapel}.<br>1.2 Menyajikan hasil telaah konsep secara sistematis. | **${kbcPillars[0] || 'Cinta Allah & Rasul-Nya'}** & **Cinta Ilmu** | **18 JP** |
| **Unit 2** | Analisis Kontekstual & Studi Kasus ${mapel} | 2.1 Menganalisis keterkaitan konsep dengan problematika kehidupan nyata.<br>2.2 Merumuskan solusi kolaboratif secara kritis dan santun. | **${kbcPillars[1] || 'Cinta Diri & Sesama'}** (*Tasamuh & Ta'awun*) | **18 JP** |
| **SUBTOTAL SEMESTER I** | | | | **36 JP** |

#### 2. SEMESTER II (GENAP)
| Unit / Bab | Materi Pokok / Ruang Lingkup | Alur Tujuan Pembelajaran (ATP) | Fokus Panca Cinta KBC & Materi Insersi | Alokasi Waktu |
|:---:|:---|:---|:---|:---:|
| **Unit 3** | Pendalaman Prosedural & Aplikasi Praktis ${mapel} | 3.1 Menerapkan kaidah/prosedur analisis pada fenomena sosial dan lingkungan.<br>3.2 Mengevaluasi dampak penerapan konsep secara bertanggung jawab. | **${kbcPillars[2] || 'Cinta Lingkungan'}** | **18 JP** |
| **Unit 4** | Proyek Kolaboratif & Karya Inovatif ${mapel} | 4.1 Merancang dan menghasilkan produk/karya pemecahan masalah berbasis tim.<br>4.2 Mempresentasikan dan merefleksikan nilai kemanfaatan karya bagi umat dan bangsa. | **Cinta Tanah Air** & **Cinta Ilmu** | **18 JP** |
| **SUBTOTAL SEMESTER II** | | | | **36 JP** |

---

### C. REKAPITULASI ALOKASI WAKTU TAHUNAN
- **Semester I (Ganjil) :** 36 JP
- **Semester II (Genap) :** 36 JP
- **Total Keseluruhan 1 Tahun Pelajaran :** **72 JP** *(Dapat disesuaikan dengan struktur kurikulum kelas ${kelas})*`;
  }

  if (docType === 'prosem') {
    const isSemester2 = semester === '2';
    const semName = isSemester2 ? 'II (Genap)' : 'I (Ganjil)';
    const agendaInfo = agendaMadrasah && agendaMadrasah.trim().length > 0
      ? agendaMadrasah.trim()
      : (isSemester2
          ? 'Libur Awal Semester Genap (Januari M1-M2), ASTS Genap (Maret M3-M4), Libur Hari Raya Idul Fitri (April M1-M2), ASAT/ASESGEN (Juni M1-M2), Pembagian Rapor & Libur Akhir Tahun (Juni M3-M5).'
          : 'MATSAMA & Kegiatan Awal Tahun (Juli M1-M2), ASTS Gasal (September M4-M5), Peringatan Hari Santri & Maulid Nabi (Oktober M4), ASAS/ASESGA (Desember M1-M2), Pengolahan Rapor & Libur Semester (Desember M3-M5).');

    return `<div style="background-color: #045f3b; color: white; padding: 10px 14px; text-align: center; border-radius: 4px; font-weight: bold; margin-bottom: 14px;">
  <div style="font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">PROGRAM SEMESTER (PROSEM) KURIKULUM MERDEKA &amp; KBC</div>
  <div style="font-size: 13px; text-transform: uppercase; margin-top: 2px;">${mapel.toUpperCase()} — FASE ${fase} KELAS ${kelas} SEMESTER ${semName}</div>
</div>

<div style="font-size: 11px; margin-bottom: 12px; line-height: 1.6; font-weight: 500;">
  <table style="border: none; border-collapse: collapse; width: 100%;">
    <tr><td style="border:none; padding: 1px 0; width: 190px; font-weight: 600;">Mata Pelajaran</td><td style="border:none; padding: 1px 0;">: ${mapel}</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Satuan Pendidikan</td><td style="border:none; padding: 1px 0;">: MA NU 01 Banyuputih Batang</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Tahun Pelajaran / Semester</td><td style="border:none; padding: 1px 0;">: ${tahunPelajaran} / Semester ${semName}</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Fokus Panca Cinta KBC</td><td style="border:none; padding: 1px 0;">: ${kbcPillars.join(', ')}</td></tr>
    <tr><td style="border:none; padding: 1px 0; font-weight: 600;">Acuan Agenda Kalender Madrasah</td><td style="border:none; padding: 1px 0;">: ${agendaInfo}</td></tr>
  </table>
</div>

<table style="width: 100%; border-collapse: collapse; font-size: 9.5px; border: 1px solid #1e293b;">
  <thead>
    <tr style="background-color: #f8fafc;">
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 4px; width: 110px; text-align: center; font-weight: bold;">BAB &amp; TEMA KBC</th>
      <th rowspan="2" style="border: 1px solid #1e293b; padding: 6px 6px; width: 230px; text-align: center; font-weight: bold;">Alur dan Tujuan Pembelajaran (ATP)</th>
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
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 1: ${topikMateri}<br><span style="font-size:8px; color:#045f3b;">(${kbcPillars[0] || 'Cinta Ilmu'})</span></td>
      <td style="border: 1px solid #1e293b; padding: 6px; vertical-align: top;">1. Peserta didik mampu menginterpretasi dan mengaitkan konsep utama pada materi ${topikMateri} (${mapel}) dalam kehidupan nyata.</td>
      <td style="border: 1px solid #1e293b; padding: 6px; text-align: center; vertical-align: middle; font-weight: bold;">4 JP</td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Semester' : 'Libur Akhir Tahun'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Libur Semester' : 'MATSAMA'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Awal KBM' : 'Awal KBM'}</div>
      </td>
      <td rowspan="6" style="background-color: #f59e0b; border: 1px solid #1e293b; text-align: center; vertical-align: middle; padding: 2px;">
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 8px; font-weight: 600; margin: auto;">${isSemester2 ? 'Orientasi KBC' : 'Orientasi KBC'}</div>
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
        <div style="writing-mode: vertical-lr; transform: rotate(180deg); white-space: nowrap; font-size: 7.5px; font-weight: 600; margin: auto;">Pengolahan Nilai &amp; Raport</div>
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
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 2: Aplikasi Kontekstual<br><span style="font-size:8px; color:#045f3b;">(${kbcPillars[1] || 'Cinta Sesama'})</span></td>
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
      <td rowspan="2" style="border: 1px solid #1e293b; padding: 6px; font-weight: bold; vertical-align: top; background-color: #fafafa;">BAB 3: Proyek Kreasi &amp; Aksi Cinta<br><span style="font-size:8px; color:#045f3b;">(${kbcPillars[2] || 'Cinta Lingkungan'})</span></td>
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
      <td colspan="2" style="border: 1px solid #1e293b; padding: 6px; text-align: center; font-weight: bold;">TOTAL JAM PELAJARAN EFEKTIF SEMESTER</td>
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
    const customTP = tujuanPembelajaranTeks && tujuanPembelajaranTeks.trim().length > 0
      ? tujuanPembelajaranTeks.trim()
      : `Menganalisis konsep utama **${topikMateri}** dan menerapkannya dalam pemecahan masalah kontekstual secara berkesadaran.`;
    const customInterval = intervalKKTP && intervalKKTP.trim().length > 0
      ? intervalKKTP.trim()
      : '0 - 60% (Baru Berkembang / Perlu Bimbingan), 61 - 75% (Layak / Cukup), 76 - 85% (Cakap / Baik — Batas Ketuntasan), 86 - 100% (Mahir / Sangat Baik)';

    return `# KRITERIA KETERCAPAIAN TUJUAN PEMBELAJARAN (KKTP) BERBASIS KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Disusun Sesuai Panduan Pembelajaran dan Asesmen & Kepdirjen Pendis 6077/2025*

---

### A. IDENTITAS & RENTANG INTERVAL KKTP
- **Mata Pelajaran :** ${mapel}
- **Fase / Kelas / Semester :** Fase ${fase} / Kelas ${kelas} / Semester ${semester}
- **Topik / Materi Pokok :** ${topikMateri}
- **Tujuan Pembelajaran (TP) yang Diukur :** ${customTP}
- **Rentang Interval Nilai Acuan :** ${customInterval}
- **Pilar Panca Cinta KBC Terintegrasi :** ${kbcPillars.join(', ')}

---

### B. TABEL RUBRIK INTERVAL KRITERIA KETERCAPAIAN (KOGNITIF & KARAKTER KBC)

| No | Aspek / Indikator Ketercapaian TP | Baru Berkembang (0-60%) | Layak (61-75%) | Cakap (76-85%) | Mahir (86-100%) |
|:---:|:---|:---|:---|:---|:---|
| 1 | **Pemahaman Konseptual:**<br>Menjelaskan definisi, ruang lingkup, dan kaidah dasar ${topikMateri} | Belum mampu mendefinisikan konsep dasar secara tepat | Menjelaskan konsep dasar dengan bantuan pertanyaan pancingan guru | Menjelaskan konsep secara mandiri, runtut, dan akurat | Mampu menjelaskan konsep serta mengaitkannya dengan dalil/analogi lintas konteks |
| 2 | **Keterampilan Analisis & Pemecahan Masalah:**<br>Menyelesaikan studi kasus kontekstual pada materi ${topikMateri} | Belum mampu mengidentifikasi akar masalah pada kasus | Mengidentifikasi masalah namun solusi belum lengkap | Merumuskan solusi yang tepat, logis, dan sistematis | Merumuskan solusi kreatif, inovatif, dan berorientasi kemaslahatan umat |
| 3 | **Internalisasi Karakter Panca Cinta (KBC):**<br>Menunjukkan sikap **${kbcPillars.join(', ')}** selama proses belajar | Pasif dan masih memerlukan teguran dalam menjaga adab belajar | Mulai menunjukkan sikap menghargai dan tertib dengan pengingat | Konsisten menunjukkan adab santun, jujur, dan empati kepada sesama | Menjadi teladan (*qudwah hasanah*) dalam adab keilmuan dan kasih sayang di kelas |

---

### C. PEDOMAN TINDAK LANJUT PENDAMPINGAN (REMEDIAL & PENGAYAAN HUMANIS)
- **Interval 0 - 60% (Baru Berkembang):** Pendampingan *coaching* individual penuh kasih sayang tanpa pelabelan negatif, disertai penyederhanaan materi esensial.
- **Interval 61 - 75% (Layak):** Pembelajaran remedial terbimbing pada indikator yang belum tuntas bersama tutor sebaya (*peer teaching*).
- **Interval 76 - 85% (Cakap — Tuntas):** Telah mencapai kriteria ketuntasan minimal, melanjutkan ke Tujuan Pembelajaran berikutnya.
- **Interval 86 - 100% (Mahir — Sangat Baik):** Diberikan pengayaan berupa eksplorasi literatur lanjutan (*Bahtsul Masail* / proyek mini) dan dilibatkan sebagai tutor sebaya.`;
  }

  if (docType === 'umpan_balik') {
    const responden = respondenSurvei || 'Peserta Didik (Refleksi Pembelajaran Kelas)';
    const skala = skalaSurvei || 'Skala Likert 1 - 4 (Sangat Kurang s.d. Sangat Baik)';
    const aspekFokus = aspekUmpanBalik || 'Kejelasan penyampaian materi, suasana kelas yang ramah & menyenangkan (Joyful), keteladanan adab & kasih sayang guru (Panca Cinta KBC), serta keadilan asesmen.';

    return `# INSTRUMEN SURVEI UMPAN BALIK & REFLEKSI PEMBELAJARAN (KBC)
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}

**Identitas Instrumen:**
- **Mata Pelajaran / Topik :** ${mapel} — ${topikMateri}
- **Kelas / Fase / Semester :** Kelas ${kelas} (Fase ${fase}) / Semester ${semester}
- **Guru Pengampu :** ${guruPengampu}
- **Target Responden :** **${responden}**
- **Model Skala Penilaian :** **${skala}**
- **Fokus Evaluasi :** ${aspekFokus}

---

### A. KUESIONER PENILAIAN PENGALAMAN BELAJAR (DEEP LEARNING & PANCA CINTA)
*Petunjuk: Berilah tanda centang (✓) pada kolom skor yang paling sesuai dengan pengalaman nyata di kelas (1 = Kurang Sesuai, 2 = Cukup Sesuai, 3 = Sesuai / Baik, 4 = Sangat Sesuai / Sangat Memuaskan).*

| No | Dimensi KBC & Deep Learning | Pernyataan Instrumen Umpan Balik | 1 | 2 | 3 | 4 |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| 1 | **Mindful Learning (Berkesadaran)** | Guru membuka pembelajaran dengan doa khusyuk, menyapa dengan ramah, dan membantu siswa fokus menata niat belajar. | [ ] | [ ] | [ ] | [ ] |
| 2 | **Meaningful Learning (Bermakna)** | Materi **${topikMateri}** dijelaskan secara runtut dan dikaitkan dengan manfaat nyata dalam kehidupan sehari-hari. | [ ] | [ ] | [ ] | [ ] |
| 3 | **Joyful Learning (Menggembirakan)** | Suasana kelas terasa hangat, bebas dari rasa takut/perundungan, dan membuat siswa bersemangat mengikuti KBM. | [ ] | [ ] | [ ] | [ ] |
| 4 | **Insersi Panca Cinta KBC** | Pembelajaran menumbuhkan nilai **${kbcPillars.join(', ')}** serta keteladanan adab santun (*ta'addub*). | [ ] | [ ] | [ ] | [ ] |
| 5 | **Diferensiasi & Pendampingan** | Guru memberi kesempatan bertanya yang adil dan sabar membimbing siswa yang mengalami kesulitan memahami materi. | [ ] | [ ] | [ ] | [ ] |
| 6 | **Keadilan & Transparansi Asesmen** | Penugasan dan penilaian disampaikan dengan kriteria yang jelas serta disertai umpan balik yang membangun semangat. | [ ] | [ ] | [ ] | [ ] |

---

### B. PERTANYAAN REFLEKSI TERBUKA (${responden.toUpperCase()})
1. **Bagian mana dari pembelajaran materi ${topikMateri} yang paling berkesan dan menyentuh hati/pikiran Anda?**  
   ..............................................................................................................................................................................
2. **Saran konstruktif apa yang ingin Anda sampaikan agar pembelajaran berikutnya semakin bermakna, menyenangkan, dan penuh berkah?**  
   ..............................................................................................................................................................................

---

### C. PEDOMAN REKAPITULASI & TINDAK LANJUT GURU
- **Rata-rata Skor 3.25 – 4.00 (Sangat Baik):** Pertahankan praktik baik pembelajaran mendalam dan bagikan pada komunitas belajar/MGMP.
- **Rata-rata Skor 2.50 – 3.24 (Baik):** Optimalkan variasi media interaktif dan penguatan diskusi kelompok.
- **Rata-rata Skor < 2.50 (Perlu Peningkatan):** Lakukan penyesuaian metode mengajar, pendekatan empatik, dan kecepatan penyampaian materi.`;
  }

  // Fallback for CP (Capaian Pembelajaran)
  if (docType === 'cp') {
    const cpContent = capaianPembelajaranTeks && capaianPembelajaranTeks.trim().length > 15
      ? capaianPembelajaranTeks.trim()
      : `Pada akhir Fase ${fase} (Kelas ${kelas}), peserta didik MA NU 01 Banyuputih Batang memiliki kemampuan bernalar kritis, mandiri, dan kreatif dalam menguasai kompetensi mata pelajaran ${mapel}. Peserta didik mampu memadukan sains modern dengan khazanah keilmuan Islam berhaluan Ahlussunnah wal Jama'ah An-Nahdliyah serta menginternalisasikan nilai-nilai Panca Cinta KBC (${kbcPillars.join(', ')}).`;

    return `# ANALISIS CAPAIAN PEMBELAJARAN (CP) & PEMETAAN INSERSI KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berdasarkan KMA 1503/2025 & Kepdirjen Pendis 6077/2025 (Kurikulum Berbasis Cinta)*

---

### A. NASKAH CAPAIAN PEMBELAJARAN (CP) FASE ${fase} — ${mapel.toUpperCase()}
${cpContent}
${instruksiKhusus ? `\n> **Catatan / Instruksi Khusus Analisis CP :** ${instruksiKhusus}` : ''}

---

### B. TABEL BEDAH ELEMEN CAPAIAN PEMBELAJARAN & KOMPETENSI TARGET
| No | Elemen CP | Kompetensi Inti (Kata Kerja Operasional) | Materi Esensial (${topikMateri}) | Integrasi 8 Dimensi Profil Lulusan & Panca Cinta KBC |
|:---:|:---|:---|:---|:---|
| 1 | **Pemahaman Konseptual** | Memahami, Mengidentifikasi, Menguraikan, Menganalisis | Konsep dasar, dalil/prinsip, dan klasifikasi pada materi **${topikMateri}** | Keimanan & Ketakwaan, Penalaran Kritis — **${kbcPillars[0] || 'Cinta Ilmu'}** |
| 2 | **Keterampilan Proses & Aplikasi** | Menerapkan, Memecahkan masalah, Merancang, Mengomunikasikan | Studi kasus kontekstual dan penerapan praktis **${topikMateri}** di madrasah/masyarakat | Kolaborasi, Kreativitas, Komunikasi — **${kbcPillars[1] || 'Cinta Diri & Sesama'}** |

---

### C. PEMETAAN MATERI INSERSI KURIKULUM BERBASIS CINTA (KBC)
${kbcInsersiTableMarkdown}

---

### D. INTEGRASI NILAI KHAS MADRASAH (ASWAJA AN-NAHDLIYAH)
1. **Tawassuth (Moderat) & Tawazun (Seimbang):** Memadukan penguasaan rasionalitas ilmu pengetahuan dengan keluhuran adab spiritual.
2. **Tasamuh (Toleran) & Rahmah (Kasih Sayang):** Menghadirkan proses pembelajaran yang menghargai keberagaman potensi peserta didik.`;
  }

  // Fallback for ATP (Alur Tujuan Pembelajaran)
  if (docType === 'atp') {
    return `# ALUR TUJUAN PEMBELAJARAN (ATP) KURIKULUM MERDEKA & KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
*Berdasarkan KMA 1503/2025 & Kepdirjen Pendis 6077/2025 (Kurikulum Berbasis Cinta)*

---

### A. IDENTITAS & ACUAN CAPAIAN PEMBELAJARAN
- **Mata Pelajaran :** ${mapel}
- **Fase / Kelas / Semester :** Fase ${fase} / Kelas ${kelas} / Semester ${semester}
- **Total Alokasi Waktu :** ${alokasiWaktu || '72 JP'}
- **Pilar Panca Cinta KBC :** ${kbcPillars.join(', ')}
${capaianPembelajaranTeks ? `- **Ringkasan CP Acuan :** ${capaianPembelajaranTeks}` : ''}
${instruksiKhusus ? `- **Instruksi Khusus Penyusunan ATP :** ${instruksiKhusus}` : ''}

---

### B. MATRIKS ALUR TUJUAN PEMBELAJARAN (ATP) TERINTEGRASI KBC

| Alur | Kode TP | Rumusan Tujuan Pembelajaran (TP) | Alokasi Waktu (JP) | Indikator Ketercapaian (IKTP) | Rencana Asesmen | 8 Dimensi Profil Lulusan & Insersi Panca Cinta KBC |
|:---:|:---:|:---|:---:|:---|:---|:---|
| **1** | **TP.1** | Mengidentifikasi dan menjelaskan konsep fundamental **${topikMateri}** pada mata pelajaran ${mapel} secara mendalam | 16 JP | • Menjelaskan definisi & ruang lingkup materi<br>• Menguraikan dalil/prinsip dasar yang relevan | **Diagnostik:** Tanya jawab awal<br>**Formatif:** Kuis & diskusi LKPD | Keimanan & Ketakwaan, Penalaran Kritis<br>**KBC:** *${kbcPillars[0] || 'Cinta Allah & Rasul-Nya'}* |
| **2** | **TP.2** | Menganalisis keterkaitan konsep **${topikMateri}** dengan fenomena sosial dan kehidupan sehari-hari | 18 JP | • Menganalisis hubungan teori dengan realitas<br>• Menilai studi kasus dengan adab keilmuan | **Formatif:** Telaah studi kasus<br>**Sikap:** Jurnal anekdotal adab KBC | Kolaborasi, Kewargaan (Moderasi)<br>**KBC:** *${kbcPillars[1] || 'Cinta Ilmu & Cinta Sesama'}* |
| **3** | **TP.3** | Memecahkan persoalan kontekstual pada materi ${mapel} melalui penalaran kritis dan prosedural | 22 JP | • Merumuskan langkah pemecahan masalah<br>• Menyajikan argumen logis berbasis bukti | **Formatif:** Unjuk kerja problem solving<br>**Sumatif:** ASTS | Kemandirian, Penalaran Kritis<br>**KBC:** *${kbcPillars[2] || 'Cinta Lingkungan'}* |
| **4** | **TP.4** | Merancang karya aplikatif dan menginternalisasikan nilai kasih sayang serta kemanfaatan sosial | 16 JP | • Menyusun produk/laporan proyek kelompok<br>• Mempresentasikan karya dengan santun | **Formatif:** Penilaian produk & antarteman<br>**Sumatif:** ASAS / ASAT | Kreativitas, Komunikasi (*Ta'addub*)<br>**KBC:** *${kbcPillars.join(', ')}* |
| | | **TOTAL ALOKASI WAKTU** | **${alokasiWaktu || '72 JP'}** | | | |

---

### C. TABEL MATERI INSERSI PANCA CINTA KBC
${kbcInsersiTableMarkdown}`;
  }

  // Default fallback
  return `# DOKUMEN ADMINISTRASI GURU BERBASIS KBC
## MA NU 01 BANYUPUTIH BATANG — TAHUN PELAJARAN ${tahunPelajaran}
Dokumen ini disusun untuk mata pelajaran ${mapel} kelas ${kelas} dengan penguatan nilai Panca Cinta: ${kbcPillars.join(', ')}.`;
}

// Ensure all unhandled /api/* routes return JSON, NEVER HTML!
app.use('/api', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    connected: false,
    error: `Endpoint API '${req.method} ${req.originalUrl}' tidak ditemukan.`,
    message: `Endpoint API '${req.method} ${req.originalUrl}' tidak ditemukan.`,
  });
});

// Global API error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api') || req.originalUrl.startsWith('/api')) {
    console.error('Unhandled API Error:', err);
    return res.status(500).json({
      success: false,
      connected: false,
      error: err?.message || 'Terjadi kesalahan pada server backend.',
      message: err?.message || 'Terjadi kesalahan pada server backend.',
    });
  }
  next(err);
});

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
      if (req.path.startsWith('/api')) {
        return res.status(404).json({
          success: false,
          connected: false,
          error: `Endpoint API '${req.method} ${req.path}' tidak ditemukan.`,
        });
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MA NU 01 Banyuputih Batang AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
