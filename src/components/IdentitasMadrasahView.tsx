import React, { useState, useRef } from 'react';
import { MadrasahIdentity } from '../types';
import { MADRASAH_IDENTITY } from '../data/mockAndPresets';
import { LogoMadrasahSvg, KopMadrasah } from './KopMadrasah';
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  Trash2,
  Info,
  Camera,
  AlertCircle,
} from 'lucide-react';

interface IdentitasMadrasahViewProps {
  identity: MadrasahIdentity;
  onUpdateIdentity: (newIdentity: MadrasahIdentity) => void;
}

export const IdentitasMadrasahView: React.FC<IdentitasMadrasahViewProps> = ({
  identity,
  onUpdateIdentity,
}) => {
  const [formData, setFormData] = useState<MadrasahIdentity>({ ...identity });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoUploadMsg, setLogoUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activePreview, setActivePreview] = useState<'presensi' | 'ujian' | 'pengesahan'>('presensi');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof MadrasahIdentity, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setLogoUploadMsg({ type: 'error', text: 'Format file tidak didukung. Harap pilih gambar (PNG, JPG, SVG, atau WebP).' });
      setTimeout(() => setLogoUploadMsg(null), 4000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadMsg({ type: 'error', text: 'Ukuran file terlalu besar (maksimal 5MB).' });
      setTimeout(() => setLogoUploadMsg(null), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setFormData((prev) => ({ ...prev, logoUrl: result }));
        setLogoUploadMsg({ type: 'success', text: 'Logo berhasil diunggah! Klik "Simpan Perubahan" untuk menyimpan permanen.' });
        setTimeout(() => setLogoUploadMsg(null), 4500);
      }
    };
    reader.onerror = () => {
      setLogoUploadMsg({ type: 'error', text: 'Gagal membaca file gambar.' });
      setTimeout(() => setLogoUploadMsg(null), 4000);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleLogoFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleLogoFile(e.dataTransfer.files[0]);
    }
  };

  const handleResetLogo = () => {
    setFormData((prev) => {
      const updated = { ...prev };
      delete updated.logoUrl;
      return updated;
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLogoUploadMsg({ type: 'success', text: 'Logo dikembalikan ke Logo Resmi MA NU bawaan.' });
    setTimeout(() => setLogoUploadMsg(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onUpdateIdentity(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleResetToMock = () => {
    setFormData({ ...MADRASAH_IDENTITY });
    onUpdateIdentity(MADRASAH_IDENTITY);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* Title Bar: Exact Icon & Typography matching uploaded screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Identitas Madrasah (KOP & Laporan)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola data satuan pendidikan, logo lembaga, kepala madrasah, dan parameter resmi untuk KOP naskah soal serta administrasi guru.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Data Identitas Tersimpan & Sinkron!</span>
          </div>
        )}
      </div>

      {/* Main Card: Visual Replica of user's uploaded image */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Top Section: Logo in Dashed Container + Nama Lengkap & Alamat */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Left: Dashed Rounded Box for Madrasah Logo with Upload & Drag-Drop */}
            <div className="shrink-0 flex flex-col items-center">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                className="hidden"
                id="logo-file-input"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                title="Klik atau seret gambar ke sini untuk mengganti logo madrasah"
                className={`w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border-2 border-dashed relative cursor-pointer overflow-hidden transition-all duration-200 flex flex-col items-center justify-center p-3 group ${
                  isDragging
                    ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100 scale-102'
                    : 'border-slate-300 bg-slate-50/60 hover:border-purple-400 hover:bg-slate-100/70 shadow-2xs'
                }`}
              >
                {formData.logoUrl ? (
                  <img
                    src={formData.logoUrl}
                    alt={formData.nama}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-contain drop-shadow-xs transition-transform group-hover:scale-105"
                  />
                ) : (
                  <LogoMadrasahSvg className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xs transition-transform group-hover:scale-105" />
                )}

                {/* Hover Overlay with Camera/Upload Icon */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 rounded-3xl text-center backdrop-blur-2xs">
                  <Camera className="w-6 h-6 mb-1 text-purple-200" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    {formData.logoUrl ? 'Ganti Logo' : 'Unggah Logo'}
                  </span>
                  <span className="text-[8.5px] text-purple-200">Klik / Tarik File</span>
                </div>
              </div>

              {/* Status Badge & Label */}
              <div className="mt-2 text-center space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 tracking-wide uppercase block">
                  {formData.logoUrl ? 'Logo Kustom Satuan' : 'LOGO RESMI MA NU'}
                </span>

                {/* Upload & Reset Buttons */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60 transition cursor-pointer"
                    title="Pilih file gambar dari perangkat"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Unggah</span>
                  </button>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={handleResetLogo}
                      className="inline-flex items-center space-x-1 px-2 py-1 rounded-lg text-[10.5px] font-bold bg-slate-100 text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer"
                      title="Kembalikan ke logo default"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Default</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Yayasan, Nama Satuan, Akreditasi, Alamat */}
            <div className="flex-1 w-full space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  NAMA YAYASAN / BADAN PENYELENGGARA (KOP)
                </label>
                <input
                  type="text"
                  value={formData.yayasan || ''}
                  onChange={(e) => handleChange('yayasan', e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 font-bold text-xs sm:text-sm tracking-wide focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
                  placeholder="YAYASAN LP MA'ARIF NU KABUPATEN BATANG"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                  NAMA LENGKAP SATUAN PENDIDIKAN
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-extrabold text-base sm:text-lg tracking-tight focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
                  placeholder="MA NU 01 BANYUPUTIH"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                    ALAMAT LENGKAP (KOP)
                  </label>
                  <input
                    type="text"
                    value={formData.alamat}
                    onChange={(e) => handleChange('alamat', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 font-medium text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                    placeholder="Jl. Lapangan 9A Banyuputih, Kab. Batang"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1">
                    STATUS AKREDITASI
                  </label>
                  <input
                    type="text"
                    value={formData.akreditasi || ''}
                    onChange={(e) => handleChange('akreditasi', e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 font-bold text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all uppercase"
                    placeholder="TERAKREDITASI A (UNGGUL)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo Upload Alert / Notification */}
          {logoUploadMsg && (
            <div
              className={`p-3 rounded-2xl text-xs font-semibold flex items-center space-x-2 animate-in fade-in slide-in-from-top-1 ${
                logoUploadMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {logoUploadMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{logoUploadMsg.text}</span>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-100 pt-1"></div>

          {/* Grid: NPSN, TAHUN PELAJARAN, SEMESTER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                NPSN
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => handleChange('npsn', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                placeholder="20364930"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                TAHUN PELAJARAN
              </label>
              <input
                type="text"
                value={formData.tahunAjaran}
                onChange={(e) => handleChange('tahunAjaran', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                placeholder="2026/2027"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                SEMESTER
              </label>
              <div className="relative">
                <select
                  value={formData.semester}
                  onChange={(e) => handleChange('semester', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Grid: MODE JADWAL, KEPALA MADRASAH */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                MODE JADWAL
              </label>
              <div className="relative">
                <select
                  value={formData.modeJadwal}
                  onChange={(e) => handleChange('modeJadwal', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="Reguler (Normal)">Reguler (Normal)</option>
                  <option value="Khusus Ujian / Asesmen">Khusus Ujian / Asesmen</option>
                  <option value="Ramadhan / Terbatas">Ramadhan / Terbatas</option>
                  <option value="Pondok Pesantren / Diniyah">Pondok Pesantren / Diniyah</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="sm:col-span-8">
              <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
                KEPALA MADRASAH
              </label>
              <input
                type="text"
                value={formData.kepalaMadrasah}
                onChange={(e) => handleChange('kepalaMadrasah', e.target.value)}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                placeholder="H. Mukhsin, S.Ag., M.Pd.I."
                required
              />
            </div>
          </div>

          {/* Pelengkap Informasi Kedinasan (NIP, Telepon, Email, Website) */}
          <div className="pt-2">
            <details className="group border border-slate-200 rounded-2xl overflow-hidden">
              <summary className="px-4 py-3 bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:bg-slate-100 transition-colors">
                <span className="flex items-center space-x-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  <span>Informasi Kontak & NIP Resmi Dokumen (Opsional)</span>
                </span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-4 bg-white grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">NIP Kepala Madrasah</label>
                  <input
                    type="text"
                    value={formData.nipKepala}
                    onChange={(e) => handleChange('nipKepala', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs"
                    placeholder="197206151998031002"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Kabupaten / Kota</label>
                  <input
                    type="text"
                    value={formData.kabupaten}
                    onChange={(e) => handleChange('kabupaten', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="Kab. Batang"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">No. Telp / WA</label>
                  <input
                    type="text"
                    value={formData.telepon || ''}
                    onChange={(e) => handleChange('telepon', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="(0285) 666789"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Email Resmi</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="manubanyuputih@gmail.com"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-600 mb-1">Website Resmi</label>
                  <input
                    type="text"
                    value={formData.website || ''}
                    onChange={(e) => handleChange('website', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                    placeholder="https://manu01banyuputih.sch.id"
                  />
                </div>
              </div>
            </details>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToMock}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Mock Awal</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold text-sm shadow-md shadow-purple-600/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan Identitas</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Live Preview Card: Verifikasi Hasil Nyata pada KOP Dokumen Resmi */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                Pratinjau Nyata KOP Resmi Dokumen
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Identitas madrasah dan nama kepala madrasah di atas otomatis diterapkan langsung pada dokumen-dokumen berikut:
            </p>
          </div>

          {/* Switcher Tab Preview */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActivePreview('presensi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreview === 'presensi'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Presensi KBM
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('ujian')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreview === 'ujian'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Naskah Soal
            </button>
            <button
              type="button"
              onClick={() => setActivePreview('pengesahan')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activePreview === 'pengesahan'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tanda Tangan Kepala
            </button>
          </div>
        </div>

        {/* Paper Container (Bordered Sheet) */}
        <div className="bg-[#fcfbf9] p-6 sm:p-8 rounded-2xl border border-slate-200">
          {activePreview === 'presensi' && (
            <div className="space-y-4">
              <KopMadrasah
                identity={formData}
                rightTitle="PRESENSI HARIAN SISWA KBM"
                rightSubtitle="HARI & TANGGAL: Senin, 21 September 2026"
                ta={formData.tahunAjaran}
              />
              <div className="pt-2 text-xs text-slate-600 leading-relaxed">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200/80">
                  <div>
                    <span className="font-bold text-slate-500">Mata Pelajaran:</span>
                    <p className="font-semibold text-slate-800">Seni Tari (Fase E)</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Semester:</span>
                    <p className="font-semibold text-slate-800">{formData.semester}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Mode Jadwal:</span>
                    <p className="font-semibold text-slate-800">{formData.modeJadwal}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500">Kepala Madrasah:</span>
                    <p className="font-bold text-emerald-800">{formData.kepalaMadrasah}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePreview === 'ujian' && (
            <div className="space-y-4">
              <KopMadrasah
                identity={formData}
                rightTitle="ASESMEN SUMATIF TENGAH SEMESTER (ASTS)"
                rightSubtitle={`TA: ${formData.tahunAjaran} | SEMESTER ${formData.semester.toUpperCase()}`}
                ta={formData.tahunAjaran}
              />
              <div className="pt-2 text-center text-xs text-slate-600">
                <p className="font-bold text-slate-800 uppercase tracking-wide">
                  Naskah Soal Ujian Terstandarisasi Madrasah
                </p>
                <p className="text-slate-500 mt-0.5">
                  Satuan Pendidikan: {formData.nama} • NPSN: {formData.npsn}
                </p>
              </div>
            </div>
          )}

          {activePreview === 'pengesahan' && (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                Format Lembar Pengesahan Resmi Administrasi & Modul Ajar
              </p>
              <div className="pt-6 flex justify-between items-end text-xs text-slate-800 px-4 sm:px-12">
                <div className="text-left">
                  <p>Mengetahui,</p>
                  <p className="font-bold mt-1">Kepala {formData.nama}</p>
                  <div className="h-16 flex items-center">
                    <span className="text-[10px] text-slate-400 italic">(Tanda Tangan & Stempel)</span>
                  </div>
                  <p className="font-extrabold underline text-sm text-slate-900">
                    {formData.kepalaMadrasah}
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    NIP. {formData.nipKepala || '197206151998031002'}
                  </p>
                </div>

                <div className="text-right">
                  <p>Banyuputih, 21 September 2026</p>
                  <p className="font-bold mt-1">Guru Pengampu Mata Pelajaran</p>
                  <div className="h-16 flex items-center justify-end">
                    <span className="text-[10px] text-slate-400 italic">(Tanda Tangan Guru)</span>
                  </div>
                  <p className="font-extrabold underline text-sm text-slate-900">
                    Latifatun Nisa, S.Pd.
                  </p>
                  <p className="text-[11px] text-slate-600 font-mono mt-0.5">
                    NIP. 199205142019032015
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
