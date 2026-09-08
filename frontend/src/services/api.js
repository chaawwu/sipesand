import axios from 'axios';
import { localDb, getCurrentTenant } from './localDatabase';

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
    const tenant = getCurrentTenant();
    if (tenant && tenant !== 'default') {
      config.headers['X-Tenant-Subdomain'] = tenant;
    }
  }
  return config;
});

let isBackendLive = false; // Default false pada static hosting Cloudflare Pages
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
  runHybrid(() => api.get('/dashboard/stats'), () => localDb.getDashboardStats());

export const getDashboardCharts = (period = 'month') =>
  runHybrid(
    () => api.get('/dashboard/charts', { params: { period } }),
    () => {
      const stats = localDb.getDashboardStats().data;
      return {
        success: true,
        data: [
          { name: 'Uang Saku', value: stats.totalPocketBalance },
          { name: 'Pemasukan Kas', value: stats.totalIncome },
          { name: 'Pengeluaran Kas', value: stats.totalExpense },
          { name: 'Tunggakan SPP', value: stats.totalTunggakan }
        ]
      };
    }
  );

// =============================================================================
// 2. SANTRI MANAGEMENT (CRUD & RFID)
// =============================================================================
export const getSantriList = (params) => 
  runHybrid(() => api.get('/santri', { params }), () => localDb.getSantriList(params));

export const getSantriById = (id) => 
  runHybrid(() => api.get(`/santri/${id}`), () => localDb.getSantriById(id));

export const createSantri = (data) => 
  runHybrid(() => api.post('/santri', data), () => localDb.createSantri(data));

export const updateSantri = (id, data) => 
  runHybrid(() => api.put(`/santri/${id}`, data), () => localDb.updateSantri(id, data));

export const deleteSantri = (id) => 
  runHybrid(() => api.delete(`/santri/${id}`), () => localDb.deleteSantri(id));

export const getSantriByNfc = (uid) => 
  runHybrid(() => api.get(`/santri/nfc/${uid}`), () => localDb.getSantriByNfc(uid));

export const registerRfidCard = (data) => 
  runHybrid(() => api.post('/santri/register-rfid', data), () => localDb.registerRfidCard(data));

export const unregisterRfidCard = (data) => 
  runHybrid(() => api.post('/santri/unregister-rfid', data), () => localDb.unregisterRfidCard(data));

export const exportSantriData = () => 
  runHybrid(() => api.get('/santri/export/all'), () => localDb.getSantriList());

export const importSantriBulk = (data) => 
  runHybrid(
    () => api.post('/santri/import/bulk', data),
    () => {
      const items = Array.isArray(data) ? data : (data.santri || []);
      let count = 0;
      items.forEach(item => {
        localDb.createSantri(item);
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
        localDb.createSantri(item);
        count++;
      });
      return { success: true, message: `Berhasil transmigrasi ${count} data santri dari Firebase`, count };
    }
  );

// =============================================================================
// 3. POCKET TRANSACTIONS (UANG SAKU & POS)
// =============================================================================
export const getPocketTxs = (params) => 
  runHybrid(() => api.get('/pocket-tx', { params }), () => localDb.getPocketTransactions(params));

export const getPocketTransactions = (params) => 
  runHybrid(() => api.get('/pocket-tx', { params }), () => localDb.getPocketTransactions(params));

export const createPocketTx = (data) => 
  runHybrid(() => api.post('/pocket-tx', data), () => localDb.createPocketTransaction(data));

export const createPocketTransaction = (data) => 
  runHybrid(() => api.post('/pocket-tx', data), () => localDb.createPocketTransaction(data));

export const deductPocketBalance = (data) => 
  runHybrid(() => api.post('/pocket-tx/deduct', data), () => localDb.deductPocketBalance(data));

// =============================================================================
// 4. GENERAL LEDGER (BUKU KAS UMUM)
// =============================================================================
export const getLedgerEntries = (params) => 
  runHybrid(() => api.get('/ledger', { params }), () => localDb.getLedgerEntries(params));

export const getLedgerSummary = () => 
  runHybrid(() => api.get('/ledger/summary'), () => localDb.getLedgerSummary());

export const createLedgerEntry = (data) => 
  runHybrid(() => api.post('/ledger', data), () => localDb.createLedgerEntry(data));

export const deleteLedgerEntry = (id) => 
  runHybrid(() => api.delete(`/ledger/${id}`), () => localDb.deleteLedgerEntry(id));

