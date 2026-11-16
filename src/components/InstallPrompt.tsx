import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);
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

    // 2. Check if iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Listen for Android/Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Android / Chrome
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      // iOS Safari guide
      setShowIOSModal(true);
    } else {
      // Desktop / Other: Show guide
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('gvd_pwa_dismissed', 'true');
  };

  // If already installed or dismissed this session, don't show the banner
  if (isInstalled || isDismissed) {
    return null;
  }

  return (
    <>
      {/* Top Banner on Mobile / Web */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-slate-950 px-3 py-2 shadow-lg flex items-center justify-between text-xs font-medium sticky top-0 z-50 animate-fadeIn">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-black/80 p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img src="/logo.webp" alt="GVD" className="w-full h-full object-contain" />
          </div>
          <div className="truncate">
            <p className="font-bold text-black text-xs truncate">
              Install GVD Auto App on Mobile
            </p>
            <p className="text-[10px] text-amber-950 font-medium truncate hidden sm:block">
              Fast 1-tap home screen access for camera inspections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1 px-3 py-1 bg-slate-950 hover:bg-black text-amber-300 hover:text-amber-200 font-bold rounded-lg shadow transition active:scale-95 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-amber-950 hover:bg-black/10 transition"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS & Browser Install Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-14 h-14 mx-auto mb-2 rounded-2xl bg-black border border-amber-500/30 p-2 flex items-center justify-center shadow-md">
                <img src="/logo.webp" alt="GVD" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-base font-bold text-white">Install GVD Auto App</h3>
              <p className="text-xs text-slate-400 mt-1">
                Install directly on your phone home screen without app store downloads.
              </p>
            </div>

            {isIOS ? (
              <div className="space-y-3 bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> iPhone / iPad Steps:
                </p>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong>Share</strong> button at the bottom of Safari (<Share className="w-3.5 h-3.5 inline mx-0.5 text-sky-400" /> icon).
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
                    Tap <strong>"Add"</strong> in the top right. The GVD Auto app will appear on your home screen!
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/60 text-xs">
                <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" /> Android / Mobile Steps:
                </p>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    1
                  </span>
                  <span>
                    Tap the <strong>3 dots (⋮)</strong> menu in Chrome / your browser.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                    2
                  </span>
                  <span>
                    Tap <strong className="text-amber-300">"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition shadow"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
