const EditRequest = require('../models/editRequests');
const Book = require('../models/books');
const Game = require('../models/games');
const { notifyAdmins, createNotification } = require('./NotificationController');

// Submit an edit request
const SubmitEditRequest = async (req, res) => {
    try {
        console.log('📝 Edit Request Submission Started');
        console.log('   User:', req.user ? req.user.username : 'No user found');
        console.log('   User ID:', req.user ? req.user._id : 'No user ID');
        console.log('   Request body:', JSON.stringify(req.body, null, 2));
        
        const { contentType, contentId, proposedChanges, changeSummary } = req.body;
        
        // Validate required fields
        if (!contentType) {
            console.log('❌ Missing contentType');
            return res.status(400).json({ error: 'Content type is required' });
        }
        
        if (!contentId) {
            console.log('❌ Missing contentId');
            return res.status(400).json({ error: 'Content ID is required' });
        }
        
        if (!proposedChanges) {
            console.log('❌ Missing proposedChanges');
            return res.status(400).json({ error: 'Proposed changes are required' });
        }
        
        if (!changeSummary) {
            console.log('❌ Missing changeSummary');
            return res.status(400).json({ error: 'Change summary is required' });
        }
        
        // Validate content type
        if (!['book', 'game'].includes(contentType)) {
            console.log('❌ Invalid content type:', contentType);
            return res.status(400).json({ error: 'Invalid content type. Must be "book" or "game"' });
        }
        
        console.log('✅ Basic validation passed');
        console.log('   Content Type:', contentType);
        console.log('   Content ID:', contentId);
        console.log('   Change Summary:', changeSummary);
        
        // Get the current content
        console.log('🔍 Looking up content...');
        let currentContent;
        if (contentType === 'book') {
            console.log('   Searching for book with ID:', contentId);
            currentContent = await Book.findById(contentId);
        } else {
            console.log('   Searching for game with ID:', contentId);
            currentContent = await Game.findById(contentId);
        }
        
        if (!currentContent) {
            console.log('❌ Content not found for ID:', contentId);
            return res.status(404).json({ error: `${contentType} not found with ID: ${contentId}` });
        }
        
        console.log('✅ Content found:', currentContent.title);
        console.log('   Published by:', currentContent.publishedBy);
        
        // Check if user owns this content
        console.log('🔐 Checking ownership...');
        console.log('   Content published by:', currentContent.publishedBy.toString());
        console.log('   Current user ID:', req.user._id.toString());
        
        if (currentContent.publishedBy.toString() !== req.user._id.toString()) {
            console.log('❌ User does not own this content');
            return res.status(403).json({ error: 'You can only edit your own content' });
        }
        
        console.log('✅ User owns this content');
        
        // Check if there's already a pending edit request for this content
        console.log('🔍 Checking for existing pending requests...');
        const existingRequest = await EditRequest.findOne({
            contentId,
            status: 'pending'
        });
        
        if (existingRequest) {
            console.log('❌ Existing pending request found:', existingRequest._id);
            return res.status(400).json({ error: 'There is already a pending edit request for this content' });
        }
        
        console.log('✅ No existing pending requests');
        
        // Create the edit request
        console.log('📝 Creating edit request...');
        const editRequest = new EditRequest({
            contentType,
            contentId,
            requestedBy: req.user._id,
            originalContent: currentContent.toObject(),
            proposedChanges,
            changeSummary,
            status: 'pending'
        });
        
        console.log('   Edit request object created');
        console.log('   Saving to database...');
        await editRequest.save();
        console.log('✅ Edit request saved with ID:', editRequest._id);
        
        // Populate the edit request for response
        const populatedRequest = await EditRequest.findById(editRequest._id)
            .populate('requestedBy', 'username email');
        
        // Manually populate contentId based on contentType
        if (populatedRequest.contentType === 'book') {
            await populatedRequest.populate({
                path: 'contentId',
                model: 'Book'
            });
        } else {
            await populatedRequest.populate({
                path: 'contentId',
                model: 'Game'
            });
        }
        
        // Notify admins about the edit request
        await notifyAdmins(
            'edit_request',
            `Content Edit Request`,
            `User "${req.user.username}" requested to edit ${contentType}: "${currentContent.title}"`,
            req.user._id,
            editRequest._id
        );
        
        // Notify the user that their edit request was submitted
        await createNotification(
            'edit_request',
            `Edit Request Submitted`,
            `Your edit request for ${contentType} "${currentContent.title}" has been submitted and is pending admin review.`,
            req.user._id,
            null,
            editRequest._id
        );
        
        res.status(201).json({
            message: 'Edit request submitted successfully',
            editRequest: populatedRequest
        });
        
    } catch (error) {
        console.error('❌ Error submitting edit request:', error);
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        console.error('   Error stack:', error.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Error submitting edit request';
        if (error.name === 'ValidationError') {
            errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
        } else if (error.name === 'CastError') {
            errorMessage = 'Invalid ID format: ' + error.message;
        } else if (error.code === 11000) {
            errorMessage = 'Duplicate entry error';
        }
        
        res.status(500).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all edit requests (admin only)
const GetAllEditRequests = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const editRequests = await EditRequest.find()
            .populate('requestedBy', 'username email')
            .populate('reviewedBy', 'username email')
            .sort({ createdAt: -1 });
        
        // Manually populate contentId for each request
        for (let request of editRequests) {
            if (request.contentType === 'book') {
                await request.populate({
                    path: 'contentId',
                    model: 'Book'
                });
            } else {
                await request.populate({
                    path: 'contentId',
                    model: 'Game'
                });
            }
        }
        
        res.status(200).json({ data: editRequests });
    } catch (error) {
        console.error('Error fetching edit requests:', error);
        res.status(500).json({ error: 'Error fetching edit requests' });
    }
};

// Get pending edit requests (admin only)
const GetPendingEditRequests = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const editRequests = await EditRequest.find({ status: 'pending' })
            .populate('requestedBy', 'username email')
            .sort({ createdAt: -1 });
        
        // Manually populate contentId for each request
        for (let request of editRequests) {
            if (request.contentType === 'book') {
                await request.populate({
                    path: 'contentId',
                    model: 'Book'
                });
            } else {
                await request.populate({
                    path: 'contentId',
                    model: 'Game'
                });
            }
        }
        
        res.status(200).json({ data: editRequests });
    } catch (error) {
        console.error('Error fetching pending edit requests:', error);
        res.status(500).json({ error: 'Error fetching pending edit requests' });
    }
};

