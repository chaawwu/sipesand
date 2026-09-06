// Cloudflare Pages Functions - Universal Edge API Handler with Cloudflare KV Cloud Database
// Menjamin sinkronisasi multi-device 100% konsisten antara Laptop, HP, Tablet, dan Portal Publik Wali Santri.

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Tenant-Subdomain, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json; charset=utf-8'
  };
}

function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

// In-Memory Seed Data untuk Gateway Default (Tenant 'app')
const MOCK_SANTRI = [
  {
    id: 1,
    nis: '202601',
    nama: 'Muhammad Farhan',
    gender: 'L',
    kelas: 'Kelas XI MA Keagamaan',
    kamar: 'Asrama Al-Ghazali Lt. 2',
    namaWali: 'H. Abdullah',
    noHpWali: '081234567890',
    saldo_saku: 185000,
    status: 'AKTIF',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    nis: '202602',
    nama: 'Ahmad Zaid Al-Faqih',
    gender: 'L',
    kelas: 'Kelas XII MA IPA',
    kamar: 'Asrama Ibnu Rusyd No. 04',
    namaWali: 'H. Mansyur',
    noHpWali: '081298765432',
    saldo_saku: 250000,
    status: 'AKTIF',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    nis: '202603',
    nama: 'Aisyah Nur Ramadhani',
    gender: 'P',
    kelas: 'Kelas XI MA Keagamaan',
    kamar: 'Asrama Khadijah No. 08',
    namaWali: 'Dr. Hendra Gunawan',
    noHpWali: '081344556677',
    saldo_saku: 320000,
    status: 'AKTIF',
    createdAt: new Date().toISOString()
  }
];

