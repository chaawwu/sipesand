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

// 3. Login Petugas / Super Admin / Pengurus Devisi
exports.loginUser = async (req, res) => {
  try {
    const db = getDb(req);
    let { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username dan password wajib diisi' });
    }

    username = username.trim().toLowerCase();
    password = password.trim();

    // 1. Coba cari akun di database
    let user = await db.userAccount.findFirst({
      where: {
        username: {
          equals: username
        }
      }
    });

    // 2. Jika akun belum ada di DB (misal belum di-seed), sediakan built-in demo credentials
    if (!user) {
      const demoMap = {
        'admin': { role: 'SUPER_ADMIN', name: 'Super Administrator', pass: 'admin123', div: 'PUSAT', managed: null },
        'superadmin': { role: 'SUPER_ADMIN', name: 'Super Administrator', pass: 'password123', div: 'PUSAT', managed: null },
        'bendahara': { role: 'BENDAHARA', name: 'Ustadz Ridwan, S.E. (Bendahara)', pass: 'admin123', div: 'KEUANGAN', managed: '[1, 2, 3]' },
        'pengasuh': { role: 'KEPALA_PONDOK', name: 'K.H. Syarif Hidayatullah, M.A. (Pengasuh)', pass: 'admin123', div: 'PENGASUHAN', managed: null },
        'kepalapondok': { role: 'KEPALA_PONDOK', name: 'K.H. Syarif Hidayatullah, M.A.', pass: 'password123', div: 'PENGASUHAN', managed: null },
        'uangsaku': { role: 'PENGURUS_SAKU', name: 'Ustadz Ridwan (Pengurus Uang Saku)', pass: 'admin123', div: 'ASRAMA_POS', managed: '[1, 2, 3]' },
        'poskantin': { role: 'PENGURUS_SAKU', name: 'Petugas Kasir Kantin & Saku', pass: 'password123', div: 'ASRAMA_POS', managed: '[3, 4, 5]' },
        'kamtib': { role: 'KEAMANAN', name: 'Ustadz Danang (Keamanan)', pass: 'admin123', div: 'KAMTIB', managed: null },
        'keamanan': { role: 'KEAMANAN', name: 'Ustadz Danang (Keamanan)', pass: 'admin123', div: 'KAMTIB', managed: null },
      };

      const foundDemo = demoMap[username];
      if (foundDemo && (password === foundDemo.pass || password === 'admin123' || password === 'password123')) {
        user = await prisma.userAccount.create({
          data: {
            username,
            password,
            name: foundDemo.name,
            role: foundDemo.role,
            division: foundDemo.div,
            managedSantriIds: foundDemo.managed || null,
            isActive: true,
          }
        });
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Username tidak ditemukan pada sistem' });
    }

    let isPasswordValid = false;
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      isPasswordValid = user.password === password;
    }

    // Built-in dev password bypass
    if (password === 'admin123' || password === 'password123') {
      isPasswordValid = true;
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Password yang Anda masukkan salah' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Akun Anda dinonaktifkan oleh Administrator' });
    }

    let parsedManagedIds = [];
    try {
      if (user.managedSantriIds) {
        parsedManagedIds = JSON.parse(user.managedSantriIds);
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
        managedSantriIds: parsedManagedIds,
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
    const accounts = await prisma.userAccount.findMany({
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
    const { username, password, name, role, division, managedSantriIds, performanceNotes, performanceGrade } = req.body;
    if (!username || !password || !name || !role) {
      return res.status(400).json({ success: false, message: 'Username, password, nama, dan tipe akun/divisi wajib diisi' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.userAccount.findUnique({ where: { username: cleanUsername } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Username sudah digunakan' });
    }

    const managedStr = Array.isArray(managedSantriIds) 
      ? JSON.stringify(managedSantriIds) 
      : (typeof managedSantriIds === 'string' ? managedSantriIds : null);

    const account = await prisma.userAccount.create({
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

// 6. Update Akun (Termasuk Pemetaan Santri & Evaluasi Kinerja)
exports.updateUserAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, division, isActive, password, managedSantriIds, performanceNotes, performanceGrade } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (role) dataToUpdate.role = role;
    if (division !== undefined) dataToUpdate.division = division;
    if (isActive !== undefined) dataToUpdate.isActive = isActive;
    if (password) dataToUpdate.password = password;
    if (performanceNotes !== undefined) dataToUpdate.performanceNotes = performanceNotes;
    if (performanceGrade !== undefined) dataToUpdate.performanceGrade = performanceGrade;

    if (managedSantriIds !== undefined) {
      dataToUpdate.managedSantriIds = Array.isArray(managedSantriIds) 
        ? JSON.stringify(managedSantriIds) 
        : (typeof managedSantriIds === 'string' ? managedSantriIds : null);
    }

    const account = await prisma.userAccount.update({
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
    const { id } = req.params;
    await prisma.userAccount.delete({ where: { id: parseInt(id) } });
    res.json({ success: true, message: 'Akun berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Gagal menghapus akun', error: err.message });
  }
};

// 8. Auto Backup / Export Database JSON
exports.getBackupData = async (req, res) => {
  try {
    const [santri, bills, masterBills, ledger, pocketTxs, permits, academics, violations, settings, accounts] = await Promise.all([
      prisma.santri.findMany(),
      prisma.santriBill.findMany(),
      prisma.masterBill.findMany(),
      prisma.generalLedger.findMany(),
      prisma.pocketTx.findMany(),
      prisma.permit.findMany(),
      prisma.academicRecord.findMany(),
      prisma.violationRecord.findMany(),
      prisma.systemSetting.findMany(),
      prisma.userAccount.findMany({ select: { id: true, username: true, name: true, role: true, division: true, managedSantriIds: true, performanceNotes: true, performanceGrade: true } }),
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
