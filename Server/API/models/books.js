const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    categories: { type: String, required: true },
    description: { type: String, required: true },
    publishedDate: { type: Date, default: Date.now, required: true },
    Coverpage: { type: String, required: true },
    readingLinks: [{ 
        name: String, 
        url: String, 
        icon: { type: String, default: 'fas fa-external-link-alt' },
        color: { type: String, default: '#667eea' }
    }],
    cloudinaryData: {
        publicId: String,
        cloudinaryUrl: String,
        uploadMethod: String,
        folder: String
    },
    publishedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);