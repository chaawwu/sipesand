const prisma = require('../config/prisma');
const { provisionNewTenant } = require('../services/tenantProvisioner');
const { sendTenantWelcomeEmail } = require('../services/mailerService');
const crypto = require('crypto');

// ============================================================================
// DEVELOPER AUTH HELPERS
// ============================================================================
const DEFAULT_DEV_USERNAME = 'admin_dev';
const DEFAULT_DEV_PASSWORD = 'KingDigital2026#';
const DEV_SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 jam

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain + 'sipesand_salt_2026').digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function getDevCredentials() {
  const rows = await prisma.systemSetting.findMany({
    where: { key: { in: ['DEV_USERNAME', 'DEV_PASSWORD_HASH'] } }
  });
  const map = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return {
    username: map['DEV_USERNAME'] || DEFAULT_DEV_USERNAME,
    passwordHash: map['DEV_PASSWORD_HASH'] || hashPassword(DEFAULT_DEV_PASSWORD),
  };
}

// Audit log: simpan max 200 entri terakhir di SystemSetting (key: AUDIT_LOG_JSON)
async function appendAuditLog(entry) {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: 'AUDIT_LOG_JSON' } });
    let logs = [];
    if (row) {
      try { logs = JSON.parse(row.value); } catch {}
    }
    logs.unshift({ ...entry, id: Date.now(), timestamp: new Date().toISOString() });
    if (logs.length > 200) logs = logs.slice(0, 200);
    await prisma.systemSetting.upsert({
      where: { key: 'AUDIT_LOG_JSON' },
      update: { value: JSON.stringify(logs) },
      create: { key: 'AUDIT_LOG_JSON', value: JSON.stringify(logs) },
    });
  } catch (e) {
    console.warn('[AUDIT LOG] Gagal menyimpan audit log:', e.message);
  }
}

// Active dev sessions: simpan di SystemSetting key AUDIT_DEV_SESSIONS_JSON
async function saveDevSession(token, username) {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: 'DEV_SESSIONS_JSON' } });
    let sessions = {};
    if (row) {
      try { sessions = JSON.parse(row.value); } catch {}
    }
    // Hapus sesi yang sudah expired
    const now = Date.now();
    for (const t of Object.keys(sessions)) {
      if (sessions[t].expiresAt < now) delete sessions[t];
    }
    sessions[token] = { username, createdAt: now, expiresAt: now + DEV_SESSION_TTL_MS };
    await prisma.systemSetting.upsert({
      where: { key: 'DEV_SESSIONS_JSON' },
      update: { value: JSON.stringify(sessions) },
      create: { key: 'DEV_SESSIONS_JSON', value: JSON.stringify(sessions) },
    });
  } catch (e) {
    console.warn('[DEV SESSION] Gagal menyimpan sesi:', e.message);
  }
}

async function verifyDevSession(token) {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: 'DEV_SESSIONS_JSON' } });
    if (!row) return null;
    let sessions = {};
    try { sessions = JSON.parse(row.value); } catch { return null; }
    const session = sessions[token];
    if (!session) return null;
    if (session.expiresAt < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

async function invalidateDevSession(token) {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: 'DEV_SESSIONS_JSON' } });
    if (!row) return;
    let sessions = {};
    try { sessions = JSON.parse(row.value); } catch { return; }
    delete sessions[token];
    await prisma.systemSetting.upsert({
      where: { key: 'DEV_SESSIONS_JSON' },
      update: { value: JSON.stringify(sessions) },
      create: { key: 'DEV_SESSIONS_JSON', value: JSON.stringify(sessions) },
    });
  } catch (e) {
    console.warn('[DEV SESSION] Gagal menghapus sesi:', e.message);
  }
}

const DEFAULT_MITRA_CONFIG = {
  bankName: 'Bank Syariah Indonesia (BSI)',
  bankAccountNo: '',
  bankAccountHolder: '',
  waConfirmationNumber: '',
  tahunanPrice: 1500000,
  lifetimePrice: 3500000,
  qrisImageUrl: '',
  heroHeadline: 'Kelola Pesantren Tumbuh Tanpa Batas',
  heroSubheadline: 'Satu platform terintegrasi untuk pesantren.',
  ctaText: 'Cari Santri',
  badgeText: 'SiPesand',
};

async function readMitraConfig() {
  const rows = await prisma.systemSetting.findMany({ where: { key: { startsWith: 'MITRA_' } } });
  const values = Object.fromEntries(rows.map((row) => [row.key.replace(/^MITRA_/, ''), row.value]));
  return {
    ...DEFAULT_MITRA_CONFIG,
    ...values,
    tahunanPrice: Number(values.tahunanPrice || DEFAULT_MITRA_CONFIG.tahunanPrice),
    lifetimePrice: Number(values.lifetimePrice || DEFAULT_MITRA_CONFIG.lifetimePrice),
  };
}

