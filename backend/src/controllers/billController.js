const prisma = require('../config/prisma');

// Helper untuk menghitung Bulan Hijriyah saat ini
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi\'ul Awwal', 'Rabi\'ul Akhir',
  'Jumadil Ula', 'Jumadil Akhirah', 'Rajab', 'Sya\'ban',
  'Ramadhan', 'Syawwal', 'Dzulqa\'dah', 'Dzulhijjah'
];

function getCurrentHijriInfo() {
  try {
    const today = new Date();
    // Menggunakan Intl Hijri formatter bawaan Node.js
    const formatter = new Intl.DateTimeFormat('id-TN-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(today);
    let day = 1, month = 9, year = 1447; // default Ramadhan 1447 H

    parts.forEach(p => {
      if (p.type === 'day') day = parseInt(p.value) || 1;
      if (p.type === 'month') month = parseInt(p.value) || 9;
      if (p.type === 'year') year = parseInt(p.value) || 1447;
    });

    const monthIndex = Math.max(0, Math.min(11, month - 1));
    const monthName = HIJRI_MONTHS[monthIndex];
    return {
      day,
      monthIndex,
      monthName,
      year: `${year} H`,
      fullTitle: `${monthName} ${year} H`
    };
  } catch (e) {
    return {
      day: 1,
      monthIndex: 8,
      monthName: 'Ramadhan',
      year: '1447 H',
      fullTitle: 'Ramadhan 1447 H'
    };
  }
}

// 1. Ambil Semua Master Tagihan
exports.getMasterBills = async (req, res) => {
  try {
    const masters = await prisma.masterBill.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { bills: true } }
      }
    });
    res.json({ success: true, data: masters });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil master tagihan', error: err.message });
  }
};

// 2. Buat Master Tagihan Baru
exports.createMasterBill = async (req, res) => {
  try {
    const { name, amount, type, description } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ success: false, message: 'Nama dan nominal tagihan wajib diisi' });
    }

    const master = await prisma.masterBill.create({
      data: {
        name,
        amount: parseFloat(amount),
        type: type || 'BULANAN_HIJRIYAH',
        description: description || null,
        isActive: true,
      }
    });
    res.status(201).json({ success: true, message: 'Master tagihan berhasil dibuat', data: master });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat master tagihan', error: err.message });
  }
};

// 3. Update Master Tagihan
exports.updateMasterBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, type, description, isActive } = req.body;

    const master = await prisma.masterBill.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(type && { type }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      }
    });
    res.json({ success: true, message: 'Master tagihan berhasil diperbarui', data: master });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui master tagihan', error: err.message });
  }
};

// 4. Hapus Master Tagihan
exports.deleteMasterBill = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.masterBill.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Master tagihan berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus master tagihan', error: err.message });
  }
};

