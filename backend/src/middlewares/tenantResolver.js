const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const masterPrisma = require('../config/prisma');

// Tenant Prisma Client Cache (Agar tidak membuat koneksi berulang-ulang)
const tenantPrismaCache = new Map();
const getBaseDomains = () => {
  const configured = (process.env.BASE_DOMAIN || '').toLowerCase().trim();
  const candidates = [configured, 'sipesand.we.id', 'sipesand.web.id'];
  return [...new Set(candidates.filter(Boolean))];
};

/**
 * Mendapatkan atau membuat instance Prisma Client untuk database tenant tertentu
 */
function getTenantPrismaClient(subdomain) {
  const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '_');
  
  if (tenantPrismaCache.has(cleanSub)) {
    return tenantPrismaCache.get(cleanSub);
  }

  const tenantsDir = path.join(__dirname, '../../prisma/tenants');
  const tenantDbPath = path.join(tenantsDir, `tenant_${cleanSub}.db`);

  // Jika file database tenant belum ada, otomatis salin dari master database dev.db
  if (!fs.existsSync(tenantDbPath)) {
    try {
      if (!fs.existsSync(tenantsDir)) {
        fs.mkdirSync(tenantsDir, { recursive: true });
      }
      const masterDbPath = path.join(__dirname, '../../prisma/dev.db');
      if (fs.existsSync(masterDbPath) && cleanSub) {
        fs.copyFileSync(masterDbPath, tenantDbPath);
        console.log(`[TenantResolver] Database mandiri baru otomatis dibuat untuk tenant: ${cleanSub}`);
      }
    } catch (copyErr) {
      console.error(`[TenantResolver] Gagal inisialisasi database tenant ${cleanSub}:`, copyErr.message);
    }
  }

  // Jika file database tenant ada, buat Prisma Client khusus
  if (fs.existsSync(tenantDbPath)) {
    const tenantClient = new PrismaClient({
      datasources: {
        db: {
          url: `file:./tenants/tenant_${cleanSub}.db`,
        },
      },
    });
    tenantPrismaCache.set(cleanSub, tenantClient);
    return tenantClient;
  }

  // Fallback ke Master Database jika DB khusus belum dibuat
  return masterPrisma;
}

/**
 * Middleware Multi-Tenant Resolver
 * Mendeteksi subdomain dari Host header (e.g. tazakka.sipesand.web.id), query (?tenant=tazakka), atau X-Tenant-Subdomain
 */
function tenantResolver(req, res, next) {
  const host = req.headers.host || '';
  const customHeader = req.headers['x-tenant-subdomain'];
  const queryTenant = req.query.tenant || req.query.pondok || req.query.subdomain;

  let subdomain = null;

  // 1. Cek dari Custom Header
  if (customHeader && customHeader !== 'master' && customHeader !== 'app' && customHeader !== 'mitra' && customHeader !== 'pay' && customHeader !== 'api' && customHeader !== 'www') {
    subdomain = customHeader.toLowerCase().trim();
  }
  // 2. Cek dari Query Parameter (?tenant=... / ?pondok=...)
  else if (queryTenant && queryTenant !== 'master' && queryTenant !== 'app' && queryTenant !== 'mitra' && queryTenant !== 'pay' && queryTenant !== 'api') {
    subdomain = queryTenant.toLowerCase().trim();
  }
  // 3. Cek dari Hostname URL (e.g. darulrahman.sipesand.web.id)
  else {
    const hostWithoutPort = host.split(':')[0].toLowerCase();
    const matchedDomain = getBaseDomains().find((baseDomain) => {
      const isBase = hostWithoutPort === baseDomain || hostWithoutPort === `www.${baseDomain}`;
      const isTenant = hostWithoutPort.endsWith(`.${baseDomain}`) && !isBase;
      return isTenant;
    });

    if (matchedDomain) {
      const tenantHost = hostWithoutPort.replace(`.${matchedDomain}`, '');
      const parts = tenantHost.split('.');
      if (parts.length > 0 && parts[0] && parts[0] !== 'www' && parts[0] !== 'api' && parts[0] !== 'app' && parts[0] !== 'mitra' && parts[0] !== 'pay') {
        subdomain = parts[0];
      }
    }
  }

  // Lampirkan data tenant ke request object
  req.subdomain = subdomain;
  req.isMaster = !subdomain;
  req.prisma = subdomain ? getTenantPrismaClient(subdomain) : masterPrisma;

  const { tenantStorage } = require('../config/prisma');
  tenantStorage.run({ prisma: req.prisma }, () => {
    next();
  });
}

module.exports = {
  tenantResolver,
  getTenantPrismaClient,
};