async function saveMitraConfig(config) {
  for (const key of Object.keys(DEFAULT_MITRA_CONFIG)) {
    if (config[key] === undefined) continue;
    await prisma.systemSetting.upsert({
      where: { key: `MITRA_${key}` },
      update: { value: String(config[key]) },
      create: { key: `MITRA_${key}`, value: String(config[key]) },
    });
  }
  return readMitraConfig();
}

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

    // Tentukan biaya lisensi dari konfigurasi master yang dikelola developer.
    const config = await readMitraConfig();
    const pkg = packageType === 'LIFETIME' ? 'LIFETIME' : 'TAHUNAN';
    const amount = pkg === 'LIFETIME' ? config.lifetimePrice : config.tahunanPrice;

    // Membuat invoice pembayaran. Status lunas hanya berasal dari webhook atau verifikasi admin.
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

// 4. Konfigurasi King Digital Payment Gateway & Auto-Disbursement (Pengaturan Tenant)
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

exports.getMitraConfig = async (req, res) => {
  try { res.json({ success: true, data: await readMitraConfig() }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal mengambil konfigurasi mitra.', error: err.message }); }
};

exports.updateMitraConfig = async (req, res) => {
  try { res.json({ success: true, message: 'Konfigurasi mitra berhasil disimpan.', data: await saveMitraConfig(req.body || {}) }); }
  catch (err) { res.status(500).json({ success: false, message: 'Gagal menyimpan konfigurasi mitra.', error: err.message }); }
};

exports.getMitraOrders = async (req, res) => {
  try {
    const [pending, active] = await Promise.all([
      prisma.mitraPending.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.mitraAktif.findMany({ orderBy: { provisionedAt: 'desc' } }),
    ]);

    // Sertakan semua field penting agar dashboard mitra bisa menampilkan detail lengkap
    const pendingOrders = pending.map((order) => {
      // Normalisasi status: PENDING → PENDING (konsisten), WAITING_VERIFICATION tetap
      const normalizedStatus = order.status === 'PAID' ? 'ACTIVE' : order.status;
      return {
        id: order.id,
        orderId: order.orderId,
        namaPondok: order.namaPondok,
        subdomain: order.subdomain,
        namaPengelola: order.namaPengelola,
        email: order.email,
        noWhatsapp: order.noWhatsapp,
        packageType: order.packageType,
        amount: order.amount,
        vaNumber: order.vaNumber,
        vaBank: order.vaBank,
        qrisUrl: order.qrisUrl,
        qrisString: order.qrisString,
        proofUrl: order.proofUrl,
        proofNote: order.proofNote,
        senderName: order.senderName,
        status: normalizedStatus,
        expiredAt: order.expiredAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        isProvisioned: false,
        source: 'PENDING',
      };
    });

    // Mitra aktif yang SUDAH di-provisioning (tidak ada di tabel pending atau sudah PAID)
    const pendingSubdomains = new Set(pending.map((o) => o.subdomain));
    const activeOrders = active
      .filter((tenant) => !pendingSubdomains.has(tenant.subdomain))
      .map((tenant) => ({
        id: `active-${tenant.id}`,
        orderId: `ACTIVE-${tenant.subdomain.toUpperCase()}`,
        namaPondok: tenant.namaPondok,
        subdomain: tenant.subdomain,
        namaPengelola: tenant.namaPengelola,
        email: tenant.email,
        noWhatsapp: tenant.noWhatsapp,
        packageType: tenant.packageType,
        amount: tenant.amount,
        vaNumber: null,
        vaBank: null,
        qrisUrl: null,
        proofUrl: null,
        status: tenant.status === 'ACTIVE' ? 'ACTIVE' : tenant.status,
        createdAt: tenant.provisionedAt,
        provisionedAt: tenant.provisionedAt,
        licenseKey: tenant.licenseKey,
        adminUsername: tenant.adminUsername,
        isProvisioned: true,
        source: 'ACTIVE',
      }));

    res.json({ success: true, data: [...pendingOrders, ...activeOrders] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pendaftaran mitra.', error: err.message });
  }
};

exports.uploadMitraPaymentProof = async (req, res) => {
  try {
    const { orderId, proofBase64, proofNote, senderName } = req.body || {};
    if (!orderId || !proofBase64) return res.status(400).json({ success: false, message: 'Order dan bukti pembayaran wajib diisi.' });
    const updated = await prisma.mitraPending.update({ where: { orderId }, data: { proofUrl: proofBase64, proofNote: proofNote || null, senderName: senderName || null, status: 'WAITING_VERIFICATION' } });
    res.json({ success: true, message: 'Bukti pembayaran berhasil disimpan.', data: updated });
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal menyimpan bukti pembayaran.', error: err.message }); }
};

exports.verifyMitraOrder = async (req, res) => {
  try {
    const { orderId } = req.body || {};
    if (!(await prisma.mitraPending.findUnique({ where: { orderId } }))) return res.status(404).json({ success: false, message: 'Pesanan mitra tidak ditemukan.' });
    req.body = { orderId, status: 'PAID' };
    return exports.handlePaymentWebhook(req, res);
  } catch (err) { res.status(500).json({ success: false, message: 'Gagal memverifikasi pesanan mitra.', error: err.message }); }
};

exports.deleteMitraOrder = async (req, res) => {
  try { await prisma.mitraPending.delete({ where: { orderId: req.params.orderId } }); res.json({ success: true, message: 'Pesanan mitra berhasil dihapus.' }); }
  catch (err) { res.status(404).json({ success: false, message: 'Pesanan mitra tidak ditemukan.', error: err.message }); }
};

// ============================================================================
// DEVELOPER AUTH ENDPOINTS
// POST /api/mitra/auth/login
// ============================================================================
exports.loginDeveloper = async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi.' });
    }

    const creds = await getDevCredentials();
    const inputHash = hashPassword(password);

    if (username !== creds.username || inputHash !== creds.passwordHash) {
      // Catat percobaan login gagal
      const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
      await appendAuditLog({
        action: 'LOGIN_FAILED',
        actor: username,
        target: 'mitra.sipesand.web.id',
        ip,
        detail: 'Kredensial salah'
      });
      return res.status(401).json({ success: false, message: 'Username atau password developer salah.' });
    }

    const token = generateToken();
    await saveDevSession(token, username);

    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    await appendAuditLog({
      action: 'LOGIN_SUCCESS',
      actor: username,
      target: 'mitra.sipesand.web.id',
      ip,
      detail: 'Login developer berhasil'
    });

    res.json({
      success: true,
      message: 'Login developer berhasil.',
      token,
      username,
      expiresIn: '8 jam'
    });
  } catch (err) {
    console.error('[DEV AUTH] loginDeveloper error:', err);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat autentikasi developer.', error: err.message });
  }
};

// POST /api/mitra/auth/verify
exports.verifyDeveloperToken = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (!token) {
      return res.status(400).json({ success: false, valid: false, message: 'Token wajib disertakan.' });
    }
    const session = await verifyDevSession(token);
    if (!session) {
      return res.json({ success: true, valid: false, message: 'Sesi tidak valid atau sudah kedaluwarsa.' });
    }
    res.json({
      success: true,
      valid: true,
      username: session.username,
      expiresAt: new Date(session.expiresAt).toISOString(),
      message: 'Token valid.'
    });
  } catch (err) {
    res.status(500).json({ success: false, valid: false, message: 'Gagal memverifikasi token.', error: err.message });
  }
};

