import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import NfcScannerModal from '../../components/NfcScannerModal';
import LoginModal from '../../components/LoginModal';
import PesantrenOnboardingModal from '../../components/PesantrenOnboardingModal';
import DeveloperFooter from '../../components/DeveloperFooter';

// Module Pages
import AppGatewayPage from '../../pages/AppGatewayPage';
import Dashboard from '../../pages/Dashboard';
import Santri from '../../pages/Santri';
import PocketAndCash from '../../pages/PocketAndCash';
import BillsAndInvoices from '../../pages/BillsAndInvoices';
import Approvals from '../../pages/Approvals';
import Ledger from '../../pages/Ledger';
import AcademicMuhafadzoh from '../../pages/AcademicMuhafadzoh';
import SecurityKamtib from '../../pages/SecurityKamtib';
import TenantWebsiteBuilder from '../../pages/TenantWebsiteBuilder';
import SettingsAndAccounts from '../../pages/SettingsAndAccounts';
import PortalWaliPublic from '../../pages/PortalWaliPublic';

import { SettingsProvider, useSettings } from '../../context/SettingsContext';

function AppPesantrenContent() {
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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [portalWaliOpen, setPortalWaliOpen] = useState(false);
  const [portalWaliQuery, setPortalWaliQuery] = useState('');

  const { settings, isNfcEnabled } = useSettings();

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
    setIsLoginModalOpen(false);

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
    setIsMobileSidebarOpen(false);
  };

  const handleOpenPortalWali = (query = '') => {
    setPortalWaliQuery(query);
    setPortalWaliOpen(true);
  };

  const handleBackToLanding = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/index.html';
    } else {
      window.location.href = 'https://sipesand.web.id';
    }
  };

  // 1. Tampilan Portal Wali Mandiri
  if (portalWaliOpen) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalWaliPublic
          initialQuery={portalWaliQuery}
          onBackToHome={() => setPortalWaliOpen(false)}
          onNavigateLegal={() => {}}
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

  // 2. Jika Belum Login: Tampilkan Halaman Gateway SSO Pesantren
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <AppGatewayPage
          onLoginSuccess={handleLoginSuccess}
          onOpenPortalWali={handleOpenPortalWali}
          onOpenNfcScanner={() => setIsNfcModalOpen(true)}
          onNavigateLegal={() => {}}
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

  // 3. Render Konten Tab Dashboard Setelah Login
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
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNfcModal={() => setIsNfcModalOpen(true)}
        onBackToLanding={handleBackToLanding}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onOpenNfcModal={() => setIsNfcModalOpen(true)}
          onBackToLanding={handleBackToLanding}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
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

      {/* Modal Onboarding Pesantren Pertama Kali */}
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

export default function AppPesantren() {
  return (
    <SettingsProvider>
      <AppPesantrenContent />
    </SettingsProvider>
  );
}
