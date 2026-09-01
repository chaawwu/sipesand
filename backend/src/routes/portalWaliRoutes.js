const express = require('express');
const router = express.Router();
const portalWaliController = require('../controllers/portalWaliController');

router.get('/santri/:query', portalWaliController.getSantriPortalData);
router.get('/bills/:query', portalWaliController.getSantriBillsByQuery);

module.exports = router;
