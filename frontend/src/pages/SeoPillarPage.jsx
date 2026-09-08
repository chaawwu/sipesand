import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  CreditCard, 
  Radio, 
  Database, 
  ArrowLeft,
  ExternalLink,
  MessageCircle,
  Share2,
  Clock,
  Layers,
  Award
} from 'lucide-react';
import { SEO_PILLAR_PAGES } from '../data/seoData';
import DeveloperFooter from '../components/DeveloperFooter';

export default function SeoPillarPage({ 
  pillarSlug = 'aplikasi-pesantren', 
  onNavigateHome, 
  onNavigatePillar, 
  onNavigateBlog, 
  onNavigateGateway,
  onNavigateLegal
}) {
  const pillar = SEO_PILLAR_PAGES[pillarSlug] || SEO_PILLAR_PAGES['aplikasi-pesantren'];
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Dynamic Document Title, Meta Description & JSON-LD Schema on render
  useEffect(() => {
    const originalTitle = document.title;
    document.title = pillar.title;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    const prevDesc = metaDesc.content;
    metaDesc.content = pillar.metaDescription;

    // Inject FAQPage JSON-LD schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": (pillar.faqs || []).map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'dynamic-faq-schema';
    script.textContent = JSON.stringify(faqSchema);
    document.head.appendChild(script);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    return () => {
      document.title = originalTitle;
      if (metaDesc) metaDesc.content = prevDesc;
      const existingScript = document.getElementById('dynamic-faq-schema');
      if (existingScript) existingScript.remove();
    };
  }, [pillarSlug, pillar]);

  const otherPillars = Object.values(SEO_PILLAR_PAGES).filter(p => p.slug !== pillar.slug);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pillar.title,
        text: pillar.metaDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan halaman berhasil disalin ke clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top SEO Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onNavigateHome}
              className="flex items-center gap-3 group text-left"
            >
              <img src="/logo.png" alt="SiPesand Logo" className="w-10 h-10 object-contain rounded-xl border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]" />
              <div>
                <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  SiPesand<span className="text-blue-600">.</span>
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Smart Pesantren OS
                </span>
              </div>
            </button>

            <span className="hidden md:inline-block text-slate-300">/</span>
            
            {/* Breadcrumb Pill */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-lime-100 text-slate-900 border border-slate-900">
              <Sparkles className="w-3.5 h-3.5 text-lime-600" />
              {pillar.keyword}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateBlog && onNavigateBlog()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Pusat Edukasi
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border-2 border-slate-900 hover:bg-slate-100 transition-colors"
              title="Bagikan Halaman"
            >
              <Share2 className="w-4 h-4 text-slate-800" />
            </button>

            <a
              href="https://app.sipesand.web.id"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
            >
              Masuk Gateway
              <ExternalLink className="w-4 h-4 text-blue-600" />
            </a>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SiPesand,%20saya%20tertarik%20konsultasi%20solusi%20aplikasi%20pesantren%20digital."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-lime-400 text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-lime-300 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-slate-900" />
              Konsultasi Gratis
            </a>
          </div>
        </div>
      </header>

      {/* Main Breadcrumb bar */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs font-medium text-slate-500 overflow-x-auto whitespace-nowrap">
          <button onClick={onNavigateHome} className="hover:text-blue-600 transition-colors">Beranda</button>
          <span>/</span>
          <span className="text-slate-400">Pillar Otoritas</span>
          <span>/</span>
          <span className="font-bold text-slate-900">{pillar.keyword}</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-gradient-to-b from-white to-[#FAF9F6] border-b-2 border-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border-2 border-slate-900 text-blue-700 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] mb-6">
            <Award className="w-4 h-4 text-blue-600" />
            {pillar.heroBadge}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            {pillar.h1}
          </h1>

          {/* Meta bar: read time, word count, target keywords */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-600 mb-8">
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {pillar.readTime}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              {pillar.wordCount}
            </span>
            <span className="flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-300">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              Standar Kemenag & PSAK 109
            </span>
          </div>

          {/* Intro Box */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-left">
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              {pillar.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Authority Pillar Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          {pillar.sections && pillar.sections.map((sec, idx) => (
            <article 
              key={idx} 
              className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-900 shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] space-y-6"
            >
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                  {idx + 1}
                </span>
                {sec.heading}
              </h2>

              <div className="text-slate-700 leading-relaxed space-y-4 text-base sm:text-lg">
                {sec.content.split('\n\n').map((para, pIdx) => {
                  if (para.startsWith('- ')) {
                    const items = para.split('\n').filter(Boolean);
                    return (
                      <ul key={pIdx} className="space-y-3 pl-2">
                        {items.map((it, itIdx) => (
                          <li key={itIdx} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-lime-500 flex-shrink-0 mt-0.5" />
                            <span className="text-slate-700">
                              {it.replace(/^- /, '').split('**').map((part, bIdx) => 
                                bIdx % 2 === 1 ? <strong key={bIdx} className="text-slate-900 font-black">{part}</strong> : part
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  if (/^\d+\.\s/.test(para)) {
                    const items = para.split('\n').filter(Boolean);
                    return (
                      <ol key={pIdx} className="space-y-3 pl-2">
                        {items.map((it, itIdx) => (
                          <li key={itIdx} className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-900 font-black text-xs flex items-center justify-center border border-slate-400 flex-shrink-0 mt-0.5">
                              {itIdx + 1}
                            </span>
                            <span className="text-slate-700">
                              {it.replace(/^\d+\.\s/, '').split('**').map((part, bIdx) => 
                                bIdx % 2 === 1 ? <strong key={bIdx} className="text-slate-900 font-black">{part}</strong> : part
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    );
                  }

                  return (
                    <p key={pIdx} className="leading-relaxed">
                      {para.split('**').map((chunk, cIdx) => 
                        cIdx % 2 === 1 ? <strong key={cIdx} className="text-slate-900 font-black">{chunk}</strong> : chunk
                      )}
                    </p>
                  );
                })}
              </div>
            </article>
          ))}

          {/* Interactive FAQ Accordion with Schema */}
          <section className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-900 flex items-center justify-center border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">
                <HelpCircle className="w-5 h-5 font-bold" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Pertanyaan Populer (FAQ) {pillar.keyword}
                </h2>
                <p className="text-xs text-slate-500 font-semibold">
                  Jawaban resmi terverifikasi seputar implementasi teknologi pesantren
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {(pillar.faqs || []).map((faq, fIdx) => {
                const isOpen = openFaqIndex === fIdx;
                return (
                  <div 
                    key={fIdx}
                    className={`rounded-xl border-2 border-slate-900 transition-all ${
                      isOpen ? 'bg-blue-50/70 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]' : 'bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : fIdx)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left gap-4 font-bold text-slate-900"
                    >
                      <span className="text-base sm:text-lg leading-snug">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* High-Impact CTA Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-12 rounded-3xl border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-64 h-64 bg-lime-400/20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10 max-w-2xl space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black bg-lime-400 text-slate-900 border border-slate-900 uppercase tracking-wider">
                Implementasi 1-Day Go-Live
              </span>
              <h3 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Siap Wujudkan Pesantren Modern & Salafiyah Berdaulat Teknologi?
              </h3>
              <p className="text-blue-100 text-base leading-relaxed">
                Bergabunglah bersama ratusan pondok pesantren di seluruh Indonesia yang telah mempercayakan operasional harian, presensi RFID, keuangan syahriyah, dan portal wali kepada ekosistem SiPesand.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <a
                  href="https://wa.me/6281234567890?text=Halo%20Admin%20SiPesand,%20kami%20ingin%20jadwalkan%20presentasi%20online%20aplikasi%20pesantren."
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-slate-900 bg-lime-400 hover:bg-lime-300 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm"
                >
                  <MessageCircle className="w-5 h-5 fill-slate-900" />
                  Jadwalkan Demo & Konsultasi
                </a>

                <a
                  href="https://app.sipesand.web.id"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-white bg-slate-900 hover:bg-slate-800 border-2 border-white/40 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm"
                >
                  Masuk Tenant Pesantren
                  <ArrowRight className="w-5 h-5 text-lime-400" />
                </a>
              </div>
            </div>
          </div>

          {/* Internal Link Wheel: 9 Other Pillar Pages */}
          <section className="space-y-6 pt-4">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Pilar Solusi Pesantren Terkait
              </h3>
              <p className="text-sm text-slate-500">
                Eksplorasi ekosistem lengkap sistem informasi pondok pesantren SiPesand
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherPillars.map((op) => (
                <button
                  key={op.slug}
                  onClick={() => onNavigatePillar(op.slug)}
                  className="bg-white p-5 rounded-2xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all text-left flex flex-col justify-between group"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-300 mb-3 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                      {op.keyword}
                    </span>
                    <h4 className="font-black text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {op.title.split('|')[0].trim()}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {op.metaDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-black text-blue-600 mt-4 group-hover:text-blue-700">
                    Pelajari Selengkapnya
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t-2 border-slate-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SiPesand Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1" />
                <span className="text-2xl font-black text-white tracking-tight">SiPesand</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                SiPesand adalah aplikasi pesantren digital dan sistem terpadu manajemen pondok pesantren Indonesia untuk PPDB, absensi RFID, keuangan syahriyah, portal wali santri, dan tahfidz terpadu.
              </p>
              <div className="text-xs text-slate-500">
                Hak Cipta © 2026 SiPesand Ecosystem. All rights reserved.
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Pilar Utama</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => onNavigatePillar('aplikasi-pesantren')} className="hover:text-white transition-colors">Aplikasi Pesantren</button></li>
                <li><button onClick={() => onNavigatePillar('pesantren-digital')} className="hover:text-white transition-colors">Pesantren Digital</button></li>
                <li><button onClick={() => onNavigatePillar('rfid-pesantren')} className="hover:text-white transition-colors">RFID Pesantren</button></li>
                <li><button onClick={() => onNavigatePillar('keuangan-pesantren')} className="hover:text-white transition-colors">Keuangan Syahriyah</button></li>
                <li><button onClick={() => onNavigatePillar('wali-santri')} className="hover:text-white transition-colors">Portal Wali Santri</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Informasi Legal</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('faq')} className="hover:text-white transition-colors">FAQ Pesantren</button></li>
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('terms-and-conditions')} className="hover:text-white transition-colors">Syarat & Ketentuan</button></li>
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('refund-policy')} className="hover:text-white transition-colors">Kebijakan Pengembalian</button></li>
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('kontak')} className="hover:text-white transition-colors">Hubungi Kami</button></li>
                <li><button onClick={() => onNavigateBlog && onNavigateBlog()} className="hover:text-white transition-colors">Pusat Edukasi (Blog)</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
