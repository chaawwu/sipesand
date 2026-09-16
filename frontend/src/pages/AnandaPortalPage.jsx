import React, { useState } from 'react';
import {
  Download,
  Smartphone,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Clock,
  BookOpen,
  Calendar,
  FileText,
  Search,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  ArrowRight,
  QrCode,
  Award,
  HelpCircle,
  Check,
  Users,
  Wallet,
  Building2,
  Lock
} from 'lucide-react';

export default function AnandaPortalPage({ onOpenPortalWali, onBackToHome }) {
  const [searchQuery, setSearchQuery] = useState('');

  const quickServices = [
    { label: 'Profil Santri', icon: '👤' },
    { label: 'Uang Saku', icon: '💰' },
    { label: 'Pembayaran SPP', icon: '💳' },
    { label: 'Kwitansi Resmi', icon: '🧾' },
    { label: 'Top Up Saku', icon: '⚡' },
    { label: 'Jadwal Pondok', icon: '📅' },
    { label: 'Nilai Rapor', icon: '📊' },
    { label: 'Presensi Sholat', icon: '🕌' },
    { label: 'Tahfidz Qur\'an', icon: '📖' },
    { label: 'Izin Pulang', icon: '🛂' },
    { label: 'Laporan Finansial', icon: '📈' },
    { label: 'Pengumuman', icon: '📢' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onOpenPortalWali) {
      onOpenPortalWali(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans flex flex-col selection:bg-amber-100 selection:text-amber-900">
      
      {/* 1. Header Navigasi Utama */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E2B4D] to-[#3E4095] flex items-center justify-center text-white font-black text-xl shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-[#1E2B4D]">ANANDA</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                  Wali Santri
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Dekat dengan Ananda, di mana pun berada
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onOpenPortalWali && onOpenPortalWali('')}
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-semibold text-[#1E2B4D] hover:bg-slate-100 rounded-xl transition"
            >
              Akses Portal Web
            </button>
            <a
              href="https://github.com/chaawwu/sipesand/releases/download/v1.6.0-ananda/ananda-wali-sipesand.apk"
              download
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#1E2B4D] to-[#3E4095] hover:opacity-95 rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Aplikasi</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1E2B4D] via-[#24335F] to-[#3E4095] text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
          <div className="absolute top-1/2 -right-24 w-96 h-96 rounded-full bg-[#E8B44D] blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Sisi Kiri: Deskripsi & Tombol Unduh */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Aplikasi Resmi Wali Santri Pesantren</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Dekat dengan Ananda, <br className="hidden sm:inline" />
                <span className="text-amber-400">di mana pun berada.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Aplikasi mobile resmi bagi orang tua santri untuk memantau capaian hafalan Al-Qur'an, perkembangan akademik, uang saku harian, dan pembayaran pendidikan secara mudah, transparan, dan terpercaya.
              </p>

              {/* Box Unduh Utama */}
              <div className="p-6 rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 max-w-xl mx-auto lg:mx-0 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://github.com/chaawwu/sipesand/releases/download/v1.6.0-ananda/ananda-wali-sipesand.apk"
                    download
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-3 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base shadow-lg transition"
                  >
                    <Download className="w-5 h-5 text-slate-950" />
                    <div className="text-left">
                      <div className="text-sm font-black">Unduh Aplikasi Android</div>
                      <div className="text-[11px] font-medium text-slate-800">Berkas Instalasi APK Resmi • Versi Terbaru</div>
                    </div>
                  </a>

                  <a
                    href="#panduan-instalasi"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/25 transition"
                  >
                    <span>Panduan Pasang</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-slate-200 pt-1">
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Kompatibel Seluruh HP Android</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Pembayaran Online Otomatis</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Akses Data Real-Time</span>
                  </span>
                </div>
              </div>

              {/* Form Cek Data Santri Cepat di Web */}
              <div className="max-w-xl mx-auto lg:mx-0 pt-2">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Ingin cek data langsung tanpa instalasi aplikasi?
                </p>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan Nomor Induk Santri (NIS) atau Nama..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition border border-white/30 whitespace-nowrap"
                  >
                    Cek Data
                  </button>
                </form>
              </div>

            </div>

            {/* Sisi Kanan: Tampilan Aplikasi ANANDA */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-[320px] sm:w-[340px] bg-slate-900 p-3 rounded-[38px] shadow-2xl border-4 border-slate-700/60 relative">
                {/* Speaker Notch */}
                <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-700"></div>
                </div>

                {/* Layar Aplikasi ANANDA */}
                <div className="w-full bg-[#F5F7FA] rounded-[28px] overflow-hidden text-slate-800 text-xs shadow-inner flex flex-col h-[580px]">
                  
                  {/* Header Biru-Ungu Melengkung */}
                  <div className="bg-gradient-to-r from-[#1E2B4D] to-[#3E4095] text-white p-4 rounded-b-[24px] shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-400 flex items-center justify-center text-slate-950 font-black text-xs">
                          A
                        </div>
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">ANANDA</div>
                          <div className="text-[9px] text-amber-300">Pondok Pesantren</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                        🔔
                      </div>
                    </div>

                    {/* Card Profil Santri */}
                    <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-amber-400 overflow-hidden flex items-center justify-center text-slate-900 font-bold text-xs">
                        AZ
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate text-[11px]">Ahmad Zaky Al-Faruq</div>
                        <div className="text-[9px] text-slate-200">Kelas 3 Wustha • Asrama Abu Bakar 02</div>
                        <div className="text-[9px] text-amber-300 font-medium">Musyrif: Ust. Mansur</div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Ringkasan Finansial Santri */}
                    <div className="bg-white p-3 rounded-[18px] border border-slate-200 shadow-xs space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span>Saldo Uang Saku</span>
                        <span className="text-emerald-600 font-bold">Kantin Terintegrasi</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-black text-[#1E2B4D]">Rp 385.000</span>
                        <button className="px-2.5 py-1 rounded-lg bg-[#1E2B4D] text-white text-[10px] font-bold">
                          + Top Up
                        </button>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                        <span className="text-slate-600">Tagihan SPP: <b>Rp 450.000</b></span>
                        <span className="text-amber-600 font-bold">Menunggu Bayar</span>
                      </div>
                    </div>

                    {/* Layanan Utama */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 mb-2">Layanan Utama</div>
                      <div className="grid grid-cols-3 gap-2">
                        {quickServices.slice(0, 6).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded-xl border border-slate-100 shadow-2xs flex flex-col items-center justify-center text-center space-y-1"
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="text-[9px] font-semibold text-slate-700 leading-tight">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status Perizinan Santri */}
                    <div className="bg-emerald-50/80 p-2.5 rounded-[14px] border border-emerald-200 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-emerald-950">Izin Kunjungan Disetujui</div>
                        <div className="text-[8px] text-emerald-700">Tunjukkan barcode saat penjemputan</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Navigasi Bawah */}
                  <div className="bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center text-[9px] text-slate-500 font-medium">
                    <div className="flex flex-col items-center text-[#1E2B4D] font-bold">
                      <span className="text-xs">🏠</span>
                      <span>Beranda</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">📅</span>
                      <span>Jadwal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">💬</span>
                      <span>Pesan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">💳</span>
                      <span>Keuangan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">📋</span>
                      <span>Perizinan</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Layanan Unggulan Wali Santri */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-[#1E2B4D] tracking-wider uppercase px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
            Layanan Terpadu Wali Santri
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Kemudahan Menemani Tumbuh Kembang Ananda di Pesantren
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Memberikan ketenangan hati dan kemudahan akses informasi pendidikan bagi orang tua santri secara transparan dan akurat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Saldo Saku */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
              💰
            </div>
            <h3 className="text-lg font-bold text-slate-900">Tabungan & Uang Saku Digital</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pantau saldo dan riwayat transaksi jajan santri di kantin pesantren. Terintegrasi kartu santri cerdas untuk melatih ananda mengelola pengeluaran harian secara hemat dan teratur.
            </p>
          </div>

          {/* Card 2: Pembayaran SPP */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              💳
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pembayaran Tagihan Online</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bayar SPP syahriyah bulanan, uang asrama, kitab, dan daftar ulang secara praktis melalui QRIS dan Virtual Account bank nasional (BSI, Mandiri, BCA, BRI) dengan verifikasi otomatis.
            </p>
          </div>

          {/* Card 3: Kwitansi Resmi */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
              🧾
            </div>
            <h3 className="text-lg font-bold text-slate-900">Kwitansi Sah & Riwayat Pembayaran</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dapatkan bukti setor resmi berbarcode validasi untuk setiap pembayaran yang berhasil. Dokumen dapat disimpan dalam format PDF atau dicetak kapan saja sebagai arsip keluarga.
            </p>
          </div>

          {/* Card 4: Perizinan Pulang */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xl">
              🛂
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pengajuan Izin & Sambangan</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ajukan permohonan kunjungan keluarga atau kepulangan santri secara daring dari rumah. Dilengkapi kode verifikasi digital untuk kemudahan akses santri di pos keamanan pesantren.
            </p>
          </div>

          {/* Card 5: Chat Musyrif */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 text-teal-800 flex items-center justify-center font-bold text-xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-slate-900">Komunikasi dengan Musyrif Kamar</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Saluran pesan resmi untuk menanyakan kabar, menitipkan kebutuhan, atau berkonsultasi mengenai perkembangan karakter dan ibadah ananda langsung dengan pembina asrama.
            </p>
          </div>

          {/* Card 6: Tahfidz & Akademik */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-800 flex items-center justify-center font-bold text-xl">
              📖
            </div>
            <h3 className="text-lg font-bold text-slate-900">Mutaba'ah Tahfidz & Rapor Belajar</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pantau capaian setoran hafalan Al-Qur'an, hafalan bait nadzom salaf, kehadiran sholat berjamaah, serta rekapitulasi nilai evaluasi madrasah diniyah santri setiap semester.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Panduan Pemasangan Aplikasi */}
      <section id="panduan-instalasi" className="bg-white border-y border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-blue-700 tracking-wider uppercase px-3 py-1 bg-blue-50 rounded-full">
              Langkah Mudah
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Panduan Pemasangan Aplikasi di HP Android
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Ikuti tiga langkah sederhana berikut untuk memasang aplikasi ANANDA di smartphone Anda:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#1E2B4D] text-white font-black text-sm flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base">Unduh Berkas APK</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tekan tombol unduh di halaman ini. Berkas resmi aplikasi ANANDA akan tersimpan di folder unduhan HP Anda.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#1E2B4D] text-white font-black text-sm flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base">Buka & Pasang</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka berkas unduhan, lalu pilih <b>Instal / Pasang</b>. Aktifkan izin instalasi aplikasi dari browser jika diminta oleh sistem HP.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 text-center">
              <div className="w-10 h-10 rounded-full bg-[#1E2B4D] text-white font-black text-sm flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base">Masuk & Pantau</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka aplikasi ANANDA, lalu masukkan nomor WhatsApp wali santri yang telah terdaftar di pondok pesantren untuk mulai menggunakan.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1E2B4D] to-[#3E4095] text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <h4 className="text-lg font-bold">Siap terhubung lebih dekat dengan ananda?</h4>
              <p className="text-xs text-slate-200 mt-1">
                Dapatkan kemudahan informasi pendidikan dan administrasi santri secara langsung.
              </p>
            </div>
            <a
              href="https://github.com/chaawwu/sipesand/releases/download/v1.6.0-ananda/ananda-wali-sipesand.apk"
              download
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm shadow-md transition whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Unduh Berkas APK Sekarang</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Tanya Jawab Umum (FAQ Ringkas) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Informasi penting seputar akses dan penggunaan layanan ANANDA
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-amber-500 font-black">Q.</span>
              <span>Apakah aplikasi ANANDA dapat digunakan di semua tipe HP Android?</span>
            </h3>
            <p className="text-xs text-slate-600 pl-5 leading-relaxed">
              Ya, aplikasi ANANDA kompatibel dengan seluruh merk smartphone Android (seperti Samsung, Oppo, Vivo, Xiaomi, Realme, Infinix, dan lainnya) mulai dari Android versi 8.0 ke atas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-amber-500 font-black">Q.</span>
              <span>Bagaimana jika nomor WhatsApp saya belum terdaftar di pesantren?</span>
            </h3>
            <p className="text-xs text-slate-600 pl-5 leading-relaxed">
              Pastikan nomor kontak Anda telah diperbarui pada data induk santri melalui bagian tata usaha atau bendahara pondok pesantren agar sistem dapat mengirimkan verifikasi akses ke nomor Anda.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span className="text-amber-500 font-black">Q.</span>
              <span>Apakah saya tetap dapat memeriksa informasi santri jika tidak mengunduh aplikasi?</span>
            </h3>
            <p className="text-xs text-slate-600 pl-5 leading-relaxed">
              Tentu. Anda dapat menggunakan menu <b>Akses Portal Web</b> atau formulir <b>Pencarian Data Santri</b> di halaman ini untuk mengecek informasi santri langsung melalui browser tanpa perlu menginstal aplikasi.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Footer Resmi */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-10 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
              A
            </div>
            <span className="font-extrabold text-white text-sm tracking-tight">ANANDA</span>
          </div>
          <p className="text-slate-300 font-medium max-w-md mx-auto">
            Aplikasi Resmi Layanan & Komunikasi Wali Santri Pondok Pesantren
          </p>
          <p className="text-slate-500">
            Terhubung langsung dengan ekosistem digital layanan pesantren SiPesand
          </p>
          <div className="pt-4 border-t border-slate-800 text-slate-500">
            © {new Date().getFullYear()} Ekosistem SiPesand. Hak Cipta Dilindungi.
          </div>
        </div>
      </footer>

    </div>
  );
}
