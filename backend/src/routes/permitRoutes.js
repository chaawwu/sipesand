const express = require('express');
const router = express.Router();
const permitController = require('../controllers/permitController');

router.get('/', permitController.getAllPermits);
router.post('/', permitController.createPermit);
router.patch('/:id/status', permitController.updatePermitStatus);
router.post('/checkin-nfc', permitController.checkInByNfc);

module.exports = router;
