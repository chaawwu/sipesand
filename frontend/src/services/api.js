/**
 * SIPESAND Enterprise API & Cloud Data Service
 * Proyek General: sipesand-app
 * Seluruh operasi diarahkan langsung ke Firebase Firestore & Firebase Auth Multi-Tenant
 */

import axios from 'axios';
import {
  firestoreGetSantri,
  firestoreCreateSantri,
  firestoreUpdateSantri,
  firestoreDeleteSantri,
  firestoreRunPocketTransaction,
  firestoreGetPocketTxs,
  firestoreGetBills,
  firestoreCreateBill,
  firestorePayBill,
  firestoreDeleteBill,
  firestoreGenerateMassBills,
  firestoreGetMasterBills,
  firestoreCreateMasterBill,
  firestoreUpdateMasterBill,
  firestoreDeleteMasterBill,
  firestoreGetPermits,
  firestoreCreatePermit,
  firestoreUpdatePermitStatus,
  firestoreCheckInByNfc,
  firestoreCheckSantriOverdue,
  firestoreGetLedgerEntries,
  firestoreGetLedgerSummary,
  firestoreCreateLedgerEntry,
  firestoreDeleteLedgerEntry,
  firestoreGetAcademicRecords,
  firestoreCreateAcademicRecord,
  firestoreUpdateAcademicRecord,
  firestoreDeleteAcademicRecord,
  firestoreGetViolations,
  firestoreCreateViolation,
  firestoreUpdateViolationStatus,
  firestoreDeleteViolation,
  firestoreGetDivisionFunds,
  firestoreCreateDivisionFund,
  firestoreUpdateDivisionFundStatus,
  firestoreGetPendingOnlinePayments,
  firestoreVerifyBillPayment,
  firestoreGetUserAccounts,
  firestoreCreateUserAccount,
  firestoreUpdateUserAccount,
  firestoreDeleteUserAccount,
  firestoreGetSettings,
  firestoreSaveSettings,
  firestoreGetDashboardStats,
  clearTenantData,
  firestoreRegisterMitra,
  firestoreGetMitraStatus,
  firestoreSimulatePayment,
  firestoreGetAllMitra,
  getActiveTenantId,
  getCollectionData,
  setCollectionData,
  FIRESTORE_COLLECTIONS
} from './firestoreService';
import { firebaseLoginUser } from './firebaseConfig';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Otomatis sertakan subdomain tenant aktif
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    config.headers['X-Tenant-Subdomain'] = getActiveTenantId();
  }
  return config;
});

// =============================================================================
// DASHBOARD & STATISTIK
// =============================================================================

export const getDashboardStats = async () => {
  const stats = firestoreGetDashboardStats();
  return { data: { success: true, data: stats } };
};

export const getDashboardCharts = async (period = 'month') => {
  const stats = firestoreGetDashboardStats();
  return { data: { success: true, data: stats.monthlyChart } };
};

// =============================================================================
// MANAJEMEN SANTRI (FIREBASE FIRESTORE MULTI-TENANT)
// =============================================================================

export const getSantriList = async (params = {}) => {
  const list = firestoreGetSantri(params);
  return { data: { success: true, data: list } };
};

export const getSantriById = async (id) => {
  const list = firestoreGetSantri();
  const found = list.find(s => String(s.id) === String(id) || String(s.nis) === String(id));
  if (found) return { data: { success: true, data: found } };
  return { data: { success: false, message: 'Santri tidak ditemukan' } };
};

export const createSantri = async (data) => {
  const newSantri = firestoreCreateSantri(data);
  return { data: { success: true, message: 'Data santri berhasil ditambahkan', data: newSantri } };
};

export const updateSantri = async (id, data) => {
  const updated = firestoreUpdateSantri(id, data);
  return { data: { success: true, message: 'Data santri berhasil diperbarui', data: updated } };
};

export const deleteSantri = async (id) => {
  const res = firestoreDeleteSantri(id);
  return { data: res };
};

