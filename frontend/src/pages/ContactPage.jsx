import React from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  Globe, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink 
} from 'lucide-react';
import DeveloperFooter from '../components/DeveloperFooter';

export default function ContactPage({ onBackToHome }) {
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
            <span className="font-extrabold text-sm text-slate-900">SiPesand • Hubungi Kami</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-50 text-[#1E3A8A] font-bold text-[10px] uppercase">
            <Phone className="w-3.5 h-3.5" />
            <span>Official Contact & Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hubungi Tim King Digital Dev
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Layanan Pelanggan, Konsultasi Kemitraan Pesantren, Integrasi Payment Gateway, dan Bantuan Teknis.
          </p>
        </div>

        {/* 3 Main Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Telepon & WhatsApp */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Telepon & WhatsApp</h3>
              <p className="text-slate-500 text-[11px]">Layanan cepat chat dan konsultasi teknis langsung dengan developer.</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <a
                href="https://wa.me/6285123734342"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono font-bold text-sm text-emerald-700 hover:underline block"
              >
                +62 851-2373-4342
              </a>
              <span className="text-[10px] text-slate-400">Senin - Sabtu (08.00 - 17.00 WIB)</span>
            </div>
          </div>

          {/* Email Resmi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Email Resmi</h3>
              <p className="text-slate-500 text-[11px]">Korespondensi resmi, faktur pembayaran, dan verifikasi payment gateway.</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <a
                href="mailto:kingdigitaldev@gmail.com"
                className="font-mono font-bold text-xs text-blue-700 hover:underline block truncate"
              >
                kingdigitaldev@gmail.com
              </a>
              <span className="text-[10px] text-slate-400">Balasan maksimal 1 x 24 jam kerja</span>
            </div>
          </div>

          {/* Alamat Usaha */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">Alamat Usaha & Operasional</h3>
              <p className="text-slate-500 text-[11px]">Kantor pusat pengembangan software King Digital Dev.</p>
            </div>
            <div className="pt-2 border-t border-slate-100">
              <div className="font-bold text-slate-800 text-xs">
                Kencong, Kepung, Kediri
              </div>
              <span className="text-[10px] text-slate-500">Jawa Timur, Indonesia</span>
            </div>
          </div>

        </div>

        {/* Detailed Business Identity Information Box (Untuk Verifikasi iPaymu) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="font-extrabold text-sm sm:text-base text-slate-900">
                Informasi Badan Usaha & Pengembang Resmi (Merchant Identity)
              </h2>
            </div>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px]">
              Terverifikasi
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nama Bisnis / Usaha</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">King Digital Dev</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Produk / Layanan SaaS</span>
              <span className="font-bold text-slate-900 text-xs sm:text-sm">SiPesand (Sistem Pesantren Digital)</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nomor Telepon & WhatsApp</span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">+62 851-2373-4342</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Customer Care</span>
              <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">kingdigitaldev@gmail.com</span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 sm:col-span-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alamat Usaha Lengkap</span>
              <span className="font-medium text-slate-900 text-xs leading-relaxed block">
                Kencong, Kepung, Kediri, Jawa Timur, Indonesia
              </span>
            </div>
          </div>
        </div>

      </main>

      <DeveloperFooter />
    </div>
  );
}
