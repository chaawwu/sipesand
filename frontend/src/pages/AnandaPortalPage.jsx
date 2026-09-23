import React, { useState } from 'react';
import { Download, ArrowRight, ShieldCheck, Check, Search, ExternalLink } from 'lucide-react';

/**
 * ANANDA by SiPesand — GNZI Simple Landing
 * anandaby.sipesand.web.id
 * - Royal Blue #1E3A8A + White + Soft Gray #F8FAFC
 * - Cardless, radius 24, shadow ultra soft, Inter + Poppins feel (Plus Jakarta Sans)
 * - CTA auto-selling ke sipesand.web.id + download APK lokal
 * - Human crafted, bukan template AI
 */
export default function AnandaPortalPage({ onOpenPortalWali, onBackToHome }) {
  const [q, setQ] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim() && onOpenPortalWali) onOpenPortalWali(q.trim());
  };

  const apkUrl = '/ananda-wali-sipesand.apk';
  const apkGithub = 'https://github.com/chaawwu/sipesand/releases/download/v1.6.0-ananda/ananda-wali-sipesand.apk';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased selection:bg-blue-100 flex flex-col">
      {/* Header - GNZI thin */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/70">
        <div className="max-w-[1120px] mx-auto px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] grid place-items-center text-white font-black text-[14px] tracking-tight">A</div>
            <div className="leading-none">
              <div className="flex items-baseline gap-2">
                <span className="text-[16px] font-extrabold tracking-tight text-[#0F172A]">ANANDA</span>
                <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">by SiPesand</span>
              </div>
              <div className="text-[11px] text-slate-500 -mt-0.5">anandaby.sipesand.web.id</div>
            </div>
          </div>
          <nav className="flex items-center gap-2">
            <a href="https://sipesand.web.id" target="_blank" rel="noreferrer" className="hidden sm:inline-flex h-9 px-4 rounded-full border border-slate-200 bg-white text-[13px] font-semibold hover:bg-slate-50 transition items-center gap-1.5">
              Lihat SiPesand <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a href={apkUrl} download className="inline-flex h-9 px-5 rounded-full bg-[#1E3A8A] text-white text-[13px] font-bold hover:bg-[#1E40AF] transition items-center gap-2 shadow-sm">
              <Download className="w-4 h-4" /> Unduh APK
            </a>
          </nav>
        </div>
      </header>

      {/* Hero GNZI */}
      <section className="max-w-[1120px] mx-auto px-6 pt-14 pb-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] font-semibold tracking-wide text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Aplikasi resmi wali santri • sinkron database pesantren
            </div>
            <h1 className="mt-5 text-[34px] sm:text-[42px] font-extrabold tracking-tight leading-[1.05] text-[#0F172A]">
              Dekat dengan ananda,<br />
              <span className="text-[#1E3A8A]">di mana pun ayah bunda berada.</span>
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-slate-600 max-w-[560px]">
              ANANDA adalah aplikasi Android wali santri dari ekosistem <b className="text-[#0F172A]">SiPesand</b>. Satu pintu untuk hafalan, nilai, absensi RFID, uang saku, tagihan QRIS, dan izin pulang — data langsung dari database pesantren, bukan dummy.
            </p>

            {/* Dual CTA */}
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a href={apkUrl} download className="inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-full bg-[#1E3A8A] text-white font-bold text-[14px] hover:bg-[#1E40AF] transition shadow-[0_8px_24px_rgba(30,58,138,0.18)]">
                <Download className="w-[18px] h-[18px]" /> Download Ananda (4,7 MB)
              </a>
              <a href="https://sipesand.web.id" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-2 h-[48px] px-7 rounded-full bg-white border border-slate-200 text-[#0F172A] font-semibold text-[14px] hover:bg-slate-50 transition">
                Pesantren belum pakai SiPesand? <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Android 8+ • semua merk</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> QRIS PaymentKu • kwitansi otomatis</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> OTP WhatsApp • verifikasi otomatis</span>
            </div>

            {/* Quick web check */}
            <form onSubmit={handleSearch} className="mt-7 max-w-[560px] flex gap-2 p-2 rounded-[24px] bg-white border border-slate-200 shadow-sm">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="w-4 h-4 text-slate-400" />
                <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Cek NIS / nama santri tanpa install..." className="w-full h-9 bg-transparent outline-none text-[13px] placeholder:text-slate-400" />
              </div>
              <button type="submit" className="h-9 px-5 rounded-full bg-[#0F172A] text-white text-[13px] font-semibold hover:bg-black transition">Cek</button>
            </form>
            <p className="mt-2 text-[11px] text-slate-400">Tanpa install. Data real dari pesantren yang sudah terhubung SiPesand.</p>
          </div>

          {/* Phone mock - clean cardless */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-[300px] bg-[#0B1220] p-[10px] rounded-[36px] shadow-[0_24px_64px_rgba(15,23,42,0.24)] border border-slate-800">
              <div className="w-20 h-1.5 bg-white/20 rounded-full mx-auto mb-2.5" />
              <div className="bg-white rounded-[28px] overflow-hidden">
                <div className="bg-[#1E3A8A] px-4 pt-4 pb-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white text-[#1E3A8A] grid place-items-center font-black text-xs">A</div>
                      <div className="leading-tight">
                        <div className="text-[12px] font-bold">ANANDA</div>
                        <div className="text-[10px] text-white/70">Wali Santri</div>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/15 grid place-items-center text-xs">🔔</div>
                  </div>
                  <div className="mt-3 bg-white text-[#0F172A] rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 grid place-items-center text-sm">👦🏻</div>
                    <div className="flex-1 leading-tight">
                      <div className="text-[12px] font-bold">Muhammad Farhan</div>
                      <div className="text-[11px] text-slate-500">NIS 202409001 • 3 Aliyah</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Aktif</span>
                  </div>
                </div>
                <div className="p-3 bg-[#F8FAFC] space-y-3">
                  <div className="bg-white rounded-2xl border border-slate-200 p-3">
                    <div className="text-[11px] text-slate-500">Saldo Uang Saku</div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="text-[16px] font-extrabold">Rp 385.000</div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#1E3A8A] text-white">+ Top Up</span>
                    </div>
                    <div className="mt-2 h-px bg-slate-100" />
                    <div className="mt-2 flex justify-between text-[11px]"><span className="text-slate-500">Tagihan aktif 1</span><span className="font-bold text-[#1E3A8A]">Rp 452.500</span></div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Profil','👤'],['Absensi','📡'],['Uang Saku','💳'],
                      ['QRIS','🔳'],['Jadwal','🗓️'],['Nilai','📊']
                    ].map(([l,i])=>(
                      <div key={l} className="bg-white rounded-2xl border border-slate-200 p-3 text-center">
                        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] grid place-items-center mx-auto text-[14px]">{i}</div>
                        <div className="mt-1.5 text-[11px] font-semibold leading-none">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-slate-200 p-3 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 grid place-items-center text-emerald-700 text-xs">✓</div>
                    <div><div className="text-[11px] font-bold">Hafalan terakhir: Al-Kahfi khatam</div><div className="text-[10px] text-slate-500">Mumtaz • Ust. Abdul Halim</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof / 3 values - gnzi whitespace */}
      <section className="max-w-[1120px] mx-auto px-6 w-full">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            ['Data sinkron pesantren','NIS, kelas, kamar & saldo langsung dari DB tenant pesantren. Bukan demo.',' ShieldCheck '],
            ['Bayar ke rekening pesantren','QRIS PaymentKu (paymentku.com) atau transfer manual ke rekening resmi pesantren — kwitansi otomatis.',' CreditCard '],
            ['Wali auto terverifikasi','OTP WhatsApp 1 klik, hubungan NIS auto-cocok. Tanpa tunggu admin berhari-hari.',' MessageCircle '],
          ].map(([title,desc])=>(
            <div key={title} className="bg-white rounded-[24px] border border-slate-200 p-6">
              <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] border border-slate-200 grid place-items-center text-slate-700"><ShieldCheck className="w-5 h-5" /></div>
              <div className="mt-4 text-[14px] font-bold leading-tight">{title}</div>
              <div className="mt-1.5 text-[13px] leading-6 text-slate-600">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Auto-selling to SiPesand */}
      <section className="max-w-[1120px] mx-auto px-6 w-full mt-8">
        <div className="rounded-[24px] bg-white border border-slate-200 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-0">
            <div className="lg:col-span-7 p-8 lg:p-10">
              <div className="text-[11px] font-bold tracking-widest text-[#1E3A8A] uppercase">Untuk Pesantren</div>
              <h2 className="mt-2 text-[22px] font-extrabold tracking-tight">Pesantren Anda belum pakai SiPesand?</h2>
              <p className="mt-3 text-[14px] leading-6 text-slate-600">
                SiPesand adalah OS pesantren: PPDB, RFID, syahriyah Hijriyah, keuangan, tahfidz, perizinan & portal wali ANANDA dalam satu dashboard. Multi-tenant, siap pakai di <b>sipesand.web.id</b>.
                Daftar hari ini, subdomain pesantren aktif otomatis, wali bisa langsung install ANANDA.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://sipesand.web.id" target="_blank" rel="noreferrer" className="inline-flex h-11 px-6 rounded-full bg-[#0F172A] text-white font-bold text-[13px] items-center gap-2 hover:bg-black transition">Daftar Pesantren di SiPesand <ArrowRight className="w-4 h-4" /></a>
                <a href="https://sipesand.web.id?view=app" target="_blank" rel="noreferrer" className="inline-flex h-11 px-6 rounded-full bg-white border border-slate-200 font-semibold text-[13px] items-center hover:bg-slate-50 transition">Lihat Demo</a>
              </div>
              <div className="mt-4 text-[11px] text-slate-400">Gratis trial • setup &lt; 1 hari • support WhatsApp</div>
            </div>
            <div className="lg:col-span-5 bg-[#F8FAFC] border-t lg:border-t-0 lg:border-l border-slate-200 p-8 flex flex-col justify-center gap-4">
              <div className="text-[12px] font-bold text-slate-700">Yang didapat pesantren:</div>
              <ul className="space-y-2 text-[13px] text-slate-600">
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5" /> Subdomain: namapesantren.sipesand.web.id</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5" /> ANANDA wali auto-sinkron</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5" /> Pembayaran QRIS ke rekening pesantren</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-600 mt-0.5" /> Laporan keuangan & akademik real-time</li>
              </ul>
              <a href="https://sipesand.web.id#pricing" target="_blank" rel="noreferrer" className="text-[13px] font-semibold text-[#1E3A8A] hover:underline inline-flex items-center gap-1">Lihat paket & harga <ArrowRight className="w-3.5 h-3.5" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Download proof */}
      <section className="max-w-[1120px] mx-auto px-6 w-full mt-8">
        <div className="rounded-[24px] bg-[#1E3A8A] text-white p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="text-[13px] font-semibold text-white/80">Siap install?</div>
            <div className="text-[20px] font-extrabold tracking-tight">Download ANANDA by SiPesand sekarang</div>
            <div className="text-[12px] text-white/70 mt-1">File resmi • update otomatis • bisa juga via GitHub Releases sebagai mirror</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={apkUrl} download className="inline-flex h-11 px-6 rounded-full bg-white text-[#1E3A8A] font-extrabold text-[13px] items-center justify-center gap-2 hover:bg-slate-100 transition">
              <Download className="w-4 h-4" /> /ananda-wali-sipesand.apk
            </a>
            <a href={apkGithub} target="_blank" rel="noreferrer" className="inline-flex h-11 px-6 rounded-full bg-white/10 border border-white/20 text-white font-semibold text-[13px] items-center justify-center gap-2 hover:bg-white/15 transition">
              Mirror GitHub <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="mt-3 text-center text-[11px] text-slate-400">SHA • v1.6.0-ananda • 4,7 MB • Jika Chrome blokir, tap “Tetap download” → buka file → Izinkan install dari browser.</div>
      </section>

      {/* FAQ minimal */}
      <section className="max-w-[840px] mx-auto px-6 w-full mt-10">
        <h3 className="text-center text-[14px] font-extrabold tracking-tight">FAQ singkat</h3>
        <div className="mt-4 grid gap-3">
          {[
            ['Apakah ANANDA bisa di-download sekarang?','Ya. Tombol di atas langsung mengunduh /ananda-wali-sipesand.apk dari server Cloudflare Pages. Mirror GitHub juga aktif. Versi 1.6.0-ananda, 4,7 MB.'],
            ['Pesantren saya belum ada di daftar?','Hubungi admin pesantren untuk aktivasi SiPesand di sipesand.web.id. Setelah aktif, wali bisa login ANANDA dengan NIS.'],
            ['Pembayaran masuk ke mana?','Ke rekening resmi pesantren/tenant masing-masing. Opsi QRIS PaymentKu (paymentku.com) juga settlement langsung ke rekening pesantren per-tenant.'],
          ].map(([q2,a])=>(
            <div key={q2} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="text-[13px] font-bold">{q2}</div>
              <div className="mt-1 text-[13px] leading-6 text-slate-600">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-slate-200 bg-white">
        <div className="max-w-[1120px] mx-auto px-6 h-[64px] flex items-center justify-between text-[12px] text-slate-500">
          <span>© {new Date().getFullYear()} ANANDA by SiPesand • anandaby.sipesand.web.id</span>
          <div className="flex gap-4">
            <a href="https://sipesand.web.id" className="hover:text-[#0F172A] font-semibold">sipesand.web.id</a>
            <a href="https://sipesand.web.id?view=app" className="hover:text-[#0F172A]">Demo Pesantren</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