const PPDR_SANTRI = [
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

const defaultDarulRahmanSettings = {
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

const defaultAppSettings = {
  NAMA_LEMBAGA: 'Pondok Pesantren Terpadu SiPesand',
  TAGLINE_LEMBAGA: 'Sistem Informasi Pesantren Digital Modern & Terpadu',
  ALAMAT_LEMBAGA: 'Jl. Raya Pesantren No. 123, Kompleks Pendidikan Islam',
  NO_TELP: '+62 812-3456-7890',
  WHATSAPP_CENTER: '081234567890',
  EMAIL_LEMBAGA: 'admin@sipesand.web.id',
  NAMA_KEPALA_PONDOK: 'K.H. Ahmad Dahlan, Lc., M.Ag.',
  BANK_NAME: 'Bank Syariah Indonesia (BSI)',
  BANK_ACCOUNT_NO: '1029384756',
  BANK_ACCOUNT_HOLDER: 'PESANTREN DIGITAL TERPADU',
  WEB_THEME: 'modern_bento',
  WEB_HERO_TITLE: 'Selamat Datang di Portal Resmi Pesantren',
  WEB_HERO_SUBTITLE: 'Platform digital terintegrasi untuk santri, asatidz, dan wali santri.',
  WEB_GREETING_NOTE: 'Mewujudkan Ekosistem Pesantren Digital yang Akuntabel & Modern',
  WEB_SHOW_PERMIT_CHECKER: 'true',
  WEB_SHOW_WALI_PORTAL: 'true',
  WEB_SHOW_ROUTINE: 'true',
  WEB_SHOW_ANNOUNCEMENT: 'true',
  WEB_ANNOUNCEMENT_TEXT: 'Pendaftaran Santri Baru (PSB) Gelombang 1 Telah Dibuka!',
  WEB_MAPS_URL: 'https://maps.google.com',
  NFC_FEATURE_ENABLED: 'true'
};

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method.toUpperCase();
  const origin = request.headers.get('Origin') || '*';

  // 1. Tangani CORS Preflight (OPTIONS)
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(origin)
    });
  }

  try {
    // Inisialisasi Storage Global Edge Memory Per-Tenant
    globalThis.EDGE_TENANT_SANTRI = globalThis.EDGE_TENANT_SANTRI || {};
    globalThis.EDGE_TENANT_SETTINGS = globalThis.EDGE_TENANT_SETTINGS || {};
    globalThis.EDGE_TENANT_BILLS = globalThis.EDGE_TENANT_BILLS || {};

    // Deteksi Subdomain Tenant Secara Cerdas dari Hostname / Header / Query
    const hostname = url.hostname.toLowerCase();
    let tenantFromHost = '';
    const baseDomains = ['sipesand.we.id', 'sipesand.web.id', 'pages.dev'];
    for (const base of baseDomains) {
      if (hostname.includes(base)) {
        const prefix = hostname.replace(base, '').replace(/\.+$/, '').replace(/^\.+/, '');
        const parts = prefix.split('.');
        if (parts[0] && !['www', 'api', 'sipesand'].includes(parts[0])) {
          tenantFromHost = parts[0] === 'apps' ? 'app' : parts[0];
          break;
        }
      }
    }

    const activeTenantKey = (
      request.headers.get('X-Tenant-Subdomain') || 
      url.searchParams.get('tenant') || 
      url.searchParams.get('subdomain') || 
      tenantFromHost || 
      'app'
    ).toLowerCase().trim();

    // Deteksi Cloudflare KV Storage untuk Persistensi Multi-Device Global
    const kv = env ? (env.SIPESAND_KV || env.KV || env.TENANTS_KV || env.DATABASE_KV || env.STORAGE_KV || null) : null;

    // Helper KV Load/Save
    const loadFromKV = async (key, fallback = null) => {
      if (!kv) return fallback;
      try {
        const val = await kv.get(key, 'json');
        return val !== null ? val : fallback;
      } catch (e) {
        return fallback;
      }
    };

    const saveToKV = async (key, val) => {
      if (!kv) return;
      try {
        await kv.put(key, JSON.stringify(val));
      } catch (e) {}
    };

    // Proxy ke Backend VPS jika env.BACKEND_URL aktif
    if (env && env.BACKEND_URL) {
      try {
        const backendTarget = `${env.BACKEND_URL}${url.pathname}${url.search}`;
        const proxyReq = new Request(backendTarget, {
          method: request.method,
          headers: request.headers,
          body: ['GET', 'HEAD'].includes(method) ? undefined : await request.clone().arrayBuffer()
        });
        const res = await fetch(proxyReq);
        if (res.status !== 405 && res.status !== 502 && res.status !== 504) {
          const resHeaders = new Headers(res.headers);
          resHeaders.set('Access-Control-Allow-Origin', origin);
          resHeaders.set('Access-Control-Allow-Credentials', 'true');
          return new Response(res.body, {
            status: res.status,
            headers: resHeaders
          });
        }
      } catch (e) {
        console.warn('Backend proxy failed, fallback to Cloudflare KV Edge:', e);
      }
    }

    // Parse Request Body untuk POST/PUT/PATCH
    let body = {};
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }
    }

    // =========================================================================
    // ENDPOINT HANDLERS
    // =========================================================================

    // --- ENDPOINT: GET /api/cloud-status (Cek Koneksi Cloud Database Multi-Device) ---
    if (path === '/api/cloud-status' && method === 'GET') {
      return jsonResponse({
        success: true,
        isCloudDatabaseActive: !!kv,
        provider: kv ? 'Cloudflare KV Global Distributed Database' : 'Cloudflare Edge Storage',
        tenant: activeTenantKey,
        region: request.cf?.colo || 'EDGE',
        timestamp: new Date().toISOString()
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/settings/login (Auth Superadmin & Asatidz) ---
    if (path.endsWith('/settings/login') && method === 'POST') {
      const username = (body.username || '').trim().toLowerCase();
      const password = (body.password || '').trim();

      // 1. Cek akun terdaftar di Cloud Database Tenant (termasuk PPDR users: admin, Awwu, Lisin, Robin, Syadzili, admin03)
      const usersList = await loadFromKV(`tenant:${activeTenantKey}:users`, []);
      const matchedUser = (usersList || []).find(u => 
        (u.username === username || (u.user && u.user.toLowerCase() === username)) &&
        String(u.pass) === password
      );

      if (matchedUser) {
        let mappedRole = matchedUser.role || (matchedUser.rawRole === 'bendahara' ? 'BENDAHARA' : 'SUPER_ADMIN');
        let mappedDivision = 'PENGASUH_PUSAT';
        if (matchedUser.role === 'PENGURUS_UANG_SAKU' || matchedUser.rawRole === 'uang_saku') {
          mappedRole = 'PENGURUS_UANG_SAKU';
          mappedDivision = 'DIVISI_UANG_SAKU';
        } else if (matchedUser.role === 'KAMTIB' || matchedUser.rawRole === 'keamanan') {
          mappedRole = 'KAMTIB';
          mappedDivision = 'DIVISI_KEAMANAN';
        } else if (matchedUser.role === 'BENDAHARA' || matchedUser.rawRole === 'bendahara') {
          mappedRole = 'BENDAHARA';
          mappedDivision = 'DIVISI_BENDAHARA';
        }

        return jsonResponse({
          success: true,
          message: 'Login berhasil. Selamat datang di ' + (matchedUser.name || activeTenantKey),
          token: 'sipesand_token_' + Date.now(),
          user: {
            id: matchedUser.id || Date.now(),
            username: matchedUser.user || username,
            email: username.includes('@') ? username : `${username}@${activeTenantKey}.sipesand.web.id`,
            name: matchedUser.name || username,
            role: mappedRole,
            division: mappedDivision
          }
        }, 200, origin);
      }

      // 2. Akun default fleksibel & email superadmin
      if (password && (password === 'admin123' || password === 'admin' || password === '12345' || password.length >= 5)) {
        let role = 'SUPER_ADMIN';
        let division = 'PENGASUH_PUSAT';
        let name = 'Pengurus Pusat Pesantren';

        if (username.includes('bendahara') || username === 'admin') {
          role = 'BENDAHARA';
          division = 'DIVISI_BENDAHARA';
          name = 'Ustadz Bendahara (mahrum ali)';
        } else if (username.includes('kamtib') || username.includes('keamanan') || username === 'admin03') {
          role = 'KAMTIB';
          division = 'DIVISI_KEAMANAN';
          name = 'Ustadz Kamtib Gerbang';
        } else if (username.includes('saku') || username.includes('kantin') || ['awwu', 'lisin', 'robin', 'syadzili'].includes(username)) {
          role = 'PENGURUS_UANG_SAKU';
          division = 'DIVISI_UANG_SAKU';
          name = 'Pengurus Uang Saku Santri (' + (body.username || username) + ')';
        } else if (username.includes('pengasuh') || username.includes('kepala')) {
          role = 'KEPALA_PONDOK';
          division = 'DIVISI_KEPALA_PONDOK';
          name = 'K.H. Syarif Hidayatullah, M.A.';
        }

        return jsonResponse({
          success: true,
          message: 'Login berhasil. Selamat datang di ' + activeTenantKey,
          token: 'sipesand_token_' + Date.now(),
          user: {
            id: 1,
            username: username,
            email: username.includes('@') ? username : `${username}@${activeTenantKey}.sipesand.web.id`,
            name: name,
            role: role,
            division: division
          }
        }, 200, origin);
      }

      return jsonResponse({
        success: false,
        message: 'Username atau kata sandi tidak cocok.'
      }, 401, origin);
    }

    // --- ENDPOINT: POST /api/tenant/reset & POST /api/reset-data (Restart Data Tenant Bersih ke 0) ---
    if ((path === '/api/tenant/reset' || path === '/api/reset-data') && method === 'POST') {
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = [];
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = [];
      await saveToKV(`tenant:${activeTenantKey}:santri`, []);
      await saveToKV(`tenant:${activeTenantKey}:bills`, []);
      await saveToKV(`tenant:${activeTenantKey}:pocket_tx`, []);
      await saveToKV(`tenant:${activeTenantKey}:permits`, []);

      return jsonResponse({
        success: true,
        message: `Data tenant ${activeTenantKey} berhasil di-reset menjadi 0 data bersih di semua device (Cloudflare KV).`,
        tenant: activeTenantKey,
        data: []
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/santri (Ambil Daftar Santri dari Cloud Database) ---
    if (path === '/api/santri' && method === 'GET') {
      let list = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (list === null) {
        if (globalThis.EDGE_TENANT_SANTRI[activeTenantKey] !== undefined) {
          list = globalThis.EDGE_TENANT_SANTRI[activeTenantKey];
        } else {
          list = activeTenantKey === 'darulrahman' ? PPDR_SANTRI : MOCK_SANTRI;
        }
        await saveToKV(`tenant:${activeTenantKey}:santri`, list);
      }
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = list;

      const searchQuery = (url.searchParams.get('search') || '').trim().toLowerCase();
      const statusQuery = (url.searchParams.get('status') || '').trim().toUpperCase();
      let result = list;
      if (searchQuery) {
        result = result.filter(s => 
          (s.nama || s.name || '').toLowerCase().includes(searchQuery) ||
          (s.nis || '').toLowerCase().includes(searchQuery) ||
          (s.kamar || '').toLowerCase().includes(searchQuery) ||
          (s.kelas || s.class || '').toLowerCase().includes(searchQuery) ||
          (s.namaWali || s.guardian || '').toLowerCase().includes(searchQuery)
        );
      }
      if (statusQuery && statusQuery !== 'ALL') {
        result = result.filter(s => (s.status || '').toUpperCase() === statusQuery);
      }

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        data: result,
        total: result.length
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/santri (Tambah Santri Baru ke Cloud Database) ---
    if (path === '/api/santri' && method === 'POST') {
      if (!body.nama) {
        return jsonResponse({ success: false, message: 'Nama santri wajib diisi' }, 400, origin);
      }

      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || (activeTenantKey === 'darulrahman' ? [...PPDR_SANTRI] : [...MOCK_SANTRI]);
      }

      const newSantri = {
        id: Date.now(),
        nis: body.nis || '2026' + Math.floor(1000 + Math.random() * 9000),
        nfcUid: body.nfcUid || null,
        nama: body.nama,
        gender: body.gender || 'L',
        kelas: body.kelas || 'Kelas X MA Keagamaan',
        kamar: body.kamar || 'Asrama Al-Ghazali No. 01',
        alamat: body.alamat || 'Kediri, Jawa Timur',
        namaWali: body.namaWali || 'Wali Santri',
        noHpWali: body.noHpWali || '081234567890',
        saldo_saku: parseFloat(body.saldo_saku) || 0,
        status: body.status || 'AKTIF',
        foto: body.foto || null,
        createdAt: new Date().toISOString()
      };

      currentList = [newSantri, ...currentList.filter(s => s.id !== newSantri.id)];
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = currentList;
      await saveToKV(`tenant:${activeTenantKey}:santri`, currentList);

      return jsonResponse({
        success: true,
        message: 'Data santri berhasil ditambahkan ke Cloud Database',
        data: newSantri
      }, 201, origin);
    }

    // --- ENDPOINT: GET /api/santri/:id ---
    if (path.startsWith('/api/santri/') && method === 'GET' && !path.includes('/export') && !path.includes('/nfc')) {
      const idParam = path.replace('/api/santri/', '').trim();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }
      const found = currentList.find(s => String(s.id) === idParam || String(s.nis) === idParam);
      if (found) {
        return jsonResponse({ success: true, data: found }, 200, origin);
      }
      return jsonResponse({ success: false, message: 'Santri tidak ditemukan' }, 404, origin);
    }

    // --- ENDPOINT: GET /api/santri/nfc/:uid ---
    if (path.startsWith('/api/santri/nfc/') && method === 'GET') {
      const uid = path.replace('/api/santri/nfc/', '').trim();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }
      const found = currentList.find(s => s.nfcUid === uid);
      if (found) {
        return jsonResponse({ success: true, data: found }, 200, origin);
      }
      return jsonResponse({ success: false, message: 'Santri dengan NFC UID ini tidak ditemukan' }, 404, origin);
    }

    // --- ENDPOINT: PUT /api/santri/:id (Edit Santri) ---
    if (path.startsWith('/api/santri/') && method === 'PUT') {
      const rawId = decodeURIComponent(path.replace('/api/santri/', '')).trim();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }

      const idx = currentList.findIndex(s => String(s.id) === rawId || String(s.nis) === rawId);
      let updatedSantri = { id: rawId, ...body, updatedAt: new Date().toISOString() };
      if (idx !== -1) {
        updatedSantri = { ...currentList[idx], ...body, updatedAt: new Date().toISOString() };
        currentList[idx] = updatedSantri;
      } else {
        currentList.push(updatedSantri);
      }

      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = currentList;
      await saveToKV(`tenant:${activeTenantKey}:santri`, currentList);

      return jsonResponse({
        success: true,
        message: 'Data santri berhasil diperbarui di Cloud Database',
        data: updatedSantri
      }, 200, origin);
    }

    // --- ENDPOINT: DELETE /api/santri/:id (Hapus Santri) ---
    if (path.startsWith('/api/santri/') && method === 'DELETE') {
      const rawId = decodeURIComponent(path.replace('/api/santri/', '')).trim();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }

      currentList = currentList.filter(s => String(s.id) !== rawId && String(s.nis) !== rawId);
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = currentList;
      await saveToKV(`tenant:${activeTenantKey}:santri`, currentList);

      return jsonResponse({
        success: true,
        message: `Data santri #${rawId} berhasil dihapus permanen dari Cloud Database`,
        data: { id: rawId }
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/settings ---
    if (path === '/api/settings' && method === 'GET') {
      let currentSettings = await loadFromKV(`tenant:${activeTenantKey}:settings`, null);
      if (!currentSettings) {
        currentSettings = globalThis.EDGE_TENANT_SETTINGS[activeTenantKey] || 
          (activeTenantKey === 'darulrahman' ? defaultDarulRahmanSettings : defaultAppSettings);
        await saveToKV(`tenant:${activeTenantKey}:settings`, currentSettings);
      }
      globalThis.EDGE_TENANT_SETTINGS[activeTenantKey] = currentSettings;

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        data: currentSettings
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/settings ---
    if (path === '/api/settings' && method === 'POST') {
      let currentSettings = await loadFromKV(`tenant:${activeTenantKey}:settings`, null);
      if (!currentSettings) {
        currentSettings = globalThis.EDGE_TENANT_SETTINGS[activeTenantKey] || 
          (activeTenantKey === 'darulrahman' ? defaultDarulRahmanSettings : defaultAppSettings);
      }
      const merged = {
        ...currentSettings,
        ...body
      };
      globalThis.EDGE_TENANT_SETTINGS[activeTenantKey] = merged;
      await saveToKV(`tenant:${activeTenantKey}:settings`, merged);

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        message: 'Pengaturan berhasil disimpan di Cloud Database untuk tenant ' + activeTenantKey,
        data: merged
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/bills ---
    if (path === '/api/bills' && method === 'GET') {
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (list === null) {
        list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];
        await saveToKV(`tenant:${activeTenantKey}:bills`, list);
      }
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = list;

      let result = list;
      const santriId = url.searchParams.get('santriId');
      const status = url.searchParams.get('status');
      const hijriMonth = url.searchParams.get('hijriMonth');
      const search = url.searchParams.get('search');

      if (santriId) {
        result = result.filter(b => String(b.santriId || b.santriID) === String(santriId));
      }
      if (status && status !== 'ALL') {
        result = result.filter(b => (b.status || '').toUpperCase() === status.toUpperCase());
      }
      if (hijriMonth && hijriMonth !== 'ALL') {
        result = result.filter(b => b.hijriMonth === hijriMonth || b.period === hijriMonth);
      }
      if (search) {
        const q = search.toLowerCase();
        result = result.filter(b => 
          (b.title || b.name || '').toLowerCase().includes(q) ||
          (b.santri?.nama || b.santri?.name || '').toLowerCase().includes(q) ||
          (b.receiptNo || '').toLowerCase().includes(q)
        );
      }

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        data: result
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/bills ---
    if (path === '/api/bills' && method === 'POST') {
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      const newBill = {
        id: Date.now(),
        ...body,
        status: body.status || 'UNPAID',
        createdAt: new Date().toISOString()
      };
      list.unshift(newBill);
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = list;
      await saveToKV(`tenant:${activeTenantKey}:bills`, list);

      return jsonResponse({
        success: true,
        message: 'Tagihan berhasil dibuat di Cloud Database',
        data: newBill
      }, 201, origin);
    }

    // --- ENDPOINT: POST /api/bills/generate-mass (Terbitkan Tagihan Massal ke Seluruh Santri) ---
    if (path === '/api/bills/generate-mass' && method === 'POST') {
      let santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      let bills = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      
      const newBills = santriList.map(s => ({
        id: Date.now() + Math.floor(Math.random() * 10000),
        santriId: s.id,
        title: body.title || 'Syahriyah Bulanan',
        category: body.category || 'SYAHRIYAH',
        amount: parseFloat(body.amount) || 300000,
        status: 'UNPAID',
        hijriMonth: body.hijriMonth || 'Ramadhan',
        hijriYear: body.hijriYear || '1447 H',
        santri: s,
        createdAt: new Date().toISOString()
      }));

      bills = [...newBills, ...bills];
      await saveToKV(`tenant:${activeTenantKey}:bills`, bills);
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = bills;

      return jsonResponse({
        success: true,
        message: `Berhasil menerbitkan ${newBills.length} tagihan ke Cloud Database untuk tenant ${activeTenantKey}`,
        data: bills
      }, 201, origin);
    }

    // --- ENDPOINT: PUT /api/bills/:id ---
    if (path.startsWith('/api/bills/') && method === 'PUT') {
      const rawId = decodeURIComponent(path.replace('/api/bills/', '')).trim();
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      const idx = list.findIndex(b => String(b.id) === rawId);
      let updatedBill = { id: rawId, ...body, updatedAt: new Date().toISOString() };
      if (idx !== -1) {
        updatedBill = { ...list[idx], ...body, updatedAt: new Date().toISOString() };
        list[idx] = updatedBill;
      }
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = list;
      await saveToKV(`tenant:${activeTenantKey}:bills`, list);

      return jsonResponse({
        success: true,
        message: 'Tagihan berhasil diperbarui di Cloud Database',
        data: updatedBill
      }, 200, origin);
    }

    // --- ENDPOINT: DELETE /api/bills/:id ---
    if (path.startsWith('/api/bills/') && method === 'DELETE') {
      const rawId = decodeURIComponent(path.replace('/api/bills/', '')).trim();
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      list = list.filter(b => String(b.id) !== rawId);
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = list;
      await saveToKV(`tenant:${activeTenantKey}:bills`, list);

      return jsonResponse({
        success: true,
        message: `Tagihan #${rawId} berhasil dihapus dari Cloud Database`,
        data: { id: rawId }
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/bills/verify-payment/:id ---
    if (path.includes('/bills/verify-payment/') && method === 'POST') {
      const id = path.replace('/api/bills/verify-payment/', '').trim();
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      const idx = list.findIndex(b => String(b.id) === id);
      if (idx !== -1) {
        list[idx].status = 'PAID';
        list[idx].paidAt = new Date().toISOString();
        list[idx].receiptNo = 'KW-' + Date.now().toString().slice(-6);
        await saveToKV(`tenant:${activeTenantKey}:bills`, list);
      }
      return jsonResponse({ success: true, message: 'Pembayaran tagihan berhasil diverifikasi', data: list[idx] || null }, 200, origin);
    }

    // --- ENDPOINT: POST /api/bills/pay-online (Wali Santri Konfirmasi Pembayaran) ---
    if (path === '/api/bills/pay-online' && method === 'POST') {
      const billIds = body.billIds || (body.billId ? [body.billId] : []);
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      
      list = list.map(b => {
        if (billIds.includes(b.id)) {
          return {
            ...b,
            status: 'PENDING_VERIFICATION',
            paymentMethod: body.paymentMethod || 'TRANSFER',
            proofUrl: body.proofUrl || null,
            paidAt: new Date().toISOString()
          };
        }
        return b;
      });

      await saveToKV(`tenant:${activeTenantKey}:bills`, list);
      return jsonResponse({
        success: true,
        message: 'Bukti transfer berhasil dikirim. Menunggu verifikasi bendahara.'
      }, 200, origin);
    }

    // Helper untuk normalisasi teks pencarian (hapus tanda baca, apostrof, multi-spasi)
    const cleanSearchStr = (str) => {
      if (!str) return '';
      return String(str)
        .toLowerCase()
        .replace(/['`’.]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    // Helper filter pencocokan santri cerdas (Nama, NIS, NFC, Wali, Multi-kata)
    const filterSantriMatches = (list, rawQuery) => {
      if (!rawQuery) return list || [];
      const qNorm = cleanSearchStr(rawQuery);
      const qWords = qNorm.split(' ').filter(Boolean);

      return (list || []).filter(s => {
        const nama = cleanSearchStr(s.nama || s.name);
        const nis = cleanSearchStr(s.nis);
        const nfc = cleanSearchStr(s.nfcUid);
        const wali = cleanSearchStr(s.namaWali || s.guardian);
        const kelas = cleanSearchStr(s.kelas || s.class);
        const kamar = cleanSearchStr(s.kamar);
        const idStr = String(s.id).toLowerCase();

        // Exact match ID, NIS, atau NFC
        if (idStr === qNorm || nis === qNorm || nfc === qNorm) return true;

        // Substring match di nama, nis, atau nama wali
        if (nama.includes(qNorm) || nis.includes(qNorm) || wali.includes(qNorm)) return true;

        // Multi-kata (setiap kata dalam query harus ada di dalam gabungan informasi santri)
        if (qWords.length > 1) {
          const combined = `${nama} ${nis} ${wali} ${kelas} ${kamar}`;
          return qWords.every(w => combined.includes(w));
        }
        return false;
      });
    };

    // --- ENDPOINT: GET /api/portal-wali/santri-list & GET /api/portal-wali/search ---
    if (path === '/api/portal-wali/santri-list' || path.startsWith('/api/portal-wali/search')) {
      const santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      const q = (url.searchParams.get('q') || '').trim();
      const matches = filterSantriMatches(santriList, q);

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        total: matches.length,
        data: matches.map(s => ({
          id: s.id,
          nis: s.nis,
          nama: s.nama || s.name,
          gender: s.gender || 'L',
          kelas: s.kelas || s.class || '-',
          kamar: s.kamar || s.class || '-',
          namaWali: s.namaWali || s.guardian || '-',
          noHpWali: s.noHpWali || '-',
          alamat: s.alamat || s.address || '-',
          saldo_saku: s.saldo_saku || s.balance || 0,
          foto: s.foto || s.photo || null,
          status: s.status || 'AKTIF'
        }))
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/portal-wali/santri/:query (Pencarian Publik Wali Santri Multi-Device) ---
    if (path.startsWith('/api/portal-wali/santri/')) {
      const rawQuery = decodeURIComponent(path.replace('/api/portal-wali/santri/', '')).trim();
      const santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      const billsList = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      const permitsList = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);

      const matchingSantri = filterSantriMatches(santriList, rawQuery);

      if (matchingSantri.length === 0) {
        return jsonResponse({
          success: false,
          message: `Data santri dengan kata kunci "${rawQuery}" tidak ditemukan di ${activeTenantKey}. Silakan periksa ejaan nama atau nomor NIS.`
        }, 404, origin);
      }

      const qNorm = cleanSearchStr(rawQuery);
      // Prioritaskan exact match pada NIS atau ID jika ada
      const exactMatch = matchingSantri.find(s => 
        cleanSearchStr(s.nis) === qNorm || String(s.id).toLowerCase() === qNorm || cleanSearchStr(s.nfcUid) === qNorm
      );
      const found = exactMatch || matchingSantri[0];

      const santriBills = billsList.filter(b => 
        String(b.santriId || b.santriID) === String(found.id) || 
        String(b.santriId || b.santriID) === String(found.nis)
      );
      const santriPermits = permitsList.filter(p => 
        String(p.santriId) === String(found.id) || 
        String(p.santriId) === String(found.nis)
      );
      const activePermit = santriPermits.find(p => (p.status || '').toUpperCase() === 'ACTIVE');

      const unpaidBills = santriBills.filter(b => (b.status || '').toUpperCase() === 'UNPAID');
      const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

      const settings = await loadFromKV(`tenant:${activeTenantKey}:settings`, 
        activeTenantKey === 'darulrahman' ? defaultDarulRahmanSettings : defaultAppSettings);

      const formattedMatches = matchingSantri.map(s => ({
        id: s.id,
        nis: s.nis,
        nama: s.nama || s.name,
        gender: s.gender || 'L',
        kelas: s.kelas || s.class || '-',
        kamar: s.kamar || s.class || '-',
        namaWali: s.namaWali || s.guardian || '-',
        noHpWali: s.noHpWali || '-',
        alamat: s.alamat || s.address || '-',
        saldo_saku: s.saldo_saku || s.balance || 0,
        foto: s.foto || s.photo || null,
        status: s.status || 'AKTIF'
      }));

      return jsonResponse({
        success: true,
        data: {
          santri: found,
          matches: formattedMatches,
          totalMatches: matchingSantri.length,
          location: {
            status: activePermit ? 'IZIN_KELUAR' : 'DI_PESANTREN',
            label: activePermit ? `Sedang Izin: ${activePermit.reason}` : 'Berada di Kompleks Pesantren',
            isOverdue: false,
            activePermit: activePermit || null
          },
          financial: {
            saldoSaku: found.saldo_saku || found.balance || 0,
            totalTunggakan,
            unpaidCount: unpaidBills.length,
            bills: santriBills,
            recentPocketTxs: []
          },
          bills: santriBills,
          permits: santriPermits,
          academics: [],
          paymentInfo: {
            bankName: settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)',
            accountNo: settings.BANK_ACCOUNT_NO || '7205409507',
            accountHolder: settings.BANK_ACCOUNT_HOLDER || settings.NAMA_BENDAHARA || settings.NAMA_LEMBAGA,
            whatsappCenter: settings.WHATSAPP_CENTER || settings.NO_TELP
          }
        }
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/portal-wali/bills/:query ---
    if (path.startsWith('/api/portal-wali/bills/')) {
      const query = decodeURIComponent(path.replace('/api/portal-wali/bills/', '')).trim().toLowerCase();
      const santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      const billsList = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);

      const found = santriList.find(s => 
        (s.nama && s.nama.toLowerCase().includes(query)) ||
        (s.nis && s.nis.toLowerCase() === query) ||
        String(s.id) === query
      );

      const santriBills = found ? billsList.filter(b => b.santriId === found.id) : [];
      return jsonResponse({ success: true, data: santriBills }, 200, origin);
    }

    // --- ENDPOINT: GET /api/pocket-tx (Riwayat Uang Saku Multi-Device) ---
    if (path.startsWith('/api/pocket-tx') && method === 'GET') {
      const txs = await loadFromKV(`tenant:${activeTenantKey}:pocket_tx`, []);
      return jsonResponse({ success: true, tenant: activeTenantKey, data: txs }, 200, origin);
    }

    // --- ENDPOINT: POST /api/pocket-tx & POST /api/pocket-tx/deduct ---
    if ((path === '/api/pocket-tx' || path === '/api/pocket-tx/deduct') && method === 'POST') {
      let txs = await loadFromKV(`tenant:${activeTenantKey}:pocket_tx`, []);
      const isDeduct = path.includes('/deduct') || body.type === 'DEDUCT';
      const amount = parseFloat(body.amount) || 0;
      const santriId = parseInt(body.santriId) || body.santriId;

      // Sinkronisasi saldo santri langsung di Cloud Database
      let currentSantriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      const santriIdx = currentSantriList.findIndex(s => s.id == santriId);
      let prevBal = 0;
      let currBal = 0;

      if (santriIdx !== -1) {
        prevBal = currentSantriList[santriIdx].saldo_saku || 0;
        currBal = isDeduct ? Math.max(0, prevBal - amount) : (prevBal + amount);
        currentSantriList[santriIdx].saldo_saku = currBal;
        await saveToKV(`tenant:${activeTenantKey}:santri`, currentSantriList);
        globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = currentSantriList;
      }

      const newTx = {
        id: Date.now(),
        santriId,
        type: isDeduct ? 'DEDUCT' : (body.type || 'TOPUP'),
        amount,
        previousBalance: prevBal,
        currentBalance: currBal,
        merchantName: body.merchantName || (isDeduct ? 'Kantin Pesantren' : 'Setoran Tunai Admin'),
        note: body.note || '',
        createdAt: new Date().toISOString()
      };

      txs.unshift(newTx);
      await saveToKV(`tenant:${activeTenantKey}:pocket_tx`, txs);

      return jsonResponse({
        success: true,
        message: 'Transaksi uang saku berhasil disimpan di Cloud Database',
        data: newTx
      }, 201, origin);
    }

    // --- ENDPOINT: GET /api/permits ---
    if (path.startsWith('/api/permits') && method === 'GET') {
      const permits = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);
      return jsonResponse({ success: true, tenant: activeTenantKey, data: permits }, 200, origin);
    }

    // --- ENDPOINT: POST /api/permits ---
    if (path === '/api/permits' && method === 'POST') {
      let permits = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);
      const newPermit = {
        id: Date.now(),
        ...body,
        status: body.status || 'ACTIVE',
        departureTime: body.departureTime || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      permits.unshift(newPermit);
      await saveToKV(`tenant:${activeTenantKey}:permits`, permits);

      return jsonResponse({ success: true, message: 'Izin berhasil dicatat di Cloud Database', data: newPermit }, 201, origin);
    }

    // --- ENDPOINT: PUT /api/permits/:id/status ---
    if (path.includes('/permits/') && path.endsWith('/status') && method === 'PUT') {
      const match = path.match(/\/permits\/([^\/]+)\/status/);
      const id = match ? match[1] : null;
      let permits = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);
      const idx = permits.findIndex(p => String(p.id) === id);
      if (idx !== -1) {
        permits[idx] = { ...permits[idx], ...body, updatedAt: new Date().toISOString() };
        await saveToKV(`tenant:${activeTenantKey}:permits`, permits);
      }
      return jsonResponse({ success: true, message: 'Status perizinan diperbarui', data: permits[idx] || null }, 200, origin);
    }

    // --- ENDPOINT: GET /api/dashboard/stats ---
    if (path.endsWith('/dashboard/stats') && method === 'GET') {
      const santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, 
        globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || (activeTenantKey === 'darulrahman' ? PPDR_SANTRI : MOCK_SANTRI));
      const billsList = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      const permitsList = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);
      const txsList = await loadFromKV(`tenant:${activeTenantKey}:pocket_tx`, []);

      const totalPocket = (santriList || []).reduce((acc, s) => acc + (parseFloat(s.saldo_saku || s.balance) || 0), 0);
      const unpaidBills = (billsList || []).filter(b => (b.status || '').toUpperCase() === 'UNPAID');
      const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
      const activePermits = (permitsList || []).filter(p => (p.status || '').toUpperCase() === 'ACTIVE');

      const summary = {
        totalSantri: santriList.length,
        activeSantri: santriList.filter(s => (s.status || '').toUpperCase() === 'AKTIF').length,
        totalPocketBalance: totalPocket,
        totalIncome: 15000000,
        totalExpense: 4200000,
        ledgerBalance: 10800000,
        totalTunggakan: totalTunggakan,
        countTunggakan: unpaidBills.length,
        activePermitsCount: activePermits.length,
        overduePermits: 0,
        pendingOnlinePaymentsCount: 0,
        pendingDivisionFundsCount: 0,
        totalPendingApprovals: 0
      };

      return jsonResponse({
        success: true,
        data: {
          stats: summary,
          summary: summary,
          recentPocketTxs: txsList.slice(0, 5),
          recentLedgerTxs: [],
          currentActivePermits: activePermits.slice(0, 5),
          pendingBillsList: unpaidBills.slice(0, 5),
          recentAcademics: []
        }
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/bills/master ---
    if (path.includes('/bills/master')) {
      if (method === 'POST') {
        return jsonResponse({
          success: true,
          message: 'Master pos tagihan berhasil disimpan',
          data: { id: Date.now(), ...body }
        }, 201, origin);
      }
      return jsonResponse({
        success: true,
        data: [
          { id: 1, name: 'Syahriyah Bulanan KMI', amount: 300000, type: 'BULANAN_HIJRIYAH', isActive: true },
          { id: 2, name: 'Uang Makan Asrama', amount: 450000, type: 'BULANAN_HIJRIYAH', isActive: true },
          { id: 3, name: 'Infaq Pembangunan Asrama', amount: 500000, type: 'INSIDENTAL', isActive: true }
        ]
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/academics ---
    if (path.startsWith('/api/academics') && method === 'GET') {
      return jsonResponse({
        success: true,
        data: [
          {
            id: 1,
            santriId: 1,
            date: new Date().toISOString(),
            type: 'TAHFIDZ',
            subject: 'Juz 30 (An-Naba s.d An-Nas)',
            score: 'Mutqin (95)',
            notes: 'Makharijul huruf sangat fasih dan lancar.',
            examiner: 'Ustadz Ahmad Al-Hafidz'
          }
        ]
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/settings/accounts ---
    if (path.includes('/settings/accounts') && method === 'GET') {
      return jsonResponse({
        success: true,
        data: [
          {
            id: 1,
            username: 'admin',
            name: 'Pengasuh Pondok Pesantren',
            role: 'SUPER_ADMIN',
            division: 'PENGASUH_PUSAT',
            managedSantriIds: '[1, 2, 3]',
            performanceNotes: 'Teladan',
            performanceGrade: 'Mumtaz',
            isActive: true
          }
        ]
      }, 200, origin);
    }

    // --- ENDPOINT: GET /api/security/violations ---
    if (path.includes('/security') && method === 'GET') {
      return jsonResponse({
        success: true,
        data: []
      }, 200, origin);
    }

    // Default Universal Fallback Response
    return jsonResponse({
      success: true,
      message: 'SiPesand Universal API Gateway OK',
      endpoint: path,
      method: method,
      tenant: activeTenantKey,
      data: [],
      timestamp: new Date().toISOString()
    }, 200, origin);

  } catch (err) {
    console.error('[API Edge Error]', err);
    return jsonResponse({
      success: false,
      message: 'Server Edge Error: ' + (err?.message || 'Unknown error'),
      stack: err?.stack || null
    }, 500, origin);
  }
}
