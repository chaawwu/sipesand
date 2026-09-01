import React from 'react';
import { 
  Building2, 
  RefreshCcw, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin, 
  FileText 
} from 'lucide-react';
import DeveloperFooter from '../components/DeveloperFooter';

export default function RefundPolicyPage({ onBackToHome }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans text-xs selection:bg-blue-600 selection:text-white">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#1E3A8A]" />
            <span className="font-extrabold text-sm text-slate-900">SiPesand • Kebijakan Pengembalian Dana</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-rose-50 text-rose-800 font-bold text-[10px] uppercase">
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>Refund & Cancellation Policy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Kebijakan Pengembalian Dana (Refund Policy)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Terakhir Diperbarui: 1 September 2026 • King Digital Dev (Platform SiPesand)
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6 text-slate-700 leading-relaxed text-xs sm:text-sm">
          
          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">1</span>
              <span>Ketentuan Umum Layanan Perangkat Lunak (SaaS)</span>
            </h2>
            <p>
              SiPesand adalah produk perangkat lunak berbasis cloud (SaaS) yang dikelola oleh <strong>King Digital Dev</strong>. Layanan ini diberikan dalam bentuk lisensi akses digital (Tahunan atau Lifetime) beserta penyediaan database terisolasi untuk pengelolaan sistem pondok pesantren.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">2</span>
              <span>Syarat & Kondisi Pengajuan Refund</span>
            </h2>
            <p>
              Pengembalian dana (refund) atas pembelian lisensi SiPesand dapat diproses dengan ketentuan sebagai berikut:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>
                <strong>Pembayaran Ganda (*Double Payment*):</strong> Terjadi pemotongan saldo atau transfer berulang untuk nomor invoice yang sama akibat kesalahan teknis sistem pembayaran / jaringan perbankan.
              </li>
              <li>
                <strong>Kegagalan Aktivasi Sistem:</strong> Sistem gagal melakukan auto-provisioning database atau tidak dapat diakses sama sekali dalam waktu <strong>3 x 24 jam</strong> setelah pembayaran terkonfirmasi, dan tim teknis kami tidak dapat menyelesaikan kendala tersebut.
              </li>
              <li>
                <strong>Batas Waktu Pengajuan:</strong> Permohonan pengembalian dana wajib diajukan maksimal dalam waktu <strong>7 (tujuh) hari kalender</strong> sejak tanggal transaksi dilakukan.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">3</span>
              <span>Kondisi yang Tidak Memenuhi Syarat Refund (Non-Refundable)</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Perubahan keputusan sepihak dari pihak yayasan / pesantren setelah sistem berhasil diaktivasi dan digunakan.</li>
              <li>Kelalaian pengguna dalam menjaga kerahasiaan kata sandi atau akun Super Admin yang telah diterbitkan.</li>
              <li>Ketidaksesuaian perangkat keras lokal pengguna (misalnya kartu NFC non-standar ISO atau scanner yang tidak kompatibel) di luar spesifikasi resmi yang telah ditentukan.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">4</span>
              <span>Prosedur dan Alur Pengembalian Dana</span>
            </h2>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Kirimkan email permohonan ke <strong>kingdigitaldev@gmail.com</strong> atau hubungi WhatsApp resmi di <strong>+62 851-2373-4342</strong> dengan subjek: <em>"Pengajuan Refund - [Nomor Invoice] - [Nama Pondok]"</em>.</li>
              <li>Lampirkan bukti transfer sah, nomor rekening pengembalian atas nama yayasan/pemohon yang sama, dan rincian kendala yang dialami.</li>
              <li>Tim keuangan kami akan melakukan audit dan validasi data dalam waktu 1 - 3 hari kerja.</li>
              <li>Dana refund yang disetujui akan ditransfer kembali ke rekening pemohon dalam waktu <strong>3 - 7 hari kerja</strong> setelah verifikasi selesai (dipotong biaya administrasi perbankan/payment gateway jika berlaku).</li>
            </ol>
          </section>

          <section className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#1E3A8A]" />
              <span>Kontak Bantuan Pengembalian Dana</span>
            </h3>
            <p className="text-slate-600 text-xs">
              Untuk informasi lebih lanjut mengenai status pengembalian dana Anda, silakan hubungi tim keuangan resmi King Digital Dev:
            </p>
            <div className="text-xs space-y-1 text-slate-800 font-medium pt-1">
              <div>• <strong>Email:</strong> kingdigitaldev@gmail.com</div>
              <div>• <strong>WhatsApp:</strong> +62 851-2373-4342</div>
              <div>• <strong>Alamat Kantor:</strong> Kencong, Kepung, Kediri, Jawa Timur, Indonesia</div>
            </div>
          </section>

        </div>

      </main>

      <DeveloperFooter />
    </div>
  );
}
