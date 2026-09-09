import React, { useState, useEffect, useRef } from 'react';
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
  Filter,
  Smartphone,
  User,
  Lock,
  Zap,
  ArrowRight,
  ExternalLink,
  Banknote
} from 'lucide-react';
import { 
  getSantriList, 
  getSantriByNfc, 
  createPocketTransaction, 
  deductPocketBalance, 
  getPocketTransactions, 
  getSantriBills 
} from '../services/api';
import { subscribeCloudPocket, subscribeCloudSantri } from '../services/cloudDatabase';
import SantriIdCard from '../components/SantriIdCard';
import OfficialReceipt from '../components/OfficialReceipt';
import { useSettings } from '../context/SettingsContext';

export default function PocketAndCash({ onOpenNfcModal, currentUser }) {
  const { isNfcEnabled } = useSettings();
  const userRole = currentUser?.role || 'PENGURUS_SAKU';
  const managedIds = currentUser?.managedSantriIds || [];

  // ============================================================================
  // SMART NFC TARIK TUNAI CASH STATE
  // ============================================================================
  const isWebNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [isCashNfcScanning, setIsCashNfcScanning] = useState(false);
  const [cashNfcError, setCashNfcError] = useState(null);
  const cashNfcControllerRef = useRef(null);
  const [smartCashUid, setSmartCashUid] = useState('');

  // Modal Pop-Up Tarik Tunai Khusus
  const [isSmartWithdrawModalOpen, setIsSmartWithdrawModalOpen] = useState(false);
  const [smartWithdrawSantri, setSmartWithdrawSantri] = useState(null);
  const [smartWithdrawAmount, setSmartWithdrawAmount] = useState('20000');
  const [smartWithdrawNotes, setSmartWithdrawNotes] = useState('Uang saku tunai harian/mingguan');
  const [smartWithdrawPin, setSmartWithdrawPin] = useState('');
  const [smartBypassPin, setSmartBypassPin] = useState(true);
  const [smartWithdrawSendWa, setSmartWithdrawSendWa] = useState(true);
  const [smartWithdrawProcessing, setSmartWithdrawProcessing] = useState(false);
  const [smartWithdrawFeedback, setSmartWithdrawFeedback] = useState(null);
  const [smartLastSuccessTx, setSmartLastSuccessTx] = useState(null);

  // State Standar
  const [allSantriList, setAllSantriList] = useState([]);
  const [santriList, setSantriList] = useState([]);
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [nfcInput, setNfcInput] = useState('');
  const [searchSantri, setSearchSantri] = useState('');
  const [scanningNfc, setScanningNfc] = useState(false);
  
  // Form Transaksi Harian
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

    // Multi-Device Cloud Real-Time Listener untuk mutasi saku dan saldo santri
    const unsubPocket = subscribeCloudPocket(null, (cloudTxs) => {
      if (Array.isArray(cloudTxs)) setRecentDeductions(cloudTxs);
    });

    const unsubSantri = subscribeCloudSantri(null, (cloudSantri) => {
      if (Array.isArray(cloudSantri)) {
        setAllSantriList(cloudSantri);
        let filtered = cloudSantri;
        if (userRole === 'PENGURUS_SAKU' && Array.isArray(managedIds) && managedIds.length > 0) {
          filtered = cloudSantri.filter(s => managedIds.includes(s.id));
        }
        setSantriList(filtered);
        if (selectedSantri) {
          const updated = cloudSantri.find(s => s.id === selectedSantri.id);
          if (updated) setSelectedSantri(updated);
        }
      }
    });

    return () => {
      if (typeof unsubPocket === 'function') unsubPocket();
      if (typeof unsubSantri === 'function') unsubSantri();
    };
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

  // Synthesizer Nada Chime & Kasir
  const playCashChime = (type = 'cash') => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'cash') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.22, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {}
  };

  // Smartphone Web NFC Scanner Engine untuk Tarik Tunai Cash
  const startCashNfcScan = async () => {
    if (!isWebNfcSupported) {
      setCashNfcError('Perangkat/Browser ini belum mendukung Web NFC. Gunakan Google Chrome di HP Android ber-NFC.');
      return;
    }
    try {
      setCashNfcError(null);
      const abortController = new AbortController();
      cashNfcControllerRef.current = abortController;
      const ndef = new window.NDEFReader();
      await ndef.scan({ signal: abortController.signal });
      setIsCashNfcScanning(true);

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
          handleSmartWithdrawDetected(cleanUid);
        }
      };

      ndef.onreadingerror = () => {
        playCashChime('error');
        setCashNfcError('Gagal membaca kartu. Tempelkan kartu stabil di bodi belakang ponsel.');
      };
    } catch (err) {
      setIsCashNfcScanning(false);
      setCashNfcError(`Sensor NFC belum aktif: ${err.message}`);
    }
  };

  const stopCashNfcScan = () => {
    if (cashNfcControllerRef.current) {
      cashNfcControllerRef.current.abort();
      cashNfcControllerRef.current = null;
    }
    setIsCashNfcScanning(false);
  };

  useEffect(() => {
    return () => {
      stopCashNfcScan();
    };
  }, []);

  // Handler Ketika Kartu Santri Terdeteksi untuk Tarik Tunai
  const handleSmartWithdrawDetected = async (uidToLookup = null) => {
    const targetUid = (uidToLookup || smartCashUid).trim().toUpperCase();
    if (!targetUid) return;

    try {
      setCashNfcError(null);
      let foundSantri = allSantriList.find(s => s.nfcUid && s.nfcUid.toUpperCase() === targetUid);
      if (!foundSantri) {
        const res = await getSantriByNfc(targetUid);
        if (res.data.success) {
          foundSantri = res.data.data;
        }
      }

      if (!foundSantri) {
        playCashChime('error');
        setCashNfcError(`Kartu RFID UID "${targetUid}" belum terdaftar pada santri manapun.`);
        return;
      }

      playCashChime('success');
      setSmartWithdrawSantri(foundSantri);
      setSmartCashUid(targetUid);
      setSmartWithdrawAmount('20000');
      setSmartWithdrawNotes('Uang saku tunai harian/mingguan');
      setSmartWithdrawPin('');
      setSmartBypassPin(true);
      setSmartWithdrawFeedback(null);
      setSmartLastSuccessTx(null);
      setIsSmartWithdrawModalOpen(true);
    } catch (err) {
      playCashChime('error');
      setCashNfcError('Data santri tidak ditemukan.');
    }
  };

  // Eksekusi Tarik Tunai Cash Aman
  const handleExecuteSmartWithdraw = async (e) => {
    if (e) e.preventDefault();
    if (!smartWithdrawSantri) return;

    const nominal = parseFloat(smartWithdrawAmount);
    if (!nominal || nominal <= 0) {
      setSmartWithdrawFeedback({ type: 'error', message: 'Masukkan nominal penarikan yang valid.' });
      playCashChime('error');
      return;
    }

    const currentBal = parseFloat(smartWithdrawSantri.saldo_saku || 0);
    if (currentBal < nominal) {
      setSmartWithdrawFeedback({
        type: 'error',
        message: `Saldo tidak mencukupi! Saldo saat ini Rp ${currentBal.toLocaleString('id-ID')}, penarikan Rp ${nominal.toLocaleString('id-ID')}.`
      });
      playCashChime('error');
      return;
    }

    // Verifikasi PIN jika tidak bypass
    if (!smartBypassPin) {
      const expectedPin = (smartWithdrawSantri.nis || '1234').slice(-4);
      if (smartWithdrawPin !== expectedPin) {
        setSmartWithdrawFeedback({
          type: 'error',
          message: `PIN Keamanan salah! Gunakan 4 digit terakhir NIS (${expectedPin}).`
        });
        playCashChime('error');
        return;
      }
    }

    try {
      setSmartWithdrawProcessing(true);
      setSmartWithdrawFeedback(null);

      const defaultMerchantName = `Posko Pengurus Uang Saku (${currentUser?.name || 'Kasir Saku'})`;
      const res = await deductPocketBalance({
        santriId: smartWithdrawSantri.id,
        amount: nominal,
        merchant: defaultMerchantName,
        description: smartWithdrawNotes || 'Tarik Tunai Uang Saku Cash',
        isEmergency: false,
        date: new Date().toISOString().slice(0, 10),
      }, {
        role: userRole,
        name: currentUser?.name || 'Pengurus Uang Saku',
      });

      if (res.data.success) {
        const txData = res.data.data;
        const newBalance = txData.balanceAfter !== undefined ? txData.balanceAfter : (currentBal - nominal);
        playCashChime('cash');

        // Update lokal santri
        const updatedSantri = { ...smartWithdrawSantri, saldo_saku: newBalance };
        setSmartWithdrawSantri(updatedSantri);
        updateLocalBalance(newBalance);

        const successRecord = {
          santri: updatedSantri,
          amount: nominal,
          previousBalance: currentBal,
          currentBalance: newBalance,
          date: new Date().toISOString(),
          description: smartWithdrawNotes,
          officer: currentUser?.name || 'Pengurus Uang Saku'
        };
        setSmartLastSuccessTx(successRecord);

        setSmartWithdrawFeedback({
          type: 'success',
          message: `Tarik tunai Rp ${nominal.toLocaleString('id-ID')} BERHASIL! Sisa saldo: Rp ${newBalance.toLocaleString('id-ID')}.`
        });

        // Auto-send WA jika dipilih
        if (smartWithdrawSendWa && smartWithdrawSantri.noHpWali) {
          sendWithdrawWaReceipt(successRecord);
        }

        // Refresh riwayat mutasi
        const txRes = await getPocketTransactions({ limit: 20 });
        if (txRes.data.success) setRecentDeductions(txRes.data.data);
      }
    } catch (err) {
      playCashChime('error');
      setSmartWithdrawFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal memproses penarikan uang saku.'
      });
    } finally {
      setSmartWithdrawProcessing(false);
    }
  };

  // Helper Kirim Bukti Tarik Tunai WA ke Wali
  const sendWithdrawWaReceipt = (record) => {
    const s = record.santri;
    if (!s || !s.noHpWali) return;
    let phone = s.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const nowStr = new Date(record.date).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const msg = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${s.nama}* (NIS: ${s.nis || '-'}).\n\n*BUKTI PENARIKAN UANG SAKU TUNAI (CASH)*\n- Waktu Penarikan: ${nowStr}\n- Jumlah Ditarik: *Rp ${record.amount.toLocaleString('id-ID')}*\n- Keperluan: ${record.description || 'Kebutuhan Harian'}\n- Petugas Pengasuh: ${record.officer}\n- Saldo Awal: Rp ${record.previousBalance.toLocaleString('id-ID')}\n- *Sisa Saldo Kas Saku: Rp ${record.currentBalance.toLocaleString('id-ID')}*\n\nTransaksi tercatat secara real-time di sistem keuangan SiPesand. Pantau saldo dan transaksi ananda di Portal Wali:\nhttps://sipesand.web.id/wali-santri\n\nJazakumullah Khairan Katsiran.\n_Pengurus Uang Saku & Bendahara Pesantren_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Handler Scan NFC Input Lama
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
      message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nKami dari Bagian Pengurus Uang Saku SiPesand (Sistem Informasi Terpadu Pesantren dan Digital) menginformasikan bahwa saat ini saldo tabungan uang saku santri berada pada posisi *Rp ${santri.saldo_saku?.toLocaleString('id-ID')}* ${santri.saldo_saku < 0 ? '(MINUS/TALANGAN DARURAT)' : '(MENIPIS)'}.\n\nMohon perkenan Bapak/Ibu untuk melakukan isi ulang (Top-Up) melalui Portal Wali atau transfer ke rekening resmi BSI Pesantren agar kebutuhan harian ananda tetap terpenuhi dengan baik.\n\nTerima kasih atas perhatian dan kerja samanya. Jazakumullah Khairan Katsiran.\n_Pengurus Uang Saku SiPesand_`;
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

  const filteredSantri = santriList.filter(s => {
    if (!s) return false;
    const q = (searchSantri || '').toLowerCase();
    const nama = (s.nama || '').toLowerCase();
    const nis = String(s.nis || '');
    const kamar = (s.kamar || '').toLowerCase();
    return nama.includes(q) || nis.includes(q) || kamar.includes(q);
  });

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
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200 disabled:opacity-50 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600" />
            <span>ID Card KTSD</span>
          </button>

          {isNfcEnabled && (
            <button
              onClick={onOpenNfcModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Tap Kartu NFC</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================================= */}
      {/* SMART NFC CARD TARIK TUNAI BANNER (PENGURUS UANG SAKU)                  */}
      {/* ======================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-emerald-500/30 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              isCashNfcScanning 
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-4 ring-emerald-400/20 animate-pulse' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}>
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-extrabold text-emerald-300 border border-emerald-400/30 mb-1">
                <Radio className={`w-2.5 h-2.5 ${isCashNfcScanning ? 'animate-ping text-emerald-300' : 'text-emerald-400'}`} />
                <span>SMART NFC CASH DISPENSE</span>
              </div>
              <h3 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                Tarik Tunai Uang Saku Cash via Tap ID Card
              </h3>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Santri tempelkan kartu pintar ke HP pengurus: saldo langsung terdeteksi, pilih nominal cash, dan struk WA otomatis terkirim.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={isCashNfcScanning ? stopCashNfcScan : startCashNfcScan}
              className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md cursor-pointer ${
                isCashNfcScanning
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 ring-2 ring-emerald-200 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>{isCashNfcScanning ? '🟢 Tempelkan Kartu Santri...' : 'Tap Kartu Tarik Tunai'}</span>
            </button>

            {/* Quick UID lookup for USB Reader */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20">
              <Radio className="w-3.5 h-3.5 text-emerald-400 ml-2" />
              <input
                type="text"
                placeholder="Scan reader / ketik UID..."
                value={smartCashUid}
                onChange={(e) => setSmartCashUid(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && smartCashUid.trim()) {
                    handleSmartWithdrawDetected(smartCashUid.trim());
                  }
                }}
                className="bg-transparent text-xs font-mono font-bold text-white placeholder:text-emerald-300/50 px-2 py-1 outline-none w-36 sm:w-44"
              />
              <button
                type="button"
                onClick={() => smartCashUid.trim() && handleSmartWithdrawDetected(smartCashUid.trim())}
                className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-950 rounded-lg text-xs font-extrabold transition-all cursor-pointer"
              >
                Cek
              </button>
            </div>
          </div>
        </div>

        {cashNfcError && (
          <div className="mt-3 p-2.5 bg-rose-950/80 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{cashNfcError}</span>
          </div>
        )}
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
                  santriList.filter(Boolean).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama || 'Santri'} ({s.kelas || '-'}) — Saldo: Rp {(s.saldo_saku || 0).toLocaleString('id-ID')} {(s.saldo_saku || 0) < 0 ? '[MINUS]' : ''}
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
                  const isNegative = (s.saldo_saku || 0) < 0;
                  return (
                    <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                      <div 
                        onClick={() => handleSelectSantri(s.id)}
                        className="cursor-pointer flex-1 min-w-0"
                      >
                        <div className="font-bold text-slate-800 truncate">{s.nama || 'Santri'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {s.nis || '-'} • {s.kamar || '-'}</div>
                      </div>

                      <div className="text-right flex items-center gap-2">
                        <div>
                          <div className={`font-mono font-bold ${isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
                            Rp {(s.saldo_saku || 0).toLocaleString('id-ID')}
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

      {/* ======================================================================= */}
      {/* POP-UP MODAL SMART TARIK TUNAI CASH (OTOMATIS TAP ID CARD)             */}
      {/* ======================================================================= */}
      {isSmartWithdrawModalOpen && smartWithdrawSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 my-4 flex flex-col">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-slate-900 text-white p-5 flex items-center justify-between relative overflow-hidden">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shadow-sm shrink-0">
                  <Banknote className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-900/80 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-400/30 mb-0.5">
                    <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                    <span>NFC UID: {smartWithdrawSantri.nfcUid || smartCashUid}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Tarik Tunai Uang Saku Cash
                  </h3>
                  <p className="text-xs text-emerald-100/80">
                    Penyerahan uang tunai santri yang dipegang pengurus asrama.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsSmartWithdrawModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer relative z-10 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[82vh] overflow-y-auto text-xs">
              
              {/* Santri Profile Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 shadow-xs">
                    {smartWithdrawSantri.foto ? (
                      <img src={smartWithdrawSantri.foto} alt={smartWithdrawSantri.nama || 'Santri'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-emerald-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                      {smartWithdrawSantri.nama || 'Santri'}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">NIS: {smartWithdrawSantri.nis || '-'}</span>
                      <span>•</span>
                      <span>{smartWithdrawSantri.kelas || 'Umum'}</span>
                      <span>•</span>
                      <span>{smartWithdrawSantri.kamar || 'Asrama'}</span>
                    </div>
                    {smartWithdrawSantri.namaWali && (
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        Wali: {smartWithdrawSantri.namaWali} {smartWithdrawSantri.noHpWali && `(${smartWithdrawSantri.noHpWali})`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Saldo Saku Real-Time Box */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-2 border-emerald-400/40 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saldo Uang Saku Tersedia</span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono mt-0.5">
                    Rp {(smartWithdrawSantri.saldo_saku || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {smartWithdrawSantri.saldo_saku > 0 ? 'Saldo Aman' : 'Saldo Kosong / Minus'}
                </span>
              </div>

              {/* Feedback Message */}
              {smartWithdrawFeedback && (
                <div className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-bold border ${
                  smartWithdrawFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300' 
                    : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  {smartWithdrawFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div>{smartWithdrawFeedback.message}</div>
                    {smartLastSuccessTx && smartWithdrawSantri.noHpWali && (
                      <button
                        type="button"
                        onClick={() => sendWithdrawWaReceipt(smartLastSuccessTx)}
                        className="mt-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Struk Penarikan ke WhatsApp Wali Santri</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Form Tarik Tunai */}
              <form onSubmit={handleExecuteSmartWithdraw} className="space-y-4 pt-1">
                
                {/* Nominal Presets */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Pilih Nominal Penarikan Tunai *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { amt: '10000', label: 'Rp 10.000' },
                      { amt: '20000', label: 'Rp 20.000' },
                      { amt: '50000', label: 'Rp 50.000' },
                      { amt: '100000', label: 'Rp 100.000' },
                    ].map((p) => (
                      <button
                        key={p.amt}
                        type="button"
                        onClick={() => setSmartWithdrawAmount(p.amt)}
                        className={`py-2 px-2 rounded-xl border font-mono font-bold text-xs transition-all cursor-pointer ${
                          smartWithdrawAmount === p.amt
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Manual & Tarik Semua Saldo */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
                      <input
                        type="number"
                        required
                        min="1000"
                        value={smartWithdrawAmount}
                        onChange={(e) => setSmartWithdrawAmount(e.target.value)}
                        placeholder="Nominal lainnya..."
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl font-mono font-black text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                    {smartWithdrawSantri.saldo_saku > 0 && (
                      <button
                        type="button"
                        onClick={() => setSmartWithdrawAmount(String(smartWithdrawSantri.saldo_saku))}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                      >
                        Semua Saldo
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Remaining Balance Calculation */}
                {(() => {
                  const nominal = parseFloat(smartWithdrawAmount || 0);
                  const currentBal = parseFloat(smartWithdrawSantri.saldo_saku || 0);
                  const rem = currentBal - nominal;
                  const isInsufficient = rem < 0;

                  return (
                    <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                      isInsufficient 
                        ? 'bg-rose-50 border-rose-200 text-rose-900' 
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <span className="font-semibold">
                        {isInsufficient ? '⚠️ Saldo Santri Kurang!' : 'Simulasi Sisa Saldo:'}
                      </span>
                      <span className={`font-mono font-black ${isInsufficient ? 'text-rose-600' : 'text-emerald-700'}`}>
                        Rp {rem.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })()}

                {/* Keperluan / Catatan */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Keperluan Penarikan Uang Tunai
                  </label>
                  <input
                    type="text"
                    value={smartWithdrawNotes}
                    onChange={(e) => setSmartWithdrawNotes(e.target.value)}
                    placeholder="Contoh: Uang jajan mingguan / Beli kitab"
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {/* Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {[
                      'Uang jajan mingguan',
                      'Beli kitab & alat tulis',
                      'Kebutuhan asrama',
                      'Berobat / Medis'
                    ].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setSmartWithdrawNotes(sug)}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded text-[10px] font-medium transition-colors cursor-pointer"
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Double Security Safeguard: PIN / Verifikasi Pengurus */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Proteksi Keamanan Penarikan</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Anti-Salah Ambil</span>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smartBypassPin}
                      onChange={(e) => setSmartBypassPin(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>Verifikasi Pengurus: Saya mengkonfirmasi identitas santri secara langsung</span>
                  </label>

                  {!smartBypassPin && (
                    <div className="pt-1">
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Masukkan PIN Santri (4 Digit Terakhir NIS: {smartWithdrawSantri.nis?.slice(-4) || '1234'}):
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={smartWithdrawPin}
                        onChange={(e) => setSmartWithdrawPin(e.target.value)}
                        placeholder="****"
                        className="w-32 px-3 py-1.5 border border-slate-300 rounded-xl text-center font-mono font-black text-sm tracking-widest outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  )}
                </div>

                {/* Send WhatsApp Toggle */}
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={smartWithdrawSendWa}
                    onChange={(e) => setSmartWithdrawSendWa(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>Kirim bukti penarikan uang cash ke WhatsApp wali santri</span>
                </label>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSmartWithdrawModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={
                      smartWithdrawProcessing || 
                      !smartWithdrawAmount || 
                      parseFloat(smartWithdrawAmount) <= 0 || 
                      parseFloat(smartWithdrawAmount) > parseFloat(smartWithdrawSantri.saldo_saku || 0)
                    }
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>{smartWithdrawProcessing ? 'Memproses Kas...' : 'Konfirmasi Tarik Tunai & Serahkan Uang'}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>
        </div>
      )}

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
