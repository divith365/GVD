import React, { useState } from 'react';
import { ShieldCheck, UserCheck, KeyRound, ArrowRight, Car, Bike, Sparkles, Building2 } from 'lucide-react';
import { appStore, SessionUser } from '../services/store';

interface LoginViewProps {
  onLoginSuccess: (user: SessionUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'manager' | 'admin'>('manager');
  
  // Manager PIN state
  const [pin, setPin] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Admin state
  const [adminEmail, setAdminEmail] = useState<string>('admin@gvdautocare.com');
  const [adminPassword, setAdminPassword] = useState<string>('admin123');

  const centers = appStore.getServiceCenters();
  const managers = appStore.getManagers();

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError('');
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleKeypadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setPinError('');
  };

  const verifyPin = (pinToTest: string) => {
    const result = appStore.verifyManagerPin(pinToTest);
    if (result) {
      onLoginSuccess({
        role: 'manager',
        name: result.manager.name,
        managerId: result.manager.id,
        serviceCenterId: result.manager.serviceCenterId,
        serviceCenter: result.center
      });
    } else {
      setPinError('Invalid 4-digit PIN or manager inactive. Please try again.');
      setPin('');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail && adminPassword) {
      onLoginSuccess({
        role: 'admin',
        name: 'System Admin'
      });
    }
  };

  const handleQuickManagerSelect = (mgrId: string) => {
    const mgr = managers.find(m => m.id === mgrId);
    if (!mgr) return;
    const center = centers.find(c => c.id === mgr.serviceCenterId);
    setPin(mgr.pin);
    verifyPin(mgr.pin);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
            <span className="font-black text-2xl tracking-wider">GVD</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">AutoCare Inspection PWA</h2>
          <p className="text-xs text-sky-100/80 mt-1">
            Car & Bike Service Check-in, Inspection & Before/After Comparison
          </p>

          {/* Role Tabs */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/30 backdrop-blur-md rounded-xl border border-white/10">
            <button
              onClick={() => { setActiveTab('manager'); setPin(''); setPinError(''); }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'manager'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Manager PIN</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeTab === 'admin'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'manager' ? (
            /* MANAGER PIN KEYPAD LOGIN */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs text-slate-400">Enter your assigned 4-Digit Service Center PIN</p>
                
                {/* 4 PIN Dots */}
                <div className="flex items-center justify-center gap-3 my-4">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                        pin.length > index
                          ? 'bg-brand-500 border-brand-400 scale-110 shadow-lg shadow-brand-500/50'
                          : 'border-slate-700 bg-slate-800'
                      }`}
                    />
                  ))}
                </div>

                {pinError && (
                  <p className="text-xs text-red-400 bg-red-500/10 py-1 px-3 rounded-lg border border-red-500/20">
                    {pinError}
                  </p>
                )}
              </div>

              {/* Touch Numpad */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-13 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { setPin(''); setPinError(''); }}
                  className="h-13 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-13 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 active:scale-95 text-lg font-bold text-white border border-slate-700/60 shadow-sm transition"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleKeypadBackspace}
                  className="h-13 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-semibold text-slate-400 border border-slate-700/40 transition"
                >
                  ⌫
                </button>
              </div>

              {/* Quick Manager Click Pills for Demo Testing */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> Quick Demo Manager Login:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {managers.slice(0, 4).map((mgr) => {
                    const c = centers.find(center => center.id === mgr.serviceCenterId);
                    return (
                      <button
                        key={mgr.id}
                        type="button"
                        onClick={() => handleQuickManagerSelect(mgr.id)}
                        className="text-left p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/60 hover:border-brand-500/50 transition group"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-white group-hover:text-brand-300">
                          {c?.type === 'car' ? (
                            <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          ) : (
                            <Bike className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          )}
                          <span className="truncate">{mgr.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {c?.name}
                        </p>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                          <span>PIN: <strong className="text-amber-400">{mgr.pin}</strong></span>
                          <span className="uppercase text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300">{c?.type}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* ADMIN LOGIN */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-brand-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 active:scale-98 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition"
              >
                <span>Enter Admin Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 text-xs text-slate-400">
                <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Admin Capabilities:
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  <li>Create Service Centers (Name, Location, Car/Bike type)</li>
                  <li>Create Managers, assign centers & generate login PINs</li>
                  <li>Center-filtered dashboard & before/after comparison</li>
                </ul>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
