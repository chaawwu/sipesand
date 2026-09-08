const express = require('express');
const router = express.Router();
const santriController = require('../controllers/santriController');

router.get('/', santriController.getAllSantri);
router.get('/export', santriController.exportSantriData);
router.post('/import-firebase', santriController.importFromFirebase);
router.get('/nfc/:nfcUid', santriController.getSantriByNfc);
router.post('/register-rfid', santriController.registerRfid);
router.post('/unregister-rfid', santriController.unregisterRfid);
router.get('/:id', santriController.getSantriById);
router.post('/', santriController.createSantri);
router.put('/:id', santriController.updateSantri);
router.delete('/:id', santriController.deleteSantri);

module.exports = router;
