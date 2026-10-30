import React, { useState } from 'react';
import { ExamPackage, GeneratedAdminDoc } from '../types';
import { exportExamToDocx, exportAdminDocToDocx } from '../utils/docxExport';
import {
  History,
  BookOpen,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  Search,
  Calendar,
  User,
  ArrowRight,
} from 'lucide-react';

interface BankSoalAndHistoryViewProps {
  exams: ExamPackage[];
  documents: GeneratedAdminDoc[];
  onLoadExam: (exam: ExamPackage) => void;
}

export const BankSoalAndHistoryView: React.FC<BankSoalAndHistoryViewProps> = ({
  exams,
  documents,
  onLoadExam,
}) => {
  const [activeTab, setActiveTab] = useState<'soal' | 'dokumen'>('soal');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredExams = exams.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.config.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.config.mapel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyExam = (pkg: ExamPackage) => {
    let text = `${pkg.title}\n`;
    pkg.questions.forEach((q) => {
      text += `\n${q.number}. ${q.text}\n`;
      if (q.options) {
        q.options.forEach((o) => (text += `${o.key}. ${o.text}\n`));
      }
      text += `${q.rawRightAnswer}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopiedId(pkg.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border-2 border-slate-200/90 shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Arsip & Bank Soal Madrasah
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 uppercase">
                Bank Dokumen
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              MA NU 01 Banyuputih · Penyimpanan terpusat paket naskah soal asesmen dan modul ajar guru
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari mapel atau nama guru..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700/10 focus:border-emerald-700 transition"
          />
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('soal')}
          className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'soal'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className={`w-3.5 h-3.5 ${activeTab === 'soal' ? 'text-emerald-800' : 'text-slate-400'}`} />
          <span>Paket Soal Asesmen ({filteredExams.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dokumen')}
          className={`px-3.5 sm:px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'dokumen'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'dokumen' ? 'text-emerald-800' : 'text-slate-400'}`} />
          <span>Perangkat Administrasi ({filteredDocs.length})</span>
        </button>
      </div>

      {/* Content List */}
      {activeTab === 'soal' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-emerald-900">
                    {exam.config.jenisUjian} · {exam.config.mapel}
                  </span>
                  <span>
                    Kelas {exam.config.kelas} · Sem {exam.config.semester}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {exam.config.capaianPembelajaran || 'Naskah soal asesmen madrasah terstruktur.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.createdBy}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(exam.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-slate-700 tabular-nums">
                    {exam.questions.length} Butir Soal
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onLoadExam(exam)}
                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center space-x-1 cursor-pointer"
                >
                  <span>Buka di Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={() => handleCopyExam(exam)}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                    title="Salin Naskah Soal"
                  >
                    {copiedId === exam.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => exportExamToDocx(exam)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition cursor-pointer"
                    title="Unduh Word .docx"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Word</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredExams.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90">
              <BookOpen className="w-8 h-8 mx-auto opacity-30 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Tidak ada paket soal yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-emerald-700 uppercase">
                    {doc.type.replace('_', ' ')} · {doc.config.mapel}
                  </span>
                  <span>
                    Kelas {doc.config.kelas} · Sem {doc.config.semester}
                  </span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base text-slate-900 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                  {doc.config.topikMateri || 'Perangkat pembelajaran Kurikulum Merdeka.'}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
                  <span className="flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.createdBy}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(doc.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => exportAdminDocToDocx(doc)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
                  title="Unduh Dokumen Word .docx"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Download .docx</span>
                </button>
              </div>
            </div>
          ))}
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/90">
              <FileSpreadsheet className="w-8 h-8 mx-auto opacity-30 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-600">Tidak ada dokumen yang cocok dengan pencarian.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
