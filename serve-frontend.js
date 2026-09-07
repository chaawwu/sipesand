const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'frontend/dist');

// Serve static assets (js, css, images, dll)
app.use(express.static(distPath));

// Multi-Host & Subdomain HTML Serving
app.get('*', (req, res) => {
  const host = (req.hostname || req.headers.host || '').toLowerCase();
  const searchParams = req.query || {};

  // 1. Cek Portal Mitra (mitra.sipesand.web.id)
  if (host.startsWith('mitra.') || searchParams.view === 'mitra' || searchParams.view === 'developer') {
    return res.sendFile(path.join(distPath, 'mitra.html'));
  }

  // 2. Cek Aplikasi Pesantren (app.sipesand.web.id atau apps.sipesand.web.id)
  if (host.startsWith('app.') || host.startsWith('apps.') || searchParams.view === 'app' || searchParams.view === 'apps') {
    return res.sendFile(path.join(distPath, 'app.html'));
  }

  // 3. Cek Frontend Tenant Pesantren (misal: darulrahman.sipesand.web.id)
  const baseDomains = ['sipesand.web.id', 'sipesand.we.id', 'localhost', '127.0.0.1'];
  const isBase = baseDomains.some(b => host === b || host.startsWith('www.'));
  if (!isBase && host.includes('sipesand.')) {
    return res.sendFile(path.join(distPath, 'tenant.html'));
  }
  if (searchParams.tenant || searchParams.pondok || searchParams.view === 'tenant' || searchParams.view === 'tenant-portal') {
    return res.sendFile(path.join(distPath, 'tenant.html'));
  }

  // 4. Default: Landing Page Utama SiPesand (sipesand.web.id)
  return res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SiPesand Multi-Page Frontend Production Server running on port ${PORT}`);
  console.log(`   - Landing Page:     http://sipesand.web.id        (dist/index.html)`);
  console.log(`   - Aplikasi Utama:   http://app.sipesand.web.id    (dist/app.html)`);
  console.log(`   - Portal Mitra:     http://mitra.sipesand.web.id  (dist/mitra.html)`);
  console.log(`   - Frontend Tenant:  http://[pondok].sipesand.web.id (dist/tenant.html)`);
});
