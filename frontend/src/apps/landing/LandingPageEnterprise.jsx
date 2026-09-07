import React, { useState } from 'react';
import { 
  Building2, 
  ArrowRight, 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Wallet, 
  BookOpen, 
  Users, 
  Check, 
  Lock, 
  Globe, 
  ExternalLink,
  ChevronRight, 
  Search, 
  CheckCircle2, 
  PhoneCall, 
  Server, 
  Layers, 
  ArrowUpRight,
  Calendar,
  Clock,
  Sparkles,
  MessageCircle,
  HelpCircle,
  FileText,
  Award,
  Smartphone
} from 'lucide-react';

export default function LandingPageEnterprise({ 
  onNavigateApp, 
  onNavigateMitra, 
  onNavigatePricing,
  onOpenRegisterModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('kts');
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const clean = searchQuery.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSearchFeedback(`Mencari direktori pesantren "${clean}"... Mengarahkan ke App Hub.`);
    setTimeout(() => {
      if (onNavigateApp) {
        onNavigateApp();
      } else {
        window.location.href = `https://app.sipesand.web.id?tenant=${clean}`;
      }
    }, 800);
  };

  const handleConsultWhatsApp = (topic = 'Umum') => {
    const text = encodeURIComponent(`Halo Tim Sales SiPesand, kami ingin konsultasi ${topic} untuk digitalisasi pondok pesantren kami.`);
    window.open(`https://wa.me/6285123734342?text=${text}`, '_blank');
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-[#18181B] font-sans antialiased selection:bg-[#0B4FE2] selection:text-white p-2 sm:p-5 lg:p-7">
      
      {/* Container Utama: Super-Ellipse Frame App Bersih */}
      <div className="max-w-7xl mx-auto bg-[#FAFAF8] rounded-3xl border border-[#DCD6CD] shadow-sm overflow-hidden flex flex-col">
        
        {/* ===================================================================== */}
        {/* 1. NAVBAR WOOT UI DENGAN LOGO RESMI SIPESAND                          */}
        {/* ===================================================================== */}
        <header className="px-4 sm:px-8 py-4 border-b border-[#E4E4E7] flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-50">
          
          {/* Logo Brand Resmi SiPesand */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo-sipesand.png" 
                alt="Logo Resmi SIPESAND" 
                className="h-10 sm:h-11 w-auto object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105" 
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-['Righteous'] text-xl sm:text-2xl text-[#0B4FE2] tracking-tight leading-none">
                    SIPESAND
                  </span>
                  <span className="hidden lg:inline-block px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[9px] font-black text-[#0B4FE2] uppercase tracking-wider">
                    SaaS Enterprise
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-zinc-500 hidden sm:block tracking-tight">
                  Sistem Informasi Pesantren Terpadu & Digital
                </span>
              </div>
            </a>
          </div>

          {/* Navigasi Cepat Sales & Fitur */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-bold text-zinc-600">
            <a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Fitur Unggulan</a>
            <a href="#preview" className="hover:text-[#0B4FE2] transition-colors">Demo Sistem</a>
            <a href="#cara-kerja" className="hover:text-[#0B4FE2] transition-colors">Alur Kerja</a>
            <a href="#harga" className="hover:text-[#0B4FE2] transition-colors">Paket & Biaya</a>
            <a href="#testimoni" className="hover:text-[#0B4FE2] transition-colors">Testimoni</a>
            <a href="#faq" className="hover:text-[#0B4FE2] transition-colors">FAQ</a>
            <button 
              onClick={onNavigateMitra} 
              className="hover:text-[#0B4FE2] transition-colors font-bold text-left text-zinc-500"
            >
              Portal Mitra
            </button>
          </div>

          {/* Tombol Aksi Konversi Navbar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleConsultWhatsApp('Informasi Paket Lisensi')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all"
              title="Hubungi Tim Sales via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sales WhatsApp</span>
            </button>

            <button
              onClick={onNavigateApp}
              className="px-4 sm:px-5 py-2.5 rounded-full bg-[#0B4FE2] text-white hover:bg-blue-700 font-bold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <span>Masuk App Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 2. HERO SECTION: COPYWRITING SALES DUAL-SPLIT PREMIUM                  */}
        {/* ===================================================================== */}
        <section className="p-3 sm:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* HERO PANEL KIRI: ELECTRIC COBALT BLUE (#0B4FE2) */}
            <div className="lg:col-span-7 bg-[#0B4FE2] text-white rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div>
                {/* Badge Kategori Terpercaya */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#98F51F] text-[11px] font-black uppercase tracking-wider mb-5 border border-white/15">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Platform SaaS Manajemen Pesantren Terpadu #1 di Indonesia</span>
                </div>

                {/* Headline Sales Berdaya Tarik Tinggi */}
                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.12] mb-4 text-white">
                  Transformasi Digital Pesantren.{' '}
                  <span className="relative inline-block px-1">
                    <span className="relative z-10 text-[#98F51F]">Rapi, Amanah,</span>
                  </span>
                  {' '}dan 100% Terkendali.
                </h1>

                {/* Subheadline Persuasif Menjawab Masalah Nyata */}
                <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl leading-relaxed mb-6">
                  Satu aplikasi cloud untuk otomatisasi penagihan syahriyah Kalender Hijriyah, transaksi uang saku non-tunai (Cashless Smart KTS), buku kas umum yayasan, kontrol izin gerbang pos kamtib, dan portal mandiri wali santri tanpa perlu menghafal kata sandi.
                </p>
              </div>

              <div>
                {/* Capsule Quick Subdomain / Search Box */}
                <form onSubmit={handleSearchSubmit} className="mb-4">
                  <div className="relative flex items-center bg-white rounded-full p-1.5 shadow-lg border border-white/20">
                    <div className="pl-4 pr-2 text-zinc-400">
                      <Search className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan nama pondok Anda (misal: darulrahman)..."
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 font-semibold focus:outline-none py-2"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-[#98F51F] text-black hover:bg-[#86dc16] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm font-bold"
                      title="Buka Portal Lembaga"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                  {searchFeedback && (
                    <p className="text-[11px] text-[#98F51F] font-bold mt-2 pl-3">
                      {searchFeedback}
                    </p>
                  )}
                </form>

                {/* 3 Tag Jaminan Kualitas */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/95 border border-white/15 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#98F51F]" />
                    <span>Database Cloud Terisolasi per Lembaga</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/95 border border-white/15 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#98F51F]" />
                    <span>Subdomain Mandiri Gratis</span>
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/95 border border-white/15 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#98F51F]" />
                    <span>Multi-Role: Bendahara, Kamtib, Pengasuh</span>
                  </span>
                </div>
              </div>
            </div>

            {/* HERO PANEL KANAN: NEON LIME (#98F51F) KONTRAK VALUE PROPOSITION */}
            <div className="lg:col-span-5 bg-[#98F51F] text-[#18181B] rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 text-black text-[11px] font-black uppercase tracking-wider mb-6">
                  Solusi Lembaga Siap Pakai
                </div>

                <div className="mb-6">
                  <div className="text-5xl sm:text-6xl font-black tracking-tight text-black leading-none mb-2">
                    100%
                  </div>
                  <p className="text-base sm:text-lg font-black text-black">
                    Transparansi Keuangan & Nol Kehilangan Uang Santri
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-900 font-medium leading-relaxed mb-6">
                  Santri tidak lagi memegang uang tunai fisik di asrama. Saldo saku tersimpan aman di cloud, dan wali santri dapat memantau riwayat jajan santri di kantin langsung dari ponsel kapan saja tanpa biaya tambahan.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="#harga"
                  className="w-full py-4 rounded-2xl bg-[#18181B] text-white hover:bg-black font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Lihat Paket Lisensi & Biaya</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </a>

                <button
                  onClick={onNavigateApp}
                  className="w-full py-3.5 rounded-2xl bg-white/80 hover:bg-white text-zinc-900 font-bold text-xs transition-all border border-black/10 flex items-center justify-center gap-2"
                >
                  <span>Sudah Punya Akun? Masuk ke App Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleConsultWhatsApp('Konsultasi Gratis')}
                  className="w-full py-2.5 rounded-xl bg-transparent hover:bg-black/5 text-zinc-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Konsultasi Langsung via WhatsApp Sales</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. MOCKUP DASHBOARD REALISTIS (LIVE PREVIEW SYSTEM)                   */}
        {/* ===================================================================== */}
        <section id="preview-mockup" className="px-3 sm:px-7 py-6">
          <div className="bg-slate-900 rounded-3xl p-3 sm:p-5 shadow-2xl border border-slate-800 text-left overflow-hidden">
            
            {/* Window Top Bar (Chrome / macOS Style) */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              </div>
              
              <div className="bg-slate-800 px-4 py-1.5 rounded-xl text-[11px] font-mono text-slate-300 flex items-center gap-2 max-w-sm truncate border border-slate-700">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>https://darulrahman.sipesand.web.id/admin</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider hidden sm:inline-block">Cloud Edge Active</span>
              </div>
            </div>

            {/* Dashboard Content Mockup */}
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 space-y-5 text-slate-900 mt-3">
              
              {/* Header Subdomain Pondok */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold text-[#0B4FE2] uppercase tracking-wider">Portal Mandiri Resmi Pondok Pesantren</span>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">Pondok Pesantren Darul Rahman Sumbersari</h3>
                  <p className="text-xs text-slate-500">Tahun Ajaran 1447–1448 H / 2026–2027 • Status Sistem: 100% Normal</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>324 Santri Aktif Terdaftar</span>
                  </span>
                </div>
              </div>

              {/* 4 Kartu Metrik Ringkasan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kas Masuk Bulan Ini</span>
                  <div className="text-base sm:text-xl font-black text-slate-950">Rp 48.500.000</div>
                  <span className="text-[10px] text-emerald-600 font-bold">↑ 12% Syahriyah Hijriyah</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Perputaran Saku POS</span>
                  <div className="text-base sm:text-xl font-black text-[#0B4FE2]">Rp 14.820.000</div>
                  <span className="text-[10px] text-slate-500 font-bold">100% Non-Tunai</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Izin Santri Aktif</span>
                  <div className="text-base sm:text-xl font-black text-amber-600">8 Santri</div>
                  <span className="text-[10px] text-emerald-600 font-bold">0 Terlambat (*On-Time*)</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Realisasi Tagihan</span>
                  <div className="text-base sm:text-xl font-black text-slate-950">94.2%</div>
                  <span className="text-[10px] text-[#0B4FE2] font-bold">Bulan Ramadhan 1447 H</span>
                </div>
              </div>

              {/* Split Feed: Transaksi POS Saku & Pos Perizinan Gerbang */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                
                {/* List Transaksi Saku Santri Real-Time */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b pb-2">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#0B4FE2]" />
                      <span>Kasir Uang Saku Kantin & Koperasi</span>
                    </span>
                    <span className="text-[#0B4FE2] text-[10px] font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">Live Sync</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">Muhammad Farhan (XI MA)</div>
                        <div className="text-[10px] text-slate-500">Koperasi Kitab • Tap Kartu NFC KTS</div>
                      </div>
                      <span className="font-bold text-rose-600">- Rp 25.000</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">Ahmad Zaid Al-Faqih (XII MA)</div>
                        <div className="text-[10px] text-slate-500">Kantin Putra • Tap Kartu NFC KTS</div>
                      </div>
                      <span className="font-bold text-rose-600">- Rp 12.000</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">Aisyah Nur Ramadhani (XI MA)</div>
                        <div className="text-[10px] text-slate-500">Top-Up Transfer Online Wali Santri</div>
                      </div>
                      <span className="font-bold text-emerald-600">+ Rp 200.000</span>
                    </div>
                  </div>
                </div>

                {/* List Keamanan Kamtib Gerbang */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b pb-2">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Pos Keamanan Kamtib Gerbang (Perizinan)</span>
                    </span>
                    <span className="text-emerald-600 text-[10px] font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">Barcode Scan</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">M. Rayhan Syafi'i</div>
                        <div className="text-[10px] text-slate-500">Keperluan: Periksa Medis RSUD • Izin 1 Hari</div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px]">IZIN KELUAR</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">Fadhil Ramadhan</div>
                        <div className="text-[10px] text-slate-500">Dinas Ekstrakurikuler MQK Tingkat Provinsi</div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">KEMBALI TEPAT</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-900">Zulfikar Haris</div>
                        <div className="text-[10px] text-slate-500">Sambangan Keluarga & Wali Santri</div>
                      </div>
                      <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">KEMBALI TEPAT</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. STATISTIK DAMPAK SISTEM (BENTO IMPACT METRICS)                     */}
        {/* ===================================================================== */}
        <section className="px-4 sm:px-8 py-8 border-y border-[#E4E4E7] bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-3xl bg-[#FAFAF8] border border-[#E4E4E7] space-y-2 hover:border-blue-400 transition-all">
              <div className="text-3xl sm:text-4xl font-black text-[#0B4FE2] tracking-tight">99.4%</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Ketepatan Syahriyah</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Penagihan berbasis kalender Hijriyah menekan tunggakan hingga ke angka minimal secara tertib.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAFAF8] border border-[#E4E4E7] space-y-2 hover:border-emerald-400 transition-all">
              <div className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">100% Cashless</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Nol Uang Hilang di Asrama</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Santri bertransaksi jajan di kantin menggunakan Kartu KTS Smart NFC dengan batas limit harian.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAFAF8] border border-[#E4E4E7] space-y-2 hover:border-amber-400 transition-all">
              <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight">&lt; 15 Detik</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Verifikasi Izin Gerbang</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Proses check-in dan check-out izin santri berlangsung instan tanpa antrean di pos kamtib.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAFAF8] border border-[#E4E4E7] space-y-2 hover:border-purple-400 transition-all">
              <div className="text-3xl sm:text-4xl font-black text-purple-700 tracking-tight">24/7 Mandiri</div>
              <h4 className="font-extrabold text-slate-900 text-sm">Portal Wali Passwordless</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Orang tua dapat mengecek sisa uang saku, riwayat izin, dan bayar SPP langsung dari HP via NISN.
              </p>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. 6 MODUL OPERASIONAL UTAMA SISTEM                                   */}
        {/* ===================================================================== */}
        <section id="fitur" className="px-4 sm:px-8 py-12">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Modul Unggulan</span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight mt-1">
              Satu Sistem Menjawab Seluruh Kebutuhan Pengurus, Santri, dan Wali
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-2">
              Didesain khusus untuk alur operasional pesantren tradisional (salaf) maupun modern tanpa mengubah tata tertib yang telah berjalan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Modul 1: KTS & POS Cashless */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0B4FE2] flex items-center justify-center font-bold mb-5 border border-blue-100">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Kartu Santri (KTS) & POS Cashless
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Kartu pintar fisik standar ATM perbankan (CR-80) dengan chip NFC. Melayani transaksi jajan kantin/koperasi, presensi sorogan, dan cetak mandiri 4 tema resmi.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#0B4FE2]">
                <span>Standar ISO 14443 Type A</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 2: Billing Syahriyah Hijriyah */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-emerald-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-5 border border-emerald-100">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Billing Syahriyah Kalender Hijriyah
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Penerbitan tagihan bulanan otomatis berdasarkan kalender Islam (Muharram s.d Dzulhijjah), kuitansi pembayaran resmi dengan QR Code verifikasi anti-pemalsuan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>12 Bulan Hijriyah Otomatis</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 3: Buku Kas & Akuntansi */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-indigo-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-5 border border-indigo-100">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Buku Kas Umum & Akuntansi Yayasan
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Pencatatan arus kas masuk dan keluar per divisi (Pendidikan, Kamtib, Logistik, Pengasuhan) lengkap dengan laporan audit keuangan real-time dan ekspor PDF.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                <span>Multi-Divisi & Rekening Bank</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 4: Pos Kamtib Gerbang */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-5 border border-amber-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Pos Keamanan Kamtib Gerbang
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Pencatatan izin santri keluar pondok atau pulang ke rumah dengan barcode scan. Deteksi santri terlambat kembali (*overdue*) secara otomatis di pos jaga.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Barcode Scan Instan</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 5: Akademik & Tahfidz */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-teal-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold mb-5 border border-teal-100">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Buku Induk & Evaluasi Tahfidz
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Pencatatan capaian hafalan Al-Qur'an (Tahfidz juz & ayat), setoran kitab kuning, pembagian santri asuh per ustadz, dan evaluasi berkala majelis masyayikh.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Mutaba'ah Santri Terpadu</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 6: Portal Mandiri Wali */}
            <div className="bg-white rounded-3xl p-7 border border-[#E4E4E7] shadow-xs flex flex-col justify-between hover:border-purple-400 hover:shadow-md transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-5 border border-purple-100">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#18181B] mb-2">
                  Portal Mandiri Wali Santri (Passwordless)
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Wali santri tidak perlu menghafal kata sandi rumit. Cukup masukkan NISN atau nama santri untuk memantau sisa uang saku, riwayat jajan, dan melunasi syahriyah.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-purple-700">
                <span>Ponsel Friendly 24 Jam</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 6. STUDIO PREVIEW INTERAKTIF BERTAB (FITUR ASLI DIPERTAHANKAN)       */}
        {/* ===================================================================== */}
        <section id="preview" className="px-4 sm:px-8 py-12 border-t border-[#E4E4E7] bg-white">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Demo Interaktif</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-1">
              Jelajahi Antarmuka Asli Modul SIPESAND
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
              Pilih tab di bawah untuk melihat kejelasan tata letak yang dirancang khusus untuk kenyamanan pengurus.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            <button
              onClick={() => setActivePreviewTab('kts')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                activePreviewTab === 'kts'
                  ? 'bg-[#0B4FE2] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Studio Kartu Santri (KTS CR-80)
            </button>
            <button
              onClick={() => setActivePreviewTab('pos')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                activePreviewTab === 'pos'
                  ? 'bg-[#0B4FE2] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Kasir Uang Saku & POS Kantin
            </button>
            <button
              onClick={() => setActivePreviewTab('syahriyah')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                activePreviewTab === 'syahriyah'
                  ? 'bg-[#0B4FE2] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Billing Syahriyah Hijriyah
            </button>
            <button
              onClick={() => setActivePreviewTab('wali')}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all ${
                activePreviewTab === 'wali'
                  ? 'bg-[#0B4FE2] text-white shadow-sm'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              Portal Wali Passwordless
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="max-w-5xl mx-auto bg-[#FAFAF8] border border-[#E4E4E7] rounded-3xl p-6 sm:p-10 shadow-xs">
            
            {/* Tab 1: Studio KTS */}
            {activePreviewTab === 'kts' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">Studio Desain & Cetak Kartu Tanda Santri (KTS)</h4>
                    <p className="text-xs text-slate-500">Standar fisik ATM perbankan (CR-80: 85.6mm × 54mm) dengan chip contactless NFC.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-[#0B4FE2] rounded-lg text-xs font-black">
                    ISO/IEC 7810 ID-1
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-2 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Tema 1: Klasik Pesantren</span>
                    <h5 className="font-bold text-xs text-slate-900">Hijau Zamrud & Ornamen Salaf</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Latar zamrud berornamen kaligrafi Bismillah dengan lis ganda emas elegan khas pesantren salaf.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-2 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded bg-blue-100 text-[#0B4FE2] text-[10px] font-black uppercase">Tema 2: Modern Enterprise</span>
                    <h5 className="font-bold text-xs text-slate-900">Royal Cobalt & Smart Chip</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tata letak bento asimetris dengan grafis Gold EMV Smart Chip dan logo NFC contactless resmi.
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 space-y-2 shadow-xs">
                    <span className="px-2.5 py-0.5 rounded bg-zinc-800 text-white text-[10px] font-black uppercase">Tema 3: Luxury VIP Edition</span>
                    <h5 className="font-bold text-xs text-slate-900">Obsidian & Pita Foil Emas</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Latar gelap obsidian mewah dengan pita foil emas metalik diagonal untuk santri teladan & ustadz.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: POS Kasir Kantin */}
            {activePreviewTab === 'pos' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">Kasir POS Kantin & Manajemen Uang Saku</h4>
                    <p className="text-xs text-slate-500">Tap kartu santri sekali sentuh, limit belanja harian, dan notifikasi saldo menipis.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black">
                    Zero Physical Cash
                  </span>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-zinc-200 text-xs text-slate-700 leading-relaxed font-medium space-y-3">
                  <p>
                    Santri tidak lagi menyimpan uang tunai di asrama yang rentan terselip atau hilang. Setiap transaksi di kantin maupun koperasi terpotong langsung dari saldo cloud santri.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Limit Harian Santri</div>
                      <div className="text-[11px] text-zinc-500">Mencegah santri boros dengan batas jajan Rp 25.000 / hari.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Cegah Santri Ngutang</div>
                      <div className="text-[11px] text-zinc-500">Sistem menolak transaksi jika saldo saku tidak mencukupi.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Rekapitulasi Kasir</div>
                      <div className="text-[11px] text-zinc-500">Pengelola kantin menerima pencairan dana kasir setiap sore secara presisi.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Syahriyah Hijriyah */}
            {activePreviewTab === 'syahriyah' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">Penagihan Syahriyah Kalender Hijriyah</h4>
                    <p className="text-xs text-slate-500">Siklus bulanan berbasis penanggalan Islam dengan bukti kuitansi resmi ber-QR Code.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-[#0B4FE2] rounded-lg text-xs font-black">
                    12 Bulan Hijriyah
                  </span>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-zinc-200 text-xs text-slate-700 leading-relaxed font-medium space-y-3">
                  <p>
                    Penerbitan tagihan serentak dapat difilter berdasarkan bulan Hijriyah (Muharram hingga Dzulhijjah), tingkatan kelas, atau komplek asrama santri. Kuitansi resmi otomatis diterbitkan dengan tanda tangan dan stempel digital yayasan.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Invoice Otomatis</div>
                      <div className="text-[11px] text-zinc-500">Tagihan langsung terbit serentak tiap awal bulan Hijriyah.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">QR Code Anti-Palsu</div>
                      <div className="text-[11px] text-zinc-500">Wali santri dapat memverifikasi keaslian kuitansi cukup dengan scan kamera.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Rekap Tunggakan</div>
                      <div className="text-[11px] text-zinc-500">Bendahara dapat mendownload daftar santri menunggak dengan sekali klik.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Portal Wali */}
            {activePreviewTab === 'wali' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-slate-900">Portal Mandiri Wali Santri (Passwordless)</h4>
                    <p className="text-xs text-slate-500">Akses mudah dari mana saja cukup dengan Nomor Induk Santri (NISN).</p>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-black">
                    Akses Ponsel Tanpa Login
                  </span>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-zinc-200 text-xs text-slate-700 leading-relaxed font-medium space-y-3">
                  <p>
                    Orang tua tidak perlu menginstal aplikasi berat yang memenuhi memori ponsel. Cukup buka link portal santri dan ketikkan NISN/nama santri:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Cek Saldo Saku</div>
                      <div className="text-[11px] text-zinc-500">Melihat sisa saldo uang jajan santri di kantin secara langsung.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Riwayat Izin Kamtib</div>
                      <div className="text-[11px] text-zinc-500">Mengetahui apakah santri sedang di dalam atau di luar lingkungan pondok.</div>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                      <div className="font-bold text-slate-900 mb-1">Bayar Tagihan SPP</div>
                      <div className="text-[11px] text-zinc-500">Membayar tagihan bulanan secara online dan download kuitansi kementerian.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 7. ALUR KERJA 3 LANGKAH IMPLEMENTASI CEPAT                           */}
        {/* ===================================================================== */}
        <section id="cara-kerja" className="px-4 sm:px-8 py-12 border-t border-[#E4E4E7]">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Implementasi Cepat</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              3 Langkah Mudah Menuju Pesantren Digital
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              Tanpa perlu instalasi server rumit atau tim IT khusus. Sistem siap digunakan dalam hitungan jam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            <div className="bg-white p-7 rounded-3xl border border-zinc-200 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#0B4FE2] text-white font-black flex items-center justify-center text-base shadow-sm">
                1
              </div>
              <h3 className="text-base font-black text-slate-900">Aktivasi Subdomain Lembaga</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Daftarkan nama pondok Anda dan dapatkan portal mandiri resmi beralamat <code className="text-[#0B4FE2] font-bold">namapondok.sipesand.web.id</code> lengkap dengan sertifikat SSL HTTPS otomatis.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-zinc-200 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#0B4FE2] text-white font-black flex items-center justify-center text-base shadow-sm">
                2
              </div>
              <h3 className="text-base font-black text-slate-900">Import Santri & Cetak KTS</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Unggah data induk santri melalui file Excel / template cepat, hubungkan chip kartu NFC santri, dan cetak kartu fisik standar perbankan langsung dari browser.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-zinc-200 space-y-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#0B4FE2] text-white font-black flex items-center justify-center text-base shadow-sm">
                3
              </div>
              <h3 className="text-base font-black text-slate-900">Operasional Terpadu Siap Pakai</h3>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Pengurus asrama, kasir kantin, bendahara syahriyah, dan petugas pos kamtib dapat langsung bekerja di modul masing-masing dengan hak akses multi-role aman.
              </p>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 8. TESTIMONI OTENTIK PESANTREN PENGGUNA                                */}
        {/* ===================================================================== */}
        <section id="testimoni" className="px-4 sm:px-8 py-12 border-t border-[#E4E4E7] bg-white">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Testimoni Otentik</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              Dipercaya Pengasuh, Bendahara, dan Wali Santri
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              Kisah nyata dampak efisiensi dan transparansi setelah menerapkan ekosistem SIPESAND.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-700 leading-relaxed italic font-medium">
                "Pengelolaan uang saku kini 100% amanah. Tidak ada lagi keluhan santri kehilangan uang di lemari asrama. Pengurus kamtib juga sangat terbantu saat perizinan keluar pondok."
              </p>
              <div className="pt-4 border-t border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#0B4FE2] font-black flex items-center justify-center text-xs">
                  KH
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">K.H. Syarif Hidayatullah</h4>
                  <p className="text-[11px] text-zinc-500">Pengasuh Pondok Pesantren</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-700 leading-relaxed italic font-medium">
                "Dahulu rekonsiliasi SPP syahriyah memakan waktu berminggu-minggu. Dengan auto-billing kalender Hijriyah SIPESAND, pembukuan kas yayasan selesai secara instan dan rapi."
              </p>
              <div className="pt-4 border-t border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
                  UR
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Ustadz Ridwan, S.E.</h4>
                  <p className="text-[11px] text-zinc-500">Bendahara Yayasan Pesantren</p>
                </div>
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAFAF8] border border-zinc-200 shadow-xs flex flex-col justify-between space-y-4">
              <p className="text-xs text-zinc-700 leading-relaxed italic font-medium">
                "Sebagai wali santri yang tinggal di luar pulau, saya merasa sangat tenang karena bisa mengecek sisa uang saku anak saya setiap saat lewat ponsel tanpa perlu instal aplikasi tambahan."
              </p>
              <div className="pt-4 border-t border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                  SF
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Hj. Siti Fatimah</h4>
                  <p className="text-[11px] text-zinc-500">Wali Santri Kelas XI</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 9. SKEMA BIAYA & PAKET LISENSI SAAS (PRICING WITH TOGGLE)             */}
        {/* ===================================================================== */}
        <section id="harga" className="px-4 sm:px-8 py-14 border-t border-[#E4E4E7]">
          <div className="max-w-3xl mx-auto text-center mb-10 space-y-3">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Investasi Berkelanjutan</span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight">
              Pilihan Paket Fleksibel Sesuai Skala Pesantren Anda
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              Tanpa biaya tersembunyi. Termasuk pembaruan fitur gratis, backup cloud harian, dan panduan implementasi.
            </p>

            {/* Toggle Billing Bulanan / Tahunan */}
            <div className="inline-flex items-center p-1.5 rounded-full bg-zinc-200/80 border border-zinc-300 mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Tagihan Bulanan
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-white text-zinc-900 shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <span>Tagihan Tahunan</span>
                <span className="px-2 py-0.5 rounded-full bg-[#98F51F] text-black text-[10px] font-black uppercase">
                  Hemat 2 Bulan
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 max-w-6xl mx-auto items-stretch">
            
            {/* Paket 1: Rintisan */}
            <div className="p-8 rounded-3xl border border-zinc-200 bg-white flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Komunitas Salaf</span>
                <h3 className="text-xl font-black text-slate-900">Pesantren Rintisan</h3>
                <p className="text-xs text-zinc-500 font-medium">Khusus pesantren kecil yang baru memulai proses digitalisasi administrasi.</p>
                
                <div className="text-3xl sm:text-4xl font-black text-slate-950">Gratis</div>
                <div className="text-xs text-zinc-400 font-bold">Hingga 50 santri terdaftar</div>
                
                <ul className="space-y-3 pt-4 text-xs text-slate-700 font-medium border-t border-zinc-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Database Cloud Mandiri Terisolasi</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Pencatatan Uang Saku Santri Dasar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Subdomain Resmi Lembaga</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Buku Kas Masuk & Keluar</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={onNavigateApp}
                className="w-full py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold rounded-2xl text-xs transition-colors"
              >
                Mulai Gratis 50 Santri
              </button>
            </div>

            {/* Paket 2: Pro (Rekomendasi Utama) */}
            <div className="p-8 rounded-3xl border-2 border-[#0B4FE2] bg-white flex flex-col justify-between space-y-6 shadow-lg relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#0B4FE2] text-white rounded-full text-[10px] font-black tracking-wider uppercase shadow-sm">
                Paling Diminati Pesantren
              </div>

              <div className="space-y-4">
                <span className="text-[11px] font-black text-[#0B4FE2] uppercase tracking-wider">Lembaga Berkembang</span>
                <h3 className="text-xl font-black text-slate-900">Pesantren Profesional</h3>
                <p className="text-xs text-zinc-500 font-medium">Solusi lengkap komprehensif untuk operasional asrama, syahriyah, dan uang saku.</p>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950">
                    {billingCycle === 'annual' ? 'Rp 408.000' : 'Rp 490.000'}
                  </span>
                  <span className="text-xs text-zinc-500 font-bold">/ bulan</span>
                </div>
                <div className="text-xs text-emerald-700 font-black">
                  {billingCycle === 'annual' ? 'Ditagih Rp 4.900.000 / tahun (Hemat 2 Bulan)' : 'Fleksibel bayar bulanan tanpa komitmen'}
                </div>

                <ul className="space-y-3 pt-4 text-xs text-slate-700 font-medium border-t border-zinc-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span><strong>Kapasitas Santri Tak Terbatas (Unlimited)</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Studio KTS & Desain Kartu Standar ATM (CR-80)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Auto-Billing Syahriyah Kalender Hijriyah</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Kasir POS Kantin Cashless NFC & Limit Jajan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Pos Keamanan Kamtib & Perizinan Barcode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Portal Mandiri Wali Santri (Passwordless)</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleConsultWhatsApp('Aktivasi Paket Pro')}
                className="w-full py-4 bg-[#0B4FE2] hover:bg-blue-700 text-white font-black rounded-2xl text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Pilih Paket Pro Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Paket 3: Enterprise Yayasan */}
            <div className="p-8 rounded-3xl border border-zinc-200 bg-white flex flex-col justify-between space-y-6 shadow-xs">
              <div className="space-y-4">
                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-wider">Institusi & Yayasan</span>
                <h3 className="text-xl font-black text-slate-900">Yayasan Multi-Kampus</h3>
                <p className="text-xs text-zinc-500 font-medium">Kustomisasi mendalam untuk yayasan besar dengan banyak cabang pesantren.</p>
                
                <div className="text-3xl sm:text-4xl font-black text-slate-950">Kustom</div>
                <div className="text-xs text-zinc-400 font-bold">Disesuaikan skala cabang yayasan</div>

                <ul className="space-y-3 pt-4 text-xs text-slate-700 font-medium border-t border-zinc-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Custom Domain Sendiri (.sch.id / .ponpes.id)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Konsolidasi Buku Kas Multi-Cabang</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Integrasi Turnstile Gate & Mesin Cetak PVC</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#0B4FE2] flex-shrink-0" />
                    <span>Dedicated Technical Account Manager 24/7</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleConsultWhatsApp('Konsultasi Paket Enterprise Multi-Kampus')}
                className="w-full py-3.5 bg-[#18181B] hover:bg-black text-white font-bold rounded-2xl text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Hubungi Tim Enterprise</span>
                <PhoneCall className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 10. TANYA JAWAB UMUM (FAQ ACCORDION)                                  */}
        {/* ===================================================================== */}
        <section id="faq" className="px-4 sm:px-8 py-12 border-t border-[#E4E4E7] bg-white">
          <div className="max-w-3xl mx-auto text-center mb-10 space-y-2">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Pertanyaan Umum</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
              Kerap Ditanyakan oleh Pengurus Pesantren
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            
            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-zinc-200">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1.5 flex items-center justify-between cursor-pointer" onClick={() => toggleFaq(0)}>
                <span>Apakah data santri kami aman dan terpisah dari pondok lain?</span>
                <span className="text-[#0B4FE2] font-mono">{activeFaq === 0 ? '−' : '+'}</span>
              </h4>
              {(activeFaq === 0 || activeFaq === null) && (
                <p className="text-xs text-zinc-600 leading-relaxed font-medium mt-2 pt-2 border-t border-zinc-100">
                  Sangat aman. Setiap pesantren mendapatkan partisi database mandiri terisolasi mutlak (Multi-Tenant Architecture). Data santri, keuangan yayasan, dan catatan kamtib pondok Anda tidak akan pernah bercampur dengan pesantren lain.
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-zinc-200">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1.5 flex items-center justify-between cursor-pointer" onClick={() => toggleFaq(1)}>
                <span>Bagaimana jika koneksi internet di pesantren kadang tidak stabil?</span>
                <span className="text-[#0B4FE2] font-mono">{activeFaq === 1 ? '−' : '+'}</span>
              </h4>
              {activeFaq === 1 && (
                <p className="text-xs text-zinc-600 leading-relaxed font-medium mt-2 pt-2 border-t border-zinc-100">
                  Aplikasi SiPesand dirancang berbasis Single Page Application yang sangat ringan (hanya beberapa kilobyte). Data disinkronkan secara asinkron dengan caching lokal, sehingga tetap responsif meskipun diakses dari koneksi seluler standar.
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-zinc-200">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1.5 flex items-center justify-between cursor-pointer" onClick={() => toggleFaq(2)}>
                <span>Apakah santri wajib menggunakan kartu fisik KTS?</span>
                <span className="text-[#0B4FE2] font-mono">{activeFaq === 2 ? '−' : '+'}</span>
              </h4>
              {activeFaq === 2 && (
                <p className="text-xs text-zinc-600 leading-relaxed font-medium mt-2 pt-2 border-t border-zinc-100">
                  Tidak harus langsung memiliki kartu fisik. Di masa transisi, santri dapat bertransaksi atau diperiksa izinnya menggunakan Nomor Induk Santri (NIS). Namun kami merekomendasikan penggunaan KTS Smart NFC untuk kecepatan pelayanan kasir di bawah 3 detik.
                </p>
              )}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAFAF8] border border-zinc-200">
              <h4 className="font-extrabold text-sm text-slate-900 mb-1.5 flex items-center justify-between cursor-pointer" onClick={() => toggleFaq(3)}>
                <span>Bagaimana cara wali santri membayar syahriyah atau top-up saku?</span>
                <span className="text-[#0B4FE2] font-mono">{activeFaq === 3 ? '−' : '+'}</span>
              </h4>
              {activeFaq === 3 && (
                <p className="text-xs text-zinc-600 leading-relaxed font-medium mt-2 pt-2 border-t border-zinc-100">
                  Wali santri cukup membuka link portal pondok dari HP, memasukkan NISN santri, lalu memilih tagihan. Pembayaran mendukung QRIS instan, transfer bank virtual account, maupun setor tunai langsung ke bendahara pondok.
                </p>
              )}
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 11. CLOSING BANNER CTA SALES (WOOT HIGH CONTRAST)                     */}
        {/* ===================================================================== */}
        <section className="p-3 sm:p-7">
          <div className="bg-[#18181B] text-white rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl">
              <span className="px-3.5 py-1 rounded-full bg-[#98F51F] text-black text-[10px] font-black uppercase tracking-wider">
                Mulai Uji Coba Tanpa Risiko
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight mt-3 mb-2 text-white leading-tight">
                Siap Mewujudkan Pesantren Digital yang Rapi & Mandiri?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                Bergabunglah bersama puluhan pesantren terkemuka yang telah menertibkan administrasi, kas syahriyah, dan perizinan santri mereka.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full lg:w-auto">
              <button
                onClick={() => handleConsultWhatsApp('Pendaftaran Pesantren Baru')}
                className="px-6 py-4 rounded-2xl bg-[#98F51F] text-[#18181B] hover:bg-[#86dc16] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Konsultasi & Mulai Uji Coba</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onNavigateApp}
                className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Masuk ke App Hub</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 12. FOOTER RESMI & EKOSISTEM SUBDOMAIN                                */}
        {/* ===================================================================== */}
        <footer className="mt-auto px-6 py-10 border-t border-[#E4E4E7] bg-white text-xs text-zinc-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Kolom 1: Brand Info dengan Logo Baru */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-sipesand.png" 
                  alt="SIPESAND Logo" 
                  className="h-10 w-auto object-contain rounded-xl shadow-xs" 
                />
                <div>
                  <span className="font-['Righteous'] text-xl text-[#0B4FE2] tracking-tight block">SIPESAND</span>
                  <span className="text-[10px] text-zinc-400 font-semibold">SaaS Pesantren Enterprise</span>
                </div>
              </div>
              <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
                Sistem Informasi Pesantren Terpadu dan Digital. Solusi terdepan tata kelola keuangan, perizinan santri, dan uang saku cashless di Indonesia.
              </p>
            </div>

            {/* Kolom 2: Modul Produk */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Modul Operasional</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Kartu Santri (KTS) Smart NFC</a></li>
                <li><a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Billing Syahriyah Hijriyah</a></li>
                <li><a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Kantin & Saku Cashless</a></li>
                <li><a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Pos Kamtib Gerbang</a></li>
                <li><a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Evaluasi Tahfidz Muhafadzoh</a></li>
              </ul>
            </div>

            {/* Kolom 3: Ekosistem Subdomain */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Ekosistem Subdomain</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="https://sipesand.web.id" className="hover:text-[#0B4FE2] transition-colors">sipesand.web.id (Landing Utama)</a></li>
                <li><a href="https://app.sipesand.web.id" className="hover:text-[#0B4FE2] transition-colors">app.sipesand.web.id (App Hub Gateway)</a></li>
                <li><a href="https://mitra.sipesand.web.id" className="hover:text-[#0B4FE2] transition-colors">mitra.sipesand.web.id (Developer HQ)</a></li>
                <li><a href="https://darulrahman.sipesand.web.id" className="hover:text-[#0B4FE2] transition-colors">darulrahman.sipesand.web.id (Tenant Demo)</a></li>
              </ul>
            </div>

            {/* Kolom 4: Legal & Bantuan (iPaymu Compliant) */}
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Legalitas & Bantuan</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="/faq" className="hover:text-[#0B4FE2] transition-colors">Pusat Bantuan (FAQ)</a></li>
                <li><a href="/terms-and-conditions" className="hover:text-[#0B4FE2] transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="/refund-policy" className="hover:text-[#0B4FE2] transition-colors">Kebijakan Pengembalian Dana</a></li>
                <li><a href="/kontak" className="hover:text-[#0B4FE2] transition-colors">Kontak Resmi Perusahaan</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-zinc-400">
            <p>© 2026 SIPESAND. Seluruh Hak Cipta Dilindungi Undang-Undang.</p>
            <div className="flex items-center gap-4">
              <span>Cloudflare Global Edge CDN</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">100% Operational</span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
