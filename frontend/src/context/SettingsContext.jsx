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

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('sipesand_tenant_settings');
        if (cached) {
          return { ...defaultSettings, ...JSON.parse(cached) };
        }
      } catch (e) {}
    }
    return defaultSettings;
  });
  const [loading, setLoading] = useState(true);

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
              localStorage.setItem('sipesand_tenant_settings', JSON.stringify(updated));
            } catch (e) {}
          }
          return updated;
        });
      }
    } catch (err) {
      console.error('Error loading settings in Context:', err);
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
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('sipesand_tenant_settings', JSON.stringify(merged));
        } catch (e) {}
      }
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
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
