import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight,
  ExternalLink,
  Layers,
  Info,
  Quote,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  HeartHandshake,
  MessageCircle,
  GraduationCap,
  X,
  CreditCard,
  BookOpen,
  Award,
  Compass,
  Clock,
  Check
} from 'lucide-react';
import SantriTrackerModal from '../components/SantriTrackerModal';
import { useSettings } from '../context/SettingsContext';
import { firestoreGetSantri, firestoreGetBills } from '../services/firestoreService';
import { getSantriList } from '../services/api';

export default function TenantPesantrenPortal({ 
  onLoginPetugas, 
  onOpenPortalWali, 
  onOpenNfcScanner 
}) {
  const { settings, isNfcEnabled } = useSettings();
  
  // State Search & Tracker
  const [activePortalTab, setActivePortalTab] = useState('izin'); // 'izin' | 'bayar' | 'tahfidz'
  const [quickQuery, setQuickQuery] = useState('');
  const [trackerSantri, setTrackerSantri] = useState(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResultInfo, setSearchResultInfo] = useState(null);
  const [searchError, setSearchError] = useState('');

  // Pop-up Pengumuman Penting
  const [isUrgentPopupOpen, setIsUrgentPopupOpen] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Identitas Lembaga (Dinamis dari Settings)
  const namaLembaga = settings?.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const taglineLembaga = settings?.TAGLINE_LEMBAGA || 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah';
  const alamatLembaga = settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293';
  const noTelpLembaga = settings?.NO_TELP || '+62 851-2373-4342';
  const whatsappAdmin = settings?.WHATSAPP_CENTER || '085123734342';
  const emailLembaga = settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const pengasuhLembaga = settings?.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const logoPondok = settings?.LOGO_PONDOK_URL;
  const rekeningBank = settings?.BANK_ACCOUNT_NO || '7192837465';
  const namaBank = settings?.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const atasNamaBank = settings?.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI';

  // Visual Customizations
  const theme = settings?.WEB_THEME || 'islamic_green';
  const heroTitle = settings?.WEB_HERO_TITLE || `Portal Resmi ${namaLembaga}`;
  const heroSubtitle = settings?.WEB_HERO_SUBTITLE || 'Pusat layanan digital terpadu santri, asatidz, dan wali santri. Sistem administrasi pesantren, evaluasi tahfidz, dan monitoring perizinan gerbang santri terintegrasi secara amanah dan akuntabel.';
  const heroImage = settings?.WEB_HERO_IMAGE || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1400&q=80';
  const greetingNote = settings?.WEB_GREETING_NOTE || 'Menjaga Tradisi Salafus Sholih & Menguasai Wawasan Keilmuan Kontemporer';
  const mapsUrl = settings?.WEB_MAPS_URL || 'https://maps.google.com/?q=Darul+Rahman+Sumbersari+Kediri';
  const linkPsb = settings?.WEB_PSB_URL || '#psb-section';

  // Pengumuman & Pop-up
  const showAnnouncement = settings?.WEB_SHOW_ANNOUNCEMENT !== 'false';
  const announcementText = settings?.WEB_ANNOUNCEMENT_TEXT || 'Pendaftaran Santri Baru (PSB) Tahun Ajaran 2026/2027 Telah Dibuka!';
  const urgentPopupEnabled = settings?.WEB_URGENT_POPUP_ENABLED === 'true';
  const urgentPopupTitle = settings?.WEB_URGENT_POPUP_TITLE || 'Pengumuman Penting Pesantren';
  const urgentPopupText = settings?.WEB_URGENT_POPUP_TEXT || 'Diberitahukan kepada seluruh Wali Santri bahwa jadwal kepulangan santri libur semester dan sambangan bulan Ramadhan 1447 H telah diterbitkan pada kalender resmi.';

  // Periksa pop-up sekali per sesi
  useEffect(() => {
    if (urgentPopupEnabled && typeof window !== 'undefined') {
      const hasShown = sessionStorage.getItem('sipesand_popup_shown');
      if (!hasShown) {
        setIsUrgentPopupOpen(true);
        sessionStorage.setItem('sipesand_popup_shown', 'true');
      }
    }
  }, [urgentPopupEnabled]);

  // Galeri Foto Kegiatan Pesantren
  const defaultGallery = [
    {
      id: 1,
      title: 'Sorogan & Bandongan Kitab Kuning',
      category: 'Turats Salaf',
      img: 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=600&q=80',
      desc: 'Kajian kitab Fathul Qorib, Ta\'lim Muta\'allim, dan Ihya Ulumiddin bersama jajaran Dewan Asatidz senior.'
    },
    {
      id: 2,
      title: 'Halaqoh Tahfidzul Qur\'an 30 Juz',
      category: 'Tahfidz Mutqin',
      img: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
      desc: 'Setoran ziyadah hafalan baru dan muroja\'ah juz 1 hingga 30 ba\'da sholat Shubuh dan ba\'da Ashar.'
    },
    {
      id: 3,
      title: 'Muhadhoroh & Khitobah 3 Bahasa',
      category: 'Pengembangan Bahasa',
      img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      desc: 'Latihan pidato dan public speaking santri dalam Bahasa Arab, Inggris, dan Bahasa Indonesia.'
    },
    {
      id: 4,
      title: 'Sholat Maktubah & Majelis Rotib',
      category: 'Ibadah & Ruhiyah',
      img: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
      desc: 'Rutinitas sholat maktubah berjamaah di masjid jami\' pondok dan pembacaan Rotibul Haddad.'
    }
  ];

  let galleryPhotos = defaultGallery;
  try {
    const parsed = JSON.parse(settings?.WEB_GALLERY_JSON || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) galleryPhotos = parsed;
  } catch (e) {}

  // Daftar FAQ
  const defaultFaqs = [
    {
      q: 'Bagaimana cara orang tua mengecek saldo uang saku santri?',
      a: 'Wali santri cukup mengklik tombol "Portal Wali Santri" di bagian atas halaman ini, lalu masukkan nomor NIS santri atau nomor WhatsApp wali yang terdaftar. Saldo tabungan, limit jajan harian, dan riwayat transaksi kasir kantin langsung tampil secara real-time.'
    },
    {
      q: 'Bagaimana alur dan status perizinan keluar atau pulang santri?',
      a: 'Perizinan diajukan secara terpadu melalui Pos Keamanan (Kamtib). Setiap santri yang mendapatkan izin resmi akan tercatat di sistem gerbang dan statusnya bisa diverifikasi langsung pada tab "Cek Izin Gerbang" di portal ini.'
    },
    {
      q: 'Kapan jadwal pendaftaran santri baru (PSB) 2026/2027 dibuka?',
      a: 'Pendaftaran gelombang 1 dibuka mulai 1 Januari hingga 30 Maret 2026. Pendaftaran dapat dilakukan secara online melalui tombol Pendaftaran PSB atau datang langsung ke kantor sekretariat pondok.'
    },
    {
      q: 'Apakah pembayaran Syahriyah bulanan bisa via transfer bank?',
      a: `Bisa. Seluruh pembayaran syahriyah dan donasi resmi disalurkan melalui rekening ${namaBank} No. Rek: ${rekeningBank} a.n ${atasNamaBank}. Bukti transaksi dapat dikonfirmasikan ke nomor WhatsApp resmi sekretariat.`
    }
  ];

  // Pencarian Cepat Layanan Publik (Izin / Tagihan / Hafalan)
  const handleSearchPublicPortal = async () => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) {
      setSearchError('Ketik Nama Santri atau NIS untuk mengecek');
      return;
    }

    setLoadingSearch(true);
    setSearchError('');
    setSearchResultInfo(null);

    try {
      const res = await getSantriList();
      const allSantri = (res?.data?.data && Array.isArray(res.data.data)) ? res.data.data : firestoreGetSantri();
      const match = allSantri.find(s => 
        (s.nama || '').toLowerCase().includes(q) || 
        (s.nis || '').toLowerCase().includes(q)
      );

      if (!match) {
        setSearchError(`Data santri "${quickQuery}" tidak ditemukan di database. Pastikan nama atau NIS sesuai.`);
        setLoadingSearch(false);
        return;
      }

      if (activePortalTab === 'izin') {
        setTrackerSantri(match);
        setIsTrackerOpen(true);
      } else if (activePortalTab === 'bayar') {
        const allBills = firestoreGetBills();
        const santriBills = allBills.filter(b => b.santriId === match.id || b.santri?.nama === match.nama);
        setSearchResultInfo({
          type: 'bayar',
          santri: match,
          bills: santriBills
        });
      } else if (activePortalTab === 'tahfidz') {
        setSearchResultInfo({
          type: 'tahfidz',
          santri: match
        });
      }
    } catch (err) {
      setSearchError('Terjadi kesalahan saat membaca database.');
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans text-xs">
      
      {/* ========================================================================= */}
      {/* 1. HEADER / NAVBAR RESMI                                                  */}
      {/* ========================================================================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Logo & Identitas Lembaga */}
          <div className="flex items-center gap-3 min-w-0">
            {logoPondok ? (
              <img src={logoPondok} alt="Logo" className="w-10 h-10 object-contain rounded-xl border border-slate-200 p-1 flex-shrink-0 bg-white" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-sm flex-shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight block truncate">
                {namaLembaga}
              </span>
              <span className="text-[11px] text-slate-600 font-medium block truncate">
                {taglineLembaga}
              </span>
            </div>
          </div>

          {/* Navigasi Desktop Link Menu */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-xs text-slate-600">
            <a href="#beranda" className="hover:text-emerald-700 transition-colors">Beranda</a>
            <a href="#layanan-publik" className="hover:text-emerald-700 transition-colors">Cek Santri</a>
            <a href="#kegiatan" className="hover:text-emerald-700 transition-colors">Kegiatan Santri</a>
            <a href="#pengumuman" className="hover:text-emerald-700 transition-colors">Pengumuman</a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">FAQ</a>
            <a href="#kontak" className="hover:text-emerald-700 transition-colors">Kontak</a>
          </nav>

          {/* Tombol Akses: Portal Wali & Login Petugas */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => onOpenPortalWali('')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Portal Wali Santri</span>
              <span className="sm:hidden">Wali</span>
            </button>

            <button
              onClick={onLoginPetugas}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Petugas</span>
            </button>
          </div>

        </div>
      </header>

      {/* Banner Pengumuman Resmi */}
      {showAnnouncement && announcementText && (
        <div className="bg-emerald-800 text-white py-2.5 px-4 text-center text-xs font-semibold shadow-inner flex items-center justify-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0 text-emerald-200" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO SECTION PESANTREN                                                 */}
      {/* ========================================================================= */}
      <section id="beranda" className="pt-8 sm:pt-12 pb-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Banner Hero Foto Pesantren */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 w-full relative group">
            <img 
              src={heroImage} 
              alt="Kampus Pesantren" 
              className="w-full h-56 sm:h-80 object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-6 sm:p-8">
              <div className="text-white space-y-1.5 max-w-2xl">
                <span className="px-3 py-1 bg-emerald-900/80 backdrop-blur-md text-emerald-100 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-700/50">
                  Kampus Pendidikan Islam Terpadu
                </span>
                <h3 className="font-extrabold text-xl sm:text-2xl text-white">
                  {namaLembaga}
                </h3>
                <p className="text-slate-200 text-xs sm:text-sm line-clamp-2">
                  {alamatLembaga}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-slate-100">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold text-xs border border-emerald-200">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Pondok Pesantren Salafiyah Terpadu</span>
              </div>
              
              <h1 className="font-extrabold text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight">
                {heroTitle}
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                {heroSubtitle}
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs italic flex items-center gap-3">
                <Quote className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                <span>"{greetingNote}"</span>
              </div>
            </div>

            {/* Tombol Aksi Cepat */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0 w-full lg:w-72">
              <button
                onClick={() => {
                  const el = document.getElementById('layanan-publik');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <Search className="w-4 h-4" />
                <span>Cek Izin & Tagihan Santri</span>
              </button>

              <button
                onClick={() => onOpenPortalWali('')}
                className="w-full px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-xs"
              >
                <UserCheck className="w-4 h-4 text-emerald-700" />
                <span>Buka Portal Wali Santri</span>
              </button>

              <a
                href={linkPsb}
                className="w-full px-5 py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold transition-all text-center text-xs block"
              >
                Pendaftaran Santri Baru (PSB)
              </a>
            </div>
          </div>

          {/* 4 Card Highlight Statistik Institusional (No AI Slop / No Purple) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 font-mono">300+</div>
              <div className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Santri Mukim Aktif</div>
            </div>
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-mono">30 Juz</div>
              <div className="text-xs text-amber-800 font-bold uppercase tracking-wider">Tahfidzul Qur'an Mutqin</div>
            </div>
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-blue-950 font-mono">25+</div>
              <div className="text-xs text-blue-800 font-bold uppercase tracking-wider">Dewan Asatidz Alumni</div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">100%</div>
              <div className="text-xs text-slate-700 font-bold uppercase tracking-wider">Smart Card Cashless</div>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. PORTAL PUBLIK: CEK IZIN, CEK TAGIHAN, CEK HAFALAN                     */}
      {/* ========================================================================= */}
      <section id="layanan-publik" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pusat Pemeriksaan Mandiri Santri
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Layanan transparan bagi wali santri dan asatidz untuk memverifikasi izin keluar gerbang, riwayat syahriyah bulanan, serta capaian setoran hafalan Al-Qur'an.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-1 text-xs font-bold">
              <button
                onClick={() => { setActivePortalTab('izin'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'izin' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cek Izin Keluar Gerbang
              </button>
              <button
                onClick={() => { setActivePortalTab('bayar'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'bayar' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cek Status Syahriyah
              </button>
              <button
                onClick={() => { setActivePortalTab('tahfidz'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'tahfidz' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cek Capaian Tahfidz
              </button>
            </div>
          </div>

          {/* Search Box Input */}
          <div className="max-w-xl mx-auto space-y-3">
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
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchPublicPortal()}
                  className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
                />
              </div>

              <button
                onClick={handleSearchPublicPortal}
                disabled={loadingSearch}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0 text-xs"
              >
                <span>{loadingSearch ? 'Memeriksa...' : 'Cari Data'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {searchError && (
              <p className="text-rose-600 text-xs font-semibold text-center">{searchError}</p>
            )}
          </div>

          {/* Card Hasil Pencarian Tagihan / Hafalan */}
          {searchResultInfo && (
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{searchResultInfo.santri.nama}</h4>
                  <p className="text-xs text-slate-600">NIS: {searchResultInfo.santri.nis} • {searchResultInfo.santri.kelas}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs border border-emerald-200">
                  {searchResultInfo.santri.status}
                </span>
              </div>

              {searchResultInfo.type === 'bayar' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-800 text-xs">Riwayat Tagihan & Pembayaran:</div>
                  {searchResultInfo.bills.length > 0 ? (
                    searchResultInfo.bills.map(b => (
                      <div key={b.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-[11px] text-slate-600">Bulan: {b.hijriMonth} {b.hijriYear}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900 font-mono">Rp {(b.amount || 0).toLocaleString('id-ID')}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'PAID' ? 'bg-emerald-100 text-emerald-900' : 'bg-rose-100 text-rose-900'
                          }`}>
                            {b.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 italic">Tidak ada tagihan tertunggak pada bulan berjalan.</p>
                  )}
                </div>
              )}

              {searchResultInfo.type === 'tahfidz' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Capaian Mutqin Tahfidz:</span>
                  <div className="text-base font-extrabold text-emerald-800">{searchResultInfo.santri.tahfidzJuz || 'Juz 30 Mutqin'}</div>
                  <p className="text-xs text-slate-600">Muroja'ah dan setoran rutin harian ba'da sholat Shubuh dan ba'da Ashar di bawah bimbingan musyrif halaqoh.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION KEGIATAN SANTRI & KURIKULUM                                   */}
      {/* ========================================================================= */}
      <section id="kegiatan" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pilar Pendidikan & Kegiatan Harian Santri
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Keseharian santri dalam menuntut ilmu syar'i, tahfidz Al-Qur'an 30 juz, pengajian kitab salaf, dan pembinaan adab berkarakter mandiri.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryPhotos.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[10px] font-bold">
                  {item.category || 'Pendidikan'}
                </span>
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 pt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION PENGUMUMAN & AGENDA PESANTREN                                  */}
      {/* ========================================================================= */}
      <section id="pengumuman" className="py-8 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900">Agenda & Pengumuman Resmi Pesantren</h3>
              <p className="text-slate-600 text-xs">Informasi resmi dari sekretariat dan pengasuh pondok pesantren</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-lg w-fit">
              Tahun Ajaran 1447 H / 2026 M
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>1 Ramadhan 1447 H</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Program Pengajian Posonan Ramadhan</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kajian kilatan kitab Fathul Mu'in dan Ihya Ulumiddin selama bulan suci Ramadhan bersama dewan masyayikh.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Setiap Hari Ahad Pekan ke-2</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Jadwal Sambangan & Kunjungan Wali</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kunjungan orang tua dibuka pukul 08.00 s.d 16.30 WIB dengan mematuhi protokol asrama dan tertib berpakaian syar'i.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-800">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>Gelombang I Terbuka</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Penerimaan Santri Baru (PSB) 2026</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pendaftaran santri baru program reguler dan tahfidz mutqin. Tes seleksi meliputi membaca Al-Qur'an dan wawancara diniyah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TOMBOL LAYANAN & REKENING RESMI BSI                                     */}
      {/* ========================================================================= */}
      <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <a
            href={`https://wa.me/${whatsappAdmin}?text=Assalamu%27alaikum%20Sekretariat%20${encodeURIComponent(namaLembaga)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1.5">
              <MessageCircle className="w-6 h-6 text-emerald-200" />
              <h3 className="font-extrabold text-base text-white">WhatsApp Sekretariat</h3>
              <p className="text-emerald-100 text-xs leading-relaxed">Konsultasi pendaftaran santri baru, jadwal sambangan, dan layanan administrasi pondok.</p>
            </div>
            <span className="text-xs font-bold underline flex items-center gap-1 pt-3 text-white">
              Hubungi Sekretariat WhatsApp →
            </span>
          </a>

          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-sm space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <HeartHandshake className="w-6 h-6 text-amber-400" />
              <h3 className="font-extrabold text-base text-white">Rekening Donasi & Syahriyah</h3>
              <p className="text-slate-300 text-xs leading-relaxed">Penyaluran syahriyah resmi, infaq pengembangan sarana santri, dan wakaf gedung tahfidz.</p>
            </div>
            <div className="pt-2 text-xs font-mono bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="font-bold text-amber-300">{namaBank}</div>
              <div className="text-white text-sm font-extrabold">{rekeningBank}</div>
              <div className="text-slate-300 text-[10px] truncate">a.n {atasNamaBank}</div>
            </div>
          </div>

          <div 
            onClick={onLoginPetugas}
            className="p-6 rounded-3xl bg-white border border-slate-200 text-slate-900 shadow-sm hover:border-emerald-700 transition-all space-y-2 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-1.5">
              <Lock className="w-6 h-6 text-emerald-700" />
              <h3 className="font-extrabold text-base text-slate-900">Portal Petugas & Pengurus</h3>
              <p className="text-slate-600 text-xs leading-relaxed">Akses dashboard terpusat bagi Bendahara, Kepala Asrama, Pengurus Uang Saku, dan Pos Kamtib.</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 pt-3">
              Masuk ke Dashboard Sistem →
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION FAQ (TANYA JAWAB UMUM)                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-8 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            Panduan dan jawaban atas pertanyaan umum seputar kegiatan pesantren dan portal wali santri.
          </p>
        </div>

        <div className="space-y-3">
          {defaultFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-emerald-700" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER LENGKAP PESANTREN                                               */}
      {/* ========================================================================= */}
      <footer id="kontak" className="bg-slate-950 text-white mt-12 pt-12 pb-8 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Profil Singkat */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">{namaLembaga}</h4>
                  <p className="text-xs text-slate-400">{taglineLembaga}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Lembaga pendidikan Islam berwawasan Ahlussunnah wal Jama'ah yang memadukan kedalaman tradisi salafus sholih dengan tata kelola digital terpadu demi kemaslahatan santri dan ummat.
              </p>
              <div className="text-slate-300 text-xs pt-1">
                <span className="font-bold">Pengasuh:</span> {pengasuhLembaga}
              </div>
            </div>

            {/* Kontak & Alamat */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Sekretariat Lembaga</h5>
              <div className="space-y-2 text-slate-400 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>{alamatLembaga}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{noTelpLembaga}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{emailLembaga}</span>
                </div>
              </div>
            </div>

            {/* Rekening Resmi */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Rekening Resmi BSI</h5>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 font-mono">
                <span className="text-[11px] text-amber-400 font-bold block">{namaBank}</span>
                <div className="font-extrabold text-white text-base">{rekeningBank}</div>
                <p className="text-[10px] text-slate-400">a.n {atasNamaBank}</p>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
            <div>
              © {new Date().getFullYear()} {namaLembaga}. Sistem Informasi Pesantren Terpadu.
            </div>
            <div className="flex items-center gap-4">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Petunjuk Lokasi Google Maps
              </a>
              <span>•</span>
              <button onClick={onLoginPetugas} className="hover:text-white transition-colors font-bold text-emerald-400">
                Login Petugas
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* POP-UP MODAL PENGUMUMAN PENTING                                           */}
      {/* ========================================================================= */}
      {isUrgentPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900">{urgentPopupTitle}</h3>
              </div>
              <button onClick={() => setIsUrgentPopupOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs leading-relaxed space-y-2">
              <p>{urgentPopupText}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsUrgentPopupOpen(false)}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cek Izin Santri Tracker */}
      <SantriTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        santri={trackerSantri}
      />

    </div>
  );
}
