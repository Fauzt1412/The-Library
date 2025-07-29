const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    developer: { type: String, required: true },
    platform: { type: String, required: true },
    releaseDate: { type: Date, required: true },
    description: { type: String, required: true },
    coverImage: { type: String, required: true },
    platformLinks: [{ 
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

module.exports = mongoose.model('Game', gameSchema);