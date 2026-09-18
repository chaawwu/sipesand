const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedDarulRahman() {
  console.log('🚀 Memulai Pembuatan Akun & Database Real: Pondok Pesantren Darul Rahman Sumbersari...');

  const passwordHash = await bcrypt.hash('admin123', 10);
  const subdomain = 'darulrahman';
  const namaPondok = 'Pondok Pesantren Darul Rahman Sumbersari';
  const namaPengelola = 'Pengasuh Pondok Pesantren Darul Rahman Sumbersari';
  const email = 'darulrahmansumbersari@gmail.com';
  const noWhatsapp = '+6285123734342';
  const licenseKey = 'KGD-DARULRAHMAN-2026-REAL';

  // 1. Setup di Master Database (PostgreSQL)
  console.log('📦 [1/3] Mengonfigurasi Master Database...');

  // Upsert Akun Super Admin di Master DB
  await prisma.userAccount.upsert({
    where: { username: 'admin' },
    update: {
      name: namaPengelola,
      password: passwordHash,
      role: 'SUPER_ADMIN',
      division: 'PENGASUHAN_PUSAT',
      isActive: true,
    },
    create: {
      username: 'admin',
      name: namaPengelola,
      password: passwordHash,
      role: 'SUPER_ADMIN',
      division: 'PENGASUHAN_PUSAT',
      isActive: true,
    },
  });

  // Upsert Pengaturan Identitas di Master DB
  const settingsMaster = [
    { key: 'NAMA_LEMBAGA', value: namaPondok },
    { key: 'TAGLINE_LEMBAGA', value: 'Lembaga Pendidikan Islam & Tahfidzul Qur\'an Darul Rahman Sumbersari' },
    { key: 'ALAMAT_LEMBAGA', value: 'Sumbersari, Kencong, Kepung, Kediri, Jawa Timur' },
    { key: 'NO_TELP', value: noWhatsapp },
    { key: 'EMAIL_LEMBAGA', value: email },
    { key: 'NAMA_KEPALA_PONDOK', value: 'K.H. Pengasuh Darul Rahman' },
    { key: 'NAMA_BENDAHARA', value: 'Ustadz Bendahara Darul Rahman, S.E.' },
    { key: 'SUBDOMAIN_TENANT', value: subdomain },
    { key: 'LICENSE_KEY', value: licenseKey },
    { key: 'PACKAGE_TYPE', value: 'LIFETIME' },
    { key: 'IS_NFC_ENABLED', value: 'true' },
    { key: 'DISBURSEMENT_BANK', value: 'Bank Syariah Indonesia (BSI)' },
    { key: 'DISBURSEMENT_ACCOUNT_NO', value: '7192837465' },
    { key: 'DISBURSEMENT_ACCOUNT_HOLDER', value: 'YAYASAN DARUL RAHMAN SUMBERSARI' },
  ];

  for (const s of settingsMaster) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // Daftarkan ke MitraAktif
  const mitraAktif = await prisma.mitraAktif.upsert({
    where: { subdomain },
    update: {
      namaPondok,
      namaPengelola,
      email,
      noWhatsapp,
      packageType: 'LIFETIME',
      amount: 3500000,
      licenseKey,
      adminUsername: 'admin',
      adminPasswordHash: passwordHash,
      status: 'ACTIVE',
      provisionedAt: new Date(),
    },
    create: {
      namaPondok,
      subdomain,
      namaPengelola,
      email,
      noWhatsapp,
      packageType: 'LIFETIME',
      amount: 3500000,
      licenseKey,
      adminUsername: 'admin',
      adminPasswordHash: passwordHash,
      status: 'ACTIVE',
      provisionedAt: new Date(),
    },
  });

  // 2. Inisialisasi Master Tarif Tagihan Standar
  console.log('💳 [2/3] Menyiapkan Tarif Tagihan Syahriyah...');
  const defaultBills = [
    { name: 'SPP Syahriyah Bulanan', amount: 1200000, type: 'BULANAN_HIJRIYAH', description: 'Biaya pendidikan dan operasional asrama bulanan' },
    { name: 'Uang Makan & Konsumsi', amount: 600000, type: 'BULANAN_HIJRIYAH', description: 'Konsumsi dapur santri 3x sehari' },
    { name: 'Infaq Sarana & Prasarana', amount: 500000, type: 'SEKALI_BAYAR', description: 'Pengembangan fasilitas pondok' },
  ];

  for (const b of defaultBills) {
    const ex = await prisma.masterBill.findFirst({ where: { name: b.name } });
    if (!ex) {
      await prisma.masterBill.create({
        data: { ...b, isActive: true },
      });
    }
  }

  await prisma.$disconnect();

  console.log('====================================================================');
  console.log('🎉 AKUN REAL PONDOK PESANTREN DARUL RAHMAN SUMBERSARI BERHASIL DIBUAT!');
  console.log('👉 Nama Lembaga     : Pondok Pesantren Darul Rahman Sumbersari');
  console.log('👉 Alamat           : Sumbersari, Kencong, Kepung, Kediri, Jawa Timur');
  console.log('👉 Subdomain URL    : https://darulrahman.sipesand.web.id');
  console.log('👉 Login Superadmin : username: admin | password: admin123');
  console.log('👉 Status Lisensi   : LIFETIME (AKTIF 100%)');
  console.log('====================================================================');
}

seedDarulRahman()
  .catch((err) => {
    console.error('Error seeding Darul Rahman:', err);
    process.exit(1);
  });