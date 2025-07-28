const Router = require('express').Router;
const NotificationRoute = Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');

const { 
    GetNotifications, 
    GetAdminNotifications, 
    MarkAsRead, 
    MarkAllAsRead,
    ClearAllNotifications
} = require('../controllers/NotificationController');

// Protected routes - require authentication
NotificationRoute.get('/notifications', authenticateUser, GetNotifications);
NotificationRoute.get('/admin/notifications', authenticateUser, requireAdmin, GetAdminNotifications);
NotificationRoute.put('/notifications/:id/read', authenticateUser, MarkAsRead);
NotificationRoute.put('/notifications/mark-all-read', authenticateUser, MarkAllAsRead);
NotificationRoute.delete('/admin/notifications/clear-all', authenticateUser, requireAdmin, ClearAllNotifications);

module.exports = NotificationRoute;