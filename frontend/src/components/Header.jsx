import React from 'react';
import { 
  Building2, 
  Radio, 
  RefreshCw, 
  Globe, 
  ExternalLink,
  ShieldCheck,
  Menu
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const TAB_TITLES = {
  dashboard: 'Dashboard Utama',
  santri: 'Database Santri & KTSD',
  bills: 'Tagihan Massal & Kwitansi',
  approvals: 'Verifikasi Pembayaran & Dana',
  ledger: 'Buku Kas Umum Pesantren',
  'pocket-cash': 'Manajemen Uang Saku',
  academics: 'Divisi Kepala Pondok',
  security: 'Divisi Keamanan (Kamtib)',
  settings: 'Pengaturan Lembaga & Akun',
};

export default function Header({ 
  activeTab, 
  onRefresh, 
  isRefreshing, 
  onOpenNfcModal, 
  onBackToLanding,
  onToggleMobileSidebar
}) {
  const { settings, isNfcEnabled } = useSettings();
  const pageTitle = TAB_TITLES[activeTab] || 'SiPesand Terpadu';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 text-xs font-sans">
      
      {/* Left: Hamburger button for Mobile & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex-shrink-0"
          title="Buka Menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        {logoPondok ? (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white p-0.5 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
            <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
            <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          </div>
        )}

        <div className="min-w-0">
          <h2 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight truncate">
            {pageTitle}
          </h2>
          <p className="text-[10px] text-slate-400 font-medium truncate max-w-xs">
            {namaLembaga}
          </p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        
        {/* NFC Scanner Trigger (If Enabled) */}
        {isNfcEnabled && (
          <button
            onClick={onOpenNfcModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] font-bold rounded-xl border border-blue-200 transition-colors shadow-subtle text-xs"
          >
            <Radio className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>NFC Reader</span>
          </button>
        )}

        {/* Refresh Data */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
        </button>

        {/* Back to Portal Utama */}
        <button
          onClick={onBackToLanding}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors shadow-sm text-xs"
        >
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Portal Utama</span>
        </button>

      </div>

    </header>
  );
}
