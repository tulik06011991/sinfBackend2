const Admin = require('../Model/adminlar'); // Admin modelini import qilish
const User = require('../Model/auth');
const Subject = require('../Model/Fanlar') // User modelini import qilish
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// Login Controller
; // User modelini import qilamiz (agar foydalanuvchilar uchun kerak bo'lsa)

// Register Controller
const registerController = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Bu email bilan foydalanuvchi mavjud!' });
        }

        const user = new User({
            name,
            email,
            password,
            role // Admin yoki user
        });

        await user.save();
        res.status(201).json({ message: 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Serverda xato yuz berdi!' });
    }
};

const loginController = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Adminni email orqali qidirish
        const admin = await Admin.findOne({ email });
        
        // Eng yuqori admin uchun maxsus shart
        if (email === 'Abdumuhammad@gmail.com') {
            // Parolni tekshirish
            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Noto\'g\'ri parol!' });
            }

            // Barcha fanlar va foydalanuvchilarga kirish huquqiga ega bo'lgan eng yuqori admin
            const allSubjects = await Subject.find({}).select('_id name'); // Barcha fanlar
          

            // JWT token yaratish (eng yuqori admin uchun)
            const token = jwt.sign({ userId: admin._id, role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '5h' });

            // Token va barcha fanlarni jo'natish
            return res.status(200).json({ 
                token, 
                redirect: '/superadmin/dashboard', // Super admin uchun alohida sahifa
                subjects: allSubjects // Barcha fanlar
            });
        }

        if (admin) {
            // Parolni tekshirish
            const isMatch = await admin.comparePassword(password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Noto\'g\'ri parol!' });
            }

            // Adminning o'ziga tegishli fanlar ro'yxatini olish
            const subjects = await Subject.find({ adminId: admin._id }).select('_id name');
          

            // Agar fanlar topilmasa, xabar yuborish
            if (subjects.length === 0) {
                return res.status(404).json({ message: 'Bu admin uchun fanlar topilmadi!' });
            }

            // JWT token yaratish
            const token = jwt.sign({ userId: admin._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

            // Token va topilgan fanlarni front-endga jo'natish
            return res.status(200).json({ 
                token, 
                redirect: '/admin/dashboard',
                subjects // Adminning o'ziga tegishli fanlar
            });
        }

        // Agar admin topilmasa, foydalanuvchini qidirish
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Foydalanuvchi topilmadi!' });
        }

        // Foydalanuvchi parolini tekshirish
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Noto\'g\'ri parol!' });
        }

        // JWT token yaratish foydalanuvchi uchun
        const token = jwt.sign({ userId: user._id,  userName: user.name,   role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Agar foydalanuvchi admin emas bo'lsa savollar-javoblar sahifasiga yo'naltirish
        return res.status(200).json({ 
            token, 
            redirect: '/savollarjavoblar',
           
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Serverda xato yuz berdi!' });
    }
};





module.exports = { registerController, loginController };
