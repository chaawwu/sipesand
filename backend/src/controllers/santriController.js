const prisma = require('../config/prisma');

// Mendapatkan semua santri dengan search & filter
exports.getAllSantri = async (req, res) => {
  try {
    const { search, kelas, status } = req.query;
    const where = {};

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { nis: { contains: search } },
        { nfcUid: { contains: search } },
        { kamar: { contains: search } },
        { alamat: { contains: search } },
        { namaWali: { contains: search } },
      ];
    }

    if (kelas) {
      where.kelas = { contains: kelas };
    }

    if (status) {
      where.status = status;
    }

    const santriList = await prisma.santri.findMany({
      where,
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: {
            pocketTxs: true,
            permits: true,
            bills: true,
            academics: true,
            violations: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: santriList,
    });
  } catch (error) {
    console.error('Error getAllSantri:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data santri', error: error.message });
  }
};

// Detail Santri berdasarkan ID beserta seluruh relasi lengkap
exports.getSantriById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const santri = await prisma.santri.findUnique({
      where: { id },
      include: {
        pocketTxs: {
          orderBy: { createdAt: 'desc' },
          take: 15,
        },
        permits: {
          orderBy: { departureTime: 'desc' },
          take: 10,
        },
        bills: {
          orderBy: { createdAt: 'desc' },
          include: { masterBill: true },
        },
        academics: {
          orderBy: { date: 'desc' },
        },
        violations: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: 'Santri tidak ditemukan' });
    }

    res.json({ success: true, data: santri });
  } catch (error) {
    console.error('Error getSantriById:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil detail santri', error: error.message });
  }
};

// Scan / Lookup Santri via NFC UID
exports.getSantriByNfc = async (req, res) => {
  try {
    const { nfcUid } = req.params;
    const santri = await prisma.santri.findUnique({
      where: { nfcUid },
      include: {
        pocketTxs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        permits: {
          orderBy: { departureTime: 'desc' },
          take: 5,
        },
        bills: {
          where: { status: 'UNPAID' },
        }
      },
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: 'Kartu NFC tidak terdaftar pada santri manapun' });
    }

    res.json({ success: true, data: santri });
  } catch (error) {
    console.error('Error getSantriByNfc:', error);
    res.status(500).json({ success: false, message: 'Gagal memindai kartu NFC', error: error.message });
  }
};

// Tambah Santri Baru
exports.createSantri = async (req, res) => {
  try {
    const { nis, nfcUid, nama, gender, kelas, kamar, alamat, namaWali, noHpWali, saldo_saku, status, foto } = req.body;

    if (!nama) {
      return res.status(400).json({ success: false, message: 'Nama santri wajib diisi' });
    }

    if (nis) {
      const existingNis = await prisma.santri.findUnique({ where: { nis } });
      if (existingNis) {
        return res.status(400).json({ success: false, message: 'NIS sudah digunakan' });
      }
    }

    if (nfcUid) {
      const existingNfc = await prisma.santri.findUnique({ where: { nfcUid } });
      if (existingNfc) {
        return res.status(400).json({ success: false, message: 'NFC UID sudah terdaftar pada santri lain' });
      }
    }

    const newSantri = await prisma.santri.create({
      data: {
        nis: nis || null,
        nfcUid: nfcUid || null,
        nama,
        gender: gender || 'L',
        kelas: kelas || null,
        kamar: kamar || null,
        alamat: alamat || null,
        namaWali: namaWali || null,
        noHpWali: noHpWali || null,
        saldo_saku: saldo_saku ? parseFloat(saldo_saku) : 0,
        status: status || 'AKTIF',
        foto: foto || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Santri berhasil ditambahkan',
      data: newSantri,
    });
  } catch (error) {
    console.error('Error createSantri:', error);
    res.status(500).json({ success: false, message: 'Gagal menambahkan data santri', error: error.message });
  }
};

// Update Santri
exports.updateSantri = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nis, nfcUid, nama, gender, kelas, kamar, alamat, namaWali, noHpWali, saldo_saku, status, foto } = req.body;

    const existing = await prisma.santri.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Santri tidak ditemukan' });
    }

    const updatedSantri = await prisma.santri.update({
      where: { id },
      data: {
        ...(nis !== undefined && { nis: nis || null }),
        ...(nfcUid !== undefined && { nfcUid: nfcUid || null }),
        ...(nama && { nama }),
        ...(gender && { gender }),
        ...(kelas !== undefined && { kelas }),
        ...(kamar !== undefined && { kamar }),
        ...(alamat !== undefined && { alamat }),
        ...(namaWali !== undefined && { namaWali }),
        ...(noHpWali !== undefined && { noHpWali }),
        ...(saldo_saku !== undefined && { saldo_saku: parseFloat(saldo_saku) }),
        ...(status && { status }),
        ...(foto !== undefined && { foto }),
      },
    });

    res.json({
      success: true,
      message: 'Data santri berhasil diperbarui',
      data: updatedSantri,
    });
  } catch (error) {
    console.error('Error updateSantri:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data santri', error: error.message });
  }
};

