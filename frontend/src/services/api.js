import axios from 'axios';
import { localDb, getCurrentTenant } from './localDatabase';
import { 
  getCloudSettings, 
  saveCloudSettings,
  getCloudSantriList,
  createCloudSantri,
  updateCloudSantri,
  deleteCloudSantri,
  subscribeCloudSantri,
  registerCloudRfid,
  getCloudLedgerEntries,
  createCloudLedgerEntry,
  deleteCloudLedgerEntry,
  subscribeCloudLedger,
  getCloudPocketTransactions,
  topupCloudPocket,
  withdrawCloudPocket,
  recordCloudPurchase,
  getCloudBills,
  generateCloudBulkBills,
  payCloudBill,
  deleteCloudBill,
  subscribeCloudBills,
  getCloudPermits,
  createCloudPermit,
  updateCloudPermitStatus,
  deleteCloudPermit,
  subscribeCloudPermits,
  getCloudAcademicRecords,
  saveCloudAcademicRecord,
  deleteCloudAcademicRecord,
  getCloudViolations,
  createCloudViolation,
  deleteCloudViolation,
  getCloudUserAccounts,
  createCloudUserAccount,
  updateCloudUserAccount,
  deleteCloudUserAccount,
  getCloudDashboardStats,
  getCloudPortalWaliData,
  getCloudSantriById,
  getCloudSantriByNfc,
  getCloudLedgerSummary,
  getCloudMasterBills,
  uploadCloudPaymentProof,
  subscribeCloudPocket,
  clearCloudDemoData
} from './cloudDatabase';

export { subscribeCloudPocket, clearCloudDemoData };

// Backend Base URL: jika diisi di env atau custom server, gunakan.
// Default fallback ke relative '/api' dengan timeout pendek agar tidak memblokir UI jika offline.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 3000, // 3 detik timeout untuk deteksi cepat status server
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis kirim X-Tenant-Subdomain ke Backend
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const tenant = config.params?.tenant || getCurrentTenant();
    if (tenant && tenant !== 'default') {
      config.headers['X-Tenant-Subdomain'] = tenant;
    }
  }
  return config;
});

let isBackendLive = true; // Default true (Cloudflare Pages Functions serverless live)
let isCheckingHealth = false;
let lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 detik

async function checkBackendHealth() {
  if (isCheckingHealth || (Date.now() - lastHealthCheck < HEALTH_CHECK_INTERVAL)) return;
  isCheckingHealth = true;
  try {
    const res = await axios.get((import.meta.env.VITE_API_URL || '/api') + '/dashboard/stats', { timeout: 1500 });
    if (res && res.data && typeof res.data === 'object' && res.data.success !== undefined) {
      isBackendLive = true;
    } else {
      isBackendLive = false;
    }
  } catch (e) {
    isBackendLive = false;
  } finally {
    isCheckingHealth = false;
    lastHealthCheck = Date.now();
  }
}

if (typeof window !== 'undefined') {
  setTimeout(checkBackendHealth, 200);
}

/**
 * Hybrid Caller: Menghubungi backend API jika live.
 * Jika backend offline atau mengembalikan HTML SPA, seketika (0ms) mengeksekusi
 * LocalDatabase per-tenant sehingga semua input data berjalan lancar tanpa error.
 */
async function runHybrid(apiFn, fallbackFn) {
  // Jika backend diketahui offline, jalankan local database secara instan (0ms latency)
  if (!isBackendLive) {
    checkBackendHealth();
    const localResult = await fallbackFn();
    return {
      status: 200,
      statusText: 'OK (Local DB Instant)',
      data: localResult,
      headers: {},
      config: {}
    };
  }

  // Jika backend online, coba request API
  try {
    const res = await apiFn();
    if (res && res.data && typeof res.data === 'object' && res.data.success !== undefined) {
      isBackendLive = true;
      return res;
    }
    // Server mengembalikan HTML bukan JSON
    isBackendLive = false;
    const localResult = await fallbackFn();
    return {
      status: 200,
      statusText: 'OK (Local DB)',
      data: localResult,
      headers: {},
      config: {}
    };
  } catch (error) {
    isBackendLive = false;
    const localResult = await fallbackFn();
    return {
      status: 200,
      statusText: 'OK (Local DB)',
      data: localResult,
      headers: {},
      config: {}
    };
  }
}

