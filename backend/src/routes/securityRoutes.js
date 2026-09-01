const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

router.get('/violations', securityController.getViolations);
router.post('/violations', securityController.createViolation);
router.put('/violations/:id/status', securityController.updateViolationStatus);
router.delete('/violations/:id', securityController.deleteViolation);

module.exports = router;
