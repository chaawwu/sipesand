import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Key, 
  Eye, 
  EyeOff, 
  Globe, 
  Zap, 
  ArrowLeft,
  RefreshCw,
  Clock
} from 'lucide-react';
import { loginDeveloper } from '../services/api';

export default function DeveloperLoginPage({ onLoginSuccess, onBackToLanding }) {
  const [email, setEmail] = useState('dev@sipesand.web.id');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Anti-brute force client lockout
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  useEffect(() => {
    let timer = null;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds(prev => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [lockoutSeconds]);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (lockoutSeconds > 0) {
      setErrorMsg(`Akses terkunci sementara. Silakan tunggu ${lockoutSeconds} detik.`);
      return;
    }

    if (!email || !password) {
      setErrorMsg('Email developer dan password wajib diisi lengkap.');
      return;
    }

    try {
      setLoading(true);
      const res = await loginDeveloper({
        email: email.trim(),
        password: password.trim()
      });

      const data = res.data || res;

      if (data.success && data.token) {
        sessionStorage.setItem('sipesand_dev_token', data.token);
        sessionStorage.setItem('sipesand_dev_user', JSON.stringify(data.user || { email, role: 'SUPERADMIN_DEVELOPER' }));
        onLoginSuccess(data.user || { email, role: 'SUPERADMIN_DEVELOPER', name: 'Lead SaaS Architect' });
      } else {
        throw new Error(data.message || 'Kredensial tidak valid.');
      }
    } catch (err) {
      const nextFailed = failedAttempts + 1;
      setFailedAttempts(nextFailed);
      
      if (nextFailed >= 5) {
        setLockoutSeconds(60);
        setErrorMsg('Terlalu banyak percobaan gagal. Akses diblokir sementara selama 60 detik demi keamanan.');
      } else {
        const msg = err.response?.data?.message || err.message || 'Autentikasi gagal. Username atau password tidak valid.';
        setErrorMsg(`${msg} (Percobaan ${nextFailed}/5)`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between font-sans text-xs relative overflow-hidden select-none">
      
      {/* Background Cyber Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white">SiPesand Developer Gateway</span>
            <span className="text-[10px] text-blue-400 font-mono ml-2">mitra.sipesand.web.id</span>
          </div>
        </div>

        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ke Portal Publik</span>
          </button>
        )}
      </header>

      {/* Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-7 sm:p-8 space-y-6">
          
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto shadow-inner">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-white tracking-tight">Superadmin & Developer Login</h1>
              <p className="text-slate-400 text-[11px] mt-1">Akses root multi-tenant dan manajemen lisensi pesantren</p>
            </div>

            {/* Security Protocol Badges */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                SSL / TLS 1.3 Active
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Zap className="w-2.5 h-2.5 text-blue-400" />
                Cloudflare Edge Shield
              </span>
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Caps Lock Warning */}
          {capsLockActive && (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-xl flex items-center gap-2 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Peringatan: <strong>CAPS LOCK AKTIF</strong></span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Input Email / Username */}
            <div>
              <label className="block font-bold text-slate-300 mb-1.5">
                Developer Identity *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="dev@sipesand.web.id / admin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-xs font-mono font-medium disabled:opacity-50"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-bold text-slate-300">
                  Master Secret Key *
                </label>
                <span className="text-[10px] text-slate-500 font-mono">End-to-End Encrypted</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyDown}
                  disabled={loading || lockoutSeconds > 0}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-xs font-mono font-medium disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || lockoutSeconds > 0}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 text-xs"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengautentikasi ke Edge Cloudflare...</span>
                </>
              ) : lockoutSeconds > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Terkunci ({lockoutSeconds}s)</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Buka Akses Control Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice Footer */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-[10px] text-slate-500">
              Portal ini diproteksi ketat oleh enkripsi TLS dan sistem pemantauan audit real-time. Setiap percobaan akses tanpa izin dicatat ke database master.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-3 text-center border-t border-slate-900 bg-slate-950/60 text-[11px] text-slate-500">
        SiPesand v3.2 Enterprise • King Digital Dev • Cloudflare Pages Serverless Multi-Tenant Architecture
      </footer>
    </div>
  );
}
