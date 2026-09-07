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
  MapPin,
  RefreshCw,
  User
} from 'lucide-react';
import { loginUser } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { firebaseLoginUser } from '../services/firebaseConfig';
import { getActiveTenantId, setActiveTenantId, firestoreVerifyUserLogin } from '../services/firestoreService';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const { settings } = useSettings();

  const [email, setEmail] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Info Pesantren Dinamis
  const namaPesantren = settings?.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const alamatPesantren = settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293';
  const emailPesantren = settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const noHpPesantren = settings?.NO_TELP || settings?.WHATSAPP_CENTER || '+62 851-2373-4342';

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMsg('Username atau Email wajib diisi.');
      return;
    }

    if (!cleanPass) {
      setErrorMsg('Password wajib diisi.');
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

      setErrorMsg(`Username atau password salah untuk ${namaPesantren}. (Tips Dev: dev / dev123).`);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-zinc-200 w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Modal Woot Style (#0B4FE2) */}
        <div className="p-6 bg-[#0B4FE2] text-white relative space-y-3">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors font-bold text-xs"
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-[#98F51F]">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-black text-[#98F51F] tracking-widest block">
                PORTAL LOGIN PETUGAS
              </span>
              <h3 className="font-black text-base text-white truncate">
                {namaPesantren}
              </h3>
            </div>
          </div>

          {/* Info Pesantren Alamat & Kontak */}
          <div className="pt-2 border-t border-white/15 text-[11px] text-white/80 space-y-1">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#98F51F] mt-0.5" />
              <span className="line-clamp-1">{alamatPesantren}</span>
            </div>
            <div className="flex items-center justify-between gap-2 pt-0.5 text-[10px]">
              <span className="flex items-center gap-1 text-white/80">
                <Mail className="w-3 h-3 text-[#98F51F]" />
                <span className="truncate">{emailPesantren}</span>
              </span>
              <span className="flex items-center gap-1 text-white/80">
                <Phone className="w-3 h-3 text-[#98F51F]" />
                <span>{noHpPesantren}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">{errorMsg}</div>
            </div>
          )}

          {/* Input Username / Email */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 flex items-center justify-between">
              <span>Username / Email Petugas *</span>
              <span className="text-[10px] text-zinc-400 font-normal">Akun operator</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="contoh: admin, bendahara, kamtib"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-xs font-semibold text-zinc-900"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1">
            <label className="font-bold text-zinc-700 flex items-center justify-between">
              <span>Kata Sandi / Password *</span>
              <span className="text-[10px] text-zinc-400 font-normal">Min. 4 Karakter</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-zinc-200 bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B4FE2] text-xs font-semibold text-zinc-900"
              />
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="pt-2 border-t border-zinc-100 space-y-1.5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Akses Cepat Pengujian:
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickFill('dev', 'dev123')}
                className="p-1.5 rounded-xl border border-blue-200 hover:border-[#0B4FE2] bg-blue-50/70 text-left font-bold text-[#0B4FE2] truncate"
              >
                ⚡ Master Dev (dev123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin123')}
                className="p-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 text-left font-bold text-zinc-700 truncate"
              >
                🔑 Admin (admin123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('bendahara', 'bendahara123')}
                className="p-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 text-left font-bold text-zinc-700 truncate"
              >
                💰 Bendahara (bendahara123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('uangsaku', 'uangsaku123')}
                className="p-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 text-left font-bold text-zinc-700 truncate"
              >
                💳 Uang Saku (uangsaku123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('kamtib', 'kamtib123')}
                className="p-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 text-left font-bold text-zinc-700 truncate"
              >
                🛡️ Kamtib (kamtib123)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('akademik', 'akademik123')}
                className="p-1.5 rounded-xl border border-zinc-200 hover:border-zinc-400 bg-zinc-50 text-left font-bold text-zinc-700 truncate"
              >
                📖 Akademik (akademik123)
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#98F51F] hover:bg-[#86dc16] text-[#18181B] font-black uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2 text-xs pt-3 mt-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Masuk ke Dashboard Pesantren</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>

          {/* Footer Security Note */}
          <div className="pt-1 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0B4FE2]" />
            <span>Sesi Terenkripsi & Terisolasi Cloud Multi-Tenant</span>
          </div>

        </form>

      </div>
    </div>
  );
}
