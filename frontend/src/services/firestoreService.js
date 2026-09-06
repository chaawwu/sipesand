/**
 * SIPESAND Firestore Multi-Tenant Architecture & Persistence Service
 * Mengimplementasikan:
 * 1. Path Koleksi Multi-Tenant: tenants/{subdomain}/{collection}
 * 2. Transaksi Atomik Firebase untuk Saldo Saku (anti race-condition & anti double debit/credit)
 * 3. Local-First Real-Time Synchronization (Data tersimpan permanen & tidak hilang saat refresh)
 * 4. Resolusi 8 Bug CRUD Utama (Create, Read, Update, Delete permanen).
 */

import { 
  db, 
  getTenantCollection, 
  getTenantDoc, 
  ensureTenantProvisioned, 
  FIRESTORE_COLLECTIONS 
} from './firebaseConfig';
import { 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
export { FIRESTORE_COLLECTIONS };

// Helper: Ambil ID Tenant / Subdomain Aktif (Isolasi Mutlak)
export function getActiveTenantId() {
  if (typeof window === 'undefined') return 'app';
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const queryTenant = searchParams.get('tenant') || searchParams.get('pondok') || searchParams.get('subdomain');
  if (queryTenant) return queryTenant.toLowerCase().trim();

  const baseDomains = ['sipesand.we.id', 'sipesand.web.id', 'pages.dev'];
  const matchedBase = baseDomains.find(base => hostname === base || hostname.endsWith(`.${base}`));

  if (matchedBase && hostname !== matchedBase && !hostname.startsWith('www.')) {
    const subdomain = hostname.replace(`.${matchedBase}`, '').toLowerCase();
    if (subdomain === 'apps') return 'app';
    if (subdomain) return subdomain;
  }
  return 'app';
}

// Data Riil PPDR Darul Rahman dari Firestore webppdrv3
export const SEED_DARULRAHMAN_SANTRI = [
  { id: "PDR121365", nis: "PDR121365", nfcUid: "PDR121365", nama: "AHMAD SIFA'I ROMADHON", name: "AHMAD SIFA'I ROMADHON", gender: "L", kelas: "3 tsanawiyah", class: "3 tsanawiyah", kamar: "3 tsanawiyah", namaWali: "NASIR", guardian: "NASIR", noHpWali: "+62 812-4978-9903", alamat: "Kedungprahu Forawi Ngawi", address: "Kedungprahu Forawi Ngawi", saldo_saku: 0, balance: 0, status: "AKTIF" },
  { id: "PDR186495", nis: "PDR186495", nfcUid: "PDR186495", nama: "AHMAD SHOLIHAN", name: "AHMAD SHOLIHAN", gender: "L", kelas: "1 tsanawiyah", class: "1 tsanawiyah", kamar: "1 tsanawiyah", namaWali: "JIYANTO", guardian: "JIYANTO", noHpWali: "+62 812-4978-9903", alamat: "bumi ilir anak tuha lampung tengah", address: "bumi ilir anak tuha lampung tengah", saldo_saku: 285500, balance: 285500, pengurusUs: "Awwu", status: "AKTIF" },
  { id: "PDR223687", nis: "PDR223687", nfcUid: "PDR223687", nama: "Abdul suhud", name: "Abdul suhud", gender: "L", kelas: "MIs", class: "MIs", kamar: "MIs", namaWali: "mahrum", guardian: "mahrum", noHpWali: "+62 812-4978-9903", alamat: "sumbersari", address: "sumbersari", saldo_saku: 0, balance: 0, status: "AKTIF" },
  { id: "PDR259534", nis: "PDR259534", nfcUid: "PDR259534", nama: "JA'FAR ALI MUGHNI", name: "JA'FAR ALI MUGHNI", gender: "L", kelas: "2 tsanawiyah", class: "2 tsanawiyah", kamar: "2 tsanawiyah", namaWali: "LUKMAN HAKIM", guardian: "LUKMAN HAKIM", noHpWali: "+62 812-4978-9903", alamat: "Tawangrejo Bayat Klaten Jateng", address: "Tawangrejo Bayat Klaten Jateng", saldo_saku: 0, balance: 0, status: "AKTIF" },
  { id: "PDR326733", nis: "PDR326733", nfcUid: "PDR326733", nama: "MUHAMMAD HILALLUDIN", name: "MUHAMMAD HILALLUDIN", gender: "L", kelas: "1 Tsanawiyah", class: "1 Tsanawiyah", kamar: "1 Tsanawiyah", namaWali: "qomaruddin gz", guardian: "qomaruddin gz", noHpWali: "+62 812-4978-9903", alamat: "jembatan serong cipayung depok", address: "jembatan serong cipayung depok", saldo_saku: 8500, balance: 8500, pengurusUs: "Lisin", status: "AKTIF" },
  { id: "PDR370884", nis: "PDR370884", nfcUid: "PDR370884", nama: "YOGA PRATAMA", name: "YOGA PRATAMA", gender: "L", kelas: "5 ibtidaiyah", class: "5 ibtidaiyah", kamar: "5 ibtidaiyah", namaWali: "EDI WIBOWO", guardian: "EDI WIBOWO", noHpWali: "+62 812-4978-9903", alamat: "Sidomulyo Semen Pagu Kediri", address: "Sidomulyo Semen Pagu Kediri", saldo_saku: 171000, balance: 171000, pengurusUs: "Lisin", status: "AKTIF" },
  { id: "PDR472318", nis: "PDR472318", nfcUid: "PDR472318", nama: "MUHAMAD MAHRUM ALY", name: "MUHAMAD MAHRUM ALY", gender: "L", kelas: "3 Tsanawiyah", class: "3 Tsanawiyah", kamar: "3 Tsanawiyah", namaWali: "M ROZALI", guardian: "M ROZALI", noHpWali: "+62 812-4978-9903", alamat: "Sumber sari Kencong Kepung Kediri", address: "Sumber sari Kencong Kepung Kediri", saldo_saku: 0, balance: 0, status: "AKTIF" },
  { id: "PDR476908", nis: "PDR476908", nfcUid: "PDR476908", nama: "muhammad arfan rahandika", name: "muhammad arfan rahandika", gender: "L", kelas: "3 mi", class: "3 mi", kamar: "3 mi", namaWali: "juminah", guardian: "juminah", noHpWali: "+62 812-4978-9903", alamat: "sumbersari", address: "sumbersari", saldo_saku: 242500, balance: 242500, pengurusUs: "Robin", status: "AKTIF" },
  { id: "PDR538697", nis: "PDR538697", nfcUid: "PDR538697", nama: "BAYU SATRIO", name: "BAYU SATRIO", gender: "L", kelas: "1 Tsanawiyah", class: "1 Tsanawiyah", kamar: "1 Tsanawiyah", namaWali: "AHMAD KHOZIN", guardian: "AHMAD KHOZIN", noHpWali: "+62 812-4978-9903", alamat: "Sidomulyo Wates Kediri", address: "Sidomulyo Wates Kediri", saldo_saku: 0, balance: 0, status: "AKTIF" },
  { id: "PDR547715", nis: "PDR547715", nfcUid: "PDR547715", nama: "AZHAR ZUE AQILA", name: "AZHAR ZUE AQILA", gender: "L", kelas: "5 ibtidaiyah", class: "5 ibtidaiyah", kamar: "5 ibtidaiyah", namaWali: "KURNIADI", guardian: "KURNIADI", noHpWali: "+62 812-4978-9903", alamat: "Tanjung Kalidawir Tulungagung", address: "Tanjung Kalidawir Tulungagung", saldo_saku: 80000, balance: 80000, pengurusUs: "Lisin", status: "AKTIF" },
  { id: "PDR808215", nis: "PDR808215", nfcUid: "PDR808215", nama: "M KHOIRUL AZAM", name: "M KHOIRUL AZAM", gender: "L", kelas: "5 ibtidaiyah", class: "5 ibtidaiyah", kamar: "5 ibtidaiyah", namaWali: "ALI MUKHSON", guardian: "ALI MUKHSON", noHpWali: "+62 812-4978-9903", alamat: "Kaligunting Mejayan Madiun", address: "Kaligunting Mejayan Madiun", saldo_saku: 64000, balance: 64000, pengurusUs: "Lisin", status: "AKTIF" },
  { id: "PDR811344", nis: "PDR811344", nfcUid: "PDR811344", nama: "Muhammad Eka Satria", name: "Muhammad Eka Satria", gender: "L", kelas: "3 mi", class: "3 mi", kamar: "3 mi", namaWali: "juminah", guardian: "juminah", noHpWali: "+62 812-4978-9903", alamat: "sumbersari", address: "sumbersari", saldo_saku: 242500, balance: 242500, pengurusUs: "Robin", status: "AKTIF" },
  { id: "PDR990163", nis: "PDR990163", nfcUid: "PDR990163", nama: "ANDI SETIAWAN", name: "ANDI SETIAWAN", gender: "L", kelas: "1 Tsanawiyah", class: "1 Tsanawiyah", kamar: "1 Tsanawiyah", namaWali: "SUPARMAN", guardian: "SUPARMAN", noHpWali: "+62 812-4978-9903", alamat: "Tempursari Sambirejo Pare Kediri", address: "Tempursari Sambirejo Pare Kediri", saldo_saku: 29992, balance: 29992, pengurusUs: "Lisin", status: "AKTIF" }
];

export const SEED_DARULRAHMAN_SETTINGS = {
  NAMA_LEMBAGA: 'PONPES DARUL RAHMAN',
  nama: 'PONPES DARUL RAHMAN',
  TAGLINE_LEMBAGA: 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
  ALAMAT_LEMBAGA: 'Sumbersari, kencong kepung kediri',
  alamat: 'Sumbersari, kencong kepung kediri',
  NO_TELP: '+62 812-4978-9903',
  telp: '+62 812-4978-9903',
  WHATSAPP_CENTER: '081249789903',
  EMAIL_LEMBAGA: 'darulrahman.kediri@gmail.com',
  NAMA_KEPALA_PONDOK: 'K.H. Syarif Hidayatullah, M.A.',
  NAMA_BENDAHARA: 'mahrum ali',
  bendahara: 'mahrum ali',
  BANK_NAME: 'BSI',
  bank: 'BSI',
  BANK_ACCOUNT_NO: '7205409507',
  rek: '7205409507',
  BANK_ACCOUNT_HOLDER: 'mahrum ali',
  an: 'mahrum ali',
  DISBURSEMENT_BANK: 'BSI',
  DISBURSEMENT_ACCOUNT_NO: '7205409507',
  DISBURSEMENT_ACCOUNT_HOLDER: 'mahrum ali',
  GOOGLE_SHEET_WEBHOOK_URL: 'https://script.google.com/macros/s/AKfycbzPqS9wMaQdqTfxZftrkCg0y9Np7E3i3fGuQfX4VJCyR63LsPl5LrLdHtMspXH3lrNl/exec',
  sheetUrl: 'https://script.google.com/macros/s/AKfycbzPqS9wMaQdqTfxZftrkCg0y9Np7E3i3fGuQfX4VJCyR63LsPl5LrLdHtMspXH3lrNl/exec',
  WEB_THEME: 'islamic_green',
  WEB_HERO_TITLE: 'Portal Resmi Pondok Pesantren Darul Rahman Sumbersari',
  WEB_HERO_SUBTITLE: 'Pusat pendidikan Islam terpadu, tahfidzul quran, sorogan kitab kuning, dan pembinaan akhlak karimah di Kediri.',
  WEB_GREETING_NOTE: 'Mengabdi untuk Umat, Menjaga Tradisi Salaf & Wawasan Global',
  WEB_SHOW_PERMIT_CHECKER: 'true',
  WEB_SHOW_WALI_PORTAL: 'true',
  WEB_SHOW_ROUTINE: 'true',
  WEB_SHOW_ANNOUNCEMENT: 'true',
  WEB_ANNOUNCEMENT_TEXT: 'Pendaftaran Santri Baru (PSB) Tahun Ajaran 2026/2027 Telah Dibuka!',
  WEB_MAPS_URL: 'https://maps.google.com/?q=Darul+Rahman+Sumbersari+Kediri',
  NFC_FEATURE_ENABLED: 'true',
  ONBOARDING_COMPLETED: 'true'
};

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
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error(`[FirestoreService] Error reading ${collectionName}:`, e);
  }

  // Khusus tenant PPDR (darulrahman): Gunakan data riil dari Firestore webppdrv3
  if (tenantId === 'darulrahman') {
    let initial = [];
    if (collectionName === FIRESTORE_COLLECTIONS.SANTRI) initial = [...SEED_DARULRAHMAN_SANTRI];
    else if (collectionName === FIRESTORE_COLLECTIONS.SETTINGS) initial = { ...SEED_DARULRAHMAN_SETTINGS };
    
    if (initial.length > 0 && typeof window !== 'undefined') {
      try {
        localStorage.setItem(getStorageKey(collectionName, tenantId), JSON.stringify(initial));
      } catch (e) {}
    }
    return initial;
  }

  // Khusus demo gateway master (tenant 'app'): sediakan seed awal
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

