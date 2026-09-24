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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-lg bg-[#c8853a]/10 text-[#c8853a]">
            <History className="w-5 h-5" />
          </span>
          <div>
            <h1 className="font-heading text-xl font-bold text-slate-900">
              Riwayat Arsip & Bank Soal Madrasah
            </h1>
            <p className="text-xs text-slate-500">
              Akses cepat bank soal terverifikasi, dokumen tersimpan (auto-save), dan unduh ulang file Word .docx
            </p>
          </div>
        </div>

        {/* Tab & Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari mapel atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs w-48 sm:w-64 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sub-tab selection */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('soal')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'soal'
              ? 'bg-[#1e4d7b] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Paket Soal Ujian ({filteredExams.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('dokumen')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition ${
            activeTab === 'dokumen'
              ? 'bg-[#2d7a5f] text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Dokumen Administrasi Guru ({filteredDocs.length})</span>
        </button>
      </div>

      {/* Content List */}
      {activeTab === 'soal' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <div
              key={exam.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#1e4d7b] transition space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1e4d7b]">
                    {exam.config.jenisUjian} • {exam.config.mapel}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Kelas {exam.config.kelas} / Sem {exam.config.semester}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                  {exam.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {exam.config.capaianPembelajaran}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-3">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{exam.createdBy}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(exam.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    {exam.questions.length} Butir Soal
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onLoadExam(exam)}
                  className="text-xs font-semibold text-[#1e4d7b] hover:underline flex items-center space-x-1"
                >
                  <span>Buka di Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleCopyExam(exam)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Salin plain text"
                  >
                    {copiedId === exam.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => exportExamToDocx(exam)}
                    className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1e4d7b] hover:bg-[#153a5e] text-white text-xs font-medium"
                  >
                    <Download className="w-3 h-3" />
                    <span>.docx</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-[#2d7a5f] transition space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-[#2d7a5f]">
                    {doc.type.toUpperCase().replace('_', ' ')} • {doc.config.mapel}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Fase {doc.config.fase} / Kelas {doc.config.kelas}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 leading-snug">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  Topik: {doc.config.topikMateri}
                </p>

                <div className="flex items-center space-x-3 text-[11px] text-slate-400 mt-3">
                  <span className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{doc.createdBy}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(doc.createdAt).toLocaleDateString('id-ID')}</span>
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => exportAdminDocToDocx(doc)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#2d7a5f] hover:bg-[#23604a] text-white text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .docx</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
