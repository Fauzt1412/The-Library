const Router = require('express').Router;
const EditRequestRoute = Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const { uploadSubmissionCover, handleUploadError } = require('../middleware/upload');

const {
    SubmitEditRequest,
    GetAllEditRequests,
    GetPendingEditRequests,
    GetMyEditRequests,
    ApproveEditRequest,
    RejectEditRequest,
    GetMyPublishedContent
} = require('../controllers/EditRequestController');

// User routes
EditRequestRoute.post('/edit-requests', uploadSubmissionCover, handleUploadError, authenticateUser, SubmitEditRequest);
EditRequestRoute.get('/my-edit-requests', authenticateUser, GetMyEditRequests);
EditRequestRoute.get('/my-published-content', authenticateUser, GetMyPublishedContent);

// Admin routes
EditRequestRoute.get('/edit-requests', authenticateUser, requireAdmin, GetAllEditRequests);
EditRequestRoute.get('/edit-requests/pending', authenticateUser, requireAdmin, GetPendingEditRequests);
EditRequestRoute.put('/edit-requests/:id/approve', authenticateUser, requireAdmin, ApproveEditRequest);
EditRequestRoute.put('/edit-requests/:id/reject', authenticateUser, requireAdmin, RejectEditRequest);

module.exports = EditRequestRoute;