const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('async_hooks');

// AsyncLocalStorage untuk isolasi tenant context per-request
const tenantStorage = new AsyncLocalStorage();

const masterPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

// Proxy Prisma yang otomatis mendelegasikan query ke tenantPrisma aktif pada request tersebut
const proxyPrisma = new Proxy(masterPrisma, {
  get(target, prop) {
    const store = tenantStorage.getStore();
    const activePrisma = store?.prisma || target;
    const val = activePrisma[prop];
    if (typeof val === 'function') {
      return val.bind(activePrisma);
    }
    return val;
  },
});

module.exports = proxyPrisma;
module.exports.masterPrisma = masterPrisma;
module.exports.tenantStorage = tenantStorage;
