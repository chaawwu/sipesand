const prisma = require('../config/prisma');

// Ambil semua izin santri dengan filter
exports.getAllPermits = async (req, res) => {
  try {
    const { santriId, status, type, limit = 50 } = req.query;
    const where = {};

    if (santriId) {
      where.santriId = parseInt(santriId);
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const permits = await prisma.permit.findMany({
      where,
      orderBy: { departureTime: 'desc' },
      take: parseInt(limit),
      include: {
        santri: {
          select: {
            id: true,
            nama: true,
            nis: true,
            nfcUid: true,
            kelas: true,
            kamar: true,
            namaWali: true,
            noHpWali: true,
          },
        },
      },
    });

    // Otomatis cek keterlambatan jika status masih ACTIVE dan returnTime sudah lewat
    const now = new Date();
    const updatedPermits = permits.map(permit => {
      let currentStatus = permit.status;
      if (currentStatus === 'ACTIVE' && new Date(permit.returnTime) < now) {
        currentStatus = 'OVERDUE';
      }
      return { ...permit, currentStatus };
    });

    res.json({ success: true, data: updatedPermits });
  } catch (error) {
    console.error('Error getAllPermits:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data perizinan santri', error: error.message });
  }
};

// Buat Pengajuan Izin Baru
exports.createPermit = async (req, res) => {
  try {
    const { santriId, nfcUid, type, reason, destination, departureTime, returnTime, approvedBy, notes, status } = req.body;

    if (!reason || !departureTime || !returnTime) {
      return res.status(400).json({ success: false, message: 'Alasan, waktu keberangkatan, dan estimasi waktu kembali wajib diisi' });
    }

    let targetSantriId = santriId ? parseInt(santriId) : null;

    if (!targetSantriId && nfcUid) {
      const santri = await prisma.santri.findUnique({ where: { nfcUid } });
      if (santri) targetSantriId = santri.id;
    }

    if (!targetSantriId) {
      return res.status(400).json({ success: false, message: 'Santri tidak ditemukan' });
    }

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const permitCode = `IZIN-${dateStr}-${randomSuffix}`;

    const newPermit = await prisma.permit.create({
      data: {
        permitCode,
        santriId: targetSantriId,
        type: type || 'HARIAN',
        reason,
        destination: destination || null,
        departureTime: new Date(departureTime),
        returnTime: new Date(returnTime),
        status: status || 'PENDING',
        approvedBy: approvedBy || null,
        notes: notes || null,
      },
      include: {
        santri: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Surat izin santri berhasil dibuat',
      data: newPermit,
    });
  } catch (error) {
    console.error('Error createPermit:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat surat perizinan', error: error.message });
  }
};

// Update Status Izin (Approval / Check-out / Check-in)
exports.updatePermitStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, approvedBy, notes, actualReturnTime } = req.body;

    const permit = await prisma.permit.findUnique({ where: { id } });
    if (!permit) {
      return res.status(404).json({ success: false, message: 'Data izin tidak ditemukan' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (notes !== undefined) updateData.notes = notes;

    if (status === 'RETURNED') {
      updateData.actualReturnTime = actualReturnTime ? new Date(actualReturnTime) : new Date();
    }

    const updated = await prisma.permit.update({
      where: { id },
      data: updateData,
      include: { santri: true },
    });

    res.json({
      success: true,
      message: `Status izin berhasil diperbarui menjadi ${status}`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updatePermitStatus:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui status izin', error: error.message });
  }
};

// Check-in Kepulangan Cepat via Tap NFC
exports.checkInByNfc = async (req, res) => {
  try {
    const { nfcUid } = req.body;

    if (!nfcUid) {
      return res.status(400).json({ success: false, message: 'NFC UID wajib disertakan' });
    }

    const santri = await prisma.santri.findUnique({ where: { nfcUid } });
    if (!santri) {
      return res.status(404).json({ success: false, message: 'Kartu NFC tidak terdaftar pada santri manapun' });
    }

    // Cari izin aktif dari santri ini
    const activePermit = await prisma.permit.findFirst({
      where: {
        santriId: santri.id,
        status: { in: ['ACTIVE', 'APPROVED'] },
      },
      orderBy: { departureTime: 'desc' },
    });

    if (!activePermit) {
      return res.status(404).json({
        success: false,
        message: `Tidak ada catatan izin aktif/disetujui untuk ${santri.nama}`,
      });
    }

    const now = new Date();
    const isLate = now > new Date(activePermit.returnTime);

    const updated = await prisma.permit.update({
      where: { id: activePermit.id },
      data: {
        status: 'RETURNED',
        actualReturnTime: now,
        notes: activePermit.notes
          ? `${activePermit.notes} | Check-in NFC: ${isLate ? 'TERLAMBAT' : 'Tepat Waktu'}`
          : `Check-in NFC: ${isLate ? 'TERLAMBAT' : 'Tepat Waktu'}`,
      },
      include: { santri: true },
    });

    res.json({
      success: true,
      message: isLate
        ? `Santri ${santri.nama} berhasil check-in (Status: Terlambat kembali)`
        : `Santri ${santri.nama} berhasil check-in tepat waktu`,
      data: {
        permit: updated,
        isLate,
      },
    });
  } catch (error) {
    console.error('Error checkInByNfc:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses check-in NFC', error: error.message });
  }
};
