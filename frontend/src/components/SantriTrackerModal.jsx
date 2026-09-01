import React from 'react';
import { 
  X, 
  User, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Phone, 
  Home, 
  Radio, 
  Building2,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Search,
  CheckCircle,
  FileCheck,
  UserCheck
} from 'lucide-react';

export default function SantriTrackerModal({ santri, santriData, isOpen, onClose }) {
  const rawData = santri || santriData;
  if (!isOpen || !rawData) return null;

  // Mendukung format data santri flat maupun response data terstruktur
  const currentSantri = rawData.santri || rawData;
  const permits = rawData.permits || currentSantri.permits || [];
  
  // Tentukan status perizinan santri saat ini
  const activePermit = permits.find(p => p.status === 'ACTIVE' || p.status === 'APPROVED');
  const now = new Date();
  
  let permitStatus = {
    state: 'INSIDE', // 'INSIDE' | 'PERMIT_ACTIVE' | 'OVERDUE'
    title: 'STATUS: DI DALAM ASRAMA PONDOK',
    subtitle: 'Tidak Memiliki Surat Izin Keluar Aktif',
    description: 'Santri tercatat berada di dalam lingkungan pesantren. Jika santri ditemukan berada di luar pondok, maka santri dinyatakan keluar tanpa izin resmi (Pelanggaran Tata Tertib).',
    badgeText: 'DI DALAM PONDOK',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    iconColor: 'text-emerald-600',
    isAllowedOutside: false,
  };

  if (activePermit) {
    const isLate = new Date(activePermit.returnTime) < now;
    if (isLate) {
      permitStatus = {
        state: 'OVERDUE',
        title: 'STATUS: TERLAMBAT KEMBALI (OVERDUE)',
        subtitle: 'Batas Waktu Surat Izin Telah Terlewati',
        description: `Santri memiliki izin keluar untuk keperluan "${activePermit.reason}", namun batas waktu kembali (${new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB) telah terlewati. Santri wajib segera kembali dan melapor ke Pos Kamtib.`,
        badgeText: 'TERLAMBAT (OVERDUE)',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        bannerBg: 'bg-rose-50 border-rose-200 text-rose-950',
        iconColor: 'text-rose-600',
        isAllowedOutside: false,
      };
    } else {
      permitStatus = {
        state: 'PERMIT_ACTIVE',
        title: 'STATUS: SEDANG IZIN KELUAR RESMI (TERVERIFIKASI)',
        subtitle: `Izin Sah Keperluan: ${activePermit.type || 'Harian'}`,
        description: `Santri memiliki surat izin keluar resmi yang telah disetujui oleh pengasuhan/kamtib untuk keperluan "${activePermit.reason}". Santri berhak berada di luar pesantren hingga batas waktu yang ditentukan.`,
        badgeText: 'IZIN KELUAR SAH',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        bannerBg: 'bg-blue-50 border-blue-200 text-blue-950',
        iconColor: 'text-blue-600',
        isAllowedOutside: true,
      };
    }
  }

  const cleanPhone = (currentSantri.noHpWali || '').replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-xs">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pos Pemeriksaan & Verifikasi Izin Santri</h3>
              <p className="text-[11px] text-slate-400">Pusat Deteksi Status Keberadaan Santri Real-Time</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* Main Santri Profile Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 border border-slate-200 shadow flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
              {currentSantri.foto ? (
                <img src={currentSantri.foto} alt={currentSantri.nama} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                currentSantri.nama?.charAt(0) || 'S'
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                  NIS: {currentSantri.nis || '-'}
                </span>
                {currentSantri.nfcUid && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" />
                    <span>{currentSantri.nfcUid}</span>
                  </span>
                )}
              </div>

              <h2 className="text-base font-bold text-slate-900 truncate mt-0.5">{currentSantri.nama}</h2>

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-medium">{currentSantri.kelas || 'KMI Pesantren'}</span>
                <span>•</span>
                <span className="font-medium">{currentSantri.kamar || 'Asrama Santri'}</span>
              </div>
            </div>
          </div>

          {/* STATUS UTAMA IZIN KELUAR / DI DALAM PONDOK */}
          <div className={`p-4 rounded-2xl border ${permitStatus.bannerBg} shadow-sm space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {permitStatus.state === 'INSIDE' ? (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                      <Home className="w-5 h-5" />
                    </div>
                  ) : permitStatus.state === 'OVERDUE' ? (
                    <div className="w-9 h-9 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 animate-pulse">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-black text-sm text-slate-900 tracking-tight">
                    {permitStatus.title}
                  </div>
                  <div className="text-[11px] font-bold text-slate-600 mt-0.5">
                    {permitStatus.subtitle}
                  </div>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${permitStatus.badgeColor} flex-shrink-0 shadow-sm`}>
                {permitStatus.badgeText}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-slate-700 bg-white/70 p-3 rounded-xl border border-slate-200/80">
              {permitStatus.description}
            </p>

            {/* Rincian Surat Izin Keluar Jika Ada */}
            {activePermit && (
              <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-white p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Tujuan Izin:</span>
                  <span className="font-bold text-slate-800">{activePermit.destination || 'Dalam Kota'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Jam Berangkat:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {new Date(activePermit.departureTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Batas Jam Kembali:</span>
                  <span className="font-bold text-rose-700 font-mono">
                    {new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Pemberi Izin (Penanggung Jawab):</span>
                  <strong className="text-slate-900">{activePermit.approvedBy || 'Ustadz Pengasuhan / Kamtib'}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Kontak Wali Santri & Opsi Follow-up */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Kontak Wali Santri:</span>
              <div className="font-bold text-slate-800 text-xs">
                {currentSantri.namaWali || 'Wali Santri'}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {currentSantri.noHpWali || '-'}
              </div>
            </div>

            {currentSantri.noHpWali && (
              <a
                href={`https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent(`Assalamu'alaikum Wr. Wb. Kami dari Keamanan Pesantren ingin mengonfirmasi status perizinan ananda *${currentSantri.nama}*.`)}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Chat WhatsApp Wali</span>
              </a>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Sistem Verifikasi Keamanan SiPesand</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors shadow-sm"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
