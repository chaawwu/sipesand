const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// Master Pos Tagihan (Support both /master and /masters for seamless frontend compatibility)
router.get(['/master', '/masters'], billController.getMasterBills);
router.post(['/master', '/masters'], billController.createMasterBill);
router.put(['/master/:id', '/masters/:id'], billController.updateMasterBill);
router.delete(['/master/:id', '/masters/:id'], billController.deleteMasterBill);

// Tagihan Santri & Generate Massal / Auto-Generate Hijri
router.get(['/', '/santri-bills'], billController.getSantriBills);
router.post('/generate-mass', billController.generateMassBills);
router.post('/auto-generate-hijri', billController.autoGenerateMonthlyHijriBills);
router.put(['/:id', '/santri-bills/:id'], billController.updateSantriBill);
router.delete(['/:id', '/santri-bills/:id'], billController.deleteSantriBill);

// Bayar Online & Verifikasi
router.post('/pay-online', billController.payOnline);
router.post('/verify-payment/:id', billController.verifyPayment);

// Riwayat Kwitansi
router.get('/receipts', billController.getReceipts);

module.exports = router;
