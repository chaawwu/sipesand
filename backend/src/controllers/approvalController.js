const prisma = require('../config/prisma');

// 1. Ambil Semua Pengajuan Dana Divisi
exports.getDivisionFunds = async (req, res) => {
  try {
    const { status, division } = req.query;
    const where = {};
    if (status) where.status = status;
    if (division) where.division = division;

    const funds = await prisma.divisionFund.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: funds });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengajuan dana divisi', error: err.message });
  }
};

// 2. Buat Pengajuan Dana Divisi Baru
exports.createDivisionFund = async (req, res) => {
  try {
    const { division, title, amount, description, requestedBy } = req.body;
    if (!division || !title || !amount) {
      return res.status(400).json({ success: false, message: 'Divisi, judul, dan nominal pengajuan wajib diisi' });
    }

    const code = `DND-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const fund = await prisma.divisionFund.create({
      data: {
        code,
        division,
        title,
        amount: parseFloat(amount),
        description: description || '',
        status: 'PENDING',
        requestedBy: requestedBy || 'Pengurus Divisi',
      }
    });

    res.status(201).json({
      success: true,
      message: 'Pengajuan dana divisi berhasil diajukan dan menunggu persetujuan',
      data: fund
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat pengajuan dana', error: err.message });
  }
};

// 3. ACC / Tolak / Selesaikan Pengajuan Dana Divisi
exports.updateDivisionFundStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, approvedBy, lpjProof } = req.body;

    const fund = await prisma.divisionFund.findUnique({ where: { id: parseInt(id) } });
    if (!fund) {
      return res.status(404).json({ success: false, message: 'Pengajuan dana tidak ditemukan' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.divisionFund.update({
        where: { id: parseInt(id) },
        data: {
          status,
          ...(status === 'APPROVED' && {
            approvedBy: approvedBy || 'Ustadz Ridwan, S.E. (Bendahara)',
            approvedAt: new Date(),
          }),
          ...(lpjProof && { lpjProof }),
        }
      });

      // Jika di-ACC (APPROVED), otomatis catat sebagai pengeluaran di Buku Kas Umum (General Ledger)
      if (status === 'APPROVED' && fund.status !== 'APPROVED') {
        await tx.generalLedger.create({
          data: {
            code: `KAS-${fund.code}`,
            date: new Date(),
            type: 'EXPENSE',
            category: 'Operasional',
            amount: fund.amount,
            description: `[DANA DIVISI] ${fund.title} (${fund.division})`,
            reference: fund.code,
            division: fund.division,
          }
        });
      }

      return updated;
    });

    res.json({
      success: true,
      message: `Status pengajuan dana berhasil diubah menjadi ${status}`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memproses persetujuan dana', error: err.message });
  }
};

// 4. Ambil Pembayaran Online Wali yang Menunggu ACC
exports.getPendingOnlinePayments = async (req, res) => {
  try {
    const pendingBills = await prisma.santriBill.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: { santri: true, masterBill: true },
      orderBy: { paymentDate: 'desc' }
    });
    res.json({ success: true, data: pendingBills });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data verifikasi pembayaran', error: err.message });
  }
};
