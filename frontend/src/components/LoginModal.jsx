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
import { firebaseLoginUser } from '../services/firebaseConfig';
import { getActiveTenantId, setActiveTenantId, firestoreVerifyUserLogin } from '../services/firestoreService';

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

    // Validasi Username / Email & Password
    if (!cleanEmail) {
      setErrorMsg('Username atau Email wajib diisi.');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    if (cleanPass.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const tenantId = getActiveTenantId();

      // 1. Coba Autentikasi Firebase (Master Dev, Firebase Auth, Firestore tenant users)
      const fbUser = await firebaseLoginUser(cleanEmail, cleanPass, tenantId);
      if (fbUser) {
        setActiveTenantId(fbUser.tenantId || tenantId);
        onLoginSuccess({
          ...fbUser,
          pesantren: namaPesantren,
          isActive: true
        });
        onClose();
        return;
      }

      // 2. Coba Autentikasi Firestore User (tenants/{tenantId}/users)
      const fsUser = await firestoreVerifyUserLogin(cleanEmail, cleanPass, tenantId);
      if (fsUser) {
        setActiveTenantId(fsUser.tenantId || tenantId);
        onLoginSuccess({
          ...fsUser,
          pesantren: namaPesantren,
          isActive: true
        });
        onClose();
        return;
      }

      // 3. Coba login ke API Backend Server
      try {
        const res = await loginUser({ username: cleanEmail, password: cleanPass });
        if (res?.data?.success && res?.data?.user) {
          setActiveTenantId(res.data.user.tenantId || tenantId);
          onLoginSuccess(res.data.user);
          onClose();
          return;
        }
      } catch (apiErr) {
        console.warn('[LoginModal] API Backend response:', apiErr?.message);
      }

      setErrorMsg(`Username atau password salah untuk ${namaPesantren}. (Tips Dev: Gunakan dev / dev123).`);
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

          {/* Input Username / Email */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Username / Email Petugas *</span>
              <span className="text-[10px] text-slate-400 font-normal">Username atau email</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="contoh: admin / admin@darulrahman.sch.id"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 text-xs font-medium"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 flex items-center justify-between">
              <span>Password *</span>
              <span className="text-[10px] text-slate-400 font-normal">Min. 5 Karakter</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={5}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi..."
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
                onClick={() => handleQuickFill('dev', 'dev123')}
                className="p-1.5 rounded-lg border border-indigo-200 hover:border-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-left font-bold text-indigo-900 truncate"
              >
                ⚡ Master Dev (dev/dev123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                🔑 Admin (admin123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('bendahara', 'bendahara123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                💰 Bendahara (bendahara123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('uangsaku', 'uangsaku123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                💳 Pengurus Saku (uangsaku123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kamtib', 'kamtib123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                🛡️ Kamtib Gerbang (kamtib123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('akademik', 'akademik123')}
                className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 text-left font-semibold text-slate-700 truncate"
              >
                📖 Akademik (akademik123)
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

          {/* Footer Firebase Cloud Indicator */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Auth & Multi-Device Cloud Sync Aktif</span>
          </div>

        </form>

      </div>
    </div>
  );
}
