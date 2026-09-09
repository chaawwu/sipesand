const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Membersihkan database tanpa membuat data demo...');

  await prisma.userAccount.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.divisionFund.deleteMany();
  await prisma.violationRecord.deleteMany();
  await prisma.academicRecord.deleteMany();
  await prisma.santriBill.deleteMany();
  await prisma.masterBill.deleteMany();
  await prisma.pocketTx.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.generalLedger.deleteMany();
  await prisma.santri.deleteMany();

  console.log('Database siap digunakan tanpa data santri atau transaksi demo.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
