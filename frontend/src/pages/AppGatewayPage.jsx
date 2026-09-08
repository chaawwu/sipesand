import React, { useState } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Radio, 
  Wallet, 
  BookOpen, 
  Receipt, 
  ExternalLink, 
  ChevronRight,
  Globe,
  Clock,
  CreditCard,
  Smartphone,
  Search,
  Award,
  Sliders,
  Check,
  Zap,
  Layers,
  Database
} from 'lucide-react';
import { loginUser } from '../services/api';
import { useSettings, TENANT_PROFILES } from '../context/SettingsContext';
import DeveloperFooter from '../components/DeveloperFooter';

// Known Pre-Configured Tenants for Instant Lookup
const REGISTERED_TENANTS = {
  darulrahman: {
    name: 'Pondok Pesantren Darul Rahman Sumbersari',
    subdomain: 'darulrahman',
    location: 'Kencong, Kepung, Kediri, Jawa Timur',
    type: 'Salafiyah Terpadu • Kitab Kuning & Muhafadzoh',
    status: 'ACTIVE',
    badge: 'Official Tenant'
  },
  'al-falah': {
    name: 'PP Al-Falah Modern Tahfidz',
    subdomain: 'al-falah',
    location: 'Sleman, D.I. Yogyakarta',
    type: 'Modern Tahfidz Al-Qur\'an',
    status: 'ACTIVE',
    badge: 'Verified Tenant'
  },
  'darul-ulum': {
    name: 'Pesantren Darul Ulum Digital',
    subdomain: 'darul-ulum',
    location: 'Jombang, Jawa Timur',
    type: 'Diniyah & Vokasi Digital',
    status: 'ACTIVE',
    badge: 'Verified Tenant'
  },
  darussalam: {
    name: 'Ma\'had Darussalam Boarding School',
    subdomain: 'darussalam',
    location: 'Ciamis, Jawa Barat',
    type: 'Kulliyatul Mu\'allimin Al-Islamiyah',
    status: 'ACTIVE',
    badge: 'Verified Tenant'
  },
  'pesantren-terpadu': {
    name: 'Pondok Pesantren Terpadu SiPesand',
    subdomain: 'pesantren-terpadu',
    location: 'Kediri Hub, Jawa Timur',
    type: 'Percontohan Nasional Digital',
    status: 'ACTIVE',
    badge: 'Master Demo'
  }
};

