const express = require('express');
const router = express.Router();
const billController = require('../controllers/billController');

// Master Tagihan - dukung alias singular/plural agar frontend & cloudflare kompatibel
router.get('/masters', billController.getMasterBills);
router.get('/master', billController.getMasterBills);
router.post('/masters', billController.createMasterBill);
router.post('/master', billController.createMasterBill);
router.put('/masters/:id', billController.updateMasterBill);
router.put('/master/:id', billController.updateMasterBill);
router.delete('/masters/:id', billController.deleteMasterBill);
router.delete('/master/:id', billController.deleteMasterBill);

// Tagihan Santri & Generate Massal / Auto-Generate Hijri
router.get('/santri-bills', billController.getSantriBills);
router.post('/generate-mass', billController.generateMassBills);
router.post('/auto-generate-hijri', billController.autoGenerateMonthlyHijriBills);
// Alias kompatibel: frontend menggunakan /bills/:id (PUT/DELETE), backend historis /santri-bills/:id
router.put('/santri-bills/:id', billController.updateSantriBill);
router.delete('/santri-bills/:id', billController.deleteSantriBill);
router.put('/:id', billController.updateSantriBill);
router.delete('/:id', billController.deleteSantriBill);

// Bayar Online & Verifikasi
router.post('/pay-online', billController.payOnline);
router.post('/verify-payment/:id', billController.verifyPayment);

// Riwayat Kwitansi
router.get('/receipts', billController.getReceipts);

module.exports = router;
