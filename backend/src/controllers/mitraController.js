const prisma = require('../config/prisma');
const { provisionNewTenant } = require('../services/tenantProvisioner');
const { sendTenantWelcomeEmail } = require('../services/mailerService');

// 0. Cek Ketersediaan Subdomain Real-time (Deteksi jika sudah terdaftar)
exports.checkSubdomainAvailability = async (req, res) => {
  try {
    const { subdomain } = req.params;
    if (!subdomain) {
      return res.status(400).json({ success: false, message: 'Subdomain wajib disertakan.' });
    }

    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (cleanSubdomain.length < 3) {
      return res.json({
        success: true,
        available: false,
        reason: 'TOO_SHORT',
        message: 'Subdomain minimal 3 karakter alfanumerik.',
      });
    }

    // Cek di MitraAktif (Akun yang sudah terdaftar & aktif)
    const existingActive = await prisma.mitraAktif.findUnique({
      where: { subdomain: cleanSubdomain },
    });

    if (existingActive) {
      return res.json({
        success: true,
        available: false,
        reason: 'ALREADY_REGISTERED',
        message: `Subdomain "${cleanSubdomain}.sipesand.web.id" sudah terdaftar & aktif digunakan.`,
      });
    }

    // Cek di MitraPending yang belum kadaluarsa
    const existingPending = await prisma.mitraPending.findFirst({
      where: {
        subdomain: cleanSubdomain,
        status: 'PENDING',
        expiredAt: { gt: new Date() },
      },
    });

    if (existingPending) {
      return res.json({
        success: true,
        available: false,
        reason: 'PENDING_CHECKOUT',
        message: `Subdomain "${cleanSubdomain}.sipesand.web.id" sedang dalam proses checkout aktif.`,
        orderId: existingPending.orderId,
      });
    }

    return res.json({
      success: true,
      available: true,
      subdomain: cleanSubdomain,
      url: `https://${cleanSubdomain}.sipesand.web.id`,
      message: `Subdomain "${cleanSubdomain}.sipesand.web.id" tersedia untuk didaftarkan!`,
    });
  } catch (err) {
    console.error('Error checkSubdomainAvailability:', err);
    res.status(500).json({ success: false, message: 'Gagal mengecek ketersediaan subdomain.', error: err.message });
  }
};

