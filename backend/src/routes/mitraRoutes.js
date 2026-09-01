const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');

// Pengecekan Ketersediaan Subdomain Real-time
router.get('/check-subdomain/:subdomain', mitraController.checkSubdomainAvailability);

// Pendaftaran & Status Mitra
router.post('/register', mitraController.registerMitra);
router.get('/status/:orderId', mitraController.getMitraOrderStatus);
router.get('/all', mitraController.getAllMitraAktif);

// Webhook & Simulasi
router.post('/webhook/pg-lisensi', mitraController.handlePaymentWebhook);
router.post('/simulate-payment/:orderId', mitraController.simulatePaymentSuccess);

// Konfigurasi Payment Gateway & Auto-Disbursement
router.post('/pg-config', mitraController.updateKingDigitalPgConfig);

module.exports = router;
