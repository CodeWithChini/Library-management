const jwt = require('jsonwebtoken');
const Librarian = require('../models/Librarian');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const librarian = await Librarian.findOne({ _id: decoded._id });

        if (!librarian) {
            throw new Error();
        }

        req.librarian = librarian;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.librarian.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
