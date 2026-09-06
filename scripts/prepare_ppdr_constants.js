const fs = require('fs');

const raw = JSON.parse(fs.readFileSync('scripts/firebase_full_dump.json'));

const formattedSantri = raw.santri.map(s => ({
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

const formattedUsers = raw.users.map(u => ({
  id: u.id || u.user,
  user: u.user,
  username: u.user.toLowerCase(),
  name: u.name,
  pass: u.pass,
  role: u.role === 'bendahara' ? 'BENDAHARA' : (u.role === 'uang_saku' ? 'PENGURUS_UANG_SAKU' : 'KAMTIB'),
  rawRole: u.role
}));

console.log('Santri count:', formattedSantri.length);
console.log('Bills count:', raw.bills.length);
console.log('Settings:', formattedSettings.NAMA_LEMBAGA, formattedSettings.BANK_ACCOUNT_NO);
console.log('Users:', formattedUsers.map(u => u.username + ':' + u.pass).join(', '));
