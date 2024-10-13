const express = require('express');
const { registerController, loginController } = require('../auth/auth');
const middleware = require('../middleware/middleware')

const router = express.Router();

// Ro'yxatdan o'tish (POST /api/users/register)
router.post('/register',  registerController);

// Kirish (POST /api/users/login)
router.post('/login',  loginController);
router.get('/admin/dashboard', middleware, (req, res) => {
    res.json({ message: 'Admin dashboardga xush kelibsiz!' });
});

module.exports = router;
