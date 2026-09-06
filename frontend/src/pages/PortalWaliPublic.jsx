import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Printer, 
  ShieldCheck, 
  BookOpen, 
  Award, 
  Calendar,
  AlertCircle,
  CreditCard,
  Upload,
  Copy,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Radio,
  Building,
  Users,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { 
  getPublicSantriData, 
  getPublicSantriBills, 
  uploadPaymentProof,
  getPortalWaliSantriList
} from '../services/api';
import OfficialReceipt from '../components/OfficialReceipt';
import AestheticToast from '../components/AestheticToast';
import DeveloperFooter from '../components/DeveloperFooter';
import { useSettings } from '../context/SettingsContext';

// Helper normalisasi string teks pencarian (hapus apostrof, titik, spasi ganda)
const cleanText = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .replace(/['`’.]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper pencocokan santri cerdas (Nama, NIS, Wali, Kamar, Kelas, Multi-kata)
const matchSantri = (s, q) => {
  if (!q) return false;
  const qNorm = cleanText(q);
  const qWords = qNorm.split(' ').filter(Boolean);

  const nama = cleanText(s.nama || s.name);
  const nis = cleanText(s.nis);
  const nfc = cleanText(s.nfcUid);
  const wali = cleanText(s.namaWali || s.guardian);
  const kelas = cleanText(s.kelas || s.class);
  const kamar = cleanText(s.kamar);
  const idStr = String(s.id).toLowerCase();

  // 1. Exact ID, NIS, atau NFC
  if (idStr === qNorm || nis === qNorm || nfc === qNorm) return true;

  // 2. Substring langsung di Nama, NIS, atau Nama Wali
  if (nama.includes(qNorm) || nis.includes(qNorm) || wali.includes(qNorm)) return true;

  // 3. Multi-kata (setiap kata pada query harus ada pada informasi santri)
  if (qWords.length > 1) {
    const combined = `${nama} ${nis} ${wali} ${kelas} ${kamar}`;
    return qWords.every(w => combined.includes(w));
  }

  return false;
};

export default function PortalWaliPublic({ initialQuery = '', onBackToHome, onNavigateLegal }) {
  const { settings, isNfcEnabled } = useSettings();
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [portalRawData, setPortalRawData] = useState(null);
  const [santriData, setSantriData] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Directory & Multi-Matching States
  const [santriDirectory, setSantriDirectory] = useState([]);
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [suggestions, setSuggestions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [matchingResults, setMatchingResults] = useState([]);
  const [viewMode, setViewMode] = useState(initialQuery ? 'detail' : 'search'); // 'detail' | 'match_list' | 'search'
  const searchContainerRef = useRef(null);

  // Selection & Payment Flow States
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Summary/Verify, 2: Choose Method, 3: Upload Proof / Instant PG
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER_BSI'); // 'TRANSFER_BSI' | 'QRIS' | 'KING_DIGITAL_PG'
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Aesthetic Toast State
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Modal Kwitansi Read-Only State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [activeReceiptData, setActiveReceiptData] = useState(null);

  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SiPesand Terpadu';
  const bankName = settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const bankAccountNo = settings.BANK_ACCOUNT_NO || '7205409507';
  const bankAccountHolder = settings.BANK_ACCOUNT_HOLDER || settings.NAMA_BENDAHARA || 'YAYASAN SIPESAND TERPADU';
  const qrisUrl = settings.QRIS_PAYMENT_URL || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
  
  // King Digital Payment Gateway Active State
  const isKingDigitalPgActive = settings.KING_DIGITAL_PG_ENABLED === 'true';
  const disbursementBank = settings.DISBURSEMENT_BANK || 'Bank Syariah Indonesia (BSI)';
  const disbursementAccountNo = settings.DISBURSEMENT_ACCOUNT_NO || '7205409507';
  const disbursementHolder = settings.DISBURSEMENT_ACCOUNT_HOLDER || `YAYASAN ${namaLembaga.toUpperCase()}`;

  // 1. Muat Direktori Santri & Inisialisasi Pencarian
  useEffect(() => {
    let isMounted = true;
    const fetchDirectory = async () => {
      try {
        setLoadingDirectory(true);
        const res = await getPortalWaliSantriList();
        if (isMounted && res?.data?.success && Array.isArray(res.data.data)) {
          const list = res.data.data;
          setSantriDirectory(list);
          if (initialQuery && initialQuery.trim()) {
            executeSearch(initialQuery.trim(), list);
          }
        }
      } catch (err) {
        console.error('Error fetching santri directory:', err);
      } finally {
        if (isMounted) setLoadingDirectory(false);
      }
    };

    fetchDirectory();
    return () => { isMounted = false; };
  }, [initialQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 2. Eksekusi Pencarian Nama Santri (Cerdas & Multi-Match Support)
  const executeSearch = async (queryStr, directory = santriDirectory) => {
    const trimmed = (queryStr || '').trim();
    if (!trimmed) {
      setViewMode('search');
      setSantriData(null);
      setMatchingResults([]);
      setError(null);
      return;
    }

    setIsDropdownOpen(false);
    setError(null);

    // Cocokkan secara lokal jika direktori sudah terisi
    const localMatches = (directory || []).filter(s => matchSantri(s, trimmed));

    if (localMatches.length > 1) {
      // Ditemukan banyak santri yang cocok -> tampilkan daftar kartu santri
      setMatchingResults(localMatches);
      setViewMode('match_list');
      setSantriData(null);
      setSelectedBillIds([]);
      return;
    }

    if (localMatches.length === 1) {
      // Tepat 1 santri cocok -> langsung buka rincian santri tersebut
      setMatchingResults([]);
      loadSantriData(localMatches[0].nis || localMatches[0].id);
      return;
    }

    // Jika direktori belum ada atau 0 match lokal, panggil API server
    await loadSantriData(trimmed);
  };

  const loadSantriData = async (query) => {
    try {
      setLoading(true);
      setError(null);
      setIsDropdownOpen(false);
      
      const res = await getPublicSantriData(query);

      if (res.data.success && res.data.data) {
        const payload = res.data.data;
        const matches = payload.matches || [];

        // Jika API server mendeteksi banyak santri cocok dan bukan query spesifik NIS/ID
        if (matches.length > 1 && !payload.santri?.nis?.toLowerCase().includes(query.toLowerCase()) && String(payload.santri?.id) !== query) {
          setMatchingResults(matches);
          setViewMode('match_list');
          setSantriData(null);
          setSelectedBillIds([]);
          return;
        }

        setPortalRawData(payload);
        setSantriData(payload.santri || payload);
        const extractedBills = payload.financial?.bills || payload.bills || [];
        setBills(extractedBills);
        setViewMode('detail');
        setMatchingResults([]);
        setSelectedBillIds([]);
      } else {
        setError(res.data.message || `Data santri "${query}" tidak ditemukan.`);
        setViewMode('search');
      }
    } catch (err) {
      setError(`Data santri "${query}" tidak ditemukan. Silakan periksa nama santri atau nomor NIS.`);
      setViewMode('search');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length >= 2) {
      const filtered = santriDirectory.filter(s => matchSantri(s, val.trim())).slice(0, 6);
      setSuggestions(filtered);
      setIsDropdownOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsDropdownOpen(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsDropdownOpen(false);
  };

  const handleSelectSantri = (santri) => {
    setSearchQuery(santri.nama || santri.name);
    setIsDropdownOpen(false);
    setMatchingResults([]);
    loadSantriData(santri.nis || santri.id);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      executeSearch(searchQuery.trim());
    }
  };

  const handleToggleBill = (billId) => {
    setSelectedBillIds(prev => 
      prev.includes(billId) ? prev.filter(id => id !== billId) : [...prev, billId]
    );
  };

  const selectedBills = bills.filter(b => selectedBillIds.includes(b.id));
  const totalPaymentAmount = selectedBills.reduce((sum, b) => sum + (b.amount || 0), 0);

  const handleStartPayment = () => {
    if (selectedBillIds.length === 0) {
      setToast({
        isOpen: true,
        type: 'warning',
        title: 'Pilih Tagihan',
        message: 'Silakan centang minimal satu tagihan yang ingin Anda bayar.'
      });
      return;
    }
    setPaymentStep(1);
    setPaymentSuccessMsg('');
    if (isKingDigitalPgActive) {
      setPaymentMethod('KING_DIGITAL_PG');
    } else {
      setPaymentMethod('TRANSFER_BSI');
    }
    setIsPaymentModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'bank') {
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (selectedBillIds.length === 0) {
      setToast({
        isOpen: true,
        type: 'warning',
        title: 'Tagihan Belum Dipilih',
        message: 'Silakan pilih tagihan yang ingin dibayar.'
      });
      return;
    }

    try {
      setSubmittingPayment(true);
      
      const payload = {
        billId: selectedBillIds[0],
        billIds: selectedBillIds,
        paymentMethod,
        proofImage: proofPreview || (paymentMethod === 'KING_DIGITAL_PG' ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80' : 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'),
        notes: notes || `Pembayaran transfer oleh wali santri ${santriData?.namaWali || ''}`,
      };

      const res = await uploadPaymentProof(payload);
      if (res.data.success) {
        if (paymentMethod === 'KING_DIGITAL_PG') {
          setPaymentSuccessMsg(`Pembayaran diproses sukses oleh King Digital Payment Gateway! Dana sebesar Rp ${totalPaymentAmount.toLocaleString('id-ID')} otomatis diteruskan ke rekening penampungan ${disbursementBank} (${disbursementAccountNo}) a.n ${disbursementHolder}. Kwitansi resmi telah terbit.`);
        } else {
          setPaymentSuccessMsg('Bukti transfer berhasil dikirim! Status tagihan saat ini sedang diproses verifikasi oleh Bendahara Pesantren.');
        }

        setToast({
          isOpen: true,
          type: 'success',
          title: 'Pembayaran Berhasil',
          message: paymentMethod === 'KING_DIGITAL_PG' ? 'Pembayaran lunas instan via King Digital PG!' : 'Bukti transfer berhasil dikirim.'
        });

        loadSantriData(santriData.nis || santriData.nama);
        setSelectedBillIds([]);
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          setPaymentStep(1);
          setProofFile(null);
          setProofPreview('');
          setNotes('');
        }, 3000);
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mengirim Bukti',
        message: err.response?.data?.message || 'Gagal mengirim bukti pembayaran ke server.'
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  // Handler Buka Kwitansi Read-Only (Hanya untuk yang PAID)
  const handleOpenReceipt = (bill) => {
    if (bill.status !== 'PAID') {
      setToast({
        isOpen: true,
        type: 'info',
        title: 'Kwitansi Belum Tersedia',
        message: 'Kwitansi resmi hanya dapat diunduh setelah pembayaran diverifikasi dan di-ACC lunas oleh Bendahara atau melalui King Digital Payment Gateway.'
      });
      return;
    }

    setActiveReceiptData({
      code: bill.receiptNumber || `KWT-${bill.billCode}`,
      date: bill.paymentDate || bill.updatedAt,
      santriName: santriData?.nama,
      waliName: santriData?.namaWali || 'Wali Santri',
      nis: santriData?.nis,
      kelas: santriData?.kelas,
      paymentMethod: bill.paymentMethod === 'KING_DIGITAL_PG' ? 'King Digital Payment Gateway (Auto-Disbursed)' : (bill.paymentMethod === 'TRANSFER_BSI' ? 'Transfer BSI' : bill.paymentMethod || 'Transfer Bank'),
      bendaharaName: bill.verifiedBy || settings.NAMA_BENDAHARA || 'Bendahara Pesantren',
      items: [
        { id: bill.id, name: bill.title, amount: bill.amount }
      ]
    });
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs">
      
      {/* 1. Header Portal Wali */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToHome}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1 font-semibold text-xs"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>

            {logoPondok ? (
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 shadow-sm flex items-center justify-center flex-shrink-0">
                <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold flex-shrink-0">
                <Building2 className="w-4 h-4 text-blue-400" />
              </div>
            )}
            
            <div className="min-w-0">
              <h1 className="font-bold text-sm text-slate-900 truncate">
                Portal Mandiri Wali Santri
              </h1>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {namaLembaga}
              </p>
            </div>
          </div>

          {/* Search Bar with Live Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative max-w-xs sm:max-w-sm w-full">
            <form onSubmit={handleSearch} className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Nama Santri, Wali, NIS..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  onFocus={() => {
                    if (suggestions.length > 0) setIsDropdownOpen(true);
                  }}
                  className="w-full pl-8 pr-7 py-1.5 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                    title="Hapus pencarian"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-sm flex-shrink-0"
              >
                Cari
              </button>
            </form>

            {/* Live Autocomplete Suggestions Dropdown */}
            {isDropdownOpen && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-100 max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-1">
                <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Pencocokan Santri ({suggestions.length})</span>
                  <span className="text-[9px] font-normal text-slate-400">Pilih untuk melihat</span>
                </div>
                {suggestions.map((s) => (
                  <button
                    key={s.id || s.nis}
                    type="button"
                    onClick={() => handleSelectSantri(s)}
                    className="w-full px-3 py-2.5 text-left hover:bg-blue-50/70 transition-colors flex items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {s.foto ? (
                        <img src={s.foto} alt={s.nama} className="w-8 h-8 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {(s.nama || s.name || '?').charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate group-hover:text-blue-700 text-xs">
                          {s.nama || s.name}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate flex items-center gap-1.5">
                          <span className="font-mono text-slate-500 font-medium">NIS: {s.nis}</span>
                          <span>•</span>
                          <span>{s.kelas || '-'}</span>
                          <span>•</span>
                          <span className="text-blue-600 font-medium">Wali: {s.namaWali || '-'}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {loading ? (
          <div className="p-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
            <h3 className="font-bold text-slate-800 text-sm">Sedang Mencocokkan Data Santri...</h3>
            <p className="text-xs text-slate-400 mt-1">Mengambil informasi saldo uang saku, status perizinan, dan tagihan syahriyah.</p>
          </div>
        ) : viewMode === 'match_list' && matchingResults.length > 0 ? (
          /* Tampilan Hasil Pencocokan Santri (Multi-Match) */
          <div className="space-y-4 animate-in fade-in">
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Hasil Pencocokan Santri ({matchingResults.length} Santri Ditemukan)
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Ditemukan beberapa santri dengan kata kunci <strong className="text-blue-700">"{searchQuery}"</strong>. Silakan pilih santri Anda di bawah ini:
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewMode('search');
                  setSearchQuery('');
                  setMatchingResults([]);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors flex-shrink-0"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Cari Kata Kunci Lain</span>
              </button>
            </div>

            {/* Grid Kartu Pilihan Santri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchingResults.map((s) => (
                <div
                  key={s.id || s.nis}
                  onClick={() => handleSelectSantri(s)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-500 hover:ring-2 hover:ring-blue-100 cursor-pointer transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {s.foto ? (
                          <img src={s.foto} alt={s.nama} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-lg shadow-sm flex-shrink-0">
                            {(s.nama || s.name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors text-sm truncate">
                            {s.nama || s.name}
                          </h3>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            NIS: <strong className="text-slate-700">{s.nis || '-'}</strong>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border flex-shrink-0 ${
                        s.gender === 'P' ? 'bg-pink-50 text-pink-700 border-pink-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {s.gender === 'P' ? 'Akhwat' : 'Ikhwan'}
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Kelas / Kamar:</span>
                        <span className="font-bold text-slate-700">{s.kelas || '-'} / {s.kamar || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Wali Santri:</span>
                        <span className="font-bold text-blue-700 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-blue-600" />
                          <span>{s.namaWali || '-'}</span>
                        </span>
                      </div>
                      {s.alamat && s.alamat !== '-' && (
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="text-slate-400">Asal / Alamat:</span>
                          <span className="text-slate-600 truncate max-w-[150px]">{s.alamat}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-2 bg-slate-50 group-hover:bg-blue-600 text-slate-700 group-hover:text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>Pilih & Buka Portal Santri</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'detail' && santriData ? (
          <div className="space-y-6 animate-in fade-in">
            {/* Sub-bar Navigasi / Ganti Santri */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 animate-pulse"></span>
                <span className="text-slate-500 text-xs font-medium">Santri Terpilih:</span>
                <strong className="text-slate-900 text-xs font-extrabold truncate">{santriData.nama}</strong>
                <span className="text-slate-400 font-mono text-[11px] hidden sm:inline">• NIS: {santriData.nis || '-'}</span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {matchingResults.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setViewMode('match_list')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Daftar Hasil ({matchingResults.length})</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('search');
                    setSearchQuery('');
                    setSantriData(null);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cari Santri Lain</span>
                </button>
              </div>
            </div>
            
            {/* Profil Ringkas Santri & Status Lokasi */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-800 text-white flex items-center justify-center font-extrabold text-xl shadow-md flex-shrink-0">
                  {santriData.nama.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                      {santriData.nama}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] border border-blue-200">
                      {santriData.gender === 'L' ? 'Ikhwan' : 'Akhwat'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    NIS: <strong className="text-slate-700">{santriData.nis || '-'}</strong> • Kelas: {santriData.kelas || '-'} • Kamar: {santriData.kamar || '-'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Wali: {santriData.namaWali || '-'} ({santriData.noHpWali || '-'})
                  </div>
                </div>
              </div>

              {/* Status Keberadaan / Perizinan */}
              {portalRawData?.location && (
                <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 w-full md:w-auto ${
                  portalRawData.location.status === 'DI_PESANTREN'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : portalRawData.location.status === 'OVERDUE'
                    ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                    : 'bg-blue-50 border-blue-200 text-blue-900'
                }`}>
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Status Lokasi:</span>
                    <span className="font-bold text-xs">{portalRawData.location.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Grid 3 Kolom Ringkasan: Tabungan, Tunggakan, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Saldo Uang Saku */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-[11px] uppercase tracking-wider">Tabungan Uang Saku</span>
                  <Wallet className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="font-mono font-black text-xl text-emerald-600">
                  Rp {parseFloat(santriData.saldo_saku || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-400">Dikelola Pengurus Saku untuk belanja kantin smart NFC.</p>
              </div>

              {/* Total Tunggakan Tagihan */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-[11px] uppercase tracking-wider">Total Tagihan Belum Dibayar</span>
                  <FileText className="w-4 h-4 text-rose-600" />
                </div>
                <div className="font-mono font-black text-xl text-rose-600">
                  Rp {(portalRawData?.financial?.totalTunggakan || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-[10px] text-slate-400">Termasuk Syahriyah bulanan dan operasional asrama.</p>
              </div>

              {/* Status Pembayaran */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-[11px] uppercase tracking-wider">Status Tagihan</span>
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-center gap-2 font-bold text-xs">
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                    {portalRawData?.financial?.pendingCount || 0} Sedang Diproses
                  </span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                    {portalRawData?.financial?.paidCount || 0} Lunas
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Kwitansi resmi diterbitkan setelah bendahara / PG memverifikasi.</p>
              </div>

            </div>

            {/* Section Tagihan & Pembayaran Mandiri */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">Tagihan & Kwitansi Pembayaran</h3>
                    {isKingDigitalPgActive && (
                      <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-md font-bold text-[9px] flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-blue-700" />
                        <span>King Digital Payment Gateway (Auto-Disburse)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Pilih tagihan yang ingin dibayar lalu klik tombol <strong>Bayar Tagihan Terpilih</strong> untuk transfer bank / QRIS.
                  </p>
                </div>

                {selectedBillIds.length > 0 && (
                  <button
                    onClick={handleStartPayment}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Bayar {selectedBillIds.length} Tagihan (Rp {totalPaymentAmount.toLocaleString('id-ID')})</span>
                  </button>
                )}
              </div>

              {/* Bills Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-3 w-10 text-center">Pilih</th>
                      <th className="py-3 px-3">Pos & Judul Tagihan</th>
                      <th className="py-3 px-3">Periode Hijriyah</th>
                      <th className="py-3 px-3">Nominal (Rp)</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-center">Aksi / Kwitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          Tidak ada catatan tagihan untuk santri ini.
                        </td>
                      </tr>
                    ) : (
                      bills.map((b) => {
                        const isSelected = selectedBillIds.includes(b.id);
                        const isUnpaid = b.status === 'UNPAID';
                        const isPending = b.status === 'PENDING_VERIFICATION';
                        const isPaid = b.status === 'PAID';

                        return (
                          <tr key={b.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                            <td className="py-3 px-3 text-center">
                              {isUnpaid ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleBill(b.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                              ) : (
                                <span className="text-slate-300">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-900">{b.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Kode: {b.billCode}</div>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <span className="font-medium">{b.hijriMonth || '-'} {b.hijriYear || ''}</span>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">
                              Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3">
                              {isUnpaid && (
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold">
                                  Belum Dibayar
                                </span>
                              )}
                              {isPending && (
                                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                                  Sedang Diproses
                                </span>
                              )}
                              {isPaid && (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Lunas</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {isPaid ? (
                                <button
                                  onClick={() => handleOpenReceipt(b)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-1 text-[11px] shadow-sm mx-auto"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Download Kwitansi</span>
                                </button>
                              ) : isPending ? (
                                <span className="text-[10px] text-amber-700 font-medium italic">
                                  Menunggu ACC
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedBillIds([b.id]);
                                    setPaymentStep(1);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold rounded-lg text-[11px] transition-colors"
                                >
                                  Bayar Sekarang
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        ) : (
          /* Tampilan Hero Search & Direktori Seluruh Santri */
          <div className="space-y-6 animate-in fade-in">
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-xs">{error}</div>
                  <p className="text-[11px] text-slate-500">
                    Pastikan ejaan nama santri atau nomor NIS sudah benar, atau klik langsung pada kartu santri di bawah ini.
                  </p>
                </div>
              </div>
            )}

            {/* Hero Card */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
                <Building2 className="w-80 h-80 text-white" />
              </div>

              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-blue-200 text-[11px] font-bold backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Portal Mandiri Wali Santri Terpadu</span>
                </div>

                <h2 className="font-black text-xl sm:text-3xl leading-tight">
                  Layanan Cek Tabungan, Status Santri & Pembayaran Syahriyah Online
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Silakan cari nama santri atau nomor NIS untuk melihat saldo uang saku belanja kantin smart NFC, riwayat kepulangan/izin asrama, dan kwitansi resmi pembayaran syahriyah.
                </p>

                {/* Big Search Input */}
                <form onSubmit={handleSearch} className="pt-2">
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-2xl border border-white/20 text-slate-900">
                    <div className="relative flex-1 flex items-center">
                      <Search className="w-4 h-4 text-slate-400 ml-3" />
                      <input
                        type="text"
                        placeholder="Masukkan Nama Santri, Nama Wali, atau NIS..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="w-full pl-3 pr-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none font-medium"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={handleClearSearch}
                          className="text-slate-400 hover:text-slate-600 mr-2 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Cari Santri</span>
                    </button>
                  </div>
                </form>

                {/* Popular / Quick Santri Chips */}
                {santriDirectory.length > 0 && (
                  <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                    <span className="font-semibold text-slate-400">Pencarian Cepat:</span>
                    {santriDirectory.slice(0, 6).map((s) => (
                      <button
                        key={s.id || s.nis}
                        type="button"
                        onClick={() => handleSelectSantri(s)}
                        className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-slate-200 transition-colors font-medium"
                      >
                        {s.nama || s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Direktori Santri Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Daftar Santri Terdaftar ({santriDirectory.length} Santri)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Klik pada kartu santri di bawah untuk langsung membuka rincian tabungan, perizinan, dan tagihan syahriyah.
                  </p>
                </div>
              </div>

              {loadingDirectory ? (
                <div className="py-8 text-center text-slate-400">
                  <div className="inline-block w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p>Memuat daftar santri...</p>
                </div>
              ) : santriDirectory.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Belum ada data santri yang terdaftar di lembaga ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {santriDirectory.map((s) => (
                    <button
                      key={s.id || s.nis}
                      type="button"
                      onClick={() => handleSelectSantri(s)}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all text-left flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {s.foto ? (
                          <img src={s.foto} alt={s.nama} className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {(s.nama || s.name || '?').charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-blue-700 text-xs truncate">
                            {s.nama || s.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            NIS: <span className="font-mono">{s.nis}</span> • Wali: <span className="text-blue-600 font-medium">{s.namaWali || '-'}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 flex-shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* 3. MODAL PEMBAYARAN 3-STEP RESMI */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in text-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Pembayaran Tagihan Online</h3>
                  <p className="text-[10px] text-slate-400">
                    {isKingDigitalPgActive ? 'King Digital Payment Gateway • Auto-Disbursement' : 'Langkah Verifikasi & Bukti Transfer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex items-center justify-between text-[11px] font-bold">
              <div className={`flex items-center gap-1.5 ${paymentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>Rincian</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-300"></div>
              <div className={`flex items-center gap-1.5 ${paymentStep >= 2 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${paymentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>2</span>
                <span>Metode</span>
              </div>
              <div className="h-0.5 w-8 bg-slate-300"></div>
              <div className={`flex items-center gap-1.5 ${paymentStep >= 3 ? 'text-blue-600' : 'text-slate-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${paymentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-300 text-slate-600'}`}>3</span>
                <span>Konfirmasi</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {paymentSuccessMsg ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">Pembayaran Berhasil Terkirim!</h4>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">{paymentSuccessMsg}</p>
                </div>
              ) : (
                <>
                  {/* STEP 1: Verifikasi Rincian Tagihan */}
                  {paymentStep === 1 && (
                    <div className="space-y-4">
                      <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="text-[10px] font-bold text-blue-700 uppercase">Santri Terpilih:</div>
                        <div className="font-bold text-sm text-slate-900">{santriData?.nama}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NIS: {santriData?.nis} • Kelas: {santriData?.kelas}</div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="font-bold text-slate-700 text-xs">Rincian Tagihan yang Dibayar:</div>
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                          {selectedBills.map(b => (
                            <div key={b.id} className="p-3 flex items-center justify-between bg-white text-xs">
                              <div>
                                <div className="font-bold text-slate-800">{b.title}</div>
                                <div className="text-[10px] text-slate-400 font-mono">Kode: {b.billCode}</div>
                              </div>
                              <div className="font-mono font-bold text-slate-900">
                                Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                              </div>
                            </div>
                          ))}
                          <div className="p-3 bg-slate-50 flex items-center justify-between font-bold border-t border-slate-200">
                            <span>TOTAL PEMBAYARAN:</span>
                            <span className="font-mono text-base text-blue-700">
                              Rp {totalPaymentAmount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentStep(2)}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <span>Lanjut Pilih Metode Transfer</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Pilih Metode Pembayaran */}
                  {paymentStep === 2 && (
                    <div className="space-y-4">
                      
                      {isKingDigitalPgActive ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-blue-700" />
                              <span className="font-extrabold text-blue-900 text-xs">King Digital Payment Gateway (Aktif)</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9px] font-bold">Auto-ACC</span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => setPaymentMethod('KING_DIGITAL_PG')}
                              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                paymentMethod === 'KING_DIGITAL_PG'
                                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="font-bold text-slate-900 text-xs">Virtual Account BSI / QRIS</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Otomatis Lunas Instan</div>
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentMethod('TRANSFER_BSI')}
                              className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                                paymentMethod === 'TRANSFER_BSI'
                                  ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                  : 'border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <div className="font-bold text-slate-900 text-xs">Transfer Manual Langsung</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">Upload Bukti Transfer</div>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('TRANSFER_BSI')}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                              paymentMethod === 'TRANSFER_BSI'
                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold text-slate-900 text-xs">Transfer Bank (BSI)</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">ATM / Mobile Banking BSI</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('QRIS')}
                            className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                              paymentMethod === 'QRIS'
                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                : 'border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <div className="font-bold text-slate-900 text-xs">QRIS Pesantren</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">BCA, Mandiri, GoPay, OVO, Dana</div>
                          </button>
                        </div>
                      )}

                      {/* Display Info Metode Terpilih */}
                      {paymentMethod === 'KING_DIGITAL_PG' ? (
                        <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">King Digital Gateway Settlement:</span>
                            <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded font-bold">Auto-Disburse</span>
                          </div>
                          <div>
                            <div className="font-mono font-black text-lg text-amber-400">
                              Rp {totalPaymentAmount.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[11px] text-slate-300 mt-1">
                              Rekening Penerima Dana: <strong>{disbursementBank} ({disbursementAccountNo})</strong> a.n <strong>{disbursementHolder}</strong>
                            </div>
                          </div>
                        </div>
                      ) : paymentMethod === 'TRANSFER_BSI' ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Rekening Tujuan Transfer:</div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono font-black text-base text-blue-700">{bankAccountNo}</div>
                              <div className="font-bold text-slate-800 text-[11px]">{bankAccountHolder}</div>
                              <div className="text-[10px] text-slate-500">{bankName}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountNo, 'bank')}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-700 flex items-center gap-1.5 shadow-sm"
                            >
                              {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedBank ? 'Tersalin' : 'Salin Rekening'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Scan QRIS Resmi Pesantren:</div>
                          <div className="w-44 h-44 mx-auto bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex items-center justify-center">
                            <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                          </div>
                          <div className="font-bold text-slate-800 text-[11px]">NMID: ID1020039281928</div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStep(1)}
                          className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                          Kembali
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentStep(3)}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                        >
                          <span>{paymentMethod === 'KING_DIGITAL_PG' ? 'Lanjut Konfirmasi Gateway' : 'Lanjut Unggah Bukti Transfer'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Upload Bukti Transfer / Gateway Pay */}
                  {paymentStep === 3 && (
                    <form onSubmit={handleSubmitProof} className="space-y-4">
                      
                      {paymentMethod === 'KING_DIGITAL_PG' ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-center">
                          <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A] text-white flex items-center justify-center mx-auto shadow-sm">
                            <CreditCard className="w-6 h-6 text-amber-300" />
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm">Pembayaran Instan King Digital Payment</h4>
                          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                            Klik tombol di bawah untuk menyelesaikan pembayaran. Sistem akan memverifikasi lunas secara real-time dan menerbitkan kwitansi resmi.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Unggah Foto / Screenshot Bukti Transfer *</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors">
                              {proofPreview ? (
                                <div className="space-y-2">
                                  <img src={proofPreview} alt="Bukti" className="max-h-36 mx-auto rounded-lg shadow-sm border border-slate-200" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProofFile(null);
                                      setProofPreview('');
                                    }}
                                    className="text-[11px] text-rose-600 font-bold hover:underline"
                                  >
                                    Ganti Gambar
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer block space-y-1">
                                  <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                                  <span className="font-bold text-blue-600 block">Klik untuk memilih file bukti transfer</span>
                                  <span className="text-[10px] text-slate-400 block">Format JPG, PNG, atau Screenshot M-Banking</span>
                                  <input type="file" accept="image/*" required onChange={handleFileChange} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Contoh: Transfer via rekening BSI a.n Hendra Gunawan"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 text-xs"
                            />
                          </div>
                        </>
                      )}

                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStep(2)}
                          className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-xl"
                        >
                          Kembali
                        </button>
                        <button
                          type="submit"
                          disabled={submittingPayment || (paymentMethod !== 'KING_DIGITAL_PG' && !proofPreview)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {submittingPayment ? 'Memproses Pembayaran...' : (paymentMethod === 'KING_DIGITAL_PG' ? 'Bayar & Terbitkan Kwitansi Instan' : 'Kirim Bukti Pembayaran')}
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Modal Kwitansi Read-Only (Non-Editable) */}
      <OfficialReceipt
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        defaultData={activeReceiptData}
        readOnly={true}
      />

      {/* Aesthetic Toast Notification */}
      <AestheticToast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Developer Footer Component */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
