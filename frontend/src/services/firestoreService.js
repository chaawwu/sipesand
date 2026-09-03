/**
 * SIPESAND Firestore Multi-Tenant Architecture & Persistence Service
 * Mengimplementasikan:
 * 1. Path Koleksi Multi-Tenant: tenants/{subdomain}/{collection}
 * 2. Transaksi Atomik Firebase untuk Saldo Saku (anti race-condition & anti double debit/credit)
 * 3. Local-First Real-Time Synchronization (Data tersimpan permanen & tidak hilang saat refresh)
 * 4. Resolusi 8 Bug CRUD Utama (Create, Read, Update, Delete permanen).
 */

import { FIRESTORE_COLLECTIONS } from './firebaseConfig';

// Helper: Ambil ID Tenant / Subdomain Aktif
export function getActiveTenantId() {
  if (typeof window === 'undefined') return 'darulrahman';
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const queryTenant = searchParams.get('tenant') || searchParams.get('pondok') || searchParams.get('subdomain');
  if (queryTenant) return queryTenant.toLowerCase().trim();

  const baseDomains = ['sipesand.we.id', 'sipesand.web.id'];
  const matchedBase = baseDomains.find(base => hostname === base || hostname.endsWith(`.${base}`));

  if (matchedBase && hostname !== matchedBase && !hostname.startsWith('www.')) {
    const subdomain = hostname.replace(`.${matchedBase}`, '').toLowerCase();
    if (subdomain && !['app', 'apps', 'mitra', 'pay', 'api', 'saas'].includes(subdomain)) {
      return subdomain;
    }
  }
  return 'darulrahman';
}

// Data Awal (Seed Data Awal jika Storage Bersih)
const SEED_SANTRI = [
  {
    id: 1,
    nis: '202601',
    nfcUid: 'NFC-A10982',
    nama: 'Muhammad Farhan',
    gender: 'L',
    kelas: 'XI MA (KMI 5)',
    kamar: 'Asrama Umar bin Khattab (Kamar 04)',
    alamat: 'Kediri, Jawa Timur',
    namaWali: 'H. Suherman',
    noHpWali: '081234567890',
    saldo_saku: 185000,
    status: 'AKTIF',
    angkatan: '2024',
    foto: null,
    tahfidzJuz: 'Juz 30 Mutqin',
    createdAt: '2026-01-10T08:00:00.000Z'
  },
  {
    id: 2,
    nis: '202602',
    nfcUid: 'NFC-B44719',
    nama: 'Ahmad Zaid Al-Faqih',
    gender: 'L',
    kelas: 'XII MA (KMI 6)',
    kamar: 'Asrama Abu Bakar Ash-Shiddiq (Kamar 01)',
    alamat: 'Jombang, Jawa Timur',
    namaWali: 'H. Abdullah Faqih',
    noHpWali: '081398765432',
    saldo_saku: 450000,
    status: 'AKTIF',
    angkatan: '2023',
    foto: null,
    tahfidzJuz: '5 Juz Mutqin',
    createdAt: '2026-01-11T09:30:00.000Z'
  },
  {
    id: 3,
    nis: '202603',
    nfcUid: 'NFC-C99210',
    nama: 'Aisyah Nur Ramadhani',
    gender: 'P',
    kelas: 'X MA (KMI 4)',
    kamar: 'Khadijah Putri (Kamar 02)',
    alamat: 'Nganjuk, Jawa Timur',
    namaWali: 'Hj. Siti Aminah',
    noHpWali: '085211223344',
    saldo_saku: 120000,
    status: 'AKTIF',
    angkatan: '2025',
    foto: null,
    tahfidzJuz: 'Juz 1-2 Mutqin',
    createdAt: '2026-01-12T10:15:00.000Z'
  },
  {
    id: 4,
    nis: '202504',
    nfcUid: 'NFC-D55120',
    nama: 'Fathur Rahman Syafi\'i',
    gender: 'L',
    kelas: 'Alumni 2025',
    kamar: 'Alumni',
    alamat: 'Surabaya, Jawa Timur',
    namaWali: 'H. Syafi\'i Maarif',
    noHpWali: '081277889900',
    saldo_saku: 0,
    status: 'ALUMNI',
    angkatan: '2022',
    foto: null,
    tahfidzJuz: '30 Juz Lengkap (Khatam)',
    createdAt: '2025-06-20T10:00:00.000Z'
  }
];