// 1. Pendaftaran Mitra Baru & Pembuatan Invoice Payment Gateway
exports.registerMitra = async (req, res) => {
  try {
    const { namaPondok, subdomain, namaPengelola, email, noWhatsapp, packageType } = req.body;

    if (!namaPondok || !subdomain || !namaPengelola || !email || !noWhatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Semua field formulir pendaftaran wajib diisi lengkap.',
      });
    }

    // Normalisasi Subdomain (huruf kecil, hanya huruf, angka, dan tanda hubung)
    const cleanSubdomain = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (cleanSubdomain.length < 3 || cleanSubdomain.length > 30) {
      return res.status(400).json({
        success: false,
        message: 'Subdomain minimal 3 karakter dan maksimal 30 karakter alfanumerik.',
      });
    }

    // Cek apakah subdomain sudah terdaftar di MitraAktif
    const existingActive = await prisma.mitraAktif.findUnique({
      where: { subdomain: cleanSubdomain },
    });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        message: `Subdomain "${cleanSubdomain}.sipesand.web.id" sudah terdaftar dan aktif. Silakan pilih subdomain lain.`,
      });
    }

    // Cek apakah subdomain sedang pending pembayaran belum kadaluarsa
    const existingPending = await prisma.mitraPending.findFirst({
      where: {
        subdomain: cleanSubdomain,
        status: 'PENDING',
        expiredAt: { gt: new Date() },
      },
    });
    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: `Subdomain "${cleanSubdomain}" sedang dalam proses checkout aktif. Silakan selesaikan invoice sebelumnya.`,
        orderId: existingPending.orderId,
      });
    }

    // Tentukan biaya lisensi berdasarkan paket
    const pkg = packageType === 'LIFETIME' ? 'LIFETIME' : 'TAHUNAN';
    const amount = pkg === 'LIFETIME' ? 3500000 : 1500000;

    // Generate Mock Payment Gateway (Xendit / Midtrans / King Digital Payment Logic)
    const timestamp = Date.now().toString();
    const orderId = `KGD-ORD-${cleanSubdomain.toUpperCase()}-${timestamp.slice(-6)}`;
    const vaNumber = `8809${timestamp.slice(-8)}`;
    const qrisString = `00020101021226580016ID.CO.KINGDIGITAL.WWW01189360099281928374655204581453033605407${amount}5802ID5915KING_DIGITAL_DEV6007BANDUNG61054011562070703A016304${orderId.slice(-4)}`;
    const qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisString)}`;
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Jam

    // Simpan ke Tabel MitraPending
    const pendingRecord = await prisma.mitraPending.create({
      data: {
        namaPondok,
        subdomain: cleanSubdomain,
        namaPengelola,
        email,
        noWhatsapp,
        packageType: pkg,
        amount,
        orderId,
        qrisUrl,
        qrisString,
        vaNumber,
        vaBank: 'Bank Syariah Indonesia (BSI)',
        status: 'PENDING',
        expiredAt,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran mitra berhasil dibuat. Silakan selesaikan pembayaran lisensi platform.',
      data: {
        orderId: pendingRecord.orderId,
        namaPondok: pendingRecord.namaPondok,
        subdomain: pendingRecord.subdomain,
        namaPengelola: pendingRecord.namaPengelola,
        email: pendingRecord.email,
        noWhatsapp: pendingRecord.noWhatsapp,
        packageType: pendingRecord.packageType,
        amount: pendingRecord.amount,
        qrisUrl: pendingRecord.qrisUrl,
        qrisString: pendingRecord.qrisString,
        vaNumber: pendingRecord.vaNumber,
        vaBank: pendingRecord.vaBank,
        status: pendingRecord.status,
        expiredAt: pendingRecord.expiredAt,
      },
    });
  } catch (err) {
    console.error('Error registerMitra:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses pendaftaran mitra baru.',
      error: err.message,
    });
  }
};

// 2. Status Order / Pengecekan Polling Real-time
exports.getMitraOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Parameter orderId wajib diisi.' });
    }

    const pending = await prisma.mitraPending.findUnique({
      where: { orderId },
    });

    if (!pending) {
      const active = await prisma.mitraAktif.findFirst({
        where: { subdomain: orderId.split('-')[2]?.toLowerCase() },
      });

      if (active) {
        return res.json({
          success: true,
          status: 'PAID',
          isProvisioned: true,
          data: active,
        });
      }

      return res.status(404).json({ success: false, message: 'Order pendaftaran tidak ditemukan.' });
    }

    const isExpired = new Date() > new Date(pending.expiredAt);
    if (isExpired && pending.status === 'PENDING') {
      await prisma.mitraPending.update({
        where: { id: pending.id },
        data: { status: 'EXPIRED' },
      });
      pending.status = 'EXPIRED';
    }

    const active = await prisma.mitraAktif.findUnique({
      where: { subdomain: pending.subdomain },
    });

    res.json({
      success: true,
      data: {
        ...pending,
        isProvisioned: !!active,
        activeData: active || null,
      },
    });
  } catch (err) {
    console.error('Error getMitraOrderStatus:', err);
    res.status(500).json({ success: false, message: 'Gagal mengambil status invoice.', error: err.message });
  }
};

// 3. Webhook Listener dari Payment Gateway (Otomatisasi Pembayaran & Auto-Provisioning)
exports.handlePaymentWebhook = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Field orderId wajib disertakan.' });
    }

    const pending = await prisma.mitraPending.findUnique({
      where: { orderId },
    });

    if (!pending) {
      return res.status(404).json({ success: false, message: `Invoice "${orderId}" tidak ditemukan.` });
    }

    const isPaid = status === 'PAID' || status === 'SETTLEMENT' || status === 'SUCCESS' || status === 'capture';

    if (!isPaid) {
      return res.json({
        success: true,
        message: `Status webhook diterima: ${status}. Menunggu status PAID.`,
      });
    }

    // 1. Update Status MitraPending
    await prisma.mitraPending.update({
      where: { id: pending.id },
      data: { status: 'PAID' },
    });

    // 2. Auto-Provisioning Database Tenant Baru
    const provisionResult = await provisionNewTenant({
      namaPondok: pending.namaPondok,
      subdomain: pending.subdomain,
      namaPengelola: pending.namaPengelola,
      email: pending.email,
      noWhatsapp: pending.noWhatsapp,
      packageType: pending.packageType,
    });

    // 3. Simpan Data ke Tabel Utama MitraAktif
    const activeMitra = await prisma.mitraAktif.upsert({
      where: { subdomain: pending.subdomain },
      update: {
        namaPondok: pending.namaPondok,
        namaPengelola: pending.namaPengelola,
        email: pending.email,
        noWhatsapp: pending.noWhatsapp,
        packageType: pending.packageType,
        amount: pending.amount,
        licenseKey: provisionResult.licenseKey,
        dbPath: provisionResult.dbPath,
        adminUsername: provisionResult.adminUsername,
        adminPasswordHash: provisionResult.passwordHash,
        status: 'ACTIVE',
        provisionedAt: new Date(),
      },
      create: {
        namaPondok: pending.namaPondok,
        subdomain: pending.subdomain,
        namaPengelola: pending.namaPengelola,
        email: pending.email,
        noWhatsapp: pending.noWhatsapp,
        packageType: pending.packageType,
        amount: pending.amount,
        licenseKey: provisionResult.licenseKey,
        dbPath: provisionResult.dbPath,
        adminUsername: provisionResult.adminUsername,
        adminPasswordHash: provisionResult.passwordHash,
        status: 'ACTIVE',
        provisionedAt: new Date(),
      },
    });

    // 4. Kirim Email Kredensial via Nodemailer
    await sendTenantWelcomeEmail({
      namaPondok: pending.namaPondok,
      subdomain: pending.subdomain,
      namaPengelola: pending.namaPengelola,
      email: pending.email,
      adminUsername: provisionResult.adminUsername,
      tempPassword: provisionResult.tempPassword,
      licenseKey: provisionResult.licenseKey,
      packageType: pending.packageType,
    });

    res.json({
      success: true,
      message: `Pembayaran ${orderId} berhasil diproses! Instans ${pending.subdomain}.sipesand.web.id telah aktif dan email kredensial telah dikirim ke ${pending.email}.`,
      data: {
        subdomain: pending.subdomain,
        tenantUrl: `https://${pending.subdomain}.sipesand.web.id/login`,
        adminUsername: provisionResult.adminUsername,
        tempPassword: provisionResult.tempPassword,
        licenseKey: provisionResult.licenseKey,
        activeMitra,
      },
    });
  } catch (err) {
    console.error('[WEBHOOK ERROR]:', err);
    res.status(500).json({
      success: false,
      message: 'Gagal memproses webhook pembayaran dan auto-provisioning.',
      error: err.message,
    });
  }
};

