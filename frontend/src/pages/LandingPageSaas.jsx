import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Lock, 
  Radio, 
  CreditCard, 
  ArrowLeft,
  Server,
  Layers,
  HelpCircle,
  Clock,
  Receipt,
  Smartphone,
  Award,
  ChevronRight,
  ExternalLink,
  DollarSign,
  BookOpen,
  Calendar,
  Wallet,
  FileText,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Sliders,
  Database
} from 'lucide-react';
import { registerMitraTenant, checkSubdomainAvailability, getMitraConfig } from '../services/api';
import PaymentCheckout from '../components/PaymentCheckout';
import AestheticToast from '../components/AestheticToast';
import DeveloperFooter from '../components/DeveloperFooter';

export default function LandingPageSaas({ 
  onBackToPesantrenDemo, 
  onGoToAppGateway, 
  onGoToTenant, 
  onNavigateLegal, 
  onOpenDeveloperPortal,
  onNavigatePillar,
  onNavigateBlog,
  onOpenDeveloperLoginModal 
}) {
  // Form State
  const [formData, setFormData] = useState({
    namaPondok: '',
    subdomain: '',
    namaPengelola: '',
    email: '',
    noWhatsapp: '',
    packageType: 'TAHUNAN', // 'TAHUNAN' | 'LIFETIME'
  });

  const [prices, setPrices] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await getMitraConfig();
        if (res.data?.success && res.data?.data) {
          setPrices({
            tahunanPrice: Number(res.data.data.tahunanPrice),
            lifetimePrice: Number(res.data.data.lifetimePrice)
          });
        }
      } catch (e) {
        setPrices(null);
      }
    };
    fetchPrices();
  }, []);

  // Subdomain Validation State
  const [subdomainStatus, setSubdomainStatus] = useState({
    checked: false,
    checking: false,
    available: null,
    reason: null,
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [activeIllustrationTab, setActiveIllustrationTab] = useState('ktsd');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Debounced Subdomain Availability Check
  useEffect(() => {
    const raw = formData.subdomain.trim();
    if (!raw || raw.length < 3) {
      setSubdomainStatus({
        checked: false,
        checking: false,
        available: null,
        reason: null,
        message: raw.length > 0 && raw.length < 3 ? 'Minimal 3 karakter alfanumerik' : '',
      });
      return;
    }

    setSubdomainStatus(prev => ({ ...prev, checking: true }));
    const timer = setTimeout(async () => {
      try {
        const res = await checkSubdomainAvailability(raw);
        const data = res.data || res;
        if (data && data.success) {
          setSubdomainStatus({
            checked: true,
            checking: false,
            available: Boolean(data.available),
            reason: data.reason || null,
            message: data.message || '',
          });
        }
      } catch (err) {
        setSubdomainStatus({
          checked: true,
          checking: false,
          available: false,
          reason: 'ERROR',
          message: 'Gagal mengecek ketersediaan subdomain.',
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [formData.subdomain]);

  const handleSubdomainChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, subdomain: val });
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('daftar-lisensi');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.namaPondok || !formData.subdomain || !formData.namaPengelola || !formData.email || !formData.noWhatsapp) {
      setErrorMsg('Semua kolom formulir pendaftaran wajib diisi lengkap.');
      return;
    }

    if (formData.subdomain.length < 3) {
      setErrorMsg('Subdomain minimal 3 karakter alfanumerik.');
      return;
    }

    if (subdomainStatus.checked && !subdomainStatus.available) {
      setErrorMsg(`Subdomain "${formData.subdomain}" sudah terdaftar / tidak tersedia. Silakan pilih subdomain lain.`);
      return;
    }

    try {
      setLoading(true);
      const res = await registerMitraTenant(formData);
      const resData = res.data || res;
      if (resData.success && resData.data) {
        setCreatedOrder(resData.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Invoice Lisensi Diterbitkan',
          message: 'Silakan selesaikan pembayaran lisensi melalui QRIS atau Virtual Account BSI.'
        });
      } else if (resData.orderId) {
        setCreatedOrder(resData);
      } else {
        throw new Error(resData.message || 'Gagal memproses pendaftaran mitra.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses pendaftaran mitra.';
      setErrorMsg(msg);
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Pendaftaran Gagal',
        message: msg
      });
    } finally {
      setLoading(false);
    }
  };

  // FAQ Items
  const FAQ_ITEMS = [
    {
      q: 'Bagaimana alur aktivasi setelah pembayaran dikonfirmasi?',
      a: 'Setelah pembayaran QRIS atau Virtual Account terverifikasi, sistem secara otomatis melakukan auto-provisioning database terisolasi untuk pesantren Anda, membuat akun Super Admin, dan mengirimkan kredensial login resmi via email dalam hitungan detik.'
    },
    {
      q: 'Apakah data santri dan keuangan kami aman dan terpisah dari pondok lain?',
      a: 'Sangat aman. Setiap pesantren mendapatkan file database SQLite privat mandiri (multi-tenant isolation). Data keuangan, catatan izin, dan tabungan santri Anda tidak pernah tercampur dengan instans lembaga lain.'
    },
    {
      q: 'Bagaimana cara kerja King Digital Payment Gateway & Auto-Disbursement?',
      a: 'Di menu Pengaturan Lembaga, Anda dapat mengaktifkan Payment Gateway dan mendaftarkan rekening bank yayasan. Saat wali santri membayar syahriyah via QRIS/VA, tagihan langsung terverifikasi lunas secara real-time dan dana otomatis diteruskan ke rekening yayasan tanpa perlu konfirmasi manual.'
    },
    {
      q: 'Apakah aplikasi bisa dipasang di smartphone (Android & iPhone)?',
      a: 'Ya, SiPesand dibangun dengan teknologi Progressive Web App (PWA) responsif yang dapat diinstal langsung ke layar utama ponsel pengurus, wali santri, dan satpam tanpa melalui Play Store yang rumit.'
    },
    {
      q: 'Apakah subdomain yang sudah terdaftar bisa didaftarkan ulang oleh pondok lain?',
      a: 'Tidak bisa. Setiap subdomain yang sudah aktif digunakan (seperti tazakka.sipesand.web.id) terkunci secara permanen dan tidak akan tersedia lagi untuk dipilih oleh pihak lain.'
    }
  ];

  // =========================================================================
  // JIKA FORM SUDAH DISUBMIT: TAMPILKAN CHECKOUT PAYMENT GATEWAY
  // =========================================================================
  if (createdOrder) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => setCreatedOrder(null)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Paket Lisensi</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900">King Digital Dev • SaaS Platform</span>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <PaymentCheckout
            orderData={createdOrder}
            onBackToRegister={() => setCreatedOrder(null)}
            onGoToTenant={onGoToTenant}
          />
        </main>
        <DeveloperFooter onNavigateLegal={onNavigateLegal} />
      </div>
    );
  }

  // =========================================================================
  // LANDING PAGE UTAMA PEMBELIAN LISENSI SAAS SIPESAND (ILUSTRATIF & ELEGAN)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] flex flex-col font-sans text-xs selection:bg-[#0052FF] selection:text-white">
      
      {/* 1. TOP NAVIGATION HEADER (WOOT STYLE) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8CE829] flex items-center justify-center p-2 shadow-sm">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>SiPesand</span>
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#0052FF] text-[10px] rounded-full font-bold border border-blue-200">Platform SaaS</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Ekosistem Pesantren Digital Generasi Baru</p>
            </div>
          </div>

          {/* Quick Anchor Navigation */}
          <nav className="hidden md:flex items-center gap-5 font-bold text-slate-600 text-xs">
            <a href="#fitur" className="hover:text-[#0052FF] transition-colors">Pilihan Modul</a>
            <a href="#daftar-lisensi" className="hover:text-[#0052FF] transition-colors">Paket Lisensi</a>
            <button 
              onClick={() => onNavigatePillar && onNavigatePillar('aplikasi-pesantren')} 
              className="hover:text-[#0052FF] transition-colors font-bold cursor-pointer"
            >
              Aplikasi Pesantren
            </button>
            <button 
              onClick={() => onNavigateBlog && onNavigateBlog()} 
              className="hover:text-[#0052FF] transition-colors font-bold cursor-pointer"
            >
              Pusat Edukasi
            </button>
            <a href="#faq" className="hover:text-[#0052FF] transition-colors">Tanya Jawab</a>
          </nav>

          <div className="flex items-center gap-2.5">
            {/* Tombol Masuk Portal Tenant (app.sipesand.web.id) */}
            <button
              onClick={onGoToAppGateway}
              className="px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors flex items-center gap-1.5 text-xs cursor-pointer border border-slate-200"
              title="Gateway Masuk Tenant Pesantren (app.sipesand.web.id)"
            >
              <User className="w-3.5 h-3.5 text-[#0052FF]" />
              <span className="hidden sm:inline">Masuk Tenant (app)</span>
              <span className="sm:hidden">Masuk</span>
            </button>

            {/* Tombol CTA Pembelian */}
            <button
              onClick={handleScrollToForm}
              className="px-5 py-2 rounded-full bg-slate-950 hover:bg-black text-white font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer text-xs"
            >
              <span>Beli Lisensi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION (SPLIT DUAL-TONE: ROYAL BLUE #0052FF & LIME GREEN #8CE829) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-12 w-full">
        <div className="rounded-[32px] overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12 border border-slate-200/80">
          
          {/* SISI KIRI (7/12): ROYAL BLUE BLOCK */}
          <div className="lg:col-span-7 bg-[#0052FF] p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            
            <div className="space-y-6 relative z-10">
              
              <div className="space-y-3 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-[11px]">
                  <Server className="w-3.5 h-3.5 text-[#8CE829]" />
                  <span>Sistem Pesantren Multi-Tenant Cloud</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12]">
                  Tata Kelola Pesantren <br />
                  <span className="text-white">Terpadu Tanpa Batas</span>
                </h1>

                <p className="text-blue-100 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                  Miliki sistem informasi pesantren mandiri dengan subdomain khusus lembaga, KTSD Smart NFC Cashless, Penagihan 1 Hijriyah, dan auto-disbursement langsung ke rekening yayasan.
                </p>
              </div>

              {/* Floating Pill Search & Subdomain Checker Bar */}
              <div className="bg-white rounded-full p-2 pl-5 shadow-2xl flex items-center gap-2 max-w-xl text-slate-900">
                <Globe className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Cek subdomain pondok..."
                  value={formData.subdomain}
                  onChange={handleSubdomainChange}
                  className="w-full bg-transparent border-none text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
                <span className="hidden sm:inline-block px-3 py-1.5 bg-slate-100 rounded-full text-slate-600 font-mono text-[11px] font-bold flex-shrink-0">
                  .sipesand.web.id
                </span>
                <button
                  onClick={handleScrollToForm}
                  disabled={subdomainStatus.checked && !subdomainStatus.available}
                  className="px-5 py-2.5 bg-[#8CE829] hover:bg-[#7ed321] text-slate-950 font-black rounded-full transition-all flex items-center gap-2 text-xs flex-shrink-0 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <span>Pesan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Subdomain Status Feedback Message */}
              {subdomainStatus.checked && (
                <div className="text-left">
                  {subdomainStatus.available ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-100 border border-emerald-400/40 text-[11px] font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>Subdomain <strong>{formData.subdomain}.sipesand.web.id</strong> tersedia untuk didaftarkan!</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 text-rose-100 border border-rose-400/40 text-[11px] font-medium">
                      <XCircle className="w-4 h-4 text-rose-300" />
                      <span>{subdomainStatus.message}</span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Bottom 3 Feature Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-8 relative z-10 text-[11px]">
              <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#8CE829]" />
                <span>KTSD Smart NFC</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-[#8CE829]" />
                <span>1 Hijriyah Auto-Syahriyah</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#8CE829]" />
                <span>100% Data Privat Terisolasi</span>
              </div>
            </div>

          </div>

          {/* SISI KANAN (5/12): LIME GREEN BLOCK DENGAN SQUIRCLE CARD */}
          <div className="lg:col-span-5 bg-[#8CE829] p-8 sm:p-12 flex flex-col items-center justify-center relative min-h-[380px]">
            
            {/* Centerpiece Squircle Blue Card */}
            <div className="w-56 h-56 rounded-[36px] bg-[#0052FF] shadow-2xl flex flex-col items-center justify-center p-6 text-white text-center transform hover:scale-105 transition-transform duration-300 relative border-4 border-white/20">
              <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center mb-3 p-3">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
              </div>
              <div className="font-black text-xl tracking-tight">SiPesand</div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-blue-200 mt-0.5">SaaS Platform</div>
              <div className="mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] font-bold">
                Cloud v2.0
              </div>
            </div>

            {/* Circular Scroll Down Badge */}
            <div 
              onClick={handleScrollToForm}
              className="absolute top-6 right-6 w-14 h-14 rounded-full bg-slate-950 text-[#8CE829] flex flex-col items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform"
              title="Gulir ke formulir pendaftaran"
            >
              <div className="text-[7px] font-mono font-bold tracking-tighter uppercase">SCROLL</div>
              <ArrowRight className="w-3.5 h-3.5 rotate-90" />
            </div>

          </div>

        </div>
      </section>

      {/* 3. PILIHAN MODUL TERPADU (REFERENSI WOOT: SKETCHED LOOP, SIDEBAR FILTER, & ROUNDED CARDS) */}
      <section id="fitur" className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        
        {/* Section Header dengan Sketched Loop Accent */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Pilihan</span>
              <span className="relative inline-block px-3 py-1">
                <span className="relative z-10 text-slate-950">Modul Terpadu</span>
                {/* Hand-Drawn Sketched Double Oval Loop */}
                <svg className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+10px)] pointer-events-none text-slate-900" viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
                  <path d="M12,30 C12,12 55,6 100,6 C155,6 190,14 190,30 C190,46 145,54 100,54 C45,54 8,46 10,28 C12,14 50,8 90,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Pilar arsitektur digital terintegrasi sesuai alur operasional pesantren modern dan salafiyah.
            </p>
          </div>

          {/* Controls: Circular Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button 
              type="button" 
              onClick={() => setActiveIllustrationTab(prev => prev === 'ktsd' ? 'payment' : prev === 'hijri' ? 'ktsd' : prev === 'kamtib' ? 'hijri' : 'kamtib')}
              className="w-10 h-10 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button 
              type="button" 
              onClick={() => setActiveIllustrationTab(prev => prev === 'ktsd' ? 'hijri' : prev === 'hijri' ? 'kamtib' : prev === 'kamtib' ? 'payment' : 'ktsd')}
              className="w-10 h-10 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Layout: Left Category Menu + Right Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Kolom Kiri (3/12): Kategori Modul dengan Count Pill Badges */}
          <div className="lg:col-span-3 space-y-2">
            
            <button
              onClick={() => setActiveIllustrationTab('ktsd')}
              className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeIllustrationTab === 'ktsd'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span>KTSD Smart NFC</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeIllustrationTab === 'ktsd' ? 'bg-[#8CE829] text-slate-950' : 'bg-emerald-100 text-emerald-800'
              }`}>
                100%
              </span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('hijri')}
              className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeIllustrationTab === 'hijri'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span>Keuangan Syahriyah</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeIllustrationTab === 'hijri' ? 'bg-[#8CE829] text-slate-950' : 'bg-blue-100 text-blue-800'
              }`}>
                Realtime
              </span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('kamtib')}
              className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeIllustrationTab === 'kamtib'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span>Kamtib & Perizinan</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeIllustrationTab === 'kamtib' ? 'bg-[#8CE829] text-slate-950' : 'bg-amber-100 text-amber-800'
              }`}>
                24 Jam
              </span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('payment')}
              className={`w-full p-3 rounded-2xl text-left font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                activeIllustrationTab === 'payment'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80'
              }`}
            >
              <span>Payment Gateway</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeIllustrationTab === 'payment' ? 'bg-[#8CE829] text-slate-950' : 'bg-purple-100 text-purple-800'
              }`}>
                Auto-PG
              </span>
            </button>

          </div>

          {/* Kolom Kanan (9/12): Grid Kartu Modul Rounded-3xl (Woot Style) */}
          <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* KARTU 1: FEATURED CARD (ROYAL BLUE #0052FF) */}
            <div className="rounded-[28px] bg-[#0052FF] text-white p-7 shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden border border-blue-500">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold">Multi-Tenant</span>
                  <span className="px-3 py-1 rounded-full bg-white/15 text-white text-[10px] font-bold">Smart NFC</span>
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-white leading-snug">
                    KTSD Smart RFID & NFC Card
                  </h3>
                  <p className="text-blue-100 text-xs mt-1 leading-relaxed">
                    Santri berbelanja di kantin, koperasi, dan presensi gerbang cukup tap kartu KTSD tanpa uang tunai fisik.
                  </p>
                </div>

                <div className="font-mono text-2xl font-black text-[#8CE829]">
                  100% Cashless
                </div>
              </div>

              <div className="pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-blue-100">
                <div className="flex items-center gap-2 font-bold">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px]">
                    DR
                  </div>
                  <span>Pesantren Terpadu</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#8CE829] text-slate-950 font-bold text-[10px]">
                  Real-Time
                </span>
              </div>
            </div>

            {/* KARTU 2: KEUANGAN SYAHRIYAH (WHITE CARD) */}
            <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">1 Hijriyah</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Auto-Disburse</span>
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 leading-snug">
                    Penagihan Syahriyah Hijriyah
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Terbit massal otomatis setiap awal bulan kalender Hijriyah dengan verifikasi QRIS dinamis & VA BSI.
                  </p>
                </div>

                <div className="font-mono text-2xl font-black text-slate-900">
                  Auto-Reconciled
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <Receipt className="w-4 h-4 text-[#0052FF]" />
                  <span>Kwitansi Berstempel Sah</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  PSAK 109
                </span>
              </div>
            </div>

            {/* KARTU 3: AKADEMIK & MUHAFADZOH (WHITE CARD) */}
            <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Salafiyah</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Takror Malam</span>
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 leading-snug">
                    Akademik Kitab Salaf & Nadzoman
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Setoran hafalan nadzom (Imrithi & Alfiyah Ibnu Malik), musyawarah bahtsul masail, dan takror harian santri.
                  </p>
                </div>

                <div className="font-mono text-2xl font-black text-slate-900">
                  1.000+ Bait Nadzom
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Dewan Asatidz Pengampu</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  Rapor Salaf
                </span>
              </div>
            </div>

            {/* KARTU 4: KAMTIB & PERIZINAN GERBANG (WHITE CARD) */}
            <div className="rounded-[28px] bg-white border border-slate-200/80 p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Gate Scanner</span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Notifikasi WA</span>
                </div>

                <div>
                  <h3 className="text-xl font-black tracking-tight text-slate-900 leading-snug">
                    Keamanan Kamtib & Perizinan
                  </h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    Verifikasi surat izin kepulangan/sambangan santri di pos satpam dengan scanner KTSD anti-overdue.
                  </p>
                </div>

                <div className="font-mono text-2xl font-black text-slate-900">
                  24 Jam Real-Time
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-2 font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Pos Kamtib Gerbang</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px]">
                  Zero Anomaly
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 4. PAKET LISENSI & FORMULIR PENDAFTARAN MITRA */}
      <section id="daftar-lisensi" className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 border-t border-slate-200 space-y-8">
        
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-[#1E3A8A] font-bold text-[10px] uppercase">
            Pendaftaran Mitra Lembaga
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pilih Paket Lisensi & Mulai Gunakan SiPesand
          </h2>
          <p className="text-slate-500 text-xs">
            Isi formulir pendaftaran di bawah ini untuk membuat invoice lisensi dan auto-provisioning database pesantren Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Kolom Kiri (7/12): Form Pendaftaran */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Formulir Pendaftaran Mitra Lembaga</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Kredensial Super Admin akan otomatis dikirimkan ke email Anda</p>
              </div>
              <Building2 className="w-5 h-5 text-[#1E3A8A]" />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nama Pondok */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lembaga / Pondok Pesantren *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pondok Pesantren Modern Darul Ulum"
                    value={formData.namaPondok}
                    onChange={(e) => setFormData({ ...formData, namaPondok: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Subdomain */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Subdomain Khusus yang Diinginkan *</label>
                  {subdomainStatus.checking && (
                    <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Memeriksa...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="darululum"
                      value={formData.subdomain}
                      onChange={handleSubdomainChange}
                      className={`w-full pl-10 pr-3 py-2.5 border border-r-0 rounded-l-xl focus:outline-none text-xs font-mono font-bold ${
                        subdomainStatus.checked && !subdomainStatus.available
                          ? 'border-rose-400 bg-rose-50/40 text-rose-700'
                          : subdomainStatus.checked && subdomainStatus.available
                          ? 'border-emerald-400 bg-emerald-50/40 text-emerald-800'
                          : 'border-slate-300 focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white text-[#1E3A8A]'
                      }`}
                    />
                  </div>
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-r-xl font-mono text-slate-600 font-bold text-xs">
                    .sipesand.web.id
                  </span>
                </div>

                {/* Subdomain Live Status */}
                {subdomainStatus.checked && (
                  <div className="mt-1.5">
                    {subdomainStatus.available ? (
                      <div className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Subdomain <strong>{formData.subdomain}.sipesand.web.id</strong> tersedia!</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                        <span>{subdomainStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nama Pengelola */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Pengasuh / Pimpinan Lembaga *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: K.H. Ahmad Fauzi, M.Pd."
                    value={formData.namaPengelola}
                    onChange={(e) => setFormData({ ...formData, namaPengelola: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Email & WA */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Aktif Pengelola *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="pengasuh@pesantren.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp Aktif *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="081298765432"
                      value={formData.noWhatsapp}
                      onChange={(e) => setFormData({ ...formData, noWhatsapp: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Pilihan Paket */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-2">Pilih Paket Lisensi:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Paket Tahunan */}
                  <div
                    onClick={() => setFormData({ ...formData, packageType: 'TAHUNAN' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.packageType === 'TAHUNAN'
                        ? 'border-[#0052FF] bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Lisensi Tahunan</span>
                      <span className="px-2 py-0.5 bg-[#0052FF] text-white rounded-full font-bold text-[9px]">Pilihan Populer</span>
                    </div>
                    <div className="font-black text-base text-[#0052FF] font-mono">
                      {prices ? `Rp ${prices.tahunanPrice.toLocaleString('id-ID')}` : 'Memuat harga...'} <span className="text-[10px] font-sans text-slate-500 font-normal">/ tahun</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Database mandiri, hingga 1.000 santri, King Digital PG Ready, & Update 1 tahun.</p>
                  </div>

                  {/* Paket Lifetime */}
                  <div
                    onClick={() => setFormData({ ...formData, packageType: 'LIFETIME' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.packageType === 'LIFETIME'
                        ? 'border-[#0052FF] bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Lisensi Lifetime</span>
                      <span className="px-2 py-0.5 bg-[#8CE829] text-slate-950 rounded-full font-bold text-[9px]">Hemat Permanen</span>
                    </div>
                    <div className="font-black text-base text-slate-900 font-mono">
                      {prices ? `Rp ${prices.lifetimePrice.toLocaleString('id-ID')}` : 'Memuat harga...'} <span className="text-[10px] font-sans text-slate-500 font-normal">sekali bayar</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Lisensi permanen tanpa biaya tahunan, kapasitas unlimited santri, & support prioritas.</p>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (subdomainStatus.checked && !subdomainStatus.available)}
                className="w-full py-3.5 bg-[#0052FF] hover:bg-blue-700 text-white font-bold rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-4 cursor-pointer"
              >
                {loading ? 'Membuat Invoice Pembayaran...' : 'Lanjut ke Pembayaran QRIS / Virtual Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Kolom Kanan (5/12): Jaminan & FAQ Interaktif */}
          <div className="md:col-span-5 space-y-4">
            
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="font-extrabold text-white text-xs">Jaminan Layanan SiPesand</h4>
              </div>
              
              <div className="space-y-2.5 text-[11px] text-slate-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>100% Kepemilikan Data:</strong> Data santri sepenuhnya milik lembaga Anda dan dapat diekspor kapan saja.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Auto-Disbursement Aman:</strong> Dana pembayaran wali langsung diteruskan ke rekening yayasan pondok.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Pendampingan Setup:</strong> Konsultasi teknis dan panduan KTSD NFC langsung oleh tim pengembang.</span>
                </div>
              </div>
            </div>

            {/* Accordion Tanya Jawab (FAQ) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <HelpCircle className="w-4 h-4 text-[#1E3A8A]" />
                <span>Pertanyaan yang Sering Diajukan (FAQ)</span>
              </h4>

              <div className="space-y-2">
                {FAQ_ITEMS.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden text-left">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-3 bg-slate-50 hover:bg-slate-100/80 font-bold text-slate-800 text-[11px] flex items-center justify-between transition-colors text-left"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp className="w-3.5 h-3.5 flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="p-3 bg-white text-slate-600 text-[10.5px] leading-relaxed border-t border-slate-200">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 9. MASTER SEO 2026 INTERNAL LINKS & PILLARS SHOWCASE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-200">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#0052FF] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Pilar Solusi Pesantren Indonesia 2026
              </span>
              <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                Eksplorasi Modul & Sistem Pesantren Terpadu
              </h3>
            </div>
            <button
              onClick={() => onNavigateBlog && onNavigateBlog()}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#0052FF] hover:underline cursor-pointer"
            >
              Lihat 100+ Artikel Edukasi <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { slug: 'aplikasi-pesantren', label: 'Aplikasi Pesantren', badge: 'Terbaik 2026' },
              { slug: 'pesantren-digital', label: 'Pesantren Digital', badge: 'Cloud Mandiri' },
              { slug: 'smart-pesantren', label: 'Smart Pesantren', badge: 'IoT & Card' },
              { slug: 'manajemen-pesantren', label: 'Manajemen Pesantren', badge: 'All-in-One' },
              { slug: 'e-pesantren', label: 'E-Pesantren', badge: 'Web & PWA' },
              { slug: 'ppdb-online-pesantren', label: 'PPDB Online Pesantren', badge: 'Pendaftaran' },
              { slug: 'rfid-pesantren', label: 'RFID Pesantren', badge: 'Presensi KTSD' },
              { slug: 'keuangan-pesantren', label: 'Keuangan Pesantren', badge: 'PSAK 109 & QRIS' },
              { slug: 'wali-santri', label: 'Portal Wali Santri', badge: 'Tanpa Install' },
              { slug: 'tahfidz-pesantren', label: 'Tahfidz Digital', badge: 'Mutabaah Hafalan' },
            ].map(item => (
              <button
                key={item.slug}
                onClick={() => onNavigatePillar && onNavigatePillar(item.slug)}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 hover:border-slate-900 hover:shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] transition-all text-left group cursor-pointer"
              >
                <span className="inline-block text-[9px] font-black text-[#0052FF] uppercase tracking-wider mb-1">
                  {item.badge}
                </span>
                <div className="font-extrabold text-xs text-slate-800 group-hover:text-[#0052FF] transition-colors leading-tight">
                  {item.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Aesthetic Toast Notification */}
      <AestheticToast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Footer */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
