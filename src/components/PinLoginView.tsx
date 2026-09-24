import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Eye, EyeOff, Lock } from 'lucide-react';
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
      // Delay success login slightly to allow toast and sound transition
      setTimeout(() => {
        onLoginSuccess(matchedUser);
      }, 500);
    } else {
      onShowToast('PIN akses salah! Periksa kembali atau hubungi Operator.', 'error');
      // Reset PIN with a tiny haptic feel / visual feedback
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/30 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Decorative subtle background accents */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-60 pointer-events-none"></div>

      {/* Soft warm glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 p-6 sm:p-8 space-y-6 relative z-10 shadow-xl shadow-slate-900/5">
        
        {/* Madrasah Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="p-3.5 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 shadow-xs">
            <LogoMadrasahSvg className="w-12 h-12" />
          </div>
          <div>
            <h1 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              MA NU 01 BANYUPUTIH
            </h1>
            <p className="text-[10.5px] sm:text-xs text-emerald-800 font-semibold tracking-wide uppercase mt-0.5">
              Portal Akses Guru & Staf
            </p>
          </div>
        </div>

        {/* PIN Entry Display Area */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10.5px] text-slate-500 font-bold tracking-wider uppercase flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Masukkan 6-Angka PIN Akses</span>
            </span>
            <button
              onClick={() => setIsMasked(!isMasked)}
              className="text-slate-400 hover:text-slate-700 transition cursor-pointer p-1"
              title={isMasked ? 'Tampilkan Angka' : 'Sembunyikan Angka'}
            >
              {isMasked ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center space-x-3.5 py-4 bg-slate-50/90 rounded-2xl border border-slate-200/90 shadow-inner relative">
            {[...Array(6)].map((_, i) => {
              const hasDigit = pin.length > i;
              const digit = pin[i];
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-150 flex items-center justify-center font-mono font-extrabold text-xs ${
                    hasDigit
                      ? 'border-emerald-600 bg-emerald-500/20 text-emerald-800 scale-110 shadow-2xs'
                      : 'border-slate-300 bg-white text-transparent'
                  }`}
                >
                  {hasDigit && !isMasked ? digit : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Numeric Keypad Pad */}
        <div className="grid grid-cols-3 gap-2.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeypadPress(digit)}
              className="py-3.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/80 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-300 active:scale-95 transition-all text-slate-800 font-heading font-extrabold text-base flex items-center justify-center shadow-2xs hover:shadow-xs cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-xl bg-rose-50/70 hover:bg-rose-100 hover:text-rose-800 border border-rose-200/80 hover:border-rose-300 active:scale-95 transition-all text-rose-700 font-bold text-xs flex items-center justify-center cursor-pointer shadow-2xs"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress('0')}
            className="py-3.5 rounded-xl bg-slate-50/80 hover:bg-emerald-50/80 hover:text-emerald-900 border border-slate-200/90 hover:border-emerald-300 active:scale-95 transition-all text-slate-800 font-heading font-extrabold text-base flex items-center justify-center shadow-2xs hover:shadow-xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-95 transition-all text-slate-700 font-bold text-base flex items-center justify-center cursor-pointer shadow-2xs"
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-[11px] text-slate-400 font-medium mt-8 text-center space-y-0.5">
        <p>© 2026 MA NU 01 Banyuputih Batang · Kurikulum Merdeka</p>
        <p className="text-slate-400 text-[10px]">Sistem Asesmen & Administrasi Guru Madrasah</p>
      </div>
    </div>
  );
};
