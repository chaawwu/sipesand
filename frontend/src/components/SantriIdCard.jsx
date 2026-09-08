import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Printer, 
  Building2, 
  Radio, 
  X, 
  CreditCard, 
  MapPin, 
  Upload, 
  Link, 
  Layers, 
  Palette, 
  RotateCw, 
  Image as ImageIcon, 
  CheckCircle2, 
  Trash2, 
  ExternalLink, 
  Download, 
  Scissors, 
  Eye, 
  MessageSquare,
  Sliders,
  Settings2,
  Sparkles,
  RefreshCw,
  Type,
  Square,
  Circle,
  Check
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const CARD_THEMES = [
  {
    id: 'pesantren-emerald',
    name: 'Klasik Pesantren (Hijau Zamrud & Emas)',
    badge: 'Resmi',
    type: 'light',
    frontHeaderBg: 'bg-[#064E3B] text-white',
    headerTitle: 'text-amber-300',
    headerSub: 'text-emerald-100',
    accentBorder: 'border-[#047857]',
    tagBg: 'bg-[#064E3B] text-amber-200 border-amber-300/30',
    cardBg: 'bg-white text-slate-900 border-[#064E3B]',
    backHeaderBg: 'bg-[#064E3B] text-white',
    primaryColor: '#064E3B',
    accentColor: '#D97706',
    textColor: '#0F172A',
    headerBgHex: '#064E3B',
    headerTextHex: '#FDE68A',
  },
  {
    id: 'academic-blue',
    name: 'Modern Akademik (Biru Royal & Cyan)',
    badge: 'Formal',
    type: 'light',
    frontHeaderBg: 'bg-[#1E3A8A] text-white',
    headerTitle: 'text-cyan-300',
    headerSub: 'text-blue-100',
    accentBorder: 'border-[#2563EB]',
    tagBg: 'bg-[#1E3A8A] text-cyan-200 border-cyan-300/30',
    cardBg: 'bg-white text-slate-900 border-[#1E3A8A]',
    backHeaderBg: 'bg-[#1E3A8A] text-white',
    primaryColor: '#1E3A8A',
    accentColor: '#0284C7',
    textColor: '#0F172A',
    headerBgHex: '#1E3A8A',
    headerTextHex: '#67E8F9',
  },
  {
    id: 'navy-gold',
    name: 'Eksklusif Mahad (Navy & Gold Dark)',
    badge: 'Dark',
    type: 'dark',
    frontHeaderBg: 'bg-[#090D16] text-amber-400 border-b border-amber-500/30',
    headerTitle: 'text-amber-300',
    headerSub: 'text-slate-300',
    accentBorder: 'border-amber-400',
    tagBg: 'bg-amber-400 text-slate-950 font-bold',
    cardBg: 'bg-[#0B1120] text-white border-amber-500/40',
    backHeaderBg: 'bg-[#090D16] text-amber-300',
    primaryColor: '#0B1120',
    accentColor: '#F59E0B',
    textColor: '#FFFFFF',
    headerBgHex: '#090D16',
    headerTextHex: '#FCD34D',
  },
  {
    id: 'minimalist-slate',
    name: 'Monokrom Silver (Clean & Tech)',
    badge: 'Minimalis',
    type: 'dark',
    frontHeaderBg: 'bg-[#18181B] text-white border-b border-zinc-700',
    headerTitle: 'text-zinc-100',
    headerSub: 'text-zinc-400',
    accentBorder: 'border-zinc-500',
    tagBg: 'bg-zinc-200 text-zinc-950 font-bold',
    cardBg: 'bg-[#18181B] text-white border-zinc-700',
    backHeaderBg: 'bg-[#18181B] text-white',
    primaryColor: '#18181B',
    accentColor: '#E4E4E7',
    textColor: '#FFFFFF',
    headerBgHex: '#18181B',
    headerTextHex: '#F4F4F5',
  },
];

