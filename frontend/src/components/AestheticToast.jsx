import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle, 
  X, 
  ShieldCheck
} from 'lucide-react';

export default function AestheticToast({ 
  isOpen, 
  type = 'success', // 'success' | 'error' | 'info' | 'warning'
  title = 'Notifikasi', 
  message = '', 
  onClose,
  duration = 4000 
}) {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';
  const isInfo = type === 'info';

  return (
    <div className="fixed top-5 right-5 z-[9999] max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto font-sans text-xs">
      <div className={`
        relative overflow-hidden rounded-2xl p-4 shadow-2xl border backdrop-blur-xl transition-all
        ${isSuccess ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/40' : ''}
        ${isError ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/40' : ''}
        ${isWarning ? 'bg-slate-900/95 text-white border-amber-500/40 shadow-amber-950/40' : ''}
        ${isInfo ? 'bg-slate-900/95 text-white border-blue-500/40 shadow-blue-950/40' : ''}
      `}>
        {/* Glow Accent */}
        <div className={`
          absolute -top-12 -left-12 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-60
          ${isSuccess ? 'bg-emerald-500' : isError ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-blue-500'}
        `}></div>

        <div className="flex items-start gap-3 relative z-10">
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md
            ${isSuccess ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
            ${isError ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : ''}
            ${isWarning ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : ''}
            ${isInfo ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}
          `}>
            {isSuccess && <CheckCircle2 className="w-4 h-4" />}
            {isError && <AlertCircle className="w-4 h-4" />}
            {isWarning && <AlertTriangle className="w-4 h-4" />}
            {isInfo && <ShieldCheck className="w-4 h-4" />}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h4 className="font-bold text-xs text-white tracking-tight">
              {title}
            </h4>
            {message && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                {message}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 overflow-hidden">
          <div className={`
            h-full w-full animate-[progress_4s_linear_forwards]
            ${isSuccess ? 'bg-emerald-400' : isError ? 'bg-rose-400' : isWarning ? 'bg-amber-400' : 'bg-blue-400'}
          `}></div>
        </div>
      </div>
    </div>
  );
}
