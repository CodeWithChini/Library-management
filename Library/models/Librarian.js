const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const librarianSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    employeeId: {
        type: String,
        required: [true, 'Employee ID is required'],
        unique: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    role: {
        type: String,
        default: 'librarian',
        enum: ['librarian', 'admin']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
librarianSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
librarianSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Librarian', librarianSchema);
