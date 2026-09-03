import React, { useState } from 'react';
import { 
  CreditCard, 
  Receipt, 
  ShieldCheck, 
  Wallet, 
  BookOpen, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ChevronRight, 
  Building2, 
  Printer, 
  Radio, 
  Clock, 
  Calendar, 
  Phone, 
  Check, 
  Lock, 
  Globe, 
  ExternalLink,
  Award,
  Layers,
  Sparkles,
  BarChart3,
  HelpCircle,
  FileText
} from 'lucide-react';

export default function LandingPageEnterprise({ onNavigateApp, onNavigateMitra, onOpenRegisterModal }) {
  const [activePreviewTab, setActivePreviewTab] = useState('kts');
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'

  return (
    <div className="min-h-screen bg-white text-slate-900 font-['Inter',sans-serif] selection:bg-blue-600 selection:text-white antialiased">
      
      {/* ========================================================================= */}
      {/* 1. NAVBAR SEDERHANA & ELEGAN                                              */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo SIPESAND */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-['Righteous'] text-2xl text-blue-600 tracking-tight">SIPESAND</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-2">
                Digital Boarding School
              </span>
            </div>
          </div>

          {/* Navigasi Desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur Utama</a>
            <a href="#solusi" className="hover:text-blue-600 transition-colors">Solusi</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#harga" className="hover:text-blue-600 transition-colors">Biaya Lisensi</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </div>

          {/* CTA Navigasi */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateApp ? onNavigateApp() : (window.location.href = 'https://app.sipesand.web.id')}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Masuk Aplikasi
            </button>
            <button
              onClick={() => onOpenRegisterModal ? onOpenRegisterModal() : (window.location.href = 'https://app.sipesand.web.id?view=register')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Daftar Pesantren</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION & MOCKUP DASHBOARD REALISTIS                              */}
      {/* ========================================================================= */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50/70 via-white to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge Kategori */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>SaaS Enterprise Manajemen Pesantren Terpadu</span>
          </div>

          {/* Headline & Subheadline */}
          <div className="max-w-4xl mx-auto space-y-4">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Transformasi Digital Pesantren Modern. <br className="hidden sm:inline" />
              <span className="text-blue-600">Rapi, Amanah, dan Terkendali.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-normal max-w-2xl mx-auto leading-relaxed">
              Platform cloud terpadu untuk otomasi penagihan syahriyah Hijriyah, transaksi uang saku non-tunai (cashless), buku kas yayasan, dan portal mandiri wali santri.
            </p>
          </div>

          {/* CTA Ganda */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onOpenRegisterModal ? onOpenRegisterModal() : (window.location.href = 'https://app.sipesand.web.id?view=register')}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>Mulai Uji Coba Gratis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <a
              href="#preview"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Lihat Demo Sistem</span>
            </a>
          </div>

          {/* Trust Points */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Standar Kartu CR-80 ISO 14443</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database Terisolasi per Pesantren</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>99.9% Uptime Cloudflare Global Edge</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MOCKUP DASHBOARD REALISTIS (BENTO BROWSER CHROME)                         */}
          {/* ========================================================================= */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="bg-slate-900 rounded-3xl p-2 sm:p-3 shadow-2xl border border-slate-800 text-left">
              
              {/* Window Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                </div>
                <div className="bg-slate-800 px-4 py-1 rounded-lg text-[11px] font-mono text-slate-300 flex items-center gap-1.5 max-w-xs truncate">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>https://darulrahman.sipesand.web.id/admin</span>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold uppercase">Cloud Active</div>
              </div>

              {/* Dashboard Content Mockup */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-6 space-y-5 text-slate-900">
                
                {/* Header Subdomain Pondok */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Portal Resmi Pondok Pesantren</span>
                    <h3 className="font-extrabold text-base text-slate-900">Pondok Pesantren Darul Rahman Sumbersari</h3>
                    <p className="text-xs text-slate-500">Tahun Ajaran 1447–1448 H / 2026–2027 • Status Sistem: Normal</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>324 Santri Aktif</span>
                    </span>
                  </div>
                </div>

                {/* 4 Kartu Metrik Ringkasan */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Kas Masuk Bulan Ini</span>
                    <div className="text-base sm:text-lg font-black text-slate-950">Rp 48.500.000</div>
                    <span className="text-[10px] text-emerald-600 font-bold">↑ 12% Syahriyah</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Perputaran Saku POS</span>
                    <div className="text-base sm:text-lg font-black text-blue-600">Rp 14.820.000</div>
                    <span className="text-[10px] text-slate-500">100% Non-Tunai</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Izin Santri Aktif</span>
                    <div className="text-base sm:text-lg font-black text-amber-600">8 Santri</div>
                    <span className="text-[10px] text-emerald-600 font-bold">0 Terlambat</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Realisasi Tagihan</span>
                    <div className="text-base sm:text-lg font-black text-slate-950">94.2%</div>
                    <span className="text-[10px] text-blue-600 font-bold">Bulan Ramadhan</span>
                  </div>
                </div>

                {/* Split Mockup: Transaksi Saku & Pos Perizinan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  
                  {/* List Transaksi Saku Santri Realtime */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b pb-2">
                      <span>Transaksi Kasir Uang Saku (Kantin/Koperasi)</span>
                      <span className="text-blue-600 text-[10px]">Live Sync</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Muhammad Farhan (XI MA)</div>
                          <div className="text-[10px] text-slate-400">Koperasi Kitab • Tap Kartu NFC</div>
                        </div>
                        <span className="font-bold text-rose-600">- Rp 25.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Ahmad Zaid Al-Faqih (XII MA)</div>
                          <div className="text-[10px] text-slate-400">Kantin Putra • Tap Kartu NFC</div>
                        </div>
                        <span className="font-bold text-rose-600">- Rp 12.000</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Aisyah Nur Ramadhani (XI MA)</div>
                          <div className="text-[10px] text-slate-400">Top-Up Transfer Wali Santri</div>
                        </div>
                        <span className="font-bold text-emerald-600">+ Rp 200.000</span>
                      </div>
                    </div>
                  </div>

                  {/* List Keamanan Kamtib Gerbang */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b pb-2">
                      <span>Pos Kamtib Gerbang (Perizinan Keluar/Masuk)</span>
                      <span className="text-emerald-600 text-[10px]">Real-Time Scan</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">M. Rayhan Syafi'i</div>
                          <div className="text-[10px] text-slate-400">Keperluan: Periksa Medis RSUD</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">IZIN KELUAR</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Fadhil Ramadhan</div>
                          <div className="text-[10px] text-slate-400">Dinas Ekstrakurikuler MQK</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">KEMBALI (TEPAT)</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div>
                          <div className="font-bold text-slate-900">Zulfikar Haris</div>
                          <div className="text-[10px] text-slate-400">Sambangan Keluarga Wali</div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">KEMBALI (TEPAT)</span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. STATISTIK DALAM CARD RAPI (BENTO IMPACT METRICS)                       */}
      {/* ========================================================================= */}
      <section className="py-16 border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">99.4%</div>
              <h4 className="font-bold text-slate-900 text-sm">Ketepatan Waktu Syahriyah</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penagihan berbasis bulan kalender Hijriyah menekan tunggakan hingga ke angka minimal.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">100% Cashless</div>
              <h4 className="font-bold text-slate-900 text-sm">Bebas Risiko Kehilangan Uang</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Santri bertransaksi jajan di kantin menggunakan KTS Smart NFC dengan batas limit harian.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 tracking-tight">&lt; 15 Detik</div>
              <h4 className="font-bold text-slate-900 text-sm">Verifikasi Izin Gerbang</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Proses check-in dan check-out izin santri berlangsung instan tanpa antrean di pos keamanan.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">24/7 Transparan</div>
              <h4 className="font-bold text-slate-900 text-sm">Akses Mandiri Wali Santri</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Orang tua dapat mengecek sisa uang saku, riwayat izin, dan nilai santri langsung dari ponsel.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. FITUR UTAMA DALAM GRID (6 CORE MODULES)                                */}
      {/* ========================================================================= */}
      <section id="fitur" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="max-w-3xl space-y-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Modul Operasional Komprehensif</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Satu Sistem untuk Seluruh Kebutuhan Pengurus, Santri, dan Wali.
            </h2>
            <p className="text-base text-slate-600">
              Dirancang khusus untuk alur kerja pesantren tradisional maupun modern tanpa mengubah tata tertib yang ada.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Modul 1 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kartu Santri (KTS) & POS Cashless</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kartu pintar standar perbankan (CR-80) dengan chip NFC. Melayani transaksi jajan kantin/koperasi, presensi sorogan, dan cetak mandiri 4 tema resmi.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <span>Pelajari KTS Studio</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 2 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Billing Syahriyah Kalender Hijriyah</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penerbitan tagihan bulanan otomatis berdasarkan kalender Islam (Muharram s.d Dzulhijjah), kuitansi pembayaran resmi dengan QR Code verifikasi.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span>Pelajari Auto-Billing</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 3 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Receipt className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Buku Kas Umum & Akuntansi Yayasan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan arus kas masuk dan keluar per divisi (Pendidikan, Kamtib, Logistik, Pengasuhan) lengkap dengan laporan audit keuangan real-time.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                <span>Pelajari Buku Kas</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 4 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Pos Keamanan (Kamtib) & Perizinan</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan izin santri keluar pondok atau pulang ke rumah dengan barcode scan. Deteksi santri terlambat kembali (*overdue*) secara otomatis.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                <span>Pelajari Pos Kamtib</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 5 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Buku Induk & Akademik Muhafadzoh</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pencatatan capaian hafalan Al-Qur'an (Tahfidz), setoran kitab kuning, pembagian santri asuh per ustadz, dan evaluasi berkala pengasuh pusat.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                <span>Pelajari Akademik</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Modul 6 */}
            <div className="p-8 rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all space-y-4 bg-white">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Portal Mandiri Wali Santri</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Portal tanpa aplikasi rumit yang dapat diakses wali santri dari seluruh penjuru kota untuk memantau sisa uang saku, izin, dan pelunasan tagihan.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-teal-600">
                <span>Pelajari Portal Wali</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CARA KERJA 3 LANGKAH (HOW IT WORKS)                                    */}
      {/* ========================================================================= */}
      <section id="cara-kerja" className="py-20 sm:py-28 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Implementasi Cepat</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              3 Langkah Mudah Menuju Pesantren Digital
            </h2>
            <p className="text-sm text-slate-600">
              Tanpa perlu instalasi server rumit atau tim IT khusus. Sistem siap digunakan dalam 1 hari.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Aktivasi Subdomain Pesantren</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Daftarkan pondok Anda dan dapatkan portal mandiri resmi beralamat <code className="text-blue-600 font-bold">namapondok.sipesand.web.id</code> dengan sertifikat SSL HTTPS otomatis.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">Import Santri & Cetak KTS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unggah data induk santri melalui file Excel / form cepat, hubungkan kartu NFC santri, dan cetak kartu fisik standar ATM langsung dari browser.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-4 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Operasional Terpadu & Terkendali</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pengurus asrama, kasir kantin, bendahara, dan petugas kamtib dapat langsung bekerja di modul masing-masing dengan hak akses multi-divisi aman.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PREVIEW DASHBOARD (STUDIO INTERAKTIF)                                  */}
      {/* ========================================================================= */}
      <section id="preview" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Antarmuka Pengguna Kelas Dunia</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Didesain Nyaman, Cepat, dan Ramah Pengguna
            </h2>
            <p className="text-sm text-slate-600">
              Pilih modul di bawah untuk melihat kejelasan tata letak yang dibuat oleh desainer profesional.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActivePreviewTab('kts')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activePreviewTab === 'kts'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Studio Kartu Santri (KTS CR-80)
            </button>
            <button
              onClick={() => setActivePreviewTab('pos')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activePreviewTab === 'pos'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Kasir Uang Saku & POS Kantin
            </button>
            <button
              onClick={() => setActivePreviewTab('syahriyah')}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
                activePreviewTab === 'syahriyah'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Penagihan Syahriyah Hijriyah
            </button>
          </div>

          {/* Interactive Preview Container */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
            {activePreviewTab === 'kts' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Studio Desain & Cetak Kartu Tanda Santri (KTS)</h4>
                    <p className="text-xs text-slate-500">Mendukung 4 tema institusional resmi berstandar ATM perbankan (85.6mm × 54mm).</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                      ISO/IEC 7810
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Tema 1: Klasik Pesantren</span>
                    <p className="text-xs text-slate-600">Latar zamrud ornamen kaligrafi Bismillah dengan lis ganda emas khas pesantren salaf.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Tema 2: Modern Enterprise</span>
                    <p className="text-xs text-slate-600">Tata letak bento asimetris dengan grafis Gold EMV Smart Chip dan logo NFC contactless.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Tema 3: Luxury VIP Edition</span>
                    <p className="text-xs text-slate-600">Latar gelap obsidian mewah dengan pita foil emas metalik diagonal untuk santri berprestasi.</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'pos' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Kasir POS Kantin & Manajemen Uang Saku</h4>
                    <p className="text-xs text-slate-500">Tap kartu santri sekali sentuh, limit belanja harian, dan notifikasi WhatsApp saldo menipis.</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                    Zero Physical Cash
                  </span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  Santri tidak lagi menyimpan uang tunai di asrama yang rentan hilang atau terselip. Setiap transaksi di kantin maupun koperasi terpotong langsung dari saldo cloud santri dan wali santri menerima laporan rekapitulasi transparan.
                </div>
              </div>
            )}

            {activePreviewTab === 'syahriyah' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">Penagihan Syahriyah Kalender Hijriyah</h4>
                    <p className="text-xs text-slate-500">Siklus bulanan berbasis penanggalan Islam dengan bukti kuitansi ber-QR Code.</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                    12 Bulan Hijriyah
                  </span>
                </div>
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  Penerbitan tagihan serentak dapat difilter berdasarkan bulan Hijriyah (Muharram hingga Dzulhijjah), tingkatan kelas, atau asrama santri. Kwitansi resmi otomatis diterbitkan dengan tanda tangan dan stempel digital pengurus yayasan.
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. TESTIMONI OTENTIK                                                      */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dipercaya Pesantren di Indonesia</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Testimoni Pengasuh, Bendahara, dan Wali Santri
            </h2>
            <p className="text-sm text-slate-600">
              Kisah nyata dampak efisiensi dan transparansi setelah menggunakan SIPESAND.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Pengelolaan uang saku kini 100% amanah. Tidak ada lagi keluhan santri kehilangan uang di lemari asrama. Pengurus kamtib juga sangat terbantu saat perizinan keluar."
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                  KH
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">K.H. Syarif Hidayatullah</h4>
                  <p className="text-[11px] text-slate-400">Pengasuh Pondok Pesantren</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Dahulu rekonsiliasi SPP syahriyah memakan waktu berminggu-minggu. Dengan auto-billing Hijriyah SIPESAND, pembukuan kas yayasan selesai secara instan dan rapi."
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  UR
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Ustadz Ridwan, S.E.</h4>
                  <p className="text-[11px] text-slate-400">Bendahara Yayasan Pesantren</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "Sebagai wali santri yang tinggal di luar pulau, saya merasa sangat tenang karena bisa mengecek sisa uang saku anak saya setiap saat lewat Portal Wali di ponsel."
              </p>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-800 font-bold flex items-center justify-center text-xs">
                  SF
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Hj. Siti Fatimah</h4>
                  <p className="text-[11px] text-slate-400">Wali Santri Kelas XI</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SKEMA BIAYA & LISENSI SAAS TRANSPARAN                                  */}
      {/* ========================================================================= */}
      <section id="harga" className="py-20 sm:py-28 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Investasi Berkelanjutan</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Pilihan Paket Fleksibel Sesuai Skala Pesantren
            </h2>
            <p className="text-sm text-slate-600">
              Tanpa biaya tersembunyi. Termasuk pembaruan sistem dan backup cloud berkala.
            </p>

            {/* Toggle Bulanan / Tahunan */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mt-4">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Tagihan Bulanan
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                <span>Tagihan Tahunan</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">Hemat 2 Bulan</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            
            {/* Paket 1: Rintisan */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Komunitas</span>
                <h3 className="text-xl font-extrabold text-slate-900">Pesantren Rintisan</h3>
                <p className="text-xs text-slate-500">Khusus pesantren kecil yang baru memulai digitalisasi.</p>
                <div className="text-3xl font-black text-slate-950">Gratis</div>
                <div className="text-xs text-slate-400 font-medium">Hingga 50 santri terdaftar</div>
                
                <ul className="space-y-2.5 pt-4 text-xs text-slate-600 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Database Santri Mandiri</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Pencatatan Uang Saku Dasar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Subdomain Pesantren</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenRegisterModal ? onOpenRegisterModal() : (window.location.href = 'https://app.sipesand.web.id?view=register')}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
              >
                Mulai Gratis
              </button>
            </div>

            {/* Paket 2: Pro (Paling Populer) */}
            <div className="p-8 rounded-3xl border-2 border-blue-600 bg-white flex flex-col justify-between space-y-6 shadow-xl relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold tracking-wide uppercase">
                Rekomendasi Utama
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Profesional</span>
                <h3 className="text-xl font-extrabold text-slate-900">Pesantren Berkembang</h3>
                <p className="text-xs text-slate-500">Solusi lengkap untuk operasional asrama dan keuangan.</p>
                
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-950">
                    {billingCycle === 'annual' ? 'Rp 408.000' : 'Rp 490.000'}
                  </span>
                  <span className="text-xs text-slate-500">/ bulan</span>
                </div>
                <div className="text-xs text-emerald-600 font-bold">
                  {billingCycle === 'annual' ? 'Ditagih Rp 4.900.000 / tahun' : 'Fleksibel bayar bulanan'}
                </div>

                <ul className="space-y-2.5 pt-4 text-xs text-slate-600 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Kapasitas Santri Tak Terbatas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Studio KTS & Desain Kartu ATM</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Billing Syahriyah Hijriyah Otomatis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Kasir POS Uang Saku & Kantin</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Pos Keamanan Kamtib & Izin Barcode</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Portal Mandiri Wali Santri</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => onOpenRegisterModal ? onOpenRegisterModal() : (window.location.href = 'https://app.sipesand.web.id?view=register')}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Pilih Paket Pro
              </button>
            </div>

            {/* Paket 3: Enterprise */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-white flex flex-col justify-between space-y-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Institusi Besar</span>
                <h3 className="text-xl font-extrabold text-slate-900">Yayasan & Multi-Kampus</h3>
                <p className="text-xs text-slate-500">Kustomisasi mendalam untuk pesantren dengan banyak cabang.</p>
                <div className="text-3xl font-black text-slate-950">Kustom</div>
                <div className="text-xs text-slate-400 font-medium">Sesuai kebutuhan infrastruktur</div>

                <ul className="space-y-2.5 pt-4 text-xs text-slate-600 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Custom Domain Pribadi (.sch.id / .ac.id)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Multi-Kampus & Cabang Yayasan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Integrasi Mesin Cetak PVC & Gate Fisik</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span>Dedicated SLA Support 24/7</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://wa.me/6285123734342?text=Halo%20King%20Digital%20Dev,%20kami%20ingin%20konsultasi%20Paket%20Enterprise%20SIPESAND"
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs text-center transition-colors"
              >
                Hubungi Tim Enterprise
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. CTA AKHIR & FOOTER RESMI                                               */}
      {/* ========================================================================= */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Siap Mewujudkan Pesantren Digital yang Rapi & Mandiri?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah bersama pesantren-pesantren terkemuka yang telah mengoptimalkan transparansi administrasi dan pengelolaan keuangan mereka.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onOpenRegisterModal ? onOpenRegisterModal() : (window.location.href = 'https://app.sipesand.web.id?view=register')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm shadow-lg transition-all"
            >
              Registrasi Pesantren Baru Sekarang
            </button>
            <a
              href="https://wa.me/6285123734342?text=Halo%20King%20Digital%20Dev,%20saya%20ingin%20konsultasi%20SIPESAND"
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm border border-slate-700 transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Konsultasi WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Footer Navigasi & Legal */}
      <footer className="bg-slate-950 text-slate-400 py-16 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Info Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-['Righteous'] text-xl text-white tracking-wide">SIPESAND</span>
                <span className="text-slate-600">|</span>
                <span className="text-blue-500 font-bold text-xs">SaaS Enterprise</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Sistem Informasi Pesantren Digital Terpadu dikembangkan oleh King Digital Dev untuk kemajuan pendidikan Islam di Indonesia.
              </p>
              <div className="text-[11px] text-slate-500">
                Operasional: Kediri & Yogyakarta, Indonesia.
              </div>
            </div>

            {/* Navigasi Produk */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Produk & Fitur</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="#fitur" className="hover:text-white transition-colors">Kartu Santri Smart NFC</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Billing Syahriyah Hijriyah</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Buku Kas Umum Yayasan</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Pos Kamtib Gerbang</a></li>
                <li><a href="#fitur" className="hover:text-white transition-colors">Evaluasi Akademik Tahfidz</a></li>
              </ul>
            </div>

            {/* Portal & Domain */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Ekosistem Subdomain</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="https://sipesand.web.id" className="hover:text-white transition-colors">sipesand.web.id (Landing Page Utama)</a></li>
                <li><a href="https://apps.sipesand.web.id" className="hover:text-white transition-colors">apps.sipesand.web.id (Aplikasi Pesantren)</a></li>
                <li><a href="https://mitra.sipesand.web.id" className="hover:text-white transition-colors">mitra.sipesand.web.id (Portal Mitra & Reseller)</a></li>
                <li><a href="https://darulrahman.sipesand.web.id" className="hover:text-white transition-colors">darulrahman.sipesand.web.id (Portal Resmi Tenant)</a></li>
                <li><a href="https://pay.sipesand.web.id" className="hover:text-white transition-colors">pay.sipesand.web.id (Portal Wali)</a></li>
              </ul>
            </div>

            {/* Informasi Legal iPaymu */}
            <div className="space-y-3">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Legal & Kepatuhan</h4>
              <ul className="space-y-2 text-[11px]">
                <li><a href="/faq" className="hover:text-white transition-colors">Pertanyaan Umum (FAQ)</a></li>
                <li><a href="/terms-and-conditions" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
                <li><a href="/refund-policy" className="hover:text-white transition-colors">Kebijakan Pengembalian Dana</a></li>
                <li><a href="/kontak" className="hover:text-white transition-colors">Hubungi Kami (Kontak Resmi)</a></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <div>
              © 2026 SIPESAND. Seluruh Hak Cipta Dilindungi Undang-Undang. Dikembangkan oleh <strong className="text-white">King Digital Dev</strong>.
            </div>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Status Server: 100% Operational</span>
              <span>•</span>
              <span>Cloudflare Global CDN</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