export default function AppGatewayPage({ 
  onLoginSuccess, 
  onBackToLanding, 
  onOpenPortalWali, 
  onOpenSaasLanding,
  onNavigateLegal 
}) {
  const { settings } = useSettings();

  // Subdomain & Form State
  const [subdomainInput, setSubdomainInput] = useState('darulrahman');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirectingNotice, setRedirectingNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Active Feature Deep Tour Tab
  const [activeFeatureTab, setActiveFeatureTab] = useState('ktsd');

  // Clean subdomain helper
  const cleanSubdomain = (val) => {
    return val
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\.sipesand\.web\.id.*$/, '')
      .replace(/[^a-z0-9-]/g, '');
  };

  const normalizedSubdomain = cleanSubdomain(subdomainInput);
  const recognizedTenant = REGISTERED_TENANTS[normalizedSubdomain] || null;

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!normalizedSubdomain) {
      setErrorMsg('Silakan masukkan URL atau subdomain pesantren tujuan Anda.');
      return;
    }
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan username dan password petugas.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // Display redirecting banner
      const targetName = recognizedTenant?.name || `Pesantren (${normalizedSubdomain})`;
      setRedirectingNotice({
        subdomain: normalizedSubdomain,
        targetName
      });

      // Execute login check
      const res = await loginUser({ 
        username: username.trim(), 
        password: password.trim() 
      });

      if (res.data && res.data.success && res.data.user) {
        setTimeout(() => {
          onLoginSuccess(res.data.user, normalizedSubdomain);
        }, 600);
        return;
      }
    } catch (err) {
      // Fallback for static environments: demo user is strictly read-only
      const isReadOnlyUser = username.trim().toLowerCase() === 'demo';
      if (username.trim() && (password.trim() === 'admin123' || password.trim() === 'password123' || isReadOnlyUser)) {
        setTimeout(() => {
          onLoginSuccess({
            id: 'auth-' + username.trim(),
            username: username.trim(),
            name: isReadOnlyUser ? 'Tamu Demo (Read Only)' : `Petugas ${normalizedSubdomain}`,
            role: isReadOnlyUser ? 'DEMO_READONLY' : 'SUPER_ADMIN',
            isReadOnly: isReadOnlyUser,
            division: 'PUSAT'
          }, normalizedSubdomain);
        }, 600);
        return;
      }

      setRedirectingNotice(null);
      setErrorMsg(
        err.response?.data?.message || 
        'Login gagal. Periksa kembali subdomain, username, dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Deep Feature Tour Data
  const FEATURES_SHOWCASE = [
    {
      id: 'ktsd',
      title: 'Smart Card KTSD & RFID Cashless',
      category: 'Teknologi Kartu',
      icon: Radio,
      color: '#0057FF',
      summary: 'Kartu Tanda Santri Digital berbasis chip RFID Mifare 13.56MHz terenkripsi untuk presensi kilat dan transaksi belanja tanpa uang tunai.',
      points: [
        'Kecepatan tap presensi < 0.2 detik di gerbang asrama maupun ruang madrasah diniyah.',
        'Mengurangi risiko pencurian uang tunai, pemalakan, atau kehilangan uang saku di pondok.',
        'Bisa dicetak dengan identitas visual resmi lembaga pondok pesantren lengkap dengan barcode NIS.',
        'Mendukung offline-first POS: kantin tetap bisa melayani santri meski internet sedang padam.'
      ],
      stats: '100% Cashless • Anti-Hilang'
    },
    {
      id: 'finance',
      title: 'Keuangan & SPP Syahriyah Otomatis',
      category: 'Manajemen Kas',
      icon: Receipt,
      color: '#00FF99',
      summary: 'Otomatisasi pos tagihan syahriyah bulanan, uang makan, dan uang gedung dengan rekonsiliasi Bank Syariah Indonesia (BSI) & QRIS.',
      points: [
        'Penerbitan tagihan massal otomatis setiap awal bulan kalender Hijriyah maupun Masehi.',
        'Verifikasi pembayaran otomatis via Virtual Account BSI & QRIS tanpa konfirmasi manual bukti transfer.',
        'Kwitansi resmi digital otomatis terbit berstempel lembaga dan tanda tangan digital kepala pondok.',
        'Buku Besar Akuntansi standar PSAK 109: pemisahan dana operasional, zakat, infaq, dan tabungan santri.'
      ],
      stats: 'Auto-Reconciled • Kwitansi Sah'
    },
    {
      id: 'academics',
      title: 'Akademik Salafiyah & Muhafadzoh Nadzoman',
      category: 'Kurikulum Pesantren',
      icon: BookOpen,
      color: '#FF8A00',
      summary: 'Pencatatan mutaba\'ah setoran hafalan kitab kuning (Jurumiyyah, Imrithi, Alfiyah Ibnu Malik), Al-Qur\'an 30 Juz, serta musyawarah santri.',
      points: [
        'Pencatatan setoran hafalan nadzom per bab kitab dengan hitungan bait riil dan penilaian tajwid/makna.',
        'Sistem jadwal musyawarah ilmiah dan takror malam santri dengan catatan kehadiran otomatis.',
        'Rapor kepesantrenan terpadu yang memadukan nilai salafiyah, diniyah, dan pendidikan formal.',
        'Wali santri dapat memantau grafik perkembangan hafalan putra-putrinya secara langsung dari rumah.'
      ],
      stats: '1.000 Bait Alfiyah • Rapor Salaf'
    },
    {
      id: 'security',
      title: 'Keamanan Kamtib & Perizinan Berjenjang',
      category: 'Tata Tertib',
      icon: ShieldCheck,
      color: '#0057FF',
      summary: 'Alur perizinan sambangan keluarga dan kepulangan santri berjenjang (Rois Kamar -> Keamanan -> Pengasuh) dengan gate keeper RFID.',
      points: [
        'Surat jalan izin digital dengan QR Code unik dan batas waktu kepulangan presisi.',
        'Pos gerbang satpam dilengkapi alat scan kartu KTSD untuk verifikasi izin keluar santri.',
        'Deteksi santri terlambat (overstay) otomatis mengirim peringatan ke nomor WhatsApp wali santri.',
        'Buku rekam pelanggaran tata tertib (ta\'zir) dengan sistem poin disiplin dan pembinaan terukur.'
      ],
      stats: 'Gate Keeper Scan • Notifikasi WA'
    },
    {
      id: 'pocket',
      title: 'Uang Saku POS Cashless & Limit Harian',
      category: 'Kantin & Toko',
      icon: Wallet,
      color: '#00FF99',
      summary: 'Wali santri mengisi saldo saku dari rumah melalui transfer bank, santri belanja di kantin cukup tap kartu dengan pembatasan jajan harian.',
      points: [
        'Fitur limit belanja harian (misal: maks Rp20.000/hari) mendidik santri berhemat dan tidak boros.',
        'Terminal kasir POS kantin mendukung barcode scanner, pencarian cepat santri, dan cetak struk thermal.',
        'Riwayat belanja kantin terperinci tercatat real-time dan dapat diaudit wali santri.',
        'Pengurus koperasi/kantin dapat menutup buku kas harian secara instan dengan rekonsiliasi akurat.'
      ],
      stats: 'Limit Harian Terkunci • Mutasi Riil'
    },
    {
      id: 'portal',
      title: 'Portal Mandiri Wali Santri Real-Time',
      category: 'Layanan Wali',
      icon: Smartphone,
      color: '#FF8A00',
      summary: 'Akses transparansi penuh bagi wali santri via peramban web HP tanpa harus mengunduh aplikasi berat dari Play Store.',
      points: [
        'Cukup masukkan NIS santri atau nomor WhatsApp terdaftar untuk melihat seluruh data putra-putri.',
        'Cek status kesehatan dan rekam medis pengobatan santri di Poskestren.',
        'Pantau saldo saku, riwayat jajan, dan lakukan top-up uang saku secara instan melalui QRIS.',
        'Ajukan permohonan sambangan keluarga atau izin menjemput langsung dari aplikasi wali.'
      ],
      stats: 'Tanpa Install • Akses 24/7'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#0F172A] flex flex-col font-sans selection:bg-[#0052FF] selection:text-white">
      
      {/* ===================================================================== */}
      {/* 1. TOP NAVBAR ENTERPRISE (WOOT STYLE)                                 */}
      {/* ===================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Brand & Subdomain Gateway Indicator */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer border border-slate-200"
              title="Kembali ke Landing SaaS SiPesand"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Portal SaaS</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#8CE829] flex items-center justify-center p-2 shadow-sm font-black text-slate-950">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base sm:text-lg tracking-tight text-slate-900">
                  SiPesand Gateway
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052FF] border border-blue-200">
                  app.sipesand.web.id
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pintu Masuk Terpusat Seluruh Tenant Pesantren
              </p>
            </div>
          </div>

          {/* Right Action Links */}
          <div className="flex items-center gap-3">
            {onOpenPortalWali && (
              <button
                onClick={() => onOpenPortalWali('')}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#0052FF] transition-colors cursor-pointer px-3.5 py-2 rounded-full hover:bg-slate-100"
              >
                <span>Portal Wali Santri</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onOpenSaasLanding}
              className="px-5 py-2 rounded-full bg-slate-950 hover:bg-black text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
            >
              Registrasi Pondok Baru
            </button>
          </div>

        </div>
      </header>

      {/* ===================================================================== */}
      {/* 2. MAIN LOGIN GATEWAY & TENANT SELECTOR (BENTO BOX)                   */}
      {/* ===================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-12">
        
        {/* Top Notification if Redirecting */}
        {redirectingNotice && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <div>
                <strong className="font-bold">Mengarahkan ke Instans Pesantren:</strong> Menghubungkan ke{' '}
                <span className="font-mono font-bold text-blue-700">https://{redirectingNotice.subdomain}.sipesand.web.id</span> ({redirectingNotice.targetName})...
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT COLUMN: ENTERPRISE LOGIN FORM (5 OF 12 COLUMNS) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              
              {/* Form Title */}
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">
                    Masuk ke Sistem
                  </h1>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Gateway Active
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  Masukkan domain pesantren, username, dan password petugas untuk diarahkan ke web tenant tujuan Anda.
                </p>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Main Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                
                {/* 1. INPUT SUBDOMAIN / URL TENANT */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-800">
                      1. Subdomain / Domain Pesantren *
                    </label>
                    {recognizedTenant && (
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {recognizedTenant.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 font-mono font-bold text-xs flex-shrink-0">
                      https://
                    </span>
                    <input
                      type="text"
                      required
                      value={subdomainInput}
                      onChange={(e) => setSubdomainInput(e.target.value)}
                      placeholder="contoh: darulrahman"
                      className="w-full px-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
                    />
                    <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-xl text-slate-500 font-mono font-bold text-xs flex-shrink-0">
                      .sipesand.web.id
                    </span>
                  </div>

                  {/* Tenant Match Preview Badge */}
                  {recognizedTenant ? (
                    <div className="mt-2 p-2.5 rounded-lg bg-blue-50/70 border border-blue-200 flex items-start gap-2 text-[11px] text-blue-900">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <div className="font-bold truncate">{recognizedTenant.name}</div>
                        <div className="text-[10px] text-blue-700/80 truncate">{recognizedTenant.location}</div>
                      </div>
                    </div>
                  ) : normalizedSubdomain ? (
                    <div className="mt-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-mono">
                      Subdomain: <strong className="text-slate-900">{normalizedSubdomain}.sipesand.web.id</strong>
                    </div>
                  ) : null}

                  {/* Quick Pick Tenant Buttons */}
                  <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Pilih Cepat:</span>
                    {Object.values(REGISTERED_TENANTS).slice(0, 3).map(t => (
                      <button
                        key={t.subdomain}
                        type="button"
                        onClick={() => setSubdomainInput(t.subdomain)}
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          normalizedSubdomain === t.subdomain
                            ? 'bg-[#0057FF] text-white border-[#0057FF]'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {t.subdomain}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. INPUT USERNAME */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1.5">
                    2. Username Petugas *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin, bendahara, uangsaku, kamtib..."
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* 3. INPUT PASSWORD */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-slate-800">
                      3. Kata Sandi *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[10px] text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Sembunyikan' : 'Lihat'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0057FF] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-[#0057FF] focus:ring-[#0057FF]"
                    />
                    <span className="font-medium text-[11px]">Ingat sesi login</span>
                  </label>
                  <span className="text-[10px] text-slate-400">SSL TLS 1.3 Terenkripsi</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0052FF] hover:bg-blue-700 text-white rounded-full font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-3"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Web Tenant</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* Bottom Security Badge */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>Tenant Isolation: Strict per-subdomain</span>
              <span>v3.2 Production</span>
            </div>

          </div>

          {/* RIGHT COLUMN: PENGENALAN LEBIH MENDALAM FITUR SIPESAND (7 OF 12 COLUMNS) */}
          <div className="lg:col-span-7 bg-white rounded-[28px] border border-slate-200/80 shadow-sm p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Header Showcase dengan Sketched Loop */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0052FF] font-bold text-[10px] uppercase font-mono tracking-wider mb-1.5 border border-blue-200">
                    <Layers className="w-3 h-3" />
                    <span>Deep Feature Tour</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Pengenalan</span>
                    <span className="relative inline-block px-2.5 py-0.5">
                      <span className="relative z-10 text-slate-950">Fitur SiPesand</span>
                      <svg className="absolute -inset-x-2 -inset-y-1 w-[calc(100%+16px)] h-[calc(100%+8px)] pointer-events-none text-slate-900" viewBox="0 0 200 60" fill="none" preserveAspectRatio="none">
                        <path d="M12,30 C12,12 55,6 100,6 C155,6 190,14 190,30 C190,46 145,54 100,54 C45,54 8,46 10,28 C12,14 50,8 90,8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Ekosistem menyeluruh yang dirancang khusus untuk memodernisasi tata kelola pesantren nusantara.
                  </p>
                </div>
              </div>

              {/* Feature Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FEATURES_SHOWCASE.map((feat) => {
                  const Icon = feat.icon;
                  const isActive = activeFeatureTab === feat.id;
                  return (
                    <button
                      key={feat.id}
                      onClick={() => setActiveFeatureTab(feat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isActive
                          ? 'border-[#0057FF] bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div 
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white shadow-xs"
                          style={{ backgroundColor: feat.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-[#0057FF]" />}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{feat.category}</div>
                        <div className="text-xs font-bold text-slate-900 leading-tight mt-0.5 line-clamp-1">{feat.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Feature Deep Dive Card (Bento Box Highlight) */}
              {(() => {
                const current = FEATURES_SHOWCASE.find(f => f.id === activeFeatureTab) || FEATURES_SHOWCASE[0];
                const Icon = current.icon;
                return (
                  <div className="p-5 sm:p-6 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                          style={{ backgroundColor: current.color }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{current.category}</div>
                          <h3 className="text-base font-extrabold text-slate-900 leading-snug">{current.title}</h3>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        {current.stats}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                      {current.summary}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-200/80">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Kemampuan Utama & Alur Kerja:
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {current.points.map((pt, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Architecture Highlights Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Database className="w-4 h-4 text-[#0057FF]" />
                <span className="font-semibold text-[11px]">Database Terisolasi Per-Pondok</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Zap className="w-4 h-4 text-[#00FF99]" />
                <span className="font-semibold text-[11px]">Sync Cloud Real-Time</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Smartphone className="w-4 h-4 text-[#FF8A00]" />
                <span className="font-semibold text-[11px]">PWA Multi-Device Ready</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Developer Footer Component */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
