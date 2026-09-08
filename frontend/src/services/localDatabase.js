/**
 * SiPesand Offline-First Client Database Engine (Local & Cloud Hybrid Sync)
 * 
 * Modul ini menyediakan database mandiri berbasis localStorage yang terisolasi
 * per-subdomain tenant (misal: darulrahman, pesantren-terpadu, master).
 * Menjamin seluruh fitur input, edit, delete, dan monitoring berjalan 100% lancar
 * baik saat backend live maupun ketika berjalan murni di Cloudflare Pages/offline.
 */

export function getCurrentTenant() {
  if (typeof window === 'undefined') return 'darulrahman';
  const searchParams = new URLSearchParams(window.location.search);
  const tenantQuery = searchParams.get('tenant') || searchParams.get('subdomain');
  const ignoredSubdomains = ['master', 'app', 'mitra', 'pay', 'www', 'api', 'root', 'saas', 'default', 'admin'];

  // 1. URL search params (e.g. ?tenant=darulrahman)
  if (tenantQuery && !ignoredSubdomains.includes(tenantQuery.toLowerCase().trim())) {
    const t = tenantQuery.toLowerCase().trim();
    try { localStorage.setItem('sipesand_active_tenant', t); } catch (e) {}
    return t;
  }

  // 2. Subdomain on sipesand.web.id (e.g. darulrahman.sipesand.web.id)
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('.sipesand.web.id')) {
    const parts = hostname.replace('.sipesand.web.id', '').split('.');
    if (parts.length > 0 && parts[0] && !ignoredSubdomains.includes(parts[0].trim())) {
      const t = parts[0].trim();
      try { localStorage.setItem('sipesand_active_tenant', t); } catch (e) {}
      return t;
    }
  }

  // 3. Subdomain on localhost (e.g. darulrahman.localhost)
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.replace('.localhost', '').split('.');
    if (parts.length > 0 && parts[0] && !ignoredSubdomains.includes(parts[0].trim())) {
      const t = parts[0].trim();
      try { localStorage.setItem('sipesand_active_tenant', t); } catch (e) {}
      return t;
    }
  }

  // 4. Stored active tenant in localStorage for multi-device session continuity
  try {
    const stored = localStorage.getItem('sipesand_active_tenant');
    if (stored && !ignoredSubdomains.includes(stored.toLowerCase().trim())) {
      return stored.toLowerCase().trim();
    }
  } catch (e) {}

  // 5. Stored user session tenant
  try {
    const rawUser = localStorage.getItem('sipesand_user') || sessionStorage.getItem('sipesand_user');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.tenant && !ignoredSubdomains.includes(u.tenant.toLowerCase().trim())) {
        return u.tenant.toLowerCase().trim();
      }
    }
  } catch (e) {}

  // 6. Default active pesantren tenant across all devices:
  // Selalu menghubungkan ke 'darulrahman' sebagai tenant operasional utama
  return 'darulrahman';
}

export function setCurrentTenant(tenant) {
  if (typeof window !== 'undefined' && tenant) {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const tenantQuery = searchParams.get('tenant') || searchParams.get('subdomain');
      const hostname = window.location.hostname.toLowerCase();
      const ignored = ['master', 'app', 'mitra', 'pay', 'www', 'api', 'root', 'saas', 'default', 'admin'];
      
      // If the current environment is strictly bound to a tenant URL or subdomain, prevent switching
      if (tenantQuery && !ignored.includes(tenantQuery.toLowerCase().trim())) {
        return;
      }
      if (hostname.includes('.sipesand.web.id')) {
        const parts = hostname.replace('.sipesand.web.id', '').split('.');
        if (parts[0] && !ignored.includes(parts[0].trim())) return;
      }
      if (hostname.endsWith('.localhost')) {
        const parts = hostname.replace('.localhost', '').split('.');
        if (parts[0] && !ignored.includes(parts[0].trim())) return;
      }

      localStorage.setItem('sipesand_active_tenant', tenant.toLowerCase().trim());
    } catch (e) {}
  }
}

const STORAGE_PREFIX = 'sipesand_db_v2_';

function getStorageKey(tenant = null) {
  const activeTenant = tenant || getCurrentTenant();
  return `${STORAGE_PREFIX}${activeTenant}`;
}