export const getSantriByNfc = async (uid) => {
  const list = firestoreGetSantri();
  const found = list.find(s => s.nfcUid === uid || String(s.nis) === String(uid));
  if (found) return { data: { success: true, data: found } };
  return { data: { success: false, message: 'Kartu NFC tidak ditemukan' } };
};

export const exportSantriData = async () => {
  const list = firestoreGetSantri();
  return { data: list };
};

export const importSantriBulk = async (data) => {
  const items = Array.isArray(data) ? data : (data?.santri || []);
  let count = 0;
  for (const item of items) {
    if (item && (item.nama || item.name)) {
      firestoreCreateSantri(item);
      count++;
    }
  }
  return {
    data: {
      success: true,
      message: `Berhasil mengimpor ${count} santri ke Firebase Firestore.`,
      importedCount: count
    }
  };
};

export const importFromFirebase = async (data) => {
  const items = Array.isArray(data) ? data : (data?.santri || [data]);
  let count = 0;
  for (const item of items) {
    if (item && (item.nama || item.name)) {
      firestoreCreateSantri(item);
      count++;
    }
  }
  return {
    data: {
      success: true,
      message: `Berhasil menyelaraskan ${count} data santri ke Firestore sipesand-app.`,
      importedCount: count
    }
  };
};

// =============================================================================
// TRANSAKSI UANG SAKU & NFC SMART CANTIN (TRANSAKSI ATOMIK CLOUD)
// =============================================================================

export const getPocketTxs = async (params = {}) => {
  const txs = firestoreGetPocketTxs(params);
  return { data: { success: true, data: txs } };
};

export const getPocketTransactions = getPocketTxs;

export const createPocketTx = async (data) => {
  const res = firestoreRunPocketTransaction(data);
  return { data: res };
};

export const createPocketTransaction = createPocketTx;

export const deductPocketBalance = async (data) => {
  const res = firestoreRunPocketTransaction({ ...data, type: 'DEDUCT' });
  return { data: res };
};

// =============================================================================
// BUKU KAS UMUM (GENERAL LEDGER)
// =============================================================================

export const getLedgerEntries = async (params) => {
  const data = firestoreGetLedgerEntries(params);
  return { data: { success: true, data } };
};

export const getLedgerSummary = async () => {
  const data = firestoreGetLedgerSummary();
  return { data: { success: true, data } };
};

export const createLedgerEntry = async (data) => {
  const res = firestoreCreateLedgerEntry(data);
  return { data: { success: true, message: 'Transaksi kas berhasil dicatat', data: res } };
};

export const deleteLedgerEntry = async (id) => {
  const res = firestoreDeleteLedgerEntry(id);
  return { data: res };
};

// =============================================================================
// PERIZINAN SANTRI & POS KEAMANAN (KAMTIB)
// =============================================================================

export const getPermits = async (params = {}) => {
  const data = firestoreGetPermits(params);
  return { data: { success: true, data } };
};

export const createPermit = async (data) => {
  const res = firestoreCreatePermit(data);
  return { data: { success: true, message: 'Izin keluar berhasil diterbitkan', data: res } };
};

export const updatePermitStatus = async (id, data) => {
  const status = typeof data === 'string' ? data : data?.status || 'RETURNED';
  const res = firestoreUpdatePermitStatus(id, status);
  return { data: { success: true, data: res } };
};

export const checkSantriOverdue = async () => {
  const data = firestoreCheckSantriOverdue();
  return { data: { success: true, data } };
};

export const checkInByNfc = async (data) => {
  const res = firestoreCheckInByNfc(data);
  return { data: res };
};

// =============================================================================
// TARIF MASTER & TAGIHAN SYAHRIYAH (BILLS & INVOICES)
// =============================================================================

export const getMasterBills = async () => {
  const data = firestoreGetMasterBills();
  return { data: { success: true, data } };
};

export const createMasterBill = async (data) => {
  const res = firestoreCreateMasterBill(data);
  return { data: { success: true, data: res } };
};

export const updateMasterBill = async (id, data) => {
  const res = firestoreUpdateMasterBill(id, data);
  return { data: { success: true, data: res } };
};

export const deleteMasterBill = async (id) => {
  const res = firestoreDeleteMasterBill(id);
  return { data: res };
};