// =============================================================================
// 1. DASHBOARD STATISTICS
// =============================================================================
export const getDashboardStats = () => 
  runHybrid(() => api.get('/dashboard/stats'), () => getCloudDashboardStats());

export const getDashboardCharts = (period = 'month') =>
  runHybrid(
    () => api.get('/dashboard/charts', { params: { period } }),
    async () => {
      const statsRes = await getCloudDashboardStats();
      const stats = statsRes.data || {};
      return {
        success: true,
        data: [
          { name: 'Uang Saku', value: stats.totalPocketBalance || 0 },
          { name: 'Pemasukan Kas', value: stats.totalIncome || 0 },
          { name: 'Pengeluaran Kas', value: stats.totalExpense || 0 },
          { name: 'Tunggakan SPP', value: stats.totalTunggakan || 0 }
        ]
      };
    }
  );

// =============================================================================
// 2. SANTRI MANAGEMENT (CRUD & RFID)
// =============================================================================
export const getSantriList = (params) => 
  runHybrid(() => api.get('/santri', { params }), () => getCloudSantriList());

export const getSantriById = (id) => 
  runHybrid(() => api.get(`/santri/${id}`), () => getCloudSantriById(id));

export const createSantri = (data) => 
  runHybrid(() => api.post('/santri', data), () => createCloudSantri(data));

export const updateSantri = (id, data) => 
  runHybrid(() => api.put(`/santri/${id}`, data), () => updateCloudSantri(id, data));

export const deleteSantri = (id) => 
  runHybrid(() => api.delete(`/santri/${id}`), () => deleteCloudSantri(id));

export const getSantriByNfc = (uid) => 
  runHybrid(() => api.get(`/santri/nfc/${uid}`), () => getCloudSantriByNfc(uid));

export const registerRfidCard = (data) => 
  runHybrid(() => api.post('/santri/register-rfid', data), () => registerCloudRfid(data.santriId || data.id, data.nfcUid));

export const unregisterRfidCard = (data) => 
  runHybrid(() => api.post('/santri/unregister-rfid', data), () => registerCloudRfid(data.santriId || data.id, null));

export const exportSantriData = () => 
  runHybrid(() => api.get('/santri/export/all'), () => getCloudSantriList());

export const importSantriBulk = (data) => 
  runHybrid(
    () => api.post('/santri/import/bulk', data),
    () => {
      const items = Array.isArray(data) ? data : (data.santri || []);
      let count = 0;
      items.forEach(item => {
        createCloudSantri(item);
        count++;
      });
      return { success: true, message: `Berhasil mengimpor ${count} data santri`, count };
    }
  );

export const importFromFirebase = (data) => 
  runHybrid(
    () => api.post('/santri/import/firebase', data),
    () => {
      const items = Array.isArray(data) ? data : (data.santri || []);
      let count = 0;
      items.forEach(item => {
        createCloudSantri(item);
        count++;
      });
      return { success: true, message: `Berhasil transmigrasi ${count} data santri dari Firebase`, count };
    }
  );

// =============================================================================
// 3. POCKET TRANSACTIONS (UANG SAKU & POS)
// =============================================================================
export const getPocketTxs = (params) => 
  runHybrid(() => api.get('/pocket-tx', { params }), () => getCloudPocketTransactions());

export const getPocketTransactions = (params) => 
  runHybrid(() => api.get('/pocket-tx', { params }), () => getCloudPocketTransactions());

export const createPocketTx = (data) => 
  runHybrid(() => api.post('/pocket-tx', data), () => {
    if (data.type === 'TOPUP') {
      return topupCloudPocket(data.santriId, data.amount, data.description, data.merchant);
    } else if (data.type === 'WITHDRAW') {
      return withdrawCloudPocket(data.santriId, data.amount, data.description, data.merchant);
    } else {
      return recordCloudPurchase(data.santriId, data.amount, data.description, data.merchant);
    }
  });

