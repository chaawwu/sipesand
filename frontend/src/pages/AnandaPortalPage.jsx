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
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';

export default function AnandaPortalPage({ onOpenPortalWali, onBackToHome }) {
  const [searchQuery, setSearchQuery] = useState('');

  const quickAccessItems = [
    { label: 'Profil Santri', icon: '👤' },
    { label: 'Uang Saku', icon: '💰' },
    { label: 'Pembayaran', icon: '💳' },
    { label: 'Kwitansi Sah', icon: '🧾' },
    { label: 'Top Up Saku', icon: '⚡' },
    { label: 'Jadwal Pondok', icon: '📅' },
    { label: 'Nilai Rapor', icon: '📊' },
    { label: 'Absensi Sholat', icon: '🕌' },
    { label: 'Tahfidz Qur\'an', icon: '📖' },
    { label: 'Izin Pulang', icon: '🛂' },
    { label: 'Laporan Keuangan', icon: '📈' },
    { label: 'Pengumuman', icon: '📢' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onOpenPortalWali) {
      onOpenPortalWali(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans flex flex-col">
      {/* 1. Header Navigasi Resmi */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E2B4D] to-[#3E4095] flex items-center justify-center text-white font-black text-xl shadow-md">
              A
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-[#1E2B4D]">ANANDA</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
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
              className="px-4 py-2 text-sm font-semibold text-[#1E2B4D] hover:bg-slate-100 rounded-xl transition"
            >
              Portal Wali Web
            </button>
            <a
              href="https://github.com/chaawwu/sipesand/releases/download/v1.5.0-ananda/ananda-wali-sipesand.apk"
              download
              className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-[#1E2B4D] to-[#3E4095] hover:opacity-95 rounded-xl shadow-md transition"
            >
              <Download className="w-4 h-4" />
              <span>Unduh APK (4.75 MB)</span>
            </a>
          </div>
        </div>
      </header>

      {/* 2. Hero Section dengan Tema Biru-Ungu & Mockup Native */}
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
                <ShieldCheck className="w-4 h-4" />
                <span>Aplikasi Resmi Wali Santri • Bebas Parse Error</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                Dekat dengan Ananda, <br className="hidden sm:inline" />
                <span className="text-amber-400">di mana pun berada.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-200 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Aplikasi Android Native modern khusus Wali Santri yang terhubung langsung dengan sistem manajemen pesantren SiPesand. Pantau saldo saku, bayar SPP via PaymentKu, ajukan izin santri, dan hubungi musyrif secara real-time.
              </p>

              {/* Box Unduh Utama */}
              <div className="p-6 rounded-[18px] bg-white/10 backdrop-blur-md border border-white/20 max-w-xl mx-auto lg:mx-0 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href="https://github.com/chaawwu/sipesand/releases/download/v1.5.0-ananda/ananda-wali-sipesand.apk"
                    download
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center space-x-3 px-6 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base shadow-lg transition"
                  >
                    <Download className="w-5 h-5 text-slate-950" />
                    <div className="text-left">
                      <div className="text-sm font-black">Unduh ANANDA APK</div>
                      <div className="text-[11px] font-medium text-slate-800">Versi 1.5.0 • 4.75 MB (Multi-DEX)</div>
                    </div>
                  </a>

                  <a
                    href="https://github.com/chaawwu/sipesand/releases"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-sm border border-white/25 transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>GitHub Release</span>
                  </a>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-4 text-xs text-slate-300">
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Android 8.0 - 14+</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PaymentKu.com Ready</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Sanctum Secured</span>
                  </span>
                </div>
              </div>

              {/* Form Cek Data Santri Cepat di Web */}
              <div className="max-w-xl mx-auto lg:mx-0 pt-2">
                <p className="text-xs font-semibold text-slate-300 mb-2">
                  Atau cek data santri langsung melalui browser (tanpa install APK):
                </p>
                <form onSubmit={handleSearchSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Masukkan NIS atau Nama Santri..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-sm font-bold transition border border-white/30"
                  >
                    Cari Santri
                  </button>
                </form>
              </div>

            </div>

            {/* Sisi Kanan: Live Mockup Smartphone ANANDA (95% Desain Referensi) */}
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
                          <div className="text-[9px] text-amber-300">Darul Rahman</div>
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                        🔔
                      </div>
                    </div>

                    {/* Card Profil Santri Ringkas */}
                    <div className="bg-white/10 backdrop-blur-sm p-2.5 rounded-xl border border-white/20 flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-full bg-amber-200 border-2 border-amber-400 overflow-hidden flex items-center justify-center text-slate-900 font-bold text-xs">
                        AZ
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-white truncate text-[11px]">Ahmad Zaky Al-Faruq</div>
                        <div className="text-[9px] text-slate-200">Kelas 3 Wustha • Kamar Abu Bakar 02</div>
                        <div className="text-[9px] text-amber-300 font-medium">Musyrif: Ust. Mansur</div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Content Mockup */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Financial Card (18dp) */}
                    <div className="bg-white p-3 rounded-[18px] border border-slate-200 shadow-sm space-y-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                        <span>Saldo Uang Saku</span>
                        <span className="text-emerald-600 font-bold">Kantin RFID Aktif</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-base font-black text-[#1E2B4D]">Rp 385.000</span>
                        <button className="px-2.5 py-1 rounded-lg bg-[#1E2B4D] text-white text-[10px] font-bold">
                          + Top Up
                        </button>
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
                        <span className="text-slate-600">Tagihan SPP: <b>Rp 450.000</b></span>
                        <span className="text-rose-600 font-bold">Belum Bayar</span>
                      </div>
                    </div>

                    {/* Quick Access 3 Kolom */}
                    <div>
                      <div className="text-[10px] font-bold text-slate-700 mb-2">Akses Cepat (3 Kolom)</div>
                      <div className="grid grid-cols-3 gap-2">
                        {quickAccessItems.slice(0, 6).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center space-y-1 hover:border-blue-200 transition"
                          >
                            <span className="text-base">{item.icon}</span>
                            <span className="text-[9px] font-semibold text-slate-700 leading-tight">
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Status Perizinan */}
                    <div className="bg-blue-50/70 p-2.5 rounded-[14px] border border-blue-100 flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-blue-950">Izin Pulang Disetujui</div>
                        <div className="text-[8px] text-blue-700">QR Gate Satpam siap digunakan</div>
                      </div>
                    </div>
                  </div>

                  {/* 5 Menu Bottom Navigation */}
                  <div className="bg-white border-t border-slate-200 px-2 py-1.5 flex justify-around items-center text-[9px] text-slate-500 font-medium">
                    <div className="flex flex-col items-center text-blue-800 font-bold">
                      <span className="text-xs">🏠</span>
                      <span>Beranda</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">📅</span>
                      <span>Jadwal</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs">💬</span>
                      <span>Chat</span>
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

      {/* 3. Fitur Utama Ekosistem ANANDA (Card Putih Rounded 18dp) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-bold text-blue-800 tracking-wider uppercase px-3 py-1 bg-blue-100 rounded-full">
            Fitur Terpadu Wali Santri
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transparansi Penuh Pendidikan & Kesejahteraan Ananda
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Seluruh data disinkronkan secara aman dari database Laravel SiPesand menggunakan otentikasi Sanctum dan gateway PaymentKu.com.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Saldo Saku */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xl">
              💰
            </div>
            <h3 className="text-lg font-bold text-slate-900">Uang Saku & Kantin Cashless</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pantau jatah harian dan riwayat belanja ananda di kantin pondok berbasis kartu santri RFID. Cegah uang hilang dan ajarkan hemat.
            </p>
          </div>

          {/* Card 2: Pembayaran SPP */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl">
              💳
            </div>
            <h3 className="text-lg font-bold text-slate-900">PaymentKu Gateway Otomatis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Bayar SPP bulanan, uang kitab, dan donasi pembangunan langsung diverifikasi otomatis via QRIS, Virtual Account BCA, Mandiri, BSI, & BRI.
            </p>
          </div>

          {/* Card 3: Kwitansi Resmi */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xl">
              🧾
            </div>
            <h3 className="text-lg font-bold text-slate-900">Kwitansi Digital Sah & PDF</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dapatkan bukti bayar resmi berstempel yayasan dan ber-barcode validasi yang dapat diunduh atau dicetak kapan saja sebagai bukti sah.
            </p>
          </div>

          {/* Card 4: Perizinan Pulang */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xl">
              🛂
            </div>
            <h3 className="text-lg font-bold text-slate-900">Izin Pulang & Barcode Satpam</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ajukan perizinan sambangan atau liburan secara online. Barcode digital discan oleh pos keamanan gerbang saat santri keluar dan kembali.
            </p>
          </div>

          {/* Card 5: Chat Musyrif */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-xl">
              💬
            </div>
            <h3 className="text-lg font-bold text-slate-900">Room Chat Musyrif (WA-Style)</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tanyakan kabar, titip pesan pakaian/obat, atau konsultasi perkembangan akhlak santri langsung ke musyrif kamar dengan format chat familiar.
            </p>
          </div>

          {/* Card 6: Tahfidz & Akademik */}
          <div className="bg-white p-6 rounded-[18px] border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xl">
              📖
            </div>
            <h3 className="text-lg font-bold text-slate-900">Mutaba'ah Tahfidz & Rapor</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pantau capaian setoran juz Al-Qur'an, hafalan nadzom Alfiyah/Imrithi, serta nilai ujian madrasah diniyah santri setiap semester.
            </p>
          </div>

        </div>
      </section>

      {/* 4. Panduan Pemasangan APK Tanpa Kendala */}
      <section className="bg-white border-y border-slate-200 py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900">
                Mengapa ANANDA Bebas dari "Kesalahan Penguraian Paket"?
              </h3>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Berkas distribusi <b>ananda-wali-sipesand.apk</b> telah dikompilasi secara penuh (*Native Android Multi-DEX*) berukuran <b>4.75 MB</b> dengan sertifikat keamanan terverifikasi, bukan berkas source code mentah. Dapat langsung diinstal di seluruh ponsel Android mulai versi 8.0 Oreo hingga Android 14+.
              </p>
            </div>
            <a
              href="https://github.com/chaawwu/sipesand/releases/download/v1.5.0-ananda/ananda-wali-sipesand.apk"
              download
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-[#1E2B4D] hover:bg-[#2A3370] text-white font-bold text-sm shadow-md transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Unduh APK Sekarang (4.75 MB)</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Footer Sederhana & Ramah */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 px-4 text-center text-xs">
        <div className="max-w-7xl mx-auto space-y-2">
          <p className="font-semibold text-slate-300">
            ANANDA • Aplikasi Khusus Wali Santri — Ekosistem SiPesand
          </p>
          <p>
            Terhubung langsung dengan backend resmi di <span className="text-amber-400">anandaby.sipesand.web.id</span>
          </p>
          <p className="text-slate-500 pt-2">
            © {new Date().getFullYear()} SiPesand Ecosystem. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