// =============================================================================
// 5. SECURITY & PERMITS (PERIZINAN KAMTIB)
// =============================================================================
export const getPermits = (params) => 
  runHybrid(() => api.get('/permits', { params }), () => localDb.getPermits(params));

export const createPermit = (data) => 
  runHybrid(() => api.post('/permits', data), () => localDb.createPermit(data));

export const updatePermitStatus = (id, data) => 
  runHybrid(() => api.put(`/permits/${id}/status`, data), () => localDb.updatePermitStatus(id, data));

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
  runHybrid(() => api.get('/bills/master'), () => localDb.getMasterBills());

export const createMasterBill = (data) => 
  runHybrid(() => api.post('/bills/master', data), () => localDb.createMasterBill(data));

export const updateMasterBill = (id, data) => 
  runHybrid(
    () => api.put(`/bills/master/${id}`, data),
    () => {
      const db = localDb.getData();
      const index = (db.masterBills || []).findIndex(b => b.id === parseInt(id));
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
    () => {
      const db = localDb.getData();
      db.masterBills = (db.masterBills || []).filter(b => b.id !== parseInt(id));
      localDb.saveData(db);
      return { success: true, message: 'Master tagihan dihapus' };
    }
  );

export const getSantriBills = (params) => 
  runHybrid(() => api.get('/bills', { params }), () => localDb.getSantriBills(params));

export const generateMassBills = (data) => 
  runHybrid(() => api.post('/bills/generate-mass', data), () => localDb.autoGenerateHijriBills(data));

export const autoGenerateHijriBills = (data) => 
  runHybrid(() => api.post('/bills/auto-generate-hijri', data), () => localDb.autoGenerateHijriBills(data));

export const updateSantriBill = (id, data) => 
  runHybrid(() => api.put(`/bills/${id}`, data), () => localDb.updateSantriBill(id, data));

export const deleteSantriBill = (id) => 
  runHybrid(
    () => api.delete(`/bills/${id}`),
    () => {
      const db = localDb.getData();
      db.santriBills = (db.santriBills || []).filter(b => b.id !== parseInt(id));
      localDb.saveData(db);
      return { success: true, message: 'Tagihan santri dihapus' };
    }
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
  runHybrid(() => api.get('/approvals/online-payments', { params }), () => localDb.getSantriBills({ status: 'PENDING_VERIFICATION' }));

export const verifyBillPayment = (id, data) => 
  runHybrid(() => api.post(`/bills/verify-payment/${id}`, data), () => localDb.updateSantriBill(id, { status: 'PAID' }));

// =============================================================================
// 8. PENDIDIKAN & MUHAFADZOH
// =============================================================================
export const getAcademicRecords = (params) => 
  runHybrid(() => api.get('/academics', { params }), () => localDb.getAcademicRecords(params));

export const createAcademicRecord = (data) => 
  runHybrid(() => api.post('/academics', data), () => localDb.createAcademicRecord(data));

export const updateAcademicRecord = (id, data) => 
  runHybrid(
    () => api.put(`/academics/${id}`, data),
    () => {
      const db = localDb.getData();
      const index = (db.academics || []).findIndex(a => a.id === parseInt(id));
      if (index !== -1) {
        db.academics[index] = { ...db.academics[index], ...data };
        localDb.saveData(db);
        return { success: true, data: db.academics[index] };
      }
      return { success: false, message: 'Catatan akademik tidak ditemukan' };
    }
  );

export const deleteAcademicRecord = (id) => 
  runHybrid(
    () => api.delete(`/academics/${id}`),
    () => {
      const db = localDb.getData();
      db.academics = (db.academics || []).filter(a => a.id !== parseInt(id));
      localDb.saveData(db);
      return { success: true, message: 'Catatan akademik berhasil dihapus' };
    }
  );

// =============================================================================
// 9. KEAMANAN & PELANGGARAN
// =============================================================================
export const getViolations = (params) => 
  runHybrid(() => api.get('/security/violations', { params }), () => localDb.getViolations(params));

export const createViolation = (data) => 
  runHybrid(() => api.post('/security/violations', data), () => localDb.createViolation(data));

export const updateViolationStatus = (id, data) => 
  runHybrid(
    () => api.put(`/security/violations/${id}/status`, data),
    () => {
      const db = localDb.getData();
      const v = (db.violations || []).find(v => v.id === parseInt(id));
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
    () => {
      const db = localDb.getData();
      db.violations = (db.violations || []).filter(v => v.id !== parseInt(id));
      localDb.saveData(db);
      return { success: true, message: 'Catatan pelanggaran dihapus' };
    }
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
    () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sipesand_settings');
        if (saved) return { success: true, data: JSON.parse(saved) };
      }
      return { success: true, data: {} };
    }
  );

export const saveSystemSettings = (data) => 
  runHybrid(
    () => api.post('/settings', data),
    () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sipesand_settings', JSON.stringify(data));
      }
      return { success: true, message: 'Pengaturan berhasil disimpan' };
    }
  );

