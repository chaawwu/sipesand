const masterPrisma = require('../config/prisma');

function getDb(req) {
  return req.prisma || masterPrisma;
}

exports.getDashboardStats = async (req, res) => {
  try {
    const db = getDb(req);

    // 1. Total Santri & Santri Aktif
    const totalSantri = await db.santri.count();
    const activeSantri = await db.santri.count({ where: { status: 'AKTIF' } });
    const rfidSantriCount = await db.santri.count({
      where: {
        nfcUid: { not: null }
      }
    });

    // 2. Total Saldo Uang Saku Seluruh Santri
    const pocketAggregate = await db.santri.aggregate({
      _sum: { saldo_saku: true },
    });
    const totalPocketBalance = pocketAggregate._sum.saldo_saku || 0;

    // 3. Ringkasan Kas Umum (Global Ledger)
    const incomeAgg = await db.generalLedger.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
    });
    const expenseAgg = await db.generalLedger.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const ledgerBalance = totalIncome - totalExpense;

    // 4. Total Tunggakan Pembayaran Santri
    const unpaidBillsAgg = await db.santriBill.aggregate({
      where: { status: { in: ['UNPAID', 'PENDING_VERIFICATION'] } },
      _sum: { amount: true },
      _count: { id: true },
    });
    const totalTunggakan = unpaidBillsAgg._sum.amount || 0;
    const countTunggakan = unpaidBillsAgg._count.id || 0;

    // 5. Perizinan & Overdue
    const activePermitsCount = await db.permit.count({
      where: { status: { in: ['ACTIVE', 'APPROVED'] } },
    });

    const now = new Date();
    const overduePermits = await db.permit.count({
      where: {
        status: 'ACTIVE',
        returnTime: { lt: now },
      },
    });

    // 6. Pending Verifikasi Pembayaran & Dana Divisi
    const pendingOnlinePaymentsCount = await db.santriBill.count({
      where: { status: 'PENDING_VERIFICATION' }
    });
    const pendingDivisionFundsCount = await db.divisionFund.count({
      where: { status: 'PENDING' }
    });

    // 7. Data Transaksi Uang Saku & Kas Terbaru
    const [recentPocketTxs, recentLedgerTxs, currentActivePermits, pendingBillsList, recentAcademics] = await Promise.all([
      db.pocketTx.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { santri: { select: { nama: true, nis: true, kamar: true } } },
      }),
      db.generalLedger.findMany({
        orderBy: { date: 'desc' },
        take: 5,
      }),
      db.permit.findMany({
        where: { status: { in: ['ACTIVE', 'APPROVED'] } },
        orderBy: { departureTime: 'desc' },
        take: 5,
        include: { santri: { select: { nama: true, kelas: true, kamar: true, noHpWali: true } } },
      }),
      db.santriBill.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        take: 5,
        include: { santri: true },
      }),
      db.academicRecord.findMany({
        take: 5,
        orderBy: { date: 'desc' },
        include: { santri: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalSantri,
          activeSantri,
          rfidSantriCount,
          totalPocketBalance,
          ledgerBalance,
          totalIncome,
          totalExpense,
          totalTunggakan,
          countTunggakan,
          activePermitsCount,
          overduePermits,
          pendingOnlinePaymentsCount,
          pendingDivisionFundsCount,
        },
        recentPocketTxs,
        recentLedgerTxs,
        currentActivePermits,
        pendingBillsList,
        recentAcademics,
      },
    });
  } catch (error) {
    console.error('Error getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik dashboard', error: error.message });
  }
};
