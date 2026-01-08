const express = require('express');
const router = express.Router();
const Librarian = require('../models/Librarian');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Register new librarian (Admin only)
router.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const librarian = new Librarian(req.body);
        await librarian.save();

        const token = jwt.sign(
            { _id: librarian._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({ librarian, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login librarian
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const librarian = await Librarian.findOne({ email });
        if (!librarian) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isMatch = await librarian.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { _id: librarian._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            librarian: {
                _id: librarian._id,
                name: librarian.name,
                email: librarian.email,
                role: librarian.role
            },
            token
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all librarians (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const librarians = await Librarian.find({}, '-password');
        res.json(librarians);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current librarian profile
router.get('/profile', authMiddleware, async (req, res) => {
    res.json(req.librarian);
});

// Update librarian profile
router.patch('/profile', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.librarian[update] = req.body[update]);
        await req.librarian.save();
        res.json(req.librarian);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