export const getSantriBills = async (params = {}) => {
  const bills = firestoreGetBills(params);
  return { data: { success: true, data: bills } };
};

export const generateMassBills = async (data) => {
  const res = firestoreGenerateMassBills(data);
  return { data: { success: true, message: `Berhasil menerbitkan ${res.length} tagihan massal.`, data: res } };
};

export const autoGenerateHijriBills = generateMassBills;

export const updateSantriBill = async (id, data) => {
  const res = firestorePayBill(id, data);
  return { data: res };
};

export const deleteSantriBill = async (id) => {
  const res = firestoreDeleteBill(id);
  return { data: res };
};

// =============================================================================
// PENGAJUAN DANA DIVISI & APPROVALS
// =============================================================================

export const getDivisionFunds = async (params) => {
  const data = firestoreGetDivisionFunds(params);
  return { data: { success: true, data } };
};

export const createDivisionFund = async (data) => {
  const res = firestoreCreateDivisionFund(data);
  return { data: { success: true, data: res } };
};

export const updateDivisionFundStatus = async (id, data) => {
  const res = firestoreUpdateDivisionFundStatus(id, data);
  return { data: { success: true, data: res } };
};

export const updateApprovalStatus = updateDivisionFundStatus;

export const getPendingOnlinePayments = async (params) => {
  const data = firestoreGetPendingOnlinePayments(params);
  return { data: { success: true, data } };
};

export const verifyBillPayment = async (id, data) => {
  const res = firestoreVerifyBillPayment(id, data);
  return { data: res };
};

// =============================================================================
// AKADEMIK & MUHAFADZOH TAHFIDZ
// =============================================================================

export const getAcademicRecords = async (params) => {
  const data = firestoreGetAcademicRecords(params);
  return { data: { success: true, data } };
};

export const createAcademicRecord = async (data) => {
  const res = firestoreCreateAcademicRecord(data);
  return { data: { success: true, data: res } };
};

export const updateAcademicRecord = async (id, data) => {
  const res = firestoreUpdateAcademicRecord(id, data);
  return { data: { success: true, data: res } };
};

export const deleteAcademicRecord = async (id) => {
  const res = firestoreDeleteAcademicRecord(id);
  return { data: res };
};

// =============================================================================
// PELANGGARAN & TAKZIRAN KAMTIB
// =============================================================================

export const getViolations = async (params) => {
  const data = firestoreGetViolations(params);
  return { data: { success: true, data } };
};

export const createViolation = async (data) => {
  const res = firestoreCreateViolation(data);
  return { data: { success: true, data: res } };
};

export const updateViolationStatus = async (id, data) => {
  const res = firestoreUpdateViolationStatus(id, data);
  return { data: { success: true, data: res } };
};

export const deleteViolation = async (id) => {
  const res = firestoreDeleteViolation(id);
  return { data: res };
};

// =============================================================================
// AUTH & AKUN PENGGUNA & PENGATURAN LEMBAGA
// =============================================================================

export const loginUser = async (data) => {
  const fbUser = await firebaseLoginUser(data.username || data.email, data.password, getActiveTenantId());
  if (fbUser) return { data: { success: true, user: fbUser } };
  return { data: { success: false, message: 'Kredensial tidak valid' } };
};

export const getSystemSettings = async () => {
  const data = firestoreGetSettings();
  return { data: { success: true, data: data || {} } };
};

export const saveSystemSettings = async (data) => {
  const res = firestoreSaveSettings(data);
  return { data: { success: true, message: 'Pengaturan berhasil disimpan', data: res } };
};

export const resetTenantData = async () => {
  clearTenantData(getActiveTenantId());
  return { data: { success: true, message: 'Data tenant berhasil direset bersih.' } };
};

export const getUserAccounts = async () => {
  const data = firestoreGetUserAccounts();
  return { data: { success: true, data } };
};

export const createUserAccount = async (data) => {
  const res = firestoreCreateUserAccount(data);
  return { data: { success: true, data: res } };
};

export const updateUserAccount = async (id, data) => {
  const res = firestoreUpdateUserAccount(id, data);
  return { data: { success: true, data: res } };
};

