import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Wallet, 
  BookOpen, 
  Receipt, 
  Clock, 
  AlertTriangle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  CheckCircle2, 
  Radio, 
  CreditCard, 
  Sparkles, 
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Users,
  ChevronRight,
  X
} from 'lucide-react';
import { getDashboardStats, createLedgerEntry } from '../services/api';

export default function Dashboard({ setActiveTab, onOpenNfcModal }) {
  const [stats, setStats] = useState(null);
  const [recentPocketTxs, setRecentPocketTxs] = useState([]);
  const [recentLedgerTxs, setRecentLedgerTxs] = useState([]);
  const [currentActivePermits, setCurrentActivePermits] = useState([]);
  const [pendingBillsList, setPendingBillsList] = useState([]);
  const [recentAcademics, setRecentAcademics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick Kas Manual Modal
  const [isManualKasOpen, setIsManualKasOpen] = useState(false);
  const [kasForm, setKasForm] = useState({
    type: 'INCOME',
    category: 'SPP',
    amount: '',
    description: '',
    reference: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [savingKas, setSavingKas] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      if (res.data.success) {
        setStats(res.data.data.stats);
        setRecentPocketTxs(res.data.data.recentPocketTxs || []);
        setRecentLedgerTxs(res.data.data.recentLedgerTxs || []);
        setCurrentActivePermits(res.data.data.currentActivePermits || []);
        setPendingBillsList(res.data.data.pendingBillsList || []);
        setRecentAcademics(res.data.data.recentAcademics || []);
      }
    } catch (err) {
      console.error('Error loadDashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveKas = async (e) => {
    e.preventDefault();
    if (!kasForm.amount || !kasForm.description) return;

    try {
      setSavingKas(true);
      await createLedgerEntry(kasForm);
      setIsManualKasOpen(false);
      setKasForm({
        type: 'INCOME',
        category: 'SPP',
        amount: '',
        description: '',
        reference: '',
        date: new Date().toISOString().slice(0, 10),
      });
      loadDashboard();
    } catch (err) {
      alert('Gagal menyimpan kas manual');
    } finally {
      setSavingKas(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-amber-300 border border-white/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SIPESAND SUPER ADMIN DASHBOARD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pondok Pesantren Terpadu SiPesand
          </h2>
          <p className="text-xs text-blue-100/90 max-w-xl leading-relaxed">
            Sistem Informasi Manajemen Terpadu: Pantau Kas Global, Tabungan Uang Saku, Tunggakan Santri, Perizinan, dan Muhafadzoh secara real-time.
          </p>
        </div>

        {/* Quick Actions in Banner */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            onClick={() => setIsManualKasOpen(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Input Kas Manual</span>
          </button>

          <button
            onClick={onOpenNfcModal}
            className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-bold text-xs border border-white/30 transition-all flex items-center gap-2"
          >
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Scan Reader NFC</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BENTO GRID: 3 METRIK UTAMA (KAS GLOBAL, TOTAL UANG SAKU, TUNGGAKAN)    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Kas Global Pesantren */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kas Global Pesantren</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              Rp {(stats?.ledgerBalance || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span className="text-emerald-600 font-bold">+{((stats?.totalIncome || 0)/1000000).toFixed(1)}Jt Masuk</span>
              <span>•</span>
              <span className="text-rose-600 font-bold">-{((stats?.totalExpense || 0)/1000000).toFixed(1)}Jt Keluar</span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('ledger')}
            className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Buka Buku Kas Umum</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Total Uang Saku Santri */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tabungan Uang Saku</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 font-mono tracking-tight">
              Rp {(stats?.totalPocketBalance || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Dari <strong>{stats?.activeSantri || 0} santri aktif</strong> ber-NFC
            </div>
          </div>
          <button
            onClick={() => setActiveTab('pocket-cash')}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Kelola Uang Saku & POS</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Total Tunggakan Santri */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tunggakan Santri</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">
              Rp {(stats?.totalTunggakan || 0).toLocaleString('id-ID')}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              <strong>{stats?.countTunggakan || 0} tagihan</strong> belum lunas / pending
            </div>
          </div>
          <button
            onClick={() => setActiveTab('bills')}
            className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Kelola Tagihan & Kwitansi</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. BENTO GRID DETAIL: APPROVALS, PERIZINAN OVERDUE & AKTIVITAS            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri (7/12): Perizinan Aktif & Verifikasi Pembayaran Online */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card Verifikasi Pembayaran Menunggu ACC */}
          {pendingBillsList.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                  <h3 className="font-extrabold text-sm text-blue-950">
                    Verifikasi Pembayaran Online Wali ({pendingBillsList.length} Menunggu ACC)
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('approvals')}
                  className="text-xs font-bold text-blue-700 hover:underline"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {pendingBillsList.map((b) => (
                  <div key={b.id} className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{b.santri?.nama}</div>
                      <div className="text-[11px] text-slate-500">{b.title}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-blue-700">Rp {b.amount.toLocaleString('id-ID')}</div>
                      <button
                        onClick={() => setActiveTab('approvals')}
                        className="px-2.5 py-0.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold mt-0.5"
                      >
                        Verifikasi
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Card Perizinan Santri Berjalan & Deteksi Overdue */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Perizinan Santri Sedang Berjalan</h3>
              </div>
              <button
                onClick={() => setActiveTab('security')}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Buka Kamtib
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {currentActivePermits.length === 0 ? (
                <div className="py-8 text-center text-slate-400">Seluruh santri berada di dalam pesantren</div>
              ) : (
                currentActivePermits.map((p) => {
                  const now = new Date();
                  const isLate = new Date(p.returnTime) < now;
                  return (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{p.santri?.nama}</div>
                        <div className="text-[11px] text-slate-500">{p.reason} ({p.destination || 'Dalam Kota'})</div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isLate ? 'bg-rose-100 text-rose-700 animate-pulse' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isLate ? 'OVERDUE' : 'AKTIF KELUAR'}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Batas: {new Date(p.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Kolom Kanan (5/12): Riwayat Mutasi Kas & Uang Saku Terkini */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Riwayat Kas Pesantren Terkini */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Arus Kas Masuk & Keluar Terkini</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {recentLedgerTxs.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-800">{item.description}</div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {item.category}
                    </div>
                  </div>
                  <div className={`font-mono font-bold text-right ${item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {item.type === 'INCOME' ? '+' : '-'}Rp {item.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluasi Muhafadzoh Terkini */}
          <div className="bg-[#EEF4FF] rounded-3xl border border-blue-200/80 p-6 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-blue-950">Setoran Muhafadzoh Terkini</h3>
              <button onClick={() => setActiveTab('academics')} className="text-blue-700 font-bold hover:underline text-[11px]">
                Selengkapnya
              </button>
            </div>
            <div className="space-y-2">
              {recentAcademics.slice(0, 3).map((ac) => (
                <div key={ac.id} className="p-2.5 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{ac.santri?.nama}</div>
                    <div className="text-[11px] text-slate-600">{ac.title}</div>
                  </div>
                  {ac.score && (
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {ac.score}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Modal Input Kas Manual */}
      {isManualKasOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-blue-700 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Pencatatan Kas Manual</h3>
              <button onClick={() => setIsManualKasOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveKas} className="p-6 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipe Transaksi Kas</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setKasForm({ ...kasForm, type: 'INCOME', category: 'SPP' })}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      kasForm.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Kas Masuk (INCOME)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKasForm({ ...kasForm, type: 'EXPENSE', category: 'Operasional' })}
                    className={`py-2 rounded-lg font-bold transition-all ${
                      kasForm.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Kas Keluar (EXPENSE)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={kasForm.amount}
                  onChange={(e) => setKasForm({ ...kasForm, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Keterangan Kas *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Donasi Pembangunan / Belanja Listrik"
                  value={kasForm.description}
                  onChange={(e) => setKasForm({ ...kasForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    value={kasForm.category}
                    onChange={(e) => setKasForm({ ...kasForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={kasForm.date}
                    onChange={(e) => setKasForm({ ...kasForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualKasOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingKas}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  {savingKas ? 'Menyimpan...' : 'Simpan Transaksi Kas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
