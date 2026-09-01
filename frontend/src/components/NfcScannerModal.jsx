import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  X, 
  User, 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { getSantriByNfc, createPocketTransaction, checkInByNfc, getSantriList } from '../services/api';

export default function NfcScannerModal({ isOpen, onClose, onSuccess }) {
  const [nfcUidInput, setNfcUidInput] = useState('');
  const [quickSantriList, setQuickSantriList] = useState([]);
  const [scannedSantri, setScannedSantri] = useState(null);
  const [activeAction, setActiveAction] = useState('purchase'); // 'purchase', 'topup', 'checkin'
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('Kantin Utama Pesantren');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null); // { type: 'success'|'error', text: '' }

  // Ambil daftar santri untuk tombol quick simulator
  useEffect(() => {
    if (isOpen) {
      loadQuickList();
      resetForm();
    }
  }, [isOpen]);

  const loadQuickList = async () => {
    try {
      const res = await getSantriList({ limit: 10 });
      if (res.data.success) {
        setQuickSantriList(res.data.data.filter(s => s.nfcUid));
      }
    } catch (err) {
      console.error('Gagal mengambil daftar quick santri', err);
    }
  };

  const resetForm = () => {
    setNfcUidInput('');
    setScannedSantri(null);
    setActiveAction('purchase');
    setAmount('');
    setDescription('');
    setStatusMsg(null);
  };

  const handleScan = async (uidToScan) => {
    const uid = uidToScan || nfcUidInput.trim();
    if (!uid) return;
    setLoading(true);
    setStatusMsg(null);
    try {
      const res = await getSantriByNfc(uid);
      if (res.data.success) {
        setScannedSantri(res.data.data);
        setNfcUidInput(uid);
        setStatusMsg({ type: 'success', text: `Kartu terdeteksi: ${res.data.data.nama}` });
      }
    } catch (err) {
      setScannedSantri(null);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Kartu NFC tidak terdaftar pada sistem',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    if (!scannedSantri) return;

    if (activeAction === 'checkin') {
      setLoading(true);
      setStatusMsg(null);
      try {
        const res = await checkInByNfc({ nfcUid: scannedSantri.nfcUid });
        setStatusMsg({ type: 'success', text: res.data.message });
        if (onSuccess) onSuccess();
      } catch (err) {
        setStatusMsg({
          type: 'error',
          text: err.response?.data?.message || 'Gagal memproses check-in izin',
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setStatusMsg({ type: 'error', text: 'Masukkan nominal yang valid' });
      return;
    }

    setLoading(true);
    setStatusMsg(null);
    try {
      const type = activeAction === 'purchase' ? 'PURCHASE' : 'TOPUP';
      const res = await createPocketTransaction({
        santriId: scannedSantri.id,
        type,
        amount: parseFloat(amount),
        description: description || (type === 'PURCHASE' ? `Belanja di ${merchant}` : 'Top Up Saldo Saku'),
        merchant: type === 'PURCHASE' ? merchant : 'Admin Uang Saku',
      });

      setStatusMsg({
        type: 'success',
        text: `Transaksi ${type === 'PURCHASE' ? 'Belanja' : 'Top Up'} berhasil! Saldo baru: Rp ${res.data.data.santri.saldo_saku.toLocaleString('id-ID')}`,
      });

      // Update scanned santri balance in modal
      setScannedSantri(prev => ({
        ...prev,
        saldo_saku: res.data.data.santri.saldo_saku,
      }));

      setAmount('');
      setDescription('');
      if (onSuccess) onSuccess();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Transaksi gagal diproses',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-teal-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Radio className="w-5 h-5 animate-pulse text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Simulator Smart NFC Reader</h3>
              <p className="text-xs text-emerald-100">Pindai kartu santri untuk POS Kantin, Top-Up, atau Check-in Izin</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Quick Select Preset NFC Cards */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">
              Pilih Kartu Santri Siap Pakai (Simulasi Cepat):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickSantriList.map((santri) => (
                <button
                  key={santri.id}
                  onClick={() => handleScan(santri.nfcUid)}
                  className={`p-2.5 text-left rounded-xl border transition-all text-xs flex flex-col justify-between ${
                    scannedSantri?.id === santri.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="font-semibold truncate">{santri.nama}</div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span>{santri.nfcUid}</span>
                    <span className="font-mono font-medium text-emerald-700">Rp {santri.saldo_saku?.toLocaleString('id-ID')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input NFC UID */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Radio className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Atau ketik UID Kartu NFC (contoh: NFC-8A3F129B)..."
                value={nfcUidInput}
                onChange={(e) => setNfcUidInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => handleScan()}
              disabled={loading || !nfcUidInput.trim()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Memindai...' : 'Scan / Cari'}
            </button>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={`p-3.5 rounded-xl flex items-start gap-2.5 text-sm ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              )}
              <div className="font-medium">{statusMsg.text}</div>
            </div>
          )}

          {/* Scanned Santri Profile Card */}
          {scannedSantri && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow">
                    {scannedSantri.nama.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-base">{scannedSantri.nama}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <span>NIS: {scannedSantri.nis || '-'}</span>
                      <span>•</span>
                      <span>{scannedSantri.kelas || '-'}</span>
                      <span>•</span>
                      <span>{scannedSantri.kamar || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[11px] font-medium text-slate-500 uppercase">Saldo Uang Saku</div>
                  <div className="text-xl font-black text-emerald-600">
                    Rp {scannedSantri.saldo_saku?.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* Action Tabs */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex border-b border-slate-200 mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveAction('purchase')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeAction === 'purchase'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>POS Kantin / Belanja</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction('topup')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeAction === 'topup'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Top-Up Saldo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveAction('checkin')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeAction === 'checkin'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Check-in Izin Pulang</span>
                  </button>
                </div>

                {/* Form Action */}
                <form onSubmit={handleTransaction} className="space-y-4">
                  {activeAction === 'checkin' ? (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-sm">
                      <p className="font-semibold mb-1">Verifikasi Kepulangan Santri</p>
                      <p className="text-xs text-emerald-800">
                        Klik tombol di bawah untuk mencatat kepulangan santri secara otomatis. Sistem akan mengecek apakah santri kembali tepat waktu atau terlambat.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Merchant Select (for purchase) */}
                      {activeAction === 'purchase' && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Lokasi Transaksi / Kantin</label>
                          <select
                            value={merchant}
                            onChange={(e) => setMerchant(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="Kantin Utama Pesantren">Kantin Utama Pesantren</option>
                            <option value="Koperasi Santri Putra">Koperasi Santri Putra</option>
                            <option value="Koperasi Santri Putri">Koperasi Santri Putri</option>
                            <option value="Toko Kitab & Seragam">Toko Kitab & Seragam</option>
                            <option value="Laundry Pesantren">Laundry Pesantren</option>
                          </select>
                        </div>
                      )}

                      {/* Nominal Amount */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nominal Transaksi (Rp)
                        </label>
                        <input
                          type="number"
                          placeholder="Contoh: 15000"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                          required
                        />

                        {/* Quick Nominal Buttons */}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {[5000, 10000, 15000, 20000, 50000, 100000].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setAmount(val.toString())}
                              className="px-2.5 py-1 bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 text-xs rounded-lg transition-colors"
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
                          placeholder={activeAction === 'purchase' ? 'Contoh: Nasi Soto + Es Teh' : 'Contoh: Titipan Uang Saku Wali'}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                    >
                      Tutup
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-5 py-2 text-white rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2 ${
                        activeAction === 'purchase'
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                          : activeAction === 'topup'
                          ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/30'
                          : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                      }`}
                    >
                      {loading ? (
                        'Memproses...'
                      ) : activeAction === 'purchase' ? (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Proses Bayar (Potong Saldo)</span>
                        </>
                      ) : activeAction === 'topup' ? (
                        <>
                          <ArrowDownRight className="w-4 h-4" />
                          <span>Simpan Top-Up Saldo</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Konfirmasi Check-in Izin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
