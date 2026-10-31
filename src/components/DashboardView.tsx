import React, { useState, useEffect } from 'react';
import { User, ExamPackage, MadrasahIdentity, LoginLog } from '../types';
import { NavTab } from './Navigation';
import { fetchApiJson } from '../utils/apiClient';
import {
  BookOpen,
  FileSpreadsheet,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  currentUser: User;
  onNavigate: (tab: NavTab) => void;
  recentExams?: ExamPackage[];
  onSelectExamPreset?: (presetIndex: number) => void;
  onLoadExam?: (exam: ExamPackage) => void;
  madrasahIdentity?: MadrasahIdentity;
  users?: User[];
  docs?: any[];
  logs?: LoginLog[];
  serverStatus?: {
    online: boolean;
    geminiConfigured: boolean;
    gateway: string;
  };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  onNavigate,
  recentExams = [],
  onLoadExam,
  madrasahIdentity,
  users = [],
  docs = [],
}) => {
  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'operator';
  const totalTeachers = users.filter((u) => u.role === 'guru').length;

  const [aiEngineState, setAiEngineState] = useState<{
    checking: boolean;
    connected: boolean;
    model: string;
    latencyMs?: number;
  }>({
    checking: true,
    connected: true,
    model: 'komoboku',
  });

  const checkAiGatewayStatus = async () => {
    setAiEngineState((prev) => ({ ...prev, checking: true }));
    try {
      const data = await fetchApiJson('/api/v1/ninerouter/test', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (data && data.connected) {
        setAiEngineState({
          checking: false,
          connected: true,
          model: data.model || 'komoboku',
          latencyMs: data.latencyMs,
        });
      } else {
        setAiEngineState({
          checking: false,
          connected: false,
          model: 'Template Darurat',
        });
      }
    } catch {
      setAiEngineState({
        checking: false,
        connected: false,
        model: 'Template Darurat',
      });
    }
  };

  useEffect(() => {
    checkAiGatewayStatus();
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Info Bar (Bootstrap Alert / Well style, no decorative badges) */}
      <div className="bg-white border border-slate-300 rounded-md px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold text-slate-900">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {currentUser.role === 'guru'
              ? `Guru Pengampu: ${currentUser.mapel.join(', ')}`
              : 'Administrator Sistem'}{' '}
            · TP {madrasahIdentity?.tahunAjaran || '2026/2027'} ({madrasahIdentity?.semester || 'Gasal'}) · NPSN {madrasahIdentity?.npsn || '20364930'}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
          <div className="text-slate-700">
            <span className="text-slate-500">Status AI: </span>
            {aiEngineState.checking ? (
              <span className="font-semibold text-slate-700">Memeriksa koneksi...</span>
            ) : aiEngineState.connected ? (
              <span className="font-semibold text-[#045f3b]">
                Terhubung ({aiEngineState.model}
                {aiEngineState.latencyMs ? `, ${aiEngineState.latencyMs}ms` : ''})
              </span>
            ) : (
              <span className="font-semibold text-amber-800">
                Mode Template Darurat (Offline)
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={checkAiGatewayStatus}
            disabled={aiEngineState.checking}
            className="px-2.5 py-1.5 rounded border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${aiEngineState.checking ? 'animate-spin' : ''}`} />
            <span>Cek Koneksi</span>
          </button>
        </div>
      </div>

      {/* Main Action Cards (Simple Bootstrap .card style, no pills) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-300 rounded-md flex flex-col justify-between">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#045f3b]" />
            <h2 className="font-bold text-sm text-slate-800">
              Penyusunan Soal Ujian (ASTS / ASESGA / ASAS)
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Buat paket soal pilihan ganda, menjodohkan, isian singkat, dan uraian sesuai Capaian Pembelajaran. Mendukung ekspor langsung ke format CBT dan Microsoft Word (.docx).
            </p>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('soal')}
                className="px-4 py-2 rounded bg-[#045f3b] hover:bg-[#03482d] text-white text-xs font-semibold transition cursor-pointer"
              >
                Buat Soal Ujian
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded-md flex flex-col justify-between">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#0f2742]" />
            <h2 className="font-bold text-sm text-slate-800">
              Penyusunan Administrasi Guru
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-slate-600 leading-relaxed">
              Susun dokumen Modul Ajar, Capaian Pembelajaran (CP), Alur Tujuan Pembelajaran (ATP), Program Tahunan (Prota), Program Semester (Prosem), dan KKTP siap cetak.
            </p>
            <div>
              <button
                type="button"
                onClick={() => onNavigate('administrasi')}
                className="px-4 py-2 rounded bg-[#0f2742] hover:bg-slate-800 text-white text-xs font-semibold transition cursor-pointer"
              >
                Buat Administrasi Guru
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Exam Packages Table (Clean Bootstrap .table style, no badges) */}
      <div className="bg-white border border-slate-300 rounded-md overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">
            Riwayat Paket Soal Terakhir
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('bank_soal')}
            className="text-xs font-semibold text-[#045f3b] hover:underline cursor-pointer"
          >
            Lihat Semua ({recentExams.length})
          </button>
        </div>

        {recentExams.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Belum ada paket soal yang tersimpan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-4 w-10 text-center">No</th>
                  <th className="py-2.5 px-4">Judul Paket Soal</th>
                  <th className="py-2.5 px-4">Mata Pelajaran & Kelas</th>
                  <th className="py-2.5 px-4 text-center">Jumlah</th>
                  <th className="py-2.5 px-4">Sumber</th>
                  <th className="py-2.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-700">
                {recentExams.slice(0, 6).map((pkg, idx) => {
                  const isFallback = Boolean(pkg.isFallback);
                  return (
                    <tr key={pkg.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 text-center text-slate-500 tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        {pkg.title}
                      </td>
                      <td className="py-2.5 px-4">
                        {pkg.config.mapel} · Kelas {pkg.config.kelas}
                      </td>
                      <td className="py-2.5 px-4 text-center tabular-nums">
                        {pkg.questions.length} Soal
                      </td>
                      <td className="py-2.5 px-4">
                        {isFallback ? (
                          <span className="text-amber-800 font-medium">Template Darurat</span>
                        ) : (
                          <span className="text-[#045f3b] font-medium">
                            {pkg.source || 'AI Gateway'}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onLoadExam) {
                              onLoadExam(pkg);
                            } else {
                              onNavigate('soal');
                            }
                          }}
                          className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-medium text-xs cursor-pointer"
                        >
                          Buka
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Simple Admin Footer Summary (No badges) */}
      {isAdmin && (
        <div className="bg-white border border-slate-300 rounded-md px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-600">
            <strong className="text-slate-800">Ringkasan Sistem:</strong> {totalTeachers} Akun Guru · {recentExams.length} Paket Soal · {docs.length} Dokumen Administrasi
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate('identitas_madrasah')}
              className="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
            >
              Identitas & Kop
            </button>
            <button
              type="button"
              onClick={() => onNavigate('admin_panel')}
              className="px-3 py-1.5 rounded bg-[#0f2742] hover:bg-slate-800 text-white font-medium cursor-pointer"
            >
              Panel Admin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
