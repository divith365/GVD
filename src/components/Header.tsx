import React, { useState } from 'react';
import { 
  Car, Bike, ShieldCheck, LogOut, Download, Menu, X, 
  SplitSquareVertical, Building2, Users, Cloud, CheckSquare 
} from 'lucide-react';
import { SessionUser } from '../services/store';

export type AdminMenuTab = 'vehicles' | 'centers' | 'managers' | 'cloudflare';

interface HeaderProps {
  session: SessionUser | null;
  onLogout: () => void;
  adminTab?: AdminMenuTab;
  onAdminTabChange?: (tab: AdminMenuTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  session, 
  onLogout,
  adminTab = 'vehicles',
  onAdminTabChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab: AdminMenuTab) => {
    if (onAdminTabChange) {
      onAdminTabChange(tab);
    }
    setMobileMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    onLogout();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg w-full max-w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 min-w-0">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink-0">
          <div className="h-9 sm:h-10 flex items-center justify-center shrink-0">
            <img
              src="/logo.webp"
              alt="GVD Auto World"
              className="h-8 sm:h-9 w-auto object-contain drop-shadow"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm sm:text-base tracking-tight text-white truncate">
                GVD Auto World
              </h1>
            </div>
            {session && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                {session.role === 'admin' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Admin Control
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

        {/* ADMIN MENU (Desktop): Vehicle Inst, Service Centers, Managers & PINs, Cloudflare */}
        {session?.role === 'admin' && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => handleTabClick('vehicles')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                adminTab === 'vehicles'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5 text-sky-300" />
              <span>Vehicle Inspections</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('centers')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                adminTab === 'centers'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              <span>Service Centers</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('managers')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                adminTab === 'managers'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Managers & PINs</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('cloudflare')}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                adminTab === 'cloudflare'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 ring-1 ring-brand-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-orange-400" />
              <span>Cloudflare</span>
            </button>
          </nav>
        )}

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Mobile Admin Menu Toggle Button */}
          {session?.role === 'admin' && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Toggle Admin Menu"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4" />}
            </button>
          )}

          {/* Install App Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-gvd-install'))}
            title="Install GVD Auto App on Phone"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Install</span>
          </button>

          {/* Logout Button */}
          {session && (
            <button
              onClick={handleLogoutClick}
              title="Logout from session"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 border border-red-500/35 transition active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU FOR ADMIN */}
      {session?.role === 'admin' && mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-1.5 animate-in slide-in-from-top-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 pt-1 pb-0.5">
            Admin Navigation Menu
          </p>

          <button
            type="button"
            onClick={() => handleTabClick('vehicles')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
              adminTab === 'vehicles'
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <SplitSquareVertical className="w-4 h-4 text-sky-400" />
              <span>Vehicle Inspections</span>
            </span>
            <span className="text-[10px] text-slate-400">Inspections & Jobs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('centers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
              adminTab === 'centers'
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Service Centers</span>
            </span>
            <span className="text-[10px] text-slate-400">Car & Bike Centers</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('managers')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
              adminTab === 'managers'
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Managers & PINs</span>
            </span>
            <span className="text-[10px] text-slate-400">Security PINs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('cloudflare')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition ${
              adminTab === 'cloudflare'
                ? 'bg-brand-600 text-white'
                : 'text-slate-300 hover:bg-slate-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-orange-400" />
              <span>Cloudflare</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold">D1 & R2 Menu</span>
          </button>

          <div className="pt-2 border-t border-slate-900">
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout Admin Session</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
