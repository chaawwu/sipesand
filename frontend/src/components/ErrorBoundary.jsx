import React from 'react';
import { AlertTriangle, RefreshCw, Trash2, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleResetCache = () => {
    try {
      localStorage.removeItem('sipesand_active_tenant');
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-8 bg-white rounded-3xl border border-rose-200 shadow-xl text-xs font-sans animate-in fade-in">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold uppercase tracking-wider border border-rose-200">
                Pemulihan Komponen Otomatis
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Terjadi Kendala Tampilan pada Halaman Ini
              </h3>
              <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                Sistem mendeteksi adanya ketidaksesuaian data sementara pada halaman ini. Data tersimpan di server tetap aman. Anda dapat memuat ulang komponen ini atau menyegarkan memori browser.
              </p>

              {this.state.error && (
                <div className="mt-3 p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                  <div className="text-rose-400 font-bold mb-1">Rincian Galat:</div>
                  <div>{this.state.error.toString()}</div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Muat Ulang Komponen</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetCache}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Segarkan Browser & Bersihkan Cache</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