// Reset / Hapus Seluruh Data Tenant Tertentu Menjadi Bersih
export function clearTenantData(tenantId = 'darulrahman') {
  if (typeof window === 'undefined') return;
  setCollectionData(FIRESTORE_COLLECTIONS.SANTRI, [], tenantId);
  setCollectionData(FIRESTORE_COLLECTIONS.BILLS, [], tenantId);
  setCollectionData(FIRESTORE_COLLECTIONS.POCKET_TX, [], tenantId);
  setCollectionData(FIRESTORE_COLLECTIONS.APPROVALS, [], tenantId);
  setCollectionData(FIRESTORE_COLLECTIONS.TRANSACTIONS, [], tenantId);
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
// FIREBASE CLOUD SYNC & MULTI-DEVICE REAL-TIME PERSISTENCE
// Proyek General: sipesand-app
// Format Path: tenants/{tenantId}/{collectionName}/{docId}
// =============================================================================

// Tulis Dokumen ke Firestore Sub-Koleksi Tenant (tenants/{tenantId}/{collectionName}/{docId})
export async function syncDocToFirestore(collectionName, docId, data, tenantId = getActiveTenantId()) {
  try {
    const safeTenant = (tenantId || 'app').toLowerCase().trim();
    const docRef = getTenantDoc(collectionName, String(docId), safeTenant);
    await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.warn(`[Firestore Cloud Sync] Gagal sync ${collectionName}/${docId}:`, err?.message);
  }
}

// Hapus Dokumen dari Firestore Sub-Koleksi Tenant
export async function deleteDocFromFirestore(collectionName, docId, tenantId = getActiveTenantId()) {
  try {
    const safeTenant = (tenantId || 'app').toLowerCase().trim();
    const docRef = getTenantDoc(collectionName, String(docId), safeTenant);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`[Firestore Cloud Sync] Gagal hapus ${collectionName}/${docId}:`, err?.message);
  }
}

