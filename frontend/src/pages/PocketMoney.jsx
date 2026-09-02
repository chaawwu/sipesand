import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShoppingBag, 
  Radio, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Store
} from 'lucide-react';
import { getPocketTransactions, createPocketTransaction, getSantriList, getSantriByNfc } from '../services/api';

export default function PocketMoney({ onOpenNfcModal }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  
  // Quick POS State
  const [santriList, setSantriList] = useState([]);
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [activeSantri, setActiveSantri] = useState(null);
  const [txType, setTxType] = useState('PURCHASE'); // 'PURCHASE' | 'TOPUP' | 'WITHDRAW'
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('Kantin Utama Pesantren');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  useEffect(() => {
    fetchTransactions();
    fetchSantriOptions();
  }, [typeFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (typeFilter) params.type = typeFilter;
      const res = await getPocketTransactions(params);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetchTransactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSantriOptions = async () => {
    try {
      const res = await getSantriList();
      if (res.data.success) {
        setSantriList(res.data.data);
        if (res.data.data.length > 0 && !selectedSantriId) {
          setSelectedSantriId(res.data.data[0].id);
          setActiveSantri(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetchSantriOptions:', err);
    }
  };

  const handleSantriSelect = (id) => {
    setSelectedSantriId(id);
    const found = santriList.find((s) => s.id === parseInt(id));
    setActiveSantri(found || null);
    setAlertInfo(null);
  };

  const handleProcessTx = async (e) => {
    e.preventDefault();
    if (!activeSantri) {
      setAlertInfo({ type: 'error', text: 'Pilih santri terlebih dahulu' });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setAlertInfo({ type: 'error', text: 'Masukkan nominal transaksi yang valid' });
      return;
    }

    setProcessing(true);
    setAlertInfo(null);

    try {
      const res = await createPocketTransaction({
        santriId: activeSantri.id,
        type: txType,
        amount: parseFloat(amount),
        merchant: txType === 'TOPUP' ? 'Admin Keuangan' : merchant,
        description: description || (txType === 'PURCHASE' ? `Belanja di ${merchant}` : txType === 'TOPUP' ? 'Isi Saldo Saku' : 'Tarik Tunai'),
      });

      setAlertInfo({
        type: 'success',
        text: `Transaksi ${txType} sebesar Rp ${parseFloat(amount).toLocaleString('id-ID')} berhasil diproses! Saldo sisa: Rp ${res.data.data.santri.saldo_saku.toLocaleString('id-ID')}`,
      });

      // Update active santri balance in local state
      setActiveSantri((prev) => ({
        ...prev,
        saldo_saku: res.data.data.santri.saldo_saku,
      }));

      // Update in santri list too
      setSantriList((prev) =>
        prev.map((s) =>
          s.id === activeSantri.id ? { ...s, saldo_saku: res.data.data.santri.saldo_saku } : s
        )
      );

      setAmount('');
      setDescription('');
      fetchTransactions();
    } catch (err) {
      setAlertInfo({
        type: 'error',
        text: err.response?.data?.message || 'Gagal memproses transaksi',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Simulator Link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form POS Kasir & Transaksi Cepat */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Terminal Kasir Santri</h3>
            </div>
            <button
              onClick={onOpenNfcModal}
              className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-lg font-semibold flex items-center gap-1"
            >
              <Radio className="w-3 h-3 text-emerald-600" />
              <span>Tap NFC</span>
            </button>
          </div>

          {alertInfo && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                alertInfo.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {alertInfo.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{alertInfo.text}</span>
            </div>
          )}

          {/* Pilih Santri */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Santri</label>
            <select
              value={selectedSantriId}
              onChange={(e) => handleSantriSelect(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {santriList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama} ({s.kelas || 'Santri'}) - Rp {s.saldo_saku?.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
          </div>

          {/* Kartu Saldo Santri Terpilih */}
          {activeSantri && (
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-inner flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Santri Saat Ini</div>
                <div className="text-lg font-black text-emerald-400">
                  Rp {activeSantri.saldo_saku?.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400">NFC: {activeSantri.nfcUid || 'Non-NFC'}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">
                {activeSantri.nama.charAt(0)}
              </div>
            </div>
          )}

          <form onSubmit={handleProcessTx} className="space-y-3.5 pt-1">
            {/* Tipe Transaksi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Transaksi</label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTxType('PURCHASE')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    txType === 'PURCHASE' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belanja
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('TOPUP')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    txType === 'TOPUP' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Top-Up
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('WITHDRAW')}
                  className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                    txType === 'WITHDRAW' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tarik Tunai
                </button>
              </div>
            </div>

            {/* Lokasi Kantin (if purchase) */}
            {txType === 'PURCHASE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Merchant / Lokasi</label>
                <select
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Kantin Utama Pesantren">Kantin Utama Pesantren</option>
                  <option value="Koperasi Santri Putra">Koperasi Santri Putra</option>
                  <option value="Koperasi Santri Putri">Koperasi Santri Putri</option>
                  <option value="Toko Kitab & ATK">Toko Kitab & ATK</option>
                </select>
              </div>
            )}

            {/* Nominal Transaksi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                placeholder="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
              />

              {/* Quick Nominals */}
              <div className="flex flex-wrap gap-1 mt-1.5">
                {[5000, 10000, 20000, 50000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[10px] font-medium rounded border border-slate-200 transition-colors"
                  >
                    +{val.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Keterangan (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: Makan Siang / Buku Tulis"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                txType === 'PURCHASE'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                  : txType === 'TOPUP'
                  ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                  : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30'
              }`}
            >
              {processing ? (
                'Memproses...'
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>
                    Eksekusi {txType === 'PURCHASE' ? 'Pembayaran Kantin' : txType === 'TOPUP' ? 'Top-Up Saldo' : 'Tarik Tunai'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tabel Riwayat Mutasi Uang Saku */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Mutasi Uang Saku (PocketTx)</h3>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:ring-2 focus:ring-emerald-500 text-slate-700"
              >
                <option value="">Semua Transaksi</option>
                <option value="PURCHASE">Belanja Kantin (PURCHASE)</option>
                <option value="TOPUP">Top-Up Saldo (TOPUP)</option>
                <option value="WITHDRAW">Tarik Tunai (WITHDRAW)</option>
              </select>

              <button
                onClick={fetchTransactions}
                className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg border border-slate-200"
                title="Refresh Riwayat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Kode & Waktu</th>
                  <th className="py-2.5 px-3">Santri</th>
                  <th className="py-2.5 px-3">Tipe & Merchant</th>
                  <th className="py-2.5 px-3">Nominal</th>
                  <th className="py-2.5 px-3">Saldo Akhir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Memuat transaksi...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Belum ada riwayat transaksi
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-slate-800">{tx.txCode || `TX-${tx.id}`}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{tx.santri?.nama}</div>
                        <div className="text-[10px] text-slate-400">{tx.santri?.kamar || tx.santri?.kelas}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              tx.type === 'TOPUP'
                                ? 'bg-emerald-100 text-emerald-700'
                                : tx.type === 'PURCHASE'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {tx.type}
                          </span>
                          <span className="text-slate-600 truncate max-w-[130px]">{tx.merchant || 'Kantin'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">
                          {tx.description}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div
                          className={`font-bold font-mono ${
                            tx.type === 'TOPUP' ? 'text-emerald-600' : 'text-slate-800'
                          }`}
                        >
                          {tx.type === 'TOPUP' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono text-slate-600">
                          Rp {tx.balanceAfter.toLocaleString('id-ID')}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
