const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const masterPrisma = require('../config/prisma');

// Tenant Prisma Client Cache (Agar tidak membuat koneksi berulang-ulang)
const tenantPrismaCache = new Map();

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
  const queryTenant = req.query.tenant;

  let subdomain = null;

  // 1. Cek dari Custom Header
  if (customHeader && customHeader !== 'master') {
    subdomain = customHeader.toLowerCase().trim();
  }
  // 2. Cek dari Query Parameter (?tenant=...)
  else if (queryTenant && queryTenant !== 'master') {
    subdomain = queryTenant.toLowerCase().trim();
  }
  // 3. Cek dari Hostname URL (e.g. darululum.sipesand.web.id)
  else {
    const baseDomain = process.env.BASE_DOMAIN || 'sipesand.web.id';
    const hostWithoutPort = host.split(':')[0].toLowerCase();

    if (hostWithoutPort.endsWith(baseDomain) && hostWithoutPort !== baseDomain && hostWithoutPort !== `www.${baseDomain}`) {
      const parts = hostWithoutPort.replace(`.${baseDomain}`, '').split('.');
      if (parts.length > 0 && parts[0] && parts[0] !== 'www' && parts[0] !== 'api') {
        subdomain = parts[0];
      }
    }
  }

  // Lampirkan data tenant ke request object
  req.subdomain = subdomain;
  req.isMaster = !subdomain;
  req.prisma = subdomain ? getTenantPrismaClient(subdomain) : masterPrisma;

  next();
}

module.exports = {
  tenantResolver,
  getTenantPrismaClient,
};
