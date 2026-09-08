import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSystemSettings, saveSystemSettings } from '../services/api';
import { subscribeCloudSettings } from '../services/cloudDatabase';

export const TENANT_PROFILES = {
  darulrahman: {
    NAMA_LEMBAGA: 'Pondok Pesantren Darul Rahman Sumbersari',
    TAGLINE_LEMBAGA: 'Pondok Pesantren Salafiyah Terpadu • Kajian Kitab Kuning & Muhafadzoh Nadzoman',
    ALAMAT_LEMBAGA: 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur',
    NO_TELP: '+62 851-2373-4342',
    WHATSAPP_CENTER: '+6285123734342',
    EMAIL_LEMBAGA: 'darulrahmansumbersari@gmail.com',
    WEBSITE_LEMBAGA: 'https://darulrahman.sipesand.web.id',
    INSTAGRAM_AKUN: '@darulrahman_sumbersari',
    YOUTUBE_AKUN: 'Darul Rahman Official Channel',
    NAMA_KEPALA_PONDOK: 'K.H. Pengasuh Darul Rahman',
    JABATAN_PENGASUH: 'Pengasuh Pondok Pesantren Darul Rahman',
    LOKASI_PENGASUH: 'Kencong, Kepung, Kediri',
    FOTO_PENGASUH_URL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    KALAM_PENGASUH: 'Pondok Pesantren Darul Rahman istiqomah menjaga sanad keilmuan para ulama salafus shalih. Santri kami gembleng membaca dan memaknai kitab kuning, menghafal nadzoman kaidah bahasa dan fiqih (Imrithi & Alfiyah Ibnu Malik), serta mengasah daya nalar melalui tradisi musyawarah dan takror setiap malam. Dengan adab di atas ilmu, santri dipersiapkan menjadi pribadi yang kokoh akidahnya dan bijak dalam mengabdi di masyarakat.',
    STAT_1_NUMBER: '500+',
    STAT_1_LABEL: 'Santri Mukim',
    STAT_2_NUMBER: '1.000 Bait',
    STAT_2_LABEL: 'Nadzom Alfiyah & Imrithi',
    STAT_3_NUMBER: '18+',
    STAT_3_LABEL: 'Asatidz Pengampu Salaf',
    STAT_4_NUMBER: '100%',
    STAT_4_LABEL: 'Cashless KTSD RFID',
    NAMA_BENDAHARA: 'Ustadz Bendahara Darul Rahman, S.E.',
    BANK_NAME: 'Bank Syariah Indonesia (BSI)',
    BANK_ACCOUNT_NO: '7192837465',
    BANK_ACCOUNT_HOLDER: 'YAYASAN DARUL RAHMAN SUMBERSARI',
    PSB_STATUS: 'BUKA',
    PSB_TAHUN: '2026/2027',
    PSB_WHATSAPP: '+6285123734342',
    PSB_DESCRIPTION: 'Membuka pendaftaran santri baru untuk program Madrasah Diniyah Salafiyah, Muhafadzoh Nadzom Kitab, serta jenjang formal SMP dan SMA terpadu. Kuota asrama terbatas setiap angkatan.',
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
  const ignoredSubdomains = ['master', 'app', 'mitra', 'pay', 'www', 'api', 'root', 'saas', 'default', 'admin'];

  if (qTenant && !ignoredSubdomains.includes(qTenant.toLowerCase().trim())) {
    return qTenant.toLowerCase().trim();
  }

  const hostname = window.location.hostname.toLowerCase();

  // Root domain sipesand.web.id and www.sipesand.web.id are pure SaaS landing
  if (hostname === 'sipesand.web.id' || hostname === 'www.sipesand.web.id') {
    return null;
  }

  // Gateway, developer, and system subdomains are non-tenant
  if (
    hostname.startsWith('app.') || 
    hostname.startsWith('mitra.') || 
    hostname.startsWith('pay.') || 
    hostname.startsWith('api.')
  ) {
    return null;
  }

  // Tenant subdomain: [subdomain].sipesand.web.id
  if (hostname.endsWith('.sipesand.web.id')) {
    const parts = hostname.replace('.sipesand.web.id', '').split('.');
    if (parts[0] && !ignoredSubdomains.includes(parts[0].trim())) {
      return parts[0].trim();
    }
    return null;
  }

  // Tenant subdomain on localhost: [subdomain].localhost
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.replace('.localhost', '').split('.');
    if (parts[0] && !ignoredSubdomains.includes(parts[0].trim())) {
      return parts[0].trim();
    }
    return null;
  }

  // Default non-tenant for root preview (pages.dev, IP, or plain localhost without ?tenant=)
  return null;
}

const defaultSettings = {
  NAMA_LEMBAGA: 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)',
  TAGLINE_LEMBAGA: 'Ekosistem Digital Pesantren Generasi Baru • Modern, Mandiri & Berkelanjutan',
  ALAMAT_LEMBAGA: 'SiPesand Platform HQ - Jakarta & Kediri Hub',
  NO_TELP: '+62 851-2373-4342',
  WHATSAPP_CENTER: '+6285123734342',
  EMAIL_LEMBAGA: 'official@sipesand.web.id',
  WEBSITE_LEMBAGA: 'https://sipesand.web.id',
  INSTAGRAM_AKUN: '@sipesand_official',
  YOUTUBE_AKUN: 'SiPesand Official Channel',
  NAMA_KEPALA_PONDOK: 'Pusat Manajemen Pesantren',
  JABATAN_PENGASUH: 'Direktorat Layanan Pesantren Digital',
  LOKASI_PENGASUH: 'Indonesia',
  FOTO_PENGASUH_URL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  KALAM_PENGASUH: 'SiPesand hadir mentransformasi tata kelola pesantren nusantara dengan perpaduan nilai salafiyah dan teknologi digital mutakhir. Menjamin kemandirian pesantren melalui transparansi keuangan, pencatatan akademik kitab kuning, serta kemudahan komunikasi antara pesantren dan wali santri.',
  STAT_1_NUMBER: '120+',
  STAT_1_LABEL: 'Pesantren Terpadu',
  STAT_2_NUMBER: '45.000+',
  STAT_2_LABEL: 'Santri Terdata',
  STAT_3_NUMBER: '99.9%',
  STAT_3_LABEL: 'SLA Cloud Uptime',
  STAT_4_NUMBER: '100%',
  STAT_4_LABEL: 'Cashless KTSD RFID',
  NAMA_BENDAHARA: 'Tim Keuangan SiPesand',
  BANK_NAME: 'Bank Syariah Indonesia (BSI)',
  BANK_ACCOUNT_NO: '7192837465',
  BANK_ACCOUNT_HOLDER: 'SIPESAND TEKNOLOGI NUSANTARA',
  PSB_STATUS: 'BUKA',
  PSB_TAHUN: '2026/2027',
  PSB_WHATSAPP: '+6285123734342',
  PSB_DESCRIPTION: 'Pendaftaran kemitraan dan instalasi ekosistem SiPesand untuk pondok pesantren di seluruh Indonesia.',
  LOGO_PONDOK_URL: '/logo.png',
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

    // Subscribe to Real-Time Cloud Firestore updates across all devices!
    const unsubscribe = subscribeCloudSettings(activeTenant, (cloudData) => {
      if (cloudData && Object.keys(cloudData).length > 0) {
        setSettings(prev => ({
          ...prev,
          ...cloudData,
        }));
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [activeTenant]);

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
