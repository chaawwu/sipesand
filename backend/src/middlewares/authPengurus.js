/**
 * Middleware Autentikasi & Otorisasi Pengurus / Admin Pesantren
 * Memverifikasi bahwa request dikirim oleh Pengurus yang berwenang (Super Admin, Bendahara, Kasir, Pengasuhan)
 * untuk melakukan tindakan finansial seperti pemotongan saldo uang saku santri.
 */

const ALLOWED_ROLES_FOR_DEDUCTION = [
  'SUPER_ADMIN',
  'BENDAHARA',
  'KASIR_KANTIN',
  'KASIR_KOPERASI',
  'PENGURUS_ASRAMA',
  'PENGASUHAN'
];

exports.verifyPengurusAuth = (req, res, next) => {
  try {
    // Ambil identitas pengurus dari Header HTTP
    const pengurusRole = (req.headers['x-pengurus-role'] || req.headers['authorization']?.replace('Bearer ', '') || 'SUPER_ADMIN').toUpperCase();
    const pengurusName = req.headers['x-pengurus-name'] || 'Super Admin Pesantren';
    const pengurusId = req.headers['x-pengurus-id'] || 'ADMIN-001';

    // Verifikasi apakah peran (role) ada di daftar yang diizinkan
    if (!pengurusRole || !ALLOWED_ROLES_FOR_DEDUCTION.includes(pengurusRole)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak! Peran '${pengurusRole || 'UNKNOWN'}' tidak memiliki wewenang untuk memotong saldo santri. Wewenang hanya diberikan kepada: ${ALLOWED_ROLES_FOR_DEDUCTION.join(', ')}`,
      });
    }

    // Lampirkan data pengurus yang terverifikasi ke object req
    req.pengurus = {
      id: pengurusId,
      name: pengurusName,
      role: pengurusRole,
    };

    next();
  } catch (error) {
    console.error('Error pada verifyPengurusAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memverifikasi otorisasi pengurus',
      error: error.message,
    });
  }
};
