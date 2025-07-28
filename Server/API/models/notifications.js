const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['submission', 'approval', 'rejection', 'system', 'edit_request', 'edit_approved', 'edit_rejected']
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    recipient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    relatedSubmission: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Submission' 
    },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);