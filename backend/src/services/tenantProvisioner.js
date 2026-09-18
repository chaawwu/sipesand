const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
 * Auto-Provisioning Engine: Creates tenant record in shared PostgreSQL database
 * Uses row-level tenant isolation via tenant_id in each model
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
    const tempPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const licenseKey = generateLicenseKey(subdomain);
    const adminUsername = 'admin';

    // Create tenant record in shared database
    const mitraAktif = await prisma.mitraAktif.create({
      data: {
        namaPondok,
        subdomain: subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_'),
        namaPengelola,
        email,
        noWhatsapp,
        packageType: packageType || 'TAHUNAN',
        amount: packageType === 'LIFETIME' ? 3500000 : 1500000,
        licenseKey,
        dbPath: '', // Not used with shared PostgreSQL
        adminUsername,
        adminPasswordHash: passwordHash,
        status: 'ACTIVE',
        provisionedAt: new Date(),
      },
    });

    console.log(`[PROVISIONING SUCCESS] Tenant "${subdomain}" created in shared PostgreSQL`);

    return {
      success: true,
      mitraId: mitraAktif.id,
      adminUsername,
      tempPassword,
      passwordHash,
      licenseKey,
    };
  } catch (err) {
    console.error('[PROVISIONING ERROR] Failed to provision tenant:', err);
    throw err;
  }
}

module.exports = {
  provisionNewTenant,
  prisma,
};
