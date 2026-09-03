import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NfcScannerModal from './components/NfcScannerModal';
import LoginModal from './components/LoginModal';
import PesantrenOnboardingModal from './components/PesantrenOnboardingModal';
import DeveloperFooter from './components/DeveloperFooter';

// Pages & Apps Modules
import LandingPageEnterprise from './apps/landing/LandingPageEnterprise';
import DashboardV2 from './apps/dashboard/DashboardV2';
import LandingPage from './pages/LandingPage';
import LandingPageSaas from './pages/LandingPageSaas';
import AppGatewayPage from './pages/AppGatewayPage';
import TenantPesantrenPortal from './pages/TenantPesantrenPortal';
import TenantWebsiteBuilder from './pages/TenantWebsiteBuilder';
import DashboardDeveloper from './pages/DashboardDeveloper';
import PortalWaliPublic from './pages/PortalWaliPublic';
import Dashboard from './pages/Dashboard';
import Santri from './pages/Santri';
import PocketAndCash from './pages/PocketAndCash';
import BillsAndInvoices from './pages/BillsAndInvoices';
import Approvals from './pages/Approvals';
import Ledger from './pages/Ledger';
import AcademicMuhafadzoh from './pages/AcademicMuhafadzoh';
import SecurityKamtib from './pages/SecurityKamtib';
import SettingsAndAccounts from './pages/SettingsAndAccounts';
import FaqPage from './pages/FaqPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import ContactPage from './pages/ContactPage';
import { SettingsProvider, useSettings } from './context/SettingsContext';

function getInitialView() {
  if (typeof window === 'undefined') return 'landing';
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view') || searchParams.get('page');

  // 1. Cek Path Legal iPaymu
  if (pathname.includes('/faq') || viewParam === 'faq') return 'faq';
  if (pathname.includes('/refund') || viewParam === 'refund-policy') return 'refund-policy';
  if (pathname.includes('/terms') || pathname.includes('/condition') || viewParam === 'terms-and-conditions') return 'terms-and-conditions';
  if (pathname.includes('/kontak') || pathname.includes('/contact') || viewParam === 'kontak') return 'kontak';

  // 2. Cek Subdomain Mitra (mitra.sipesand.web.id)
  if (viewParam === 'mitra' || viewParam === 'developer' || hostname.startsWith('mitra.')) return 'developer';

  // 3. Cek Subdomain SaaS Penjualan Lisensi (saas.sipesand.web.id)
  if (viewParam === 'saas' || hostname.startsWith('saas.')) return 'landing-saas';

  // 4. Cek Subdomain Portal Wali Santri (pay.sipesand.web.id)
  if (viewParam === 'pay' || viewParam === 'wali' || hostname.startsWith('pay.')) return 'portal-wali';

  // 5. Cek Subdomain Aplikasi Utama (apps.sipesand.web.id atau app.sipesand.web.id)
  if (viewParam === 'app' || viewParam === 'apps' || hostname.startsWith('app.') || hostname.startsWith('apps.')) return 'app-gateway';

  // 6. Cek Subdomain Tenant Pesantren Khusus (misal: darulrahman.sipesand.web.id)
  const baseDomains = ['sipesand.web.id', 'sipesand.we.id'];
  const matchedBase = baseDomains.find(base => hostname === base || hostname.endsWith(`.${base}`));

  if (matchedBase && hostname !== matchedBase && !hostname.startsWith('www.')) {
    const subdomain = hostname.replace(`.${matchedBase}`, '').toLowerCase();
    if (subdomain && !['app', 'apps', 'mitra', 'pay', 'api', 'saas'].includes(subdomain)) {
      return 'tenant-portal';
    }
  }

  if (searchParams.get('tenant') || searchParams.get('pondok')) return 'tenant-portal';

  // 7. Default Halaman Utama: sipesand.web.id (Landing Page Enterprise Publik)
  return 'landing';
}