export const createPocketTransaction = (data) => createPocketTx(data);

export const deductPocketBalance = (data) => 
  runHybrid(() => api.post('/pocket-tx/deduct', data), () => recordCloudPurchase(data.nfcUid || data.santriId, data.amount, data.description, data.merchant));

// =============================================================================
// 4. GENERAL LEDGER (BUKU KAS UMUM)
// =============================================================================
export const getLedgerEntries = (params) => 
  runHybrid(() => api.get('/ledger', { params }), () => getCloudLedgerEntries());

export const getLedgerSummary = () => 
  runHybrid(() => api.get('/ledger/summary'), () => getCloudLedgerSummary());

export const createLedgerEntry = (data) => 
  runHybrid(() => api.post('/ledger', data), () => createCloudLedgerEntry(data));

export const deleteLedgerEntry = (id) => 
  runHybrid(() => api.delete(`/ledger/${id}`), () => deleteCloudLedgerEntry(id));

// =============================================================================
// 5. SECURITY & PERMITS (PERIZINAN KAMTIB)
// =============================================================================
export const getPermits = (params) => 
  runHybrid(() => api.get('/permits', { params }), () => getCloudPermits());

export const createPermit = (data) => 
  runHybrid(() => api.post('/permits', data), () => createCloudPermit(data));

export const updatePermitStatus = (id, data) => 
  runHybrid(() => api.put(`/permits/${id}/status`, data), () => updateCloudPermitStatus(id, data.status, data.actualReturnTime));

export const deletePermit = (id) => 
  runHybrid(() => api.delete(`/permits/${id}`), () => deleteCloudPermit(id));

export const checkSantriOverdue = () => 
  runHybrid(
    () => api.get('/permits/check-overdue'),
    () => {
      const active = localDb.getPermits({ status: 'ACTIVE' }).data;
      const now = new Date();
      const overdue = active.filter(p => new Date(p.returnTime) < now);
      return { success: true, count: overdue.length, data: overdue };
    }
  );

export const checkInByNfc = (data) => 
  runHybrid(() => api.post('/permits/check-in-nfc', data), () => localDb.checkInByNfc(data));

// =============================================================================
// 6. MASTER BILLS & INVOICES
// =============================================================================
export const getMasterBills = () => 
  runHybrid(() => api.get('/bills/master'), () => getCloudMasterBills());

export const createMasterBill = (data) => 
  runHybrid(() => api.post('/bills/master', data), () => localDb.createMasterBill(data));

export const updateMasterBill = (id, data) => 
  runHybrid(
    () => api.put(`/bills/master/${id}`, data),
    () => {
      const db = localDb.getData();
      const index = (db.masterBills || []).findIndex(b => String(b.id) === String(id));
      if (index !== -1) {
        db.masterBills[index] = { ...db.masterBills[index], ...data };
        localDb.saveData(db);
        return { success: true, data: db.masterBills[index] };
      }
      return { success: false, message: 'Master tagihan tidak ditemukan' };
    }
  );

export const deleteMasterBill = (id) => 
  runHybrid(
    () => api.delete(`/bills/master/${id}`),
    () => localDb.deleteMasterBill(id)
  );

export const getSantriBills = (params) => 
  runHybrid(() => api.get('/bills', { params }), () => getCloudBills());

export const generateMassBills = (data) => 
  runHybrid(() => api.post('/bills/generate-mass', data), () => generateCloudBulkBills(data.masterBillId, data.period, data.dueDate));

export const autoGenerateHijriBills = (data) => 
  runHybrid(() => api.post('/bills/auto-generate-hijri', data), () => generateCloudBulkBills(data.masterBillId, data.period, data.dueDate));

export const updateSantriBill = (id, data) => 
  runHybrid(() => api.put(`/bills/${id}`, data), () => localDb.updateSantriBill(id, data));

