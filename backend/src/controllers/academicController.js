const prisma = require('../config/prisma');

// Ambil semua catatan akademik & muhafadzoh
exports.getAcademicRecords = async (req, res) => {
  try {
    const { santriId, type, search } = req.query;
    const where = {};

    if (santriId) where.santriId = parseInt(santriId);
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { santri: { nama: { contains: search } } },
        { santri: { nis: { contains: search } } },
        { title: { contains: search } },
        { achievement: { contains: search } },
      ];
    }

    const records = await prisma.academicRecord.findMany({
      where,
      include: {
        santri: {
          select: { id: true, nama: true, nis: true, kelas: true, kamar: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data muhafadzoh & akademik', error: err.message });
  }
};

// Buat Catatan Muhafadzoh / Nilai / Sikap
exports.createAcademicRecord = async (req, res) => {
  try {
    const { santriId, type, title, achievement, score, grade, notes, assessedBy, date } = req.body;

    if (!santriId || !type || !title || !achievement) {
      return res.status(400).json({ success: false, message: 'Santri, tipe, judul, dan capaian wajib diisi' });
    }

    const record = await prisma.academicRecord.create({
      data: {
        santriId: parseInt(santriId),
        type,
        title,
        achievement,
        score: score !== undefined && score !== '' ? parseFloat(score) : null,
        grade: grade || null,
        notes: notes || null,
        assessedBy: assessedBy || 'K.H. Syarif Hidayatullah, M.A. (Kepala Pondok)',
        date: date ? new Date(date) : new Date(),
      },
      include: { santri: true }
    });

    res.status(201).json({
      success: true,
      message: 'Catatan muhafadzoh & perkembangan santri berhasil disimpan',
      data: record
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan catatan muhafadzoh', error: err.message });
  }
};

// Update Catatan
exports.updateAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, title, achievement, score, grade, notes, assessedBy, date } = req.body;

    const record = await prisma.academicRecord.update({
      where: { id: parseInt(id) },
      data: {
        ...(type && { type }),
        ...(title && { title }),
        ...(achievement && { achievement }),
        ...(score !== undefined && { score: score !== '' ? parseFloat(score) : null }),
        ...(grade !== undefined && { grade }),
        ...(notes !== undefined && { notes }),
        ...(assessedBy && { assessedBy }),
        ...(date && { date: new Date(date) }),
      }
    });

    res.json({ success: true, message: 'Catatan muhafadzoh berhasil diperbarui', data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui catatan', error: err.message });
  }
};

// Hapus Catatan
exports.deleteAcademicRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.academicRecord.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Catatan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus catatan', error: err.message });
  }
};