// POST /api/mitra/auth/logout
exports.logoutDeveloper = async (req, res) => {
  try {
    const { token } = req.body || {};
    if (token) {
      const session = await verifyDevSession(token);
      if (session) {
        await invalidateDevSession(token);
        const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        await appendAuditLog({
          action: 'LOGOUT',
          actor: session.username,
          target: 'mitra.sipesand.web.id',
          ip,
          detail: 'Logout developer'
        });
      }
    }
    res.json({ success: true, message: 'Sesi developer berhasil dihentikan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal melakukan logout.', error: err.message });
  }
};

// GET /api/mitra/audit-logs
exports.getAuditLogs = async (req, res) => {
  try {
    const row = await prisma.systemSetting.findUnique({ where: { key: 'AUDIT_LOG_JSON' } });
    let logs = [];
    if (row) {
      try { logs = JSON.parse(row.value); } catch {}
    }
    // Juga tambahkan log dari aktivitas verifikasi order
    const limit = parseInt(req.query.limit) || 100;
    res.json({ success: true, data: logs.slice(0, limit), total: logs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil audit log.', error: err.message });
  }
};

// PUT /api/mitra/auth/credentials — ubah username/password developer dari mitra dashboard
exports.updateDevCredentials = async (req, res) => {
  try {
    const { currentPassword, newUsername, newPassword } = req.body || {};
    if (!currentPassword) {
      return res.status(400).json({ success: false, message: 'Password lama wajib diisi untuk konfirmasi.' });
    }

    const creds = await getDevCredentials();
    const currentHash = hashPassword(currentPassword);

    if (currentHash !== creds.passwordHash) {
      return res.status(401).json({ success: false, message: 'Password lama salah.' });
    }

    const updates = [];
    if (newUsername && newUsername.length >= 4) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'DEV_USERNAME' },
        update: { value: newUsername.trim() },
        create: { key: 'DEV_USERNAME', value: newUsername.trim() },
      }));
    }
    if (newPassword && newPassword.length >= 8) {
      updates.push(prisma.systemSetting.upsert({
        where: { key: 'DEV_PASSWORD_HASH' },
        update: { value: hashPassword(newPassword) },
        create: { key: 'DEV_PASSWORD_HASH', value: hashPassword(newPassword) },
      }));
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'Tidak ada perubahan yang valid. Username minimal 4 karakter, password minimal 8 karakter.' });
    }

    await Promise.all(updates);
    const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    await appendAuditLog({
      action: 'CREDENTIALS_UPDATED',
      actor: creds.username,
      target: 'mitra.sipesand.web.id',
      ip,
      detail: `Username/password developer diperbarui`
    });

    res.json({ success: true, message: 'Kredensial developer berhasil diperbarui.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui kredensial developer.', error: err.message });
  }
};