// Get user's own edit requests
const GetMyEditRequests = async (req, res) => {
    try {
        console.log('📋 Fetching edit requests for user:', req.user._id);
        
        const editRequests = await EditRequest.find({ requestedBy: req.user._id })
            .populate('reviewedBy', 'username email')
            .sort({ createdAt: -1 });
        
        console.log('📋 Found', editRequests.length, 'edit requests');
        
        // Manually populate contentId for each request
        for (let request of editRequests) {
            console.log('📋 Populating content for request:', request._id, 'type:', request.contentType);
            try {
                if (request.contentType === 'book') {
                    await request.populate({
                        path: 'contentId',
                        model: 'Book'
                    });
                } else {
                    await request.populate({
                        path: 'contentId',
                        model: 'Game'
                    });
                }
                console.log('✅ Successfully populated content for request:', request._id);
            } catch (populateError) {
                console.error('❌ Error populating content for request:', request._id, populateError.message);
                // Continue with other requests even if one fails
            }
        }
        
        console.log('✅ Successfully fetched and populated all edit requests');
        res.status(200).json({ data: editRequests });
    } catch (error) {
        console.error('❌ Error fetching your edit requests:', error);
        console.error('   Error name:', error.name);
        console.error('   Error message:', error.message);
        res.status(500).json({ error: 'Error fetching your edit requests: ' + error.message });
    }
};

