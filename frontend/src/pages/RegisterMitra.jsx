import React, { useState } from 'react';
import { 
  Building2, 
  Globe, 
  User, 
  Mail, 
  Phone, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Radio, 
  CreditCard, 
  Zap, 
  ArrowLeft,
  Server,
  Layers,
  HelpCircle
} from 'lucide-react';
import { registerMitraTenant } from '../services/api';
import PaymentCheckout from '../components/PaymentCheckout';
import AestheticToast from '../components/AestheticToast';

export default function RegisterMitra({ onBackToLanding, onGoToTenant }) {
  // Form State
  const [formData, setFormData] = useState({
    namaPondok: '',
    subdomain: '',
    namaPengelola: '',
    email: '',
    noWhatsapp: '',
    packageType: 'TAHUNAN', // 'TAHUNAN' | 'LIFETIME'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);

  // Toast Notification
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const handleSubdomainChange = (e) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, subdomain: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.namaPondok || !formData.subdomain || !formData.namaPengelola || !formData.email || !formData.noWhatsapp) {
      setErrorMsg('Semua field wajib diisi lengkap.');
      return;
    }

    if (formData.subdomain.length < 3) {
      setErrorMsg('Subdomain minimal 3 karakter.');
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
          title: 'Invoice Pendaftaran Dibuat',
          message: 'Silakan selesaikan pembayaran lisensi melalui QRIS atau Virtual Account.'
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

  // =========================================================================
  // JIKA SUDAH DISUBMIT: TAMPILKAN CHECKOUT PAYMENT GATEWAY
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
              <span>Kembali ke Formulir</span>
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
      </div>
    );
  }

  // =========================================================================
  // TAMPILAN FORMULIR PENDAFTARAN MITRA B2B (BENTO GRID + SOFT GLASS)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs">
      
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 font-bold text-xs"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
            <div>
              <h1 className="font-black text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>Pendaftaran Kemitraan Pesantren</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded-full font-extrabold uppercase">B2B SaaS</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Powered by King Digital Dev (kingdigitalpremium.my.id)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">Aktivasi Instan & Auto-Provisioning</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Digitalisasi Pesantren Mandiri & Terisolasi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Miliki Platform SiPesand dengan Subdomain Khusus Pesantren Anda
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Dapatkan sistem manajemen terpadu (KTSD Smart NFC, Tagihan Syahriyah Hijriyah, Kas Umum, Pos Perizinan, dan Portal Wali) dalam satu platform instan.
          </p>
        </div>

        {/* Bento Grid Form & Features */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Kolom Kiri (7/12): Formulir Pendaftaran Mitra */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Formulir Pendaftaran Mitra Pesantren</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">Isi data identitas pondok dan kontak pengelola</p>
              </div>
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* 1. Nama Pondok */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pondok Pesantren *</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pondok Pesantren Al-Hikmah Modern"
                    value={formData.namaPondok}
                    onChange={(e) => setFormData({ ...formData, namaPondok: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* 2. Subdomain Khusus */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Subdomain Platform yang Diinginkan *</label>
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="alhikmah"
                      value={formData.subdomain}
                      onChange={handleSubdomainChange}
                      className="w-full pl-10 pr-3 py-2.5 border border-r-0 border-slate-300 rounded-l-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-mono font-bold text-blue-700"
                    />
                  </div>
                  <span className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-r-xl font-mono text-slate-600 font-bold text-xs">
                    .sipesand.com
                  </span>
                </div>
                {formData.subdomain && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tautan Login Anda: <strong>https://{formData.subdomain}.sipesand.com</strong></span>
                  </div>
                )}
              </div>

              {/* 3. Nama Pengelola */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pimpinan / Pengelola Pesantren *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: K.H. Ahmad Fauzi, M.Pd."
                    value={formData.namaPengelola}
                    onChange={(e) => setFormData({ ...formData, namaPengelola: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* 4. Email Aktif & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Aktif Pengelola *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="admin@pesantren.sch.id"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Kredensial Super Admin dikirim ke email ini.</span>
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
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Pilihan Paket Lisensi */}
              <div className="pt-2">
                <label className="block font-bold text-slate-700 mb-2">Pilih Paket Lisensi Platform:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Paket Tahunan */}
                  <div
                    onClick={() => setFormData({ ...formData, packageType: 'TAHUNAN' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.packageType === 'TAHUNAN'
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Paket Lisensi Tahunan</span>
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded font-bold text-[9px]">Populer</span>
                    </div>
                    <div className="font-black text-base text-blue-700 font-mono">Rp 1.500.000 <span className="text-[10px] font-sans text-slate-500 font-normal">/ tahun</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">Database instans terisolasi, KTSD Smart NFC, Portal Wali, & Update fitur 1 tahun.</p>
                  </div>

                  {/* Paket Lifetime */}
                  <div
                    onClick={() => setFormData({ ...formData, packageType: 'LIFETIME' })}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      formData.packageType === 'LIFETIME'
                        ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-slate-900 text-xs">Paket Lifetime Selamanya</span>
                      <span className="px-2 py-0.5 bg-amber-400 text-slate-950 rounded font-bold text-[9px]">Hemat</span>
                    </div>
                    <div className="font-black text-base text-slate-900 font-mono">Rp 3.500.000 <span className="text-[10px] font-sans text-slate-500 font-normal">sekali bayar</span></div>
                    <p className="text-[10px] text-slate-500 mt-1">Lisensi permanen seumur hidup tanpa biaya tahunan + support prioritas.</p>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs mt-4"
              >
                {loading ? 'Membuat Invoice Payment Gateway...' : 'Lanjut ke Pembayaran QRIS / Virtual Account'}
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>

          {/* Kolom Kanan (5/12): Bento Info & Keunggulan Platform SaaS */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Bento Card 1: Soft Glassmorphism */}
            <div className="bg-[#EEF4FF]/90 backdrop-blur-md border border-blue-200/70 rounded-3xl p-6 shadow-bento space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">Instans Database Terisolasi</h4>
                  <span className="text-[10px] text-blue-700 font-semibold">100% Aman & Mandiri</span>
                </div>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Setiap pesantren mitra mendapatkan ruang database tersendiri sehingga data santri, kas, dan keuangan tabungan tidak bercampur dengan pesantren lain.
              </p>
            </div>

            {/* Bento Card 2: Fitur Unggulan SiPesand */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3.5">
              <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Fitur Lengkap Langsung Aktif:</span>
              </h4>

              <div className="space-y-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>KTSD Smart NFC Scanner & POS Kantin</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Tagihan Syahriyah Otomatis 1 Hijriyah</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Portal Mandiri Wali Santri & Kwitansi Sah</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Evaluasi Muhafadzoh & Takziran Kamtib</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>Aplikasi Mobile PWA Siap Pasang</span>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Keamanan Kredensial */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" />
                <h4 className="font-bold text-white text-xs">Aktivasi Otomatis Real-Time</h4>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Begitu pembayaran terkonfirmasi via webhook, sistem secara otomatis mengeksekusi seeder Super Admin dan mengirimkan kredensial ke email Anda.
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* Aesthetic Toast Notification */}
      <AestheticToast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
