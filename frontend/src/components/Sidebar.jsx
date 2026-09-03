import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  BookOpen, 
  ShieldCheck, 
  Radio, 
  Building2,
  Globe, 
  LogOut, 
  Receipt, 
  CheckCircle2, 
  Award, 
  Settings, 
  CircleDollarSign, 
  UserCheck,
  Palette,
  X
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  onOpenNfcModal, 
  onBackToLanding, 
  currentUser, 
  onLogout,
  isOpen,
  onClose
}) {
  const { settings, isNfcEnabled } = useSettings();
  const userRole = currentUser?.role || 'SUPER_ADMIN';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand';

  // Role-based Menu Configuration
  const getMenuItems = () => {
    switch (userRole) {
      case 'KEPALA_PONDOK':
        return [
          { id: 'academics', label: 'Dashboard Kepala Pondok', icon: Award },
          { id: 'santri', label: 'Data Santri & KTSD', icon: Users },
          { id: 'security', label: 'Monitoring Perizinan & Kamtib', icon: ShieldCheck },
        ];
      case 'BENDAHARA':
        return [
          { id: 'bills', label: 'Tagihan Massal & Kwitansi', icon: Receipt },
          { id: 'approvals', label: 'Verifikasi Pembayaran & Dana', icon: CheckCircle2 },
          { id: 'ledger', label: 'Buku Kas Umum Pesantren', icon: BookOpen },
          { id: 'santri', label: 'Data Santri', icon: Users },
        ];
      case 'PENGURUS_SAKU':
        return [
          { id: 'pocket-cash', label: 'Uang Saku & Follow-Up WA', icon: CircleDollarSign },
          { id: 'santri', label: 'Data Santri & NFC', icon: Users },
        ];
      case 'KEAMANAN':
        return [
          { id: 'security', label: 'Dashboard Keamanan & Izin', icon: ShieldCheck },
          { id: 'santri', label: 'Data Santri & NFC', icon: Users },
        ];
      case 'SUPER_ADMIN':
      default:
        return [
          { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
          { id: 'santri', label: 'Data Santri & Migrasi', icon: Users },
          { id: 'bills', label: 'Tagihan Massal & Kwitansi', icon: Receipt },
          { id: 'approvals', label: 'Persetujuan / ACC', icon: CheckCircle2 },
          { id: 'ledger', label: 'Buku Besar & Kas Umum', icon: BookOpen },
          { id: 'pocket-cash', label: 'Uang Saku Santri & POS', icon: CircleDollarSign },
          { id: 'academics', label: 'Divisi Kepala Pondok', icon: Award },
          { id: 'security', label: 'Divisi Keamanan (Kamtib)', icon: ShieldCheck },
          { id: 'web-builder', label: 'Tampilan Web & Portal', icon: Palette },
          { id: 'settings', label: 'Pengaturan Lembaga & Akun', icon: Settings },
        ];
    }
  };

  const menuItems = getMenuItems();

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container: Fixed slide-in on mobile, static on desktop */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col min-h-screen border-r border-slate-800 shadow-2xl transition-transform duration-300 ease-in-out text-xs select-none
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-none lg:w-60
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {logoPondok ? (
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow flex items-center justify-center flex-shrink-0">
                <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight text-white truncate">{namaLembaga}</h1>
              <p className="text-[10px] text-slate-400 font-medium">Sistem Terpadu Digital</p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Session Info Badge */}
        {currentUser && (
          <div className="p-3 bg-slate-800/60 border-b border-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {currentUser.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-200 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-blue-400 font-mono leading-none mt-0.5">{currentUser.role}</div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Menu Devisi Aktif
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 sm:py-2 rounded-xl font-medium transition-all ${
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-bold shadow-subtle'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate text-xs">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Quick NFC Simulator Box (Only if NFC is enabled) */}
          {isNfcEnabled && (
            <div className="pt-3">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-center">
                <div className="w-6 h-6 mx-auto rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-1 border border-blue-500/30">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-[11px] font-bold text-white">Smart NFC Reader</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 mb-2 leading-tight">
                  Pindai kartu santri untuk POS kantin atau perizinan.
                </p>
                <button
                  onClick={() => {
                    onOpenNfcModal();
                    if (onClose) onClose();
                  }}
                  className="w-full py-1.5 px-2 bg-[#1D4ED8] hover:bg-blue-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Tap Kartu NFC</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Footer Navigation & Developer Build Note */}
        <div className="p-3 border-t border-slate-800 text-slate-400 space-y-2">
          <button
            onClick={() => {
              onBackToLanding();
              if (onClose) onClose();
            }}
            className="w-full py-2 sm:py-1.5 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Lihat Portal Utama</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              if (onClose) onClose();
            }}
            className="w-full py-2 sm:py-1.5 px-2.5 text-rose-400 hover:bg-rose-950/40 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Akun</span>
          </button>

          <div className="pt-2 text-center text-[10px] text-slate-400 font-medium">
            Build on <a href="https://kingdigitalpremium.my.id" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">kingdigitalpremium.my.id</a>
          </div>
        </div>

      </aside>
    </>
  );
}
