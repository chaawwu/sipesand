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
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Download,
  Trash2,
  Edit,
  Archive,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Layers,
  CircleDollarSign,
  Award,
  Palette,
  ExternalLink,
  Menu
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
  const [notificationCount, setNotificationCount] = useState(3);
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

  // 10 Menu Lengkap Berikon
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard, badge: null },
    { id: 'santri', label: 'Data Santri & Migrasi', icon: Users, badge: `${stats.summary?.totalSantri || 0}` },
    { id: 'bills', label: 'Tagihan Massal & Kwitansi', icon: Receipt, badge: null },
    { id: 'approvals', label: 'Persetujuan / ACC', icon: CheckCircle2, badge: null },
    { id: 'ledger', label: 'Buku Besar & Kas Umum', icon: BookOpen, badge: null },
    { id: 'pocket-cash', label: 'Uang Saku Santri & POS', icon: CircleDollarSign, badge: 'NFC' },
    { id: 'academics', label: 'Divisi Kepala Pondok', icon: Award, badge: null },
    { id: 'security', label: 'Divisi Keamanan (Kamtib)', icon: ShieldCheck, badge: null },
    { id: 'web-builder', label: 'Tampilan Web & Portal', icon: Palette, badge: null },
    { id: 'settings', label: 'Pengaturan Lembaga & Akun', icon: Settings, badge: null }
  ];

  // Render Tampilan Dashboard Overview (GetDone Bento Pastel Style)
  const renderBentoOverview = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        
        {/* 4 Card Statistik Pastel (Sesuai Foto Referensi GetDone) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Mint Green: Total Santri */}
          <div 
            onClick={() => setActiveMenu('santri')}
            className="p-5 rounded-3xl bg-[#E8F8F5] border border-emerald-100 space-y-2 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-800">Total Santri</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                +2.5% bln ini
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.summary?.totalSantri || 0}</div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1.5 pt-1">
              <span>{stats.summary?.activeSantriCount || 0} Aktif</span>
              <span>•</span>
              <span>{stats.summary?.alumniSantriCount || 0} Alumni</span>
            </div>
          </div>

          {/* 2. Soft Peach: Pembayaran Bulan Ini */}
          <div 
            onClick={() => setActiveMenu('bills')}
            className="p-5 rounded-3xl bg-[#FFF4EB] border border-amber-100 space-y-2 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-800">Pembayaran Bulan Ini</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                Syahriyah
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              Rp {((stats.summary?.totalIncomeMonth || 0) / 1000000).toFixed(1)} jt
            </div>
            <div className="text-[10px] text-amber-700 font-bold pt-1">
              {stats.summary?.paidBillsCount || 0} Tagihan Lunas Terverifikasi
            </div>
          </div>

          {/* 3. Soft Lavender: Saldo Saku */}
          <div 
            onClick={() => setActiveMenu('pocket-cash')}
            className="p-5 rounded-3xl bg-[#F3E8FF] border border-purple-100 space-y-2 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-800">Saldo Saku Santri</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full">
                Cashless
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              Rp {((stats.summary?.totalPocketBalance || 0) / 1000000).toFixed(2)} jt
            </div>
            <div className="text-[10px] text-purple-700 font-bold pt-1">
              Tap Kartu NFC di Kantin & Koperasi
            </div>
          </div>

          {/* 4. Soft Blue: Hafalan / Tahfidz Mutqin */}
          <div 
            onClick={() => setActiveMenu('academics')}
            className="p-5 rounded-3xl bg-[#EBF3FF] border border-blue-100 space-y-2 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-blue-800">Tahfidz Mutqin</span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                Capaian
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.summary?.mutqinTahfidzCount || 12} Santri</div>
            <div className="text-[10px] text-blue-700 font-bold pt-1">
              Hafalan Mutqin 1 - 30 Juz
            </div>
          </div>

        </div>

        {/* Grafik Arus Kas Pemasukan & Pengeluaran */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Grafik Arus Pemasukan & Pengeluaran Kas</h3>
              <p className="text-[11px] text-slate-400">Pencatatan kas operasional & syahriyah pesantren 6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-blue-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Pemasukan
              </span>
              <span className="flex items-center gap-1.5 font-bold text-amber-500">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pengeluaran
              </span>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-slate-100">
            {stats.monthlyChart.map((m, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-32">
                  <div
                    style={{ height: `${(m.income / 50000000) * 100}%` }}
                    className="w-4 sm:w-6 bg-blue-600 rounded-t-lg transition-all"
                    title={`Pemasukan: Rp ${m.income.toLocaleString('id-ID')}`}
                  />
                  <div
                    style={{ height: `${(m.expense / 50000000) * 100}%` }}
                    className="w-4 sm:w-6 bg-amber-400 rounded-t-lg transition-all"
                    title={`Pengeluaran: Rp ${m.expense.toLocaleString('id-ID')}`}
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-medium truncate w-full text-center">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2 Kolom Ringkasan Cepat */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Transaksi Saku Terakhir */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Transaksi Saku Santri Real-Time</h3>
              <button onClick={() => setActiveMenu('pocket-cash')} className="text-blue-600 font-bold text-xs hover:underline">
                Buka Kasir POS →
              </button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {recentPocketTxs.slice(0, 4).map(tx => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{tx.santriNama || 'Santri'}</div>
                    <div className="text-[10px] text-slate-400">{tx.note} • {tx.merchantName}</div>
                  </div>
                  <span className={`font-black ${tx.type === 'TOPUP' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'TOPUP' ? '+' : '-'} Rp {(tx.amount || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tagihan Syahriyah Terakhir */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900">Status Tagihan Syahriyah</h3>
              <button onClick={() => setActiveMenu('bills')} className="text-blue-600 font-bold text-xs hover:underline">
                Kelola Tagihan →
              </button>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {recentBills.slice(0, 4).map(bill => (
                <div key={bill.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{bill.santri?.nama || 'Santri'}</div>
                    <div className="text-[10px] text-slate-400">{bill.title} ({bill.hijriMonth})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Rp {(bill.amount || 0).toLocaleString('id-ID')}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {bill.status === 'PAID' ? 'LUNAS' : 'BELUM'}
                    </span>
                  </div>
                </div>
              ))}
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
    <div className="min-h-screen bg-[#F4F6FA] text-slate-800 font-sans p-2 sm:p-4 md:p-6 selection:bg-blue-600 selection:text-white">
      
      {/* Toast Notifikasi */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Outer Shell Dashboard (Mirip Foto Referensi GetDone) */}
      <div className="bg-white rounded-[28px] sm:rounded-[36px] shadow-sm border border-slate-200/80 overflow-hidden flex flex-col lg:flex-row min-h-[92vh]">
        
        {/* ===================================================================== */}
        {/* 1. SIDEBAR KIRI MODERN: SEMUA 10 MENU LENGKAP & UTUH                  */}
        {/* ===================================================================== */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 flex flex-col justify-between bg-white flex-shrink-0">
          <div className="space-y-6">
            
            {/* Logo Box SIPESAND */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-['Righteous'] text-xl text-slate-900 tracking-tight block">SIPESAND</span>
                  <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">Smart Pesantren V2</span>
                </div>
              </div>
              
              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Menu Navigasi 10 Fitur Lengkap (Linear / GetDone Active Pill Style) */}
            <nav className={`space-y-1 text-xs font-medium ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
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
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

          </div>

          {/* Widget Biru di Bawah Sidebar (GetDone Style) */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="p-4 rounded-3xl bg-blue-600 text-white space-y-1 shadow-md shadow-blue-500/20">
              <span className="text-[10px] font-semibold text-blue-200 block uppercase">Santri Aktif Terdata</span>
              <div className="text-2xl font-black">{stats.summary?.activeSantriCount || 0} Santri</div>
              <p className="text-[10px] text-blue-100 flex items-center gap-1 pt-1">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span>+2.5% dari bulan lalu</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span className="truncate">{settings.NAMA_LEMBAGA?.substring(0, 16) || 'Darul Rahman'}...</span>
              {onLogout && (
                <button onClick={onLogout} className="text-rose-600 font-bold hover:underline">
                  Keluar
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* 2. AREA KONTEN TENGAH + TOPBAR                                        */}
        {/* ===================================================================== */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col justify-between space-y-6 overflow-y-auto min-w-0">
          
          {/* Topbar: Judul, Search Bar Tengah, Notifikasi & Profil */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {menuItems.find(m => m.id === activeMenu)?.label || 'Dashboard'}
              </h1>
              <p className="text-xs text-slate-400 truncate max-w-md">
                {settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari'}
              </p>
            </div>

            {/* Search Bar Tengah Berbentuk Pill (GetDone Style) */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search di seluruh modul..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Aksi Topbar Kanan: NFC Scanner Simulator & Profil */}
            <div className="flex items-center gap-3">
              {isNfcEnabled && onOpenNfcModal && (
                <button
                  onClick={onOpenNfcModal}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200/60 flex items-center gap-1.5 transition-colors"
                >
                  <span>Scan NFC</span>
                </button>
              )}

              <button 
                onClick={() => showToast(`Ada ${notificationCount} pengumuman dan notifikasi baru.`, 'success')}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center relative transition-colors"
              >
                <Bell className="w-4 h-4" />
                {notificationCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
                )}
              </button>

              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                  {currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="font-bold text-xs text-slate-900 block leading-tight">{currentUser?.name || 'Administrator'}</span>
                  <span className="text-[10px] text-slate-400 font-mono block">{currentUser?.role || 'SUPER_ADMIN'}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Area Konten Dinamis (Semua 10 Fitur Lengkap) */}
          <div className="flex-1">
            {renderMainContent()}
          </div>

        </main>

        {/* ===================================================================== */}
        {/* 3. PANEL CEPAT KANAN (Khusus Tampilan 'dashboard' GetDone Style)      */}
        {/* ===================================================================== */}
        {activeMenu === 'dashboard' && (
          <aside className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 bg-slate-50/50 space-y-6 flex-shrink-0">
            
            {/* Quick Action Card (Mirip 'Create a new task' di GetDone) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-xs text-slate-900">Aksi Cepat Pesantren</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveMenu('santri')}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Santri Baru</span>
                </button>

                <button
                  onClick={() => setActiveMenu('pocket-cash')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Buka Kasir POS & Saku</span>
                </button>

                <button
                  onClick={() => setActiveMenu('bills')}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Terbitkan Tagihan Syahriyah</span>
                </button>
              </div>
            </div>

            {/* Staf Pengurus Online (Mirip 'Team Members' di GetDone) */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-extrabold text-xs text-slate-900">Pengurus Devisi Aktif</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                      KH
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">K.H. Syarif H.</div>
                      <div className="text-[10px] text-slate-400">Pengasuh Pesantren</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
                      UR
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Ustadz Ridwan</div>
                      <div className="text-[10px] text-slate-400">Bendahara Saku</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                      UD
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Ustadz Danang</div>
                      <div className="text-[10px] text-slate-400">Kamtib & Perizinan</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            </div>

          </aside>
        )}

      </div>

    </div>
  );
}
