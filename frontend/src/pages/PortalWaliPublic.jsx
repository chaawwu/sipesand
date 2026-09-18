import React, { useState, useEffect } from 'react';
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
  Lock,
  Zap,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { 
  getPublicSantriData, 
  getPublicSantriBills, 
  uploadPaymentProof 
} from '../services/api';
import { getCurrentTenant } from '../services/localDatabase';
import { getCloudSettings } from '../services/cloudDatabase';
import OfficialReceipt from '../components/OfficialReceipt';
import AestheticToast from '../components/AestheticToast';
import DeveloperFooter from '../components/DeveloperFooter';
import { useSettings } from '../context/SettingsContext';

export default function PortalWaliPublic({ initialQuery = '', tenant = null, onBackToHome, onNavigateLegal }) {
  const { settings, isNfcEnabled } = useSettings();
  const resolvedTenant = tenant || getCurrentTenant();
  const [tenantSettings, setTenantSettings] = useState(settings);
  const [searchQuery, setSearchQuery] = useState(initialQuery || '');
  const [portalRawData, setPortalRawData] = useState(null);
  const [santriData, setSantriData] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Selection & Payment Flow States
  const [selectedBillIds, setSelectedBillIds] = useState([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Summary/Verify, 2: Choose Method, 3: Upload Proof / Instant PG
  const [paymentMethod, setPaymentMethod] = useState('PAYMENTKU'); // 'PAYMENTKU' | 'TRANSFER_BSI' | 'QRIS'
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState('');
  const [notes, setNotes] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // PaymentKu Gateway States (paymentku.com)
  const [pgLoading, setPgLoading] = useState(false);
  const [pgTransaction, setPgTransaction] = useState(null);
  const [viewProofUrl, setViewProofUrl] = useState(null);

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

  // Load specific tenant settings from Cloud Firestore to display the correct institution
  useEffect(() => {
    let isMounted = true;
    async function loadSettingsForTenant() {
      try {
        const res = await getCloudSettings(resolvedTenant);
        if (isMounted && res && res.data && Object.keys(res.data).length > 0) {
          setTenantSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (err) {
        console.warn('Gagal memuat setting tenant:', err);
      }
    }
    loadSettingsForTenant();
    return () => { isMounted = false; };
  }, [resolvedTenant]);

  const logoPondok = tenantSettings.LOGO_PONDOK_URL || settings.LOGO_PONDOK_URL || "/logo.png";
  const namaLembaga = tenantSettings.NAMA_LEMBAGA || settings.NAMA_LEMBAGA || 'SiPesand Terpadu';
  const bankName = tenantSettings.BANK_NAME || settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const bankAccountNo = tenantSettings.BANK_ACCOUNT_NO || settings.BANK_ACCOUNT_NO || '7192837465';
  const bankAccountHolder = tenantSettings.BANK_ACCOUNT_HOLDER || settings.BANK_ACCOUNT_HOLDER || `YAYASAN ${namaLembaga.toUpperCase()}`;
  const qrisUrl = tenantSettings.QRIS_PAYMENT_URL || settings.QRIS_PAYMENT_URL || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80';
  
  // Ambil transaksi uang saku santri secara lengkap
  const rawPocket = portalRawData?.pocketTxs || portalRawData?.financial?.recentPocketTxs || [];
  const pocketTransactions = Array.isArray(rawPocket) ? rawPocket : [];

  // Hitung total tunggakan dan status tagihan secara akurat
  const totalTunggakan = portalRawData?.financial?.totalTunggakan ?? bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const pendingCount = portalRawData?.financial?.pendingCount ?? bills.filter(b => b.status === 'PENDING_VERIFICATION').length;
  const paidCount = portalRawData?.financial?.paidCount ?? bills.filter(b => b.status === 'PAID').length;
  
  // King Digital Payment Gateway Active State
  const isKingDigitalPgActive = tenantSettings.KING_DIGITAL_PG_ENABLED === 'true';
  const disbursementBank = tenantSettings.DISBURSEMENT_BANK || 'Bank Syariah Indonesia (BSI)';
  const disbursementAccountNo = tenantSettings.DISBURSEMENT_ACCOUNT_NO || '7192837465';
  const disbursementHolder = tenantSettings.DISBURSEMENT_ACCOUNT_HOLDER || `YAYASAN ${namaLembaga.toUpperCase()}`;

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setSearchQuery(initialQuery.trim());
      loadSantriData(initialQuery.trim());
    }
  }, [initialQuery, resolvedTenant]);

  const loadSantriData = async (query) => {
    const q = (query || '').trim();
    if (!q) {
      setSantriData(null);
      setPortalRawData(null);
      setBills([]);
      setError('Silakan masukkan NIS atau Nama Santri untuk mencari data.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await getPublicSantriData(q, resolvedTenant);

      if (res && res.data && res.data.success && res.data.data) {
        const payload = res.data.data;
        setPortalRawData(payload);
        setSantriData(payload.santri || payload);
        
        const extractedBills = payload.financial?.bills || payload.bills || [];
        setBills(extractedBills);
        setLoading(false);
        return;
      } else {
        const notFoundMsg = res?.data?.message || `Data santri "${q}" tidak ditemukan di ${namaLembaga}. Pastikan ejaan nama atau nomor induk santri (NIS) sudah sesuai.`;
        setError(notFoundMsg);
        setSantriData(null);
        setPortalRawData(null);
        setBills([]);
      }
    } catch (err) {
      console.warn('API Portal Wali error:', err);
      setError(`Data santri "${q}" tidak ditemukan di ${namaLembaga}. Mohon periksa kembali ejaan nama atau NIS putra/putri Anda.`);
      setSantriData(null);
      setPortalRawData(null);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSelectedBillIds([]);
      loadSantriData(searchQuery.trim());
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
    setPaymentMethod('PAYMENTKU');
    setPgTransaction(null);
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

  // PaymentKu Gateway Handlers (paymentku.com)
  const handleGeneratePaymentKuPayment = async () => {
    try {
      setPgLoading(true);
      const title = `Tagihan ${selectedBills.map(b => b.title).join(', ')} - ${santriData?.nama || 'Santri'}`;
      const payload = {
        amount: totalPaymentAmount,
        title,
        customer_name: santriData?.namaWali || santriData?.nama || 'Wali Santri',
        customer_phone: santriData?.noHpWali || '08123456789',
        customer_email: 'wali@sipesand.web.id',
        bill_ids: selectedBillIds,
        bill_id: selectedBillIds[0],
        santri_id: santriData?.id,
        channel_code: 'qris',
        payment_method: 'qris'
      };

      const res = await axios.post('/api/payments/create', payload, {
        params: resolvedTenant ? { tenant: resolvedTenant } : {},
        headers: resolvedTenant ? { 'X-Tenant-Subdomain': resolvedTenant } : {}
      });

      if (res.data?.success && res.data?.data) {
        setPgTransaction(res.data.data);
      } else {
        throw new Error(res.data?.message || 'Gagal menerbitkan transaksi gateway');
      }
    } catch (err) {
      console.warn('PaymentKu create error:', err);
      const extId = `PKU-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setPgTransaction({
        id: extId,
        external_id: extId,
        checkout_url: null,
        amount: totalPaymentAmount,
        status: 'PENDING'
      });
    } finally {
      setPgLoading(false);
    }
  };

  const handleCheckPgStatus = async () => {
    if (!pgTransaction?.external_id) return;
    try {
      setPgLoading(true);
      const res = await axios.get(`/api/payments/status/${pgTransaction.external_id}`, {
        params: resolvedTenant ? { tenant: resolvedTenant } : {}
      });
      if (res.data?.success && res.data?.data?.status === 'PAID') {
        setPaymentSuccessMsg('Pembayaran telah berhasil diterima dan diverifikasi lunas oleh PaymentKu Payment Gateway (paymentku.com)! Kwitansi resmi telah terbit.');
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Pembayaran Lunas!',
          message: 'Transaksi PaymentKu (paymentku.com) sukses. Kwitansi otomatis diterbitkan.'
        });
        loadSantriData(santriData.nis || santriData.nama);
        setSelectedBillIds([]);
        setTimeout(() => {
          setIsPaymentModalOpen(false);
          setPaymentStep(1);
          setPgTransaction(null);
        }, 3000);
      } else {
        setToast({
          isOpen: true,
          type: 'info',
          title: 'Menunggu Pembayaran',
          message: 'Status masih menunggu pembayaran. Silakan selesaikan pembayaran di halaman checkout.'
        });
      }
    } catch (err) {
      console.warn('Check PG status error:', err);
    } finally {
      setPgLoading(false);
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
        proofUrl: proofPreview || '',
        proofImage: proofPreview || '',
        proofNote: notes || `Pembayaran transfer oleh wali santri ${santriData?.namaWali || ''}`,
        notes: notes || `Pembayaran transfer oleh wali santri ${santriData?.namaWali || ''}`,
        senderName: santriData?.namaWali || 'Wali Santri'
      };

      const res = await uploadPaymentProof(payload, resolvedTenant);
      if (res.data?.success || res.success) {
        setPaymentSuccessMsg('Bukti transfer berhasil dikirim! Status tagihan saat ini: Menunggu Verifikasi Bendahara Pesantren.');

        setToast({
          isOpen: true,
          type: 'success',
          title: 'Bukti Terkirim',
          message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi bendahara.'
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
      paymentMethod: (bill.paymentMethod === 'PAYMENTKU' || bill.paymentMethod === 'KASERAPAY' || bill.paymentMethod === 'KING_DIGITAL_PG') ? 'PaymentKu Gateway (paymentku.com)' : (bill.paymentMethod === 'TRANSFER_BSI' ? 'Transfer BSI' : bill.paymentMethod || 'Transfer Bank'),
      bendaharaName: bill.verifiedBy || settings.NAMA_BENDAHARA || 'Bendahara Pesantren',
      items: [
        { id: bill.id, name: bill.title, amount: bill.amount }
      ]
    });
    setIsReceiptOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] text-[#111827] flex flex-col font-sans selection:bg-[#8CE829] selection:text-[#0A1128]">
      
      {/* 1. Header Portal Wali */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Beranda</span>
            </button>

            <div className="w-11 h-11 rounded-2xl bg-[#8CE829] flex items-center justify-center p-1.5 shadow-sm">
              <img 
                src="/logo.png" 
                alt="SiPesand Logo" 
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">
                  SiPesand
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#8CE829]/25 text-slate-900 border border-[#8CE829]/40">
                  Portal Wali
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium leading-none">
                {namaLembaga}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Lembaga Terverifikasi:</span>
              <span>{namaLembaga}</span>
              <span className="text-[9px] bg-emerald-200/80 px-1.5 py-0.5 rounded text-emerald-900 font-black uppercase tracking-wider">Terkunci</span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Editorial Pill Search Card (Woot Style) */}
        <div className="bg-[#0B52E2] rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 text-white relative overflow-hidden shadow-xl border border-blue-600">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/20 border border-white/30 text-xs font-bold text-white">
              <span className="w-2 h-2 rounded-full bg-[#8CE829]" />
              <span>Transparansi Santri Real-Time • {namaLembaga}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Portal Mandiri Wali Santri
            </h1>
            <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed max-w-xl mx-auto">
              Cek saldo uang saku smart card NFC, pantau status keberadaan santri, serta bayar syahriyah bulanan & unduh kwitansi resmi langsung.
            </p>

            {/* Big Pill Search Input */}
            <form onSubmit={handleSearch} className="pt-3 max-w-xl mx-auto">
              <div className="bg-white rounded-full p-2 pl-5 shadow-2xl flex items-center gap-2 border border-white/20">
                <Search className="w-5 h-5 text-stone-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder={`Ketik NIS atau Nama Santri di ${namaLembaga}... (contoh: Fulan)`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-full bg-[#8CE829] hover:bg-[#7dd321] text-slate-950 font-black text-xs transition-all shadow-md flex-shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Cari Santri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {loading ? (
          <div className="p-16 text-center text-stone-500 bg-white rounded-[32px] border border-stone-200/90 shadow-sm">
            <div className="inline-block w-8 h-8 border-3 border-[#0B52E2] border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="font-medium text-sm">Memuat data portal santri...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-rose-50 border border-rose-200 rounded-[32px] text-rose-800 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
            <div className="font-black text-base">{error}</div>
            <p className="text-xs text-rose-700/80">Silakan masukkan NIS atau Nama Santri pada kolom pencarian di atas.</p>
          </div>
        ) : santriData ? (
          <div className="space-y-6">
            
            {/* Profil Ringkas Santri & Status Lokasi */}
            <div className="bg-white rounded-[32px] border border-stone-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#0B52E2] text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
                  {santriData.nama ? santriData.nama.charAt(0) : 'S'}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                      {santriData.nama}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#8CE829]/25 text-slate-900 font-black text-[10px] border border-[#8CE829]/40">
                      {santriData.gender === 'L' ? 'Ikhwan (Santri Putra)' : 'Akhwat (Santri Putri)'}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 font-mono mt-1">
                    NIS: <strong className="text-slate-800">{santriData.nis || '-'}</strong> • Kelas: {santriData.kelas || '-'} • Kamar: {santriData.kamar || '-'}
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    Wali: <strong className="text-slate-700">{santriData.namaWali || '-'}</strong> {santriData.noHpWali ? `(${santriData.noHpWali})` : ''}
                  </div>
                </div>
              </div>

              {/* Status Keberadaan / Perizinan */}
              {portalRawData?.location && (
                <div className={`px-5 py-3.5 rounded-2xl border flex items-center gap-3 w-full md:w-auto shadow-sm ${
                  portalRawData.location.status === 'DI_PESANTREN'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : portalRawData.location.status === 'OVERDUE'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-blue-50 border-blue-200 text-blue-950'
                }`}>
                  <ShieldCheck className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">Status Keberadaan:</span>
                    <span className="font-black text-xs sm:text-sm">{portalRawData.location.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Grid 3 Kolom Ringkasan: Tabungan, Tunggakan, Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Saldo Uang Saku */}
              <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-500">Tabungan Uang Saku</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono font-black text-2xl text-emerald-600">
                  Rp {parseFloat(santriData.saldo_saku || 0).toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-stone-500">Tersambung smart card NFC untuk transaksi kantin cashless.</p>
              </div>

              {/* Total Tunggakan Tagihan */}
              <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-500">Total Tagihan Belum Dibayar</span>
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>
                <div className="font-mono font-black text-2xl text-rose-600">
                  Rp {totalTunggakan.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-stone-500">Termasuk Syahriyah bulanan & operasional santri.</p>
              </div>

              {/* Status Pembayaran */}
              <div className="bg-white rounded-[24px] border border-stone-200/90 p-6 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-500">Status Tagihan</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-2 font-bold text-xs pt-1">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                    {pendingCount} Sedang Diproses
                  </span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg">
                    {paidCount} Lunas
                  </span>
                </div>
                <p className="text-xs text-stone-500">Kwitansi resmi diterbitkan setelah bendahara mengonfirmasi.</p>
              </div>

            </div>

            {/* Histori transaksi uang saku dari data santri yang sebenarnya */}
            <div className="bg-white rounded-[32px] border border-stone-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h3 className="font-black text-lg text-slate-900">Histori Transaksi Uang Saku</h3>
                  <p className="text-xs text-stone-500 mt-1">Riwayat transaksi tercatat untuk santri ini.</p>
                </div>
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Waktu</th>
                      <th className="py-3.5 px-4">Jenis</th>
                      <th className="py-3.5 px-4">Keterangan</th>
                      <th className="py-3.5 px-4">Nominal</th>
                      <th className="py-3.5 px-4">Saldo Setelah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pocketTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-stone-400">
                          Belum ada histori transaksi uang saku.
                        </td>
                      </tr>
                    ) : pocketTransactions.map((transaction) => {
                      const isTopup = transaction.type === 'TOPUP';
                      const transactionDate = transaction.createdAt || transaction.date;
                      return (
                        <tr key={transaction.id || transaction.txCode} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-4 text-stone-600 whitespace-nowrap">
                            {transactionDate ? new Date(transactionDate).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${isTopup ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>
                              {isTopup ? 'Top-Up' : transaction.type === 'WITHDRAW' ? 'Penarikan' : 'Belanja'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-stone-600">{transaction.description || transaction.merchant || '-'}</td>
                          <td className={`py-3.5 px-4 font-mono font-bold ${isTopup ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isTopup ? '+' : '-'} Rp {parseFloat(transaction.amount || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                            Rp {parseFloat(transaction.balanceAfter ?? transaction.currentBalance ?? 0).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section Tagihan & Pembayaran Mandiri */}
            <div className="bg-white rounded-[32px] border border-stone-200/90 shadow-sm overflow-hidden p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-black text-lg text-slate-900">Tagihan & Kwitansi Pembayaran</h3>
                    {isKingDigitalPgActive && (
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-lg font-bold text-[10px] flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-blue-700" />
                        <span>King Digital Gateway (Auto-Disburse)</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-1">
                    Centang tagihan yang ingin dibayar lalu klik tombol <strong>Bayar Tagihan Terpilih</strong> untuk transfer bank / QRIS.
                  </p>
                </div>

                {selectedBillIds.length > 0 && (
                  <button
                    onClick={handleStartPayment}
                    className="px-5 py-3 bg-[#0B52E2] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#8CE829]" />
                    <span>Bayar {selectedBillIds.length} Tagihan (Rp {totalPaymentAmount.toLocaleString('id-ID')})</span>
                  </button>
                )}
              </div>

              {/* Bills Table */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-stone-200 text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-12 text-center">Pilih</th>
                      <th className="py-3.5 px-4">Pos & Judul Tagihan</th>
                      <th className="py-3.5 px-4">Periode Hijriyah</th>
                      <th className="py-3.5 px-4">Nominal (Rp)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-center">Aksi / Kwitansi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {bills.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-stone-400">
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
                          <tr key={b.id} className={`hover:bg-stone-50/70 transition-colors ${isSelected ? 'bg-blue-50/40' : ''}`}>
                            <td className="py-3.5 px-4 text-center">
                              {isUnpaid ? (
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleBill(b.id)}
                                  className="w-4 h-4 rounded border-stone-300 text-[#0B52E2] focus:ring-[#0B52E2] cursor-pointer"
                                />
                              ) : (
                                <span className="text-stone-300">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{b.title}</div>
                              <div className="text-[11px] text-stone-400 font-mono">Kode: {b.billCode}</div>
                            </td>
                            <td className="py-3.5 px-4 text-stone-600">
                              <span className="font-medium">{b.hijriMonth || '-'} {b.hijriYear || ''}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                              Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-4">
                              {isUnpaid && (
                                <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-[10px] font-bold">
                                  Belum Dibayar
                                </span>
                              )}
                              {isPending && (
                                <div className="space-y-1">
                                  <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
                                    <span>Menunggu Verifikasi Bendahara</span>
                                  </span>
                                  <div className="text-[10px] text-stone-500">Bukti transfer telah dikirim</div>
                                </div>
                              )}
                              {isPaid && (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold flex items-center gap-1 w-fit">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Lunas</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isPaid ? (
                                <button
                                  onClick={() => handleOpenReceipt(b)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs shadow-sm mx-auto cursor-pointer"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Download Kwitansi</span>
                                </button>
                              ) : isPending ? (
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-[11px] text-amber-700 font-semibold italic">Sedang Diproses</span>
                                  {(b.proofUrl || b.proofImage) && (
                                    <button
                                      type="button"
                                      onClick={() => setViewProofUrl(b.proofUrl || b.proofImage)}
                                      className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 font-bold bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 cursor-pointer"
                                      title="Lihat Bukti yang Dikirim"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>Lihat Bukti</span>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedBillIds([b.id]);
                                    setPaymentStep(1);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0B52E2] border border-blue-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
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
          <div className="p-12 sm:p-16 text-center bg-white rounded-[32px] border border-stone-200/90 shadow-sm space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-[#0B52E2] rounded-3xl flex items-center justify-center mx-auto shadow-inner">
              <Search className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900">Cari Data Santri</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Silakan ketik <strong>NIS</strong> atau <strong>Nama Lengkap Santri</strong> pada kolom pencarian di atas untuk melihat status keberadaan, saldo uang saku NFC, serta rincian tagihan syahriyah di <strong>{namaLembaga}</strong>.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-100 border border-stone-200 text-[11px] font-medium text-stone-600">
              <Lock className="w-3.5 h-3.5 text-stone-500" />
              <span>Data terisolasi aman khusus santri terdaftar di {namaLembaga}</span>
            </div>
          </div>
        )}

      </main>

      {/* 3. MODAL PEMBAYARAN 3-STEP RESMI (WOOT STYLED) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in text-xs font-sans">
          <div className="bg-white rounded-[32px] shadow-2xl border border-stone-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Header Modal */}
            <div className="bg-[#0B52E2] text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold shadow">
                  <CreditCard className="w-5 h-5 text-[#8CE829]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Pembayaran Tagihan Santri</h3>
                  <p className="text-[11px] text-blue-100/80">
                    {isKingDigitalPgActive ? 'King Digital Payment Gateway • Auto-Disbursement' : 'Langkah Verifikasi & Bukti Transfer'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Stepper Wizard Bar */}
            <div className="bg-stone-50 px-6 py-3 border-b border-stone-200/80 flex items-center justify-between text-[11px] font-bold">
              <div className={`flex items-center gap-2 ${paymentStep >= 1 ? 'text-[#0B52E2]' : 'text-stone-400'}`}>
                <span className="w-5 h-5 rounded-full bg-[#0B52E2] text-white flex items-center justify-center text-[10px]">1</span>
                <span>Rincian</span>
              </div>
              <div className="h-0.5 w-8 bg-stone-300"></div>
              <div className={`flex items-center gap-2 ${paymentStep >= 2 ? 'text-[#0B52E2]' : 'text-stone-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${paymentStep >= 2 ? 'bg-[#0B52E2] text-white' : 'bg-stone-300 text-stone-600'}`}>2</span>
                <span>Metode</span>
              </div>
              <div className="h-0.5 w-8 bg-stone-300"></div>
              <div className={`flex items-center gap-2 ${paymentStep >= 3 ? 'text-[#0B52E2]' : 'text-stone-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${paymentStep >= 3 ? 'bg-[#0B52E2] text-white' : 'bg-stone-300 text-stone-600'}`}>3</span>
                <span>Konfirmasi</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {paymentSuccessMsg ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h4 className="font-black text-sm text-emerald-950">Pembayaran Berhasil Diproses!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">{paymentSuccessMsg}</p>
                </div>
              ) : (
                <>
                  {/* STEP 1: Verifikasi Rincian Tagihan */}
                  {paymentStep === 1 && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
                        <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Santri Terpilih:</div>
                        <div className="font-black text-sm text-slate-900 mt-0.5">{santriData?.nama}</div>
                        <div className="text-xs text-stone-600 font-mono mt-0.5">NIS: {santriData?.nis} • Kelas: {santriData?.kelas}</div>
                      </div>

                      <div className="space-y-2">
                        <div className="font-bold text-stone-700 text-xs">Rincian Tagihan yang Dibayar:</div>
                        <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden">
                          {selectedBills.map(b => (
                            <div key={b.id} className="p-3.5 flex items-center justify-between bg-white text-xs">
                              <div>
                                <div className="font-bold text-slate-800">{b.title}</div>
                                <div className="text-[11px] text-stone-400 font-mono">Kode: {b.billCode}</div>
                              </div>
                              <div className="font-mono font-bold text-slate-900">
                                Rp {parseFloat(b.amount || 0).toLocaleString('id-ID')}
                              </div>
                            </div>
                          ))}
                          <div className="p-4 bg-stone-50 flex items-center justify-between font-bold border-t border-stone-200">
                            <span className="text-xs uppercase tracking-wider text-stone-600">TOTAL PEMBAYARAN:</span>
                            <span className="font-mono text-lg font-black text-[#0B52E2]">
                              Rp {totalPaymentAmount.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setPaymentStep(2)}
                        className="w-full py-3 bg-[#0B52E2] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Lanjut Pilih Metode Transfer</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Pilih Metode Pembayaran */}
                  {/* STEP 2: Pilih Metode Pembayaran */}
                  {paymentStep === 2 && (
                    <div className="space-y-4">
                      
                      <div className="text-xs font-bold text-stone-700">Pilih Metode Pembayaran:</div>

                      <div className="space-y-3">
                        {/* 1. PaymentKu Gateway (paymentku.com) */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('PAYMENTKU')}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                            (paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY')
                              ? 'border-[#0B52E2] bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                              <span className="font-black text-slate-900 text-xs sm:text-sm">PaymentKu Payment Gateway (paymentku.com)</span>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">Otomatis / Instan</span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              QRIS Semua E-Wallet & Virtual Account (BSI, Mandiri, BCA, BRI, BNI). Lunas otomatis detik itu juga melalui PaymentKu (paymentku.com).
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${(paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') ? 'border-[#0B52E2] bg-[#0B52E2] text-white' : 'border-stone-300'}`}>
                            {(paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>

                        {/* 2. Transfer Bank Manual */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('TRANSFER_BSI')}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                            paymentMethod === 'TRANSFER_BSI'
                              ? 'border-[#0B52E2] bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-[#0B52E2]" />
                              <span className="font-black text-slate-900 text-xs sm:text-sm">Transfer Rekening Pondok (Manual)</span>
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full text-[9px] font-bold">Verifikasi Bendahara</span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Transfer ATM / Mobile Banking ke rekening resmi pesantren lalu unggah struk transfer. Status akan di-ACC oleh Bendahara.
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${paymentMethod === 'TRANSFER_BSI' ? 'border-[#0B52E2] bg-[#0B52E2] text-white' : 'border-stone-300'}`}>
                            {paymentMethod === 'TRANSFER_BSI' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>

                        {/* 3. QRIS Resmi Pesantren */}
                        <button
                          type="button"
                          onClick={() => setPaymentMethod('QRIS')}
                          className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start justify-between cursor-pointer ${
                            paymentMethod === 'QRIS'
                              ? 'border-[#0B52E2] bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                              : 'border-stone-200 hover:bg-stone-50'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-[#0B52E2]" />
                              <span className="font-black text-slate-900 text-xs sm:text-sm">QRIS Resmi Pesantren (Manual)</span>
                              <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full text-[9px] font-bold">Verifikasi Bendahara</span>
                            </div>
                            <p className="text-[11px] text-stone-500 leading-relaxed">
                              Scan barcode QRIS statis pesantren lewat GoPay, OVO, ShopeePay, BCA, dll. lalu unggah screenshot bukti berhasil.
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${paymentMethod === 'QRIS' ? 'border-[#0B52E2] bg-[#0B52E2] text-white' : 'border-stone-300'}`}>
                            {paymentMethod === 'QRIS' && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      </div>

                      {/* Info Detail Metode Terpilih */}
                      {(paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') ? (
                        <div className="p-4 bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl border border-blue-900/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#8CE829] uppercase tracking-wider flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 fill-[#8CE829]" />
                              <span>PaymentKu Gateway (paymentku.com)</span>
                            </span>
                            <span className="text-[9px] bg-[#0B52E2] text-white px-2 py-0.5 rounded-md font-black">Realtime Instant</span>
                          </div>
                          <div>
                            <div className="font-mono font-black text-lg text-white">
                              Total: Rp {totalPaymentAmount.toLocaleString('id-ID')}
                            </div>
                            <div className="text-[11px] text-blue-200/80 mt-1">
                              Mendukung QRIS 24 Jam & Virtual Account Bank Syariah Indonesia, BCA, Mandiri, BRI, BNI via paymentku.com.
                            </div>
                          </div>
                        </div>
                      ) : paymentMethod === 'TRANSFER_BSI' ? (
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                          <div className="text-[10px] font-bold text-stone-400 uppercase">Rekening Tujuan Transfer:</div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-mono font-black text-base text-[#0B52E2]">{bankAccountNo}</div>
                              <div className="font-bold text-slate-800 text-[11px]">{bankAccountHolder}</div>
                              <div className="text-[10px] text-stone-500">{bankName}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopy(bankAccountNo, 'bank')}
                              className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                              {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-2">
                          <div className="text-[10px] font-bold text-stone-400 uppercase">Scan QRIS Resmi Pesantren:</div>
                          <div className="w-44 h-44 mx-auto bg-white p-2 rounded-2xl border border-stone-300 shadow-sm flex items-center justify-center">
                            <img src={qrisUrl} alt="QRIS" className="w-full h-full object-contain" />
                          </div>
                          <div className="font-bold text-slate-800 text-[11px]">NMID: ID1020039281928</div>
                        </div>
                      )}

                      <div className="flex gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setPaymentStep(1)}
                          className="w-1/3 py-3 border border-stone-300 text-stone-700 font-bold rounded-2xl hover:bg-stone-100 cursor-pointer"
                        >
                          Kembali
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentStep(3);
                            if ((paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') && !pgTransaction) {
                              handleGeneratePaymentKuPayment();
                            }
                          }}
                          className="flex-1 py-3 bg-[#0B52E2] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <span>{(paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') ? 'Lanjut ke PaymentKu Gateway (paymentku.com)' : 'Lanjut Unggah Bukti Transfer'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PaymentKu Gateway (paymentku.com) / Upload Bukti Transfer */}
                  {paymentStep === 3 && (
                    <div className="space-y-4">
                      
                      {(paymentMethod === 'PAYMENTKU' || paymentMethod === 'KASERAPAY') ? (
                        <div className="space-y-4">
                          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 space-y-3 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#0B52E2] text-white flex items-center justify-center mx-auto shadow-md">
                              <Zap className="w-6 h-6 text-[#8CE829] fill-[#8CE829]" />
                            </div>
                            <div>
                              <h4 className="font-black text-slate-900 text-sm">PaymentKu Payment Gateway (paymentku.com)</h4>
                              <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto leading-relaxed">
                                Pembayaran lunas instan detik itu juga melalui QRIS Dinamis & Virtual Account Bank Syariah / Nasional via paymentku.com.
                              </p>
                            </div>

                            <div className="p-3 bg-white rounded-xl border border-blue-100 font-mono font-black text-xl text-[#0B52E2]">
                              Rp {totalPaymentAmount.toLocaleString('id-ID')}
                            </div>

                            {pgTransaction && (
                              <div className="text-[11px] text-stone-500 font-mono">
                                No. Transaksi: <strong className="text-slate-800">{pgTransaction.external_id}</strong>
                              </div>
                            )}
                          </div>

                          {/* Tombol Aksi Gateway */}
                          <div className="space-y-2 pt-1">
                            {pgTransaction?.checkout_url ? (
                              <a
                                href={pgTransaction.checkout_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-3 bg-[#0B52E2] hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-xs"
                              >
                                <Zap className="w-4 h-4 text-[#8CE829] fill-[#8CE829]" />
                                <span>Buka Halaman Pembayaran PaymentKu (paymentku.com)</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            ) : (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] text-center space-y-1">
                                <span className="font-bold block">Link pembayaran belum tersedia</span>
                                <span className="text-stone-600 block text-[10px]">Gagal membuat transaksi Paymenku (API Key belum dikonfigurasi atau nominal tidak valid). Hubungi admin pesantren atau coba lagi.</span>
                              </div>
                            )}

                            <div className="grid grid-cols-1 gap-2">
                              <button
                                type="button"
                                onClick={handleCheckPgStatus}
                                disabled={pgLoading}
                                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold rounded-xl border border-stone-300 transition-colors flex items-center justify-center gap-1.5 text-xs cursor-pointer disabled:opacity-50"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${pgLoading ? 'animate-spin' : ''}`} />
                                <span>Cek Status Otomatis</span>
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2.5 pt-2 border-t border-stone-200">
                            <button
                              type="button"
                              onClick={() => setPaymentStep(2)}
                              className="w-full py-2.5 border border-stone-300 text-stone-700 font-bold rounded-xl hover:bg-stone-100 cursor-pointer text-xs"
                            >
                              Ganti Metode Pembayaran
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleSubmitProof} className="space-y-4">
                          <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Unggah Foto / Screenshot Bukti Transfer *</label>
                            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-5 text-center hover:bg-stone-50 transition-colors">
                              {proofPreview ? (
                                <div className="space-y-2">
                                  <img src={proofPreview} alt="Bukti" className="max-h-36 mx-auto rounded-xl shadow-sm border border-stone-200" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setProofFile(null);
                                      setProofPreview('');
                                    }}
                                    className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                                  >
                                    Ganti Gambar
                                  </button>
                                </div>
                              ) : (
                                <label className="cursor-pointer block space-y-1.5">
                                  <Upload className="w-7 h-7 text-stone-400 mx-auto" />
                                  <span className="font-bold text-[#0B52E2] block text-xs">Klik untuk memilih file bukti transfer</span>
                                  <span className="text-[11px] text-stone-400 block">Format JPG, PNG, atau Screenshot M-Banking</span>
                                  <input type="file" accept="image/*" required onChange={handleFileChange} className="hidden" />
                                </label>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block font-bold text-slate-700 mb-1.5">Catatan Tambahan (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Contoh: Transfer via rekening BSI a.n Hendra Gunawan"
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-[#0B52E2] text-xs font-medium"
                            />
                          </div>

                          <div className="flex gap-2.5 pt-2">
                            <button
                              type="button"
                              onClick={() => setPaymentStep(2)}
                              className="w-1/3 py-3 border border-stone-300 text-stone-700 font-bold rounded-2xl hover:bg-stone-100 cursor-pointer"
                            >
                              Kembali
                            </button>
                            <button
                              type="submit"
                              disabled={submittingPayment || !proofPreview}
                              className="flex-1 py-3 bg-[#0B52E2] hover:bg-blue-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {submittingPayment ? 'Mengirim Bukti...' : 'Kirim Bukti Pembayaran ke Bendahara'}
                            </button>
                          </div>
                        </form>
                      )}

                    </div>
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

      {/* Modal Preview Bukti Transfer Wali */}
      {viewProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-stone-200 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-black text-sm text-slate-900">Lampiran Bukti Transfer</span>
              <button 
                onClick={() => setViewProofUrl(null)} 
                className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-auto rounded-2xl border border-stone-200 bg-stone-50 p-2 flex items-center justify-center">
              <img src={viewProofUrl} alt="Bukti Transfer" className="w-full h-auto object-contain rounded-xl" />
            </div>
            <div className="flex justify-between items-center pt-1">
              <a
                href={viewProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Gambar Penuh</span>
              </a>
              <button
                onClick={() => setViewProofUrl(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Developer Footer Component */}
      <DeveloperFooter onNavigateLegal={onNavigateLegal} />

    </div>
  );
}
