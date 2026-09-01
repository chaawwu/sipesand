const prisma = require('../config/prisma');

// Ambil semua transaksi uang saku dengan filter
exports.getAllTransactions = async (req, res) => {
  try {
    const { santriId, type, limit = 50 } = req.query;
    const where = {};

    if (santriId) {
      where.santriId = parseInt(santriId);
    }

    if (type) {
      where.type = type;
    }

    const txs = await prisma.pocketTx.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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
          },
        },
      },
    });

    res.json({ success: true, data: txs });
  } catch (error) {
    console.error('Error getAllTransactions:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat transaksi uang saku', error: error.message });
  }
};

// Buat Transaksi Uang Saku Umum (TOPUP, PURCHASE, WITHDRAW) dengan Custom Date
exports.createTransaction = async (req, res) => {
  try {
    const { santriId, nfcUid, type, amount, description, merchant, date, isEmergency } = req.body;

    if (!type || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Tipe dan jumlah nominal transaksi harus valid (> 0)' });
    }

    const parsedAmount = parseFloat(amount);

    // Cari santri via ID atau nfcUid
    let santri;
    if (santriId) {
      santri = await prisma.santri.findUnique({ where: { id: parseInt(santriId) } });
    } else if (nfcUid) {
      santri = await prisma.santri.findUnique({ where: { nfcUid } });
    }

    if (!santri) {
      return res.status(404).json({ success: false, message: 'Santri tidak ditemukan / kartu NFC belum terdaftar' });
    }

    const currentBalance = santri.saldo_saku;
    let newBalance = currentBalance;

    if (type === 'TOPUP') {
      newBalance = currentBalance + parsedAmount;
    } else if (type === 'PURCHASE' || type === 'WITHDRAW') {
      if (currentBalance < parsedAmount && !isEmergency) {
        return res.status(400).json({
          success: false,
          isInsufficient: true,
          currentBalance,
          shortage: Math.abs(currentBalance - parsedAmount),
          message: `Saldo tidak mencukupi. Saldo saat ini: Rp ${currentBalance.toLocaleString('id-ID')}, dibutuhkan: Rp ${parsedAmount.toLocaleString('id-ID')}. Aktifkan mode darurat untuk mencatat minus.`,
        });
      }
      newBalance = currentBalance - parsedAmount;
    } else {
      return res.status(400).json({ success: false, message: 'Tipe transaksi tidak valid. Gunakan TOPUP, PURCHASE, atau WITHDRAW' });
    }

    // Buat kode transaksi unik
    const txDate = date ? new Date(date) : new Date();
    const dateStr = txDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const txCode = `TX-${dateStr}-${randomSuffix}`;

    let finalDesc = description || (type === 'TOPUP' ? 'Isi Saldo Uang Saku' : type === 'PURCHASE' ? 'Belanja Kantin' : 'Tarik Tunai');
    if (newBalance < 0) {
      finalDesc = `[MINUS / TALANGAN] ${finalDesc}`;
    }

    // Eksekusi update saldo dan insert transaksi secara atomik (Transaction)
    const [txRecord, updatedSantri] = await prisma.$transaction([
      prisma.pocketTx.create({
        data: {
          txCode,
          santriId: santri.id,
          type,
          amount: parsedAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: finalDesc,
          merchant: merchant || (type === 'TOPUP' ? 'Admin Keuangan' : 'Kantin Pesantren'),
          createdAt: txDate,
        },
      }),
      prisma.santri.update({
        where: { id: santri.id },
        data: { saldo_saku: newBalance },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: `Transaksi ${type} berhasil diproses${newBalance < 0 ? ' (Saldo Minus Tercatat)' : ''}`,
      data: {
        transaction: txRecord,
        santri: {
          id: updatedSantri.id,
          nama: updatedSantri.nama,
          saldo_saku: updatedSantri.saldo_saku,
        },
      },
    });
  } catch (error) {
    console.error('Error createTransaction:', error);
    res.status(500).json({ success: false, message: 'Gagal memproses transaksi uang saku', error: error.message });
  }
};

// API Khusus Pemotongan Saldo via Scan NFC / ID oleh Pengurus Terotorisasi
exports.deductSantriBalance = async (req, res) => {
  try {
    const { santriId, nfcUid, amount, description, merchant, isEmergency, date, notes } = req.body;
    const pengurus = req.pengurus; // Didapat dari middleware verifyPengurusAuth

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Nominal potongan saldo harus lebih dari Rp 0',
      });
    }

    const parsedAmount = parseFloat(amount);

    let santri;
    if (nfcUid) {
      santri = await prisma.santri.findUnique({ where: { nfcUid } });
    } else if (santriId) {
      santri = await prisma.santri.findUnique({ where: { id: parseInt(santriId) } });
    }

    if (!santri) {
      return res.status(404).json({
        success: false,
        message: nfcUid
          ? `Kartu NFC '${nfcUid}' tidak terdaftar pada santri manapun!`
          : 'Data santri tidak ditemukan!',
      });
    }

    const currentBalance = santri.saldo_saku;
    let newBalance = currentBalance - parsedAmount;
    const isOverdraft = newBalance < 0;

    if (isOverdraft && !isEmergency) {
      return res.status(400).json({
        success: false,
        isInsufficient: true,
        currentBalance,
        requiredAmount: parsedAmount,
        shortage: Math.abs(newBalance),
        message: `Saldo santri tidak mencukupi! Saldo saat ini: Rp ${currentBalance.toLocaleString('id-ID')}, Dibutuhkan: Rp ${parsedAmount.toLocaleString('id-ID')} (Kurang: Rp ${Math.abs(newBalance).toLocaleString('id-ID')}). Aktifkan 'Otorisasi Darurat' jika ingin mencatat saldo talangan minus.`,
      });
    }

    const txDate = date ? new Date(date) : new Date();
    const dateStr = txDate.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const txCode = `DED-${dateStr}-${randomSuffix}`;

    let finalDesc = description || 'Pemotongan Saldo Uang Saku';
    if (isOverdraft) {
      finalDesc = `[DARURAT / TALANGAN MINUS] ${finalDesc}`;
    }

    const finalMerchant = merchant || `Kasir Pesantren (${pengurus?.name || 'Petugas'})`;

    const [txRecord, updatedSantri] = await prisma.$transaction([
      prisma.pocketTx.create({
        data: {
          txCode,
          santriId: santri.id,
          type: 'PURCHASE',
          amount: parsedAmount,
          balanceBefore: currentBalance,
          balanceAfter: newBalance,
          description: finalDesc,
          merchant: finalMerchant,
          createdAt: txDate,
        },
      }),
      prisma.santri.update({
        where: { id: santri.id },
        data: { saldo_saku: newBalance },
      }),
    ]);

    res.status(201).json({
      success: true,
      message: isOverdraft
        ? `Potongan saldo darurat berhasil diproses oleh ${pengurus?.name}. Saldo saat ini menjadi MINUS (Rp ${newBalance.toLocaleString('id-ID')}).`
        : `Potongan saldo sebesar Rp ${parsedAmount.toLocaleString('id-ID')} berhasil diproses.`,
      data: {
        transaction: txRecord,
        santri: {
          id: updatedSantri.id,
          nama: updatedSantri.nama,
          nis: updatedSantri.nis,
          nfcUid: updatedSantri.nfcUid,
          kelas: updatedSantri.kelas,
          kamar: updatedSantri.kamar,
          saldo_saku: updatedSantri.saldo_saku,
        },
        pengurus: {
          name: pengurus?.name,
          role: pengurus?.role,
        },
        isOverdraft,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      },
    });
  } catch (error) {
    console.error('Error deductSantriBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pemotongan saldo uang saku',
      error: error.message,
    });
  }
};
