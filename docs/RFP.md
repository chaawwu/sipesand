# Request for Proposal (RFP)
## Platform SaaS Manajemen Pesantren Modern Terpadu: SIPESAND

**Penyedia Sistem**: King Digital Dev  
**Versi Dokumen**: 2.0-Enterprise  
**Tanggal**: 2026-09-03  
**Status**: Siap Implementasi (Production Ready)

---

## 1. Ringkasan Eksekutif
Pondok pesantren modern dan tradisional saat ini menghadapi tantangan kompleks dalam pengelolaan administrasi santri, rekonsiliasi keuangan syahriyah, keamanan keluar-masuk santri di gerbang, dan transparansi laporan terhadap wali santri.

**SIPESAND** hadir sebagai solusi komprehensif *Cloud-Native Multi-Tenant SaaS* yang menggabungkan perangkat lunak administrasi terpadu dengan ekosistem kartu pintar santri berbasis RFID/NFC ISO CR-80.

---

## 2. Ruang Lingkup Sistem (System Scope)

### 2.1. Manajemen Kesantrian & KTS Digital
- Database induk santri (NIS, NIK, NISN, kamar asrama, kelas formal & madin).
- Integrasi Kartu Tanda Santri Digital (KTSD) berstandar kartu ATM bank (CR-80: 85.6mm x 54mm).
- Studio kustomisasi kartu dengan 4 preset desain institusional dan dukungan cetak mandiri.

### 2.2. Manajemen Keuangan & Kasir Uang Saku
- Ekosistem kantin & koperasi santri *cashless* berbasis tap kartu NFC.
- Buku Kas Umum (BKU) yayasan dengan klasifikasi arus kas masuk (SPP, infaq, wakaf) dan keluar (operasional, logistik).
- Fitur limitasi jajan harian dan alert WhatsApp otomatis saat saldo saku menipis.

### 2.3. Penagihan Syahriyah Hijriyah Otomatis
- Penjadwalan penagihan berbasis siklus bulan kalender Hijriyah (Muharram hingga Dzulhijjah).
- Penerbitan kwitansi pembayaran resmi dengan QR Code verifikasi.

### 2.4. Pos Keamanan (Kamtib) & Perizinan
- Modul perizinan keluar, dinas, dan pulang kampung berbasis barcode/NFC check-out dan check-in.
- Monitoring santri telat kembali (*overdue*) secara real-time.

### 2.5. Portal Wali Santri Mandiri
- Akses transparan bagi wali santri dari seluruh Indonesia tanpa perlu login aplikasi rumit.
- Verifikasi identitas aman untuk memantau tabungan saku, presensi izin, dan tagihan.

---

## 3. Spesifikasi Teknis & Infrastruktur

| Komponen | Spesifikasi | Keterangan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, Vite, Tailwind CSS | Single Page Application (SPA) ultra-cepat |
| **PWA Standard** | W3C Mobile Web App Capable | Dapat diinstal di Android & iOS |
| **Backend Engine** | Node.js Express & Prisma ORM | RESTful API terstruktur |
| **Database Architecture** | Isolated Multi-Tenant SQLite per Subdomain | Pemisahan 100% data antar pesantren |
| **Edge Computing** | Cloudflare Pages & Workers Functions | Latensi rendah di 300+ kota di dunia |
| **Card Hardware** | NFC / RFID 13.56MHz ISO 14443 Type A | Kompatibel dengan reader ACR122U & USB POS |

---

## 4. Keamanan & Kepatuhan Data
- **Enkripsi Transit & At-Rest**: HTTPS/TLS 1.3 menyeluruh.
- **Tenant Isolation**: Setiap lembaga pesantren memiliki berkas database mandiri terenkripsi (`tenant_[subdomain].db`) yang tidak dapat diakses oleh tenant lain.
- **Pencadangan Otomatis**: Fitur auto-backup berkala ke JSON/Cloud storage untuk menjamin kontinuitas data.

---

## 5. Kontak & Konsultasi Pengadaan
**King Digital Dev**  
- WhatsApp: +62 851-2373-4342  
- Email: kingdigitaldev@gmail.com / sekretariat@sipesand.id  
- Website: [https://sipesand.web.id](https://sipesand.web.id)
