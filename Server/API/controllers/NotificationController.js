const Notification = require('../models/notifications');
const User = require('../models/users');

// Get all notifications for the current user
const GetNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate('sender', 'username email')
            .populate('relatedSubmission', 'title type')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Error fetching notifications' });
    }
};

// Get all notifications for admin (all notifications)
const GetAdminNotifications = async (req, res) => {
    try {
        // Only admins can access this
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const notifications = await Notification.find()
            .populate('recipient', 'username email')
            .populate('sender', 'username email')
            .populate('relatedSubmission', 'title type')
            .sort({ createdAt: -1 });
        
        res.status(200).json({ data: notifications });
    } catch (error) {
        console.error('Error fetching admin notifications:', error);
        res.status(500).json({ error: 'Error fetching admin notifications' });
    }
};

// Mark notification as read
const MarkAsRead = async (req, res) => {
    const { id } = req.params;
    
    try {
        const notification = await Notification.findById(id);
        
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        // Check if user owns this notification or is admin
        if (notification.recipient.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        notification.read = true;
        notification.updatedAt = new Date();
        await notification.save();
        
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Error marking notification as read' });
    }
};

// Mark all notifications as read for current user
const MarkAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true, updatedAt: new Date() }
        );
        
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Error marking all notifications as read' });
    }
};

// Clear all notifications for admin (delete all notifications)
const ClearAllNotifications = async (req, res) => {
    try {
        // Only admins can access this
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        
        const result = await Notification.deleteMany({});
        
        res.status(200).json({ 
            message: `All notifications cleared successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing all notifications:', error);
        res.status(500).json({ error: 'Error clearing all notifications' });
    }
};

// Create a notification (internal function)
const createNotification = async (type, title, message, recipientId, senderId = null, submissionId = null) => {
    try {
        const notification = new Notification({
            type,
            title,
            message,
            recipient: recipientId,
            sender: senderId,
            relatedSubmission: submissionId
        });
        
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Send notification to all admins
const notifyAdmins = async (type, title, message, senderId = null, submissionId = null) => {
    try {
        const admins = await User.find({ role: 'admin' });
        
        const notifications = admins.map(admin => ({
            type,
            title,
            message,
            recipient: admin._id,
            sender: senderId,
            relatedSubmission: submissionId
        }));
        
        await Notification.insertMany(notifications);
        return notifications;
    } catch (error) {
        console.error('Error notifying admins:', error);
        throw error;
    }
};

module.exports = {
    GetNotifications,
    GetAdminNotifications,
    MarkAsRead,
    MarkAllAsRead,
    ClearAllNotifications,
    createNotification,
    notifyAdmins
};