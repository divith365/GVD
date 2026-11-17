import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, Loader2, Download, KeyRound, Sparkles } from 'lucide-react';
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

      // Auto-verify immediately once all 8 digits are entered
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
        setPinError(`Invalid 8-digit ${loginMode === 'admin' ? 'Admin' : 'Manager'} PIN.`);
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

  const handleQuickAdminFill = () => {
    setPin('88888888');
    verifyPin('88888888');
  };

  // Enable physical keyboard entry on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isVerifying) return;
      if (e.key >= '0' && e.key <= '9') {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadBackspace();
      } else if (e.key === 'Escape') {
        setPin('');
        setPinError('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isVerifying, loginMode]);

  const isAdmin = loginMode === 'admin';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden relative">
        
        {/* Golden Brand Header with Logo */}
        <div className="pt-6 pb-2 px-6 text-center relative overflow-hidden bg-gradient-to-b from-amber-950/30 via-slate-900 to-transparent">
          <div className="w-24 sm:w-28 mx-auto mb-2 transition hover:scale-105 duration-300">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="w-full h-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
            />
          </div>

          <h2 className="text-xs sm:text-sm font-bold text-amber-300 tracking-wide uppercase">
            Service Inspection Portal
          </h2>

          {/* Quick Install Link/Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-gvd-install'))}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition active:scale-95 shadow-sm"
            >
              <Download className="w-3 h-3 text-amber-400" />
              <span>Install App on Mobile</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Manager PIN vs Admin Login */}
        <div className="px-5 pt-3">
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setLoginMode('manager');
                setPin('');
                setPinError('');
              }}
              className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                !isAdmin
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
              className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                isAdmin
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Main PIN Entry Panel */}
        <div className="px-5 pb-6 pt-4 space-y-4">

          {/* Mode Subtitle & Quick Fill */}
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-slate-300">
              {isAdmin ? 'Enter 8-digit Admin PIN' : 'Enter 8-digit Manager PIN'}
            </p>
            {isAdmin && (
              <button
                type="button"
                onClick={handleQuickAdminFill}
                disabled={isVerifying}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-400/90 hover:text-emerald-300 transition underline underline-offset-2 decoration-emerald-500/40"
              >
                <Sparkles className="w-3 h-3" />
                <span>Quick Admin Fill (88888888)</span>
              </button>
            )}
          </div>
          
          {/* 8 PIN Dots Display */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-1">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => {
                const isFilled = pin.length > index;
                const isCurrent = pin.length === index;
                return (
                  <div
                    key={index}
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                      isFilled
                        ? isAdmin
                          ? 'bg-emerald-400 border-emerald-300 scale-110 shadow-md shadow-emerald-500/50'
                          : 'bg-amber-400 border-amber-300 scale-110 shadow-md shadow-amber-500/50'
                        : isCurrent
                        ? isAdmin
                          ? 'border-emerald-400/80 bg-slate-800 animate-pulse'
                          : 'border-amber-400/80 bg-slate-800 animate-pulse'
                        : 'border-slate-700 bg-slate-800/80'
                    }`}
                  />
                );
              })}
            </div>

            {/* Status / Loading / Error indicator */}
            <div className="min-h-[22px] flex items-center justify-center pt-1">
              {isVerifying ? (
                <span className={`text-xs flex items-center gap-1.5 font-semibold ${isAdmin ? 'text-emerald-300' : 'text-amber-300'}`}>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Verifying PIN...
                </span>
              ) : pinError ? (
                <span className="text-xs text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-lg border border-red-500/20 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" /> {pinError}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">
                  {8 - pin.length === 8 ? '8 digits required' : `${8 - pin.length} digits remaining`}
                </span>
              )}
            </div>
          </div>

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 max-w-[260px] mx-auto pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                disabled={isVerifying}
                className="h-12 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-amber-500/20 active:border-amber-500/40 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition disabled:opacity-50"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setPin(''); setPinError(''); }}
              disabled={isVerifying}
              className="h-12 py-2.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition active:scale-95 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              disabled={isVerifying}
              className="h-12 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-750 active:bg-amber-500/20 active:border-amber-500/40 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleKeypadBackspace}
              disabled={isVerifying}
              className="h-12 py-2.5 rounded-2xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition active:scale-95 disabled:opacity-50"
            >
              ⌫
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
