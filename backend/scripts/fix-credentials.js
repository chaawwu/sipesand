const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fix() {
  // Check current state
  const emailRow = await prisma.systemSetting.findUnique({ where: { key: 'DEV_EMAIL' } });
  const passRow = await prisma.systemSetting.findUnique({ where: { key: 'DEV_PASSWORD_HASH' } });
  console.log('DEV_EMAIL:', emailRow?.value);
  console.log('DEV_PASSWORD_HASH exists:', !!passRow?.value);
  
  // Ensure correct credentials
  const hash = await bcrypt.hash('admin123#', 12);
  await prisma.systemSetting.upsert({
    where: { key: 'DEV_EMAIL' },
    update: { value: 'kingdigitaldev@gmail.com' },
    create: { key: 'DEV_EMAIL', value: 'kingdigitaldev@gmail.com' }
  });
  await prisma.systemSetting.upsert({
    where: { key: 'DEV_PASSWORD_HASH' },
    update: { value: hash },
    create: { key: 'DEV_PASSWORD_HASH', value: hash }
  });
  console.log('Fixed credentials');
  await prisma.$disconnect();
}
fix().catch(console.error);