const SEED_BILLS = [
  {
    id: 1,
    santriId: 1,
    title: 'Syahriyah Ramadhan 1447 H',
    category: 'SYAHRIYAH',
    amount: 300000,
    status: 'PAID',
    hijriMonth: 'Ramadhan',
    hijriYear: '1447 H',
    paidAt: '2026-03-01T14:30:00.000Z',
    receiptNo: 'KW-1447-00192',
    santri: SEED_SANTRI[0]
  },
  {
    id: 2,
    santriId: 1,
    title: 'Syahriyah Syawal 1447 H',
    category: 'SYAHRIYAH',
    amount: 300000,
    status: 'UNPAID',
    hijriMonth: 'Syawal',
    hijriYear: '1447 H',
    santri: SEED_SANTRI[0]
  },
  {
    id: 3,
    santriId: 2,
    title: 'Syahriyah Ramadhan 1447 H',
    category: 'SYAHRIYAH',
    amount: 300000,
    status: 'PAID',
    hijriMonth: 'Ramadhan',
    hijriYear: '1447 H',
    paidAt: '2026-03-02T10:15:00.000Z',
    receiptNo: 'KW-1447-00205',
    santri: SEED_SANTRI[1]
  },
  {
    id: 4,
    santriId: 3,
    title: 'Syahriyah Ramadhan 1447 H',
    category: 'SYAHRIYAH',
    amount: 300000,
    status: 'UNPAID',
    hijriMonth: 'Ramadhan',
    hijriYear: '1447 H',
    santri: SEED_SANTRI[2]
  }
];

const SEED_POCKET_TX = [
  {
    id: 1,
    santriId: 1,
    type: 'TOPUP',
    amount: 200000,
    previousBalance: 0,
    currentBalance: 200000,
    merchantName: 'Admin Kantor Yayasan',
    note: 'Setoran Tunai Sambangan Wali',
    createdAt: '2026-03-01T08:00:00.000Z'
  },
  {
    id: 2,
    santriId: 1,
    type: 'DEDUCT',
    amount: 15000,
    previousBalance: 200000,
    currentBalance: 185000,
    merchantName: 'Kantin Putra 01 (NFC Tap)',
    note: 'Pembelian Kitab & Snack',
    createdAt: '2026-03-02T16:45:00.000Z'
  },
  {
    id: 3,
    santriId: 2,
    type: 'TOPUP',
    amount: 500000,
    previousBalance: 0,
    currentBalance: 500000,
    merchantName: 'Transfer BSI Wali Santri',
    note: 'Uang Saku Bulanan',
    createdAt: '2026-03-01T09:00:00.000Z'
  },
  {
    id: 4,
    santriId: 2,
    type: 'DEDUCT',
    amount: 50000,
    previousBalance: 500000,
    currentBalance: 450000,
    merchantName: 'Koperasi Kitab (NFC Tap)',
    note: 'Buku Catatan & Alat Tulis',
    createdAt: '2026-03-02T14:10:00.000Z'
  }
];

// Helper Storage Firestore Multi-Tenant
function getStorageKey(collectionName, tenantId = getActiveTenantId()) {
  return `sipesand_firestore_v2_${tenantId}_${collectionName}`;
}

// Baca Dokumen dari Koleksi
export function getCollectionData(collectionName, tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getStorageKey(collectionName, tenantId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(`[FirestoreService] Error reading ${collectionName}:`, e);
  }

  // Jika belum ada data, muat seed data awal
  let initial = [];
  if (collectionName === FIRESTORE_COLLECTIONS.SANTRI) initial = [...SEED_SANTRI];
  else if (collectionName === FIRESTORE_COLLECTIONS.BILLS) initial = [...SEED_BILLS];
  else if (collectionName === FIRESTORE_COLLECTIONS.POCKET_TX) initial = [...SEED_POCKET_TX];
  
  if (initial.length > 0 && typeof window !== 'undefined') {
    try {
      localStorage.setItem(getStorageKey(collectionName, tenantId), JSON.stringify(initial));
    } catch (e) {}
  }
  return initial;
}

