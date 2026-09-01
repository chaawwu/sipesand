import React from 'react';
import { 
  Building2, 
  FileText, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';
import DeveloperFooter from '../components/DeveloperFooter';

export default function TermsConditionsPage({ onBackToHome }) {
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
            <span className="font-extrabold text-sm text-slate-900">SiPesand • Syarat & Ketentuan</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-[#1E3A8A] font-bold text-[10px] uppercase">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal & Agreement</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Syarat & Ketentuan Layanan (Terms & Conditions)
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
              <span>Pendahuluan & Penerimaan Syarat</span>
            </h2>
            <p>
              Selamat datang di <strong>SiPesand</strong> (Sistem Informasi & Manajemen Terpadu Pesantren Digital). Layanan ini disediakan dan dikelola sepenuhnya oleh <strong>King Digital Dev</strong> yang beralamat di Kencong, Kepung, Kediri, Jawa Timur.
            </p>
            <p>
              Dengan mendaftar, mengakses, atau menggunakan platform SiPesand (melalui domain sipesand.web.id maupun seluruh subdomain mitra resminya), Anda menyetujui untuk terikat secara hukum oleh Syarat dan Ketentuan ini.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">2</span>
              <span>Definisi Layanan & Lisensi Multi-Tenant</span>
            </h2>
            <p>
              SiPesand menyediakan platform perangkat lunak multi-tenant untuk tata kelola operasional pesantren, mencakup perizinan santri, pencatatan uang saku NFC, penagihan syahriyah Hijriyah, buku kas umum, dan integrasi payment gateway.
            </p>
            <p>
              Setiap mitra pesantren yang telah melunasi biaya lisensi diberikan hak non-eksklusif dan tidak dapat dialihkan untuk menggunakan perangkat lunak sesuai paket lisensi yang dipilih (Tahunan atau Lifetime).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">3</span>
              <span>Hak Cipta & Kepemilikan Data</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>
                <strong>Hak Milik Intelektual:</strong> Seluruh kode sumber, arsitektur sistem, logo, dan desain antarmuka SiPesand adalah milik sah King Digital Dev dan dilindungi undang-undang hak cipta Republik Indonesia.
              </li>
              <li>
                <strong>Kepemilikan Data Lembaga:</strong> Seluruh data santri, catatan keuangan yayasan, dan riwayat perizinan yang diinput oleh pengguna adalah 100% milik lembaga pesantren masing-masing. King Digital Dev menjamin kerahasiaan dan tidak akan memperjualbelikan data tersebut kepada pihak ketiga.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">4</span>
              <span>Kewajiban Pengguna & Batasan Penggunaan</span>
            </h2>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-slate-600">
              <li>Pengguna bertanggung jawab penuh atas keamanan kredensial akun Super Admin, Bendahara, dan divisi lainnya.</li>
              <li>Dilarang keras menyalahgunakan sistem untuk aktivitas ilegal, penipuan, pencucian uang, atau merusak stabilitas server cloud SiPesand.</li>
              <li>Dilarang melakukan reverse engineering, dekompilasi, atau menyalin sistem tanpa izin tertulis dari King Digital Dev.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">5</span>
              <span>Pembayaran & Transaksi Payment Gateway</span>
            </h2>
            <p>
              Seluruh transaksi pembayaran lisensi maupun pembayaran tagihan wali santri diproses secara aman melalui gerbang pembayaran resmi berizin (iPaymu / Midtrans / Payment Gateway Perbankan). King Digital Dev tidak menyimpan data sensitif seperti nomor PIN atau CVV kartu perbankan pengguna.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center text-xs">6</span>
              <span>Hukum yang Berlaku</span>
            </h2>
            <p>
              Syarat dan Ketentuan ini diatur dan ditafsirkan berdasarkan hukum Negara Kesatuan Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan secara musyawarah mufakat terlebih dahulu.
            </p>
          </section>

          <section className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E3A8A]" />
              <span>Informasi Pengembang & Layanan Bantuan</span>
            </h3>
            <div className="text-xs space-y-1 text-slate-800 font-medium pt-1">
              <div>• <strong>Entitas Bisnis:</strong> King Digital Dev (Platform SiPesand)</div>
              <div>• <strong>Email:</strong> kingdigitaldev@gmail.com</div>
              <div>• <strong>WhatsApp/Telp:</strong> +62 851-2373-4342</div>
              <div>• <strong>Alamat Kantor:</strong> Kencong, Kepung, Kediri, Jawa Timur, Indonesia</div>
            </div>
          </section>

        </div>

      </main>

      <DeveloperFooter />
    </div>
  );
}
