import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Radio, 
  ArrowDownRight, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  CreditCard, 
  History, 
  TrendingDown, 
  AlertCircle, 
  Receipt, 
  Calendar, 
  Send, 
  MessageSquare, 
  Search,
  Check,
  Users,
  Filter
} from 'lucide-react';
import { 
  getSantriList, 
  getSantriByNfc, 
  createPocketTransaction, 
  deductPocketBalance, 
  getPocketTransactions, 
  getSantriBills 
} from '../services/api';
import SantriIdCard from '../components/SantriIdCard';
import OfficialReceipt from '../components/OfficialReceipt';
import { useSettings } from '../context/SettingsContext';

export default function PocketAndCash({ onOpenNfcModal, currentUser }) {
  const { isNfcEnabled } = useSettings();
  const userRole = currentUser?.role || 'PENGURUS_SAKU';
  const managedIds = currentUser?.managedSantriIds || [];

  // State
  const [allSantriList, setAllSantriList] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [nfcInput, setNfcInput] = useState('');
  const [searchSantri, setSearchSantri] = useState('');
  const [scanningNfc, setScanningNfc] = useState(false);
  
  // Form Transaksi Harian (Tanpa Merchant/Kasir)
  const [txType, setTxType] = useState('WITHDRAW'); // 'TOPUP' | 'WITHDRAW' | 'PURCHASE'
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [isEmergency, setIsEmergency] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [alertResult, setAlertResult] = useState(null);
  
  // Data Riwayat & Tagihan Per Santri
  const [recentDeductions, setRecentDeductions] = useState([]);
  const [santriBillsList, setSantriBillsList] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modal Print States
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  useEffect(() => {
    loadPageData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedSantri) {
      loadSantriBills(selectedSantri.id);
    }
  }, [selectedSantri]);

  const loadPageData = async () => {
    try {
      setLoadingData(true);
      const [santriRes, txRes] = await Promise.all([
        getSantriList(),
        getPocketTransactions({ limit: 20 }),
      ]);

      if (santriRes.data.success) {
        const rawList = santriRes.data.data;
        setAllSantriList(rawList);

        // Jika user adalah Pengurus Uang Saku dan memiliki pemetaan santri asuh, filter santri
        let filtered = rawList;
        if (userRole === 'PENGURUS_SAKU' && Array.isArray(managedIds) && managedIds.length > 0) {
          filtered = rawList.filter(s => managedIds.includes(s.id));
        }

        setSantriList(filtered);
        if (filtered.length > 0) {
          setSelectedSantri(filtered[0]);
          setNfcInput(filtered[0].nfcUid || '');
        }
      }
      if (txRes.data.success) setRecentDeductions(txRes.data.data);
    } catch (err) {
      console.error('Error loadPageData:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSantriBills = async (santriId) => {
    try {
      const res = await getSantriBills({ santriId });
      if (res.data.success) {
        setSantriBillsList(res.data.data);
      }
    } catch (err) {
      console.error('Error loadSantriBills:', err);
    }
  };

  // Handler Scan NFC
  const handleScanNfc = async (uidToScan) => {
    const uid = (uidToScan || nfcInput).trim();
    if (!uid) return;

    setScanningNfc(true);
    setAlertResult(null);
    try {
      const res = await getSantriByNfc(uid);
      if (res.data.success) {
        setSelectedSantri(res.data.data);
        setNfcInput(uid);
        setAlertResult({
          type: 'info',
          title: 'Kartu NFC Terdeteksi',
          message: `Santri: ${res.data.data.nama} (Saldo: Rp ${res.data.data.saldo_saku?.toLocaleString('id-ID')})`,
        });
      }
    } catch (err) {
      setAlertResult({
        type: 'error',
        title: 'NFC Gagal Dipindai',
        message: err.response?.data?.message || 'Kartu NFC tidak terdaftar pada sistem',
      });
    } finally {
      setScanningNfc(false);
    }
  };

  const handleSelectSantri = (id) => {
    const found = santriList.find(s => s.id === parseInt(id));
    if (found) {
      setSelectedSantri(found);
      setNfcInput(found.nfcUid || '');
      setAlertResult(null);
    }
  };

  // WhatsApp Follow-up Link Generator
  const handleSendWaFollowup = (santri, type = 'SALDO_MINUS') => {
    if (!santri.noHpWali) {
      alert(`Nomor WhatsApp wali untuk santri ${santri.nama} belum terdaftar.`);
      return;
    }

    let phone = santri.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '62' + phone.slice(1);
    }

    let message = '';
    if (type === 'SALDO_MINUS') {
      message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nKami dari Bagian Pengurus Uang Saku Pesantren Terpadu SiPesand menginformasikan bahwa saat ini saldo tabungan uang saku santri berada pada posisi *Rp ${santri.saldo_saku?.toLocaleString('id-ID')}* ${santri.saldo_saku < 0 ? '(MINUS/TALANGAN DARURAT)' : '(MENIPIS)'}.\n\nMohon perkenan Bapak/Ibu untuk melakukan isi ulang (Top-Up) melalui Portal Wali atau transfer ke rekening resmi BSI Pesantren agar kebutuhan harian ananda tetap terpenuhi dengan baik.\n\nTerima kasih atas perhatian dan kerja samanya. Jazakumullah Khairan Katsiran.\n_Pengurus Uang Saku SiPesand_`;
    } else {
      const unpaidBills = santriBillsList.filter(b => b.status === 'UNPAID');
      const totalUnpaid = unpaidBills.reduce((sum, b) => sum + (b.amount || 0), 0);
      message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}*.\n\nKami menginformasikan rincian tagihan syahriyah/kebutuhan santri yang saat ini berstatus belum lunas sebesar *Rp ${totalUnpaid.toLocaleString('id-ID')}*.\n\nBapak/Ibu dapat melakukan pembayaran langsung melalui Portal Wali Mandiri di website SiPesand.\n\nTerima kasih. Wassalamu'alaikum Wr. Wb.`;
    }

    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  // Submit Transaksi (Tanpa Pilihan Merchant/Kasir)
  const handleSubmitTx = async (e) => {
    e.preventDefault();
    if (!selectedSantri) return;

    const nominal = parseFloat(amount);
    if (!nominal || nominal <= 0) {
      alert('Masukkan nominal transaksi yang valid.');
      return;
    }

    try {
      setProcessing(true);
      setAlertResult(null);

      const defaultMerchantName = `Pengurus Asrama (${currentUser?.name || 'Kasir Saku'})`;

      if (txType === 'TOPUP') {
        const res = await createPocketTransaction({
          santriId: selectedSantri.id,
          type: 'TOPUP',
          amount: nominal,
          merchant: defaultMerchantName,
          description: description || 'Setor Tabungan Uang Saku ke Pengurus',
          date: txDate,
        });

        if (res.data.success) {
          setAlertResult({
            type: 'success',
            title: 'Setor Saldo Berhasil',
            message: `Saldo ${selectedSantri.nama} bertambah Rp ${nominal.toLocaleString('id-ID')}`,
          });
          updateLocalBalance(res.data.data.balanceAfter);
        }
      } else {
        const defaultDesc = txType === 'WITHDRAW' 
          ? (description || 'Tarik Uang Tunai Saku dari Pengurus')
          : (description || 'Belanja Kebutuhan Harian Santri');

        const res = await deductPocketBalance({
          santriId: selectedSantri.id,
          amount: nominal,
          merchant: defaultMerchantName,
          description: defaultDesc,
          isEmergency,
          date: txDate,
        }, {
          role: userRole,
          name: currentUser?.name || 'Pengurus Uang Saku Asrama',
        });

        if (res.data.success) {
          const txData = res.data.data;
          setAlertResult({
            type: 'success',
            title: txData.isOverdraft ? 'Transaksi Darurat Berhasil (Saldo Minus)' : 'Penarikan Saldo Berhasil',
            message: res.data.message,
          });
          updateLocalBalance(txData.balanceAfter);
        }
      }

      setAmount('');
      setDescription('');
      setIsEmergency(false);
      
      const txRes = await getPocketTransactions({ limit: 20 });
      if (txRes.data.success) setRecentDeductions(txRes.data.data);
    } catch (err) {
      const errRes = err.response?.data;
      if (errRes?.isInsufficient) {
        setAlertResult({
          type: 'error',
          title: 'Saldo Santri Tidak Mencukupi',
          message: errRes.message,
          canEnableEmergency: true,
        });
      } else {
        setAlertResult({
          type: 'error',
          title: 'Transaksi Gagal',
          message: errRes?.message || 'Gagal memproses transaksi',
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const updateLocalBalance = (newBalance) => {
    setSelectedSantri(prev => ({ ...prev, saldo_saku: newBalance }));
    setSantriList(prev => prev.map(s => s.id === selectedSantri.id ? { ...s, saldo_saku: newBalance } : s));
  };

  const filteredSantri = santriList.filter(s => 
    s.nama.toLowerCase().includes(searchSantri.toLowerCase()) || 
    (s.nis && s.nis.includes(searchSantri)) ||
    (s.kamar && s.kamar.toLowerCase().includes(searchSantri.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-xs font-sans">
      
      {/* Top Banner Devisi Uang Saku */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Dashboard Devisi Pengurus Uang Saku</h2>
            {userRole === 'PENGURUS_SAKU' && Array.isArray(managedIds) && managedIds.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Santri Binaan: {santriList.length} Santri
              </span>
            )}
          </div>
          <p className="text-slate-500 mt-0.5">
            {currentUser?.name 
              ? `Pengurus Aktif: ${currentUser.name} — Pencatatan langsung setor & tarik saku santri asuh.` 
              : 'Pencatatan langsung setor dan tarik tunai saku santri yang dipegang pengurus asrama.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsIdCardOpen(true)}
            disabled={!selectedSantri}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 disabled:opacity-50"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>ID Card KTSD</span>
          </button>

          {isNfcEnabled && (
            <button
              onClick={onOpenNfcModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Tap Kartu NFC</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Form Input Harian (Tanpa Merchant) & Pemetaan Saldo Santri Asuh */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri (7/12): Form Input Setor / Tarik Harian */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Input Setor & Tarik Uang Saku Santri</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Uang cash santri dipegang dan dicatat langsung oleh pengurus</p>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {santriList.length} Santri Terdaftar
            </span>
          </div>

          {alertResult && (
            <div className={`p-4 rounded-xl border space-y-2 ${
              alertResult.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
              alertResult.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-900' :
              'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-start gap-2">
                {alertResult.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5" />}
                <div>
                  <div className="font-bold">{alertResult.title}</div>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{alertResult.message}</p>
                </div>
              </div>

              {alertResult.canEnableEmergency && (
                <div className="pt-2 border-t border-rose-200 flex items-center justify-between">
                  <span className="font-semibold text-rose-800">Otorisasi sebagai transaksi darurat?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEmergency(true);
                      setAlertResult(null);
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-[10px]"
                  >
                    Aktifkan Mode Darurat (Minus)
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selector Tipe Transaksi (Setor / Tarik / Belanja) */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTxType('WITHDRAW')}
              className={`py-2 rounded-lg font-bold transition-all ${
                txType === 'WITHDRAW' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tarik Tunai Santri
            </button>
            <button
              type="button"
              onClick={() => setTxType('TOPUP')}
              className={`py-2 rounded-lg font-bold transition-all ${
                txType === 'TOPUP' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Setor / Top-Up Uang Saku
            </button>
            <button
              type="button"
              onClick={() => setTxType('PURCHASE')}
              className={`py-2 rounded-lg font-bold transition-all ${
                txType === 'PURCHASE' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belanja Kebutuhan Santri
            </button>
          </div>

          <form onSubmit={handleSubmitTx} className="space-y-4">
            {/* Santri Terpilih Info */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Pilih Santri Binaan * {userRole === 'PENGURUS_SAKU' && '(Sesuai Pemetaan Pengurus)'}
              </label>
              <select
                value={selectedSantri?.id || ''}
                onChange={(e) => handleSelectSantri(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-semibold"
              >
                {santriList.length === 0 ? (
                  <option value="">Tidak ada santri yang dipetakan ke akun ini</option>
                ) : (
                  santriList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama} ({s.kelas || '-'}) — Saldo: Rp {s.saldo_saku?.toLocaleString('id-ID')} {s.saldo_saku < 0 ? '[MINUS]' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedSantri && (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Saldo Pegangan Santri</span>
                  <div className={`font-mono font-black text-base ${selectedSantri.saldo_saku < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    Rp {selectedSantri.saldo_saku?.toLocaleString('id-ID')}
                  </div>
                </div>

                {/* Follow-up WA Wali Button */}
                <button
                  type="button"
                  onClick={() => handleSendWaFollowup(selectedSantri, 'SALDO_MINUS')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center gap-1.5 shadow-sm text-[11px]"
                  title="Kirim pesan konfirmasi saldo ke WhatsApp Wali Santri"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Follow-Up WA Wali</span>
                </button>
              </div>
            )}

            {/* Input Nominal & Opsi Tanggal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nominal Transaksi (Rp) *</label>
                <input
                  type="number"
                  required
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-sm focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tanggal Transaksi *</label>
                <input
                  type="date"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Quick Nominal Chips */}
            <div className="flex flex-wrap gap-1.5">
              {[5000, 10000, 20000, 50000, 100000, 200000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val.toString())}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg border border-slate-200 font-medium"
                >
                  +{val.toLocaleString('id-ID')}
                </button>
              ))}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Keterangan / Keperluan Transaksi</label>
              <input
                type="text"
                placeholder={txType === 'TOPUP' ? 'Contoh: Titipan transfer uang saku dari wali' : txType === 'WITHDRAW' ? 'Contoh: Tarik tunai uang saku jajan pekanan' : 'Contoh: Pembelian kitab dan seragam santri'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Opsi Otorisasi Darurat */}
            {txType !== 'TOPUP' && (
              <div className={`p-3 rounded-xl border ${isEmergency ? 'bg-rose-50 border-rose-300' : 'bg-slate-50 border-slate-200'}`}>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-rose-600 rounded"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Otorisasi Mode Darurat (Saldo Minus Tetap Tercatat)</span>
                    <span className="text-[11px] text-slate-500">Centang jika transaksi mendesak walaupun saldo santri kurang / habis.</span>
                  </div>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={processing || !selectedSantri}
              className={`w-full py-3 rounded-xl font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                txType === 'TOPUP' ? 'bg-emerald-600 hover:bg-emerald-700' : isEmergency ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {processing ? 'Memproses Transaksi...' : `Simpan Transaksi ${txType === 'TOPUP' ? 'Setor Saldo' : txType === 'WITHDRAW' ? 'Tarik Tunai' : 'Belanja'}`}
            </button>
          </form>
        </div>

        {/* Kolom Kanan (5/12): Pemetaan Saldo & Tagihan Santri Asuh */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Pemetaan Saldo Per Santri Asuh */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Pemetaan Santri Asuh</h3>
                <p className="text-[10px] text-slate-400">
                  {userRole === 'PENGURUS_SAKU' && Array.isArray(managedIds) && managedIds.length > 0 
                    ? `Dibatasi ${santriList.length} santri binaan akun ini` 
                    : 'Seluruh santri terdaftar'}
                </p>
              </div>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {santriList.length} Santri
              </span>
            </div>

            {/* Filter Santri */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama atau kamar santri..."
                value={searchSantri}
                onChange={(e) => setSearchSantri(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto pr-1">
              {filteredSantri.length === 0 ? (
                <div className="py-6 text-center text-slate-400">Tidak ada santri yang sesuai</div>
              ) : (
                filteredSantri.map((s) => {
                  const isNegative = s.saldo_saku < 0;
                  return (
                    <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div 
                        onClick={() => handleSelectSantri(s.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="font-bold text-slate-800 truncate">{s.nama}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis} • {s.kamar || '-'}</div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className={`font-mono font-bold ${isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
                            Rp {s.saldo_saku?.toLocaleString('id-ID')}
                          </div>
                          {isNegative && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                              MINUS
                            </span>
                          )}
                        </div>

                        {/* Tombol Follow Up WA */}
                        {isNegative && (
                          <button
                            type="button"
                            onClick={() => handleSendWaFollowup(s, 'SALDO_MINUS')}
                            className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded"
                            title="Follow Up WA ke Wali"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card Tagihan Aktif Per Anak Asuh */}
          {selectedSantri && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">Tagihan Pembayaran Santri</h3>
                <button
                  type="button"
                  onClick={() => handleSendWaFollowup(selectedSantri, 'TAGIHAN')}
                  className="text-blue-600 font-bold text-[11px] flex items-center gap-1 hover:underline"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Kirim Tagihan ke WA</span>
                </button>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {santriBillsList.length === 0 ? (
                  <div className="py-4 text-center text-slate-400">Tidak ada tagihan tertunggak</div>
                ) : (
                  santriBillsList.map((b) => (
                    <div key={b.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-slate-800">{b.title}</div>
                        <div className="text-[10px] text-slate-400">{b.hijriMonth} {b.hijriYear}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold">Rp {b.amount.toLocaleString('id-ID')}</div>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          b.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal ID Card */}
      <SantriIdCard
        santri={selectedSantri}
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
      />

      {/* Modal Kwitansi */}
      <OfficialReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        defaultData={activeReceiptData}
      />

    </div>
  );
}
