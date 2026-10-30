import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Eye, EyeOff, Lock, Sparkles, Building2, Shield, ArrowRight, Check } from 'lucide-react';
import { LogoMadrasahSvg } from './KopMadrasah';

interface PinLoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'warning') => void;
}

export const PinLoginView: React.FC<PinLoginViewProps> = ({
  users,
  onLoginSuccess,
  onShowToast,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isMasked, setIsMasked] = useState<boolean>(true);

  // Handle keyboard typing for the PIN
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 6) {
          setPin((prev) => prev + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (pin.length === 6) {
          handleVerifyPin(pin);
        } else {
          onShowToast('Silakan masukkan 6 digit PIN akses lengkap.', 'warning');
        }
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        setPin('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, users]);

  // Verify PIN immediately when it reaches 6 digits
  useEffect(() => {
    if (pin.length === 6) {
      handleVerifyPin(pin);
    }
  }, [pin]);

  const handleVerifyPin = (enteredPin: string) => {
    const matchedUser = users.find((u) => u.pin === enteredPin);

    if (matchedUser) {
      onShowToast(`Selamat datang kembali, ${matchedUser.name}!`, 'success');
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 400);
    } else {
      onShowToast('PIN akses salah! Periksa kembali atau pilih akun pengajar di bawah.', 'error');
      setPin('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const handleQuickLogin = (user: User) => {
    if (user.pin) {
      setPin(user.pin);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f3ed] flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      
      {/* Decorative Subtle Background Aura */}
      <div className="absolute top-0 inset-x-0 h-72 bg-[#053b26] border-b-4 border-amber-400" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="max-w-md w-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative z-10">
        
        {/* Madrasah Branding & Crest */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-18 h-18 rounded-2xl bg-white p-2.5 shadow-md border-2 border-amber-400 flex items-center justify-center -mt-12 bg-white">
            <LogoMadrasahSvg className="w-full h-full" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-emerald-800 tracking-wider uppercase block">
              LP MA'ARIF NU KABUPATEN BATANG
            </span>
            <h1 className="font-heading text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              MA NU 01 BANYUPUTIH
            </h1>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Portal Asesmen Madrasah & Administrasi Kurikulum Merdeka
            </p>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold mt-2">
              <span>★ TERAKREDITASI A (UNGGUL) ★</span>
            </div>
          </div>
        </div>

        {/* PIN Entry Display Area */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-700 font-semibold flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Masukkan 6 Digit PIN Pengajar</span>
            </span>
            <button
              type="button"
              onClick={() => setIsMasked(!isMasked)}
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
              title={isMasked ? 'Tampilkan Angka' : 'Sembunyikan Angka'}
            >
              {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Masked Indicator Slots */}
          <div className="flex items-center justify-center space-x-2.5 sm:space-x-3 py-3.5 bg-slate-50 rounded-2xl border-2 border-slate-200">
            {[...Array(6)].map((_, i) => {
              const hasDigit = pin.length > i;
              const digit = pin[i];
              return (
                <div
                  key={i}
                  className={`w-10 h-12 rounded-xl border-2 flex items-center justify-center font-mono font-black text-lg transition-all duration-150 tabular-nums ${
                    hasDigit
                      ? 'border-emerald-700 bg-white text-emerald-900 shadow-xs'
                      : 'border-slate-200 bg-slate-100/60 text-transparent'
                  }`}
                >
                  {hasDigit ? (isMasked ? '●' : digit) : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Numeric Keypad Pad */}
        <div className="grid grid-cols-3 gap-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 active:scale-[0.98] transition-all text-slate-900 font-heading font-bold text-lg flex items-center justify-center cursor-pointer tabular-nums shadow-2xs"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 active:scale-[0.98] transition-all text-slate-600 font-semibold text-xs flex items-center justify-center cursor-pointer"
          >
            Hapus
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="h-12 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 active:scale-[0.98] transition-all text-slate-900 font-heading font-bold text-lg flex items-center justify-center cursor-pointer tabular-nums shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-12 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 active:scale-[0.98] transition-all text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer"
            title="Hapus Satu Digit"
          >
            ⌫
          </button>
        </div>

        {/* Quick Teacher Account Selector for Fast Trial */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
            Akses Cepat Pengajar (Klik untuk Isi PIN):
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {users.slice(0, 3).map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickLogin(u)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition text-left cursor-pointer group"
              >
                <div className="text-[11px] font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                  {u.name.split(',')[0]}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                  PIN: {u.pin}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Institutional Bottom Banner */}
      <div className="text-center mt-6 text-xs text-slate-500 space-y-1 relative z-10">
        <p className="font-semibold text-slate-700">
          MA NU 01 Banyuputih · Kabupaten Batang, Jawa Tengah
        </p>
        <p className="text-[11px] text-slate-400">
          Jl. Lapangan 9A Banyuputih · NPSN: 20364930 · Telp: (0285) 666789
        </p>
      </div>

    </div>
  );
};
