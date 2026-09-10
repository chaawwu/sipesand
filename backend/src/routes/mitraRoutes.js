const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');

// ── Developer Auth (mitra.sipesand.web.id) ──────────────────────────────────
router.post('/auth/login', mitraController.loginDeveloper);
router.post('/auth/verify', mitraController.verifyDeveloperToken);
router.post('/auth/logout', mitraController.logoutDeveloper);
router.put('/auth/credentials', mitraController.updateDevCredentials);

// ── Audit Logs ──────────────────────────────────────────────────────────────
router.get('/audit-logs', mitraController.getAuditLogs);

// ── Pengecekan Ketersediaan Subdomain Real-time ─────────────────────────────
router.get('/check-subdomain/:subdomain', mitraController.checkSubdomainAvailability);

// ── Pendaftaran & Status Mitra ──────────────────────────────────────────────
router.post('/register', mitraController.registerMitra);
router.get('/status/:orderId', mitraController.getMitraOrderStatus);
router.get('/all', mitraController.getAllMitraAktif);
router.get('/tenants', mitraController.getAllMitraAktif);
router.get('/config', mitraController.getMitraConfig);
router.post('/config', mitraController.updateMitraConfig);
router.get('/orders', mitraController.getMitraOrders);
router.post('/upload-proof', mitraController.uploadMitraPaymentProof);
router.post('/verify-order', mitraController.verifyMitraOrder);
router.delete('/orders/:orderId', mitraController.deleteMitraOrder);

// ── Webhook pembayaran dari payment gateway ─────────────────────────────────
router.post('/webhook/pg-lisensi', mitraController.handlePaymentWebhook);

// ── Konfigurasi Payment Gateway & Auto-Disbursement ─────────────────────────
router.post('/pg-config', mitraController.updateKingDigitalPgConfig);

module.exports = router;

