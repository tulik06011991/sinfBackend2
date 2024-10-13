const express = require('express');
const router = express.Router();
const subjectController = require('../admin/Fanlar'); // Fan controllerini chaqiramiz

// Fan yaratish marshruti (faqat admin uchun)
router.post('/create', subjectController.createSubject);

// Barcha fanlarni olish
router.get('/subjects', subjectController.getAllSubjects);

// Fan o'chirish (faqat admin uchun)
router.delete('/:id', subjectController.deleteSubject);

module.exports = router;
