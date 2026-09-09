import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  Key, 
  X, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { loginUser } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const { settings, activeTenantSubdomain } = useSettings();
  const namaLembaga = settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmitLogin = async (e) => {
    if (e) e.preventDefault();
    const cleanUser = username.trim();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Username dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await loginUser({ 
        username: cleanUser, 
        password: cleanPass 
      });

      if (res && (res.success || res.data?.success)) {
        const u = res.user || res.data?.user || res.data;
        onLoginSuccess({
          ...u,
          tenant: activeTenantSubdomain || 'darulrahman'
        });
        onClose();
        return;
      } else {
        setErrorMsg(res?.message || 'Username atau password yang Anda masukkan salah.');
      }
    } catch (err) {
      console.warn('Login error:', err);
      setErrorMsg(
        err.response?.data?.message || 
        err.message || 
        'Username atau password yang Anda masukkan salah. Periksa kembali kredensial Anda.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in text-xs font-sans">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base text-white">Login Petugas Devisi</h3>
                {activeTenantSubdomain && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    {activeTenantSubdomain}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 font-medium truncate max-w-[240px] sm:max-w-xs">
                {namaLembaga}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Info Notice */}
          <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              Silakan login dengan <strong>Username</strong> dan <strong>Password</strong> akun devisi Anda yang telah dibuat oleh <strong>Super Admin</strong> pesantren.
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold text-[11px]">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmitLogin} className="space-y-4 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Username Akun Pengurus <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: ustadz_saku, bendahara, admin..."
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5 text-xs">
                Password Sandi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0B52E2] hover:bg-blue-700 text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer active:scale-98"
            >
              {loading ? (
                <span>Memverifikasi Akun...</span>
              ) : (
                <>
                  <span>Masuk ke Dasbor Devisi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Security Footer Info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center shrink-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autentikasi Aman Terenkripsi • Hak Akses Dikelola Super Admin</span>
          </div>
        </div>

      </div>
    </div>
  );
}
