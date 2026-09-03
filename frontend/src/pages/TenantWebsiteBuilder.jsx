import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layout, 
  Image, 
  Upload, 
  Trash2, 
  Save, 
  Eye, 
  CheckCircle2, 
  Building2, 
  Globe, 
  ShieldCheck, 
  Calendar, 
  UserCheck, 
  Sparkles, 
  Layers, 
  Sliders, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  X,
  ExternalLink,
  Info,
  RefreshCw
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const THEME_PRESETS = [
  {
    id: 'modern_bento',
    name: 'Modern Enterprise Bento',
    desc: 'Tampilan bersih ala Apple/Linear dengan bento grid putih, border tipis, dan nuansa biru enterprise.',
    primaryColor: '#1D4ED8',
    previewBg: 'bg-blue-600',
    accent: 'Biru Royal (#1D4ED8)',
  },
  {
    id: 'islamic_green',
    name: 'Pesantren Klasik Islami',
    desc: 'Nuansa hijau zamrud tradisional dipadukan aksen emas amber, sangat cocok untuk pesantren salaf & modern.',
    primaryColor: '#047857',
    previewBg: 'bg-emerald-700',
    accent: 'Hijau Zamrud & Emas (#047857)',
  },
  {
    id: 'classic_navy',
    name: 'Minimalis Elegan Midnight',
    desc: 'Gaya formal mewah bernuansa dark slate dan navy, menonjolkan kewibawaan institusi pendidikan.',
    primaryColor: '#0F172A',
    previewBg: 'bg-slate-900',
    accent: 'Midnight Navy (#0F172A)',
  },
  {
    id: 'academic_maroon',
    name: 'Kampus Akademik Terpadu',
    desc: 'Warna marun burgundy berpadu abu-abu hangat, mencerminkan kualitas pendidikan formal dan riset.',
    primaryColor: '#991B1B',
    previewBg: 'bg-rose-800',
    accent: 'Marun Burgundy (#991B1B)',
  },
];

