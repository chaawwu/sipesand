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
  Radio, 
  Package, 
  Building2, 
  Sparkles, 
  FileCheck 
} from 'lucide-react';
import { getCurrentTenant } from '../services/localDatabase';
import { getApkDownloadUrl } from '../services/mobileAppService';

export default function MobileAppInstallModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('apk'); // 'apk' | 'pwa' | 'ios'
  const currentTenant = getCurrentTenant();
  const apkDownloadUrl = getApkDownloadUrl();

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
      alert('Untuk memasang web app, ikuti petunjuk visual pada tab di bawah.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-xs">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg flex-shrink-0 border border-blue-400/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Download & Pasang Aplikasi SiPesand</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Native Android (.APK)
                </span>
              </div>
              <p className="text-[11px] text-blue-200">Aplikasi Android Resmi • Bukan Sekadar Web Shortcut</p>
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
          
          {/* Active Tenant Notification */}
          <div className="p-3 bg-white rounded-2xl border border-blue-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pondok Terpilih</span>
                <span className="text-xs font-bold text-slate-800 uppercase">{currentTenant || 'Lembaga Utama'}</span>
              </div>
            </div>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-semibold">
              {currentTenant}.sipesand.web.id
            </span>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-200/70 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('apk')}
              className={`py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'apk' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Download APK</span>
            </button>
            <button
              onClick={() => setActiveTab('pwa')}
              className={`py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'pwa' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Web App (PWA)</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'ios' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>iPhone / iOS</span>
            </button>
          </div>

          {/* TAB 1: DOWNLOAD APK NATIVE ANDROID */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold flex-shrink-0 backdrop-blur-sm">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Download File APK SiPesand (Android)</h4>
                    <p className="text-[11px] text-blue-100 mt-0.5 leading-relaxed">
                      Unduh dan instal langsung aplikasi native Android ke smartphone Anda.
                    </p>
                  </div>
                </div>

                <a
                  href={apkDownloadUrl}
                  download="sipesand-release.apk"
                  className="w-full py-3 bg-white hover:bg-slate-100 text-blue-800 font-extrabold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD SI PESAND APK (Terbaru)</span>
                </a>
              </div>

              {/* Step by step install guide */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">Cara Pasang APK di HP Android:</span>
                
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-black flex-shrink-0">1</span>
                  <span>Ketuk tombol <strong>Download APK</strong> di atas hingga file selesai terunduh.</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-black flex-shrink-0">2</span>
                  <span>Buka file <strong>sipesand-release.apk</strong> dari notifikasi atau folder Download HP.</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-black flex-shrink-0">3</span>
                  <span>Jika muncul konfirmasi, pilih <strong>"Izinkan dari sumber ini"</strong> (Allow Unknown Sources).</span>
                </div>
                
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-black flex-shrink-0">4</span>
                  <span>Ketuk <strong>Install</strong>. Aplikasi SiPesand siap digunakan di layar HP Anda!</span>
                </div>
              </div>

              {/* Auto Tenant Sync Info */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Otomatis Terhubung ke Database Pondok:</strong> Begitu aplikasi dibuka di HP, Anda dapat memasukkan nama pondok (misal: <code>{currentTenant}</code>) agar seluruh data santri dan tagihan terisolasi khusus untuk pondok Anda.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PWA WEB APP */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-800 space-y-3 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm">Pasang Cepat ke Layar Utama (PWA)</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Alternatif tanpa mengunduh file APK. Berjalan instan langsung dari browser HP Anda.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleNativeInstall}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isInstalled ? 'Aplikasi Sudah Terpasang' : 'Pasang / Install Web App Sekarang'}</span>
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs text-slate-700">
                <span className="font-bold text-slate-900 block text-xs">Panduan Manual di Browser Chrome:</span>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">1</span>
                  <span>Ketuk ikon titik tiga (⋮) di pojok kanan atas browser.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black">2</span>
                  <span>Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IPHONE / IOS */}
          {activeTab === 'ios' && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block text-xs">Panduan untuk Pengguna Apple iPhone (iOS):</span>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">1</span>
                <span>Buka website ini menggunakan browser <strong>Safari</strong> di iPhone Anda.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">2</span>
                <span>Ketuk tombol <strong>Share / Bagikan (⎋)</strong> di bilah navigasi bawah Safari.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-black flex-shrink-0">3</span>
                <span>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</span>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Resmi & Bebas Iklan • Multi-Tenant Terisolasi</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
