const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const { authMiddleware } = require('../middleware/auth');

// Create new user
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all users
router.get('/', authMiddleware, async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user
router.patch('/:id', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'phone', 'address', 'membershipType', 'isActive'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Borrow a book
router.post('/:userId/borrow/:bookId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const book = await Book.findById(req.params.bookId);

        if (!user || !book) {
            return res.status(404).json({ error: 'User or Book not found' });
        }

        if (book.availableCopies < 1) {
            return res.status(400).json({ error: 'No copies available' });
        }

        // Calculate due date (14 days from now)
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 14);

        // Add to borrowed books
        user.borrowedBooks.push({
            bookId: book._id,
            borrowedDate: new Date(),
            dueDate: dueDate
        });

        // Update book availability
        book.availableCopies -= 1;
        if (book.availableCopies === 0) {
            book.status = 'borrowed';
        }

        await user.save();
        await book.save();

        res.json({ message: 'Book borrowed successfully', user, book });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Return a book
router.post('/:userId/return/:bookId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const book = await Book.findById(req.params.bookId);

        if (!user || !book) {
            return res.status(404).json({ error: 'User or Book not found' });
        }

        const borrowedBook = user.borrowedBooks.find(b =>
            b.bookId.toString() === req.params.bookId && !b.returned
        );

        if (!borrowedBook) {
            return res.status(400).json({ error: 'Book not borrowed by this user' });
        }

        // Mark as returned
        borrowedBook.returned = true;
        borrowedBook.returnedDate = new Date();

        // Calculate fine if overdue
        if (borrowedBook.dueDate < new Date()) {
            const daysOverdue = Math.ceil((new Date() - borrowedBook.dueDate) / (1000 * 60 * 60 * 24));
            user.fines += daysOverdue * 5; // $5 per day
        }

        // Update book availability
        book.availableCopies += 1;
        book.status = book.availableCopies > 0 ? 'available' : 'borrowed';

        await user.save();
        await book.save();

        res.json({ message: 'Book returned successfully', user, book });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
