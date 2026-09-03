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
  Sparkles,
  X,
  CreditCard,
  BookOpen
} from 'lucide-react';
import SantriTrackerModal from '../components/SantriTrackerModal';
import { useSettings } from '../context/SettingsContext';
import { firestoreGetSantri, firestoreGetBills } from '../services/firestoreService';

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
  const taglineLembaga = settings?.TAGLINE_LEMBAGA || 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an';
  const alamatLembaga = settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293';
  const noTelpLembaga = settings?.NO_TELP || '+62 851-2373-4342';
  const whatsappAdmin = settings?.WHATSAPP_CENTER || '081234567890';
  const emailLembaga = settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const pengasuhLembaga = settings?.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const logoPondok = settings?.LOGO_PONDOK_URL;
  const rekeningBank = settings?.BANK_ACCOUNT_NO || '7192837465';
  const namaBank = settings?.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const atasNamaBank = settings?.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI';

  // Visual Customizations
  const theme = settings?.WEB_THEME || 'modern_bento';
  const heroTitle = settings?.WEB_HERO_TITLE || `Selamat Datang di Portal Resmi ${namaLembaga}`;
  const heroSubtitle = settings?.WEB_HERO_SUBTITLE || 'Pusat layanan digital terpadu santri, wali santri, asatidz, dan pengurus pondok pesantren. Seluruh sistem perizinan gerbang, tabungan uang saku smart, dan administrasi pesantren terkelola secara profesional.';
  const heroImage = settings?.WEB_HERO_IMAGE || 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1400&q=80';
  const greetingNote = settings?.WEB_GREETING_NOTE || 'Mengabdi untuk Umat, Menjaga Tradisi Salaf & Wawasan Global';
  const mapsUrl = settings?.WEB_MAPS_URL || 'https://maps.google.com/?q=Darul+Rahman+Sumbersari+Kediri';
  const linkPsb = settings?.WEB_PSB_URL || '#psb-section';
  const linkDonasi = settings?.WEB_DONATION_URL || '#donasi-section';

  // Pengumuman & Pop-up
  const showAnnouncement = settings?.WEB_SHOW_ANNOUNCEMENT !== 'false';
  const announcementText = settings?.WEB_ANNOUNCEMENT_TEXT || 'Pendaftaran Santri Baru (PSB) Tahun Ajaran 2026/2027 Telah Dibuka!';
  const urgentPopupEnabled = settings?.WEB_URGENT_POPUP_ENABLED === 'true';
  const urgentPopupTitle = settings?.WEB_URGENT_POPUP_TITLE || 'Pengumuman Penting Pesantren';
  const urgentPopupText = settings?.WEB_URGENT_POPUP_TEXT || 'Diberitahukan kepada seluruh Wali Santri bahwa libur akhir semester dan jadwal sambangan Ramadhan 1447 H telah diterbitkan pada kalender resmi.';

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

  // Galeri Foto Kegiatan
  const defaultGallery = [
    {
      id: 1,
      title: 'Kajian Sorogan Kitab Kuning',
      category: 'Akademik',
      img: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
      desc: 'Sorogan kitab Fathul Qorib dan Ta\'lim Muta\'allim bersama dewan asatidz.'
    },
    {
      id: 2,
      title: 'Halaqoh Tahfidzul Qur\'an Mutqin',
      category: 'Tahfidz',
      img: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=600&q=80',
      desc: 'Setoran ziyadah dan muroja\'ah juz 1 hingga 30 ba\'da Shubuh.'
    },
    {
      id: 3,
      title: 'Muhadhoroh & Khitobah 3 Bahasa',
      category: 'Bahasa',
      img: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80',
      desc: 'Latihan public speaking pidato bahasa Arab, Inggris, dan Indonesia.'
    },
    {
      id: 4,
      title: 'Sholat Berjamaah & Dzikir Bersama',
      category: 'Ibadah',
      img: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=600&q=80',
      desc: 'Rutinitas sholat maktubah berjamaah dan wirid rotib di masjid jami\'.'
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
      a: 'Wali santri cukup mengklik tombol "Portal Wali Santri" di bagian atas halaman ini, lalu masukkan NIS atau nomor HP wali santri yang terdaftar. Saldo dan riwayat jajan kantin santri langsung tampil secara real-time.'
    },
    {
      q: 'Bagaimana alur perizinan keluar atau pulang santri?',
      a: 'Perizinan diajukan secara terpadu melalui Pos Keamanan (Kamtib). Setiap santri yang mendapatkan izin resmi akan tercatat di sistem gerbang dan statusnya bisa dicek langsung di Pos Pemeriksaan Izin pada portal ini.'
    },
    {
      q: 'Kapan jadwal pendaftaran santri baru (PSB) 2026/2027 dibuka?',
      a: 'Pendaftaran gelombang 1 dibuka mulai 1 Januari hingga 30 Maret 2026. Pendaftaran dapat dilakukan secara online melalui tombol Pendaftaran PSB atau datang langsung ke kantor sekretariat pondok.'
    },
    {
      q: 'Apakah pembayaran Syahriyah bulanan bisa via transfer bank?',
      a: `Bisa. Seluruh pembayaran syahriyah dan donasi resmi disalurkan melalui rekening ${namaBank} No. Rek: ${rekeningBank} a.n ${atasNamaBank}. Konfirmasi bukti transfer dapat dikirimkan ke WhatsApp resmi pengurus.`
    }
  ];

  // Helper Tema Styling
  const getThemeStyles = () => {
    switch (theme) {
      case 'islamic_green':
        return {
          primaryBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white',
          badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
          badgeIcon: 'text-emerald-700',
          accentText: 'text-emerald-700',
          bgPage: 'bg-[#F9FAF8]',
        };
      case 'classic_navy':
        return {
          primaryBtn: 'bg-slate-900 hover:bg-slate-800 text-white',
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-200',
          badgeIcon: 'text-slate-800',
          accentText: 'text-slate-900',
          bgPage: 'bg-[#F8FAFC]',
        };
      case 'academic_maroon':
        return {
          primaryBtn: 'bg-rose-800 hover:bg-rose-900 text-white',
          badgeBg: 'bg-rose-50 text-rose-900 border-rose-200',
          badgeIcon: 'text-rose-800',
          accentText: 'text-rose-800',
          bgPage: 'bg-[#FAF8F8]',
        };
      case 'modern_bento':
      default:
        return {
          primaryBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          badgeBg: 'bg-blue-50 text-blue-800 border-blue-100',
          badgeIcon: 'text-blue-600',
          accentText: 'text-blue-600',
          bgPage: 'bg-[#F8FAFC]',
        };
    }
  };
  const themeStyle = getThemeStyles();

  // Pencarian Cepat Layanan Publik (Izin / Tagihan / Hafalan)
  const handleSearchPublicPortal = () => {
    const q = quickQuery.trim().toLowerCase();
    if (!q) {
      setSearchError('Ketik Nama Santri atau NIS untuk mengecek');
      return;
    }

    setLoadingSearch(true);
    setSearchError('');
    setSearchResultInfo(null);

    try {
      const allSantri = firestoreGetSantri();
      const match = allSantri.find(s => 
        (s.nama || '').toLowerCase().includes(q) || 
        (s.nis || '').toLowerCase().includes(q)
      );

      if (!match) {
        setSearchError(`Data santri "${quickQuery}" tidak ditemukan di database. Coba kata kunci: Farhan, Zaid, atau NIS 202601.`);
        setLoadingSearch(false);
        return;
      }

      if (activePortalTab === 'izin') {
        // Cek Izin
        setTrackerSantri(match);
        setIsTrackerOpen(true);
      } else if (activePortalTab === 'bayar') {
        // Cek Tagihan
        const allBills = firestoreGetBills();
        const santriBills = allBills.filter(b => b.santriId === match.id || b.santri?.nama === match.nama);
        setSearchResultInfo({
          type: 'bayar',
          santri: match,
          bills: santriBills
        });
      } else if (activePortalTab === 'tahfidz') {
        // Cek Hafalan
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
    <div className={`min-h-screen ${themeStyle.bgPage} text-[#111827] flex flex-col font-sans text-xs selection:bg-blue-600 selection:text-white`}>
      
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
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
                <Layers className="w-5 h-5" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-['Righteous'] text-lg sm:text-xl text-slate-900 tracking-tight block truncate">
                {namaLembaga}
              </span>
              <span className="text-[10px] text-slate-500 font-medium block truncate">
                {taglineLembaga}
              </span>
            </div>
          </div>

          {/* Navigasi Desktop Link Menu */}
          <nav className="hidden lg:flex items-center gap-6 font-semibold text-xs text-slate-600">
            <a href="#beranda" className="hover:text-blue-600 transition-colors">Beranda</a>
            <a href="#kegiatan" className="hover:text-blue-600 transition-colors">Kegiatan Santri</a>
            <a href="#pengumuman" className="hover:text-blue-600 transition-colors">Pengumuman</a>
            <a href="#layanan-publik" className="hover:text-blue-600 transition-colors">Portal Cek Izin</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
            <a href="#kontak" className="hover:text-blue-600 transition-colors">Kontak</a>
          </nav>

          {/* Tombol Akses: Portal Wali & Login Petugas */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => onOpenPortalWali('')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Portal Wali Santri</span>
              <span className="sm:hidden">Wali</span>
            </button>

            <button
              onClick={onLoginPetugas}
              className={`px-4 py-2 rounded-xl ${themeStyle.primaryBtn} font-bold transition-all shadow-sm flex items-center gap-1.5 hover:-translate-y-0.5`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login Petugas</span>
            </button>
          </div>

        </div>
      </header>

      {/* Banner Pengumuman Marquee / Header */}
      {showAnnouncement && announcementText && (
        <div className="bg-blue-600 text-white py-2 px-4 text-center text-xs font-bold shadow-inner flex items-center justify-center gap-2">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>{announcementText}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. HERO SECTION PESANTREN                                                 */}
      {/* ========================================================================= */}
      <section id="beranda" className="pt-8 sm:pt-12 pb-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          
          {/* Banner Hero Foto Pesantren */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 w-full shadow-inner relative group">
            <img 
              src={heroImage} 
              alt="Kampus Pesantren" 
              className="w-full h-56 sm:h-80 object-cover group-hover:scale-105 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-end p-6">
              <div className="text-white space-y-1">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Lingkungan Asri & Bernuansa Islami
                </span>
                <h3 className="font-extrabold text-lg sm:text-xl text-white">
                  {namaLembaga}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-6 border-b border-slate-100">
            <div className="space-y-4 max-w-3xl">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${themeStyle.badgeBg} font-bold text-xs border`}>
                <Building2 className={`w-3.5 h-3.5 ${themeStyle.badgeIcon}`} />
                <span>Portal Resmi Digital Lembaga Pesantren</span>
              </div>
              
              <h2 className="font-['Poppins'] font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight leading-tight">
                {heroTitle}
              </h2>

              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {heroSubtitle}
              </p>

              {greetingNote && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 italic flex items-start gap-3 text-xs">
                  <Quote className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>"{greetingNote}"</span>
                </div>
              )}

              {/* Action Buttons: Login Petugas & Daftar PSB */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onLoginPetugas}
                  className={`px-6 py-3 rounded-2xl ${themeStyle.primaryBtn} font-black text-xs shadow-md transition-all flex items-center gap-2`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Masuk Dashboard Petugas</span>
                </button>

                <a
                  href={`https://wa.me/${whatsappAdmin}?text=Halo%20Admin%20${encodeURIComponent(namaLembaga)},%20saya%20ingin%20mendaftar%20PSB%20Santri%20Baru.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Pendaftaran PSB Online</span>
                </a>
              </div>
            </div>

            {/* Info Box Pengasuh & Status */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4 min-w-[280px]">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Pengasuh / Pimpinan Pondok:
                </span>
                <h4 className="font-bold text-sm text-slate-900">
                  {pengasuhLembaga}
                </h4>
                <p className="text-[11px] text-slate-500">{alamatLembaga.split(',')[0]}</p>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Tahun Ajaran:</span>
                  <span className="font-bold text-slate-900">2026 / 2027</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Akreditasi:</span>
                  <span className="font-bold text-emerald-600">Terakreditasi A (Unggul)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Sistem Saku:</span>
                  <span className="font-bold text-blue-600">100% Cashless NFC</span>
                </div>
              </div>
            </div>

          </div>

          {/* 4 Card Highlight Statistik */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="text-2xl font-black text-blue-950">300+</div>
              <div className="text-[10px] text-blue-700 font-bold uppercase">Santri Mukim Aktif</div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-center">
              <div className="text-2xl font-black text-emerald-950">30 Juz</div>
              <div className="text-[10px] text-emerald-700 font-bold uppercase">Tahfidzul Qur'an</div>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 text-center">
              <div className="text-2xl font-black text-purple-950">25+</div>
              <div className="text-[10px] text-purple-700 font-bold uppercase">Dewan Asatidz Alumni</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <div className="text-2xl font-black text-amber-950">100%</div>
              <div className="text-[10px] text-amber-700 font-bold uppercase">Digital Smart Card</div>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION KEGIATAN SANTRI (GALERI & CAROUSEL)                            */}
      {/* ========================================================================= */}
      <section id="kegiatan" className="py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px] uppercase tracking-wider border border-blue-100">
            Aktivitas Harian
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Galeri Kegiatan Santri</h2>
          <p className="text-slate-500 text-xs">
            Keseharian santri dalam menuntut ilmu syar'i, tahfidz Al-Qur'an, sorogan kitab kuning, dan pembinaan karakter mandiri.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {galleryPhotos.map((item, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm group hover:shadow-md transition-all flex flex-col">
              <div className="h-44 overflow-hidden relative">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/70 backdrop-blur-md text-white rounded-full text-[9px] font-bold">
                  {item.category || 'Kegiatan'}
                </span>
              </div>
              <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION PENGUMUMAN & AGENDA PESANTREN                                  */}
      {/* ========================================================================= */}
      <section id="pengumuman" className="py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-black text-xl text-slate-900">Pengumuman & Agenda Penting Pesantren</h3>
              <p className="text-slate-500 text-xs">Informasi resmi dari sekretariat dan pengasuh pondok pesantren</p>
            </div>
            <span className="text-[10px] font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
              Terkini 1447 H / 2026 M
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>1 Ramadhan 1447 H</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Program Khotmil Qur'an & Posonan Kitab</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Dimulainya pengajian pasaran kilatan kitab Shahih Bukhari dan Ihya Ulumiddin selama bulan suci Ramadhan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Setiap Hari Ahad Pekan ke-2</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Jadwal Sambangan / Kunjungan Wali</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Wali santri diperkenankan berkunjung mulai pukul 08.00 s.d 16.30 WIB dengan mematuhi protokol sopan santun asrama.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600">
                <Calendar className="w-3.5 h-3.5" />
                <span>Gelombang I Terbuka</span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">Penerimaan Santri Baru (PSB) 2026</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Kuota terbatas 120 santri putra dan 80 santri putri. Tes seleksi meliputi membaca Al-Qur'an dan wawancara diniyah.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. PORTAL PUBLIK: CEK IZIN, CEK TAGIHAN, CEK HAFALAN                     */}
      {/* ========================================================================= */}
      <section id="layanan-publik" className="py-10 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full font-bold text-[10px] uppercase tracking-wider border border-emerald-100">
              Layanan Digital Publik
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Cek Data Santri Cepat</h2>
            <p className="text-slate-500 text-xs">
              Pemeriksaan perizinan gerbang, tagihan syahriyah, dan capaian hafalan santri secara mandiri.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200 gap-1 text-xs font-bold">
              <button
                onClick={() => { setActivePortalTab('izin'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'izin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cek Izin Keluar Gerbang
              </button>
              <button
                onClick={() => { setActivePortalTab('bayar'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'bayar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cek Status Syahriyah
              </button>
              <button
                onClick={() => { setActivePortalTab('tahfidz'); setSearchResultInfo(null); }}
                className={`px-4 py-2 rounded-xl transition-all ${
                  activePortalTab === 'tahfidz' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
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
                  className="w-full pl-10 pr-3.5 py-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>

              <button
                onClick={handleSearchPublicPortal}
                disabled={loadingSearch}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0 text-xs"
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
            <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{searchResultInfo.santri.nama}</h4>
                  <p className="text-[10px] text-slate-400">NIS: {searchResultInfo.santri.nis} • {searchResultInfo.santri.kelas}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">
                  {searchResultInfo.santri.status}
                </span>
              </div>

              {searchResultInfo.type === 'bayar' && (
                <div className="space-y-2">
                  <div className="font-bold text-slate-700 text-xs">Riwayat Tagihan:</div>
                  {searchResultInfo.bills.length > 0 ? (
                    searchResultInfo.bills.map(b => (
                      <div key={b.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{b.title}</div>
                          <div className="text-[10px] text-slate-400">Bulan: {b.hijriMonth} {b.hijriYear}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">Rp {(b.amount || 0).toLocaleString('id-ID')}</div>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            b.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {b.status === 'PAID' ? 'LUNAS' : 'BELUM LUNAS'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-slate-500 italic">Tidak ada tagihan tertunggak.</p>
                  )}
                </div>
              )}

              {searchResultInfo.type === 'tahfidz' && (
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Capaian Mutqin Tahfidz:</span>
                  <div className="text-base font-black text-blue-700">{searchResultInfo.santri.tahfidzJuz || 'Juz 30 Mutqin'}</div>
                  <p className="text-[11px] text-slate-500">Muroja'ah dan setoran rutin harian bersama musyrif asrama.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TOMBOL CEPAT & DONASI INFAQ                                           */}
      {/* ========================================================================= */}
      <section className="py-6 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <a
            href={`https://wa.me/${whatsappAdmin}?text=Assalamu%27alaikum%20Admin%20${encodeURIComponent(namaLembaga)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-6 rounded-3xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all space-y-2 flex flex-col justify-between"
          >
            <div className="space-y-1">
              <MessageCircle className="w-6 h-6 text-white" />
              <h3 className="font-extrabold text-base">WhatsApp Sekretariat</h3>
              <p className="text-emerald-100 text-xs">Konsultasi santri baru, sambangan, dan administrasi langsung ke staf.</p>
            </div>
            <span className="text-xs font-bold underline flex items-center gap-1 pt-2">
              Kirim Pesan WhatsApp →
            </span>
          </a>

          <div className="p-6 rounded-3xl bg-blue-600 text-white shadow-md space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <HeartHandshake className="w-6 h-6 text-white" />
              <h3 className="font-extrabold text-base">Donasi & Infaq Pesantren</h3>
              <p className="text-blue-100 text-xs">Dukung pembangunan asrama santri dan sarana tahfidzul qur'an.</p>
            </div>
            <div className="pt-2 text-xs font-mono">
              <div className="font-bold text-amber-300">{namaBank}</div>
              <div>No: {rekeningBank}</div>
            </div>
          </div>

          <div 
            onClick={onLoginPetugas}
            className="p-6 rounded-3xl bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all space-y-2 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-1">
              <Lock className="w-6 h-6 text-blue-400" />
              <h3 className="font-extrabold text-base">Portal Khusus Petugas</h3>
              <p className="text-slate-400 text-xs">Login Bendahara, Kepala Pondok, Pengurus Saku, dan Keamanan Kamtib.</p>
            </div>
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1 pt-2">
              Buka Panel Dashboard V2 →
            </span>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION FAQ (TANYA JAWAB UMUM)                                         */}
      {/* ========================================================================= */}
      <section id="faq" className="py-10 px-4 sm:px-6 max-w-5xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full font-bold text-[10px] uppercase tracking-wider">
            Bantuan & Panduan
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pertanyaan yang Sering Diajukan (FAQ)</h2>
          <p className="text-slate-500 text-xs">Jawaban atas pertanyaan umum wali santri dan calon pendaftar.</p>
        </div>

        <div className="space-y-3">
          {defaultFaqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                className="w-full p-4 sm:p-5 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                {openFaqIndex === idx ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
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
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white">{namaLembaga}</h4>
                  <p className="text-[11px] text-slate-400">{taglineLembaga}</p>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Lembaga pendidikan Islam modern terpadu yang memadukan kedalaman tradisi salafus sholih dengan wawasan keilmuan kontemporer dan sistem digitalisasi pesantren smart card.
              </p>
            </div>

            {/* Kontak & Alamat */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Kontak Lembaga</h5>
              <div className="space-y-1.5 text-slate-400 text-xs">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                  <span>{alamatLembaga}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{noTelpLembaga}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <span>{emailLembaga}</span>
                </div>
              </div>
            </div>

            {/* Rekening Resmi */}
            <div className="space-y-2">
              <h5 className="font-extrabold text-white text-xs uppercase tracking-wider">Rekening Resmi Pesantren</h5>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-400 font-bold block">{namaBank}</span>
                <div className="font-mono font-bold text-white text-sm">{rekeningBank}</div>
                <p className="text-[10px] text-slate-400">a.n {atasNamaBank}</p>
              </div>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              © {new Date().getFullYear()} {namaLembaga}. Powered by SIPESAND Enterprise V2.
            </div>
            <div className="flex items-center gap-4">
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                Petunjuk Arah (Google Maps)
              </a>
              <span>•</span>
              <button onClick={onLoginPetugas} className="hover:text-white transition-colors font-bold text-blue-400">
                Login Dashboard Petugas
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* ========================================================================= */}
      {/* POP-UP MODAL PENGUMUMAN PENTING (JIKA ADA)                                */}
      {/* ========================================================================= */}
      {isUrgentPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
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
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
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
