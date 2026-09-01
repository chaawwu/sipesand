const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function seedDarulRahman() {
  console.log('🚀 Memulai Pembuatan Akun & Database Real: Pondok Pesantren Darul Rahman Sumbersari...');

  const masterPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${path.join(__dirname, '../prisma/dev.db')}`,
      },
    },
  });

  const passwordHash = await bcrypt.hash('admin123', 10);
  const subdomain = 'darulrahman';
  const namaPondok = 'Pondok Pesantren Darul Rahman Sumbersari';
  const namaPengelola = 'Pengasuh Pondok Pesantren Darul Rahman Sumbersari';
  const email = 'darulrahmansumbersari@gmail.com';
  const noWhatsapp = '+6285123734342';
  const licenseKey = 'KGD-DARULRAHMAN-2026-REAL';

  const tenantsDir = path.join(__dirname, '../prisma/tenants');
  if (!fs.existsSync(tenantsDir)) {
    fs.mkdirSync(tenantsDir, { recursive: true });
  }
  const tenantDbPath = path.join(tenantsDir, `tenant_${subdomain}.db`);
  const masterDbPath = path.join(__dirname, '../prisma/dev.db');

  // Copy struktur schema dari dev.db jika belum ada
  if (!fs.existsSync(tenantDbPath) && fs.existsSync(masterDbPath)) {
    fs.copyFileSync(masterDbPath, tenantDbPath);
  }

  // 1. Setup di Master Database (dev.db)
  console.log('📦 [1/3] Mengonfigurasi Master Database...');

  // Upsert Akun Super Admin di Master DB
  await masterPrisma.userAccount.upsert({
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
    await masterPrisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // Daftarkan ke MitraAktif
  await masterPrisma.mitraAktif.upsert({
    where: { subdomain },
    update: {
      namaPondok,
      namaPengelola,
      email,
      noWhatsapp,
      packageType: 'LIFETIME',
      amount: 3500000,
      licenseKey,
      dbPath: tenantDbPath,
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
      dbPath: tenantDbPath,
      adminUsername: 'admin',
      adminPasswordHash: passwordHash,
      status: 'ACTIVE',
      provisionedAt: new Date(),
    },
  });

  // 2. Setup Database Tenant Mandiri (tenant_darulrahman.db)
  console.log('🏛️ [2/3] Mengonfigurasi Database Tenant Mandiri (tenant_darulrahman.db)...');
  const tenantPrisma = new PrismaClient({
    datasources: {
      db: {
        url: `file:${tenantDbPath}`,
      },
    },
  });

  // Buat/Update Akun Super Admin di DB Tenant
  await tenantPrisma.userAccount.upsert({
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

  // Simpan seluruh Pengaturan Identitas di DB Tenant
  for (const s of settingsMaster) {
    await tenantPrisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // 3. Pastikan Master Tarif Tagihan Resmi Siap Pakai
  console.log('💳 [3/3] Menyiapkan Tarif Tagihan Syahriyah...');
  const defaultBills = [
    { name: 'SPP Syahriyah Bulanan', amount: 1200000, type: 'BULANAN_HIJRIYAH', description: 'Biaya pendidikan dan operasional asrama bulanan' },
    { name: 'Uang Makan & Konsumsi', amount: 600000, type: 'BULANAN_HIJRIYAH', description: 'Konsumsi dapur santri 3x makan sehari' },
    { name: 'Infaq Sarana & Prasarana', amount: 500000, type: 'SEKALI_BAYAR', description: 'Pengembangan sarana & gedung pondok' },
  ];

  for (const b of defaultBills) {
    const ex = await tenantPrisma.masterBill.findFirst({ where: { name: b.name } });
    if (!ex) {
      await tenantPrisma.masterBill.create({
        data: { ...b, isActive: true },
      });
    }
  }

  await masterPrisma.$disconnect();
  await tenantPrisma.$disconnect();

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
