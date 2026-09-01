const prisma = require('../config/prisma');

// 1. Ambil Catatan Pelanggaran & Takziran
exports.getViolations = async (req, res) => {
  try {
    const { santriId, status, category, search } = req.query;
    const where = {};

    if (santriId) where.santriId = parseInt(santriId);
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { santri: { nama: { contains: search } } },
        { santri: { nis: { contains: search } } },
        { violation: { contains: search } },
        { takziran: { contains: search } },
      ];
    }

    const violations = await prisma.violationRecord.findMany({
      where,
      include: {
        santri: {
          select: { id: true, nama: true, nis: true, kelas: true, kamar: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: violations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data pelanggaran', error: err.message });
  }
};

// 2. Catat Pelanggaran & Takziran Baru
exports.createViolation = async (req, res) => {
  try {
    const { santriId, violation, category, takziran, officer, date } = req.body;

    if (!santriId || !violation || !takziran) {
      return res.status(400).json({ success: false, message: 'Santri, bentuk pelanggaran, dan takziran wajib diisi' });
    }

    const record = await prisma.violationRecord.create({
      data: {
        santriId: parseInt(santriId),
        violation,
        category: category || 'RINGAN',
        takziran,
        status: 'PROSES',
        officer: officer || 'Divisi Keamanan & Kamtib',
        date: date ? new Date(date) : new Date(),
      },
      include: { santri: true }
    });

    res.status(201).json({
      success: true,
      message: 'Catatan pelanggaran & takziran berhasil dicatat',
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mencatat pelanggaran', error: err.message });
  }
};

// 3. Update Status Takziran (Selesai / Proses)
exports.updateViolationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, takziran, notes } = req.body;

    const record = await prisma.violationRecord.update({
      where: { id: parseInt(id) },
      data: {
        ...(status && {
          status,
          ...(status === 'SELESAI' ? { completedAt: new Date() } : { completedAt: null })
        }),
        ...(takziran && { takziran }),
      },
      include: { santri: true }
    });

    res.json({ success: true, message: 'Status takziran berhasil diperbarui', data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui status takziran', error: err.message });
  }
};

// 4. Hapus Pelanggaran
exports.deleteViolation = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.violationRecord.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Catatan pelanggaran berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus catatan pelanggaran', error: err.message });
  }
};
