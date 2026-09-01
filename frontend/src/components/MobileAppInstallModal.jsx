import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Globe, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Laptop,
  Radio
} from 'lucide-react';

export default function MobileAppInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeDeviceTab, setActiveDeviceTab] = useState('android'); // 'android' | 'ios' | 'desktop'

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      alert('Untuk memasang aplikasi, ikuti panduan visual di bawah sesuai jenis perangkat Anda (Android / iPhone).');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1E3A8A] flex items-center justify-center text-white font-black shadow-sm flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pasang Aplikasi SiPesand Mobile</h3>
              <p className="text-[11px] text-slate-300">Aplikasi Ringan, Cepat & Siap Dipakai Offline di HP</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Native Install Button Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 space-y-3 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm">Pasang Langsung ke Layar Utama (PWA)</h4>
                <p className="text-[11px] text-blue-800/90 mt-0.5 leading-relaxed">
                  Nikmati pengalaman aplikasi mobile seutuhnya tanpa perlu unduh dari Play Store yang memakan memori.
                </p>
              </div>
            </div>

            <button
              onClick={handleNativeInstall}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isInstalled ? 'Aplikasi Sudah Terpasang' : 'Pasang / Install Aplikasi Sekarang'}</span>
            </button>
          </div>

          {/* Device Tabs */}
          <div className="space-y-3">
            <span className="font-bold text-slate-700 block text-xs">Panduan Pemasangan Sesuai Perangkat:</span>
            
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveDeviceTab('android')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  activeDeviceTab === 'android' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📱 Android
              </button>
              <button
                onClick={() => setActiveDeviceTab('ios')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  activeDeviceTab === 'ios' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                🍏 iPhone / iOS
              </button>
              <button
                onClick={() => setActiveDeviceTab('desktop')}
                className={`py-2 rounded-lg font-bold transition-all text-center ${
                  activeDeviceTab === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                💻 Laptop / PC
              </button>
            </div>

            {/* Android Guide */}
            {activeDeviceTab === 'android' && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>Buka website SiPesand di Google Chrome atau browser Android.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Ketuk ikon titik tiga (⋮) di pojok kanan atas browser.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">3</span>
                  <span>Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</span>
                </div>
              </div>
            )}

            {/* iPhone / iOS Guide */}
            {activeDeviceTab === 'ios' && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>Buka website SiPesand menggunakan browser <strong>Safari</strong>.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Ketuk tombol Bagikan / <strong>Share (⎋)</strong> di bilah bawah Safari.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">3</span>
                  <span>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
                </div>
              </div>
            )}

            {/* Desktop Guide */}
            {activeDeviceTab === 'desktop' && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>Buka di Google Chrome, Microsoft Edge, atau Brave.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Klik ikon <strong>Install / Monitor (⊞)</strong> di ujung kanan kolom alamat URL browser.</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">3</span>
                  <span>Klik <strong>"Install"</strong> dan SiPesand akan terbuka seperti aplikasi desktop native.</span>
                </div>
              </div>
            )}
          </div>

          {/* Keunggulan PWA */}
          <div className="p-3.5 bg-slate-100 rounded-2xl space-y-1.5 text-[11px] text-slate-600">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
              <span>Keunggulan Aplikasi SiPesand Mobile:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600">
              <li>Ukuran sangat hemat & tidak memberatkan memori HP.</li>
              <li>Akses cepat satu ketukan langsung dari layar beranda smartphone.</li>
              <li>Mendukung notifikasi tagihan dan update status santri.</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Resmi & Bebas Iklan</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-sm"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
}
