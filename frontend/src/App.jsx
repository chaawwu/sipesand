import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NfcScannerModal from './components/NfcScannerModal';
import LoginModal from './components/LoginModal';
import DeveloperFooter from './components/DeveloperFooter';

// Pages
import LandingPage from './pages/LandingPage';
import LandingPageSaas from './pages/LandingPageSaas';
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

function MainAppContent() {
  // Current View: 'landing' | 'landing-saas' | 'portal-wali' | 'app' | 'faq' | 'refund-policy' | 'terms-and-conditions' | 'kontak'
  const [currentView, setCurrentView] = useState('landing');
  const [portalWaliQuery, setPortalWaliQuery] = useState('Farhan');
  
  // Auth Session State
  const [currentUser, setCurrentUser] = useState(null); // { id, username, name, role, division }
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isNfcEnabled } = useSettings();

  // Otomatis Deteksi Subdomain & Path Legal (faq, refund-policy, terms, kontak)
  React.useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view') || searchParams.get('page');

    // 1. Cek Path Legal iPaymu
    if (pathname.includes('/faq') || viewParam === 'faq') {
      setCurrentView('faq');
    } else if (pathname.includes('/refund') || viewParam === 'refund-policy') {
      setCurrentView('refund-policy');
    } else if (pathname.includes('/terms') || pathname.includes('/condition') || viewParam === 'terms-and-conditions') {
      setCurrentView('terms-and-conditions');
    } else if (pathname.includes('/kontak') || pathname.includes('/contact') || viewParam === 'kontak') {
      setCurrentView('kontak');
    } 
    // 2. Cek Subdomain
    else if (viewParam === 'mitra' || viewParam === 'developer' || hostname.startsWith('mitra.')) {
      setCurrentView('developer');
    } else if (viewParam === 'saas') {
      setCurrentView('landing-saas');
    } else if (viewParam === 'pay' || viewParam === 'wali' || hostname.startsWith('pay.')) {
      setCurrentView('portal-wali');
    } else if (viewParam === 'app' || hostname.startsWith('app.')) {
      setCurrentView('landing');
      if (searchParams.get('login') === 'true') {
        setIsLoginModalOpen(true);
      }
    }
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('landing');
    setIsMobileSidebarOpen(false);
  };

  const handleOpenPortalWali = (query = 'Farhan') => {
    setPortalWaliQuery(query);
    setCurrentView('portal-wali');
  };

  // 1. Tampilan Halaman Utama / Landing Page Portal Pesantren
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <LandingPage
          onLoginPetugas={() => setIsLoginModalOpen(true)}
          onOpenPortalWali={handleOpenPortalWali}
          onOpenNfcScanner={() => setIsNfcModalOpen(true)}
          onOpenSaasLanding={() => setCurrentView('landing-saas')}
          onNavigateLegal={(path) => setCurrentView(path)}
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

  // 3. Tampilan Portal Mandiri Wali Santri (Tanpa Login / Akses Publik)
  if (currentView === 'portal-wali') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalWaliPublic
          initialQuery={portalWaliQuery}
          onBackToHome={() => setCurrentView('landing')}
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

  // 4. Halaman FAQ Resmi (Verifikasi iPaymu)
  if (currentView === 'faq') {
    return (
      <FaqPage onBackToHome={() => setCurrentView('landing')} />
    );
  }

  // 5. Halaman Refund Policy (Verifikasi iPaymu)
  if (currentView === 'refund-policy') {
    return (
      <RefundPolicyPage onBackToHome={() => setCurrentView('landing')} />
    );
  }

  // 6. Halaman Syarat & Ketentuan (Verifikasi iPaymu)
  if (currentView === 'terms-and-conditions') {
    return (
      <TermsConditionsPage onBackToHome={() => setCurrentView('landing')} />
    );
  }

  // 7. Halaman Kontak Resmi (Verifikasi iPaymu)
  if (currentView === 'kontak') {
    return (
      <ContactPage onBackToHome={() => setCurrentView('landing')} />
    );
  }

  // 4. Tampilan Panel Pengurus Devisi & Super Admin (Menyesuaikan Peran Role)
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
        onBackToLanding={() => setCurrentView('landing')}
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
          onBackToLanding={() => setCurrentView('landing')}
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
