const express = require('express');
const { registerController, loginController, deleteUser, getUsers } = require('../auth/auth');
const middleware = require('../middleware/middleware')

const router = express.Router();

// Ro'yxatdan o'tish (POST /api/users/register)
router.post('/register',  registerController);

// Kirish (POST /api/users/login)
router.post('/login',  loginController);
router.get('/admin/dashboard', middleware, (req, res) => {
    res.json({ message: 'Admin dashboardga xush kelibsiz!' });
});

router.get('/dashboard', middleware,  getUsers); // Barcha foydalanuvchilarni olish
// router.post('/dashboard', createUser); // Foydalanuvchini yaratish
 // Foydalanuvchini yangilash
router.delete('/users/:id', middleware, deleteUser); // Foydalanuvchini o'chirish

module.exports = router;
