# ☁️ Panduan Integrasi Cloudflare DNS, SSL, & Payment Gateway SiPesand (`sipesand.web.id`)

Dokumen ini adalah panduan resmi *turn-key* untuk menghubungkan domain **`sipesand.web.id`** dan seluruh subdomain pesantren mitra (**`*.sipesand.web.id`**) menggunakan **Cloudflare DNS + SSL Full (Strict)** agar sistem langsung aktif tanpa konfigurasi manual yang rumit.

---

## 📋 1. Tabel DNS Records Cloudflare (DNS Management)

Buka dashboard [Cloudflare](https://dash.cloudflare.com) ➔ Pilih domain **`sipesand.web.id`** ➔ Masuk menu **DNS** ➔ **Records**, lalu tambahkan baris berikut:

| Type | Name | Content / Target | Proxy Status | TTL | Keterangan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A** | `@` | `[IP_PUBLIC_VPS_ANDA]` | **Proxied (🟠 Orange Cloud)** | Auto | Domain utama platform SaaS |
| **A** | `*` | `[IP_PUBLIC_VPS_ANDA]` | **Proxied (🟠 Orange Cloud)** | Auto | **Wildcard Subdomain** (Untuk semua pondok otomatis) |
| **A** | `api` | `[IP_PUBLIC_VPS_ANDA]` | **Proxied (🟠 Orange Cloud)** | Auto | Dedicated API Subdomain |
| **CNAME** | `www` | `sipesand.web.id` | **Proxied (🟠 Orange Cloud)** | Auto | Alias www |

> [!IMPORTANT]
> Pastikan status **Proxy Status** aktif (**🟠 Proxied**) untuk menyembunyikan IP asli VPS dari serangan DDoS dan mengaktifkan sertifikat SSL gratis Cloudflare.

---

## 🔒 2. Konfigurasi SSL/TLS di Cloudflare

1. Masuk ke menu **SSL/TLS** di Cloudflare Dashboard.
2. Pada **Overview**, pilih mode enkripsi: **Full** atau **Full (Strict)**.
3. Masuk ke tab **Edge Certificates**:
   - Aktifkan **Always Use HTTPS**: `ON`
   - Aktifkan **Automatic HTTPS Rewrites**: `ON`
   - Minimum TLS Version: `TLS 1.2`
   - Aktifkan **Opportunistic Encryption**: `ON`

---

## 🛡️ 3. Konfigurasi WAF / Firewall Passthrough untuk Webhook Payment Gateway

Agar callback notifikasi dari Payment Gateway (Midtrans, Xendit, atau King Digital PG) tidak terblokir oleh bot protection Cloudflare:

1. Buka menu **Security** ➔ **WAF** ➔ **Custom Rules** ➔ Klik **Create Rule**.
2. Beri nama: `Allow Payment Gateway Webhooks`.
3. Set kondisi:
   - Field: `URI Path`
   - Operator: `starts with`
   - Value: `/api/webhook`
4. Action: **Bypass** (atau **Skip: All remaining Custom Rules & Bot Management**).
5. Klik **Deploy**.

---

## ⚡ 4. Aturan Caching Cloudflare (Page Rules / Cache Rules)

Agar data keuangan real-time dan dashboard pengurus tidak tersimpan di cache:

1. Buka menu **Caching** ➔ **Cache Rules** ➔ Klik **Create Rule**.
2. Beri nama: `Bypass API & Webhooks`.
3. Kondisi:
   - `When incoming requests match: URI Path starts with /api/`
4. Cache eligibility: **Bypass cache**.
5. Klik **Deploy**.

---

## 🚀 5. Perintah Menjalankan Server di VPS (1-Click Run)

Jalankan perintah ini di VPS Anda untuk memulai aplikasi:

```bash
# 1. Jalankan script deploy otomatis
chmod +x deploy.sh
./deploy.sh
```

Aplikasi Anda kini **100% online dan live** di:
- 🌐 Platform SaaS: `https://sipesand.web.id`
- 🕌 Portal Mitra (Contoh): `https://tazakka.sipesand.web.id`
- 💳 Webhook Listener: `https://sipesand.web.id/api/webhook/pg`