// Approve edit request (admin only)
const ApproveEditRequest = async (req, res) => {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const editRequest = await EditRequest.findById(id)
            .populate('requestedBy', 'username email');
        
        // Manually populate contentId
        if (editRequest.contentType === 'book') {
            await editRequest.populate({
                path: 'contentId',
                model: 'Book'
            });
        } else {
            await editRequest.populate({
                path: 'contentId',
                model: 'Game'
            });
        }
        
        if (!editRequest) {
            return res.status(404).json({ error: 'Edit request not found' });
        }
        
        if (editRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Edit request has already been reviewed' });
        }
        
        // Update the actual content
        console.log('🔄 ApproveEditRequest - Processing proposed changes:', editRequest.proposedChanges);
        
        // Prepare update data with proper field mapping
        const updateData = { ...editRequest.proposedChanges };
        
        // Remove null/undefined image fields to prevent overwriting existing images
        // when user didn't intend to change the image
        if (updateData.coverImage === null || updateData.coverImage === undefined) {
            delete updateData.coverImage;
            console.log('🖼️ ApproveEditRequest - Removed null/undefined coverImage to preserve existing image');
        }
        
        // Also check for Coverpage field (used by books)
        if (updateData.Coverpage === null || updateData.Coverpage === undefined) {
            delete updateData.Coverpage;
            console.log('🖼️ ApproveEditRequest - Removed null/undefined Coverpage to preserve existing image');
        }
        
        // Remove null/undefined cloudinaryData
        if (updateData.cloudinaryData === null || updateData.cloudinaryData === undefined) {
            delete updateData.cloudinaryData;
            console.log('🖼️ ApproveEditRequest - Removed null/undefined cloudinaryData');
        }
        
        // Handle image field mapping and Cloudinary data
        if (editRequest.contentType === 'book') {
            // For books, map coverImage to Coverpage if provided and not null
            if (updateData.coverImage && updateData.coverImage !== null) {
                updateData.Coverpage = updateData.coverImage;
                delete updateData.coverImage; // Remove the temporary field
                console.log('📷 ApproveEditRequest - Mapped coverImage to Coverpage for book');
            }
            
            // Handle Cloudinary data for books
            if (updateData.cloudinaryData) {
                console.log('📷 ApproveEditRequest - Book Cloudinary data found:', updateData.cloudinaryData);
                // Cloudinary data is already in the correct format
            }
        } else {
            // For games, coverImage field name stays the same
            if (updateData.cloudinaryData) {
                console.log('📷 ApproveEditRequest - Game Cloudinary data found:', updateData.cloudinaryData);
                // Cloudinary data is already in the correct format
            }
        }
        
        // Add update timestamp
        updateData.updatedAt = new Date();
        
        console.log('💾 ApproveEditRequest - Final update data:', updateData);
        
        let updatedContent;
        if (editRequest.contentType === 'book') {
            updatedContent = await Book.findByIdAndUpdate(
                editRequest.contentId,
                updateData,
                { new: true }
            );
        } else {
            updatedContent = await Game.findByIdAndUpdate(
                editRequest.contentId,
                updateData,
                { new: true }
            );
        }
        
        console.log('✅ ApproveEditRequest - Content updated successfully:', updatedContent._id);
        
        // Update edit request status
        editRequest.status = 'approved';
        editRequest.reviewedBy = req.user._id;
        editRequest.reviewedAt = new Date();
        editRequest.reviewNotes = reviewNotes || '';
        await editRequest.save();
        
        // Notify the user about approval
        await createNotification(
            'edit_approved',
            `Edit Request Approved!`,
            `Your edit request for ${editRequest.contentType} "${editRequest.contentId.title}" has been approved and the content has been updated!`,
            editRequest.requestedBy._id,
            req.user._id,
            editRequest._id
        );
        
        res.status(200).json({
            message: 'Edit request approved and content updated successfully',
            editRequest,
            updatedContent
        });
        
    } catch (error) {
        console.error('Error approving edit request:', error);
        res.status(500).json({ error: 'Error approving edit request' });
    }
};

// Reject edit request (admin only)
const RejectEditRequest = async (req, res) => {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const editRequest = await EditRequest.findById(id)
            .populate('requestedBy', 'username email');
        
        // Manually populate contentId
        if (editRequest.contentType === 'book') {
            await editRequest.populate({
                path: 'contentId',
                model: 'Book'
            });
        } else {
            await editRequest.populate({
                path: 'contentId',
                model: 'Game'
            });
        }
        
        if (!editRequest) {
            return res.status(404).json({ error: 'Edit request not found' });
        }
        
        if (editRequest.status !== 'pending') {
            return res.status(400).json({ error: 'Edit request has already been reviewed' });
        }
        
        // Update edit request status
        editRequest.status = 'rejected';
        editRequest.reviewedBy = req.user._id;
        editRequest.reviewedAt = new Date();
        editRequest.reviewNotes = reviewNotes || 'No specific reason provided';
        await editRequest.save();
        
        // Notify the user about rejection
        await createNotification(
            'edit_rejected',
            `Edit Request Rejected`,
            `Your edit request for ${editRequest.contentType} "${editRequest.contentId.title}" was rejected. Reason: ${editRequest.reviewNotes}`,
            editRequest.requestedBy._id,
            req.user._id,
            editRequest._id
        );
        
        res.status(200).json({
            message: 'Edit request rejected',
            editRequest
        });
        
    } catch (error) {
        console.error('Error rejecting edit request:', error);
        res.status(500).json({ error: 'Error rejecting edit request' });
    }
};

// Get user's published content (for editing)
const GetMyPublishedContent = async (req, res) => {
    try {
        const [books, games] = await Promise.all([
            Book.find({ publishedBy: req.user._id }).sort({ createdAt: -1 }),
            Game.find({ publishedBy: req.user._id }).sort({ createdAt: -1 })
        ]);
        
        // Add content type to each item
        const booksWithType = books.map(book => ({
            ...book.toObject(),
            contentType: 'book'
        }));
        
        const gamesWithType = games.map(game => ({
            ...game.toObject(),
            contentType: 'game'
        }));
        
        const allContent = [...booksWithType, ...gamesWithType]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.status(200).json({ data: allContent });
    } catch (error) {
        console.error('Error fetching published content:', error);
        res.status(500).json({ error: 'Error fetching published content' });
    }
};

module.exports = {
    SubmitEditRequest,
    GetAllEditRequests,
    GetPendingEditRequests,
    GetMyEditRequests,
    ApproveEditRequest,
    RejectEditRequest,
    GetMyPublishedContent
};