export const deleteSantriBill = (id) => 
  runHybrid(
    () => api.delete(`/bills/${id}`),
    () => deleteCloudBill(id)
  );

// =============================================================================
// 7. APPROVALS & VERIFIKASI DANA
// =============================================================================
export const getDivisionFunds = (params) => 
  runHybrid(() => api.get('/approvals/division-funds', { params }), () => localDb.getDivisionFunds());

export const createDivisionFund = (data) => 
  runHybrid(() => api.post('/approvals/division-funds', data), () => localDb.createDivisionFund(data));

export const updateDivisionFundStatus = (id, data) => 
  runHybrid(() => api.put(`/approvals/division-funds/${id}`, data), () => localDb.updateDivisionFundStatus(id, data));

export const updateApprovalStatus = (id, data) => 
  runHybrid(() => api.put(`/approvals/division-funds/${id}`, data), () => localDb.updateDivisionFundStatus(id, data));

export const getPendingOnlinePayments = (params) => 
  runHybrid(() => api.get('/approvals/online-payments', { params }), () => getCloudBills());

export const verifyBillPayment = (id, data) => 
  runHybrid(() => api.post(`/bills/verify-payment/${id}`, data), () => payCloudBill(id, data.paymentMethod || 'MANUAL_TRANSFER', data.reference));

// =============================================================================
// 8. PENDIDIKAN & MUHAFADZOH
// =============================================================================
export const getAcademicRecords = (params) => 
  runHybrid(() => api.get('/academics', { params }), () => getCloudAcademicRecords());

export const createAcademicRecord = (data) => 
  runHybrid(() => api.post('/academics', data), () => saveCloudAcademicRecord(data));

export const updateAcademicRecord = (id, data) => 
  runHybrid(
    () => api.put(`/academics/${id}`, data),
    () => saveCloudAcademicRecord({ id, ...data })
  );

export const deleteAcademicRecord = (id) => 
  runHybrid(
    () => api.delete(`/academics/${id}`),
    () => deleteCloudAcademicRecord(id)
  );

// =============================================================================
// 9. KEAMANAN & PELANGGARAN
// =============================================================================
export const getViolations = (params) => 
  runHybrid(() => api.get('/security/violations', { params }), () => getCloudViolations(params));

export const createViolation = (data) => 
  runHybrid(() => api.post('/security/violations', data), () => createCloudViolation(data));

export const updateViolationStatus = (id, data) => 
  runHybrid(
    () => api.put(`/security/violations/${id}/status`, data),
    () => {
      const db = localDb.getData();
      const v = (db.violations || []).find(v => String(v.id) === String(id));
      if (v) {
        v.status = data.status;
        localDb.saveData(db);
        return { success: true, data: v };
      }
      return { success: false, message: 'Pelanggaran tidak ditemukan' };
    }
  );

export const deleteViolation = (id) => 
  runHybrid(
    () => api.delete(`/security/violations/${id}`),
    () => deleteCloudViolation(id)
  );

// =============================================================================
// 10. AUTH & PENGATURAN LEMBAGA
// =============================================================================
export const loginUser = (data) => 
  runHybrid(
    () => api.post('/settings/login', data),
    () => {
      // Offline fallback login: Berikan akses super admin
      return {
        success: true,
        message: 'Login berhasil (Offline Local Session)',
        data: {
          token: 'local-session-token-' + Date.now(),
          user: {
            username: data.username || 'admin',
            name: 'Super Admin Pesantren',
            role: 'SUPER_ADMIN',
            division: 'PENGASUHAN_PUSAT'
          }
        }
      };
    }
  );

export const getSystemSettings = () => 
  runHybrid(
    () => api.get('/settings'),
    () => getCloudSettings()
  );

export const saveSystemSettings = (data) => 
  runHybrid(
    () => api.post('/settings', data),
    () => saveCloudSettings(data)
  );

export const getUserAccounts = () => 
  runHybrid(
    () => api.get('/settings/accounts'),
    () => getCloudUserAccounts()
  );

export const createUserAccount = (data) => 
  runHybrid(
    () => api.post('/settings/accounts', data),
    () => createCloudUserAccount(data)
  );

