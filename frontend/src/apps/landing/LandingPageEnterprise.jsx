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
  ArrowUpRight
} from 'lucide-react';

export default function LandingPageEnterprise({ 
  onNavigateApp, 
  onNavigateMitra, 
  onNavigatePricing,
  onOpenRegisterModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchFeedback(`Mencari direktori untuk "${searchQuery}"... Mengarahkan ke App Hub.`);
    setTimeout(() => {
      if (onNavigateApp) onNavigateApp();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-[#18181B] font-sans antialiased selection:bg-[#0B4FE2] selection:text-white p-3 sm:p-6 lg:p-8">
      {/* Container Utama: Frame App Bersih Super-Ellipse */}
      <div className="max-w-7xl mx-auto bg-[#FAFAF8] rounded-3xl border border-[#DCD6CD] shadow-sm overflow-hidden flex flex-col">
        
        {/* ===================================================================== */}
        {/* 1. NAVBAR WOOT UI                                                     */}
        {/* ===================================================================== */}
        <header className="px-6 py-5 border-b border-[#E4E4E7] flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0B4FE2] text-white flex items-center justify-center font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Righteous'] text-2xl text-[#0B4FE2] tracking-tight">SIPESAND</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest border-l border-zinc-200 pl-2">
                Digital Boarding School
              </span>
            </div>
          </div>

          {/* Links Navigasi */}
          <div className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-600">
            <a href="#fitur" className="hover:text-[#0B4FE2] transition-colors">Fitur Utama</a>
            <a href="#solusi" className="hover:text-[#0B4FE2] transition-colors">Solusi Lembaga</a>
            <button 
              onClick={onNavigatePricing} 
              className="hover:text-[#0B4FE2] transition-colors font-bold text-left"
            >
              Paket & Biaya
            </button>
            <button 
              onClick={onNavigateMitra} 
              className="hover:text-[#0B4FE2] transition-colors font-bold text-left text-zinc-500"
            >
              Portal Mitra Dev
            </button>
          </div>

          {/* Tombol Akses Pintu Masuk */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigatePricing}
              className="hidden sm:inline-flex px-4 py-2 text-xs font-bold text-zinc-700 hover:text-[#0B4FE2] transition-colors"
            >
              Daftar Pesantren
            </button>
            <button
              onClick={onNavigateApp}
              className="px-5 py-2.5 rounded-full bg-[#0B4FE2] text-white hover:bg-blue-700 font-bold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <span>Masuk ke App Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 2. HERO SECTION: WOOT DUAL-SPLIT (BIRU KOBALT + HIJAU NEON)          */}
        {/* ===================================================================== */}
        <section className="p-4 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* HERO PANEL KIRI: ELECTRIC COBALT BLUE (#0B4FE2) */}
            <div className="lg:col-span-7 bg-[#0B4FE2] text-white rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md relative overflow-hidden">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#98F51F] text-[11px] font-black uppercase tracking-wider mb-6 border border-white/15">
                  Ekosistem Multi-Tenant Pesantren Indonesia
                </div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] mb-4 text-white">
                  Sistem ERP Pesantren{' '}
                  <span className="relative inline-block px-1">
                    <span className="relative z-10 text-white">Terpadu & Modern</span>
                    <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#98F51F] -z-0" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                      <path d="M2 9.5C50 2 150 2 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-white/90 font-medium max-w-xl leading-relaxed mb-8">
                  Solusi digitalisasi tata kelola syahriyah SPP, kantin uang saku cashless, perizinan kamtib santri, dan portal mandiri wali santri tanpa password.
                </p>
              </div>

              <div>
                {/* Search Capsule Bar Khas Woot */}
                <form onSubmit={handleSearchSubmit} className="mb-4">
                  <div className="relative flex items-center bg-white rounded-full p-1.5 shadow-lg border border-white/20">
                    <div className="pl-4 pr-2 text-zinc-400">
                      <Search className="w-4 h-4 text-zinc-500" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari nama pesantren atau masukkan subdomain..."
                      className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 font-semibold focus:outline-none py-2"
                    />
                    <button
                      type="submit"
                      className="w-10 h-10 rounded-full bg-[#98F51F] text-black hover:bg-[#86dc16] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-sm"
                      title="Cari Lembaga"
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

                {/* 3 Tag Keunggulan Sistem */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/90 border border-white/15">
                    Database Cloud Terisolasi Mandiri
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/90 border border-white/15">
                    Subdomain Khusus Lembaga
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-[11px] font-bold text-white/90 border border-white/15">
                    Akses Multi-Role Staf
                  </span>
                </div>
              </div>
            </div>

            {/* HERO PANEL KANAN: NEON LIME (#98F51F) */}
            <div className="lg:col-span-5 bg-[#98F51F] text-[#18181B] rounded-3xl p-6 sm:p-10 flex flex-col justify-between shadow-md">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 text-black text-[11px] font-black uppercase tracking-wider mb-6">
                  Solusi Lembaga Siap Pakai
                </div>

                <div className="mb-6">
                  <div className="text-4xl sm:text-6xl font-black tracking-tight text-black leading-none mb-2">
                    100%
                  </div>
                  <p className="text-sm sm:text-base font-black text-black">
                    Transparansi Keuangan & Monitoring Santri
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-zinc-800 font-medium leading-relaxed mb-6">
                  Wali santri dapat memeriksa tagihan SPP dan riwayat saldo uang saku santri kapan saja cukup dengan nomor induk santri, tanpa perlu mengingat kata sandi.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={onNavigatePricing}
                  className="w-full py-4 rounded-2xl bg-[#18181B] text-white hover:bg-black font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span>Lihat Paket Lisensi & Biaya</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onNavigateApp}
                  className="w-full py-3 rounded-2xl bg-white/60 hover:bg-white text-zinc-900 font-bold text-xs transition-all border border-black/10 flex items-center justify-center gap-2"
                >
                  <span>Sudah Punya Akun? Masuk ke App Hub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. BENTO FITUR UTAMA SISTEM                                           */}
        {/* ===================================================================== */}
        <section id="fitur" className="px-4 sm:px-8 py-10">
          <div className="mb-8">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Modul Unggulan</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-1">
              Didesain Khusus Menjawab Masalah Nyata Pesantren
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Card 1: SPP & Keuangan */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0B4FE2] flex items-center justify-center font-bold mb-4 border border-blue-100">
                  <CreditCard className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#18181B] mb-2">
                  SPP & Syahriyah Online
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Pencatatan tagihan syahriyah bulanan otomatis, penerbitan invoice resmi, dan dukungan pembayaran online via QRIS.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-[#0B4FE2]">
                <span>Modul Bendahara</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 2: Uang Saku & Kantin Cashless */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4 border border-emerald-100">
                  <Wallet className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#18181B] mb-2">
                  Uang Saku Cashless
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Mencegah kehilangan uang santri di asrama. Santri jajan di kantin menggunakan saldo digital yang dipantau orang tua.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
                <span>Modul Kasir Kantin</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 3: Keamanan Kamtib Gerbang */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4 border border-amber-100">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#18181B] mb-2">
                  Perizinan Kamtib Gerbang
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Kontrol keluar-masuk santri dengan surat izin digital. Status kepulangan dan pelanggaran tercatat akurat di pos jaga.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-amber-600">
                <span>Modul Pos Kamtib</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card 4: Portal Wali Santri Passwordless */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between hover:border-zinc-400 transition-all">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-4 border border-purple-100">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-[#18181B] mb-2">
                  Portal Mandiri Wali Santri
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Wali santri tidak perlu menghafal akun/kata sandi. Cukup masukkan NISN untuk memantau tabungan dan membayar tagihan.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-[11px] font-bold text-purple-600">
                <span>Akses Orang Tua</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. SECTION SOLUSI ARSITEKTUR MULTI-TENANT                              */}
        {/* ===================================================================== */}
        <section id="solusi" className="px-4 sm:px-8 py-10 border-t border-[#E4E4E7] bg-white">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Infrastruktur Khusus</span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#18181B] tracking-tight mt-1 mb-3">
              Privasi Mutlak: Database Mandiri untuk Setiap Lembaga
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium">
              Data santri, laporan kas, dan keuangan pondok Anda dipartisi secara ketat. Tidak ada risiko kebocoran data antar-pesantren.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="font-mono text-xs font-black text-[#0B4FE2] mb-1">PINTU 1: SUBDOMAIN KHUSUS</div>
              <h4 className="text-sm font-black text-zinc-900 mb-2">Identitas Digital Mandiri</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Setiap pondok memiliki alamat sendiri seperti <code>darulrahman.sipesand.web.id</code> atau domain sekolah Anda sendiri.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="font-mono text-xs font-black text-[#0B4FE2] mb-1">PINTU 2: MULTI-ROLE ISOLATION</div>
              <h4 className="text-sm font-black text-zinc-900 mb-2">Pemisahan Hak Akses Staf</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Petugas keamanan gerbang hanya mengakses izin santri, sementara bendahara memegang kendali pembukuan kas dan rekening.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
              <div className="font-mono text-xs font-black text-[#0B4FE2] mb-1">PINTU 3: BACKUP CLOUD AMAN</div>
              <h4 className="text-sm font-black text-zinc-900 mb-2">Perlindungan Data 24/7</h4>
              <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                Pencadangan database harian otomatis dengan enkripsi data terstandarisasi industri cloud modern.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. BANNER CTA BERLANGGANAN (WOOT STYLE)                               */}
        {/* ===================================================================== */}
        <section className="p-4 sm:p-8">
          <div className="bg-[#18181B] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="max-w-xl">
              <span className="px-3 py-1 rounded-full bg-[#98F51F] text-black text-[10px] font-black uppercase tracking-wider">
                Mulai Digitalisasi Sekarang
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight mt-3 mb-2 text-white">
                Siap Meningkatkan Tata Kelola Pesantren Anda?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 font-medium leading-relaxed">
                Pilih paket lisensi yang sesuai dengan jumlah santri lembaga Anda. Proses registrasi cepat dan langsung aktif dalam hitungan menit.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={onNavigatePricing}
                className="px-6 py-4 rounded-2xl bg-[#98F51F] text-[#18181B] hover:bg-[#86dc16] font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Pilih Paket & Biaya Lisensi</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <button
                onClick={onNavigateApp}
                className="px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>Login Operator App Hub</span>
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 6. FOOTER RESMI                                                       */}
        {/* ===================================================================== */}
        <footer className="mt-auto px-6 py-8 border-t border-[#E4E4E7] bg-white text-xs text-zinc-500">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#0B4FE2] text-white flex items-center justify-center font-bold text-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-['Righteous'] text-lg text-[#0B4FE2]">SIPESAND</span>
              <span className="text-zinc-400">| Solusi Digitalisasi Pesantren Indonesia</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold">
              <button onClick={onNavigatePricing} className="hover:text-[#0B4FE2] transition-colors">
                Paket Lisensi
              </button>
              <button onClick={onNavigateApp} className="hover:text-[#0B4FE2] transition-colors">
                Gerbang App Hub
              </button>
              <button onClick={onNavigateMitra} className="hover:text-[#0B4FE2] transition-colors">
                Mitra Developer HQ
              </button>
              <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="hover:text-[#0B4FE2] transition-colors">
                WhatsApp Bantuan
              </a>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-400">
            <p>© 2026 SIPESAND. Hak Cipta Dilindungi.</p>
            <p>Platform Multi-Tenant Terdistribusi Cloud</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