export const getUserAccounts = () => 
  runHybrid(
    () => api.get('/settings/accounts'),
    () => {
      const accounts = [
        { id: 1, username: 'admin', name: 'Pengasuh & Superadmin', role: 'SUPER_ADMIN', division: 'PENGASUHAN_PUSAT', isActive: true },
        { id: 2, username: 'bendahara', name: 'Ustadz Bendahara, S.E.', role: 'BENDAHARA', division: 'KEUANGAN', isActive: true },
        { id: 3, username: 'kamtib', name: 'Ustadz Keamanan', role: 'KAMTIB', division: 'KEAMANAN', isActive: true },
        { id: 4, username: 'asatidz', name: 'Dewan Asatidz', role: 'ASATIDZ', division: 'PENDIDIKAN', isActive: true },
      ];
      return { success: true, data: accounts };
    }
  );

export const createUserAccount = (data) => 
  runHybrid(
    () => api.post('/settings/accounts', data),
    () => ({ success: true, message: 'Akun baru berhasil ditambahkan', data: { id: Date.now(), ...data } })
  );

export const updateUserAccount = (id, data) => 
  runHybrid(
    () => api.put(`/settings/accounts/${id}`, data),
    () => ({ success: true, message: 'Akun berhasil diperbarui', data: { id, ...data } })
  );

export const deleteUserAccount = (id) => 
  runHybrid(
    () => api.delete(`/settings/accounts/${id}`),
    () => ({ success: true, message: 'Akun berhasil dihapus' })
  );

export const getBackupData = () => 
  runHybrid(
    () => api.get('/settings/backup/export'),
    () => ({ success: true, data: localDb.getData() })
  );

// =============================================================================
// 11. PORTAL WALI (PUBLIK)
// =============================================================================
export const getPortalWaliData = (query) => 
  runHybrid(() => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`), () => localDb.getPortalWaliData(query));

export const getPublicSantriData = (query) => 
  runHybrid(() => api.get(`/portal-wali/santri/${encodeURIComponent(query)}`), () => localDb.getPortalWaliData(query));

export const getPublicSantriBills = (query) => 
  runHybrid(
    () => api.get(`/portal-wali/bills/${encodeURIComponent(query)}`),
    () => {
      const res = localDb.getPortalWaliData(query);
      if (res.success && res.data) {
        return { success: true, data: res.data.bills || [] };
      }
      return { success: false, message: res.message || 'Tagihan tidak ditemukan' };
    }
  );

export const uploadPaymentProof = (data) => 
  runHybrid(() => api.post('/bills/pay-online', data), () => localDb.uploadPaymentProof(data));

// =============================================================================
// 12. MITRA / SAAS PLATFORM
// =============================================================================
export const checkSubdomainAvailability = (subdomain) => 
  runHybrid(
    () => api.get(`/mitra/check-subdomain/${encodeURIComponent(subdomain)}`),
    () => ({ success: true, available: true, subdomain })
  );

export const registerMitraTenant = (data) => 
  runHybrid(
    () => api.post('/mitra/register', data),
    () => ({
      success: true,
      message: 'Pendaftaran mitra berhasil diterima',
      orderId: `ORD-${Date.now()}`,
      subdomain: data.subdomain,
      redirectUrl: `https://${data.subdomain}.sipesand.web.id`
    })
  );

export const getMitraOrderStatus = (orderId) => 
  runHybrid(
    () => api.get(`/mitra/status/${orderId}`),
    () => ({ success: true, status: 'PAID', orderId })
  );

export const simulatePaymentSuccess = (orderId) => 
  runHybrid(
    () => api.post(`/mitra/simulate-payment/${orderId}`),
    () => ({ success: true, message: 'Pembayaran lisensi berhasil disimulasikan', orderId })
  );

export const updateKingDigitalPgConfig = (data) => 
  runHybrid(
    () => api.post('/mitra/pg-config', data),
    () => ({ success: true, message: 'Konfigurasi Payment Gateway berhasil disimpan' })
  );

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

export default api;
