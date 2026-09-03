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

        if (parts.length > 0 && parts[0] && !['www', 'api'].includes(parts[0])) {
          config.headers['X-Tenant-Subdomain'] = parts[0] === 'apps' ? 'app' : parts[0];
        } else {
          config.headers['X-Tenant-Subdomain'] = 'app';
        }
      } else {
        config.headers['X-Tenant-Subdomain'] = 'app';
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
  firestoreGetSettings,
  firestoreSaveSettings,
  getCollectionData,
  setCollectionData,
  FIRESTORE_COLLECTIONS
} from './firestoreService';

// Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const res = await api.get('/dashboard/stats');
    if (res?.data?.success && res.data.data) return res;
  } catch (err) {}
  const stats = firestoreGetDashboardStats();
  return { data: { success: true, data: stats } };
};

export const getDashboardCharts = async (period = 'month') => {
  try {
    const res = await api.get('/dashboard/charts', { params: { period } });
    if (res?.data?.success && res.data.data) return res;
  } catch (err) {}
  const stats = firestoreGetDashboardStats();
  return { data: { success: true, data: stats.monthlyChart } };
};

// Santri Management (Multi-Device Real-Time Sync via Centralized Server & Local Cache)
export const getSantriList = async (params = {}) => {
  try {
    const res = await api.get('/santri', { params });
    if (res?.data?.success && Array.isArray(res.data.data)) {
      // Sinkronisasi data server ke cache lokal device
      setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, res.data.data);
      return res;
    }
  } catch (err) {
    console.warn('[API] Sinkronisasi server gagal, memuat cache lokal device:', err?.message);
  }
  const list = firestoreGetSantri(params);
  return { data: { success: true, data: list } };
};

export const getSantriById = async (id) => {
  try {
    const res = await api.get(`/santri/${id}`);
    if (res?.data?.success && res.data.data) return res;
  } catch (e) {}
  const list = firestoreGetSantri();
  const found = list.find(s => s.id === (parseInt(id) || id));
  if (found) return { data: { success: true, data: found } };
  return { data: { success: false, message: 'Santri tidak ditemukan' } };
};

export const createSantri = async (data) => {
  try {
    const res = await api.post('/santri', data);
    if (res?.data?.success && res.data.data) {
      firestoreCreateSantri(res.data.data);
      return res;
    }
  } catch (e) {
    console.warn('[API] createSantri server error, fallback local:', e?.message);
  }
  const newSantri = firestoreCreateSantri(data);
  return { data: { success: true, message: 'Data santri berhasil ditambahkan', data: newSantri } };
};

export const updateSantri = async (id, data) => {
  try {
    const res = await api.put(`/santri/${id}`, data);
    if (res?.data?.success) {
      firestoreUpdateSantri(id, data);
      return res;
    }
  } catch (e) {
    console.warn('[API] updateSantri server error, fallback local:', e?.message);
  }
  const updated = firestoreUpdateSantri(id, data);
  return { data: { success: true, message: 'Data santri berhasil diperbarui', data: updated } };
};

export const deleteSantri = async (id) => {
  try {
    const res = await api.delete(`/santri/${id}`);
    firestoreDeleteSantri(id);
    return res;
  } catch (e) {
    console.warn('[API] deleteSantri server error, fallback local:', e?.message);
  }
  const res = firestoreDeleteSantri(id);
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

export const getSystemSettings = async () => {
  try {
    const res = await api.get('/settings');
    if (res?.data?.success && res.data.data) {
      firestoreSaveSettings(res.data.data);
      return res;
    }
  } catch (e) {
    console.warn('[API] getSystemSettings server error, fallback local:', e?.message);
  }
  const data = firestoreGetSettings();
  return { data: { success: true, data: data || {} } };
};

export const saveSystemSettings = async (data) => {
  firestoreSaveSettings(data);
  try {
    const res = await api.post('/settings', data);
    if (res?.data?.data) return res;
  } catch (e) {
    console.warn('[API] saveSystemSettings server error, local saved:', e?.message);
  }
  return { data: { success: true, message: 'Pengaturan berhasil disimpan', data } };
};

export const resetTenantData = async () => {
  try {
    const res = await api.post('/tenant/reset');
    return res;
  } catch (e) {
    return api.post('/reset-data').catch(() => ({ data: { success: true } }));
  }
};
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
