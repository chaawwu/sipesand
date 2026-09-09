import React, { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import NfcScannerModal from './components/NfcScannerModal';
import LoginModal from './components/LoginModal';
import DeveloperLoginModal from './components/DeveloperLoginModal';
import DeveloperLoginPage from './pages/DeveloperLoginPage';
import DeveloperFooter from './components/DeveloperFooter';
import { logoutDeveloper } from './services/api';

import LandingPage from './pages/LandingPage';
import LandingPageSaas from './pages/LandingPageSaas';
import AppGatewayPage from './pages/AppGatewayPage';
import PortalWaliPublic from './pages/PortalWaliPublic';
import DashboardDeveloper from './pages/DashboardDeveloper';
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
import SeoPillarPage from './pages/SeoPillarPage';
import BlogPage from './pages/BlogPage';
import SantriDigitalCardPage from './pages/SantriDigitalCardPage';
import { SEO_PILLAR_PAGES } from './data/seoData';
import { SettingsProvider, useSettings } from './context/SettingsContext';

function resolveInitialView() {
  if (typeof window === 'undefined') return 'landing-saas';
  const hostname = window.location.hostname.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const viewParam = searchParams.get('view') || searchParams.get('page');

  // 0. Public Santri Digital Card (KTSD QR Scan View)
  if (pathname.startsWith('/santri') || viewParam === 'santri-card' || viewParam === 'ktsd' || viewParam === 'digital-card') {
    return 'santri-digital-card';
  }

  // 1. Legal verification pages
  if (pathname.includes('/faq') || viewParam === 'faq') return 'faq';
  if (pathname.includes('/refund') || viewParam === 'refund-policy') return 'refund-policy';
  if (pathname.includes('/terms') || pathname.includes('/condition') || viewParam === 'terms-and-conditions') return 'terms-and-conditions';
  if (pathname.includes('/kontak') || pathname.includes('/contact') || viewParam === 'kontak') return 'kontak';

  // 1b. Pusat Edukasi (Blog Directory & Reader)
  if (pathname.startsWith('/blog') || viewParam === 'blog') return 'blog';

  // 1c. 10 Pillar Pages Otoritas Tinggi SEO
  const cleanPath = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  if (SEO_PILLAR_PAGES[cleanPath] || viewParam === 'seo-pillar') return 'seo-pillar';

  // 2. Super Dashboard Developer (mitra.sipesand.web.id)
  if (viewParam === 'dev' || viewParam === 'developer' || viewParam === 'mitra-dev' || hostname.startsWith('mitra.')) {
    return 'developer-dashboard';
  }

  // 3. Centralized Multi-Tenant Gateway (app.sipesand.web.id)
  if (viewParam === 'app' || hostname.startsWith('app.')) {
    return 'app-gateway';
  }

  // 4. Public Wali Portal (pay.sipesand.web.id)
  if (viewParam === 'pay' || viewParam === 'wali' || hostname.startsWith('pay.')) {
    return 'portal-wali';
  }

  // 5. Root domain sipesand.web.id or view=saas
  if (viewParam === 'saas' || hostname === 'sipesand.web.id' || hostname === 'www.sipesand.web.id') {
    return 'landing-saas';
  }

  // 6. Check if it is a specific tenant domain (e.g. darulrahman.sipesand.web.id)
  const tenant = searchParams.get('tenant') || searchParams.get('subdomain');
  if (tenant && !['master', 'app', 'mitra', 'pay', 'www', 'api', 'root', 'saas', 'default', 'admin'].includes(tenant.toLowerCase().trim())) {
    return 'landing';
  }

  if (hostname.endsWith('.sipesand.web.id')) {
    const parts = hostname.replace('.sipesand.web.id', '').split('.');
    if (parts[0] && !['www', 'api', 'mitra', 'pay', 'app', 'master', 'saas', 'admin'].includes(parts[0])) {
      return 'landing';
    }
  }

  if (hostname.endsWith('.localhost')) {
    const parts = hostname.replace('.localhost', '').split('.');
    if (parts[0] && !['www', 'api', 'mitra', 'pay', 'app', 'master', 'saas', 'admin'].includes(parts[0])) {
      return 'landing';
    }
  }

  // Default preview / pages.dev / plain localhost is the SaaS platform landing
  return 'landing-saas';
}

function MainAppContent() {
  // Current View: 'landing' | 'landing-saas' | 'developer-dashboard' | 'portal-wali' | 'app-gateway' | 'app' | 'faq' | 'refund-policy' | 'terms-and-conditions' | 'kontak' | 'seo-pillar' | 'blog'
  const [currentView, setCurrentView] = useState(resolveInitialView);
  const [portalWaliQuery, setPortalWaliQuery] = useState('');

  // SEO Pillar & Blog Navigation State
  const [currentPillarSlug, setCurrentPillarSlug] = useState(() => {
    if (typeof window === 'undefined') return 'aplikasi-pesantren';
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    if (SEO_PILLAR_PAGES[cleanPath]) return cleanPath;
    const searchParams = new URLSearchParams(window.location.search);
    const p = searchParams.get('slug') || searchParams.get('pillar');
    if (p && SEO_PILLAR_PAGES[p]) return p;
    return 'aplikasi-pesantren';
  });

  const [currentBlogSlug, setCurrentBlogSlug] = useState(() => {
    if (typeof window === 'undefined') return null;
    const pathname = window.location.pathname.toLowerCase();
    if (pathname.startsWith('/blog/')) {
      const s = pathname.replace(/^\/blog\//i, '').replace(/\/$/, '');
      return s || null;
    }
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('slug') || null;
  });

  // Developer Portal Auth State (mitra.sipesand.web.id)
  const [isDeveloperLoggedIn, setIsDeveloperLoggedIn] = useState(() => {
    try {
      return !!sessionStorage.getItem('sipesand_dev_token');
    } catch (e) {
      return false;
    }
  });
  const [isDevLoginModalOpen, setIsDevLoginModalOpen] = useState(false);
  const [impersonatingTenant, setImpersonatingTenant] = useState(null);

  // Auth Session State (Tenant Officer / Admin)
  const [currentUser, setCurrentUser] = useState(null); // { id, username, name, role, division, isImpersonated }
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isNfcModalOpen, setIsNfcModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { isNfcEnabled, isTenantInstance, activeTenantSubdomain } = useSettings();

  // Otomatis Deteksi Subdomain, Path Legal, Blog & SEO Pillars
  React.useEffect(() => {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const viewParam = searchParams.get('view') || searchParams.get('page');

    if (pathname.startsWith('/santri') || viewParam === 'santri-card' || viewParam === 'ktsd' || viewParam === 'digital-card') {
      setCurrentView('santri-digital-card');
    } else if (pathname.includes('/faq') || viewParam === 'faq') {
      setCurrentView('faq');
    } else if (pathname.includes('/refund') || viewParam === 'refund-policy') {
      setCurrentView('refund-policy');
    } else if (pathname.includes('/terms') || pathname.includes('/condition') || viewParam === 'terms-and-conditions') {
      setCurrentView('terms-and-conditions');
    } else if (pathname.includes('/kontak') || pathname.includes('/contact') || viewParam === 'kontak') {
      setCurrentView('kontak');
    } else if (pathname.startsWith('/blog') || viewParam === 'blog') {
      setCurrentView('blog');
      if (pathname.startsWith('/blog/')) {
        const s = pathname.replace(/^\/blog\//i, '').replace(/\/$/, '');
        if (s) setCurrentBlogSlug(s);
      }
    } else if (SEO_PILLAR_PAGES[pathname.replace(/^\/+|\/+$/g, '').toLowerCase()] || viewParam === 'seo-pillar') {
      setCurrentView('seo-pillar');
      const clean = pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (SEO_PILLAR_PAGES[clean]) {
        setCurrentPillarSlug(clean);
      }
    } else if (viewParam === 'dev' || viewParam === 'developer' || viewParam === 'mitra-dev') {
      setIsDeveloperLoggedIn(true);
      try { sessionStorage.setItem('sipesand_dev_auth', 'true'); } catch (e) {}
      setCurrentView('developer-dashboard');
    } else if (viewParam === 'saas' || viewParam === 'mitra' || hostname.startsWith('mitra.')) {
      try {
        if (sessionStorage.getItem('sipesand_dev_auth') === 'true') {
          setCurrentView('developer-dashboard');
        } else {
          setCurrentView('developer-dashboard');
          setIsDevLoginModalOpen(true);
        }
      } catch (e) {
        setCurrentView('developer-dashboard');
        setIsDevLoginModalOpen(true);
      }
    } else if (viewParam === 'pay' || viewParam === 'wali' || hostname.startsWith('pay.')) {
      setCurrentView('portal-wali');
    } else if (viewParam === 'app' || hostname.startsWith('app.')) {
      setCurrentView('app-gateway');
    }
  }, []);

  // Browser History Navigation (Back / Forward buttons)
  React.useEffect(() => {
    const handlePopState = () => {
      const nextView = resolveInitialView();
      setCurrentView(nextView);
      const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      if (SEO_PILLAR_PAGES[cleanPath]) {
        setCurrentPillarSlug(cleanPath);
      }
      if (window.location.pathname.toLowerCase().startsWith('/blog/')) {
        const slug = window.location.pathname.replace(/^\/blog\//i, '').replace(/\/$/, '');
        setCurrentBlogSlug(slug || null);
      } else if (window.location.pathname.toLowerCase() === '/blog') {
        setCurrentBlogSlug(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigatePillar = (slug) => {
    setCurrentPillarSlug(slug);
    setCurrentView('seo-pillar');
    window.history.pushState({}, '', `/${slug}`);
  };

  const handleNavigateBlog = (slug = null) => {
    setCurrentBlogSlug(slug);
    setCurrentView('blog');
    window.history.pushState({}, '', slug ? `/blog/${slug}` : '/blog');
  };

  const handleNavigateHome = () => {
    setCurrentView('landing-saas');
    window.history.pushState({}, '', '/');
  };

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

  // Developer Superadmin Auth Handlers
  const handleDevLoginSuccess = (devUser) => {
    setIsDeveloperLoggedIn(true);
    setCurrentView('developer-dashboard');
    setIsDevLoginModalOpen(false);
  };

  const handleDevLogout = () => {
    setIsDeveloperLoggedIn(false);
    try {
      const token = sessionStorage.getItem('sipesand_dev_token');
      sessionStorage.removeItem('sipesand_dev_token');
      sessionStorage.removeItem('sipesand_dev_auth');
      sessionStorage.removeItem('sipesand_dev_user');
      if (token) logoutDeveloper(token).catch(() => {});
    } catch (e) {}
    setCurrentView('developer-dashboard');
  };

  // Impersonate Tenant
  const handleImpersonateTenant = (tenant) => {
    const subdomain = typeof tenant === 'string' ? tenant : (tenant?.subdomain || 'al-ihsan');
    const namaPesantren = tenant?.name || (subdomain.charAt(0).toUpperCase() + subdomain.slice(1).replace(/-/g, ' '));
    setImpersonatingTenant(subdomain);
    setCurrentUser({
      id: `impersonated-superadmin-${subdomain}`,
      username: `admin@${subdomain}.sipesand.web.id`,
      name: `Super Admin (${namaPesantren})`,
      role: 'SUPER_ADMIN',
      division: 'Pusat Komando Pesantren',
      isImpersonated: true
    });
    setActiveTab('dashboard');
    setCurrentView('app');
  };

  const handleExitImpersonation = () => {
    setImpersonatingTenant(null);
    setCurrentUser(null);
    setCurrentView('developer-dashboard');
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
    if (impersonatingTenant) {
      handleExitImpersonation();
      return;
    }
    setCurrentUser(null);
    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    if (!isTenantInstance && (hostname.startsWith('app.') || searchParams.get('view') === 'app')) {
      setCurrentView('app-gateway');
    } else {
      setCurrentView('landing');
    }
    setIsMobileSidebarOpen(false);
  };

  const handleOpenPortalWali = (query = '') => {
    setPortalWaliQuery(query);
    setCurrentView('portal-wali');
  };

  // 0. Tampilan Superadmin & Developer Control Panel (mitra.sipesand.web.id)
  if (currentView === 'developer-dashboard') {
    if (!isDeveloperLoggedIn) {
      return (
        <DeveloperLoginPage
          onLoginSuccess={handleDevLoginSuccess}
          onBackToLanding={() => setCurrentView('landing-saas')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <DashboardDeveloper
          onLogout={handleDevLogout}
          onImpersonateTenant={handleImpersonateTenant}
          onBackToSaasLanding={() => setCurrentView('landing-saas')}
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
 
  // 0. Tampilan Publik Kartu Tanda Santri Digital (Hasil Scan QR Code KTSD)
  if (currentView === 'santri-digital-card') {
    return (
      <SantriDigitalCardPage
        onBackToHome={() => setCurrentView('landing-saas')}
        onOpenPortalWali={(targetNis) => {
          setPortalWaliQuery(targetNis);
          setCurrentView('portal-wali');
        }}
      />
    );
  }

  // 1. Tampilan Halaman Utama / Landing Page Portal Pesantren
  if (currentView === 'landing') {
    return (
      <div className="min-h-screen bg-[#FAF8F4]">
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

        {/* Developer Login Modal */}
        <DeveloperLoginModal
          isOpen={isDevLoginModalOpen}
          onClose={() => setIsDevLoginModalOpen(false)}
          onLoginSuccess={handleDevLoginSuccess}
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

  // 1b. Tampilan Khusus Centralized Multi-Tenant Gateway Login (app.sipesand.web.id)
  if (currentView === 'app-gateway' || (currentView === 'app' && !currentUser)) {
    // Jika berada dalam domain tenant mandiri, selalu tampilkan landing page tenant dengan modal login
    if (isTenantInstance) {
      return (
        <div className="min-h-screen bg-[#FAF8F4]">
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

          {/* Developer Login Modal */}
          <DeveloperLoginModal
            isOpen={isDevLoginModalOpen}
            onClose={() => setIsDevLoginModalOpen(false)}
            onLoginSuccess={handleDevLoginSuccess}
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

    return (
      <div className="min-h-screen bg-[#FAF8F4]">
        <AppGatewayPage
          onLoginSuccess={(user, targetTenant) => {
            if (targetTenant && window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = `https://${targetTenant}.sipesand.web.id?fromGateway=true`;
            } else if (targetTenant) {
              const url = new URL(window.location.href);
              url.searchParams.set('tenant', targetTenant);
              url.searchParams.set('view', 'app');
              window.location.href = url.toString();
            } else {
              handleLoginSuccess(user);
            }
          }}
          onBackToLanding={() => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = 'https://sipesand.web.id';
            } else {
              setCurrentView('landing-saas');
            }
          }}
          onOpenPortalWali={handleOpenPortalWali}
          onOpenSaasLanding={() => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = 'https://sipesand.web.id';
            } else {
              setCurrentView('landing-saas');
            }
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

  // 2. Tampilan Khusus Landing Page Pembelian Lisensi SaaS (King Digital Dev)
  if (currentView === 'landing-saas') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <LandingPageSaas
          onBackToPesantrenDemo={() => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = 'https://darulrahman.sipesand.web.id';
            } else {
              const url = new URL(window.location.href);
              url.searchParams.set('tenant', 'darulrahman');
              url.searchParams.delete('view');
              window.location.href = url.toString();
            }
          }}
          onGoToAppGateway={() => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = 'https://app.sipesand.web.id';
            } else {
              setCurrentView('app-gateway');
            }
          }}
          onGoToTenant={(subdomain) => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = `https://${subdomain}.sipesand.web.id`;
            } else {
              const url = new URL(window.location.href);
              url.searchParams.set('tenant', subdomain);
              url.searchParams.delete('view');
              window.location.href = url.toString();
            }
          }}
          onNavigatePillar={handleNavigatePillar}
          onNavigateBlog={handleNavigateBlog}
          onNavigateLegal={(path) => setCurrentView(path)}
          onOpenDeveloperPortal={() => {
            if (window.location.hostname.includes('sipesand.web.id')) {
              window.location.href = 'https://mitra.sipesand.web.id';
            } else {
              if (isDeveloperLoggedIn) {
                setCurrentView('developer-dashboard');
              } else {
                setIsDevLoginModalOpen(true);
              }
            }
          }}
        />

        {/* Developer Login Modal */}
        <DeveloperLoginModal
          isOpen={isDevLoginModalOpen}
          onClose={() => setIsDevLoginModalOpen(false)}
          onLoginSuccess={handleDevLoginSuccess}
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

  // 3. Tampilan Portal Mandiri Wali Santri (Tanpa Login / Akses Publik)
  if (currentView === 'portal-wali') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <PortalWaliPublic
          initialQuery={portalWaliQuery}
          tenant={activeTenantSubdomain || getCurrentTenant()}
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

  // 8. Halaman SEO Pillar (10 Landing Page Otoritas Tinggi Target Google Indonesia)
  if (currentView === 'seo-pillar') {
    return (
      <SeoPillarPage
        pillarSlug={currentPillarSlug}
        onNavigateHome={handleNavigateHome}
        onNavigatePillar={handleNavigatePillar}
        onNavigateBlog={handleNavigateBlog}
        onNavigateGateway={() => {
          if (window.location.hostname.includes('sipesand.web.id')) {
            window.location.href = 'https://app.sipesand.web.id';
          } else {
            setCurrentView('app-gateway');
          }
        }}
        onNavigateLegal={(path) => setCurrentView(path)}
      />
    );
  }

  // 9. Halaman Blog & Pusat Edukasi (100 Artikel SEO)
  if (currentView === 'blog') {
    return (
      <BlogPage
        initialSlug={currentBlogSlug}
        onNavigateHome={handleNavigateHome}
        onNavigatePillar={handleNavigatePillar}
        onNavigateArticle={(slug) => {
          setCurrentBlogSlug(slug);
        }}
        onNavigateLegal={(path) => setCurrentView(path)}
      />
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col">
      {/* Impersonation Banner for Developer Superadmin Control */}
      {impersonatingTenant && (
        <aside aria-label="Notifikasi Mode Impersonasi" className="bg-slate-900 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between border-b border-blue-500/40 z-50 sticky top-0 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-300">
              Mode Impersonasi Superadmin Aktif: Mengontrol tenant <strong className="text-white font-mono bg-blue-900/50 px-1.5 py-0.5 rounded border border-blue-400/30">{impersonatingTenant}.sipesand.web.id</strong>
            </span>
          </div>
          <button
            onClick={handleExitImpersonation}
            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Keluar & Kembali ke Developer Panel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Read-Only Demo Notice Banner */}
      {currentUser?.isReadOnly && (
        <aside aria-label="Notifikasi Mode Tamu Demo" className="bg-amber-400 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between border-b border-amber-500 z-50 sticky top-0 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-950 flex-shrink-0" />
            <span>
              Mode Tamu Demo (Hanya Baca / Read-Only): Seluruh data dapat ditinjau secara transparan. Fitur penambahan atau mutasi data dinonaktifkan.
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-slate-950 hover:bg-black text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer flex-shrink-0"
          >
            Keluar Sesi Demo
          </button>
        </aside>
      )}

      <div className="flex flex-1 min-h-0">
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
