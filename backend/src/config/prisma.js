const { PrismaClient } = require('@prisma/client');
const { AsyncLocalStorage } = require('async_hooks');

const prismaContext = new AsyncLocalStorage();

const masterPrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Controllers historically import this singleton directly. Resolve it per request
// so existing controllers remain tenant-aware without sharing tenant state globally.
const prisma = new Proxy(masterPrisma, {
  get(target, property, receiver) {
    const client = prismaContext.getStore() || target;
    const value = Reflect.get(client, property, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

function runWithPrisma(client, callback) {
  return prismaContext.run(client, callback);
}

module.exports = prisma;
module.exports.runWithPrisma = runWithPrisma;
