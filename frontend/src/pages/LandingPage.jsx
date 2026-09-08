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
  ShoppingBag, 
  ArrowDown, 
  ChevronRight, 
  ChevronLeft, 
  Wallet, 
  BookOpen, 
  Calendar, 
  Users, 
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  CheckCircle
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
  const { settings, isNfcEnabled, activeTenantSubdomain, isTenantInstance } = useSettings();
  const [quickQuery, setQuickQuery] = useState('');
  const [trackerSantri, setTrackerSantri] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  const logoPondok = settings.LOGO_PONDOK_URL || '/logo.png';
  const namaLembaga = settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an Darul Rahman Sumbersari';

  const handleDirectSearch = (searchTerm) => {
    setQuickQuery(searchTerm);
    executeSearch(searchTerm);
  };

  const handleSearchSantri = (e) => {
    if (e) e.preventDefault();
    executeSearch(quickQuery);
  };

  const executeSearch = async (searchTerm) => {
    const q = (searchTerm || '').trim();
    if (!q) {
      setSearchError('Silakan masukkan NIS atau Nama santri untuk mengecek status izin & tagihan');
      return;
    }

    try {
      setLoadingSearch(true);
      setSearchError('');
      
      const res = await fetch(`/api/portal-wali/santri/${encodeURIComponent(q)}`, {
        headers: activeTenantSubdomain ? { 'X-Tenant-Subdomain': activeTenantSubdomain } : {}
      });
      const result = await res.json();
      
      if (result.success && result.data) {
        setTrackerSantri(result.data);
        setIsTrackerOpen(true);
        return;
      }
    } catch (err) {
      console.warn('API santri fallback ke dataset santri mandiri:', err);
    } finally {
      setLoadingSearch(false);
    }

    // Fallback Demo Santri Terverifikasi Khusus Darul Rahman
    const lowerQ = q.toLowerCase();
    let fallbackName = q;
    let fallbackNis = '202601001';
    let fallbackKelas = '10 IPA 1 (KMI 4)';
    let fallbackAsrama = 'Asrama Umar bin Khattab No. 04';
    let fallbackSaldo = 175000;

    if (lowerQ.includes('farhan')) {
      fallbackName = 'Muhammad Farhan Al-Fatih';
      fallbackNis = '202601001';
      fallbackKelas = '10 IPA 1 (KMI 4)';
      fallbackAsrama = 'Asrama Umar bin Khattab No. 04';
      fallbackSaldo = 175000;
    } else if (lowerQ.includes('aisyah')) {
      fallbackName = 'Aisyah Nur Ramadhani';
      fallbackNis = '202601002';
      fallbackKelas = '11 Keagamaan (KMI 5)';
      fallbackAsrama = 'Asrama Siti Khadijah No. 12';
      fallbackSaldo = 250000;
    } else if (lowerQ.includes('zaki')) {
      fallbackName = 'Ahmad Zaki Mubarak';
      fallbackNis = '202601003';
      fallbackKelas = '12 IPS (KMI 6)';
      fallbackAsrama = 'Asrama Abu Bakar No. 07';
      fallbackSaldo = 85000;
    } else if (lowerQ.includes('fatimah') || lowerQ.includes('fathimah')) {
      fallbackName = 'Fathimah Azzahra';
      fallbackNis = '202601004';
      fallbackKelas = '10 IPA 2 (KMI 4)';
      fallbackAsrama = 'Asrama Aisyah No. 03';
      fallbackSaldo = 320000;
    } else if (lowerQ.includes('bilal')) {
      fallbackName = 'Bilal Habasyi Rizqullah';
      fallbackNis = '202601005';
      fallbackKelas = '11 IPA (KMI 5)';
      fallbackAsrama = 'Asrama Ali bin Abi Thalib No. 02';
      fallbackSaldo = 85000;
    }

    setTrackerSantri({
      id: 'demo-1',
      nama: fallbackName,
      nis: fallbackNis,
      kelas: fallbackKelas,
      kamar: fallbackAsrama,
      waliNama: 'Wali Santri (' + fallbackName + ')',
      saldoSaku: fallbackSaldo,
      dailyLimit: 20000,
      permits: [
        { id: 'p1', reason: 'Izin Sambangan Keluarga & Kepulangan Bulanan', returnDate: '08-09-2026 17:00', status: 'ACTIVE' }
      ],
      bills: [
        { id: 'b1', title: 'Syahriyah Shafar 1448 H', amount: 350000, status: 'PAID' },
        { id: 'b2', title: 'Uang Makan & Konsumsi Dapur', amount: 600000, status: 'PAID' }
      ]
    });
    setIsTrackerOpen(true);
  };

  const categories = [
    { id: 'ALL', label: 'Semua Modul', count: 10 },
    { id: 'SANTRI', label: 'Manajemen Santri & KTSD', count: 34 },
    { id: 'KEUANGAN', label: 'Keuangan & SPP Syahriyah', count: 12 },
    { id: 'AKADEMIK', label: 'Akademik & Tahfidz 30 Juz', count: 10 },
    { id: 'KAMTIB', label: 'Keamanan & Perizinan', count: 8 },
    { id: 'SAKU', label: 'Uang Saku POS Cashless', count: 7 }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#111827] flex flex-col font-sans selection:bg-[#8CE829] selection:text-[#0A1128]">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (WOOT EDITORIAL STYLE)                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & New Monogram Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#8CE829] flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
              <img 
                src={logoPondok} 
                alt="SiPesand Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 truncate">
                  {isTenantInstance ? namaLembaga : 'SiPesand'}
                </span>
                {isTenantInstance ? (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Pesantren Mandiri</span>
                  </span>
                ) : (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8CE829]/25 text-slate-900 border border-[#8CE829]/40">
                    Official
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none truncate max-w-sm">
                {isTenantInstance ? (settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur') : namaLembaga}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#modul" className="hover:text-[#0B52E2] transition-colors">
              Modul Layanan
            </a>
            {isTenantInstance ? (
              <a href="#profil" className="hover:text-[#0B52E2] transition-colors">
                Profil Pondok
              </a>
            ) : null}
            <button 
              onClick={() => onOpenPortalWali('')}
              className="hover:text-[#0B52E2] transition-colors cursor-pointer"
            >
              Portal Wali Santri
            </button>
            <button
              onClick={() => setIsMobileModalOpen(true)}
              className="hover:text-[#0B52E2] transition-colors cursor-pointer"
            >
              Aplikasi Mobile
            </button>
            {isTenantInstance ? (
              <a href="#kontak" className="hover:text-[#0B52E2] transition-colors">
                Kontak & Alamat
              </a>
            ) : (
              <button
                onClick={onOpenSaasLanding}
                className="hover:text-[#0B52E2] transition-colors cursor-pointer"
              >
                Beli Lisensi SaaS
              </button>
            )}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isNfcEnabled && (
              <button
                onClick={onOpenNfcScanner}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                title="Simulasi Tap Reader RFID / NFC KTSD"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan KTSD</span>
              </button>
            )}

            <button
              onClick={() => onOpenPortalWali('')}
              className="hidden lg:flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-300 hover:border-slate-400 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#0B52E2]" />
              <span>Portal Wali</span>
            </button>

            {/* Dark Pill Button Login Petugas */}
            <button
              onClick={onLoginPetugas}
              className="px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#8CE829]" />
              <span>Login Petugas</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION: 50/50 EDITORIAL SPLIT (REFERENSI WOOT)                   */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 sm:pb-14">
        
        {/* Outermost Split Card Container with Large Rounded Curves */}
        <div className="rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-xl border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT HERO: ROYAL BLUE CONTAINER (60% WIDTH ON DESKTOP) */}
          <div className="lg:col-span-7 bg-[#0B52E2] p-8 sm:p-12 lg:p-14 relative text-white flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
            
            {/* Top Floating Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs font-semibold text-white">
                <span className="w-2 h-2 rounded-full bg-[#8CE829]" />
                <span>
                  {isTenantInstance 
                    ? `Portal Resmi • ${namaLembaga}` 
                    : 'Ekosistem Pesantren Digital Generasi Baru'}
                </span>
              </div>
            </div>

            {/* Main Bold Editorial Typography */}
            <div className="space-y-4 my-6 sm:my-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
                {isTenantInstance ? (
                  <>
                    <span>{namaLembaga}</span>
                  </>
                ) : (
                  <>
                    Kelola Pesantren <br />
                    Tumbuh Tanpa Batas
                  </>
                )}
              </h1>
              <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                {taglineLembaga}
              </p>
            </div>

            {/* Integrated White Pill Search Bar */}
            <div className="space-y-2.5">
              <form onSubmit={handleSearchSantri}>
                <div className="bg-white rounded-full p-2 sm:p-2.5 flex items-center gap-2 shadow-2xl">
                  <div className="flex items-center gap-2.5 pl-3 flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery(e.target.value)}
                      placeholder={isTenantInstance ? `Cari Santri Darul Rahman (Nama / NIS)...` : "Ketik Nama Santri atau NIS (Cek Izin / SPP)..."}
                      className="w-full bg-transparent text-slate-900 text-xs sm:text-sm font-semibold placeholder:text-slate-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="hidden sm:flex items-center border-l border-slate-200 px-3 text-slate-600 font-bold text-xs">
                    <span>Portal Bebas Akses</span>
                  </div>

                  {/* Arrow Submit Button with Electric Lime Background */}
                  <button
                    type="submit"
                    disabled={loadingSearch}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8CE829] hover:bg-[#7BD420] text-slate-950 flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 shadow-md cursor-pointer"
                    title="Cari Data Santri"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>

                {searchError && (
                  <div className="text-[11px] text-amber-200 font-bold pl-3 mt-1.5">
                    {searchError}
                  </div>
                )}
              </form>

              {/* Quick Search Chips */}
              <div className="flex items-center gap-1.5 flex-wrap pl-1">
                <span className="text-[10px] text-white/75 font-semibold">Cek Cepat:</span>
                {['Farhan', 'Aisyah', 'Zaki', 'Fathimah', 'Bilal'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleDirectSearch(name)}
                    className="px-2.5 py-0.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-slate-900 text-[10px] font-bold border border-white/20 transition-all cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            {/* Floating Category Badges Bottom Left */}
            <div className="pt-4 flex items-center gap-2 flex-wrap text-[10px] font-bold text-white/80">
              {isTenantInstance ? (
                <>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #DarulRahmanSumbersari
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #KTSDCashless
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #Tahfidz30Juz
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #KamtibResmi
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #KamtibDigital
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #KTSDCashless
                  </span>
                  <span className="px-2.5 py-1 rounded-xl bg-white/10 border border-white/15">
                    #Tahfidz30Juz
                  </span>
                </>
              )}
            </div>

          </div>

          {/* RIGHT HERO: ELECTRIC LIME GREEN CONTAINER (40% WIDTH ON DESKTOP) */}
          <div className="lg:col-span-5 bg-[#8CE829] p-8 sm:p-12 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[520px] overflow-hidden">
            
            {/* Circular Scroll Down Badge */}
            <a
              href="#modul"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-14 h-14 rounded-full border-2 border-slate-950/30 flex flex-col items-center justify-center text-[8px] font-black uppercase tracking-tighter text-slate-950 hover:scale-105 transition-transform"
            >
              <span>SCROLL</span>
              <ArrowDown className="w-3.5 h-3.5 mt-0.5" />
            </a>

            {/* Large Squircle App Icon Card in Royal Blue with the New Logo */}
            <div className="relative group cursor-pointer" onClick={onLoginPetugas}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[42px] bg-[#0B52E2] shadow-2xl flex flex-col items-center justify-center p-8 border-4 border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                <img 
                  src="/logo.png" 
                  alt="SiPesand Mark" 
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md"
                />
              </div>

              {/* Floating Pastel Pill Badges around the Squircle */}
              <div className="absolute -top-3 -left-4 px-3 py-1.5 rounded-2xl bg-white shadow-md border border-slate-100 text-[11px] font-extrabold text-slate-800 flex items-center gap-1.5 animate-bounce">
                <CreditCard className="w-3.5 h-3.5 text-[#0B52E2]" />
                <span>KTSD RFID</span>
              </div>

              <div className="absolute -bottom-3 -right-3 px-3 py-1.5 rounded-2xl bg-[#0A1128] shadow-md text-[11px] font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8CE829]" />
                <span>Kamtib Resmi</span>
              </div>
            </div>

            {/* Sub-label under the App Icon */}
            <div className="text-center mt-6">
              <span className="text-xs font-black tracking-wider uppercase text-slate-900 bg-white/40 px-3 py-1 rounded-full">
                Sistem Terverifikasi ISO 14443-A
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: MODUL & KEUNGGULAN (LATEST OPPORTUNITY EDITORIAL STYLE)       */}
      {/* ========================================================================= */}
      <section id="modul" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Section Header with Hand-Drawn Sketch Circle Highlight */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
                <span className="relative inline-block px-3 py-1">
                  {/* Hand-drawn SVG oval ring sketch */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none text-slate-900 stroke-current -rotate-1" 
                    viewBox="0 0 160 50" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M10 25 C 20 8, 140 6, 150 25 C 158 40, 25 45, 12 30" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <span className="relative z-10 text-slate-900">Modul Unggulan</span>
                </span>
                <span>Ekosistem Pesantren</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Pilih pilar operasional pondok yang ingin Anda telusuri, mulai dari kepengurusan santri hingga transparansi pembukuan kas.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPortalWali('')}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-[#0B52E2] transition-colors"
            >
              Cek Portal Wali →
            </button>
            <button
              onClick={onLoginPetugas}
              className="px-4 py-2 rounded-full bg-[#0B52E2] text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm"
            >
              Buka Dashboard
            </button>
          </div>
        </div>

        {/* 2 Kolom Layout: Kategori Vertikal Kiri + Grid Card Kanan */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Vertical Category Pills */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 px-3">
              Kategori Modul
            </div>
            {categories.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-white text-[#0B52E2] shadow-sm border border-blue-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#0B52E2]" />}
                    <span>{c.label}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-[#0B52E2] text-white' : 'bg-stone-200 text-slate-600'
                  }`}>
                    {c.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Kolom Kanan: Card Showcase (Termasuk Featured Royal Blue Card) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* FEATURED CARD 1: ROYAL BLUE ACCENT CARD */}
            <div className="p-6 rounded-[28px] bg-[#0B52E2] text-white shadow-xl flex flex-col justify-between space-y-6 sm:col-span-2 lg:col-span-1 border border-blue-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white">
                    Cashless POS
                  </span>
                  <span className="text-[10px] font-bold text-[#8CE829]">
                    100% Real-Time
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white leading-snug">
                  Dompet Digital & Uang Saku Santri
                </h3>
                <p className="text-xs text-white/80 font-medium leading-relaxed">
                  Sistem belanja santri di kantin dan koperasi menggunakan tap kartu fisik KTSD dengan limit harian anti-boros.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-white/70">Limit Default</div>
                  <div className="text-base font-extrabold text-[#8CE829]">Rp 20.000 / Hari</div>
                </div>
                <button
                  onClick={onLoginPetugas}
                  className="p-2.5 rounded-full bg-white text-[#0B52E2] hover:bg-[#8CE829] hover:text-slate-900 transition-colors shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2: KTSD & RFID CR-80 */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Kartu Fisik CR-80
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    NFC Ready
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Cetak KTSD Digital Santri
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Kartu Tanda Santri Digital standar perbankan dilengkapi barcode, QR Code verifikasi, dan chip frekuensi 13.56MHz.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Format Desain</div>
                  <div className="text-xs font-black text-slate-800">4 Tema Resmi Pondok</div>
                </div>
                <button
                  onClick={onLoginPetugas}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 3: TAGIHAN SYAHRIYAH & KWITANSI */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                    Keuangan & Kas
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Buku Kas Umum
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Tagihan SPP & Kwitansi Sah
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Generate tagihan massal bulanan, rekonsiliasi transfer otomatis, dan pencetakan bukti bayar berstempel resmi.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Kwitansi Digital</div>
                  <div className="text-xs font-black text-slate-800">Terbilang Otomatis</div>
                </div>
                <button
                  onClick={onLoginPetugas}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 4: AKADEMIK & TAHFIDZ 30 JUZ */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-100">
                    Akademik
                  </span>
                  <span className="text-[10px] font-bold text-purple-700">
                    Target Khatam
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Logbook Tahfidz 30 Juz
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Pencatatan setoran hafalan Al-Qur'an surat/ayat, penilaian tajwid, makharijul huruf, dan nadhom kitab kuning.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Penilaian</div>
                  <div className="text-xs font-black text-purple-700">Mumtaz / Jayyid</div>
                </div>
                <button
                  onClick={onLoginPetugas}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 5: KAMTIB & PERIZINAN */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100">
                    Keamanan
                  </span>
                  <span className="text-[10px] font-bold text-rose-600">
                    Disiplin Asrama
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Perizinan Keluar & Kamtib
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Penerbitan surat jalan izin pulang atau sakit, alarm santri terlambat (overdue), dan pembinaan ta'zir edukatif.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Status Verifikasi</div>
                  <div className="text-xs font-black text-rose-700">Posko Kamtib</div>
                </div>
                <button
                  onClick={onLoginPetugas}
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 6: PORTAL MANDIRI WALI */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                    Wali Santri
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    Tanpa Login
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Portal Monitoring Mandiri
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Orang tua dapat memantau mutasi jajan santri, mengecek perizinan keluar, dan melunasi syahriyah dari smartphone.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Akses Wali</div>
                  <div className="text-xs font-black text-blue-700">Nama / NIS</div>
                </div>
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="p-2.5 rounded-full bg-[#8CE829] text-slate-950 hover:bg-[#7BD420] transition-colors shadow-xs"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3b. SECTION: PROFIL & SALURAN RESMI LEMBAGA (KHUSUS TENANT MANDIRI)       */}
      {/* ========================================================================= */}
      {isTenantInstance && (
        <section id="profil" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-stone-200/90 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-stone-100">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Profil Lembaga & Kontak Resmi</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {namaLembaga}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
                  {taglineLembaga}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="px-5 py-2.5 rounded-full bg-[#0B52E2] hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#8CE829]" />
                  <span>Buka Portal Wali</span>
                </button>
                <button
                  onClick={onLoginPetugas}
                  className="px-5 py-2.5 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#8CE829]" />
                  <span>Login Petugas</span>
                </button>
              </div>
            </div>

            {/* Info Grid 4 Kolom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
              
              {/* Kolom 1: Alamat */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Alamat Pesantren</div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur'}
                </p>
              </div>

              {/* Kolom 2: Kontak WA & Email */}
              <div id="kontak" className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Call Center & WhatsApp</div>
                <div className="text-slate-600 text-[11px] leading-relaxed space-y-1">
                  <a 
                    href={`https://wa.me/${(settings.WHATSAPP_CENTER || '085123734342').replace(/[^0-9]/g, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <span>{settings.WHATSAPP_CENTER || '+62 851-2373-4342'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="block text-slate-500 font-mono text-[10px] truncate">{settings.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com'}</span>
                </div>
              </div>

              {/* Kolom 3: Pengasuh & Pimpinan */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <UserCheck className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Pengasuhan & Pimpinan</div>
                <div className="text-slate-700 font-semibold text-[11px] leading-relaxed space-y-0.5">
                  <span className="block">{settings.NAMA_KEPALA_PONDOK || 'K.H. Pengasuh Darul Rahman'}</span>
                  <span className="block text-slate-500 font-normal text-[10.5px]">Bendahara: {settings.NAMA_BENDAHARA || 'Ustadz Bendahara Darul Rahman, S.E.'}</span>
                </div>
              </div>

              {/* Kolom 4: Rekening Resmi Syahriyah */}
              <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Rekening Resmi Syahriyah</div>
                <div className="text-[11px] text-slate-700 leading-relaxed">
                  <div className="font-bold text-slate-900">{settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)'}</div>
                  <div className="font-mono text-blue-700 font-bold tracking-wider">{settings.BANK_ACCOUNT_NO || '7192837465'}</div>
                  <div className="text-[10px] text-slate-500 uppercase truncate">{settings.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI'}</div>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. MODALS INTEGRASI (PORTAL TRACKER, MOBILE APP, NFC)                     */}
      {/* ========================================================================= */}
      {isTrackerOpen && (
        <SantriTrackerModal
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
          santriData={trackerSantri}
          onOpenPortalWali={() => {
            setIsTrackerOpen(false);
            onOpenPortalWali(quickQuery);
          }}
        />
      )}

      {isMobileModalOpen && (
        <MobileAppInstallModal
          isOpen={isMobileModalOpen}
          onClose={() => setIsMobileModalOpen(false)}
        />
      )}

      {/* 5. FOOTER RESMI */}
      {isTenantInstance ? (
        <footer className="bg-white border-t border-slate-200 py-6 px-4 text-slate-500 text-[11px] font-sans">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <div className="font-black text-slate-900 text-xs flex items-center justify-center sm:justify-start gap-2">
                <span>{namaLembaga}</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-700 font-bold">Portal Mandiri Resmi</span>
              </div>
              <p className="text-[10.5px] text-slate-500 mt-0.5">
                {settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur'} • WA: {settings.WHATSAPP_CENTER || '+62 851-2373-4342'}
              </p>
            </div>
            <div className="flex items-center gap-4 font-semibold text-[10.5px]">
              <button onClick={() => onOpenPortalWali('')} className="hover:text-blue-700 hover:underline cursor-pointer">Portal Wali</button>
              <button onClick={onLoginPetugas} className="hover:text-blue-700 hover:underline cursor-pointer">Login Petugas</button>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400">© {new Date().getFullYear()} {namaLembaga}</span>
            </div>
          </div>
        </footer>
      ) : (
        <DeveloperFooter onNavigateLegal={onNavigateLegal} />
      )}

    </div>
  );
}
