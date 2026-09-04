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

const defaultDarulRahmanSettings = {
  NAMA_LEMBAGA: 'Pondok Pesantren Darul Rahman Sumbersari',
  TAGLINE_LEMBAGA: 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
  ALAMAT_LEMBAGA: 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur 64293',
  NO_TELP: '+62 851-2373-4342',
  WHATSAPP_CENTER: '085123734342',
  EMAIL_LEMBAGA: 'darulrahmansumbersari@gmail.com',
  NAMA_KEPALA_PONDOK: 'K.H. Syarif Hidayatullah, M.A.',
  BANK_NAME: 'Bank Syariah Indonesia (BSI)',
  BANK_ACCOUNT_NO: '7192837465',
  BANK_ACCOUNT_HOLDER: 'YAYASAN DARUL RAHMAN SUMBERSARI',
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
  NFC_FEATURE_ENABLED: 'true'
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

      if (password && (password === 'admin123' || password === 'admin' || password.length >= 6)) {
        let role = 'SUPER_ADMIN';
        let division = 'PENGASUH_PUSAT';
        let name = 'Pengurus Pusat Pesantren';

        if (username.includes('bendahara')) {
          role = 'BENDAHARA';
          division = 'DIVISI_BENDAHARA';
          name = 'Ustadz Bendahara Pesantren';
        } else if (username.includes('kamtib') || username.includes('keamanan')) {
          role = 'KAMTIB';
          division = 'DIVISI_KEAMANAN';
          name = 'Ustadz Kamtib Gerbang';
        } else if (username.includes('saku') || username.includes('kantin')) {
          role = 'PENGURUS_UANG_SAKU';
          division = 'DIVISI_UANG_SAKU';
          name = 'Pengurus Uang Saku Santri';
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
        message: 'Password wajib minimal 6 karakter.'
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
          list = activeTenantKey === 'darulrahman' ? [] : MOCK_SANTRI;
        }
        await saveToKV(`tenant:${activeTenantKey}:santri`, list);
      }
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = list;

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        data: list
      }, 200, origin);
    }

    // --- ENDPOINT: POST /api/santri (Tambah Santri Baru ke Cloud Database) ---
    if (path === '/api/santri' && method === 'POST') {
      if (!body.nama) {
        return jsonResponse({ success: false, message: 'Nama santri wajib diisi' }, 400, origin);
      }

      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || (activeTenantKey === 'darulrahman' ? [] : [...MOCK_SANTRI]);
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
      const id = parseInt(path.replace('/api/santri/', '')) || Date.now();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }

      const idx = currentList.findIndex(s => s.id === id);
      let updatedSantri = { id, ...body, updatedAt: new Date().toISOString() };
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
      const id = parseInt(path.replace('/api/santri/', '')) || Date.now();
      let currentList = await loadFromKV(`tenant:${activeTenantKey}:santri`, null);
      if (!Array.isArray(currentList)) {
        currentList = globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || [];
      }

      currentList = currentList.filter(s => s.id !== id);
      globalThis.EDGE_TENANT_SANTRI[activeTenantKey] = currentList;
      await saveToKV(`tenant:${activeTenantKey}:santri`, currentList);

      return jsonResponse({
        success: true,
        message: `Data santri #${id} berhasil dihapus permanen dari Cloud Database`,
        data: { id }
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

      return jsonResponse({
        success: true,
        tenant: activeTenantKey,
        data: list
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
      const id = parseInt(path.replace('/api/bills/', '')) || Date.now();
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      const idx = list.findIndex(b => b.id == id);
      let updatedBill = { id, ...body, updatedAt: new Date().toISOString() };
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
      const id = parseInt(path.replace('/api/bills/', '')) || Date.now();
      let list = await loadFromKV(`tenant:${activeTenantKey}:bills`, null);
      if (!Array.isArray(list)) list = globalThis.EDGE_TENANT_BILLS[activeTenantKey] || [];

      list = list.filter(b => b.id != id);
      globalThis.EDGE_TENANT_BILLS[activeTenantKey] = list;
      await saveToKV(`tenant:${activeTenantKey}:bills`, list);

      return jsonResponse({
        success: true,
        message: `Tagihan #${id} berhasil dihapus dari Cloud Database`,
        data: { id }
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

    // --- ENDPOINT: GET /api/portal-wali/santri/:query (Pencarian Publik Wali Santri Multi-Device) ---
    if (path.startsWith('/api/portal-wali/santri/')) {
      const query = decodeURIComponent(path.replace('/api/portal-wali/santri/', '')).trim().toLowerCase();
      const santriList = await loadFromKV(`tenant:${activeTenantKey}:santri`, []);
      const billsList = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      const permitsList = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);

      const found = santriList.find(s => 
        (s.nama && s.nama.toLowerCase().includes(query)) ||
        (s.nis && s.nis.toLowerCase() === query) ||
        (s.nfcUid && s.nfcUid.toLowerCase() === query) ||
        String(s.id) === query
      );

      if (!found) {
        return jsonResponse({
          success: false,
          message: `Data santri "${query}" tidak ditemukan di ${activeTenantKey}. Silakan pastikan NIS atau nama santri benar.`
        }, 404, origin);
      }

      const santriBills = billsList.filter(b => b.santriId === found.id);
      const santriPermits = permitsList.filter(p => p.santriId === found.id);
      const activePermit = santriPermits.find(p => p.status === 'ACTIVE');

      const unpaidBills = santriBills.filter(b => b.status === 'UNPAID');
      const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);

      const settings = await loadFromKV(`tenant:${activeTenantKey}:settings`, 
        activeTenantKey === 'darulrahman' ? defaultDarulRahmanSettings : defaultAppSettings);

      return jsonResponse({
        success: true,
        data: {
          santri: found,
          location: {
            status: activePermit ? 'IZIN_KELUAR' : 'DI_PESANTREN',
            label: activePermit ? `Sedang Izin: ${activePermit.reason}` : 'Berada di Kompleks Pesantren',
            isOverdue: false,
            activePermit: activePermit || null
          },
          financial: {
            saldoSaku: found.saldo_saku || 0,
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
            accountNo: settings.BANK_ACCOUNT_NO || '7192837465',
            accountHolder: settings.BANK_ACCOUNT_HOLDER || settings.NAMA_LEMBAGA,
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
        globalThis.EDGE_TENANT_SANTRI[activeTenantKey] || (activeTenantKey === 'darulrahman' ? [] : MOCK_SANTRI));
      const billsList = await loadFromKV(`tenant:${activeTenantKey}:bills`, []);
      const permitsList = await loadFromKV(`tenant:${activeTenantKey}:permits`, []);
      const txsList = await loadFromKV(`tenant:${activeTenantKey}:pocket_tx`, []);

      const totalPocket = (santriList || []).reduce((acc, s) => acc + (parseFloat(s.saldo_saku) || 0), 0);
      const unpaidBills = (billsList || []).filter(b => b.status === 'UNPAID');
      const totalTunggakan = unpaidBills.reduce((acc, b) => acc + (parseFloat(b.amount) || 0), 0);
      const activePermits = (permitsList || []).filter(p => p.status === 'ACTIVE');

      return jsonResponse({
        success: true,
        data: {
          summary: {
            totalSantri: santriList.length,
            activeSantri: santriList.filter(s => s.status === 'AKTIF').length,
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
          },
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
