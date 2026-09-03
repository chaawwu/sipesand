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
  Upload,
  Trash2,
  Edit,
  Archive,
  Printer,
  ChevronRight,
  ChevronLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  ArrowRightLeft,
  Calendar,
  Layers,
  Sparkles,
  UserCheck,
  GraduationCap
} from 'lucide-react';
import {
  firestoreGetSantri,
  firestoreCreateSantri,
  firestoreUpdateSantri,
  firestoreDeleteSantri,
  firestoreArchiveSantri,
  firestoreRunPocketTransaction,
  firestoreTransferPocketBalance,
  firestoreGetBills,
  firestorePayBill,
  firestoreCreateBill,
  firestoreDeleteBill,
  firestoreGetDashboardStats,
  subscribeToCollection,
  getCollectionData
} from '../../services/firestoreService';
import { useSettings } from '../../context/SettingsContext';
import SantriIdCard from '../../components/SantriIdCard';

export default function DashboardV2({ currentUser, onLogout, onOpenNfcModal }) {
  const { settings } = useSettings();
  
  // Navigation
  const [activeMenu, setActiveMenu] = useState('dashboard'); // 'dashboard' | 'santri' | 'pembayaran' | 'saku' | 'tahfidz' | 'kamtib'
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Data States
  const [stats, setStats] = useState(firestoreGetDashboardStats());
  const [santriList, setSantriList] = useState([]);
  const [billsList, setBillsList] = useState([]);
  const [pocketTxs, setPocketTxs] = useState([]);

  // Filter States (Santri)
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterKamar, setFilterKamar] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAngkatan, setFilterAngkatan] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter States (Pembayaran)
  const [filterBulanHijri, setFilterBulanHijri] = useState('ALL');
  const [filterStatusBayar, setFilterStatusBayar] = useState('ALL');

  // Modals
  const [isSantriModalOpen, setIsSantriModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState(null);
  const [santriFormData, setSantriFormData] = useState({
    nama: '',
    nis: '',
    kelas: '10 IPA (KMI 4)',
    kamar: 'Asrama Umar bin Khattab',
    gender: 'L',
    namaWali: '',
    noHpWali: '',
    saldo_saku: 50000,
    status: 'AKTIF',
    angkatan: '2026',
    tahfidzJuz: 'Juz 30 Mutqin',
    foto: null
  });

  // Modal Saku (Top-Up / Kurangi)
  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [pocketModalType, setPocketModalType] = useState('TOPUP'); // 'TOPUP' | 'DEDUCT'
  const [selectedSantriForPocket, setSelectedSantriForPocket] = useState(null);
  const [pocketAmount, setPocketAmount] = useState('');
  const [pocketNote, setPocketNote] = useState('');

  // Modal Transfer Saku Antar-Santri
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferSenderId, setTransferSenderId] = useState('');
  const [transferReceiverId, setTransferReceiverId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Modal Kwitansi Print
  const [activeReceiptBill, setActiveReceiptBill] = useState(null);

  // KTS Card Preview
  const [idCardSantri, setIdCardSantri] = useState(null);

  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Muat & Sinkronisasi Data Real-Time
  const refreshAll = () => {
    setStats(firestoreGetDashboardStats());
    setSantriList(firestoreGetSantri());
    setBillsList(firestoreGetBills());
    setPocketTxs(getCollectionData('pocket_transactions'));
  };

  useEffect(() => {
    refreshAll();
    const unsubSantri = subscribeToCollection('santri', refreshAll);
    const unsubBills = subscribeToCollection('bills', refreshAll);
    const unsubPocket = subscribeToCollection('pocket_transactions', refreshAll);
    return () => {
      unsubSantri();
      unsubBills();
      unsubPocket();
    };
  }, []);

  // Filtered Santri
  const filteredSantri = useMemo(() => {
    return santriList.filter(s => {
      const matchSearch = !searchQuery || 
        (s.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.nis || '').includes(searchQuery) ||
        (s.kamar || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchKelas = filterKelas === 'ALL' || s.kelas === filterKelas;
      const matchKamar = filterKamar === 'ALL' || s.kamar === filterKamar;
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchAngkatan = filterAngkatan === 'ALL' || s.angkatan === filterAngkatan;
      return matchSearch && matchKelas && matchKamar && matchStatus && matchAngkatan;
    });
  }, [santriList, searchQuery, filterKelas, filterKamar, filterStatus, filterAngkatan]);

  // Pagination Santri
  const totalPages = Math.ceil(filteredSantri.length / itemsPerPage) || 1;
  const paginatedSantri = filteredSantri.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filtered Bills
  const filteredBills = useMemo(() => {
    return billsList.filter(b => {
      const matchSearch = !searchQuery || 
        (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.santri?.nama || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.receiptNo || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchMonth = filterBulanHijri === 'ALL' || b.hijriMonth === filterBulanHijri;
      const matchStatus = filterStatusBayar === 'ALL' || b.status === filterStatusBayar;
      return matchSearch && matchMonth && matchStatus;
    });
  }, [billsList, searchQuery, filterBulanHijri, filterStatusBayar]);

  // Handler: Tambah / Edit Santri
  const handleSaveSantri = (e) => {
    e.preventDefault();
    if (!santriFormData.nama) {
      showToast('Nama santri wajib diisi!', 'error');
      return;
    }

    try {
      if (editingSantri) {
        firestoreUpdateSantri(editingSantri.id, santriFormData);
        showToast(`Data santri ${santriFormData.nama} berhasil diperbarui!`, 'success');
      } else {
        firestoreCreateSantri(santriFormData);
        showToast(`Santri baru ${santriFormData.nama} berhasil terdaftar!`, 'success');
      }
      setIsSantriModalOpen(false);
      setEditingSantri(null);
      refreshAll();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan santri', 'error');
    }
  };

  // Handler: Hapus Santri Permanen
  const handleDeleteSantri = (id, nama) => {
    if (window.confirm(`Yakin ingin menghapus santri "${nama}" secara permanen dari database?`)) {
      try {
        firestoreDeleteSantri(id);
        showToast(`Santri ${nama} berhasil dihapus permanen!`, 'success');
        refreshAll();
      } catch (err) {
        showToast(err.message || 'Gagal menghapus santri', 'error');
      }
    }
  };

  // Handler: Arsipkan Santri (Alumni)
  const handleArchiveSantri = (id, nama) => {
    try {
      firestoreArchiveSantri(id);
      showToast(`Santri ${nama} dipindahkan ke status Alumni / Arsip.`, 'success');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Transaksi Saldo Saku (Atomik Firebase)
  const handlePocketTransaction = (e) => {
    e.preventDefault();
    const amount = parseFloat(pocketAmount);
    if (!amount || amount <= 0) {
      showToast('Masukkan nominal yang valid!', 'error');
      return;
    }

    try {
      const res = firestoreRunPocketTransaction({
        santriId: selectedSantriForPocket.id,
        type: pocketModalType,
        amount,
        note: pocketNote || (pocketModalType === 'TOPUP' ? 'Top-Up Saldo Uang Saku' : 'Pengurangan Belanja Kantin'),
        merchantName: currentUser?.name || 'Kasir Smart Pesantren'
      });
      showToast(res.message, 'success');
      setIsPocketModalOpen(false);
      setPocketAmount('');
      setPocketNote('');
      refreshAll();
    } catch (err) {
      showToast(err.message || 'Gagal memproses saldo', 'error');
    }
  };

  // Handler: Transfer Antar Santri
  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (!transferSenderId || !transferReceiverId || transferSenderId === transferReceiverId) {
      showToast('Pilih santri pengirim dan penerima yang berbeda!', 'error');
      return;
    }
    if (!amount || amount <= 0) {
      showToast('Nominal transfer harus lebih dari 0!', 'error');
      return;
    }

    try {
      const res = firestoreTransferPocketBalance({
        senderId: transferSenderId,
        receiverId: transferReceiverId,
        amount,
        note: transferNote
      });
      showToast(res.message, 'success');
      setIsTransferModalOpen(false);
      setTransferAmount('');
      setTransferNote('');
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Pelunasan Tagihan
  const handlePayBill = (bill) => {
    try {
      const res = firestorePayBill(bill.id, {
        paymentMethod: 'KAS_YAYASAN',
        payerName: bill.santri?.namaWali || 'Wali Santri'
      });
      showToast(res.message, 'success');
      setActiveReceiptBill(res.data);
      refreshAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handler: Export Data ke CSV / Excel
  const handleExportCSV = () => {
    const headers = ['ID', 'NIS', 'Nama', 'Kelas', 'Kamar', 'Status', 'Saldo Saku', 'Tahfidz', 'Nama Wali', 'No HP Wali'];
    const rows = filteredSantri.map(s => [
      s.id,
      `"${s.nis || ''}"`,
      `"${s.nama || ''}"`,
      `"${s.kelas || ''}"`,
      `"${s.kamar || ''}"`,
      s.status,
      s.saldo_saku || 0,
      `"${s.tahfidzJuz || ''}"`,
      `"${s.namaWali || ''}"`,
      `"${s.noHpWali || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `data_santri_${settings.NAMA_LEMBAGA || 'sipesand'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Data santri berhasil diekspor ke format CSV / Excel.', 'success');
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
        {/* 1. SIDEBAR KIRI MODERN (GetDone Style)                                */}
        {/* ===================================================================== */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-slate-100 p-6 flex flex-col justify-between bg-white flex-shrink-0">
          <div className="space-y-8">
            
            {/* Logo Box */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="font-['Righteous'] text-xl text-slate-900 tracking-tight block">SIPESAND</span>
                <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase block">Smart Pesantren V2</span>
              </div>
            </div>

            {/* Menu Navigasi Berikon */}
            <nav className="space-y-1.5 text-xs font-medium">
              <button
                onClick={() => setActiveMenu('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'dashboard'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard Utama</span>
              </button>

              <button
                onClick={() => setActiveMenu('santri')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'santri'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Data Santri & KTS</span>
              </button>

              <button
                onClick={() => setActiveMenu('pembayaran')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'pembayaran'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Pembayaran & SPP</span>
              </button>

              <button
                onClick={() => setActiveMenu('saku')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'saku'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Saldo Saku & Kasir</span>
              </button>

              <button
                onClick={() => setActiveMenu('tahfidz')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'tahfidz'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Hafalan / Tahfidz</span>
              </button>

              <button
                onClick={() => setActiveMenu('kamtib')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                  activeMenu === 'kamtib'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Keamanan Gerbang</span>
              </button>
            </nav>

          </div>

          {/* Widget Biru di Bawah Sidebar (GetDone Style) */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="p-4 rounded-3xl bg-blue-600 text-white space-y-1 shadow-md shadow-blue-500/20">
              <span className="text-[10px] font-semibold text-blue-200 block uppercase">Santri Aktif Terdata</span>
              <div className="text-2xl font-black">{stats.summary.activeSantriCount} Santri</div>
              <p className="text-[10px] text-blue-100 flex items-center gap-1 pt-1">
                <TrendingUp className="w-3 h-3 text-emerald-300" />
                <span>+2.5% dari bulan lalu</span>
              </p>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>{settings.NAMA_LEMBAGA?.substring(0, 18) || 'Darul Rahman'}...</span>
              <button onClick={onLogout} className="text-rose-600 font-bold hover:underline">
                Keluar
              </button>
            </div>
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* 2. AREA KONTEN TENGAH + TOPBAR                                        */}
        {/* ===================================================================== */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          {/* Topbar: Judul, Search Bar Tengah, Notifikasi & Profil */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeMenu === 'dashboard' && 'Daily Overview & Statistik'}
                {activeMenu === 'santri' && 'Buku Induk Santri & KTS'}
                {activeMenu === 'pembayaran' && 'Riwayat Tagihan & Pembayaran'}
                {activeMenu === 'saku' && 'Uang Saku & Transaksi Kasir'}
                {activeMenu === 'tahfidz' && 'Progres Hafalan Al-Qur\'an'}
                {activeMenu === 'kamtib' && 'Keamanan & Perizinan Gerbang'}
              </h1>
              <p className="text-xs text-slate-400">
                {settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari'}
              </p>
            </div>

            {/* Search Bar Tengah Berbentuk Pill */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search santri, NIS, kamar, tagihan..."
                className="w-full pl-9 pr-4 py-2 bg-slate-100/80 border border-slate-200/60 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Aksi Topbar Kanan */}
            <div className="flex items-center gap-3">
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

          {/* =================================================================== */}
          {/* TAB 1: DASHBOARD UTAMA                                              */}
          {/* =================================================================== */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Card Statistik 4 Warna Lembut (Pastel GetDone Style) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Mint Green: Total Santri */}
                <div className="p-5 rounded-3xl bg-[#E8F8F5] border border-emerald-100 space-y-2">
                  <span className="text-[11px] font-semibold text-emerald-800 block">Total Santri</span>
                  <div className="text-3xl font-black text-slate-900">{stats.summary.totalSantri}</div>
                  <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span>{stats.summary.activeSantriCount} Aktif</span>
                    <span>•</span>
                    <span>{stats.summary.alumniSantriCount} Alumni</span>
                  </div>
                </div>

                {/* 2. Soft Peach: Pembayaran Bulan Ini */}
                <div className="p-5 rounded-3xl bg-[#FFF4EB] border border-amber-100 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-800 block">Pembayaran Bulan Ini</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    Rp {(stats.summary.totalIncomeMonth / 1000000).toFixed(1)} jt
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold">
                    {stats.summary.paidBillsCount} Tagihan Lunas
                  </div>
                </div>

                {/* 3. Soft Lavender: Saldo Saku */}
                <div className="p-5 rounded-3xl bg-[#F3E8FF] border border-purple-100 space-y-2">
                  <span className="text-[11px] font-semibold text-purple-800 block">Saldo Saku Santri</span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">
                    Rp {(stats.summary.totalPocketBalance / 1000000).toFixed(2)} jt
                  </div>
                  <div className="text-[10px] text-purple-700 font-bold">
                    100% Cashless di Kantin
                  </div>
                </div>

                {/* 4. Soft Blue: Hafalan / Tahfidz */}
                <div className="p-5 rounded-3xl bg-[#EBF3FF] border border-blue-100 space-y-2">
                  <span className="text-[11px] font-semibold text-blue-800 block">Tahfidz Mutqin</span>
                  <div className="text-3xl font-black text-slate-900">{stats.summary.mutqinTahfidzCount} Santri</div>
                  <div className="text-[10px] text-blue-700 font-bold">
                    Capaian Juz 1-30 Lengkap
                  </div>
                </div>

              </div>

              {/* Grafik Pemasukan & Pengeluaran Arus Kas */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Grafik Arus Pemasukan & Pengeluaran</h3>
                    <p className="text-[11px] text-slate-400">Pencatatan real-time kas santri 6 bulan terakhir</p>
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
                        {/* Bar Income */}
                        <div
                          style={{ height: `${(m.income / 50000000) * 100}%` }}
                          className="w-4 sm:w-6 bg-blue-600 rounded-t-lg transition-all"
                          title={`Pemasukan: Rp ${m.income.toLocaleString('id-ID')}`}
                        />
                        {/* Bar Expense */}
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

              {/* Feed Santri Terbaru & Transaksi Terakhir */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Transaksi Saku Terakhir */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Transaksi Kasir Saku Terakhir</h3>
                    <button onClick={() => setActiveMenu('saku')} className="text-blue-600 font-bold text-xs hover:underline">
                      Lihat Semua
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {pocketTxs.slice(0, 4).map(tx => (
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

                {/* Status Tagihan Terakhir */}
                <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-slate-900">Tagihan Syahriyah</h3>
                    <button onClick={() => setActiveMenu('pembayaran')} className="text-blue-600 font-bold text-xs hover:underline">
                      Kelola Tagihan
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 text-xs">
                    {billsList.slice(0, 4).map(bill => (
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
          )}

          {/* =================================================================== */}
          {/* TAB 2: DATA SANTRI & KTS                                            */}
          {/* =================================================================== */}
          {activeMenu === 'santri' && (
            <div className="space-y-6">
              
              {/* Header Bar Modul Santri */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEditingSantri(null);
                      setSantriFormData({
                        nama: '',
                        nis: `2026${Math.floor(1000 + Math.random() * 9000)}`,
                        kelas: '10 IPA (KMI 4)',
                        kamar: 'Asrama Umar bin Khattab',
                        gender: 'L',
                        namaWali: '',
                        noHpWali: '',
                        saldo_saku: 50000,
                        status: 'AKTIF',
                        angkatan: '2026',
                        tahfidzJuz: 'Juz 30 Mutqin',
                        foto: null
                      });
                      setIsSantriModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Santri Baru</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Filter Dropdowns */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="AKTIF">Aktif</option>
                    <option value="ALUMNI">Alumni / Arsip</option>
                  </select>

                  <select
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ALL">Semua Kelas</option>
                    <option value="X MA (KMI 4)">X MA (KMI 4)</option>
                    <option value="XI MA (KMI 5)">XI MA (KMI 5)</option>
                    <option value="XII MA (KMI 6)">XII MA (KMI 6)</option>
                  </select>
                </div>
              </div>

              {/* Tabel Santri Modern */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Foto & Profil Santri</th>
                        <th className="py-4 px-4">Kelas / Kamar</th>
                        <th className="py-4 px-4">Hafalan Tahfidz</th>
                        <th className="py-4 px-4">Saldo Saku</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-center">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedSantri.map(s => (
                        <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                                {s.foto ? (
                                  <img src={s.foto} alt={s.nama} className="w-full h-full object-cover" />
                                ) : (
                                  <Users className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-900 text-sm">{s.nama}</h4>
                                <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} • {s.gender === 'L' ? 'Putra' : 'Putri'}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-slate-600">
                            <div className="font-semibold text-slate-800">{s.kelas}</div>
                            <div className="text-[10px] text-slate-400">{s.kamar}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200/60">
                              {s.tahfidzJuz || 'Juz 30'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900">
                              Rp {(s.saldo_saku || 0).toLocaleString('id-ID')}
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSantriForPocket(s);
                                setPocketModalType('TOPUP');
                                setIsPocketModalOpen(true);
                              }}
                              className="text-[10px] text-blue-600 font-bold hover:underline"
                            >
                              + Top-Up Saku
                            </button>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              s.status === 'AKTIF' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {s.status}
                            </span>
                          </td>

                          <td className="py-3.5 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setIdCardSantri(s)}
                                title="Lihat Kartu Santri (KTS CR-80)"
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingSantri(s);
                                  setSantriFormData({ ...s });
                                  setIsSantriModalOpen(true);
                                }}
                                title="Edit Santri"
                                className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleArchiveSantri(s.id, s.nama)}
                                title="Arsipkan / Jadikan Alumni"
                                className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSantri(s.id, s.nama)}
                                title="Hapus Permanen"
                                className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredSantri.length)} dari {filteredSantri.length} santri
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-slate-800">Hal {currentPage} / {totalPages}</span>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30 hover:bg-slate-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 3: PEMBAYARAN & SYAHRIYAH                                       */}
          {/* =================================================================== */}
          {activeMenu === 'pembayaran' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Billing Syahriyah & Kwitansi Resmi</h3>
                  <p className="text-xs text-slate-400">Pencatatan tagihan dan cetak bukti pembayaran santri</p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <select
                    value={filterStatusBayar}
                    onChange={(e) => setFilterStatusBayar(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ALL">Semua Status</option>
                    <option value="PAID">Lunas (PAID)</option>
                    <option value="UNPAID">Belum Lunas (UNPAID)</option>
                  </select>

                  <select
                    value={filterBulanHijri}
                    onChange={(e) => setFilterBulanHijri(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="ALL">Semua Bulan Hijriyah</option>
                    <option value="Muharram">Muharram</option>
                    <option value="Safar">Safar</option>
                    <option value="Rabiul Awal">Rabiul Awal</option>
                    <option value="Rajab">Rajab</option>
                    <option value="Sya'ban">Sya'ban</option>
                    <option value="Ramadhan">Ramadhan</option>
                    <option value="Syawal">Syawal</option>
                  </select>
                </div>
              </div>

              {/* Tabel Tagihan */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-4 px-6">Santri</th>
                        <th className="py-4 px-4">Pos Tagihan</th>
                        <th className="py-4 px-4">Periode Hijriyah</th>
                        <th className="py-4 px-4">Nominal</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-center">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBills.map(bill => (
                        <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-6 font-bold text-slate-900">
                            {bill.santri?.nama || 'Santri'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">{bill.title}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-600">{bill.hijriMonth} {bill.hijriYear}</td>
                          <td className="py-3.5 px-4 font-bold text-slate-900">
                            Rp {(bill.amount || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {bill.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                            </span>
                          </td>
                          <td className="py-3.5 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {bill.status === 'UNPAID' ? (
                                <button
                                  onClick={() => handlePayBill(bill)}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors"
                                >
                                  Bayar Sekarang
                                </button>
                              ) : (
                                <button
                                  onClick={() => setActiveReceiptBill(bill)}
                                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold text-[10px] flex items-center gap-1"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Kwitansi PDF</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* TAB 4: SALDO SAKU & KASIR (TRANSAKSI ATOMIK FIREBASE)              */}
          {/* =================================================================== */}
          {activeMenu === 'saku' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Uang Saku Santri & Kasir POS</h3>
                  <p className="text-xs text-slate-400">Transaksi non-tunai, top-up, belanja kantin, dan transfer antar-santri</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    <span>Transfer Antar-Santri</span>
                  </button>
                </div>
              </div>

              {/* Feed Transaksi Saku */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900">Riwayat Transaksi Uang Saku Real-Time</h4>
                <div className="divide-y divide-slate-100 text-xs">
                  {pocketTxs.map(tx => (
                    <div key={tx.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                          tx.type === 'TOPUP' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.type === 'TOPUP' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{tx.santriNama || `Santri #${tx.santriId}`}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {tx.merchantName} • {new Date(tx.createdAt).toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black ${tx.type === 'TOPUP' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'TOPUP' ? '+' : '-'} Rp {(tx.amount || 0).toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Sisa: Rp {(tx.currentBalance || 0).toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>

        {/* ===================================================================== */}
        {/* 3. PANEL CEPAT KANAN (Create Task & Team - GetDone Style)            */}
        {/* ===================================================================== */}
        <aside className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-100 p-6 bg-slate-50/50 space-y-6 flex-shrink-0">
          
          {/* Quick Action Card (Mirip 'Create a new task' di GetDone) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-slate-900">Catat Transaksi Cepat</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setSelectedSantriForPocket(santriList[0] || null);
                  setPocketModalType('TOPUP');
                  setIsPocketModalOpen(true);
                }}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Top-Up Saldo Uang Saku</span>
              </button>

              <button
                onClick={() => {
                  setSelectedSantriForPocket(santriList[0] || null);
                  setPocketModalType('DEDUCT');
                  setIsPocketModalOpen(true);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Kasir Belanja Kantin (NFC)</span>
              </button>
            </div>
          </div>

          {/* Staf Pengurus Online (Mirip 'Team Members' di GetDone) */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-slate-900">Pengurus Pesantren Online</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-[10px]">
                    KH
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">K.H. Syarif H.</div>
                    <div className="text-[10px] text-slate-400">Pengasuh Pusat</div>
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
                    <div className="text-[10px] text-slate-400">Kamtib Gerbang</div>
                  </div>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>

        </aside>

      </div>

      {/* ======================================================================= */}
      {/* MODAL: TAMBAH / EDIT SANTRI                                             */}
      {/* ======================================================================= */}
      {isSantriModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-lg overflow-hidden shadow-2xl space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingSantri ? 'Edit Profil Santri' : 'Tambah Santri Baru'}
              </h3>
              <button onClick={() => setIsSantriModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSantri} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Santri *</label>
                <input
                  type="text"
                  required
                  value={santriFormData.nama}
                  onChange={(e) => setSantriFormData({ ...santriFormData, nama: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIS Santri</label>
                  <input
                    type="text"
                    value={santriFormData.nis}
                    onChange={(e) => setSantriFormData({ ...santriFormData, nis: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kelas Formal / Diniyah</label>
                  <input
                    type="text"
                    value={santriFormData.kelas}
                    onChange={(e) => setSantriFormData({ ...santriFormData, kelas: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kamar Asrama</label>
                  <input
                    type="text"
                    value={santriFormData.kamar}
                    onChange={(e) => setSantriFormData({ ...santriFormData, kamar: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hafalan Al-Qur'an (Tahfidz)</label>
                  <input
                    type="text"
                    value={santriFormData.tahfidzJuz}
                    onChange={(e) => setSantriFormData({ ...santriFormData, tahfidzJuz: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Wali</label>
                  <input
                    type="text"
                    value={santriFormData.namaWali}
                    onChange={(e) => setSantriFormData({ ...santriFormData, namaWali: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp Wali</label>
                  <input
                    type="text"
                    value={santriFormData.noHpWali}
                    onChange={(e) => setSantriFormData({ ...santriFormData, noHpWali: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Saldo Awal Uang Saku (Rp)</label>
                <input
                  type="number"
                  value={santriFormData.saldo_saku}
                  onChange={(e) => setSantriFormData({ ...santriFormData, saldo_saku: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSantriModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: TOP-UP / KURANGI SALDO SAKU                                      */}
      {/* ======================================================================= */}
      {isPocketModalOpen && selectedSantriForPocket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                {pocketModalType === 'TOPUP' ? 'Top-Up Saldo Uang Saku' : 'Kurangi Saldo (Belanja Kantin)'}
              </h3>
              <button onClick={() => setIsPocketModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs">
              <div className="font-bold text-slate-900">{selectedSantriForPocket.nama}</div>
              <div className="text-[10px] text-slate-500">Saldo Saat Ini: Rp {(selectedSantriForPocket.saldo_saku || 0).toLocaleString('id-ID')}</div>
            </div>

            <form onSubmit={handlePocketTransaction} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Transaksi (Rp) *</label>
                <input
                  type="number"
                  required
                  value={pocketAmount}
                  onChange={(e) => setPocketAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-sm font-black font-mono text-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan Transaksi</label>
                <input
                  type="text"
                  value={pocketNote}
                  onChange={(e) => setPocketNote(e.target.value)}
                  placeholder={pocketModalType === 'TOPUP' ? 'Transfer Wali / Tunai' : 'Kitab / Snack Kantin'}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl text-white font-bold shadow-md transition-all ${
                  pocketModalType === 'TOPUP' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Konfirmasi {pocketModalType === 'TOPUP' ? 'Top-Up' : 'Pengurangan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: TRANSFER SALDO ANTAR-SANTRI                                      */}
      {/* ======================================================================= */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Transfer Saldo Saku Antar-Santri</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Santri Pengirim (Debet) *</label>
                <select
                  value={transferSenderId}
                  onChange={(e) => setTransferSenderId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                >
                  <option value="">-- Pilih Pengirim --</option>
                  {santriList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} (Saldo: Rp {(s.saldo_saku || 0).toLocaleString('id-ID')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Santri Penerima (Kredit) *</label>
                <select
                  value={transferReceiverId}
                  onChange={(e) => setTransferReceiverId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs"
                >
                  <option value="">-- Pilih Penerima --</option>
                  {santriList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Transfer (Rp) *</label>
                <input
                  type="number"
                  required
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="Contoh: 25000"
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-all"
              >
                Kirim Transfer Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: CETAK KWITANSI PDF                                               */}
      {/* ======================================================================= */}
      {activeReceiptBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Kwitansi Resmi Pesantren</h3>
              <button onClick={() => setActiveReceiptBill(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border border-slate-200 rounded-2xl bg-slate-50 space-y-2 text-xs">
              <div className="text-center pb-2 border-b">
                <h4 className="font-extrabold text-sm text-slate-900">{settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman'}</h4>
                <p className="text-[10px] text-slate-400 font-mono">No. Kwitansi: {activeReceiptBill.receiptNo}</p>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Santri:</span>
                <span className="font-bold text-slate-900">{activeReceiptBill.santri?.nama}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pos Pembayaran:</span>
                <span className="font-bold text-slate-900">{activeReceiptBill.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Periode:</span>
                <span className="font-bold text-slate-900">{activeReceiptBill.hijriMonth} {activeReceiptBill.hijriYear}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t">
                <span className="font-bold text-slate-700">Total Lunas:</span>
                <span className="font-black text-emerald-600">Rp {(activeReceiptBill.amount || 0).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti Kwitansi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* MODAL: KTS CARD STUDIO PREVIEW                                          */}
      {/* ======================================================================= */}
      {idCardSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl p-6 space-y-4 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">Studio Kartu Tanda Santri (KTS CR-80)</h3>
              <button onClick={() => setIdCardSantri(null)} className="text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SantriIdCard santri={idCardSantri} />
          </div>
        </div>
      )}

    </div>
  );
}
