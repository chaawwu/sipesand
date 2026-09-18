const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register', mitraController.registerMitra);
router.get('/check-subdomain/:subdomain', mitraController.checkSubdomainAvailability);
router.post('/webhook/pg-lisensi', mitraController.handlePaymentWebhook);
router.post('/webhook/paymentku', mitraController.handlePaymentKuWebhook);

// ── Developer Auth (mitra.sipesand.web.id) ────────────────────────────────────
router.post('/auth/login', mitraController.loginDeveloper);
router.post('/auth/verify', mitraController.verifyDeveloperToken);
router.post('/auth/logout', mitraController.logoutDeveloper);

// ── Protected Routes (require auth) ───────────────────────────────────────────
router.use('/auth/credentials', mitraController.authMiddleware);
router.put('/auth/credentials', mitraController.updateDevCredentials);

router.use('/audit-logs', mitraController.authMiddleware);
router.get('/audit-logs', mitraController.getAuditLogs);

router.use('/all', mitraController.authMiddleware);
router.get('/all', mitraController.getAllMitraAktif);

router.use('/tenants', mitraController.authMiddleware);
router.get('/tenants', mitraController.getAllMitraAktif);
router.put('/tenants/:subdomain/status', mitraController.updateMitraStatus);
router.delete('/tenants/:subdomain', mitraController.deleteMitraAktif);

router.use('/config', mitraController.authMiddleware);
router.get('/config', mitraController.getMitraConfig);
router.post('/config', mitraController.updateMitraConfig);

router.use('/orders', mitraController.authMiddleware);
router.get('/orders', mitraController.getMitraOrders);
router.post('/upload-proof', mitraController.uploadMitraPaymentProof);
router.post('/verify-order', mitraController.verifyMitraOrder);
router.delete('/orders/:orderId', mitraController.deleteMitraOrder);
router.post('/pg-config', mitraController.updateKingDigitalPgConfig);

// ── PaymentKu Gateway (paymentku.com) ────────────────────────────────────────
router.get('/paymentku/config', mitraController.authMiddleware, mitraController.getPaymentKuConfig);
router.post('/paymentku/config', mitraController.authMiddleware, mitraController.updatePaymentKuConfig);
router.post('/paymentku/create', mitraController.createPaymentKuTransaction);
router.get('/paymentku/status/:orderId', mitraController.checkPaymentKuStatus);
router.get('/paymentku/status/tx/:transactionId', mitraController.checkPaymentKuStatus);

module.exports = router;

