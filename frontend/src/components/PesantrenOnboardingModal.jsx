import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Palette,
  Bell
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function PesantrenOnboardingModal({ isOpen, onClose, onComplete }) {
  if (!isOpen) return null;

  const { settings, updateSettings } = useSettings();

  const [formData, setFormData] = useState({
    NAMA_LEMBAGA: settings?.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari',
    TAGLINE_LEMBAGA: settings?.TAGLINE_LEMBAGA || 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
    ALAMAT_LEMBAGA: settings?.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293',
    EMAIL_LEMBAGA: settings?.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com',
    NO_TELP: settings?.NO_TELP || '+62 851-2373-4342',
    WHATSAPP_CENTER: settings?.WHATSAPP_CENTER || '085123734342',
    NAMA_KEPALA_PONDOK: settings?.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.',
    BANK_NAME: settings?.BANK_NAME || 'Bank Syariah Indonesia (BSI)',
    BANK_ACCOUNT_NO: settings?.BANK_ACCOUNT_NO || '7192837465',
    BANK_ACCOUNT_HOLDER: settings?.BANK_ACCOUNT_HOLDER || 'YAYASAN DARUL RAHMAN SUMBERSARI',
    WEB_THEME: settings?.WEB_THEME || 'islamic_green',
    WEB_ANNOUNCEMENT_TEXT: settings?.WEB_ANNOUNCEMENT_TEXT || 'Pendaftaran Santri Baru (PSB) Tahun Ajaran 2026/2027 Telah Dibuka!'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        ONBOARDING_COMPLETED: 'true'
      };

      await updateSettings(payload);
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete(payload);
        if (onClose) onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving onboarding data:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header Modal */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-t-3xl relative overflow-hidden space-y-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-100 text-[10px] font-bold uppercase tracking-wider border border-emerald-600/50">
                Setup Pertama Kali
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Konfigurasi Profil Pesantren
              </h3>
            </div>
          </div>
          <p className="text-emerald-100/90 text-xs leading-relaxed max-w-xl pt-1">
            Silakan lengkapi informasi identitas pondok pesantren Anda. Data ini akan langsung diaplikasikan ke halaman portal publik, portal wali santri, kwitansi resmi, dan sistem administrasi backend.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 text-xs">
          
          {/* Section 1: Identitas Lembaga */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-sm">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Identitas & Profil Pondok Pesantren</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Nama Lembaga / Pondok Pesantren *</label>
                <input
                  type="text"
                  required
                  value={formData.NAMA_LEMBAGA}
                  onChange={(e) => setFormData({ ...formData, NAMA_LEMBAGA: e.target.value })}
                  placeholder="Contoh: Pondok Pesantren Darul Rahman Sumbersari"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Tagline / Slogan Lembaga</label>
                <input
                  type="text"
                  value={formData.TAGLINE_LEMBAGA}
                  onChange={(e) => setFormData({ ...formData, TAGLINE_LEMBAGA: e.target.value })}
                  placeholder="Contoh: Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Alamat Lengkap Pesantren *</label>
                <input
                  type="text"
                  required
                  value={formData.ALAMAT_LEMBAGA}
                  onChange={(e) => setFormData({ ...formData, ALAMAT_LEMBAGA: e.target.value })}
                  placeholder="Contoh: Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email Resmi Lembaga *</label>
                <input
                  type="email"
                  required
                  value={formData.EMAIL_LEMBAGA}
                  onChange={(e) => setFormData({ ...formData, EMAIL_LEMBAGA: e.target.value })}
                  placeholder="admin@pesantren.sch.id"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">No. Telepon / WhatsApp Resmi *</label>
                <input
                  type="text"
                  required
                  value={formData.NO_TELP}
                  onChange={(e) => setFormData({ ...formData, NO_TELP: e.target.value, WHATSAPP_CENTER: e.target.value })}
                  placeholder="+62 851-2373-4342"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700">Nama Pengasuh / Kepala Pondok</label>
                <input
                  type="text"
                  value={formData.NAMA_KEPALA_PONDOK}
                  onChange={(e) => setFormData({ ...formData, NAMA_KEPALA_PONDOK: e.target.value })}
                  placeholder="Contoh: K.H. Syarif Hidayatullah, M.A."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Rekening Bank Resmi */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-sm">
              <CreditCard className="w-4 h-4 text-emerald-700" />
              <span>Rekening Resmi Penyaluran Syahriyah & Donasi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Bank *</label>
                <input
                  type="text"
                  required
                  value={formData.BANK_NAME}
                  onChange={(e) => setFormData({ ...formData, BANK_NAME: e.target.value })}
                  placeholder="Bank Syariah Indonesia (BSI)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nomor Rekening *</label>
                <input
                  type="text"
                  required
                  value={formData.BANK_ACCOUNT_NO}
                  onChange={(e) => setFormData({ ...formData, BANK_ACCOUNT_NO: e.target.value })}
                  placeholder="7192837465"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Atas Nama Rekening *</label>
                <input
                  type="text"
                  required
                  value={formData.BANK_ACCOUNT_HOLDER}
                  onChange={(e) => setFormData({ ...formData, BANK_ACCOUNT_HOLDER: e.target.value })}
                  placeholder="YAYASAN DARUL RAHMAN"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tampilan & Pengumuman */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-sm">
              <Palette className="w-4 h-4 text-emerald-700" />
              <span>Tema Warna & Teks Pengumuman Web</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tema Tampilan</label>
                <select
                  value={formData.WEB_THEME}
                  onChange={(e) => setFormData({ ...formData, WEB_THEME: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                >
                  <option value="islamic_green">Hijau Zamrud Islami (Direkomendasikan)</option>
                  <option value="classic_navy">Royal Navy Perbankan</option>
                  <option value="academic_maroon">Maroon Akademik</option>
                  <option value="modern_bento">Modern Bento Slate</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Teks Banner Pengumuman</label>
                <input
                  type="text"
                  value={formData.WEB_ANNOUNCEMENT_TEXT}
                  onChange={(e) => setFormData({ ...formData, WEB_ANNOUNCEMENT_TEXT: e.target.value })}
                  placeholder="Pendaftaran Santri Baru Telah Dibuka!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold transition-all text-xs"
            >
              Lewati Sementara
            </button>

            <button
              type="submit"
              disabled={saving || success}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-md flex items-center gap-2 text-xs disabled:opacity-50"
            >
              {saving ? (
                <span>Menyimpan ke Sistem...</span>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Berhasil Diterapkan!</span>
                </>
              ) : (
                <>
                  <span>Simpan & Terapkan ke Web Pesantren</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
