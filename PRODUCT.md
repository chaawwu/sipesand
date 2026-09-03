# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Pengasuh Pondok Pesantren, Bendahara Yayasan, Kepala Pondok / Bagian Muhafadzoh, Pengurus Uang Saku & Kasir Kantin, Divisi Keamanan (Kamtib Gerbang), serta Wali Santri yang mengakses portal mandiri secara transparan.

## Product Purpose

SIPESAND (Sistem Informasi Pesantren Terpadu) menyediakan ekosistem manajemen pesantren modern yang amanah, akuntabel, dan 100% transparan:
1. Otomasi tagihan syahriyah bulanan & kwitansi pembayaran resmi.
2. Manajemen tabungan uang saku santri berbasis kartu pintar Smart NFC (cashless) dengan batasan jajan harian dan mutasi real-time.
3. Pencatatan buku kas umum (BKU) dan pelaporan keuangan yayasan.
4. Monitoring perizinan keluar/masuk santri di pos gerbang keamanan.
5. Evaluasi setoran hafalan Al-Qur'an (Tahfidz) dan sorogan kitab kuning.
6. Portal mandiri wali santri tanpa login ribet untuk pengecekan saldo, riwayat transaksi, dan tagihan.

## Positioning

Sistem Enterprise Boarding School berstandar perbankan syariah yang menyatukan tradisi keilmuan pesantren salaf dengan teknologi digital modern. Dirancang khusus untuk operasional riil ribuan santri dengan keandalan offline-first / local-first, sinkronisasi Cloudflare Edge, dan transaksi atomik Firestore.

## Operating Context

- **sipesand.web.id**: Landing page publik SaaS Enterprise untuk informasi dan pemesanan lisensi pesantren.
- **apps.sipesand.web.id / app.sipesand.web.id**: Gerbang login tunggal (SSO Gateway) pengurus dan panel aplikasi utama.
- **mitra.sipesand.web.id**: Portal pusat mitra developer dan reseller King Digital Dev.
- **namapondok.sipesand.web.id** (misal: `darulrahman.sipesand.web.id`): Portal resmi mandiri pesantren tenant lengkap dengan jadwal kegiatan, kalender pondok, dan cek perizinan santri.

## Capabilities and Constraints

- 10 Modul Inti Operasional: Dashboard, Database Santri & Studio KTS CR-80, Tagihan & Kwitansi, Verifikasi Pembayaran, Buku Kas Umum, Uang Saku & POS Kasir, Akademik Tahfidz, Keamanan Kamtib, Visual Website Builder, dan Pengaturan Lembaga.
- Transaksi Uang Saku wajib bersifat atomik (anti race-condition / saldo ganda).
- Desain wajib mematuhi standar perbankan profesional: kontras rasio WCAG 2.1 AA, tipografi jelas dan terbaca oleh dewan asatidz dan wali santri, tanpa elemen AI murahan (no purple blobs, no glowing neon, no tacky bounce animations).

## Brand Commitments

- **Amanah & Profesional**: Antarmuka bersih menyerupai standar aplikasi fintech perbankan (BSI, Stripe, Linear).
- **Nuansa Pesantren Modern**: Penggunaan warna institusional (Navy Blue #1D4ED8, Hijau Zamrud Islami #047857, Slate Neutral).
- **Anti-AI Tells**: Menolak keras gradien ungu acak, teks abu-abu di atas latar berwarna terang, teks gradien pada angka penting, dan card bersarang tanpa hierarki.

Three-word personality: **amanah, teratur, terpercaya**.

## Product Principles

1. **Kejelasan Informasi**: Angka saldo dan status pembayaran harus langsung terlihat jelas dan tegas.
2. **Keandalan Eksekusi**: Setiap input data santri, setoran saku, dan kas harus langsung tersimpan persisten.
3. **Restraint & Dignity**: Desain mencerminkan wibawa lembaga pendidikan Islam, bebas dari ornamen berlebihan.
