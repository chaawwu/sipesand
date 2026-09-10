import React, { useState } from 'react';
import { 
  Server, 
  Lock, 
  User, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { loginDeveloper } from '../services/api';

export default function DeveloperLoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password) {
      setErrorMsg('Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginDeveloper({ username: username.trim(), password });

      if (res.success && res.token) {
        // Simpan token di sessionStorage
        try {
          sessionStorage.setItem('sipesand_dev_token', res.token);
          sessionStorage.setItem('sipesand_dev_username', res.username || username);
          sessionStorage.setItem('sipesand_dev_auth', 'true');
        } catch (e) {}

        onLoginSuccess({
          username: res.username || username,
          role: 'SUPERADMIN_DEVELOPER',
          name: res.username || username,
          token: res.token
        });
        onClose();
      } else {
        setErrorMsg(res.message || 'Autentikasi gagal. Periksa username dan password.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server. Pastikan backend aktif dan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm text-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">Developer Control Panel</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  ROOT
                </span>
              </div>
              <p className="text-[11px] text-slate-400">mitra.sipesand.web.id • Superadmin Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Box */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800">
            <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[11px]">Akses Terbatas • Developer Only</p>
              <p className="text-[10px] text-blue-600 mt-0.5">
                Gunakan kredensial developer King Digital Dev. Default username: <code className="bg-blue-100 px-1 rounded">admin_dev</code>
              </p>
            </div>
          </div>
        </div>

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-medium leading-tight">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Username Developer *</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_dev"
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Password Developer *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-9 pr-9 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memverifikasi Akses...
              </>
            ) : (
              <>
                Buka Developer Control Panel
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-5 text-center">
          <p className="text-[10px] text-slate-400">
            Akses tidak sah akan dicatat dalam audit log sistem.
          </p>
        </div>
      </div>
    </div>
  );
}

