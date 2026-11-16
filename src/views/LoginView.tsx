import React, { useState, useEffect } from 'react';
import { KeyRound, Shield, Sparkles, Car, Bike, AlertCircle, Loader2, Download } from 'lucide-react';
import { appStore, SessionUser } from '../services/store';

interface LoginViewProps {
  onLoginSuccess: (user: SessionUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);

  const centers = appStore.getServiceCenters();
  const managers = appStore.getManagers();

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
    try {
      const user = await appStore.authenticateWithPin(pinToTest);
      if (user) {
        onLoginSuccess(user);
      } else {
        setPinError('Invalid 8-digit PIN. Please check and try again.');
        setTimeout(() => {
          setPin('');
          setIsVerifying(false);
        }, 600);
      }
    } catch (err) {
      setPinError('Verification error. Please try again.');
      setIsVerifying(false);
      setPin('');
    }
  };

  const handleQuickFill = (testPin: string) => {
    setPin(testPin);
    verifyPin(testPin);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl shadow-black/80 overflow-hidden relative">
        
        {/* Golden Brand Header with Logo */}
        <div className="pt-7 pb-4 px-6 text-center relative overflow-hidden bg-gradient-to-b from-amber-950/40 via-slate-900 to-transparent">
          <div className="w-40 sm:w-48 mx-auto mb-2 transition hover:scale-105 duration-300">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="w-full h-auto object-contain drop-shadow-[0_8px_20px_rgba(245,158,11,0.25)]"
            />
          </div>

          <h2 className="text-sm sm:text-base font-bold text-amber-300 tracking-wide uppercase mt-1">
            Service Inspection & Detailing Portal
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAdminMode ? 'Enter 8-Digit Master Admin Security PIN' : 'Enter 8-Digit Manager PIN to Auto-Login'}
          </p>

          {/* Quick Install Link/Button */}
          <div className="mt-2.5">
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

        {/* PIN Entry Area */}
        <div className="px-6 pb-6 pt-1 space-y-4">
          
          {/* 8 PIN Dots Display */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 sm:gap-2.5 my-3">
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

          {/* Quick Demo Fill Buttons (Managers) */}
          <div className="pt-3 border-t border-slate-800/80">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Quick Demo Login (8-Digit PINs):
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {managers.slice(0, 4).map((mgr) => {
                const c = centers.find(center => center.id === mgr.serviceCenterId);
                return (
                  <button
                    key={mgr.id}
                    type="button"
                    onClick={() => handleQuickFill(mgr.pin)}
                    className="text-left p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 transition group"
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-white group-hover:text-amber-300">
                      {c?.type === 'car' ? (
                        <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      ) : (
                        <Bike className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                      <span className="truncate">{mgr.name}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400 font-mono">
                      <span>PIN: <strong className="text-amber-400">{mgr.pin}</strong></span>
                      <span className="uppercase text-[9px] px-1 rounded bg-slate-700 text-slate-300">{c?.type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Small, Discreet Admin Login at Bottom */}
          <div className="pt-2 text-center border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => handleQuickFill('88888888')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-amber-300 text-[11px] font-medium transition hover:bg-slate-800/60 border border-transparent hover:border-slate-700"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Admin Access (PIN: <strong className="font-mono text-amber-400">88888888</strong>)</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
