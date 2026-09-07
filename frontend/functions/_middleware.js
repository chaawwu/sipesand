// Cloudflare Pages Subdomain & Multi-Page Middleware
// Otomatis menyajikan HTML yang sesuai untuk masing-masing domain/subdomain
export async function onRequest(context) {
  const url = new URL(context.request.url);
  const hostname = url.hostname.toLowerCase();

  // Biarkan request asset statis (gambar, css, js, svg) dan API diproses langsung
  if (url.pathname.startsWith('/api/') || url.pathname.includes('.')) {
    return context.next();
  }

  // 1. Mitra Portal (mitra.sipesand.web.id)
  if (hostname.startsWith('mitra.')) {
    return context.env.ASSETS.fetch(new URL('/mitra.html', context.request.url));
  }

  // 2. Aplikasi Pesantren (app.sipesand.web.id)
  if (hostname.startsWith('app.') || hostname.startsWith('apps.')) {
    return context.env.ASSETS.fetch(new URL('/app.html', context.request.url));
  }

  // 3. Frontend Tenant Pesantren ([namapondok].sipesand.web.id)
  const baseDomains = ['sipesand.web.id', 'sipesand.we.id'];
  const isBase = baseDomains.some(b => hostname === b || hostname.startsWith('www.'));
  if (!isBase && hostname.includes('sipesand.')) {
    return context.env.ASSETS.fetch(new URL('/tenant.html', context.request.url));
  }

  // 4. Default: Landing Page Utama (sipesand.web.id)
  return context.env.ASSETS.fetch(new URL('/index.html', context.request.url));
}