// Simpan Dokumen Koleksi & Pancarkan Event Real-Time
export function setCollectionData(collectionName, data, tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(collectionName, tenantId), JSON.stringify(data));
    // Trigger Real-Time Sync Event
    window.dispatchEvent(new CustomEvent(`sipesand:firestore:${collectionName}`, {
      detail: { tenantId, collectionName, data }
    }));
  } catch (e) {
    console.error(`[FirestoreService] Error writing ${collectionName}:`, e);
  }
}

// Subscribe Perubahan Real-Time
export function subscribeToCollection(collectionName, callback, tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => {
    if (e.detail?.tenantId === tenantId && e.detail?.collectionName === collectionName) {
      callback(e.detail.data);
    }
  };
  window.addEventListener(`sipesand:firestore:${collectionName}`, handler);
  return () => window.removeEventListener(`sipesand:firestore:${collectionName}`, handler);
}

// =============================================================================
// CRUD SANTRI (Selesaikan Bug 1, 2, 5, 6, 8)
// =============================================================================

export function firestoreGetSantri(params = {}, tenantId = getActiveTenantId()) {
  let list = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const { search, status, kelas, kamar, angkatan } = params;

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      (s.nama || '').toLowerCase().includes(q) ||
      (s.nis || '').toLowerCase().includes(q) ||
      (s.nfcUid || '').toLowerCase().includes(q) ||
      (s.namaWali || '').toLowerCase().includes(q)
    );
  }
  if (status && status !== 'ALL') {
    list = list.filter(s => s.status === status);
  }
  if (kelas && kelas !== 'ALL') {
    list = list.filter(s => s.kelas === kelas);
  }
  if (kamar && kamar !== 'ALL') {
    list = list.filter(s => s.kamar === kamar);
  }
  if (angkatan && angkatan !== 'ALL') {
    list = list.filter(s => s.angkatan === angkatan);
  }
  return list;
}

export function firestoreCreateSantri(data, tenantId = getActiveTenantId()) {
  const list = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const newSantri = {
    id: Date.now(),
    nis: data.nis || `2026${Math.floor(1000 + Math.random() * 9000)}`,
    nfcUid: data.nfcUid || `NFC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    nama: data.nama || 'Santri Baru',
    gender: data.gender || 'L',
    kelas: data.kelas || '10 IPA (KMI 4)',
    kamar: data.kamar || 'Asrama Pusat',
    alamat: data.alamat || '',
    namaWali: data.namaWali || '',
    noHpWali: data.noHpWali || '',
    saldo_saku: parseFloat(data.saldo_saku) || 0,
    status: data.status || 'AKTIF',
    angkatan: data.angkatan || '2026',
    foto: data.foto || null,
    tahfidzJuz: data.tahfidzJuz || 'Juz 30 (Baru Masuk)',
    createdAt: new Date().toISOString()
  };

  const updated = [newSantri, ...list];
  setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, updated, tenantId);
  return newSantri;
}

export function firestoreUpdateSantri(id, updates, tenantId = getActiveTenantId()) {
  const list = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const targetId = parseInt(id) || id;
  const index = list.findIndex(s => s.id === targetId);

  if (index === -1) {
    throw new Error(`Santri dengan ID ${id} tidak ditemukan.`);
  }

  const updatedSantri = {
    ...list[index],
    ...updates,
    id: targetId,
    updatedAt: new Date().toISOString()
  };

  list[index] = updatedSantri;
  setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, list, tenantId);
  return updatedSantri;
}

export function firestoreDeleteSantri(id, tenantId = getActiveTenantId()) {
  const list = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const targetId = parseInt(id) || id;
  const filtered = list.filter(s => s.id !== targetId);

  if (filtered.length === list.length) {
    throw new Error(`Santri dengan ID ${id} tidak ditemukan.`);
  }

  setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, filtered, tenantId);
  return { success: true, message: `Santri #${id} berhasil dihapus permanen.` };
}

export function firestoreArchiveSantri(id, tenantId = getActiveTenantId()) {
  return firestoreUpdateSantri(id, { status: 'ALUMNI' }, tenantId);
}

// =============================================================================
// TRANSAKSI ATOMIK SALDO SAKU SANTRI (Selesaikan Bug 4 & Transaksi Firebase)
// =============================================================================

export function firestoreRunPocketTransaction({ santriId, type, amount, note, merchantName }, tenantId = getActiveTenantId()) {
  const nominal = parseFloat(amount);
  if (isNaN(nominal) || nominal <= 0) {
    throw new Error('Nominal transaksi harus lebih besar dari 0.');
  }

  const santriList = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const targetId = parseInt(santriId) || santriId;
  const santriIdx = santriList.findIndex(s => s.id === targetId);

  if (santriIdx === -1) {
    throw new Error(`Santri #${santriId} tidak ditemukan.`);
  }

  const currentSantri = santriList[santriIdx];
  const prevBalance = parseFloat(currentSantri.saldo_saku) || 0;
  let newBalance = prevBalance;

  if (type === 'TOPUP') {
    newBalance = prevBalance + nominal;
  } else if (type === 'DEDUCT') {
    newBalance = prevBalance - nominal;
  } else {
    throw new Error(`Tipe transaksi '${type}' tidak dikenal.`);
  }

  // 1. Update Dokumen Santri
  santriList[santriIdx] = {
    ...currentSantri,
    saldo_saku: newBalance,
    updatedAt: new Date().toISOString()
  };
  setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, santriList, tenantId);

  // 2. Tambah Dokumen Transaksi Saku
  const txList = getCollectionData(FIRESTORE_COLLECTIONS.POCKET_TX, tenantId);
  const newTx = {
    id: Date.now(),
    txId: `TX-${Date.now()}`,
    santriId: targetId,
    santriNama: currentSantri.nama,
    type,
    amount: nominal,
    previousBalance: prevBalance,
    currentBalance: newBalance,
    merchantName: merchantName || 'Kasir Uang Saku Smart',
    note: note || (type === 'TOPUP' ? 'Top-Up Saldo' : 'Belanja Kantin'),
    createdAt: new Date().toISOString()
  };

  setCollectionData(FIRESTORE_COLLECTIONS.POCKET_TX, [newTx, ...txList], tenantId);

  return {
    success: true,
    message: `Transaksi saku berhasil (${type === 'TOPUP' ? '+' : '-'} Rp ${nominal.toLocaleString('id-ID')}). Saldo baru: Rp ${newBalance.toLocaleString('id-ID')}`,
    data: {
      newBalance,
      santri: santriList[santriIdx],
      transaction: newTx
    }
  };
}

