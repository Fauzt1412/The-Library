const mongoose = require('mongoose');

const editRequestSchema = new mongoose.Schema({
    contentType: { 
        type: String, 
        required: true,
        enum: ['book', 'game']
    },
    contentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        required: true
    },
    requestedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    status: { 
        type: String, 
        required: true,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Original content (current published version)
    originalContent: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    // Proposed changes
    proposedChanges: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    
    // Change summary
    changeSummary: {
        type: String,
        required: true
    },
    
    // Admin review
    reviewedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    reviewedAt: { 
        type: Date 
    },
    reviewNotes: { 
        type: String 
    },
    
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Add indexes for better performance
editRequestSchema.index({ contentId: 1, status: 1 });
editRequestSchema.index({ requestedBy: 1, status: 1 });
editRequestSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('EditRequest', editRequestSchema);