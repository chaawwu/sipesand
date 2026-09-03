import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis kirim X-Tenant-Subdomain ke Backend
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const tenantQuery = searchParams.get('tenant') || searchParams.get('pondok') || searchParams.get('subdomain');

    if (tenantQuery) {
      config.headers['X-Tenant-Subdomain'] = tenantQuery.toLowerCase().trim();
    } else {
      const baseDomains = ['sipesand.we.id', 'sipesand.web.id'];
      const matchedBase = baseDomains.find((baseDomain) => hostname === baseDomain || hostname === `www.${baseDomain}` || hostname.endsWith(`.${baseDomain}`));

      if (matchedBase) {
        const hostWithoutBase = hostname.replace(new RegExp(`\\.${matchedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
        const parts = hostWithoutBase.split('.');

        if (parts.length > 0 && parts[0] && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'mitra' && parts[0] !== 'pay' && parts[0] !== 'app') {
          config.headers['X-Tenant-Subdomain'] = parts[0];
        }
      }
    }
  }
  return config;
});

import {
  firestoreGetSantri,
  firestoreCreateSantri,
  firestoreUpdateSantri,
  firestoreDeleteSantri,
  firestoreRunPocketTransaction,
  firestoreGetBills,
  firestoreCreateBill,
  firestorePayBill,
  firestoreDeleteBill,
  firestoreGetDashboardStats,
  getCollectionData
} from './firestoreService';

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const stats = firestoreGetDashboardStats();
    return { data: { success: true, data: stats } };
  } catch (err) {
    return api.get('/dashboard/stats');
  }
};

export const getDashboardCharts = async (period = 'month') => {
  try {
    const stats = firestoreGetDashboardStats();
    return { data: { success: true, data: stats.monthlyChart } };
  } catch (err) {
    return api.get('/dashboard/charts', { params: { period } });
  }
};

// Santri Management (CRUD Lengkap Terkoneksi Firestore)
export const getSantriList = async (params = {}) => {
  try {
    const list = firestoreGetSantri(params);
    return { data: { success: true, data: list } };
  } catch (err) {
    return api.get('/santri', { params });
  }
};

export const getSantriById = async (id) => {
  try {
    const list = firestoreGetSantri();
    const found = list.find(s => s.id === (parseInt(id) || id));
    if (found) return { data: { success: true, data: found } };
  } catch (e) {}
  return api.get(`/santri/${id}`);
};

export const createSantri = async (data) => {
  const newSantri = firestoreCreateSantri(data);
  try { api.post('/santri', data).catch(() => {}); } catch (e) {}
  return { data: { success: true, message: 'Data santri berhasil ditambahkan', data: newSantri } };
};

export const updateSantri = async (id, data) => {
  const updated = firestoreUpdateSantri(id, data);
  try { api.put(`/santri/${id}`, data).catch(() => {}); } catch (e) {}
  return { data: { success: true, message: 'Data santri berhasil diperbarui', data: updated } };
};

export const deleteSantri = async (id) => {
  const res = firestoreDeleteSantri(id);
  try { api.delete(`/santri/${id}`).catch(() => {}); } catch (e) {}
  return { data: res };
};

export const getSantriByNfc = async (uid) => {
  try {
    const list = firestoreGetSantri();
    const found = list.find(s => s.nfcUid === uid);
    if (found) return { data: { success: true, data: found } };
  } catch (e) {}
  return api.get(`/santri/nfc/${uid}`);
};

export const exportSantriData = async () => {
  try {
    const list = firestoreGetSantri();
    return { data: list };
  } catch (e) {
    return api.get('/santri/export/all');
  }
};

export const importSantriBulk = (data) => api.post('/santri/import/bulk', data);
export const importFromFirebase = (data) => api.post('/santri/import/firebase', data);

// Pocket Transactions (Uang Saku dengan Transaksi Atomik)
export const getPocketTxs = async (params = {}) => {
  try {
    const txs = getCollectionData('pocket_transactions');
    return { data: { success: true, data: txs } };
  } catch (err) {
    return api.get('/pocket-tx', { params });
  }
};

export const getPocketTransactions = getPocketTxs;

export const createPocketTx = async (data) => {
  const res = firestoreRunPocketTransaction({
    santriId: data.santriId,
    type: data.type || 'TOPUP',
    amount: data.amount,
    note: data.note,
    merchantName: data.merchantName
  });
  try { api.post('/pocket-tx', data).catch(() => {}); } catch (e) {}
  return { data: res };
};

export const createPocketTransaction = createPocketTx;

export const deductPocketBalance = async (data) => {
  const res = firestoreRunPocketTransaction({
    santriId: data.santriId,
    type: 'DEDUCT',
    amount: data.amount,
    note: data.note,
    merchantName: data.merchantName
  });
  try { api.post('/pocket-tx/deduct', data).catch(() => {}); } catch (e) {}
  return { data: res };
};

// General Ledger (Buku Kas Umum)
export const getLedgerEntries = (params) => api.get('/ledger', { params });
export const getLedgerSummary = () => api.get('/ledger/summary');
export const createLedgerEntry = (data) => api.post('/ledger', data);
export const deleteLedgerEntry = (id) => api.delete(`/ledger/${id}`);

// Security & Permits (Perizinan Santri)
export const getPermits = (params) => api.get('/permits', { params });
export const createPermit = (data) => api.post('/permits', data);
export const updatePermitStatus = (id, data) => api.put(`/permits/${id}/status`, data);
export const checkSantriOverdue = () => api.get('/permits/check-overdue');
export const checkInByNfc = (data) => api.post('/permits/check-in-nfc', data);

// Master Bills (Tarif Tagihan)
export const getMasterBills = () => api.get('/bills/master');
export const createMasterBill = (data) => api.post('/bills/master', data);
export const updateMasterBill = (id, data) => api.put(`/bills/master/${id}`, data);
export const deleteMasterBill = (id) => api.delete(`/bills/master/${id}`);

// Santri Bills & Invoices (Persistensi Tagihan & Status Lunas)
export const getSantriBills = async (params = {}) => {
  try {
    const bills = firestoreGetBills(params);
    return { data: { success: true, data: bills } };
  } catch (err) {
    return api.get('/bills', { params });
  }
};

export const generateMassBills = async (data) => {
  try {
    const santriList = firestoreGetSantri();
    santriList.forEach(s => {
      firestoreCreateBill({
        santriId: s.id,
        title: data.title || 'Syahriyah Bulanan',
        amount: data.amount || 300000,
        hijriMonth: data.hijriMonth || 'Ramadhan',
        hijriYear: data.hijriYear || '1447 H'
      });
    });
    return { data: { success: true, message: 'Tagihan massal berhasil diterbitkan.' } };
  } catch (e) {
    return api.post('/bills/generate-mass', data);
  }
};

export const autoGenerateHijriBills = (data) => api.post('/bills/auto-generate-hijri', data);

export const updateSantriBill = async (id, data) => {
  try {
    const res = firestorePayBill(id, data);
    return { data: res };
  } catch (err) {
    return api.put(`/bills/${id}`, data);
  }
};

export const deleteSantriBill = async (id) => {
  try {
    const res = firestoreDeleteBill(id);
    return { data: res };
  } catch (err) {
    return api.delete(`/bills/${id}`);
  }
};

// Divisi Pengajuan Dana & Verifikasi Pembayaran (Approvals)
export const getDivisionFunds = (params) => api.get('/approvals/division-funds', { params });
export const createDivisionFund = (data) => api.post('/approvals/division-funds', data);
export const updateDivisionFundStatus = (id, data) => api.put(`/approvals/division-funds/${id}`, data);
export const updateApprovalStatus = (id, data) => api.put(`/approvals/division-funds/${id}`, data);
export const getPendingOnlinePayments = (params) => api.get('/approvals/online-payments', { params });
export const verifyBillPayment = (id, data) => api.post(`/bills/verify-payment/${id}`, data);

// Divisi Pendidikan & Muhafadzoh
export const getAcademicRecords = (params) => api.get('/academics', { params });
export const createAcademicRecord = (data) => api.post('/academics', data);
export const updateAcademicRecord = (id, data) => api.put(`/academics/${id}`, data);
export const deleteAcademicRecord = (id) => api.delete(`/academics/${id}`);

// Divisi Keamanan: Pelanggaran & Takziran
export const getViolations = (params) => api.get('/security/violations', { params });
export const createViolation = (data) => api.post('/security/violations', data);
export const updateViolationStatus = (id, data) => api.put(`/security/violations/${id}/status`, data);
export const deleteViolation = (id) => api.delete(`/security/violations/${id}`);

// Auth & Pengaturan Lembaga, Akun Multi-Divisi, & Auto Backup
export const loginUser = (data) => api.post('/settings/login', data);
export const getSystemSettings = () => api.get('/settings');
export const saveSystemSettings = (data) => api.post('/settings', data);
export const getUserAccounts = () => api.get('/settings/accounts');
export const createUserAccount = (data) => api.post('/settings/accounts', data);
export const updateUserAccount = (id, data) => api.put(`/settings/accounts/${id}`, data);
export const deleteUserAccount = (id) => api.delete(`/settings/accounts/${id}`);
export const getBackupData = () => api.get('/settings/backup/export');

// Portal Wali (Tanpa Login / Publik)
export const getPortalWaliData = (query) => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`);
export const getPublicSantriData = (query) => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`);
export const getPublicSantriBills = (query) => api.get(`/portal-wali/bills/${encodeURIComponent(query)}`);
export const uploadPaymentProof = (data) => api.post('/bills/pay-online', data);

// B2B SaaS King Digital Dev: Pendaftaran Mitra, Webhook, & Auto-Disbursement
export const checkSubdomainAvailability = (subdomain) => api.get(`/mitra/check-subdomain/${encodeURIComponent(subdomain)}`);
export const registerMitraTenant = (data) => api.post('/mitra/register', data);
export const getMitraOrderStatus = (orderId) => api.get(`/mitra/status/${orderId}`);
export const simulatePaymentSuccess = (orderId) => api.post(`/mitra/simulate-payment/${orderId}`);
export const updateKingDigitalPgConfig = (data) => api.post('/mitra/pg-config', data);
export const getAllMitraAktif = () => api.get('/mitra/all');

// Developer HQ Console (mitra.sipesand.web.id)
export const developerLogin = (data) => api.post('/mitra/developer/login', data);
export const getDeveloperStats = () => api.get('/mitra/developer/stats');
export const getTenantTransactions = () => api.get('/mitra/developer/transactions');
export const toggleTenantStatus = (id) => api.post(`/mitra/tenant/toggle-status/${id}`);
export const createTenantManual = (data) => api.post('/mitra/tenant/create-manual', data);

export default api;
