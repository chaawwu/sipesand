import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Trash2, 
  Filter, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Calendar,
  X,
  Receipt,
  Printer
} from 'lucide-react';
import { getLedgerEntries, getLedgerSummary, createLedgerEntry, deleteLedgerEntry } from '../services/api';
import OfficialReceipt from '../components/OfficialReceipt';

const categories = {
  INCOME: ['SPP', 'Donasi', 'Wakaf', 'Pendaftaran Santri Baru', 'Unit Usaha Pesantren', 'Lain-lain'],
  EXPENSE: ['Operasional Listrik & Air', 'Konsumsi Dapur Santri', 'Gaji & Honor Asatidz', 'Pembangunan & Sarana', 'Kesehatan Santri', 'Kegiatan & Lomba', 'Lain-lain']
};

export default function Ledger() {
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    type: 'INCOME',
    category: 'SPP',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    reference: '',
  });

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const [entriesRes, summaryRes] = await Promise.all([
        getLedgerEntries(params),
        getLedgerSummary(),
      ]);

      if (entriesRes.data.success) setEntries(entriesRes.data.data);
      if (summaryRes.data.success) setSummary(summaryRes.data.data);
    } catch (err) {
      console.error('Error fetch ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      type: 'INCOME',
      category: 'SPP',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      description: '',
      reference: '',
    });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenReceiptForEntry = (entry) => {
    setReceiptData({
      code: entry ? `KWT-${entry.code.replace('KAS-', '')}` : undefined,
      date: entry ? entry.date : new Date(),
      items: entry ? [
        { id: 1, name: entry.description, amount: entry.amount }
      ] : undefined,
    });
    setIsReceiptOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setErrorMsg('Nominal transaksi harus lebih besar dari 0');
      return;
    }
    if (!formData.description) {
      setErrorMsg('Keterangan kas wajib diisi');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    try {
      await createLedgerEntry(formData);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan transaksi kas');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus catatan kas ${code}?`)) {
      try {
        await deleteLedgerEntry(id);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.message || 'Gagal menghapus entri');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 3 Kartu Ringkasan Buku Kas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Pemasukan */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kas Masuk</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-emerald-600">
            Rp {(summary?.totalIncome || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 mt-1">{summary?.countIncome || 0} transaksi masuk</div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Kas Keluar</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-rose-600">
            Rp {(summary?.totalExpense || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 mt-1">{summary?.countExpense || 0} transaksi keluar</div>
        </div>

        {/* Saldo Kas Pesantren */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saldo Kas Saat Ini</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-800">
            Rp {(summary?.currentBalance || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-slate-400 mt-1">Status Keuangan Terpadu</div>
        </div>
      </div>

      {/* Action Bar & Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
          >
            <option value="">Semua Arus Kas</option>
            <option value="INCOME">Kas Masuk Saja (INCOME)</option>
            <option value="EXPENSE">Kas Keluar Saja (EXPENSE)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol Buka Generator Kwitansi */}
          <button
            onClick={() => handleOpenReceiptForEntry(null)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Receipt className="w-4 h-4" />
            <span>Cetak Kwitansi Resmi</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Kas Baru</span>
          </button>
        </div>
      </div>

      {/* Tabel Buku Kas */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Bukti / Kode</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Kategori & Keterangan</th>
                <th className="py-3.5 px-4">Arus</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4 text-center">Aksi & Kwitansi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Memuat buku kas...
                  </td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Belum ada catatan kas
                  </td>
                </tr>
              ) : (
                entries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-800">{item.code}</div>
                      {item.reference && (
                        <div className="text-[10px] text-slate-400 font-mono">Ref: {item.reference}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(item.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{item.description}</div>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.type === 'INCOME'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.type === 'INCOME' ? 'Kas Masuk' : 'Kas Keluar'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div
                        className={`font-bold font-mono text-sm ${
                          item.type === 'INCOME' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.type === 'INCOME' ? '+' : '-'}Rp {item.amount.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.type === 'INCOME' && (
                          <button
                            onClick={() => handleOpenReceiptForEntry(item)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[10px] font-bold transition-colors flex items-center gap-1"
                            title="Cetak Kwitansi Pembayaran"
                          >
                            <Receipt className="w-3 h-3 text-amber-700" />
                            <span>Kwitansi</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(item.id, item.code)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus Entri Kas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Catat Kas */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Transaksi Buku Kas</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Tipe Kas */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: 'INCOME', category: categories.INCOME[0] });
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.type === 'INCOME'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kas Masuk (Pemasukan)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type: 'EXPENSE', category: categories.EXPENSE[0] });
                    }}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      formData.type === 'EXPENSE'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Kas Keluar (Pengeluaran)
                  </button>
                </div>
              </div>

              {/* Kategori & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    {(formData.type === 'INCOME' ? categories.INCOME : categories.EXPENSE).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Nominal */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Keterangan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan / Uraian *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembayaran SPP Santri Terpadu / Pembelian Token Listrik"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Referensi / Bukti */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Referensi / Bukti Kuitansi</label>
                <input
                  type="text"
                  placeholder="Contoh: INV-2026/08/001 atau TF-BSI-991"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cetak Kwitansi Resmi Otomatis */}
      <OfficialReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        defaultData={receiptData}
      />

    </div>
  );
}
