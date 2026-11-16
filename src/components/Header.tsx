import React from 'react';
import { Car, Bike, ShieldCheck, User, LogOut, RotateCcw } from 'lucide-react';
import { SessionUser, appStore } from '../services/store';

interface HeaderProps {
  session: SessionUser | null;
  onLogout: () => void;
  onSwitchSession: (user: SessionUser) => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onLogout, onSwitchSession }) => {
  const centers = appStore.getServiceCenters();
  const managers = appStore.getManagers();

  const handleReset = () => {
    if (confirm('Reset all demo data back to default initial state?')) {
      appStore.resetToDefaults();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 flex items-center justify-center">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="h-9 w-auto object-contain drop-shadow"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                GVD Auto World <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase tracking-wider border border-amber-500/30">PWA</span>
              </h1>
            </div>
            {session && (
              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate">
                {session.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sky-400 font-medium truncate">
                    {session.serviceCenter?.type === 'car' ? (
                      <Car className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Bike className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                    <span className="truncate">{session.serviceCenter?.name} ({session.serviceCenter?.type.toUpperCase()})</span>
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Quick Demo Switcher & Session Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Demo Switcher Dropdown */}
          <div className="hidden sm:flex items-center bg-slate-800/80 rounded-lg p-1 border border-slate-700/60 text-xs">
            <span className="px-2 text-slate-400 font-medium">Demo Switch:</span>
            <button
              onClick={() => onSwitchSession({ role: 'admin', name: 'Master Admin' })}
              className={`px-2.5 py-1 rounded-md transition font-medium ${
                session?.role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Admin
            </button>
            {managers.slice(0, 2).map((mgr) => {
              const c = centers.find(center => center.id === mgr.serviceCenterId);
              const isActive = session?.managerId === mgr.id;
              return (
                <button
                  key={mgr.id}
                  onClick={() =>
                    onSwitchSession({
                      role: 'manager',
                      name: mgr.name,
                      managerId: mgr.id,
                      serviceCenterId: mgr.serviceCenterId,
                      serviceCenter: c
                    })
                  }
                  className={`px-2.5 py-1 rounded-md transition font-medium flex items-center gap-1 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  title={`${mgr.name} (${c?.name}) - PIN: ${mgr.pin}`}
                >
                  {c?.type === 'car' ? <Car className="w-3 h-3" /> : <Bike className="w-3 h-3" />}
                  <span>{mgr.name.split(' ')[0]} ({c?.type})</span>
                </button>
              );
            })}
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={handleReset}
            title="Reset to default mock data"
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 hover:bg-slate-700 border border-slate-700/60 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          {session && (
            <button
              onClick={onLogout}
              title="Logout"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Exit</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
