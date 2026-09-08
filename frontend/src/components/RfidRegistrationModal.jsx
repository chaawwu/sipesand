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
  Check,
  Smartphone,
  QrCode,
  Camera,
  Keyboard,
  Info,
  ExternalLink
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getSantriList, registerRfidCard, unregisterRfidCard } from '../services/api';
import SantriIdCard from './SantriIdCard';

export default function RfidRegistrationModal({ isOpen, onClose, onSuccess, initialSantriId = null }) {
  const [santriList, setSantriList] = useState([]);
  const [loadingSantri, setLoadingSantri] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL', 'WITHOUT_CARD', 'WITH_CARD'
  
  // Selected Santri & Form State
  const [selectedSantri, setSelectedSantri] = useState(null);
  const [rfidUid, setRfidUid] = useState('');
  const [saldoSaku, setSaldoSaku] = useState('');
  const [cardStatus, setCardStatus] = useState('AKTIF');
  
  // Scan Mode: 'phone-nfc' | 'remote-phone' | 'camera' | 'manual'
  const isWebNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  const [scanMode, setScanMode] = useState(isWebNfcSupported ? 'phone-nfc' : 'phone-nfc');
  const [isNfcScanning, setIsNfcScanning] = useState(false);
  const [nfcError, setNfcError] = useState(null);
  const [autoSubmitOnTap, setAutoSubmitOnTap] = useState(false);

  // Camera Barcode Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const barcodeScanIntervalRef = useRef(null);

  // Interaction & UX
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success'|'error'|'info', message: '' }
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [justRegisteredSantri, setJustRegisteredSantri] = useState(null);
  
  const rfidInputRef = useRef(null);
  const ndefControllerRef = useRef(null);

  // Audio Chime Feedback (synthesized)
  const playAudioFeedback = (type = 'success') => {
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
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      // Audio might be muted or blocked by autoplay policy
    }
  };

  // Haptic Feedback
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([100, 40, 100]);
    }
  };

  // Load Santri List when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSantriData();
      resetState();
      
      // Auto-start NFC scan if on supported mobile device
      if (isWebNfcSupported) {
        setScanMode('phone-nfc');
      } else {
        // If on desktop without Web NFC, default to phone-nfc tab showing remote pairing QR
        setScanMode('phone-nfc');
      }
    }

    return () => {
      stopNfcScan();
      stopCameraScan();
    };
  }, [isOpen]);

  // Handle Initial Santri ID if supplied from query or parent
  useEffect(() => {
    if (santriList.length > 0) {
      const targetId = initialSantriId || new URLSearchParams(window.location.search).get('santriId');
      if (targetId) {
        const found = santriList.find(s => s.id === parseInt(targetId));
        if (found) {
          handleSelectSantri(found);
        }
      }
    }
  }, [santriList, initialSantriId]);

  // Auto-focus RFID input when manual mode is active
  useEffect(() => {
    if (scanMode === 'manual' && selectedSantri && rfidInputRef.current) {
      setTimeout(() => {
        rfidInputRef.current?.focus();
      }, 100);
    }
  }, [scanMode, selectedSantri]);

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
    setNfcError(null);
    setIsNfcScanning(false);
    stopCameraScan();
  };

  const handleSelectSantri = (santri) => {
    setSelectedSantri(santri);
    setRfidUid(santri.nfcUid || '');
    setSaldoSaku(santri.saldo_saku !== undefined ? santri.saldo_saku.toString() : '0');
    setCardStatus(santri.status || 'AKTIF');
    setFeedback(null);
    setNfcError(null);
  };

  // ============================================================================
  // 1. SMARTPHONE WEB NFC SCANNER (NDEFReader)
  // ============================================================================
  const startNfcScan = async () => {
    if (!isWebNfcSupported) {
      setNfcError('Browser ini belum mendukung Web NFC. Gunakan Google Chrome di ponsel Android yang memiliki fitur NFC.');
      return;
    }

    try {
      setNfcError(null);
      const abortController = new AbortController();
      ndefControllerRef.current = abortController;

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
          // Clean UID: remove colons/spaces and uppercase
          const cleanUid = rawUid.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
          
          playAudioFeedback('success');
          triggerHaptic();

          setRfidUid(cleanUid);
          setFeedback({
            type: 'success',
            message: `Kartu NFC terdeteksi via Ponsel! UID: ${cleanUid}`
          });

          // If santri is selected and autoSubmit is on, submit immediately
          if (autoSubmitOnTap && selectedSantri) {
            handleSubmit(null, cleanUid);
          }
        }
      };

      ndef.onreadingerror = () => {
        playAudioFeedback('error');
        setNfcError('Gagal membaca kartu. Tempelkan kartu stabil di dekat antena NFC ponsel Anda (biasanya di bagian belakang dekat kamera).');
      };

    } catch (error) {
      console.error('Error starting NFC scan:', error);
      setIsNfcScanning(false);
      if (error.name === 'NotAllowedError') {
        setNfcError('Izin akses NFC ditolak. Silakan izinkan browser untuk mengakses NFC.');
      } else if (error.name === 'NotSupportedError') {
        setNfcError('NFC tidak aktif pada ponsel ini. Buka Pengaturan HP ➔ Koneksi ➔ Aktifkan NFC.');
      } else {
        setNfcError(`Gagal mengaktifkan scanner NFC: ${error.message}`);
      }
    }
  };

  const stopNfcScan = () => {
    if (ndefControllerRef.current) {
      ndefControllerRef.current.abort();
      ndefControllerRef.current = null;
    }
    setIsNfcScanning(false);
  };

  // ============================================================================
  // 2. CAMERA BARCODE / QR SCANNER
  // ============================================================================
  const startCameraScan = async () => {
    try {
      setCameraError(null);
      setIsCameraActive(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      cameraStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Check if native BarcodeDetector API is available
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'data_matrix']
        });

        barcodeScanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            try {
              const barcodes = await barcodeDetector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const detectedCode = barcodes[0].rawValue.trim().toUpperCase();
                stopCameraScan();
                playAudioFeedback('success');
                triggerHaptic();
                setRfidUid(detectedCode);
                setFeedback({
                  type: 'success',
                  message: `Kode kartu berhasil dipindai dari kamera: ${detectedCode}`
                });
                if (autoSubmitOnTap && selectedSantri) {
                  handleSubmit(null, detectedCode);
                }
              }
            } catch (e) {
              // Detection frame error, continue
            }
          }
        }, 250);
      } else {
        setCameraError('Browser ini tidak mendukung deteksi barcode langsung dari kamera. Silakan gunakan Tap NFC Ponsel atau input manual.');
      }

    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraActive(false);
      setCameraError('Gagal mengakses kamera ponsel. Pastikan izin kamera telah diberikan.');
    }
  };

  const stopCameraScan = () => {
    if (barcodeScanIntervalRef.current) {
      clearInterval(barcodeScanIntervalRef.current);
      barcodeScanIntervalRef.current = null;
    }
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(track => track.stop());
      cameraStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Generate Simulation RFID UID
  const handleGenerateUid = () => {
    const randomHex = Math.floor(0x10000000 + Math.random() * 0xefffffff).toString(16).toUpperCase();
    const generated = `NFC-${randomHex}`;
    setRfidUid(generated);
    playAudioFeedback('success');
    setFeedback({
      type: 'info',
      message: `UID Simulasi dibuat: ${generated}. Siap ditautkan ke santri!`
    });
  };

  // ============================================================================
  // 3. SUBMIT & TAUTKAN KARTU KE SANTRI
  // ============================================================================
  const handleSubmit = async (e, overrideUid = null) => {
    if (e) e.preventDefault();
    const uidToUse = (overrideUid || rfidUid).trim().toUpperCase();

    if (!selectedSantri) {
      setFeedback({ type: 'error', message: 'Silakan pilih santri terlebih dahulu' });
      playAudioFeedback('error');
      return;
    }
    if (!uidToUse) {
      setFeedback({ type: 'error', message: 'UID Kartu RFID / NFC wajib dipindai dari ponsel atau diisi' });
      playAudioFeedback('error');
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const payload = {
        santriId: selectedSantri.id,
        nfcUid: uidToUse,
        saldo_saku: saldoSaku ? parseFloat(saldoSaku) : selectedSantri.saldo_saku,
        status: cardStatus
      };

      const res = await registerRfidCard(payload);
      if (res.data.success) {
        const updated = res.data.data;
        setJustRegisteredSantri(updated);
        setSelectedSantri(updated);
        setRfidUid(updated.nfcUid);
        playAudioFeedback('success');
        triggerHaptic();

        setFeedback({
          type: 'success',
          message: `Kartu RFID ${updated.nfcUid} BERHASIL DITAUTKAN ke ${updated.nama}!`
        });

        // Update list lokal
        setSantriList(prev => prev.map(s => s.id === updated.id ? updated : s));

        if (onSuccess) {
          onSuccess(updated);
        }
      }
    } catch (err) {
      playAudioFeedback('error');
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
        playAudioFeedback('success');
        setFeedback({
          type: 'success',
          message: `Kartu RFID berhasil dicabut dari santri ${updated.nama}.`
        });
        if (onSuccess) onSuccess(updated);
      }
    } catch (err) {
      playAudioFeedback('error');
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal mencabut kartu'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // URL for Mobile Pairing QR Code
  const mobilePairUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?action=register-rfid${selectedSantri ? `&santriId=${selectedSantri.id}` : ''}`
    : '';

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-4 sm:my-8 flex flex-col max-h-[95vh]">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white p-4 sm:p-6 flex items-center justify-between relative overflow-hidden shrink-0">
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner shrink-0">
                <Smartphone className="w-6 h-6 animate-pulse text-[#8CE829]" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-black text-amber-300 border border-white/20 mb-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#8CE829]" />
                  <span>PENDAFTARAN RFID MANDIRI (PONSEL & WEB NFC)</span>
                </div>
                <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Tautkan Kartu RFID Tanpa Alat Reader
                </h2>
                <p className="text-xs text-blue-100/90 hidden sm:block">
                  Gunakan ponsel ber-NFC (Android Chrome) untuk tap kartu langsung, scan kamera, atau remote link dari komputer.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors relative z-10 shrink-0"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
            
            {/* Left Column (5/12): Pilih Santri */}
            <div className="lg:col-span-5 p-3.5 sm:p-5 flex flex-col bg-slate-50/60 overflow-hidden">
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>Pilih Santri ({santriList.length})</span>
                  </span>
                  <div className="text-[11px] font-semibold text-slate-500">
                    <span className="text-emerald-600 font-bold">{countWithCard} Ada Kartu</span> • 
                    <span className="text-amber-600 font-bold ml-1">{countWithoutCard} Belum</span>
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-2">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIS, kelas, kamar..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
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
                    Belum Ada Kartu ({countWithoutCard})
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
                    Sudah Punya ({countWithCard})
                  </button>
                </div>
              </div>

              {/* List Santri Scrollable */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-[160px] max-h-[260px] lg:max-h-none">
                {loadingSantri ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data santri...
                  </div>
                ) : filteredSantri.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    Tidak ditemukan santri yang sesuai.
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
                            ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
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

            {/* Right Column (7/12): Multi-Mode Scanner & Tautkan Kartu */}
            <div className="lg:col-span-7 p-3.5 sm:p-6 overflow-y-auto space-y-4 flex flex-col justify-between">
              
              {!selectedSantri ? (
                <div className="my-auto py-12 text-center text-slate-400 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center border border-blue-100 shadow-inner">
                    <User className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">Pilih Santri Terlebih Dahulu</div>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                      Pilih santri di sebelah kiri untuk menautkan kartu fisik RFID/NFC langsung menggunakan ponsel Anda tanpa perlu membeli mesin reader khusus.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  
                  {/* Selected Santri Info Banner */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white rounded-2xl p-3.5 sm:p-4 shadow-sm border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-lg">
                        {selectedSantri.nama?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm sm:text-base text-white">{selectedSantri.nama}</h3>
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
                      <div className="font-mono font-black text-sm sm:text-base text-[#8CE829]">
                        Rp {(selectedSantri.saldo_saku || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message */}
                  {feedback && (
                    <div className={`p-3 rounded-xl text-xs flex items-center gap-2.5 font-semibold animate-in fade-in ${
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

                  {/* SCANNER MODE TABS (MULTI-MODE) */}
                  <div className="border border-slate-200 rounded-2xl p-1 bg-slate-100 flex items-center gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => { setScanMode('phone-nfc'); stopCameraScan(); }}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scanMode === 'phone-nfc'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Tap NFC Ponsel</span>
                      {isWebNfcSupported && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Web NFC Didukung" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setScanMode('camera'); stopNfcScan(); }}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scanMode === 'camera'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan Kamera HP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setScanMode('remote-phone'); stopCameraScan(); stopNfcScan(); }}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scanMode === 'remote-phone'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Remote QR HP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setScanMode('manual'); stopCameraScan(); stopNfcScan(); }}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 ${
                        scanMode === 'manual'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Keyboard className="w-3.5 h-3.5" />
                      <span>Manual / USB</span>
                    </button>
                  </div>

                  {/* ========================================================= */}
                  {/* TAB 1: TAP NFC DENGAN PONSEL (WEB NFC)                    */}
                  {/* ========================================================= */}
                  {scanMode === 'phone-nfc' && (
                    <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border-2 border-blue-200 rounded-2xl p-4 sm:p-5 text-center space-y-3 relative overflow-hidden">
                      
                      {isWebNfcSupported ? (
                        <>
                          <div className="mx-auto w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center shadow-lg relative">
                            {isNfcScanning ? (
                              <>
                                <span className="absolute inset-0 rounded-3xl bg-blue-400 animate-ping opacity-60 pointer-events-none" />
                                <Radio className="w-8 h-8 animate-pulse text-[#8CE829]" />
                              </>
                            ) : (
                              <Smartphone className="w-8 h-8 text-white" />
                            )}
                          </div>

                          <div>
                            <div className="font-extrabold text-sm text-slate-900 flex items-center justify-center gap-1.5">
                              <span>Ponsel Siap Membaca Kartu RFID / NFC</span>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                Web NFC Aktif
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                              {isNfcScanning
                                ? '🟢 SCANNER AKTIF: Tempelkan kartu RFID ke bagian belakang bodi ponsel Anda sekarang.'
                                : 'Klik tombol di bawah untuk mengaktifkan sensor NFC di ponsel Anda, lalu tempelkan kartu RFID.'}
                            </p>
                          </div>

                          {nfcError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold text-left flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <div>{nfcError}</div>
                                <div className="text-[11px] text-rose-600 font-normal">
                                  Tips: Buka menu Pengaturan ponsel ➔ Aktifkan "NFC", lalu pastikan Anda membuka website menggunakan Google Chrome di Android.
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                            {!isNfcScanning ? (
                              <button
                                type="button"
                                onClick={startNfcScan}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                              >
                                <Radio className="w-4 h-4 text-amber-300 animate-pulse" />
                                <span>Mulai Pindai NFC Ponsel</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={stopNfcScan}
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all"
                              >
                                Hentikan Scanner
                              </button>
                            )}

                            <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                              <input
                                type="checkbox"
                                checked={autoSubmitOnTap}
                                onChange={(e) => setAutoSubmitOnTap(e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                              />
                              <span>Otomatis Tautkan Saat Kartu Ditempelkan</span>
                            </label>
                          </div>
                        </>
                      ) : (
                        /* If browser does NOT support Web NFC (e.g. desktop browser or iOS) */
                        <div className="py-2 space-y-3 text-left">
                          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs">
                            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div className="space-y-1 leading-relaxed">
                              <div className="font-bold">Perangkat Ini Belum Mendukung Sensor Web NFC Native</div>
                              <div>
                                Browser Web NFC (membaca kartu langsung saat ditempelkan ke bodi perangkat) saat ini didukung oleh <strong>Google Chrome & Microsoft Edge pada smartphone Android</strong>.
                              </div>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                                <QrCode className="w-4 h-4 text-blue-600" />
                                <span>Gunakan Ponsel Anda Sebagai Reader (Scan QR)</span>
                              </h4>
                              <p className="text-[11px] text-slate-500 max-w-sm">
                                Arahkan kamera HP Anda ke QR Code di samping untuk membuka halaman scanner NFC instan ini langsung di HP Anda!
                              </p>
                            </div>
                            <div className="shrink-0 p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                              <QRCodeSVG value={mobilePairUrl} size={110} />
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* TAB 2: SCAN KAMERA HP / BARCODE / QR CODE                */}
                  {/* ========================================================= */}
                  {scanMode === 'camera' && (
                    <div className="bg-slate-900 text-white rounded-2xl p-4 text-center space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-300 pb-2 border-b border-slate-800">
                        <span className="font-bold flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-emerald-400" />
                          <span>Pindai Barcode / QR Kartu Santri</span>
                        </span>
                        <span>Arahkan ke barcode kartu</span>
                      </div>

                      {cameraError && (
                        <div className="p-3 bg-rose-900/50 border border-rose-700 rounded-xl text-rose-200 text-xs text-left">
                          {cameraError}
                        </div>
                      )}

                      <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[200px] mx-auto border border-slate-700 flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                        {isCameraActive && (
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-48 h-28 border-2 border-emerald-400 rounded-xl shadow-lg relative animate-pulse">
                              <span className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-emerald-300" />
                              <span className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-emerald-300" />
                              <span className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-emerald-300" />
                              <span className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-emerald-300" />
                            </div>
                          </div>
                        )}
                        {!isCameraActive && (
                          <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                            <Camera className="w-8 h-8 opacity-40" />
                            <span>Kamera belum aktif</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-center gap-2">
                        {!isCameraActive ? (
                          <button
                            type="button"
                            onClick={startCameraScan}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Camera className="w-4 h-4" />
                            <span>Buka Kamera Ponsel</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={stopCameraScan}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-all"
                          >
                            Tutup Kamera
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* TAB 3: REMOTE PAIRING VIA QR CODE                        */}
                  {/* ========================================================= */}
                  {scanMode === 'remote-phone' && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
                      <div className="max-w-md mx-auto space-y-1">
                        <h4 className="font-black text-sm text-slate-800 flex items-center justify-center gap-1.5">
                          <QrCode className="w-4 h-4 text-blue-600" />
                          <span>Gunakan HP Anda Tanpa Perlu Login Ulang</span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Scan QR Code ini menggunakan kamera HP untuk langsung membuka modul tap kartu santri ini di ponsel Anda:
                        </p>
                      </div>

                      <div className="inline-block p-4 bg-white rounded-3xl border-2 border-blue-200 shadow-md">
                        <QRCodeSVG value={mobilePairUrl} size={160} />
                      </div>

                      <div className="text-[11px] text-slate-500 max-w-sm mx-auto flex items-center justify-center gap-2">
                        <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200 truncate max-w-xs">
                          {mobilePairUrl}
                        </span>
                        <a
                          href={mobilePairUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                          title="Buka di tab baru"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ========================================================= */}
                  {/* FORM INPUT UID & PENYESUAIAN                              */}
                  {/* ========================================================= */}
                  <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                    
                    {/* UID Field Box */}
                    <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-blue-600" />
                          <span>UID Kartu Terbaca / Terdaftar *</span>
                        </label>
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

                      <div className="relative">
                        <input
                          ref={rfidInputRef}
                          type="text"
                          required
                          placeholder="Hasil tap NFC ponsel atau ketik UID di sini..."
                          value={rfidUid}
                          onChange={(e) => setRfidUid(e.target.value.toUpperCase())}
                          className="w-full pl-3 pr-24 py-2.5 bg-white border-2 border-blue-400/80 focus:border-blue-600 rounded-xl font-mono text-sm font-black tracking-wider text-slate-900 outline-none shadow-inner"
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          {rfidUid ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-extrabold flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              <span>Siap</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 px-1">
                              Menunggu Tap
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Format hex otomatis disesuaikan (ISO14443A / Mifare / NTAG / Ponsel NFC).</span>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div className="flex items-center gap-1 mt-1">
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
                        <p className="text-[10px] text-slate-400 mt-1">
                          Kartu otomatis aktif untuk belanja kantin & absensi perizinan santri.
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {selectedSantri.nfcUid && (
                          <button
                            type="button"
                            onClick={() => setIsPrintModalOpen(true)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs"
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
                          className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all text-xs"
                        >
                          Ganti Santri
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting || !rfidUid.trim()}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer text-xs"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Menautkan...</span>
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4" />
                              <span>Simpan & Tautkan Kartu</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </form>
                </div>
              )}

              {/* Footer Note */}
              <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Didukung Web NFC API: Bisa langsung tap di HP tanpa alat reader tambahan.
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
