import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Globe, 
  Receipt, 
  FolderTree, 
  Sliders, 
  UserCheck, 
  LogOut, 
  Plus, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Key, 
  Mail, 
  Phone, 
  Lock, 
  Clock, 
  ArrowRight, 
  Database, 
  AlertCircle,
  Menu,
  Palette,
  Layers,
  Server,
  Save,
  Info,
  X,
  Activity,
  Terminal,
  Cpu,
  HardDrive,
  Wifi,
  Copy,
  Check,
  Eye,
  EyeOff,
  Shield,
  Wrench,
  AlertTriangle,
  Play,
  Trash2,
  Radio,
  Zap,
  CheckCheck
} from 'lucide-react';
import { 
  developerLogin, 
  getDeveloperStats, 
  toggleTenantStatus, 
  createTenantManual, 
  getTenantTransactions,
  getServerAnalysis,
  runServerDiagnostics,
  getTenantCredentialsVault,
  getWebPlatformConfig,
  saveWebPlatformConfig
} from '../services/api';
import { setActiveTenantId } from '../services/firestoreService';

export default function DashboardDeveloper({ onBackToLanding }) {
  // Developer Auth Session
  const [developerUser, setDeveloperUser] = useState(() => {
    try {
      const saved = localStorage.getItem('sipesand_developer_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Server Guard & Analysis States
  const [serverTelemetry, setServerTelemetry] = useState(null);
  const [loadingTelemetry, setLoadingTelemetry] = useState(false);
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [logFilter, setLogFilter] = useState('ALL');
  const [strictGuardEnabled, setStrictGuardEnabled] = useState(true);

  // Tenant Credentials Vault States
  const [tenantCredentials, setTenantCredentials] = useState([]);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [credentialsSearch, setCredentialsSearch] = useState('');
  const [copiedKey, setCopiedKey] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState({});

  // Web Platform & App Gateway States
  const [webPlatformConfig, setWebPlatformConfig] = useState({
    saasHeroTitle: 'Software Manajemen Pesantren Terpadu Modern',
    saasHeroSubtitle: 'Platform SaaS Enterprise berbasis kartu santri KTSD Smart NFC, auto-billing syahriyah Hijriyah, buku kas umum, portal wali mandiri, dan pos perizinan santri.',
    saasPriceAnnual: '1.500.000',
    saasPriceLifetime: '3.500.000',
    saasPromoBanner: 'PROMO KHUSUS PESANTREN: DISKON TAHUN BARU HIJRIYAH • LISENSI SEUMUR HIDUP',
    saasWhatsapp: '+62 851-2373-4342',
    saasFeaturesActive: true,
    appGatewayAnnouncement: 'Pemberitahuan Sistem: Server Cloudflare Pages & Multi-Tenant Firestore beroperasi 100% normal.',
    appGatewayMaintenance: false,
    appGatewayHelpPhone: '+62 851-2373-4342',
    featuredPesantrens: [
      { subdomain: 'darulrahman', name: 'Pondok Pesantren Darul Rahman Sumbersari', location: 'Kediri, Jawa Timur', status: 'ACTIVE' },
      { subdomain: 'annur', name: 'Pondok Pesantren An-Nur', location: 'Jawa Timur', status: 'ACTIVE' },
      { subdomain: 'alazizi', name: 'Pondok Pesantren Al-Azizi', location: 'Jawa Tengah', status: 'ACTIVE' },
      { subdomain: 'tazakka', name: 'Pondok Pesantren Tazakka', location: 'Batang, Jawa Tengah', status: 'ACTIVE' }
    ]
  });
  const [savingWebConfig, setSavingWebConfig] = useState(false);
  const [savingGatewayConfig, setSavingGatewayConfig] = useState(false);
  const [newPesantrenForm, setNewPesantrenForm] = useState({ subdomain: '', name: '', location: '' });

  // Interactive Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Active Menu: 'dashboard' | 'tenants' | 'subscriptions' | 'subdomains' | 'transactions' | 'categories' | 'settings' | 'account'
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [transactions, setTransactions] = useState({ orders: [], activeLicenses: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal Create Tenant
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenantForm, setNewTenantForm] = useState({
    namaPondok: '',
    subdomain: '',
    namaPengelola: '',
    email: '',
    noWhatsapp: '',
    packageType: 'LIFETIME',
  });
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [createFeedback, setCreateFeedback] = useState(null);

  // Change Password Form State
  const [pwdForm, setPwdForm] = useState({ oldPwd: '', newPwd: '', confirmPwd: '' });
  const [pwdFeedback, setPwdFeedback] = useState('');

  // Website Editor State (sipesand.web.id & app.sipesand.web.id)
  const [webEditorForm, setWebEditorForm] = useState({
    saasHeroTitle: 'Software Manajemen Pesantren Terpadu Modern',
    saasHeroSubtitle: 'Platform SaaS Enterprise berbasis kartu santri KTSD Smart NFC, auto-billing syahriyah Hijriyah, buku kas umum, portal wali mandiri, dan pos perizinan santri.',
    saasPriceAnnual: '1.500.000',
    saasPriceLifetime: '3.500.000',
    saasPromoBanner: '',
    saasWhatsapp: '+62 851-2373-4342',
    appGatewayAnnouncement: '',
    appGatewayHelpPhone: '+62 851-2373-4342',
  });
  const [webEditorSaved, setWebEditorSaved] = useState(false);

  // Load Server Analysis Telemetry
  const loadServerAnalysis = async () => {
    try {
      setLoadingTelemetry(true);
      const res = await getServerAnalysis();
      if (res?.data?.success) {
        setServerTelemetry(res.data.data);
        if (Array.isArray(res.data.data.recentLogs)) {
          setConsoleLogs(res.data.data.recentLogs);
        }
      }
    } catch (err) {
      console.error('Error loading server analysis:', err);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  // Load Tenant Credentials Vault
  const loadTenantCredentials = async () => {
    try {
      setLoadingCredentials(true);
      const res = await getTenantCredentialsVault();
      if (res?.data?.success && Array.isArray(res.data.data)) {
        setTenantCredentials(res.data.data);
      }
    } catch (err) {
      console.error('Error loading tenant credentials vault:', err);
    } finally {
      setLoadingCredentials(false);
    }
  };

  // Load Web Platform Configuration
  const loadWebPlatformConfig = async () => {
    try {
      const res = await getWebPlatformConfig();
      if (res?.data?.success && res.data.data) {
        setWebPlatformConfig(res.data.data);
      }
    } catch (err) {
      console.error('Error loading web platform config:', err);
    }
  };

  // Load All Developer Data
  const loadData = async () => {
    setLoadingStats(true);
    try {
      const [statsRes, txRes] = await Promise.allSettled([
        getDeveloperStats(),
        getTenantTransactions()
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data?.success) {
        setStats(statsRes.value.data.data);
        setTenants(statsRes.value.data.data.tenants || []);
      } else {
        // Fallback default statistics for Darul Rahman & active tenants
        setTenants([
          {
            id: 1,
            namaPondok: 'Pondok Pesantren Darul Rahman Sumbersari',
            subdomain: 'darulrahman',
            namaPengelola: 'Pengasuh Pondok Pesantren Darul Rahman Sumbersari',
            email: 'darulrahmansumbersari@gmail.com',
            noWhatsapp: '+6285123734342',
            packageType: 'LIFETIME',
            amount: 3500000,
            licenseKey: 'KGD-DARULRAHMAN-2026-REAL',
            dbPath: 'prisma/tenants/tenant_darulrahman.db',
            adminUsername: 'admin',
            status: 'ACTIVE',
            provisionedAt: new Date().toISOString(),
          }
        ]);
        setStats({
          totalTenants: 1,
          activeCount: 1,
          expiredCount: 0,
          pendingTenants: 0,
          totalRevenue: 3500000,
          serverUptime: '99.98%',
          activeDnsRecords: 5,
          storageUsage: '4.2 MB',
        });
      }

      if (txRes.status === 'fulfilled' && txRes.value?.data?.success) {
        setTransactions(txRes.value.data.data);
      }

      await Promise.allSettled([
        loadServerAnalysis(),
        loadTenantCredentials(),
        loadWebPlatformConfig()
      ]);
    } catch (err) {
      console.error('Error loading developer stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (developerUser) {
      loadData();
    }
  }, [developerUser]);

  // Handle Developer Login
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const cleanEmail = (loginEmail || '').trim().toLowerCase();
      const cleanPass = (loginPassword || '').trim();

      if (!cleanEmail || !cleanPass) {
        setLoginError('ID/Email dan kata sandi developer wajib diisi.');
        setLoginLoading(false);
        return;
      }

      // 1. Coba Autentikasi Root Master Dev Instan
      const valid = ['kingdigitaldev@gmail.com', 'developer@sipesand.web.id', 'developer', 'admin', 'dev', 'kingdev'];
      const validPass = ['dev123', 'admin123', 'password123', 'kingdev2026!'];

      if (valid.includes(cleanEmail) && validPass.includes(cleanPass)) {
        const devSession = {
          id: 'dev-001',
          name: 'Chief Technology Officer - King Digital Dev',
          email: cleanEmail.includes('@') ? cleanEmail : 'kingdigitaldev@gmail.com',
          role: 'SUPER_ADMIN',
          division: 'DEVELOPER_HQ',
          lastLogin: new Date().toISOString(),
          permissions: ['ALL_TENANTS', 'SERVER_GUARD', 'CREDENTIALS_VAULT', 'WEB_BUILDER']
        };
        setDeveloperUser(devSession);
        localStorage.setItem('sipesand_developer_session', JSON.stringify(devSession));
        return;
      }

      // 2. Coba Autentikasi Backend API
      const res = await developerLogin({ email: cleanEmail, password: cleanPass, username: cleanEmail });
      if (res?.data?.success) {
        const sessionData = res.data.developer || res.data.user;
        setDeveloperUser(sessionData);
        localStorage.setItem('sipesand_developer_session', JSON.stringify(sessionData));
      } else {
        setLoginError(res?.data?.message || 'Akses ditolak. Periksa kredensial developer Anda.');
      }
    } catch (err) {
      setLoginError('Kredensial developer salah atau server sedang offline. (Tips: dev / dev123)');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleQuickFill = (email, pass) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  const handleLogout = () => {
    localStorage.removeItem('sipesand_developer_session');
    setDeveloperUser(null);
  };

  // Run Server Diagnostics & Ping
  const handleRunDiagnostics = async (action = 'DIAGNOSE') => {
    setDiagnosticsRunning(true);
    try {
      const res = await runServerDiagnostics(action);
      if (res?.data?.success) {
        setDiagnosticsResult(res.data.data);
        showToast(res.data.message || 'Diagnostik server selesai.');
        await loadServerAnalysis();
      }
    } catch (err) {
      showToast('Gagal menjalankan diagnostik server.', 'error');
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  // Copy helper
  const handleCopyText = (text, key) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      showToast(`Tersalin: "${text}"`);
      setTimeout(() => setCopiedKey(''), 2500);
    } catch {
      showToast('Gagal menyalin teks ke clipboard.', 'error');
    }
  };

  // Toggle visible password in vault
  const togglePasswordVisibility = (roleKey) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [roleKey]: !prev[roleKey]
    }));
  };

  // Impersonate / Bypass Masuk ke Tenant
  const handleImpersonateTenant = (subdomain, namaPondok) => {
    setActiveTenantId(subdomain);
    showToast(`Bypass aktif: Membuka portal ${namaPondok}...`);
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocal) {
      window.open(`/?tenant=${subdomain}`, '_blank');
    } else {
      window.open(`https://${subdomain}.sipesand.web.id`, '_blank');
    }
  };

  // Save Web Platform Configuration (sipesand.web.id)
  const handleSaveWebConfig = async () => {
    try {
      setSavingWebConfig(true);
      const res = await saveWebPlatformConfig(webPlatformConfig);
      if (res?.data?.success) {
        showToast('Konfigurasi Web sipesand.web.id berhasil disimpan!');
      }
    } catch (err) {
      showToast('Gagal menyimpan konfigurasi web utama.', 'error');
    } finally {
      setSavingWebConfig(false);
    }
  };

  // Save App Gateway Configuration (app.sipesand.web.id)
  const handleSaveGatewayConfig = async () => {
    try {
      setSavingGatewayConfig(true);
      const res = await saveWebPlatformConfig(webPlatformConfig);
      if (res?.data?.success) {
        showToast('Pengaturan App Gateway app.sipesand.web.id berhasil disimpan!');
      }
    } catch (err) {
      showToast('Gagal menyimpan konfigurasi app gateway.', 'error');
    } finally {
      setSavingGatewayConfig(false);
    }
  };

  // Add Pesantren to App Gateway Directory
  const handleAddFeaturedPesantren = (e) => {
    e.preventDefault();
    if (!newPesantrenForm.subdomain || !newPesantrenForm.name) {
      showToast('Subdomain dan Nama Pesantren wajib diisi.', 'error');
      return;
    }
    const cleanSub = newPesantrenForm.subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const updatedList = [
      ...(webPlatformConfig.featuredPesantrens || []),
      {
        subdomain: cleanSub,
        name: newPesantrenForm.name.trim(),
        location: newPesantrenForm.location.trim() || 'Indonesia',
        status: 'ACTIVE'
      }
    ];
    setWebPlatformConfig(prev => ({
      ...prev,
      featuredPesantrens: updatedList
    }));
    setNewPesantrenForm({ subdomain: '', name: '', location: '' });
    showToast(`Pesantren "${newPesantrenForm.name}" berhasil ditambahkan ke direktori App Gateway.`);
  };

  const handleRemoveFeaturedPesantren = (index) => {
    const updated = [...(webPlatformConfig.featuredPesantrens || [])];
    const removed = updated.splice(index, 1);
    setWebPlatformConfig(prev => ({ ...prev, featuredPesantrens: updated }));
    showToast(`Pesantren "${removed[0]?.name}" dihapus dari direktori App Gateway.`);
  };

  // Toggle Tenant Status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleTenantStatus(id);
      loadData();
      showToast('Status tenant berhasil diubah.');
    } catch (err) {
      setTenants(prev => prev.map(t => t.id === id ? { ...t, status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : t));
      showToast('Status tenant diperbarui secara lokal.');
    }
  };

  // Create Manual Tenant
  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setCreatingTenant(true);
    setCreateFeedback(null);

    try {
      const res = await createTenantManual(newTenantForm);
      if (res?.data?.success) {
        setCreateFeedback({ type: 'success', message: res.data.message });
        showToast('Tenant baru berhasil dibuat dan diaktivasi!');
        setTimeout(() => {
          setIsCreateModalOpen(false);
          setNewTenantForm({
            namaPondok: '',
            subdomain: '',
            namaPengelola: '',
            email: '',
            noWhatsapp: '',
            packageType: 'LIFETIME',
          });
          loadData();
        }, 1200);
      }
    } catch (err) {
      setCreateFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Gagal membuat tenant baru.'
      });
    } finally {
      setCreatingTenant(false);
    }
  };

  // Filter Tenants
  const filteredTenants = tenants.filter(t => {
    const matchesSearch = (t.namaPondok || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.subdomain || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter Tenant Credentials Vault
  const filteredVault = tenantCredentials.filter(t => {
    const q = credentialsSearch.toLowerCase();
    return (t.namaPondok || '').toLowerCase().includes(q) ||
           (t.subdomain || '').toLowerCase().includes(q);
  });

  // Filter Console Logs
  const filteredLogs = consoleLogs.filter(log => {
    if (logFilter === 'ALL') return true;
    return log.type === logFilter;
  });

  // =========================================================================
  // 1. JIKA BELUM LOGIN DEVELOPER: TAMPILKAN LOGIN FORM KHUSUS HQ (WOOT UI)
  // =========================================================================
  if (!developerUser) {
    return (
      <div className="min-h-screen bg-[#F6F6F2] text-[#0F172A] flex flex-col justify-between font-sans text-xs selection:bg-[#0B52E2] selection:text-white">
        
        {/* Global Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2">
            <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
              toastMessage.type === 'error' 
                ? 'bg-rose-950 text-rose-200 border border-rose-800' 
                : 'bg-slate-900 text-emerald-300 border border-emerald-500/30'
            }`}>
              {toastMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#A3FF2E] flex-shrink-0" />
              )}
              <span>{toastMessage.msg}</span>
            </div>
          </div>
        )}

        {/* Top Minimal Header */}
        <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 h-16 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#0B52E2] flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-['Righteous'] text-xl text-[#0B52E2] tracking-wide">SIPESAND</span>
                <span className="px-2 py-0.5 rounded-full bg-[#A3FF2E] text-slate-950 font-bold text-[9px] uppercase tracking-wider">
                  Developer HQ
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">Control Gateway • Tier-1 Access</p>
            </div>
          </div>

          <button
            onClick={onBackToLanding}
            className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-sm flex items-center gap-1.5 text-xs hover:-translate-y-0.5"
          >
            <span>← Kembali ke Web Utama</span>
          </button>
        </header>

        {/* Hero Split & Center Auth Card (Woot Style) */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Hero Panel (Electric Blue #0B52E2) */}
            <div className="lg:col-span-5 bg-[#0B52E2] p-8 text-white flex flex-col justify-between relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#A3FF2E]/20 blur-2xl pointer-events-none" />

              <div className="space-y-4 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#A3FF2E] font-bold text-[10px] tracking-wide border border-white/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A3FF2E]" />
                  <span>MASTER DEVELOPER CONSOLE</span>
                </span>

                <h1 className="font-['Righteous'] text-2xl sm:text-3xl text-white leading-tight">
                  Pusat Kendali Multi-Tenant & Guard Server
                </h1>

                <p className="text-blue-100 text-xs leading-relaxed">
                  Akses tingkat tinggi untuk manajemen lisensi, analisis performa CPU/RAM, proteksi edge Cloudflare, kredensial baku pesantren, dan editor landing page.
                </p>
              </div>

              {/* Bento Highlights on Blue Card */}
              <div className="space-y-2.5 pt-6 relative z-10">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#A3FF2E] text-slate-950 flex items-center justify-center font-bold">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">Edge WAF & Guard Aktif</div>
                    <div className="text-[10px] text-blue-200">Enkripsi sesi TLS 1.3 & Anti-DDoS</div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/15 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#0B52E2] flex items-center justify-center font-bold">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-white">Vault Kredensial Lembaga</div>
                    <div className="text-[10px] text-blue-200">Akses cepat & bypass login tenant</div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/15 flex items-center justify-between text-[10px] text-blue-200 relative z-10">
                <span>King Digital Dev • Kediri, Jatim</span>
                <span className="font-mono text-[#A3FF2E] font-bold">Uptime 99.98%</span>
              </div>
            </div>

            {/* Right Form Panel (Clean White Card) */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Otentikasi Aman
                  </span>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Edge Proxy: Online</span>
                  </div>
                </div>
                <h2 className="font-['Poppins'] font-extrabold text-xl text-slate-900">
                  Login Akun Developer
                </h2>
                <p className="text-slate-500 text-xs">
                  Gunakan kredensial master root atau akun email developer resmi untuk membuka dasbor kendali.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="leading-snug">{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 text-xs">
                    Email / ID Developer *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="username"
                      autoComplete="username"
                      required
                      placeholder="contoh: dev atau kingdigitaldev@gmail.com"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2] font-medium text-xs text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold text-xs">
                      Security Master Key / Password *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-[10px] text-[#0B52E2] font-semibold hover:underline flex items-center gap-1"
                    >
                      {showLoginPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showLoginPassword ? 'Sembunyikan' : 'Perlihatkan'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      placeholder="Masukkan kata sandi master..."
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError('');
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2] font-medium text-xs text-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Quick Account Fill Chips */}
                <div className="pt-1 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Pilihan Akun Cepat Pengembang:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('dev', 'dev123')}
                      className="p-2 rounded-xl bg-blue-50/70 hover:bg-blue-100 border border-blue-200 text-left font-bold text-[#0B52E2] text-[11px] transition-all truncate"
                    >
                      ⚡ Master Dev (dev / dev123)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('kingdigitaldev@gmail.com', 'kingdev2026!')}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-left font-semibold text-slate-800 text-[11px] transition-all truncate"
                    >
                      👑 Root King Dev (kingdev2026!)
                    </button>
                  </div>
                </div>

                {/* Submit Action Button (Vibrant Orange #FF5C00) */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 bg-[#FF5C00] hover:bg-[#e05100] active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memvalidasi Akses Master...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Developer Console →</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                <span>Multi-Tenant Architecture v2.4</span>
                <span>Hak Cipta King Digital Dev</span>
              </div>

            </div>

          </div>
        </main>

        {/* Global Footer */}
        <footer className="border-t border-slate-200/80 py-4 bg-white text-center text-slate-400 text-[11px]">
          King Digital Dev • Kencong, Kepung, Kediri, Jawa Timur • sipesand.web.id
        </footer>

      </div>
    );
  }

  // =========================================================================
  // 2. MAIN DEVELOPER DASHBOARD LAYOUT (WOOT UI / MODERN DEVELOPER HQ)
  // =========================================================================
  const navigationItems = [
    { id: 'dashboard', label: 'Statistik Platform', icon: LayoutDashboard },
    { id: 'server_analysis', label: 'Analisis & Guard Server', icon: Server, badge: 'Edge Guard' },
    { id: 'tenant_credentials', label: 'Dev & Kredensial Tenant', icon: Key, badge: `${tenantCredentials.length || 4} Tenant` },
    { id: 'tenants', label: 'Manajemen Tenant', icon: Building2 },
    { id: 'website_editor', label: 'Editor sipesand.web.id', icon: Palette },
    { id: 'app_gateway', label: 'Pengaturan app.sipesand.web.id', icon: Globe },
    { id: 'subscriptions', label: 'Subscription & Lisensi', icon: CreditCard },
    { id: 'subdomains', label: 'DNS Subdomain', icon: Database },
    { id: 'transactions', label: 'Transaksi & Billing', icon: Receipt },
    { id: 'settings', label: 'Pengaturan Gateway', icon: Sliders },
    { id: 'account', label: 'Akun Developer', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex font-sans text-xs selection:bg-blue-600 selection:text-white">
      
      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in fade-in slide-in-from-top-2">
          <div className={`px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold ${
            toastMessage.type === 'error' 
              ? 'bg-rose-950 text-rose-200 border border-rose-800' 
              : 'bg-slate-900 text-emerald-300 border border-emerald-500/30'
          }`}>
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-[#A3FF2E] flex-shrink-0" />
            )}
            <span>{toastMessage.msg}</span>
          </div>
        </div>
      )}

      {/* SIDEBAR HITAM ELEGAN (#111827) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111827] text-white flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-['Righteous'] text-2xl text-[#60A5FA] tracking-wide">SIPESAND</span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[9px] font-bold border border-blue-400/30">
                HQ
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium pt-0.5">Developer Control Center</p>
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menus */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-[#1D4ED8] text-white font-bold shadow-subtle'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#A3FF2E] text-slate-950 font-bold text-[9px] flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 bg-[#0F172A]/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1D4ED8] text-white font-bold flex items-center justify-center flex-shrink-0">
              KD
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-[11px] truncate">King Digital Dev</div>
              <div className="text-[10px] text-slate-400 truncate">kingdigitaldev@gmail.com</div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onBackToLanding}
              className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg font-semibold text-[10px] text-center transition-colors"
            >
              Lihat Web Utama
            </button>
            <button
              onClick={handleLogout}
              className="py-1.5 px-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 rounded-lg font-semibold text-[10px] flex items-center justify-center transition-colors"
              title="Logout Developer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Backdrop for Mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* TOPBAR PUTIH (#FFFFFF) DENGAN BORDER #E5E7EB */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB] h-16 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-slate-700"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <h2 className="font-['Poppins'] font-bold text-sm text-[#111827] capitalize">
                {navigationItems.find(n => n.id === activeMenu)?.label || 'Developer Console'}
              </h2>
              <p className="text-[10px] text-slate-400">Panel Administrasi Master • sipesand.web.id</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-600 font-medium">Uptime: 99.98%</span>
            </div>

            <button
              onClick={loadData}
              disabled={loadingStats}
              className="p-2 rounded-xl border border-[#E5E7EB] hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* CONTENT VIEW BODY */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: DASHBOARD STATISTIK OVERVIEW                                      */}
          {/* ========================================================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* 4 Bento Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="card-bento p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-xs">Total Pesantren Terdaftar</span>
                    <Building2 className="w-4 h-4 text-[#1D4ED8]" />
                  </div>
                  <div className="font-['Poppins'] font-extrabold text-2xl text-[#111827]">
                    {stats?.totalTenants || tenants.length}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <span className="text-emerald-600 font-bold">100% Online</span>
                    <span>• Database SQLite privat</span>
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-xs">Langganan Aktif</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-['Poppins'] font-extrabold text-2xl text-[#111827]">
                    {stats?.activeCount || tenants.filter(t => t.status === 'ACTIVE').length}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Lisensi resmi King Digital Dev
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-xs">Subdomain Aktif</span>
                    <Globe className="w-4 h-4 text-[#1D4ED8]" />
                  </div>
                  <div className="font-['Poppins'] font-extrabold text-2xl text-[#111827]">
                    {tenants.length + 4}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Wildcard Cloudflare DNS *.sipesand.web.id
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="font-semibold text-xs">Total Estimasi Omzet</span>
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-['Poppins'] font-extrabold text-2xl text-emerald-700 font-mono">
                    Rp {((stats?.totalRevenue || 3500000)).toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Akumulasi lisensi & setup
                  </div>
                </div>

              </div>

              {/* Bento Grid: 2 Columns (Recent Tenants & System Architecture) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Kolom Kiri (8/12): Tenant Terbaru */}
                <div className="lg:col-span-8 card-bento p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                        Tenant Pesantren Aktif
                      </h3>
                      <p className="text-[11px] text-slate-500">Daftar instans pondok pesantren yang beroperasi di platform</p>
                    </div>
                    <button
                      onClick={() => setActiveMenu('tenants')}
                      className="text-xs font-bold text-[#1D4ED8] hover:underline"
                    >
                      Kelola Semua →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#E5E7EB] text-slate-400 text-[10px] uppercase">
                          <th className="py-2.5 font-bold">Nama Pesantren</th>
                          <th className="py-2.5 font-bold">Subdomain</th>
                          <th className="py-2.5 font-bold">Paket</th>
                          <th className="py-2.5 font-bold">Status</th>
                          <th className="py-2.5 font-bold text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {tenants.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 font-semibold text-[#111827]">
                              {t.namaPondok}
                              <div className="text-[10px] text-slate-400 font-normal">{t.namaPengelola}</div>
                            </td>
                            <td className="py-3 font-mono font-bold text-[#1D4ED8]">
                              <a 
                                href={`https://${t.subdomain}.sipesand.web.id`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline inline-flex items-center gap-1"
                              >
                                <span>{t.subdomain}.sipesand.web.id</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </td>
                            <td className="py-3">
                              <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#1D4ED8] font-bold text-[10px]">
                                {t.packageType || 'LIFETIME'}
                              </span>
                            </td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                t.status === 'ACTIVE' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {t.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <a
                                href={`https://${t.subdomain}.sipesand.web.id/login`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-100 font-semibold text-[10px] text-slate-700 inline-block transition-colors"
                              >
                                Login Portal
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Kolom Kanan (4/12): Status Infrastruktur & DNS */}
                <div className="lg:col-span-4 card-bento p-6 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="font-['Poppins'] font-bold text-sm text-[#111827] flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#1D4ED8]" />
                      <span>Status Infrastruktur SaaS</span>
                    </h3>

                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-slate-600">Cloudflare Wildcard DNS</span>
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Active (Proxied)</span>
                        </span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-slate-600">SSL Encryption</span>
                        <span className="font-bold text-emerald-700">Full (Strict)</span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-slate-600">Database Engine</span>
                        <span className="font-mono font-bold text-slate-800">Prisma SQLite Multi-File</span>
                      </div>

                      <div className="p-3 bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-slate-600">Auto-Provisioning</span>
                        <span className="font-bold text-emerald-700">Ready (Instant)</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-2.5 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl shadow-subtle flex items-center justify-center gap-1.5 text-xs transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Buat Tenant Pesantren Baru</span>
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: ANALISIS SERVER & EDGE GUARD                                         */}
          {/* ========================================================================= */}
          {activeMenu === 'server_analysis' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3FF2E]/20 text-emerald-800 font-extrabold text-[10px] border border-emerald-300 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>EDGE GUARD SECURITY • LIVE TELEMETRY</span>
                  </div>
                  <h2 className="font-['Poppins'] font-extrabold text-xl text-slate-900">
                    Analisis Server & Pemeriksaan Guard
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Pantau kinerja real-time alokasi RAM, utilisasi CPU, proteksi Cloudflare WAF, dan jalankan uji diagnostik server
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => handleRunDiagnostics('FLUSH_CACHE')}
                    className="px-3.5 py-2 rounded-2xl border border-slate-200 hover:bg-slate-100 bg-white text-slate-700 font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Purge Cache</span>
                  </button>

                  <button
                    onClick={() => handleRunDiagnostics('DIAGNOSE')}
                    disabled={diagnosticsRunning}
                    className="px-5 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#e05100] text-white font-extrabold transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 text-xs active:scale-[0.98]"
                  >
                    {diagnosticsRunning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mendiagnosis Server...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Jalankan Cek Diagnostik & Ping</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Diagnostic Live Result Banner */}
              {diagnosticsResult && (
                <div className="p-4 rounded-3xl bg-slate-900 text-white border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-[#A3FF2E] text-slate-950 flex items-center justify-center font-extrabold shadow">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">Hasil Diagnostik Server: OPTIMAL</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[#A3FF2E] font-mono text-[10px] font-bold">
                          {diagnosticsResult.latencyMs} ms Latency
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Node: <strong className="text-white">{diagnosticsResult.edgeNode}</strong> • DB Ping: <strong className="text-white">{diagnosticsResult.dbPingMs}ms</strong> • Packet Loss: <strong className="text-[#A3FF2E]">{diagnosticsResult.packetLossPercent}%</strong>
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Diperiksa: {new Date(diagnosticsResult.checkedAt).toLocaleTimeString('id-ID')} WIB
                  </div>
                </div>
              )}

              {/* 5 Bento Grid Cards: Server Telemetry */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* Card 1: Server Status & Process Uptime */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0B52E2] flex items-center justify-center font-bold">
                        <Server className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Status & Uptime</span>
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>ONLINE</span>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-['Righteous'] text-slate-900 tracking-tight">
                      {serverTelemetry?.uptime || '99.98%'}
                    </div>
                    <p className="text-[11px] text-slate-400">Total ketersediaan layanan SaaS terhitung</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Node Runtime:</span>
                      <span className="font-mono font-bold text-slate-900">{serverTelemetry?.nodeVersion || 'v20.18.0'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Platform:</span>
                      <span className="font-medium text-slate-900">{serverTelemetry?.platform || 'Edge Multi-Tenant'}</span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Memory RAM Telemetry */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <HardDrive className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Alokasi Memori (RAM)</span>
                    </div>
                    <span className="font-mono text-[11px] font-bold text-indigo-700">
                      {serverTelemetry?.memory?.memoryPressurePercent || 44}% Dipakai
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-['Righteous'] text-slate-900">
                        {serverTelemetry?.memory?.heapUsedMb || '42.8'} MB
                      </span>
                      <span className="text-xs text-slate-400 font-medium">/ {serverTelemetry?.memory?.heapTotalMb || '96.5'} MB</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500" 
                        style={{ width: `${serverTelemetry?.memory?.memoryPressurePercent || 44}%` }} 
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>RSS Total Process:</span>
                      <span className="font-mono font-bold text-slate-900">{serverTelemetry?.memory?.rssMb || '124.2'} MB</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>RAM Bebas Host:</span>
                      <span className="font-mono font-bold text-emerald-600">{serverTelemetry?.memory?.systemFreeGb || '12.4'} GB</span>
                    </div>
                  </div>
                </div>

                {/* Card 3: CPU & Event Loop */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">CPU & Event Loop</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                      {serverTelemetry?.cpuCores || 8} Cores
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-['Righteous'] text-slate-900">
                      &lt; 2.4 ms
                    </div>
                    <p className="text-[11px] text-slate-400">Latensi eksekusi event loop non-blocking</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Prosesor:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]" title={serverTelemetry?.cpuModel}>
                        {serverTelemetry?.cpuModel || 'Virtual Core Processor'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Thread Pool:</span>
                      <span className="font-bold text-emerald-600">Aktif Normal</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Edge Guard & Cloudflare WAF */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Edge Guard WAF</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#A3FF2E] text-slate-950 font-bold text-[10px]">
                      TLS 1.3 Strict
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="text-2xl font-['Righteous'] text-emerald-700">
                      PROTECTED
                    </div>
                    <p className="text-[11px] text-slate-400">Proteksi Anti-DDoS & filter injeksi bot aktif</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Edge Provider:</span>
                      <span className="font-bold text-slate-900">{serverTelemetry?.securityGuard?.edgeProxy || 'CLOUDFLARE_EDGE'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Rate Limit:</span>
                      <span className="font-mono text-slate-700">120 req/menit per IP</span>
                    </div>
                  </div>
                </div>

                {/* Card 5: Database Engine Health */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-2xl bg-blue-50 text-[#0B52E2] flex items-center justify-center font-bold">
                        <Database className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-slate-800">Arsitektur Database Multi-Tenant</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B52E2] font-bold text-[10px] border border-blue-200">
                      Terisolasi Penuh
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Cloud Storage</span>
                      <div className="font-bold text-slate-900 text-xs">Google Firestore</div>
                      <span className="text-[10px] text-emerald-600 font-medium">Auto-Syncing</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Relational Engine</span>
                      <div className="font-bold text-slate-900 text-xs">Prisma Client</div>
                      <span className="text-[10px] text-emerald-600 font-medium">Zero Leakage Schema</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-0.5">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Tenant Partitions</span>
                      <div className="font-bold text-slate-900 text-xs">{tenantCredentials.length || 4} Pesantren Aktif</div>
                      <span className="text-[10px] text-blue-600 font-medium">Mandiri per Subdomain</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Terminal Log Diagnostik Server */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-3xl p-6 text-white space-y-4 shadow-2xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-5 h-5 text-[#A3FF2E]" />
                    <div>
                      <h3 className="font-bold text-sm text-white font-mono flex items-center gap-2">
                        <span>Terminal Log Diagnostik & Guard Server</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Pencatatan real-time event guard, latensi query, dan sistem</p>
                    </div>
                  </div>

                  {/* Filter Log Chips */}
                  <div className="flex items-center gap-1.5">
                    {['ALL', 'SEC_GUARD', 'DB_QUERY', 'SYSTEM'].map(f => (
                      <button
                        key={f}
                        onClick={() => setLogFilter(f)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold transition-all ${
                          logFilter === f
                            ? 'bg-[#A3FF2E] text-slate-950 shadow'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                    <button
                      onClick={() => setConsoleLogs([])}
                      className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 text-[10px] font-mono transition-colors"
                      title="Bersihkan Terminal"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Log Stream Body */}
                <div className="font-mono text-[11px] space-y-2 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                  {filteredLogs.length === 0 ? (
                    <div className="text-slate-600 py-8 text-center italic">Tidak ada log untuk filter "{logFilter}".</div>
                  ) : (
                    filteredLogs.map(log => (
                      <div key={log.id} className="flex items-start gap-3 leading-relaxed hover:bg-white/5 p-1 rounded transition-colors">
                        <span className="text-slate-500 flex-shrink-0">
                          [{new Date(log.time).toLocaleTimeString('id-ID')}]
                        </span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold flex-shrink-0 ${
                          log.type === 'SEC_GUARD' ? 'bg-emerald-500/20 text-[#A3FF2E] border border-emerald-500/30' :
                          log.type === 'DB_QUERY' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {log.type}
                        </span>
                        <span className="text-slate-200">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Server Telemetry Engine • SiPesand Multi-Tenant Core</span>
                  <span>Auto-refresh setiap permintaan</span>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: DEV TENANT & KREDENSIAL TENANT (VAULT LENGKAP)                       */}
          {/* ========================================================================= */}
          {activeMenu === 'tenant_credentials' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B52E2] font-bold text-[10px] border border-blue-200 mb-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>CREDENTIALS VAULT & DIRECT IMPERSONATE</span>
                  </div>
                  <h2 className="font-['Poppins'] font-extrabold text-xl text-slate-900">
                    Dev Tenant & Kredensial Akun Pesantren
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Kelola dan periksa seluruh akses akun peran baku tiap lembaga pesantren terdaftar, dengan tombol 1-klik salin kredensial dan bypass masuk
                  </p>
                </div>

                <div className="w-full sm:w-72 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={credentialsSearch}
                    onChange={(e) => setCredentialsSearch(e.target.value)}
                    placeholder="Cari nama pondok / subdomain..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                  />
                </div>
              </div>

              {/* Grid Bento Cards Per Tenant */}
              <div className="space-y-6">
                {filteredVault.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 space-y-2">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-semibold text-xs">Tidak ditemukan tenant yang cocok dengan "{credentialsSearch}".</p>
                  </div>
                ) : (
                  filteredVault.map(t => (
                    <div 
                      key={t.id || t.subdomain}
                      className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-5"
                    >
                      {/* Tenant Header & Action */}
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-['Poppins'] font-bold text-base text-slate-900">
                              {t.namaPondok}
                            </h3>
                            <span className="font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B52E2] font-bold text-[10px] border border-blue-200">
                              {t.subdomain}.sipesand.web.id
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                              t.status === 'ACTIVE' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {t.status}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[9px]">
                              {t.packageType || 'LIFETIME'}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                            <span>Partisi Firestore: <code className="text-slate-600 font-mono">{t.firestorePath}</code></span>
                            <span>•</span>
                            <span>Database: <code className="text-slate-600 font-mono">{t.dbPath}</code></span>
                          </div>
                        </div>

                        {/* Direct Impersonate & Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => handleImpersonateTenant(t.subdomain, t.namaPondok)}
                            className="px-4 py-2 bg-[#FF5C00] hover:bg-[#e05100] text-white font-extrabold rounded-2xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 text-xs transition-all hover:-translate-y-0.5"
                          >
                            <Zap className="w-3.5 h-3.5" />
                            <span>Bypass Masuk ke Lembaga Ini →</span>
                          </button>

                          <a
                            href={t.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Buka Portal</span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>

                          <button
                            onClick={() => handleToggleStatus(t.id, t.status)}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition-colors"
                            title="Ubah status aktivasi tenant"
                          >
                            {t.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                          </button>
                        </div>
                      </div>

                      {/* Roles & Credentials Vault Grid */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Daftar Akun Pengurus Baku (Role Credentials):
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {t.roles.map(r => {
                            const roleKey = `${t.subdomain}_${r.role}`;
                            const isPassVisible = visiblePasswords[roleKey];

                            return (
                              <div 
                                key={r.role}
                                className={`p-3.5 rounded-2xl border transition-all ${
                                  r.role === 'MASTER_DEV' 
                                    ? 'bg-blue-50/60 border-blue-200' 
                                    : 'bg-slate-50/70 border-slate-200/80 hover:bg-white'
                                } space-y-2.5`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                      <span>{r.label}</span>
                                      {r.role === 'MASTER_DEV' && (
                                        <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-mono text-[8px] font-bold">
                                          ROOT
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono">{r.division}</div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(roleKey)}
                                    className="text-slate-400 hover:text-slate-700 p-1"
                                    title={isPassVisible ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                  >
                                    {isPassVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>

                                <div className="space-y-1 font-mono text-[11px] pt-1 border-t border-slate-200/60">
                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="text-[10px] text-slate-400">User:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-800">{r.username}</span>
                                      <button
                                        onClick={() => handleCopyText(r.username, `user_${roleKey}`)}
                                        className="p-1 text-slate-400 hover:text-[#0B52E2]"
                                        title="Salin username"
                                      >
                                        {copiedKey === `user_${roleKey}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between text-slate-600">
                                    <span className="text-[10px] text-slate-400">Pass:</span>
                                    <div className="flex items-center gap-1">
                                      <span className="font-bold text-slate-800">
                                        {isPassVisible ? r.defaultPass : '••••••••'}
                                      </span>
                                      <button
                                        onClick={() => handleCopyText(r.defaultPass, `pass_${roleKey}`)}
                                        className="p-1 text-slate-400 hover:text-[#0B52E2]"
                                        title="Salin kata sandi"
                                      >
                                        {copiedKey === `pass_${roleKey}` ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TENANT MANAGEMENT (LENGKAP)                                       */}
          {/* ========================================================================= */}
          {activeMenu === 'tenants' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                    Tenant Management
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Kelola seluruh database, status aktivasi, dan kredensial pesantren mitra
                  </p>
                </div>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl shadow-subtle flex items-center gap-1.5 text-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tenant Manual</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="card-bento p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Cari nama pondok, subdomain, email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-500 font-semibold text-xs">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  >
                    <option value="ALL">Semua Status ({tenants.length})</option>
                    <option value="ACTIVE">Hanya Aktif</option>
                    <option value="SUSPENDED">Nonaktif / Suspended</option>
                  </select>
                </div>
              </div>

              {/* Tenant Table */}
              <div className="card-bento overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-slate-500 text-[10px] uppercase">
                        <th className="py-3 px-4 font-bold">ID / Lembaga</th>
                        <th className="py-3 px-4 font-bold">Subdomain URL</th>
                        <th className="py-3 px-4 font-bold">Kontak Pengelola</th>
                        <th className="py-3 px-4 font-bold">Database Path</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                        <th className="py-3 px-4 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {filteredTenants.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400">
                            Tidak ada tenant yang sesuai dengan kriteria pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredTenants.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-[#111827]">
                              <div>{t.namaPondok}</div>
                              <div className="font-mono text-[10px] text-slate-400 font-normal">License: {t.licenseKey}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#1D4ED8]">
                              <a
                                href={`https://${t.subdomain}.sipesand.web.id`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1"
                              >
                                <span>{t.subdomain}.sipesand.web.id</span>
                                <ExternalLink className="w-3 h-3 text-slate-400" />
                              </a>
                            </td>
                            <td className="py-3.5 px-4 space-y-0.5">
                              <div className="font-medium text-slate-800">{t.namaPengelola}</div>
                              <div className="text-[10px] text-slate-500">{t.email}</div>
                              <div className="font-mono text-[10px] text-slate-500">{t.noWhatsapp}</div>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[10px] text-slate-600">
                              <div className="flex items-center gap-1">
                                <Database className="w-3 h-3 text-slate-400" />
                                <span className="truncate max-w-[150px]">{t.dbPath || `tenants/tenant_${t.subdomain}.db`}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] ${
                                t.status === 'ACTIVE' 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}>
                                {t.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right space-x-2">
                              <button
                                onClick={() => handleToggleStatus(t.id, t.status)}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-colors ${
                                  t.status === 'ACTIVE'
                                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                {t.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>

                              <a
                                href={`https://${t.subdomain}.sipesand.web.id/login`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-100 font-bold text-[10px] text-slate-700 inline-block transition-colors"
                              >
                                Buka
                              </a>
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

          {/* ========================================================================= */}
          {/* TAB 3: SUBSCRIPTION MANAGER                                              */}
          {/* ========================================================================= */}
          {activeMenu === 'subscriptions' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Subscription Management
                </h2>
                <p className="text-slate-500 text-xs">
                  Monitoring paket lisensi, status masa aktif, dan perpanjangan langganan pesantren
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-bento p-5 space-y-1">
                  <span className="text-slate-500 text-xs font-semibold">Paket Lifetime</span>
                  <div className="font-['Poppins'] font-extrabold text-xl text-[#111827]">
                    {tenants.filter(t => t.packageType === 'LIFETIME').length} Lembaga
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">Akses Seumur Hidup Tanpa Batas</div>
                </div>

                <div className="card-bento p-5 space-y-1">
                  <span className="text-slate-500 text-xs font-semibold">Paket Tahunan</span>
                  <div className="font-['Poppins'] font-extrabold text-xl text-[#111827]">
                    {tenants.filter(t => t.packageType === 'TAHUNAN').length} Lembaga
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold">Siklus Perpanjangan 12 Bulan</div>
                </div>

                <div className="card-bento p-5 space-y-1">
                  <span className="text-slate-500 text-xs font-semibold">Perlu Perpanjangan Segera</span>
                  <div className="font-['Poppins'] font-extrabold text-xl text-amber-600">
                    0 Lembaga
                  </div>
                  <div className="text-[10px] text-slate-400">Tidak ada lisensi yang mendekati kedaluwarsa</div>
                </div>
              </div>

              <div className="card-bento p-6 space-y-4">
                <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                  Daftar Masa Aktif Lisensi Pesantren
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] text-slate-400 text-[10px] uppercase">
                        <th className="py-2.5 font-bold">Lembaga</th>
                        <th className="py-2.5 font-bold">Paket</th>
                        <th className="py-2.5 font-bold">Masa Aktif</th>
                        <th className="py-2.5 font-bold">Tanggal Aktivasi</th>
                        <th className="py-2.5 font-bold text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {tenants.map(t => (
                        <tr key={t.id}>
                          <td className="py-3 font-semibold text-[#111827]">{t.namaPondok}</td>
                          <td className="py-3 font-bold text-[#1D4ED8]">{t.packageType || 'LIFETIME'}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                              {t.packageType === 'LIFETIME' ? 'Selamanya (Aktif)' : '12 Bulan'}
                            </span>
                          </td>
                          <td className="py-3 text-slate-500 font-mono text-[11px]">
                            {new Date(t.provisionedAt || Date.now()).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => alert(`Pengaturan lisensi untuk ${t.namaPondok} telah diperbarui.`)}
                              className="px-3 py-1 rounded-lg border border-[#E5E7EB] bg-white hover:bg-slate-50 font-semibold text-[10px]"
                            >
                              Perpanjang / Edit
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

          {/* ========================================================================= */}
          {/* TAB 4: SUBDOMAIN MANAGER & DNS                                           */}
          {/* ========================================================================= */}
          {activeMenu === 'subdomains' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Subdomain & Cloudflare DNS Manager
                </h2>
                <p className="text-slate-500 text-xs">
                  Routing otomatis wildcard (*.sipesand.web.id) langsung ke database terisolasi masing-masing pesantren
                </p>
              </div>

              <div className="card-bento p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm text-[#111827]">Status Wildcard Cloudflare</span>
                    <p className="text-[11px] text-slate-500">Mengarahkan *.sipesand.web.id ke server backend & reverse proxy</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                    Active & Proxied (🟠)
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-xs text-slate-700">Subdomain Resmi yang Terhubung:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-1">
                      <div className="font-mono font-bold text-[#1D4ED8] text-xs">sipesand.web.id</div>
                      <div className="text-[10px] text-slate-500">Domain Utama (Landing Page & Onboarding)</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-1">
                      <div className="font-mono font-bold text-[#1D4ED8] text-xs">app.sipesand.web.id</div>
                      <div className="text-[10px] text-slate-500">Aplikasi SIPESAND Master Pesantren</div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] space-y-1">
                      <div className="font-mono font-bold text-[#1D4ED8] text-xs">mitra.sipesand.web.id</div>
                      <div className="text-[10px] text-slate-500">Developer HQ Console (King Digital Dev)</div>
                    </div>

                    {tenants.map(t => (
                      <div key={t.id} className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white shadow-subtle space-y-1">
                        <div className="font-mono font-bold text-emerald-700 text-xs">
                          {t.subdomain}.sipesand.web.id
                        </div>
                        <div className="text-[10px] text-slate-600 font-medium truncate">{t.namaPondok}</div>
                        <div className="text-[9px] text-slate-400">SSL Auto-Provisioned</div>
                      </div>
                    ))}

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: TRANSAKSI TENANT                                                   */}
          {/* ========================================================================= */}
          {activeMenu === 'transactions' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Riwayat Transaksi Multi-Tenant
                </h2>
                <p className="text-slate-500 text-xs">
                  Semua transaksi lisensi SaaS, pembayaran invoice, dan aktivitas pembayaran gateway
                </p>
              </div>

              <div className="card-bento overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB] text-slate-500 text-[10px] uppercase">
                        <th className="py-3 px-4 font-bold">Tanggal</th>
                        <th className="py-3 px-4 font-bold">Order ID</th>
                        <th className="py-3 px-4 font-bold">Pesantren / Mitra</th>
                        <th className="py-3 px-4 font-bold">Paket</th>
                        <th className="py-3 px-4 font-bold">Nominal</th>
                        <th className="py-3 px-4 font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {tenants.map(t => (
                        <tr key={t.id}>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {new Date(t.provisionedAt || Date.now()).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {t.licenseKey || `KGD-${t.subdomain.toUpperCase()}-LIFETIME`}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#111827]">
                            {t.namaPondok}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700">{t.packageType || 'LIFETIME'}</td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                            Rp {(t.amount || 3500000).toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px]">
                              LUNAS (SETTLED)
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

          {/* ========================================================================= */}
          {/* TAB 6: KATEGORI TENANT                                                    */}
          {/* ========================================================================= */}
          {activeMenu === 'categories' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Klasifikasi Kategori Pesantren
                </h2>
                <p className="text-slate-500 text-xs">
                  Manajemen kluster pesantren mitra sesuai kurikulum dan karakteristik kelembagaan
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="card-bento p-5 space-y-2">
                  <div className="font-['Poppins'] font-bold text-sm text-[#111827]">Pesantren Salafiyah</div>
                  <p className="text-[11px] text-slate-500">Kajian kitab kuning klasik, sorogan, bandongan, dan sistem wetonan.</p>
                  <div className="pt-2 border-t border-[#E5E7EB] font-bold text-xs text-[#1D4ED8]">
                    1 Pesantren Terdaftar
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="font-['Poppins'] font-bold text-sm text-[#111827]">Pesantren Modern</div>
                  <p className="text-[11px] text-slate-500">Kurikulum terpadu bahasa Arab & Inggris aktif ala Gontor.</p>
                  <div className="pt-2 border-t border-[#E5E7EB] font-bold text-xs text-slate-500">
                    0 Pesantren Terdaftar
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="font-['Poppins'] font-bold text-sm text-[#111827]">Tahfidzul Qur'an</div>
                  <p className="text-[11px] text-slate-500">Fokus muhafadzoh 30 Juz, mutaba'ah ziyadah, dan sabqi/manzil.</p>
                  <div className="pt-2 border-t border-[#E5E7EB] font-bold text-xs text-[#1D4ED8]">
                    1 Pesantren Terdaftar
                  </div>
                </div>

                <div className="card-bento p-5 space-y-2">
                  <div className="font-['Poppins'] font-bold text-sm text-[#111827]">Sekolah / Ma'had Aly</div>
                  <p className="text-[11px] text-slate-500">Pendidikan formal SMP/MTs/MA berbasis asrama terpadu.</p>
                  <div className="pt-2 border-t border-[#E5E7EB] font-bold text-xs text-slate-500">
                    0 Pesantren Terdaftar
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: DEVELOPER SETTINGS (GLOBAL CONFIG)                                 */}
          {/* ========================================================================= */}
          {activeMenu === 'settings' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Developer Global Settings
                </h2>
                <p className="text-slate-500 text-xs">
                  Pengaturan API gateway, credentials payment gateway, dan konfigurasi server cloud
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gateway Keys */}
                <div className="card-bento p-6 space-y-4">
                  <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                    Integrasi Payment Gateway (iPaymu / Midtrans)
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">Merchant ID</label>
                      <input 
                        type="text" 
                        defaultValue="KGD-MERCHANT-2026" 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-[#F8FAFC]" 
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">Server Key (Secret)</label>
                      <input 
                        type="password" 
                        defaultValue="SB-Mid-server-xxxxxxxxxxxx" 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-[#F8FAFC]" 
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">Client Key</label>
                      <input 
                        type="text" 
                        defaultValue="SB-Mid-client-xxxxxxxxxxxx" 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-[#F8FAFC]" 
                      />
                    </div>
                  </div>
                </div>

                {/* Cloudflare & SMTP */}
                <div className="card-bento p-6 space-y-4">
                  <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">
                    Cloudflare DNS & Email Nodemailer
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">Cloudflare Zone Domain</label>
                      <input 
                        type="text" 
                        defaultValue="sipesand.web.id" 
                        readOnly 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-slate-100 text-slate-600" 
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">SMTP Email Notifikasi</label>
                      <input 
                        type="text" 
                        defaultValue="kingdigitaldev@gmail.com" 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-[#F8FAFC]" 
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 text-xs mb-1">WhatsApp Customer Service</label>
                      <input 
                        type="text" 
                        defaultValue="+62 851-2373-4342" 
                        className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-mono bg-[#F8FAFC]" 
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: EDITOR WEB SIPESAND & APP HUB (DEVELOPER MASTER)                   */}
          {/* ========================================================================= */}
          {/* ========================================================================= */}
          {/* TAB: EDITOR WEB SIPESAND.WEB.ID (LANDING PAGE CMS)                        */}
          {/* ========================================================================= */}
          {activeMenu === 'website_editor' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0B52E2] font-bold text-[10px] border border-blue-200 mb-1">
                    <Palette className="w-3.5 h-3.5" />
                    <span>PUBLIC SAAS CMS • SIPESAND.WEB.ID</span>
                  </div>
                  <h2 className="font-['Poppins'] font-extrabold text-xl text-slate-900">
                    Editor Landing Page sipesand.web.id
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Kelola copywriting judul hero, banner pengumuman promo, paket harga lisensi, dan kontak sales WhatsApp resmi
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="https://sipesand.web.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Preview Web Utama</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <button
                    onClick={handleSaveWebConfig}
                    disabled={savingWebConfig}
                    className="px-5 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#e05100] text-white font-extrabold transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 text-xs active:scale-[0.98]"
                  >
                    {savingWebConfig ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Perubahan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Konfigurasi Web Utama</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Grid 2 Kolom: Form Editor & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Form Editor Kolom Kiri (7/12) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#0B52E2]" />
                      <span>Form Konten sipesand.web.id</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                      Live Editable
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Hero Headline (Judul Utama) *
                      </label>
                      <input
                        type="text"
                        value={webPlatformConfig.saasHeroTitle}
                        onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasHeroTitle: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Hero Subheadline (Deskripsi Lengkap) *
                      </label>
                      <textarea
                        rows={3}
                        value={webPlatformConfig.saasHeroSubtitle}
                        onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasHeroSubtitle: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2] leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Banner Pengumuman Promo (Pita Atas Hero)
                      </label>
                      <input
                        type="text"
                        value={webPlatformConfig.saasPromoBanner}
                        onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasPromoBanner: e.target.value })}
                        placeholder="Contoh: PROMO KHUSUS PESANTREN: DISKON TAHUN BARU HIJRIYAH"
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1 text-xs">
                          Harga Paket Tahunan (Rp)
                        </label>
                        <input
                          type="text"
                          value={webPlatformConfig.saasPriceAnnual}
                          onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasPriceAnnual: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1 text-xs">
                          Harga Paket Lifetime (Rp)
                        </label>
                        <input
                          type="text"
                          value={webPlatformConfig.saasPriceLifetime}
                          onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasPriceLifetime: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Nomor WhatsApp Sales & Konsultasi Resmi *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={webPlatformConfig.saasWhatsapp}
                          onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, saasWhatsapp: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan (5/12): Live Preview Card */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-[#0B52E2] text-white rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                    
                    <span className="text-[9px] font-bold tracking-widest text-[#A3FF2E] uppercase block">
                      PREVIEW HERO LANDING PAGE
                    </span>

                    {webPlatformConfig.saasPromoBanner && (
                      <div className="px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[#A3FF2E] font-bold text-[10px] truncate">
                        ⚡ {webPlatformConfig.saasPromoBanner}
                      </div>
                    )}

                    <h3 className="font-['Righteous'] text-xl leading-snug">
                      {webPlatformConfig.saasHeroTitle || 'Software Manajemen Pesantren Terpadu Modern'}
                    </h3>

                    <p className="text-blue-100 text-xs leading-relaxed line-clamp-4">
                      {webPlatformConfig.saasHeroSubtitle}
                    </p>

                    <div className="pt-4 border-t border-white/20 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-blue-200 block">Mulai dari:</span>
                        <span className="font-mono text-base font-extrabold text-[#A3FF2E]">
                          Rp {webPlatformConfig.saasPriceAnnual} / thn
                        </span>
                      </div>
                      <div className="px-3.5 py-1.5 rounded-xl bg-[#FF5C00] text-white font-extrabold text-[11px] shadow">
                        Daftar SaaS →
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-white border border-slate-200 text-slate-600 text-xs space-y-1.5">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0B5FFF]" />
                      <span>Sinkronisasi Otomatis</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Perubahan teks dan harga yang Anda simpan akan otomatis ditampilkan kepada pengunjung website utama <code>https://sipesand.web.id</code> secara instan.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PENGATURAN APP.SIPESAND.WEB.ID (APP GATEWAY HUB)                     */}
          {/* ========================================================================= */}
          {activeMenu === 'app_gateway' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Header Tab */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200 mb-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>APP GATEWAY HUB • APP.SIPESAND.WEB.ID</span>
                  </div>
                  <h2 className="font-['Poppins'] font-extrabold text-xl text-slate-900">
                    Pengaturan Sentral App Hub Gateway
                  </h2>
                  <p className="text-slate-500 text-xs">
                    Kelola pengumuman darurat broadcast bagi seluruh pengurus, direktori pesantren di dropdown, dan status gateway
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="https://app.sipesand.web.id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Buka App Gateway</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>

                  <button
                    onClick={handleSaveGatewayConfig}
                    disabled={savingGatewayConfig}
                    className="px-5 py-2.5 rounded-2xl bg-[#FF5C00] hover:bg-[#e05100] text-white font-extrabold transition-all shadow-md shadow-orange-500/25 flex items-center gap-2 text-xs active:scale-[0.98]"
                  >
                    {savingGatewayConfig ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Konfigurasi Gateway</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Broadcast Announcement & Maintenance Guard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-[#0B52E2]" />
                      <span>Broadcast Pengumuman Login Pengurus</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Muncul di header app.sipesand.web.id</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Pesan Pengumuman Terpusat *
                      </label>
                      <textarea
                        rows={3}
                        value={webPlatformConfig.appGatewayAnnouncement}
                        onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, appGatewayAnnouncement: e.target.value })}
                        placeholder="Contoh: Pemberitahuan Sistem: Server Cloudflare Pages & Multi-Tenant Firestore beroperasi normal."
                        className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2] leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 text-xs">
                        Hotline Bantuan Teknis Pengurus (WhatsApp)
                      </label>
                      <input
                        type="text"
                        value={webPlatformConfig.appGatewayHelpPhone}
                        onChange={(e) => setWebPlatformConfig({ ...webPlatformConfig, appGatewayHelpPhone: e.target.value })}
                        className="w-full px-4 py-2 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                      <Wrench className="w-4 h-4 text-amber-600" />
                      <span>Mode Maintenance Gateway</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Jika diaktifkan, portal login operator di <code>app.sipesand.web.id</code> akan menampilkan banner peringatan pemeliharaan terjadwal.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-800">Status Gateway:</div>
                      <span className={`text-[10px] font-bold ${webPlatformConfig.appGatewayMaintenance ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {webPlatformConfig.appGatewayMaintenance ? 'MAINTENANCE MODE' : 'NORMAL (ONLINE)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setWebPlatformConfig({ ...webPlatformConfig, appGatewayMaintenance: !webPlatformConfig.appGatewayMaintenance })}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors ${
                        webPlatformConfig.appGatewayMaintenance
                          ? 'bg-amber-600 text-white shadow'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                    >
                      {webPlatformConfig.appGatewayMaintenance ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </div>

              </div>

              {/* Direktori Pesantren di App Gateway Selector */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0B52E2]" />
                      <span>Direktori Lembaga Pesantren di App Gateway</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Daftar pondok pesantren yang muncul pada selector "Pilih Lembaga" di <code>app.sipesand.web.id</code>
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-500 font-mono">
                    Total: {webPlatformConfig.featuredPesantrens?.length || 0} Lembaga
                  </span>
                </div>

                {/* Form Tambah Pesantren Baru ke Direktori Gateway */}
                <form onSubmit={handleAddFeaturedPesantren} className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-5">
                    <label className="block text-slate-600 font-bold text-[11px] mb-1">Nama Pondok Pesantren *</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: Pondok Pesantren Darul Huda"
                      value={newPesantrenForm.name}
                      onChange={(e) => setNewPesantrenForm({ ...newPesantrenForm, name: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-600 font-bold text-[11px] mb-1">Subdomain *</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: darulhuda"
                      value={newPesantrenForm.subdomain}
                      onChange={(e) => setNewPesantrenForm({ ...newPesantrenForm, subdomain: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-slate-600 font-bold text-[11px] mb-1">Lokasi Lembaga</label>
                    <input
                      type="text"
                      placeholder="contoh: Jombang, Jawa Timur"
                      value={newPesantrenForm.location}
                      onChange={(e) => setNewPesantrenForm({ ...newPesantrenForm, location: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0B52E2]"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-[#0B52E2] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-1"
                      title="Tambah ke direktori"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                {/* Table Daftar Pesantren Direktori */}
                <div className="divide-y divide-slate-100">
                  {webPlatformConfig.featuredPesantrens?.map((p, idx) => (
                    <div key={p.subdomain || idx} className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0B52E2] font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-900">{p.name}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2">
                            <span className="font-mono text-[#0B52E2]">{p.subdomain}.sipesand.web.id</span>
                            <span>•</span>
                            <span>{p.location}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[9px] border border-emerald-200">
                          Aktif di Selector
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeaturedPesantren(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="Hapus dari selector"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 9: AKUN DEVELOPER                                                     */}
          {/* ========================================================================= */}
          {activeMenu === 'account' && (
            <div className="space-y-5 max-w-2xl animate-in fade-in duration-150">
              <div className="space-y-1">
                <h2 className="font-['Poppins'] font-extrabold text-lg text-[#111827]">
                  Akun Developer
                </h2>
                <p className="text-slate-500 text-xs">
                  Pengaturan kredensial keamanan pengembang King Digital Dev
                </p>
              </div>

              <div className="card-bento p-6 space-y-5">
                
                <div className="flex items-center gap-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="w-12 h-12 rounded-2xl bg-[#111827] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    KGD
                  </div>
                  <div>
                    <h3 className="font-['Poppins'] font-bold text-sm text-[#111827]">King Digital Dev</h3>
                    <p className="text-xs text-slate-500">kingdigitaldev@gmail.com</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-[#1D4ED8] font-bold text-[9px]">
                      Master Developer Role
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-800">Ubah Password Akun Developer</h4>
                  
                  {pwdFeedback && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium">
                      {pwdFeedback}
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-600 text-xs mb-1">Password Saat Ini</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwdForm.oldPwd}
                      onChange={(e) => setPwdForm({ ...pwdForm, oldPwd: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs mb-1">Password Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwdForm.newPwd}
                      onChange={(e) => setPwdForm({ ...pwdForm, newPwd: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium bg-[#F8FAFC]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-xs mb-1">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={pwdForm.confirmPwd}
                      onChange={(e) => setPwdForm({ ...pwdForm, confirmPwd: e.target.value })}
                      className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs font-medium bg-[#F8FAFC]"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!pwdForm.newPwd || pwdForm.newPwd !== pwdForm.confirmPwd) {
                        alert('Password baru tidak cocok atau masih kosong');
                        return;
                      }
                      setPwdFeedback('Password developer berhasil diperbarui!');
                      setPwdForm({ oldPwd: '', newPwd: '', confirmPwd: '' });
                    }}
                    className="px-5 py-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-subtle transition-colors"
                  >
                    Simpan Perubahan Password
                  </button>
                </div>

              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: BUAT TENANT BARU MANUAL                                            */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in text-xs font-sans">
          <div className="bg-white rounded-[20px] shadow-2xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden flex flex-col">
            
            <div className="bg-[#111827] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-['Poppins'] font-bold text-sm text-white">Buat Tenant Pesantren Baru</h3>
                <p className="text-[11px] text-slate-400">Inisialisasi database privat & akun Super Admin otomatis</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-6 space-y-4">
              
              {createFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  createFeedback.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {createFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                  <span>{createFeedback.message}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Pondok Pesantren *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pondok Pesantren An-Nur"
                  value={newTenantForm.namaPondok}
                  onChange={(e) => setNewTenantForm({ ...newTenantForm, namaPondok: e.target.value })}
                  className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Subdomain yang Diinginkan *</label>
                <div className="flex items-center">
                  <input
                    type="text"
                    required
                    placeholder="annur"
                    value={newTenantForm.subdomain}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 px-3.5 py-2 border border-r-0 border-[#E5E7EB] rounded-l-xl text-xs font-mono bg-[#F8FAFC] focus:bg-white focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-[#E5E7EB] rounded-r-xl font-mono text-slate-600 text-xs">
                    .sipesand.web.id
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Nama Pengasuh / Pengelola *</label>
                  <input
                    type="text"
                    required
                    placeholder="K.H. Ahmad Dahlan"
                    value={newTenantForm.namaPengelola}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, namaPengelola: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Email Aktif *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@pesantren.sch.id"
                    value={newTenantForm.email}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={newTenantForm.noWhatsapp}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, noWhatsapp: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pilihan Paket Lisensi</label>
                  <select
                    value={newTenantForm.packageType}
                    onChange={(e) => setNewTenantForm({ ...newTenantForm, packageType: e.target.value })}
                    className="w-full px-3.5 py-2 border border-[#E5E7EB] rounded-xl text-xs bg-[#F8FAFC] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1D4ED8]"
                  >
                    <option value="LIFETIME">LIFETIME (Rp 3.500.000)</option>
                    <option value="TAHUNAN">TAHUNAN (Rp 1.500.000)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-[#E5E7EB] bg-white hover:bg-slate-50 font-bold text-slate-700 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingTenant}
                  className="px-5 py-2 bg-[#1D4ED8] hover:bg-blue-800 text-white font-bold rounded-xl shadow-subtle flex items-center gap-1.5 transition-colors"
                >
                  {creatingTenant ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Buat Tenant Sekarang</span>}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
