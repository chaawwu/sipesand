import React, { useState } from 'react';
import { 
  Building2, 
  Search, 
  Radio, 
  CreditCard, 
  Receipt, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  Award, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  Users, 
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  BookOpen,
  Clock,
  GraduationCap,
  Sparkles,
  Compass,
  HeartHandshake,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  School,
  FileText,
  Volume2,
  Share2,
  HelpCircle
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function PesantrenTenantHome({
  onLoginPetugas,
  onOpenPortalWali,
  onOpenNfcScanner,
  onExecuteSearch,
  quickQuery,
  setQuickQuery,
  loadingSearch,
  searchError
}) {
  const { settings, isNfcEnabled } = useSettings();
  const [copiedBank, setCopiedBank] = useState(false);
  const [activeTabEdu, setActiveTabEdu] = useState('tahfidz');

  const namaLembaga = settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an Darul Rahman Sumbersari';
  const alamatLembaga = settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur';
  const noWa = settings.WHATSAPP_CENTER || '+62 851-2373-4342';
  const emailLembaga = settings.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com';
  const bankNo = settings.BANK_ACCOUNT_NO || '7192837465';
  const bankName = settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)';
  const bankHolder = settings.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI';
  const namaPengasuh = settings.NAMA_KEPALA_PONDOK || 'K.H. Pengasuh Darul Rahman';
  const namaBendahara = settings.NAMA_BENDAHARA || 'Ustadz Bendahara Darul Rahman, S.E.';

  const handleCopyBank = () => {
    navigator.clipboard.writeText(bankNo);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (onExecuteSearch) {
      onExecuteSearch(quickQuery);
    }
  };

  const handleQuickClick = (name) => {
    if (setQuickQuery) setQuickQuery(name);
    if (onExecuteSearch) onExecuteSearch(name);
  };

  return (
    <div className="font-sans text-slate-900 bg-[#FCFBF7] min-h-screen selection:bg-emerald-600 selection:text-white">
      
      {/* ========================================================================= */}
      {/* 1. TOP ANNOUNCEMENT BAR & INFO PESANTREN                                  */}
      {/* ========================================================================= */}
      <div className="bg-[#0D3B2E] text-white text-[11px] font-medium py-2 px-4 border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Penerimaan Santri Baru (PSB)
            </span>
            <span className="text-emerald-100/90 font-medium">
              Tahun Ajaran 2026/2027 telah dibuka! Kuota Terbatas untuk Program Tahfidz & Diniyah.
            </span>
          </div>
          <div className="flex items-center gap-4 text-emerald-200">
            <a 
              href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}?text=Assalamu'alaikum%2C%20mohon%20informasi%20pendaftaran%20santri%20baru%20Darul%20Rahman`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1 font-semibold"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Hotline PSB: {noWa}</span>
            </a>
            <span className="hidden md:inline text-emerald-700">|</span>
            <span className="hidden md:inline text-emerald-300/80">Sumbersari, Kencong, Kediri</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. NAVBAR UTAMA RESMI PONDOK PESANTREN                                    */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand & Emblem Pesantren */}
          <a href="#" className="flex items-center gap-3.5 group text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#0D3B2E] p-2 flex items-center justify-center shadow-md border border-emerald-700/40 group-hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Logo Darul Rahman" 
                className="w-full h-full object-contain drop-shadow"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<span class="text-white font-black text-lg">DR</span>';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Pesantren Salaf Modern
                </span>
                <span className="text-[10px] text-amber-600 font-bold hidden sm:inline">Kencong • Kediri</span>
              </div>
              <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-800 transition-colors">
                {namaLembaga}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium truncate max-w-[280px] sm:max-w-md">
                Lembaga Pendidikan Islam & Tahfidzul Qur'an 30 Juz
              </p>
            </div>
          </a>

          {/* Navigasi Menu */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#profil" className="hover:text-emerald-800 transition-colors">Profil Pondok</a>
            <a href="#kalam" className="hover:text-emerald-800 transition-colors">Kalam Pengasuh</a>
            <a href="#pendidikan" className="hover:text-emerald-800 transition-colors">Pendidikan</a>
            <a href="#rutinitas" className="hover:text-emerald-800 transition-colors">Kegiatan Santri</a>
            <a href="#fasilitas" className="hover:text-emerald-800 transition-colors">Fasilitas</a>
            <a href="#psb" className="hover:text-emerald-800 transition-colors">PSB Baru</a>
            <a href="#portal-wali" className="hover:text-emerald-800 transition-colors text-emerald-700">Layanan Wali</a>
            <a href="#kontak" className="hover:text-emerald-800 transition-colors">Kontak</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            {isNfcEnabled && (
              <button
                onClick={onOpenNfcScanner}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                title="Tap Reader Kartu Santri KTSD"
              >
                <Radio className="w-3.5 h-3.5 text-emerald-600" />
                <span>Scan KTSD</span>
              </button>
            )}

            <button
              onClick={() => onOpenPortalWali('')}
              className="px-3.5 sm:px-4 py-2 rounded-xl border border-emerald-600 text-emerald-800 bg-emerald-50/60 hover:bg-emerald-100/80 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Portal Wali</span>
            </button>

            <button
              onClick={onLoginPetugas}
              className="px-4 sm:px-5 py-2 rounded-xl bg-[#0D3B2E] hover:bg-[#08261e] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Login Asatidz</span>
            </button>
          </div>

        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO RESMI PESANTREN DARUL RAHMAN                                      */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F2] to-[#FCFBF7] pt-8 sm:pt-14 pb-16 border-b border-stone-200/60">
        
        {/* Decorative Islamic Arch Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Kolom Kiri: Teks & Pelacakan Santri Cepat */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Badge Identitas */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-bold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Selamat Datang di Portal Resmi Pondok Pesantren</span>
              </div>

              {/* Title Utama */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.18]">
                  Mendidik Generasi Qur'ani, <br />
                  <span className="text-emerald-800 underline decoration-amber-400 decoration-wavy decoration-2">
                    Berakhlak Karimah
                  </span> & Berilmu Amaliah
                </h1>
                <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-2xl">
                  <strong>Pondok Pesantren Darul Rahman Sumbersari</strong> memadukan keluhuran tradisi kajian Kitab Kuning (Salafiyah), Tahfidzul Qur'an 30 Juz, serta kurikulum formal terpadu dalam lingkungan asri dan penuh keteladanan di Kencong, Kepung, Kediri.
                </p>
              </div>

              {/* Box Form Cepat Portal Wali Santri */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Layanan Informasi Santri (Portal Wali Online)</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Akses Cepat Real-Time
                  </span>
                </div>

                <form onSubmit={handleSearchSubmit}>
                  <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-emerald-600 focus-within:border-emerald-600 focus-within:bg-white transition-all">
                    <Search className="w-4 h-4 text-slate-400 ml-3 flex-shrink-0" />
                    <input 
                      type="text"
                      value={quickQuery}
                      onChange={(e) => setQuickQuery && setQuickQuery(e.target.value)}
                      placeholder="Masukkan Nama atau NIS Santri (Cek Saku, Izin & SPP)..."
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden px-2 py-2"
                    />
                    <button
                      type="submit"
                      disabled={loadingSearch}
                      className="px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all flex-shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      <span>{loadingSearch ? 'Mencari...' : 'Cari Data'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </form>

                {searchError && (
                  <p className="text-xs font-bold text-rose-600 pl-1">{searchError}</p>
                )}

                {/* Quick Chips Santri */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Contoh Santri Darul Rahman:</span>
                  {['Farhan', 'Aisyah', 'Zaki', 'Fathimah', 'Bilal'].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleQuickClick(name)}
                      className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statistik Utama Pesantren */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-900">500+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Santri Mukim</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-amber-700">30 Juz</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tahfidz Qur'an</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-emerald-900">18+</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Asatidz Pengampu</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 shadow-xs">
                  <div className="text-xl sm:text-2xl font-black text-blue-800">100%</div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cashless KTSD</div>
                </div>
              </div>

            </div>

            {/* Kolom Kanan: Card Visual & Nilai Ruhani Pesantren */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Main Visual Frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
                <img 
                  src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=900&q=80" 
                  alt="Suasana Masjid & Santri Belajar" 
                  className="w-full h-80 sm:h-96 object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-extrabold uppercase tracking-widest self-start mb-2 backdrop-blur-xs">
                    Tradisi Salaf & Tahfidz
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold leading-snug">
                    "Al-Adabu Fauqal 'Ilmi"
                  </h3>
                  <p className="text-xs text-stone-300 font-medium leading-relaxed mt-1">
                    Adab dan budi pekerti luhur ditempatkan di atas segala capaian ilmu pengetahuan, meneladani akhlaq Baginda Nabi Muhammad SAW.
                  </p>
                </div>
              </div>

              {/* Box Quick Link PSB & Kontak Penting */}
              <div className="p-5 rounded-3xl bg-emerald-900 text-white shadow-lg flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
                    Informasi Pendaftaran
                  </div>
                  <div className="text-sm font-black">Penerimaan Santri Baru (PSB)</div>
                  <p className="text-[11px] text-emerald-200">
                    Konsultasi syarat pendaftaran & kuota asrama.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}?text=Assalamu'alaikum%20Panitia%20PSB%20Darul%20Rahman`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                >
                  <span>Chat Panitia</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. SECTION: KALAM PENGASUH PONDOK PESANTREN                                */}
      {/* ========================================================================= */}
      <section id="kalam" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl sm:rounded-4xl p-6 sm:p-12 border border-stone-200/90 shadow-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Foto / Ilustrasi Pengasuh */}
            <div className="lg:col-span-4 flex flex-col items-center text-center space-y-3">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-4 border-emerald-800/20 shadow-xl bg-emerald-950">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80" 
                  alt="K.H. Pengasuh Darul Rahman" 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {namaPengasuh}
                </h3>
                <p className="text-xs font-bold text-emerald-800">
                  Pengasuh Pondok Pesantren Darul Rahman Sumbersari
                </p>
                <span className="text-[11px] text-slate-400 font-medium">Kencong, Kepung, Kediri</span>
              </div>
            </div>

            {/* Kalam & Nasihat Pengasuh */}
            <div className="lg:col-span-8 space-y-4 border-t lg:border-t-0 lg:border-l border-stone-200 pt-6 lg:pt-0 lg:pl-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-extrabold border border-amber-200">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Kalam & Nasihat Pengasuh</span>
              </div>

              <blockquote className="text-base sm:text-xl font-serif italic text-slate-800 leading-relaxed">
                "Pondok pesantren bukan semata-mata tempat menuntut ilmu fiqih atau menghafal bait-bait nadhom, melainkan kawah candradimuka untuk menempa hati dengan keikhlasan, kesederhanaan, dan adab. Di Darul Rahman, kami mendidik santri agar lisannya basah dengan Al-Qur'an, amalnya kokoh dengan sunnah, dan jiwanya siap memberi manfaat bagi umat dan bangsa."
              </blockquote>

              <div className="pt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Dengan bimbingan para asatidz yang mukim 24 jam bersama santri, kami memastikan setiap anak asuh kami mendapatkan perhatian ruhani, ketertiban shalat berjamaah, serta pengawasan perkembangan akademik dan kesehatan yang terpantau secara transparan oleh para orang tua.
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <span>Pantau Santri Anda Sekarang</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SECTION: VISI, MISI & 4 PILAR PESANTREN                                 */}
      {/* ========================================================================= */}
      <section id="profil" className="py-12 bg-stone-100/70 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full">
              Landasan & Jati Diri
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Visi & 4 Karakter Utama Santri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Membangun fondasi karakter santri yang kokoh dalam akidah, mulia dalam akhlak, dan mandiri dalam kehidupan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pilar 1: Tahfidzul Qur'an */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                1. Al-Qur'an & Tahfidz Mutqin
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Membiasakan tilawah, tajwid, tahsin, serta target hafalan 30 Juz dengan metode talaqqi bersanad yang teruji dan istiqomah.
              </p>
            </div>

            {/* Pilar 2: Kajian Kitab Kuning */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                2. Tafaqquh Fiddin Salaf
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kajian mendalam gramatika bahasa Arab (Nahwu-Shorof) dan literatur klasik para ulama mu'tabarah (Fiqih, Hadits, Tasawwuf).
              </p>
            </div>

            {/* Pilar 3: Adab & Akhlaqul Karimah */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-800 font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                3. Adab & Keteladanan
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Penanaman rasa hormat kepada orang tua, guru, serta sesama santri. Sopan santun dalam tutur kata dan kesantunan perilaku.
              </p>
            </div>

            {/* Pilar 4: Kemandirian & Kepemimpinan */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-3 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                4. Mandiri & Berdaya Saing
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Melatih santri hidup mandiri, mengelola uang saku harian secara hemat (cashless), berorganisasi, dan berwawasan digital modern.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SECTION: PROGRAM PENDIDIKAN UNGGULAN                                   */}
      {/* ========================================================================= */}
      <section id="pendidikan" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Kurikulum Terpadu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Jenjang & Program Pendidikan Santri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl">
              Pilihan program pendidikan formal dan kepesantrenan yang saling terintegrasi untuk melahirkan generasi yang utuh lahir dan batin.
            </p>
          </div>

          {/* Tab Filter Button */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200">
            <button
              onClick={() => setActiveTabEdu('tahfidz')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabEdu === 'tahfidz' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahfidzul Qur'an
            </button>
            <button
              onClick={() => setActiveTabEdu('diniyah')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabEdu === 'diniyah' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Madrasah Diniyah
            </button>
            <button
              onClick={() => setActiveTabEdu('formal')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTabEdu === 'formal' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sekolah Formal
            </button>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTabEdu === 'tahfidz' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Program Unggulan Utama</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Tahfidzul Qur'an 30 Juz (Metode Talaqqi & Mutqin)
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Program menghafal Al-Qur'an secara terstruktur yang dibimbing langsung oleh para hafidz-hafidzah berpengalaman. Setiap santri mengikuti halaqah setoran baru (ziyadah) setiap bakda Subuh dan muraja'ah bersama setiap bakda Ashar dan Maghrib.
              </p>
              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Target hafalan terukur (1-3 Juz per tahun sesuai kemampuan santri)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Ujian Tahfidz berkala & Tasmi' 5, 10, 20 hingga 30 Juz Sekali Duduk</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Pencatatan logbook hafalan digital yang dapat dipantau orang tua via Portal Wali</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-100">
                <img 
                  src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=700&q=80" 
                  alt="Muroja'ah Al-Qur'an Santri" 
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {activeTabEdu === 'diniyah' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Salafiyah Tradisional & Dirasah Islamiyah</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Madrasah Diniyah Salafiyah & Pengajian Kitab Kuning
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Membekali santri dengan pemahaman mendalam literatur Islam klasik karya para ulama Salafush Shalih melalui metode wetonan, sorogan, dan bandongan:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-900">Gramatika Bahasa Arab</div>
                  <div className="text-slate-500 text-[11px]">Jurumiyah, Imrithi, Mutammimah, Alfiyah Ibnu Malik</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-900">Fiqih & Ushul Fiqih</div>
                  <div className="text-slate-500 text-[11px]">Safinatun Najah, Mabadi Fiqhiyyah, Taqrib / Fathul Qorib</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-900">Akhlaq & Tasawwuf</div>
                  <div className="text-slate-500 text-[11px]">Washoya, Taisirul Kholaq, Ta'lim Muta'allim, Bidayatul Hidayah</div>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-slate-900">Hadits & Tafsir</div>
                  <div className="text-slate-500 text-[11px]">Arba'in Nawawi, Riyadhus Shalihin, Tafsir Jalalain</div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-amber-100">
                <img 
                  src="https://images.unsplash.com/photo-1532012164546-f432f2e3ddb5?auto=format&fit=crop&w=700&q=80" 
                  alt="Kajian Kitab Kuning" 
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {activeTabEdu === 'formal' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold">
                <School className="w-3.5 h-3.5" />
                <span>Pendidikan Formal Terakreditasi</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Pendidikan Formal SMP-IT & SMA-IT / KMI Terpadu
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pondok Pesantren Darul Rahman menyelenggarakan jenjang pendidikan formal yang terakreditasi resmi dengan integrasi kurikulum Kemendikbudristek dan muatan pesantren unggul:
              </p>
              <div className="space-y-2 pt-2 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Ijazah Resmi Nasional untuk kelanjutan ke Perguruan Tinggi Negeri/Swasta & Luar Negeri</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Laboratorium Komputer, Bahasa Asing (Arab & Inggris aktif), dan Sains Terpadu</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Ekstrakurikuler: Khattil Qur'an, Hadroh Rebana, Seni Bela Diri Pagar Nusa, dan Multimedia</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-lg border-2 border-blue-100">
                <img 
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=700&q=80" 
                  alt="Kegiatan Belajar Formal Santri" 
                  className="w-full h-64 object-cover"
                />
              </div>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================================= */}
      {/* 7. SECTION: RUTINITAS & JADWAL HARIAN SANTRI                               */}
      {/* ========================================================================= */}
      <section id="rutinitas" className="py-14 sm:py-20 bg-stone-100/80 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              Kedisiplinan & Barakah Waktu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Jadwal Rutinitas Harian Santri Darul Rahman
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Setiap detik santri dibimbing dalam bingkai ibadah, tholabul 'ilmi, pembiasaan akhlaq, dan kemandirian hidup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">03.30 - 05.00</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Qiyamul Lail & Shalat Subuh</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Bangun tidur, mandi, Shalat Tahajud berjamaah, doa istighotsah, dan Shalat Subuh berjamaah dilanjutkan wirid Ratib.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">05.00 - 06.30</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Halaqah Tahfidz Pagi</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Setoran hafalan Al-Qur'an baru (ziyadah) kepada ustadz pembina halaqah masing-masing asrama.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">07.00 - 12.30</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Sekolah Formal Terpadu</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Pembelajaran kurikulum formal nasional, praktikum sains, bahasa Arab/Inggris di ruang kelas ber-AC.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">13.00 - 15.00</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Dzuhur & Qailulah (Istirahat)</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shalat Dzuhur berjamaah di Masjid, makan siang bersama di asrama, dan istirahat siang (sunnah qailulah).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">15.30 - 17.00</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Ashar & Kajian Kitab Kuning</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shalat Ashar berjamaah dilanjutkan pengajian wetonan Kitab Fiqih / Hadits bersama Pengasuh dan Asatidz.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">17.30 - 19.30</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Maghrib & Muraja'ah Tahfidz</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shalat Maghrib berjamaah, tilawah surat Waqi'ah bersama, dan muroja'ah hafalan Al-Qur'an secara berpasangan.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">19.30 - 21.00</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Isya & Madrasah Diniyah</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Shalat Isya berjamaah, masuk kelas Madrasah Diniyah Salafiyah (Nahwu, Shorof, Fiqih, Akhlaq).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md">21.00 - 22.00</span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Mudzakarah & Istirahat Malam</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Belajar mandiri (mudzakarah) persiapan pelajaran esok hari, absen malam oleh Kamtib, dan istirahat tidur.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. SECTION: FASILITAS KAMPUS PESANTREN                                     */}
      {/* ========================================================================= */}
      <section id="fasilitas" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Kenyamanan Santri
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Fasilitas Lingkungan Kampus Darul Rahman
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Sarana dan prasarana yang asri, bersih, dan mendukung pembiasaan hidup sehat santri.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80" 
                alt="Masjid Jami' Darul Rahman" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <h4 className="font-bold text-base text-slate-900">Masjid Jami' Pusat Ibadah</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Masjid berarsitektur luas dan sejuk sebagai pusat shalat berjamaah 5 waktu, pengajian kitab, dan halaqah tahfidz santri.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80" 
                alt="Asrama Santri" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <h4 className="font-bold text-base text-slate-900">Asrama Santri Putra & Putri</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kompleks asrama terpisah dengan sirkulasi udara baik, lemari santri standar, dan didampingi ustadz pembina kamar 24 jam.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80" 
                alt="Perpustakaan Kitab Salaf" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <h4 className="font-bold text-base text-slate-900">Perpustakaan & Maktabah Salaf</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Koleksi kitab kuning klasik berbagai fan keilmuan Islam, buku referensi umum, kamus Arab-Indonesia, dan ruang baca hening.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=600&q=80" 
                alt="Kantin & Koperasi Cashless" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-base text-slate-900">Koperasi & Kantin Cashless</h4>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">KTSD RFID</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penyediaan kebutuhan santri yang higienis tanpa transaksi tunai (uang kertas) untuk mendidik santri hemat dan anti-kehilangan.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80" 
                alt="Lapangan Olahraga" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <h4 className="font-bold text-base text-slate-900">Lapangan Olahraga Santri</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sarana lapangan futsal, voli, bulutangkis, dan area latihan seni bela diri Pagar Nusa santri di sore hari.
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-stone-200/90 overflow-hidden shadow-xs group">
            <div className="h-48 overflow-hidden bg-slate-900">
              <img 
                src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80" 
                alt="Poskestren" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 space-y-2">
              <h4 className="font-bold text-base text-slate-900">Pos Kesehatan Pesantren (Poskestren)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ruang medis pertolongan pertama didukung tenaga medis dan rujukan cepat ke Puskesmas/RS terdekat bagi santri yang sakit.
              </p>
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 9. SECTION: LAYANAN DIGITAL WALI SANTRI (PORTAL INTEGRASI)                 */}
      {/* ========================================================================= */}
      <section id="portal-wali" className="py-14 sm:py-20 bg-[#0D3B2E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-bold border border-emerald-700/50">
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Transparansi & Kemudahan Wali Santri</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Portal Monitoring Santri Online <br />
                <span className="text-amber-400">Bebas Akses Tanpa Perlu Akun Rumit</span>
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed">
                Kami memahami rasa rindu dan kepedulian bapak/ibu wali santri. Melalui Portal Wali Darul Rahman, perkembangan ananda di pesantren dapat dicek kapan saja secara transparan langsung dari ponsel Anda.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">1</div>
                  <div>
                    <strong className="block text-white">Pantau Saldo & Transaksi Uang Saku</strong>
                    <span className="text-emerald-200/80 text-[11px]">Ketahui riwayat jajan ananda di kantin/koperasi secara mendetail.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">2</div>
                  <div>
                    <strong className="block text-white">Status Izin Keluar & Keamanan (Kamtib)</strong>
                    <span className="text-emerald-200/80 text-[11px]">Cek apakah santri sedang berada di dalam asrama atau sedang izin keluar resmi.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-400 font-bold flex-shrink-0">3</div>
                  <div>
                    <strong className="block text-white">Rincian SPP / Syahriyah & Kwitansi</strong>
                    <span className="text-emerald-200/80 text-[11px]">Cek tagihan bulanan dan unduh bukti kwitansi sah berstempel resmi.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => onOpenPortalWali('')}
                  className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Buka Portal Wali Santri Sekarang</span>
                </button>
              </div>
            </div>

            {/* Kolom Kanan: Card Rekening Resmi BSI */}
            <div className="lg:col-span-6">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-emerald-700/40 space-y-5">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                      Rekening Resmi Pesantren
                    </span>
                    <h4 className="text-base font-black text-slate-900">
                      Pembayaran Syahriyah & Infaq
                    </h4>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
                    <Receipt className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-[11px] text-slate-500 font-medium">Bank Penerima:</div>
                  <div className="text-sm font-black text-slate-900">{bankName}</div>
                  
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-500 font-medium">Nomor Rekening:</div>
                    <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-stone-300">
                      <span className="font-mono text-lg font-black text-emerald-900 tracking-wider">
                        {bankNo}
                      </span>
                      <button
                        onClick={handleCopyBank}
                        className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {copiedBank ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedBank ? 'Tersalin' : 'Salin'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="text-[11px] text-slate-500 font-medium">Atas Nama:</div>
                    <div className="text-xs font-bold text-slate-800 uppercase">{bankHolder}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 leading-relaxed italic">
                  *Penting: Pastikan transfer pembayaran Syahriyah atau uang saku hanya ditujukan ke rekening resmi Yayasan di atas untuk menghindari segala bentuk penipuan.
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. SECTION: PENERIMAAN SANTRI BARU (PSB)                                 */}
      {/* ========================================================================= */}
      <section id="psb" className="py-14 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl sm:rounded-4xl bg-gradient-to-br from-[#FAF8F2] to-white border border-stone-200/90 p-6 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Penerimaan Santri Baru (PSB) Tahun Ajaran 2026/2027</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Bergabunglah Bersama Keluarga Besar Darul Rahman
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pondok Pesantren Darul Rahman Sumbersari membuka pendaftaran santri baru untuk jenjang Tahfidzul Qur'an, Madrasah Diniyah, serta jenjang formal SMP-IT & SMA-IT / KMI.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">Tahap 1</span>
                  <div className="font-bold text-slate-900 mt-1">Pendaftaran Online / Offline</div>
                  <div className="text-slate-500 text-[11px]">Mengisi formulir & menyerahkan berkas administrasi.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">Tahap 2</span>
                  <div className="font-bold text-slate-900 mt-1">Tes Baca Al-Qur'an & Wawancara</div>
                  <div className="text-slate-500 text-[11px]">Pemetaan awal kemampuan makharijul huruf & adab.</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-stone-200">
                  <span className="text-[10px] font-black text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">Tahap 3</span>
                  <div className="font-bold text-slate-900 mt-1">Daftar Ulang & Masuk Asrama</div>
                  <div className="text-slate-500 text-[11px]">Pembagian kamar asrama dan kartu tanda santri (KTSD).</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3">
              <a
                href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}?text=Assalamu'alaikum%20Ustadz%20Panitia%20PSB%2C%20saya%20ingin%20mendaftarkan%20putra%2Fputri%20ke%20Pondok%20Pesantren%20Darul%20Rahman.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
              >
                <Phone className="w-4 h-4" />
                <span>Daftar via WhatsApp Sekarang</span>
              </a>

              <a
                href="#kontak"
                className="w-full py-3 px-5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs transition-colors text-center"
              >
                Lihat Alamat & Lokasi Pesantren
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. SECTION: KONTAK RESMI, LOKASI & SEKRETARIAT                           */}
      {/* ========================================================================= */}
      <section id="kontak" className="py-14 sm:py-20 bg-stone-100/90 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Saluran Komunikasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Kontak & Lokasi Pondok Pesantren
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Silaturahim dan kunjungan terbuka setiap hari pada jam dinas kantor sekretariat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-800 mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="font-black text-slate-900 text-sm">Alamat Lengkap</div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {alamatLembaga}
              </p>
              <span className="inline-block text-slate-400 text-[10px]">Kediri, Jawa Timur - Indonesia</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 mb-2">
                <Phone className="w-5 h-5" />
              </div>
              <div className="font-black text-slate-900 text-sm">WhatsApp & Telepon</div>
              <div className="space-y-1 text-slate-600 text-[11px]">
                <a 
                  href={`https://wa.me/${noWa.replace(/[^0-9]/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <span>{noWa}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="block text-slate-400 text-[10px]">Layanan Aktif: 07.30 - 16.30 WIB</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 mb-2">
                <Mail className="w-5 h-5" />
              </div>
              <div className="font-black text-slate-900 text-sm">Email Resmi Lembaga</div>
              <p className="text-slate-600 text-[11px] font-mono break-all">
                {emailLembaga}
              </p>
              <span className="inline-block text-slate-400 text-[10px]">Surat masuk & kerja sama pendidikan</span>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-800 mb-2">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="font-black text-slate-900 text-sm">Pimpinan & Kepengurusan</div>
              <div className="text-slate-700 text-[11px] leading-relaxed space-y-0.5">
                <span className="block font-bold">{namaPengasuh}</span>
                <span className="block text-slate-500 text-[10.5px]">Bendahara: {namaBendahara}</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 12. FOOTER RESMI KHUSUS PESANTREN DARUL RAHMAN                            */}
      {/* ========================================================================= */}
      <footer className="bg-[#07241C] text-stone-300 py-10 px-4 text-xs border-t border-emerald-900/60">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-6 border-b border-emerald-900/50 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 p-1.5 flex items-center justify-center text-white font-bold">
                <img 
                  src="/logo.png" 
                  alt="Logo Pesantren" 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
              <div>
                <h4 className="font-black text-white text-sm tracking-tight">{namaLembaga}</h4>
                <p className="text-[11px] text-emerald-200/70">{taglineLembaga}</p>
              </div>
            </div>

            <div className="flex items-center gap-5 font-semibold text-xs text-emerald-200">
              <a href="#profil" className="hover:text-white transition-colors">Profil</a>
              <a href="#pendidikan" className="hover:text-white transition-colors">Pendidikan</a>
              <a href="#fasilitas" className="hover:text-white transition-colors">Fasilitas</a>
              <a href="#psb" className="hover:text-white transition-colors">PSB</a>
              <button onClick={() => onOpenPortalWali('')} className="hover:text-amber-400 text-amber-300 transition-colors cursor-pointer">Portal Wali</button>
              <button onClick={onLoginPetugas} className="hover:text-amber-400 text-amber-300 transition-colors cursor-pointer">Login Asatidz</button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400 text-center sm:text-left">
            <div>
              <span>© {new Date().getFullYear()} {namaLembaga}. Seluruh Hak Cipta Dilindungi.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sistem Informasi Mandiri Santri Terpadu</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
