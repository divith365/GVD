import React, { useState } from 'react';
import { Shield, AlertCircle, Loader2, Download, Building2, Car, Users, Cloud, KeyRound, CheckCircle2 } from 'lucide-react';
import { appStore, SessionUser } from '../services/store';

interface LoginViewProps {
  onLoginSuccess: (user: SessionUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'manager' | 'admin'>('manager');
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 8 && !isVerifying) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setPinError('');

      // Auto-login immediately when 8th digit is entered!
      if (nextPin.length === 8) {
        verifyPin(nextPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    if (!isVerifying) {
      setPin(prev => prev.slice(0, -1));
      setPinError('');
    }
  };

  const verifyPin = async (pinToTest: string) => {
    setIsVerifying(true);
    setPinError('');
    try {
      const user = await appStore.authenticateWithPin(pinToTest);
      if (user) {
        onLoginSuccess(user);
      } else {
        setPinError('Invalid 8-digit PIN. Please check and try again.');
        setTimeout(() => {
          setPin('');
          setIsVerifying(false);
        }, 700);
      }
    } catch (err) {
      setPinError('Verification error. Please try again.');
      setIsVerifying(false);
      setPin('');
    }
  };

  const handleQuickAdminLogin = () => {
    setPin('88888888');
    verifyPin('88888888');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden relative">
        
        {/* Golden Brand Header with Logo */}
        <div className="pt-6 pb-3 px-6 text-center relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-slate-900 to-transparent">
          <div className="w-28 sm:w-36 mx-auto mb-2 transition hover:scale-105 duration-300">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="w-full h-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
            />
          </div>

          <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wide uppercase mt-1">
            Service Inspection & Detailing Portal
          </h2>

          {/* Quick Install Link/Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-gvd-install'))}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/35 text-[11px] font-semibold transition active:scale-95 shadow-sm"
            >
              <Download className="w-3 h-3 text-amber-400" />
              <span>Click to Install App on Mobile</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Manager PIN vs Admin Login */}
        <div className="px-6 pt-2">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('manager');
                setPin('');
                setPinError('');
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                loginMode === 'manager'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Manager PIN</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('admin');
                setPin('');
                setPinError('');
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                loginMode === 'admin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* ADMIN LOGIN PANEL */}
        {loginMode === 'admin' && (
          <div className="px-6 py-5 space-y-4">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>Master Admin Control Portal</span>
              </div>
              <p className="text-xs text-slate-300">
                Full administrative access to manage vehicle inspections, service centers, manager PINs, and Cloudflare configuration.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Car className="w-3 h-3 text-sky-400" /> Vehicle Inspections
                </span>
                <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Building2 className="w-3 h-3 text-amber-400" /> Service Centers
                </span>
                <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Users className="w-3 h-3 text-purple-400" /> Managers & PINs
                </span>
                <span className="flex items-center gap-1 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                  <Cloud className="w-3 h-3 text-orange-400" /> Cloudflare Menu
                </span>
              </div>
            </div>

            {/* Quick 1-Click Admin Login Button */}
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isVerifying}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging into Admin Portal...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log In as Admin (PIN: 88888888)</span>
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-[11px] text-slate-500">
                Or enter custom 8-digit admin PIN on the keypad below
              </span>
            </div>
          </div>
        )}

        {/* PIN Entry Area (Visible in Manager mode OR below in Admin mode) */}
        <div className="px-6 pb-6 pt-1 space-y-4">
          
          {/* 8 PIN Dots Display */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                const isFilled = pin.length > index;
                const isCurrent = pin.length === index;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isFilled
                        ? 'bg-amber-400 border-amber-300 scale-110 shadow-md shadow-amber-500/50'
                        : isCurrent
                        ? 'border-amber-400/80 bg-slate-800 animate-pulse'
                        : 'border-slate-700 bg-slate-800/80'
                    }`}
                  />
                );
              })}
            </div>

            {/* Status / Loading / Error indicator */}
            <div className="min-h-[22px] flex items-center justify-center">
              {isVerifying ? (
                <span className="text-xs text-amber-300 flex items-center gap-1.5 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  Verifying 8-digit PIN...
                </span>
              ) : pinError ? (
                <span className="text-xs text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {pinError}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {8 - pin.length === 8 ? '8 digits required' : `${8 - pin.length} digits remaining`}
                </span>
              )}
            </div>
          </div>

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-2.5 max-w-[270px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                disabled={isVerifying}
                className="h-12 sm:h-13 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-amber-500/20 active:border-amber-500/40 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition disabled:opacity-50"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPin(''); setPinError(''); }}
              disabled={isVerifying}
              className="h-12 sm:h-13 py-2.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition active:scale-95 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={isVerifying}
              className="h-12 sm:h-13 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-amber-500/20 active:border-amber-500/40 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              disabled={isVerifying}
              className="h-12 sm:h-13 py-2.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition active:scale-95 disabled:opacity-50"
            >
              ⌫
            </button>
          </div>

          {/* Quick Admin Access Button in Manager mode */}
          {loginMode === 'manager' && (
            <div className="pt-3 text-center border-t border-slate-800/60">
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-emerald-300 text-[11px] font-medium transition hover:bg-slate-800/60 border border-transparent hover:border-slate-700"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-400/80" />
                <span>Admin Login (PIN: <strong className="font-mono text-emerald-400">88888888</strong>)</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
