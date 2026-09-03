import React from 'react';
import AppGatewayPage from '../../pages/AppGatewayPage';
import TenantPesantrenPortal from '../../pages/TenantPesantrenPortal';
import Santri from '../../pages/Santri';
import BillsAndInvoices from '../../pages/BillsAndInvoices';
import PocketAndCash from '../../pages/PocketAndCash';
import GeneralLedger from '../../pages/GeneralLedger';
import Permits from '../../pages/Permits';
import SecurityKamtib from '../../pages/SecurityKamtib';
import AcademicMuhafadzoh from '../../pages/AcademicMuhafadzoh';
import SettingsAndAccounts from '../../pages/SettingsAndAccounts';

export {
  AppGatewayPage,
  TenantPesantrenPortal,
  Santri,
  BillsAndInvoices,
  PocketAndCash,
  GeneralLedger,
  Permits,
  SecurityKamtib,
  AcademicMuhafadzoh,
  SettingsAndAccounts
};

export default function DashboardApp(props) {
  // Hubungkan ke router dashboard
  return <TenantPesantrenPortal {...props} />;
}
