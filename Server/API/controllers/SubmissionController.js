const Submission = require('../models/submissions');
const Book = require('../models/books');
const Game = require('../models/games');
const { notifyAdmins, createNotification } = require('./NotificationController');

// Submit content for review
const SubmitContent = async (req, res) => {
    try {
        const submissionData = {
            ...req.body,
            submittedBy: req.user._id,
            status: 'pending'
        };
        
        // Handle file upload
        if (req.file) {
            const uploadPath = req.body.type === 'book' ? 'books' : 'games';
            submissionData.coverImage = `/uploads/${uploadPath}/${req.file.filename}`;
            console.log('📷 Submission image saved:', {
                originalName: req.file.originalname,
                filename: req.file.filename,
                path: submissionData.coverImage,
                destination: req.file.destination,
                fileSize: req.file.size
            });
        } else {
            console.log('⚠️ No file uploaded in submission');
        }
        
        console.log('📝 Submission data before save:', {
            type: submissionData.type,
            title: submissionData.title,
            coverImage: submissionData.coverImage,
            submittedBy: submissionData.submittedBy
        });
        
        // Parse links if they exist
        if (req.body.readingLinks) {
            try {
                submissionData.readingLinks = JSON.parse(req.body.readingLinks);
            } catch (e) {
                console.error('Error parsing reading links:', e);
            }
        }
        
        if (req.body.platformLinks) {
            try {
                submissionData.platformLinks = JSON.parse(req.body.platformLinks);
            } catch (e) {
                console.error('Error parsing platform links:', e);
            }
        }
        
        const submission = new Submission(submissionData);
        await submission.save();
        
        // Populate the submission for response
        const populatedSubmission = await Submission.findById(submission._id)
            .populate('submittedBy', 'username email');
        
        // Notify all admins about the new submission
        await notifyAdmins(
            'submission',
            `New ${submission.type} Submission`,
            `User "${req.user.username}" submitted a new ${submission.type}: "${submission.title}"`,
            req.user._id,
            submission._id
        );
        
        // Notify the user that their submission is pending review
        await createNotification(
            'submission',
            `${submission.type === 'book' ? 'Book' : 'Game'} Submission Received`,
            `Your ${submission.type} "${submission.title}" has been submitted and is pending admin review. You will be notified once it's reviewed.`,
            req.user._id,
            null,
            submission._id
        );
        
        res.status(201).json({ 
            message: 'Content submitted successfully for review',
            submission: populatedSubmission 
        });
    } catch (error) {
        console.error('Error submitting content:', error);
        res.status(500).json({ error: 'Error submitting content' });
    }
};

// Get all submissions (admin only)
const GetAllSubmissions = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const submissions = await Submission.find()
            .populate('submittedBy', 'username email')
            .populate('reviewedBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ data: submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Error fetching submissions' });
    }
};

// Get pending submissions (admin only)
const GetPendingSubmissions = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const submissions = await Submission.find({ status: 'pending' })
            .populate('submittedBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ data: submissions });
    } catch (error) {
        console.error('Error fetching pending submissions:', error);
        res.status(500).json({ error: 'Error fetching pending submissions' });
    }
};

// Get user's own submissions
const GetMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ submittedBy: req.user._id })
            .populate('reviewedBy', 'username email')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ data: submissions });
    } catch (error) {
        console.error('Error fetching your submissions:', error);
        res.status(500).json({ error: 'Error fetching your submissions' });
    }
};

// Approve submission (admin only)
const ApproveSubmission = async (req, res) => {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const submission = await Submission.findById(id).populate('submittedBy', 'username email');
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        if (submission.status !== 'pending') {
            return res.status(400).json({ error: 'Submission has already been reviewed' });
        }
        
        // Update submission status
        submission.status = 'approved';
        submission.reviewedBy = req.user._id;
        submission.reviewedAt = new Date();
        submission.reviewNotes = reviewNotes || '';
        await submission.save();
        
        // Create the actual book/game entry
        let createdContent;
        if (submission.type === 'book') {
            const bookData = {
                title: submission.title,
                author: submission.author,
                categories: submission.categories,
                description: submission.description,
                publishedDate: submission.publishedDate,
                Coverpage: submission.coverImage,
                Prices: submission.Prices,
                readingLinks: submission.readingLinks || [],
                publishedBy: submission.submittedBy._id
            };
            
            createdContent = new Book(bookData);
            await createdContent.save();
        } else if (submission.type === 'game') {
            const gameData = {
                title: submission.title,
                developer: submission.developer,
                genre: submission.genre,
                platform: submission.platform,
                description: submission.description,
                releaseDate: submission.releaseDate,
                coverImage: submission.coverImage,
                price: submission.price,
                platformLinks: submission.platformLinks || [],
                publishedBy: submission.submittedBy._id
            };
            
            createdContent = new Game(gameData);
            await createdContent.save();
        }
        
        // Notify the submitter about approval
        await createNotification(
            'approval',
            `${submission.type === 'book' ? 'Book' : 'Game'} Approved!`,
            `Your ${submission.type} "${submission.title}" has been approved and published!`,
            submission.submittedBy._id,
            req.user._id,
            submission._id
        );
        
        res.status(200).json({ 
            message: 'Submission approved and published successfully',
            submission,
            createdContent
        });
    } catch (error) {
        console.error('Error approving submission:', error);
        res.status(500).json({ error: 'Error approving submission' });
    }
};

// Reject submission (admin only)
const RejectSubmission = async (req, res) => {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const submission = await Submission.findById(id).populate('submittedBy', 'username email');
        
        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }
        
        if (submission.status !== 'pending') {
            return res.status(400).json({ error: 'Submission has already been reviewed' });
        }
        
        // Update submission status
        submission.status = 'rejected';
        submission.reviewedBy = req.user._id;
        submission.reviewedAt = new Date();
        submission.reviewNotes = reviewNotes || 'No specific reason provided';
        await submission.save();
        
        // Notify the submitter about rejection
        await createNotification(
            'rejection',
            `${submission.type === 'book' ? 'Book' : 'Game'} Rejected`,
            `Your ${submission.type} "${submission.title}" was rejected. Reason: ${submission.reviewNotes}`,
            submission.submittedBy._id,
            req.user._id,
            submission._id
        );
        
        res.status(200).json({ 
            message: 'Submission rejected',
            submission
        });
    } catch (error) {
        console.error('Error rejecting submission:', error);
        res.status(500).json({ error: 'Error rejecting submission' });
    }
};

module.exports = {
    SubmitContent,
    GetAllSubmissions,
    GetPendingSubmissions,
    GetMySubmissions,
    ApproveSubmission,
    RejectSubmission
};