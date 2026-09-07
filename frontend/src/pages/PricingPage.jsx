import React, { useState } from 'react';
import {
  Check,
  Building2,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode,
  Globe,
  Users,
  Smartphone,
  Server,
  HelpCircle,
  ArrowLeft,
  Lock,
  CheckCircle2,
  XCircle,
  Copy,
  ExternalLink,
  PhoneCall
} from 'lucide-react';
import { checkSubdomainAvailability, registerMitraTenant } from '../services/api';

export default function PricingPage({ onBackToHome, onNavigateApp }) {
  const [billingCycle, setBillingCycle] = useState('annual'); // 'monthly' | 'annual'
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('mandiri');

  // Form Registration States
  const [namaPondok, setNamaPondok] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [subdomainStatus, setSubdomainStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [namaPengelola, setNamaPengelola] = useState('');
  const [noWhatsapp, setNoWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Cek ketersediaan subdomain
  const handleCheckSubdomain = async (val) => {
    const clean = (val || subdomain).toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    setSubdomain(clean);
    if (!clean || clean.length < 3) {
      setSubdomainStatus(null);
      return;
    }
    setSubdomainStatus('checking');
    try {
      const res = await checkSubdomainAvailability(clean);
      if (res?.data?.available) {
        setSubdomainStatus('available');
      } else {
        setSubdomainStatus('taken');
      }
    } catch {
      setSubdomainStatus('available'); // fallback mock
    }
  };

  const handleOpenRegister = (tierId) => {
    setSelectedTier(tierId);
    setIsRegisterOpen(true);
    setInvoiceResult(null);
    setErrorMessage('');
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    if (!namaPondok.trim() || !subdomain.trim() || !namaPengelola.trim() || !noWhatsapp.trim()) {
      setErrorMessage('Mohon lengkapi semua data wajib pada formulir.');
      return;
    }

    if (subdomainStatus === 'taken') {
      setErrorMessage('Subdomain yang dipilih sudah dipakai. Silakan pilih nama subdomain lain.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const res = await registerMitraTenant({
        namaPondok: namaPondok.trim(),
        subdomain: subdomain.toLowerCase().trim(),
        namaPengelola: namaPengelola.trim(),
        email: email.trim() || `${subdomain}@sipesand.web.id`,
        noWhatsapp: noWhatsapp.trim(),
        packageType: selectedTier.toUpperCase()
      });

      if (res?.data?.success && res?.data?.data) {
        setInvoiceResult(res.data.data);
      } else {
        throw new Error(res?.data?.message || 'Gagal memproses pendaftaran');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Terjadi kesalahan sistem saat mendaftarkan lembaga.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text, field) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // 3 Variasi Paket Berlangganan
  const tiers = [
    {
      id: 'rintisan',
      name: 'Paket Rintisan',
      subtitle: 'Cocok untuk pesantren rintisan & asrama kecil dengan fokus tertib administrasi.',
      priceMonthly: 99000,
      priceAnnual: 950000,
      badge: 'Lembaga Rintisan',
      featured: false,
      capacity: 'Maksimal 150 Santri',
      features: [
        'Kapasitas s/d 150 Santri Aktif',
        'Subdomain Resmi [nama].sipesand.web.id',
        'Pembukuan SPP & Syahriyah Bulanan',
        'Kasir Pencatatan Uang Saku Santri',
        '2 Akun Staf (Super Admin & Bendahara)',
        'Database Cloud Terisolasi Mandiri',
        'Export Laporan Format Excel/PDF',
        'Dukungan Teknis via WhatsApp Komunitas'
      ]
    },
    {
      id: 'mandiri',
      name: 'Paket Mandiri',
      subtitle: 'Pilihan paling populer untuk pondok berkembang yang siap go-digital menyeluruh.',
      priceMonthly: 249000,
      priceAnnual: 2390000,
      badge: 'Paling Populer & Rekomendasi',
      featured: true,
      capacity: 'Maksimal 600 Santri',
      features: [
        'Kapasitas s/d 600 Santri Aktif',
        'Semua fasilitas Paket Rintisan',
        'Portal Wali Santri (Cek Tagihan & Saldo Tanpa Password)',
        'Integrasi QRIS Otomatis untuk Pembayaran SPP',
        'Modul Kamtib & Izin Pulang Santri Gerbang',
        'Dukungan Cetak Kartu Santri & Barcode Digital',
        '6 Akun Staf Khusus Sesuai Divisi',
        'Backup Database Cloud Otomatis Harian',
        'Prioritas Panduan & Pelatihan Staf Gratis'
      ]
    },
    {
      id: 'madani',
      name: 'Paket Madani',
      subtitle: 'Solusi lengkap skala enterprise untuk pesantren besar dan multi-cabang.',
      priceMonthly: 499000,
      priceAnnual: 4790000,
      badge: 'Pesantren Besar & Multi-Kampus',
      featured: false,
      capacity: 'Santri Tanpa Batas (Unlimited)',
      features: [
        'Kapasitas Santri Unlimited Tanpa Batas',
        'Semua fasilitas Paket Mandiri',
        'Dukungan Custom Domain Sendiri (pesantren.sch.id)',
        'WhatsApp Gateway Engine Notifikasi Otomatis',
        'Manajemen Multi-Kampus & Multi-Asrama',
        'Modul Akademik, Tahfidz & Muhafadzoh Kitab',
        'Akun Staf & Pengurus Tanpa Batas',
        'SLA Server 99.9% & Backup Real-time',
        'Dedicated Technical Support 24/7'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-[#18181B] font-sans antialiased selection:bg-[#0B4FE2] selection:text-white p-3 sm:p-6 lg:p-8">
      {/* Frame Dalam Putih Super-Ellipse */}
      <div className="max-w-7xl mx-auto bg-[#FAFAF8] rounded-3xl border border-[#DCD6CD] shadow-sm overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* ===================================================================== */}
        {/* 1. NAVBAR WOOT MINIMALIS                                             */}
        {/* ===================================================================== */}
        <header className="px-6 py-5 border-b border-[#E4E4E7] flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 text-xs font-bold text-[#18181B] hover:text-[#0B4FE2] transition-colors py-2 px-3 rounded-full hover:bg-zinc-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>
            <div className="h-4 w-[1px] bg-zinc-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0B4FE2] text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-['Righteous'] text-xl text-[#0B4FE2] tracking-tight">SIPESAND</span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-bold text-zinc-600">
                Lisensi 2026
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateApp}
              className="px-4 py-2.5 rounded-full bg-[#18181B] text-white hover:bg-black font-bold text-xs transition-all shadow-sm flex items-center gap-2"
            >
              <span>Masuk ke App Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 2. HERO TITLE & BILLING TOGGLE                                        */}
        {/* ===================================================================== */}
        <div className="pt-12 pb-8 px-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#98F51F]/30 border border-[#98F51F] text-[#18181B] text-xs font-black tracking-wide uppercase mb-4">
            Investasi Terjangkau & Transparan
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#18181B] tracking-tight leading-[1.15] mb-4">
            Pilihan Paket Lisensi SIPESAND untuk{' '}
            <span className="relative inline-block px-1">
              <span className="relative z-10 text-[#0B4FE2]">Lembaga Anda</span>
              <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#98F51F] -z-0" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                <path d="M2 9.5C50 2 150 2 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed mb-8 font-medium">
            Tanpa biaya tersembunyi. Database cloud terisolasi per pesantren, tanpa tercampur dengan lembaga lain.
          </p>

          {/* Saklar Bulanan / Tahunan */}
          <div className="inline-flex items-center p-1.5 rounded-full bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-[#18181B] shadow-sm'
                  : 'text-zinc-500 hover:text-[#18181B]'
              }`}
            >
              Langganan Bulanan
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-[#0B4FE2] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-[#18181B]'
              }`}
            >
              <span>Tahunan (Hemat 20%)</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${billingCycle === 'annual' ? 'bg-[#98F51F] text-black' : 'bg-[#98F51F]/40 text-black'}`}>
                GRATIS DOMAIN
              </span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 3. BENTO 3 TIER CARDS                                                 */}
        {/* ===================================================================== */}
        <div className="px-6 pb-14 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {tiers.map((tier) => {
              const price = billingCycle === 'annual' ? tier.priceAnnual : tier.priceMonthly;
              const period = billingCycle === 'annual' ? '/ tahun' : '/ bulan';

              if (tier.featured) {
                // KARTU UTAMA: SOLID ELECTRIC COBALT BLUE (#0B4FE2)
                return (
                  <div
                    key={tier.id}
                    className="relative bg-[#0B4FE2] text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl border-2 border-[#0B4FE2] lg:-translate-y-3 transition-transform"
                  >
                    {/* Badge Rekomendasi */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#98F51F] text-black text-[11px] font-black uppercase tracking-wider shadow-sm">
                      {tier.badge}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4 mt-2">
                        <span className="text-xs font-extrabold uppercase tracking-widest text-[#98F51F]">
                          {tier.name}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-bold border border-white/20">
                          {tier.capacity}
                        </span>
                      </div>

                      <div className="mb-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl sm:text-5xl font-black tracking-tight">
                            Rp {price.toLocaleString('id-ID')}
                          </span>
                          <span className="text-xs font-bold text-white/80">{period}</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <p className="text-[11px] text-[#98F51F] font-bold mt-1">
                            Setara Rp {Math.round(tier.priceAnnual / 12).toLocaleString('id-ID')}/bln (Hemat Rp {((tier.priceMonthly * 12) - tier.priceAnnual).toLocaleString('id-ID')})
                          </p>
                        )}
                        <p className="text-xs text-white/90 font-medium mt-3 leading-relaxed">
                          {tier.subtitle}
                        </p>
                      </div>

                      <div className="h-[1px] bg-white/20 my-6"></div>

                      <div className="space-y-3 mb-8">
                        <p className="text-[11px] font-bold tracking-wider text-white/70 uppercase">Fasilitas yang didapatkan:</p>
                        {tier.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-4 h-4 rounded-full bg-[#98F51F] text-black flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="text-xs text-white/95 font-medium leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenRegister(tier.id)}
                      className="w-full py-4 rounded-2xl bg-[#98F51F] text-[#18181B] hover:bg-[#86dc16] font-black text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Pilih Paket Mandiri</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                );
              }

              // KARTU REGULER: PUTIH BERSIH DENGAN BORDER ZINC
              return (
                <div
                  key={tier.id}
                  className="bg-white rounded-3xl p-8 flex flex-col justify-between border border-[#E4E4E7] shadow-sm hover:border-zinc-400 transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-[#0B4FE2]">
                        {tier.name}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-700 text-[11px] font-bold border border-zinc-200">
                        {tier.capacity}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-[#18181B] tracking-tight">
                          Rp {price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs font-bold text-zinc-500">{period}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                          Setara Rp {Math.round(tier.priceAnnual / 12).toLocaleString('id-ID')}/bln (Hemat Rp {((tier.priceMonthly * 12) - tier.priceAnnual).toLocaleString('id-ID')})
                        </p>
                      )}
                      <p className="text-xs text-zinc-600 font-medium mt-3 leading-relaxed">
                        {tier.subtitle}
                      </p>
                    </div>

                    <div className="h-[1px] bg-zinc-100 my-6"></div>

                    <div className="space-y-3 mb-8">
                      <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">Fasilitas yang didapatkan:</p>
                      {tier.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-4 h-4 rounded-full bg-zinc-100 text-[#0B4FE2] flex items-center justify-center flex-shrink-0 mt-0.5 border border-zinc-200">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="text-xs text-zinc-700 font-medium leading-tight">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenRegister(tier.id)}
                    className="w-full py-3.5 rounded-2xl bg-[#18181B] text-white hover:bg-black font-bold text-xs tracking-wide uppercase transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>Pilih {tier.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4. BENTO MATRIX PERBANDINGAN FITUR                                    */}
        {/* ===================================================================== */}
        <div className="px-6 py-12 border-t border-[#E4E4E7] bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <span className="text-xs font-black text-[#0B4FE2] uppercase tracking-widest">Matriks Detail</span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight mt-1">
                Perbandingan Fasilitas Lengkap
              </h2>
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden shadow-sm text-xs">
              <div className="grid grid-cols-4 bg-zinc-100 p-4 font-black text-[#18181B] border-b border-zinc-200">
                <div>Fitur & Modul</div>
                <div className="text-center">Rintisan</div>
                <div className="text-center text-[#0B4FE2]">Mandiri</div>
                <div className="text-center">Madani</div>
              </div>

              {/* Rows */}
              {[
                { name: 'Kapasitas Santri Aktif', r: '150 Santri', m: '600 Santri', d: 'Unlimited' },
                { name: 'Subdomain *.sipesand.web.id', r: '✓', m: '✓', d: '✓' },
                { name: 'Custom Domain (sch.id / pesantren.id)', r: '-', m: '-', d: '✓ (Termasuk)' },
                { name: 'Portal Mandiri Wali Santri (Passwordless)', r: '-', m: '✓', d: '✓' },
                { name: 'Pembayaran SPP QRIS Otomatis', r: '-', m: '✓', d: '✓' },
                { name: 'Kasir Uang Saku & Kantin Santri', r: '✓', m: '✓', d: '✓' },
                { name: 'Presensi & Keamanan Kamtib Gerbang', r: '-', m: '✓', d: '✓' },
                { name: 'Cetak KTS Digital & Barcode Scan', r: '-', m: '✓', d: '✓' },
                { name: 'WhatsApp Gateway Broadcast', r: '-', m: '-', d: '✓' },
                { name: 'Modul Tahfidz & Muhafadzoh Kitab', r: '-', m: '-', d: '✓' },
                { name: 'Partisi Database Cloud Mandiri', r: '✓', m: '✓', d: '✓' },
                { name: 'Backup Database Otomatis', r: 'Mingguan', m: 'Harian', d: 'Real-time' },
                { name: 'Jumlah Akun Petugas / Staf', r: '2 Akun', m: '6 Akun', d: 'Unlimited' },
              ].map((row, i) => (
                <div key={i} className={`grid grid-cols-4 p-3.5 border-b border-zinc-100 items-center ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/50'}`}>
                  <div className="font-semibold text-zinc-800">{row.name}</div>
                  <div className="text-center font-medium text-zinc-600">{row.r}</div>
                  <div className="text-center font-bold text-[#0B4FE2] bg-blue-50/40 py-1 rounded">{row.m}</div>
                  <div className="text-center font-medium text-zinc-800">{row.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 5. FOOTER SEDERHANA                                                  */}
        {/* ===================================================================== */}
        <footer className="mt-auto px-6 py-6 border-t border-[#E4E4E7] bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Righteous'] text-base text-[#0B4FE2]">SIPESAND</span>
            <span>• Platform Digitalisasi Pesantren Multi-Tenant Indonesia</span>
          </div>
          <div>
            Ada pertanyaan khusus? Hubungi tim kami di{' '}
            <a href="https://wa.me/6281234567890?text=Halo%20Tim%20SIPESAND" target="_blank" rel="noreferrer" className="text-[#0B4FE2] font-bold hover:underline">
              WhatsApp Sales
            </a>
          </div>
        </footer>

      </div>

      {/* ======================================================================= */}
      {/* 6. MODAL PENDAFTARAN & CHECKOUT SUBDOMAIN                               */}
      {/* ======================================================================= */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-zinc-200 shadow-2xl overflow-hidden my-8">
            
            {/* Header Modal */}
            <div className="bg-[#0B4FE2] text-white p-6 relative">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#98F51F]">
                    Formulir Registrasi Lembaga
                  </span>
                  <h3 className="text-xl font-black mt-1">
                    Daftar {tiers.find(t => t.id === selectedTier)?.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsRegisterOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-white/80 mt-2">
                Subdomain instan aktif dengan database terpisah untuk pesantren Anda.
              </p>
            </div>

            {/* Isi Form atau Hasil Invoice */}
            {!invoiceResult ? (
              <form onSubmit={handleSubmitRegistration} className="p-6 space-y-4 text-xs">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium flex items-center gap-2">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Nama Pondok */}
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Nama Lembaga / Pondok Pesantren <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={namaPondok}
                    onChange={(e) => setNamaPondok(e.target.value)}
                    placeholder="Contoh: Pondok Pesantren Darul Ulum"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-zinc-900 font-medium"
                  />
                </div>

                {/* Subdomain Input dengan Live Checker */}
                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Pilih Subdomain Resmi <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex rounded-xl border border-zinc-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#0B4FE2]">
                    <span className="bg-zinc-100 px-3 py-2.5 text-zinc-500 font-mono text-xs border-r border-zinc-200 flex items-center">
                      https://
                    </span>
                    <input
                      type="text"
                      required
                      value={subdomain}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        setSubdomain(val);
                        handleCheckSubdomain(val);
                      }}
                      placeholder="darululum"
                      className="w-full px-3 py-2.5 text-zinc-900 font-mono font-bold focus:outline-none"
                    />
                    <span className="bg-zinc-100 px-3 py-2.5 text-zinc-500 font-mono text-xs border-l border-zinc-200 flex items-center">
                      .sipesand.web.id
                    </span>
                  </div>

                  {/* Status Checker Subdomain */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="text-[11px]">
                      {subdomainStatus === 'checking' && (
                        <span className="text-zinc-500 font-medium">Mengecek ketersediaan subdomain...</span>
                      )}
                      {subdomainStatus === 'available' && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Subdomain tersedia untuk didaftarkan!
                        </span>
                      )}
                      {subdomainStatus === 'taken' && (
                        <span className="text-rose-600 font-bold flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Subdomain sudah dipakai. Pilih nama lain.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pengelola & Kontak */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">
                      Nama Pengelola / Admin <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={namaPengelola}
                      onChange={(e) => setNamaPengelola(e.target.value)}
                      placeholder="Nama Lengkap Ustadz"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-zinc-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-zinc-700 mb-1">
                      Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={noWhatsapp}
                      onChange={(e) => setNoWhatsapp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-zinc-900 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-zinc-700 mb-1">
                    Email Kontak (Opsional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kontak@pesantren.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-zinc-900 font-medium"
                  />
                </div>

                {/* Ringkasan Biaya */}
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-zinc-800">
                      Biaya {billingCycle === 'annual' ? 'Langganan 1 Tahun' : 'Bulan Pertama'}
                    </p>
                    <p className="text-[10px] text-zinc-500">Termasuk partisi cloud & setup otomatis</p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-[#0B4FE2]">
                      Rp {((billingCycle === 'annual'
                        ? tiers.find(t => t.id === selectedTier)?.priceAnnual
                        : tiers.find(t => t.id === selectedTier)?.priceMonthly) || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || subdomainStatus === 'taken'}
                  className="w-full py-3.5 rounded-2xl bg-[#0B4FE2] text-white hover:bg-blue-700 disabled:opacity-50 font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Memproses Pendaftaran...</span>
                  ) : (
                    <>
                      <span>Lanjut ke Pembayaran & Aktivasi Subdomain</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* =============================================================== */
              /* LAYAR INVOICE SUKSES TERBIT                                      */
              /* =============================================================== */
              <div className="p-6 space-y-4 text-xs">
                <div className="text-center pb-3 border-b border-zinc-100">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 stroke-[3]" />
                  </div>
                  <h4 className="text-lg font-black text-[#18181B]">Invoice Berhasil Diterbitkan!</h4>
                  <p className="text-zinc-600 text-xs">
                    Subdomain <span className="font-bold text-[#0B4FE2]">https://{invoiceResult.subdomain}.sipesand.web.id</span> telah dipesan.
                  </p>
                </div>

                {/* Kode Pembayaran & VA */}
                <div className="space-y-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Nomor Pesanan / Order ID:</span>
                    <span className="font-mono font-bold text-zinc-900">{invoiceResult.orderId}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Bank Virtual Account:</span>
                    <span className="font-bold text-zinc-900">{invoiceResult.vaBank || 'Bank Syariah Indonesia'}</span>
                  </div>

                  <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-zinc-200">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-bold">NOMOR VIRTUAL ACCOUNT</span>
                      <span className="font-mono text-base font-black text-[#0B4FE2]">
                        {invoiceResult.vaNumber}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(invoiceResult.vaNumber, 'va')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-[10px] flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedField === 'va' ? 'Tersalin!' : 'Salin VA'}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Total Tagihan:</span>
                    <span className="text-sm font-black text-[#18181B]">
                      Rp {(invoiceResult.amount || 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                  💡 <strong>Informasi Otomatis:</strong> Setelah transfer berhasil, sistem akan mengaktifkan database lembaga Anda. Akun default: username <code>admin</code> / password <code>admin123</code>.
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterOpen(false);
                      onNavigateApp();
                    }}
                    className="w-full py-3 rounded-xl bg-[#0B4FE2] text-white hover:bg-blue-700 font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <span>Buka Gerbang App Hub (app.sipesand.web.id)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
