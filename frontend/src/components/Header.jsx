import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Radio, 
  RefreshCw, 
  Globe, 
  ExternalLink,
  ShieldCheck,
  Menu,
  Cloud,
  Lock
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { getCurrentTenant, setCurrentTenant } from '../services/localDatabase';

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
  const { settings, isNfcEnabled, isTenantInstance, activeTenantSubdomain } = useSettings();
  const [activeTenant, setActiveTenant] = useState('darulrahman');
  const pageTitle = TAB_TITLES[activeTab] || 'SiPesand Terpadu';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand';

  useEffect(() => {
    setActiveTenant(getCurrentTenant());
  }, []);

  const handleTenantChange = (newTenant) => {
    setActiveTenant(newTenant);
    setCurrentTenant(newTenant);
    window.location.reload();
  };

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

        <div className="w-8 h-8 rounded-xl bg-[#8CE829] flex items-center justify-center p-1 shadow-xs flex-shrink-0">
          <img src={logoPondok || "/logo.png"} alt="Logo" className="w-full h-full object-contain" />
        </div>

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
        
        {/* Tenant Indicator (Locked to prevent cross-tenant switching) */}
        {isTenantInstance || (activeTenant && activeTenant !== 'master') ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50/90 border border-emerald-200 rounded-lg text-emerald-900 shadow-2xs">
            <Lock className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <span className="hidden md:inline text-[10px] font-semibold text-emerald-700">Tenant:</span>
            <span className="font-bold text-[11px] text-emerald-950 uppercase">
              {activeTenantSubdomain || activeTenant}
            </span>
            <span className="text-[8px] bg-emerald-200/80 text-emerald-900 px-1 py-0.2 rounded font-black tracking-wider uppercase">Terkunci</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Multi-Device Cloud Real-Time Active" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-lg text-slate-700 transition-colors shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="hidden md:inline text-[10px] font-semibold text-slate-500">Tenant:</span>
            <select 
              value={activeTenant} 
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-transparent font-bold text-[11px] text-slate-900 border-none outline-none cursor-pointer pr-1"
              title="Pilih Tenant Pesantren (Multi-device)"
            >
              <option value="master">Pusat / Master</option>
              <option value="darulrahman">Darul Rahman</option>
              <option value="alhikmah">Al-Hikmah</option>
              <option value="nurulhuda">Nurul Huda</option>
            </select>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Multi-Device Cloud Real-Time Active" />
          </div>
        )}

        {/* NFC Scanner Trigger (If Enabled) */}
        {isNfcEnabled && (
          <button
            onClick={onOpenNfcModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors shadow-sm text-xs"
          >
            <Radio className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
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
