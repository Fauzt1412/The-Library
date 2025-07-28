const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['book', 'game']
    },
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    
    // Common fields
    title: { type: String, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    
    // Book-specific fields
    author: { type: String },
    categories: { type: String },
    publishedDate: { type: Date },
    Prices: { type: Number },
    readingLinks: [{ 
        name: String, 
        url: String, 
        icon: { type: String, default: 'fas fa-external-link-alt' }
    }],
    
    // Game-specific fields
    developer: { type: String },
    genre: { type: String },
    platform: { type: String },
    releaseDate: { type: Date },
    price: { type: Number },
    platformLinks: [{ 
        name: String, 
        url: String, 
        icon: { type: String, default: 'fas fa-external-link-alt' }
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Submission', submissionSchema);