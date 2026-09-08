import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Clock, 
  Calendar, 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  Building2, 
  UserCheck, 
  Phone, 
  MessageSquare, 
  ExternalLink, 
  BookOpen, 
  Award, 
  TrendingDown, 
  TrendingUp,
  RefreshCw,
  Share2,
  Copy,
  Check,
  ShieldAlert,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getPublicSantriData } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import { getCurrentTenant } from '../services/localDatabase';

export default function SantriDigitalCardPage({ initialNis = '', tenant = null, onBackToHome, onOpenPortalWali }) {
  const { settings, isNfcEnabled, activeTenantSubdomain } = useSettings();
  const resolvedTenant = tenant || activeTenantSubdomain || getCurrentTenant();
  
  // Ambil NIS dari parameter URL atau props
  const [nisParam, setNisParam] = useState(() => {
    if (initialNis) return initialNis;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('nis') || params.get('id') || params.get('q');
      if (q) return q;

      // Cek dari pathname jika ada /santri/:nis
      const parts = window.location.pathname.split('/').filter(Boolean);
      if (parts[0] === 'santri' && parts[1]) {
        return decodeURIComponent(parts[1]);
      }
    }
    return '';
  });

  const [loading, setLoading] = useState(true);
  const [santriData, setSantriData] = useState(null);
  const [portalRawData, setPortalRawData] = useState(null);
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date());

  const logoPondok = settings.LOGO_PONDOK_URL;
  const namaLembaga = settings.NAMA_LEMBAGA || 'SIPESAND (SISTEM INFORMASI TERPADU PESANTREN DAN DIGITAL)';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'SISTEM MANAJEMEN PESANTREN CERDAS & TERPADU';
  const kepalaPondok = settings.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const ttdKepala = settings.TTD_KEPALA_URL;
  const stempelUrl = settings.STEMPEL_URL;
  const whatsappKamtib = settings.WHATSAPP_CENTER || '085123734342';

  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async (queryNis) => {
    const q = (queryNis || '').trim();
    if (!q) {
      setSantriData(null);
      setPortalRawData(null);
      setLoading(false);
      setErrorMessage('Silakan scan QR Code KTSD pada kartu santri atau masukkan NIS santri.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await getPublicSantriData(q, resolvedTenant);
      if (res && res.data && res.data.success && res.data.data) {
        const payload = res.data.data;
        setPortalRawData(payload);
        setSantriData(payload.santri || payload);
        setLastSyncTime(new Date());
        return;
      } else {
        setSantriData(null);
        setPortalRawData(null);
        setErrorMessage(`Data santri "${q}" tidak ditemukan di ${namaLembaga}. Pastikan santri terdaftar dan aktif.`);
      }
    } catch (err) {
      console.warn("Gagal memuat data santri via API:", err);
      setSantriData(null);
      setPortalRawData(null);
      setErrorMessage(`Data santri "${q}" tidak ditemukan di ${namaLembaga}.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(nisParam);
  }, [nisParam]);

  // Evaluasi Status Izin Santri Real-Time
  const permits = portalRawData?.permits || santriData?.permits || [];
  const activePermit = permits.find(p => p.status === 'ACTIVE' || p.status === 'APPROVED');
  const now = new Date();

  let permitState = {
    code: 'INSIDE',
    title: 'DI DALAM ASRAMA PONDOK',
    subtitle: 'Santri Tidak Sedang Izin Keluar',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500 animate-pulse',
    description: 'Santri tercatat berada di dalam lingkungan pesantren. Apabila berada di luar lingkungan tanpa surat izin resmi, santri dinyatakan melakukan pelanggaran kamtib.',
    isAllowedOutside: false,
  };

  if (activePermit) {
    const isLate = new Date(activePermit.returnTime) < now;
    if (isLate) {
      permitState = {
        code: 'OVERDUE',
        title: 'TERLAMBAT KEMBALI (OVERDUE)',
        subtitle: 'Batas Waktu Izin Telah Terlewati',
        badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        dotClass: 'bg-rose-600 animate-ping',
        description: `Santri memiliki izin keperluan "${activePermit.reason}", namun batas waktu kembali (${new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB) telah terlewati. Santri wajib segera melapor ke Pos Kamtib.`,
        isAllowedOutside: false,
      };
    } else {
      permitState = {
        code: 'PERMIT_ACTIVE',
        title: 'SEDANG IZIN KELUAR RESMI',
        subtitle: `Keperluan: ${activePermit.reason || activePermit.type}`,
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        dotClass: 'bg-blue-500 animate-pulse',
        description: `Santri memiliki surat izin resmi keluar hingga ${new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB disetujui oleh ${activePermit.approvedBy || 'Pos Kamtib'}.`,
        isAllowedOutside: true,
      };
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleWaContact = (phone, customMsg) => {
    let p = (phone || '').replace(/\D/g, '');
    if (p.startsWith('0')) p = '62' + p.slice(1);
    window.open(`https://wa.me/${p}?text=${encodeURIComponent(customMsg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white font-sans">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-base font-bold tracking-tight">Memverifikasi Kartu Tanda Santri Digital...</h2>
        <p className="text-xs text-slate-400 mt-1">Menghubungkan ke basis data SiPesand Cloud...</p>
      </div>
    );
  }

  if (!santriData) {
    return (
      <div className="min-h-screen bg-[#090D16] flex flex-col items-center justify-center p-6 text-white font-sans text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-lg font-black tracking-tight text-white">Data Santri Tidak Ditemukan</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {errorMessage || `Kartu Tanda Santri Digital dengan NIS "${nisParam}" tidak terdaftar pada basis data ${namaLembaga}.`}
          </p>
        </div>
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onBackToHome || (() => window.history.back())}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>
      </div>
    );
  }

  const s = santriData;
  const pocketTxs = portalRawData?.pocketTxs || [];
  const academics = portalRawData?.academics || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans antialiased pb-16">
      
      {/* Top Fixed Header Nav */}
      <header className="sticky top-0 z-40 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between max-w-xl mx-auto">
        <button
          onClick={onBackToHome || (() => window.history.back())}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-emerald-400 tracking-wider">
            SIPESAND VERIFIED
          </span>
        </div>

        <button
          onClick={handleCopyLink}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Bagikan Tautan KTSD"
        >
          {copiedUrl ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-4 space-y-4">
        
        {/* Verification Banner */}
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-3.5 flex items-center gap-3 shadow-lg">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-black text-white uppercase tracking-wide truncate">
                Kartu Tanda Santri Digital (KTSD)
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                SAH
              </span>
            </div>
            <p className="text-[10px] text-slate-300 truncate">
              {namaLembaga}
            </p>
          </div>
          <button 
            onClick={() => loadData(nisParam)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sinkronisasi Data Real-Time"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Status Keberadaan / Perizinan Santri (Pos Kamtib) */}
        <div className={`rounded-2xl p-4 border transition-all ${
          permitState.code === 'OVERDUE'
            ? 'bg-rose-950/40 border-rose-500/50 shadow-rose-900/20 shadow-lg'
            : permitState.code === 'PERMIT_ACTIVE'
            ? 'bg-blue-950/40 border-blue-500/50 shadow-blue-900/20 shadow-lg'
            : 'bg-emerald-950/30 border-emerald-500/40 shadow-emerald-900/20 shadow-lg'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${permitState.dotClass}`} />
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">
                Status Keberadaan Real-Time
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${permitState.badgeClass}`}>
              {permitState.title}
            </span>
          </div>

          <p className="text-xs font-bold text-white mb-1">
            {permitState.subtitle}
          </p>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            {permitState.description}
          </p>

          {activePermit && (
            <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[9px]">Berangkat:</span>
                <span className="font-bold text-white">
                  {new Date(activePermit.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
              <div className="bg-black/30 p-2 rounded-xl border border-white/5">
                <span className="text-slate-400 block text-[9px]">Batas Kembali:</span>
                <span className={`font-bold ${permitState.code === 'OVERDUE' ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Pratinjau KTSD Digital Interaktif */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Smart Card KTSD RFID</span>
            </div>
            <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-[10px] font-bold">
              <button
                onClick={() => setActiveSide('front')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSide === 'front' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Muka Depan
              </button>
              <button
                onClick={() => setActiveSide('back')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeSide === 'back' ? 'bg-amber-400 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ketentuan Belakang
              </button>
            </div>
          </div>

          {/* Tampak Kartu Muka Depan */}
          {activeSide === 'front' ? (
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022c22] p-4 text-white shadow-2xl border border-emerald-400/40">
              
              {/* Pattern Hiasan */}
              <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-emerald-300/10 pointer-events-none" />
              <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-amber-400/10 pointer-events-none" />

              {/* Header Kartu */}
              <div className="flex items-center justify-between border-b border-emerald-300/20 pb-2 mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  {logoPondok ? (
                    <img src={logoPondok} alt="Logo" className="w-7 h-7 object-contain bg-white rounded-md p-0.5" />
                  ) : (
                    <div className="w-7 h-7 rounded-md bg-white/10 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-amber-300" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-[10px] font-black uppercase text-amber-300 tracking-wide leading-tight truncate max-w-[200px]">
                      {namaLembaga}
                    </h2>
                    <p className="text-[7px] text-emerald-100 uppercase font-semibold">
                      KARTU TANDA SANTRI RESMI
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/30 border border-emerald-300/20 text-[7.5px] font-mono text-emerald-200">
                  <Radio className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                  <span>{s.nfcUid || 'RFID ACTIVE'}</span>
                </div>
              </div>

              {/* Data & Foto Santri */}
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-20 h-24 rounded-xl bg-slate-900/60 p-1 border border-amber-400/50 shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {s.foto ? (
                    <img src={s.foto} alt={s.nama} className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-amber-300 font-black text-lg mx-auto mb-1">
                        {(s.nama || 'S').charAt(0)}
                      </div>
                      <span className="text-[7px] text-emerald-200 font-mono">FOTO KTSD</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-0.5 text-left">
                  <h3 className="text-sm font-black text-white truncate">
                    {s.nama || 'Nama Santri'}
                  </h3>
                  <div className="text-[10.5px] font-mono font-bold text-amber-300">
                    NIS: {s.nis || '-'}
                  </div>
                  <div className="text-[9px] text-emerald-100 space-y-0.5 pt-0.5">
                    <div>Kelas: <strong className="text-white">{s.kelas || '-'}</strong></div>
                    <div>Kamar: <strong className="text-white">{s.kamar || '-'}</strong></div>
                    <div className="truncate text-emerald-200 text-[8.5px]">Alamat: {s.alamat || '-'}</div>
                  </div>
                </div>

                <div className="bg-white p-1 rounded-xl shadow-md border border-emerald-300 flex-shrink-0 flex flex-col items-center">
                  <QRCodeSVG 
                    value={typeof window !== 'undefined' ? window.location.href : `https://sipesand.web.id/santri/${s.nis}`} 
                    size={52} 
                    level="M" 
                  />
                  <span className="text-[6px] font-mono font-bold text-slate-900 mt-0.5">VERIFIED</span>
                </div>
              </div>

              {/* Footer Kartu */}
              <div className="border-t border-emerald-300/20 pt-1.5 mt-3 flex items-center justify-between text-[7.5px] text-emerald-200 font-mono relative z-10">
                <span>STATUS: AKTIF & TERVERIFIKASI</span>
                <span>KTSD GEN-2026</span>
              </div>
            </div>
          ) : (
            /* Tampak Belakang */
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#064E3B] via-[#047857] to-[#022c22] p-4 text-white shadow-2xl border border-emerald-400/40">
              <div className="border-b border-emerald-300/20 pb-1.5 mb-2.5">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  KETENTUAN PEMEGANG KARTU SANTRI
                </h4>
              </div>

              <div className="space-y-1.5 text-[8.5px] text-emerald-100 leading-relaxed mb-4">
                <p>1. Kartu ini adalah tanda pengenal sah santri {namaLembaga}.</p>
                <p>2. Wajib dibawa saat perizinan keluar, presensi pos kamtib, dan transaksi saku di kantin.</p>
                <p>3. Dilarang memindahtangankan kartu kepada santri lain.</p>
              </div>

              <div className="border-t border-emerald-300/20 pt-2 flex items-end justify-between">
                <div className="text-[7.5px] text-emerald-200">
                  <span className="block font-bold">Diterbitkan oleh:</span>
                  <span>Sekretariat & Biro Kamtib Pondok</span>
                </div>

                <div className="text-center relative">
                  {stempelUrl && (
                    <img src={stempelUrl} alt="Cap" className="w-10 h-10 object-contain absolute -top-4 -left-4 opacity-80 pointer-events-none" />
                  )}
                  <div className="h-6 flex items-center justify-center">
                    {ttdKepala ? (
                      <img src={ttdKepala} alt="TTD" className="max-h-6 object-contain" />
                    ) : (
                      <div className="text-[7px] italic text-amber-200 font-serif">ttd resmi</div>
                    )}
                  </div>
                  <div className="border-t border-emerald-300/40 pt-0.5 font-bold text-[7.5px] text-white">
                    {kepalaPondok}
                  </div>
                  <div className="text-[6.5px] text-emerald-200">Pengasuh Pondok</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dompet Saku Digital & Mutasi Santri */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white">Saldo Uang Saku Digital (Cashless)</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              AKTIF
            </span>
          </div>

          <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between mb-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Sisa Saldo Saku Santri:</span>
              <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
                Rp {(s.saldo_saku || 0).toLocaleString('id-ID')}
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-400">
              <span className="block">Limit Belanja Harian:</span>
              <span className="font-bold text-white font-mono">Rp 30.000 / hari</span>
            </div>
          </div>

          {/* 3 Transaksi Saku Terakhir */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Riwayat Transaksi Terakhir
            </h4>
            {pocketTxs.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2 text-center">Belum ada transaksi saku tercatat.</p>
            ) : (
              <div className="space-y-2">
                {pocketTxs.slice(0, 3).map((tx) => (
                  <div key={tx.id || tx.txCode} className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        tx.type === 'TOPUP' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {tx.type === 'TOPUP' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200 text-[11px] truncate max-w-[190px]">
                          {tx.description || (tx.type === 'TOPUP' ? 'Top-up Saldo' : 'Belanja Kantin')}
                        </div>
                        <div className="text-[9px] text-slate-400">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className={`font-mono font-bold text-xs ${
                      tx.type === 'TOPUP' ? 'text-emerald-400' : 'text-slate-300'
                    }`}>
                      {tx.type === 'TOPUP' ? '+' : '-'}Rp {(tx.amount || 0).toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mutaba'ah & Capaian Prestasi Akademik */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold text-white">Mutaba'ah & Capaian Akademik</h3>
            </div>
            <Award className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2">
            {academics.map((ac) => (
              <div key={ac.id} className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800 flex items-start justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-slate-200 text-[11px]">
                    {ac.subject}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {ac.notes}
                  </div>
                  <div className="text-[8.5px] text-slate-500 font-mono mt-0.5">
                    Tanggal: {ac.date}
                  </div>
                </div>
                <div className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg font-mono font-black text-xs border border-blue-400/30 flex-shrink-0">
                  {ac.score}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => handleWaContact(
              whatsappKamtib, 
              `Assalamu'alaikum Pos Kamtib ${namaLembaga}. Saya mengonfirmasi identitas santri: ${s.nama} (NIS: ${s.nis}). Mohon konfirmasi status perizinan santri.`
            )}
            className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Hubungi Pos Kamtib</span>
          </button>

          {s.noHpWali && (
            <button
              onClick={() => handleWaContact(
                s.noHpWali, 
                `Assalamu'alaikum Bapak/Ibu Wali dari ${s.nama}. Ini adalah konfirmasi mengenai ananda santri ${namaLembaga}.`
              )}
              className="w-full py-3 px-4 bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 rounded-2xl font-bold text-xs text-emerald-300 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <MessageSquare className="w-4 h-4 fill-current text-[#25D366]" />
              <span>Hubungi Wali Santri</span>
            </button>
          )}
        </div>

        {/* Portal Wali Redirect Option */}
        {onOpenPortalWali && (
          <button
            onClick={() => onOpenPortalWali(s.nis || s.nama)}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <span>Buka Portal Pembayaran SPP & Rincian Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Footer */}
        <div className="pt-6 text-center text-slate-500 text-[10px] space-y-1">
          <p>
            Verifikasi resmi diselenggarakan oleh <strong className="text-slate-400">SiPesand Smart Operating System</strong>
          </p>
          <p className="font-mono text-[9px]">
            Sinkronisasi Terakhir: {lastSyncTime.toLocaleTimeString('id-ID')} WIB
          </p>
        </div>

      </main>

    </div>
  );
}