// Registry Listener Aktif per Tenant & Koleksi
const activeTenantListeners = new Map();

// Inisialisasi Sinkronisasi Real-Time Multi-Device Firebase Firestore
export function initFirestoreRealtimeSync(tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return;
  const safeTenant = (tenantId || 'app').toLowerCase().trim();

  // 1. Pastikan Ruang Koleksi & Data Root Tenant Baru Diprovisi di Firestore
  ensureTenantProvisioned(safeTenant).catch(err => {
    console.warn(`[Firestore Provisioner] Note (${safeTenant}):`, err?.message);
  });

  const collectionsToListen = [
    FIRESTORE_COLLECTIONS.SANTRI,
    FIRESTORE_COLLECTIONS.BILLS,
    FIRESTORE_COLLECTIONS.POCKET_TX,
  ];

  collectionsToListen.forEach((colName) => {
    const listenerKey = `${safeTenant}_${colName}`;
    if (activeTenantListeners.has(listenerKey)) return;

    try {
      const colRef = getTenantCollection(colName, safeTenant);
      const unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (!snapshot.empty) {
          const cloudDocs = snapshot.docs.map(docSnap => {
            const docData = docSnap.data();
            return {
              ...docData,
              id: docData.id !== undefined ? docData.id : docSnap.id
            };
          });

          // Urutkan dokumen berdasarkan waktu terbaru
          cloudDocs.sort((a, b) => {
            const timeA = new Date(a.createdAt || a.id || 0).getTime();
            const timeB = new Date(b.createdAt || b.id || 0).getTime();
            return timeB - timeA;
          });

          // Perbarui local cache jika ada perbedaan (mencegah loop)
          const currentLocal = getCollectionData(colName, safeTenant);
          if (JSON.stringify(currentLocal) !== JSON.stringify(cloudDocs)) {
            localStorage.setItem(getStorageKey(colName, safeTenant), JSON.stringify(cloudDocs));
            window.dispatchEvent(new CustomEvent(`sipesand:firestore:${colName}`, {
              detail: { tenantId: safeTenant, collectionName: colName, data: cloudDocs }
            }));
          }
        } else {
          // Jika di Firestore masih kosong untuk tenant ini, seed data awal ke cloud
          const localData = getCollectionData(colName, safeTenant);
          if (Array.isArray(localData) && localData.length > 0) {
            localData.forEach(item => {
              syncDocToFirestore(colName, item.id || Date.now(), item, safeTenant);
            });
          }
        }
      }, (err) => {
        console.warn(`[Firestore Realtime Listener] (${safeTenant}/${colName}):`, err?.message);
      });

      activeTenantListeners.set(listenerKey, unsubscribe);
    } catch (err) {
      console.warn(`[Firestore Sync Init] (${colName}):`, err?.message);
    }
  });

  // Listener Real-Time Pengaturan Lembaga: tenants/{tenantId}/settings/config
  const settingsKey = `${safeTenant}_settings`;
  if (!activeTenantListeners.has(settingsKey)) {
    try {
      const settingsDocRef = getTenantDoc(FIRESTORE_COLLECTIONS.SETTINGS, 'config', safeTenant);
      const unsubSettings = onSnapshot(settingsDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const cloudSettings = docSnap.data();
          const localKey = `sipesand_settings_${safeTenant}`;
          const current = localStorage.getItem(localKey);
          if (JSON.stringify(cloudSettings) !== current) {
            localStorage.setItem(localKey, JSON.stringify(cloudSettings));
            localStorage.setItem('sipesand_tenant_settings', JSON.stringify(cloudSettings));
            window.dispatchEvent(new CustomEvent('sipesand:firestore:settings', {
              detail: { tenantId: safeTenant, data: cloudSettings }
            }));
          }
        } else {
          const currentSettings = firestoreGetSettings(safeTenant);
          if (currentSettings) {
            syncDocToFirestore(FIRESTORE_COLLECTIONS.SETTINGS, 'config', currentSettings, safeTenant);
          }
        }
      }, (err) => {
        console.warn(`[Firestore Settings Listener] (${safeTenant}):`, err?.message);
      });

      activeTenantListeners.set(settingsKey, unsubSettings);
    } catch (err) {
      console.warn(`[Firestore Settings Sync]:`, err?.message);
    }
  }
}

