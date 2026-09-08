import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Share2, 
  Tag, 
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { BLOG_CATEGORIES, ALL_BLOG_ARTICLES } from '../data/blogData';

export default function BlogPage({
  initialSlug = null,
  onNavigateHome,
  onNavigatePillar,
  onNavigateArticle,
  onNavigateLegal
}) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlug, setActiveSlug] = useState(initialSlug);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Sync activeSlug if initialSlug changes
  useEffect(() => {
    setActiveSlug(initialSlug);
  }, [initialSlug]);

  const activeArticle = useMemo(() => {
    if (!activeSlug) return null;
    return ALL_BLOG_ARTICLES.find(a => a.slug === activeSlug) || null;
  }, [activeSlug]);

  // Dynamic SEO title & schema
  useEffect(() => {
    const originalTitle = document.title;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (activeArticle) {
      document.title = `${activeArticle.title} | Blog SiPesand`;

      // Inject BlogPosting JSON-LD Schema
      const blogSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": activeArticle.title,
        "description": activeArticle.excerpt,
        "author": {
          "@type": "Organization",
          "name": activeArticle.author
        },
        "publisher": {
          "@type": "Organization",
          "name": "SiPesand",
          "logo": {
            "@type": "ImageObject",
            "url": "https://sipesand.web.id/logo.png"
          }
        },
        "datePublished": activeArticle.date,
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `https://sipesand.web.id/blog/${activeArticle.slug}`
        }
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'dynamic-blog-schema';
      script.textContent = JSON.stringify(blogSchema);
      document.head.appendChild(script);

      return () => {
        document.title = originalTitle;
        const s = document.getElementById('dynamic-blog-schema');
        if (s) s.remove();
      };
    } else {
      document.title = 'Pusat Edukasi & Blog Pesantren Digital | SiPesand 2026';
      return () => {
        document.title = originalTitle;
      };
    }
  }, [activeArticle]);

  // Filtered list of articles
  const filteredArticles = useMemo(() => {
    return ALL_BLOG_ARTICLES.filter(art => {
      const matchCat = selectedCategory === 'ALL' || art.category === selectedCategory;
      const matchQuery = !searchQuery.trim() || 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: activeArticle ? activeArticle.title : 'Pusat Edukasi SiPesand',
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Tautan artikel berhasil disalin!');
    }
  };

  const handleSelectArticle = (slug) => {
    setActiveSlug(slug);
    if (onNavigateArticle) onNavigateArticle(slug);
    window.history.pushState({}, '', `/blog/${slug}`);
  };

  const handleBackToDirectory = () => {
    setActiveSlug(null);
    if (onNavigateArticle) onNavigateArticle(null);
    window.history.pushState({}, '', '/blog');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navigation Bar */}
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
                  Pusat Edukasi & Blog
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigatePillar && onNavigatePillar('aplikasi-pesantren')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              Solusi Aplikasi
            </button>

            <a
              href="https://wa.me/6281234567890?text=Halo%20Admin%20SiPesand,%20saya%20tertarik%20konsultasi%20digitalisasi%20pesantren."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black bg-lime-400 text-slate-900 border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:bg-lime-300 hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-slate-900" />
              Konsultasi
            </a>
          </div>
        </div>
      </header>

      {/* ARTICLE READER VIEW */}
      {activeArticle ? (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <button onClick={onNavigateHome} className="hover:text-blue-600">Beranda</button>
            <span>/</span>
            <button onClick={handleBackToDirectory} className="hover:text-blue-600">Pusat Edukasi</button>
            <span>/</span>
            <span className="text-slate-900 truncate max-w-xs">{activeArticle.title}</span>
          </div>

          <button
            onClick={handleBackToDirectory}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Daftar Artikel
          </button>

          {/* Article Header Card */}
          <article className="bg-white p-6 sm:p-10 rounded-2xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
                {BLOG_CATEGORIES.find(c => c.id === activeArticle.category)?.name || activeArticle.category}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {activeArticle.date}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {activeArticle.readTime}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {activeArticle.author}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
              {activeArticle.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium italic border-l-4 border-lime-400 pl-4 py-1">
              "{activeArticle.excerpt}"
            </p>

            <div className="border-t border-slate-200 pt-6 text-slate-800 leading-relaxed space-y-4 text-base sm:text-lg">
              <p>
                {activeArticle.content}
              </p>
              <p>
                Penerapan sistem terpadu pada operasional pondok pesantren terbukti meningkatkan akurasi data hingga 99%, menekan potensi sengketa kas santri, dan memberikan rasa aman yang tinggi bagi para wali santri di kampung halaman.
              </p>
              
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-300 space-y-2">
                <h3 className="font-black text-slate-900 text-base">Key Takeaways & Rekomendasi:</h3>
                <ul className="list-disc pl-5 text-sm sm:text-base space-y-1 text-slate-700">
                  <li>Otomatisasi pencatatan mencegah beban kerja berlebih pada jajaran asatidz dan dewan pengurus pondok.</li>
                  <li>Sistem cloud terisolasi memastikan 100% kedaulatan data santri tanpa ketergantungan pihak ketiga komersial.</li>
                  <li>Sinkronisasi kalender Hijriyah mempermudah penetapan tanggal syahriyah bulanan secara adil dan teratur.</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Bagikan Artikel Ini
              </button>

              <a
                href="https://wa.me/6281234567890?text=Halo%20Admin%20SiPesand,%20saya%20membaca%20artikel%20dan%20ingin%20tahu%20lebih%20lanjut."
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-lime-400 hover:bg-lime-300 border border-slate-900 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Tanya Konsultan
              </a>
            </div>
          </article>

          {/* Related Articles in the same category */}
          <section className="space-y-4 pt-4">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              Artikel Terkait Kategori Ini
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {ALL_BLOG_ARTICLES
                .filter(a => a.category === activeArticle.category && a.slug !== activeArticle.slug)
                .slice(0, 3)
                .map(rel => (
                  <button
                    key={rel.slug}
                    onClick={() => handleSelectArticle(rel.slug)}
                    className="bg-white p-4 rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[5px_5px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-0.5 transition-all text-left flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{rel.date}</span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1 line-clamp-2 leading-snug">
                        {rel.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-black text-blue-600 mt-3">
                      Baca <ArrowRight className="w-3 h-3" />
                    </div>
                  </button>
                ))}
            </div>
          </section>
        </main>
      ) : (
        /* DIRECTORY CATALOG VIEW (100 SEO Articles) */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
          {/* Header Banner */}
          <div className="bg-white p-8 sm:p-12 rounded-3xl border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-lime-100 text-slate-900 border border-slate-900 uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-lime-600" />
              Pusat Edukasi & Otoritas SiPesand
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Pusat Pengetahuan Pesantren Digital
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Koleksi 100+ artikel panduan teknis, strategi tata kelola santri, akuntansi syariah PSAK 109, dan teknologi smart pesantren terdepan di Indonesia.
            </p>

            {/* Search Input Bar */}
            <div className="max-w-xl mx-auto relative pt-4">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 mt-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari topik (contoh: RFID, PSAK 109, PPDB, Wali Santri, Tahfidz)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm font-medium"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-900 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Semua Kategori ({ALL_BLOG_ARTICLES.length})
            </button>
            {BLOG_CATEGORIES.map(cat => {
              const count = ALL_BLOG_ARTICLES.filter(a => a.category === cat.id).length;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setCurrentPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black border-2 border-slate-900 transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((article) => {
              const catObj = BLOG_CATEGORIES.find(c => c.id === article.category);
              return (
                <button
                  key={article.slug}
                  onClick={() => handleSelectArticle(article.slug)}
                  className="bg-white p-6 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1 transition-all text-left flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300">
                        {catObj?.icon} {catObj?.name || article.category}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className="font-black text-base sm:text-lg text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-5 flex items-center justify-between text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {article.date}
                    </span>
                    <span className="text-blue-600 font-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Baca Lengkap <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Empty state */}
          {filteredArticles.length === 0 && (
            <div className="bg-white p-12 rounded-2xl border-2 border-slate-900 text-center space-y-3">
              <p className="font-bold text-slate-700">Tidak ada artikel yang cocok dengan pencarian Anda.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-blue-600 text-white"
              >
                Reset Pencarian
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-slate-900 bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                Sebelumnya
              </button>

              <span className="text-xs font-bold text-slate-700 px-3">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-slate-900 bg-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
              >
                Selanjutnya
              </button>
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t-2 border-slate-900 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4 md:col-span-2">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="SiPesand Logo" className="w-10 h-10 object-contain rounded-xl bg-white p-1" />
                <span className="text-2xl font-black text-white tracking-tight">SiPesand</span>
              </div>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Pusat edukasi dan wawasan terlengkap untuk modernisasi ekosistem pesantren di Indonesia.
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
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-3">Legal & Kontak</h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('terms-and-conditions')} className="hover:text-white transition-colors">Syarat Ketentuan</button></li>
                <li><button onClick={() => onNavigateLegal && onNavigateLegal('kontak')} className="hover:text-white transition-colors">Kontak Kami</button></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
