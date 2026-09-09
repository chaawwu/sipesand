/**
 * SiPesand Firebase Cloud Database & Real-Time Sync Engine
 * 
 * Menghubungkan seluruh modul SiPesand (Santri, Kas, Uang Saku, RFID, Tagihan, Pengaturan, Akun)
 * ke Google Cloud Firestore secara real-time. Perubahan di satu perangkat (Laptop)
 * langsung tersinkronisasi detik itu juga ke seluruh perangkat lain (HP, Tablet, Wali Santri).
 */
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase";
import { localDb, getCurrentTenant } from "./localDatabase";

// -----------------------------------------------------------------------------
// HELPER: Koleksi & Dokumen Tenant Firestore
// -----------------------------------------------------------------------------
function getTenantCol(collectionName, tenant = null) {
  const activeTenant = tenant || getCurrentTenant();
  return collection(db, "tenants", activeTenant, collectionName);
}

function getTenantDoc(collectionName, docId, tenant = null) {
  const activeTenant = tenant || getCurrentTenant();
  return doc(db, "tenants", activeTenant, collectionName, String(docId));
}

async function isTenantInit(collectionKey, tenant = null) {
  try {
    const initDocRef = getTenantDoc("metadata", "init_" + collectionKey, tenant);
    const snap = await getDoc(initDocRef);
    return snap.exists();
  } catch (e) {
    return false;
  }
}

async function markTenantInit(collectionKey, tenant = null) {
  try {
    const initDocRef = getTenantDoc("metadata", "init_" + collectionKey, tenant);
    await setDoc(initDocRef, { initialized: true, timestamp: new Date().toISOString() }, { merge: true });
  } catch (e) {}
}

// -----------------------------------------------------------------------------
// 1. PENGATURAN SISTEM & WEB LANDING (SETTINGS)
// -----------------------------------------------------------------------------
export async function getCloudSettings(tenant = null) {
  try {
    const docRef = getTenantDoc("settings", "config", tenant);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sipesand_settings");
        const prev = saved ? JSON.parse(saved) : {};
        localStorage.setItem("sipesand_settings", JSON.stringify({ ...prev, ...data }));
      }
      return { success: true, data };
    }
  } catch (err) {
    console.warn("Firebase offline/read error, fallback ke local settings:", err);
  }
  // Fallback Local
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sipesand_settings");
    if (saved) return { success: true, data: JSON.parse(saved) };
  }
  return { success: true, data: {} };
}

export async function saveCloudSettings(settingsData, tenant = null) {
  try {
    const docRef = getTenantDoc("settings", "config", tenant);
    await setDoc(docRef, { ...settingsData, updatedAt: new Date().toISOString() }, { merge: true });
    
    // Update local cache
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sipesand_settings");
      const prev = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sipesand_settings", JSON.stringify({ ...prev, ...settingsData }));
    }
    return { success: true, message: "Pengaturan berhasil disimpan ke Cloud Database" };
  } catch (err) {
    console.warn("Gagal menyimpan ke Firebase Cloud, fallback simpan lokal:", err);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sipesand_settings");
      const prev = saved ? JSON.parse(saved) : {};
      localStorage.setItem("sipesand_settings", JSON.stringify({ ...prev, ...settingsData }));
    }
    return { success: true, message: "Pengaturan disimpan secara lokal (offline fallback)" };
  }
}

