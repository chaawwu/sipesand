const fs = require('fs');
const https = require('https');

const raw = JSON.parse(fs.readFileSync('scripts/firebase_full_dump.json'));

const token = process.env.CF_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CF_ACCOUNT_ID || '3b8a1ce0e7ef261c1debc81a27155860';
const kvId = process.env.CF_KV_ID || 'ec4f538a6f1a49a288005aefd63487c2';

// 1. Format Santri (13 Santri)
const formattedSantri = raw.santri.map((s, idx) => ({
  id: s.id,
  nis: s.id,
  nfcUid: s.id,
  name: s.name,
  nama: s.name,
  gender: s.gender || 'L',
  class: s.class,
  kelas: s.class,
  kamar: s.class,
  guardian: s.guardian || '-',
  namaWali: s.guardian || '-',
  noHpWali: '+62 812-4978-9903',
  address: s.address || '-',
  alamat: s.address || '-',
  balance: s.balance || 0,
  saldo_saku: s.balance || 0,
  saldo_deposit: s.saldo_deposit || 0,
  total_tunggakan: s.total_tunggakan || 0,
  pengurusUs: s.pengurusUs || '',
  status: 'AKTIF',
  photo: s.photo || null,
  foto: s.photo || null,
  ts: s.ts,
  createdAt: s.ts ? new Date(s.ts).toISOString() : new Date().toISOString()
}));

// 2. Format Bills (142 Bills)
const formattedBills = raw.bills.map(b => {
  const santriObj = formattedSantri.find(s => s.id === b.santriID);
  return {
    id: b.id,
    santriId: b.santriID,
    santriID: b.santriID,
    title: (b.name || '').trim(),
    name: (b.name || '').trim(),
    category: 'SYAHRIYAH',
    amount: b.amount || 0,
    status: (b.status || 'unpaid').toUpperCase(),
    period: b.period,
    hijriMonth: b.period,
    hijriYear: '1447 H',
    typeId: b.typeId,
    santri: santriObj || { id: b.santriID, nama: b.santriID, name: b.santriID },
    ts: b.ts,
    createdAt: b.ts ? new Date(b.ts).toISOString() : new Date().toISOString()
  };
});

// 3. Format Pocket Transactions (366 txs)
const formattedPocketTx = raw.pocketTx.map(tx => ({
  id: tx.id,
  santriId: tx.santriID,
  santriID: tx.santriID,
  type: tx.type === 'in' ? 'TOPUP' : 'DEDUCT',
  rawType: tx.type,
  amount: tx.amount,
  previousBalance: 0,
  currentBalance: 0,
  merchantName: tx.type === 'in' ? 'Setoran Tunai Wali / Admin' : 'Kantin / Koperasi Pondok',
  note: tx.desc || (tx.type === 'in' ? 'Setoran Tunai' : 'Penarikan Tunai'),
  desc: tx.desc,
  dateHijri: tx.dateHijri,
  ts: tx.ts,
  createdAt: tx.ts ? new Date(tx.ts).toISOString() : new Date().toISOString()
}));

// 4. Format Permits (31 permits)
const formattedPermits = raw.permits.map(p => {
  const santriObj = formattedSantri.find(s => s.id === p.santriID);
  return {
    id: p.id,
    santriId: p.santriID,
    santriID: p.santriID,
    santri: santriObj || { id: p.santriID, nama: p.santriID },
    destination: p.dest,
    dest: p.dest,
    reason: p.need,
    need: p.need,
    status: p.status === 'returned' ? 'RETURNED' : 'ACTIVE',
    rawStatus: p.status,
    departureTime: p.exitTs ? new Date(p.exitTs).toISOString() : new Date().toISOString(),
    returnTime: p.expectedReturnTs ? new Date(p.expectedReturnTs).toISOString() : new Date().toISOString(),
    actualReturnTime: p.returnTs ? new Date(p.returnTs).toISOString() : null,
    exitTs: p.exitTs,
    expectedReturnTs: p.expectedReturnTs,
    returnTs: p.returnTs,
    createdAt: p.exitTs ? new Date(p.exitTs).toISOString() : new Date().toISOString()
  };
});

