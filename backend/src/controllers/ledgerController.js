const prisma = require('../config/prisma');

// Ambil semua entri buku kas umum dengan filter
exports.getAllEntries = async (req, res) => {
  try {
    const { type, category, startDate, endDate, limit = 100 } = req.query;
    const where = {};

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const entries = await prisma.generalLedger.findMany({
      where,
      orderBy: { date: 'desc' },
      take: parseInt(limit),
    });

    res.json({ success: true, data: entries });
  } catch (error) {
    console.error('Error getAllEntries:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data buku kas', error: error.message });
  }
};

// Ringkasan Saldo dan Rekap Buku Kas
exports.getSummary = async (req, res) => {
  try {
    const incomeAgg = await prisma.generalLedger.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true },
      _count: true,
    });

    const expenseAgg = await prisma.generalLedger.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true },
      _count: true,
    });

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;
    const currentBalance = totalIncome - totalExpense;

    // Rekap per kategori
    const categories = await prisma.generalLedger.groupBy({
      by: ['category', 'type'],
      _sum: { amount: true },
      _count: true,
    });

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        currentBalance,
        countIncome: incomeAgg._count,
        countExpense: expenseAgg._count,
        byCategory: categories.map(c => ({
          category: c.category,
          type: c.type,
          amount: c._sum.amount,
          count: c._count,
        })),
      },
    });
  } catch (error) {
    console.error('Error getSummary:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil ringkasan buku kas', error: error.message });
  }
};

// Tambah Entri Kas Baru
exports.createEntry = async (req, res) => {
  try {
    const { date, type, category, amount, description, reference } = req.body;

    if (!type || !category || !amount || !description) {
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi (type, category, amount, description)' });
    }

    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type harus bernilai INCOME atau EXPENSE' });
    }

    const dateStr = new Date(date || Date.now()).toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `KAS-${dateStr}-${randomSuffix}`;

    const newEntry = await prisma.generalLedger.create({
      data: {
        code,
        date: date ? new Date(date) : new Date(),
        type,
        category,
        amount: parseFloat(amount),
        description,
        reference: reference || null,
      },
    });

    res.status(201).json({
      success: true,
      message: `Catatan kas ${type === 'INCOME' ? 'masuk' : 'keluar'} berhasil disimpan`,
      data: newEntry,
    });
  } catch (error) {
    console.error('Error createEntry:', error);
    res.status(500).json({ success: false, message: 'Gagal mencatat transaksi buku kas', error: error.message });
  }
};

// Hapus Entri Kas
exports.deleteEntry = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.generalLedger.delete({ where: { id } });
    res.json({ success: true, message: 'Catatan kas berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteEntry:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus catatan kas', error: error.message });
  }
};
