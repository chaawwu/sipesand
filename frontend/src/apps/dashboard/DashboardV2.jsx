import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  BookOpen,
  ShieldCheck,
  Receipt,
  Settings,
  Search,
  Bell,
  Plus,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Download,
  Printer,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  CircleDollarSign,
  Award,
  Palette,
  ExternalLink,
  Menu,
  Building2,
  LogOut,
  SlidersHorizontal
} from 'lucide-react';

// Modular Pages (Semua Fitur Utuh & Lengkap)
import Santri from '../../pages/Santri';
import BillsAndInvoices from '../../pages/BillsAndInvoices';
import Approvals from '../../pages/Approvals';
import Ledger from '../../pages/Ledger';
import PocketAndCash from '../../pages/PocketAndCash';
import AcademicMuhafadzoh from '../../pages/AcademicMuhafadzoh';
import SecurityKamtib from '../../pages/SecurityKamtib';
import TenantWebsiteBuilder from '../../pages/TenantWebsiteBuilder';
import SettingsAndAccounts from '../../pages/SettingsAndAccounts';

// Services & Context
import {
  firestoreGetDashboardStats,
  subscribeToCollection,
  getCollectionData
} from '../../services/firestoreService';
import { useSettings } from '../../context/SettingsContext';

export default function DashboardV2({ currentUser, onLogout, onOpenNfcModal, onBackToLanding }) {
  const { settings, isNfcEnabled } = useSettings();
  
  // Navigation: 10 Menu Lengkap Sesuai Permintaan & Role
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data Overview
  const [stats, setStats] = useState(firestoreGetDashboardStats());
  const [recentPocketTxs, setRecentPocketTxs] = useState([]);
  const [recentBills, setRecentBills] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const refreshOverviewData = () => {
    setStats(firestoreGetDashboardStats());
    setRecentPocketTxs(getCollectionData('pocket_transactions'));
    setRecentBills(getCollectionData('bills'));
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    refreshOverviewData();
    const unsubSantri = subscribeToCollection('santri', refreshOverviewData);
    const unsubBills = subscribeToCollection('bills', refreshOverviewData);
    const unsubPocket = subscribeToCollection('pocket_transactions', refreshOverviewData);
    return () => {
      unsubSantri();
      unsubBills();
      unsubPocket();
    };
  }, []);

  // 10 Menu Lengkap Berikon Outline Modern
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
    { id: 'santri', label: 'Data Santri & Migrasi', icon: Users, badge: `${stats.summary?.totalSantri || 0}` },
    { id: 'bills', label: 'Tagihan Massal & Kwitansi', icon: Receipt, badge: null },
    { id: 'approvals', label: 'Persetujuan / ACC', icon: CheckCircle2, badge: null },
    { id: 'ledger', label: 'Buku Besar & Kas Umum', icon: BookOpen, badge: null },
    { id: 'pocket-cash', label: 'Uang Saku Santri & POS', icon: CircleDollarSign, badge: 'NFC' },
    { id: 'academics', label: 'Akademik & Tahfidz', icon: Award, badge: null },
    { id: 'security', label: 'Keamanan (Kamtib)', icon: ShieldCheck, badge: null },
    { id: 'web-builder', label: 'Tampilan Web & Portal', icon: Palette, badge: null },
    { id: 'settings', label: 'Pengaturan Lembaga', icon: Settings, badge: null }
  ];

  // Render Tampilan Dashboard Overview (Woot Bento Premium Style)
  const renderBentoOverview = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* =================================================================== */}
        {/* SECTION TITLE DENGAN DOODLE SCRIBBLE KHAS WOOT                     */}
        {/* =================================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-[#18181B] tracking-tight">
                <span className="relative inline-block px-1">
                  <span className="relative z-10">Ringkasan</span>
                  <svg className="absolute -bottom-1 left-0 w-full h-3 text-[#7CFF4F] -z-0" viewBox="0 0 200 12" fill="none" preserveAspectRatio="none">
                    <path d="M2 9.5C50 2 150 2 198 9.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span>{' '}
                Eksekutif Operasional
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              Data terintegrasi real-time untuk pembukuan syahriyah, kasir kantin, dan perizinan santri.
            </p>
          </div>

          {/* Pill Category Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className="px-3.5 py-1.5 rounded-full bg-[#18181B] text-white font-bold flex items-center gap-1.5 shadow-sm"
            >
              <span>Semua</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">10</span>
            </button>
            <button
              onClick={() => setActiveMenu('bills')}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E4E4E7] text-zinc-700 hover:border-zinc-400 font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Keuangan</span>
              <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-[#0B5FFF] text-[10px]">3</span>
            </button>
            <button
              onClick={() => setActiveMenu('santri')}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E4E4E7] text-zinc-700 hover:border-zinc-400 font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Santri</span>
              <span className="px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-800 text-[10px]">{stats.summary?.totalSantri || 0}</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4 KARTU BENTO: 1 SOLID BLUE (#0B5FFF) + 3 PUTIH BERSIH BORDER 1PX   */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          
          {/* CARD 1: SOLID PRIMARY ELECTRIC BLUE (#0B5FFF) */}
          <div className="relative bg-[#0B5FFF] text-white rounded-3xl p-6 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#7CFF4F]">
                  Pembayaran Syahriyah
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-white border border-white/20">
                  Bulan Ini
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mb-2">
                Rp {((stats.summary?.totalIncomeMonth || 0) / 1000000).toFixed(1)} jt
              </div>
              <p className="text-xs text-white/90 font-medium leading-relaxed">
                {stats.summary?.paidBillsCount || 0} Tagihan terverifikasi lunas melalui kasir & QRIS online.
              </p>
            </div>

            <button
              onClick={() => setActiveMenu('bills')}
              className="mt-6 w-full py-3 rounded-2xl bg-[#7CFF4F] text-[#18181B] hover:bg-[#6be83f] font-black text-xs uppercase tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Kelola Tagihan SPP</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          </div>

          {/* CARD 2: PUTIH BERSIH - TOTAL SANTRI */}
          <div 
            onClick={() => setActiveMenu('santri')}
            className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between cursor-pointer hover:border-zinc-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  Total Santri Terdata
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                  +2.5% bln ini
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-2">
                {stats.summary?.totalSantri || 0}
              </div>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                {stats.summary?.activeSantriCount || 0} Santri mukim aktif • {stats.summary?.alumniSantriCount || 0} Alumni.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#0B5FFF]">
              <span>Buka Data Santri & KTS</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARD 3: PUTIH BERSIH - SALDO UANG SAKU CASHLESS */}
          <div 
            onClick={() => setActiveMenu('pocket-cash')}
            className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between cursor-pointer hover:border-zinc-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  Uang Saku Cashless
                </span>
                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100">
                  NFC POS
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-2">
                Rp {((stats.summary?.totalPocketBalance || 0) / 1000000).toFixed(2)} jt
              </div>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Saldo tersimpan di dompet digital santri untuk belanja kantin & koperasi.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Buka Kasir Kantin POS</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* CARD 4: PUTIH BERSIH - AKADEMIK TAHFIDZ */}
          <div 
            onClick={() => setActiveMenu('academics')}
            className="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between cursor-pointer hover:border-zinc-400 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  Akademik & Tahfidz
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0B5FFF] text-[10px] font-bold border border-blue-100">
                  Sorogan
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight mb-2">
                100%
              </div>
              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                Evaluasi setoran hafalan Al-Qur'an dan sorogan kitab kuning santri.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-[#0B5FFF]">
              <span>Buka Modul Akademik</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

        </div>

        {/* =================================================================== */}
        {/* GRAFIK ARUS KAS BULANAN (CLEAN BENTO CARD)                          */}
        {/* =================================================================== */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-black text-base text-[#18181B] tracking-tight">
                Arus Kas Lembaga & Tren Pembukuan (Buku Kas Umum)
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                Perbandingan mutasi kas masuk dan operasional pesantren 6 bulan terakhir.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#0B5FFF]">
                <span className="w-3 h-3 rounded-full bg-[#0B5FFF]" /> Kas Masuk
              </span>
              <span className="flex items-center gap-1.5 text-[#FF7A00]">
                <span className="w-3 h-3 rounded-full bg-[#FF7A00]" /> Pengeluaran
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-6 border-b border-zinc-100">
            {stats.monthlyChart.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-2 h-32">
                  <div
                    style={{ height: `${Math.min(100, Math.max(15, (m.income / 50000000) * 100))}%` }}
                    className="w-4 sm:w-7 bg-[#0B5FFF] rounded-t-xl transition-all"
                    title={`Pemasukan: Rp ${m.income.toLocaleString('id-ID')}`}
                  />
                  <div
                    style={{ height: `${Math.min(100, Math.max(10, (m.expense / 50000000) * 100))}%` }}
                    className="w-4 sm:w-7 bg-[#FF7A00] rounded-t-xl transition-all"
                    title={`Pengeluaran: Rp ${m.expense.toLocaleString('id-ID')}`}
                  />
                </div>
                <span className="text-[11px] text-zinc-500 font-bold truncate w-full text-center">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================================== */}
        {/* DUA BENTO CARD RINGKASAN TRANSAKSI CEPAT                             */}
        {/* =================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Mutasi Saku Santri */}
          <div className="p-6 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#18181B]">Mutasi Uang Saku Real-Time</h3>
              <button 
                onClick={() => setActiveMenu('pocket-cash')} 
                className="text-[#0B5FFF] font-bold text-xs hover:underline flex items-center gap-1"
              >
                <span>Buka Kasir POS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-zinc-100 text-xs">
              {recentPocketTxs.slice(0, 4).map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">{tx.santriNama || 'Santri'}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">{tx.note} • {tx.merchantName}</div>
                  </div>
                  <span className={`font-black ${tx.type === 'TOPUP' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'TOPUP' ? '+' : '-'} Rp {(tx.amount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
              {recentPocketTxs.length === 0 && (
                <div className="py-6 text-center text-zinc-400 text-xs">Belum ada transaksi saku hari ini.</div>
              )}
            </div>
          </div>

          {/* Status Tagihan Syahriyah */}
          <div className="p-6 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-[#18181B]">Status Tagihan Syahriyah</h3>
              <button 
                onClick={() => setActiveMenu('bills')} 
                className="text-[#0B5FFF] font-bold text-xs hover:underline flex items-center gap-1"
              >
                <span>Kelola Tagihan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-zinc-100 text-xs">
              {recentBills.slice(0, 4).map(bill => (
                <div key={bill.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-zinc-900">{bill.santri?.nama || 'Santri'}</div>
                    <div className="text-[10px] text-zinc-400 font-medium">{bill.title} ({bill.hijriMonth})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-700">Rp {(bill.amount || 0).toLocaleString('id-ID')}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      bill.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {bill.status === 'PAID' ? 'Lunas' : 'Belum'}
                    </span>
                  </div>
                </div>
              ))}
              {recentBills.length === 0 && (
                <div className="py-6 text-center text-zinc-400 text-xs">Belum ada tagihan aktif.</div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  };

  // Switch Konten Utama: 10 Modul Lengkap Tidak Ada yang Hilang!
  const renderMainContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return renderBentoOverview();
      case 'santri':
        return <Santri key={refreshKey} onOpenNfcModal={onOpenNfcModal} />;
      case 'bills':
        return <BillsAndInvoices key={refreshKey} />;
      case 'approvals':
        return <Approvals key={refreshKey} />;
      case 'ledger':
        return <Ledger key={refreshKey} />;
      case 'pocket-cash':
        return <PocketAndCash key={refreshKey} onOpenNfcModal={onOpenNfcModal} currentUser={currentUser} />;
      case 'academics':
        return <AcademicMuhafadzoh key={refreshKey} />;
      case 'security':
        return <SecurityKamtib key={refreshKey} onOpenNfcModal={onOpenNfcModal} />;
      case 'web-builder':
        return <TenantWebsiteBuilder key={refreshKey} />;
      case 'settings':
        return <SettingsAndAccounts key={refreshKey} />;
      default:
        return renderBentoOverview();
    }
  };

  return (
    <div className="min-h-screen bg-[#EBE6DF] text-[#18181B] font-sans antialiased selection:bg-[#0B5FFF] selection:text-white p-2 sm:p-4 lg:p-6">
      
      {/* Toast Notifikasi Minimalis */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Outer Shell Dashboard Berbentuk Super-Ellipse (#FAFAF8) */}
      <div className="bg-[#FAFAF8] rounded-3xl shadow-sm border border-[#DCD6CD] overflow-hidden flex flex-col lg:flex-row min-h-[94vh]">
        
        {/* ===================================================================== */}
        {/* 1. SIDEBAR KIRI MODERN: SEMUA 10 MENU LENGKAP & UTUH                  */}
        {/* ===================================================================== */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[#E4E4E7] p-5 flex flex-col justify-between bg-white flex-shrink-0">
          <div className="space-y-6">
            
            {/* Logo Box SIPESAND */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/logo-sipesand.png" 
                  alt="SIPESAND Logo" 
                  className="h-10 w-auto object-contain rounded-xl shadow-xs" 
                />
                <div>
                  <span className="font-['Righteous'] text-2xl text-[#0B5FFF] tracking-tight block leading-none">
                    SIPESAND
                  </span>
                  <span className="text-[10px] font-black text-zinc-400 tracking-wider uppercase block mt-0.5">
                    Pesantren ERP
                  </span>
                </div>
              </div>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Menu Navigasi 10 Fitur Lengkap (Woot Active Blue Pill Style) */}
            <nav className={`space-y-1 text-xs font-bold ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeMenu === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveMenu(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#0B5FFF] text-white font-extrabold shadow-sm'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Widget Bawah Sidebar (#0B5FFF) */}
          <div className="mt-6 pt-5 border-t border-zinc-100 space-y-3">
            <div className="p-4 rounded-3xl bg-[#0B5FFF] text-white space-y-1 shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#7CFF4F] block">
                Santri Aktif Terdata
              </span>
              <div className="text-2xl font-black">{stats.summary?.activeSantriCount || 0} Santri</div>
              <p className="text-[10px] text-white/80 flex items-center gap-1 pt-1 font-medium">
                <TrendingUp className="w-3 h-3 text-[#7CFF4F]" />
                <span>Terdata di Cloudbase</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-500 px-1 pt-1 font-semibold">
              <span className="truncate">{settings.NAMA_LEMBAGA?.substring(0, 16) || 'Pesantren'}...</span>
              {onLogout && (
                <button 
                  onClick={onLogout} 
                  className="text-rose-600 font-bold hover:underline flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar</span>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* 2. AREA KONTEN TENGAH + TOPBAR                                        */}
        {/* ===================================================================== */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-y-auto min-w-0">
          
          {/* Topbar: Judul, Search Capsule Bar Tengah, Notifikasi & Profil */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E4E7]">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#18181B] tracking-tight">
                {menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-zinc-500 font-medium truncate max-w-md mt-0.5">
                {settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman'}
              </p>
            </div>

            {/* Search Capsule Bar Tengah Khas Woot */}
            <div className="relative flex-1 max-w-sm">
              <div className="relative flex items-center bg-white rounded-full border border-[#E4E4E7] shadow-sm p-1 focus-within:border-[#0B5FFF]">
                <Search className="w-4 h-4 text-zinc-400 ml-3 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari santri, tagihan, transaksi..."
                  className="w-full bg-transparent text-xs text-zinc-900 placeholder-zinc-400 font-semibold focus:outline-none py-1"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 mr-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="w-7 h-7 rounded-full bg-[#7CFF4F] text-black flex items-center justify-center flex-shrink-0">
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            </div>

            {/* User Info & Quick Action Button */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-900">{currentUser?.name || 'Administrator'}</span>
                <span className="text-[10px] font-black text-[#0B5FFF] uppercase tracking-wider">
                  {currentUser?.role || 'Super Admin'}
                </span>
              </div>
              <div className="w-9 h-9 rounded-2xl bg-[#18181B] text-white flex items-center justify-center font-black text-xs shadow-sm">
                {(currentUser?.name || 'A').charAt(0)}
              </div>
            </div>
          </header>

          {/* Konten Halaman Aktif */}
          <div className="flex-1">
            {renderMainContent()}
          </div>

          {/* Footer Minimalis */}
          <footer className="pt-4 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
            <div>
              SIPESAND Digital Boarding School • Partisi Multi-Tenant Terenkripsi
            </div>
            <div>
              Hak Cipta © 2026 SIPESAND
            </div>
          </footer>

        </main>

      </div>

    </div>
  );
}
