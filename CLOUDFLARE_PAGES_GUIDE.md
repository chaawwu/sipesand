# 🚀 Panduan Deploy SiPesand ke Cloudflare Pages (100% Gratis & Tanpa Ribet)

Aplikasi frontend SiPesand kini telah **100% kompatibel dan siap di-deploy langsung ke Cloudflare Pages**.

---

## 🌟 Keuntungan Cloudflare Pages (100% Gratis):
- **Bandwidth & Request Unlimited**: Tanpa biaya bulanan / limit kuota.
- **Global CDN Ultra Cepat**: Website dimuat dalam hitungan milidetik dari server Cloudflare terdekat di Indonesia.
- **Otomatis SSL (HTTPS)**: Sertifikat SSL otomatis aktif untuk `sipesand.web.id` dan seluruh subdomain.
- **Auto SPA Routing**: Telah dilengkapi berkas `_redirects` dan `_headers` untuk routing mulus tanpa reload.

---

## 🛠️ Cara Deploy ke Cloudflare Pages (Pilih Salah Satu Metode)

### Metode 1: Langsung Drag & Drop Folder `dist` (Paling Mudah - 1 Menit)
1. Buka dashboard **[Cloudflare](https://dash.cloudflare.com/)** ➔ Pilih menu **Workers & Pages** ➔ Klik **Create Application** ➔ Pilih tab **Pages** ➔ Klik **Upload Assets**.
2. Beri nama proyek: `sipesand-app`.
3. Buka folder `c:\sipesand-app\frontend\dist` di komputer Anda, lalu **drag & drop (tarik dan lepaskan)** seluruh isi folder `dist` tersebut ke layar Cloudflare.
4. Klik **Deploy site**. Selesai! 🎉

---

### Metode 2: Hubungkan via GitHub (Otomatis Deploy Tiap Update)
1. Push source code proyek Anda ke repositori GitHub.
2. Di Cloudflare Pages, klik **Connect to Git** ➔ Pilih repositori `sipesand-app`.
3. Pengaturan Build:
   - **Framework preset**: `Vite`
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Build output directory**: `frontend/dist`
   - **Root directory**: `/`
4. Klik **Save and Deploy**.

---

## 🌐 Menghubungkan Custom Domain & Wildcard Subdomain di Cloudflare Pages

1. Setelah proyek Pages ter-deploy, masuk ke tab **Custom domains** di dalam proyek Pages Anda.
2. Klik **Set up a custom domain** ➔ Masukkan: `sipesand.web.id`.
3. Tambahkan domain/subdomain resmi:
   - `sipesand.web.id` (Domain Utama)
   - `app.sipesand.web.id` (Aplikasi Pesantren)
   - `mitra.sipesand.web.id` (Panel Pendaftaran Mitra)
   - `pay.sipesand.web.id` (Portal Pembayaran Wali & Lisensi)
4. Cloudflare akan otomatis mengonfigurasi DNS dan menerbitkan SSL dalam waktu 1 menit!

---

## ⚡ Alur Kerja Multi-Tenant Otomatis:

```
[Pengunjung Buka: nama-pondok.sipesand.web.id]
        ↓
1. Cloudflare Pages Global CDN (Menyajikan UI React Super Cepat)
        ↓
2. _redirects Rule (/api/* -> https://api.sipesand.web.id/api/*)
        ↓
3. Backend Express & tenantResolver.js (Auto-Connect Database SQLite Mandiri)
        ↓
[Portal Pesantren Langsung Terbuka & Aktif Seketika!]
```
