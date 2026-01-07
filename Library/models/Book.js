const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    author: {
        type: String,
        required: [true, 'Author is required'],
        trim: true
    },
    isbn: {
        type: String,
        required: [true, 'ISBN is required'],
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Other']
    },
    publicationYear: {
        type: Number,
        required: [true, 'Publication year is required']
    },
    publisher: {
        type: String,
        required: [true, 'Publisher is required']
    },
    totalCopies: {
        type: Number,
        required: [true, 'Total copies is required'],
        min: 1
    },
    availableCopies: {
        type: Number,
        required: [true, 'Available copies is required'],
        min: 0
    },
    shelfLocation: {
        type: String,
        required: [true, 'Shelf location is required']
    },
    description: {
        type: String,
        trim: true
    },
    coverImage: {
        type: String,
        default: 'default-cover.jpg'
    },
    status: {
        type: String,
        enum: ['available', 'borrowed', 'reserved', 'maintenance'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to set available copies equal to total copies on creation
bookSchema.pre('save', function(next) {
    if (this.isNew) {
        this.availableCopies = this.totalCopies;
    }
    next();
});

module.exports = mongoose.model('Book', bookSchema);
