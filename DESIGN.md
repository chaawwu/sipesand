# Design System: SIPESAND

<!-- impeccable:design-schema 1 -->

## Design Philosophy

SIPESAND menggunakan pendekatan **Institutional Clarity & Modern Islamic Restraint**:
- Desain berfokus pada efisiensi operasional pengurus pesantren dan kenyamanan membaca bagi wali santri.
- Mengadopsi prinsip desain Linear, Stripe, dan sistem perbankan syariah: terstruktur, padat informasi, tanpa visual noise.

## Color Palette & Tokens

### Primary & Accent
- **Primary Brand (Blue)**: `#1D4ED8` (Tailwind `blue-700`) - Aksi utama, link aktif, tombol primer.
- **Islamic Emerald (Tenant Accent)**: `#047857` (Tailwind `emerald-700`) - Nuansa khas pesantren salaf/terpadu, status aktif, status lunas.
- **Warning / Pending**: `#D97706` (Tailwind `amber-600`) - Tagihan belum lunas, izin keluar berbatas waktu.
- **Danger / Urgent**: `#DC2626` (Tailwind `rose-600`) - Saldo menipis, pelanggaran santri, takziran.

### Neutrals
- **Background Utama**: `#F8FAFC` (Slate-50) - Latar belakang bersih dan sejuk di mata.
- **Surface / Card**: `#FFFFFF` (White) - Kartu bento berbingkai `border border-slate-200`.
- **Text Primary**: `#0F172A` (Slate-900) - Judul, nominal rupiah, NIS, nama santri.
- **Text Secondary**: `#475569` (Slate-600) - Label form, deskripsi keterangan.
- **Text Muted**: `#64748B` (Slate-500) - Timestamp, nomor rekening, catatan kaki.

### Strict Contrast Rules (Impeccable Guardrails)
- **TIDAK BOLEH** menggunakan `text-slate-400/500/600` di atas latar belakang berwarna terang (seperti `bg-blue-50`, `bg-emerald-50`, `bg-rose-50`). Wajib gunakan shade yang senada: `text-blue-700 on bg-blue-50`, `text-emerald-700 on bg-emerald-50`, `text-rose-700 on bg-rose-50`.
- **TIDAK BOLEH** menggunakan teks gradien (`bg-clip-text text-transparent`) untuk heading atau angka nominal. Semua angka dan nominal wajib solid `#0F172A` atau warna semantiknya.
- **TIDAK BOLEH** menggunakan animasi `animate-bounce` yang terkesan murahan. Gunakan transisi halus `transition-all duration-150 ease-out`.

## Typography

- **Headings & Brand**: `Poppins`, `Righteous` (untuk logo brand), atau `sans-serif` berbobot tebal (`font-bold` / `font-extrabold`).
- **Body & Tabular Data**: `Inter` / `system-ui` dengan `font-variant-numeric: tabular-nums` untuk kolom saldo, nominal uang saku, dan NIS santri.

## Spacing & Layout

- Grid bento adaptif: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4`.
- Radius konsisten: `rounded-2xl` untuk kartu bento utama, `rounded-xl` untuk tombol dan input field.
- Bayangan halus: `shadow-sm` atau `shadow-[0_1px_3px_rgba(0,0,0,0.06)]`, tidak menggunakan bayangan hitam pekat (`shadow-2xl`).

## KTS Card Standards (CR-80 Format)

- Standar fisik kartu ATM perbankan: rasio `85.6mm × 53.98mm` (1.586).
- 4 Tema institusional: Classic Islamic Green, Modern Bento Royal Blue, Academic Maroon, Cyber Minimalist Slate.
- QR Code dan Barcode beresolusi tinggi dengan kontras tajam untuk akurasi pembacaan scanner optik gerbang dan pos kantin.