// 5. Ambil Daftar Semua Tagihan Santri
exports.getSantriBills = async (req, res) => {
  try {
    const { status, santriId, hijriMonth, hijriYear } = req.query;

    const where = {};
    if (status) where.status = status;
    if (santriId) where.santriId = parseInt(santriId);
    if (hijriMonth) where.hijriMonth = hijriMonth;
    if (hijriYear) where.hijriYear = hijriYear;

    const bills = await prisma.santriBill.findMany({
      where,
      include: {
        santri: true,
        masterBill: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil tagihan santri', error: err.message });
  }
};

// 6. Generate Tagihan Massal Manual
exports.generateMassBills = async (req, res) => {
  try {
    const { santriIds, masterBillId, hijriMonth, hijriYear, dueDate, customTitle, customAmount } = req.body;

    if (!santriIds || !Array.isArray(santriIds) || santriIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Pilih minimal satu santri untuk di-generate' });
    }

    let title = customTitle;
    let amount = customAmount ? parseFloat(customAmount) : 0;
    let master = null;

    if (masterBillId) {
      master = await prisma.masterBill.findUnique({ where: { id: parseInt(masterBillId) } });
      if (master) {
        title = title || `${master.name} - ${hijriMonth || ''} ${hijriYear || '1448 H'}`.trim();
        amount = amount || master.amount;
      }
    }

    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Judul dan nominal tagihan wajib diisi' });
    }

    const generatedBills = [];
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 0; i < santriIds.length; i++) {
      const sId = parseInt(santriIds[i]);
      const billCode = `BILL-${hijriMonth ? hijriMonth.slice(0,3).toUpperCase() : 'GEN'}-${timestamp}-${i+1}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBill = await prisma.santriBill.create({
        data: {
          billCode,
          santriId: sId,
          masterBillId: masterBillId ? parseInt(masterBillId) : null,
          title,
          amount,
          hijriMonth: hijriMonth || 'Muharram',
          hijriYear: hijriYear || '1448 H',
          dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30*24*60*60*1000),
          status: 'UNPAID',
        }
      });
      generatedBills.push(newBill);
    }

    res.status(201).json({
      success: true,
      message: `Berhasil generate ${generatedBills.length} tagihan santri massal`,
      data: generatedBills
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal generate tagihan massal', error: err.message });
  }
};

// 7. Auto-Generate Tagihan Otomatis Setiap 1 Hijriyah untuk Seluruh Santri Aktif
exports.autoGenerateMonthlyHijriBills = async (req, res) => {
  try {
    const hijriInfo = getCurrentHijriInfo();
    const targetMonth = req?.body?.hijriMonth || hijriInfo.monthName;
    const targetYear = req?.body?.hijriYear || hijriInfo.year;

    // Ambil master tagihan bulanan default (Syahriyah)
    let defaultMaster = await prisma.masterBill.findFirst({
      where: {
        OR: [
          { type: 'BULANAN_HIJRIYAH' },
          { name: { contains: 'Syahriyah' } },
          { name: { contains: 'SPP' } },
        ],
        isActive: true,
      }
    });

    if (!defaultMaster) {
      defaultMaster = await prisma.masterBill.create({
        data: {
          name: 'SPP Syahriyah Pesantren Terpadu',
          amount: 1200000,
          type: 'BULANAN_HIJRIYAH',
          description: 'Tagihan rutin bulanan syahriyah santri terpadu',
          isActive: true
        }
      });
    }

    // Ambil semua santri aktif
    const activeSantri = await prisma.santri.findMany({
      where: { status: 'AKTIF' }
    });

    const generated = [];
    const skipped = [];
    const timestamp = Date.now().toString().slice(-4);

    for (let i = 0; i < activeSantri.length; i++) {
      const s = activeSantri[i];

      // Cek apakah santri sudah memiliki tagihan untuk bulan Hijriyah ini
      const existing = await prisma.santriBill.findFirst({
        where: {
          santriId: s.id,
          hijriMonth: targetMonth,
          hijriYear: targetYear,
          masterBillId: defaultMaster.id,
        }
      });

      if (existing) {
        skipped.push({ santriId: s.id, nama: s.nama, reason: 'Sudah memiliki tagihan bulan ini' });
      } else {
        const billCode = `SYH-${targetMonth.slice(0,3).toUpperCase()}-${timestamp}-${i+1}-${Math.floor(1000 + Math.random() * 9000)}`;
        const newBill = await prisma.santriBill.create({
          data: {
            billCode,
            santriId: s.id,
            masterBillId: defaultMaster.id,
            title: `${defaultMaster.name} - ${targetMonth} ${targetYear}`,
            amount: defaultMaster.amount,
            hijriMonth: targetMonth,
            hijriYear: targetYear,
            dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // Batas 25 hari
            status: 'UNPAID',
          }
        });
        generated.push(newBill);
      }
    }

    const responsePayload = {
      success: true,
      message: `Auto-Tagihan 1 Hijriyah (${targetMonth} ${targetYear}): Diterbitkan untuk ${generated.length} santri (${skipped.length} santri dilewati karena sudah ada tagihan).`,
      hijriInfo,
      generatedCount: generated.length,
      skippedCount: skipped.length,
      data: generated
    };

    if (res) {
      res.json(responsePayload);
    }
    return responsePayload;
  } catch (err) {
    if (res) {
      res.status(500).json({ success: false, message: 'Gagal auto-generate tagihan Hijriyah', error: err.message });
    }
    console.error('Error autoGenerateMonthlyHijriBills:', err);
  }
};

// 8. Update / Edit Tagihan Santri
exports.updateSantriBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, hijriMonth, hijriYear, dueDate, status, notes } = req.body;

    const bill = await prisma.santriBill.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(hijriMonth && { hijriMonth }),
        ...(hijriYear && { hijriYear }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      }
    });

    res.json({ success: true, message: 'Tagihan santri berhasil diperbarui', data: bill });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui tagihan santri', error: err.message });
  }
};

// 9. Hapus Tagihan Santri
exports.deleteSantriBill = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.santriBill.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Tagihan santri berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus tagihan santri', error: err.message });
  }
};

// 10. Bayar Lewat Web (Upload Bukti Transfer oleh Wali Santri - Mendukung Tunggal & Banyak Tagihan Sekaligus)
exports.payOnline = async (req, res) => {
  try {
    const { billId, billIds, paymentMethod, proofImage, notes } = req.body;

    // Normalisasi ID tagihan (mendukung billId tunggal ataupun array billIds)
    const targetIds = [];
    if (billId) targetIds.push(parseInt(billId));
    if (Array.isArray(billIds)) {
      billIds.forEach(id => {
        if (id && !targetIds.includes(parseInt(id))) targetIds.push(parseInt(id));
      });
    }

    if (targetIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Silakan pilih tagihan yang ingin dibayar' });
    }

    const updatedBills = [];
    for (const id of targetIds) {
      const existing = await prisma.santriBill.findUnique({ where: { id } });
      if (existing) {
        const updated = await prisma.santriBill.update({
          where: { id },
          data: {
            status: 'PENDING_VERIFICATION',
            paymentMethod: paymentMethod || 'TRANSFER_BSI',
            paymentDate: new Date(),
            proofImage: proofImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
            notes: notes || 'Konfirmasi pembayaran dari Portal Wali online',
          }
        });
        updatedBills.push(updated);
      }
    }

    res.json({
      success: true,
      message: `Bukti transfer untuk ${updatedBills.length} tagihan berhasil dikirim! Status saat ini Menunggu Verifikasi Bendahara.`,
      data: updatedBills
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengirim pembayaran online', error: err.message });
  }
};

// 11. Verifikasi Pembayaran & Generate Kwitansi Resmi (Bendahara / Super Admin)
exports.verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { verifiedBy, notes } = req.body;

    const bill = await prisma.santriBill.findUnique({
      where: { id: parseInt(id) },
      include: { santri: true }
    });

    if (!bill) {
      return res.status(404).json({ success: false, message: 'Tagihan tidak ditemukan' });
    }

    const receiptNumber = `KWT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Tagihan ke status PAID
      const updatedBill = await tx.santriBill.update({
        where: { id: parseInt(id) },
        data: {
          status: 'PAID',
          verifiedBy: verifiedBy || 'Ustadz Ridwan, S.E. (Bendahara)',
          verifiedAt: new Date(),
          receiptNumber,
          notes: notes || bill.notes,
        }
      });

      // 2. Otomatis Catat Pemasukan Kas Umum Pesantren (General Ledger)
      const ledgerEntry = await tx.ledgerEntry.create({
        data: {
          txCode: `KAS-IN-${Date.now().toString().slice(-6)}`,
          date: new Date(),
          type: 'INCOME',
          category: 'SYAHRIYAH_SANTRI',
          amount: bill.amount,
          description: `Pembayaran ${bill.title} - Santri: ${bill.santri.nama} (${bill.santri.nis})`,
          recordedBy: verifiedBy || 'Bendahara Pesantren',
          accountType: 'BANK',
          proofUrl: bill.proofImage,
        }
      });

      return { updatedBill, ledgerEntry, receiptNumber };
    });

    res.json({
      success: true,
      message: `Tagihan berhasil diverifikasi Lunas! Kwitansi ${receiptNumber} telah diterbitkan dan tercatat di Kas Pesantren.`,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal verifikasi pembayaran', error: err.message });
  }
};

// 12. Ambil Semua Riwayat Kwitansi Pembayaran Resmi
exports.getReceipts = async (req, res) => {
  try {
    const paidBills = await prisma.santriBill.findMany({
      where: { status: 'PAID' },
      include: {
        santri: true,
        masterBill: true,
      },
      orderBy: { verifiedAt: 'desc' }
    });

    const receipts = paidBills.map(b => ({
      id: b.id,
      receiptNumber: b.receiptNumber || `KWT-${b.billCode}`,
      billCode: b.billCode,
      title: b.title,
      amount: b.amount,
      paymentMethod: b.paymentMethod,
      paymentDate: b.paymentDate || b.updatedAt,
      verifiedBy: b.verifiedBy,
      verifiedAt: b.verifiedAt,
      santriName: b.santri.nama,
      santriNis: b.santri.nis,
      santriKelas: b.santri.kelas,
      santriKamar: b.santri.kamar,
      namaWali: b.santri.namaWali,
    }));

    res.json({ success: true, data: receipts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat kwitansi', error: err.message });
  }
};
