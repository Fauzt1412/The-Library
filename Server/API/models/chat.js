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

module.exports = mongoose.model('ChatMessage', chatMessageSchema);