// 4. Endpoint Simulasi Pembayaran Berhasil (Untuk Pengujian Instan UI Demo)
exports.simulatePaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;
    req.body = {
      orderId,
      status: 'PAID',
      paymentMethod: 'QRIS_SIMULATOR',
      transactionTime: new Date().toISOString(),
    };
    return exports.handlePaymentWebhook(req, res);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal simulasi pembayaran', error: err.message });
  }
};

// 5. Konfigurasi King Digital Payment Gateway & Auto-Disbursement (Pengaturan Tenant)
exports.updateKingDigitalPgConfig = async (req, res) => {
  try {
    const { pgEnabled, disbursementBank, disbursementAccountNo, disbursementAccountHolder } = req.body;

    const settingsToSave = [
      { key: 'KING_DIGITAL_PG_ENABLED', value: pgEnabled ? 'true' : 'false' },
      { key: 'DISBURSEMENT_BANK', value: disbursementBank || 'Bank Syariah Indonesia (BSI)' },
      { key: 'DISBURSEMENT_ACCOUNT_NO', value: disbursementAccountNo || '' },
      { key: 'DISBURSEMENT_ACCOUNT_HOLDER', value: disbursementAccountHolder || '' },
    ];

    for (const item of settingsToSave) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value },
        create: { key: item.key, value: item.value },
      });
    }

    res.json({
      success: true,
      message: 'Konfigurasi King Digital Payment Gateway & Rekening Pencairan Otomatis berhasil diperbarui.',
      data: {
        pgEnabled: !!pgEnabled,
        disbursementBank,
        disbursementAccountNo,
        disbursementAccountHolder,
      },
    });
  } catch (err) {
    console.error('Error updateKingDigitalPgConfig:', err);
    res.status(500).json({ success: false, message: 'Gagal menyimpan konfigurasi Payment Gateway.' });
  }
};

// 6. Daftar Seluruh Mitra Aktif (Untuk Super Platform Admin)
exports.getAllMitraAktif = async (req, res) => {
  try {
    const mitras = await prisma.mitraAktif.findMany({
      orderBy: { provisionedAt: 'desc' },
    });
    res.json({ success: true, data: mitras });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data mitra aktif', error: err.message });
  }
};