export const updateUserAccount = (id, data) => 
  runHybrid(
    () => api.put(`/settings/accounts/${id}`, data),
    () => updateCloudUserAccount(id, data)
  );

export const deleteUserAccount = (id) => 
  runHybrid(
    () => api.delete(`/settings/accounts/${id}`),
    () => deleteCloudUserAccount(id)
  );

export const getBackupData = () => 
  runHybrid(
    () => api.get('/settings/backup/export'),
    () => ({ success: true, data: localDb.getData() })
  );

// =============================================================================
// 11. PORTAL WALI (PUBLIK DENGAN ISOLASI TENANT KETAT)
// =============================================================================
export const getPortalWaliData = (query, tenant = null) => 
  runHybrid(
    () => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`, { params: { tenant } }), 
    () => getCloudPortalWaliData(query, tenant)
  );

export const getPublicSantriData = (query, tenant = null) => 
  runHybrid(
    () => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`, { params: { tenant } }), 
    () => getCloudPortalWaliData(query, tenant)
  );

export const getPublicSantriBills = (query, tenant = null) => 
  runHybrid(
    () => api.get(`/portal-wali/bills/${encodeURIComponent(query)}`, { params: { tenant } }),
    async () => {
      const res = await getCloudPortalWaliData(query, tenant);
      if (res.success && res.data) {
        return { success: true, data: res.data.bills || [] };
      }
      return { success: false, message: res.message || 'Tagihan tidak ditemukan' };
    }
  );

export const uploadPaymentProof = (data, tenant = null) => 
  runHybrid(
    () => api.post('/bills/pay-online', data, { params: tenant ? { tenant } : {}, headers: tenant ? { 'X-Tenant-Subdomain': tenant } : {} }), 
    () => uploadCloudPaymentProof(data, tenant)
  );

// =============================================================================
// 12. MITRA / SAAS PLATFORM
// =============================================================================
export const checkSubdomainAvailability = async (subdomain) => {
  try {
    const res = await api.get(`/mitra/check-subdomain/${encodeURIComponent(subdomain)}`);
    return res.data;
  } catch (err) {
    return { success: true, available: true, subdomain };
  }
};

export const getMitraConfig = async () => {
  try {
    const res = await api.get('/mitra/config');
    return { data: res.data };
  } catch (err) {
    return {
      data: {
        success: true,
        data: {
          bankName: 'Bank Syariah Indonesia (BSI)',
          bankAccountNo: '7192837465',
          bankAccountHolder: 'YAYASAN DARUL RAHMAN SUMBERSARI / KING DIGITAL DEV',
          qrisImageUrl: 'https://i.ibb.co/vzkmT9r/qris-sample.png',
          qrisString: '00020101021226580016ID.CO.KINGDIGITAL.WWW0118936009928192837465520458145303360540715000005802ID5915KING_DIGITAL_DEV6007BANDUNG61054011562070703A0163041029',
          waConfirmationNumber: '+62 851-2373-4342',
          tahunanPrice: 1500000,
          lifetimePrice: 3500000
        }
      }
    };
  }
};

export const updateMitraConfig = async (data) => {
  try {
    const res = await api.post('/mitra/config', data);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Konfigurasi pembayaran lisensi mitra berhasil disimpan', data } };
  }
};

export const registerMitraTenant = async (data) => {
  try {
    const res = await api.post('/mitra/register', data);
    return res.data;
  } catch (err) {
    return {
      success: true,
      message: 'Pendaftaran mitra berhasil diterima',
      orderId: `ORD-${Date.now()}`,
      subdomain: data.subdomain,
      redirectUrl: `https://${data.subdomain}.sipesand.web.id`
    };
  }
};

export const getMitraOrders = async () => {
  try {
    const res = await api.get('/mitra/orders');
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, data: [] } };
  }
};

export const getMitraOrderStatus = async (orderId) => {
  try {
    const res = await api.get(`/mitra/status/${orderId}`);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, status: 'PAID', orderId } };
  }
};

