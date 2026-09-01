import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Radio, 
  CreditCard, 
  Receipt, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Award,
  Database,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  Download,
  Share2,
  FileCheck,
  ShoppingBag
} from 'lucide-react';
import SantriTrackerModal from '../components/SantriTrackerModal';
import MobileAppInstallModal from '../components/MobileAppInstallModal';
import DeveloperFooter from '../components/DeveloperFooter';
import { useSettings } from '../context/SettingsContext';

export default function LandingPage({ 
  onLoginPetugas, 
  onOpenPortalWali, 
  onOpenNfcScanner, 
  onOpenSaasLanding,
  onNavigateLegal
}) {
  const { settings, isNfcEnabled } = useSettings();
  const [quickQuery, setQuickQuery] = useState('');
  const [trackerSantri, setTrackerSantri] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand Terpadu';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'Sistem Informasi & Manajemen Terpadu Pesantren Digital';

  const handleSearchSantri = async (queryInput) => {
    const q = (queryInput || quickQuery).trim();
    if (!q) {
      setSearchError('Silakan masukkan NIS atau Nama santri untuk mengecek status izin');
      return;
    }

    try {
      setLoadingSearch(true);
      setSearchError('');
      
      const res = await fetch(`/api/portal-wali/santri/${encodeURIComponent(q)}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        setTrackerSantri(result.data);
        setIsTrackerOpen(true);
      } else {
        setSearchError(result.message || 'Data santri tidak ditemukan.');
      }
    } catch (err) {
      setSearchError('Gagal menghubungkan ke server pesantren.');
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-blue-600 selection:text-white text-xs">
      
      {/* 0. TOP SUBDOMAIN NETWORK BAR (MULTI-TENANT ECOSYSTEM) */}
      <div className="bg-slate-900 text-slate-300 py-1 px-4 text-[10px] border-b border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold text-white">SiPesand Ecosystem</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">Platform SaaS Pesantren Digital King Digital Dev</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[10px]">
            <button 
              onClick={() => onLoginPetugas()} 
              className="hover:text-blue-400 font-bold transition-colors"
            >
              app.sipesand.web.id
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={onOpenSaasLanding} 
              className="hover:text-amber-300 font-bold transition-colors text-amber-400"
            >
              mitra.sipesand.web.id
            </button>
            <span className="text-slate-600">|</span>
            <button 
              onClick={() => onOpenPortalWali('')} 
              className="hover:text-emerald-400 font-bold transition-colors"
            >
              pay.sipesand.web.id
            </button>
          </div>
        </div>
      </div>

      {/* 1. HEADER UTAMA */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            {logoPondok ? (
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-slate-900 truncate">
                {namaLembaga}
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {taglineLembaga}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            
            {/* Tombol Menuju Landing Page Beli Lisensi SaaS */}
            <button
              onClick={onOpenSaasLanding}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold shadow-sm transition-colors text-xs border border-[#1E3A8A]"
              title="Beli Lisensi Platform SiPesand (King Digital Dev)"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Beli Lisensi Web</span>
            </button>

            {/* Tombol Unduh / Pasang Aplikasi Mobile */}
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-300 transition-colors text-xs"
              title="Pasang Aplikasi Mobile di Smartphone"
            >
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Aplikasi Mobile</span>
            </button>

            <button
              onClick={() => onOpenPortalWali('')}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Portal Wali (Tanpa Login)</span>
              <span className="sm:hidden">Portal Wali</span>
            </button>

            <button
              onClick={onLoginPetugas}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Petugas</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO & BENTO GRID SECTION */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {namaLembaga}
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Sistem Informasi & Manajemen Terpadu Pesantren Digital — Layanan perizinan santri real-time, portal wali mandiri, dan tata kelola asrama terintegrasi.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Bento 1 (8/12): Pos Pemeriksaan Status Izin Keluar Santri */}
          <div className="md:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900 text-sm">Pos Pemeriksaan Status Izin Keluar Santri</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pemeriksaan cepat bagi pengurus, asatidz, dan satpam untuk memastikan apakah santri yang keluar telah memiliki surat izin resmi atau sedang berada di asrama.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Ketik Nama Santri atau NIS..."
                    value={quickQuery}
                    onChange={(e) => {
                      setQuickQuery(e.target.value);
                      setSearchError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSantri()}
                    className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleSearchSantri()}
                    disabled={loadingSearch}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{loadingSearch ? 'Mengecek...' : 'Cek Status Izin'}</span>
                  </button>

                  {isNfcEnabled && (
                    <button
                      onClick={onOpenNfcScanner}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-600" />
                      <span>Tap Kartu NFC</span>
                    </button>
                  )}
                </div>
              </div>

              {searchError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] rounded-xl">
                  {searchError}
                </div>
              )}
            </div>
          </div>

          {/* Bento 2 (4/12): Akses Mandiri Portal Wali */}
          <div className="md:col-span-4 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Akses Terbuka</span>
              <h3 className="text-base font-bold text-white">Portal Mandiri Wali Santri</h3>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Orang tua dapat memantau tabungan santri, perkembangan hafalan, dan membayar tagihan syahriyah online secara transparan tanpa registrasi akun.
              </p>
            </div>

            <button
              onClick={() => onOpenPortalWali('')}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow"
            >
              <span>Buka Portal Wali</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento 3 (4/12): Pembayaran & Kwitansi Sah */}
          <div className="md:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Receipt className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pembayaran & Kwitansi Sah</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Sistem penagihan syahriyah Hijriyah terstruktur, verifikasi transfer online, dan penerbitan kwitansi resmi berstempel digital.
            </p>
          </div>

          {/* Bento 4 (4/12): Tabungan & Kantin Smart NFC */}
          <div className="md:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Tabungan & Uang Saku Smart</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Pencatatan mutasi kasbon santri dan transaksi belanja tanpa uang tunai menggunakan kartu santri NFC / RFID.
            </p>
          </div>

          {/* Bento 5 (4/12): Pendidikan & Ketertiban Santri */}
          <div className="md:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Pendidikan & Ketertiban Santri</h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Pencatatan evaluasi capaian hafalan Al-Qur'an dan pemantauan disiplin perizinan keluar dengan deteksi keterlambatan santri.
            </p>
          </div>

        </div>

      </main>

      {/* Tracker Modal Status Izin Santri */}
      {trackerSantri && (
        <SantriTrackerModal
          santriData={trackerSantri}
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
        />
      )}

      {/* Modal Unduh / Pasang Aplikasi Mobile */}
      <MobileAppInstallModal
        isOpen={isMobileModalOpen}
        onClose={() => setIsMobileModalOpen(false)}
      />

      {/* Developer Footer Component */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
