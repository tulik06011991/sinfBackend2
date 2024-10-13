const jwt = require('jsonwebtoken');

// Middleware for admin check
const adminMiddleware = (req, res, next) => {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Sizda admin huquqlari yo\'q!' });
    }
    next();
};

module.exports = adminMiddleware;
