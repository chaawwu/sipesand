const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approvalController');

router.get('/division-funds', approvalController.getDivisionFunds);
router.post('/division-funds', approvalController.createDivisionFund);
router.put('/division-funds/:id', approvalController.updateDivisionFundStatus);
router.get('/online-payments', approvalController.getPendingOnlinePayments);

module.exports = router;
