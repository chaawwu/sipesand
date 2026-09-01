import React, { useState } from 'react';
import { 
  Printer, 
  Building2, 
  Receipt, 
  X, 
  Plus, 
  Trash2,
  Globe,
  Download,
  FileCheck
} from 'lucide-react';
import { terbilang } from '../utils/terbilang';
import { useSettings } from '../context/SettingsContext';

export default function OfficialReceipt({ isOpen, onClose, defaultData, readOnly = false }) {
  const { settings } = useSettings();

  if (!isOpen) return null;

  // Receipt Data State
  const [receiptNo, setReceiptNo] = useState(
    defaultData?.code || `KWT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [receiptDate, setReceiptDate] = useState(
    defaultData?.date ? new Date(defaultData.date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)
  );
  const [santriName, setSantriName] = useState(defaultData?.santriName || 'Muhammad Farhan Al-Fatih');
  const [waliName, setWaliName] = useState(defaultData?.waliName || 'H. Abdullah Farhan');
  const [nis, setNis] = useState(defaultData?.nis || '202601001');
  const [kelas, setKelas] = useState(defaultData?.kelas || '10 IPA 1 (KMI 4)');
  const [paymentMethod, setPaymentMethod] = useState(defaultData?.paymentMethod || 'Transfer Bank Syariah (BSI)');
  
  const bendaharaName = defaultData?.bendaharaName || settings.NAMA_BENDAHARA || 'Ustadz Ridwan, S.E.';
  const namaLembaga = settings.NAMA_LEMBAGA || 'PONDOK PESANTREN TERPADU SIPESAND';
  const taglineLembaga = settings.TAGLINE_LEMBAGA || 'LEMBAGA PENDIDIKAN ISLAM MODERN & TAHFIDZUL QUR\'AN';
  const alamatLembaga = settings.ALAMAT_LEMBAGA || 'Jl. Pesantren Digital No. 01, Kompleks Terpadu';
  const noTelp = settings.NO_TELP || '(0274) 8899-7711';
  const logoPondok = settings.LOGO_PONDOK_URL;
  const capStempel = settings.CAP_STEMPEL_URL;
  const ttdBendahara = settings.TTD_BENDAHARA_URL;

  // Itemized Billing Items
  const [items, setItems] = useState(
    defaultData?.items || [
      { id: 1, name: 'SPP Syahriyah Pesantren Terpadu', amount: 1200000 },
    ]
  );

  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const terbilangText = terbilang(totalAmount);

  const handleAddItem = () => {
    if (readOnly) return;
    setItems([...items, { id: Date.now(), name: 'Pembayaran Lainnya', amount: 100000 }]);
  };

  const handleRemoveItem = (id) => {
    if (readOnly) return;
    if (items.length > 1) {
      setItems(items.filter(it => it.id !== id));
    }
  };

  const handleItemChange = (id, field, value) => {
    if (readOnly) return;
    setItems(items.map(it => it.id === id ? { ...it, [field]: value } : it));
  };

  // Bulletproof Isolated Print to prevent blank pages on any browser
  const handlePrint = () => {
    const printContent = document.getElementById('receipt-printable-content');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const formattedDate = new Date(receiptDate).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const itemsRows = items.map((it, idx) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #64748b; font-size: 11px;">${idx + 1}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a; font-size: 11px;">${it.name}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a; font-size: 11px;">Rp ${parseFloat(it.amount || 0).toLocaleString('id-ID')}</td>
      </tr>
    `).join('');

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Kwitansi - ${santriName} (${receiptNo})</title>
          <style>
            @page { size: A4 portrait; margin: 12mm; }
            * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            body { font-family: 'Plus Jakarta Sans', Arial, sans-serif; color: #111827; background: #fff; margin: 0; padding: 15px; font-size: 11.5px; line-height: 1.4; }
            .receipt-box { max-width: 680px; margin: 0 auto; border: 1.5px solid #0f172a; padding: 24px; border-radius: 8px; position: relative; }
            .header-kop { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px; }
            .kop-left { display: flex; align-items: center; gap: 12px; }
            .logo-img { max-height: 52px; max-width: 52px; object-fit: contain; }
            .kop-title { font-size: 14px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin: 0; }
            .kop-sub { font-size: 9.5px; color: #475569; margin-top: 2px; }
            .badge-kwitansi { background: #eff6ff; color: #1e3a8a; border: 1px solid #bfdbfe; padding: 4px 8px; border-radius: 6px; font-weight: 800; font-size: 10px; text-transform: uppercase; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 14px; border-radius: 6px; margin: 14px 0; font-size: 10.5px; }
            .meta-label { color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 600; display: block; }
            .table-items { width: 100%; border-collapse: collapse; margin: 14px 0; }
            .table-items th { background: #f1f5f9; padding: 8px 10px; font-size: 9.5px; text-transform: uppercase; text-align: left; border-bottom: 1.5px solid #cbd5e1; }
            .terbilang-box { background: #f8fafc; border: 1px dashed #cbd5e1; padding: 8px 12px; border-radius: 6px; font-style: italic; color: #334155; margin: 10px 0; font-size: 10.5px; }
            .ttd-container { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; }
            .ttd-box { width: 220px; text-align: center; position: relative; }
            .stempel-img { position: absolute; left: 20px; top: -10px; width: 95px; height: 95px; object-fit: contain; opacity: 0.85; mix-blend-mode: multiply; pointer-events: none; }
            .ttd-img { max-height: 48px; object-fit: contain; margin: 4px auto; }
            .footer-note { text-align: center; font-size: 8.5px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 18px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            
            <div class="header-kop">
              <div class="kop-left">
                ${logoPondok ? `<img src="${logoPondok}" class="logo-img" />` : ''}
                <div>
                  <h2 class="kop-title">${namaLembaga}</h2>
                  <div class="kop-sub">${taglineLembaga}</div>
                  <div style="font-size: 8.5px; color: #64748b;">${alamatLembaga} • Telp: ${noTelp}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <span class="badge-kwitansi">KWITANSI RESMI SAH</span>
                <div style="font-family: monospace; font-size: 9.5px; color: #475569; margin-top: 4px;">
                  No: <strong>${receiptNo}</strong>
                </div>
              </div>
            </div>

            <div class="meta-grid">
              <div>
                <span class="meta-label">Telah Diterima Dari</span>
                <div style="font-weight: bold; font-size: 12px; color: #0f172a;">${waliName}</div>
                <div style="color: #475569; font-size: 10px; margin-top: 2px;">Wali dari: <strong style="color: #1e3a8a;">${santriName}</strong></div>
              </div>
              <div>
                <span class="meta-label">Tanggal Pembayaran</span>
                <div style="font-weight: bold; color: #0f172a;">${formattedDate}</div>
                <div style="color: #475569; font-size: 10px; margin-top: 2px;">Metode: <strong>${paymentMethod}</strong></div>
              </div>
              <div>
                <span class="meta-label">NIS & Kelas Santri</span>
                <div style="font-family: monospace; font-weight: bold;">${nis} • ${kelas}</div>
              </div>
              <div>
                <span class="meta-label">Status Verifikasi</span>
                <div style="font-weight: bold; color: #059669;">LUNAS (TERVERIFIKASI SISTEM)</div>
              </div>
            </div>

            <table class="table-items">
              <thead>
                <tr>
                  <th style="width: 40px; text-align: center;">No</th>
                  <th>Rincian Pembayaran</th>
                  <th style="width: 150px; text-align: right;">Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
                <tr style="background: #f8fafc; font-weight: bold;">
                  <td colspan="2" style="padding: 10px; text-align: right; border-top: 1.5px solid #cbd5e1; font-size: 11px;">TOTAL PEMBAYARAN:</td>
                  <td style="padding: 10px; text-align: right; border-top: 1.5px solid #cbd5e1; font-family: monospace; font-size: 13px; color: #1e3a8a;">Rp ${totalAmount.toLocaleString('id-ID')}</td>
                </tr>
              </tbody>
            </table>

            <div class="terbilang-box">
              <strong>Terbilang:</strong> <span>${terbilangText} Rupiah</span>
            </div>

            <div class="ttd-container">
              <div class="ttd-box">
                <div style="font-size: 9.5px; color: #64748b;">Penyetor / Wali Santri,</div>
                <div style="height: 48px;"></div>
                <div style="font-weight: bold; text-decoration: underline;">( ${waliName} )</div>
              </div>

              <div class="ttd-box">
                <div style="font-size: 9.5px; color: #64748b;">Bendahara Penerima,</div>
                <div style="height: 48px; position: relative; display: flex; align-items: center; justify-content: center;">
                  ${capStempel ? `<img src="${capStempel}" class="stempel-img" />` : ''}
                  ${ttdBendahara ? `<img src="${ttdBendahara}" class="ttd-img" />` : '<div style="height: 40px;"></div>'}
                </div>
                <div style="font-weight: bold; text-decoration: underline;">${bendaharaName}</div>
              </div>
            </div>

            <div class="footer-note">
              Dokumen ini diterbitkan secara resmi oleh Sistem Terpadu Pesantren SiPesand (kingdigitalpremium.my.id) dan sah sebagai bukti pembayaran.
            </div>

          </div>
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() {
                if (window.frameElement && window.frameElement.parentNode) {
                  window.frameElement.parentNode.removeChild(window.frameElement);
                }
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in text-xs font-sans">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header Modal - Hidden during Print */}
        <div className="print:hidden bg-slate-900 text-white px-5 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Kwitansi Resmi Pembayaran Pesantren</h3>
              <p className="text-[10px] text-slate-400">
                {readOnly ? 'Format PDF Cetak Sah (Non-Editable)' : 'Generator Kwitansi Bendahara'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Canvas */}
        <div className="p-3 sm:p-6 overflow-y-auto flex-1 bg-slate-100 print:bg-white print:p-0 print:m-0">
          
          <div id="receipt-printable-content" className="receipt-paper bg-white w-full max-w-2xl mx-auto p-5 sm:p-8 rounded-xl shadow border border-slate-200 print:shadow-none print:border-none print:p-4 text-slate-800 font-sans text-xs">
            
            {/* 1. KOP SURAT PESANTREN RESMI DINAMIS */}
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-slate-900 gap-3">
              <div className="flex items-center gap-3">
                {logoPondok ? (
                  <div className="w-12 h-12 rounded-xl bg-white p-0.5 border border-slate-200 flex items-center justify-center shadow-sm flex-shrink-0">
                    <img src={logoPondok} alt="Logo" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white shadow flex-shrink-0">
                    <Building2 className="w-6 h-6 text-blue-400" />
                  </div>
                )}
                <div>
                  <h2 className="text-sm sm:text-base font-black tracking-tight text-slate-900 uppercase leading-none">
                    {namaLembaga}
                  </h2>
                  <div className="text-[10px] text-slate-600 font-semibold mt-1">
                    {taglineLembaga}
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">
                    {alamatLembaga} • Telp: {noTelp}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded font-extrabold text-[10px] uppercase tracking-wider">
                  KWITANSI SAH
                </span>
                <div className="text-[10px] font-mono text-slate-600 mt-1.5">
                  No: <span className="font-bold text-slate-900">{receiptNo}</span>
                </div>
              </div>
            </div>

            {/* 2. DATA TRANSAKSI & SANTRI */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Telah Diterima Dari</span>
                <span className="font-bold text-slate-900 text-xs sm:text-sm">{waliName}</span>
                <span className="text-[10px] text-slate-500 block">Wali dari: <strong className="text-blue-900">{santriName}</strong></span>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Tanggal Pembayaran</span>
                <span className="font-bold text-slate-900">
                  {new Date(receiptDate).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">NIS & Kelas Santri</span>
                <span className="font-mono font-bold text-slate-800">{nis}</span>
                <span className="text-slate-600"> • {kelas}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[9px] uppercase font-semibold">Metode Pembayaran</span>
                <span className="font-semibold text-blue-900">{paymentMethod}</span>
              </div>
            </div>

            {/* 3. TABEL RINCIAN TAGIHAN */}
            <div className="my-3 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-[10px] font-bold text-slate-600 uppercase border-b border-slate-300">
                    <th className="py-2 px-2.5 w-10 text-center">No</th>
                    <th className="py-2 px-2.5">Rincian Pembayaran Tagihan</th>
                    <th className="py-2 px-2.5 text-right w-36">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-2 px-2.5 text-center text-slate-500">{index + 1}</td>
                      <td className="py-2 px-2.5 font-semibold text-slate-800">{item.name}</td>
                      <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                        Rp {parseFloat(item.amount || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold">
                    <td colSpan={2} className="py-2 px-2.5 text-right text-xs">TOTAL PEMBAYARAN:</td>
                    <td className="py-2 px-2.5 text-right font-mono text-sm text-blue-900">
                      Rp {totalAmount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 4. TERBILANG BOX */}
            <div className="my-3 p-2.5 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-xs">
              <span className="font-semibold text-slate-600">Terbilang: </span>
              <span className="font-bold text-slate-900 italic capitalize">{terbilangText} Rupiah</span>
            </div>

            {/* 5. TANDA TANGAN & STEMPEL BASAH RESMI */}
            <div className="mt-6 pt-3 flex items-end justify-between text-xs">
              <div className="text-center w-36 sm:w-44">
                <span className="text-[10px] text-slate-500 block">Penyetor / Wali Santri,</span>
                <div className="h-12"></div>
                <div className="font-bold text-slate-900 border-t border-slate-400 pt-1">
                  ( {waliName} )
                </div>
              </div>

              <div className="text-center w-44 sm:w-52 relative">
                <span className="text-[10px] text-slate-500 block">
                  Bendahara Penerima,
                </span>

                <div className="h-14 flex items-center justify-center relative my-1">
                  {capStempel && (
                    <img 
                      src={capStempel} 
                      alt="Cap Stempel" 
                      className="absolute inset-0 w-24 h-24 object-contain opacity-85 pointer-events-none -top-4 left-4"
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  )}
                  {ttdBendahara && (
                    <img 
                      src={ttdBendahara} 
                      alt="TTD Bendahara" 
                      className="max-h-12 object-contain relative z-10" 
                    />
                  )}
                </div>

                <div className="font-bold text-slate-900 border-t border-slate-400 pt-1 relative z-10">
                  {bendaharaName}
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-6 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
              Dokumen ini diterbitkan secara otomatis oleh Sistem Terpadu Pesantren SiPesand (Build on <a href="https://kingdigitalpremium.my.id" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">kingdigitalpremium.my.id</a>) dan sah sebagai bukti pembayaran.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
