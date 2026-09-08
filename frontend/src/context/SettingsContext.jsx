import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemSettings, saveSystemSettings } from '../services/api';

export const TENANT_PROFILES = {
  darulrahman: {
    NAMA_LEMBAGA: 'Pondok Pesantren Darul Rahman Sumbersari',
    TAGLINE_LEMBAGA: 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an Darul Rahman Sumbersari',
    ALAMAT_LEMBAGA: 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur',
    NO_TELP: '+62 851-2373-4342',
    WHATSAPP_CENTER: '+6285123734342',
    EMAIL_LEMBAGA: 'darulrahmansumbersari@gmail.com',
    WEBSITE_LEMBAGA: 'https://darulrahman.sipesand.web.id',
    INSTAGRAM_AKUN: '@darulrahman_sumbersari',
    YOUTUBE_AKUN: 'Darul Rahman Official Channel',
    NAMA_KEPALA_PONDOK: 'K.H. Pengasuh Darul Rahman',
    NAMA_BENDAHARA: 'Ustadz Bendahara Darul Rahman, S.E.',
    BANK_NAME: 'Bank Syariah Indonesia (BSI)',
    BANK_ACCOUNT_NO: '7192837465',
    BANK_ACCOUNT_HOLDER: 'YAYASAN DARUL RAHMAN SUMBERSARI',
    SUBDOMAIN_TENANT: 'darulrahman',
    LICENSE_KEY: 'KGD-DARULRAHMAN-2026-REAL',
    PACKAGE_TYPE: 'LIFETIME',
    NFC_FEATURE_ENABLED: 'true',
    AUTO_BACKUP_ENABLED: 'true',
    LOGO_PONDOK_URL: '/logo.png',
    CAP_STEMPEL_URL: '',
    TTD_KEPALA_URL: '',
    TTD_BENDAHARA_URL: '',
    QRIS_PAYMENT_URL: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
  }
};

export function getActiveTenantSubdomain() {
  if (typeof window === 'undefined') return null;
  const searchParams = new URLSearchParams(window.location.search);
  const qTenant = searchParams.get('tenant') || searchParams.get('subdomain');
  if (qTenant && !['master', 'app', 'mitra', 'pay', 'www', 'api', 'root'].includes(qTenant.toLowerCase().trim())) {
    return qTenant.toLowerCase().trim();
  }
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('.sipesand.web.id')) {
    const parts = hostname.replace('.sipesand.web.id', '').split('.');
    if (parts[0] && !['www', 'api', 'mitra', 'pay', 'app', 'master'].includes(parts[0])) {
      return parts[0].trim();
    }
  }
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.replace('.localhost', '').split('.');
    if (parts[0] && !['www', 'api', 'mitra', 'pay', 'app', 'master'].includes(parts[0])) {
      return parts[0].trim();
    }
  }
  return null;
}

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
  activeTenantSubdomain: null,
  isTenantInstance: false,
});

export function SettingsProvider({ children }) {
  const activeTenant = getActiveTenantSubdomain();
  const initialSettings = (activeTenant && TENANT_PROFILES[activeTenant])
    ? { ...defaultSettings, ...TENANT_PROFILES[activeTenant] }
    : defaultSettings;

  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await getSystemSettings();
      if (res.data.success && res.data.data && Object.keys(res.data.data).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...res.data.data,
        }));
      }
    } catch (err) {
      console.warn('Backend settings offline, using tenant profile defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      await saveSystemSettings(newSettings);
      await fetchSettings();
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
        activeTenantSubdomain: activeTenant,
        isTenantInstance: !!activeTenant,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
