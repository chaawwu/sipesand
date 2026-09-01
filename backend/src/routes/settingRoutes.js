const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Auth Login Pengurus & Super Admin
router.post('/login', settingController.loginUser);

// Pengaturan Lembaga & Aset Digital
router.get('/', settingController.getAllSettings);
router.post('/', settingController.saveSettings);

// Manajemen Akun Multi-Divisi
router.get('/accounts', settingController.getUserAccounts);
router.post('/accounts', settingController.createUserAccount);
router.put('/accounts/:id', settingController.updateUserAccount);
router.delete('/accounts/:id', settingController.deleteUserAccount);

// Auto Backup Data
router.get('/backup/export', settingController.getBackupData);

module.exports = router;
