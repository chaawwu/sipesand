# SiPesand (Sistem Terpadu Pesantren Digital) 🕌✨

SiPesand adalah sistem informasi manajemen pesantren modern berbasis fullstack yang mengintegrasikan:
1. **Portal Utama Tech Startup (Landing Page)**: Pelacakan santri instan via NIS/Nama/NFC dengan kartu glassmorphism modern.
2. **Dashboard Super Admin & Pengurus**: Manajemen santri, perizinan keluar/pulang dengan deteksi overdue, buku kas umum, dan terminal POS kasir kantin.
3. **Uang Saku & Kas Terpadu**: Pemotongan saldo uang saku santri via Scan NFC dengan proteksi middleware otorisasi pengurus dan opsi darurat (saldo minus).
4. **Dokumen Resmi Siap Cetak**: Cetak Kartu Tanda Santri Digital (KTSD seukuran ATM) dengan QR code dinamis dan pas foto, serta Kwitansi Resmi otomatis dengan nominal terbilang dan cap stempel digital sah.

---

## ⚡ Cara Menjalankan Aplikasi Secara Bersamaan (1 Perintah)

Aplikasi telah dilengkapi dengan script runner simultan yang menjalankan **Backend (Port 5000)** dan **Frontend (Port 3000)** sekaligus:

### Melalui Terminal / NPM:
```bash
npm start
```
*atau:*
```bash
node start.js
```

### Melalui Windows 1-Klik:
- Klik ganda file [`start.bat`](file:///c:/sipesand-app/start.bat) atau jalankan [`start.ps1`](file:///c:/sipesand-app/start.ps1).

---

## 🌐 Akses Preview Aplikasi

| Layanan | URL Akses | Keterangan |
| :--- | :--- | :--- |
| **Frontend Web App** | **`http://localhost:3000`** | Portal Utama, Pusat Lacak Santri, Dashboard Super Admin, Cetak KTSD & Kwitansi |
| **Backend REST API** | **`http://localhost:5000/api`** | Root API & Healthcheck |
| **Dashboard Stats API** | **`http://localhost:5000/api/dashboard/stats`** | Endpoint Metrik & Rekapitulasi Real-Time |

---

## 📁 Struktur Folder Proyek

```
sipesand-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Skema SQLite (Santri, GeneralLedger, PocketTx, Permit)
│   │   ├── dev.db              # Database SQLite lokal
│   │   └── seed.js             # Script sample data awal
│   ├── src/
│   │   ├── config/prisma.js    # Prisma client singleton
│   │   ├── controllers/        # santri, pocketTx, ledger, permit, dashboard
│   │   ├── middlewares/        # authPengurus.js (Verifikasi otorisasi pengurus)
│   │   ├── routes/             # REST API endpoints
│   │   ├── app.js
│   │   └── server.js           # Server Express (Port 5000)
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx             # Sidebar modern & role switcher
│   │   │   ├── Header.jsx              # Status topbar & navigasi portal
│   │   │   ├── NfcScannerModal.jsx     # Simulator Smart NFC Reader
│   │   │   ├── SantriTrackerModal.jsx  # Pop-up glassmorphism pelacak status santri
│   │   │   ├── SantriIdCard.jsx        # [BARU] Kartu Tanda Santri (KTSD ukuran ATM)
│   │   │   └── OfficialReceipt.jsx     # [BARU] Kwitansi otomatis + cap stempel digital
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Portal utama tech startup glassmorphism
│   │   │   ├── PocketAndCash.jsx       # Halaman Uang Saku & Kas (Super Admin)
│   │   │   ├── Dashboard.jsx           # Beranda metrik pesantren
│   │   │   ├── Santri.jsx              # Manajemen data santri & cetak KTSD
│   │   │   ├── PocketMoney.jsx         # Terminal POS Kasir Kantin
│   │   │   ├── Ledger.jsx              # Buku Kas Umum & Cetak Kwitansi
│   │   │   └── Permits.jsx             # Manajemen Perizinan & Overdue
│   │   ├── utils/
│   │   │   └── terbilang.js            # Konversi nominal ke kalimat Bahasa Indonesia
│   │   ├── services/api.js             # Axios client API
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── start.js                            # Script runner backend + frontend
├── start.bat                           # Launcher Windows Batch
├── start.ps1                           # Launcher PowerShell
├── package.json                        # Root monorepo configuration
└── README.md
```
