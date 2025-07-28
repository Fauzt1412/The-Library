import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI } from '../services/api';

const UserNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);
  
  const fetchNotifications = async () => {
    try {
      console.log('🔔 Starting to fetch user notifications...');
      const response = await notificationsAPI.getAll();
      console.log('🔔 User notifications response:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let notificationData = [];
      if (response.data && Array.isArray(response.data.data)) {
        notificationData = response.data.data;
      } else if (Array.isArray(response.data)) {
        notificationData = response.data;
      } else {
        console.warn('🔔 Unexpected notification response structure:', response.data);
        notificationData = [];
      }
      
      const formattedNotifications = notificationData.map(notification => ({
        ...notification,
        id: notification._id,
        timestamp: new Date(notification.createdAt)
      }));
      
      console.log('🔔 Setting user notifications:', { count: formattedNotifications.length });
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('🔔 Error fetching user notifications:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markAllAsRead = async () => {
    if (!window.confirm('Are you sure you want to mark all notifications as read?')) {
      return;
    }
    
    try {
      await notificationsAPI.markAllAsRead();
      
      // Update local state to mark all as read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      alert('All notifications marked as read.');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      alert('Error marking notifications as read: ' + (error.response?.data?.error || error.message));
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please log in to view your notifications.
        </div>
      </div>
    );
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-bell me-2"></i>
            My Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h1>
          <p className="section-subtitle">
            Stay updated on your content submissions and system messages
          </p>
        </div>
      </div>
      
      {/* Simple Stats */}
      {notifications.length > 0 && (
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center">
                <i className="fas fa-bell fa-2x text-primary mb-2"></i>
                <h3 className="text-primary">{notifications.length}</h3>
                <p className="text-muted mb-0">Total Notifications</p>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow">
              <div className="card-body text-center">
                <i className="fas fa-envelope fa-2x text-warning mb-2"></i>
                <h3 className="text-warning">{unreadCount}</h3>
                <p className="text-muted mb-0">Unread</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Notifications List */}
      <div className="card border-0 shadow">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="fas fa-list me-2"></i>
              All Notifications ({notifications.length})
            </h5>
            {unreadCount > 0 && (
              <button 
                className="btn btn-outline-primary btn-sm"
                onClick={markAllAsRead}
                title="Mark all notifications as read"
              >
                <i className="fas fa-check-double me-2"></i>
                Mark All as Read
              </button>
            )}
          </div>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
              <h5>No notifications yet</h5>
              <p className="text-muted">
                You'll receive notifications here when:
              </p>
              <ul className="list-unstyled text-muted">
                <li><i className="fas fa-check-circle text-success me-2"></i>Your content submissions are approved</li>
                <li><i className="fas fa-times-circle text-danger me-2"></i>Your content submissions are rejected (with feedback)</li>
                <li><i className="fas fa-clock text-warning me-2"></i>Your submissions are being reviewed</li>
                <li><i className="fas fa-info-circle text-info me-2"></i>System updates and announcements</li>
              </ul>
            </div>
          ) : (
            <div>
              {notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={'card mb-3 ' + (!notification.read ? 'border-primary' : 'border-light')}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  style={{ cursor: !notification.read ? 'pointer' : 'default' }}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <div className="me-3">
                        <i className={'fas fa-2x ' + (
                          notification.type === 'submission' ? 'fa-upload text-info' :
                          notification.type === 'approval' ? 'fa-check-circle text-success' :
                          notification.type === 'rejection' ? 'fa-times-circle text-danger' :
                          'fa-bell text-primary'
                        )}></i>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className={'mb-0 ' + (!notification.read ? 'fw-bold' : '')}>
                            {notification.title}
                            {!notification.read && (
                              <span className="badge bg-primary ms-2">New</span>
                            )}
                          </h6>
                          <small className="text-muted">
                            {notification.timestamp.toLocaleString()}
                          </small>
                        </div>
                        <p className="mb-2 text-muted">{notification.message}</p>
                        
                        {/* Additional info for approval/rejection notifications */}
                        {(notification.type === 'approval' || notification.type === 'rejection') && notification.relatedSubmission && (
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="fas fa-info-circle me-1"></i>
                              Related to your submission
                            </small>
                          </div>
                        )}
                        
                        {/* Action buttons for unread notifications */}
                        {!notification.read && (
                          <div className="mt-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <i className="fas fa-check me-1"></i>
                              Mark as Read
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;