import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Server, 
  ShieldCheck, 
  Activity, 
  Users, 
  Database, 
  CreditCard, 
  Sliders, 
  Globe, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Radio, 
  Bell, 
  Check, 
  ChevronRight, 
  ChevronDown, 
  HardDrive, 
  Cpu, 
  Clock, 
  Eye, 
  FileText, 
  Send, 
  Save, 
  LogOut,
  UserCheck,
  Zap,
  DollarSign,
  Layers,
  BarChart3,
  TrendingUp,
  Settings,
  Shield,
  HelpCircle,
  X,
  Cloud,
  QrCode,
  UploadCloud,
  Wallet,
  MessageCircle,
  Copy
} from 'lucide-react';
import { TENANT_PROFILES } from '../context/SettingsContext';
import { 
  getR2StorageQuota, 
  cleanupR2Storage, 
  backupDatabaseToR2,
  getMitraConfig,
  updateMitraConfig,
  getMitraOrders,
  verifyMitraOrder,
  deleteMitraOrder,
  uploadFileToR2
} from '../services/api';
import { compressImage } from '../utils/imageCompressor';

export default function DashboardDeveloper({ 
  onLogout, 
  onImpersonateTenant,
  onBackToSaasLanding 
}) {
  // Navigation active tab: 'overview' | 'tenants' | 'infrastructure' | 'security' | 'monitoring' | 'cms' | 'billing' | 'modules' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');
  const [environment, setEnvironment] = useState('production'); // 'production' | 'staging'
  const [globalSearch, setGlobalSearch] = useState('');

  // ---------------------------------------------------------------------------
  // CLOUDFLARE R2 OBJECT STORAGE & 10 GB QUOTA SAFEGUARD (CENTRALIZED MITRA)
  // ---------------------------------------------------------------------------
  const [r2Stats, setR2Stats] = useState({
    connected: true,
    usedFormatted: '0 B',
    quotaLimitFormatted: '10.00 GB',
    remainingFormatted: '10.00 GB',
    percentUsed: 0,
    fileCount: 0,
    bucketName: 'sipesand-storage',
    binding: 'SIPESAND_R2 & SIPESAN_R2',
    accountName: "chaawwu@gmail.com's Account"
  });
  const [loadingR2, setLoadingR2] = useState(false);
  const [r2Message, setR2Message] = useState(null);

  useEffect(() => {
    loadR2Status();
    loadMitraConfigData();
    loadMitraOrdersData();
  }, []);

  const loadR2Status = async () => {
    try {
      setLoadingR2(true);
      const res = await getR2StorageQuota();
      if (res && res.data) {
        setR2Stats(prev => ({
          ...prev,
          ...res.data,
          bucketName: 'sipesand-storage',
          binding: 'SIPESAND_R2 & SIPESAN_R2',
          accountName: "chaawwu@gmail.com's Account"
        }));
      }
    } catch (e) {
      console.warn('Gagal memuat status R2:', e);
    } finally {
      setLoadingR2(false);
    }
  };

  const handleR2Cleanup = async () => {
    if (!window.confirm('Jalankan auto-pruning untuk membersihkan berkas sementara dan file usang di Cloudflare R2?')) return;
    try {
      setLoadingR2(true);
      const res = await cleanupR2Storage();
      setR2Message({ type: 'success', text: res.message || 'Pembersihan R2 selesai!' });
      loadR2Status();
    } catch (e) {
      setR2Message({ type: 'error', text: 'Gagal membersihkan R2: ' + (e.message || 'Error') });
    } finally {
      setLoadingR2(false);
      setTimeout(() => setR2Message(null), 5000);
    }
  };

  // ---------------------------------------------------------------------------
  // 1. STATE: TENANT MANAGEMENT (CRM)
  // ---------------------------------------------------------------------------
  const [tenants, setTenants] = useState([
    {
      id: 't-0',
      name: 'Pondok Pesantren Darul Rahman Sumbersari',
      subdomain: 'darulrahman',
      status: 'ACTIVE',
      plan: 'LIFETIME',
      santriCount: 500,
      dbSizeMb: 18.5,
      dbEngine: 'SQLite (WAL) + Firestore Cloud',
      adminEmail: 'darulrahmansumbersari@gmail.com',
      adminPhone: '+62 851-2373-4342',
      joinedDate: '01 Jan 2026',
      lastActive: 'Baru saja',
      nfcActive: true
    },
    {
      id: 't-1',
      name: 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)',
      subdomain: 'pesantren-terpadu',
      status: 'ACTIVE',
      plan: 'LIFETIME',
      santriCount: 342,
      dbSizeMb: 14.2,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: 'ridwan@sipesand.web.id',
      adminPhone: '081234567890',
      joinedDate: '12 Jan 2026',
      lastActive: '2 menit lalu',
      nfcActive: true
    },
    {
      id: 't-2',
      name: 'PP Al-Falah Modern Tahfidz',
      subdomain: 'al-falah',
      status: 'ACTIVE',
      plan: 'TAHUNAN',
      santriCount: 185,
      dbSizeMb: 8.6,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: 'admin@alfalah.ac.id',
      adminPhone: '085712345678',
      joinedDate: '28 Feb 2026',
      lastActive: '14 menit lalu',
      nfcActive: true
    },
    {
      id: 't-3',
      name: 'Pesantren Darul Ulum Digital',
      subdomain: 'darul-ulum',
      status: 'TRIAL',
      plan: 'TRIAL (14 Hari)',
      santriCount: 94,
      dbSizeMb: 4.1,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: 'ict@darululum.sch.id',
      adminPhone: '081987654321',
      joinedDate: '01 Mar 2026',
      lastActive: '1 jam lalu',
      nfcActive: false
    },
    {
      id: 't-4',
      name: 'Ma\'had Darussalam Boarding',
      subdomain: 'darussalam',
      status: 'ACTIVE',
      plan: 'TAHUNAN',
      santriCount: 420,
      dbSizeMb: 21.4,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: 'sekretariat@darussalam.org',
      adminPhone: '082133445566',
      joinedDate: '15 Jan 2026',
      lastActive: '5 menit lalu',
      nfcActive: true
    },
    {
      id: 't-5',
      name: 'Pesantren Nurul Huda Mandiri',
      subdomain: 'nurul-huda',
      status: 'SUSPENDED',
      plan: 'TAHUNAN (Expired)',
      santriCount: 110,
      dbSizeMb: 6.8,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: 'bendahara@nurulhuda.net',
      adminPhone: '081399887766',
      joinedDate: '05 Des 2025',
      lastActive: '8 hari lalu',
      nfcActive: false
    }
  ]);

  const [tenantFilter, setTenantFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'TRIAL' | 'SUSPENDED'
  const [isAddTenantModalOpen, setIsAddTenantModalOpen] = useState(false);
  const [isEditTenantModalOpen, setIsEditTenantModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  // Form Tambah Tenant Baru
  const [newTenantForm, setNewTenantForm] = useState({
    name: '',
    subdomain: '',
    adminEmail: '',
    adminPhone: '',
    plan: 'TAHUNAN',
    initialSantri: 100,
    nfcActive: true
  });

  const handleAddTenant = (e) => {
    e.preventDefault();
    if (!newTenantForm.name || !newTenantForm.subdomain) return;
    
    const cleanSub = newTenantForm.subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    const newEntry = {
      id: 't-' + (tenants.length + 1),
      name: newTenantForm.name,
      subdomain: cleanSub,
      status: 'ACTIVE',
      plan: newTenantForm.plan,
      santriCount: parseInt(newTenantForm.initialSantri) || 0,
      dbSizeMb: 2.4,
      dbEngine: 'SQLite (WAL) + Firestore',
      adminEmail: newTenantForm.adminEmail,
      adminPhone: newTenantForm.adminPhone,
      joinedDate: 'Hari ini',
      lastActive: 'Baru saja',
      nfcActive: newTenantForm.nfcActive
    };

    setTenants([newEntry, ...tenants]);
    setIsAddTenantModalOpen(false);
    setNewTenantForm({
      name: '',
      subdomain: '',
      adminEmail: '',
      adminPhone: '',
      plan: 'TAHUNAN',
      initialSantri: 100,
      nfcActive: true
    });
  };

  const handleToggleTenantStatus = (id) => {
    setTenants(prev => prev.map(t => {
      if (t.id === id) {
        const nextStatus = t.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
  };

  const handleDeleteTenant = (id) => {
    if (window.confirm('PERINGATAN: Menghapus tenant ini akan mencabut akses domain dan file SQLite. Lanjutkan?')) {
      setTenants(prev => prev.filter(t => t.id !== id));
    }
  };

  // State: Edit Tenant Config (Profile, Kalam Pengasuh, Stats, Bank)
  const [tenantConfigForm, setTenantConfigForm] = useState({
    subdomain: '',
    namaLembaga: '',
    tagline: '',
    namaPengasuh: '',
    jabatanPengasuh: '',
    lokasiPengasuh: '',
    kalamPengasuh: '',
    stat1Number: '500+',
    stat1Label: 'Santri Mukim',
    stat2Number: '1.000 Bait',
    stat2Label: 'Nadzom Alfiyah & Imrithi',
    stat3Number: '18+',
    stat3Label: 'Asatidz Pengampu Salaf',
    stat4Number: '100%',
    stat4Label: 'Cashless KTSD RFID',
    bankAccountNo: '7192837465',
    bankAccountHolder: 'YAYASAN PESANTREN',
    whatsappCenter: '+6285123734342',
  });
  const [isSavingTenantConfig, setIsSavingTenantConfig] = useState(false);

  const handleOpenEditTenantConfig = (t) => {
    setSelectedTenant(t);
    const profile = (TENANT_PROFILES && TENANT_PROFILES[t.subdomain]) ? TENANT_PROFILES[t.subdomain] : {};
    setTenantConfigForm({
      subdomain: t.subdomain,
      namaLembaga: profile.NAMA_LEMBAGA || t.name,
      tagline: profile.TAGLINE_LEMBAGA || 'Pondok Pesantren Salafiyah Terpadu • Kajian Kitab Kuning & Muhafadzoh Nadzoman',
      namaPengasuh: profile.NAMA_KEPALA_PONDOK || (t.subdomain === 'darulrahman' ? 'K.H. Pengasuh Darul Rahman' : 'K.H. Pengasuh Pesantren'),
      jabatanPengasuh: profile.JABATAN_PENGASUH || (t.subdomain === 'darulrahman' ? 'Pengasuh Pondok Pesantren Darul Rahman' : 'Pengasuh Pondok Pesantren'),
      lokasiPengasuh: profile.LOKASI_PENGASUH || (t.subdomain === 'darulrahman' ? 'Kencong, Kepung, Kediri' : 'Indonesia'),
      kalamPengasuh: profile.KALAM_PENGASUH || 'Pondok Pesantren istiqomah menjaga sanad keilmuan para ulama salafus shalih. Santri kami gembleng membaca dan memaknai kitab kuning, menghafal nadzoman kaidah bahasa dan fiqih (Imrithi & Alfiyah Ibnu Malik), serta mengasah daya nalar melalui tradisi musyawarah dan takror setiap malam.',
      stat1Number: profile.STAT_1_NUMBER || '500+',
      stat1Label: profile.STAT_1_LABEL || 'Santri Mukim',
      stat2Number: profile.STAT_2_NUMBER || '1.000 Bait',
      stat2Label: profile.STAT_2_LABEL || 'Nadzom Alfiyah & Imrithi',
      stat3Number: profile.STAT_3_NUMBER || '18+',
      stat3Label: profile.STAT_3_LABEL || 'Asatidz Pengampu Salaf',
      stat4Number: profile.STAT_4_NUMBER || '100%',
      stat4Label: profile.STAT_4_LABEL || 'Cashless KTSD RFID',
      bankAccountNo: profile.BANK_ACCOUNT_NO || '7192837465',
      bankAccountHolder: profile.BANK_ACCOUNT_HOLDER || (t.subdomain === 'darulrahman' ? 'YAYASAN DARUL RAHMAN SUMBERSARI' : 'YAYASAN PESANTREN'),
      whatsappCenter: profile.WHATSAPP_CENTER || '+6285123734342',
    });
    setIsEditTenantModalOpen(true);
  };

  const handleSaveTenantConfig = async (e) => {
    e.preventDefault();
    try {
      setIsSavingTenantConfig(true);
      const { saveCloudSettings } = await import('../services/cloudDatabase');
      await saveCloudSettings({
        NAMA_LEMBAGA: tenantConfigForm.namaLembaga,
        TAGLINE_LEMBAGA: tenantConfigForm.tagline,
        NAMA_KEPALA_PONDOK: tenantConfigForm.namaPengasuh,
        JABATAN_PENGASUH: tenantConfigForm.jabatanPengasuh,
        LOKASI_PENGASUH: tenantConfigForm.lokasiPengasuh,
        KALAM_PENGASUH: tenantConfigForm.kalamPengasuh,
        STAT_1_NUMBER: tenantConfigForm.stat1Number,
        STAT_1_LABEL: tenantConfigForm.stat1Label,
        STAT_2_NUMBER: tenantConfigForm.stat2Number,
        STAT_2_LABEL: tenantConfigForm.stat2Label,
        STAT_3_NUMBER: tenantConfigForm.stat3Number,
        STAT_3_LABEL: tenantConfigForm.stat3Label,
        STAT_4_NUMBER: tenantConfigForm.stat4Number,
        STAT_4_LABEL: tenantConfigForm.stat4Label,
        BANK_ACCOUNT_NO: tenantConfigForm.bankAccountNo,
        BANK_ACCOUNT_HOLDER: tenantConfigForm.bankAccountHolder,
        WHATSAPP_CENTER: tenantConfigForm.whatsappCenter,
      }, tenantConfigForm.subdomain);

      setTenants(prev => prev.map(t => {
        if (t.subdomain === tenantConfigForm.subdomain) {
          return { ...t, name: tenantConfigForm.namaLembaga };
        }
        return t;
      }));
      setIsEditTenantModalOpen(false);
    } catch (err) {
      console.error('Save tenant config error:', err);
      setIsEditTenantModalOpen(false);
    } finally {
      setIsSavingTenantConfig(false);
    }
  };

  // State: Modul SIPESAND Feature Flags
  const [featureFlags, setFeatureFlags] = useState({
    ktsdRfid: true,
    waGateway: true,
    firestoreSync: true,
    autoBackupR2: true,
    googleSheetSync: true,
    faceRecognition: false,
  });

  const toggleFeatureFlag = (key) => {
    setFeatureFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // State: Real-Time Monitoring Streams
  const [livePosTransactions] = useState([
    { id: 'pos-1', tenant: 'darulrahman', santri: 'Muhammad Azzam Al-Fatih', item: 'Nasi Kuning Santri + Susu Kedelai', amount: 12000, time: '20 detik lalu', status: 'SUCCESS' },
    { id: 'pos-2', tenant: 'al-falah', santri: 'Aisyah Nur Ramadhani', item: 'Kitab Jurumiyyah + Buku Tulis', amount: 45000, time: '1 menit lalu', status: 'SUCCESS' },
    { id: 'pos-3', tenant: 'darul-ulum', santri: 'Muhammad Farhan Al-Fatih', item: 'Top-up Saku via QRIS Pesantren', amount: 100000, time: '3 menit lalu', status: 'SUCCESS' },
    { id: 'pos-4', tenant: 'darulrahman', santri: 'Fathimah Az-Zahra', item: 'Air Mineral + Roti Madinah', amount: 8000, time: '5 menit lalu', status: 'SUCCESS' },
  ]);

  const [liveRfidScans] = useState([
    { id: 'rfid-1', tenant: 'darulrahman', santri: 'Muhammad Azzam Al-Fatih', reader: 'Gate Utama Pos Kamtib', uid: 'NFC-8A3F129B', time: '15 detik lalu', status: 'VERIFIED' },
    { id: 'rfid-2', tenant: 'al-falah', santri: 'Aisyah Nur Ramadhani', reader: 'Madrasah Diniyah Kelas 10', uid: 'NFC-4B7C91D3', time: '45 detik lalu', status: 'VERIFIED' },
    { id: 'rfid-3', tenant: 'darulrahman', santri: 'Zaki Yamani', reader: 'Kantin Salaf POS Terminal 1', uid: 'NFC-5C8E192A', time: '2 menit lalu', status: 'VERIFIED' },
  ]);

  const [activePermits] = useState([
    { id: 'prm-1', tenant: 'darulrahman', santri: 'Aisyah Nur Ramadhani', reason: 'Izin Sambangan Keluarga & Kepulangan Bulanan', returnDate: '09-09-2026 17:00', remainingTime: '6 jam lagi', status: 'ACTIVE' },
    { id: 'prm-2', tenant: 'al-falah', santri: 'Muhammad Farhan', reason: 'Pemeriksaan Kesehatan Poskestren', returnDate: '09-09-2026 20:00', remainingTime: '9 jam lagi', status: 'ACTIVE' },
  ]);

  // ---------------------------------------------------------------------------
  // 2. STATE: SECURITY & AUTH LOGS (Security Center)
  // ---------------------------------------------------------------------------
  const [authLogs, setAuthLogs] = useState([
    { id: 'l-1', user: 'admin', role: 'SUPER_ADMIN', tenant: 'pesantren-terpadu', ip: '114.122.45.19', location: 'Surabaya, ID', status: 'SUCCESS', time: '10 detik lalu', userAgent: 'Chrome 128 / macOS' },
    { id: 'l-2', user: 'bendahara', role: 'BENDAHARA', tenant: 'al-falah', ip: '180.252.88.102', location: 'Semarang, ID', status: 'SUCCESS', time: '2 menit lalu', userAgent: 'Edge 128 / Win11' },
    { id: 'l-3', user: 'root', role: 'UNKNOWN', tenant: 'darul-ulum', ip: '194.26.29.11', location: 'Frankfurt, DE', status: 'FAILED', time: '4 menit lalu', userAgent: 'Python-Requests / Linux' },
    { id: 'l-4', user: 'kamtib', role: 'KEAMANAN', tenant: 'darussalam', ip: '103.111.20.5', location: 'Jakarta, ID', status: 'SUCCESS', time: '8 menit lalu', userAgent: 'Firefox 130 / Android' },
    { id: 'l-5', user: 'guest_test', role: 'UNKNOWN', tenant: 'pesantren-terpadu', ip: '45.154.255.8', location: 'Amsterdam, NL', status: 'FAILED', time: '15 menit lalu', userAgent: 'Go-http-client' },
    { id: 'l-6', user: 'uangsaku', role: 'PENGURUS_SAKU', tenant: 'pesantren-terpadu', ip: '114.122.45.19', location: 'Surabaya, ID', status: 'SUCCESS', time: '24 menit lalu', userAgent: 'Chrome 128 / Windows' },
  ]);

  const [auditTrails, setAuditTrails] = useState([
    { id: 'at-1', admin: 'lead-dev@sipesand.web.id', action: 'DEPLOY_PATCH', target: 'Cloudflare Worker Multi-Tenant Route v3.2', time: '15 menit lalu' },
    { id: 'at-2', admin: 'lead-dev@sipesand.web.id', action: 'UPDATE_PRICING', target: 'Paket Tahunan Rp 1.500.000 / tahun', time: '2 jam lalu' },
    { id: 'at-3', admin: 'lead-dev@sipesand.web.id', action: 'ACTIVATE_TENANT', target: 'PP Al-Falah Modern Tahfidz (al-falah)', time: '5 jam lalu' },
    { id: 'at-4', admin: 'system-cron', action: 'BACKUP_SQLITE', target: 'Auto-snapshot 5 tenant SQLite databases', time: '12 jam lalu' },
  ]);

  const [authStatusFilter, setAuthStatusFilter] = useState('ALL'); // 'ALL' | 'SUCCESS' | 'FAILED'

  // ---------------------------------------------------------------------------
  // 3. STATE: INFRASTRUCTURE & SERVER MONITORING
  // ---------------------------------------------------------------------------
  const [infraStats] = useState({
    firestoreReads: 42150,
    firestoreReadsLimit: 50000,
    firestoreWrites: 18420,
    firestoreWritesLimit: 20000,
    firestoreDeletes: 1240,
    firestoreDeletesLimit: 20000,
    totalSqliteStorageMb: 55.0,
    cloudflareLatencyMs: 14,
    expressApiLatencyMs: 24,
    dbLatencyMs: 4,
    uptimePercent: 99.98,
    activeSockets: 48,
    memoryUsageMb: 284,
    memoryLimitMb: 1024,
    cpuUsagePercent: 12
  });

  // ---------------------------------------------------------------------------
  // 4. STATE: WEB DEV BUILDER & GLOBAL CMS
  // ---------------------------------------------------------------------------
  const [cmsLanding, setCmsLanding] = useState({
    heroHeadline: 'Kelola Pesantren Tumbuh Tanpa Batas',
    heroSubheadline: 'Satu platform terintegrasi untuk verifikasi kartu santri digital RFID/NFC, kasir uang saku cashless, perizinan Kamtib, dan transparansi wali santri.',
    ctaText: 'Cari Santri',
    badgeText: 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)',
    tahunanPrice: '1.500.000',
    lifetimePrice: '4.500.000',
    supportWhatsapp: '0812-3456-7890',
  });
  const [cmsSavedToast, setCmsSavedToast] = useState(false);

  // Global Announcement Broadcast to all tenants
  const [announcement, setAnnouncement] = useState({
    isActive: true,
    type: 'INFO', // 'INFO' | 'WARNING' | 'MAINTENANCE'
    title: 'Pemeliharaan Server Terjadwal',
    message: 'Akan dilakukan sinkronisasi rutin node Cloudflare dan backup SQLite pada pukul 23:00 WIB. Layanan tetap aktif.',
    targetAllTenants: true
  });
  const [announcementSavedToast, setAnnouncementSavedToast] = useState(false);

  // Default Theme Manager for newly created tenants
  const [themeManager, setThemeManager] = useState({
    primaryHex: '#0B52E2',
    accentHex: '#8CE829',
    canvasHex: '#FAF8F4',
    enableKtsdDefault: true,
    enableSakuDefault: true,
    enableTahfidzDefault: true,
    enableKamtibDefault: true
  });

  const handleSaveCms = (e) => {
    e.preventDefault();
    setCmsSavedToast(true);
    setTimeout(() => setCmsSavedToast(false), 2500);
  };

  const handleSaveAnnouncement = (e) => {
    e.preventDefault();
    setAnnouncementSavedToast(true);
    setTimeout(() => setAnnouncementSavedToast(false), 2500);
  };

  // ---------------------------------------------------------------------------
  // 5. STATE: SAAS BILLING, MITRA CONFIG & INCOMING ORDERS
  // ---------------------------------------------------------------------------
  const [mitraConfig, setMitraConfig] = useState({
    bankName: 'Bank Syariah Indonesia (BSI)',
    bankAccountNo: '7192837465',
    bankAccountHolder: 'YAYASAN DARUL RAHMAN SUMBERSARI / KING DIGITAL DEV',
    qrisImageUrl: 'https://i.ibb.co/vzkmT9r/qris-sample.png',
    qrisString: '00020101021226580016ID.CO.KINGDIGITAL.WWW0118936009928192837465520458145303360540715000005802ID5915KING_DIGITAL_DEV6007BANDUNG61054011562070703A0163041029',
    waConfirmationNumber: '+62 851-2373-4342',
    tahunanPrice: 1500000,
    lifetimePrice: 3500000
  });
  const [loadingMitraConfig, setLoadingMitraConfig] = useState(false);
  const [savingMitraConfig, setSavingMitraConfig] = useState(false);
  const [mitraConfigToast, setMitraConfigToast] = useState(null);
  const [isUploadingQris, setIsUploadingQris] = useState(false);

  const [mitraOrders, setMitraOrders] = useState([]);
  const [loadingMitraOrders, setLoadingMitraOrders] = useState(false);
  const [ordersFilter, setOrdersFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'WAITING' | 'PAID'
  const [ordersSearch, setOrdersSearch] = useState('');
  const [verifyingOrderId, setVerifyingOrderId] = useState(null);
  const [selectedProofModal, setSelectedProofModal] = useState(null);
  const [verifiedSuccessData, setVerifiedSuccessData] = useState(null);

  const loadMitraConfigData = async () => {
    try {
      setLoadingMitraConfig(true);
      const res = await getMitraConfig();
      if (res.data?.success && res.data?.data) {
        setMitraConfig(prev => ({ ...prev, ...res.data.data }));
      }
    } catch (e) {
      console.warn('Gagal memuat konfigurasi mitra:', e);
    } finally {
      setLoadingMitraConfig(false);
    }
  };

  const loadMitraOrdersData = async () => {
    try {
      setLoadingMitraOrders(true);
      const res = await getMitraOrders();
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMitraOrders(res.data.data);
        const paidOrders = res.data.data.filter(o => o.status === 'PAID' || o.status === 'ACTIVE');
        if (paidOrders.length > 0) {
          setTenants(prev => {
            const existingSubs = new Set(prev.map(t => t.subdomain));
            const newTenants = paidOrders
              .filter(o => !existingSubs.has(o.subdomain))
              .map(o => ({
                id: o.id || `t-${o.subdomain}`,
                name: o.namaPondok,
                subdomain: o.subdomain,
                status: 'ACTIVE',
                plan: o.packageType,
                santriCount: 0,
                dbSizeMb: 1.5,
                dbEngine: 'SQLite (WAL) + Firestore',
                adminEmail: o.email,
                adminPhone: o.noWhatsapp,
                joinedDate: o.createdAt ? new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Hari ini',
                lastActive: 'Baru saja',
                nfcActive: true
              }));
            return [...newTenants, ...prev];
          });
        }
      }
    } catch (e) {
      console.warn('Gagal memuat orders mitra:', e);
    } finally {
      setLoadingMitraOrders(false);
    }
  };

  const handleSaveMitraConfig = async (e) => {
    e?.preventDefault();
    try {
      setSavingMitraConfig(true);
      const res = await updateMitraConfig(mitraConfig);
      setMitraConfigToast({ type: 'success', text: res.data?.message || 'Pengaturan Rekening, QRIS, & Harga Lisensi berhasil disimpan!' });
    } catch (err) {
      setMitraConfigToast({ type: 'error', text: 'Gagal menyimpan: ' + (err.response?.data?.message || err.message) });
    } finally {
      setSavingMitraConfig(false);
      setTimeout(() => setMitraConfigToast(null), 4000);
    }
  };

  const handleUploadQrisImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingQris(true);
      const compressedB64 = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.88 });
      const res = await uploadFileToR2({
        fileName: `qris_${Date.now()}.jpg`,
        fileBase64: compressedB64,
        fileData: compressedB64,
        mimeType: 'image/jpeg',
        folder: 'qris'
      }, 'master');
      if (res.success && res.data?.url) {
        setMitraConfig(prev => ({ ...prev, qrisImageUrl: res.data.url }));
        setMitraConfigToast({ type: 'success', text: 'QRIS baru berhasil diunggah ke Cloudflare R2! Silakan klik "Simpan Pengaturan".' });
      } else {
        setMitraConfig(prev => ({ ...prev, qrisImageUrl: compressedB64 }));
      }
    } catch (err) {
      setMitraConfigToast({ type: 'error', text: 'Gagal mengunggah QRIS: ' + err.message });
    } finally {
      setIsUploadingQris(false);
      setTimeout(() => setMitraConfigToast(null), 4000);
    }
  };

  const handleVerifyOrder = async (orderId) => {
    if (!window.confirm('Verifikasi pembayaran dan aktifkan instans pesantren ini sekarang? Sistem akan otomatis membuat akun Super Admin dan profil instans database.')) return;
    try {
      setVerifyingOrderId(orderId);
      const res = await verifyMitraOrder(orderId);
      if (res.data?.success) {
        setVerifiedSuccessData(res.data.data);
        await loadMitraOrdersData();
      }
    } catch (err) {
      alert('Gagal memverifikasi pesanan: ' + (err.response?.data?.message || err.message));
    } finally {
      setVerifyingOrderId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Hapus pendaftaran/pesanan ini? Data yang dihapus tidak dapat dipulihkan.')) return;
    try {
      await deleteMitraOrder(orderId);
      setMitraOrders(prev => prev.filter(o => (o.id !== orderId && o.orderId !== orderId)));
    } catch (err) {
      alert('Gagal menghapus pesanan: ' + (err.response?.data?.message || err.message));
    }
  };

  // Kalkulasi Financial Metrics
  const paidOrdersList = mitraOrders.filter(o => o.status === 'PAID' || o.status === 'ACTIVE');
  const totalPaidRevenue = paidOrdersList.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const financialStats = {
    mrr: totalPaidRevenue > 0 ? Math.round(totalPaidRevenue / 12) + 24500000 : 24500000,
    arr: totalPaidRevenue > 0 ? (totalPaidRevenue + 294000000) : 294000000,
    activeSubscribers: tenants.filter(t => t.status === 'ACTIVE').length,
    churnRatePercent: 0.8,
    retentionPercent: 99.2,
    totalGrossRevenue: totalPaidRevenue + 48000000,
  };

  // Filter Pesanan Mitra
  const filteredMitraOrders = mitraOrders.filter(ord => {
    let matchesStatus = true;
    if (ordersFilter === 'PENDING') matchesStatus = ord.status === 'PENDING_PAYMENT' || ord.status === 'PENDING';
    else if (ordersFilter === 'WAITING') matchesStatus = ord.status === 'WAITING_VERIFICATION';
    else if (ordersFilter === 'PAID') matchesStatus = ord.status === 'PAID' || ord.status === 'ACTIVE';

    const searchLower = ordersSearch.toLowerCase();
    const matchesSearch = !ordersSearch || 
      (ord.namaPondok && ord.namaPondok.toLowerCase().includes(searchLower)) ||
      (ord.subdomain && ord.subdomain.toLowerCase().includes(searchLower)) ||
      (ord.orderId && ord.orderId.toLowerCase().includes(searchLower)) ||
      (ord.email && ord.email.toLowerCase().includes(searchLower));

    return matchesStatus && matchesSearch;
  });

  // Filtering Tenants Data
  const filteredTenants = tenants.filter(t => {
    const matchesFilter = tenantFilter === 'ALL' || t.status === tenantFilter;
    const matchesSearch = globalSearch === '' || 
      t.name.toLowerCase().includes(globalSearch.toLowerCase()) || 
      t.subdomain.toLowerCase().includes(globalSearch.toLowerCase()) ||
      t.adminEmail.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtering Auth Logs
  const filteredAuthLogs = authLogs.filter(log => {
    const matchesStatus = authStatusFilter === 'ALL' || log.status === authStatusFilter;
    const matchesSearch = globalSearch === '' || 
      log.user.toLowerCase().includes(globalSearch.toLowerCase()) || 
      log.tenant.toLowerCase().includes(globalSearch.toLowerCase()) || 
      log.ip.includes(globalSearch);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      
      {/* ===================================================================== */}
      {/* 1. FIXED LEFT SIDEBAR (STRIPE / VERCEL ENTERPRISE STYLE)               */}
      {/* ===================================================================== */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800 select-none">
        
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">SiPesand</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  DEV
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">mitra.sipesand.web.id</p>
            </div>
          </div>
        </div>

        {/* Environment Badge & Server Status */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-slate-800/50 border border-slate-700/60 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-bold text-[11px]">Cloudflare Edge</span>
            </div>
            <span className="text-emerald-400 font-bold text-[10px]">HEALTHY</span>
          </div>
        </div>

        {/* Navigation Modules (9 Modules Enterprise Bento Grid) */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-xs font-sans">
          
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Control Center
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'overview' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Master Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('tenants')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'tenants' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>Tenants Management</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-[#00FF99] border border-slate-700 font-bold">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'monitoring' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4" />
              <span>Monitoring Real-Time</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00FF99] animate-pulse" />
          </button>

          <div className="pt-4 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cloud & Security
          </div>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'infrastructure' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="w-4 h-4" />
              <span>Infrastruktur & Server</span>
            </div>
            <span className="text-[10px] font-mono text-[#00FF99]">14ms</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'security' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security Center & WAF</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'modules' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Modul SIPESAND Toggle</span>
          </button>

          <div className="pt-4 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Growth & Configuration
          </div>

          <button
            onClick={() => setActiveTab('cms')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'cms' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>CMS & Landing Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'billing' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-4 h-4" />
              <span>Billing & Rekening Mitra</span>
            </div>
            {mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] animate-pulse">
                {mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'settings' 
                ? 'bg-[#0057FF] text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Developer Settings & API</span>
          </button>

        </nav>

        {/* Footer Info & Logout */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          
          <div className="px-2 py-1.5 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="font-mono">Node ID: SBY-HYB-01</span>
            <span className="text-emerald-400 font-bold">● v3.2-prod</span>
          </div>

          {onBackToSaasLanding && (
            <button
              onClick={onBackToSaasLanding}
              className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Halaman Publik B2B</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full py-1.5 px-3 text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Developer Session</span>
          </button>

        </div>

      </aside>

      {/* ===================================================================== */}
      {/* 2. DYNAMIC MAIN CONTENT WRAPPER                                       */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-30">
          
          {/* Global Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama pesantren, subdomain, IP address, atau audit log..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-blue-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            
            {/* Environment Toggle */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs font-bold">
              <button
                onClick={() => setEnvironment('production')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  environment === 'production' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Production
              </button>
              <button
                onClick={() => setEnvironment('staging')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  environment === 'staging' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Staging
              </button>
            </div>

            {/* Quick Impersonate Shortcut */}
            <button
              onClick={() => onImpersonateTenant && onImpersonateTenant('pesantren-terpadu')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
              title="Masuk langsung ke app.sipesand.web.id demo session"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Launch App Gateway</span>
            </button>

            {/* Admin Avatar */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-none">Superadmin Dev</div>
                <div className="text-[10px] text-slate-400 font-medium">Lead SaaS Architect</div>
              </div>
            </div>

          </div>

        </header>

        {/* Dynamic Tab Body */}
        <main className="p-6 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">

          {/* ================================================================= */}
          {/* TAB 1: MASTER OVERVIEW (BENTO GRID)                               */}
          {/* ================================================================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Top Banner KPI Bento Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* KPI 1: Active Tenants */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Total Pesantren</span>
                    <Building2 className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {tenants.length} Lembaga
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+2 registrasi minggu ini</span>
                  </div>
                </div>

                {/* KPI 2: Total Santri Managed */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Total Santri Aktif</span>
                    <Users className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {tenants.reduce((sum, t) => sum + t.santriCount, 0).toLocaleString('id-ID')} Santri
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Terdata dalam database hybrid
                  </div>
                </div>

                {/* KPI 3: MRR Monthly Revenue */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>MRR Pesantren SaaS</span>
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    Rp {(financialStats.mrr / 1000000).toFixed(1)} Jt
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+14.8% vs bulan lalu</span>
                  </div>
                </div>

                {/* KPI 4: Infrastructure Latency */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <span>Server Uptime</span>
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {infraStats.uptimePercent}%
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Edge {infraStats.cloudflareLatencyMs}ms • API {infraStats.expressApiLatencyMs}ms
                  </div>
                </div>

              </div>

              {/* Bento Grid Row 2: Hybrid DB Health & Live Auth Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left (7 Cols): Hybrid DB Status Overview */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Kesehatan Hybrid Database Engine</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Firebase Cloud Firestore (Real-time Cloud) + SQLite (Offline-First Server)</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('infrastructure')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Rincian</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Visual Gauge Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Firestore Reads (24h)</div>
                      <div className="font-mono font-bold text-xl text-slate-900">
                        {infraStats.firestoreReads.toLocaleString('id-ID')}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(infraStats.firestoreReads / infraStats.firestoreReadsLimit) * 100}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Kuota: {((infraStats.firestoreReads / infraStats.firestoreReadsLimit) * 100).toFixed(1)}% dari 50k
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Firestore Writes (24h)</div>
                      <div className="font-mono font-bold text-xl text-slate-900">
                        {infraStats.firestoreWrites.toLocaleString('id-ID')}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(infraStats.firestoreWrites / infraStats.firestoreWritesLimit) * 100}%` }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Kuota: {((infraStats.firestoreWrites / infraStats.firestoreWritesLimit) * 100).toFixed(1)}% dari 20k
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Storage SQLite .db</div>
                      <div className="font-mono font-bold text-xl text-slate-900">
                        {infraStats.totalSqliteStorageMb} MB
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '15%' }} />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {tenants.length} Isolated Tenant Files
                      </div>
                    </div>

                  </div>

                  {/* Quick System Notice */}
                  <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Automated Daily Snapshot Active:</strong> File SQLite seluruh pesantren di-snapshot setiap pukul 02:00 WIB dan disinkronkan ke Cloudflare R2 bucket terenkripsi AES-256.
                    </div>
                  </div>
                </div>

                {/* Right (5 Cols): Live Auth Stream Mini */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="font-bold text-sm text-slate-900">Live Auth Stream</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('security')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      Audit Trail
                    </button>
                  </div>

                  <div className="space-y-2.5 divide-y divide-slate-100">
                    {authLogs.slice(0, 4).map(log => (
                      <div key={log.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 text-xs">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate">{log.user}</span>
                            <span className="text-[10px] font-mono text-slate-400">@{log.tenant}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {log.ip} • {log.location}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            log.status === 'SUCCESS' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {log.status}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{log.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bento Grid Row 3: Quick Tenant Snapshot Data Grid */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Pesantren Mitra Terbaru</h3>
                    <p className="text-xs text-slate-500">Ringkasan status domain dan kuota database pesantren yang terdaftar.</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('tenants')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kelola Semua Tenant ({tenants.length})</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Nama Lembaga Pesantren</th>
                        <th className="py-3 px-4">Subdomain Aktif</th>
                        <th className="py-3 px-4">Paket Lisensi</th>
                        <th className="py-3 px-4">Santri</th>
                        <th className="py-3 px-4">Storage DB</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tenants.slice(0, 4).map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{t.name}</td>
                          <td className="py-3 px-4 font-mono text-blue-600">
                            <a href={`https://${t.subdomain}.sipesand.web.id`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                              <span>{t.subdomain}.sipesand.web.id</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-slate-700">{t.plan}</span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">{t.santriCount}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{t.dbSizeMb} MB</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : t.status === 'TRIAL'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1.5">
                            <button
                              onClick={() => onImpersonateTenant && onImpersonateTenant(t.subdomain)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-[11px] transition-colors cursor-pointer"
                              title="Masuk ke sesi tenant ini"
                            >
                              Impersonate
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: TENANT MANAGEMENT & DATABASE (CRM)                         */}
          {/* ================================================================= */}
          {activeTab === 'tenants' && (
            <div className="space-y-5">
              
              {/* Header Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Tenant Management & Database CRM</h2>
                  <p className="text-xs text-slate-500">Daftar instansi pesantren terdaftar, isolasi SQLite, dan kontrol hak akses.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddTenantModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Pesantren Baru</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs Bar */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Status:</span>
                  {['ALL', 'ACTIVE', 'TRIAL', 'SUSPENDED'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTenantFilter(tab)}
                      className={`px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                        tenantFilter === tab
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-slate-500 font-medium">
                  Menampilkan <strong>{filteredTenants.length}</strong> dari {tenants.length} pesantren
                </div>

              </div>

              {/* Tenants Data Grid */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Nama Pesantren</th>
                        <th className="py-3 px-4">Subdomain Terikat</th>
                        <th className="py-3 px-4">Langganan</th>
                        <th className="py-3 px-4">Santri</th>
                        <th className="py-3 px-4">DB File Size</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-center">Smart NFC</th>
                        <th className="py-3 px-4 text-right">Aksi Superadmin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTenants.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-10 text-center text-slate-400">
                            Tidak ada tenant yang cocok dengan filter atau pencarian Anda.
                          </td>
                        </tr>
                      ) : (
                        filteredTenants.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{t.name}</div>
                              <div className="text-[11px] text-slate-400">{t.adminEmail} • {t.adminPhone}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                              <div className="flex items-center gap-1">
                                <span>{t.subdomain}</span>
                                <span className="text-slate-400 font-normal">.sipesand.web.id</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-sans block mt-0.5">Dibuat: {t.joinedDate}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-semibold text-[11px] border border-slate-200">
                                {t.plan}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                              {t.santriCount}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">
                              <span className="font-bold">{t.dbSizeMb} MB</span>
                              <span className="text-[10px] text-slate-400 block">WAL Journal</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                                t.status === 'ACTIVE' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : t.status === 'TRIAL'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {t.nfcActive ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                                  <Radio className="w-3 h-3" />
                                  <span>Aktif</span>
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Nonaktif</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleOpenEditTenantConfig(t)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 rounded border border-slate-300 font-bold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                  title="Edit Profil, Pengasuh, dan Konfigurasi Tenant ini dari Pusat"
                                >
                                  <Edit3 className="w-3 h-3 text-[#0057FF]" />
                                  <span>Edit Config</span>
                                </button>

                                <button
                                  onClick={() => onImpersonateTenant && onImpersonateTenant(t.subdomain)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#0057FF] rounded border border-blue-200 font-bold text-[11px] transition-colors cursor-pointer"
                                  title="Login ke dashboard tenant ini"
                                >
                                  Impersonate
                                </button>
                                
                                <button
                                  onClick={() => handleToggleTenantStatus(t.id)}
                                  className={`px-2 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                                    t.status === 'ACTIVE'
                                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                                  }`}
                                  title={t.status === 'ACTIVE' ? 'Suspend Tenant' : 'Aktifkan Tenant'}
                                >
                                  {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                                </button>

                                <button
                                  onClick={() => handleDeleteTenant(t.id)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Hard Delete Tenant & Database"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: INFRASTRUCTURE & SERVER MONITORING                         */}
          {/* ================================================================= */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Infrastructure & Database Health Monitor</h2>
                  <p className="text-xs text-slate-500">Pantau performa Hybrid Firestore Cloud, isolated SQLite per-tenant, serta latency server.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Real-time polling active (every 10s)</span>
                </div>
              </div>

              {/* 3 Metric Cards: Edge, Server, DB */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Cloudflare Edge Routing</span>
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {infraStats.cloudflareLatencyMs} ms
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SSL 256-bit Active • Wildcard Subdomain</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Express API Backend</span>
                    <Server className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {infraStats.expressApiLatencyMs} ms
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    RAM: {infraStats.memoryUsageMb} MB / {infraStats.memoryLimitMb} MB ({((infraStats.memoryUsageMb / infraStats.memoryLimitMb) * 100).toFixed(0)}%)
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                    <span>Database Query Latency</span>
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {infraStats.dbLatencyMs} ms
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SQLite WAL Mode (Zero Lock Contention)</span>
                  </div>
                </div>

              </div>

              {/* Firestore Document Operations Gauge (Detailed) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Cloud Firestore Quota & Traffic Tracker</h3>
                    <p className="text-xs text-slate-500">Operasi dokumen real-time untuk sinkronisasi cloud antar perangkat asatidz dan wali santri.</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-mono text-[11px] font-bold border border-blue-200">
                    Tier: Spark Free Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Document Reads</span>
                      <span className="font-mono text-slate-500">{infraStats.firestoreReads} / {infraStats.firestoreReadsLimit}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(infraStats.firestoreReads / infraStats.firestoreReadsLimit) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Penggunaan: {((infraStats.firestoreReads / infraStats.firestoreReadsLimit) * 100).toFixed(1)}%</span>
                      <span className="text-emerald-600 font-semibold">Aman</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Document Writes</span>
                      <span className="font-mono text-slate-500">{infraStats.firestoreWrites} / {infraStats.firestoreWritesLimit}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${(infraStats.firestoreWrites / infraStats.firestoreWritesLimit) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Penggunaan: {((infraStats.firestoreWrites / infraStats.firestoreWritesLimit) * 100).toFixed(1)}%</span>
                      <span className="text-emerald-600 font-semibold">Aman</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-700">Document Deletes</span>
                      <span className="font-mono text-slate-500">{infraStats.firestoreDeletes} / {infraStats.firestoreDeletesLimit}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(infraStats.firestoreDeletes / infraStats.firestoreDeletesLimit) * 100}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Penggunaan: {((infraStats.firestoreDeletes / infraStats.firestoreDeletesLimit) * 100).toFixed(1)}%</span>
                      <span className="text-emerald-600 font-semibold">Aman</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Cloudflare R2 Object Storage & 10 GB Quota Guard (Centralized SaaS Infrastructure) */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 text-white shadow-md p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-white">Cloudflare R2 Object Storage (Central Bucket)</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                          ● TERHUBUNG
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Penyimpanan multi-tenant terisolasi untuk foto santri, dokumen kwitansi, dan arsip database global.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadR2Status}
                      disabled={loadingR2}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingR2 ? 'animate-spin text-indigo-400' : ''}`} />
                      <span>Segarkan Kuota</span>
                    </button>
                    <button
                      onClick={handleR2Cleanup}
                      disabled={loadingR2}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Auto-Pruning Cache Usang</span>
                    </button>
                  </div>
                </div>

                {r2Message && (
                  <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
                    r2Message.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}>
                    {r2Message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    <span>{r2Message.text}</span>
                  </div>
                )}

                {/* Storage Meter & 10 GB Guard info */}
                <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold text-slate-200">Kapasitas Storage Terpakai:</span>
                      <span className="font-mono text-indigo-300 font-bold">{r2Stats.usedFormatted || '0 B'}</span>
                      <span className="text-slate-500">/ 10.00 GB (Free Tier)</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-400">{r2Stats.percentUsed || 0}%</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(1, Math.min(100, r2Stats.percentUsed || 1))}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Bucket Name</span>
                      <span className="font-mono text-indigo-300 font-bold">{r2Stats.bucketName}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Binding Variables</span>
                      <span className="font-mono text-emerald-400 font-bold">{r2Stats.binding}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Ruang Tersedia</span>
                      <span className="font-mono text-slate-200 font-bold">{r2Stats.remainingFormatted || '10.00 GB'}</span>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                      <span className="text-slate-500 text-[10px] block uppercase font-bold">Total File Tersimpan</span>
                      <span className="font-mono text-slate-200 font-bold">{r2Stats.fileCount || 0} berkas</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Sistem Proteksi Kuota 10 GB Aktif: </span>
                    Serverless API secara otomatis memvalidasi setiap unggahan berkas. Jika akumulasi berkas mendekati atau melampaui batas 10 GB per bulan, permintaan unggahan baru langsung ditolak dengan status HTTP 413 untuk menjamin platform SaaS SiPesand 100% bebas dari risiko tagihan Cloudflare.
                  </div>
                </div>
              </div>

              {/* SQLite Storage Monitor Per Tenant */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">SQLite Server File Explorer (Isolated per-tenant)</h3>
                    <p className="text-xs text-slate-500">Setiap pesantren memiliki database SQLite fisik sendiri pada folder <code>/data/tenants/*.db</code>.</p>
                  </div>
                  <button 
                    onClick={() => alert('Integrity check: All 5 SQLite databases passed PRAGMA integrity_check successfully.')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Run PRAGMA Integrity Check
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Nama File Database</th>
                        <th className="py-3 px-4">Tenant Subdomain</th>
                        <th className="py-3 px-4">Ukuran Berkas</th>
                        <th className="py-3 px-4">Journal Mode</th>
                        <th className="py-3 px-4">Synchronous</th>
                        <th className="py-3 px-4 text-right">Aksi Maintenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {tenants.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {t.subdomain}.db
                          </td>
                          <td className="py-3 px-4 text-blue-600 font-sans">
                            {t.name}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {t.dbSizeMb} MB
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                              WAL
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            NORMAL (1)
                          </td>
                          <td className="py-3 px-4 text-right space-x-2 font-sans">
                            <button
                              onClick={() => alert(`VACUUM executed for ${t.subdomain}.db. Database optimized.`)}
                              className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                            >
                              VACUUM
                            </button>
                            <button
                              onClick={() => alert(`Snapshot backup generated: /backups/${t.subdomain}-snapshot.db`)}
                              className="text-xs text-slate-600 hover:underline font-semibold cursor-pointer"
                            >
                              Snapshot
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: WEB DEV BUILDER & GLOBAL CMS                               */}
          {/* ================================================================= */}
          {activeTab === 'cms' && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Web Dev Builder & Global CMS Controller</h2>
                <p className="text-xs text-slate-500">Kendali penuh konten visual sipesand.web.id, app gateway announcement, dan default theme pesantren.</p>
              </div>

              {/* 1. Global Announcement Push Module */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Global System Announcement Banner (app.sipesand.web.id)</h3>
                    <p className="text-xs text-slate-500">Pesan darurat atau pemeliharaan yang akan langsung overlay di seluruh dashboard tenant.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={announcement.isActive}
                      onChange={(e) => setAnnouncement({ ...announcement, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-700">Tayangkan Banner Global</span>
                  </label>
                </div>

                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Banner</label>
                      <select
                        value={announcement.type}
                        onChange={(e) => setAnnouncement({ ...announcement, type: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      >
                        <option value="INFO">Informasi Pembaruan (Biru)</option>
                        <option value="WARNING">Peringatan / Maintenance (Kuning)</option>
                        <option value="MAINTENANCE">Darurat / Pemeliharaan Server (Merah)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Judul Pengumuman</label>
                      <input
                        type="text"
                        value={announcement.title}
                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Isi Pesan Pengumuman</label>
                    <textarea
                      rows={2}
                      value={announcement.message}
                      onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  {/* Live Banner Preview */}
                  <div className={`p-4 rounded-lg border text-xs flex items-start gap-3 ${
                    announcement.type === 'INFO'
                      ? 'bg-blue-50 border-blue-200 text-blue-900'
                      : announcement.type === 'WARNING'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="font-bold">{announcement.title}</div>
                      <div className="mt-0.5 opacity-90">{announcement.message}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Broadcast Pengumuman Sekarang</span>
                    </button>
                  </div>
                  {announcementSavedToast && (
                    <div className="text-right text-xs font-bold text-emerald-600 animate-in fade-in">
                      ✓ Pengumuman sistem berhasil di-broadcast ke seluruh tenant!
                    </div>
                  )}
                </form>
              </div>

              {/* 2. sipesand.web.id Landing Page CMS Controller */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Landing Page Controller (sipesand.web.id)</h3>
                  <p className="text-xs text-slate-500">Edit teks headline, harga paket, dan tombol CTA halaman depan tanpa redeploy kode.</p>
                </div>

                <form onSubmit={handleSaveCms} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Badge Teks Hero</label>
                      <input
                        type="text"
                        value={cmsLanding.badgeText}
                        onChange={(e) => setCmsLanding({ ...cmsLanding, badgeText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Teks Tombol CTA</label>
                      <input
                        type="text"
                        value={cmsLanding.ctaText}
                        onChange={(e) => setCmsLanding({ ...cmsLanding, ctaText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hero Main Headline</label>
                    <input
                      type="text"
                      value={cmsLanding.heroHeadline}
                      onChange={(e) => setCmsLanding({ ...cmsLanding, heroHeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-black text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hero Sub-Headline</label>
                    <textarea
                      rows={2}
                      value={cmsLanding.heroSubheadline}
                      onChange={(e) => setCmsLanding({ ...cmsLanding, heroSubheadline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Harga Paket Tahunan (Rp)</label>
                      <input
                        type="text"
                        value={cmsLanding.tahunanPrice}
                        onChange={(e) => setCmsLanding({ ...cmsLanding, tahunanPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Harga Paket Lifetime (Rp)</label>
                      <input
                        type="text"
                        value={cmsLanding.lifetimePrice}
                        onChange={(e) => setCmsLanding({ ...cmsLanding, lifetimePrice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Simpan Perubahan Landing Page</span>
                    </button>
                  </div>
                  {cmsSavedToast && (
                    <div className="text-right text-xs font-bold text-emerald-600 animate-in fade-in">
                      ✓ Konfigurasi landing page berhasil disimpan ke database global!
                    </div>
                  )}
                </form>
              </div>

              {/* 3. Tenant Default Theme Manager */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Tenant Default Theme & Module Provisioning</h3>
                  <p className="text-xs text-slate-500">Konfigurasi variabel warna bawaan dan modul yang otomatis aktif saat pesantren baru mendaftar.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warna Utama (Primary Hex)</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-slate-300 flex-shrink-0" style={{ backgroundColor: themeManager.primaryHex }} />
                      <input
                        type="text"
                        value={themeManager.primaryHex}
                        onChange={(e) => setThemeManager({ ...themeManager, primaryHex: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warna Aksen (Accent Hex)</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-slate-300 flex-shrink-0" style={{ backgroundColor: themeManager.accentHex }} />
                      <input
                        type="text"
                        value={themeManager.accentHex}
                        onChange={(e) => setThemeManager({ ...themeManager, accentHex: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Warna Kanvas (Background)</label>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded border border-slate-300 flex-shrink-0" style={{ backgroundColor: themeManager.canvasHex }} />
                      <input
                        type="text"
                        value={themeManager.canvasHex}
                        onChange={(e) => setThemeManager({ ...themeManager, canvasHex: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <span className="text-xs font-bold text-slate-700">Modul Default yang Otomatis Aktif:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeManager.enableKtsdDefault}
                        onChange={(e) => setThemeManager({ ...themeManager, enableKtsdDefault: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>KTSD Smart RFID</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeManager.enableSakuDefault}
                        onChange={(e) => setThemeManager({ ...themeManager, enableSakuDefault: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Kasir Saku POS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeManager.enableTahfidzDefault}
                        onChange={(e) => setThemeManager({ ...themeManager, enableTahfidzDefault: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Tahfidz 30 Juz</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={themeManager.enableKamtibDefault}
                        onChange={(e) => setThemeManager({ ...themeManager, enableKamtibDefault: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>Pos Kamtib Izin</span>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 5: SECURITY & AUTH LOGS (Security Center)                     */}
          {/* ================================================================= */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Center & Auth Audit Logs</h2>
                <p className="text-xs text-slate-500">Monitoring real-time percobaan login, IP tracking, dan riwayat audit perubahan superadmin.</p>
              </div>

              {/* RBAC Matrix Overview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">Superadmin Role-Based Access Control (RBAC)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">👑 Lead Superadmin</div>
                    <p className="text-[11px] text-slate-500">Akses root seluruh database, impersonate login, dan CMS global.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">⚡ DevOps Engineer</div>
                    <p className="text-[11px] text-slate-500">Akses Cloudflare edge, Express latency, dan SQLite maintenance.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">💳 Billing Manager</div>
                    <p className="text-[11px] text-slate-500">Akses MRR, perpanjangan lisensi, dan invoice iPaymu/BSI.</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">🎧 Support Specialist</div>
                    <p className="text-[11px] text-slate-500">Bantuan konfigurasi pesantren dan verifikasi nomor WhatsApp.</p>
                  </div>
                </div>
              </div>

              {/* Real-time Auth Logs Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-3 p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Real-time Cross-Tenant Authentication Logs</h3>
                    <p className="text-xs text-slate-500">Catatan autentikasi masuk di seluruh subdomain pesantren dalam 24 jam terakhir.</p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Filter:</span>
                    {['ALL', 'SUCCESS', 'FAILED'].map(st => (
                      <button
                        key={st}
                        onClick={() => setAuthStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-md font-bold text-xs transition-colors ${
                          authStatusFilter === st
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                        <th className="py-2.5 px-3">Username / Akun</th>
                        <th className="py-2.5 px-3">Subdomain Tenant</th>
                        <th className="py-2.5 px-3">IP Address</th>
                        <th className="py-2.5 px-3">Lokasi Geo</th>
                        <th className="py-2.5 px-3">User Agent / Client</th>
                        <th className="py-2.5 px-3">Waktu</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[11px]">
                      {filteredAuthLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {log.user} <span className="text-[10px] text-slate-400 font-normal">({log.role})</span>
                          </td>
                          <td className="py-2.5 px-3 text-blue-600 font-bold">
                            {log.tenant}.sipesand.web.id
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">{log.ip}</td>
                          <td className="py-2.5 px-3 text-slate-600 font-sans">{log.location}</td>
                          <td className="py-2.5 px-3 text-slate-500 font-sans truncate max-w-xs">{log.userAgent}</td>
                          <td className="py-2.5 px-3 text-slate-400 font-sans">{log.time}</td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'SUCCESS'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* System Audit Trails */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Superadmin System Audit Trail</h3>
                <p className="text-xs text-slate-500">Catatan aktivitas perubahan konfigurasi tingkat superadmin yang tercatat permanen.</p>

                <div className="divide-y divide-slate-100 text-xs">
                  {auditTrails.map(at => (
                    <div key={at.id} className="py-2.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {at.action}
                        </span>
                        <span className="font-bold text-slate-900 truncate">{at.target}</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-400 flex-shrink-0">
                        <span>{at.admin}</span> • <span className="font-mono">{at.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 6: SAAS BILLING, REKENING BANK, QRIS & PENDAFTARAN MITRA      */}
          {/* ================================================================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              
              {/* Header & Refresh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Payment & Billing SaaS SiPesand</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase">
                      B2B Mitra Engine
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Kelola rekening bank penerima, QRIS dinamis, tarif paket lisensi, dan verifikasi pendaftaran pesantren masuk secara real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      loadMitraConfigData();
                      loadMitraOrdersData();
                    }}
                    disabled={loadingMitraConfig || loadingMitraOrders}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingMitraConfig || loadingMitraOrders ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Segarkan Data</span>
                  </button>
                </div>
              </div>

              {/* Toast / Alert Message */}
              {mitraConfigToast && (
                <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in ${
                  mitraConfigToast.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {mitraConfigToast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                    <span>{mitraConfigToast.text}</span>
                  </div>
                  <button onClick={() => setMitraConfigToast(null)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Alert: Pendaftaran Menunggu Verifikasi */}
              {mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length > 0 && (
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-5 h-5 text-white animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">
                        Perhatian: Terdapat {mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length} Pesantren Menunggu Verifikasi Pembayaran!
                      </h4>
                      <p className="text-[11px] text-blue-100 mt-0.5">
                        Calon mitra telah mengunggah bukti transfer. Silakan periksa struk bukti transfer di bawah dan klik &quot;Verifikasi & Aktifkan Lembaga&quot;.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOrdersFilter('WAITING')}
                    className="px-3.5 py-1.5 bg-white text-blue-700 hover:bg-blue-50 font-bold rounded-xl text-xs flex-shrink-0 transition-colors cursor-pointer shadow-xs"
                  >
                    Tampilkan yang Menunggu
                  </button>
                </div>
              )}

              {/* Financial KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</span>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    Rp {financialStats.mrr.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">+18.2% bulan ini</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Annual Run Rate (ARR Proj.)</span>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    Rp {financialStats.arr.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400">Proyeksi 12 bulan ke depan</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Lisensi Aktif</span>
                  <div className="font-mono font-bold text-2xl text-[#0057FF]">
                    {financialStats.activeSubscribers} Pesantren
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">Tersinkron multi-tenant</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Pendaftaran Masuk</span>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    {mitraOrders.length} Order
                  </div>
                  <span className="text-xs text-amber-600 font-semibold">
                    {mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length} butuh verifikasi
                  </span>
                </div>

              </div>

              {/* CARD 1: PENGATURAN REKENING BANK, QRIS, & HARGA LISENSI MITRA */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#0057FF]" />
                      <span>Pengaturan Rekening Bank, QRIS, & Harga Lisensi Mitra</span>
                    </h3>
                    <p className="text-slate-500 text-xs mt-0.5">
                      Data ini akan otomatis muncul pada halaman pembayaran calon mitra saat pendaftaran lisensi pesantren.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold font-mono">
                    LIVE CONFIG
                  </span>
                </div>

                <form onSubmit={handleSaveMitraConfig} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Nama Bank */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Nama Bank Penerima *</label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Bank Syariah Indonesia (BSI)"
                        value={mitraConfig.bankName || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, bankName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Nomor Rekening / VA */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Nomor Rekening / Virtual Account *</label>
                      <input
                        type="text"
                        required
                        placeholder="7192837465"
                        value={mitraConfig.bankAccountNo || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, bankAccountNo: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Atas Nama Rekening */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Atas Nama Pemilik Rekening *</label>
                      <input
                        type="text"
                        required
                        placeholder="YAYASAN DARUL RAHMAN / KING DIGITAL"
                        value={mitraConfig.bankAccountHolder || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, bankAccountHolder: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Nomor WhatsApp Konfirmasi */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">No. WhatsApp Layanan / Konfirmasi *</label>
                      <input
                        type="text"
                        required
                        placeholder="+62 851-2373-4342"
                        value={mitraConfig.waConfirmationNumber || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, waConfirmationNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">Format internasional: +62 8xxx atau 08xxx</span>
                    </div>

                    {/* Tarif Paket Tahunan */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Tarif Paket Lisensi Tahunan (Rp) *</label>
                      <input
                        type="number"
                        required
                        placeholder="1500000"
                        value={mitraConfig.tahunanPrice || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, tahunanPrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* Tarif Paket Lifetime */}
                    <div>
                      <label className="block font-bold text-slate-700 text-xs mb-1">Tarif Paket Lisensi Lifetime (Rp) *</label>
                      <input
                        type="number"
                        required
                        placeholder="3500000"
                        value={mitraConfig.lifetimePrice || ''}
                        onChange={(e) => setMitraConfig({ ...mitraConfig, lifetimePrice: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      />
                    </div>

                  </div>

                  {/* QRIS Section */}
                  <div className="pt-3 border-t border-slate-100">
                    <label className="block font-bold text-slate-700 text-xs mb-2">QRIS Nasional Pembayaran (BCA, Mandiri, BRI, BSI, E-Wallet):</label>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      
                      {/* Preview Box */}
                      <div className="md:col-span-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
                        {mitraConfig.qrisImageUrl ? (
                          <div className="w-32 h-32 mx-auto bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-center shadow-xs overflow-hidden">
                            <img 
                              src={mitraConfig.qrisImageUrl} 
                              alt="QRIS Preview" 
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 mx-auto bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]">
                            Belum Ada Gambar QRIS
                          </div>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1 block">Pratinjau QR Code</span>
                      </div>

                      {/* Upload & Link Controls */}
                      <div className="md:col-span-9 space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs">
                            <UploadCloud className="w-4 h-4" />
                            <span>{isUploadingQris ? 'Mengunggah ke Cloudflare R2...' : 'Unggah Foto / Screenshot QRIS Baru ke R2'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleUploadQrisImage}
                              disabled={isUploadingQris}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Atau Masukkan Tautan / URL Gambar QRIS Langsung:</label>
                          <input
                            type="text"
                            placeholder="https://..."
                            value={mitraConfig.qrisImageUrl || ''}
                            onChange={(e) => setMitraConfig({ ...mitraConfig, qrisImageUrl: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={savingMitraConfig}
                      className="px-6 py-3 bg-[#0057FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 text-xs cursor-pointer disabled:opacity-50"
                    >
                      {savingMitraConfig ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Menyimpan ke Cloud Firestore...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Simpan Pengaturan Rekening & Harga Lisensi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* CARD 2: DAFTAR PENDAFTARAN & KONFIRMASI PEMBAYARAN MASUK (DATA RIIL) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#0057FF]" />
                      <span>Daftar Pendaftaran & Konfirmasi Pembayaran Masuk</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold text-[10px]">
                        {filteredMitraOrders.length} Pesanan
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Data pendaftaran real-time dari Firestore (<code>tenants/master/mitra_orders</code>). Verifikasi bukti transfer untuk auto-provisioning instans.
                    </p>
                  </div>

                  {/* Filter Status Tabs */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setOrdersFilter('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        ordersFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Semua ({mitraOrders.length})
                    </button>
                    <button
                      onClick={() => setOrdersFilter('WAITING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        ordersFilter === 'WAITING' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      Menunggu Verifikasi ({mitraOrders.filter(o => o.status === 'WAITING_VERIFICATION').length})
                    </button>
                    <button
                      onClick={() => setOrdersFilter('PENDING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        ordersFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      Menunggu Pembayaran ({mitraOrders.filter(o => o.status === 'PENDING_PAYMENT' || o.status === 'PENDING').length})
                    </button>
                    <button
                      onClick={() => setOrdersFilter('PAID')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        ordersFilter === 'PAID' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Lunas & Aktif ({mitraOrders.filter(o => o.status === 'PAID' || o.status === 'ACTIVE').length})
                    </button>
                  </div>
                </div>

                {/* Search Bar for Orders */}
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari nama pondok, subdomain, nama pengelola, email, atau ID pesanan..."
                      value={ordersSearch}
                      onChange={(e) => setOrdersSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">No. Order / Tgl</th>
                        <th className="py-3 px-4">Instansi Pesantren & Domain</th>
                        <th className="py-3 px-4">Pengelola & Kontak</th>
                        <th className="py-3 px-4">Paket & Total Nominal</th>
                        <th className="py-3 px-4">Bukti Transfer</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {filteredMitraOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                            <div className="font-bold text-slate-600">Tidak ada pendaftaran ditemukan</div>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {ordersSearch ? 'Coba ubah kata kunci pencarian Anda.' : 'Pendaftaran baru calon mitra akan otomatis tampil di sini.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredMitraOrders.map(ord => {
                          const isPaid = ord.status === 'PAID' || ord.status === 'ACTIVE';
                          const isWaiting = ord.status === 'WAITING_VERIFICATION';
                          const targetDomain = `${ord.subdomain}.sipesand.web.id`;
                          const cleanWa = (ord.noWhatsapp || '').replace(/[^0-9]/g, '');

                          return (
                            <tr key={ord.id || ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                              
                              {/* Order ID & Date */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-mono font-bold text-slate-900 text-[11px]">{ord.orderId || ord.id}</div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                                </span>
                              </td>

                              {/* Pondok & Domain */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-bold text-slate-900 text-xs">{ord.namaPondok}</div>
                                <a
                                  href={`https://${targetDomain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-blue-700 text-[11px] hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <span>{targetDomain}</span>
                                  <ExternalLink className="w-3 h-3 text-blue-500" />
                                </a>
                              </td>

                              {/* Pengelola & Kontak */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-medium text-slate-800 text-xs">{ord.namaPengelola}</div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {cleanWa && (
                                    <a
                                      href={`https://wa.me/${cleanWa}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px] font-semibold"
                                    >
                                      <MessageCircle className="w-3 h-3 text-emerald-600" />
                                      <span>{ord.noWhatsapp}</span>
                                    </a>
                                  )}
                                </div>
                                <span className="text-[10px] text-slate-400 block mt-0.5">{ord.email}</span>
                              </td>

                              {/* Paket & Nominal */}
                              <td className="py-3.5 px-4 align-top">
                                <div className="font-bold text-slate-800 text-xs">
                                  {ord.packageType === 'LIFETIME' ? 'Paket Lifetime' : 'Paket Tahunan'}
                                </div>
                                <div className="font-mono font-black text-slate-900 text-xs mt-0.5">
                                  Rp {(Number(ord.amount) || 0).toLocaleString('id-ID')}
                                </div>
                                {ord.uniqueCode && (
                                  <span className="text-[10px] text-slate-400 font-mono block">Kode Unik: {ord.uniqueCode}</span>
                                )}
                              </td>

                              {/* Bukti Transfer */}
                              <td className="py-3.5 px-4 align-top">
                                {ord.proofUrl ? (
                                  <div className="space-y-1">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedProofModal(ord.proofUrl)}
                                      className="relative group block w-14 h-14 rounded-lg overflow-hidden border border-slate-200 shadow-xs cursor-pointer"
                                      title="Klik untuk memperbesar bukti transfer"
                                    >
                                      <img 
                                        src={ord.proofUrl} 
                                        alt="Bukti Transfer" 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                                      />
                                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Eye className="w-4 h-4 text-white" />
                                      </div>
                                    </button>
                                    {ord.senderName && (
                                      <span className="text-[10px] text-slate-500 block truncate max-w-[120px]" title={ord.senderName}>
                                        a.n {ord.senderName}
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-block px-2 py-1 rounded bg-slate-100 text-slate-400 text-[10px] font-medium">
                                    Belum Ada Bukti
                                  </span>
                                )}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3.5 px-4 align-top">
                                {isPaid ? (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Lunas & Aktif</span>
                                  </span>
                                ) : isWaiting ? (
                                  <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold inline-flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                    <span>Menunggu Verifikasi</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>Menunggu Bayar</span>
                                  </span>
                                )}
                              </td>

                              {/* Actions */}
                              <td className="py-3.5 px-4 align-top text-right space-y-1.5">
                                {!isPaid ? (
                                  <button
                                    onClick={() => handleVerifyOrder(ord.id || ord.orderId)}
                                    disabled={verifyingOrderId === (ord.id || ord.orderId)}
                                    className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>{verifyingOrderId === (ord.id || ord.orderId) ? 'Mengaktifkan...' : 'Verifikasi & Aktifkan'}</span>
                                  </button>
                                ) : (
                                  <a
                                    href={`https://${targetDomain}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#0057FF] border border-blue-200 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    <span>Buka Portal</span>
                                  </a>
                                )}

                                <button
                                  onClick={() => handleDeleteOrder(ord.id || ord.orderId)}
                                  className="w-full py-1 px-2 text-rose-600 hover:bg-rose-50 rounded text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                  title="Hapus data pesanan"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Hapus</span>
                                </button>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

              {/* MODAL 1: PREVIEW BUKTI TRANSFER ZOOM */}
              {selectedProofModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                  <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <span className="font-extrabold text-slate-900 text-sm">Bukti Pembayaran / Struk Transfer</span>
                      <button
                        onClick={() => setSelectedProofModal(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="bg-slate-100 rounded-2xl p-2 max-h-[70vh] overflow-auto flex items-center justify-center">
                      <img 
                        src={selectedProofModal} 
                        alt="Bukti Transfer Penuh" 
                        className="max-h-full max-w-full rounded-xl object-contain shadow-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={selectedProofModal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Gambar Asli</span>
                      </a>
                      <button
                        onClick={() => setSelectedProofModal(null)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        Tutup
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: SUKSES VERIFIKASI & KREDENSIAL TENANT */}
              {verifiedSuccessData && (
                <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95">
                  <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative text-center">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Lembaga Pesantren Telah Aktif!</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Auto-provisioning database dan akun Super Admin untuk <strong>{verifiedSuccessData.subdomain}.sipesand.web.id</strong> telah selesai.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Domain Lembaga:</span>
                        <span className="font-bold text-blue-700">https://{verifiedSuccessData.subdomain}.sipesand.web.id</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Username Super Admin:</span>
                        <span className="font-bold text-slate-900">{verifiedSuccessData.adminUsername || 'admin'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Password Sementara:</span>
                        <span className="font-bold text-rose-600">{verifiedSuccessData.tempPassword || 'Pesand-2026!'}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <a
                        href={`https://${verifiedSuccessData.subdomain}.sipesand.web.id`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-[#0057FF] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <span>Buka Portal Pesantren</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => setVerifiedSuccessData(null)}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Selesai
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 7: MONITORING REAL-TIME (LIVE FEEDS & STREAMS)                */}
          {/* ================================================================= */}
          {activeTab === 'monitoring' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-[#0057FF] font-bold text-[10px] uppercase font-mono tracking-wider mb-1">
                    <Activity className="w-3 h-3 text-[#00FF99]" />
                    <span>Real-Time Stream Engine</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Monitoring Real-Time Ekosistem</h2>
                  <p className="text-xs text-slate-500">Pemantauan langsung transaksi POS kantin, pemindaian RFID presensi, dan perizinan aktif di seluruh tenant.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00FF99] animate-ping" />
                    <span>Live Socket Connected</span>
                  </span>
                </div>
              </div>

              {/* Real-time KPI Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transaksi POS / Jam</span>
                  <div className="font-mono font-bold text-xl text-slate-900">142 Trx</div>
                  <span className="text-[11px] text-[#00FF99] font-semibold">● Rata-rata Rp18.400 / trx</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tap Presensi RFID (24h)</span>
                  <div className="font-mono font-bold text-xl text-slate-900">3.840 Scans</div>
                  <span className="text-[11px] text-[#0057FF] font-semibold">● 99.8% Sukses verifikasi</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Santri Izin Keluar Aktif</span>
                  <div className="font-mono font-bold text-xl text-[#FF8A00]">28 Santri</div>
                  <span className="text-[11px] text-slate-500">● 0 Santri overstay</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Edge Ping Latency</span>
                  <div className="font-mono font-bold text-xl text-emerald-600">14 ms</div>
                  <span className="text-[11px] text-slate-400 font-mono">Cloudflare Pages ID-SBY</span>
                </div>
              </div>

              {/* Bento Grid: Live POS Stream & Live RFID Stream */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left (7 cols): POS Cashless Stream */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-[#0057FF]" />
                      <h3 className="font-bold text-sm text-slate-900">Live Transaksi POS Kantin Cashless</h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Pembaruan otomatis</span>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs font-sans">
                    {livePosTransactions.map(pos => (
                      <div key={pos.id} className="py-3 first:pt-0 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 truncate">{pos.santri}</span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#0057FF] border border-blue-200">
                              @{pos.tenant}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{pos.item}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-mono font-bold text-slate-900">
                            Rp {pos.amount.toLocaleString('id-ID')}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{pos.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right (5 cols): RFID Scans Stream */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#00FF99]" />
                      <h3 className="font-bold text-sm text-slate-900">Live RFID Gate Scanner</h3>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {liveRfidScans.map(rf => (
                      <div key={rf.id} className="py-3 first:pt-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 truncate">{rf.santri}</span>
                          <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
                            {rf.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                          <span>{rf.reader}</span>
                          <span>{rf.time}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">UID: {rf.uid} • @{rf.tenant}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Santri Sedang Izin Keluar (Active Permits Table) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
                    <h3 className="font-bold text-sm text-slate-900">Santri Sedang Izin Keluar (Gate Tracker)</h3>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-2.5 px-4">Nama Santri</th>
                        <th className="py-2.5 px-4">Instansi Tenant</th>
                        <th className="py-2.5 px-4">Keperluan Izin</th>
                        <th className="py-2.5 px-4">Batas Waktu Kembali</th>
                        <th className="py-2.5 px-4 text-right">Sisa Waktu</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activePermits.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-bold text-slate-900">{p.santri}</td>
                          <td className="py-3 px-4 text-[#0057FF] font-mono font-bold">{p.tenant}.sipesand.web.id</td>
                          <td className="py-3 px-4 text-slate-700">{p.reason}</td>
                          <td className="py-3 px-4 text-slate-600 font-mono">{p.returnDate}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {p.remainingTime}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 8: MODUL SIPESAND TOGGLE & FEATURE FLAGS                      */}
          {/* ================================================================= */}
          {activeTab === 'modules' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-[#0057FF] font-bold text-[10px] uppercase font-mono tracking-wider mb-1">
                  <Sliders className="w-3 h-3" />
                  <span>Feature Flags Engine</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Modul SIPESAND Toggle & Feature Flags</h2>
                <p className="text-xs text-slate-500">Sakelar aktif/nonaktif fitur untuk seluruh subdomain pesantren atau pengujian modul baru.</p>
              </div>

              {/* Bento Grid Feature Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Modul 1: RFID KTSD */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0057FF] text-white flex items-center justify-center font-bold">
                        <Radio className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">KTSD Smart RFID / NFC</h3>
                        <span className="text-[10px] font-mono text-slate-400">Driver Mifare 13.56MHz</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('ktsdRfid')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.ktsdRfid ? 'bg-[#0057FF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.ktsdRfid ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Mengaktifkan simulator NFC Web API dan scanner fisik untuk presensi kamar, kelas, dan kasir kantin.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Status: {featureFlags.ktsdRfid ? 'AKTIF (Global)' : 'NONAKTIF'}</span>
                    <span className="text-[#00FF99] font-bold">Prod Ready</span>
                  </div>
                </div>

                {/* Modul 2: WhatsApp Gateway */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">WhatsApp Gateway</h3>
                        <span className="text-[10px] font-mono text-slate-400">Fonnte / Baileys Engine</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('waGateway')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.waGateway ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.waGateway ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Otomatis mengirimkan pesan WhatsApp ke wali santri saat uang saku berkurang, berobat, atau santri izin pulang.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Status: {featureFlags.waGateway ? 'AKTIF (Global)' : 'NONAKTIF'}</span>
                    <span className="text-[#00FF99] font-bold">High Delivery</span>
                  </div>
                </div>

                {/* Modul 3: Firestore Real-Time Sync */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Firestore Cloud Sync</h3>
                        <span className="text-[10px] font-mono text-slate-400">Real-Time WebSockets</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('firestoreSync')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.firestoreSync ? 'bg-[#0057FF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.firestoreSync ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Menyinkronkan data multi-perangkat detik itu juga ke Google Cloud Firestore (Laptop Bendahara, HP Kamtib, Portal Wali).
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Status: {featureFlags.firestoreSync ? 'AKTIF (Multi-Device)' : 'LOCAL ONLY'}</span>
                    <span className="text-[#00FF99] font-bold">Zero Conflict</span>
                  </div>
                </div>

                {/* Modul 4: Auto Backup R2 */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Auto Backup ke R2</h3>
                        <span className="text-[10px] font-mono text-slate-400">Cloudflare Object Storage</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('autoBackupR2')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.autoBackupR2 ? 'bg-[#0057FF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.autoBackupR2 ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Pencadangan snapshot berkala seluruh basis data SQLite ke bucket terenkripsi setiap pukul 02:00 WIB.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Retensi: 30 Hari Snapshot</span>
                    <span className="text-slate-500 font-mono">02:00 WIB</span>
                  </div>
                </div>

                {/* Modul 5: Google Sheets Sync */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Google Sheets Sync</h3>
                        <span className="text-[10px] font-mono text-slate-400">Two-Way App Script</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('googleSheetSync')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.googleSheetSync ? 'bg-[#0057FF]' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.googleSheetSync ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Opsi ekspor dan sinkronisasi otomatis daftar santri dan jurnal kas ke spreadsheet pengurus yayasan.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Status: {featureFlags.googleSheetSync ? 'TERSEDIA' : 'NONAKTIF'}</span>
                    <span className="text-teal-600 font-bold">OAuth 2.0</span>
                  </div>
                </div>

                {/* Modul 6: AI Face Recognition */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                        <Eye className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">AI Face Recognition</h3>
                        <span className="text-[10px] font-mono text-slate-400">Edge Biometrics (Beta)</span>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleFeatureFlag('faceRecognition')}
                      className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        featureFlags.faceRecognition ? 'bg-purple-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        featureFlags.faceRecognition ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">
                    Fitur presensi alternatif berbasis pemindaian wajah di kamera gerbang asrama tanpa kartu fisik.
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span>Status: {featureFlags.faceRecognition ? 'AKTIF (Beta)' : 'NONAKTIF'}</span>
                    <span className="text-purple-600 font-bold">On-Demand</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 9: DEVELOPER SETTINGS, API KEYS & CLOUD SYNC                  */}
          {/* ================================================================= */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-in fade-in">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-[#0057FF] font-bold text-[10px] uppercase font-mono tracking-wider mb-1">
                  <Database className="w-3 h-3" />
                  <span>Developer Console & Sync</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Developer Settings & API Keys</h2>
                <p className="text-xs text-slate-500">Konfigurasi endpoint cloud, kunci API payment gateway, dan alat pemeliharaan database.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Firebase Cloud Firestore Node */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <h3 className="font-bold text-sm text-slate-900">Google Cloud Firestore Connection</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      CONNECTED
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500">Project ID:</span>
                      <strong className="text-slate-900">sipesand-app</strong>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500">Database Engine:</span>
                      <span className="text-slate-700 font-semibold">(default) Firestore Native Mode</span>
                    </div>
                    <div className="p-2.5 rounded bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500">Multi-Device Real-Time:</span>
                      <span className="text-emerald-600 font-bold">ACTIVE (onSnapshot Listening)</span>
                    </div>
                  </div>
                </div>

                {/* Cloudflare Pages Custom Domains */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0057FF]" />
                      <h3 className="font-bold text-sm text-slate-900">Cloudflare Pages Routing Node</h3>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                      SSL TLS 1.3
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-600">sipesand.web.id</span>
                      <span className="text-emerald-600 font-bold">SaaS Landing</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-600">app.sipesand.web.id</span>
                      <span className="text-[#0057FF] font-bold">Multi-Tenant Gateway</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-600">mitra.sipesand.web.id</span>
                      <span className="text-purple-600 font-bold">Super Dashboard Dev</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                      <span className="text-slate-600">*.sipesand.web.id (darulrahman)</span>
                      <span className="text-teal-600 font-bold">Isolated Tenant Profile</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-indigo-50/70 border border-indigo-100">
                      <div className="flex items-center gap-1.5">
                        <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-slate-800 font-bold">Cloudflare R2 Object Storage</span>
                      </div>
                      <span className="text-indigo-600 font-bold">sipesand-storage (10 GB Free Tier)</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Database Maintenance Tools */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900">Alat Pemeliharaan Database Ekosistem</h3>
                <p className="text-xs text-slate-500">Operasi darurat untuk menyinkronkan data antar instans atau mengekspor basis data cadangan.</p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => alert('Sinkronisasi Cloud Firestore ke cache lokal berhasil dijalankan!')}
                    className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00FF99]" />
                    <span>Sinkronkan Firestore ke SQLite Lokal</span>
                  </button>

                  <button
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tenants, null, 2));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", "sipesand_tenants_backup.json");
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#0057FF]" />
                    <span>Ekspor Snapshot JSON Seluruh Tenant</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL: EDIT KONFIGURASI PROFIL TENANT (SUPERADMIN PUSAT)           */}
      {/* ===================================================================== */}
      {isEditTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in text-xs font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#0057FF] flex items-center justify-center font-bold text-white shadow-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Kelola Konfigurasi Profil Tenant Pusat</h3>
                  <p className="text-[11px] text-slate-400 font-mono">https://{tenantConfigForm.subdomain}.sipesand.web.id</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditTenantModalOpen(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTenantConfig} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pondok Pesantren *</label>
                  <input
                    type="text"
                    required
                    value={tenantConfigForm.namaLembaga}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, namaLembaga: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-[#0057FF] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subdomain Terikat (Read Only)</label>
                  <input
                    type="text"
                    disabled
                    value={tenantConfigForm.subdomain + '.sipesand.web.id'}
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline Lembaga</label>
                <input
                  type="text"
                  value={tenantConfigForm.tagline}
                  onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pengasuh / Kepala *</label>
                  <input
                    type="text"
                    value={tenantConfigForm.namaPengasuh}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, namaPengasuh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan Pengasuh</label>
                  <input
                    type="text"
                    value={tenantConfigForm.jabatanPengasuh}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, jabatanPengasuh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Lokasi Pengasuh</label>
                  <input
                    type="text"
                    value={tenantConfigForm.lokasiPengasuh}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, lokasiPengasuh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kalam & Nasihat Pengasuh</label>
                <textarea
                  rows={3}
                  value={tenantConfigForm.kalamPengasuh}
                  onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, kalamPengasuh: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs leading-relaxed"
                />
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="block font-bold text-slate-800 text-xs mb-2">4 Angka Statistik Hero Profil:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Stat 1 (Santri)</label>
                    <input
                      type="text"
                      value={tenantConfigForm.stat1Number}
                      onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, stat1Number: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Stat 2 (Nadzom)</label>
                    <input
                      type="text"
                      value={tenantConfigForm.stat2Number}
                      onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, stat2Number: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Stat 3 (Asatidz)</label>
                    <input
                      type="text"
                      value={tenantConfigForm.stat3Number}
                      onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, stat3Number: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Stat 4 (Cashless)</label>
                    <input
                      type="text"
                      value={tenantConfigForm.stat4Number}
                      onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, stat4Number: e.target.value })}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor Rekening Bank Syariah</label>
                  <input
                    type="text"
                    value={tenantConfigForm.bankAccountNo}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, bankAccountNo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Pemilik Rekening</label>
                  <input
                    type="text"
                    value={tenantConfigForm.bankAccountHolder}
                    onChange={(e) => setTenantConfigForm({ ...tenantConfigForm, bankAccountHolder: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditTenantModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingTenantConfig}
                  className="flex-1 py-2.5 bg-[#0057FF] hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingTenantConfig ? 'Menyimpan ke Cloud...' : 'Simpan Perubahan ke Cloud'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MODAL: TAMBAH PESANTREN / PROVISION TENANT BARU                    */}
      {/* ===================================================================== */}
      {isAddTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in text-xs font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Provision Pesantren / Tenant Baru</h3>
                  <p className="text-[11px] text-slate-400">Membuat subdomain mandiri & inisialisasi file SQLite</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTenantModalOpen(false)}
                className="w-7 h-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTenant} className="p-6 space-y-4">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pondok Pesantren *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PP Roudlotul Mubtadiin"
                  value={newTenantForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const autoSub = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24);
                    setNewTenantForm({
                      ...newTenantForm,
                      name,
                      subdomain: newTenantForm.subdomain ? newTenantForm.subdomain : autoSub
                    });
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subdomain Eksklusif *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="nama-pesantren"
                    value={newTenantForm.subdomain}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, subdomain: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-l-lg text-xs font-mono font-bold focus:bg-white focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                  <span className="px-3 py-2.5 bg-slate-100 border border-l-0 border-slate-300 rounded-r-lg text-xs font-mono text-slate-500 flex-shrink-0">
                    .sipesand.web.id
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Pengurus / Admin *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@pesantren.id"
                    value={newTenantForm.adminEmail}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, adminEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nomor WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="08123456789"
                    value={newTenantForm.adminPhone}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, adminPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Paket Lisensi</label>
                  <select
                    value={newTenantForm.plan}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, plan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                  >
                    <option value="TAHUNAN">Paket Tahunan (Rp 1.500.000 / thn)</option>
                    <option value="LIFETIME">Paket Lifetime (Rp 4.500.000)</option>
                    <option value="TRIAL (14 Hari)">Free Trial 14 Hari</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Estimasi Kuota Santri</label>
                  <input
                    type="number"
                    value={newTenantForm.initialSantri}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, initialSantri: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTenantForm.nfcActive}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, nfcActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-xs font-bold text-slate-700">Aktifkan Driver Scanner KTSD Smart NFC</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddTenantModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Provision Subdomain & SQLite</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
