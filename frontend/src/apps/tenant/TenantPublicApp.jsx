import React, { useState } from 'react';
import TenantPesantrenPortal from '../../pages/TenantPesantrenPortal';
import PortalWaliPublic from '../../pages/PortalWaliPublic';
import LoginModal from '../../components/LoginModal';
import NfcScannerModal from '../../components/NfcScannerModal';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';

function TenantContent() {
  const [currentView, setCurrentView] = useState('portal'); // 'portal' | 'portal-wali'
  const [portalWaliQuery, setPortalWaliQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);

  const { isNfcEnabled } = useSettings();

  const handleLoginSuccess = (user) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sipesand_active_user', JSON.stringify(user));
      } catch {}
    }
    setIsLoginModalOpen(false);

    // Buka aplikasi pesantren
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/app.html';
    } else {
      window.location.href = 'https://app.sipesand.web.id';
    }
  };

  const handleOpenPortalWali = (query = '') => {
    setPortalWaliQuery(query);
    setCurrentView('portal-wali');
  };

  if (currentView === 'portal-wali') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalWaliPublic
          initialQuery={portalWaliQuery}
          onBackToHome={() => setCurrentView('portal')}
          onNavigateLegal={() => {}}
        />
        {isNfcEnabled && (
          <NfcScannerModal
            isOpen={isNfcModalOpen}
            onClose={() => setIsNfcModalOpen(false)}
            onSuccess={() => setIsNfcModalOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Website Publik Pesantren Tenant */}
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

      {/* Global NFC Simulator Modal */}
      {isNfcEnabled && (
        <NfcScannerModal
          isOpen={isNfcModalOpen}
          onClose={() => setIsNfcModalOpen(false)}
          onSuccess={() => setIsNfcModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function TenantPublicApp() {
  return (
    <SettingsProvider>
      <TenantContent />
    </SettingsProvider>
  );
}