// Hapus Santri
exports.deleteSantri = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.santri.delete({ where: { id } });
    res.json({ success: true, message: 'Data santri berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteSantri:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data santri', error: error.message });
  }
};

// Transmigrasi / Import Data dari Firebase (JSON Payload)
exports.importFromFirebase = async (req, res) => {
  try {
    const { data } = req.body; // Bisa array of santri atau objek map firebase { key1: { nama, nis, ... }, key2: { ... } }
    if (!data) {
      return res.status(400).json({ success: false, message: 'Data JSON Firebase tidak boleh kosong' });
    }

    const rawList = Array.isArray(data) ? data : Object.values(data);
    if (rawList.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada data valid yang dapat diimpor' });
    }

    let successCount = 0;
    let skippedCount = 0;
    const imported = [];

    for (const item of rawList) {
      const nama = item.nama || item.name || item.fullName;
      if (!nama) {
        skippedCount++;
        continue;
      }

      const nis = item.nis || item.studentId || item.idNumber || null;
      const nfcUid = item.nfcUid || item.rfid || item.cardUid || null;

      // Cek apakah santri dengan NIS atau Nama sudah ada
      let existing = null;
      if (nis) {
        existing = await prisma.santri.findUnique({ where: { nis } });
      }

      if (existing) {
        // Update data yang sudah ada
        const updated = await prisma.santri.update({
          where: { id: existing.id },
          data: {
            nama,
            kelas: item.kelas || item.class || existing.kelas,
            kamar: item.kamar || item.room || existing.kamar,
            alamat: item.alamat || item.address || existing.alamat,
            namaWali: item.namaWali || item.parentName || existing.namaWali,
            noHpWali: item.noHpWali || item.phone || existing.noHpWali,
            saldo_saku: item.saldo_saku !== undefined ? parseFloat(item.saldo_saku) : existing.saldo_saku,
          }
        });
        imported.push(updated);
        successCount++;
      } else {
        // Buat santri baru
        const created = await prisma.santri.create({
          data: {
            nama,
            nis: nis || `2026${Math.floor(10000 + Math.random() * 90000)}`,
            nfcUid: nfcUid || null,
            gender: item.gender === 'P' || item.gender === 'Perempuan' ? 'P' : 'L',
            kelas: item.kelas || item.class || '10 IPA (KMI 4)',
            kamar: item.kamar || item.room || 'Asrama Umar',
            alamat: item.alamat || item.address || 'Kompleks Pesantren',
            namaWali: item.namaWali || item.parentName || 'Wali Santri',
            noHpWali: item.noHpWali || item.phone || '08123456789',
            saldo_saku: item.saldo_saku ? parseFloat(item.saldo_saku) : 0,
            status: item.status || 'AKTIF',
            foto: item.foto || item.photoUrl || null,
          }
        });
        imported.push(created);
        successCount++;
      }
    }

    res.json({
      success: true,
      message: `Transmigrasi Data Firebase Selesai! Berhasil mengimpor/memperbarui ${successCount} santri (${skippedCount} dilewati).`,
      importedCount: successCount,
      data: imported
    });
  } catch (error) {
    console.error('Error importFromFirebase:', error);
    res.status(500).json({ success: false, message: 'Gagal mengimpor data dari Firebase', error: error.message });
  }
};

// Export Data Santri (JSON)
exports.exportSantriData = async (req, res) => {
  try {
    const santriList = await prisma.santri.findMany({
      include: {
        bills: true,
        academics: true,
        violations: true,
        pocketTxs: true,
        permits: true,
      }
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sipesand_santri_export_${Date.now()}.json`);
    res.json(santriList);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data santri', error: error.message });
  }
};
