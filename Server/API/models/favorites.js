const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        contentType: {
            type: String,
            required: true,
            enum: ['book', 'game'],
            lowercase: true,
            trim: true
        },
        contentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            index: true
        },
        addedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'favorites'
    }
);

// Create compound index to ensure a user can't favorite the same item twice
favoriteSchema.index(
    {
        userId: 1,
        contentId: 1,
        contentType: 1
    },
    {
        unique: true,
        name: 'unique_user_content_favorite'
    }
);

// Additional indexes for better query performance
favoriteSchema.index(
    {
        userId: 1,
        contentType: 1
    },
    {
        name: 'user_content_type_index'
    }
);

favoriteSchema.index(
    {
        userId: 1,
        addedAt: -1
    },
    {
        name: 'user_recent_favorites_index'
    }
);

// Instance methods
favoriteSchema.methods.toJSON = function() {
    const favorite = this.toObject();
    delete favorite.__v;
    return favorite;
};

// Static methods
favoriteSchema.statics.findByUser = function(userId) {
    return this.find({ userId }).sort({ addedAt: -1 });
};

favoriteSchema.statics.findByUserAndType = function(userId, contentType) {
    return this.find({ userId, contentType }).sort({ addedAt: -1 });
};

favoriteSchema.statics.checkIfFavorited = function(userId, contentId, contentType) {
    return this.findOne({ userId, contentId, contentType });
};

favoriteSchema.statics.removeUserFavorite = function(userId, contentId, contentType) {
    return this.findOneAndDelete({ userId, contentId, contentType });
};

favoriteSchema.statics.clearUserFavorites = function(userId) {
    return this.deleteMany({ userId });
};

favoriteSchema.statics.getUserFavoritesCount = function(userId) {
    return this.countDocuments({ userId });
};

// Pre-save middleware
favoriteSchema.pre('save', function(next) {
    if (this.isNew) {
        console.log(`Adding new favorite: User ${this.userId} favorited ${this.contentType} ${this.contentId}`);
    }
    next();
});

// Pre-remove middleware
favoriteSchema.pre('findOneAndDelete', function(next) {
    console.log('Removing favorite:', this.getQuery());
    next();
});

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;