export default function TenantWebsiteBuilder() {
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('theme'); // 'theme' | 'header' | 'hero' | 'modules' | 'gallery' | 'footer'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Tema & Warna
    WEB_THEME: settings.WEB_THEME || 'modern_bento',
    WEB_PRIMARY_COLOR: settings.WEB_PRIMARY_COLOR || '#1D4ED8',
    
    // Header & Identitas
    NAMA_LEMBAGA: settings.NAMA_LEMBAGA || 'Pondok Pesantren Darul Rahman Sumbersari',
    TAGLINE_LEMBAGA: settings.TAGLINE_LEMBAGA || 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an',
    LOGO_PONDOK_URL: settings.LOGO_PONDOK_URL || '',
    WEB_SHOW_HEADER_WALI_BTN: settings.WEB_SHOW_HEADER_WALI_BTN !== 'false' ? 'true' : 'false',
    WEB_SHOW_HEADER_LOGIN_BTN: settings.WEB_SHOW_HEADER_LOGIN_BTN !== 'false' ? 'true' : 'false',

    // Hero & Banner
    WEB_HERO_TITLE: settings.WEB_HERO_TITLE || '',
    WEB_HERO_SUBTITLE: settings.WEB_HERO_SUBTITLE || '',
    WEB_HERO_IMAGE: settings.WEB_HERO_IMAGE || '',
    NAMA_KEPALA_PONDOK: settings.NAMA_KEPALA_PONDOK || 'K.H. Syarif Hidayatullah, M.A.',
    WEB_GREETING_NOTE: settings.WEB_GREETING_NOTE || '',

    // Saklar Modul Halaman Depan
    WEB_SHOW_PERMIT_CHECKER: settings.WEB_SHOW_PERMIT_CHECKER !== 'false' ? 'true' : 'false',
    WEB_SHOW_WALI_PORTAL: settings.WEB_SHOW_WALI_PORTAL !== 'false' ? 'true' : 'false',
    WEB_SHOW_ROUTINE: settings.WEB_SHOW_ROUTINE !== 'false' ? 'true' : 'false',
    WEB_SHOW_GALLERY: settings.WEB_SHOW_GALLERY === 'true' ? 'true' : 'false',
    WEB_SHOW_ANNOUNCEMENT: settings.WEB_SHOW_ANNOUNCEMENT === 'true' ? 'true' : 'false',
    WEB_ANNOUNCEMENT_TEXT: settings.WEB_ANNOUNCEMENT_TEXT || '',

    // Galeri Foto
    WEB_GALLERY_JSON: settings.WEB_GALLERY_JSON || '[]',

    // Footer & Kontak
    ALAMAT_LEMBAGA: settings.ALAMAT_LEMBAGA || 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur',
    WEB_MAPS_URL: settings.WEB_MAPS_URL || '',
    NO_TELP: settings.NO_TELP || '+62 851-2373-4342',
    EMAIL_LEMBAGA: settings.EMAIL_LEMBAGA || 'darulrahmansumbersari@gmail.com',
    INSTAGRAM_AKUN: settings.INSTAGRAM_AKUN || '@darulrahman_official',
    YOUTUBE_AKUN: settings.YOUTUBE_AKUN || 'Darul Rahman TV',
    WEB_FOOTER_NOTE: settings.WEB_FOOTER_NOTE || 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
  });

  // Parse Gallery List
  const [galleryList, setGalleryList] = useState([]);
  useEffect(() => {
    try {
      const parsed = JSON.parse(formData.WEB_GALLERY_JSON || '[]');
      if (Array.isArray(parsed)) setGalleryList(parsed);
    } catch (e) {
      setGalleryList([]);
    }
  }, [formData.WEB_GALLERY_JSON]);

  // Handle Input Changes
  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Image Upload Handler
  const handleImageUpload = (key, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran gambar maksimal 2MB agar loading website tetap super cepat.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange(key, event.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Add Photo to Gallery
  const handleAddGalleryPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newPhoto = {
        id: Date.now(),
        title: 'Dokumentasi Santri & Asrama',
        url: event.target.result,
      };
      const updated = [...galleryList, newPhoto];
      setGalleryList(updated);
      handleChange('WEB_GALLERY_JSON', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveGalleryPhoto = (index) => {
    const updated = galleryList.filter((_, i) => i !== index);
    setGalleryList(updated);
    handleChange('WEB_GALLERY_JSON', JSON.stringify(updated));
  };

  // Save All Settings
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await updateSettings(formData);
      if (res.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      } else {
        alert('Gagal menyimpan perubahan. Silakan coba lagi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs pb-12">
      
      {/* Top Banner Header */}
      <div className="card-bento p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] font-bold text-[10px] border border-blue-100">
            <Palette className="w-3.5 h-3.5" />
            <span>Visual No-Code Website Builder</span>
          </div>
          <h1 className="font-['Poppins'] font-extrabold text-xl sm:text-2xl text-[#111827] tracking-tight">
            Editor Tampilan Portal Pesantren
          </h1>
          <p className="text-slate-500 text-xs">
            Atur tema warna, logo, banner, foto kegiatan, dan tata letak halaman awal portal pesantren Anda tanpa koding
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl border border-[#E5E7EB] bg-white hover:bg-slate-50 text-slate-700 font-bold transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Lihat Website</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold transition-all shadow-subtle flex items-center gap-2 hover:-translate-y-0.5"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Tampilan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Berhasil disimpan!</strong> Seluruh perubahan tampilan telah diaplikasikan ke portal resmi pesantren Anda.</span>
          </div>
          <a href="/" target="_blank" className="font-bold underline text-emerald-700">Lihat Hasil</a>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#E5E7EB] pb-2">
        {[
          { id: 'theme', label: '1. Model Tema & Warna', icon: Palette },
          { id: 'header', label: '2. Header & Logo', icon: Building2 },
          { id: 'hero', label: '3. Banner & Sambutan', icon: Image },
          { id: 'modules', label: '4. Saklar Modul', icon: Sliders },
          { id: 'gallery', label: '5. Galeri Foto', icon: Layers },
          { id: 'footer', label: '6. Footer & Kontak', icon: MapPin },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                isActive 
                  ? 'bg-[#1D4ED8] text-white shadow-subtle' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-[#E5E7EB]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: MODEL TEMA & PRESET WARNA                                       */}
      {/* ======================================================================= */}
      {activeTab === 'theme' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-4">
            <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
              Pilih Model Tampilan Portal (Theme Preset)
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              Pilih gaya visual yang mencerminkan identitas dan karakter pondok pesantren Anda. Setiap tema memiliki tata warna dan atmosfer yang khas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {THEME_PRESETS.map(theme => {
                const isSelected = formData.WEB_THEME === theme.id;
                return (
                  <div
                    key={theme.id}
                    onClick={() => {
                      handleChange('WEB_THEME', theme.id);
                      handleChange('WEB_PRIMARY_COLOR', theme.primaryColor);
                    }}
                    className={`card-bento p-5 cursor-pointer transition-all space-y-3 ${
                      isSelected 
                        ? 'border-[#1D4ED8] ring-2 ring-blue-500/20 shadow-md bg-blue-50/20' 
                        : 'hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full ${theme.previewBg}`} />
                        <h4 className="font-['Poppins'] font-bold text-xs text-[#111827]">
                          {theme.name}
                        </h4>
                      </div>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-[#1D4ED8] text-white font-bold text-[9px]">
                          Aktif
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {theme.desc}
                    </p>

                    <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[10px] text-slate-400">
                      <span>Warna Dominan:</span>
                      <strong className="text-slate-700">{theme.accent}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: HEADER & LOGO RESMI                                             */}
      {/* ======================================================================= */}
      {activeTab === 'header' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Identitas Lembaga & Logo Header
              </h3>
              <p className="text-slate-500 text-xs">
                Informasi ini akan muncul di bagian paling atas (navbar) portal pesantren Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
              
              {/* Upload Logo Pondok */}
              <div className="sm:col-span-4 space-y-3">
                <label className="block text-slate-700 font-semibold text-xs">
                  Logo Resmi Pesantren
                </label>
                
                <div className="p-4 border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center text-center bg-[#F8FAFC] space-y-3">
                  {formData.LOGO_PONDOK_URL ? (
                    <div className="relative">
                      <img
                        src={formData.LOGO_PONDOK_URL}
                        alt="Logo Pesantren"
                        className="w-20 h-20 object-contain rounded-xl border border-[#E5E7EB] bg-white p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('LOGO_PONDOK_URL', '')}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-rose-600 text-white shadow"
                        title="Hapus Logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                      <Building2 className="w-8 h-8" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-subtle">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{formData.LOGO_PONDOK_URL ? 'Ganti Foto Logo' : 'Upload Logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload('LOGO_PONDOK_URL', e)}
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">PNG transparan direkomendasikan</p>
                  </div>
                </div>
              </div>

              {/* Teks Identitas Lembaga */}
              <div className="sm:col-span-8 space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nama Resmi Lembaga / Pondok Pesantren *
                  </label>
                  <input
                    type="text"
                    value={formData.NAMA_LEMBAGA}
                    onChange={(e) => handleChange('NAMA_LEMBAGA', e.target.value)}
                    placeholder="Contoh: Pondok Pesantren Darul Rahman Sumbersari"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Tagline / Slogan Lembaga
                  </label>
                  <input
                    type="text"
                    value={formData.TAGLINE_LEMBAGA}
                    onChange={(e) => handleChange('TAGLINE_LEMBAGA', e.target.value)}
                    placeholder="Contoh: Lembaga Pendidikan Islam & Tahfidzul Qur'an"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>

                {/* Saklar Tombol Header */}
                <div className="pt-2 border-t border-[#E5E7EB] space-y-2">
                  <span className="block font-bold text-xs text-slate-800">Tombol Aksi di Navbar Header:</span>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.WEB_SHOW_HEADER_WALI_BTN === 'true'}
                      onChange={(e) => handleChange('WEB_SHOW_HEADER_WALI_BTN', e.target.checked ? 'true' : 'false')}
                      className="rounded text-[#1D4ED8] focus:ring-0 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700">Tampilkan Tombol "Portal Wali Santri" di Header</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.WEB_SHOW_HEADER_LOGIN_BTN === 'true'}
                      onChange={(e) => handleChange('WEB_SHOW_HEADER_LOGIN_BTN', e.target.checked ? 'true' : 'false')}
                      className="rounded text-[#1D4ED8] focus:ring-0 w-4 h-4"
                    />
                    <span className="text-xs text-slate-700">Tampilkan Tombol "Login Petugas" di Header</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 3: BANNER HERO & SAMBUTAN PENGASUH                                 */}
      {/* ======================================================================= */}
      {activeTab === 'hero' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Banner Utama & Sambutan Pengasuh
              </h3>
              <p className="text-slate-500 text-xs">
                Seksi pembuka di bagian atas website yang menyambut santri, wali santri, dan masyarakat luas.
              </p>
            </div>

            <div className="space-y-4">
              
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Judul Utama Sambutan (Headline Banner)
                </label>
                <input
                  type="text"
                  value={formData.WEB_HERO_TITLE}
                  onChange={(e) => handleChange('WEB_HERO_TITLE', e.target.value)}
                  placeholder={`Selamat Datang di Portal Digital ${formData.NAMA_LEMBAGA}`}
                  className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Deskripsi / Profil Singkat Lembaga
                </label>
                <textarea
                  rows={3}
                  value={formData.WEB_HERO_SUBTITLE}
                  onChange={(e) => handleChange('WEB_HERO_SUBTITLE', e.target.value)}
                  placeholder="Pusat informasi dan layanan terpadu santri, wali santri, asatidz, dan pengurus pondok pesantren. Seluruh sistem perizinan gerbang, tabungan uang saku smart, dan administrasi pesantren terkelola secara digital dan aman."
                  className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nama Pengasuh / Pimpinan Pondok
                  </label>
                  <input
                    type="text"
                    value={formData.NAMA_KEPALA_PONDOK}
                    onChange={(e) => handleChange('NAMA_KEPALA_PONDOK', e.target.value)}
                    placeholder="Contoh: K.H. Syarif Hidayatullah, M.A."
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Kutipan / Maklumat Singkat Pengasuh
                  </label>
                  <input
                    type="text"
                    value={formData.WEB_GREETING_NOTE}
                    onChange={(e) => handleChange('WEB_GREETING_NOTE', e.target.value)}
                    placeholder="Contoh: Mengabdi untuk Umat, Menjaga Tradisi Salaf & Wawasan Global"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>
              </div>

              {/* Upload Foto Gedung / Banner Utama */}
              <div className="space-y-2 pt-2 border-t border-[#E5E7EB]">
                <label className="block text-slate-700 font-semibold text-xs">
                  Foto Gedung Pesantren / Banner Utama (Opsional)
                </label>

                {formData.WEB_HERO_IMAGE ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#E5E7EB] max-h-48">
                    <img src={formData.WEB_HERO_IMAGE} alt="Banner Pesantren" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleChange('WEB_HERO_IMAGE', '')}
                      className="absolute top-3 right-3 p-1.5 rounded-xl bg-rose-600 text-white shadow"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer border-2 border-dashed border-[#E5E7EB] rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-[#F8FAFC] hover:bg-slate-50 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="font-bold text-xs text-slate-700">Upload Foto Gedung / Masjid Pesantren</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Format JPG/PNG, rasio 16:9 direkomendasikan</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload('WEB_HERO_IMAGE', e)}
                    />
                  </label>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 4: SAKLAR MODUL HALAMAN DEPAN                                      */}
      {/* ======================================================================= */}
      {activeTab === 'modules' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Saklar Tampilan Modul (On / Off)
              </h3>
              <p className="text-slate-500 text-xs">
                Pilih modul apa saja yang ingin Anda tampilkan atau sembunyikan dari pengunjung halaman depan portal pesantren.
              </p>
            </div>

            <div className="space-y-3">
              
              {/* Modul 1: Pos Perizinan Santri */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Pos Pemeriksaan Status Izin Keluar Santri</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Memungkinkan satpam gerbang (Kamtib) dan asatidz mengecek status santri (izin aktif/terlambat/di asrama) secara real-time dari halaman depan.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.WEB_SHOW_PERMIT_CHECKER === 'true'}
                  onChange={(e) => handleChange('WEB_SHOW_PERMIT_CHECKER', e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#1D4ED8] focus:ring-0 w-5 h-5 flex-shrink-0 cursor-pointer"
                />
              </div>

              {/* Modul 2: Portal Wali Santri */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>Layanan Mandiri Portal Wali Santri</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Kartu shortcut bagi wali santri untuk melihat saldo saku, rekap kehadiran, dan pembayaran syahriyah bulanan.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.WEB_SHOW_WALI_PORTAL === 'true'}
                  onChange={(e) => handleChange('WEB_SHOW_WALI_PORTAL', e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#1D4ED8] focus:ring-0 w-5 h-5 flex-shrink-0 cursor-pointer"
                />
              </div>

              {/* Modul 3: Rutinitas & Kurikulum Santri */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>Rutinitas & Kurikulum Santri (Jadwal Kegiatan 24 Jam)</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan rincian kegiatan muhafadzoh tahfidz, kajian kitab kuning sorogan, dan jam disiplin asrama santri.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.WEB_SHOW_ROUTINE === 'true'}
                  onChange={(e) => handleChange('WEB_SHOW_ROUTINE', e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#1D4ED8] focus:ring-0 w-5 h-5 flex-shrink-0 cursor-pointer"
                />
              </div>

              {/* Modul 4: Seksi Pengumuman & Maklumat Terkini */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Seksi Maklumat / Pengumuman Terkini</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan banner info penting seperti Pendaftaran Santri Baru (PSB), kalender liburan ma'had, atau pengajian akbar.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.WEB_SHOW_ANNOUNCEMENT === 'true'}
                  onChange={(e) => handleChange('WEB_SHOW_ANNOUNCEMENT', e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#1D4ED8] focus:ring-0 w-5 h-5 flex-shrink-0 cursor-pointer"
                />
              </div>

              {formData.WEB_SHOW_ANNOUNCEMENT === 'true' && (
                <div className="pl-6 pt-2">
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Isi Teks Pengumuman / Maklumat
                  </label>
                  <textarea
                    rows={2}
                    value={formData.WEB_ANNOUNCEMENT_TEXT}
                    onChange={(e) => handleChange('WEB_ANNOUNCEMENT_TEXT', e.target.value)}
                    placeholder="Contoh: Pendaftaran Santri Baru Tahun Ajaran 2026/2027 telah dibuka! Kuota asrama terbatas..."
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>
              )}

              {/* Modul 5: Galeri Foto Kegiatan */}
              <div className="p-4 rounded-2xl border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    <span>Seksi Galeri Foto Kegiatan Pesantren</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Menampilkan deretan foto kegiatan santri, halaqah mengaji, dan sarana prasarana asrama.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.WEB_SHOW_GALLERY === 'true'}
                  onChange={(e) => handleChange('WEB_SHOW_GALLERY', e.target.checked ? 'true' : 'false')}
                  className="rounded text-[#1D4ED8] focus:ring-0 w-5 h-5 flex-shrink-0 cursor-pointer"
                />
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 5: GALERI FOTO KEGIATAN                                            */}
      {/* ======================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                  Kelola Foto Dokumentasi Kegiatan ({galleryList.length} Foto)
                </h3>
                <p className="text-slate-500 text-xs">
                  Foto-foto yang diunggah di sini akan otomatis tampil rapi dalam grid galeri foto di halaman depan portal pondok.
                </p>
              </div>

              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs shadow-subtle flex-shrink-0">
                <Plus className="w-4 h-4" />
                <span>Tambah Foto Baru</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAddGalleryPhoto}
                />
              </label>
            </div>

            {galleryList.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-[#E5E7EB] rounded-2xl text-center space-y-2 bg-[#F8FAFC]">
                <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-xs text-slate-700">Belum Ada Foto Galeri</div>
                <p className="text-[11px] text-slate-500">Klik tombol "Tambah Foto Baru" untuk mengunggah dokumentasi santri.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {galleryList.map((photo, index) => (
                  <div key={photo.id || index} className="card-bento p-3 space-y-2 relative group">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-36 object-cover rounded-xl border border-[#E5E7EB]"
                    />
                    <input
                      type="text"
                      value={photo.title}
                      onChange={(e) => {
                        const updated = [...galleryList];
                        updated[index].title = e.target.value;
                        setGalleryList(updated);
                        handleChange('WEB_GALLERY_JSON', JSON.stringify(updated));
                      }}
                      placeholder="Judul kegiatan..."
                      className="w-full px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-[11px] bg-[#F8FAFC] font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryPhoto(index)}
                      className="absolute top-4 right-4 p-1 rounded-lg bg-rose-600 text-white shadow hover:bg-rose-700 transition-colors"
                      title="Hapus foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 6: FOOTER, PETA & KONTAK RESMI                                     */}
      {/* ======================================================================= */}
      {activeTab === 'footer' && (
        <div className="space-y-5">
          <div className="card-bento p-6 space-y-6">
            <div className="space-y-1">
              <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                Alamat, Peta Lokasi & Kontak Footer
              </h3>
              <p className="text-slate-500 text-xs">
                Informasi ini ditampilkan di bagian kaki (footer) website untuk memudahkan wali santri dan tamu berkunjung.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-xs">
                  Alamat Lengkap Pesantren *
                </label>
                <textarea
                  rows={2}
                  value={formData.ALAMAT_LEMBAGA}
                  onChange={(e) => handleChange('ALAMAT_LEMBAGA', e.target.value)}
                  placeholder="Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293"
                  className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Nomor WhatsApp / Telepon Pengurus
                  </label>
                  <input
                    type="text"
                    value={formData.NO_TELP}
                    onChange={(e) => handleChange('NO_TELP', e.target.value)}
                    placeholder="+62 851-2373-4342"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Email Resmi Sekretariat
                  </label>
                  <input
                    type="email"
                    value={formData.EMAIL_LEMBAGA}
                    onChange={(e) => handleChange('EMAIL_LEMBAGA', e.target.value)}
                    placeholder="darulrahmansumbersari@gmail.com"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Link Google Maps Lokasi Pondok
                  </label>
                  <input
                    type="url"
                    value={formData.WEB_MAPS_URL}
                    onChange={(e) => handleChange('WEB_MAPS_URL', e.target.value)}
                    placeholder="https://maps.google.com/?q=Pondok+Pesantren+Darul+Rahman"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Catatan Hak Cipta / Motto Penutup
                  </label>
                  <input
                    type="text"
                    value={formData.WEB_FOOTER_NOTE}
                    onChange={(e) => handleChange('WEB_FOOTER_NOTE', e.target.value)}
                    placeholder="Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Akun Instagram Pondok
                  </label>
                  <input
                    type="text"
                    value={formData.INSTAGRAM_AKUN}
                    onChange={(e) => handleChange('INSTAGRAM_AKUN', e.target.value)}
                    placeholder="@darulrahman_official"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1 text-xs">
                    Channel YouTube Lembaga
                  </label>
                  <input
                    type="text"
                    value={formData.YOUTUBE_AKUN}
                    onChange={(e) => handleChange('YOUTUBE_AKUN', e.target.value)}
                    placeholder="Darul Rahman Media TV"
                    className="w-full px-3.5 py-2.5 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8] font-medium"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      <div className="fixed bottom-4 right-4 sm:right-8 z-20">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold text-xs shadow-xl transition-all flex items-center gap-2 hover:-translate-y-0.5"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Tampilan Berhasil Disimpan!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Perubahan Tampilan</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