function MainAppContent() {
  // Current View: 'landing' | 'landing-saas' | 'portal-wali' | 'app' | 'faq' | 'refund-policy' | 'terms-and-conditions' | 'kontak'
  const [currentView, setCurrentView] = useState(getInitialView);
  const [portalWaliQuery, setPortalWaliQuery] = useState('Farhan');
  
  // Auth Session State (Aman Multi-Device & Refresh Persistent)
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('sipesand_active_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { settings, isNfcEnabled } = useSettings();

  // Re-check jika URL berubah dinamis
  React.useEffect(() => {
    setCurrentView(getInitialView());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleNfcSuccess = () => {
    handleRefresh();
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sipesand_active_user', JSON.stringify(user));
      } catch {}
    }
    // Set default initial tab based on role
    switch (user.role) {
      case 'KEPALA_PONDOK':
        setActiveTab('academics');
        break;
      case 'BENDAHARA':
        setActiveTab('bills');
        break;
      case 'PENGURUS_SAKU':
        setActiveTab('pocket-cash');
        break;
      case 'KEAMANAN':
        setActiveTab('security');
        break;
      case 'SUPER_ADMIN':
      default:
        setActiveTab('dashboard');
        break;
    }
    setCurrentView('app');
    setIsLoginModalOpen(false);

    // Form Konfigurasi Pesantren Pertama Kali sebelum masuk Dashboard
    if (settings?.ONBOARDING_COMPLETED !== 'true') {
      setIsOnboardingOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('sipesand_active_user');
      } catch {}
    }
    // Kembali ke homepage milik domain / subdomain yang sedang diakses
    const initView = getInitialView();
    setCurrentView(initView);
    setIsMobileSidebarOpen(false);
  };

  const handleOpenPortalWali = (query = 'Farhan') => {
    setPortalWaliQuery(query);
    setCurrentView('portal-wali');
  };

  // 1. Tampilan Halaman Utama / Landing Page Publik SIPESAND (sipesand.web.id)
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-white">
        <LandingPageEnterprise
          onNavigateApp={() => setCurrentView('app-gateway')}
          onNavigateMitra={() => setCurrentView('developer')}
          onOpenRegisterModal={() => setCurrentView('app-gateway')}
        />

        {/* Modal Login Petugas */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
        />

        {/* Global NFC Simulator Modal */}
        {isNfcEnabled && (
          <NfcScannerModal
            isOpen={isNfcModalOpen}
            onClose={() => setIsNfcModalOpen(false)}
            onSuccess={handleNfcSuccess}
          />
        )}
      </div>
    );
  }

  // 2. Tampilan Khusus Landing Page Pembelian Lisensi SaaS (King Digital Dev)
  if (currentView === 'landing-saas') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <LandingPageSaas
          onBackToPesantrenDemo={() => setCurrentView('landing')}
          onGoToTenant={(subdomain) => {
            setCurrentView('landing');
            setIsLoginModalOpen(true);
          }}
          onNavigateLegal={(path) => setCurrentView(path)}
        />

        {/* Global NFC Simulator Modal */}
        {isNfcEnabled && (
          <NfcScannerModal
            isOpen={isNfcModalOpen}
            onClose={() => setIsNfcModalOpen(false)}
            onSuccess={handleNfcSuccess}
          />
        )}
      </div>
    );
  }

  // 3. Tampilan Khusus Dashboard Developer HQ (mitra.sipesand.web.id)
  if (currentView === 'developer' || currentView === 'mitra') {
    return (
      <DashboardDeveloper onBackToLanding={() => setCurrentView('landing')} />
    );
  }

  // 4. Tampilan Khusus App Gateway (app.sipesand.web.id - Tampilan Original SSO & Gateway Pesantren)
  if (currentView === 'app-gateway') {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <AppGatewayPage
            onLoginSuccess={handleLoginSuccess}
            onOpenPortalWali={handleOpenPortalWali}
            onOpenNfcScanner={() => setIsNfcModalOpen(true)}
            onNavigateLegal={(path) => setCurrentView(path)}
          />

          {isNfcEnabled && (
            <NfcScannerModal
              isOpen={isNfcModalOpen}
              onClose={() => setIsNfcModalOpen(false)}
              onSuccess={handleNfcSuccess}
            />
          )}
        </div>
      );
    }
  }

  // 5. Tampilan Khusus Portal Resmi Pesantren Tenant (misal: darulrahman.sipesand.web.id)
  if (currentView === 'tenant-portal') {
    if (!currentUser) {
      return (
        <div className="min-h-screen bg-[#F8FAFC]">
          <TenantPesantrenPortal
            onLoginPetugas={() => setIsLoginModalOpen(true)}
            onOpenPortalWali={handleOpenPortalWali}
            onOpenNfcScanner={() => setIsNfcModalOpen(true)}
          />

          {/* Modal Login Petugas Pesantren */}
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLoginSuccess={handleLoginSuccess}
          />

          {isNfcEnabled && (
            <NfcScannerModal
              isOpen={isNfcModalOpen}
              onClose={() => setIsNfcModalOpen(false)}
              onSuccess={handleNfcSuccess}
            />
          )}
        </div>
      );
    }
  }

  // 6. Tampilan Portal Mandiri Wali Santri (Tanpa Login / Akses Publik)
  if (currentView === 'portal-wali') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalWaliPublic
          initialQuery={portalWaliQuery}
          onBackToHome={() => setCurrentView(getInitialView())}
          onNavigateLegal={(path) => setCurrentView(path)}
        />

        {isNfcEnabled && (
          <NfcScannerModal
            isOpen={isNfcModalOpen}
            onClose={() => setIsNfcModalOpen(false)}
            onSuccess={handleNfcSuccess}
          />
        )}
      </div>
    );
  }

  // 7. Halaman Kebijakan & Legalitas Resmi (Verifikasi iPaymu)
  if (currentView === 'faq') {
    return <FaqPage onBackToHome={() => setCurrentView('landing')} />;
  }
  if (currentView === 'refund-policy') {
    return <RefundPolicyPage onBackToHome={() => setCurrentView('landing')} />;
  }
  if (currentView === 'terms-and-conditions') {
    return <TermsConditionsPage onBackToHome={() => setCurrentView('landing')} />;
  }
  if (currentView === 'kontak') {
    return <ContactPage onBackToHome={() => setCurrentView('landing')} />;
  }

  // 8. Tampilan Panel Pengurus Divisi & Super Admin Original (10 Modul Lengkap)
  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard key={refreshKey} setActiveTab={setActiveTab} onOpenNfcModal={() => setIsNfcModalOpen(true)} />;
      case 'santri':
        return <Santri key={refreshKey} onOpenNfcModal={() => setIsNfcModalOpen(true)} />;
      case 'bills':
        return <BillsAndInvoices key={refreshKey} />;
      case 'approvals':
        return <Approvals key={refreshKey} />;
      case 'ledger':
        return <Ledger key={refreshKey} />;
      case 'pocket-cash':
        return <PocketAndCash key={refreshKey} onOpenNfcModal={() => setIsNfcModalOpen(true)} currentUser={currentUser} />;
      case 'academics':
        return <AcademicMuhafadzoh key={refreshKey} />;
      case 'security':
        return <SecurityKamtib key={refreshKey} onOpenNfcModal={() => setIsNfcModalOpen(true)} />;
      case 'web-builder':
        return <TenantWebsiteBuilder key={refreshKey} />;
      case 'settings':
        return <SettingsAndAccounts key={refreshKey} />;
      default:
        return <Dashboard key={refreshKey} setActiveTab={setActiveTab} onOpenNfcModal={() => setIsNfcModalOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#111827]">
      {/* Sidebar Navigation (Role-based & Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNfcModal={() => setIsNfcModalOpen(true)}
        onBackToLanding={() => {
          handleLogout();
        }}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenNfcModal={() => setIsNfcModalOpen(true)}
          onBackToLanding={() => {
            handleLogout();
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl w-full mx-auto animate-in fade-in duration-150">
          {renderDashboardContent()}
        </main>

        <DeveloperFooter className="mt-auto" />
      </div>

      {/* Global NFC Simulator Modal */}
      {isNfcEnabled && (
        <NfcScannerModal
          isOpen={isNfcModalOpen}
          onClose={() => setIsNfcModalOpen(false)}
          onSuccess={handleNfcSuccess}
        />
      )}

      {/* Modal Konfigurasi Awal Pesantren (Pop-up sebelum masuk Dashboard pertama kali) */}
      <PesantrenOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={() => {
          setIsOnboardingOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <MainAppContent />
    </SettingsProvider>
  );
}
