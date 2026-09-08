import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Mail, 
  Key, 
  ExternalLink, 
  Globe, 
  Lock,
  UploadCloud,
  AlertCircle,
  MessageCircle,
  FileText,
  CheckCheck,
  QrCode,
  Download,
  PhoneCall
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  getMitraConfig, 
  getMitraOrderStatus, 
  simulatePaymentSuccess, 
  uploadMitraPaymentProof 
} from '../services/api';
import { compressImage } from '../utils/imageCompressor';
import AestheticToast from './AestheticToast';

export default function PaymentCheckout({ orderData, onBackToRegister, onGoToTenant }) {
  const [order, setOrder] = useState(orderData || {
    orderId: 'KGD-ORD-SAMPLE-1029',
    namaPondok: 'Pondok Pesantren Al-Hikmah',
    subdomain: 'alhikmah',
    namaPengelola: 'Ustadz Ahmad Fauzi',
    email: 'admin@alhikmah.sch.id',
    noWhatsapp: '081298765432',
    packageType: 'TAHUNAN',
    basePrice: 1500000,
    uniqueCode: 284,
    amount: 1500284,
    status: 'PENDING_PAYMENT',
    vaNumber: '7192837465',
    vaBank: 'Bank Syariah Indonesia (BSI)',
    accountHolder: 'YAYASAN DARUL RAHMAN SUMBERSARI / KING DIGITAL DEV',
    qrisImageUrl: 'https://i.ibb.co/vzkmT9r/qris-sample.png',
    qrisString: '00020101021226580016ID.CO.KINGDIGITAL.WWW0118936009928192837465520458145303360540715000005802ID5915KING_DIGITAL_DEV6007BANDUNG61054011562070703A0163041029',
    waConfirmationNumber: '+62 851-2373-4342',
    expiredAt: new Date(Date.now() + 86400000).toISOString(),
  });

  const [copiedVA, setCopiedVA] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);
  
  // Upload Bukti Pembayaran State
  const [proofFile, setProofFile] = useState(null);
  const [proofBase64, setProofBase64] = useState('');
  const [senderName, setSenderName] = useState('');
  const [proofNote, setProofNote] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isProofUploaded, setIsProofUploaded] = useState(order?.status === 'WAITING_VERIFICATION' || !!order?.proofUrl);

  // Timer Countdown State (24 jam = 86400 detik)
  const [timeLeft, setTimeLeft] = useState(() => {
    if (order?.expiredAt) {
      const diff = Math.floor((new Date(order.expiredAt).getTime() - Date.now()) / 1000);
      return diff > 0 ? diff : 86400;
    }
    return 86400;
  });

  // Toast notification
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  // Sinkronisasi data order & master config
  useEffect(() => {
    if (orderData) {
      setOrder(orderData);
      if (orderData.status === 'WAITING_VERIFICATION' || orderData.proofUrl) {
        setIsProofUploaded(true);
      }
    }
    
    // Sinkronisasi info rekening & QRIS dari master config
    const loadMasterConfig = async () => {
      try {
        const res = await getMitraConfig();
        if (res.data?.success && res.data?.data) {
          const cfg = res.data.data;
          setOrder(prev => ({
            ...prev,
            vaBank: prev.vaBank || cfg.bankName,
            vaNumber: prev.vaNumber || cfg.bankAccountNo,
            accountHolder: prev.accountHolder || cfg.bankAccountHolder,
            qrisImageUrl: prev.qrisImageUrl || cfg.qrisImageUrl,
            qrisString: prev.qrisString || cfg.qrisString,
            waConfirmationNumber: prev.waConfirmationNumber || cfg.waConfirmationNumber,
          }));
        }
      } catch (e) {}
    };
    loadMasterConfig();
  }, [orderData]);

  // Format Waktu Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Real-Time Polling Status Pesanan & Webhook
  useEffect(() => {
    if (provisionResult) return;

    const interval = setInterval(async () => {
      try {
        const res = await getMitraOrderStatus(order.orderId);
        if (res.data?.success) {
          const ord = res.data.data;
          if (ord.status === 'PAID' || ord.status === 'ACTIVE' || ord.isProvisioned) {
            setProvisionResult(ord.activeData || ord);
            setToast({
              isOpen: true,
              type: 'success',
              title: 'Pembayaran Dikonfirmasi!',
              message: `Platform untuk ${order.namaPondok} telah aktif secara otomatis.`
            });
          } else if (ord.status === 'WAITING_VERIFICATION') {
            setIsProofUploaded(true);
            setOrder(prev => ({ ...prev, status: 'WAITING_VERIFICATION', proofUrl: ord.proofUrl }));
          }
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(interval);
  }, [order.orderId, provisionResult]);

  // Handler Copy to Clipboard
  const handleCopy = (text, type) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'va') {
      setCopiedVA(true);
      setTimeout(() => setCopiedVA(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else if (type === 'orderId') {
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2000);
    }
  };

  // Handler Berkas Bukti Transfer
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressedB64 = await compressImage(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
      setProofFile(file);
      setProofBase64(compressedB64);
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Format Tidak Didukung',
        message: err.message || 'Gagal memproses gambar bukti transfer.'
      });
    }
  };

  // Handler Kirim Bukti Transfer ke Backend & Cloudflare R2
  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!proofBase64) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Berkas Kosong',
        message: 'Silakan pilih foto atau screenshot bukti transfer Anda terlebih dahulu.'
      });
      return;
    }

    try {
      setIsUploadingProof(true);
      const res = await uploadMitraPaymentProof({
        orderId: order.orderId,
        proofBase64,
        proofNote,
        senderName
      });

      if (res.data?.success) {
        setIsProofUploaded(true);
        setOrder(prev => ({
          ...prev,
          status: 'WAITING_VERIFICATION',
          proofUrl: res.data.data?.proofUrl || proofBase64
        }));
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Bukti Transfer Terkirim!',
          message: 'Bukti transfer berhasil disimpan. Tim admin akan memverifikasi dan mengaktifkan platform Anda.'
        });
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Mengunggah',
        message: err.response?.data?.message || err.message || 'Terjadi gangguan saat menyimpan bukti transfer.'
      });
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Handler WhatsApp Fast Confirmation
  const handleWhatsappConfirm = () => {
    const rawNumber = order.waConfirmationNumber || '+62 851-2373-4342';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const message = `Halo Tim SiPesand Mitra,\n\nSaya telah mendaftar dan melakukan transfer pembayaran lisensi platform SiPesand:\n\n• Order ID: ${order.orderId}\n• Nama Pondok: ${order.namaPondok}\n• Subdomain: ${order.subdomain}.sipesand.web.id\n• Paket: ${order.packageType === 'LIFETIME' ? 'Lifetime Selamanya' : 'Tahunan'}\n• Total Transfer: Rp ${order.amount?.toLocaleString('id-ID')}\n• Pengelola: ${order.namaPengelola} (${order.noWhatsapp})\n\nMohon bantu verifikasi dan aktivasi instans pesantren kami. Terima kasih!`;
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Handler Simulasi Webhook Pembayaran Berhasil (Testing Instant)
  const handleSimulatePayment = async () => {
    try {
      setSimulating(true);
      const res = await simulatePaymentSuccess(order.orderId);
      if (res.data?.success) {
        setProvisionResult(res.data.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Pembayaran Diverifikasi!',
          message: `Auto-provisioning database ${order.subdomain} dan akun Super Admin berhasil.`
        });
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Simulasi Gagal',
        message: err.response?.data?.message || 'Terjadi kesalahan sistem saat memproses simulasi.'
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleManualCheck = async () => {
    try {
      setChecking(true);
      const res = await getMitraOrderStatus(order.orderId);
      if (res.data?.success && (res.data.data?.status === 'PAID' || res.data.data?.status === 'ACTIVE' || res.data.isProvisioned)) {
        setProvisionResult(res.data.data?.activeData || res.data.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Status: Lunas & Aktif',
          message: 'Instans pesantren Anda telah siap digunakan!'
        });
      } else if (res.data?.data?.status === 'WAITING_VERIFICATION') {
        setIsProofUploaded(true);
        setToast({
          isOpen: true,
          type: 'info',
          title: 'Menunggu Verifikasi',
          message: 'Bukti transfer Anda telah diterima dan dalam proses verifikasi tim admin.'
        });
      } else {
        setToast({
          isOpen: true,
          type: 'info',
          title: 'Menunggu Pembayaran',
          message: 'Pembayaran belum terdeteksi. Silakan selesaikan transfer atau unggah bukti pembayaran.'
        });
      }
    } catch (err) {
      setToast({
        isOpen: true,
        type: 'error',
        title: 'Gagal Cek Status',
        message: 'Tidak dapat menghubungi server payment gateway.'
      });
    } finally {
      setChecking(false);
    }
  };

  // =========================================================================
  // TAMPILAN 1: SUKSES AKTIVASI & KREDENSIAL TENANT TER-PROVISIONING
  // =========================================================================
  if (provisionResult) {
    const tenantDomain = `${order.subdomain}.sipesand.web.id`;
    const tempPass = provisionResult.tempPassword || 'Pesand-2026!';
    const adminUser = provisionResult.adminUsername || 'admin';
    const licenseKey = provisionResult.licenseKey || `KGD-${order.subdomain.toUpperCase()}-VERIFIED-2026`;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300 font-sans text-xs">
        
        {/* Banner Sukses Solid */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <span className="px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">
            Auto-Provisioning Berhasil • Instans Aktif
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Selamat Datang di SiPesand, {order.namaPondok}!
          </h2>
          <p className="text-slate-300 text-xs max-w-lg mx-auto leading-relaxed">
            Database instans privat mandiri untuk <strong>{tenantDomain}</strong> telah selesai di-deploy. Akun Super Admin lembaga Anda telah aktif dan siap digunakan sekarang.
          </p>
        </div>

        {/* Bento Kredensial Akses Super Admin */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-700" />
              <span className="font-black text-slate-900 text-sm">Kredensial Login Super Admin Anda</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#0057FF] text-white px-2.5 py-0.5 rounded-md">
              ROLE: SUPER_ADMIN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Subdomain URL */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tautan Portal Pesantren</span>
              <div className="flex items-center justify-between">
                <a 
                  href={`https://${tenantDomain}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-mono font-bold text-blue-700 text-xs truncate hover:underline flex items-center gap-1"
                >
                  <span>https://{tenantDomain}</span>
                  <ExternalLink className="w-3 h-3 text-blue-500 flex-shrink-0" />
                </a>
                <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            {/* License Key */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">License Key Resmi</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 text-xs truncate">{licenseKey}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              </div>
            </div>

            {/* Default Username */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Username Super Admin</span>
              <span className="font-mono font-bold text-slate-900 text-xs block">{adminUser}</span>
            </div>

            {/* Default Password */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password Sementara</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-rose-600 text-xs">{tempPass}</span>
                <button
                  onClick={() => handleCopy(tempPass, 'pass')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                >
                  {copiedPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPass ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Langkah Pertama:</strong> Buka portal pesantren Anda di <code>https://{tenantDomain}</code>, login menggunakan username <code>{adminUser}</code> dan password di atas, lalu segera ubah password Anda di menu <em>Pengaturan Lembaga & Akun</em>.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href={`https://${tenantDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3.5 bg-[#0057FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer text-center"
            >
              <span>Buka Dashboard Lembaga (https://{tenantDomain})</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onBackToRegister}
              className="px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl transition-colors cursor-pointer"
            >
              Daftar Pesantren Lain
            </button>
          </div>

        </div>

        <AestheticToast
          isOpen={toast.isOpen}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        />

      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 2: HALAMAN INVOICE PAYMENT GATEWAY PROFESIONAL
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans text-xs">
      
      {/* Header Bar Checkout */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#0057FF] text-white rounded-md font-bold text-[10px] tracking-wider uppercase font-mono">
              Invoice #{order.orderId}
            </span>
            <button
              onClick={() => handleCopy(order.orderId, 'orderId')}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              title="Salin Order ID"
            >
              {copiedOrderId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
            <span className="text-slate-400 font-mono">• {order.packageType === 'LIFETIME' ? 'Lisensi Lifetime Permanen' : 'Lisensi Tahunan'}</span>
            
            {/* Status Badge */}
            {order.status === 'WAITING_VERIFICATION' || isProofUploaded ? (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span>Menunggu Verifikasi Admin</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Menunggu Pembayaran</span>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-black text-white">{order.namaPondok}</h2>
          <p className="text-slate-300 text-xs">
            Subdomain yang dipesan: <strong className="text-blue-400 font-mono">https://{order.subdomain}.sipesand.web.id</strong>
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-slate-800/90 border border-slate-700 px-4 py-3 rounded-2xl text-right flex items-center gap-3 flex-shrink-0">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sisa Waktu Pembayaran</span>
            <span className="font-mono font-black text-base sm:text-lg text-amber-400 tracking-wider">
              {formatCountdown(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* HIGHLIGHT NOMINAL TOTAL DENGAN KODE UNIK */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 border border-blue-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] uppercase font-bold tracking-wider text-blue-300">
            Total Nominal Transfer (Wajib Sesuai Hingga 3 Digit Terakhir)
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-2xl sm:text-3xl text-white tracking-tight">
              Rp {order.amount?.toLocaleString('id-ID')}
            </span>
            <button
              onClick={() => handleCopy(order.amount?.toString(), 'amount')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-bold text-white text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedAmount ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedAmount ? 'Tersalin' : 'Salin Nominal'}</span>
            </button>
          </div>
          <p className="text-[11px] text-blue-200">
            {order.uniqueCode ? (
              <span>Termasuk <strong>kode unik transfer Rp {order.uniqueCode}</strong> untuk mempermudah verifikasi instan.</span>
            ) : (
              <span>Harap transfer tepat sesuai jumlah nominal di atas.</span>
            )}
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          <button
            onClick={handleWhatsappConfirm}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi Cepat via WA</span>
          </button>
        </div>
      </div>

      {/* Bento 2 Kolom: Rekening Transfer Bank & QRIS Dinamis */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Kolom Kiri (6/12): Transfer Bank / Virtual Account */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">Metode 1: Transfer Bank / Virtual Account</span>
              <CreditCard className="w-4 h-4 text-[#0057FF]" />
            </div>
            <p className="text-slate-500 text-[11px]">
              Transfer dari ATM, Internet Banking, atau Mobile Banking (BSI, BCA, Mandiri, BRI, dll).
            </p>
          </div>

          {/* Card Info Rekening */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                {order.vaBank || 'Bank Syariah Indonesia (BSI)'}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-black text-base sm:text-xl text-blue-700 tracking-wider">
                  {order.vaNumber || '7192837465'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.vaNumber || '7192837465', 'va')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-all text-[11px] cursor-pointer"
                >
                  {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVA ? 'Tersalin' : 'Salin Rekening'}</span>
                </button>
              </div>
              <span className="text-[11px] font-semibold text-slate-600 mt-1 block">
                a.n {order.accountHolder || 'YAYASAN DARUL RAHMAN SUMBERSARI / KING DIGITAL DEV'}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
              <div>1. Masukkan nomor rekening tujuan di atas.</div>
              <div>2. Masukkan nominal transfer tepat: <strong>Rp {order.amount?.toLocaleString('id-ID')}</strong>.</div>
              <div>3. Simpan struk/tangkapan layar bukti transfer dan unggah pada kolom di bawah.</div>
            </div>
          </div>

          {/* Petunjuk WhatsApp */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <PhoneCall className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
              <span>Butuh konfirmasi cepat?</span>
            </div>
            <button
              onClick={handleWhatsappConfirm}
              className="font-bold text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>Hubungi CS</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Kolom Kanan (6/12): QRIS Dinamis */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 text-sm">Metode 2: QRIS Nasional (Semua Bank & E-Wallet)</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px] rounded-md">
                Bebas Biaya Admin
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Scan menggunakan BCA, Mandiri Livin, BRImo, BSI Mobile, GoPay, OVO, Dana, LinkAja, atau ShopeePay.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-2">
            {order.qrisImageUrl ? (
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden">
                <img 
                  src={order.qrisImageUrl} 
                  alt="QRIS Pembayaran SiPesand" 
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
                <QRCodeSVG value={order.qrisString || '00020101021226580016ID.CO.KINGDIGITAL.WWW'} size={176} level="M" />
              </div>
            )}
            <div className="text-[10px] font-mono text-slate-500">
              NMID: <strong className="text-slate-800">ID1020039281928</strong> • SiPesand King Digital
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center">
            Pindai kode QRIS di atas melalui aplikasi perbankan atau dompet digital Anda.
          </div>
        </div>

      </div>

      {/* FORMULIR UNGGAH BUKTI TRANSFER KE CLOUDFLARE R2 */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#0057FF]" />
            <span className="font-black text-slate-900 text-sm">Unggah Bukti Pembayaran (Cloudflare R2 Object Storage)</span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
            Fast Track Verification
          </span>
        </div>

        {isProofUploaded ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-xs">Bukti Transfer Berhasil Diterima!</h4>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Bukti pembayaran Anda telah tersimpan aman di Cloudflare R2 dan sedang diverifikasi oleh tim admin mitra.
                </p>
              </div>
            </div>
            {order.proofUrl && (
              <a
                href={order.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-white border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center gap-1.5 flex-shrink-0 shadow-xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lihat Bukti Transfer</span>
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleUploadProof} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening Pengirim (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: K.H. Ahmad Fauzi"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Catatan / Bank Pengirim (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Transfer via BSI Mobile"
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-blue-600 focus:outline-none bg-slate-50 focus:bg-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Foto Bukti Transfer / Screenshot *</label>
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50 hover:bg-slate-100/70 transition-colors relative cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {proofBase64 ? (
                  <div className="flex items-center justify-center gap-3">
                    <img 
                      src={proofBase64} 
                      alt="Preview Bukti" 
                      className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-xs"
                    />
                    <div className="text-left">
                      <span className="font-bold text-slate-900 text-xs block">{proofFile?.name || 'bukti_transfer.jpg'}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold block">Siap diunggah ke Cloudflare R2</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="font-bold text-slate-700 text-xs">Klik untuk memilih foto struk / tangkapan layar bukti transfer</div>
                    <p className="text-[10px] text-slate-400">Format: JPG, PNG, WebP (otomatis dikompresi sebelum disimpan)</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploadingProof || !proofBase64}
              className="w-full py-3 bg-[#0057FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs cursor-pointer"
            >
              {isUploadingProof ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengunggah ke Cloudflare R2...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Kirim Bukti Pembayaran</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Action Buttons: Status Checker, WhatsApp Confirm, & Testing Simulation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleManualCheck}
            disabled={checking}
            className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-blue-400' : ''}`} />
            <span>{checking ? 'Memeriksa Status Pembayaran...' : 'Cek Status Pembayaran (Auto-Detect)'}</span>
          </button>

          <button
            onClick={handleWhatsappConfirm}
            className="py-3 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Konfirmasi via WhatsApp</span>
          </button>

          <button
            onClick={onBackToRegister}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-xs cursor-pointer"
          >
            Kembali
          </button>
        </div>

        {/* Demo Fast Verification Bar for testing */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Mode Simulasi Pengujian (Demo):</span>
          <button
            onClick={handleSimulatePayment}
            disabled={simulating}
            className="font-bold text-blue-600 hover:underline cursor-pointer disabled:opacity-50"
          >
            {simulating ? 'Memproses Simulasi...' : 'Simulasikan Pembayaran Lunas (Webhook Test)'}
          </button>
        </div>
      </div>

      {/* Aesthetic Toast Notification */}
      <AestheticToast
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
