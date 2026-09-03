import React, { useState, useRef, useEffect } from 'react';
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
  Camera,
  Sparkles,
  Award,
  ShieldCheck,
  QrCode,
  Check
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { updateSantri } from '../services/api';

export const CARD_THEMES = [
  {
    id: 'pesantren-emerald',
    name: 'Klasik Pesantren (Hijau Zamrud & Emas)',
    badge: 'Salaf Resmi',
    primaryColor: '#064E3B',
    accentColor: '#D97706',
    fontStyle: 'font-serif',
    description: 'Ornamen islami, kaligrafi bismillah, lis emas klasik khas pesantren tradisional.'
  },
  {
    id: 'academic-blue',
    name: 'Modern Enterprise Bento (Smart NFC & Chip)',
    badge: 'Smart Campus',
    primaryColor: '#1D4ED8',
    accentColor: '#06B6D4',
    fontStyle: 'font-sans',
    description: 'Tata letak modern bento, replika chip ATM emas, NFC contactless & barcode modern.'
  },
  {
    id: 'navy-gold',
    name: 'Eksklusif Mahad (Midnight Obsidian & Gold Foil)',
    badge: 'Luxury VIP',
    primaryColor: '#0B1120',
    accentColor: '#F59E0B',
    fontStyle: 'font-sans',
    description: 'Pita emas metalik diagonal, sudut mewah beriluminasi, tampilan kartu VIP.'
  },
  {
    id: 'minimalist-slate',
    name: 'Monokrom Swiss (Clean Studio & Barcode)',
    badge: 'Minimalis',
    primaryColor: '#18181B',
    accentColor: '#71717A',
    fontStyle: 'font-mono',
    description: 'Tipografi presisi tinggi, garis aksen stark black, crosshair crop mark studio.'
  },
];

