import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Smartphone,
  ExternalLink,
  ChevronRight,
  School,
  Lock
} from 'lucide-react';
import { cleanTenantInput, getCurrentTenant } from '../services/localDatabase';

// Daftar Tenant / Pesantren Terdaftar untuk Pilihan Cepat
const FEATURED_TENANTS = [
  {
    subdomain: 'darulrahman',
    name: 'PP Darul Rahman Sumbersari',
    location: 'Kencong, Kepung, Kediri, Jatim',
    type: 'Salafiyah Terpadu • Kitab Kuning & Muhafadzoh',
    badge: 'Official Demo / Partner'
  },
  {
    subdomain: 'al-falah',
    name: 'PP Al-Falah Modern Tahfidz',
    location: 'Sleman, D.I. Yogyakarta',
    type: 'Modern Tahfidz Al-Qur\'an',
    badge: 'Terverifikasi'
  },
  {
    subdomain: 'darul-ulum',
    name: 'Pesantren Darul Ulum Digital',
    location: 'Jombang, Jawa Timur',
    type: 'Diniyah & Vokasi Digital',
    badge: 'Terverifikasi'
  },
  {
    subdomain: 'darussalam',
    name: 'Ma\'had Darussalam Boarding School',
    location: 'Ciamis, Jawa Barat',
    type: 'KMI & Bahasa Arab-Inggris',
    badge: 'Terverifikasi'
  },
  {
    subdomain: 'pesantren-terpadu',
    name: 'Pondok Pesantren Terpadu SiPesand',
    location: 'Kediri Hub, Jawa Timur',
    type: 'Percontohan Nasional Digital',
    badge: 'Master Template'
  }
];

export default function MobileTenantWelcomeScreen({ onTenantSelected }) {
  const [searchInput, setSearchInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter daftar pondok berdasarkan input pencarian
  const filteredTenants = FEATURED_TENANTS.filter(t => 
    t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchInput.toLowerCase()) ||
    t.location.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleSelectTenant = (subdomain) => {
    const cleaned = cleanTenantInput(subdomain);
    if (!cleaned) {
      setErrorMsg('Nama atau subdomain pondok tidak valid.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Simpan pilihan permanen di storage HP
      localStorage.setItem('sipesand_active_tenant', cleaned);
      
      setTimeout(() => {
        if (typeof onTenantSelected === 'function') {
          onTenantSelected(cleaned);
        }
        window.location.reload();
      }, 400);
    } catch (e) {
      setErrorMsg('Gagal menyimpan pilihan: ' + e.message);
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e) => {
    e?.preventDefault();
    if (!searchInput.trim()) {
      setErrorMsg('Silakan ketik nama atau subdomain pondok Anda.');
      return;
    }
    handleSelectTenant(searchInput);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Background Islamic Geometric / Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-20 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-5 pt-8 max-w-lg mx-auto w-full flex-1 flex flex-col">
        {/* Header App Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-xl shadow-blue-900/40 border border-blue-400/30 mb-3 animate-pulse">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            SiPesand <span className="text-xs uppercase px-2 py-0.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-300 font-bold tracking-wider">Mobile</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Sistem Informasi & Manajemen Pesantren Terpadu</p>
        </div>

        {/* Card Welcome Card */}
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl rounded-3xl p-5 shadow-2xl shadow-black/60 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Pilih Pesantren Anda</h2>
              <p className="text-[11px] text-slate-400">Aplikasi akan otomatis mengunci database khusus pondok Anda</p>
            </div>
          </div>

          {/* Form Pencarian / Input Bebas */}
          <form onSubmit={handleManualSubmit} className="space-y-3 mb-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Ketik subdomain / nama pondok..."
                className="w-full pl-10 pr-24 py-3 bg-slate-950/80 border border-slate-700/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="submit"
                disabled={isProcessing || !searchInput.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-700/30"
              >
                <span>Masuk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                {errorMsg}
              </p>
            )}
          </form>

          {/* Daftar Cepat Rekomendasi Pesantren */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Pilihan Cepat Lembaga Mitra:
            </span>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {filteredTenants.length > 0 ? (
                filteredTenants.map((t) => (
                  <button
                    key={t.subdomain}
                    onClick={() => handleSelectTenant(t.subdomain)}
                    disabled={isProcessing}
                    className="w-full text-left p-3 rounded-2xl bg-slate-950/60 hover:bg-blue-900/20 border border-slate-800/80 hover:border-blue-500/40 flex items-center justify-between group transition-all"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                          {t.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
                          {t.badge}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                        <span className="text-blue-400 font-mono">@{t.subdomain}</span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          {t.location}
                        </span>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-xl bg-slate-800 group-hover:bg-blue-600 flex items-center justify-center text-slate-400 group-hover:text-white shrink-0 transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 text-slate-400">
                  <p className="text-xs">Nama pondok tidak ada di daftar mitra?</p>
                  <p className="text-[11px] text-blue-400 mt-1">
                    Cukup ketik kode subdomain pondok Anda di kolom atas lalu klik tombol <b>Masuk</b>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fitur Keamanan & Privasi Database */}
        <div className="p-3.5 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-[11px] text-slate-300">
            <strong className="text-white font-semibold block">Isolasi Database Terjamin 100%</strong>
            Data santri, keuangan kas, SPP, dan tabungan dari pesantren Anda terpisah sepenuhnya dan tidak akan pernah tercampur dengan pondok lain.
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[10px] text-slate-500 pb-2">
          <p>© {new Date().getFullYear()} SiPesand Mobile Native • King Digital Dev</p>
          <p className="mt-0.5">Pondok yang dipilih akan disimpan di HP Anda secara otomatis.</p>
        </div>
      </div>
    </div>
  );
}
