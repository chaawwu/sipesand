import React from 'react';
import { Globe, Phone, Mail, MapPin, ShieldCheck, FileText, HelpCircle, RefreshCcw } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function DeveloperFooter({ className = '', onNavigateLegal }) {
  const { settings } = useSettings();

  const handleLegalClick = (e, path) => {
    e.preventDefault();
    if (onNavigateLegal) {
      onNavigateLegal(path);
    } else {
      window.location.href = `/${path}`;
    }
  };

  return (
    <footer className={`bg-white border-t border-slate-200 py-6 px-4 text-slate-500 text-[11px] font-sans ${className}`}>
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Row 1: Informasi Usaha & Legal Links (Wajib untuk Verifikasi iPaymu) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center justify-between pb-4 border-b border-slate-100">
          
          {/* Kolom 1 (6/12): Identitas Badan Usaha & Alamat */}
          <div className="md:col-span-6 space-y-1 text-center md:text-left">
            <div className="font-extrabold text-xs text-slate-900 flex items-center justify-center md:justify-start gap-1.5">
              <span>King Digital Dev</span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-bold">Platform SiPesand</span>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-[10.5px] text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                <span>Kencong, Kepung, Kediri, Jawa Timur</span>
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                <a href="https://wa.me/6285123734342" target="_blank" rel="noopener noreferrer" className="hover:underline font-mono text-slate-700">
                  +62 851-2373-4342
                </a>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-blue-600 flex-shrink-0" />
                <a href="mailto:kingdigitaldev@gmail.com" className="hover:underline font-mono text-slate-700">
                  kingdigitaldev@gmail.com
                </a>
              </span>
            </div>
          </div>

          {/* Kolom 2 (6/12): 4 Menu Wajib Legal iPaymu */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-1.5 font-bold text-[10.5px]">
            <a
              href="/faq"
              onClick={(e) => handleLegalClick(e, 'faq')}
              className="text-slate-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-blue-600" />
              <span>FAQ</span>
            </a>

            <a
              href="/refund-policy"
              onClick={(e) => handleLegalClick(e, 'refund-policy')}
              className="text-slate-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              <RefreshCcw className="w-3 h-3 text-rose-600" />
              <span>Refund Policy</span>
            </a>

            <a
              href="/terms-and-conditions"
              onClick={(e) => handleLegalClick(e, 'terms-and-conditions')}
              className="text-slate-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3 text-amber-600" />
              <span>Syarat & Ketentuan</span>
            </a>

            <a
              href="/kontak"
              onClick={(e) => handleLegalClick(e, 'kontak')}
              className="text-slate-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>Kontak</span>
            </a>
          </div>

        </div>

        {/* Row 2: Copyright & Domain Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[10px]">
          <div>
            <span>Sistem Informasi & Manajemen Terpadu Pesantren Digital © {new Date().getFullYear()}</span>
            <span className="mx-2 text-slate-300">•</span>
            <span>All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 font-medium">
            <a
              href="https://sipesand.web.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-700 hover:text-blue-700 hover:underline inline-flex items-center gap-1 transition-colors"
            >
              <Globe className="w-3 h-3 text-blue-600" />
              <span>sipesand.web.id</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href="https://kingdigitalpremium.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              kingdigitaldev
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