export function subscribeCloudSettings(tenant = null, callback) {
  try {
    const docRef = getTenantDoc("settings", "config", tenant);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof window !== "undefined") {
          const saved = localStorage.getItem("sipesand_settings");
          const prev = saved ? JSON.parse(saved) : {};
          localStorage.setItem("sipesand_settings", JSON.stringify({ ...prev, ...data }));
        }
        callback(data);
      }
    }, (err) => {
      console.warn("Firestore snapshot error on settings:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to settings:", e);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// 2. DATA SANTRI & RFID KTSD (MULTI-DEVICE CLOUD SYNC)
// -----------------------------------------------------------------------------
export async function getCloudSantriList(tenant = null) {
  try {
    const colRef = getTenantCol("santri", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("santri", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.santri = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("santri", tenant);
      if (initialized) {
        // Tenant was already initialized and user deleted records. Do NOT resurrect!
        const dbLocal = localDb.getData();
        dbLocal.santri = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
      // Migrasi inisial lokal ke Cloud Firestore
      const dbLocal = localDb.getData();
      if (dbLocal.santri && dbLocal.santri.length > 0) {
        for (const s of dbLocal.santri) {
          await setDoc(getTenantDoc("santri", s.id, tenant), s);
        }
        await markTenantInit("santri", tenant);
        return { success: true, data: dbLocal.santri };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudSantriList fallback local:", err);
  }
  return localDb.getSantriList();
}

export function subscribeCloudSantri(tenant = null, callback) {
  try {
    const colRef = getTenantCol("santri", tenant);
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.santri = items;
      localDb.saveData(dbLocal);
      callback(items);
    }, (err) => {
      console.warn("subscribeCloudSantri snapshot error:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to santri:", e);
    return () => {};
  }
}

export async function createCloudSantri(santriData, tenant = null) {
  const localRes = localDb.createSantri(santriData);
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("santri", localRes.data.id, tenant), localRes.data);
      await markTenantInit("santri", tenant);
    } catch (err) {
      console.warn("Gagal simpan santri ke Firestore:", err);
    }
  }
  return localRes;
}

export async function updateCloudSantri(id, updateData, tenant = null) {
  const localRes = localDb.updateSantri(id, updateData);
  try {
    await setDoc(getTenantDoc("santri", id, tenant), updateData, { merge: true });
  } catch (err) {
    console.warn("Gagal update santri ke Firestore:", err);
  }
  return localRes;
}

export async function deleteCloudSantri(id, tenant = null) {
  const localRes = localDb.deleteSantri(id);
  try {
    await deleteDoc(getTenantDoc("santri", id, tenant));
    await markTenantInit("santri", tenant);
  } catch (err) {
    console.warn("Gagal delete santri dari Firestore:", err);
  }
  return localRes;
}

export async function registerCloudRfid(id, nfcUid, extraData = {}, tenant = null) {
  const payload = { 
    santriId: id, 
    nfcUid,
    ...(typeof extraData === 'object' && extraData !== null ? extraData : {})
  };
  const localRes = localDb.registerRfidCard(payload);
  try {
    const firestoreUpdate = { nfcUid, updatedAt: new Date().toISOString() };
    if (payload.saldo_saku !== undefined && payload.saldo_saku !== '') {
      firestoreUpdate.saldo_saku = parseFloat(payload.saldo_saku);
    }
    if (payload.status) {
      firestoreUpdate.status = payload.status;
    }
    await setDoc(getTenantDoc("santri", id, tenant), firestoreUpdate, { merge: true });
  } catch (err) {
    console.warn("Gagal simpan RFID ke Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 3. BUKU KAS UMUM (GENERAL LEDGER)
// -----------------------------------------------------------------------------
export async function getCloudLedgerEntries(tenant = null) {
  try {
    const colRef = getTenantCol("ledger", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("ledger", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.generalLedger = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("ledger", tenant);
      if (initialized) {
        const dbLocal = localDb.getData();
        dbLocal.generalLedger = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
      const dbLocal = localDb.getData();
      if (dbLocal.generalLedger && dbLocal.generalLedger.length > 0) {
        for (const l of dbLocal.generalLedger) {
          await setDoc(getTenantDoc("ledger", l.id, tenant), l);
        }
        await markTenantInit("ledger", tenant);
        return { success: true, data: dbLocal.generalLedger };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudLedgerEntries fallback local:", err);
  }
  return localDb.getLedgerEntries();
}

export function subscribeCloudLedger(tenant = null, callback) {
  try {
    const colRef = getTenantCol("ledger", tenant);
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.generalLedger = items;
      localDb.saveData(dbLocal);
      callback(items);
    }, (err) => {
      console.warn("subscribeCloudLedger snapshot error:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to ledger:", e);
    return () => {};
  }
}

export async function createCloudLedgerEntry(entryData, tenant = null) {
  const localRes = localDb.createLedgerEntry(entryData);
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("ledger", localRes.data.id, tenant), localRes.data);
      await markTenantInit("ledger", tenant);
    } catch (err) {
      console.warn("Gagal simpan kas ke Firestore:", err);
    }
  }
  return localRes;
}

export async function deleteCloudLedgerEntry(id, tenant = null) {
  const localRes = localDb.deleteLedgerEntry(id);
  try {
    await deleteDoc(getTenantDoc("ledger", id, tenant));
    await markTenantInit("ledger", tenant);
  } catch (err) {
    console.warn("Gagal delete kas dari Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 4. UANG SAKU SANTRI & POS CASHLESS (POCKET TRANSACTIONS)
// -----------------------------------------------------------------------------
export async function getCloudPocketTransactions(tenant = null) {
  try {
    const colRef = getTenantCol("pocket_txs", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.pocketTxs = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    }
  } catch (err) {
    console.warn("Firebase getCloudPocketTransactions fallback local:", err);
  }
  return localDb.getPocketTransactions();
}

export async function topupCloudPocket(santriId, amount, description, merchant, tenant = null) {
  const localRes = localDb.createPocketTransaction({
    santriId,
    type: "TOPUP",
    amount,
    description: description || "Top-Up Saldo Uang Saku",
  });
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("pocket_txs", localRes.data.id, tenant), localRes.data);
      await setDoc(getTenantDoc("santri", santriId, tenant), { 
        saldo_saku: localRes.data.currentBalance 
      }, { merge: true });
    } catch (err) {
      console.warn("Gagal sync topup ke Firestore:", err);
    }
  }
  return localRes;
}

export async function withdrawCloudPocket(santriId, amount, description, merchant, tenant = null) {
  const localRes = localDb.createPocketTransaction({
    santriId,
    type: "WITHDRAW",
    amount,
    description: description || "Penarikan Saldo Uang Saku",
  });
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("pocket_txs", localRes.data.id, tenant), localRes.data);
      await setDoc(getTenantDoc("santri", santriId, tenant), { 
        saldo_saku: localRes.data.currentBalance 
      }, { merge: true });
    } catch (err) {
      console.warn("Gagal sync withdraw ke Firestore:", err);
    }
  }
  return localRes;
}

export async function recordCloudPurchase(nfcUidOrSantriId, amount, description, merchant, tenant = null) {
  const dbLocal = localDb.getData();
  const santri = (dbLocal.santri || []).find(s => 
    (s.nfcUid && s.nfcUid === nfcUidOrSantriId) || 
    s.id === parseInt(nfcUidOrSantriId)
  );

  if (!santri) {
    return { success: false, message: "Kartu RFID atau data santri tidak ditemukan" };
  }

  const localRes = localDb.createPocketTransaction({
    santriId: santri.id,
    type: "PURCHASE",
    amount,
    description: description || `Belanja POS (${merchant || "Koperasi Santri"})`
  });

  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("pocket_txs", localRes.data.id, tenant), localRes.data);
      await setDoc(getTenantDoc("santri", santri.id, tenant), { 
        saldo_saku: localRes.data.currentBalance 
      }, { merge: true });
    } catch (err) {
      console.warn("Gagal sync purchase ke Firestore:", err);
    }
  }
  return localRes;
}