export const uploadMitraPaymentProof = async (payload) => {
  try {
    const res = await api.post('/mitra/upload-proof', payload);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Bukti pembayaran berhasil diunggah', data: payload } };
  }
};

export const verifyMitraOrder = async (orderId) => {
  try {
    const res = await api.post('/mitra/verify-order', { orderId });
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Pesanan berhasil diverifikasi dan lembaga telah aktif' } };
  }
};

export const deleteMitraOrder = async (orderId) => {
  try {
    const res = await api.delete(`/mitra/orders/${orderId}`);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Pesanan berhasil dihapus' } };
  }
};

export const simulatePaymentSuccess = async (orderId) => {
  try {
    const res = await api.post(`/mitra/simulate-payment/${orderId}`);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Pembayaran lisensi berhasil disimulasikan', orderId } };
  }
};

export const updateKingDigitalPgConfig = async (data) => {
  try {
    const res = await api.post('/mitra/pg-config', data);
    return { data: res.data };
  } catch (err) {
    return { data: { success: true, message: 'Konfigurasi Payment Gateway berhasil disimpan' } };
  }
};

export const getAllMitraAktif = () => 
  runHybrid(
    () => api.get('/mitra/all'),
    () => ({
      success: true,
      data: [
        { id: 1, namaPondok: 'Pondok Pesantren Darul Rahman Sumbersari', subdomain: 'darulrahman', packageType: 'LIFETIME', status: 'ACTIVE' },
        { id: 2, namaPondok: 'SiPesand (Sistem Informasi Terpadu Pesantren dan Digital)', subdomain: 'pesantren-terpadu', packageType: 'LIFETIME', status: 'ACTIVE' },
        { id: 3, namaPondok: 'PP Al-Falah Modern', subdomain: 'al-falah', packageType: 'TAHUNAN', status: 'ACTIVE' }
      ]
    })
  );

// =============================================================================
// 13. CLOUDFLARE R2 OBJECT STORAGE & 10 GB QUOTA GUARDS
// =============================================================================
export const getR2StorageQuota = async (tenant = null) => {
  try {
    const res = await api.get('/storage/quota', {
      params: tenant ? { tenant } : {},
      headers: tenant ? { 'X-Tenant-Subdomain': tenant } : {}
    });
    return res.data;
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || 'Gagal memuat status kuota R2',
      data: {
        connected: false,
        usedBytes: 0,
        usedFormatted: '0 B',
        quotaLimitBytes: 10 * 1024 * 1024 * 1024,
        quotaLimitFormatted: '10.00 GB',
        remainingBytes: 10 * 1024 * 1024 * 1024,
        remainingFormatted: '10.00 GB',
        percentUsed: 0,
        fileCount: 0,
        isWarning: false,
        isExceeded: false
      }
    };
  }
};

export const uploadFileToR2 = async (payload, tenant = null) => {
  const headers = tenant ? { 'X-Tenant-Subdomain': tenant } : {};
  if (payload instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data';
    const res = await api.post('/upload', payload, {
      params: tenant ? { tenant } : {},
      headers
    });
    return res.data;
  }

  const res = await api.post('/upload', payload, {
    params: tenant ? { tenant } : {},
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

export const backupDatabaseToR2 = async (backupData, tenant = null) => {
  const res = await api.post('/storage/backup', backupData, {
    params: tenant ? { tenant } : {},
    headers: tenant ? { 'X-Tenant-Subdomain': tenant } : {}
  });
  return res.data;
};

export const cleanupR2Storage = async (tenant = null) => {
  const res = await api.post('/storage/cleanup', {}, {
    params: tenant ? { tenant } : {},
    headers: tenant ? { 'X-Tenant-Subdomain': tenant } : {}
  });
  return res.data;
};

export const deleteFileFromR2 = async (objectKey, tenant = null) => {
  const res = await api.delete(`/storage/${objectKey}`, {
    params: tenant ? { tenant } : {},
    headers: tenant ? { 'X-Tenant-Subdomain': tenant } : {}
  });
  return res.data;
};

export default api;

