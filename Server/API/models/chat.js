const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000
    },
    messageType: {
      type: String,
      enum: ['user', 'admin', 'system', 'notice'],
      default: 'user'
    },
    isNotice: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    deleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

chatMessageSchema.index({ timestamp: -1 });
chatMessageSchema.index({ deleted: 1 });

chatMessageSchema.methods.softDelete = function(deletedBy) {
  this.deleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

chatMessageSchema.statics.getRecentMessages = function(limit = 50) {
  return this.find({ deleted: false })
    .populate('user', 'username role')
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec();
};

chatMessageSchema.statics.getMessagesPaginated = function(page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  return this.find({ deleted: false })
    .populate('user', 'username role')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

// Hard delete method for clear cache - completely removes from database
chatMessageSchema.statics.hardDeleteAll = async function() {
  try {
    // Method 1: Try to drop the collection completely
    const collectionName = this.collection.name;
    console.log(`Attempting to drop collection: ${collectionName}`);
    
    await this.collection.drop();
    console.log('✅ Collection dropped successfully');
    return { success: true, method: 'drop', deletedCount: 'all' };
    
  } catch (dropError) {
    console.log('Collection drop failed, trying deleteMany:', dropError.message);
    
    try {
      // Method 2: Use raw MongoDB deleteMany
      const result = await this.collection.deleteMany({});
      console.log(`✅ Raw deleteMany succeeded: ${result.deletedCount} deleted`);
      return { success: true, method: 'deleteMany', deletedCount: result.deletedCount };
      
    } catch (deleteError) {
      console.log('Raw deleteMany failed, trying Mongoose deleteMany:', deleteError.message);
      
      try {
        // Method 3: Use Mongoose deleteMany
        const result = await this.deleteMany({});
        console.log(`✅ Mongoose deleteMany succeeded: ${result.deletedCount} deleted`);
        return { success: true, method: 'mongoose', deletedCount: result.deletedCount };
        
      } catch (mongooseError) {
        console.log('All deletion methods failed:', mongooseError.message);
        return { success: false, error: mongooseError.message };
      }
    }
  }
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);