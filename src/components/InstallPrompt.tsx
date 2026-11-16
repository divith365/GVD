import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('gvd_pwa_dismissed') === 'true';
  });

  useEffect(() => {
    // 1. Check if already installed / running in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect mobile / iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent);
    setIsIOS(isIosDevice);
    setIsMobile(isMobileDevice);

    // 3. Listen for Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowModal(false);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Global custom event listener so ANY button/link can trigger install
    const handleCustomInstall = () => {
      triggerInstall();
    };
    window.addEventListener('open-gvd-install', handleCustomInstall);

    // 6. Auto-show install prompt on mobile link click/first visit
    const hasSeenModal = sessionStorage.getItem('gvd_pwa_prompt_shown');
    const hasInstallParam = window.location.search.includes('install') || window.location.hash.includes('install');

    if (hasInstallParam || (isMobileDevice && !hasSeenModal)) {
      const timer = setTimeout(() => {
        setShowModal(true);
        sessionStorage.setItem('gvd_pwa_prompt_shown', 'true');
      }, 700);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-gvd-install', handleCustomInstall);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setShowModal(false);
        }
        setDeferredPrompt(null);
        return;
      } catch (err) {
        console.error('Error invoking install prompt', err);
      }
    }
    // If native prompt not triggered, open visual guide modal
    setShowModal(true);
  };

  const handleDismissBanner = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gvd_pwa_dismissed', 'true');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* 1. Top Quick Action Bar (Visible unless dismissed) */}
      {!isDismissed && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 py-2 shadow-lg flex items-center justify-between text-xs font-medium sticky top-0 z-50 animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-black/85 p-1 flex items-center justify-center shrink-0 shadow-sm border border-amber-300/30">
              <img src="/logo.webp" alt="GVD" className="w-full h-full object-contain" />
            </div>
            <div className="truncate">
              <p className="font-bold text-black text-xs truncate">
                Install GVD Auto App on Your Mobile
              </p>
              <p className="text-[10px] text-amber-950 font-medium truncate hidden sm:block">
                Instant 1-tap camera access & fast offline vehicle inspections
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={triggerInstall}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 hover:bg-black text-amber-300 hover:text-amber-200 font-bold rounded-lg shadow-sm transition active:scale-95 text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
            <button
              onClick={handleDismissBanner}
              className="p-1 rounded-md text-amber-950 hover:bg-black/10 transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Interactive Install Modal (Triggered by Link click or on Mobile Visit) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative text-center">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Icon & Badge */}
            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-black border border-amber-500/40 p-2.5 flex items-center justify-center shadow-lg shadow-amber-500/10">
              <img src="/logo.webp" alt="GVD Auto World" className="w-full h-full object-contain" />
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight">
              Install GVD Auto App
            </h3>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              Add to your phone home screen for fast camera inspections, full-screen mode, and instant auto-login.
            </p>

            {/* Direct 1-Click Action for Android / Chrome */}
            {deferredPrompt ? (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={triggerInstall}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Tap to Install App Now</span>
                </button>
                <p className="text-[11px] text-slate-500">
                  Instant install • No App Store required
                </p>
              </div>
            ) : isIOS ? (
              /* Step-by-Step for iPhone / Safari */
              <div className="space-y-3 bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 text-xs text-left">
                <p className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4" /> Install on iPhone in 2 Taps:
                </p>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> icon (<Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" />) at the bottom of Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Scroll down and tap <strong className="text-amber-300">"Add to Home Screen"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5" />).
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    3
                  </span>
                  <span>
                    Tap <strong>"Add"</strong> in the top right. Done!
                  </span>
                </div>
              </div>
            ) : (
              /* General Mobile / Desktop Browser Instructions */
              <div className="space-y-3 bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 text-xs text-left">
                <p className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-4 h-4" /> Add to Home Screen:
                </p>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the browser menu <strong>(⋮ or Share)</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Select <strong className="text-amber-300">"Install app"</strong> or <strong className="text-amber-300">"Add to Home screen"</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Secondary Action: Continue in browser */}
            <div className="mt-4 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-xs text-slate-400 hover:text-white transition font-medium"
              >
                Continue in browser ➔
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
