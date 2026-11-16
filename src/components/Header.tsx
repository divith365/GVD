import React from 'react';
import { Car, Bike, ShieldCheck, LogOut, Download } from 'lucide-react';
import { SessionUser } from '../services/store';

interface HeaderProps {
  session: SessionUser | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ session, onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg w-full max-w-full overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="h-10 flex items-center justify-center shrink-0">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-lg tracking-tight text-white truncate">
                GVD Auto World
              </h1>
            </div>
            {session && (
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 truncate">
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

        {/* Actions: Install & Logout */}
        <div className="flex items-center gap-2">
          {/* Install App Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-gvd-install'))}
            title="Install GVD Auto App on Phone"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline sm:inline">Install</span>
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
