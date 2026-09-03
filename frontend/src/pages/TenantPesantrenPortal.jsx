import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  ExternalLink,
  Award,
  Users,
  Home,
  AlertTriangle,
  Radio
} from 'lucide-react';
import SantriTrackerModal from '../components/SantriTrackerModal';
import { useSettings } from '../context/SettingsContext';

export default function TenantPesantrenPortal({ 
  onLoginPetugas, 
  onOpenPortalWali, 
  onOpenNfcScanner 
}) {
  const { settings, isNfcEnabled } = useSettings();
  const [quickQuery, setQuickQuery] = useState('');
  const [trackerSantri, setTrackerSantri] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Identitas Resmi Pondok Pesantren
  const namaLembaga = settings?.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const taglineLembaga = settings?.TAGLINE_LEMBAGA || 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an';
  const alamatLembaga = settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur';
  const noTelpLembaga = settings?.NO_TELP || '+62 851-2373-4342';
  const emailLembaga = settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const pengasuhLembaga = settings?.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const logoPondok = settings?.LOGO_PONDOK_URL;

  // Pencarian Cepat Izin Keluar Santri
  const handleSearchSantri = async (queryInput) => {
    const q = (queryInput || quickQuery).trim();
    if (!q) {
      setSearchError('Ketik Nama Santri atau NIS untuk mengecek perizinan');
      return;
    }

    try {
      setLoadingSearch(true);
      setSearchError('');
      
      const res = await fetch(`/api/portal-wali/santri/${encodeURIComponent(q)}`);
      const result = await res.json();
      
      if (result.success && result.data) {
        setTrackerSantri(result.data);
        setIsTrackerOpen(true);
      } else {
        setSearchError(result.message || 'Data santri tidak ditemukan di database pesantren.');
      }
    } catch (err) {
      setSearchError('Koneksi ke database pesantren sedang sibuk.');
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs selection:bg-blue-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. HEADER RESMI PONDOK PESANTREN (WHITE-LABEL TENANT)                     */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Identitas Lembaga */}
          <div className="flex items-center gap-3 min-w-0">
            {logoPondok ? (
              <img src={logoPondok} alt="Logo Pondok" className="w-10 h-10 object-contain rounded-xl border border-[#E5E7EB] p-1 flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                DR
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-['Poppins'] font-extrabold text-sm sm:text-base text-[#111827] truncate">
                {namaLembaga}
              </h1>
              <p className="text-[10.5px] text-slate-500 font-medium truncate">
                {taglineLembaga}
              </p>
            </div>
          </div>

          {/* Navigasi Kanan: Portal Wali & Login Petugas Pondok */}
          <div className="flex items-center gap-2 flex-shrink-0">
            
            <button
              onClick={() => onOpenPortalWali('')}
              className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-1.5 shadow-subtle"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />
              <span className="hidden sm:inline">Portal Wali Santri</span>
              <span className="sm:hidden">Portal Wali</span>
            </button>

            <button
              onClick={onLoginPetugas}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold transition-all shadow-subtle flex items-center gap-1.5 hover:-translate-y-0.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Petugas</span>
            </button>

          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO RESMI PONDOK PESANTREN                                             */}
      {/* ========================================================================= */}
      <section className="pt-10 pb-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        
        <div className="card-bento p-6 sm:p-10 space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#E5E7EB]">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Portal Digital Resmi Lembaga</span>
              </div>
              
              <h2 className="font-['Poppins'] font-extrabold text-2xl sm:text-4xl text-[#111827] tracking-tight">
                {namaLembaga}
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Pusat informasi dan layanan terpadu santri, wali santri, asatidz, dan pengurus pondok pesantren. Seluruh sistem perizinan gerbang, tabungan uang saku smart, dan administrasi pesantren terkelola secara digital dan aman.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{alamatLembaga}</span>
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{noTelpLembaga}</span>
                </span>
              </div>
            </div>

            {/* Profil Singkat Pengasuh */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-2 min-w-[240px]">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Pengasuh Pondok:
              </span>
              <div className="font-['Poppins'] font-bold text-xs text-slate-900">
                {pengasuhLembaga}
              </div>
              <div className="text-[11px] text-slate-500">
                Sumbersari, Kencong, Kepung, Kediri
              </div>
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-600 font-semibold">Tahun Ajaran Aktif 2026/2027</span>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* POS PEMERIKSAAN STATUS IZIN KELUAR SANTRI                               */}
          {/* ======================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1D4ED8]" />
                <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                  Pos Pemeriksaan Status Izin Keluar Santri
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Khusus Keamanan Gerbang (Kamtib) & Asatidz
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik Nama Santri atau NIS (contoh: Farhan, Zaid, 202601)..."
                  value={quickQuery}
                  onChange={(e) => {
                    setQuickQuery(e.target.value);
                    setSearchError('');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchSantri()}
                  className="w-full pl-10 pr-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                />
              </div>

              <button
                onClick={() => handleSearchSantri()}
                disabled={loadingSearch}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-subtle flex items-center justify-center gap-1.5 flex-shrink-0 text-xs"
              >
                <span>{loadingSearch ? 'Memeriksa...' : 'Cek Status Izin'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {searchError && (
              <p className="text-rose-600 text-xs font-semibold">{searchError}</p>
            )}
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. FITUR UTAMA KHUSUS PONDOK INI (BENTO CARDS)                            */}
      {/* ========================================================================= */}
      <section className="py-6 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Bento Card 1: Portal Mandiri Wali Santri */}
          <div className="card-bento p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Portal Mandiri Wali Santri
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Layanan khusus wali santri untuk memantau tabungan saku, riwayat perizinan keluar, dan pelunasan syahriyah bulanan tanpa login rumit.
              </p>
            </div>

            <button
              onClick={() => onOpenPortalWali('')}
              className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#1D4ED8] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Buka Portal Wali</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento Card 2: Pengurus & Asatidz Hub */}
          <div className="card-bento p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Dashboard Pengurus Pesantren
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Akses manajemen bagi Pengasuh, Kepala Pondok, Bendahara, Kamtib Keamanan, dan Pengurus Uang Saku asrama.
              </p>
            </div>

            <button
              onClick={onLoginPetugas}
              className="w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-subtle"
            >
              <span>Login Pengurus Pesantren</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bento Card 3: Kartu Santri KTSD Smart */}
          <div className="card-bento p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Kartu Santri Smart NFC
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Kartu identitas resmi santri dengan chip NFC ISO CR-80 untuk transaksi cashless kantin dan absensi gerbang.
              </p>
            </div>

            {isNfcEnabled && (
              <button
                onClick={onOpenNfcScanner}
                className="w-full py-2.5 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Simulator Scanner NFC</span>
                <Radio className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

        </div>

        {/* Informasi Kegiatan Harian Pesantren */}
        <div className="card-bento p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1D4ED8]" />
              <h3 className="font-['Poppins'] font-bold text-xs text-[#111827] uppercase tracking-wider">
                Rutinitas & Kurikulum Santri
              </h3>
            </div>
            <span className="text-[10px] text-slate-500">Kedisiplinan 24 Jam</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
              <span className="font-bold text-xs text-slate-800">Muhafadzoh Al-Qur'an</span>
              <p className="text-[11px] text-slate-500">Ziyadah ba'da Shubuh & murojaah ba'da Maghrib bersama asatidz tahfidz.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
              <span className="font-bold text-xs text-slate-800">Kajian Kitab Kuning</span>
              <p className="text-[11px] text-slate-500">Kajian fiqih, nahwu shorof, hadits, dan akhlak metode sorogan & bandongan.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] space-y-1">
              <span className="font-bold text-xs text-slate-800">Jam Wajib Asrama</span>
              <p className="text-[11px] text-slate-500">Penertiban gerbang santri pukul 17.00 WIB dan apel malam pukul 22.00 WIB.</p>
            </div>
          </div>
        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. FOOTER RESMI PONDOK PESANTREN (BUKAN PENJUALAN SAAS)                   */}
      {/* ========================================================================= */}
      <footer className="mt-auto bg-white border-t border-[#E5E7EB] py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            <span className="font-bold text-slate-800">{namaLembaga}</span>
            <span className="mx-2">•</span>
            <span>{alamatLembaga}</span>
          </div>

          <div className="flex items-center gap-3">
            <span>Kontak: <strong className="text-slate-700">{noTelpLembaga}</strong></span>
            <span>•</span>
            <span>Email: <strong className="text-slate-700">{emailLembaga}</strong></span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {isTrackerOpen && trackerSantri && (
        <SantriTrackerModal
          santri={trackerSantri}
          isOpen={isTrackerOpen}
          onClose={() => setIsTrackerOpen(false)}
        />
      )}

    </div>
  );
}
