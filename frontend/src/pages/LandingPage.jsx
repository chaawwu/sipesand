import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  CreditCard, 
  Receipt, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Award,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  BookOpen,
  Wallet,
  Users,
  Calendar,
  Home,
  Package,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Clock
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
  const { settings } = useSettings();
  const [quickQuery, setQuickQuery] = useState('');
  const [trackerSantri, setTrackerSantri] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const namaLembaga = settings?.NAMA_LEMBAGA || 'Pondok Pesantren Terpadu';
  const logoPondok = settings?.LOGO_PONDOK_URL;

  const handleSearchSantri = async (queryInput) => {
    const q = (queryInput || quickQuery).trim();
    if (!q) {
      setSearchError('Ketik Nama Santri atau NIS untuk mengecek status perizinan.');
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
      setSearchError('Koneksi ke database pesantren sedang sibuk.');
    } finally {
      setLoadingSearch(false);
    }
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Bento Fitur Pesantren (8 Modul Utama)
  const bentoFeatures = [
    {
      id: 'akademik',
      icon: BookOpen,
      title: 'Akademik & Muhafadzoh',
      desc: 'Pencatatan setoran hafalan Al-Qur’an (ziyadah & murojaah), evaluasi pengajian kitab kuning, dan rapor pesantren otomatis.',
      tag: 'Kurikulum Pesantren',
      span: 'lg:col-span-4',
    },
    {
      id: 'perizinan',
      icon: ShieldCheck,
      title: 'Perizinan Santri & Kamtib',
      desc: 'Penerbitan surat izin digital, pemantauan batas waktu jam malam, rekam pelanggaran, dan verifikasi penjemputan mahram.',
      tag: 'Keamanan Gerbang',
      span: 'lg:col-span-8',
    },
    {
      id: 'keuangan',
      icon: Receipt,
      title: 'Keuangan & SPP Syahriyah',
      desc: 'Penagihan iuran bulanan kalender Hijriyah/Masehi, kwitansi resmi anti-blank, dan rekonsiliasi buku kas besar bendahara.',
      tag: 'Akuntansi Syariah',
      span: 'lg:col-span-6',
    },
    {
      id: 'tabungan',
      icon: Wallet,
      title: 'Tabungan & Saku Smart NFC',
      desc: 'Kartu santri digital ISO CR-80 untuk transaksi kantin dan koperasi tanpa uang tunai (cashless), aman dari risiko kehilangan.',
      tag: 'Cashless Campus',
      span: 'lg:col-span-6',
    },
    {
      id: 'absensi',
      icon: Calendar,
      title: 'Absensi & Halaqah',
      desc: 'Presensi harian shalat lima waktu berjamaah, taklim madrasah diniyah, dan apel malam asrama berbasis rekap digital.',
      tag: 'Kedisiplinan',
      span: 'lg:col-span-4',
    },
    {
      id: 'portal-wali',
      icon: UserCheck,
      title: 'Portal Mandiri Wali Santri',
      desc: 'Akses transparan tanpa perlu login rumit. Wali santri dapat memantau saldo saku, riwayat perizinan, dan membayar tagihan.',
      tag: 'Layanan Wali',
      span: 'lg:col-span-4',
    },
    {
      id: 'asrama',
      icon: Home,
      title: 'Manajemen Asrama & Kamar',
      desc: 'Inventarisasi kamar hunian santri, kapasitas gedung asrama, struktur rayon, dan pengawasan wali kamar asatidz.',
      tag: 'Tata Kelola Hunian',
      span: 'lg:col-span-4',
    },
  ];

  // FAQ List
  const faqs = [
    {
      q: 'Apakah setiap pesantren mendapatkan subdomain mandiri?',
      a: 'Ya. Setiap pesantren mendapatkan subdomain khusus seperti nama-pondok.sipesand.web.id dengan sertifikat SSL otomatis dan database SQLite terisolasi yang aman.'
    },
    {
      q: 'Bagaimana cara wali santri memantau santri tanpa login?',
      a: 'Wali santri cukup membuka Portal Wali di alamat pesantren, memasukkan Nama Santri atau NIS. Sistem menampilkan status izin keluar, saldo saku, serta tagihan syahriyah secara instan.'
    },
    {
      q: 'Apakah data keuangan dan santri aman dari pesantren lain?',
      a: 'Sangat aman. SIPESAND menerapkan arsitektur Multi-Tenant Dedicated Database, di mana setiap pesantren memiliki file basis data mandiri dan tidak bercampur dengan data pesantren lain.'
    },
    {
      q: 'Apakah SIPESAND mendukung cetak kartu santri fisik & kwitansi?',
      a: 'Ya. Tersedia modul cetak kartu santri KTSD standar perbankan (CR-80) dengan QR Code & NFC, serta cetak bukti pembayaran kwitansi resmi yang rapi.'
    },
    {
      q: 'Berapa biaya berlangganan SIPESAND?',
      a: 'Tersedia Paket Tahunan Rp 1.500.000/tahun dan Paket Lifetime Rp 3.500.000 sekali bayar untuk kepemilikan seumur hidup tanpa biaya langganan bulanan.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-blue-600 selection:text-white text-xs">
      
      {/* ========================================================================= */}
      {/* 1. NAVBAR SATU LAYER (PUTIH BERSIH, SHADOW TIPIS & STICKY)                 */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#E5E7EB] shadow-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo SIPESAND Kiri (Righteous Font) */}
          <div className="flex items-center gap-3">
            {logoPondok ? (
              <img src={logoPondok} alt="Logo" className="w-8 h-8 object-contain" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Righteous'] text-2xl text-[#1D4ED8] tracking-tight">
                  SIPESAND
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] font-bold text-[9px] border border-blue-100">
                  SaaS Pesantren
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block -mt-1">
                Sistem Pesantren Digital Terintegrasi
              </p>
            </div>
          </div>

          {/* Menu Tengah */}
          <nav className="hidden md:flex items-center gap-6 font-semibold text-slate-600 text-xs">
            <button onClick={() => scrollToSection('beranda')} className="hover:text-[#1D4ED8] transition-colors">
              Beranda
            </button>
            <button onClick={() => scrollToSection('fitur')} className="hover:text-[#1D4ED8] transition-colors">
              Fitur
            </button>
            <button onClick={() => scrollToSection('harga')} className="hover:text-[#1D4ED8] transition-colors">
              Harga
            </button>
            <button onClick={() => scrollToSection('demo')} className="hover:text-[#1D4ED8] transition-colors">
              Demo
            </button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-[#1D4ED8] transition-colors">
              Bantuan
            </button>
          </nav>

          {/* Tombol Kanan: Login Pesantren & Mulai Berlangganan */}
          <div className="flex items-center gap-2.5">
            
            <button
              onClick={onLoginPetugas}
              className="px-3.5 sm:px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Login Pesantren</span>
            </button>

            <button
              onClick={onOpenSaasLanding}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold transition-all shadow-subtle flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <span>Mulai Berlangganan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION (POPPINS EXTRABOLD + INTER BODY + ENTERPRISE BENTO)        */}
      {/* ========================================================================= */}
      <section id="beranda" className="pt-12 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-8">
        
        <div className="max-w-3xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] font-semibold text-xs">
            <span className="font-bold">Solusi Digitalisasi Manajemen Pesantren Modern</span>
          </div>

          <h1 className="font-['Poppins'] font-extrabold text-3xl sm:text-5xl lg:text-6xl text-[#111827] tracking-tight leading-[1.15]">
            Sistem Informasi Pesantren Terpadu & Terintegrasi
          </h1>

          <p className="font-['Inter'] text-slate-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Aplikasi manajemen santri, tata kelola perizinan gerbang, penagihan syahriyah kalender Hijriyah, tabungan digital smart, hingga portal wali mandiri dalam satu ekosistem SaaS profesional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            
            <button
              onClick={onOpenSaasLanding}
              className="w-full sm:w-auto px-7 py-3 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl shadow-card transition-all flex items-center justify-center gap-2 text-sm hover:-translate-y-0.5"
            >
              <span>Daftarkan Pesantren Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onOpenPortalWali('')}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl border border-[#E5E7EB] shadow-subtle transition-all flex items-center justify-center gap-2 text-sm"
            >
              <UserCheck className="w-4 h-4 text-[#1D4ED8]" />
              <span>Coba Portal Wali Santri</span>
            </button>

          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-slate-500 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-Tenant Mandiri</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Subdomain Gratis Cloudflare</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tanpa Biaya Server Tambahan</span>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. QUICK SANTRII TRACKER (POS PEMERIKSAAN CEPAT ASATIDZ / SATPAM)           */}
      {/* ========================================================================= */}
      <section id="demo" className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="card-bento p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#E5E7EB]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="font-['Poppins'] font-bold text-base text-[#111827]">
                  Pos Pemeriksaan Status Izin Keluar Santri
                </h3>
              </div>
              <p className="text-slate-500 text-xs pt-0.5">
                Pemeriksaan instan bagi asatidz, pengurus, dan petugas keamanan gerbang pesantren
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] self-start sm:self-auto border border-emerald-200">
              Real-Time Verification
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik Nama Santri atau NIS (contoh: Farhan, Zaid, 202601)..."
                  value={quickQuery}
                  onChange={(e) => {
                    setQuickQuery(e.target.value);
                    setSearchError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSantri()}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                />
              </div>

              <button
                onClick={() => handleSearchSantri()}
                disabled={loadingSearch}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-subtle flex items-center justify-center gap-1.5 flex-shrink-0 text-xs"
              >
                <span>{loadingSearch ? 'Memeriksa...' : 'Cek Status Izin'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {searchError && (
              <p className="text-rose-600 text-xs font-semibold">{searchError}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
              <span>Sampel Cepat:</span>
              <button
                onClick={() => { setQuickQuery('Farhan'); handleSearchSantri('Farhan'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Farhan Kamil
              </button>
              <button
                onClick={() => { setQuickQuery('Zaid'); handleSearchSantri('Zaid'); }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
              >
                Zaid bin Tsabit
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BENTO GRID FITUR SAAS (8 MODUL ENTERPRISE)                              */}
      {/* ========================================================================= */}
      <section id="fitur" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-['Poppins'] font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
            Fitur Lengkap Manajemen Pesantren
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Arsitektur modul komprehensif dirancang khusus untuk memenuhi standar operasional pondok pesantren di Indonesia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {bentoFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                className={`${f.span} card-bento-interactive p-6 sm:p-7 flex flex-col justify-between space-y-4`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px]">
                      {f.tag}
                    </span>
                  </div>

                  <h3 className="font-['Poppins'] font-bold text-base text-[#111827]">
                    {f.title}
                  </h3>

                  <p className="text-slate-500 text-xs leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-1 font-bold text-[#1D4ED8] text-xs">
                  <span>Modul Aktif</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 5. PRICING & PAKET LANGGANAN                                              */}
      {/* ========================================================================= */}
      <section id="harga" className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-['Poppins'] font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
            Paket Lisensi Transparan
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm">
            Investasi teknologi yang terjangkau tanpa biaya server tersembunyi.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          
          {/* Paket Tahunan */}
          <div className="card-bento p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-['Poppins'] font-bold text-sm text-slate-700 uppercase tracking-wider">
                  Paket Tahunan
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-['Poppins'] font-extrabold text-3xl sm:text-4xl text-[#111827]">
                    Rp 1.500.000
                  </span>
                  <span className="text-slate-500 text-xs font-semibold">/ tahun</span>
                </div>
                <p className="text-slate-500 text-xs">Solusi fleksibel per tahun untuk pondok rintisan</p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Subdomain nama-pondok.sipesand.web.id</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Database SQLite Mandiri Terisolasi</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Kapasitas Santri Hingga 1.000 Santri</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Modul Perizinan & Portal Wali Mandiri</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Dukungan Teknis & Pembaruan Sistem</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSaasLanding}
              className="w-full py-3 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-800 font-bold transition-all shadow-subtle text-xs"
            >
              Pilih Paket Tahunan
            </button>
          </div>

          {/* Paket Lifetime (Recommended) */}
          <div className="card-bento p-8 space-y-6 flex flex-col justify-between border-2 border-[#1D4ED8] shadow-card relative">
            
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#1D4ED8] text-white font-bold text-[10px]">
              PALING POPULER
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="font-['Poppins'] font-bold text-sm text-[#1D4ED8] uppercase tracking-wider">
                  Paket Lifetime (Seumur Hidup)
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-['Poppins'] font-extrabold text-3xl sm:text-4xl text-[#111827]">
                    Rp 3.500.000
                  </span>
                  <span className="text-slate-500 text-xs font-semibold">/ sekali bayar</span>
                </div>
                <p className="text-slate-500 text-xs">Investasi sekali untuk kepemilikan selamanya tanpa langganan</p>
              </div>

              <div className="pt-4 border-t border-[#E5E7EB] space-y-3 text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                  <span>Semua Fitur Paket Tahunan Termasuk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                  <span>Lisensi Seumur Hidup (Tanpa Biaya Tahunan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                  <span>Santri Tanpa Batas (Unlimited Santri)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                  <span>Integrasi Payment Gateway Otomatis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                  <span>Prioritas Konsultasi & Setup Tim King Digital Dev</span>
                </div>
              </div>
            </div>

            <button
              onClick={onOpenSaasLanding}
              className="w-full py-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold transition-all shadow-subtle text-xs hover:-translate-y-0.5"
            >
              Ambil Lisensi Lifetime Sekarang
            </button>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 6. TESTIMONI PONDOK MITRA                                                 */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="font-['Poppins'] font-extrabold text-2xl text-[#111827]">
            Dipercaya Pesantren di Indonesia
          </h2>
          <p className="text-slate-500 text-xs">
            Pengalaman nyata pimpinan pondok dalam mengadopsi platform SIPESAND
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-bento p-6 space-y-4">
            <p className="text-slate-600 text-xs italic leading-relaxed">
              "Sebelumnya pencatatan izin santri dan syahriyah sering tercecer. Dengan adanya SIPESAND dan subdomain darulrahman.sipesand.web.id, pengurus kamar dan keamanan gerbang terkoordinasi secara rapi."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1D4ED8] font-bold flex items-center justify-center">
                DR
              </div>
              <div>
                <div className="font-bold text-xs text-[#111827]">Pengasuh Pondok Pesantren</div>
                <div className="text-[10px] text-slate-500">Pondok Pesantren Darul Rahman Sumbersari, Kediri</div>
              </div>
            </div>
          </div>

          <div className="card-bento p-6 space-y-4">
            <p className="text-slate-600 text-xs italic leading-relaxed">
              "Fitur Portal Wali tanpa login sangat memudahkan para orang tua santri yang berada di luar kota untuk memeriksa tabungan santri dan melunasi biaya SPP secara tepat waktu."
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-[#E5E7EB]">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                KD
              </div>
              <div>
                <div className="font-bold text-xs text-[#111827]">Ustadz Bendahara Pondok</div>
                <div className="text-[10px] text-slate-500">Mitra Pesantren Terpadu Jawa Timur</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FAQ ACCORDION                                                          */}
      {/* ========================================================================= */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-1">
          <h2 className="font-['Poppins'] font-extrabold text-2xl text-[#111827]">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-slate-500 text-xs">
            Jawaban lengkap seputar teknologi, keamanan data, dan implementasi
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-bento overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs text-[#111827] flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-[#1D4ED8] flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                )}
              </button>
              {openFaqIndex === idx && (
                <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-[#E5E7EB] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CTA SECTION (CLEAN ENTERPRISE)                                          */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="bg-[#111827] rounded-[20px] p-8 sm:p-12 text-center text-white space-y-6 shadow-card">
          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-['Poppins'] font-extrabold text-2xl sm:text-3xl text-white">
              Siap Mentransformasi Tata Kelola Pesantren Anda?
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed">
              Bergabunglah bersama jaringan pesantren digital. Dapatkan subdomain mandiri, aplikasi siap pakai, dan pelatihan implementasi langsung dari tim pengembang.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenSaasLanding}
              className="w-full sm:w-auto px-7 py-3 bg-[#1D4ED8] hover:bg-blue-600 text-white font-bold rounded-xl shadow-subtle transition-all text-xs"
            >
              Mulai Pendaftaran Tenant
            </button>
            <a
              href="https://wa.me/6285123734342?text=Halo%20King%20Digital%20Dev,%20saya%20tertarik%20dengan%20SaaS%20SIPESAND"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Konsultasi WhatsApp (+62 851-2373-4342)</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FOOTER PROFESIONAL (ALAMAT RESMI & LEGAL LINKS)                         */}
      {/* ========================================================================= */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} onOpenSaas={onOpenSaasLanding} />

      {/* Modals */}
      {isTrackerOpen && trackerSantri && (
        <SantriTrackerModal
          santri={trackerSantri}
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
        />
      )}

      {isMobileModalOpen && (
        <MobileAppInstallModal
          isOpen={isMobileModalOpen}
          onClose={() => setIsMobileModalOpen(false)}
        />
      )}

    </div>
  );
}
