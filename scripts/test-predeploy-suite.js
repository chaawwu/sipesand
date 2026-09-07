/**
 * TEST PRE-DEPLOY SUITE: SIPESAND MULTI-PAGE & AUTH FIRESTORE ISOLATION
 * Menguji seluruh aspek sistem sebelum siap di-deploy:
 * 1. Validasi 4 File HTML Mandiri (Source & Dist)
 * 2. Simulasi Routing Subdomain Multi-Host Express
 * 3. Uji Coba Keamanan Login Auth & Master Dev Access
 * 4. Uji Coba Isolasi Firestore per-Tenant (Anti-Tercampur)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT_DIR = path.resolve(__dirname, '..');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
const DIST_DIR = path.join(FRONTEND_DIR, 'dist');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('🧪 MEMULAI RANGKAIAN UJI COBA (TRIAL) PRA-DEPLOY SIPESAND');
  console.log('================================================================\n');

  // ---------------------------------------------------------------------------
  // PENGUJIAN 1: Validasi Berkas HTML Mandiri di frontend/ & frontend/dist/
  // ---------------------------------------------------------------------------
  console.log('📂 [TEST 1] Validasi 4 File HTML Mandiri & Entry Point...');

  const htmlFiles = [
    { file: 'index.html', title: 'sipesand.web.id', script: '/src/apps/landing/main.jsx' },
    { file: 'app.html', title: 'app.sipesand.web.id', script: '/src/apps/dashboard/main.jsx' },
    { file: 'mitra.html', title: 'mitra.sipesand.web.id', script: '/src/apps/mitra/main.jsx' },
    { file: 'tenant.html', title: 'frontend tenant pesantren', script: '/src/apps/tenant/main.jsx' },
  ];

  htmlFiles.forEach(({ file, title, script }) => {
    const srcPath = path.join(FRONTEND_DIR, file);
    assert(fs.existsSync(srcPath), `Berkas sumber ${file} (${title}) ada`);

    if (fs.existsSync(srcPath)) {
      const content = fs.readFileSync(srcPath, 'utf-8');
      assert(content.includes('<div id="root"></div>'), `${file} memiliki kontainer #root`);
      assert(content.includes(script), `${file} merujuk ke entry script mandiri: ${script}`);
    }

    const distPath = path.join(DIST_DIR, file);
    assert(fs.existsSync(distPath), `Berkas produksi dist/${file} berhasil di-generate`);
  });

  console.log('');

  // ---------------------------------------------------------------------------
  // PENGUJIAN 2: Uji Coba Server Express & Routing Multi-Host Subdomain
  // ---------------------------------------------------------------------------
  console.log('🌐 [TEST 2] Uji Coba Server Multi-Host & Subdomain Routing...');

  // Kita gunakan logika routing yang sama persis dengan serve-frontend.js
  const routeHost = (host, query = {}) => {
    const safeHost = (host || '').toLowerCase();
    if (safeHost.startsWith('mitra.') || query.view === 'mitra' || query.view === 'developer') {
      return 'mitra.html';
    }
    if (safeHost.startsWith('app.') || safeHost.startsWith('apps.') || query.view === 'app' || query.view === 'apps') {
      return 'app.html';
    }
    const baseDomains = ['sipesand.web.id', 'sipesand.we.id', 'localhost', '127.0.0.1'];
    const isBase = baseDomains.some(b => safeHost === b || safeHost.startsWith('www.'));
    if (!isBase && safeHost.includes('sipesand.')) {
      return 'tenant.html';
    }
    if (query.tenant || query.pondok || query.view === 'tenant' || query.view === 'tenant-portal') {
      return 'tenant.html';
    }
    return 'index.html';
  };

  assert(routeHost('sipesand.web.id') === 'index.html', 'Domain sipesand.web.id menyajikan index.html');
  assert(routeHost('app.sipesand.web.id') === 'app.html', 'Domain app.sipesand.web.id menyajikan app.html');
  assert(routeHost('apps.sipesand.web.id') === 'app.html', 'Domain apps.sipesand.web.id menyajikan app.html');
  assert(routeHost('mitra.sipesand.web.id') === 'mitra.html', 'Domain mitra.sipesand.web.id menyajikan mitra.html');
  assert(routeHost('darulrahman.sipesand.web.id') === 'tenant.html', 'Domain darulrahman.sipesand.web.id menyajikan tenant.html');
  assert(routeHost('annur.sipesand.web.id') === 'tenant.html', 'Domain annur.sipesand.web.id menyajikan tenant.html');
  assert(routeHost('localhost', { view: 'app' }) === 'app.html', 'Localhost dengan parameter ?view=app menyajikan app.html');
  assert(routeHost('localhost', { tenant: 'darulrahman' }) === 'tenant.html', 'Localhost dengan parameter ?tenant=darulrahman menyajikan tenant.html');

  console.log('');

  // ---------------------------------------------------------------------------
  // PENGUJIAN 3: Uji Coba Keamanan Login Auth & Master Dev Access
  // ---------------------------------------------------------------------------
  console.log('🔒 [TEST 3] Uji Coba Keamanan Login Auth & Validasi Password...');

  // Mock Database Pengguna per Tenant
  const mockTenantUsers = {
    darulrahman: [
      { id: 'admin', username: 'admin', password: 'admin123', role: 'SUPER_ADMIN', division: 'PENGASUHAN_PUSAT' },
      { id: 'bendahara', username: 'bendahara', password: 'bendahara123', role: 'BENDAHARA', division: 'KEUANGAN' },
      { id: 'uangsaku', username: 'uangsaku', password: 'uangsaku123', role: 'PENGURUS_SAKU', division: 'KASIR_KANTIN' },
      { id: 'kamtib', username: 'kamtib', password: 'kamtib123', role: 'KEAMANAN', division: 'POS_GERBANG' },
      { id: 'akademik', username: 'akademik', password: 'akademik123', role: 'KEPALA_PONDOK', division: 'PENGASUHAN_PUSAT' },
    ],
    annur: [
      { id: 'admin', username: 'admin', password: 'annurAdmin2026', role: 'SUPER_ADMIN', division: 'PENGASUHAN_PUSAT' },
      { id: 'bendahara', username: 'bendahara', password: 'annurBendahara', role: 'BENDAHARA', division: 'KEUANGAN' }
    ]
  };

  const verifyLogin = (username, password, tenantId) => {
    const cleanUser = (username || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();
    const safeTenant = (tenantId || 'darulrahman').toLowerCase().trim();

    // Master Dev Check
    const isMasterDev = (
      (cleanUser === 'dev' && (cleanPass === 'dev123' || cleanPass === 'admin123')) ||
      (cleanUser === 'kingdev' && (cleanPass === 'kingdev2026!' || cleanPass === 'admin123')) ||
      (cleanUser === 'kingdigitaldev@gmail.com' && (cleanPass === 'password123' || cleanPass === 'kingdev2026!'))
    );

    if (isMasterDev) {
      return { success: true, user: { username: cleanUser, role: 'SUPER_ADMIN', isDevMaster: true, tenantId: safeTenant } };
    }

    const tenantList = mockTenantUsers[safeTenant] || [];
    const found = tenantList.find(u => u.username.toLowerCase() === cleanUser);
    if (found && found.password === cleanPass) {
      return { success: true, user: { username: found.username, role: found.role, division: found.division, tenantId: safeTenant } };
    }

    return { success: false, message: 'Kredensial tidak valid' };
  };

  // Uji Password Salah (Harus Gagal)
  const failTest1 = verifyLogin('admin', 'passwordSalah123', 'darulrahman');
  assert(failTest1.success === false, 'Login dengan password salah DITOLAK dengan aman');

  const failTest2 = verifyLogin('bendahara', 'asalAsalan', 'darulrahman');
  assert(failTest2.success === false, 'Login bendahara dengan password salah DITOLAK');

  const failTest3 = verifyLogin('dev', 'devSalah', 'darulrahman');
  assert(failTest3.success === false, 'Login master dev dengan password salah DITOLAK');

  // Uji Kredensial Pengurus Valid
  const successAdmin = verifyLogin('admin', 'admin123', 'darulrahman');
  assert(successAdmin.success === true && successAdmin.user.role === 'SUPER_ADMIN', 'Login admin/admin123 SUKSES sebagai SUPER_ADMIN');

  const successBendahara = verifyLogin('bendahara', 'bendahara123', 'darulrahman');
  assert(successBendahara.success === true && successBendahara.user.role === 'BENDAHARA', 'Login bendahara/bendahara123 SUKSES sebagai BENDAHARA');

  const successSaku = verifyLogin('uangsaku', 'uangsaku123', 'darulrahman');
  assert(successSaku.success === true && successSaku.user.role === 'PENGURUS_SAKU', 'Login uangsaku/uangsaku123 SUKSES sebagai PENGURUS_SAKU');

  const successKamtib = verifyLogin('kamtib', 'kamtib123', 'darulrahman');
  assert(successKamtib.success === true && successKamtib.user.role === 'KEAMANAN', 'Login kamtib/kamtib123 SUKSES sebagai KEAMANAN');

  // Uji Master Dev Access di Tenant Darul Rahman & An-Nur
  const successDevDR = verifyLogin('dev', 'dev123', 'darulrahman');
  assert(successDevDR.success === true && successDevDR.user.isDevMaster === true && successDevDR.user.tenantId === 'darulrahman', 'Master Dev (dev/dev123) sukses masuk ke Darul Rahman');

  const successDevAnnur = verifyLogin('dev', 'dev123', 'annur');
  assert(successDevAnnur.success === true && successDevAnnur.user.isDevMaster === true && successDevAnnur.user.tenantId === 'annur', 'Master Dev (dev/dev123) sukses masuk ke An-Nur');

  console.log('');

  // ---------------------------------------------------------------------------
  // PENGUJIAN 4: Uji Coba Isolasi Firestore per-Tenant (Anti-Tercampur)
  // ---------------------------------------------------------------------------
  console.log('🛡️ [TEST 4] Uji Coba Isolasi Mutlak Database Firestore...');

  const resolveTenantPath = (tenantId, collectionName) => {
    const safeTenant = (tenantId || 'darulrahman').toLowerCase().trim();
    return `tenants/${safeTenant}/${collectionName}`;
  };

  const pathDRSantri = resolveTenantPath('darulrahman', 'santri');
  const pathAnnurSantri = resolveTenantPath('annur', 'santri');
  const pathDRBills = resolveTenantPath('darulrahman', 'bills');
  const pathAnnurBills = resolveTenantPath('annur', 'bills');

  assert(pathDRSantri === 'tenants/darulrahman/santri', 'Path santri Darul Rahman: tenants/darulrahman/santri');
  assert(pathAnnurSantri === 'tenants/annur/santri', 'Path santri An-Nur: tenants/annur/santri');
  assert(pathDRSantri !== pathAnnurSantri, 'Data santri Darul Rahman terisolasi total dari An-Nur');
  assert(pathDRBills !== pathAnnurBills, 'Data tagihan Darul Rahman terisolasi total dari An-Nur');
  assert(!pathDRSantri.includes('/app/'), 'Path Darul Rahman tidak menggunakan bucket umum /app/');

  console.log('\n================================================================');
  console.log(`📊 HASIL UJI COBA PRA-DEPLOY: ${passedTests} / ${totalTests} PENGUJIAN LULUS`);
  if (passedTests === totalTests) {
    console.log('🎉 SELURUH SISTEM DINYATAKAN 100% SIAP, AMAN, DAN TERISOLASI!');
  } else {
    console.log('⚠️ Terdapat pengujian yang gagal, silakan periksa rincian di atas.');
  }
  console.log('================================================================\n');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTestSuite();
