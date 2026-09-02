const prisma = require('../config/prisma');
const { provisionNewTenant } = require('../services/tenantProvisioner');
const { sendTenantWelcomeEmail } = require('../services/mailerService');

// 0. Cek Ketersediaan Subdomain Real-time (Deteksi jika sudah terdaftar)
const baseDomain = process.env.BASE_DOMAIN || 'sipesand.we.id';

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
        message: `Subdomain "${cleanSubdomain}.${baseDomain}" sudah terdaftar & aktif digunakan.`,
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
        message: `Subdomain "${cleanSubdomain}.${baseDomain}" sedang dalam proses checkout aktif.`,
        orderId: existingPending.orderId,
      });
    }

    return res.json({
      success: true,
      available: true,
      subdomain: cleanSubdomain,
      url: `https://${cleanSubdomain}.${baseDomain}`,
      message: `Subdomain "${cleanSubdomain}.${baseDomain}" tersedia untuk didaftarkan!`,
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
        message: `Subdomain "${cleanSubdomain}.${baseDomain}" sudah terdaftar dan aktif. Silakan pilih subdomain lain.`,
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
      message: `Pembayaran ${orderId} berhasil diproses! Instans ${pending.subdomain}.${baseDomain} telah aktif dan email kredensial telah dikirim ke ${pending.email}.`,
      data: {
        subdomain: pending.subdomain,
        tenantUrl: `https://${pending.subdomain}.${baseDomain}/login`,
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

// 7. Developer Authentication (King Digital Dev HQ)
exports.developerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    // Developer Credentials (King Digital Dev)
    const validEmails = ['kingdigitaldev@gmail.com', 'developer@sipesand.web.id', 'developer', 'admin'];
    const validPasswords = ['admin123', 'kingdev2026!', 'password123', 'dev123'];

    if (validEmails.includes(cleanEmail) && validPasswords.includes(cleanPass)) {
      return res.json({
        success: true,
        message: 'Login Developer King Digital Dev berhasil',
        developer: {
          id: 'dev-001',
          name: 'Chief Technology Officer - King Digital Dev',
          email: 'kingdigitaldev@gmail.com',
          role: 'developer',
          lastLogin: new Date().toISOString(),
          permissions: ['ALL_TENANTS', 'BILLING_CONTROL', 'SUBDOMAIN_DNS', 'SYSTEM_SETTINGS']
        },
        token: `kgd_token_${Date.now()}`
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Email atau password developer salah. Akses ditolak.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal autentikasi developer', error: err.message });
  }
};

// 8. Developer Stats (Overview)
exports.getDeveloperStats = async (req, res) => {
  try {
    const totalTenants = await prisma.mitraAktif.count();
    const pendingTenants = await prisma.mitraPending.count({ where: { status: 'PENDING' } });
    const allMitras = await prisma.mitraAktif.findMany({
      orderBy: { provisionedAt: 'desc' },
    });

    const totalRevenue = allMitras.reduce((acc, m) => acc + (m.amount || 0), 0);
    const activeCount = allMitras.filter(m => m.status === 'ACTIVE').length;
    const expiredCount = allMitras.filter(m => m.status !== 'ACTIVE').length;

    res.json({
      success: true,
      data: {
        totalTenants,
        activeCount,
        expiredCount,
        pendingTenants,
        totalRevenue,
        tenants: allMitras,
        serverUptime: '99.98%',
        activeDnsRecords: totalTenants + 4,
        storageUsage: `${(totalTenants * 4.2).toFixed(1)} MB`,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memuat statistik developer', error: err.message });
  }
};

// 9. Toggle Status Tenant (Active / Suspended)
exports.toggleTenantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.mitraAktif.findUnique({ where: { id: parseInt(id) || 0 } });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Data tenant tidak ditemukan' });
    }

    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updated = await prisma.mitraAktif.update({
      where: { id: tenant.id },
      data: { status: newStatus },
    });

    res.json({
      success: true,
      message: `Status tenant ${tenant.namaPondok} berhasil diubah menjadi ${newStatus}`,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengubah status tenant', error: err.message });
  }
};

// 10. Buat Tenant Baru Secara Manual dari Developer Console
exports.createTenantManual = async (req, res) => {
  try {
    const { namaPondok, subdomain, namaPengelola, email, noWhatsapp, packageType } = req.body;
    if (!namaPondok || !subdomain || !namaPengelola || !email) {
      return res.status(400).json({ success: false, message: 'Field nama pondok, subdomain, pengelola, dan email wajib diisi' });
    }

    const cleanSub = subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    const ex = await prisma.mitraAktif.findUnique({ where: { subdomain: cleanSub } });
    if (ex) {
      return res.status(409).json({ success: false, message: `Subdomain "${cleanSub}" sudah terdaftar` });
    }

    const provisionResult = await provisionNewTenant({
      namaPondok,
      subdomain: cleanSub,
      namaPengelola,
      email,
      noWhatsapp: noWhatsapp || '+6285123734342',
      packageType: packageType || 'LIFETIME',
    });

    const activeMitra = await prisma.mitraAktif.create({
      data: {
        namaPondok,
        subdomain: cleanSub,
        namaPengelola,
        email,
        noWhatsapp: noWhatsapp || '+6285123734342',
        packageType: packageType || 'LIFETIME',
        amount: packageType === 'LIFETIME' ? 3500000 : 1500000,
        licenseKey: provisionResult.licenseKey,
        dbPath: provisionResult.dbPath,
        adminUsername: provisionResult.adminUsername,
        adminPasswordHash: provisionResult.passwordHash,
        status: 'ACTIVE',
        provisionedAt: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: `Tenant "${namaPondok}" (${cleanSub}.sipesand.web.id) berhasil dibuat dan diaktivasi langsung.`,
      data: activeMitra,
      credentials: {
        url: `https://${cleanSub}.sipesand.web.id/login`,
        username: provisionResult.adminUsername,
        password: provisionResult.tempPassword,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat tenant manual', error: err.message });
  }
};

// 11. Transaksi Multi-Tenant
exports.getTenantTransactions = async (req, res) => {
  try {
    const pendings = await prisma.mitraPending.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const aktifs = await prisma.mitraAktif.findMany({
      orderBy: { provisionedAt: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      data: {
        orders: pendings,
        activeLicenses: aktifs,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data transaksi', error: err.message });
  }
};

