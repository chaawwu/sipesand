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
    const tenantQuery = searchParams.get('tenant');

    if (tenantQuery) {
      config.headers['X-Tenant-Subdomain'] = tenantQuery;
    } else {
      const baseDomains = ['sipesand.we.id', 'sipesand.web.id'];
      const matchedBase = baseDomains.find((baseDomain) => hostname === baseDomain || hostname === `www.${baseDomain}` || hostname.endsWith(`.${baseDomain}`));

      if (matchedBase) {
        const hostWithoutBase = hostname.replace(new RegExp(`\\.${matchedBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '');
        const parts = hostWithoutBase.split('.');

        if (parts.length > 0 && parts[0] && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'mitra' && parts[0] !== 'pay') {
          config.headers['X-Tenant-Subdomain'] = parts[0];
        }
      }
    }
  }
  return config;
});

// Dashboard Statistics
export const getDashboardStats = () => api.get('/dashboard/stats');
export const getDashboardCharts = (period = 'month') => api.get('/dashboard/charts', { params: { period } });

// Santri Management
export const getSantriList = (params) => api.get('/santri', { params });
export const getSantriById = (id) => api.get(`/santri/${id}`);
export const createSantri = (data) => api.post('/santri', data);
export const updateSantri = (id, data) => api.put(`/santri/${id}`, data);
export const deleteSantri = (id) => api.delete(`/santri/${id}`);
export const getSantriByNfc = (uid) => api.get(`/santri/nfc/${uid}`);
export const exportSantriData = () => api.get('/santri/export/all');
export const importSantriBulk = (data) => api.post('/santri/import/bulk', data);
export const importFromFirebase = (data) => api.post('/santri/import/firebase', data);

// Pocket Transactions (Uang Saku)
export const getPocketTxs = (params) => api.get('/pocket-tx', { params });
export const getPocketTransactions = (params) => api.get('/pocket-tx', { params });
export const createPocketTx = (data) => api.post('/pocket-tx', data);
export const createPocketTransaction = (data) => api.post('/pocket-tx', data);
export const deductPocketBalance = (data) => api.post('/pocket-tx/deduct', data);

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

// Santri Bills & Invoices
export const getSantriBills = (params) => api.get('/bills', { params });
export const generateMassBills = (data) => api.post('/bills/generate-mass', data);
export const autoGenerateHijriBills = (data) => api.post('/bills/auto-generate-hijri', data);
export const updateSantriBill = (id, data) => api.put(`/bills/${id}`, data);
export const deleteSantriBill = (id) => api.delete(`/bills/${id}`);

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