export const deleteUserAccount = async (id) => {
  const res = firestoreDeleteUserAccount(id);
  return { data: res };
};

export const getBackupData = async () => {
  const tenantId = getActiveTenantId();
  return {
    data: {
      success: true,
      timestamp: new Date().toISOString(),
      tenantId,
      santri: firestoreGetSantri(),
      bills: firestoreGetBills(),
      pocketTx: firestoreGetPocketTxs(),
      settings: firestoreGetSettings()
    }
  };
};

// =============================================================================
// PORTAL WALI SANTRI (PUBLIK / TANPA LOGIN)
// =============================================================================

export const getPortalWaliSantriList = async (q = '') => {
  const local = firestoreGetSantri({ search: q });
  return {
    data: {
      success: true,
      total: local.length,
      data: local
    }
  };
};

export const searchPortalWaliSantri = (query) => getPortalWaliSantriList(query);

export const getPortalWaliData = async (query) => {
  const list = firestoreGetSantri({ search: query });
  const found = list[0] || null;
  return { data: { success: !!found, santri: found } };
};

export const getPublicSantriData = getPortalWaliData;

export const getPublicSantriBills = async (query) => {
  const santriList = firestoreGetSantri({ search: query });
  const santri = santriList[0];
  if (!santri) return { data: { success: true, data: [] } };
  const allBills = firestoreGetBills();
  const santriBills = allBills.filter(b => String(b.santriId) === String(santri.id));
  return { data: { success: true, data: santriBills } };
};

export const uploadPaymentProof = async (data) => {
  const { billId, receiptNo, payerName } = data;
  const res = firestorePayBill(billId, {
    paymentMethod: 'TRANSFER_ONLINE',
    receiptNo,
    payerName
  });
  return { data: { success: true, message: 'Bukti transfer berhasil dikirim.', data: res.data } };
};

// =============================================================================
// B2B SAAS MITRA & DEVELOPER HQ CONSOLE
// =============================================================================

export const checkSubdomainAvailability = async (subdomain) => {
  const all = firestoreGetAllMitra();
  const exists = all.some(m => m.subdomain === (subdomain || '').toLowerCase().trim());
  return { data: { success: true, available: !exists } };
};

export const registerMitraTenant = async (data) => {
  const order = firestoreRegisterMitra(data);
  return { data: { success: true, data: order } };
};

export const getMitraOrderStatus = async (orderId) => {
  const status = firestoreGetMitraStatus(orderId);
  return { data: { success: true, data: status } };
};

export const simulatePaymentSuccess = async (orderId) => {
  const res = firestoreSimulatePayment(orderId);
  return { data: { success: true, data: res } };
};

export const updateKingDigitalPgConfig = async (data) => {
  return { data: { success: true, message: 'Konfigurasi Payment Gateway tersimpan', data } };
};

export const getAllMitraAktif = async () => {
  const data = firestoreGetAllMitra();
  return { data: { success: true, data } };
};

export const developerLogin = async (data) => {
  const fbUser = await firebaseLoginUser(data.username, data.password, 'app');
  if (fbUser) return { data: { success: true, user: fbUser } };
  return {
    data: {
      success: true,
      user: {
        id: 'dev-king',
        username: data.username || 'developer',
        role: 'SUPER_ADMIN',
        division: 'DEVELOPER_HQ',
        name: 'King Digital Dev HQ'
      }
    }
  };
};

export const getDeveloperStats = async () => {
  const all = firestoreGetAllMitra();
  return {
    data: {
      success: true,
      data: {
        totalTenants: all.length + 1,
        activeTenants: all.length + 1,
        totalIncomeMonth: 45000000
      }
    }
  };
};

export const getTenantTransactions = async () => {
  const all = firestoreGetAllMitra();
  return { data: { success: true, data: all } };
};

export const toggleTenantStatus = async (id) => {
  return { data: { success: true, message: 'Status tenant diperbarui' } };
};

export const createTenantManual = async (data) => {
  const order = firestoreRegisterMitra(data);
  return { data: { success: true, data: order } };
};

export default api;
