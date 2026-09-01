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
  Lock 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getMitraOrderStatus, simulatePaymentSuccess } from '../services/api';
import AestheticToast from './AestheticToast';

export default function PaymentCheckout({ orderData, onBackToRegister, onGoToTenant }) {
  const [copiedVA, setCopiedVA] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [provisionResult, setProvisionResult] = useState(null);
  
  // Timer Countdown State (24 jam = 86400 detik)
  const [timeLeft, setTimeLeft] = useState(86400);

  // Toast notification
  const [toast, setToast] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });

  const order = orderData || {
    orderId: 'KGD-ORD-SAMPLE-1029',
    namaPondok: 'Pondok Pesantren Al-Hikmah',
    subdomain: 'alhikmah',
    namaPengelola: 'Ustadz Ahmad Fauzi',
    email: 'admin@alhikmah.sch.id',
    noWhatsapp: '081298765432',
    packageType: 'TAHUNAN',
    amount: 1500000,
    vaNumber: '8809192837465',
    vaBank: 'Bank Syariah Indonesia (BSI)',
    qrisString: '00020101021226580016ID.CO.KINGDIGITAL.WWW0118936009928192837465520458145303360540715000005802ID5915KING_DIGITAL_DEV6007BANDUNG61054011562070703A0163041029',
    expiredAt: new Date(Date.now() + 86400000).toISOString(),
  };

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

  // Real-Time Polling Status Webhook
  useEffect(() => {
    if (provisionResult) return;

    const interval = setInterval(async () => {
      try {
        const res = await getMitraOrderStatus(order.orderId);
        if (res.data.success && (res.data.data?.status === 'PAID' || res.data.isProvisioned)) {
          setProvisionResult(res.data.data?.activeData || res.data.data);
          setToast({
            isOpen: true,
            type: 'success',
            title: 'Pembayaran Diterima',
            message: `Platform untuk ${order.namaPondok} telah aktif secara otomatis.`
          });
        }
      } catch (e) {
        // silent polling error
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order.orderId, provisionResult]);

  // Handler Copy to Clipboard
  const handleCopy = (text, type) => {
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
    }
  };

  // Handler Simulasi Webhook Pembayaran Berhasil (Testing Instant)
  const handleSimulatePayment = async () => {
    try {
      setSimulating(true);
      const res = await simulatePaymentSuccess(order.orderId);
      if (res.data.success) {
        setProvisionResult(res.data.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Pembayaran Berhasil Diverifikasi',
          message: `Auto-provisioning database ${order.subdomain} dan email kredensial berhasil diproses.`
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
      if (res.data.success && (res.data.data?.status === 'PAID' || res.data.isProvisioned)) {
        setProvisionResult(res.data.data?.activeData || res.data.data);
        setToast({
          isOpen: true,
          type: 'success',
          title: 'Status: Lunas & Aktif',
          message: 'Instans pesantren Anda telah siap digunakan!'
        });
      } else {
        setToast({
          isOpen: true,
          type: 'info',
          title: 'Menunggu Pembayaran',
          message: 'Pembayaran belum terdeteksi. Silakan selesaikan transfer atau scan QRIS.'
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
    const licenseKey = provisionResult.licenseKey || `KGD-${order.subdomain.toUpperCase()}-7788-9900`;

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in zoom-in-95 duration-300 font-sans text-xs">
        
        {/* Banner Sukses Solid */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="px-3 py-1 bg-emerald-900/60 text-emerald-300 border border-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wider inline-block">
            Auto-Provisioning Berhasil • Instans Aktif
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Selamat Datang di SiPesand, {order.namaPondok}!
          </h2>
          <p className="text-slate-300 text-xs max-w-lg mx-auto leading-relaxed">
            Database instans terisolasi untuk <strong>{tenantDomain}</strong> telah selesai dibuat otomatis dan email kredensial resmi telah dikirim ke <strong>{order.email}</strong>.
          </p>
        </div>

        {/* Bento Kredensial Akses Super Admin */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-700" />
              <span className="font-bold text-slate-900 text-sm">Kredensial Login Super Admin Baru</span>
            </div>
            <span className="text-[10px] font-mono font-bold bg-[#1E3A8A] text-white px-2 py-0.5 rounded">
              ROLE: SUPER_ADMIN
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Subdomain URL */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tautan Portal Pesantren</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-blue-700 text-xs truncate">https://{tenantDomain}</span>
                <Globe className="w-4 h-4 text-blue-500 flex-shrink-0" />
              </div>
            </div>

            {/* License Key */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">License Key Resmi</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-slate-800 text-xs truncate">{licenseKey}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              </div>
            </div>

            {/* Default Username */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Username Super Admin</span>
              <span className="font-mono font-bold text-slate-900 text-xs block">{adminUser}</span>
            </div>

            {/* Default Password */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Password Sementara</span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-rose-600 text-xs">{tempPass}</span>
                <button
                  onClick={() => handleCopy(tempPass, 'pass')}
                  className="px-2 py-0.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 shadow-xs"
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
              <strong>Langkah Keamanan Pertama:</strong> Silakan login menggunakan username <code>{adminUser}</code> dan password di atas, lalu segera ubah password Anda di menu <em>Pengaturan Lembaga & Akun</em>.
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => onGoToTenant ? onGoToTenant(order.subdomain) : window.location.reload()}
              className="flex-1 py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
            >
              <span>Masuk ke Dashboard Pesantren ({order.subdomain})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onBackToRegister}
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold rounded-xl transition-colors"
            >
              Daftar Mitra Lain
            </button>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // TAMPILAN 2: HALAMAN INVOICE PAYMENT GATEWAY (QRIS + VIRTUAL ACCOUNT)
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 font-sans text-xs">
      
      {/* Header Bar Checkout */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#1E3A8A] text-white rounded-md font-bold text-[10px] tracking-wider uppercase">
              Invoice #{order.orderId}
            </span>
            <span className="text-slate-400 font-mono">• {order.packageType === 'LIFETIME' ? 'Paket Lifetime' : 'Paket Tahunan'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white">{order.namaPondok}</h2>
          <p className="text-slate-400 text-xs">Subdomain yang dipesan: <strong className="text-blue-400 font-mono">{order.subdomain}.sipesand.web.id</strong></p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-slate-800 border border-slate-700 px-4 py-3 rounded-2xl text-right flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Sisa Waktu Pembayaran</span>
            <span className="font-mono font-bold text-base sm:text-lg text-amber-400 tracking-wider">
              {formatCountdown(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {/* Bento 2 Kolom: QRIS & Virtual Account */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        
        {/* Kolom Kiri (6/12): QRIS Dinamis */}
        <div className="md:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">Metode 1: QRIS Dinamis</span>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[9px] rounded-md">
                Verifikasi Otomatis
              </span>
            </div>
            <p className="text-slate-500 text-[11px]">
              Scan menggunakan BCA, Mandiri Livin, BRImo, BSI, GoPay, OVO, Dana, atau ShopeePay.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs">
              <QRCodeSVG value={order.qrisString} size={176} level="M" />
            </div>
            <div className="text-[10px] font-mono text-slate-500">
              NMID: <strong className="text-slate-800">ID1020039281928</strong> • King Digital Dev
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center">
            QR Code dibuat khusus untuk tagihan ini dan akan otomatis memicu webhook setelah discan.
          </div>
        </div>

        {/* Kolom Kanan (6/12): Transfer Virtual Account & Rincian Biaya */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 text-sm">Metode 2: Virtual Account (BSI)</span>
              <CreditCard className="w-4 h-4 text-blue-700" />
            </div>
            <p className="text-slate-500 text-[11px]">
              Transfer dari ATM atau Mobile Banking bank syariah manapun.
            </p>
          </div>

          {/* Card Info VA */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Virtual Account BSI</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-black text-base sm:text-lg text-blue-700 tracking-wider">
                  {order.vaNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.vaNumber, 'va')}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 shadow-xs transition-all text-[11px]"
                >
                  {copiedVA ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedVA ? 'Tersalin' : 'Salin VA'}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">{order.vaBank} a.n KING DIGITAL DEV</span>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Tagihan Lisensi</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono font-black text-lg text-slate-900">
                  Rp {parseFloat(order.amount).toLocaleString('id-ID')}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(order.amount.toString(), 'amount')}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-slate-600 text-[10px] shadow-xs"
                >
                  {copiedAmount ? 'Tersalin' : 'Salin Nominal'}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: Manual Refresh & Demo Simulation */}
          <div className="space-y-2 pt-2">
            
            {/* Tombol Simulasi Pembayaran Berhasil (Webhook Test) */}
            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{simulating ? 'Memproses Webhook & Auto-Provisioning...' : 'Simulasikan Pembayaran Selesai (Demo Webhook)'}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={handleManualCheck}
                disabled={checking}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin text-blue-600' : ''}`} />
                <span>Cek Status Otomatis</span>
              </button>

              <button
                onClick={onBackToRegister}
                className="px-4 py-2.5 text-slate-500 hover:text-slate-800 font-medium text-xs"
              >
                Batal
              </button>
            </div>

          </div>

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
