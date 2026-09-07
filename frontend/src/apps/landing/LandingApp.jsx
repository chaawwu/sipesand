import React, { useState } from 'react';
import LandingPageEnterprise from './LandingPageEnterprise';
import PricingPage from '../../pages/PricingPage';
import FaqPage from '../../pages/FaqPage';
import RefundPolicyPage from '../../pages/RefundPolicyPage';
import TermsConditionsPage from '../../pages/TermsConditionsPage';
import ContactPage from '../../pages/ContactPage';
import LoginModal from '../../components/LoginModal';
import NfcScannerModal from '../../components/NfcScannerModal';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';

function LandingContent() {
  const [subView, setSubView] = useState(() => {
    if (typeof window === 'undefined') return 'main';
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view') || searchParams.get('page');
    if (path.includes('/pricing') || path.includes('/paket') || path.includes('/berlangganan') || view === 'pricing' || view === 'paket') return 'pricing';
    if (path.includes('/faq') || view === 'faq') return 'faq';
    if (path.includes('/refund') || view === 'refund-policy') return 'refund-policy';
    if (path.includes('/terms') || path.includes('/condition') || view === 'terms-and-conditions') return 'terms-and-conditions';
    if (path.includes('/kontak') || path.includes('/contact') || view === 'kontak') return 'kontak';
    return 'main';
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const { isNfcEnabled } = useSettings();

  const handleNavigateApp = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/app.html';
    } else {
      window.location.href = 'https://app.sipesand.web.id';
    }
  };

  const handleNavigateMitra = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/mitra.html';
    } else {
      window.location.href = 'https://mitra.sipesand.web.id';
    }
  };

  // Sub-halaman legalitas / kebijakan / pricing
  if (subView === 'pricing') {
    return (
      <PricingPage
        onBackToHome={() => setSubView('main')}
        onNavigateApp={handleNavigateApp}
      />
    );
  }
  if (subView === 'faq') return <FaqPage onBackToHome={() => setSubView('main')} />;
  if (subView === 'refund-policy') return <RefundPolicyPage onBackToHome={() => setSubView('main')} />;
  if (subView === 'terms-and-conditions') return <TermsConditionsPage onBackToHome={() => setSubView('main')} />;
  if (subView === 'kontak') return <ContactPage onBackToHome={() => setSubView('main')} />;

  return (
    <div className="min-h-screen bg-white">
      <LandingPageEnterprise
        onNavigateApp={handleNavigateApp}
        onNavigateMitra={handleNavigateMitra}
        onNavigatePricing={() => setSubView('pricing')}
        onOpenRegisterModal={() => setSubView('pricing')}
      />

      {/* Modal Login Petugas */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          handleNavigateApp();
        }}
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

export default function LandingApp() {
  return (
    <SettingsProvider>
      <LandingContent />
    </SettingsProvider>
  );
}
