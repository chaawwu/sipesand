import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  User, 
  Key, 
  ArrowRight, 
  ShieldCheck, 
  Globe, 
  Search, 
  ExternalLink, 
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserCheck,
  Radio,
  ChevronRight
} from 'lucide-react';
import { loginUser, getWebPlatformConfig } from '../services/api';
import { firebaseLoginUser } from '../services/firebaseConfig';
import { setActiveTenantId, firestoreVerifyUserLogin } from '../services/firestoreService';

export default function AppGatewayPage({ 
  onLoginSuccess, 
  onOpenPortalWali, 
  onOpenNfcScanner,
  onNavigateLegal
}) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [selectedSubdomain, setSelectedSubdomain] = useState('darulrahman');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchPesantren, setSearchPesantren] = useState('');

  // Konfigurasi Terpusat dari Developer Console (mitra.sipesand.web.id)
  const [gatewayConfig, setGatewayConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('sipesand_web_platform_config');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    getWebPlatformConfig().then(res => {
      if (res?.data?.success && res.data.data) {
        setGatewayConfig(res.data.data);
      }
    }).catch(() => {});
  }, []);

  // Daftar Pesantren Terdaftar untuk Quick Switch Gateway (Dynamic dari Developer Console)
  const defaultPesantrens = [
    {
      subdomain: 'darulrahman',
      name: 'Pondok Pesantren Darul Rahman Sumbersari',
      location: 'Sumbersari, Kencong, Kepung, Kediri',
      adminUser: 'admin',
    },
    {
      subdomain: 'annur',
      name: 'Pondok Pesantren An-Nur',
      location: 'Jawa Timur',
      adminUser: 'admin',
    },
    {
      subdomain: 'alazizi',
      name: 'Pondok Pesantren Al-Azizi',
      location: 'Jawa Tengah',
      adminUser: 'admin',
    },
    {
      subdomain: 'tazakka',
      name: 'Pondok Pesantren Tazakka',
      location: 'Batang, Jawa Tengah',
      adminUser: 'admin',
    },
  ];

  const registeredPesantrens = (gatewayConfig?.featuredPesantrens && gatewayConfig.featuredPesantrens.length > 0)
    ? gatewayConfig.featuredPesantrens
    : defaultPesantrens;

  const filteredList = registeredPesantrens.filter(p => 
    (p.name || '').toLowerCase().includes(searchPesantren.toLowerCase()) ||
    (p.subdomain || '').toLowerCase().includes(searchPesantren.toLowerCase()) ||
    (p.location || '').toLowerCase().includes(searchPesantren.toLowerCase())
  );

  const selectedPesantrenObj = registeredPesantrens.find(p => p.subdomain === selectedSubdomain) || registeredPesantrens[0];

  const handleQuickRole = (roleUser, rolePass) => {
    setUsername(roleUser);
    setPassword(rolePass);
    setErrorMsg('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const matchedPesantren = registeredPesantrens.find(p => p.subdomain === selectedSubdomain);
      const tenantId = selectedSubdomain || 'darulrahman';

      // 1. Kunci tenant terpilih di storage agar database Firestore terisolasi
      setActiveTenantId(tenantId);

      // 2. Verifikasi Autentikasi Firebase (Master Dev, Firebase Auth, Firestore tenant users)
      const fbUser = await firebaseLoginUser(cleanUser, cleanPass, tenantId);
      if (fbUser) {
        onLoginSuccess({
          ...fbUser,
          tenantId,
          pesantren: matchedPesantren?.name || tenantId,
          isActive: true
        });
        return;
      }

      // 3. Verifikasi Autentikasi Firestore User (tenants/{tenantId}/users)
      const fsUser = await firestoreVerifyUserLogin(cleanUser, cleanPass, tenantId);
      if (fsUser) {
        onLoginSuccess({
          ...fsUser,
          tenantId,
          pesantren: matchedPesantren?.name || tenantId,
          isActive: true
        });
        return;
      }

      // 4. Coba autentikasi ke backend API
      try {
        const res = await loginUser({ username: cleanUser, password: cleanPass });
        if (res?.data?.success && res?.data?.user) {
          onLoginSuccess({
            ...res.data.user,
            tenantId,
            pesantren: matchedPesantren?.name || tenantId,
            isActive: true
          });
          return;
        }
      } catch (apiErr) {
        console.warn('[AppGateway] API Backend response:', apiErr.message);
      }

      setErrorMsg(`Username atau password salah untuk ${matchedPesantren?.name || tenantId}. (Tips Dev: dev / dev123)`);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Login gagal. Periksa kembali username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/index.html';
    } else {
      window.location.href = 'https://sipesand.web.id';
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-[#18181B] font-sans antialiased selection:bg-[#0B4FE2] selection:text-white p-3 sm:p-6 lg:p-8">
      {/* Frame Dalam Super-Ellipse */}
      <div className="max-w-7xl mx-auto bg-[#FAFAF8] rounded-3xl border border-[#DCD6CD] shadow-sm overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* ===================================================================== */}
        {/* 1. HEADER WOOT APP HUB                                                */}
        {/* ===================================================================== */}
        <header className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between bg-white/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <img 
              src="/logo-sipesand.png" 
              alt="SIPESAND Logo" 
              className="h-9 sm:h-10 w-auto object-contain rounded-xl shadow-xs" 
            />
            <div>
              <span className="font-['Righteous'] text-xl text-[#0B4FE2] tracking-tight">SIPESAND</span>
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-zinc-100 border border-zinc-200 text-[10px] font-black text-zinc-700 uppercase">
                App Hub Gateway
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToLanding}
              className="px-4 py-2 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 font-bold text-xs text-zinc-700 transition-colors flex items-center gap-2"
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500" />
              <span>Website Utama (sipesand.web.id)</span>
            </button>
          </div>
        </header>

        {/* Broadcast Announcement Bar dari Developer HQ (Clean static, tanpa pulsing) */}
        {gatewayConfig?.appGatewayAnnouncement && (
          <div className="bg-[#0B4FE2] text-white py-2.5 px-6 text-xs font-bold flex items-center justify-center gap-2 border-b border-blue-400/20">
            <span className="px-2 py-0.5 rounded bg-[#98F51F] text-black text-[10px] font-black uppercase tracking-wider">
              PENGUMUMAN
            </span>
            <span>{gatewayConfig.appGatewayAnnouncement}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 2. BODY SPLIT HERO WOOT UI                                            */}
        {/* ===================================================================== */}
        <main className="flex-1 p-4 sm:p-8 flex flex-col justify-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* PANEL KIRI (5/12): DIREKTORI PESANTREN & AKSES MANDIRI (#0B4FE2) */}
            <div className="lg:col-span-5 bg-[#0B4FE2] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-md">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#98F51F] text-[10px] font-black uppercase tracking-wider mb-4 border border-white/15">
                  SSO GATEWAY PUSAT • APP.SIPESAND.WEB.ID
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  Gerbang Akses Lembaga Terdaftar
                </h2>
                <p className="text-xs text-white/80 font-medium leading-relaxed mb-6">
                  Pilih pesantren Anda untuk mengarahkan sesi autentikasi dan mengunci database operasional lembaga.
                </p>

                {/* Search Bar Capsule untuk Mencari Pesantren */}
                <div className="relative mb-4">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchPesantren}
                    onChange={(e) => setSearchPesantren(e.target.value)}
                    placeholder="Cari nama pondok atau subdomain..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-full bg-white text-zinc-900 text-xs font-bold placeholder-zinc-400 focus:outline-none shadow-sm"
                  />
                </div>

                {/* List Kartu Pesantren */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredList.map((p) => {
                    const isSelected = p.subdomain === selectedSubdomain;
                    return (
                      <button
                        key={p.subdomain}
                        type="button"
                        onClick={() => setSelectedSubdomain(p.subdomain)}
                        className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between border ${
                          isSelected
                            ? 'bg-[#98F51F] text-[#18181B] border-[#98F51F] shadow-sm'
                            : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs leading-tight">{p.name}</div>
                          <div className={`font-mono text-[10px] mt-0.5 ${isSelected ? 'text-zinc-700' : 'text-white/70'}`}>
                            {p.subdomain}.sipesand.web.id
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-black text-[#98F51F] flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tombol Aksi Mandiri Cepat */}
              <div className="pt-6 border-t border-white/20 mt-6 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenPortalWali('')}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all text-left flex flex-col justify-between border border-white/15"
                >
                  <UserCheck className="w-4 h-4 text-[#98F51F] mb-1" />
                  <div>
                    <div className="font-bold text-[11px] leading-tight">Portal Wali Santri</div>
                    <div className="text-[9px] text-white/70">Cek saldo & SPP</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onOpenNfcScanner}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all text-left flex flex-col justify-between border border-white/15"
                >
                  <Radio className="w-4 h-4 text-[#98F51F] mb-1" />
                  <div>
                    <div className="font-bold text-[11px] leading-tight">Scanner Kartu NFC</div>
                    <div className="text-[9px] text-white/70">Simulasi tap santri</div>
                  </div>
                </button>
              </div>
            </div>

            {/* PANEL KANAN (7/12): FORM LOGIN WOOT UI DENGAN QUICK ROLE PILLS */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-[#E4E4E7] shadow-sm flex flex-col justify-between">
              <div>
                
                {/* Header Card Login */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6 border-b border-zinc-100 mb-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B4FE2] font-black text-[10px] border border-blue-100 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>AUTENTIKASI OPERATOR TERVALIDASI</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                      Login Petugas & Pengurus
                    </h3>
                  </div>

                  {/* Badge Lembaga Terpilih */}
                  <div className="px-3 py-1.5 rounded-2xl bg-zinc-100 border border-zinc-200 text-left sm:text-right">
                    <span className="text-[9px] text-zinc-400 block font-bold uppercase">Lembaga Terpilih</span>
                    <span className="font-mono text-xs font-black text-[#0B4FE2]">
                      {selectedSubdomain}.sipesand.web.id
                    </span>
                  </div>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 mb-4">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Quick Fill Role Selector (Membantu Pengujian Cepat & Nyaman) */}
                <div className="mb-6">
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                    Akses Cepat Pengujian Role:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: 'Super Admin', u: 'admin', p: 'admin123' },
                      { label: 'Bendahara', u: 'bendahara', p: 'bendahara123' },
                      { label: 'Kasir Saku', u: 'uangsaku', p: 'uangsaku123' },
                      { label: 'Kamtib Gerbang', u: 'kamtib', p: 'kamtib123' },
                      { label: 'Master Dev', u: 'dev', p: 'dev123' },
                    ].map((item) => (
                      <button
                        key={item.u}
                        type="button"
                        onClick={() => handleQuickRole(item.u, item.p)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border ${
                          username === item.u
                            ? 'bg-[#0B4FE2] text-white border-[#0B4FE2] shadow-sm'
                            : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Input Login */}
                <form onSubmit={handleLogin} className="space-y-4">
                  
                  <div>
                    <label className="block text-zinc-700 font-bold mb-1 text-xs">
                      Username Akun Pengurus <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        name="username"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Contoh: admin, bendahara, kamtib"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4FE2]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-700 font-bold mb-1 text-xs">
                      Kata Sandi / Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-200 text-xs font-semibold text-zinc-900 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4FE2]"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl bg-[#98F51F] text-[#18181B] hover:bg-[#86dc16] font-black text-xs sm:text-sm tracking-wide uppercase transition-all shadow-md flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Buka Konsol ERP Pesantren</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>

                </form>

              </div>

              {/* Catatan Keamanan */}
              <div className="pt-6 border-t border-zinc-100 mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
                <span>Enkripsi Sesi End-to-End SSL 256-Bit</span>
                <span>Partisi Database Aman per Tenant</span>
              </div>

            </div>

          </div>
        </main>

        {/* ===================================================================== */}
        {/* 3. FOOTER APP HUB                                                     */}
        {/* ===================================================================== */}
        <footer className="px-6 py-4 border-t border-[#E4E4E7] bg-white text-center text-zinc-400 text-xs">
          SIPESAND App Hub Gateway • Ekosistem Digitalisasi Pesantren Indonesia
        </footer>

      </div>
    </div>
  );
}
