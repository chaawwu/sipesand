# SIPESAND — Sistem Informasi Pesantren Terpadu (Enterprise Architecture)

SIPESAND adalah platform SaaS (Software as a Service) modern kelas enterprise yang dikembangkan khusus untuk digitalisasi operasional, keuangan, dan kesiswaan pondok pesantren di Indonesia.

---

## 🏛️ Arsitektur Proyek (Modular Architecture)

Struktur proyek diorganisasikan ke dalam modul-modul independen agar perubahan pada satu domain tidak memengaruhi modul lainnya:

```
├── apps/
│   ├── landing/      → Landing page publik SIPESAND (https://sipesand.web.id)
│   ├── dashboard/    → Aplikasi operasional & admin pesantren (https://app.sipesand.web.id)
│   ├── mitra/        → Portal Developer & Reseller King Digital Dev (https://mitra.sipesand.web.id)
│   └── santri/       → Portal mandiri wali santri & cek perizinan (https://pay.sipesand.web.id)
│
├── packages/
│   ├── ui/           → Komponen visual bersama (Modals, Toast, Table, Cards, Studio KTS)
│   └── shared/       → API services, Context (SettingsContext), helper functions, types
│
├── public/
│   ├── images/       → Aset gambar, ilustrasi vektor, dan mockup visual
│   ├── icons/        → PWA icons, SVG status
│   └── logo/         → Brand logo SIPESAND & King Digital Dev
│
├── docs/
│   ├── README.md     → Dokumentasi arsitektur & panduan teknis
│   └── RFP.md        → Dokumen Request for Proposal (Spesifikasi Teknis & Tender)
│
├── frontend/         → Host aplikasi React Vite aktif (SPA + Cloudflare Pages Functions)
└── backend/          → Engine Node.js Express + Prisma SQLite dengan isolasi multi-tenant
```

---

## 🌐 Aturan Routing Domain

| Domain / Subdomain | Target Aplikasi | Fungsi Utama |
| :--- | :--- | :--- |
| `sipesand.web.id` | `/apps/landing` | Showcase produk SaaS, harga, demo interaktif, pendaftaran tenant |
| `app.sipesand.web.id` | `/apps/dashboard` | Hub login terpusat & operasional manajemen pesantren |
| `mitra.sipesand.web.id` | `/apps/mitra` | Developer Console King Digital Dev (Lisensi, monitoring server, DNS) |
| `[namapondok].sipesand.web.id` | `/apps/dashboard` | Portal resmi white-label mandiri milik pesantren bersangkutan |

---

## 🚀 Fitur Unggulan Sistem
1. **Kartu Tanda Santri Digital (KTSD Smart NFC ISO CR-80)**:
   - Transaksi kantin/koperasi non-tunai (cashless), aman dari risiko kehilangan uang.
   - Studio kustomisasi kartu dengan 4 tema desain (Klasik Salaf, Modern Bento, Luxury VIP, Swiss Studio).
2. **Penagihan Syahriyah Kalender Hijriyah Otomatis**:
   - Penerbitan massal SPP bulanan berbasis nama bulan Hijriyah (Muharram s.d Dzulhijjah).
3. **Buku Kas Umum & Akuntansi Yayasan**:
   - Arus kas masuk dan keluar real-time per divisi dengan nomor kuitansi otomatis.
4. **Keamanan Gerbang (Kamtib) & Perizinan**:
   - Pencatatan izin keluar masuk santri dengan barcode scan dan status aktif/terlambat.
5. **Evaluasi Akademik & Muhafadzoh**:
   - Rekam hafalan Qur'an (Tahfidz), sorogan kitab kuning, dan pembagian santri asuh.
6. **Portal Mandiri Wali Santri**:
   - Wali dapat mengecek riwayat saku, tagihan, dan perizinan langsung dari ponsel.

---

## 💻 Panduan Pengembangan Lokal

```bash
# Menjalankan seluruh sistem (Frontend + Backend)
npm start

# Menjalankan hanya backend (Port 5000)
npm run dev:backend

# Menjalankan hanya frontend (Port 3000)
npm run dev:frontend

# Sinkronisasi & Auto-Push ke GitHub
node sync-github.js "pesan commit"
```