// -----------------------------------------------------------------------------
// INITIAL SEED DATA BUILDER
// -----------------------------------------------------------------------------
function buildInitialDatabase(tenant) {
  const isDarulRahman = tenant === 'darulrahman';
  const now = new Date();

  // Template Kategori Tagihan Master Standar Pesantren (Siap digunakan tanpa santri dummy)
  const masterBills = [
    {
      id: 1,
      name: 'SPP Syahriyah Pesantren',
      amount: 1200000,
      type: 'BULANAN_HIJRIYAH',
      description: 'SPP Pendidikan, Muhafadzoh, & Asrama Bulanan',
      isActive: true,
      createdAt: now.toISOString(),
    },
    {
      id: 2,
      name: 'Biaya Konsumsi Dapur Santri',
      amount: 650000,
      type: 'BULANAN_HIJRIYAH',
      description: 'Konsumsi dapur santri 3x sehari berstandar gizi',
      isActive: true,
      createdAt: now.toISOString(),
    },
    {
      id: 3,
      name: 'Paket Kitab & Modul Salafiyah',
      amount: 350000,
      type: 'TAHUNAN',
      description: isDarulRahman 
        ? 'Nadzom Alfiyah Ibnu Malik, Imrithi, Taqrib, & Kitab Salaf' 
        : 'Kitab Kuning, Kamus Bahasa, & Buku Panduan Tahunan',
      isActive: true,
      createdAt: now.toISOString(),
    },
  ];

  return {
    santri: [],
    masterBills,
    santriBills: [],
    generalLedger: [],
    pocketTxs: [],
    permits: [],
    academics: [],
    violations: [],
    divisionFunds: [],
  };
}

// -----------------------------------------------------------------------------
// LOCAL DATABASE CONTROLLER
// -----------------------------------------------------------------------------
export class LocalDatabase {
  constructor(tenant = null) {
    this.tenantOverride = tenant;
  }

  get tenant() {
    return this.tenantOverride || getCurrentTenant();
  }

  get storageKey() {
    return getStorageKey(this.tenant);
  }

  getData(tenant = null) {
    const activeT = tenant || this.tenant;
    const targetKey = getStorageKey(activeT);
    try {
      if (typeof window === 'undefined') return buildInitialDatabase(activeT);
      const raw = localStorage.getItem(targetKey);
      if (!raw) {
        const initial = buildInitialDatabase(activeT);
        this.saveData(initial, activeT);
        return initial;
      }
      const parsed = JSON.parse(raw);
      // Auto-purge legacy demo data (NIS 202601001 - 202601006) jika belum dibersihkan
      const purgeKey = `sipesand_demo_purged_${activeT}_v3`;
      if (!localStorage.getItem(purgeKey)) {
        localStorage.setItem(purgeKey, 'true');
        const DEMO_NIS = ['202601001', '202601002', '202601003', '202601004', '202601005', '202601006'];
        if (parsed.santri && parsed.santri.length > 0 && parsed.santri.every(s => DEMO_NIS.includes(String(s.nis)))) {
          parsed.santri = [];
          parsed.santriBills = [];
          parsed.generalLedger = [];
          parsed.pocketTxs = [];
          parsed.permits = [];
          parsed.academics = [];
          parsed.violations = [];
          parsed.divisionFunds = [];
          this.saveData(parsed, activeT);
          return parsed;
        }
      }
      return parsed;
    } catch (e) {
      console.warn('[LocalDatabase] Fallback parsing database error:', e);
      return buildInitialDatabase(activeT);
    }
  }