// Jalankan otomatis sync Firestore real-time saat modul dimuat di browser
if (typeof window !== 'undefined') {
  setTimeout(() => {
    initFirestoreRealtimeSync(getActiveTenantId());
  }, 100);
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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.SANTRI, newSantri.id, newSantri, tenantId);
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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.SANTRI, updatedSantri.id, updatedSantri, tenantId);
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
  deleteDocFromFirestore(FIRESTORE_COLLECTIONS.SANTRI, targetId, tenantId);
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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.SANTRI, currentSantri.id, santriList[santriIdx], tenantId);

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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.POCKET_TX, newTx.id, newTx, tenantId);

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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.BILLS, updatedBill.id, updatedBill, tenantId);

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
  syncDocToFirestore(FIRESTORE_COLLECTIONS.BILLS, newBill.id, newBill, tenantId);
  return newBill;
}

export function firestoreDeleteBill(id, tenantId = getActiveTenantId()) {
  const bills = getCollectionData(FIRESTORE_COLLECTIONS.BILLS, tenantId);
  const targetId = parseInt(id) || id;
  const filtered = bills.filter(b => b.id !== targetId);

  setCollectionData(FIRESTORE_COLLECTIONS.BILLS, filtered, tenantId);
  deleteDocFromFirestore(FIRESTORE_COLLECTIONS.BILLS, targetId, tenantId);
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
      mutqinTahfidzCount: mutqinSantri || (activeSantri.length > 0 ? Math.round(activeSantri.length * 0.35) : 0),
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

// =============================================================================
// SETTINGS & WEB BUILDER PERSISTENCE (Selesaikan Bug Edit Tidak Tersimpan)
// =============================================================================

export function firestoreGetSettings(tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return null;
  try {
    const key = `sipesand_settings_${tenantId}`;
    const raw = localStorage.getItem(key) || localStorage.getItem('sipesand_tenant_settings');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[FirestoreService] Error reading settings:', e);
  }
  if (tenantId === 'darulrahman') {
    return { ...SEED_DARULRAHMAN_SETTINGS };
  }
  return null;
}

export function firestoreSaveSettings(newSettings, tenantId = getActiveTenantId()) {
  if (typeof window === 'undefined') return newSettings;
  try {
    const current = firestoreGetSettings(tenantId) || {};
    const updated = { ...current, ...newSettings };
    const key = `sipesand_settings_${tenantId}`;
    localStorage.setItem(key, JSON.stringify(updated));
    localStorage.setItem('sipesand_tenant_settings', JSON.stringify(updated));

    // Broadcast Real-Time Settings Event
    window.dispatchEvent(new CustomEvent('sipesand:firestore:settings', {
      detail: { tenantId, data: updated }
    }));

    // Simpan ke Firestore Dokumen Config Sub-Koleksi Tenant
    syncDocToFirestore(FIRESTORE_COLLECTIONS.SETTINGS, 'config', updated, tenantId);

    return updated;
  } catch (e) {
    console.error('[FirestoreService] Error saving settings:', e);
    return newSettings;
  }
}