export default function SantriIdCard({ santri, isOpen, onClose }) {
  const { settings, isNfcEnabled } = useSettings();

  // Customizer States
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait'
  const [activeTheme, setActiveTheme] = useState('pesantren-emerald');
  const [viewSide, setViewSide] = useState('both'); // 'both' | 'front' | 'back'
  const [customFrontBg, setCustomFrontBg] = useState(null);
  const [customBackBg, setCustomBackBg] = useState(null);
  const [canvaUrl, setCanvaUrl] = useState('');
  
  // Santri Photo State (dengan auto-sync ke database)
  const [santriPhoto, setSantriPhoto] = useState(santri?.foto || null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const [photoNotice, setPhotoNotice] = useState('');

  const photoInputRef = useRef(null);
  const frontCardRef = useRef(null);
  const backCardRef = useRef(null);

  useEffect(() => {
    if (santri) {
      setSantriPhoto(santri.foto || null);
    }
  }, [santri]);

  if (!isOpen || !santri) return null;

  const currentTheme = CARD_THEMES.find(t => t.id === activeTheme) || CARD_THEMES[0];
  const namaLembaga = settings.NAMA_LEMBAGA || 'PONDOK PESANTREN TERPADU';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'Lembaga Pendidikan & Kaderisasi Ulama';
  const kepalaPondok = settings.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const ttdKepala = settings.TTD_KEPALA_URL;
  const stempelUrl = settings.STEMPEL_URL;

  // Handle Upload Pas Foto Santri (Realtime Preview & Sync ke Database)
  const handleUploadSantriPhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file maksimal 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result;
        setSantriPhoto(base64Photo);
        setPhotoSaving(true);
        try {
          await updateSantri(santri.id, { foto: base64Photo });
          santri.foto = base64Photo;
          setPhotoNotice('Foto santri tersimpan ke database!');
          setTimeout(() => setPhotoNotice(''), 3500);
        } catch (err) {
          console.warn('Gagal sync foto ke database server:', err);
          setPhotoNotice('Foto diterapkan pada kartu');
          setTimeout(() => setPhotoNotice(''), 3000);
        } finally {
          setPhotoSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = async () => {
    setSantriPhoto(null);
    try {
      await updateSantri(santri.id, { foto: null });
      santri.foto = null;
      setPhotoNotice('Foto pas santri dihapus.');
      setTimeout(() => setPhotoNotice(''), 3000);
    } catch (err) {
      console.warn('Gagal menghapus foto di database:', err);
    }
  };

  // Handle Custom Background Template Upload (PNG/JPG)
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

  // QR Code Payload
  const qrPayload = JSON.stringify({
    app: 'SiPesand',
    id: santri.id,
    nis: santri.nis,
    nfcUid: santri.nfcUid || 'NON-NFC',
    nama: santri.nama,
    kelas: santri.kelas,
    kamar: santri.kamar,
  });

  // =========================================================================
  // PRINT HANDLER DENGAN EXACT ISO CR-80 PVC DIMENSIONS (85.6mm x 54mm)
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
          <div class="cut-guide-note">Tampak Depan KTS Standar ISO CR-80 (85.6mm × 54mm)</div>
        </div>
      `;
    } else if (viewSide === 'back' && backEl) {
      htmlContent = `
        <div class="print-sheet">
          <div class="card-cell">${backEl.outerHTML}</div>
          <div class="cut-guide-note">Tampak Belakang KTS Standar ISO CR-80 (85.6mm × 54mm)</div>
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
            Panduan Potong Kartu Standar ISO CR-80 (85.6mm × 54mm) • Cetak pada Kertas PVC / Art Paper 260gr
          </div>
        </div>
      `;
    }

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
          <title>Cetak KTS - ${santri.nama} (${santri.nis})</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
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
              flex-wrap: wrap;
            }
            .card-cell {
              display: inline-block;
              position: relative;
              padding: 1.5mm;
              border: 1px dashed #94A3B8;
              border-radius: 4.5mm;
              background: #ffffff;
            }
            /* Exact ISO/IEC 7810 CR-80 Standard (85.60 mm × 53.98 mm) */
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
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }, 500);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  Studio Cetak Kartu Tanda Santri (KTS Standar CR-80)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-slate-950">
                  PVC ISO-7810
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Santri: <strong className="text-white">{santri.nama}</strong> ({santri.nis || 'NIS Non-Aktif'}) • Kelas: {santri.kelas}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Kartu Sekarang</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar Pengaturan Kartu */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-3">
          
          {/* Baris 1: Pilihan 4 Tema Eksklusif & Orientasi */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Pilihan 4 Tema Resmi dengan Indikator Visual */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>Desain & Tema KTS:</span>
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
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTheme === thm.id && !customFrontBg
                        ? 'border-blue-600 bg-white text-blue-700 shadow-md ring-2 ring-blue-500/20'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span 
                      className="w-3 h-3 rounded-full border border-black/10" 
                      style={{ backgroundColor: thm.primaryColor }}
                    />
                    <span>{thm.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-500 font-semibold">
                      {thm.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Switch Orientasi & Sisi */}
            <div className="flex items-center gap-2">
              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    orientation === 'landscape' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Landscape
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    orientation === 'portrait' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portrait
                </button>
              </div>

              <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewSide('both')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    viewSide === 'both' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Depan + Belakang
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('front')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    viewSide === 'front' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Depan Saja
                </button>
                <button
                  type="button"
                  onClick={() => setViewSide('back')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all ${
                    viewSide === 'back' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Belakang Saja
                </button>
              </div>
            </div>

          </div>

          {/* Baris 2: Upload Pas Foto Santri & Custom Template */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            
            {/* Bagian Upload Pas Foto Santri (Feature Request Utama) */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 text-xs flex items-center gap-1">
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>Pas Foto Santri:</span>
              </span>

              <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs shadow-sm transition-all active:scale-95">
                <Upload className="w-3.5 h-3.5" />
                <span>{santriPhoto ? 'Ganti Pas Foto Santri' : 'Upload Pas Foto Santri (3x4)'}</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={photoInputRef}
                  onChange={handleUploadSantriPhoto} 
                  className="hidden" 
                />
              </label>

              {santriPhoto && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Foto</span>
                </button>
              )}

              {photoNotice && (
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{photoNotice}</span>
                </span>
              )}
            </div>

            {/* Bagian Upload Template Sendiri / Canva */}
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 flex items-center gap-1.5 text-xs shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Desain Sendiri (PNG)</span>
                <input type="file" accept="image/*" onChange={(e) => handleUploadBg('front', e)} className="hidden" />
              </label>

              {customFrontBg && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomFrontBg(null);
                    setCustomBackBg(null);
                  }}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Card Display Studio */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-200/70 flex flex-wrap items-center justify-center gap-8 select-none">
          
          {/* ========================================================================= */}
          {/* SISI DEPAN (FRONT SIDE)                                                   */}
          {/* ========================================================================= */}
          {(viewSide === 'both' || viewSide === 'front') && (
            <div className="flex flex-col items-center gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                  Tampak Muka (Depan) • Standar ISO CR-80
                </span>
                {customFrontBg && (
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                    Custom Template
                  </span>
                )}
              </div>

              {/* CARD CONTAINER DENGAN 4 TEMA DESAIN YANG BENAR-BENAR BERBEDA */}
              <div
                id="id-card-front-printable"
                ref={frontCardRef}
                className={`id-card-printable ${orientation === 'landscape' ? 'cr80-landscape' : 'cr80-portrait'} rounded-2xl shadow-2xl overflow-hidden relative border transition-all duration-300 ${
                  orientation === 'landscape'
                    ? 'w-[360px] sm:w-[400px] h-[227px] sm:h-[252px]'
                    : 'w-[230px] sm:w-[250px] h-[364px] sm:h-[396px]'
                }`}
                style={{
                  backgroundImage: customFrontBg ? `url(${customFrontBg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >

                {/* ================================================================= */}
                {/* DESAIN 1: KLASIK PESANTREN (HIJAU ZAMRUD & EMAS SALAF)            */}
                {/* ================================================================= */}
                {activeTheme === 'pesantren-emerald' && !customFrontBg && (
                  <div className={`w-full h-full bg-gradient-to-b from-[#064E3B] via-[#047857] to-[#022c22] text-white p-3 flex flex-col justify-between relative font-serif`}>
                    
                    {/* Background Islamic Watermark Lattice */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="islamic-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#FDE68A" strokeWidth="1" />
                            <circle cx="20" cy="20" r="6" fill="none" stroke="#FDE68A" strokeWidth="0.8" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#islamic-grid)" />
                      </svg>
                    </div>

                    {/* Ornate Gold Border Line */}
                    <div className="absolute inset-1.5 border border-amber-300/40 rounded-xl pointer-events-none" />
                    <div className="absolute inset-2 border border-amber-400/20 rounded-lg pointer-events-none" />

                    {/* Header: Bismillah & Kop Pesantren */}
                    <div className="relative z-10 border-b border-amber-400/30 pb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {logoPondok ? (
                          <div className="w-8 h-8 rounded-lg bg-white p-0.5 shadow-sm flex items-center justify-center flex-shrink-0 border border-amber-300">
                            <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-amber-400 text-[#064E3B] flex items-center justify-center font-bold flex-shrink-0 shadow">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <div className="text-[7.5px] text-amber-200 font-sans tracking-widest uppercase">
                            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                          </div>
                          <h4 className="font-black text-[11px] uppercase tracking-wide leading-tight text-amber-300 truncate max-w-[210px]">
                            {namaLembaga}
                          </h4>
                          <div className="text-[7px] text-emerald-100 font-sans tracking-wider">
                            KARTU TANDA SANTRI (KTS)
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-400/20 border border-amber-300/40 text-[7px] font-sans font-bold text-amber-300">
                          <Award className="w-2.5 h-2.5 text-amber-300" />
                          <span>RESMI</span>
                        </span>
                      </div>
                    </div>

                    {/* Body: Landscape vs Portrait */}
                    {orientation === 'landscape' ? (
                      <div className="flex items-center gap-3 relative z-10 my-auto">
                        
                        {/* Pas Foto dengan Frame Emas Klasik */}
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          title="Klik untuk ganti pas foto santri"
                          className="w-[74px] sm:w-[82px] h-[94px] sm:h-[104px] rounded-lg bg-[#064E3B] p-1 border-2 border-amber-400 shadow-md relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="text-center text-amber-200">
                              <div className="text-2xl font-bold">{santri.nama.charAt(0)}</div>
                              <div className="text-[6px] font-sans tracking-tighter uppercase font-bold">PAS FOTO</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7px] font-sans">
                            <Camera className="w-4 h-4 mb-0.5" />
                            <span>Ubah</span>
                          </div>
                        </div>

                        {/* Data Identitas Santri Salaf */}
                        <div className="flex-1 min-w-0 space-y-0.5 text-left font-sans">
                          <div className="text-[8px] text-amber-300 font-bold uppercase tracking-wider">
                            NAMA SANTRI:
                          </div>
                          <h3 className="font-black text-[13px] sm:text-[14px] leading-tight text-white truncate font-serif">
                            {santri.nama}
                          </h3>
                          <div className="text-[10px] font-mono font-bold text-amber-300 tracking-wider">
                            NIS: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8.5px] space-y-0.5 text-emerald-100 pt-0.5">
                            <div>Kelas : <strong className="text-white">{santri.kelas || '10 KMI'}</strong></div>
                            <div>Kamar : <strong className="text-white">{santri.kamar || 'Asrama Al-Ghazali'}</strong></div>
                            <div className="truncate max-w-[170px]">Daerah: {santri.alamat || 'Indonesia'}</div>
                          </div>
                        </div>

                        {/* QR Code dengan Ornamen Emas */}
                        <div className="bg-white p-1 rounded-lg border-2 border-amber-400 shadow-md flex flex-col items-center flex-shrink-0">
                          <QRCodeSVG value={qrPayload} size={48} level="M" fgColor="#064E3B" />
                          <span className="text-[5.5px] font-mono text-[#064E3B] font-black mt-0.5">VERIFIKASI</span>
                        </div>

                      </div>
                    ) : (
                      /* Portrait Body */
                      <div className="flex flex-col items-center gap-1.5 relative z-10 my-auto font-sans">
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          className="w-[76px] h-[96px] rounded-lg bg-[#064E3B] p-1 border-2 border-amber-400 shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group relative"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="text-center text-amber-200">
                              <div className="text-2xl font-bold font-serif">{santri.nama.charAt(0)}</div>
                              <div className="text-[6px] font-sans font-bold">PAS FOTO</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7px]">
                            <Camera className="w-3.5 h-3.5 mb-0.5" />
                            <span>Ubah</span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <h3 className="font-black text-[12px] leading-tight text-white truncate max-w-[190px] font-serif">
                            {santri.nama}
                          </h3>
                          <div className="text-[9.5px] font-mono font-bold text-amber-300">
                            NIS: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8px] text-emerald-100">
                            {santri.kelas} • {santri.kamar}
                          </div>
                        </div>

                        <div className="bg-white p-1 rounded-lg border border-amber-400">
                          <QRCodeSVG value={qrPayload} size={42} level="M" fgColor="#064E3B" />
                        </div>
                      </div>
                    )}

                    {/* Footer Kartu Salaf */}
                    <div className="relative z-10 border-t border-amber-400/30 pt-1 flex items-center justify-between text-[7px] text-amber-200 font-sans">
                      <span>KARTU RESMI SANTRI</span>
                      <span className="font-mono font-bold">UID: {santri.nfcUid || 'KTS-PESANTREN'}</span>
                    </div>

                  </div>
                )}

                {/* ================================================================= */}
                {/* DESAIN 2: MODERN ENTERPRISE BENTO (SMART NFC & GOLD EMV CHIP)     */}
                {/* ================================================================= */}
                {activeTheme === 'academic-blue' && !customFrontBg && (
                  <div className={`w-full h-full bg-white text-slate-900 p-3.5 flex flex-col justify-between relative font-sans border-2 border-blue-600`}>
                    
                    {/* Sleek Blue Accent Header */}
                    <div className="flex items-center justify-between border-b-2 border-blue-600 pb-2 relative z-10">
                      <div className="flex items-center gap-2">
                        {logoPondok ? (
                          <img src={logoPondok} alt="Logo" className="w-7 h-7 object-contain" />
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                            <Building2 className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-[11px] uppercase tracking-tight text-blue-900 truncate max-w-[200px]">
                            {namaLembaga}
                          </h4>
                          <div className="text-[7px] font-extrabold text-blue-600 tracking-wider uppercase">
                            SMART STUDENT ID • ISO CR-80
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-[8px] font-bold">
                          <Radio className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
                          <span>NFC SMART</span>
                        </div>
                      </div>
                    </div>

                    {/* Body: Bento Grid Layout */}
                    {orientation === 'landscape' ? (
                      <div className="flex items-center gap-3 relative z-10 my-auto">
                        
                        {/* Pas Foto dengan Tag Modern */}
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          title="Klik untuk ganti pas foto santri"
                          className="w-[74px] sm:w-[82px] h-[92px] sm:h-[102px] rounded-2xl bg-slate-100 border-2 border-slate-900 shadow-md relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center text-slate-500">
                              <div className="text-2xl font-black text-slate-800">{santri.nama.charAt(0)}</div>
                              <div className="text-[6px] font-bold">SMART PHOTO</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7.5px] font-bold">
                            <Camera className="w-4 h-4 mb-0.5" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        {/* Gold EMV Smart Chip (Replika Kartu ATM Perbankan) */}
                        <div className="w-10 h-7 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-600 p-0.5 flex flex-col justify-between shadow-inner flex-shrink-0">
                          <div className="border-b border-amber-600/50 h-1.5" />
                          <div className="flex justify-between h-2 border-y border-amber-600/50">
                            <div className="border-r border-amber-600/50 w-3" />
                            <div className="border-l border-amber-600/50 w-3" />
                          </div>
                          <div className="border-t border-amber-600/50 h-1.5" />
                        </div>

                        {/* Data Santri Enterprise */}
                        <div className="flex-1 min-w-0 space-y-0.5 text-left">
                          <div className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider">
                            NAMA LENGKAP:
                          </div>
                          <h3 className="font-extrabold text-[13px] leading-tight text-slate-900 truncate">
                            {santri.nama}
                          </h3>
                          <div className="text-[10px] font-mono font-black text-blue-700">
                            ID: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8px] space-y-0.5 text-slate-600">
                            <div>Kelas: <strong className="text-slate-900">{santri.kelas || '-'}</strong></div>
                            <div>Kamar: <strong className="text-slate-900">{santri.kamar || '-'}</strong></div>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-slate-50 p-1 rounded-xl border border-slate-200 flex flex-col items-center flex-shrink-0">
                          <QRCodeSVG value={qrPayload} size={46} level="M" />
                          <span className="text-[5.5px] font-mono font-bold text-slate-600 mt-0.5">SCAN ME</span>
                        </div>

                      </div>
                    ) : (
                      /* Portrait Body */
                      <div className="flex flex-col items-center gap-1.5 relative z-10 my-auto">
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          className="w-[74px] h-[92px] rounded-2xl bg-slate-100 border-2 border-slate-900 shadow-md overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group relative"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xl font-bold text-slate-700">{santri.nama.charAt(0)}</div>
                          )}
                          <div className="absolute inset-0 bg-blue-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7.5px] font-bold">
                            <Camera className="w-3.5 h-3.5 mb-0.5" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <h3 className="font-extrabold text-[12px] text-slate-900 truncate max-w-[190px]">
                            {santri.nama}
                          </h3>
                          <div className="text-[9.5px] font-mono font-black text-blue-700">
                            ID: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8px] text-slate-500">
                            {santri.kelas} • {santri.kamar}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <QRCodeSVG value={qrPayload} size={40} level="M" />
                        </div>
                      </div>
                    )}

                    {/* Footer Barcode & Clean Tech Bar */}
                    <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-[7px] text-slate-400 font-mono">
                      <span>SIPESAND ENTERPRISE</span>
                      <span className="font-bold text-slate-700">UID: {santri.nfcUid || 'ACTIVE'}</span>
                    </div>

                  </div>
                )}

                {/* ================================================================= */}
                {/* DESAIN 3: MIDNIGHT OBSIDIAN & GOLD FOIL (LUXURY VIP MAHAD)        */}
                {/* ================================================================= */}
                {activeTheme === 'navy-gold' && !customFrontBg && (
                  <div className={`w-full h-full bg-gradient-to-br from-[#0A0F1D] via-[#0F172A] to-[#050811] text-white p-3 flex flex-col justify-between relative font-sans border-2 border-amber-400/80`}>
                    
                    {/* Diagonal Metallic Gold Ribbon */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 rotate-45 opacity-20 pointer-events-none" />

                    {/* Illuminated Gold Header */}
                    <div className="flex items-center justify-between border-b border-amber-500/40 pb-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        {logoPondok ? (
                          <img src={logoPondok} alt="Logo" className="w-7 h-7 object-contain rounded border border-amber-400/50" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                            <Sparkles className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-black text-[11px] uppercase tracking-wider text-amber-300 truncate max-w-[200px]">
                            {namaLembaga}
                          </h4>
                          <div className="text-[7px] text-slate-400 tracking-widest uppercase font-semibold">
                            MA'HAD VIP MEMBER CARD
                          </div>
                        </div>
                      </div>

                      <div className="px-2 py-0.5 rounded bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 text-[8px] font-black tracking-wider uppercase shadow">
                        GOLD EDITION
                      </div>
                    </div>

                    {/* Body: Luxury Dark Layout */}
                    {orientation === 'landscape' ? (
                      <div className="flex items-center gap-3 relative z-10 my-auto">
                        
                        {/* Pas Foto dengan Lis Emas Mewah */}
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          title="Klik untuk ganti pas foto santri"
                          className="w-[74px] sm:w-[82px] h-[92px] sm:h-[102px] rounded-lg bg-slate-950 p-1 border-2 border-amber-400 shadow-xl shadow-amber-500/10 relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="text-center text-amber-300">
                              <div className="text-2xl font-bold">{santri.nama.charAt(0)}</div>
                              <div className="text-[6px] tracking-widest font-bold">VIP PHOTO</div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 text-[7.5px] font-bold">
                            <Camera className="w-4 h-4 mb-0.5 text-amber-400" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        {/* Identitas Santri VIP */}
                        <div className="flex-1 min-w-0 space-y-0.5 text-left">
                          <div className="text-[7px] text-amber-400/80 font-mono tracking-widest uppercase">
                            OFFICIAL CARD HOLDER
                          </div>
                          <h3 className="font-extrabold text-[13px] sm:text-[14px] leading-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 truncate">
                            {santri.nama}
                          </h3>
                          <div className="text-[10px] font-mono font-bold text-amber-400">
                            NIS: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8.5px] space-y-0.5 text-slate-300">
                            <div>Tingkat : <strong className="text-amber-200">{santri.kelas || '-'}</strong></div>
                            <div>Domisili: <strong className="text-amber-200">{santri.kamar || '-'}</strong></div>
                          </div>
                        </div>

                        {/* QR Code dengan Gold Corner Brackets */}
                        <div className="bg-slate-900 p-1.5 rounded-lg border border-amber-500/60 shadow-lg flex flex-col items-center flex-shrink-0">
                          <QRCodeSVG value={qrPayload} size={44} level="M" fgColor="#F59E0B" bgColor="#0B1120" />
                          <span className="text-[5.5px] font-mono text-amber-400 font-bold mt-0.5">AUTHENTIC</span>
                        </div>

                      </div>
                    ) : (
                      /* Portrait Body */
                      <div className="flex flex-col items-center gap-1.5 relative z-10 my-auto">
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          className="w-[74px] h-[92px] rounded-lg bg-slate-950 p-1 border-2 border-amber-400 shadow-xl overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group relative"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="text-xl font-bold text-amber-300">{santri.nama.charAt(0)}</div>
                          )}
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-amber-300 text-[7.5px] font-bold">
                            <Camera className="w-3.5 h-3.5 mb-0.5 text-amber-400" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <h3 className="font-extrabold text-[12px] text-amber-300 truncate max-w-[190px]">
                            {santri.nama}
                          </h3>
                          <div className="text-[9px] font-mono font-bold text-amber-400">
                            NIS: {santri.nis || '202601001'}
                          </div>
                          <div className="text-[8px] text-slate-300">
                            {santri.kelas} • {santri.kamar}
                          </div>
                        </div>

                        <div className="bg-slate-900 p-1 rounded-lg border border-amber-500/60">
                          <QRCodeSVG value={qrPayload} size={38} level="M" fgColor="#F59E0B" bgColor="#0B1120" />
                        </div>
                      </div>
                    )}

                    {/* Footer Gold Ribbon */}
                    <div className="border-t border-amber-500/40 pt-1 flex items-center justify-between text-[7px] text-amber-300 font-mono relative z-10">
                      <span>EXCLUSIVE DIGITAL CARD</span>
                      <span>SECURE NFC CERTIFIED</span>
                    </div>

                  </div>
                )}

                {/* ================================================================= */}
                {/* DESAIN 4: MONOKROM SWISS (CLEAN STUDIO & HIGH CONTRAST BARCODE)   */}
                {/* ================================================================= */}
                {activeTheme === 'minimalist-slate' && !customFrontBg && (
                  <div className={`w-full h-full bg-[#FAFAFA] text-slate-900 p-3.5 flex flex-col justify-between relative font-mono border-2 border-black`}>
                    
                    {/* Stark Minimalist Black Header */}
                    <div className="flex items-center justify-between border-b-2 border-black pb-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-black text-white flex items-center justify-center font-bold text-xs">
                          {santri.nama.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-[11px] uppercase tracking-tight text-black truncate max-w-[200px]">
                            {namaLembaga}
                          </h4>
                          <div className="text-[7px] tracking-widest uppercase text-slate-500 font-semibold">
                            STUDENT RECORD // KTS-CR80
                          </div>
                        </div>
                      </div>

                      <span className="text-[8px] font-bold border border-black px-1.5 py-0.5">
                        NO. {santri.nis || '00000'}
                      </span>
                    </div>

                    {/* Body: Minimalist Grid Layout */}
                    {orientation === 'landscape' ? (
                      <div className="flex items-center gap-3 relative z-10 my-auto">
                        
                        {/* Pas Foto dengan Sudut Studio Crosshair (+) */}
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          title="Klik untuk ganti pas foto santri"
                          className="w-[74px] sm:w-[82px] h-[92px] sm:h-[102px] bg-slate-200 border-2 border-black relative overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center font-bold text-xs text-slate-600">FOTO</div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7.5px] font-sans font-bold">
                            <Camera className="w-4 h-4 mb-0.5" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        {/* Garis Aksen Vertikal & Data Santri */}
                        <div className="flex-1 min-w-0 pl-2 border-l-2 border-black space-y-0.5 text-left">
                          <div className="text-[7px] text-slate-500 uppercase tracking-wider">STUDENT FULL NAME:</div>
                          <h3 className="font-black text-[13px] leading-tight text-black truncate font-sans uppercase">
                            {santri.nama}
                          </h3>
                          <div className="text-[9.5px] font-bold text-slate-800">
                            GRADE: {santri.kelas || '-'}
                          </div>
                          <div className="text-[8px] text-slate-600">
                            ROOM : {santri.kamar || '-'}
                          </div>
                        </div>

                        {/* High Contrast QR */}
                        <div className="p-1 border-2 border-black bg-white flex flex-col items-center flex-shrink-0">
                          <QRCodeSVG value={qrPayload} size={44} level="H" fgColor="#000000" />
                        </div>

                      </div>
                    ) : (
                      /* Portrait Body */
                      <div className="flex flex-col items-center gap-1.5 relative z-10 my-auto">
                        <div 
                          onClick={() => photoInputRef.current?.click()}
                          className="w-[74px] h-[92px] bg-slate-200 border-2 border-black overflow-hidden flex items-center justify-center flex-shrink-0 cursor-pointer group relative"
                        >
                          {santriPhoto ? (
                            <img src={santriPhoto} alt={santri.nama} className="w-full h-full object-cover" />
                          ) : (
                            <div className="font-bold text-xs">FOTO</div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[7.5px] font-sans font-bold">
                            <Camera className="w-3.5 h-3.5 mb-0.5" />
                            <span>Ganti Foto</span>
                          </div>
                        </div>

                        <div className="text-center space-y-0.5">
                          <h3 className="font-black text-[12px] text-black truncate max-w-[190px] font-sans uppercase">
                            {santri.nama}
                          </h3>
                          <div className="text-[9px] font-bold text-slate-700">
                            NIS: {santri.nis || '-'}
                          </div>
                          <div className="text-[8px] text-slate-500">
                            {santri.kelas} • {santri.kamar}
                          </div>
                        </div>

                        <div className="p-1 border-2 border-black bg-white">
                          <QRCodeSVG value={qrPayload} size={38} level="H" fgColor="#000000" />
                        </div>
                      </div>
                    )}

                    {/* Footer Barcode Monokrom */}
                    <div className="border-t-2 border-black pt-1 flex items-center justify-between text-[7px] text-black font-mono">
                      <span>||||| |||| || |||||| ||||</span>
                      <span>ISO/IEC 7810</span>
                    </div>

                  </div>
                )}

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SISI BELAKANG (BACK SIDE) - TATA TERTIB & TTD RESMI                        */}
          {/* ========================================================================= */}
          {(viewSide === 'both' || viewSide === 'back') && (
            <div className="flex flex-col items-center gap-2.5">
              <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                Tampak Belakang (Ketentuan & TTD)
              </span>

              <div
                id="id-card-back-printable"
                ref={backCardRef}
                className={`id-card-printable ${orientation === 'landscape' ? 'cr80-landscape' : 'cr80-portrait'} rounded-2xl shadow-2xl overflow-hidden relative border transition-all duration-300 ${
                  orientation === 'landscape'
                    ? 'w-[360px] sm:w-[400px] h-[227px] sm:h-[252px]'
                    : 'w-[230px] sm:w-[250px] h-[364px] sm:h-[396px]'
                } ${
                  activeTheme === 'navy-gold' 
                    ? 'bg-[#0B1120] text-white border-amber-500/50' 
                    : activeTheme === 'pesantren-emerald'
                    ? 'bg-[#F0FDF4] text-slate-900 border-emerald-700'
                    : activeTheme === 'minimalist-slate'
                    ? 'bg-white text-black border-black'
                    : 'bg-white text-slate-900 border-blue-600'
                } p-3.5 flex flex-col justify-between`}
                style={{
                  backgroundImage: customBackBg ? `url(${customBackBg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {/* Header Belakang */}
                <div className={`border-b pb-1.5 relative z-10 ${
                  activeTheme === 'navy-gold' ? 'border-amber-500/40 text-amber-300' : 'border-slate-300 text-slate-900'
                }`}>
                  <div className="font-extrabold text-[10px] uppercase tracking-wider text-center">
                    KETENTUAN PENGGUNAAN KARTU SANTRI
                  </div>
                </div>

                {/* 3 Butir Tata Tertib Standar */}
                <div className={`space-y-1.5 text-[8px] leading-tight text-left relative z-10 my-auto ${
                  activeTheme === 'navy-gold' ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold">1.</span>
                    <span>Kartu ini adalah identitas resmi santri {namaLembaga}.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold">2.</span>
                    <span>Wajib dibawa saat perizinan pos keamanan gerbang dan transaksi saku non-tunai di kantin.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold">3.</span>
                    <span>Apabila kartu ini tercecer atau hilang, mohon dikembalikan ke Bagian Kesantrian / Sekretariat Pesantren.</span>
                  </div>
                </div>

                {/* Footer TTD & Stempel Resmi */}
                <div className={`border-t pt-1.5 flex items-end justify-between relative z-10 ${
                  activeTheme === 'navy-gold' ? 'border-amber-500/40' : 'border-slate-300'
                }`}>
                  <div className="text-left text-[7px] space-y-0.5">
                    <div className="font-bold">Diterbitkan oleh:</div>
                    <div>Sekretariat Pesantren</div>
                    <div className="font-mono text-[6.5px] opacity-75">Tahun Ajaran 2026/2027</div>
                  </div>

                  <div className="text-center relative">
                    {/* Stempel Cap Basah / Transparan */}
                    {stempelUrl && (
                      <img 
                        src={stempelUrl} 
                        alt="Stempel" 
                        className="w-11 h-11 object-contain absolute -top-4 -left-4 opacity-80 pointer-events-none" 
                      />
                    )}
                    
                    {/* Tanda Tangan */}
                    <div className="h-6 flex items-center justify-center">
                      {ttdKepala ? (
                        <img src={ttdKepala} alt="TTD" className="max-h-6 object-contain" />
                      ) : (
                        <div className="text-[7.5px] italic font-serif opacity-75">ttd resmi</div>
                      )}
                    </div>
                    
                    <div className="border-t border-slate-400 pt-0.5 font-bold text-[7.5px] truncate max-w-[140px]">
                      {kepalaPondok}
                    </div>
                    <div className="text-[6.5px] opacity-75">Pengasuh / Kepala Pondok</div>
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