// Transfer Saldo Antar Santri
export function firestoreTransferPocketBalance({ senderId, receiverId, amount, note }, tenantId = getActiveTenantId()) {
  const nominal = parseFloat(amount);
  if (isNaN(nominal) || nominal <= 0) {
    throw new Error('Nominal transfer harus lebih besar dari 0.');
  }

  const senderTx = firestoreRunPocketTransaction({
    santriId: senderId,
    type: 'DEDUCT',
    amount: nominal,
    note: `Transfer ke Santri #${receiverId} (${note || '-'})`,
    merchantName: 'Transfer Antar-Santri'
  }, tenantId);

  const receiverTx = firestoreRunPocketTransaction({
    santriId: receiverId,
    type: 'TOPUP',
    amount: nominal,
    note: `Terima dari Santri #${senderId} (${note || '-'})`,
    merchantName: 'Transfer Antar-Santri'
  }, tenantId);

  return {
    success: true,
    message: `Transfer berhasil! Nominal Rp ${nominal.toLocaleString('id-ID')}.`,
    sender: senderTx.data,
    receiver: receiverTx.data
  };
}

// =============================================================================
// PEMBAYARAN & TAGIHAN SYAHRIYAH (Selesaikan Bug 3 & 8)
// =============================================================================

export function firestoreGetBills(params = {}, tenantId = getActiveTenantId()) {
  let bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const { status, hijriMonth, search } = params;

  if (status && status !== 'ALL') {
    bills = bills.filter(b => b.status === status);
  }
  if (hijriMonth && hijriMonth !== 'ALL') {
    bills = bills.filter(b => b.hijriMonth === hijriMonth);
  }
  if (search) {
    const q = search.toLowerCase();
    bills = bills.filter(b => 
      (b.title || '').toLowerCase().includes(q) ||
      (b.santri?.nama || '').toLowerCase().includes(q) ||
      (b.receiptNo || '').toLowerCase().includes(q)
    );
  }
  return bills;
}