export function subscribeCloudPocket(tenant = null, callback) {
  try {
    const colRef = getTenantCol("pocket_txs", tenant);
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.pocketTxs = items;
      localDb.saveData(dbLocal);
      callback(items);
    }, (err) => {
      console.warn("subscribeCloudPocket snapshot error:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to pocket:", e);
    return () => {};
  }
}

// -----------------------------------------------------------------------------
// 5. TAGIHAN SPP & INVOICES (BILLS)
// -----------------------------------------------------------------------------
export async function getCloudBills(tenant = null) {
  try {
    const colRef = getTenantCol("bills", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("bills", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.santriBills = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("bills", tenant);
      if (initialized) {
        const dbLocal = localDb.getData();
        dbLocal.santriBills = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudBills fallback local:", err);
  }
  return localDb.getSantriBills();
}

export function subscribeCloudBills(tenant = null, callback) {
  try {
    const colRef = getTenantCol("bills", tenant);
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.santriBills = items;
      localDb.saveData(dbLocal);
      callback(items);
    }, (err) => {
      console.warn("subscribeCloudBills snapshot error:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to bills:", e);
    return () => {};
  }
}

export async function generateCloudBulkBills(masterBillId, period, dueDate, tenant = null) {
  const localRes = localDb.autoGenerateHijriBills({ masterBillId, period, dueDate });
  if (localRes.success && localRes.data && localRes.data.bills) {
    try {
      for (const b of localRes.data.bills) {
        await setDoc(getTenantDoc("bills", b.id, tenant), b);
      }
      await markTenantInit("bills", tenant);
    } catch (err) {
      console.warn("Gagal sync generate bills ke Firestore:", err);
    }
  }
  return localRes;
}

export async function payCloudBill(billId, paymentMethod, reference, tenant = null) {
  const localRes = localDb.updateSantriBill(billId, {
    status: "PAID",
    paymentMethod,
    paymentDate: new Date().toISOString(),
    paymentRef: reference,
  });
  if (localRes.success) {
    try {
      await setDoc(getTenantDoc("bills", billId, tenant), {
        status: "PAID",
        paymentMethod,
        paymentDate: new Date().toISOString(),
        paymentRef: reference,
      }, { merge: true });
    } catch (err) {
      console.warn("Gagal sync pay bill ke Firestore:", err);
    }
  }
  return localRes;
}

export async function deleteCloudBill(id, tenant = null) {
  const localRes = localDb.deleteSantriBill(id);
  try {
    await deleteDoc(getTenantDoc("bills", id, tenant));
    await markTenantInit("bills", tenant);
  } catch (err) {
    console.warn("Gagal delete bill dari Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 6. PERIZINAN KAMTIB (PERMITS)
// -----------------------------------------------------------------------------
export async function getCloudPermits(tenant = null) {
  try {
    const colRef = getTenantCol("permits", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("permits", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.permits = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("permits", tenant);
      if (initialized) {
        const dbLocal = localDb.getData();
        dbLocal.permits = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudPermits fallback local:", err);
  }
  return localDb.getPermits();
}

export function subscribeCloudPermits(tenant = null, callback) {
  try {
    const colRef = getTenantCol("permits", tenant);
    return onSnapshot(colRef, (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.permits = items;
      localDb.saveData(dbLocal);
      callback(items);
    }, (err) => {
      console.warn("subscribeCloudPermits snapshot error:", err);
    });
  } catch (e) {
    console.warn("Cannot subscribe to permits:", e);
    return () => {};
  }
}

export async function createCloudPermit(permitData, tenant = null) {
  const localRes = localDb.createPermit(permitData);
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("permits", localRes.data.id, tenant), localRes.data);
      await markTenantInit("permits", tenant);
    } catch (err) {
      console.warn("Gagal sync permit ke Firestore:", err);
    }
  }
  return localRes;
}

export async function updateCloudPermitStatus(permitId, status, actualReturnTime, tenant = null) {
  const localRes = localDb.updatePermitStatus(permitId, { status, actualReturnTime });
  try {
    await setDoc(getTenantDoc("permits", permitId, tenant), { status, actualReturnTime }, { merge: true });
  } catch (err) {
    console.warn("Gagal update permit status ke Firestore:", err);
  }
  return localRes;
}

export async function deleteCloudPermit(id, tenant = null) {
  const localRes = localDb.deletePermit(id);
  try {
    await deleteDoc(getTenantDoc("permits", id, tenant));
    await markTenantInit("permits", tenant);
  } catch (err) {
    console.warn("Gagal delete permit dari Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 7. AKADEMIK & MUHAFADZOH (ACADEMIC RECORDS)
// -----------------------------------------------------------------------------
export async function getCloudAcademicRecords(tenant = null) {
  try {
    const colRef = getTenantCol("academic_records", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("academics", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.academics = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("academics", tenant);
      if (initialized) {
        const dbLocal = localDb.getData();
        dbLocal.academics = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudAcademicRecords fallback local:", err);
  }
  return localDb.getAcademicRecords();
}

export async function saveCloudAcademicRecord(recordData, tenant = null) {
  let localRes;
  if (recordData.id) {
    const db = localDb.getData();
    const idx = (db.academics || []).findIndex(a => String(a.id) === String(recordData.id));
    if (idx !== -1) {
      db.academics[idx] = { ...db.academics[idx], ...recordData };
      localDb.saveData(db);
      localRes = { success: true, data: db.academics[idx] };
    } else {
      localRes = localDb.createAcademicRecord(recordData);
    }
  } else {
    localRes = localDb.createAcademicRecord(recordData);
  }

  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("academic_records", localRes.data.id, tenant), localRes.data);
      await markTenantInit("academics", tenant);
    } catch (err) {
      console.warn("Gagal save academic ke Firestore:", err);
    }
  }
  return localRes;
}

export async function deleteCloudAcademicRecord(id, tenant = null) {
  const localRes = localDb.deleteAcademicRecord(id);
  try {
    await deleteDoc(getTenantDoc("academic_records", id, tenant));
    await markTenantInit("academics", tenant);
  } catch (err) {
    console.warn("Gagal delete academic record dari Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 7B. PELANGGARAN SANTRI (VIOLATIONS)
// -----------------------------------------------------------------------------
export async function getCloudViolations(params = {}, tenant = null) {
  try {
    const colRef = getTenantCol("violations", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      await markTenantInit("violations", tenant);
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const dbLocal = localDb.getData();
      dbLocal.violations = items;
      localDb.saveData(dbLocal);
      return { success: true, data: items };
    } else {
      const initialized = await isTenantInit("violations", tenant);
      if (initialized) {
        const dbLocal = localDb.getData();
        dbLocal.violations = [];
        localDb.saveData(dbLocal);
        return { success: true, data: [] };
      }
    }
  } catch (err) {
    console.warn("Firebase getCloudViolations fallback:", err);
  }
  return localDb.getViolations(params);
}

export async function createCloudViolation(violationData, tenant = null) {
  const localRes = localDb.createViolation(violationData);
  if (localRes.success && localRes.data) {
    try {
      await setDoc(getTenantDoc("violations", localRes.data.id, tenant), localRes.data);
      await markTenantInit("violations", tenant);
    } catch (err) {
      console.warn("Gagal save violation ke Firestore:", err);
    }
  }
  return localRes;
}

export async function deleteCloudViolation(id, tenant = null) {
  const localRes = localDb.deleteViolation(id);
  try {
    await deleteDoc(getTenantDoc("violations", id, tenant));
    await markTenantInit("violations", tenant);
  } catch (err) {
    console.warn("Gagal delete violation dari Firestore:", err);
  }
  return localRes;
}

// -----------------------------------------------------------------------------
// 8. AKUN PENGURUS & DEVISI (USER ACCOUNTS)
// -----------------------------------------------------------------------------
const DEFAULT_ACCOUNTS = [
  { id: 1, username: "admin", name: "Pengasuh & Superadmin", role: "SUPER_ADMIN", division: "PENGASUHAN_PUSAT", isActive: true },
  { id: 2, username: "bendahara", name: "Ustadz Bendahara, S.E.", role: "BENDAHARA", division: "KEUANGAN", isActive: true },
  { id: 3, username: "kamtib", name: "Ustadz Keamanan", role: "KAMTIB", division: "KEAMANAN", isActive: true },
  { id: 4, username: "asatidz", name: "Dewan Asatidz", role: "ASATIDZ", division: "PENDIDIKAN", isActive: true },
];

export async function getCloudUserAccounts(tenant = null) {
  try {
    const colRef = getTenantCol("accounts", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { success: true, data: items };
    } else {
      for (const a of DEFAULT_ACCOUNTS) {
        await setDoc(getTenantDoc("accounts", a.id, tenant), a);
      }
      return { success: true, data: DEFAULT_ACCOUNTS };
    }
  } catch (err) {
    console.warn("Firebase getCloudUserAccounts fallback:", err);
  }
  return { success: true, data: DEFAULT_ACCOUNTS };
}

export async function createCloudUserAccount(accountData, tenant = null) {
  const newAccount = { id: Date.now(), ...accountData, isActive: true };
  try {
    await setDoc(getTenantDoc("accounts", newAccount.id, tenant), newAccount);
  } catch (err) {
    console.warn("Gagal create user account di Firestore:", err);
  }
  return { success: true, message: "Akun baru berhasil ditambahkan", data: newAccount };
}

export async function updateCloudUserAccount(id, updateData, tenant = null) {
  try {
    await setDoc(getTenantDoc("accounts", id, tenant), updateData, { merge: true });
  } catch (err) {
    console.warn("Gagal update account di Firestore:", err);
  }
  return { success: true, message: "Akun berhasil diperbarui", data: { id, ...updateData } };
}

export async function deleteCloudUserAccount(id, tenant = null) {
  try {
    await deleteDoc(getTenantDoc("accounts", id, tenant));
  } catch (err) {
    console.warn("Gagal delete account dari Firestore:", err);
  }
  return { success: true, message: "Akun berhasil dihapus" };
}

// -----------------------------------------------------------------------------
// 9. DASHBOARD STATISTIK MULTI-DEVICE (LIVE CLOUD AGGREGATION)
// -----------------------------------------------------------------------------
export async function getCloudDashboardStats(tenant = null) {
  try {
    const [santriRes, ledgerRes, billsRes, permitsRes, pocketRes] = await Promise.all([
      getCloudSantriList(tenant),
      getCloudLedgerEntries(tenant),
      getCloudBills(tenant),
      getCloudPermits(tenant),
      getCloudPocketTransactions(tenant)
    ]);

    const santriList = santriRes.data || [];
    const ledger = ledgerRes.data || [];
    const bills = billsRes.data || [];
    const permits = permitsRes.data || [];
    const pocketTxs = pocketRes.data || [];

    const totalSantri = santriList.length;
    const activeSantri = santriList.filter(s => s.status === 'AKTIF').length;
    const rfidSantriCount = santriList.filter(s => s.nfcUid).length;
    const totalPocketBalance = santriList.reduce((acc, s) => acc + (parseFloat(s.saldo_saku) || 0), 0);

    let totalIncome = 0;
    let totalExpense = 0;
    ledger.forEach(e => {
      const amt = parseFloat(e.amount || 0);
      if (e.type === 'INCOME') totalIncome += amt;
      else totalExpense += amt;
    });

    const unpaidBills = bills.filter(b => b.status === 'UNPAID' || b.status === 'PENDING_VERIFICATION');
    const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

    const activePermitsCount = permits.filter(p => p.status === 'ACTIVE').length;
    const now = new Date();
    const overduePermits = permits.filter(p => p.status === 'ACTIVE' && new Date(p.returnTime) < now).length;
    const pendingOnlinePaymentsCount = bills.filter(b => b.status === 'PENDING_VERIFICATION').length;

    return {
      success: true,
      data: {
        totalSantri,
        activeSantri,
        rfidSantriCount,
        totalPocketBalance,
        totalIncome,
        totalExpense,
        ledgerBalance: totalIncome - totalExpense,
        totalTunggakan,
        countTunggakan: unpaidBills.length,
        activePermitsCount,
        overduePermits,
        pendingOnlinePaymentsCount,
        pendingDivisionFundsCount: 0,
        recentPocketTxs: pocketTxs.slice(0, 5),
        recentLedgerTxs: ledger.slice(0, 5),
        currentActivePermits: permits.filter(p => p.status === 'ACTIVE').slice(0, 5),
        pendingBillsList: bills.filter(b => b.status === 'PENDING_VERIFICATION').slice(0, 5),
        recentAcademics: []
      }
    };
  } catch (err) {
    console.warn("getCloudDashboardStats fallback local:", err);
    return localDb.getDashboardStats();
  }
}

// -----------------------------------------------------------------------------
// 10. PORTAL WALI LIVE CLOUD LOOKUP (STRICT TENANT ISOLATION)
// -----------------------------------------------------------------------------
export async function getCloudPortalWaliData(query, tenant = null) {
  if (!query) return { success: false, message: 'NIS atau Nama santri wajib dimasukkan' };
  const targetTenant = tenant || getCurrentTenant();

  try {
    const santriRes = await getCloudSantriList(targetTenant);
    const santriList = santriRes.data || [];
    const q = query.trim().toLowerCase();

    // Match exact NIS, exact NFC UID, or Nama contains substring (case-insensitive)
    const santri = santriList.find(s => 
      (s.nis && String(s.nis).trim().toLowerCase() === q) ||
      (s.nfcUid && String(s.nfcUid).trim().toLowerCase() === q) ||
      (s.nama && String(s.nama).trim().toLowerCase().includes(q))
    );

    if (!santri) {
      return { 
        success: false, 
        message: `Data santri "${query}" tidak ditemukan di database lembaga ${targetTenant}. Pastikan nama atau nomor induk santri (NIS) sudah sesuai.` 
      };
    }

    const [billsRes, pocketRes, permitsRes, academicsRes] = await Promise.all([
      getCloudBills(targetTenant),
      getCloudPocketTransactions(targetTenant),
      getCloudPermits(targetTenant),
      getCloudAcademicRecords(targetTenant)
    ]);

    const bills = (billsRes.data || []).filter(b => String(b.santriId) === String(santri.id));
    const pocketTxs = (pocketRes.data || []).filter(t => String(t.santriId) === String(santri.id)).slice(0, 10);
    const permits = (permitsRes.data || []).filter(p => String(p.santriId) === String(santri.id)).slice(0, 5);
    const academics = (academicsRes.data || []).filter(a => String(a.santriId) === String(santri.id));

    // Calculate location & permit status
    const activePermit = permits.find(p => p.status === 'ACTIVE');
    const now = new Date();
    const isOverdue = activePermit && new Date(activePermit.returnTime) < now;

    let locationStatus = 'DI_PESANTREN';
    let locationLabel = 'Berada di Asrama Pondok';
    if (isOverdue) {
      locationStatus = 'OVERDUE';
      locationLabel = 'Terlambat Kembali (Overdue)';
    } else if (activePermit) {
      locationStatus = 'IZIN_KELUAR';
      locationLabel = 'Sedang Izin Keluar Resmi';
    }

    const unpaidBills = bills.filter(b => b.status !== 'PAID');
    const paidBills = bills.filter(b => b.status === 'PAID');

    return {
      success: true,
      data: {
        santri,
        location: {
          status: locationStatus,
          label: locationLabel,
          isOverdue,
          activePermit: activePermit || null
        },
        locationStatus,
        locationLabel,
        isOverdue,
        bills,
        financial: {
          pocketBalance: santri.saldo_saku || 0,
          totalUnpaid: unpaidBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
          totalPaid: paidBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0),
          unpaidCount: unpaidBills.length,
          paidCount: paidBills.length,
          bills
        },
        pocketTxs,
        permits,
        academics,
        tenant: targetTenant
      }
    };
  } catch (err) {
    console.warn("getCloudPortalWaliData fallback local:", err);
    return localDb.getPortalWaliData(query, targetTenant);
  }
}

export async function getCloudSantriById(id, tenant = null) {
  try {
    const santriRes = await getCloudSantriList(tenant);
    const santri = (santriRes.data || []).find(s => String(s.id) === String(id));
    if (santri) {
      const [pocketRes, permitsRes, billsRes, academicsRes] = await Promise.all([
        getCloudPocketTransactions(tenant),
        getCloudPermits(tenant),
        getCloudBills(tenant),
        getCloudAcademicRecords(tenant)
      ]);
      return {
        success: true,
        data: {
          ...santri,
          pocketTxs: (pocketRes.data || []).filter(t => String(t.santriId) === String(id)),
          permits: (permitsRes.data || []).filter(p => String(p.santriId) === String(id)),
          bills: (billsRes.data || []).filter(b => String(b.santriId) === String(id)),
          academics: (academicsRes.data || []).filter(a => String(a.santriId) === String(id)),
          violations: []
        }
      };
    }
  } catch (err) {
    console.warn("getCloudSantriById fallback:", err);
  }
  return localDb.getSantriById(id);
}

export async function getCloudSantriByNfc(uid, tenant = null) {
  try {
    const santriRes = await getCloudSantriList(tenant);
    const santri = (santriRes.data || []).find(s => s.nfcUid && s.nfcUid.toUpperCase() === uid.toUpperCase());
    if (santri) return { success: true, data: santri };
  } catch (err) {
    console.warn("getCloudSantriByNfc fallback:", err);
  }
  return localDb.getSantriByNfc(uid);
}

export async function getCloudLedgerSummary(tenant = null) {
  try {
    const res = await getCloudLedgerEntries(tenant);
    const entries = res.data || [];
    let totalIncome = 0;
    let totalExpense = 0;
    const catMap = {};
    entries.forEach(e => {
      const amt = parseFloat(e.amount || 0);
      if (e.type === 'INCOME') totalIncome += amt;
      else totalExpense += amt;
      const key = e.category || 'Lain-lain';
      if (!catMap[key]) catMap[key] = { category: key, total: 0, count: 0 };
      catMap[key].total += amt;
      catMap[key].count += 1;
    });
    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        categoryBreakdown: Object.values(catMap)
      }
    };
  } catch (err) {
    console.warn("getCloudLedgerSummary fallback:", err);
    return localDb.getLedgerSummary();
  }
}

export async function getCloudMasterBills(tenant = null) {
  try {
    const colRef = getTenantCol("master_bills", tenant);
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      return { success: true, data: snap.docs.map(d => ({ id: d.id, ...d.data() })) };
    }
  } catch (err) {
    console.warn("getCloudMasterBills fallback:", err);
  }
  return localDb.getMasterBills();
}

export async function uploadCloudPaymentProof({ billId, proofUrl, proofNote }, tenant = null) {
  const updateData = {
    status: 'PENDING_VERIFICATION',
    proofUrl,
    proofNote: proofNote || 'Upload Bukti Pembayaran Portal Wali',
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(getTenantDoc("bills", billId, tenant), updateData, { merge: true });
    localDb.updateSantriBill(billId, updateData);
    return { success: true, message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi bendahara.' };
  } catch (err) {
    console.warn("uploadCloudPaymentProof fallback:", err);
    return localDb.uploadPaymentProof({ billId, proofUrl, proofNote });
  }
}

export async function clearCloudDemoData(tenant = null) {
  const activeTenant = tenant || getCurrentTenant();
  try {
    const collectionsToClear = ["santri", "bills", "pocket_txs", "permits", "ledger", "academics", "violations"];
    for (const colName of collectionsToClear) {
      const colRef = getTenantCol(colName, activeTenant);
      const snap = await getDocs(colRef);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      await markTenantInit(colName, activeTenant);
    }
  } catch (err) {
    console.warn("Gagal membersihkan demo dari Cloud Firestore:", err);
  }
  localDb.clearDemoData(activeTenant);
  return { success: true, message: "Seluruh data demo berhasil dibersihkan dari Cloud & Lokal. Database siap produksi!" };
}
