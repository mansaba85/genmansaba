import { User, ExamPackage, GeneratedAdminDoc, LoginLog, MadrasahIdentity } from '../types';
import { fetchApiJson } from '../utils/apiClient';

export interface StorageData {
  users: User[];
  madrasahIdentity: MadrasahIdentity;
  exams: ExamPackage[];
  docs: GeneratedAdminDoc[];
  logs: LoginLog[];
  mapelList: string[];
}

const API_BASE = '/api/v1/storage';

export async function fetchServerData(): Promise<StorageData | null> {
  try {
    const data = await fetchApiJson<StorageData>(API_BASE, {
      method: 'GET',
    });
    if (data && Array.isArray(data.users)) {
      return data;
    }
  } catch (err) {
    console.warn('Gagal memuat data dari server database, menggunakan data lokal / cache:', err);
  }
  return null;
}

export async function syncToServer(data: Partial<StorageData>): Promise<boolean> {
  try {
    const res = await fetchApiJson(`${API_BASE}/sync`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return Boolean(res && res.success !== false);
  } catch (err) {
    console.warn('Gagal sinkronisasi data ke server database:', err);
    return false;
  }
}

export async function saveExamToServer(exam: ExamPackage): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan soal ke server:', err);
    return false;
  }
}

export async function deleteExamFromServer(examId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/exams/${encodeURIComponent(examId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menghapus soal dari server:', err);
    return false;
  }
}

export async function saveDocToServer(doc: GeneratedAdminDoc): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menyimpan dokumen ke server:', err);
    return false;
  }
}

export async function deleteDocFromServer(docId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/v1/docs/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal menghapus dokumen dari server:', err);
    return false;
  }
}

export async function appendLogToServer(log: LoginLog): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    return res.ok;
  } catch (err) {
    console.warn('Gagal mencatat log ke server:', err);
    return false;
  }
}
