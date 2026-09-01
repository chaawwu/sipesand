const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

/**
 * Generate temporary random secure password for initial Super Admin
 */
function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomStr = '';
  for (let i = 0; i < 4; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Pesand-${randomStr}!`;
}

/**
 * Generate License Key unik
 */
function generateLicenseKey(subdomain) {
  const cleanSub = subdomain.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KGD-${cleanSub}-${part1}-${part2}`;
}

/**
 * Auto-Provisioning Engine: Membuat database tenant terisolasi dan inisialisasi akun Super Admin
 */
async function provisionNewTenant({
  namaPondok,
  subdomain,
  namaPengelola,
  email,
  noWhatsapp,
  packageType,
}) {
  try {
    const tenantsDir = path.join(__dirname, '../../prisma/tenants');
    if (!fs.existsSync(tenantsDir)) {
      fs.mkdirSync(tenantsDir, { recursive: true });
    }

    const tenantDbName = `tenant_${subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_')}.db`;
    const tenantDbPath = path.join(tenantsDir, tenantDbName);
    const tenantDbUrl = `file:${tenantDbPath}`;

    // Buat salinan skema / file master db jika belum ada
    const masterDbPath = path.join(__dirname, '../../prisma/dev.db');
    if (fs.existsSync(masterDbPath) && !fs.existsSync(tenantDbPath)) {
      fs.copyFileSync(masterDbPath, tenantDbPath);
    }

    // Buat Prisma Client khusus untuk koneksi ke database tenant yang baru dibuat
    const tenantPrisma = new PrismaClient({
      datasources: {
        db: {
          url: `file:./tenants/${tenantDbName}`,
        },
      },
    });

    const tempPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const licenseKey = generateLicenseKey(subdomain);
    const adminUsername = 'admin';

    // 1. Inisialisasi Akun Super Admin di Database Tenant
    await tenantPrisma.userAccount.upsert({
      where: { username: adminUsername },
      update: {
        name: namaPengelola || 'Super Admin Pesantren',
        password: passwordHash,
        role: 'SUPER_ADMIN',
        division: 'PENGASUHAN_PUSAT',
        isActive: true,
      },
      create: {
        username: adminUsername,
        name: namaPengelola || 'Super Admin Pesantren',
        password: passwordHash,
        role: 'SUPER_ADMIN',
        division: 'PENGASUHAN_PUSAT',
        isActive: true,
      },
    });

    // 2. Inisialisasi Pengaturan Identitas Lembaga & King Digital Payment Gateway
    const initialSettings = [
      { key: 'NAMA_LEMBAGA', value: namaPondok },
      { key: 'TAGLINE_LEMBAGA', value: 'Sistem Informasi & Manajemen Terpadu Pesantren Digital' },
      { key: 'SUBDOMAIN_TENANT', value: subdomain },
      { key: 'EMAIL_LEMBAGA', value: email },
      { key: 'NO_TELP', value: noWhatsapp },
      { key: 'NAMA_KEPALA_PONDOK', value: namaPengelola || 'Pengasuh Pondok Pesantren' },
      { key: 'NAMA_BENDAHARA', value: 'Ustadz Bendahara, S.E.' },
      { key: 'LICENSE_KEY', value: licenseKey },
      { key: 'PACKAGE_TYPE', value: packageType || 'TAHUNAN' },
      { key: 'IS_NFC_ENABLED', value: 'true' },
      { key: 'KING_DIGITAL_PG_ENABLED', value: 'false' },
      { key: 'DISBURSEMENT_BANK', value: 'Bank Syariah Indonesia (BSI)' },
      { key: 'DISBURSEMENT_ACCOUNT_NO', value: '7192837465' },
      { key: 'DISBURSEMENT_ACCOUNT_HOLDER', value: `YAYASAN ${namaPondok.toUpperCase()}` },
    ];

    for (const s of initialSettings) {
      await tenantPrisma.systemSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: { key: s.key, value: s.value },
      });
    }

    // 3. Inisialisasi Master Tarif Tagihan Standar
    const defaultMasterBills = [
      { name: 'SPP Syahriyah Bulanan', amount: 1200000, type: 'BULANAN_HIJRIYAH', description: 'Biaya pendidikan dan operasional asrama bulanan' },
      { name: 'Uang Makan & Konsumsi', amount: 600000, type: 'BULANAN_HIJRIYAH', description: 'Konsumsi dapur santri 3x sehari' },
      { name: 'Infaq Sarana & Prasarana', amount: 500000, type: 'SEKALI_BAYAR', description: 'Pengembangan fasilitas pondok' },
    ];

    for (const mb of defaultMasterBills) {
      const existing = await tenantPrisma.masterBill.findFirst({ where: { name: mb.name } });
      if (!existing) {
        await tenantPrisma.masterBill.create({
          data: { ...mb, isActive: true },
        });
      }
    }

    await tenantPrisma.$disconnect();

    console.log(`[PROVISIONING SUCCESS] Tenant "${subdomain}" created at ${tenantDbPath}`);

    return {
      success: true,
      dbPath: tenantDbPath,
      dbUrl: tenantDbUrl,
      adminUsername,
      tempPassword,
      passwordHash,
      licenseKey,
    };
  } catch (err) {
    console.error('[PROVISIONING ERROR] Failed to provision tenant database:', err);
    throw err;
  }
}

module.exports = {
  provisionNewTenant,
};
