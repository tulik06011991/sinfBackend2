const express = require('express');
const router = express.Router();
const adminController = require('../admin/adminlar');

// Adminlar CRUD yo'riqnomalari
router.post('/admin', adminController.createAdmin); // Yangi admin yaratish
router.get('/admins', adminController.getAllAdmins); // Barcha adminlarni olish
router.put('/admin/:id', adminController.updateAdmin); // Adminni yangilash
router.delete('/admin/:id', adminController.deleteAdmin); // Adminni o'chirish
// router.post('/admin/login', adminController.loginAdmin); // Admin login qilish;

module.exports = router;
