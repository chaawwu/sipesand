import React, { useState } from 'react';
import { 
  Building2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Globe 
} from 'lucide-react';
import DeveloperFooter from '../components/DeveloperFooter';

export default function FaqPage({ onBackToHome }) {
  const [openIndex, setOpenIndex] = useState(0);

  const FAQ_LIST = [
    {
      q: 'Apa itu platform SiPesand?',
      a: 'SiPesand adalah platform SaaS (Software as a Service) manajemen pesantren terpadu yang dikembangkan oleh King Digital Dev. Platform ini menyediakan sistem kartu santri digital (KTSD Smart NFC), penagihan syahriyah otomatis berbasis kalender Hijriyah, portal mandiri wali santri, dan manajemen pos kamtib keamanan gerbang.'
    },
    {
      q: 'Bagaimana cara mendaftar sebagai mitra pesantren baru?',
      a: 'Anda dapat mendaftar melalui halaman https://sipesand.web.id atau https://mitra.sipesand.web.id, mengisi data identitas lembaga dan memilih subdomain yang diinginkan (contoh: nurulhuda.sipesand.web.id), kemudian menyelesaikan pembayaran lisensi melalui QRIS atau Virtual Account.'
    },
    {
      q: 'Bagaimana alur aktivasi setelah pembayaran lisensi selesai?',
      a: 'Setelah pembayaran diverifikasi oleh sistem Payment Gateway kami (iPaymu / Midtrans), sistem auto-provisioning akan secara otomatis membuatkan database mandiri terisolasi untuk lembaga Anda dan mengirimkan kredensial login akun Super Admin ke email yang Anda daftarkan dalam waktu hitungan detik.'
    },
    {
      q: 'Metode pembayaran apa saja yang didukung oleh SiPesand?',
      a: 'Kami mendukung pembayaran melalui QRIS (DANA, OVO, GoPay, LinkAja, ShopeePay, BCA, Mandiri Livin, BRImo, BSI Mobile) serta Virtual Account bank nasional (BSI, BCA, Mandiri, BRI, BNI).'
    },
    {
      q: 'Apakah data keuangan dan data santri kami aman?',
      a: 'Sangat aman. Setiap pesantren mitra mendapatkan file database mandiri terisolasi (multi-tenant isolation) dengan enkripsi data, sehingga data keuangan, tabungan santri, dan catatan akademik tidak pernah tercampur dengan pesantren lain.'
    },
    {
      q: 'Apakah aplikasi SiPesand dapat digunakan di smartphone?',
      a: 'Ya, SiPesand mendukung teknologi Progressive Web App (PWA) responsif yang dapat diinstal langsung di HP Android maupun iPhone tanpa membebani memori penyimpanan perangkat.'
    },
    {
      q: 'Bagaimana jika kami membutuhkan bantuan teknis atau konsultasi?',
      a: 'Tim teknis King Digital Dev siap membantu Anda melalui WhatsApp di +62 851-2373-4342 atau email kingdigitaldev@gmail.com pada jam operasional Senin - Sabtu (08.00 - 17.00 WIB).'
    }
  ];

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
            <span className="font-extrabold text-sm text-slate-900">SiPesand • FAQ Resmi</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-[#1E3A8A] font-bold text-[10px] uppercase">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Pusat Bantuan & Tanya Jawab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Temukan jawaban lengkap seputar aktivasi lisensi, integrasi subdomain, pembayaran gateway, dan tata kelola platform SiPesand.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3">
          {FAQ_LIST.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden transition-all">
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className={`w-full p-4 font-bold text-slate-800 text-xs sm:text-sm flex items-center justify-between text-left transition-colors ${
                    isOpen ? 'bg-blue-50/50 text-[#1E3A8A]' : 'bg-slate-50 hover:bg-slate-100/80'
                  }`}
                >
                  <span className="pr-4">{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 bg-white text-slate-600 text-xs sm:text-[13px] leading-relaxed border-t border-slate-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact Callout */}
        <div className="bg-[#1E3A8A] text-white rounded-3xl p-6 sm:p-7 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-extrabold text-sm text-white">Masih Memiliki Pertanyaan Lain?</h3>
            <p className="text-blue-200 text-xs">Hubungi Customer Service King Digital Dev untuk panduan langsung.</p>
          </div>
          <a
            href="https://wa.me/6285123734342"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span>Chat WhatsApp (+62 851-2373-4342)</span>
          </a>
        </div>

      </main>

      <DeveloperFooter />
    </div>
  );
}
