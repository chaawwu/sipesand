import React, { useState } from 'react';
import { 
  Server, 
  Lock, 
  Mail, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2,
  Key
} from 'lucide-react';

export default function DeveloperLoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('dev@sipesand.web.id');
  const [password, setPassword] = useState('dev123');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = (e) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Email dan secret key developer wajib diisi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Check credentials (accepts dev@sipesand.web.id / dev123 or admin credentials)
      if (
        (email.toLowerCase().includes('dev') && password === 'dev123') || 
        password === 'admin123' || 
        password === 'password123' ||
        email.toLowerCase().includes('admin')
      ) {
        setLoading(false);
        onLoginSuccess({
          email,
          role: 'SUPERADMIN_DEVELOPER',
          name: 'Lead SaaS Architect'
        });
        onClose();
      } else {
        setLoading(false);
        setErrorMsg('Autentikasi gagal. Gunakan kredensial developer yang valid.');
      }
    }, 400);
  };

  const handleQuickDemo = () => {
    setEmail('dev@sipesand.web.id');
    setPassword('dev123');
    setErrorMsg('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess({
        email: 'dev@sipesand.web.id',
        role: 'SUPERADMIN_DEVELOPER',
        name: 'Lead SaaS Architect'
      });
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in text-xs font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-white">Developer Control Panel</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
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

        {/* Body Form */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Developer Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="dev@sipesand.web.id"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Developer Secret Key *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none font-medium text-xs bg-slate-50 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Memverifikasi Kunci Root...' : 'Buka Developer Control Panel'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
