import React from 'react';
import DashboardDeveloper from '../../pages/DashboardDeveloper';
import { SettingsProvider } from '../../context/SettingsContext';

function MitraContent() {
  const handleBackToLanding = () => {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      window.location.href = '/index.html';
    } else {
      window.location.href = 'https://sipesand.web.id';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      <DashboardDeveloper onBackToLanding={handleBackToLanding} />
    </div>
  );
}

export default function MitraPortalApp() {
  return (
    <SettingsProvider>
      <MitraContent />
    </SettingsProvider>
  );
}