export default function SantriIdCard({ santri, isOpen, onClose }) {
  const { settings, isNfcEnabled } = useSettings();

  // Basic States
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  const [activeTheme, setActiveTheme] = useState('pesantren-emerald');
  const [viewSide, setViewSide] = useState('both'); // 'both' | 'front' | 'back'
  const [customFrontBg, setCustomFrontBg] = useState(null);
  const [customBackBg, setCustomBackBg] = useState(null);
  const [canvaUrl, setCanvaUrl] = useState('');
  
  // Layout Customizer Accordion / Panel State
  const [showLayoutEditor, setShowLayoutEditor] = useState(false);
  const [layoutCustom, setLayoutCustom] = useState({
    namaLembaga: '',
    tagline: '',
    cardTitle: 'KARTU TANDA SANTRI (KTSD)',
    nfcLabel: '',
    showLogo: true,
    showNfcBadge: true,
    showPhoto: true,
    photoShape: 'rounded', // 'rounded' | 'circle' | 'square'
    showNis: true,
    showKelasKamar: true,
    showAlamat: true,
    showQrCode: true,
    showUidFooter: true,
    customPrimaryColor: '',
    customTextColor: '',
    // Belakang
    backTitle: 'KETENTUAN PEMEGANG KARTU',
    rule1: 'Kartu ini adalah identitas resmi santri pondok pesantren.',
    rule2: 'Wajib dibawa saat perizinan keluar, presensi pos kamtib, dan transaksi saku di kantin.',
    rule3: 'Jika kartu hilang atau rusak, segera lapor ke Pengurus Bagian Keamanan & Tata Usaha.',
    showSignature: true,
    showStamp: true,
    signerName: '',
    signerTitle: 'Pengasuh / Kepala Pondok',
  });

  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  if (!isOpen || !santri) return null;

  const currentTheme = CARD_THEMES.find(t => t.id === activeTheme) || CARD_THEMES[0];
  const namaLembaga = settings.NAMA_LEMBAGA || 'SIPESAND (SISTEM INFORMASI TERPADU PESANTREN DAN DIGITAL)';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'SISTEM INFORMASI MANAJEMEN ADMINISTRASI, KEUANGAN & AKADEMIK PESANTREN';
  const kepalaPondok = settings.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const ttdKepala = settings.TTD_KEPALA_URL;
  const stempelUrl = settings.STEMPEL_URL;

  // Effective Customizer Values (Fallback to preset/settings)
  const effectiveNamaLembaga = layoutCustom.namaLembaga || namaLembaga;
  const effectiveCardTitle = layoutCustom.cardTitle || 'KARTU TANDA SANTRI (KTSD)';
  const effectiveSignerName = layoutCustom.signerName || kepalaPondok;
  const effectiveSignerTitle = layoutCustom.signerTitle || 'Pengasuh / Kepala Pondok';
  const effectiveNfcLabel = layoutCustom.nfcLabel || (isNfcEnabled && santri.nfcUid ? 'NFC ACTIVE' : 'SMART ID');

  const effectivePrimaryBg = layoutCustom.customPrimaryColor || (customFrontBg ? '#ffffff' : currentTheme.primaryColor);
  const effectiveTextColor = layoutCustom.customTextColor || (currentTheme.type === 'dark' && !customFrontBg ? '#FFFFFF' : '#0F172A');
  const isLight = currentTheme.type === 'light' && !customFrontBg && !layoutCustom.customPrimaryColor;

  // URL Web Kartu Santri Digital Publik (Untuk Pemindaian Kamera HP)
  const cardWebUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?view=santri-card&nis=${encodeURIComponent(santri.nis || santri.id)}`
    : `https://sipesand.web.id/santri/${santri.nis || santri.id}`;
  
  // QR Code Payload: Direct Web URL for live verification
  const qrPayload = cardWebUrl;

  // Handle Custom Template Upload (PNG/JPG)
  const handleUploadBg = (side, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'front') setCustomFrontBg(reader.result);
        else setCustomBackBg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCanvaUrl = (e) => {
    e.preventDefault();
    if (canvaUrl.trim()) {
      setCustomFrontBg(canvaUrl.trim());
    }
  };

  const handleResetLayout = () => {
    setLayoutCustom({
      namaLembaga: '',
      tagline: '',
      cardTitle: 'KARTU TANDA SANTRI (KTSD)',
      nfcLabel: '',
      showLogo: true,
      showNfcBadge: true,
      showPhoto: true,
      photoShape: 'rounded',
      showNis: true,
      showKelasKamar: true,
      showAlamat: true,
      showQrCode: true,
      showUidFooter: true,
      customPrimaryColor: '',
      customTextColor: '',
      backTitle: 'KETENTUAN PEMEGANG KARTU',
      rule1: 'Kartu ini adalah identitas resmi santri pondok pesantren.',
      rule2: 'Wajib dibawa saat perizinan keluar, presensi pos kamtib, dan transaksi saku di kantin.',
      rule3: 'Jika kartu hilang atau rusak, segera lapor ke Pengurus Bagian Keamanan & Tata Usaha.',
      showSignature: true,
      showStamp: true,
      signerName: '',
      signerTitle: 'Pengasuh / Kepala Pondok',
    });
  };

  const handleSendKtsdToWa = () => {
    if (!santri.noHpWali) {
      alert('Nomor WhatsApp wali santri belum terdaftar di database.');
      return;
    }
    let phone = santri.noHpWali.replace(/\D/g, '');
    if (phone.startsWith('0')) phone = '62' + phone.slice(1);

    const message = `Assalamu'alaikum Wr. Wb. Bapak/Ibu Wali dari Ananda *${santri.nama}* (NIS: ${santri.nis || '-'}).\n\nBerikut adalah informasi Kartu Tanda Santri Digital (KTSD RFID) resmi ananda di *${effectiveNamaLembaga}*:\n- Nama: *${santri.nama}*\n- NIS: ${santri.nis}\n- Kelas/Diniyah: ${santri.kelas}\n- Kamar Asrama: ${santri.kamar}\n- UID Smart Card: *${santri.nfcUid || 'TERHUBUNG KTSD'}*\n- Status Kartu: *AKTIF (Presensi Sholat, Diniyah, & Belanja Kantin Cashless)*\n\n📌 *Buka Kartu Santri Digital & Riwayat Izin Real-Time:*\n${cardWebUrl}\n\nBapak/Ibu dapat memantau saldo saku harian dan mutaba'ah ananda secara mandiri melalui tautan resmi di atas.\n\nJazakumullah Khairan Katsiran.\n_Sekretariat & IT ${effectiveNamaLembaga}_`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // =========================================================================
  // PRINT HANDLER DENGAN SELF-CONTAINED CSS (100% WYSIWYG & ANTI-BLANK)
  // =========================================================================
  const handlePrint = () => {
    const frontEl = document.getElementById('id-card-front-printable');
    const backEl = document.getElementById('id-card-back-printable');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    let htmlContent = '';
    const isLandscape = orientation === 'landscape';

    if (viewSide === 'front' && frontEl) {
      htmlContent = `
        <div class="print-sheet">
          <div class="card-cell">${frontEl.outerHTML}</div>
          <div class="cut-guide-note">Tampak Depan KTSD Standar ISO CR-80 (85.6mm × 54mm)</div>
        </div>
      `;
    } else if (viewSide === 'back' && backEl) {
      htmlContent = `
        <div class="print-sheet">
          <div class="card-cell">${backEl.outerHTML}</div>
          <div class="cut-guide-note">Tampak Belakang KTSD Standar ISO CR-80 (85.6mm × 54mm)</div>
        </div>
      `;
    } else {
      htmlContent = `
        <div class="print-sheet">
          <div class="print-row ${isLandscape ? 'row-landscape' : 'row-portrait'}">
            <div class="card-cell">${frontEl ? frontEl.outerHTML : ''}</div>
            <div class="card-cell">${backEl ? backEl.outerHTML : ''}</div>
          </div>
          <div class="cut-guide-note">
            Panduan Potong Kartu Standar CR-80 (85.6mm × 54mm) • Cetak pada Kertas PVC / Art Paper 260gr
          </div>
        </div>
      `;
    }

    // Ambil style aktif dari document induk
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      stylesHtml += node.outerHTML;
    });

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cetak KTSD - ${santri.nama} (${santri.nis})</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff !important;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              color: #0F172A;
            }
            .print-sheet {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
              text-align: center;
              padding-top: 10mm;
            }
            .print-row {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 12mm;
              margin: 0 auto;
            }
            .row-landscape {
              flex-direction: row;
            }
            .row-portrait {
              flex-direction: row;
            }
            .card-cell {
              display: inline-block;
              position: relative;
              padding: 1.5mm;
              border: 1px dashed #94A3B8;
              border-radius: 4.5mm;
              background: #ffffff;
            }
            /* Exact ISO/IEC 7810 CR-80 Specification (85.60 mm × 53.98 mm) */
            .cr80-landscape {
              width: 85.6mm !important;
              height: 54mm !important;
              min-width: 85.6mm !important;
              min-height: 54mm !important;
              max-width: 85.6mm !important;
              max-height: 54mm !important;
              border-radius: 3.18mm !important;
              overflow: hidden !important;
              position: relative !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cr80-portrait {
              width: 54mm !important;
              height: 85.6mm !important;
              min-width: 54mm !important;
              min-height: 85.6mm !important;
              max-width: 54mm !important;
              max-height: 85.6mm !important;
              border-radius: 3.18mm !important;
              overflow: hidden !important;
              position: relative !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              margin: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .cut-guide-note {
              margin-top: 8mm;
              font-size: 8pt;
              color: #64748b;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `);
    doc.close();

    // Tunggu gambar (foto, logo, TTD, QR) selesai ter-decode sebelum memanggil dialog print
    const triggerPrint = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 1500);
      }, 300);
    };

    const images = Array.from(doc.images || []);
    if (images.length > 0) {
      Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(res => {
            img.onload = res;
            img.onerror = res;
          });
        })
      ).then(triggerPrint).catch(triggerPrint);
    } else {
      triggerPrint();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in text-xs font-sans">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white tracking-tight flex items-center gap-2">
                <span>Studio Kartu Tanda Santri Digital (KTSD)</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold border border-blue-400/30 uppercase">
                  CR-80 Standard
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                Cetak presisi ISO CR-80, kustomisasi tata letak, dan verifikasi web QR real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tombol Buka Web Digital Publik */}
            <a
              href={cardWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-blue-600/90 hover:bg-blue-600 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              title="Buka Halaman Web Kartu Digital Santri (Hasil Scan QR)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cek Web QR</span>
            </a>

            {/* Tombol Cetak KTSD */}
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              title="Cetak Sesuai Tampilan Layar (WYSIWYG Anti-Blank)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak KTSD</span>
            </button>

            {/* Tombol Kirim ke WhatsApp Wali */}
            <button
              onClick={handleSendKtsdToWa}
              className="px-3 py-2 bg-[#25D366] hover:bg-emerald-600 text-slate-950 hover:text-white font-bold rounded-xl shadow transition-all flex items-center gap-1.5 text-xs cursor-pointer"
              title="Kirim Tautan & Informasi Kartu Santri ke WhatsApp Wali"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              <span className="hidden lg:inline">Kirim ke Wali</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar Pengaturan Kartu */}
        <div className="bg-slate-50 border-b border-slate-200 p-3 sm:p-4 space-y-3">
          
          {/* Baris 1: Pilihan Tema, Orientasi, Sisi Tampilan & Tombol Edit Tata Letak */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Pilihan 4 Tema Resmi */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 text-[11px] flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Pilih Tema:</span>
              </span>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {CARD_THEMES.map((thm) => (
                  <button
                    key={thm.id}
                    onClick={() => {
                      setActiveTheme(thm.id);
                      setCustomFrontBg(null);
                      setCustomBackBg(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTheme === thm.id && !customFrontBg && !layoutCustom.customPrimaryColor
                        ? 'border-blue-600 bg-white text-blue-700 shadow-sm ring-1 ring-blue-600'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: thm.primaryColor }}
                    />
                    <span>{thm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Orientasi & Sisi Tampilan */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Orientasi */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    orientation === 'landscape' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    orientation === 'portrait' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portrait
                </button>
              </div>

              {/* Tampak Sisi */}
              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewSide('both')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    viewSide === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Keduanya (A4)
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('front')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    viewSide === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Depan
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('back')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                    viewSide === 'back' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Belakang
                </button>
              </div>

              {/* Tombol Toggle Edit Tata Letak Manual */}
              <button
                type="button"
                onClick={() => setShowLayoutEditor(!showLayoutEditor)}
                className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  showLayoutEditor
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm ring-1 ring-amber-400'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Kustomisasi Tata Letak</span>
              </button>
            </div>

          </div>

          {/* Baris 2: Upload File Template Sendiri / Canva Link */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600 text-[11px]">Template Sendiri:</span>
              
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 text-[11px] shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Background Template (PNG/JPG)</span>
                <input type="file" accept="image/*" onChange={(e) => handleUploadBg('front', e)} className="hidden" />
              </label>

              {customFrontBg && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomFrontBg(null);
                    setCustomBackBg(null);
                  }}
                  className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold text-[10px] flex items-center gap-1 hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus Template</span>
                </button>
              )}
            </div>

            {/* Input Link Gambar Canva/Figma */}
            <form onSubmit={handleApplyCanvaUrl} className="flex items-center gap-1.5">
              <div className="relative">
                <Link className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="Paste URL Gambar Canva / Cloud..."
                  value={canvaUrl}
                  onChange={(e) => setCanvaUrl(e.target.value)}
                  className="pl-7 pr-2 py-1.5 border border-slate-300 rounded-xl text-[10px] w-56 sm:w-64 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
              >
                Terapkan
              </button>
            </form>
          </div>

          {/* ========================================================================= */}
          {/* PANEL KUSTOMISASI MANUAL TATA LETAK & KONTEN                              */}
          {/* ========================================================================= */}
          {showLayoutEditor && (
            <div className="mt-3 p-4 bg-white rounded-2xl border border-amber-300 shadow-md animate-in slide-in-from-top-2 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                    Editor Tata Letak & Elemen Kartu KTSD
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetLayout}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset ke Default</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLayoutEditor(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[11px]">
                
                {/* Kolom 1: Teks Header & Identitas */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">
                    1. Header & Teks Lembaga
                  </span>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nama Lembaga/Pondok:</label>
                    <input
                      type="text"
                      placeholder={namaLembaga}
                      value={layoutCustom.namaLembaga}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, namaLembaga: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Judul Kartu:</label>
                    <input
                      type="text"
                      placeholder="KARTU TANDA SANTRI (KTSD)"
                      value={layoutCustom.cardTitle}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, cardTitle: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Badge Header Kanan:</label>
                    <input
                      type="text"
                      placeholder="NFC ACTIVE / SMART ID"
                      value={layoutCustom.nfcLabel}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, nfcLabel: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showLogo}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showLogo: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan Logo</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showNfcBadge}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showNfcBadge: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan Badge NFC</span>
                    </label>
                  </div>
                </div>

                {/* Kolom 2: Pas Foto, Bentuk & Warna Kustom */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">
                    2. Pas Foto & Tampilan Depan
                  </span>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showPhoto}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showPhoto: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan Pas Foto</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setLayoutCustom(prev => ({ ...prev, photoShape: 'rounded' }))}
                        className={`p-1 rounded border text-[9px] font-bold cursor-pointer ${layoutCustom.photoShape === 'rounded' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-slate-50 text-slate-600'}`}
                        title="Bentuk Rounded"
                      >
                        Rounded
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutCustom(prev => ({ ...prev, photoShape: 'circle' }))}
                        className={`p-1 rounded border text-[9px] font-bold cursor-pointer ${layoutCustom.photoShape === 'circle' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-slate-50 text-slate-600'}`}
                        title="Bentuk Lingkaran"
                      >
                        Lingkaran
                      </button>
                      <button
                        type="button"
                        onClick={() => setLayoutCustom(prev => ({ ...prev, photoShape: 'square' }))}
                        className={`p-1 rounded border text-[9px] font-bold cursor-pointer ${layoutCustom.photoShape === 'square' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-slate-50 text-slate-600'}`}
                        title="Bentuk Kotak"
                      >
                        Persegi
                      </button>
                    </div>
                  </div>

                  {/* Toggle Elemen Depan */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 text-[10px]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showNis}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showNis: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tampilkan NIS</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showKelasKamar}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showKelasKamar: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Kelas & Kamar</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showAlamat}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showAlamat: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Alamat Santri</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showQrCode}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showQrCode: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>QR Code Web</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showUidFooter}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showUidFooter: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Footer UID NFC</span>
                    </label>
                  </div>

                  {/* Kustom Warna Primer */}
                  <div className="pt-1 flex items-center gap-2">
                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold block">Warna Kartu (Hex):</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={layoutCustom.customPrimaryColor || currentTheme.primaryColor}
                          onChange={(e) => setLayoutCustom(prev => ({ ...prev, customPrimaryColor: e.target.value }))}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                        />
                        <input
                          type="text"
                          placeholder={currentTheme.primaryColor}
                          value={layoutCustom.customPrimaryColor}
                          onChange={(e) => setLayoutCustom(prev => ({ ...prev, customPrimaryColor: e.target.value }))}
                          className="w-20 px-1.5 py-1 border border-slate-300 rounded text-[9px] font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-slate-500 font-semibold block">Warna Teks:</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={layoutCustom.customTextColor || (currentTheme.type === 'dark' ? '#FFFFFF' : '#0F172A')}
                          onChange={(e) => setLayoutCustom(prev => ({ ...prev, customTextColor: e.target.value }))}
                          className="w-6 h-6 rounded cursor-pointer border border-slate-300 p-0"
                        />
                        <input
                          type="text"
                          placeholder={currentTheme.type === 'dark' ? '#FFFFFF' : '#0F172A'}
                          value={layoutCustom.customTextColor}
                          onChange={(e) => setLayoutCustom(prev => ({ ...prev, customTextColor: e.target.value }))}
                          className="w-20 px-1.5 py-1 border border-slate-300 rounded text-[9px] font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom 3: Tata Tertib & Ketentuan Sisi Belakang */}
                <div className="space-y-2.5">
                  <span className="font-bold text-slate-700 block border-b border-slate-100 pb-1">
                    3. Tata Tertib Belakang & Pengasuh
                  </span>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Judul Sisi Belakang:</label>
                    <input
                      type="text"
                      placeholder="KETENTUAN PEMEGANG KARTU"
                      value={layoutCustom.backTitle}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, backTitle: e.target.value }))}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Poin 1 Tata Tertib:</label>
                    <input
                      type="text"
                      value={layoutCustom.rule1}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, rule1: e.target.value }))}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-[9px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Poin 2 Tata Tertib:</label>
                    <input
                      type="text"
                      value={layoutCustom.rule2}
                      onChange={(e) => setLayoutCustom(prev => ({ ...prev, rule2: e.target.value }))}
                      className="w-full px-2.5 py-1 border border-slate-300 rounded-lg text-[9px] focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Nama & Jabatan Penandatangan:</label>
                    <div className="grid grid-cols-2 gap-1">
                      <input
                        type="text"
                        placeholder={kepalaPondok}
                        value={layoutCustom.signerName}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, signerName: e.target.value }))}
                        className="px-2 py-1 border border-slate-300 rounded-lg text-[9px] bg-slate-50"
                      />
                      <input
                        type="text"
                        placeholder="Pengasuh / Kepala Pondok"
                        value={layoutCustom.signerTitle}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, signerTitle: e.target.value }))}
                        className="px-2 py-1 border border-slate-300 rounded-lg text-[9px] bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-0.5">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showSignature}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showSignature: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Tanda Tangan</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-[10px] text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={layoutCustom.showStamp}
                        onChange={(e) => setLayoutCustom(prev => ({ ...prev, showStamp: e.target.checked }))}
                        className="rounded text-blue-600"
                      />
                      <span>Cap Stempel</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Card Display Studio */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100 flex flex-wrap items-center justify-center gap-6 select-none">
          
          {/* ========================================================================= */}
          {/* SISI DEPAN (FRONT SIDE) - CR-80 RATIO (85.6mm x 54mm)                     */}
          {/* ========================================================================= */}
          {(viewSide === 'both' || viewSide === 'front') && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Sisi Depan (Tampak Muka)
                </span>
                {customFrontBg && (
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold text-[9px]">Custom Template</span>
                )}
              </div>

              <div
                id="id-card-front-printable"
                ref={frontCardRef}
                className={`id-card-printable ${orientation === 'landscape' ? 'cr80-landscape' : 'cr80-portrait'} rounded-2xl shadow-xl overflow-hidden relative flex flex-col justify-between border ${
                  customFrontBg ? 'border-slate-300' : currentTheme.cardBg
                } ${
                  orientation === 'landscape'
                    ? 'w-[340px] sm:w-[380px] h-[214px] sm:h-[240px] p-3.5'
                    : 'w-[220px] sm:w-[240px] h-[348px] sm:h-[380px] p-3 text-center'
                }`}
                style={{
                  backgroundColor: customFrontBg ? '#ffffff' : effectivePrimaryBg,
                  color: effectiveTextColor,
                  backgroundImage: customFrontBg ? `url(${customFrontBg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {/* Header Kartu Formal */}
                <div 
                  className={`flex items-center justify-between border-b pb-2 relative z-10 ${
                    isLight ? 'border-slate-300' : 'border-white/20'
                  } ${orientation === 'portrait' ? 'flex-col gap-1' : ''}`}
                >
                  <div className={`flex items-center gap-2 ${orientation === 'portrait' ? 'flex-col' : ''}`}>
                    {layoutCustom.showLogo && (
                      logoPondok ? (
                        <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0 border border-slate-200">
                          <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                          <Building2 className="w-4 h-4 text-amber-400" />
                        </div>
                      )
                    )}
                    <div className="min-w-0">
                      <h4 className={`font-black text-[10px] sm:text-[11px] uppercase tracking-wide leading-tight truncate max-w-[200px] ${
                        isLight ? 'text-slate-900' : currentTheme.headerTitle
                      }`}>
                        {effectiveNamaLembaga}
                      </h4>
                      <div className={`text-[7px] uppercase tracking-wider font-semibold ${
                        isLight ? 'text-slate-500' : 'text-slate-300'
                      }`}>
                        {effectiveCardTitle}
                      </div>
                    </div>
                  </div>

                  {layoutCustom.showNfcBadge && (
                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-mono font-bold ${
                      isLight ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-white/10 text-white border border-white/20'
                    }`}>
                      <Radio className="w-2.5 h-2.5 text-amber-500" />
                      <span>{effectiveNfcLabel}</span>
                    </div>
                  )}
                </div>

                {/* Body Kartu: Landscape vs Portrait */}
                {orientation === 'landscape' ? (
                  <div className="flex items-center gap-3 relative z-10 my-auto">
                    {/* Pas Foto Standar / Custom Shape */}
                    {layoutCustom.showPhoto && (
                      <div className={`w-[70px] sm:w-[78px] h-[88px] sm:h-[98px] ${
                        layoutCustom.photoShape === 'circle' ? 'rounded-full' : layoutCustom.photoShape === 'square' ? 'rounded-none' : 'rounded-lg'
                      } bg-slate-100 p-0.5 border-2 border-slate-800 shadow-sm relative overflow-hidden flex items-center justify-center flex-shrink-0`}>
                        {santri.foto ? (
                          <img src={santri.foto} alt={santri.nama} className={`w-full h-full object-cover ${layoutCustom.photoShape === 'circle' ? 'rounded-full' : layoutCustom.photoShape === 'square' ? 'rounded-none' : 'rounded-md'}`} />
                        ) : (
                          <div className="text-center">
                            <div className="text-xl font-bold text-slate-700">{santri.nama.charAt(0)}</div>
                            <div className="text-[6px] text-slate-400 font-semibold">PAS FOTO</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Data Pokok Santri */}
                    <div className="flex-1 min-w-0 space-y-0.5 text-left">
                      <h3 className={`font-black text-[12px] sm:text-[13px] leading-tight truncate ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {santri.nama}
                      </h3>
                      {layoutCustom.showNis && (
                        <div className={`text-[9.5px] font-mono font-bold ${
                          isLight ? 'text-blue-700' : 'text-amber-300'
                        }`}>
                          NIS: {santri.nis || '-'}
                        </div>
                      )}
                      <div className={`text-[8.5px] space-y-0.5 pt-0.5 ${
                        isLight ? 'text-slate-600' : 'text-slate-200'
                      }`}>
                        {layoutCustom.showKelasKamar && (
                          <>
                            <div>Kelas: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{santri.kelas || '10 IPA 1'}</strong></div>
                            <div>Kamar: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{santri.kamar || 'Asrama Pusat'}</strong></div>
                          </>
                        )}
                        {layoutCustom.showAlamat && (
                          <div className="truncate max-w-[150px]">Alamat: {santri.alamat || 'Indonesia'}</div>
                        )}
                      </div>
                    </div>

                    {/* QR Code Verifikasi Web Publik */}
                    {layoutCustom.showQrCode && (
                      <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-300 flex flex-col items-center flex-shrink-0">
                        <QRCodeSVG value={qrPayload} size={48} level="M" />
                        <span className="text-[5.5px] font-mono text-slate-900 font-bold mt-0.5">SCAN KTSD</span>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Portrait Body */
                  <div className="flex flex-col items-center gap-1.5 relative z-10 my-auto">
                    {layoutCustom.showPhoto && (
                      <div className={`w-[72px] h-[90px] ${
                        layoutCustom.photoShape === 'circle' ? 'rounded-full' : layoutCustom.photoShape === 'square' ? 'rounded-none' : 'rounded-lg'
                      } bg-slate-100 p-0.5 border-2 border-slate-800 shadow-sm overflow-hidden flex items-center justify-center flex-shrink-0`}>
                        {santri.foto ? (
                          <img src={santri.foto} alt={santri.nama} className={`w-full h-full object-cover ${layoutCustom.photoShape === 'circle' ? 'rounded-full' : layoutCustom.photoShape === 'square' ? 'rounded-none' : 'rounded-md'}`} />
                        ) : (
                          <div className="text-xl font-bold text-slate-700">{santri.nama.charAt(0)}</div>
                        )}
                      </div>
                    )}
                    <div className="space-y-0.5">
                      <h3 className={`font-black text-[11px] leading-tight truncate max-w-[180px] ${
                        isLight ? 'text-slate-900' : 'text-white'
                      }`}>
                        {santri.nama}
                      </h3>
                      {layoutCustom.showNis && (
                        <div className={`text-[9px] font-mono font-bold ${
                          isLight ? 'text-blue-700' : 'text-amber-300'
                        }`}>
                          NIS: {santri.nis || '-'}
                        </div>
                      )}
                      {layoutCustom.showKelasKamar && (
                        <div className={`text-[8px] ${isLight ? 'text-slate-600' : 'text-slate-200'}`}>
                          {santri.kelas} • {santri.kamar}
                        </div>
                      )}
                    </div>
                    {layoutCustom.showQrCode && (
                      <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-300 flex flex-col items-center">
                        <QRCodeSVG value={qrPayload} size={42} level="M" />
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Barcode & Keterangan */}
                {layoutCustom.showUidFooter && (
                  <div className={`border-t pt-1 flex items-center justify-between text-[7px] relative z-10 ${
                    isLight ? 'border-slate-300 text-slate-500' : 'border-white/20 text-slate-300'
                  }`}>
                    <span>KARTU RESMI SANTRI</span>
                    <span className="font-mono font-bold">UID: {santri.nfcUid || 'AUTO-KTSD'}</span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SISI BELAKANG (BACK SIDE) - TATA TERTIB & TANDA TANGAN                     */}
          {/* ========================================================================= */}
          {(viewSide === 'both' || viewSide === 'back') && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Sisi Belakang (Ketentuan & TTD)
              </span>

              <div
                id="id-card-back-printable"
                ref={backCardRef}
                className={`id-card-printable ${orientation === 'landscape' ? 'cr80-landscape' : 'cr80-portrait'} rounded-2xl shadow-xl overflow-hidden relative flex flex-col justify-between border ${
                  customBackBg ? 'border-slate-300' : currentTheme.cardBg
                } ${
                  orientation === 'landscape'
                    ? 'w-[340px] sm:w-[380px] h-[214px] sm:h-[240px] p-3.5'
                    : 'w-[220px] sm:w-[240px] h-[348px] sm:h-[380px] p-3 text-center'
                }`}
                style={{
                  backgroundColor: customBackBg ? '#ffffff' : effectivePrimaryBg,
                  color: effectiveTextColor,
                  backgroundImage: customBackBg ? `url(${customBackBg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                {/* Header Belakang */}
                <div className={`border-b pb-1.5 relative z-10 ${
                  isLight ? 'border-slate-300' : 'border-white/20'
                }`}>
                  <div className={`font-black text-[9px] uppercase tracking-wider ${
                    isLight ? 'text-slate-900' : currentTheme.headerTitle
                  }`}>
                    {layoutCustom.backTitle || 'KETENTUAN PEMEGANG KARTU'}
                  </div>
                </div>

                {/* Butir Tata Tertib Editable */}
                <div className={`space-y-1 text-[7.5px] leading-tight text-left relative z-10 my-auto ${
                  isLight ? 'text-slate-700' : 'text-slate-200'
                }`}>
                  <div className="flex items-start gap-1">
                    <span>1.</span>
                    <span>{layoutCustom.rule1}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span>2.</span>
                    <span>{layoutCustom.rule2}</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span>3.</span>
                    <span>{layoutCustom.rule3}</span>
                  </div>
                </div>

                {/* Footer TTD & Stempel Resmi */}
                <div className={`border-t pt-1.5 flex items-end justify-between relative z-10 ${
                  isLight ? 'border-slate-300' : 'border-white/20'
                }`}>
                  <div className="text-left text-[6.5px] space-y-0.5">
                    <div className="font-bold">Diterbitkan oleh:</div>
                    <div>Sekretariat Pondok Pesantren</div>
                    <div className="font-mono text-[6px] opacity-75">Valid: 2026 - 2029</div>
                  </div>

                  <div className="text-center relative">
                    {/* Stempel Cap Basah / Transparan */}
                    {layoutCustom.showStamp && stempelUrl && (
                      <img 
                        src={stempelUrl} 
                        alt="Stempel" 
                        className="w-10 h-10 object-contain absolute -top-4 -left-4 opacity-75 pointer-events-none" 
                      />
                    )}
                    
                    {/* Tanda Tangan */}
                    {layoutCustom.showSignature && (
                      <div className="h-6 flex items-center justify-center">
                        {ttdKepala ? (
                          <img src={ttdKepala} alt="TTD" className="max-h-6 object-contain" />
                        ) : (
                          <div className="text-[7px] italic font-serif opacity-75">ttd resmi</div>
                        )}
                      </div>
                    )}
                    
                    <div className="border-t border-slate-400/60 pt-0.5 font-bold text-[7px] truncate max-w-[130px]">
                      {effectiveSignerName}
                    </div>
                    <div className="text-[6px] opacity-75">{effectiveSignerTitle}</div>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
