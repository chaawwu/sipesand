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
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Users, 
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Clock,
  GraduationCap,
  Compass,
  HeartHandshake,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  School,
  FileText,
  Volume2,
  Share2,
  HelpCircle,
  ArrowDown,
  MessagesSquare,
  Repeat
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function PesantrenTenantHome({
  onLoginPetugas,
  onOpenPortalWali,
  onOpenNfcScanner,
  onExecuteSearch,
  quickQuery,
  setQuickQuery,
  loadingSearch,
  searchError
}) {
  const { settings, isNfcEnabled } = useSettings();
  const [copiedBank, setCopiedBank] = useState(false);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const logoPondok = settings.LOGO_PONDOK_URL || '/logo.png';
  const namaLembaga = settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'Pondok Pesantren Salafiyah Terpadu • Kajian Kitab Kuning & Muhafadzoh Nadzoman';
  const alamatLembaga = settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur';
  const noWa = settings.WHATSAPP_CENTER || '+62 851-2373-4342';
  const emailLembaga = settings.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const bankNo = settings.BANK_ACCOUNT_NO || '7192837465';
  const bankName = settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const bankHolder = settings.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI';
  const namaPengasuh = settings.NAMA_KEPALA_PONDOK || 'K.H. Pengasuh Darul Rahman';
  const namaBendahara = settings.NAMA_BENDAHARA || 'Ustadz Bendahara Darul Rahman, S.E.';

  const handleCopyBank = () => {
    navigator.clipboard.writeText(bankNo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onExecuteSearch) {
      onExecuteSearch(quickQuery);
    }
  };

  const handleQuickClick = (name) => {
    if (setQuickQuery) setQuickQuery(name);
    if (onExecuteSearch) onExecuteSearch(name);
  };

  const categories = [
    { id: 'ALL', label: 'Semua Program', count: 6 },
    { id: 'MUHAFADZOH', label: 'Muhafadzoh Nadzoman', count: 1 },
    { id: 'KITAB', label: 'Pengajian Kitab Salaf', count: 1 },
    { id: 'MUSYAWARAH', label: 'Musyawarah & Takror', count: 1 },
    { id: 'FORMAL', label: 'Sekolah SMP & SMA Terpadu', count: 1 },
    { id: 'KTSD', label: 'KTSD Cashless Santri', count: 1 },
    { id: 'WALI', label: 'Layanan Portal Wali', count: 1 },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#111827] flex flex-col font-sans selection:bg-[#8CE829] selection:text-[#0A1128]">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (WOOT EDITORIAL THEME SAMA)                                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Emblem Pesantren */}
          <a href="#" className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#8CE829] flex items-center justify-center p-1.5 shadow-sm flex-shrink-0">
              <img 
                src={logoPondok} 
                alt="Logo Pesantren" 
                className="w-full h-full object-contain drop-shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-slate-950 font-black text-sm">DR</span>';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 truncate">
                  {namaLembaga}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 flex-shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Pesantren Salafiyah</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-none truncate max-w-sm">
                {alamatLembaga}
              </p>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#profil" className="hover:text-[#0B52E2] transition-colors">Profil Pondok</a>
            <a href="#kalam" className="hover:text-[#0B52E2] transition-colors">Kalam Pengasuh</a>
            <a href="#program" className="hover:text-[#0B52E2] transition-colors">Kitab & Muhafadzoh</a>
            <a href="#rutinitas" className="hover:text-[#0B52E2] transition-colors">Kegiatan Santri</a>
            <a href="#fasilitas" className="hover:text-[#0B52E2] transition-colors">Fasilitas</a>
            <a href="#psb" className="hover:text-[#0B52E2] transition-colors">PSB 2026</a>
            <button 
              onClick={() => onOpenPortalWali('')}
              className="hover:text-[#0B52E2] transition-colors cursor-pointer"
            >
              Portal Wali
            </button>
            <a href="#kontak" className="hover:text-[#0B52E2] transition-colors">Kontak</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isNfcEnabled && (
              <button
                onClick={onOpenNfcScanner}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                title="Tap Reader Kartu Santri KTSD"
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
      {/* 2. HERO SECTION: 50/50 EDITORIAL SPLIT (THEMA & UI/UX SAMA)               */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-10 sm:pb-14">
        
        {/* Outermost Split Card Container with Large Rounded Curves */}
        <div className="rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-xl border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT HERO: ROYAL BLUE CONTAINER (60% WIDTH ON DESKTOP) */}
          <div className="lg:col-span-7 bg-[#0B52E2] p-8 sm:p-12 lg:p-14 relative text-white flex flex-col justify-between min-h-[460px] sm:min-h-[520px]">
            
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/20 border border-white/30 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#8CE829]" />
                <span>Portal Resmi • {namaLembaga}</span>
              </div>
            </div>

            {/* Main Bold Editorial Typography Berisi Karakter Salafiyah & Muhafadzoh */}
            <div className="space-y-4 my-6 sm:my-8">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-white">
                Pondok Pesantren <br />
                Darul Rahman Sumbersari
              </h1>
              <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                Pusat Pengkajian Kitab Kuning (Salafiyah), Muhafadzoh Nadzoman (Alfiyah Ibnu Malik, Imrithi), Musyawarah Fiqih & Bahtsul Masa'il, serta Takror Santri di Kencong, Kediri.
              </p>
            </div>

            {/* Integrated White Pill Search Bar untuk Cek Santri (Portal Wali) */}
            <div className="space-y-2.5">
              <form onSubmit={handleSearchSubmit}>
                <div className="bg-white rounded-full p-2 sm:p-2.5 flex items-center gap-2 shadow-xl">
                  <div className="flex items-center gap-2.5 pl-3 flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery && setQuickQuery(e.target.value)}
                      placeholder="Cari Data Santri (Cek Saku, Izin, SPP & Nilai Muhafadzoh)..."
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
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#8CE829] hover:bg-[#7BD420] text-slate-950 flex items-center justify-center flex-shrink-0 transition-transform active:scale-90 shadow-md cursor-pointer disabled:opacity-50"
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
            </div>

          </div>

          {/* RIGHT HERO: ELECTRIC LIME GREEN CONTAINER (40% WIDTH ON DESKTOP) */}
          <div className="lg:col-span-5 bg-[#8CE829] p-8 sm:p-12 relative flex flex-col items-center justify-center min-h-[380px] sm:min-h-[520px] overflow-hidden">
            
            {/* Circular Scroll Down Badge */}
            <a
              href="#program"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-14 h-14 rounded-full border-2 border-slate-950/30 flex flex-col items-center justify-center text-[8px] font-black uppercase tracking-tighter text-slate-950 hover:scale-105 transition-transform"
            >
              <span>SCROLL</span>
              <ArrowDown className="w-3.5 h-3.5 mt-0.5" />
            </a>

            {/* Large Squircle App Icon Card in Royal Blue with the Official Logo */}
            <div className="relative group cursor-pointer" onClick={onLoginPetugas}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-[42px] bg-[#0B52E2] shadow-2xl flex flex-col items-center justify-center p-8 border-4 border-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-3xl">
                <img 
                  src={logoPondok} 
                  alt="Logo Pesantren Darul Rahman" 
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain drop-shadow-md"
                />
              </div>
            </div>

            {/* Sub-label under the App Icon */}
            <div className="text-center mt-6">
              <span className="text-xs font-black tracking-wider uppercase text-slate-900 bg-white/40 px-3 py-1 rounded-full">
                Pesantren Salafiyah • Kencong, Kediri
              </span>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION: KALAM PENGASUH & STATISTIK PESANTREN (EDITORIAL CARD)         */}
      {/* ========================================================================= */}
      <section id="kalam" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-stone-200/90 shadow-sm">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-8 border-b border-stone-100">
            
            {/* Foto & Identitas Pengasuh */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-[#0B52E2]/10 shadow-lg bg-slate-900">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80" 
                  alt="K.H. Pengasuh Darul Rahman" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {namaPengasuh}
                </h3>
                <p className="text-xs font-bold text-[#0B52E2]">
                  Pengasuh Pondok Pesantren Darul Rahman
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Kencong, Kepung, Kediri</span>
              </div>
            </div>

            {/* Kalam Pengasuh */}
            <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B52E2] text-xs font-extrabold border border-blue-100">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kalam & Nasihat Pengasuh</span>
              </div>

              <blockquote className="text-base sm:text-lg font-serif italic text-slate-800 leading-relaxed">
                "Pondok Pesantren Darul Rahman istiqomah menjaga sanad keilmuan para ulama salafus shalih. Santri kami gembleng membaca dan memaknai kitab kuning, menghafal nadzoman kaidah bahasa dan fiqih (Imrithi & Alfiyah Ibnu Malik), serta mengasah daya nalar melalui tradisi musyawarah dan takror setiap malam. Dengan adab di atas ilmu, santri dipersiapkan menjadi pribadi yang kokoh akidahnya dan bijak dalam mengabdi di masyarakat."
              </blockquote>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="px-4 py-2 rounded-full bg-[#0B52E2] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-all"
                >
                  <UserCheck className="w-4 h-4 text-[#8CE829]" />
                  <span>Pantau Santri via Portal Wali</span>
                </button>
                <a
                  href="#profil"
                  className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Lihat Profil Pesantren →
                </a>
              </div>
            </div>

          </div>

          {/* 4 Angka Statistik Utama Pesantren */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center sm:text-left">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <div className="text-2xl sm:text-3xl font-black text-[#0B52E2]">500+</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Santri Mukim</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <div className="text-2xl sm:text-3xl font-black text-[#8CE829] bg-slate-900 px-2 py-0.5 rounded-lg inline-block">1.000 Bait</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Nadzom Alfiyah & Imrithi</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">18+</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Asatidz Pengampu Salaf</div>
            </div>
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60">
              <div className="text-2xl sm:text-3xl font-black text-emerald-600">100%</div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Cashless KTSD RFID</div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: PROGRAM & KEUNGGULAN (BENTO GRID WOOT THEMA SAMA)             */}
      {/* ========================================================================= */}
      <section id="program" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Section Header with Hand-Drawn Sketch Circle Highlight (SAMA PERSIS) */}
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
                  <span className="relative z-10 text-slate-900">Program Unggulan</span>
                </span>
                <span>Pondok Pesantren</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Pilar pendidikan kepesantrenan salafiyah di Darul Rahman yang menitikberatkan pada penguasaan kitab kuning, muhafadzoh nadzoman, musyawarah ilmiah, dan takror santri.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPortalWali('')}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold text-xs hover:border-[#0B52E2] transition-colors cursor-pointer"
            >
              Cek Portal Wali →
            </button>
            <button
              onClick={onLoginPetugas}
              className="px-4 py-2 rounded-full bg-[#0B52E2] text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Login Asatidz
            </button>
          </div>
        </div>

        {/* 2 Kolom Layout: Kategori Vertikal Kiri + Grid Card Kanan (SAMA PERSIS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri: Vertical Category Pills */}
          <div className="lg:col-span-3 space-y-2">
            <div className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3 px-3">
              Kategori Kurikulum
            </div>
            {categories.map((c) => {
              const isActive = activeCategory === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(c.id)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold flex items-center justify-between transition-all cursor-pointer ${
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

          {/* Kolom Kanan: Card Showcase (Featured Royal Blue Card SAMA PERSIS) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* FEATURED CARD 1: ROYAL BLUE ACCENT CARD (MUHAFADZOH NADZOMAN) */}
            <div className="p-6 rounded-[28px] bg-[#0B52E2] text-white shadow-xl flex flex-col justify-between space-y-6 sm:col-span-2 lg:col-span-1 border border-blue-700">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/20 text-white">
                    Muhafadzoh Nadzom
                  </span>
                  <span className="text-[10px] font-bold text-[#8CE829]">
                    Lalaran Rutin
                  </span>
                </div>
                <h3 className="text-xl font-black tracking-tight text-white leading-snug">
                  Hafalan Nadzom Kitab Kuning
                </h3>
                <p className="text-xs text-white/80 font-medium leading-relaxed">
                  Program hafalan kaidah keilmuan salaf secara bertahap: Nadzom Aqidatul Awam, Al-Amtsilah At-Tashrifiyyah, Nadzom Imrithi, hingga 1.000 Bait Nadzom Alfiyah Ibnu Malik dengan tradisi lalaran bersama setiap hari.
                </p>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-white/70">Kurikulum Nadzoman</div>
                  <div className="text-base font-extrabold text-[#8CE829]">Alfiyah & Imrithi</div>
                </div>
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="p-2.5 rounded-full bg-white text-[#0B52E2] hover:bg-[#8CE829] hover:text-slate-900 transition-colors shadow-md cursor-pointer"
                  title="Lihat Progres Muhafadzoh Santri"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2: KAJIAN KITAB KUNING SALAFIYAH */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                    Dirasah Islamiyah
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Salaf Syafi'iyah
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Pengajian Kitab Kuning Klasik
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Metode sorogan & bandongan memaknai gandul kitab Fiqih (Safinah, Taqrib/Fathul Qorib, Fathul Mu'in), Ushul Fiqih (Al-Waraqat), Hadits Riyadhus Shalihin, dan Akhlaq Ta'lim Muta'allim.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Metode Pengajian</div>
                  <div className="text-xs font-black text-slate-800">Sorogan & Bandongan</div>
                </div>
                <a
                  href="#rutinitas"
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* CARD 3: MUSYAWARAH FIQIH & BAHTSUL MASA'IL */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-100">
                    Musyawarah Fiqih
                  </span>
                  <span className="text-[10px] font-bold text-purple-700">
                    Bahtsul Masa'il
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Musyawarah & Bedah Ibroh Kitab
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Forum ilmiah mingguan santri untuk membedah ibarat teks kitab kuning, mempertajam nalar logika hukum syari'at, serta mendiskusikan persoalan fikih waqi'iyyah kekinian.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Forum Ilmiah</div>
                  <div className="text-xs font-black text-purple-700">Bahtsul Masa'il Santri</div>
                </div>
                <a
                  href="#rutinitas"
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* CARD 4: TAKROR & MUTALA'AH MALAM */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    Takror Malam
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    Mutala'ah Rutin
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Takror & Mudzakarah Pelajaran
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Kegiatan mengulang materi pelajaran kitab secara intensif bersama teman sebaya (mutala'ah) setiap malam bakda Isya untuk memastikan seluruh bait nadzom dan kaidah nahwu terserap sempurna.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Jadwal Takror</div>
                  <div className="text-xs font-black text-emerald-700">Setiap Malam Bakda Isya</div>
                </div>
                <a
                  href="#rutinitas"
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* CARD 5: PENDIDIKAN FORMAL SMP & SMA-IT TERPADU */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                    Pendidikan Formal
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    Akreditasi Resmi
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  SMP & SMA-IT / KMI Terpadu
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Pendidikan formal terakreditasi resmi pemerintah yang memadukan kurikulum nasional, laboratorium komputer, serta pembiasaan bahasa Arab dan Inggris secara aktif.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Ijazah Kelulusan</div>
                  <div className="text-xs font-black text-slate-800">Resmi Kemendikbudristek</div>
                </div>
                <a
                  href="#psb"
                  className="p-2.5 rounded-full bg-stone-100 hover:bg-[#0B52E2] hover:text-white text-slate-700 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* CARD 6: PORTAL MONITORING WALI SANTRI */}
            <div className="p-6 rounded-[28px] bg-white text-slate-900 shadow-xs border border-stone-200/90 flex flex-col justify-between space-y-6 hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-100">
                    Wali Santri
                  </span>
                  <span className="text-[10px] font-bold text-[#0B52E2]">
                    Tanpa Password
                  </span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-slate-900">
                  Portal Monitoring Wali Santri
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Orang tua dapat memantau capaian setoran muhafadzoh nadzom santri, mutasi saku non-tunai di kantin (KTSD), surat izin kepulangan Kamtib, dan kwitansi syahriyah dari ponsel.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold">Akses Wali</div>
                  <div className="text-xs font-black text-rose-700">Cari Nama / NIS Santri</div>
                </div>
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="p-2.5 rounded-full bg-[#8CE829] text-slate-950 hover:bg-[#7BD420] transition-colors shadow-xs cursor-pointer"
                  title="Buka Portal Wali"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: RUTINITAS SANTRI (LALARAN, KITAB, MUSYAWARAH & TAKROR)        */}
      {/* ========================================================================= */}
      <section id="rutinitas" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-stone-200/90 shadow-sm space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-stone-100">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#0B52E2] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                Kedisiplinan & Barakah Waktu
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
                Jadwal Rutinitas Santri Salafiyah Darul Rahman
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Kombinasi ibadah berjamaah, setoran muhafadzoh nadzoman, sekolah formal, pengajian kitab kuning, takror, dan musyawarah fiqih malam.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-400">
              Kencong, Kepung, Kediri
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-[#0B52E2] bg-blue-100 px-2 py-0.5 rounded-md">03.30 - 05.00</span>
              <h4 className="font-bold text-xs text-slate-900">Qiyamul Lail & Shalat Subuh</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Tahajud berjamaah, doa istighotsah, Shalat Subuh berjamaah, dan wirid Ratib Al-Haddad.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">05.00 - 06.30</span>
              <h4 className="font-bold text-xs text-slate-900">Lalaran & Setoran Muhafadzoh</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Lalaran bait nadhom bersama dilanjutkan setoran hafalan Alfiyah Ibnu Malik / Imrithi kepada ustadz pembina.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">07.00 - 12.30</span>
              <h4 className="font-bold text-xs text-slate-900">Sekolah Formal Terpadu</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Pembelajaran kurikulum formal nasional, sains, bahasa Arab dan Inggris di ruang kelas.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">13.00 - 15.00</span>
              <h4 className="font-bold text-xs text-slate-900">Dzuhur & Qailulah Siang</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Shalat Dzuhur berjamaah, makan siang bersama di asrama, dan istirahat siang (sunnah qailulah).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">15.30 - 17.00</span>
              <h4 className="font-bold text-xs text-slate-900">Pengajian Kitab Kuning Sore</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Shalat Ashar berjamaah dilanjutkan pengajian wetonan Kitab Fiqih / Hadits bersama Pengasuh dan Asatidz.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">17.30 - 19.30</span>
              <h4 className="font-bold text-xs text-slate-900">Maghrib, Sorogan & Takror</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Shalat Maghrib berjamaah, sorogan kitab privat per santri, dan pengulangan (takror) materi kitab kuning.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">19.30 - 21.00</span>
              <h4 className="font-bold text-xs text-slate-900">Madrasah Diniyah Salafiyah</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Shalat Isya berjamaah, masuk kelas Madrasah Diniyah (Nahwu, Shorof, Fiqih, Akhlaq, Tarikh).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-1.5">
              <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-md">21.00 - 22.30</span>
              <h4 className="font-bold text-xs text-slate-900">Musyawarah Fiqih & Istirahat</h4>
              <p className="text-[10.5px] text-slate-500 leading-relaxed">
                Forum musyawarah / bahtsul masa'il santri, mutala'ah mandiri persiapan esok hari, dan istirahat tidur.
              </p>
            </div>

          </div>

          {/* Galeri Fasilitas Pesantren (Bento Cards SAMA PERSIS) */}
          <div id="fasilitas" className="pt-6 border-t border-stone-100">
            <div className="mb-6">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                Sarana & Prasarana
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Fasilitas Lingkungan Kampus Darul Rahman
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-[#0B52E2]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Masjid Jami' Pusat Ibadah</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Masjid luas dan sejuk untuk shalat berjamaah 5 waktu, pengajian kitab akbar, dan lalaran nadzoman.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Asrama Santri Putra & Putri</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Kompleks asrama terpisah dengan sirkulasi udara baik, lemari standar, dan asatidz pembina kamar mukim 24 jam.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Perpustakaan & Maktabah Salaf</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Koleksi kitab kuning klasik berbagai fan ilmu Islam (Fathul Mu'in, Ihya, Tafsir), kamus Arab, dan ruang musyawarah.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Kantin & Koperasi Cashless (KTSD)</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Kebutuhan santri higienis dan belanja non-tunai (kartu KTSD RFID) agar santri terbiasa hemat dan tertib.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700">
                  <Award className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Lapangan Olahraga & Seni Bela Diri</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Futsal, voli, bulutangkis, dan area latihan seni bela diri pencak silat Pagar Nusa santri di sore hari.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="font-bold text-slate-900 text-sm">Pos Kesehatan Pesantren (Poskestren)</div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Layanan medis pertolongan pertama dan rujukan cepat bagi santri yang membutuhkan penanganan kesehatan.
                </p>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION: PENERIMAAN SANTRI BARU (PSB 2026/2027)                        */}
      {/* ========================================================================= */}
      <section id="psb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="rounded-[32px] sm:rounded-[40px] bg-[#0B52E2] text-white p-8 sm:p-12 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-[#8CE829] text-xs font-black uppercase tracking-wider">
              <Award className="w-3.5 h-3.5" />
              <span>PSB Tahun Ajaran 2026/2027 Telah Dibuka</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
              Penerimaan Santri Baru Pondok Pesantren Darul Rahman
            </h3>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-medium">
              Membuka pendaftaran santri baru untuk program Madrasah Diniyah Salafiyah, Muhafadzoh Nadzom Kitab, serta jenjang formal SMP dan SMA terpadu. Kuota asrama terbatas setiap angkatan.
            </p>
            <div className="flex items-center gap-4 text-xs font-bold pt-2 flex-wrap text-white/90">
              <span className="flex items-center gap-1">✓ Berkas Administrasi</span>
              <span className="flex items-center gap-1">✓ Tes Baca Kitab / Al-Qur'an</span>
              <span className="flex items-center gap-1">✓ Wawancara Wali & Santri</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 w-full lg:w-auto">
            <a
              href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}?text=Assalamu'alaikum%20Panitia%20PSB%20Darul%20Rahman%2C%20mohon%20informasi%20pendaftaran%20santri%20baru`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-full bg-[#8CE829] hover:bg-[#7BD420] text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Chat WhatsApp Panitia PSB</span>
            </a>

            <button
              onClick={() => onOpenPortalWali('')}
              className="px-6 py-3.5 rounded-full bg-white/15 hover:bg-white text-white hover:text-slate-950 font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Buka Layanan Portal Wali</span>
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION: PROFIL LEMBAGA & SALURAN RESMI (SAMA DENGAN VERSI SEBELUMNYA)  */}
      {/* ========================================================================= */}
      <section id="profil" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-stone-200/90 shadow-sm">
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-8 border-b border-stone-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B52E2] text-xs font-bold border border-blue-100">
                <Building2 className="w-3.5 h-3.5" />
                <span>Profil Lembaga & Kontak Resmi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {namaLembaga}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed font-medium">
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

          {/* Info Grid 4 Kolom SAMA PERSIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 text-xs">
            
            {/* Kolom 1: Alamat */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-[#0B52E2]">
                <MapPin className="w-4.5 h-4.5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Alamat Pesantren</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {alamatLembaga}
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
                  href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>{noWa}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="block text-slate-500 font-mono text-[10px] truncate">{emailLembaga}</span>
              </div>
            </div>

            {/* Kolom 3: Pengasuh & Pimpinan */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Pengasuhan & Pimpinan</div>
              <div className="text-slate-700 font-semibold text-[11px] leading-relaxed space-y-0.5">
                <span className="block">{namaPengasuh}</span>
                <span className="block text-slate-500 font-normal text-[10.5px]">Bendahara: {namaBendahara}</span>
              </div>
            </div>

            {/* Kolom 4: Rekening Resmi Syahriyah BSI */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50 border border-stone-200/60 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <div className="font-bold text-slate-900 text-sm">Rekening Resmi Syahriyah</div>
              <div className="text-[11px] text-slate-700 leading-relaxed">
                <div className="font-bold text-slate-900">{bankName}</div>
                <div className="flex items-center justify-between mt-1 bg-white px-2 py-1 rounded-lg border border-stone-200">
                  <span className="font-mono text-[#0B52E2] font-bold tracking-wider">{bankNo}</span>
                  <button
                    onClick={handleCopyBank}
                    className="text-[10px] font-bold text-slate-500 hover:text-[#0B52E2] cursor-pointer"
                  >
                    {copiedBank ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
                <div className="text-[10px] text-slate-500 uppercase truncate mt-1">{bankHolder}</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER RESMI MANDIRI PESANTREN DARUL RAHMAN (SAMA PERSIS)              */}
      {/* ========================================================================= */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-slate-500 text-[11px] font-sans mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-black text-slate-900 text-xs flex items-center justify-center sm:justify-start gap-2">
              <span>{namaLembaga}</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 font-bold">Portal Salafiyah Mandiri</span>
            </div>
            <p className="text-[10.5px] text-slate-500 mt-0.5">
              {alamatLembaga} • WA: {noWa}
            </p>
          </div>
          <div className="flex items-center gap-4 font-semibold text-[10.5px]">
            <button onClick={() => onOpenPortalWali('')} className="hover:text-[#0B52E2] hover:underline cursor-pointer">Portal Wali</button>
            <button onClick={onLoginPetugas} className="hover:text-[#0B52E2] hover:underline cursor-pointer">Login Petugas</button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-400">© {new Date().getFullYear()} {namaLembaga}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
