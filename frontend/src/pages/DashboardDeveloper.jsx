import React, { useState } from 'react';
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
  X
} from 'lucide-react';

export default function DashboardDeveloper({ 
  onLogout, 
  onImpersonateTenant,
  onBackToSaasLanding 
}) {
  // Navigation active tab: 'overview' | 'tenants' | 'infrastructure' | 'cms' | 'security' | 'billing'
  const [activeTab, setActiveTab] = useState('overview');
  const [environment, setEnvironment] = useState('production'); // 'production' | 'staging'
  const [globalSearch, setGlobalSearch] = useState('');

  // ---------------------------------------------------------------------------
  // 1. STATE: TENANT MANAGEMENT (CRM)
  // ---------------------------------------------------------------------------
  const [tenants, setTenants] = useState([
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
  // 5. STATE: SAAS BILLING & FINANCIALS
  // ---------------------------------------------------------------------------
  const [financialStats] = useState({
    mrr: 48500000,
    arr: 582000000,
    activeSubscribers: 128,
    churnRatePercent: 1.4,
    retentionPercent: 98.6,
    totalGrossRevenue: 142000000,
  });

  const [recentTransactions] = useState([
    { id: 'INV-2026-081', tenant: 'PP Al-Falah Modern Tahfidz', package: 'Perpanjangan Lisensi Tahunan', amount: 1500000, date: '08 Sep 2026', gateway: 'BSI Virtual Account', status: 'PAID' },
    { id: 'INV-2026-080', tenant: 'Ma\'had Darussalam Boarding', package: 'Paket Lisensi Tahunan + 500 KTSD Card', amount: 2850000, date: '06 Sep 2026', gateway: 'QRIS Pesantren', status: 'PAID' },
    { id: 'INV-2026-079', tenant: 'Pesantren Nurul Huda Mandiri', package: 'Paket Tahunan 2026/2027', amount: 1500000, date: '01 Sep 2026', gateway: 'Bank Transfer (BSI)', status: 'OVERDUE' },
    { id: 'INV-2026-078', tenant: 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)', package: 'Lisensi Lifetime Multi-Tenant', amount: 4500000, date: '28 Agu 2026', gateway: 'King Digital PG', status: 'PAID' },
  ]);

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

        {/* Navigation Modules */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto text-xs">
          
          <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Control Center
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white font-bold' 
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
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building2 className="w-4 h-4" />
              <span>Tenants CRM</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {tenants.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('infrastructure')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'infrastructure' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Server & DB Monitor</span>
          </button>

          <button
            onClick={() => setActiveTab('cms')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'cms' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Web Dev Builder (CMS)</span>
          </button>

          <div className="pt-4 px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Enterprise Governance
          </div>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Auth Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors text-left ${
              activeTab === 'billing' 
                ? 'bg-blue-600 text-white font-bold' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>SaaS Financials & MRR</span>
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
                                  onClick={() => onImpersonateTenant && onImpersonateTenant(t.subdomain)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded border border-blue-200 font-bold text-[11px] transition-colors cursor-pointer"
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
          {/* TAB 6: SAAS BILLING & FINANCIALS                                  */}
          {/* ================================================================= */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">SaaS Billing & Recurring Revenue (MRR)</h2>
                <p className="text-xs text-slate-500">Pendapatan berulang bulanan, tingkat retensi, dan transaksi pembayaran lisensi pesantren.</p>
              </div>

              {/* Financial KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Recurring Revenue (MRR)</span>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    Rp {financialStats.mrr.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-emerald-600 font-semibold">+14.8% vs kuartal lalu</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Annual Run Rate (ARR Proj.)</span>
                  <div className="font-mono font-bold text-2xl text-slate-900">
                    Rp {financialStats.arr.toLocaleString('id-ID')}
                  </div>
                  <span className="text-xs text-slate-400">Proyeksi 12 bulan ke depan</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tingkat Retensi (Retention)</span>
                  <div className="font-mono font-bold text-2xl text-emerald-600">
                    {financialStats.retentionPercent}%
                  </div>
                  <span className="text-xs text-slate-400">Churn Rate rendah: {financialStats.churnRatePercent}%</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Lisensi Aktif</span>
                  <div className="font-mono font-bold text-2xl text-blue-600">
                    {financialStats.activeSubscribers} Pesantren
                  </div>
                  <span className="text-xs text-slate-400">Tersebar di 14 provinsi</span>
                </div>

              </div>

              {/* Transactions Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Transaksi & Invoice Lisensi Terbaru</h3>
                    <p className="text-xs text-slate-500">Mutasi pembayaran lisensi B2B via iPaymu, Virtual Account BSI, dan QRIS.</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">No. Invoice</th>
                        <th className="py-3 px-4">Instansi Pesantren</th>
                        <th className="py-3 px-4">Item Paket</th>
                        <th className="py-3 px-4">Nominal (Rp)</th>
                        <th className="py-3 px-4">Gateway</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentTransactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">{tx.id}</td>
                          <td className="py-3 px-4 font-bold text-slate-800">{tx.tenant}</td>
                          <td className="py-3 px-4 text-slate-600">{tx.package}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            Rp {tx.amount.toLocaleString('id-ID')}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">{tx.gateway}</td>
                          <td className="py-3 px-4 text-slate-500">{tx.date}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {tx.status}
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

        </main>

      </div>

      {/* ===================================================================== */}
      {/* 3. MODAL: TAMBAH PESANTREN / PROVISION TENANT BARU                    */}
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
