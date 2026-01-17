const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    userId: {
        type: String,
        required: [true, 'User ID is required'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    membershipType: {
        type: String,
        enum: ['basic', 'premium', 'student'],
        default: 'basic'
    },
    membershipDate: {
        type: Date,
        default: Date.now
    },
    borrowedBooks: [{
        bookId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        borrowedDate: {
            type: Date,
            default: Date.now
        },
        dueDate: Date,
        returned: {
            type: Boolean,
            default: false
        }
    }],
    fines: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);