  clearDemoData(tenant = null) {
    const activeT = tenant || this.tenant;
    const cleanDb = buildInitialDatabase(activeT);
    this.saveData(cleanDb, activeT);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`sipesand_demo_purged_${activeT}_v3`, 'true');
    }
    return { success: true, message: 'Seluruh data demo berhasil dibersihkan! Database kini siap produksi.' };
  }

  saveData(data, tenant = null) {
    const activeT = tenant || this.tenant;
    const targetKey = getStorageKey(activeT);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(targetKey, JSON.stringify(data));
      }
    } catch (e) {
      console.error('[LocalDatabase] Gagal menyimpan ke localStorage:', e);
    }
  }

  // ---------------------------------------------------------------------------
  // 1. SANTRI MANAGEMENT
  // ---------------------------------------------------------------------------
  getSantriList(params = {}) {
    const db = this.getData();
    let list = [...(db.santri || [])];

    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(s => 
        (s.nama && s.nama.toLowerCase().includes(q)) ||
        (s.nis && s.nis.toLowerCase().includes(q)) ||
        (s.nfcUid && s.nfcUid.toLowerCase().includes(q)) ||
        (s.kamar && s.kamar.toLowerCase().includes(q)) ||
        (s.kelas && s.kelas.toLowerCase().includes(q)) ||
        (s.namaWali && s.namaWali.toLowerCase().includes(q))
      );
    }

    if (params.status) {
      list = list.filter(s => s.status === params.status);
    }

    if (params.kelas) {
      list = list.filter(s => s.kelas && s.kelas.toLowerCase().includes(params.kelas.toLowerCase()));
    }

    // Include count simulation
    const enrichedList = list.map(s => ({
      ...s,
      _count: {
        pocketTxs: (db.pocketTxs || []).filter(t => t.santriId === s.id).length,
        permits: (db.permits || []).filter(p => p.santriId === s.id).length,
        bills: (db.santriBills || []).filter(b => b.santriId === s.id).length,
        academics: (db.academics || []).filter(a => a.santriId === s.id).length,
        violations: (db.violations || []).filter(v => v.santriId === s.id).length,
      }
    }));

    return { success: true, data: enrichedList };
  }

  getSantriById(id) {
    const db = this.getData();
    const strId = String(id);
    const santri = (db.santri || []).find(s => String(s.id) === strId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const pocketTxs = (db.pocketTxs || []).filter(t => String(t.santriId) === strId);
    const permits = (db.permits || []).filter(p => String(p.santriId) === strId);
    const bills = (db.santriBills || []).filter(b => String(b.santriId) === strId);
    const academics = (db.academics || []).filter(a => String(a.santriId) === strId);
    const violations = (db.violations || []).filter(v => String(v.santriId) === strId);

    return {
      success: true,
      data: {
        ...santri,
        pocketTxs,
        permits,
        bills,
        academics,
        violations
      }
    };
  }

  createSantri(payload) {
    const db = this.getData();
    if (!payload.nama || !payload.nama.trim()) {
      return { success: false, message: 'Nama santri wajib diisi' };
    }

    // Cek duplikasi NIS
    if (payload.nis && payload.nis.trim()) {
      const cleanNis = payload.nis.trim();
      const existsNis = (db.santri || []).some(s => s.nis && String(s.nis).trim() === cleanNis);
      if (existsNis) {
        return { success: false, message: 'NIS sudah digunakan santri lain' };
      }
    }

    // Cek duplikasi NFC UID
    if (payload.nfcUid && payload.nfcUid.trim()) {
      const cleanUid = payload.nfcUid.trim().toUpperCase();
      const existsUid = (db.santri || []).some(s => s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
      if (existsUid) {
        return { success: false, message: 'NFC Card UID sudah terdaftar pada santri lain' };
      }
    }

    // ID unik multi-device anti-tabrakan
    const nextId = payload.id ? payload.id : (Date.now() + Math.floor(Math.random() * 1000));
    const newSantri = {
      id: nextId,
      nis: payload.nis ? payload.nis.trim() : `2026${Math.floor(10000 + Math.random() * 90000)}`,
      nfcUid: payload.nfcUid ? payload.nfcUid.trim().toUpperCase() : null,
      nama: payload.nama.trim(),
      gender: payload.gender || 'L',
      kelas: payload.kelas || '',
      kamar: payload.kamar || '',
      alamat: payload.alamat || '',
      namaWali: payload.namaWali || '',
      noHpWali: payload.noHpWali || '',
      saldo_saku: parseFloat(payload.saldo_saku || 0),
      status: payload.status || 'AKTIF',
      foto: payload.foto || null,
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    db.santri = [newSantri, ...(db.santri || [])];
    this.saveData(db);

    return {
      success: true,
      message: 'Santri berhasil ditambahkan',
      data: newSantri
    };
  }

  updateSantri(id, payload) {
    const db = this.getData();
    const strId = String(id);
    const index = (db.santri || []).findIndex(s => String(s.id) === strId);
    if (index === -1) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    // Cek duplikasi NFC jika diubah
    if (payload.nfcUid && payload.nfcUid.trim()) {
      const cleanUid = payload.nfcUid.trim().toUpperCase();
      const duplicate = (db.santri || []).some(s => String(s.id) !== strId && s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
      if (duplicate) {
        return { success: false, message: 'NFC Card UID sudah terdaftar pada santri lain' };
      }
    }

    const updated = {
      ...db.santri[index],
      ...payload,
      id: db.santri[index].id,
      saldo_saku: payload.saldo_saku !== undefined ? parseFloat(payload.saldo_saku) : db.santri[index].saldo_saku,
      updatedAt: new Date().toISOString(),
    };

    db.santri[index] = updated;
    this.saveData(db);

    return {
      success: true,
      message: 'Data santri berhasil diperbarui',
      data: updated
    };
  }

  deleteSantri(id) {
    const db = this.getData();
    const strId = String(id);
    db.santri = (db.santri || []).filter(s => String(s.id) !== strId);
    this.saveData(db);
    return { success: true, message: 'Santri berhasil dihapus' };
  }

  getSantriByNfc(uid) {
    const db = this.getData();
    if (!uid) return { success: false, message: 'UID tidak boleh kosong' };
    const cleanUid = uid.trim().toUpperCase();
    const santri = (db.santri || []).find(s => s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
    if (!santri) {
      return { success: false, message: 'Kartu RFID belum terdaftar pada santri manapun' };
    }
    return { success: true, data: santri };
  }

  registerRfidCard({ santriId, nfcUid, saldoSaku, status = 'AKTIF' }) {
    const db = this.getData();
    const strId = String(santriId);
    const santri = (db.santri || []).find(s => String(s.id) === strId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const cleanUid = nfcUid.trim().toUpperCase();
    const existingHolder = (db.santri || []).find(s => String(s.id) !== strId && s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
    if (existingHolder) {
      return {
        success: false,
        message: `UID "${cleanUid}" sudah digunakan oleh santri lain: ${existingHolder.nama} (NIS: ${existingHolder.nis || '-'})`
      };
    }

    santri.nfcUid = cleanUid;
    if (status) santri.status = status;
    if (saldoSaku !== undefined && saldoSaku !== '') {
      santri.saldo_saku = parseFloat(saldoSaku);
    }
    santri.updatedAt = new Date().toISOString();

    this.saveData(db);
    return {
      success: true,
      message: `Kartu RFID (${cleanUid}) berhasil ditautkan ke ${santri.nama}.`,
      data: santri
    };
  }

  unregisterRfidCard({ santriId }) {
    const db = this.getData();
    const strId = String(santriId);
    const santri = (db.santri || []).find(s => String(s.id) === strId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }
    santri.nfcUid = null;
    santri.updatedAt = new Date().toISOString();
    this.saveData(db);
    return { success: true, message: 'Asosiasi kartu RFID berhasil dicabut' };
  }

  // ---------------------------------------------------------------------------
  // 2. GENERAL LEDGER (BUKU KAS UMUM)
  // ---------------------------------------------------------------------------
  getLedgerEntries(params = {}) {
    const db = this.getData();
    let entries = [...(db.generalLedger || [])];

    if (params.type) {
      entries = entries.filter(e => e.type === params.type);
    }
    if (params.category) {
      entries = entries.filter(e => e.category === params.category);
    }
    if (params.startDate) {
      const start = new Date(params.startDate).getTime();
      entries = entries.filter(e => new Date(e.date).getTime() >= start);
    }
    if (params.endDate) {
      const end = new Date(params.endDate).getTime() + 86400000;
      entries = entries.filter(e => new Date(e.date).getTime() <= end);
    }

    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { success: true, data: entries };
  }

  getLedgerSummary() {
    const db = this.getData();
    const entries = db.generalLedger || [];
    let totalIncome = 0;
    let totalExpense = 0;
    let countIncome = 0;
    let countExpense = 0;
    const catMap = {};

    entries.forEach(e => {
      const amt = parseFloat(e.amount || 0);
      if (e.type === 'INCOME') {
        totalIncome += amt;
        countIncome++;
      } else {
        totalExpense += amt;
        countExpense++;
      }

      const key = `${e.type}_${e.category}`;
      if (!catMap[key]) {
        catMap[key] = { category: e.category, type: e.type, total: 0, count: 0 };
      }
      catMap[key].total += amt;
      catMap[key].count++;
    });

    return {
      success: true,
      data: {
        totalIncome,
        totalExpense,
        currentBalance: totalIncome - totalExpense,
        countIncome,
        countExpense,
        byCategory: Object.values(catMap)
      }
    };
  }

  createLedgerEntry(payload) {
    const db = this.getData();
    const { type, category, amount, description, reference, date } = payload;

    if (!type || !category || !amount || !description) {
      return { success: false, message: 'Semua field wajib diisi (type, category, amount, description)' };
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Nominal transaksi harus lebih besar dari 0' };
    }

    const dateObj = date ? new Date(date) : new Date();
    const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `KAS-${dateStr}-${randSuffix}`;

    const nextId = (db.generalLedger || []).reduce((max, e) => Math.max(max, e.id || 0), 0) + 1;
    const newEntry = {
      id: nextId,
      code,
      date: dateObj.toISOString(),
      type,
      category,
      amount: numAmount,
      description,
      reference: reference || null,
      createdAt: new Date().toISOString(),
    };

    db.generalLedger = [newEntry, ...(db.generalLedger || [])];
    this.saveData(db);

    return {
      success: true,
      message: `Catatan kas ${type === 'INCOME' ? 'masuk' : 'keluar'} berhasil disimpan`,
      data: newEntry
    };
  }

  deleteLedgerEntry(id) {
    const db = this.getData();
    const strId = String(id);
    db.generalLedger = (db.generalLedger || []).filter(e => String(e.id) !== strId);
    this.saveData(db);
    return { success: true, message: 'Catatan kas berhasil dihapus' };
  }

  // ---------------------------------------------------------------------------
  // 3. POCKET TRANSACTIONS (UANG SAKU & POS CASHLESS)
  // ---------------------------------------------------------------------------
  getPocketTransactions(params = {}) {
    const db = this.getData();
    let txs = [...(db.pocketTxs || [])];

    if (params.santriId) {
      const strSantriId = String(params.santriId);
      txs = txs.filter(t => String(t.santriId) === strSantriId);
    }

    // Attach santri info
    const enriched = txs.map(t => {
      const s = (db.santri || []).find(santri => String(santri.id) === String(t.santriId));
      return {
        ...t,
        santri: s ? { id: s.id, nama: s.nama, nis: s.nis, kamar: s.kamar, kelas: s.kelas } : null
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (params.limit) {
      return { success: true, data: enriched.slice(0, parseInt(params.limit)) };
    }
    return { success: true, data: enriched };
  }

  createPocketTransaction(payload) {
    const db = this.getData();
    const { santriId, type, amount, description } = payload;
    const strSantriId = String(santriId);
    const numAmount = parseFloat(amount);

    const santri = (db.santri || []).find(s => String(s.id) === strSantriId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      return { success: false, message: 'Nominal harus lebih besar dari 0' };
    }

    let newBalance = santri.saldo_saku || 0;
    if (type === 'TOPUP') {
      newBalance += numAmount;
    } else {
      newBalance -= numAmount;
    }

    santri.saldo_saku = newBalance;

    const nextId = payload.id ? payload.id : (Date.now() + Math.floor(Math.random() * 1000));
    const newTx = {
      id: nextId,
      santriId: santri.id,
      type: type || 'PURCHASE',
      amount: numAmount,
      currentBalance: newBalance,
      description: description || (type === 'TOPUP' ? 'Top-Up Saldo Uang Saku' : 'Transaksi Uang Saku'),
      createdAt: payload.createdAt || new Date().toISOString(),
    };

    db.pocketTxs = [newTx, ...(db.pocketTxs || [])];
    this.saveData(db);

    return {
      success: true,
      message: 'Transaksi uang saku berhasil dicatat',
      data: {
        ...newTx,
        santri: { nama: santri.nama, nis: santri.nis, saldo_saku: newBalance }
      }
    };
  }

  deductPocketBalance(payload) {
    return this.createPocketTransaction({
      ...payload,
      type: payload.type || 'WITHDRAW'
    });
  }

  // ---------------------------------------------------------------------------
  // 4. BILLS & INVOICES (TAGIHAN & SYAHRIYAH)
  // ---------------------------------------------------------------------------
  getMasterBills() {
    const db = this.getData();
    return { success: true, data: db.masterBills || [] };
  }

  createMasterBill(payload) {
    const db = this.getData();
    const nextId = payload.id ? String(payload.id) : ('MBILL-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const newBill = {
      id: nextId,
      name: payload.name,
      amount: parseFloat(payload.amount),
      type: payload.type || 'BULANAN_HIJRIYAH',
      description: payload.description || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    db.masterBills = [...(db.masterBills || []), newBill];
    this.saveData(db);
    return { success: true, data: newBill };
  }

  deleteMasterBill(id) {
    const db = this.getData();
    db.masterBills = (db.masterBills || []).filter(b => String(b.id) !== String(id));
    this.saveData(db);
    return { success: true, message: 'Master tagihan dihapus' };
  }

  getSantriBills(params = {}) {
    const db = this.getData();
    let list = [...(db.santriBills || [])];

    if (params.status) {
      list = list.filter(b => b.status === params.status);
    }
    if (params.santriId) {
      list = list.filter(b => String(b.santriId) === String(params.santriId));
    }

    const enriched = list.map(b => {
      const s = (db.santri || []).find(santri => String(santri.id) === String(b.santriId));
      const m = (db.masterBills || []).find(master => String(master.id) === String(b.masterBillId));
      return {
        ...b,
        santri: s || null,
        masterBill: m || null
      };
    });

    return { success: true, data: enriched };
  }

  updateSantriBill(id, payload) {
    const db = this.getData();
    const index = (db.santriBills || []).findIndex(b => String(b.id) === String(id));
    if (index === -1) {
      return { success: false, message: 'Tagihan tidak ditemukan' };
    }

    const prev = db.santriBills[index];
    const updated = {
      ...prev,
      ...payload,
      id: prev.id,
      updatedAt: new Date().toISOString(),
    };

    // Bila status berubah jadi PAID dan belum pernah dicatat di Kas, catat otomatis ke Kas Umum
    if (payload.status === 'PAID' && prev.status !== 'PAID') {
      updated.paidAt = new Date().toISOString();
      const s = (db.santri || []).find(santri => String(santri.id) === String(updated.santriId));
      this.createLedgerEntry({
        type: 'INCOME',
        category: 'SPP',
        amount: updated.amount,
        description: `Pembayaran ${updated.title} - ${s ? s.nama : 'Santri'}`,
        reference: `BILL-${updated.id}`
      });
    }

    db.santriBills[index] = updated;
    this.saveData(db);
    return { success: true, data: updated };
  }

  deleteSantriBill(id) {
    const db = this.getData();
    db.santriBills = (db.santriBills || []).filter(b => String(b.id) !== String(id));
    this.saveData(db);
    return { success: true, message: 'Tagihan santri dihapus' };
  }

  autoGenerateHijriBills(payload) {
    const db = this.getData();
    const { masterBillId, hijriMonth, hijriYear } = payload;
    const master = (db.masterBills || []).find(m => String(m.id) === String(masterBillId));
    if (!master) {
      return { success: false, message: 'Master tagihan tidak ditemukan' };
    }

    const activeSantri = (db.santri || []).filter(s => s.status === 'AKTIF');
    let generatedCount = 0;
    const generatedBills = [];

    activeSantri.forEach(s => {
      const exists = (db.santriBills || []).some(b => 
        String(b.santriId) === String(s.id) && 
        String(b.masterBillId) === String(master.id) && 
        b.hijriMonth === hijriMonth && 
        b.hijriYear === hijriYear
      );
      if (!exists) {
        const nextId = 'BILL-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const newBill = {
          id: nextId,
          santriId: s.id,
          masterBillId: master.id,
          title: `${master.name} - ${hijriMonth} ${hijriYear}`,
          amount: master.amount,
          hijriMonth,
          hijriYear,
          status: 'UNPAID',
          paidAt: null,
          createdAt: new Date().toISOString(),
        };
        db.santriBills.push(newBill);
        generatedBills.push(newBill);
        generatedCount++;
      }
    });

    this.saveData(db);
    return { success: true, count: generatedCount, data: { bills: generatedBills }, message: `Berhasil menerbitkan ${generatedCount} tagihan santri` };
  }

  // ---------------------------------------------------------------------------
  // 5. SECURITY & PERMITS (PERIZINAN KAMTIB)
  // ---------------------------------------------------------------------------
  getPermits(params = {}) {
    const db = this.getData();
    let list = [...(db.permits || [])];

    if (params.status) {
      list = list.filter(p => p.status === params.status);
    }
    if (params.santriId) {
      list = list.filter(p => String(p.santriId) === String(params.santriId));
    }

    const enriched = list.map(p => {
      const s = (db.santri || []).find(santri => String(santri.id) === String(p.santriId));
      return {
        ...p,
        santri: s || null
      };
    });

    enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return { success: true, data: enriched };
  }

  createPermit(payload) {
    const db = this.getData();
    const santri = (db.santri || []).find(s => String(s.id) === String(payload.santriId));
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const nextId = payload.id ? String(payload.id) : ('PERMIT-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const newPermit = {
      id: nextId,
      santriId: santri.id,
      reason: payload.reason || '',
      destination: payload.destination || '',
      departureTime: payload.departureTime || new Date().toISOString(),
      returnTime: payload.returnTime || new Date(Date.now() + 86400000).toISOString(),
      actualReturnTime: null,
      status: 'ACTIVE',
      approverName: payload.approverName || 'Ustadz Keamanan Kamtib',
      createdAt: new Date().toISOString(),
    };

    db.permits = [newPermit, ...(db.permits || [])];
    this.saveData(db);
    return { success: true, data: newPermit, message: 'Izin santri berhasil diterbitkan' };
  }

  updatePermitStatus(id, payload) {
    const db = this.getData();
    const permit = (db.permits || []).find(p => String(p.id) === String(id));
    if (!permit) {
      return { success: false, message: 'Data perizinan tidak ditemukan' };
    }

    permit.status = payload.status;
    if (payload.status === 'RETURNED') {
      permit.actualReturnTime = payload.actualReturnTime || new Date().toISOString();
    }
    this.saveData(db);
    return { success: true, data: permit };
  }

  deletePermit(id) {
    const db = this.getData();
    db.permits = (db.permits || []).filter(p => String(p.id) !== String(id));
    this.saveData(db);
    return { success: true, message: 'Data izin santri berhasil dihapus' };
  }

  checkInByNfc({ nfcUid }) {
    const db = this.getData();
    const cleanUid = nfcUid.trim().toUpperCase();
    const santri = (db.santri || []).find(s => s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
    if (!santri) {
      return { success: false, message: 'Kartu RFID belum terdaftar' };
    }

    const activePermit = (db.permits || []).find(p => String(p.santriId) === String(santri.id) && p.status === 'ACTIVE');
    if (!activePermit) {
      return {
        success: true,
        data: { santri, permit: null, status: 'NORMAL_CHECKIN' },
        message: `Santri ${santri.nama} terdeteksi di gerbang pos kamtib (Tidak sedang izin keluar)`
      };
    }

    activePermit.status = 'RETURNED';
    activePermit.actualReturnTime = new Date().toISOString();
    this.saveData(db);

    return {
      success: true,
      data: { santri, permit: activePermit, status: 'PERMIT_RETURNED' },
      message: `Santri ${santri.nama} berhasil check-in kembali ke pesantren`
    };
  }

  // ---------------------------------------------------------------------------
  // 6. ACADEMICS & MUHAFADZOH
  // ---------------------------------------------------------------------------
  getAcademicRecords(params = {}) {
    const db = this.getData();
    let list = [...(db.academics || [])];
    if (params.santriId) {
      list = list.filter(a => String(a.santriId) === String(params.santriId));
    }
    const enriched = list.map(a => ({
      ...a,
      santri: (db.santri || []).find(s => String(s.id) === String(a.santriId)) || null
    }));
    return { success: true, data: enriched };
  }

  createAcademicRecord(payload) {
    const db = this.getData();
    const nextId = payload.id ? String(payload.id) : ('ACAD-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const newRecord = {
      id: nextId,
      santriId: String(payload.santriId),
      subject: payload.subject,
      score: parseFloat(payload.score || 0),
      grade: payload.grade || 'A',
      notes: payload.notes || '',
      date: payload.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.academics = [newRecord, ...(db.academics || [])];
    this.saveData(db);
    return { success: true, data: newRecord, message: 'Nilai muhafadzoh berhasil dicatat' };
  }

  deleteAcademicRecord(id) {
    const db = this.getData();
    db.academics = (db.academics || []).filter(a => String(a.id) !== String(id));
    this.saveData(db);
    return { success: true, message: 'Catatan akademik berhasil dihapus' };
  }

  // ---------------------------------------------------------------------------
  // 7. SECURITY VIOLATIONS
  // ---------------------------------------------------------------------------
  getViolations(params = {}) {
    const db = this.getData();
    let list = [...(db.violations || [])];
    if (params.santriId) {
      list = list.filter(v => String(v.santriId) === String(params.santriId));
    }
    const enriched = list.map(v => ({
      ...v,
      santri: (db.santri || []).find(s => String(s.id) === String(v.santriId)) || null
    }));
    return { success: true, data: enriched };
  }

  createViolation(payload) {
    const db = this.getData();
    const nextId = payload.id ? String(payload.id) : ('VIOL-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const newV = {
      id: nextId,
      santriId: String(payload.santriId),
      violationType: payload.violationType || 'DISIPLIN',
      description: payload.description || '',
      sanction: payload.sanction || '',
      status: payload.status || 'PENDING',
      date: payload.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    db.violations = [newV, ...(db.violations || [])];
    this.saveData(db);
    return { success: true, data: newV, message: 'Catatan pelanggaran santri berhasil disimpan' };
  }

  deleteViolation(id) {
    const db = this.getData();
    db.violations = (db.violations || []).filter(v => String(v.id) !== String(id));
    this.saveData(db);
    return { success: true, message: 'Catatan pelanggaran santri berhasil dihapus' };
  }

  // ---------------------------------------------------------------------------
  // 8. APPROVALS & DIVISION FUNDS
  // ---------------------------------------------------------------------------
  getDivisionFunds() {
    const db = this.getData();
    return { success: true, data: db.divisionFunds || [] };
  }

  createDivisionFund(payload) {
    const db = this.getData();
    const nextId = payload.id ? String(payload.id) : ('FUND-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    const newFund = {
      id: nextId,
      division: payload.division || 'PENGASUHAN',
      applicantName: payload.applicantName || 'Ustadz Pengaju',
      title: payload.title || '',
      amount: parseFloat(payload.amount || 0),
      status: 'PENDING',
      approvedAmount: null,
      description: payload.description || '',
      createdAt: new Date().toISOString(),
    };
    db.divisionFunds = [newFund, ...(db.divisionFunds || [])];
    this.saveData(db);
    return { success: true, data: newFund, message: 'Pengajuan dana berhasil diajukan' };
  }

  updateDivisionFundStatus(id, payload) {
    const db = this.getData();
    const fund = (db.divisionFunds || []).find(f => String(f.id) === String(id));
    if (!fund) return { success: false, message: 'Pengajuan dana tidak ditemukan' };

    fund.status = payload.status;
    if (payload.approvedAmount) fund.approvedAmount = parseFloat(payload.approvedAmount);
    this.saveData(db);
    return { success: true, data: fund };
  }

  // ---------------------------------------------------------------------------
  // 9. DASHBOARD STATS AGGREGATOR
  // ---------------------------------------------------------------------------
  getDashboardStats() {
    const db = this.getData();
    const santriList = db.santri || [];
    const ledger = db.generalLedger || [];
    const bills = db.santriBills || [];
    const permits = db.permits || [];

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
    const pendingDivisionFundsCount = (db.divisionFunds || []).filter(f => f.status === 'PENDING').length;

    // Attach recent transactions
    const recentPocketTxs = this.getPocketTransactions({ limit: 5 }).data;
    const recentLedgerTxs = (this.getLedgerEntries().data || []).slice(0, 5);

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
        pendingDivisionFundsCount,
        recentPocketTxs,
        recentLedgerTxs,
        currentActivePermits: (this.getPermits({ status: 'ACTIVE' }).data || []).slice(0, 5),
        pendingBillsList: (this.getSantriBills({ status: 'PENDING_VERIFICATION' }).data || []).slice(0, 5),
        recentAcademics: (this.getAcademicRecords().data || []).slice(0, 5)
      }
    };
  }

  // ---------------------------------------------------------------------------
  // 10. PORTAL WALI (PUBLIC ACCESS WITH STRICT TENANT ISOLATION)
  // ---------------------------------------------------------------------------
  getPortalWaliData(query, tenant = null) {
    const activeT = tenant || this.tenant;
    const db = this.getData(activeT);
    if (!query) return { success: false, message: 'NIS atau Nama santri wajib dimasukkan' };
    const q = query.trim().toLowerCase();

    const santri = (db.santri || []).find(s => 
      (s.nis && String(s.nis).trim().toLowerCase() === q) || 
      (s.nfcUid && String(s.nfcUid).trim().toLowerCase() === q) ||
      (s.nama && String(s.nama).trim().toLowerCase().includes(q))
    );

    if (!santri) {
      return { 
        success: false, 
        message: `Data santri "${query}" tidak ditemukan pada database ${activeT}. Pastikan nama atau nomor induk santri (NIS) sudah sesuai.` 
      };
    }

    const bills = (db.santriBills || []).filter(b => String(b.santriId) === String(santri.id));
    const pocketTxs = (db.pocketTxs || []).filter(t => String(t.santriId) === String(santri.id)).slice(0, 10);
    const permits = (db.permits || []).filter(p => String(p.santriId) === String(santri.id)).slice(0, 5);
    const academics = (db.academics || []).filter(a => String(a.santriId) === String(santri.id));

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
        tenant: activeT
      }
    };
  }

  uploadPaymentProof({ billId, proofUrl, proofNote }, tenant = null) {
    const activeT = tenant || this.tenant;
    const db = this.getData(activeT);
    const bill = (db.santriBills || []).find(b => String(b.id) === String(billId));
    if (!bill) return { success: false, message: 'Tagihan tidak ditemukan' };

    bill.status = 'PENDING_VERIFICATION';
    bill.proofUrl = proofUrl;
    bill.proofNote = proofNote || 'Upload Bukti Pembayaran Portal Wali';
    bill.updatedAt = new Date().toISOString();

    this.saveData(db, activeT);
    return { success: true, message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi bendahara.' };
  }
}

// Singleton helper
export const localDb = new LocalDatabase();
