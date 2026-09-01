const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');

router.get('/', ledgerController.getAllEntries);
router.get('/summary', ledgerController.getSummary);
router.post('/', ledgerController.createEntry);
router.delete('/:id', ledgerController.deleteEntry);

module.exports = router;
