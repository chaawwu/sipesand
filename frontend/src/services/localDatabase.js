/**
 * SiPesand Offline-First Client Database Engine (Local & Cloud Hybrid Sync)
 * 
 * Modul ini menyediakan database mandiri berbasis localStorage yang terisolasi
 * per-subdomain tenant (misal: darulrahman, pesantren-terpadu, master).
 * Menjamin seluruh fitur input, edit, delete, dan monitoring berjalan 100% lancar
 * baik saat backend live maupun ketika berjalan murni di Cloudflare Pages/offline.
 */

export function getCurrentTenant() {
  if (typeof window === 'undefined') return 'default';
  const hostname = window.location.hostname.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  const tenantQuery = searchParams.get('tenant') || searchParams.get('subdomain');
  const ignoredSubdomains = ['master', 'app', 'mitra', 'pay', 'www', 'api', 'root'];

  if (tenantQuery && !ignoredSubdomains.includes(tenantQuery.toLowerCase().trim())) {
    return tenantQuery.toLowerCase().trim();
  }
  if (hostname.includes('.sipesand.web.id')) {
    const parts = hostname.replace('.sipesand.web.id', '').split('.');
    if (parts.length > 0 && parts[0] && !ignoredSubdomains.includes(parts[0])) {
      return parts[0];
    }
  }
  if (hostname.endsWith('.localhost')) {
    const parts = hostname.replace('.localhost', '').split('.');
    if (parts.length > 0 && parts[0] && !ignoredSubdomains.includes(parts[0])) {
      return parts[0];
    }
  }
  // Default tenant adalah 'darulrahman' agar konsisten multi-device di semua hostname (termasuk pages.dev, IP, dan localhost)
  return 'darulrahman';
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

  const santri = [
    {
      id: 1,
      nis: '202601001',
      nfcUid: 'NFC-8A3F129B',
      nama: isDarulRahman ? 'Muhammad Azzam Al-Fatih' : 'Muhammad Farhan Al-Fatih',
      gender: 'L',
      kelas: '10 IPA (KMI 4)',
      kamar: 'Asrama Umar bin Khattab No. 04',
      alamat: isDarulRahman ? 'Sumbersari, Kencong, Kediri, Jawa Timur' : 'Jl. Malioboro No. 45, Kota Yogyakarta',
      namaWali: 'H. Marzuqi Ahmad',
      noHpWali: '087713871356',
      saldo_saku: 175000,
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
    {
      id: 2,
      nis: '202601002',
      nfcUid: 'NFC-4B7C91D3',
      nama: 'Aisyah Nur Ramadhani',
      gender: 'P',
      kelas: '11 Keagamaan (KMI 5)',
      kamar: 'Asrama Siti Khadijah No. 12',
      alamat: 'Perumahan Griya Indah C2, Sleman, D.I. Yogyakarta',
      namaWali: 'Dr. Hendra Gunawan',
      noHpWali: '081298765432',
      saldo_saku: 250000,
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString(),
    },
    {
      id: 3,
      nis: '202601003',
      nfcUid: 'NFC-9E2A5501',
      nama: 'Ahmad Zaki Mubarak',
      gender: 'L',
      kelas: '12 IPS (KMI 6)',
      kamar: 'Asrama Abu Bakar No. 07',
      alamat: 'Jl. Slamet Riyadi No. 102, Surakarta, Jawa Tengah',
      namaWali: 'Drs. Supriyadi',
      noHpWali: '081377889900',
      saldo_saku: -25000, // Status minus / talangan darurat
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      id: 4,
      nis: '202601004',
      nfcUid: 'NFC-1C3D88AA',
      nama: 'Fathimah Azzahra',
      gender: 'P',
      kelas: '10 IPA (KMI 4)',
      kamar: 'Asrama Aisyah No. 03',
      alamat: 'Kompleks Pesona Candi No. 18, Magelang, Jawa Tengah',
      namaWali: 'Rahmat Hidayat, M.Pd.',
      noHpWali: '081566778899',
      saldo_saku: 320000,
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 15 * 86400000).toISOString(),
    },
    {
      id: 5,
      nis: '202601005',
      nfcUid: 'NFC-7F88BB42',
      nama: 'Bilal Habasyi Rizqullah',
      gender: 'L',
      kelas: '11 IPA (KMI 5)',
      kamar: 'Asrama Ali bin Abi Thalib No. 02',
      alamat: 'Jl. Veteran No. 88, Semarang, Jawa Tengah',
      namaWali: 'H. Lukman Hakim',
      noHpWali: '081911223344',
      saldo_saku: 85000,
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 6,
      nis: '202601006',
      nfcUid: null, // Belum punya kartu RFID
      nama: 'Zaid bin Tsabit',
      gender: 'L',
      kelas: '1 Tsanawiyah',
      kamar: 'Asrama Utsman bin Affan No. 01',
      alamat: 'Jl. Raya Kencong No. 12, Kediri, Jawa Timur',
      namaWali: 'H. Muhsin',
      noHpWali: '085233445566',
      saldo_saku: 50000,
      status: 'AKTIF',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
  ];

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

  const santriBills = [
    {
      id: 1,
      santriId: 1,
      masterBillId: 1,
      title: 'SPP Syahriyah Pesantren - Shafar 1448 H',
      amount: 1200000,
      hijriMonth: 'Shafar',
      hijriYear: '1448 H',
      status: 'PAID',
      paidAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
      paymentMethod: 'TRANSFER_BSI',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 2,
      santriId: 2,
      masterBillId: 1,
      title: 'SPP Syahriyah Pesantren - Shafar 1448 H',
      amount: 1200000,
      hijriMonth: 'Shafar',
      hijriYear: '1448 H',
      status: 'PAID',
      paidAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
      paymentMethod: 'QRIS_PORTAL',
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 3,
      santriId: 3,
      masterBillId: 1,
      title: 'SPP Syahriyah Pesantren - Shafar 1448 H',
      amount: 1200000,
      hijriMonth: 'Shafar',
      hijriYear: '1448 H',
      status: 'UNPAID',
      paidAt: null,
      createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    },
    {
      id: 4,
      santriId: 4,
      masterBillId: 2,
      title: 'Biaya Konsumsi Dapur Santri - Shafar 1448 H',
      amount: 650000,
      hijriMonth: 'Shafar',
      hijriYear: '1448 H',
      status: 'PENDING_VERIFICATION',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
      proofNote: 'Transfer BSI a.n. Rahmat Hidayat',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  const generalLedger = [
    {
      id: 1,
      code: 'KAS-20260901-1001',
      date: new Date(now.getTime() - 7 * 86400000).toISOString(),
      type: 'INCOME',
      category: 'SPP',
      amount: 18500000,
      description: 'Penerimaan SPP Syahriyah Santri Gelombang 1',
      reference: 'BSI-VA-0901',
    },
    {
      id: 2,
      code: 'KAS-20260902-1002',
      date: new Date(now.getTime() - 6 * 86400000).toISOString(),
      type: 'INCOME',
      category: 'Donasi',
      amount: 5000000,
      description: 'Infaq & Wakaf Pembangunan Asrama dari Wali Santri',
      reference: 'DONASI-WALI-02',
    },
    {
      id: 3,
      code: 'KAS-20260903-1003',
      date: new Date(now.getTime() - 5 * 86400000).toISOString(),
      type: 'EXPENSE',
      category: 'Konsumsi Dapur Santri',
      amount: 4200000,
      description: 'Belanja beras dan bahan dapur santri mingguan',
      reference: 'NOTA-PASAR-03',
    },
    {
      id: 4,
      code: 'KAS-20260904-1004',
      date: new Date(now.getTime() - 4 * 86400000).toISOString(),
      type: 'EXPENSE',
      category: 'Operasional Listrik & Air',
      amount: 1750000,
      description: 'Pembayaran Tagihan PLN Kompleks Asrama',
      reference: 'PLN-202609',
    },
    {
      id: 5,
      code: 'KAS-20260905-1005',
      date: new Date(now.getTime() - 3 * 86400000).toISOString(),
      type: 'EXPENSE',
      category: 'Gaji & Honor Asatidz',
      amount: 4500000,
      description: 'Honor Asatidz Pengampu Diniyah & Muhafadzoh',
      reference: 'HONOR-0905',
    },
  ];

  const pocketTxs = [
    {
      id: 1,
      santriId: 1,
      type: 'TOPUP',
      amount: 200000,
      currentBalance: 175000,
      description: 'Top-Up Uang Saku via Transfer BSI Wali',
      createdAt: new Date(now.getTime() - 4 * 86400000).toISOString(),
    },
    {
      id: 2,
      santriId: 1,
      type: 'PURCHASE',
      amount: 25000,
      currentBalance: 175000,
      description: 'Belanja di Koperasi/Kantin Smart POS NFC',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    },
    {
      id: 3,
      santriId: 2,
      type: 'TOPUP',
      amount: 300000,
      currentBalance: 250000,
      description: 'Top-Up Uang Saku via Portal Wali',
      createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: 4,
      santriId: 3,
      type: 'WITHDRAW',
      amount: 50000,
      currentBalance: -25000,
      description: 'Penarikan Kebutuhan Obat Darurat Poliklinik (Talangan)',
      createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  const permits = [
    {
      id: 1,
      santriId: 1,
      reason: 'Pemeriksaan Gigi ke Rumah Sakit Umum',
      destination: 'RSUD Kabupaten Kediri',
      departureTime: new Date(now.getTime() - 6 * 3600000).toISOString(),
      returnTime: new Date(now.getTime() + 2 * 3600000).toISOString(),
      actualReturnTime: null,
      status: 'ACTIVE',
      approverName: 'Ustadz Keamanan Kamtib',
      createdAt: new Date(now.getTime() - 6 * 3600000).toISOString(),
    },
    {
      id: 2,
      santriId: 2,
      reason: 'Menghadiri Pernikahan Kakak Kandung',
      destination: 'Sleman, Yogyakarta',
      departureTime: new Date(now.getTime() - 48 * 3600000).toISOString(),
      returnTime: new Date(now.getTime() - 12 * 3600000).toISOString(),
      actualReturnTime: new Date(now.getTime() - 14 * 3600000).toISOString(),
      status: 'RETURNED',
      approverName: 'Ustadz Keamanan Kamtib',
      createdAt: new Date(now.getTime() - 50 * 3600000).toISOString(),
    },
  ];

  const academics = [
    {
      id: 1,
      santriId: 1,
      subject: isDarulRahman ? 'Muhafadzoh Alfiyah Ibnu Malik' : 'Tahfidz Al-Qur\'an',
      score: 92,
      grade: 'A',
      notes: isDarulRahman ? 'Lancar setoran 50 bait bab Kalam & I\'rob, makhraj fasih' : 'Juz 1-3 mutqin',
      date: new Date(now.getTime() - 3 * 86400000).toISOString(),
    },
    {
      id: 2,
      santriId: 1,
      subject: 'Kajian Fathul Qorib',
      score: 90,
      grade: 'A',
      notes: 'Pemahaman Bab Thaharah & Shalat sangat memuaskan',
      date: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: 3,
      santriId: 2,
      subject: isDarulRahman ? 'Muhafadzoh Nadzom Imrithi' : 'Tahfidz Al-Qur\'an',
      score: 95,
      grade: 'A',
      notes: 'Mumtaz, hafalan 100 bait lancar sekali',
      date: new Date(now.getTime() - 2 * 86400000).toISOString(),
    },
  ];

  const violations = [
    {
      id: 1,
      santriId: 3,
      violationType: 'KETERLAMBATAN',
      description: 'Terlambat kembali ke asrama setelah shalat Isya',
      sanction: 'Takziran membaca 50 bait Nadzom Alfiyah di serambi',
      status: 'COMPLETED',
      date: new Date(now.getTime() - 4 * 86400000).toISOString(),
    }
  ];

  const divisionFunds = [
    {
      id: 1,
      division: 'KAMTIB_PENGASUHAN',
      applicantName: 'Ustadz Hasan Basri',
      title: 'Pengadaan Kartu RFID Smart NFC & Scanner',
      amount: 1500000,
      status: 'APPROVED',
      approvedAmount: 1500000,
      description: 'Penyediaan 100 kartu KTSD baru untuk santri mukim',
      createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    },
    {
      id: 2,
      division: 'PENDIDIKAN_SALAF',
      applicantName: 'Ustadz M. Syukron',
      title: 'Konsumsi & Sertifikat Bahtsul Masa\'il Santri',
      amount: 750000,
      status: 'PENDING',
      approvedAmount: null,
      description: 'Kegiatan musyawarah bahtsul masa\'il fikih santri bulanan',
      createdAt: new Date(now.getTime() - 1 * 86400000).toISOString(),
    }
  ];

  return {
    santri,
    masterBills,
    santriBills,
    generalLedger,
    pocketTxs,
    permits,
    academics,
    violations,
    divisionFunds,
  };
}

// -----------------------------------------------------------------------------
// LOCAL DATABASE CONTROLLER
// -----------------------------------------------------------------------------
export class LocalDatabase {
  constructor(tenant = null) {
    this.tenant = tenant || getCurrentTenant();
    this.storageKey = getStorageKey(this.tenant);
  }

  getData() {
    try {
      if (typeof window === 'undefined') return buildInitialDatabase(this.tenant);
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) {
        const initial = buildInitialDatabase(this.tenant);
        this.saveData(initial);
        return initial;
      }
      return JSON.parse(raw);
    } catch (e) {
      console.warn('[LocalDatabase] Fallback parsing database error:', e);
      return buildInitialDatabase(this.tenant);
    }
  }

  saveData(data) {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
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
    const numId = parseInt(id);
    const santri = (db.santri || []).find(s => s.id === numId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const pocketTxs = (db.pocketTxs || []).filter(t => t.santriId === numId);
    const permits = (db.permits || []).filter(p => p.santriId === numId);
    const bills = (db.santriBills || []).filter(b => b.santriId === numId);
    const academics = (db.academics || []).filter(a => a.santriId === numId);
    const violations = (db.violations || []).filter(v => v.santriId === numId);

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
      const existsNis = (db.santri || []).some(s => s.nis === payload.nis.trim());
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

    const nextId = (db.santri || []).reduce((max, s) => Math.max(max, s.id || 0), 0) + 1;
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
      createdAt: new Date().toISOString(),
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
    const numId = parseInt(id);
    const index = (db.santri || []).findIndex(s => s.id === numId);
    if (index === -1) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    // Cek duplikasi NFC jika diubah
    if (payload.nfcUid && payload.nfcUid.trim()) {
      const cleanUid = payload.nfcUid.trim().toUpperCase();
      const duplicate = (db.santri || []).some(s => s.id !== numId && s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
      if (duplicate) {
        return { success: false, message: 'NFC Card UID sudah terdaftar pada santri lain' };
      }
    }

    const updated = {
      ...db.santri[index],
      ...payload,
      id: numId,
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
    const numId = parseInt(id);
    db.santri = (db.santri || []).filter(s => s.id !== numId);
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
    const numId = parseInt(santriId);
    const santri = (db.santri || []).find(s => s.id === numId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const cleanUid = nfcUid.trim().toUpperCase();
    const existingHolder = (db.santri || []).find(s => s.id !== numId && s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
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
    const numId = parseInt(santriId);
    const santri = (db.santri || []).find(s => s.id === numId);
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
    const numId = parseInt(id);
    db.generalLedger = (db.generalLedger || []).filter(e => e.id !== numId);
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
      const numId = parseInt(params.santriId);
      txs = txs.filter(t => t.santriId === numId);
    }

    // Attach santri info
    const enriched = txs.map(t => {
      const s = (db.santri || []).find(santri => santri.id === t.santriId);
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
    const numId = parseInt(santriId);
    const numAmount = parseFloat(amount);

    const santri = (db.santri || []).find(s => s.id === numId);
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

    const nextId = (db.pocketTxs || []).reduce((max, t) => Math.max(max, t.id || 0), 0) + 1;
    const newTx = {
      id: nextId,
      santriId: numId,
      type: type || 'PURCHASE',
      amount: numAmount,
      currentBalance: newBalance,
      description: description || (type === 'TOPUP' ? 'Top-Up Saldo Uang Saku' : 'Transaksi Uang Saku'),
      createdAt: new Date().toISOString(),
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
    const nextId = (db.masterBills || []).reduce((max, b) => Math.max(max, b.id || 0), 0) + 1;
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

  getSantriBills(params = {}) {
    const db = this.getData();
    let list = [...(db.santriBills || [])];

    if (params.status) {
      list = list.filter(b => b.status === params.status);
    }
    if (params.santriId) {
      const numId = parseInt(params.santriId);
      list = list.filter(b => b.santriId === numId);
    }

    const enriched = list.map(b => {
      const s = (db.santri || []).find(santri => santri.id === b.santriId);
      const m = (db.masterBills || []).find(master => master.id === b.masterBillId);
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
    const numId = parseInt(id);
    const index = (db.santriBills || []).findIndex(b => b.id === numId);
    if (index === -1) {
      return { success: false, message: 'Tagihan tidak ditemukan' };
    }

    const prev = db.santriBills[index];
    const updated = {
      ...prev,
      ...payload,
      id: numId,
      updatedAt: new Date().toISOString(),
    };

    // Bila status berubah jadi PAID dan belum pernah dicatat di Kas, catat otomatis ke Kas Umum
    if (payload.status === 'PAID' && prev.status !== 'PAID') {
      updated.paidAt = new Date().toISOString();
      const s = (db.santri || []).find(santri => santri.id === updated.santriId);
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

  autoGenerateHijriBills(payload) {
    const db = this.getData();
    const { masterBillId, hijriMonth, hijriYear } = payload;
    const master = (db.masterBills || []).find(m => m.id === parseInt(masterBillId));
    if (!master) {
      return { success: false, message: 'Master tagihan tidak ditemukan' };
    }

    const activeSantri = (db.santri || []).filter(s => s.status === 'AKTIF');
    let generatedCount = 0;

    activeSantri.forEach(s => {
      const exists = (db.santriBills || []).some(b => 
        b.santriId === s.id && 
        b.masterBillId === master.id && 
        b.hijriMonth === hijriMonth && 
        b.hijriYear === hijriYear
      );
      if (!exists) {
        const nextId = (db.santriBills || []).reduce((max, b) => Math.max(max, b.id || 0), 0) + 1;
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
        generatedCount++;
      }
    });

    this.saveData(db);
    return { success: true, count: generatedCount, message: `Berhasil menerbitkan ${generatedCount} tagihan santri` };
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
      const numId = parseInt(params.santriId);
      list = list.filter(p => p.santriId === numId);
    }

    const enriched = list.map(p => {
      const s = (db.santri || []).find(santri => santri.id === p.santriId);
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
    const numId = parseInt(payload.santriId);
    const santri = (db.santri || []).find(s => s.id === numId);
    if (!santri) {
      return { success: false, message: 'Santri tidak ditemukan' };
    }

    const nextId = (db.permits || []).reduce((max, p) => Math.max(max, p.id || 0), 0) + 1;
    const newPermit = {
      id: nextId,
      santriId: numId,
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
    const numId = parseInt(id);
    const permit = (db.permits || []).find(p => p.id === numId);
    if (!permit) {
      return { success: false, message: 'Data perizinan tidak ditemukan' };
    }

    permit.status = payload.status;
    if (payload.status === 'RETURNED') {
      permit.actualReturnTime = new Date().toISOString();
    }
    this.saveData(db);
    return { success: true, data: permit };
  }

  checkInByNfc({ nfcUid }) {
    const db = this.getData();
    const cleanUid = nfcUid.trim().toUpperCase();
    const santri = (db.santri || []).find(s => s.nfcUid && s.nfcUid.toUpperCase() === cleanUid);
    if (!santri) {
      return { success: false, message: 'Kartu RFID belum terdaftar' };
    }

    const activePermit = (db.permits || []).find(p => p.santriId === santri.id && p.status === 'ACTIVE');
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
      const numId = parseInt(params.santriId);
      list = list.filter(a => a.santriId === numId);
    }
    const enriched = list.map(a => ({
      ...a,
      santri: (db.santri || []).find(s => s.id === a.santriId) || null
    }));
    return { success: true, data: enriched };
  }

  createAcademicRecord(payload) {
    const db = this.getData();
    const nextId = (db.academics || []).reduce((max, a) => Math.max(max, a.id || 0), 0) + 1;
    const newRecord = {
      id: nextId,
      santriId: parseInt(payload.santriId),
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

  // ---------------------------------------------------------------------------
  // 7. SECURITY VIOLATIONS
  // ---------------------------------------------------------------------------
  getViolations(params = {}) {
    const db = this.getData();
    let list = [...(db.violations || [])];
    if (params.santriId) {
      const numId = parseInt(params.santriId);
      list = list.filter(v => v.santriId === numId);
    }
    const enriched = list.map(v => ({
      ...v,
      santri: (db.santri || []).find(s => s.id === v.santriId) || null
    }));
    return { success: true, data: enriched };
  }

  createViolation(payload) {
    const db = this.getData();
    const nextId = (db.violations || []).reduce((max, v) => Math.max(max, v.id || 0), 0) + 1;
    const newV = {
      id: nextId,
      santriId: parseInt(payload.santriId),
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

  // ---------------------------------------------------------------------------
  // 8. APPROVALS & DIVISION FUNDS
  // ---------------------------------------------------------------------------
  getDivisionFunds() {
    const db = this.getData();
    return { success: true, data: db.divisionFunds || [] };
  }

  createDivisionFund(payload) {
    const db = this.getData();
    const nextId = (db.divisionFunds || []).reduce((max, f) => Math.max(max, f.id || 0), 0) + 1;
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
    const numId = parseInt(id);
    const fund = (db.divisionFunds || []).find(f => f.id === numId);
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
  // 10. PORTAL WALI (PUBLIC ACCESS)
  // ---------------------------------------------------------------------------
  getPortalWaliData(query) {
    const db = this.getData();
    if (!query) return { success: false, message: 'NIS atau Kode Kartu santri wajib dimasukkan' };
    const q = query.trim().toUpperCase();

    const santri = (db.santri || []).find(s => 
      (s.nis && s.nis.toUpperCase() === q) || 
      (s.nfcUid && s.nfcUid.toUpperCase() === q) ||
      (s.nama && s.nama.toUpperCase().includes(q))
    );

    if (!santri) {
      return { success: false, message: 'Data santri tidak ditemukan. Pastikan NIS atau nomor kartu santri sudah sesuai.' };
    }

    const bills = (db.santriBills || []).filter(b => b.santriId === santri.id);
    const pocketTxs = (db.pocketTxs || []).filter(t => t.santriId === santri.id).slice(0, 10);
    const permits = (db.permits || []).filter(p => p.santriId === santri.id).slice(0, 5);
    const academics = (db.academics || []).filter(a => a.santriId === santri.id);

    return {
      success: true,
      data: {
        santri,
        bills,
        pocketTxs,
        permits,
        academics
      }
    };
  }

  uploadPaymentProof({ billId, proofUrl, proofNote }) {
    const db = this.getData();
    const numId = parseInt(billId);
    const bill = (db.santriBills || []).find(b => b.id === numId);
    if (!bill) return { success: false, message: 'Tagihan tidak ditemukan' };

    bill.status = 'PENDING_VERIFICATION';
    bill.proofUrl = proofUrl;
    bill.proofNote = proofNote || 'Upload Bukti Pembayaran Portal Wali';
    bill.updatedAt = new Date().toISOString();

    this.saveData(db);
    return { success: true, message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi bendahara.' };
  }
}

// Singleton helper
export const localDb = new LocalDatabase();