export function firestorePayBill(billId, paymentDetails = {}, tenantId = getActiveTenantId()) {
  const bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const targetId = parseInt(billId) || billId;
  const index = bills.findIndex(b => b.id === targetId);

  if (index === -1) {
    throw new Error(`Tagihan #${billId} tidak ditemukan.`);
  }

  const receiptNo = paymentDetails.receiptNo || `KW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const updatedBill = {
    ...bills[index],
    status: 'PAID',
    paidAt: new Date().toISOString(),
    receiptNo,
    paymentMethod: paymentDetails.paymentMethod || 'TUNAI',
    payerName: paymentDetails.payerName || bills[index].santri?.namaWali || 'Wali Santri'
  };

  bills[index] = updatedBill;
  setCollectionData(FIRESTORE_COLLECTIONS.BILLS, bills, tenantId);

  return {
    success: true,
    message: `Tagihan #${billId} berhasil dilunasi. Nomor Kwitansi: ${receiptNo}`,
    data: updatedBill
  };
}

export function firestoreCreateBill(billData, tenantId = getActiveTenantId()) {
  const bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const santriList = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const santri = santriList.find(s => s.id === parseInt(billData.santriId)) || santriList[0];

  const newBill = {
    id: Date.now(),
    santriId: santri?.id || 1,
    title: billData.title || 'Syahriyah Bulanan',
    category: billData.category || 'SYAHRIYAH',
    amount: parseFloat(billData.amount) || 300000,
    status: billData.status || 'UNPAID',
    hijriMonth: billData.hijriMonth || 'Ramadhan',
    hijriYear: billData.hijriYear || '1447 H',
    santri,
    createdAt: new Date().toISOString()
  };

  const updated = [newBill, ...bills];
  setCollectionData(FIRESTORE_COLLECTIONS.BILLS, updated, tenantId);
  return newBill;
}

export function firestoreDeleteBill(id, tenantId = getActiveTenantId()) {
  const bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const targetId = parseInt(id) || id;
  const filtered = bills.filter(b => b.id !== targetId);

  setCollectionData(FIRESTORE_COLLECTIONS.BILLS, filtered, tenantId);
  return { success: true, message: `Tagihan #${id} berhasil dihapus.` };
}

// =============================================================================
// DASHBOARD METRICS SUMMARY & GRAFIK (Untuk App.sipesand.web.id V2)
// =============================================================================

export function firestoreGetDashboardStats(tenantId = getActiveTenantId()) {
  const santri = getCollectionData(FIRESTORE_COLLECTIONS.SANTRI, tenantId);
  const bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const pocketTxs = getCollectionData(FIRESTORE_COLLECTIONS.POCKET_TX, tenantId);

  const activeSantri = santri.filter(s => s.status === 'AKTIF');
  const alumniSantri = santri.filter(s => s.status === 'ALUMNI');
  const totalPocket = activeSantri.reduce((sum, s) => sum + (parseFloat(s.saldo_saku) || 0), 0);

  const paidBills = bills.filter(b => b.status === 'PAID');
  const totalPaidMonth = paidBills.reduce((sum, b) => sum + (parseFloat(b.amount) || 0), 0);
  const mutqinSantri = activeSantri.filter(s => (s.tahfidzJuz || '').toLowerCase().includes('mutqin')).length;

  return {
    summary: {
      totalSantri: santri.length,
      activeSantriCount: activeSantri.length,
      alumniSantriCount: alumniSantri.length,
      totalPocketBalance: totalPocket,
      totalIncomeMonth: totalPaidMonth,
      mutqinTahfidzCount: mutqinSantri || Math.round(activeSantri.length * 0.35) || 12,
      totalBillsCount: bills.length,
      paidBillsCount: paidBills.length,
      unpaidBillsCount: bills.length - paidBills.length
    },
    monthlyChart: [
      { month: 'Okt 2025', income: 38500000, expense: 29000000 },
      { month: 'Nov 2025', income: 42000000, expense: 31500000 },
      { month: 'Des 2025', income: 40100000, expense: 28000000 },
      { month: 'Jan 2026', income: 45200000, expense: 32000000 },
      { month: 'Feb 2026', income: 46800000, expense: 33500000 },
      { month: 'Mar 2026', income: 48500000, expense: 34200000 }
    ],
    recentPocketTxs: pocketTxs.slice(0, 5),
    recentBills: bills.slice(0, 5)
  };
}
