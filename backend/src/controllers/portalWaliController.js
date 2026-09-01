const prisma = require('../config/prisma');

// 1. Ambil Informasi Lengkap Santri untuk Portal Wali & Sistem Pelacakan Real-Time
exports.getSantriPortalData = async (req, res) => {
  try {
    let { query } = req.params;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Masukkan NIS, Nama, atau ID Santri' });
    }

    query = query.trim();
    const isNumeric = /^\d+$/.test(query);

    const santri = await prisma.santri.findFirst({
      where: {
        OR: [
          { nis: query },
          { nfcUid: query },
          ...(isNumeric ? [{ id: parseInt(query) }] : []),
          { nama: { contains: query } },
        ]
      },
      include: {
        pocketTxs: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        permits: {
          orderBy: { departureTime: 'desc' },
          take: 15,
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
      }
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: `Data santri "${query}" tidak ditemukan` });
    }

    // Ambil Info Rekening & QRIS dari Settings
    const settingsList = await prisma.systemSetting.findMany();
    const settings = {};
    settingsList.forEach(s => { settings[s.key] = s.value; });

    // Hitung status keberadaan santri real-time
    const now = new Date();
    const activePermit = santri.permits.find(
      p => p.status === 'ACTIVE' || (p.status === 'APPROVED' && new Date(p.departureTime) <= now && (!p.actualReturnTime))
    );

    let locationStatus = 'DI_PESANTREN';
    let locationLabel = 'Berada di Kompleks Pesantren';
    let isOverdue = false;

    if (activePermit) {
      if (now > new Date(activePermit.returnTime)) {
        locationStatus = 'OVERDUE';
        locationLabel = `Terlambat Kembali (Batas: ${new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`;
        isOverdue = true;
      } else {
        locationStatus = 'IZIN_KELUAR';
        locationLabel = `Sedang Izin: ${activePermit.reason} (Kembali: ${new Date(activePermit.returnTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })})`;
      }
    }

    // Hitung ringkasan tagihan
    const unpaidBills = santri.bills.filter(b => b.status === 'UNPAID');
    const pendingBills = santri.bills.filter(b => b.status === 'PENDING_VERIFICATION');
    const paidBills = santri.bills.filter(b => b.status === 'PAID');
    const totalTunggakan = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

    res.json({
      success: true,
      data: {
        santri: {
          id: santri.id,
          nis: santri.nis,
          nfcUid: santri.nfcUid,
          nama: santri.nama,
          gender: santri.gender,
          kelas: santri.kelas,
          kamar: santri.kamar,
          alamat: santri.alamat,
          namaWali: santri.namaWali,
          noHpWali: santri.noHpWali,
          saldo_saku: santri.saldo_saku,
          foto: santri.foto,
          status: santri.status,
        },
        location: {
          status: locationStatus,
          label: locationLabel,
          isOverdue,
          activePermit: activePermit || null,
        },
        financial: {
          saldoSaku: santri.saldo_saku,
          totalTunggakan,
          unpaidCount: unpaidBills.length,
          pendingCount: pendingBills.length,
          paidCount: paidBills.length,
          bills: santri.bills,
          recentPocketTxs: santri.pocketTxs,
        },
        academics: santri.academics,
        violations: santri.violations,
        permits: santri.permits,
        bills: santri.bills,
        paymentInfo: {
          bankName: settings.BANK_NAME || 'Bank Syariah Indonesia (BSI)',
          accountNo: settings.BANK_ACCOUNT_NO || '7192837465',
          accountHolder: settings.BANK_ACCOUNT_HOLDER || 'YAYASAN SIPESAND TERPADU',
          qrisUrl: settings.QRIS_PAYMENT_URL || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80',
          whatsappCenter: settings.WHATSAPP_CENTER || '0812-3456-7890',
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data portal santri', error: err.message });
  }
};

// 2. Ambil Tagihan Santri Berdasarkan Query
exports.getSantriBillsByQuery = async (req, res) => {
  try {
    let { query } = req.params;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Parameter query santri dibutuhkan' });
    }

    query = query.trim();
    const isNumeric = /^\d+$/.test(query);

    const santri = await prisma.santri.findFirst({
      where: {
        OR: [
          { nis: query },
          { nfcUid: query },
          ...(isNumeric ? [{ id: parseInt(query) }] : []),
          { nama: { contains: query } },
        ]
      }
    });

    if (!santri) {
      return res.status(404).json({ success: false, message: 'Santri tidak ditemukan', data: [] });
    }

    const bills = await prisma.santriBill.findMany({
      where: { santriId: santri.id },
      include: { masterBill: true, santri: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, data: bills });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil tagihan santri', error: err.message });
  }
};
