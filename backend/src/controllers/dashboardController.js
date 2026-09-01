const prisma = require('../config/prisma');

exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Total Santri & Santri Aktif
    const totalSantri = await prisma.santri.count();
    const activeSantri = await prisma.santri.count({ where: { status: 'AKTIF' } });

    // 2. Total Saldo Uang Saku Seluruh Santri
    const pocketAggregate = await prisma.santri.aggregate({
      _sum: { saldo_saku: true },
    });
    const totalPocketBalance = pocketAggregate._sum.saldo_saku || 0;

    // 3. Ringkasan Kas Umum (Global Ledger)
    const incomeAgg = await prisma.generalLedger.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
    });
    const expenseAgg = await prisma.generalLedger.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const ledgerBalance = totalIncome - totalExpense;

    // 4. Total Tunggakan Pembayaran Santri
    const unpaidBillsAgg = await prisma.santriBill.aggregate({
      where: { status: { in: ['UNPAID', 'PENDING_VERIFICATION'] } },
      _sum: { amount: true },
      _count: { id: true },
    });
    const totalTunggakan = unpaidBillsAgg._sum.amount || 0;
    const countTunggakan = unpaidBillsAgg._count.id || 0;

    // 5. Perizinan & Overdue
    const activePermitsCount = await prisma.permit.count({
      where: { status: { in: ['ACTIVE', 'APPROVED'] } },
    });

    const now = new Date();
    const overduePermits = await prisma.permit.count({
      where: {
        status: 'ACTIVE',
        returnTime: { lt: now },
      },
    });

    // 6. Pending Verifikasi Pembayaran & Dana Divisi
    const pendingOnlinePaymentsCount = await prisma.santriBill.count({
      where: { status: 'PENDING_VERIFICATION' }
    });
    const pendingDivisionFundsCount = await prisma.divisionFund.count({
      where: { status: 'PENDING' }
    });

    // 7. Data Transaksi Uang Saku & Kas Terbaru
    const [recentPocketTxs, recentLedgerTxs, currentActivePermits, pendingBillsList, recentAcademics] = await Promise.all([
      prisma.pocketTx.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { santri: { select: { nama: true, nis: true, kamar: true } } },
      }),
      prisma.generalLedger.findMany({
        orderBy: { date: 'desc' },
        take: 5,
      }),
      prisma.permit.findMany({
        where: { status: { in: ['ACTIVE', 'APPROVED'] } },
        orderBy: { departureTime: 'desc' },
        take: 5,
        include: { santri: { select: { nama: true, kelas: true, kamar: true, noHpWali: true } } },
      }),
      prisma.santriBill.findMany({
        where: { status: 'PENDING_VERIFICATION' },
        take: 5,
        include: { santri: true },
      }),
      prisma.academicRecord.findMany({
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
