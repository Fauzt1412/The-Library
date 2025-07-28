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
SubmissionRoute.post('/submissions', uploadSubmissionCover, handleUploadError, authenticateUser, SubmitContent);
SubmissionRoute.get('/submissions', authenticateUser, requireAdmin, GetAllSubmissions);
SubmissionRoute.get('/submissions/pending', authenticateUser, requireAdmin, GetPendingSubmissions);
SubmissionRoute.get('/my-submissions', authenticateUser, GetMySubmissions);
SubmissionRoute.put('/submissions/:id/approve', authenticateUser, requireAdmin, ApproveSubmission);
SubmissionRoute.put('/submissions/:id/reject', authenticateUser, requireAdmin, RejectSubmission);

module.exports = SubmissionRoute;