// 5. Settings PPDR Asli
const rawSettings = raw.settings[0] || {};
const formattedSettings = {
  NAMA_LEMBAGA: rawSettings.nama || 'PONPES DARUL RAHMAN',
  nama: rawSettings.nama || 'PONPES DARUL RAHMAN',
  TAGLINE_LEMBAGA: 'Mencetak Generasi Mutafaqqih Fiddin dan Berakhlakul Karimah',
  ALAMAT_LEMBAGA: rawSettings.alamat || 'Sumbersari, kencong kepung kediri',
  alamat: rawSettings.alamat || 'Sumbersari, kencong kepung kediri',
  NO_TELP: rawSettings.telp || '+62 812-4978-9903',
  telp: rawSettings.telp || '+62 812-4978-9903',
  WHATSAPP_CENTER: (rawSettings.telp || '+62 812-4978-9903').replace(/[^0-9]/g, ''),
  EMAIL_LEMBAGA: 'darulrahman.kediri@gmail.com',
  NAMA_KEPALA_PONDOK: 'K.H. Syarif Hidayatullah, M.A.',
  NAMA_BENDAHARA: rawSettings.bendahara || 'mahrum ali',
  bendahara: rawSettings.bendahara || 'mahrum ali',
  BANK_NAME: rawSettings.bank || 'BSI',
  bank: rawSettings.bank || 'BSI',
  BANK_ACCOUNT_NO: rawSettings.rek || '7205409507',
  rek: rawSettings.rek || '7205409507',
  BANK_ACCOUNT_HOLDER: rawSettings.an || 'mahrum ali',
  an: rawSettings.an || 'mahrum ali',
  DISBURSEMENT_BANK: rawSettings.bank || 'BSI',
  DISBURSEMENT_ACCOUNT_NO: rawSettings.rek || '7205409507',
  DISBURSEMENT_ACCOUNT_HOLDER: rawSettings.an || 'mahrum ali',
  GOOGLE_SHEET_WEBHOOK_URL: rawSettings.sheetUrl || 'https://script.google.com/macros/s/AKfycbzPqS9wMaQdqTfxZftrkCg0y9Np7E3i3fGuQfX4VJCyR63LsPl5LrLdHtMspXH3lrNl/exec',
  sheetUrl: rawSettings.sheetUrl || 'https://script.google.com/macros/s/AKfycbzPqS9wMaQdqTfxZftrkCg0y9Np7E3i3fGuQfX4VJCyR63LsPl5LrLdHtMspXH3lrNl/exec',
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

// 6. Users PPDR
const formattedUsers = raw.users.map(u => ({
  id: u.id || u.user,
  user: u.user,
  username: u.user.toLowerCase(),
  name: u.name,
  pass: u.pass,
  role: u.role === 'bendahara' ? 'BENDAHARA' : (u.role === 'uang_saku' ? 'PENGURUS_UANG_SAKU' : 'KAMTIB'),
  rawRole: u.role
}));

function putKV(key, value) {
  return new Promise((resolve, reject) => {
    const valStr = typeof value === 'string' ? value : JSON.stringify(value);
    const req = https.request({
      hostname: 'api.cloudflare.com',
      path: `/client/v4/accounts/${accountId}/storage/kv/namespaces/${kvId}/values/${encodeURIComponent(key)}`,
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve({ success: res.statusCode === 200, raw: data });
        }
      });
    });
    req.on('error', reject);
    req.write(valStr);
    req.end();
  });
}

async function run() {
  console.log('🚀 [Cloudflare KV Seed] Menyuntikkan data PPDR ke Cloudflare KV (darulrahman)...');

  console.log('1. Uploading Santri (13 santri)...');
  const rSantri = await putKV('tenant:darulrahman:santri', formattedSantri);
  console.log('Santri upload result:', rSantri.success ? 'SUCCESS' : rSantri);

  console.log('2. Uploading Bills (142 bills)...');
  const rBills = await putKV('tenant:darulrahman:bills', formattedBills);
  console.log('Bills upload result:', rBills.success ? 'SUCCESS' : rBills);

  console.log('3. Uploading Pocket Transactions (366 txs)...');
  const rPocket = await putKV('tenant:darulrahman:pocket_tx', formattedPocketTx);
  console.log('PocketTx upload result:', rPocket.success ? 'SUCCESS' : rPocket);

  console.log('4. Uploading Permits (31 permits)...');
  const rPermits = await putKV('tenant:darulrahman:permits', formattedPermits);
  console.log('Permits upload result:', rPermits.success ? 'SUCCESS' : rPermits);

  console.log('5. Uploading Settings (PPDR Profile)...');
  const rSettings = await putKV('tenant:darulrahman:settings', formattedSettings);
  console.log('Settings upload result:', rSettings.success ? 'SUCCESS' : rSettings);

  console.log('6. Uploading Users (6 users)...');
  const rUsers = await putKV('tenant:darulrahman:users', formattedUsers);
  console.log('Users upload result:', rUsers.success ? 'SUCCESS' : rUsers);

  console.log('\n🎉 [COMPLETE] Seluruh data PPDR (Firestore webppdrv3) telah tersinkronisasi ke Cloudflare KV!');
}

run().catch(console.error);
