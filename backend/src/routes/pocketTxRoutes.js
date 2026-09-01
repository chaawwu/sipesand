const express = require('express');
const router = express.Router();
const pocketTxController = require('../controllers/pocketTxController');
const { verifyPengurusAuth } = require('../middlewares/authPengurus');

router.get('/', pocketTxController.getAllTransactions);
router.post('/', pocketTxController.createTransaction);

// Endpoint pemotongan saldo santri yang dilindungi middleware otorisasi pengurus
router.post('/deduct', verifyPengurusAuth, pocketTxController.deductSantriBalance);

module.exports = router;
