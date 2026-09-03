import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemSettings, saveSystemSettings } from '../services/api';

const defaultSettings = {
  NAMA_LEMBAGA: 'Pondok Pesantren Terpadu SiPesand',
  TAGLINE_LEMBAGA: 'Lembaga Pendidikan Islam Modern & Tahfidzul Qur\'an',
  ALAMAT_LEMBAGA: 'Jl. Pesantren Digital No. 01, Kompleks Terpadu, Sleman, D.I. Yogyakarta 55581',
  NO_TELP: '(0274) 8899-7711',
  WHATSAPP_CENTER: '0812-3456-7890',
  EMAIL_LEMBAGA: 'sekretariat@sipesand.id',
  WEBSITE_LEMBAGA: 'https://www.sipesand.id',
  INSTAGRAM_AKUN: '@sipesand_official',
  YOUTUBE_AKUN: 'SiPesand Media Channel',
  NAMA_KEPALA_PONDOK: 'K.H. Syarif Hidayatullah, M.A.',
  NAMA_BENDAHARA: 'Ustadz Ridwan, S.E.',
  BANK_NAME: 'Bank Syariah Indonesia (BSI)',
  BANK_ACCOUNT_NO: '7192837465',
  BANK_ACCOUNT_HOLDER: 'YAYASAN SIPESAND TERPADU',
  LOGO_PONDOK_URL: '',
  CAP_STEMPEL_URL: '',
  TTD_KEPALA_URL: '',
  TTD_BENDAHARA_URL: '',
  QRIS_PAYMENT_URL: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
  NFC_FEATURE_ENABLED: 'true',
  AUTO_BACKUP_ENABLED: 'true',
  GOOGLE_SHEET_SYNC_URL: '',
};

const SettingsContext = createContext({
  settings: defaultSettings,
  isNfcEnabled: true,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => {},
  toggleNfc: async () => {},
});

function getInitialTenantSettings() {
  if (typeof window === 'undefined') return defaultSettings;
  
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tenantParam = (searchParams.get('tenant') || searchParams.get('pondok') || searchParams.get('subdomain') || '').toLowerCase();
  
  let tenantSubdomain = tenantParam;
  if (!tenantSubdomain && (hostname.includes('sipesand.web.id') || hostname.includes('sipesand.we.id'))) {
    const parts = hostname.replace('.sipesand.web.id', '').replace('.sipesand.we.id', '').split('.');
    if (parts[0] && parts[0] !== 'www') {
      tenantSubdomain = parts[0] === 'apps' ? 'app' : parts[0];
    }
  }
  if (!tenantSubdomain) tenantSubdomain = 'app';

  // 1. Cek LocalStorage spesifik tenant
  try {
    const storageKey = `sipesand_settings_${tenantSubdomain}`;
    const cached = localStorage.getItem(storageKey);
    if (cached) {
      return { ...defaultSettings, ...JSON.parse(cached) };
    }
  } catch (e) {}

  // 2. Preset Default per Subdomain Tenant (agar multi-device dari jaringan mana pun langsung tampil instan)
  if (tenantSubdomain === 'darulrahman' || hostname.startsWith('darulrahman.')) {
    return {
      ...defaultSettings,
      NAMA_LEMBAGA: 'Pondok Pesantren Darul Rahman Sumbersari',
      TAGLINE_LEMBAGA: 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
      ALAMAT_LEMBAGA: 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293',
      NO_TELP: '+62 851-2373-4342',
      EMAIL_LEMBAGA: 'darulrahmansumbersari@gmail.com',
      NAMA_KEPALA_PONDOK: 'K.H. Syarif Hidayatullah, M.A.',
      WEB_THEME: 'islamic_green',
      WEB_HERO_TITLE: 'Selamat Datang di Portal Resmi Pondok Pesantren Darul Rahman Sumbersari',
      WEB_HERO_SUBTITLE: 'Pusat pendidikan Islam terpadu, tahfidzul quran, sorogan kitab kuning, dan pembinaan akhlak karimah di Kediri.',
      WEB_GREETING_NOTE: 'Mengabdi untuk Umat, Menjaga Tradisi Salaf & Wawasan Global',
      WEB_SHOW_PERMIT_CHECKER: 'true',
      WEB_SHOW_WALI_PORTAL: 'true',
      WEB_SHOW_ROUTINE: 'true',
      WEB_SHOW_ANNOUNCEMENT: 'true',
      WEB_ANNOUNCEMENT_TEXT: 'Pendaftaran Santri Baru (PSB) Tahun Ajaran 2026/2027 Telah Dibuka!',
      WEB_MAPS_URL: 'https://maps.google.com/?q=Darul+Rahman+Sumbersari+Kediri',
    };
  }

  return defaultSettings;
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(getInitialTenantSettings);
  const [loading, setLoading] = useState(true);

  const getStorageKey = () => {
    if (typeof window === 'undefined') return 'sipesand_settings_app';
    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const t = searchParams.get('tenant') || searchParams.get('pondok') || '';
    if (t) return `sipesand_settings_${t.toLowerCase()}`;
    const parts = hostname.replace('.sipesand.web.id', '').replace('.sipesand.we.id', '').split('.');
    if (parts[0] && parts[0] !== 'www') {
      const sub = parts[0] === 'apps' ? 'app' : parts[0];
      return `sipesand_settings_${sub}`;
    }
    return 'sipesand_settings_app';
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSystemSettings();
      if (res?.data?.success && res?.data?.data) {
        setSettings(prev => {
          const updated = {
            ...prev,
            ...res.data.data,
          };
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }
    } catch (err) {
      console.warn('[SettingsContext] Menggunakan cache data lokal multi-device:', err?.message || 'Offline mode');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    const handleSettingsEvent = (e) => {
      if (e.detail?.data) {
        setSettings(prev => ({ ...prev, ...e.detail.data }));
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('sipesand:firestore:settings', handleSettingsEvent);
      return () => window.removeEventListener('sipesand:firestore:settings', handleSettingsEvent);
    }
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      const key = getStorageKey();
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, JSON.stringify(merged));
          localStorage.setItem('sipesand_tenant_settings', JSON.stringify(merged));
        } catch (e) {}
      }
      const res = await saveSystemSettings(merged);
      if (res?.data?.data) {
        setSettings(res.data.data);
      }
      return { success: true };
    } catch (err) {
      console.error('Error saving settings in Context:', err);
      return { success: false, error: err };
    }
  };

  const toggleNfc = async () => {
    const nextStatus = settings.NFC_FEATURE_ENABLED === 'true' ? 'false' : 'true';
    await updateSettings({ NFC_FEATURE_ENABLED: nextStatus });
  };

  const isNfcEnabled = settings.NFC_FEATURE_ENABLED !== 'false';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isNfcEnabled,
        loading,
        refreshSettings: fetchSettings,
        updateSettings,
        toggleNfc,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
