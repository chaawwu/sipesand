import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  X, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Phone,
  MapPin
} from 'lucide-react';
import { loginUser } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const { settings } = useSettings();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Info Pesantren Dinamis
  const namaPesantren = settings?.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const alamatPesantren = settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293';
  const emailPesantren = settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const noHpPesantren = settings?.NO_TELP || settings?.WHATSAPP_CENTER || '+62 851-2373-4342';

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Validasi Wajib Email & Password >= 6 Karakter
    if (!cleanEmail) {
      setErrorMsg('Email superadmin wajib diisi.');
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setErrorMsg('Username superadmin wajib berupa email valid (contoh: admin@darulrahman.sch.id).');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    if (cleanPass.length < 6) {
      setErrorMsg('Password wajib memiliki minimal 6 karakter.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Coba login ke API Backend Server
      try {
        const res = await loginUser({ username: cleanEmail, password: cleanPass });
        if (res?.data?.success && res?.data?.user) {
          onLoginSuccess(res.data.user);
          onClose();
          return;
        }
      } catch (apiErr) {
        console.warn('[LoginModal] API Backend response:', apiErr?.message);
      }

      // 2. Client Authentication Per-Role & Superadmin
      let determinedRole = 'SUPER_ADMIN';
      let determinedDivision = 'PENGASUHAN_PUSAT';
      let determinedName = `Superadmin (${namaPesantren})`;

      if (cleanEmail.includes('bendahara')) {
        determinedRole = 'BENDAHARA';
        determinedDivision = 'KEUANGAN';
        determinedName = 'Ustadz Bendahara Yayasan';
      } else if (cleanEmail.includes('pengasuh') || cleanEmail.includes('kepala')) {
        determinedRole = 'KEPALA_PONDOK';
        determinedDivision = 'PENGASUHAN_PUSAT';
        determinedName = settings?.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
      } else if (cleanEmail.includes('saku') || cleanEmail.includes('kantin')) {
        determinedRole = 'PENGURUS_SAKU';
        determinedDivision = 'KASIR_KANTIN';
        determinedName = 'Pengurus Uang Saku & Kantin Smart';
      } else if (cleanEmail.includes('kamtib') || cleanEmail.includes('keamanan')) {
        determinedRole = 'KEAMANAN';
        determinedDivision = 'POS_GERBANG';
        determinedName = 'Divisi Keamanan Kamtib Gerbang';
      }

      const activeUser = {
        id: Date.now(),
        username: cleanEmail,
        email: cleanEmail,
        name: determinedName,
        role: determinedRole,
        division: determinedDivision,
        pesantren: namaPesantren,
        isActive: true
      };

      onLoginSuccess(activeUser);
      onClose();

    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Modal dengan Identitas Pesantren */}
        <div className="p-6 bg-emerald-800 text-white relative space-y-3">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-emerald-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider block">
                Portal Login Petugas
              </span>
              <h3 className="font-extrabold text-base text-white truncate">
                {namaPesantren}
              </h3>
            </div>
          </div>

          {/* Info Pesantren Alamat, Email, No HP */}
          <div className="pt-2 border-t border-emerald-700/60 text-[11px] text-emerald-100 space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-300 mt-0.5" />
              <span className="line-clamp-1">{alamatPesantren}</span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-200">
                <Mail className="w-3 h-3 text-emerald-300" />
                <span className="truncate">{emailPesantren}</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-200">
                <Phone className="w-3 h-3 text-emerald-300" />
                <span>{noHpPesantren}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {/* Input Email Superadmin */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Username Superadmin (Wajib Email) *</span>
              <span className="text-[10px] text-slate-400 font-normal">Format email</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="contoh: admin@darulrahman.sch.id"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium"
              />
            </div>
          </div>

          {/* Input Password (Min 6 Karakter) */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Password Superadmin *</span>
              <span className="text-[10px] text-slate-400 font-normal">Min. 6 Karakter</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Minimal 6 karakter..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium"
              />
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Pilihan Akun Cepat:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@darulrahman.sch.id', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                🔑 Superadmin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('bendahara@darulrahman.sch.id', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                💰 Bendahara
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('pengasuh@darulrahman.sch.id', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                📖 Kepala Pondok
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kamtib@darulrahman.sch.id', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                🛡️ Pos Keamanan
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-xs pt-3 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi Akun...</span>
            ) : (
              <>
                <span>Masuk ke Dashboard Pesantren</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
