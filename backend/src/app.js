const express = require('express');
const cors = require('cors');

// Import all routes
const santriRoutes = require('./routes/santriRoutes');
const pocketTxRoutes = require('./routes/pocketTxRoutes');
const ledgerRoutes = require('./routes/ledgerRoutes');
const permitRoutes = require('./routes/permitRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const billRoutes = require('./routes/billRoutes');
const academicRoutes = require('./routes/academicRoutes');
const securityRoutes = require('./routes/securityRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const settingRoutes = require('./routes/settingRoutes');
const portalWaliRoutes = require('./routes/portalWaliRoutes');
const mitraRoutes = require('./routes/mitraRoutes');
const mitraController = require('./controllers/mitraController');

const app = express();

// =========================================================================
// 1. KONFIGURASI CORS SIAP PRODUKSI (DOMAIN UTAMA & WILDCARD SUBDOMAIN)
// =========================================================================
const allowedOrigins = [
  'https://sipesand.we.id',
  'https://www.sipesand.we.id',
  'https://sipesand.web.id',
  'https://www.sipesand.web.id',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request tanpa origin (mobile apps, server-to-server webhook callback Midtrans/Xendit)
    if (!origin) return callback(null, true);

    // Regex pengujian wildcard subdomain: https://[subdomain].sipesand.we.id atau .web.id
    const isWildcardSubdomain = /^https:\/\/([a-z0-9-]+)\.(sipesand\.we\.id|sipesand\.web\.id)$/i.test(origin);
    const isLocalDev = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

    if (allowedOrigins.indexOf(origin) !== -1 || isWildcardSubdomain || isLocalDev) {
      return callback(null, true);
    } else {
      console.warn(`[CORS BLOCKED] Origin tidak diizinkan: ${origin}`);
      return callback(new Error('Akses diblokir oleh kebijakan CORS SiPesand'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Tenant-Subdomain', 'X-Signature'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// 1.1 Dynamic Tenant Database Resolver
const { tenantResolver } = require('./middlewares/tenantResolver');
app.use(tenantResolver);

// =========================================================================
// 2. ROOT HEALTHCHECK & INFORMASI SISTEM MULTI-TENANT
// =========================================================================
app.get('/api', (req, res) => {
  res.json({
    message: 'Selamat Datang di API SiPesand (Sistem Terpadu Pesantren Digital Multi-Tenant)',
    version: '2.0.0',
    platform: 'King Digital Dev (kingdigitalpremium.my.id)',
    domain: process.env.BASE_DOMAIN || 'sipesand.we.id',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    modules: {
      saasRegister: '/api/mitra/register',
      webhookPublic: '/api/webhook/pg',
      webhookLisensi: '/api/webhook/pg-lisensi',
      dashboard: '/api/dashboard/stats',
      santri: '/api/santri',
      bills: '/api/bills',
      academics: '/api/academics',
      security: '/api/security',
      approvals: '/api/approvals',
      pocketTransactions: '/api/pocket-tx',
      ledger: '/api/ledger',
      permits: '/api/permits',
      settings: '/api/settings',
      portalWali: '/api/portal-wali',
    },
  });
});

// =========================================================================
// 3. DEDICATED WEBHOOK PAYMENT GATEWAY (MIDTRANS / XENDIT / KING DIGITAL PG)
// =========================================================================
app.post('/api/webhook/pg', mitraController.handlePaymentWebhook);
app.post('/api/webhook/pg-lisensi', mitraController.handlePaymentWebhook);
app.post('/api/webhook/kingdigital-pg', mitraController.handlePaymentWebhook);

// =========================================================================
// 4. REGISTER MODULE ROUTES
// =========================================================================
app.use('/api/mitra', mitraRoutes);
app.use('/api/santri', santriRoutes);
app.use('/api/pocket-tx', pocketTxRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/permits', permitRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/academics', academicRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/portal-wali', portalWaliRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan pada server SiPesand`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

module.exports = app;
