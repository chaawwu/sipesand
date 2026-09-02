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
  Sliders
} from 'lucide-react';
import { registerMitraTenant, checkSubdomainAvailability } from '../services/api';
import PaymentCheckout from '../components/PaymentCheckout';
import AestheticToast from '../components/AestheticToast';
import DeveloperFooter from '../components/DeveloperFooter';

export default function LandingPageSaas({ onBackToPesantrenDemo, onGoToTenant, onNavigateLegal }) {
  // Form State
  const [formData, setFormData] = useState({
    namaPondok: '',
    subdomain: '',
    namaPengelola: '',
    email: '',
    noWhatsapp: '',
    packageType: 'TAHUNAN', // 'TAHUNAN' | 'LIFETIME'
  });

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
        if (res.data.success) {
          setSubdomainStatus({
            checked: true,
            checking: false,
            available: res.data.available,
            reason: res.data.reason,
            message: res.data.message,
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
      if (res.data.success) {
        setCreatedOrder(res.data.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Invoice Lisensi Diterbitkan',
          message: 'Silakan selesaikan pembayaran lisensi melalui QRIS atau Virtual Account BSI.'
        });
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs selection:bg-blue-600 selection:text-white">
      
      {/* 1. TOP NAVIGATION HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white font-black shadow-sm">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>SiPesand SaaS Platform</span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] rounded-md font-bold border border-blue-200">Mitra Resmi</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">Pengembang: King Digital Dev (kingdigitalpremium.my.id)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Balik ke Demo Pesantren */}
            <button
              onClick={onBackToPesantrenDemo}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-300 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Lihat Tampilan Demo Aplikasi Pesantren"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Buka Demo Portal Pesantren</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Tombol CTA Pembelian */}
            <button
              onClick={handleScrollToForm}
              className="px-4 py-1.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              <span>Beli Lisensi Web</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. HERO SECTION DENGAN ILUSTRASI ARSITEKTUR PESANTREN DIGITAL */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Kolom Kiri (7/12): Deskripsi & Live Subdomain Validator */}
            <div className="lg:col-span-7 space-y-5 text-left">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[11px]">
                <Server className="w-3.5 h-3.5 text-blue-700" />
                <span>Tata Kelola Lembaga Pesantren Multi-Tenant Cloud</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Miliki Sistem Pesantren Terpadu dengan <span className="text-[#1E3A8A]">Subdomain Khusus</span> & Database Mandiri
              </h1>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
                Solusi manajemen lengkap untuk pondok pesantren: Kartu Santri Digital (KTSD Smart NFC), Penagihan Syahriyah Hijriyah, Portal Wali Mandiri, dan <strong>King Digital Payment Gateway (Auto-Disbursement Langsung ke Rekening Yayasan)</strong>.
              </p>

              {/* Interactive Subdomain Real-Time Validator Form */}
              <div className="bg-white p-4 rounded-2xl border border-slate-300 shadow-sm space-y-2.5 max-w-lg">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-800 text-xs">Cek Ketersediaan Subdomain Lembaga Anda:</label>
                  {subdomainStatus.checking && (
                    <span className="text-[10px] text-blue-600 font-medium flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Mengecek ketersediaan...</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="contoh: darululum"
                      value={formData.subdomain}
                      onChange={handleSubdomainChange}
                      className={`w-full pl-9 pr-2 py-2 border border-r-0 rounded-l-xl focus:outline-none text-xs font-mono font-bold ${
                        subdomainStatus.checked && !subdomainStatus.available
                          ? 'border-rose-400 bg-rose-50/40 text-rose-700'
                          : subdomainStatus.checked && subdomainStatus.available
                          ? 'border-emerald-400 bg-emerald-50/40 text-emerald-800'
                          : 'border-slate-300 focus:ring-1 focus:ring-blue-600 text-[#1E3A8A]'
                      }`}
                    />
                  </div>
                  <span className="px-3 py-2 bg-slate-100 border border-slate-300 text-slate-600 font-mono font-bold text-xs">
                    .sipesand.web.id
                  </span>
                  <button
                    onClick={handleScrollToForm}
                    disabled={subdomainStatus.checked && !subdomainStatus.available}
                    className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-r-xl transition-colors flex items-center gap-1.5 shadow-sm text-xs disabled:opacity-50"
                  >
                    <span>Pesan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subdomain Status Feedback Message */}
                {subdomainStatus.checked && (
                  <div>
                    {subdomainStatus.available ? (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-[11px] font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>Subdomain <strong>https://{formData.subdomain}.sipesand.web.id</strong> tersedia untuk didaftarkan!</span>
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-medium flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{subdomainStatus.message}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3 Key Trust Highlights */}
              <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="font-bold text-slate-900">Database Mandiri</div>
                  <div className="text-slate-500 text-[10px]">100% Data Privat Terisolasi</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="font-bold text-slate-900">Auto-Disbursement</div>
                  <div className="text-slate-500 text-[10px]">Langsung ke Rekening Pondok</div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
                  <div className="font-bold text-slate-900">Aplikasi Mobile</div>
                  <div className="text-slate-500 text-[10px]">PWA Siap Pasang di Ponsel</div>
                </div>
              </div>

            </div>

            {/* Kolom Kanan (5/12): Ilustrasi Vektor Arsitektur Terpadu */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-700" />
                    <span className="font-extrabold text-slate-900 text-xs">Arsitektur Ekosistem Pesantren Digital</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">v2.0</span>
                </div>

                {/* SVG Visual Diagram */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  
                  {/* Central Node */}
                  <div className="p-3 bg-[#1E3A8A] text-white rounded-xl text-center shadow-sm">
                    <div className="font-bold text-xs flex items-center justify-center gap-1.5">
                      <Building2 className="w-4 h-4 text-amber-300" />
                      <span>{formData.namaPondok || 'Pondok Pesantren Anda'}</span>
                    </div>
                    <div className="text-[10px] font-mono text-blue-200 mt-0.5">
                      https://{formData.subdomain || 'nama-pesantren'}.sipesand.web.id
                    </div>
                  </div>

                  {/* 4 Connected Modules Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                      <Radio className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">KTSD Smart NFC</div>
                        <div className="text-slate-400 text-[9px]">Belanja & Presensi</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Tagihan 1 Hijriyah</div>
                        <div className="text-slate-400 text-[9px]">Kwitansi Berstempel</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Pos Kamtib</div>
                        <div className="text-slate-400 text-[9px]">Perizinan Real-Time</div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Auto-Disburse PG</div>
                        <div className="text-slate-400 text-[9px]">Rekening Yayasan</div>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-[11px] text-emerald-900">
                  <span className="font-bold">Status Server Cloud:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tersedia & Siap Digunakan</span>
                  </span>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SHOWCASE 4 MODUL UTAMA DENGAN TAB INTERAKTIF */}
      <section className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-12 space-y-8">
        
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Modul Lengkap Terintegrasi Satu Atap
          </h2>
          <p className="text-slate-500 text-xs">
            Dirancang khusus sesuai alur operasional dan tata tertib pesantren salafiyah maupun modern
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center">
          <div className="bg-slate-200/80 p-1 rounded-2xl flex items-center gap-1 flex-wrap justify-center">
            <button
              onClick={() => setActiveIllustrationTab('ktsd')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeIllustrationTab === 'ktsd' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>KTSD Smart NFC & POS</span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('hijri')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeIllustrationTab === 'hijri' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Tagihan 1 Hijriyah & Portal Wali</span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('kamtib')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeIllustrationTab === 'kamtib' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kamtib & Muhafadzoh</span>
            </button>

            <button
              onClick={() => setActiveIllustrationTab('payment')}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                activeIllustrationTab === 'payment' ? 'bg-white text-[#1E3A8A] shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Payment Gateway & Auto-Disburse</span>
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          
          {activeIllustrationTab === 'ktsd' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase">
                  Modul Smart Cashless
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Kartu Santri Digital (KTSD) & Kasbon Kantin</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Santri dapat bertransaksi belanja kantin, koperasi, dan fotokopi tanpa memegang uang tunai secara fisik. Cukup tap kartu NFC pada terminal kasir pengurus. Studio cetak kartu siap mencetak kartu standar ISO CR-80 dengan 4 tema resmi atau upload template custom dari Canva.
                </p>
                <div className="space-y-2 pt-1 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Batas limit belanja harian santri dapat diatur oleh wali</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pemetaan uang saku per asatidz pembina asrama</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Radio className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Tap Terminal Scanner NFC Aktif</div>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Dukungan RFID Card 13.56MHz Mifare / NFC Phone Reader langsung di peramban tanpa instalasi driver tambahan.
                </p>
              </div>
            </div>
          )}

          {activeIllustrationTab === 'hijri' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-blue-800 font-bold text-[10px] uppercase">
                  Modul Keuangan Syar'i
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Auto-Tagihan 1 Hijriyah & Portal Wali Mandiri</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Penerbitan tagihan Syahriyah bulanan otomatis setiap tanggal 1 pada kalender Hijriyah (Muharram hingga Dzulhijjah). Wali santri dapat mengecek rincian tagihan, melunasi online, dan mengunduh kwitansi resmi berstempel dan bertanda tangan sah secara mandiri tanpa harus login akun.
                </p>
                <div className="space-y-2 pt-1 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Anti-duplikasi tagihan pada periode bulan Hijriyah yang sama</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Kwitansi sah otomatis terbit setelah verifikasi bendahara / PG</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <Receipt className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Portal Terbuka Tanpa Registrasi</div>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Orang tua cukup memasukkan NIS atau Nama Santri untuk melihat seluruh riwayat pembayaran dan status izin keluar.
                </p>
              </div>
            </div>
          )}

          {activeIllustrationTab === 'kamtib' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px] uppercase">
                  Modul Disiplin & Akademik
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">Pos Keamanan Kamtib & Evaluasi Muhafadzoh</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Pos pemeriksaan satpam di gerbang utama untuk memverifikasi surat izin keluar santri, mencatat jam kembali, dan mendeteksi keterlambatan (*overdue*). Dilengkapi pula dengan buku evaluasi hafalan Al-Qur'an dan mutaba'ah yaumiyah santri.
                </p>
                <div className="space-y-2 pt-1 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Status lokasi santri terpantau real-time (Di Asrama / Izin / Overdue)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Catatan takziran edukatif dan buku pelanggaran santri</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Deteksi Cepat Keberadaan Santri</div>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Asatidz dan satpam dapat memeriksa status izin hanya dengan mengetik nama atau scan kartu KTSD di gerbang pondok.
                </p>
              </div>
            </div>
          )}

          {activeIllustrationTab === 'payment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-purple-50 text-purple-800 font-bold text-[10px] uppercase">
                  Modul Pembayaran Otomatis
                </div>
                <h3 className="text-lg font-extrabold text-slate-900">King Digital Payment Gateway (Auto-Disbursement)</h3>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Pesantren dapat mengaktifkan Payment Gateway terintegrasi. Saat wali santri membayar via QRIS dinamis atau Virtual Account bank syariah, dana secara otomatis diteruskan (*auto-disburse*) ke nomor rekening bank resmi yayasan pondok Anda tanpa perlu verifikasi manual oleh bendahara.
                </p>
                <div className="space-y-2 pt-1 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Pilihan rekening penampungan: BSI, BCA, Mandiri, BRI, BNI, Muamalat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span>Dapat diaktifkan atau dinonaktifkan kapan saja di menu Pengaturan</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center mx-auto shadow-sm">
                  <CreditCard className="w-6 h-6 text-amber-300" />
                </div>
                <div className="font-extrabold text-slate-900 text-sm">Settlement Instan Real-Time</div>
                <p className="text-slate-500 text-[11px] max-w-xs mx-auto">
                  Semua transaksi langsung tercatat pada Buku Kas Umum (Ledger) dan kwitansi berstempel digital langsung diterbitkan.
                </p>
              </div>
            </div>
          )}

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
                        ? 'border-[#1E3A8A] bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Lisensi Tahunan</span>
                      <span className="px-2 py-0.5 bg-[#1E3A8A] text-white rounded font-bold text-[9px]">Pilihan Populer</span>
                    </div>
                    <div className="font-black text-base text-[#1E3A8A] font-mono">
                      Rp 1.500.000 <span className="text-[10px] font-sans text-slate-500 font-normal">/ tahun</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Database mandiri, hingga 1.000 santri, King Digital PG Ready, & Update 1 tahun.</p>
                  </div>

                  {/* Paket Lifetime */}
                  <div
                    onClick={() => setFormData({ ...formData, packageType: 'LIFETIME' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.packageType === 'LIFETIME'
                        ? 'border-[#1E3A8A] bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Lisensi Lifetime</span>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-bold text-[9px]">Hemat Permanen</span>
                    </div>
                    <div className="font-black text-base text-slate-900 font-mono">
                      Rp 3.500.000 <span className="text-[10px] font-sans text-slate-500 font-normal">sekali bayar</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Lisensi permanen tanpa biaya tahunan, kapasitas unlimited santri, & support prioritas.</p>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || (subdomainStatus.checked && !subdomainStatus.available)}
                className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-4"
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
