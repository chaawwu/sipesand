import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  AlertTriangle, 
  X, 
  Trash2, 
  Edit, 
  Radio, 
  BookOpen,
  Calendar,
  UserCheck,
  MessageSquare,
  Smartphone,
  Send,
  Printer,
  User,
  ArrowRight,
  ExternalLink,
  Zap,
  Check,
  ChevronRight
} from 'lucide-react';
import { 
  getViolations, 
  createViolation, 
  updateViolationStatus, 
  deleteViolation,
  getPermits,
  createPermit,
  updatePermitStatus,
  getSantriList,
  getSantriByNfc,
  checkInByNfc
} from '../services/api';
import { subscribeCloudPermits } from '../services/cloudDatabase';

export default function SecurityKamtib({ onOpenNfcModal }) {
  const [subTab, setSubTab] = useState('permits'); // 'permits' | 'violations' | 'rules'
  
  // Data States
  const [permits, setPermits] = useState([]);
  const [violations, setViolations] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // ============================================================================
  // SMART NFC PERIZINAN KAMTIB STATE
  // ============================================================================
  const isWebNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [isNfcScanning, setIsNfcScanning] = useState(false);
  const [nfcScanError, setNfcScanError] = useState(null);
  const nfcControllerRef = useRef(null);
  const [smartNfcUid, setSmartNfcUid] = useState('');

  // Modal Pop-Up Otomatis Perizinan
  const [isSmartPermitModalOpen, setIsSmartPermitModalOpen] = useState(false);
  const [smartSantri, setSmartSantri] = useState(null);
  const [smartActivePermit, setSmartActivePermit] = useState(null);
  const [smartType, setSmartType] = useState('HARIAN');
  const [smartReason, setSmartReason] = useState('');
  const [smartDestination, setSmartDestination] = useState('Dalam Kota');
  const [smartDepartureTime, setSmartDepartureTime] = useState(new Date().toISOString().slice(0, 16));
  const [smartReturnTime, setSmartReturnTime] = useState(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [smartNotes, setSmartNotes] = useState('');
  const [smartSendWa, setSmartSendWa] = useState(true);
  const [smartSubmitting, setSmartSubmitting] = useState(false);
  const [smartFeedback, setSmartFeedback] = useState(null);

  // Modal Permit Manual State
  const [isPermitModalOpen, setIsPermitModalOpen] = useState(false);
  const [permitFormData, setPermitFormData] = useState({
    santriId: '',
    type: 'HARIAN',
    reason: '',
    destination: '',
    departureTime: new Date().toISOString().slice(0, 16),
    returnTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16),
    approvedBy: 'Divisi Keamanan (Kamtib)',
    notes: '',
  });

  // Modal Violation State
  const [isViolationModalOpen, setIsViolationModalOpen] = useState(false);
  const [violationFormData, setViolationFormData] = useState({
    santriId: '',
    violation: '',
    category: 'RINGAN',
    takziran: '',
    officer: 'Divisi Keamanan & Kamtib',
  });

  // Audio Feedback Synthesizer
  const playAudio = (type = 'success') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {}
  };

  // Smartphone Web NFC Scanner Engine
  const startNfcScan = async () => {
    if (!isWebNfcSupported) {
      setNfcScanError('Perangkat/Browser ini belum mendukung Web NFC. Gunakan Google Chrome di HP Android ber-NFC.');
      return;
    }
    try {
      setNfcScanError(null);
      const abortController = new AbortController();
      nfcControllerRef.current = abortController;
      const ndef = new window.NDEFReader();
      await ndef.scan({ signal: abortController.signal });
      setIsNfcScanning(true);

      ndef.onreading = (event) => {
        let rawUid = event.serialNumber;
        if (!rawUid && event.message && event.message.records) {
          for (const record of event.message.records) {
            if (record.id) rawUid = record.id;
          }
        }
        if (rawUid) {
          const cleanUid = rawUid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
          }
          handleSmartNfcDetected(cleanUid);
        }
      };

      ndef.onreadingerror = () => {
        playAudio('error');
        setNfcScanError('Gagal membaca kartu. Tempelkan kartu stabil di bodi belakang ponsel.');
      };
    } catch (err) {
      setIsNfcScanning(false);
      setNfcScanError(`Sensor NFC belum aktif: ${err.message}`);
    }
  };

  const stopNfcScan = () => {
    if (nfcControllerRef.current) {
      nfcControllerRef.current.abort();
      nfcControllerRef.current = null;
    }
    setIsNfcScanning(false);
  };

  useEffect(() => {
    return () => {
      stopNfcScan();
    };
  }, []);

  // Handler Ketika Kartu Santri Terdeteksi
  const handleSmartNfcDetected = async (uidToLookup = null) => {
    const targetUid = (uidToLookup || smartNfcUid).trim().toUpperCase();
    if (!targetUid) return;

    try {
      setNfcScanError(null);
      // Cari data santri
      let foundSantri = santriList.find(s => s.nfcUid && s.nfcUid.toUpperCase() === targetUid);
      if (!foundSantri) {
        const res = await getSantriByNfc(targetUid);
        if (res.data.success) {
          foundSantri = res.data.data;
        }
      }

      if (!foundSantri) {
        playAudio('error');
        setNfcScanError(`Kartu RFID UID "${targetUid}" belum terdaftar pada santri manapun.`);
        return;
      }

      playAudio('success');

      // Cek apakah ada izin aktif
      const activePermit = permits.find(p => String(p.santriId) === String(foundSantri.id) && p.status === 'ACTIVE');

      setSmartSantri(foundSantri);
      setSmartActivePermit(activePermit || null);
      setSmartNfcUid(targetUid);
      setSmartFeedback(null);

      // Inisialisasi formulir izin baru
      setSmartType('HARIAN');
      setSmartReason('');
      setSmartDestination('Dalam Kota');
      setSmartDepartureTime(new Date().toISOString().slice(0, 16));
      setSmartReturnTime(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16));
      setSmartNotes('');
      setSmartSendWa(true);

      setIsSmartPermitModalOpen(true);
    } catch (err) {
      playAudio('error');
      setNfcScanError('Kartu RFID santri tidak ditemukan di sistem.');
    }
  };

  // Handler Terbitkan Izin Baru via Smart NFC
  const handleCreateSmartPermit = async (e) => {
    if (e) e.preventDefault();
    if (!smartSantri) return;
    if (!smartReason.trim()) {
      setSmartFeedback({ type: 'error', message: 'Alasan / keperluan izin keluar wajib diisi.' });
      playAudio('error');
      return;
    }

    try {
      setSmartSubmitting(true);
      setSmartFeedback(null);

      const payload = {
        santriId: parseInt(smartSantri.id),
        santri: smartSantri,
        type: smartType,
        reason: smartReason.trim(),
        destination: smartDestination.trim(),
        departureTime: new Date(smartDepartureTime),
        returnTime: new Date(smartReturnTime),
        approvedBy: 'Divisi Keamanan (Kamtib)',
        notes: smartNotes.trim(),
        status: 'ACTIVE'
      };

      const res = await createPermit(payload);
      if (res.data.success) {
        playAudio('success');
        setSmartFeedback({
          type: 'success',
          message: `Surat Izin Keluar untuk ${smartSantri.nama} BERHASIL DITERBITKAN!`
        });
        loadData();

        if (smartSendWa && smartSantri.noHpWali) {
          handleSendPermitWa({ ...payload, id: res.data.data?.id || Date.now() });
        }

        setTimeout(() => {
          setIsSmartPermitModalOpen(false);
        }, 1800);
      }
    } catch (err) {
      playAudio('error');
      setSmartFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal menerbitkan surat izin.'
      });
    } finally {
      setSmartSubmitting(false);
    }
  };

  // Handler Check-In Santri Kembali via Smart NFC
  const handleCheckInSmartPermit = async () => {
    if (!smartSantri || !smartActivePermit) return;

    try {
      setSmartSubmitting(true);
      setSmartFeedback(null);

      const now = new Date();
      const res = await updatePermitStatus(smartActivePermit.id, {
        status: 'COMPLETED',
        actualReturnTime: now.toISOString()
      });

      if (res.data.success) {
        playAudio('success');
        setSmartFeedback({
          type: 'success',
          message: `Santri ${smartSantri.nama} BERHASIL CHECK-IN kembali ke asrama pondok!`
        });
        loadData();

        if (smartSendWa && smartSantri.noHpWali) {
          handleSendPermitWa({
            ...smartActivePermit,
            status: 'RETURNED'
          });
        }

        setTimeout(() => {
          setIsSmartPermitModalOpen(false);
        }, 1800);
      }
    } catch (err) {
      playAudio('error');
      setSmartFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memproses check-in izin.'
      });
    } finally {
      setSmartSubmitting(false);
    }
  };

  useEffect(() => {
    loadData();

    // Real-Time Multi-Device Sync: Monitoring perizinan santri langsung update antar pos keamanan
    const unsubscribe = subscribeCloudPermits(null, (cloudPermits) => {
      if (Array.isArray(cloudPermits)) {
        setPermits(cloudPermits);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [subTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [permitsRes, violationsRes, santriRes] = await Promise.all([
        getPermits(),
        getViolations(),
        getSantriList(),
      ]);

      if (permitsRes.data.success) setPermits(permitsRes.data.data);
      if (violationsRes.data.success) setViolations(violationsRes.data.data);
      if (santriRes.data.success) {
        setSantriList(santriRes.data.data);
        if (!permitFormData.santriId && santriRes.data.data.length > 0) {
          setPermitFormData(prev => ({ ...prev, santriId: santriRes.data.data[0].id.toString() }));
          setViolationFormData(prev => ({ ...prev, santriId: santriRes.data.data[0].id.toString() }));
        }
      }
    } catch (err) {
      console.error('Error loadData Security:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermit = async (e) => {
    e.preventDefault();
    try {
      await createPermit({
        ...permitFormData,
        santriId: parseInt(permitFormData.santriId),
        departureTime: new Date(permitFormData.departureTime),
        returnTime: new Date(permitFormData.returnTime),
      });
      setIsPermitModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menerbitkan surat izin');
    }
  };

  const handleUpdatePermit = async (id, status) => {
    try {
      await updatePermitStatus(id, { status });
      loadData();
    } catch (err) {
      alert('Gagal memperbarui status izin');
    }
  };

  const handleCreateViolation = async (e) => {
    e.preventDefault();
    try {
      await createViolation(violationFormData);
      setIsViolationModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mencatat pelanggaran');
    }
  };

  const handleUpdateViolationStatus = async (id, status) => {
    try {
      await updateViolationStatus(id, { status });
      loadData();
    } catch (err) {
      alert('Gagal memperbarui status takziran');
    }
  };

  const handleSendPermitWa = (p) => {
    const santri = santriList.find(s => s.id === p.santriId) || p.santri;
    if (!santri || !santri.noHpWali) {
      alert(`Nomor WhatsApp wali untuk ${santri?.nama || 'santri ini'} belum terdaftar di database.`);
      return;
    }
    let phone = santri.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const departureStr = new Date(p.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
    const returnStr = new Date(p.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

    const message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nPemberitahuan Resmi Divisi Keamanan & Kamtib Pesantren:\nAnanda memiliki Surat Izin Keluar:\n- Jenis Izin: *${p.type}*\n- Keperluan: *${p.reason}*\n- Tujuan: *${p.destination || 'Dalam Kota'}*\n- Waktu Keluar: ${departureStr}\n- Batas Waktu Kembali: *${returnStr}*\n- Status Saat Ini: *${p.status === 'RETURNED' ? 'SUDAH KEMBALI ASRAMA' : p.status}*\n\nBapak/Ibu dapat memantau perizinan dan presensi ananda secara mandiri melalui Portal Wali:\nhttps://sipesand.web.id/wali-santri\n\nJazakumullah Khairan Katsiran.\n_Divisi Keamanan & Ketertiban (Kamtib) Pesantren_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleSendViolationWa = (v) => {
    const santri = santriList.find(s => s.id === v.santriId) || v.santri;
    if (!santri || !santri.noHpWali) {
      alert(`Nomor WhatsApp wali untuk ${santri?.nama || 'santri ini'} belum terdaftar di database.`);
      return;
    }
    let phone = santri.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nPemberitahuan Disiplin & Pengasuhan Pesantren:\nAnanda tercatat melakukan pelanggaran kedisiplinan asrama:\n- Pelanggaran: *${v.violation}*\n- Kategori: *${v.category}*\n- Ta'zir Edukatif: *${v.takziran || 'Peringatan & Istighfar'}*\n- Status Ta'zir: *${v.status === 'DONE' ? 'SUDAH DIKERJAKAN' : 'SEDANG DALAM PROSES'}*\n- Petugas Pengampu: ${v.officer || 'Divisi Keamanan'}\n\nPemberitahuan ini bertujuan untuk kerja sama pembinaan adab dan kedisiplinan santri bersama orang tua.\n\nJazakumullah Khairan Katsiran.\n_Divisi Keamanan & Pengasuhan Pesantren_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDeleteViolation = async (id) => {
    if (window.confirm('Hapus catatan pelanggaran ini?')) {
      try {
        await deleteViolation(id);
        loadData();
      } catch (err) {
        alert('Gagal menghapus catatan');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('permits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'permits' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Perizinan Keluar / Pulang</span>
          </button>

          <button
            onClick={() => setSubTab('violations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'violations' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Pelanggaran & Takziran</span>
          </button>

          <button
            onClick={() => setSubTab('rules')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              subTab === 'rules' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tata Tertib Pesantren</span>
          </button>
        </div>

        <div>
          {subTab === 'permits' ? (
            <button
              onClick={() => setIsPermitModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Izin Manual</span>
            </button>
          ) : subTab === 'violations' ? (
            <button
              onClick={() => setIsViolationModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelanggaran & Takziran</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* SMART NFC CARD SCANNER BANNER (KAMTIB OTOMATIS)                         */}
      {/* ======================================================================= */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-blue-500/20 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              isNfcScanning 
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 ring-4 ring-emerald-400/20 animate-pulse' 
                : 'bg-white/10 border-white/20 text-blue-300'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-[10px] font-extrabold text-blue-300 border border-blue-400/30 mb-1">
                <Radio className={`w-2.5 h-2.5 ${isNfcScanning ? 'animate-ping text-emerald-400' : 'text-blue-300'}`} />
                <span>SMART NFC KAMTIB GATEWAY</span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                Pindai ID Card Santri untuk Perizinan Otomatis
              </h3>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Tempelkan kartu santri ke ponsel Android atau reader: Sistem seketika membuka detail izin keluar / konfirmasi kepulangan.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={isNfcScanning ? stopNfcScan : startNfcScan}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isNfcScanning
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 ring-2 ring-emerald-300 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isNfcScanning ? '🟢 Tempelkan Kartu ke HP...' : 'Pindai via HP NFC'}</span>
            </button>

            {/* Quick UID input for USB Barcode / RFID Reader */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20">
              <Radio className="w-3.5 h-3.5 text-blue-300 ml-2" />
              <input
                type="text"
                placeholder="Scan reader / ketik UID..."
                value={smartNfcUid}
                onChange={(e) => setSmartNfcUid(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && smartNfcUid.trim()) {
                    handleSmartNfcDetected(smartNfcUid.trim());
                  }
                }}
                className="bg-transparent text-xs font-mono font-bold text-white placeholder:text-blue-300/50 px-2 py-1 outline-none w-36 sm:w-44"
              />
              <button
                type="button"
                onClick={() => smartNfcUid.trim() && handleSmartNfcDetected(smartNfcUid.trim())}
                className="px-3 py-1 bg-white hover:bg-blue-50 text-blue-900 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
              >
                Cek
              </button>
            </div>
          </div>
        </div>

        {nfcScanError && (
          <div className="mt-3 p-2.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{nfcScanError}</span>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 1. SUB-TAB PERIZINAN KELUAR / PULANG                                    */}
      {/* ======================================================================= */}
      {subTab === 'permits' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Daftar Perizinan Santri & Deteksi Overdue</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri</th>
                  <th className="py-3.5 px-4">Jenis & Keperluan</th>
                  <th className="py-3.5 px-4">Tujuan</th>
                  <th className="py-3.5 px-4">Jadwal Keluar - Kembali</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Memuat data perizinan...</td>
                  </tr>
                ) : permits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">Belum ada data perizinan</td>
                  </tr>
                ) : (
                  permits.map((p) => {
                    const now = new Date();
                    const isLate = p.status === 'ACTIVE' && new Date(p.returnTime) < now;
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{p.santri?.nama}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NIS: {p.santri?.nis} • {p.santri?.kelas}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                            {p.type}
                          </span>
                          <div className="font-medium text-slate-800 mt-1">{p.reason}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{p.destination || 'Dalam Kota'}</td>
                        <td className="py-3.5 px-4 text-slate-500">
                          <div>Keluar: {new Date(p.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className={isLate ? 'text-rose-600 font-bold' : ''}>
                            Kembali: {new Date(p.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isLate || p.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-700'
                              : p.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {isLate ? 'OVERDUE (TERLAMBAT)' : p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleSendPermitWa(p)}
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Kirim Notifikasi Izin ke WhatsApp Wali"
                            >
                              <MessageSquare className="w-3.5 h-3.5 fill-emerald-100" />
                            </button>
                            {p.status === 'ACTIVE' || isLate ? (
                              <button
                                onClick={() => handleUpdatePermit(p.id, 'RETURNED')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                              >
                                Check-In Kembali
                              </button>
                            ) : p.status === 'PENDING' ? (
                              <button
                                onClick={() => handleUpdatePermit(p.id, 'APPROVED')}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                              >
                                ACC Izin
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">Sudah kembali</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. SUB-TAB PELANGGARAN & TAKZIRAN                                       */}
      {/* ======================================================================= */}
      {subTab === 'violations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Catatan Pelanggaran Tata Tertib & Sanksi Takziran Edukatif</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Santri</th>
                  <th className="py-3.5 px-4">Bentuk Pelanggaran</th>
                  <th className="py-3.5 px-4">Kategori</th>
                  <th className="py-3.5 px-4">Sanksi Takziran Edukatif</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-center">Aksi Kamtib</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {violations.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{v.santri?.nama}</div>
                      <div className="text-[10px] text-slate-400 font-mono">NIS: {v.santri?.nis}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{v.violation}</div>
                      <div className="text-[10px] text-slate-400">{new Date(v.date).toLocaleDateString('id-ID')} • {v.officer}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        v.category === 'BERAT' ? 'bg-rose-100 text-rose-800' : v.category === 'SEDANG' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {v.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-amber-900 bg-amber-50/50">
                      {v.takziran}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        v.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleSendViolationWa(v)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Kirim Catatan Pelanggaran ke WhatsApp Wali"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-emerald-100" />
                        </button>
                        {v.status === 'PROSES' && (
                          <button
                            onClick={() => handleUpdateViolationStatus(v.id, 'SELESAI')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-colors"
                          >
                            Tandai Selesai
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteViolation(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. SUB-TAB TATA TERTIB PESANTREN                                        */}
      {/* ======================================================================= */}
      {subTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Pedoman Tata Tertib & Kedisiplinan Pondok Pesantren
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
              <h4 className="font-bold text-blue-900 text-xs">1. Kedisiplinan Ibadah</h4>
              <p className="text-blue-950/80 leading-relaxed text-[11px]">
                Wajib mengikuti sholat lima waktu berjamaah di masjid tepat waktu. Santri yang masbuk 3x berturut-turut akan diberikan bimbingan muhafadzoh adab.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <h4 className="font-bold text-emerald-900 text-xs">2. Perizinan Keluar</h4>
              <p className="text-emerald-950/80 leading-relaxed text-[11px]">
                Keluar lingkungan pondok wajib membawa kartu Smart NFC dan surat izin resmi dari Kamtib. Keterlambatan tercatat otomatis sebagai status Overdue.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h4 className="font-bold text-amber-900 text-xs">3. Sanksi & Takziran Edukatif</h4>
              <p className="text-amber-950/80 leading-relaxed text-[11px]">
                Semua takziran bersifat mendidik (ziyadah hafalan Al-Qur'an, mufrodat bahasa Arab/Inggris, atau piket kebersihan asrama).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Izin */}
      {isPermitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-blue-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Terbitkan Surat Izin Santri</h3>
              <button onClick={() => setIsPermitModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreatePermit} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Santri *</label>
                <select
                  required
                  value={permitFormData.santriId}
                  onChange={(e) => setPermitFormData({ ...permitFormData, santriId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Perizinan</label>
                <select
                  value={permitFormData.type}
                  onChange={(e) => setPermitFormData({ ...permitFormData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="HARIAN">Izin Harian (Beli Kitab / Kebutuhan)</option>
                  <option value="PULANG">Izin Pulang / Sambang Wali</option>
                  <option value="BEROBAT">Izin Berobat ke Klinik / RS</option>
                  <option value="LOMBA">Delegasi Lomba / Acara Luar</option>
                  <option value="DARURAT">Izin Darurat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan / Keperluan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemeriksaan dokter gigi"
                  value={permitFormData.reason}
                  onChange={(e) => setPermitFormData({ ...permitFormData, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tujuan</label>
                <input
                  type="text"
                  placeholder="Contoh: RS PKU Muhammadiyah"
                  value={permitFormData.destination}
                  onChange={(e) => setPermitFormData({ ...permitFormData, destination: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Waktu Keluar</label>
                  <input
                    type="datetime-local"
                    value={permitFormData.departureTime}
                    onChange={(e) => setPermitFormData({ ...permitFormData, departureTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batas Kembali</label>
                  <input
                    type="datetime-local"
                    value={permitFormData.returnTime}
                    onChange={(e) => setPermitFormData({ ...permitFormData, returnTime: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPermitModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md"
                >
                  Terbitkan Izin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Catat Pelanggaran */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 text-xs">
            <div className="bg-rose-700 text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Catat Pelanggaran & Takziran Santri</h3>
              <button onClick={() => setIsViolationModalOpen(false)} className="text-white hover:opacity-80">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateViolation} className="p-5 space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Pilih Santri *</label>
                <select
                  required
                  value={violationFormData.santriId}
                  onChange={(e) => setViolationFormData({ ...violationFormData, santriId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500 font-semibold"
                >
                  {santriList.map((s) => (
                    <option key={s.id} value={s.id}>{s.nama} ({s.nis})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bentuk Pelanggaran *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Terlambat sholat maghrib berjamaah"
                  value={violationFormData.violation}
                  onChange={(e) => setViolationFormData({ ...violationFormData, violation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tingkat Kategori</label>
                <select
                  value={violationFormData.category}
                  onChange={(e) => setViolationFormData({ ...violationFormData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-rose-500"
                >
                  <option value="RINGAN">Ringan</option>
                  <option value="SEDANG">Sedang</option>
                  <option value="BERAT">Berat</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bentuk Sanksi Takziran Edukatif *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Membaca mufrodat di depan asrama / Piket masjid"
                  value={violationFormData.takziran}
                  onChange={(e) => setViolationFormData({ ...violationFormData, takziran: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsViolationModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* POP-UP MODAL SMART PERIZINAN SANTRI (OTOMATIS TAP ID CARD)              */}
      {/* ======================================================================= */}
      {isSmartPermitModalOpen && smartSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 my-4 flex flex-col">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-sm shrink-0">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-900/80 text-[10px] font-mono font-bold text-amber-300 border border-blue-400/30 mb-0.5">
                    <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                    <span>NFC UID: {smartSantri.nfcUid || smartNfcUid}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Smart Perizinan Kamtib SiPesand
                  </h3>
                  <p className="text-xs text-blue-100/80">
                    Sistem deteksi otomatis keberadaan & perizinan santri via ID Card fisik.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSmartPermitModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              
              {/* Santri Profile Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 shadow-xs">
                    {smartSantri.foto ? (
                      <img src={smartSantri.foto} alt={smartSantri.nama} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">
                      {smartSantri.nama}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">NIS: {smartSantri.nis || '-'}</span>
                      <span>•</span>
                      <span>{smartSantri.kelas || 'Umum'}</span>
                      <span>•</span>
                      <span>{smartSantri.kamar || 'Asrama Pondok'}</span>
                    </div>
                    {smartSantri.namaWali && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Wali: {smartSantri.namaWali} {smartSantri.noHpWali && `(${smartSantri.noHpWali})`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Keberadaan Badge */}
                <div className="sm:text-right shrink-0">
                  {smartActivePermit ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                      <Clock className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                      <span>Sedang Izin Keluar</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Berada di Pondok</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Feedback Alert */}
              {smartFeedback && (
                <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold border ${
                  smartFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {smartFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{smartFeedback.message}</span>
                </div>
              )}

              {/* =============================================================== */}
              {/* KONDISI A: SANTRI SEDANG IZIN KELUAR -> MODE CHECK-IN KEMBALI  */}
              {/* =============================================================== */}
              {smartActivePermit ? (
                <div className="space-y-4">
                  <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-200/80">
                      <span className="font-black text-amber-900 flex items-center gap-1.5 text-xs">
                        <Clock className="w-4 h-4 text-amber-700" />
                        <span>Detail Surat Izin Aktif</span>
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 font-extrabold text-[10px]">
                        {smartActivePermit.type}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500">Keperluan / Alasan:</div>
                        <div className="font-bold text-slate-800">{smartActivePermit.reason}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Tujuan:</div>
                        <div className="font-bold text-slate-800">{smartActivePermit.destination || 'Dalam Kota'}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Waktu Berangkat:</div>
                        <div className="font-bold text-slate-800 font-mono">
                          {new Date(smartActivePermit.departureTime).toLocaleTimeString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500">Batas Waktu Kembali:</div>
                        <div className="font-bold text-slate-800 font-mono">
                          {new Date(smartActivePermit.returnTime).toLocaleTimeString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Status Ketepatan Waktu */}
                    {(() => {
                      const now = new Date();
                      const scheduled = new Date(smartActivePermit.returnTime);
                      const isLate = scheduled < now;
                      const diffMinutes = Math.round(Math.abs(now - scheduled) / (1000 * 60));
                      const diffHours = Math.floor(diffMinutes / 60);
                      const remMins = diffMinutes % 60;
                      const diffStr = diffHours > 0 ? `${diffHours} jam ${remMins} menit` : `${remMins} menit`;

                      return isLate ? (
                        <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <span className="font-black">TERLAMBAT {diffStr}!</span> Santri melewati batas waktu kembali yang diizinkan.
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-black">Tepat Waktu:</span> Santri kembali sebelum batas waktu berakhir (Sisa {diffStr}).
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Options & Action Buttons */}
                  <div className="space-y-3 pt-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={smartSendWa}
                        onChange={(e) => setSmartSendWa(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span>Kirim konfirmasi kepulangan otomatis ke WhatsApp wali santri</span>
                    </label>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                      <button
                        type="button"
                        onClick={() => setIsSmartPermitModalOpen(false)}
                        className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                      >
                        Tutup
                      </button>
                      <button
                        type="button"
                        disabled={smartSubmitting}
                        onClick={handleCheckInSmartPermit}
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>{smartSubmitting ? 'Memproses...' : 'Konfirmasi Santri Kembali ke Asrama (Check-In)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* =============================================================== */
                /* KONDISI B: SANTRI DI PONDOK -> FORMULIR TERBITKAN IZIN BARU     */
                /* =============================================================== */
                <form onSubmit={handleCreateSmartPermit} className="space-y-3.5">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Terbitkan Surat Izin Keluar Baru</span>
                  </div>

                  {/* Jenis Izin Presets */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">Jenis Izin Keluar</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'HARIAN', label: 'Pesiar / Keluar', icon: Clock },
                        { id: 'PULANG', label: 'Pulang ke Rumah', icon: Calendar },
                        { id: 'BEROBAT', label: 'Berobat / Medis', icon: ShieldCheck },
                        { id: 'KELUARGA', label: 'Acara Keluarga', icon: User },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSmartType(item.id);
                            if (item.id === 'PULANG') {
                              setSmartReason('Pulang libur / acara keluarga');
                              setSmartReturnTime(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
                            } else if (item.id === 'BEROBAT') {
                              setSmartReason('Berobat ke klinik / dokter spesialis');
                              setSmartReturnTime(new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 16));
                            } else if (item.id === 'HARIAN') {
                              setSmartReason('Beli perlengkapan kitab & santri');
                              setSmartReturnTime(new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16));
                            }
                          }}
                          className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                            smartType === item.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-xs">{item.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Keperluan / Alasan */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Alasan & Keperluan Izin *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Menjenguk keluarga sakit / Beli kitab ke toko buku"
                      value={smartReason}
                      onChange={(e) => setSmartReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 font-semibold text-xs outline-none"
                    />
                    {/* Quick Suggestions */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      {[
                        'Beli perlengkapan harian',
                        'Berobat ke puskesmas/dokter',
                        'Pulang takziyah keluarga',
                        'Tugas pondok / musabaqoh',
                      ].map((sug) => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => setSmartReason(sug)}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          + {sug}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tujuan */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tujuan / Alamat Keluar</label>
                    <input
                      type="text"
                      placeholder="Contoh: Rumah orang tua di Kediri / Pasar Pare"
                      value={smartDestination}
                      onChange={(e) => setSmartDestination(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-xs outline-none"
                    />
                  </div>

                  {/* Tanggal & Waktu */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Waktu Berangkat</label>
                      <input
                        type="datetime-local"
                        value={smartDepartureTime}
                        onChange={(e) => setSmartDepartureTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Batas Waktu Kembali *</label>
                      <input
                        type="datetime-local"
                        required
                        value={smartReturnTime}
                        onChange={(e) => setSmartReturnTime(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-400 bg-blue-50/50 rounded-xl text-xs outline-none font-mono font-bold text-blue-950"
                      />
                    </div>
                  </div>

                  {/* Catatan Kamtib */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan Kamtib</label>
                    <input
                      type="text"
                      placeholder="Catatan penjamin / barang bawaan santri..."
                      value={smartNotes}
                      onChange={(e) => setSmartNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs outline-none"
                    />
                  </div>

                  {/* Send WhatsApp Toggle */}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={smartSendWa}
                      onChange={(e) => setSmartSendWa(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span>Kirim pemberitahuan izin keluar langsung ke WhatsApp wali santri</span>
                  </label>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSmartPermitModalOpen(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={smartSubmitting || !smartReason.trim()}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{smartSubmitting ? 'Menerbitkan...' : 'Setujui & Terbitkan Surat Izin'}</span>
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
