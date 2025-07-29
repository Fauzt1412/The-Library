const Router = require('express').Router;
const SubmissionRoute = Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { uploadSubmissionCover, handleUploadError } = require('../middleware/upload');

const { 
    SubmitContent,
    GetAllSubmissions,
    GetPendingSubmissions,
    GetMySubmissions,
    ApproveSubmission,
    RejectSubmission
} = require('../controllers/SubmissionController');

// Protected routes - require authentication
// Handle both file uploads (FormData) and Cloudinary submissions (JSON)
SubmissionRoute.post('/submissions', (req, res, next) => {
    // Check if this is a JSON request (Cloudinary) or FormData request (file upload)
    const contentType = req.headers['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
        // JSON request - skip file upload middleware
        console.log('📤 JSON submission detected (Cloudinary)');
        next();
    } else {
        // FormData request - use file upload middleware
        console.log('📤 FormData submission detected (file upload)');
        uploadSubmissionCover(req, res, (err) => {
            if (err) {
                return handleUploadError(err, req, res, next);
            }
            next();
        });
    }
}, authenticateUser, SubmitContent);
SubmissionRoute.get('/submissions', authenticateUser, requireAdmin, GetAllSubmissions);
SubmissionRoute.get('/submissions/pending', authenticateUser, requireAdmin, GetPendingSubmissions);
SubmissionRoute.get('/my-submissions', authenticateUser, GetMySubmissions);
SubmissionRoute.put('/submissions/:id/approve', authenticateUser, requireAdmin, ApproveSubmission);
SubmissionRoute.put('/submissions/:id/reject', authenticateUser, requireAdmin, RejectSubmission);

module.exports = SubmissionRoute;