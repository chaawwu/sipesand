const bcrypt = require('bcryptjs');
const masterPrisma = require('../config/prisma');

function getDb(req) {
  return req.prisma || masterPrisma;
}

// 1. Ambil Semua Pengaturan Lembaga
exports.getAllSettings = async (req, res) => {
  try {
    const db = getDb(req);
    const settingsList = await db.systemSetting.findMany();
    const settingsMap = {};
    settingsList.forEach(s => {
      settingsMap[s.key] = s.value;
    });
    res.json({ success: true, data: settingsMap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil pengaturan sistem', error: err.message });
  }
};

// 2. Simpan / Perbarui Pengaturan Lembaga (Termasuk File Assets: Logo, Cap, TTD, QRIS, NFC Switch)
exports.saveSettings = async (req, res) => {
  try {
    const db = getDb(req);
    const settingsObject = req.body;

    for (const [key, value] of Object.entries(settingsObject)) {
      if (value !== undefined && value !== null) {
        await db.systemSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        });
      }
    }

    res.json({ success: true, message: 'Pengaturan sistem & aset digital berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan pengaturan', error: err.message });
  }
};

// 3. Login Petugas / Super Admin / Pengurus Devisi (100% Real Auth)
exports.loginUser = async (req, res) => {
  try {
    const db = getDb(req);
    let { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    username = username.trim().toLowerCase();
    password = password.trim();

    // 1. Cek apakah database benar-benar kosong belum ada akun (Inisialisasi awal Super Admin jika fresh)
    const countUsers = await db.userAccount.count();
    if (countUsers === 0 && username === 'admin') {
      await db.userAccount.create({
        data: {
          username: 'admin',
          password: 'admin123',
          name: 'Super Administrator',
          role: 'SUPER_ADMIN',
          division: 'PUSAT',
          isActive: true,
        }
      });
    }

    // 2. Cari akun di database berdasarkan username
    const user = await db.userAccount.findFirst({
      where: {
        username: {
          equals: username
        }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username atau password yang Anda masukkan salah' });
    }

    // 3. Validasi Password Asli (Mendukung enkripsi bcrypt atau plain-text match)
    let isPasswordValid = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Username atau password yang Anda masukkan salah' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda telah dinonaktifkan oleh Super Admin' });
    }

    let parsedManagedIds = [];
    try {
      if (user.managedSantriIds) {
        parsedManagedIds = typeof user.managedSantriIds === 'string' ? JSON.parse(user.managedSantriIds) : user.managedSantriIds;
      }
    } catch (e) {
      parsedManagedIds = [];
    }

    res.json({
      success: true,
      message: `Login berhasil sebagai ${user.name} (${user.role})`,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role, // 'SUPER_ADMIN' | 'KEPALA_PONDOK' | 'BENDAHARA' | 'PENGURUS_SAKU' | 'KEAMANAN'
        division: user.division,
        managedSantriIds: Array.isArray(parsedManagedIds) ? parsedManagedIds : [],
        performanceNotes: user.performanceNotes,
        performanceGrade: user.performanceGrade,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memproses login', error: err.message });
  }
};

// 4. Manajemen Akun Multi-Divisi: List Akun
exports.getUserAccounts = async (req, res) => {
  try {
    const db = getDb(req);
    const accounts = await db.userAccount.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        division: true,
        managedSantriIds: true,
        performanceNotes: true,
        performanceGrade: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { id: 'asc' }
    });
    res.json({ success: true, data: accounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal mengambil data akun', error: err.message });
  }
};

// 5. Manajemen Akun: Buat Akun Baru
exports.createUserAccount = async (req, res) => {
  try {
    const db = getDb(req);
    const { username, password, name, role, division, managedSantriIds, performanceNotes, performanceGrade } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, nama, dan tipe akun/divisi wajib diisi' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await db.userAccount.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const managedStr = Array.isArray(managedSantriIds) 
      ? JSON.stringify(managedSantriIds) 
      : (typeof managedSantriIds === 'string' ? managedSantriIds : null);

    const account = await db.userAccount.create({
      data: {
        username: cleanUsername,
        password: password.trim(),
        name,
        role,
        division: division || role,
        managedSantriIds: managedStr,
        performanceNotes: performanceNotes || null,
        performanceGrade: performanceGrade || 'Mumtaz',
        isActive: true,
      }
    });

    res.status(201).json({
      success: true,
      message: `Akun ${name} (${role}) berhasil dibuat`,
      data: account
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat akun', error: err.message });
  }
};

// 6. Update Akun (Termasuk Username, Password, Pemetaan Santri & Evaluasi Kinerja)
exports.updateUserAccount = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;
    const { username, name, role, division, isActive, password, managedSantriIds, performanceNotes, performanceGrade } = req.body;

    const dataToUpdate = {};
    if (username) {
      const cleanUsername = username.trim().toLowerCase();
      // Pastikan username unik kecuali untuk akun ini sendiri
      const existing = await db.userAccount.findUnique({ where: { username: cleanUsername } });
      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({ success: false, message: 'Username sudah digunakan oleh akun lain' });
      }
      dataToUpdate.username = cleanUsername;
    }
    if (name) dataToUpdate.name = name;
    if (role) dataToUpdate.role = role;
    if (division !== undefined) dataToUpdate.division = division;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password && password.trim()) dataToUpdate.password = password.trim();
    if (performanceNotes !== undefined) dataToUpdate.performanceNotes = performanceNotes;
    if (performanceGrade !== undefined) dataToUpdate.performanceGrade = performanceGrade;

    if (managedSantriIds !== undefined) {
      dataToUpdate.managedSantriIds = Array.isArray(managedSantriIds) 
        ? JSON.stringify(managedSantriIds) 
        : (typeof managedSantriIds === 'string' ? managedSantriIds : null);
    }

    const account = await db.userAccount.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });

    res.json({ success: true, message: 'Data akun & pemetaan berhasil diperbarui', data: account });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui akun', error: err.message });
  }
};

// 7. Hapus Akun
exports.deleteUserAccount = async (req, res) => {
  try {
    const db = getDb(req);
    const { id } = req.params;
    await db.userAccount.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus akun', error: err.message });
  }
};

// 8. Auto Backup / Export Database JSON
exports.getBackupData = async (req, res) => {
  try {
    const db = getDb(req);
    const [santri, bills, masterBills, ledger, pocketTxs, permits, academics, violations, settings, accounts] = await Promise.all([
      db.santri.findMany(),
      db.santriBill.findMany(),
      db.masterBill.findMany(),
      db.generalLedger.findMany(),
      db.pocketTx.findMany(),
      db.permit.findMany(),
      db.academicRecord.findMany(),
      db.violationRecord.findMany(),
      db.systemSetting.findMany(),
      db.userAccount.findMany({ select: { id: true, username: true, name: true, role: true, division: true, managedSantriIds: true, performanceNotes: true, performanceGrade: true } }),
    ]);

    const backupPayload = {
      appName: 'SiPesand (Sistem Terpadu Pesantren Digital)',
      backupTimestamp: new Date().toISOString(),
      version: '2.0.0',
      data: {
        santri,
        bills,
        masterBills,
        ledger,
        pocketTxs,
        permits,
        academics,
        violations,
        settings,
        accounts,
      }
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=sipesand_backup_${Date.now()}.json`);
    res.json(backupPayload);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal membuat file backup', error: err.message });
  }
};
