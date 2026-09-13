import React, { useState } from 'react';
import { 
  Building2, 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { cleanTenantInput, getCurrentTenant } from '../services/localDatabase';

export default function MobileTenantSwitcherModal({ isOpen, onClose, onTenantChanged }) {
  const current = getCurrentTenant();
  const [inputVal, setInputVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApply = (e) => {
    e?.preventDefault();
    setErrorMsg('');

    const cleaned = cleanTenantInput(inputVal);
    if (!cleaned) {
      setErrorMsg('Masukkan subdomain atau domain pondok yang valid (contoh: "darulrahman" atau "namapondok.sipesand.web.id")');
      return;
    }

    try {
      localStorage.setItem('sipesand_active_tenant', cleaned);
      setIsSuccess(true);
      setTimeout(() => {
        if (typeof onTenantChanged === 'function') {
          onTenantChanged(cleaned);
        }
        window.location.reload();
      }, 700);
    } catch (err) {
      setErrorMsg('Gagal menyimpan lembaga: ' + err.message);
    }
  };

  const handleQuickSelect = (tenantName) => {
    setInputVal(tenantName);
    const cleaned = cleanTenantInput(tenantName);
    if (cleaned) {
      localStorage.setItem('sipesand_active_tenant', cleaned);
      setIsSuccess(true);
      setTimeout(() => {
        if (typeof onTenantChanged === 'function') {
          onTenantChanged(cleaned);
        }
        window.location.reload();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-xs">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/50 flex items-center justify-center text-white border border-blue-400/30">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Hubungkan Pondok Pesantren</h3>
              <p className="text-[11px] text-blue-200">Isolasi Database Khusus Multi-Tenant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 bg-slate-50/50">
          
          {/* Current Active Tenant Badge */}
          <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pondok Terhubung Saat Ini</span>
                <span className="text-xs font-bold text-slate-800 uppercase">{current || 'Belum Dipilih'}</span>
              </div>
            </div>
            <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold border border-blue-200">
              {current}.sipesand.web.id
            </span>
          </div>

          {/* Form Input */}
          <form onSubmit={handleApply} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masukkan Nama / Domain Pondok Anda:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => {
                    setInputVal(e.target.value);
                    setErrorMsg('');
                  }}
                  placeholder="contoh: namapondok atau namapondok.sipesand.web.id"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Ketik nama subdomain pondok Anda. Database santri, tagihan, dan uang saku otomatis disesuaikan tanpa tercampur dengan lembaga lain.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-[11px]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-700 text-[11px] font-bold">
                <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>Berhasil terhubung! Memuat data pondok...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!inputVal.trim() || isSuccess}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSuccess ? 'animate-spin' : ''}`} />
              <span>Terapkan & Muat Data Pondok</span>
            </button>
          </form>

          {/* Contoh Lembaga Cepat */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">Atau pilih pondok contoh:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickSelect('darulrahman')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors text-[11px]"
              >
                🏛️ Darul Rahman (Kediri)
              </button>
            </div>
          </div>

          {/* Info Garansi Pemisahan Data */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl flex items-start gap-2.5 text-[11px] text-blue-900">
            <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Isolasi Database Terjamin:</strong> Seluruh mutasi kas, saldo uang saku santri, dan absensi dienkripsi serta dipisahkan per tenant pondok.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-200 bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
