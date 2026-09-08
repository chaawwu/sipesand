import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  X, 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  User, 
  Printer, 
  Trash2, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Wallet,
  Check
} from 'lucide-react';
import { getSantriList, registerRfidCard, unregisterRfidCard } from '../services/api';
import SantriIdCard from './SantriIdCard';

export default function RfidRegistrationModal({ isOpen, onClose, onSuccess }) {
  const [santriList, setSantriList] = useState([]);
  const [loadingSantri, setLoadingSantri] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'WITHOUT_CARD', 'WITH_CARD'
  
  // Selected Santri & Form State
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [rfidUid, setRfidUid] = useState('');
  const [saldoSaku, setSaldoSaku] = useState('');
  const [cardStatus, setCardStatus] = useState('AKTIF');
  
  // Interaction & UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', message: '' }
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [justRegisteredSantri, setJustRegisteredSantri] = useState(null);
  
  const rfidInputRef = useRef(null);

  // Load Santri List when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSantriData();
      resetState();
    }
  }, [isOpen]);

  // Auto-focus RFID input when a santri is selected
  useEffect(() => {
    if (selectedSantri && rfidInputRef.current) {
      setTimeout(() => {
        rfidInputRef.current?.focus();
      }, 100);
    }
  }, [selectedSantri]);

  const fetchSantriData = async () => {
    try {
      setLoadingSantri(true);
      const res = await getSantriList();
      if (res.data.success) {
        setSantriList(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar santri:', err);
    } finally {
      setLoadingSantri(false);
    }
  };

  const resetState = () => {
    setSelectedSantri(null);
    setRfidUid('');
    setSaldoSaku('');
    setCardStatus('AKTIF');
    setFeedback(null);
    setSearchQuery('');
    setJustRegisteredSantri(null);
  };

  const handleSelectSantri = (santri) => {
    setSelectedSantri(santri);
    setRfidUid(santri.nfcUid || '');
    setSaldoSaku(santri.saldo_saku !== undefined ? santri.saldo_saku.toString() : '0');
    setCardStatus(santri.status || 'AKTIF');
    setFeedback(null);
  };

  // Generate Simulation RFID UID
  const handleGenerateUid = () => {
    const randomHex = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
    setRfidUid(`NFC-${randomHex}`);
    setFeedback({
      type: 'info',
      message: `UID Simulasi dibuat: NFC-${randomHex}. Siap didaftarkan!`
    });
  };

  // Submit Registrasi Kartu RFID
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSantri) {
      setFeedback({ type: 'error', message: 'Silakan pilih santri terlebih dahulu' });
      return;
    }
    if (!rfidUid.trim()) {
      setFeedback({ type: 'error', message: 'UID Kartu RFID / NFC wajib diisi atau di-tap' });
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const payload = {
        santriId: selectedSantri.id,
        nfcUid: rfidUid.trim().toUpperCase(),
        saldo_saku: saldoSaku ? parseFloat(saldoSaku) : selectedSantri.saldo_saku,
        status: cardStatus
      };

      const res = await registerRfidCard(payload);
      if (res.data.success) {
        const updated = res.data.data;
        setJustRegisteredSantri(updated);
        setSelectedSantri(updated);
        setFeedback({
          type: 'success',
          message: `Kartu RFID ${updated.nfcUid} sukses terdaftar untuk ${updated.nama}!`
        });

        // Update list lokal
        setSantriList(prev => prev.map(s => s.id === updated.id ? updated : s));

        if (onSuccess) {
          onSuccess(updated);
        }
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Gagal mendaftarkan kartu RFID';
      setFeedback({ type: 'error', message: errMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lepas / Cabut Kartu RFID
  const handleUnregister = async () => {
    if (!selectedSantri || !selectedSantri.nfcUid) return;
    if (!window.confirm(`Yakin ingin mencabut kartu RFID (${selectedSantri.nfcUid}) dari santri ${selectedSantri.nama}?`)) return;

    try {
      setIsSubmitting(true);
      const res = await unregisterRfidCard({ santriId: selectedSantri.id });
      if (res.data.success) {
        const updated = { ...selectedSantri, nfcUid: null };
        setSelectedSantri(updated);
        setRfidUid('');
        setSantriList(prev => prev.map(s => s.id === updated.id ? updated : s));
        setFeedback({
          type: 'success',
          message: `Kartu RFID berhasil dicabut dari santri ${updated.nama}.`
        });
        if (onSuccess) onSuccess(updated);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mencabut kartu'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter santri list
  const filteredSantri = santriList.filter(s => {
    const matchesSearch = 
      (s.nama && s.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.nis && s.nis.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.kelas && s.kelas.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.kamar && s.kamar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.nfcUid && s.nfcUid.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterType === 'WITHOUT_CARD') return !s.nfcUid;
    if (filterType === 'WITH_CARD') return !!s.nfcUid;
    return true;
  });

  const countWithCard = santriList.filter(s => s.nfcUid).length;
  const countWithoutCard = santriList.length - countWithCard;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-8 flex flex-col max-h-[92vh]">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-extrabold text-amber-300 border border-white/20 mb-1">
                  <ShieldCheck className="w-3 h-3 text-[#8CE829]" />
                  <span>SUPER ADMIN KARTU SANTRI</span>
                </div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Pendaftaran & Aktivasi Kartu RFID / NFC
                </h2>
                <p className="text-xs text-blue-100/80">
                  Tautkan kartu fisik RFID ke santri untuk uang saku non-tunai, absensi, dan akses perizinan.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* Left Column (5/12): Pilih Santri */}
            <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col bg-slate-50/60 overflow-hidden">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Pilih Santri ({santriList.length})
                  </span>
                  <div className="text-[11px] font-semibold text-slate-500">
                    <span className="text-emerald-600 font-bold">{countWithCard} Ber-RFID</span> • 
                    <span className="text-amber-600 font-bold ml-1">{countWithoutCard} Belum</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2.5">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIS, kelas, kamar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterType('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      filterType === 'ALL'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Semua ({santriList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('WITHOUT_CARD')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      filterType === 'WITHOUT_CARD'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Belum Punya Kartu ({countWithoutCard})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('WITH_CARD')}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition-colors ${
                      filterType === 'WITH_CARD'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Sudah Punya Kartu ({countWithCard})
                  </button>
                </div>
              </div>

              {/* List Santri Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[220px] max-h-[360px] lg:max-h-none">
                {loadingSantri ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data santri...
                  </div>
                ) : filteredSantri.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    Tidak ditemukan santri yang sesuai kriteria.
                  </div>
                ) : (
                  filteredSantri.map((s) => {
                    const isSelected = selectedSantri?.id === s.id;
                    const hasCard = !!s.nfcUid;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSantri(s)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 text-xs ${
                          isSelected
                            ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : hasCard
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {s.nama?.charAt(0) || 'S'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {s.nama}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                              <span>NIS: {s.nis || '-'}</span>
                              <span>•</span>
                              <span>{s.kelas || 'Umum'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {hasCard ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Radio className="w-2.5 h-2.5" />
                              <span className="font-mono">{s.nfcUid}</span>
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Belum Terdaftar
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column (7/12): Form Registrasi & Preview Kartu */}
            <div className="lg:col-span-7 p-4 sm:p-6 overflow-y-auto space-y-5 flex flex-col justify-between">
              
              {/* If no santri selected */}
              {!selectedSantri ? (
                <div className="my-auto py-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">Pilih Santri Terlebih Dahulu</div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      Pilih santri dari daftar di sebelah kiri untuk mendaftarkan kartu RFID/NFC fisik baru atau memperbarui data kartu mereka.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  
                  {/* Selected Santri Banner */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-4 shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-lg">
                        {selectedSantri.nama?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-white">{selectedSantri.nama}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            selectedSantri.status === 'AKTIF' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'
                          }`}>
                            {selectedSantri.status}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 flex flex-wrap items-center gap-3">
                          <span>NIS: <strong className="text-white font-mono">{selectedSantri.nis || '-'}</strong></span>
                          <span>Kelas: <strong className="text-white">{selectedSantri.kelas || '-'}</strong></span>
                          <span>Kamar: <strong className="text-white">{selectedSantri.kamar || '-'}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-slate-700 sm:pl-4">
                      <div className="text-[11px] text-slate-400">Saldo Saku Aktif</div>
                      <div className="font-mono font-black text-base text-[#8CE829]">
                        Rp {(selectedSantri.saldo_saku || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {feedback && (
                    <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 font-semibold animate-in fade-in ${
                      feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : feedback.type === 'error'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : feedback.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <span className="flex-1">{feedback.message}</span>
                      {feedback.type === 'success' && (
                        <button
                          type="button"
                          onClick={() => setIsPrintModalOpen(true)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak KTSD</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* RFID Input Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    
                    {/* Scanner / RFID UID Box */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
                          <span>Pindai / Masukkan UID Kartu RFID (NFC) *</span>
                        </label>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handleGenerateUid}
                            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-blue-700 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                            title="Buat UID acak untuk pengujian tanpa tap reader fisik"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>Generate UID Simulasi</span>
                          </button>
                        </div>
                      </div>

                      <div className="relative">
                        <input
                          ref={rfidInputRef}
                          type="text"
                          required
                          placeholder="Tap kartu pada USB NFC Reader atau ketik UID di sini..."
                          value={rfidUid}
                          onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                          className="w-full pl-3.5 pr-28 py-2.5 bg-white border-2 border-blue-400/80 focus:border-blue-600 rounded-xl font-mono text-sm font-black tracking-wider text-slate-900 outline-none shadow-inner"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {rfidUid && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold">
                              Siap
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 px-1">
                            HEX/UID
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Mendukung reader USB standar 13.56 MHz (Mifare 1K, Ultralight, NTAG213/215/216).
                        </span>
                        {selectedSantri.nfcUid && (
                          <button
                            type="button"
                            onClick={handleUnregister}
                            disabled={isSubmitting}
                            className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Cabut Kartu Ini</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Config: Saldo Saku & Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                          <span>Set Saldo Uang Saku Awal (Rp)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Opsional</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">Rp</span>
                          <input
                            type="number"
                            value={saldoSaku}
                            onChange={(e) => setSaldoSaku(e.target.value)}
                            placeholder="0"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        {/* Quick Presets */}
                        <div className="flex items-center gap-1 mt-1.5">
                          {['20000', '50000', '100000'].map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setSaldoSaku(amt)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded text-[10px] font-semibold text-slate-600 transition-colors"
                            >
                              +{(parseInt(amt)/1000)}rb
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Status Keaktifan Santri & Kartu
                        </label>
                        <select
                          value={cardStatus}
                          onChange={(e) => setCardStatus(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          <option value="AKTIF">AKTIF (Dapat Bertransaksi & Izin)</option>
                          <option value="NONAKTIF">NONAKTIF (Kartu Ditangguhkan)</option>
                          <option value="ALUMNI">ALUMNI (Tamat Belajar)</option>
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1.5">
                          Kartu berstatus Nonaktif akan ditolak otomatis di POS kantin & portal gerbang.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {selectedSantri.nfcUid && (
                          <button
                            type="button"
                            onClick={() => setIsPrintModalOpen(true)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center gap-1.5"
                          >
                            <Printer className="w-4 h-4 text-slate-600" />
                            <span>Preview / Cetak KTSD</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <button
                          type="button"
                          onClick={() => setSelectedSantri(null)}
                          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all"
                        >
                          Ganti Santri
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting || !rfidUid.trim()}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Mendaftarkan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Simpan & Aktivasi Kartu</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              )}

              {/* Footer Note */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Validasi anti-duplikasi otomatis aktif. 1 Kartu RFID hanya dapat dimiliki 1 santri.
                  </span>
                </div>
                <span className="font-mono text-[10px] text-slate-400">SiPesand v2.4</span>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Modal Cetak Kartu Santri KTSD */}
      {selectedSantri && (
        <SantriIdCard
          santri={selectedSantri}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </>
  );
}
