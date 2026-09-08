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
  ChevronRight
} from 'lucide-react';
import { loginUser } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import DeveloperFooter from '../components/DeveloperFooter';

export default function AppGatewayPage({ 
  onLoginSuccess, 
  onBackToLanding, 
  onOpenPortalWali, 
  onOpenSaasLanding,
  onNavigateLegal 
}) {
  const { settings } = useSettings();
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Quick Demo Presets
  const demoAccounts = [
    {
      label: 'Super Admin',
      icon: '👑',
      user: 'admin',
      pass: 'admin123',
      role: 'SUPER_ADMIN',
      name: 'Super Administrator',
      desc: 'Akses penuh seluruh modul'
    },
    {
      label: 'Bendahara',
      icon: '💰',
      user: 'bendahara',
      pass: 'admin123',
      role: 'BENDAHARA',
      name: 'Ustadz Ridwan, S.E. (Bendahara)',
      desc: 'Kelola SPP & Verifikasi Kwitansi'
    },
    {
      label: 'Pengurus Saku',
      icon: '💳',
      user: 'uangsaku',
      pass: 'admin123',
      role: 'PENGURUS_SAKU',
      name: 'Ustadz Ridwan (Pengurus Uang Saku)',
      desc: 'Kasir Kantin & Smart Card NFC'
    },
    {
      label: 'Keamanan (Kamtib)',
      icon: '🛡️',
      user: 'kamtib',
      pass: 'admin123',
      role: 'KEAMANAN',
      name: 'Ustadz Danang (Keamanan)',
      desc: 'Izin Pulang & Absensi Kamtib'
    },
    {
      label: 'Kepala Pondok',
      icon: '📖',
      user: 'pengasuh',
      pass: 'admin123',
      role: 'KEPALA_PONDOK',
      name: 'K.H. Syarif Hidayatullah, M.A.',
      desc: 'Tahfidz 30 Juz & Pengasuhan'
    }
  ];

  const handleSelectDemo = (demo) => {
    setUsername(demo.user);
    setPassword(demo.pass);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Silakan masukkan username dan password');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await loginUser({ 
        username: username.trim(), 
        password: password.trim() 
      });

      if (res.data && res.data.success && res.data.user) {
        onLoginSuccess(res.data.user);
        return;
      }
    } catch (err) {
      // Fallback for static demo environments / offline backend preview
      const foundDemo = demoAccounts.find(d => d.user.toLowerCase() === username.trim().toLowerCase());
      if (foundDemo && (password.trim() === foundDemo.pass || password.trim() === 'admin123' || password.trim() === 'password123')) {
        onLoginSuccess({
          id: 'demo-' + foundDemo.user,
          username: foundDemo.user,
          name: foundDemo.name,
          role: foundDemo.role,
          division: foundDemo.role === 'BENDAHARA' ? 'KEUANGAN' : (foundDemo.role === 'PENGURUS_SAKU' ? 'ASRAMA_POS' : 'PUSAT')
        });
        return;
      }

      setErrorMsg(
        err.response?.data?.message || 
        'Login gagal. Periksa kembali username dan password Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#111827] flex flex-col font-sans selection:bg-[#8CE829] selection:text-[#0A1128]">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Monogram */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors cursor-pointer"
              title="Kembali ke Beranda Utama"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>

            <div className="w-11 h-11 rounded-2xl bg-[#8CE829] flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="SiPesand Logo" 
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  SiPesand
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8CE829]/25 text-slate-900 border border-[#8CE829]/40">
                  Gateway
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-none">
                app.sipesand.web.id
              </p>
            </div>
          </div>

          {/* Quick Subdomain Links & Status */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8CE829]/15 border border-[#8CE829]/30 text-[11px] font-bold text-slate-900">
              <span className="w-2 h-2 rounded-full bg-[#8CE829]" />
              <span>Multi-Tenant Gateway Aktif</span>
            </div>

            {onOpenPortalWali && (
              <button
                onClick={() => onOpenPortalWali('')}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-[#0B52E2] transition-colors cursor-pointer"
              >
                <span>Portal Wali</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. Main Hero & Login Split Container (Woot Aesthetic) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        
        <div className="w-full rounded-[32px] sm:rounded-[44px] overflow-hidden shadow-2xl border border-stone-200/90 grid grid-cols-1 lg:grid-cols-12 bg-white">
          
          {/* LEFT SIDE: ROYAL BLUE EDITORIAL SHOWCASE (7 COLUMNS) */}
          <div className="lg:col-span-7 bg-[#0B52E2] p-8 sm:p-12 lg:p-14 text-white flex flex-col justify-between relative overflow-hidden">

            {/* Top Tag */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/20 border border-white/30 text-xs font-bold text-white">
                <span className="w-2 h-2 rounded-full bg-[#8CE829]" />
                <span>Gerbang Autentikasi Pengurus & Asatidz</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                  Satu Akses Terpadu <br />
                  Seluruh Devisi Pesantren
                </h1>
                <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-lg">
                  Gerbang resmi single sign-on (SSO) untuk dewan asatidz, bendahara keuangan, pengurus saku kantin, kamtib perizinan, dan pengasuh pondok.
                </p>
              </div>
            </div>

            {/* Middle: Feature Highlights List */}
            <div className="relative z-10 my-8 space-y-3 sm:space-y-4">
              
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <div className="w-9 h-9 rounded-xl bg-[#8CE829] text-slate-950 flex items-center justify-center font-bold flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Role-Based Access Control (RBAC)</h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    Otomatis mengarahkan ke antarmuka divisi masing-masing setelah verifikasi kredensial berhasil.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <div className="w-9 h-9 rounded-xl bg-white text-[#0B52E2] flex items-center justify-center font-bold flex-shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">KTSD Smart RFID / NFC Integration</h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    Sinkronisasi instan kartu santri digital untuk absensi perizinan dan kasir saku cashless.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/15 border border-white/20">
                <div className="w-9 h-9 rounded-xl bg-white/20 text-[#8CE829] flex items-center justify-center font-bold flex-shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Keuangan & Kwitansi Resmi Terverifikasi</h3>
                  <p className="text-white/80 text-xs mt-0.5">
                    Rekapitulasi tagihan syahriyah bulanan, mutasi kas buku besar, dan download kwitansi digital.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Security Note */}
            <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-white/70">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#8CE829]" />
                <span>Multi-Tenant SSL 256-Bit Encrypted</span>
              </div>
              <span className="font-mono text-[11px] text-white/60">Node: ID-SBY-01</span>
            </div>

          </div>

          {/* RIGHT SIDE: CLEAN WHITE LOGIN FORM & DEMO PRESETS (5 COLUMNS) */}
          <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-white">
            
            <div className="space-y-6">
              
              {/* Form Title & Tenant Status */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    Masuk ke Sistem
                  </h2>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online" />
                </div>
                <p className="text-stone-500 text-xs mt-1">
                  Masukkan nama pengguna dan kata sandi akun petugas Anda.
                </p>
              </div>

              {/* Active Subdomain Tenant Badge */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0B52E2] flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-stone-500">Lembaga Terhubung:</div>
                    <div className="text-xs font-black text-slate-900 truncate">
                      {namaLembaga}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Valid</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-semibold">{errorMsg}</span>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                {/* Username Input */}
                <div>
                  <label className="block font-bold text-xs text-slate-800 mb-1.5">
                    Username Petugas *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Contoh: admin, bendahara, saku..."
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0B52E2] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-xs text-slate-800">
                      Kata Sandi *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] text-stone-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Sembunyikan</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Lihat Sandi</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 rounded-2xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#0B52E2] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-stone-300 text-[#0B52E2] focus:ring-[#0B52E2]"
                    />
                    <span className="font-medium">Ingat sesi di perangkat ini</span>
                  </label>
                  <span className="text-stone-400 text-[11px]">Bantuan IT? 0812-3456-7890</span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#0B52E2] hover:bg-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* ⚡ Quick Demo Accounts Presets Bar */}
              <div className="pt-4 border-t border-stone-100 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-stone-700">⚡ Akses Cepat Akun Demo (1-Click):</span>
                  <span className="text-stone-400 text-[10px]">Klik untuk isi otomatis</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.user}
                      type="button"
                      onClick={() => handleSelectDemo(account)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        username === account.user
                          ? 'border-[#0B52E2] bg-blue-50/70 text-slate-900 shadow-xs'
                          : 'border-stone-200/80 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <span className="text-base flex-shrink-0">{account.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-xs truncate leading-tight">{account.label}</div>
                        <div className="text-[10px] text-stone-400 font-mono truncate">{account.user} / {account.pass}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Footer Info */}
            <div className="mt-8 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
              <span>SiPesand Multi-Tenant Engine v3.0</span>
              <button
                onClick={onBackToLanding}
                className="text-stone-600 hover:text-[#0B52E2] font-semibold hover:underline cursor-pointer"
              >
                Halaman Utama
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Developer Footer Component */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
