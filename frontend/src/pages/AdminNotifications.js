import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { notificationsAPI, submissionsAPI } from '../services/api';

const AdminNotifications = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchNotifications();
      fetchPendingSubmissions();
    }
  }, [isAuthenticated, isAdmin]);
  
  const fetchNotifications = async () => {
    try {
      console.log('🔔 Starting to fetch admin notifications...');
      const response = await notificationsAPI.getAdminNotifications();
      console.log('🔔 Admin notifications response:', {
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
      
      console.log('🔔 Setting notifications:', { count: formattedNotifications.length });
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('🔔 Error fetching notifications:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setNotifications([]); // Set empty array on error
    }
  };
  
  const fetchPendingSubmissions = async () => {
    try {
      console.log('📝 Starting to fetch pending submissions...');
      const response = await submissionsAPI.getPending();
      console.log('📝 Pending submissions response:', {
        status: response.status,
        dataType: typeof response.data,
        hasDataProperty: 'data' in response.data,
        dataValue: response.data
      });
      
      // Handle different response structures
      let submissionData = [];
      if (response.data && Array.isArray(response.data.data)) {
        submissionData = response.data.data;
      } else if (Array.isArray(response.data)) {
        submissionData = response.data;
      } else {
        console.warn('📝 Unexpected submission response structure:', response.data);
        submissionData = [];
      }
      
      const formattedSubmissions = submissionData.map(submission => ({
        ...submission,
        id: submission._id,
        submittedAt: new Date(submission.createdAt)
      }));
      
      console.log('📝 Setting pending submissions:', { count: formattedSubmissions.length });
      setPendingSubmissions(formattedSubmissions);
    } catch (error) {
      console.error('📝 Error fetching pending submissions:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      setPendingSubmissions([]); // Set empty array on error
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
  
  const handleSubmissionAction = async (submissionId, action, reviewNotes = '') => {
    try {
      console.log(action + ' submission:', submissionId);
      
      if (action === 'approve') {
        await submissionsAPI.approve(submissionId, reviewNotes);
        
        // Remove from pending submissions
        setPendingSubmissions(prev => 
          prev.filter(sub => sub.id !== submissionId)
        );
        
        // Refresh notifications to show the new notification
        fetchNotifications();
        
        // Show success message
        alert('Content approved successfully! User has been notified.');
      } else if (action === 'reject') {
        // For reject, open the modal instead of direct action
        const submission = pendingSubmissions.find(sub => sub.id === submissionId);
        setSelectedSubmission(submission);
        setRejectionReason('');
        setShowRejectModal(true);
        return; // Don't proceed with the rejection yet
      }
      
    } catch (error) {
      console.error('Error handling submission:', error);
      alert('Error ' + action + 'ing submission: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleRejectSubmission = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submissionsAPI.reject(selectedSubmission.id, rejectionReason.trim());
      
      // Remove from pending submissions
      setPendingSubmissions(prev => 
        prev.filter(sub => sub.id !== selectedSubmission.id)
      );
      
      // Refresh notifications to show the new notification
      fetchNotifications();
      
      // Close modal and reset state
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setRejectionReason('');
      
      // Show success message
      alert('Content rejected successfully! User has been notified with the reason.');
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Error rejecting submission: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
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
  
  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL notifications? This action cannot be undone and will remove all notification history.')) {
      return;
    }
    
    try {
      const response = await notificationsAPI.clearAllNotifications();
      
      // Clear local state
      setNotifications([]);
      
      alert(`All notifications cleared successfully! (${response.data.deletedCount} notifications removed)`);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      alert('Error clearing all notifications: ' + (error.response?.data?.error || error.message));
    }
  };
  
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingCount = pendingSubmissions.filter(s => s.status === 'pending').length;
  
  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-bell me-2"></i>
            Admin Notifications
            {unreadCount > 0 && (
              <span className="badge bg-danger ms-2">{unreadCount}</span>
            )}
          </h1>
          <p className="section-subtitle">
            Manage content submissions and system notifications
          </p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow">
            <div className="card-body text-center">
              <i className="fas fa-clock fa-2x text-warning mb-2"></i>
              <h3 className="text-warning">{pendingCount}</h3>
              <p className="text-muted mb-0">Pending Reviews</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow">
            <div className="card-body text-center">
              <i className="fas fa-bell fa-2x text-primary mb-2"></i>
              <h3 className="text-primary">{unreadCount}</h3>
              <p className="text-muted mb-0">Unread Notifications</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow">
            <div className="card-body text-center">
              <i className="fas fa-check fa-2x text-success mb-2"></i>
              <h3 className="text-success">{pendingSubmissions.filter(s => s.status === 'approved').length}</h3>
              <p className="text-muted mb-0">Approved Today</p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow">
            <div className="card-body text-center">
              <i className="fas fa-times fa-2x text-danger mb-2"></i>
              <h3 className="text-danger">{pendingSubmissions.filter(s => s.status === 'rejected').length}</h3>
              <p className="text-muted mb-0">Rejected Today</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="card border-0 shadow">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={'nav-link ' + (activeTab === 'pending' ? 'active' : '')}
                onClick={() => setActiveTab('pending')}
              >
                <i className="fas fa-hourglass-half me-2"></i>
                Pending Submissions ({pendingCount})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={'nav-link ' + (activeTab === 'notifications' ? 'active' : '')}
                onClick={() => setActiveTab('notifications')}
              >
                <i className="fas fa-bell me-2"></i>
                All Notifications ({notifications.length})
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'pending' && (
                <div>
                  {pendingSubmissions.filter(s => s.status === 'pending').length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                      <h5>No pending submissions</h5>
                      <p className="text-muted">All submissions have been reviewed.</p>
                    </div>
                  ) : (
                    pendingSubmissions
                      .filter(s => s.status === 'pending')
                      .map(submission => (
                        <div key={submission.id} className="card mb-3">
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <div className="d-flex align-items-center mb-2">
                                  <i className={'fas ' + (submission.type === 'book' ? 'fa-book' : 'fa-gamepad') + ' me-2 text-primary'}></i>
                                  <h5 className="mb-0">{submission.title}</h5>
                                  <span className={'badge ms-2 ' + (submission.type === 'book' ? 'bg-info' : 'bg-success')}>
                                    {submission.type === 'book' ? 'Book' : 'Game'}
                                  </span>
                                </div>
                                <p className="text-muted mb-2">
                                  <strong>By:</strong> {submission.type === 'book' ? submission.author : submission.developer} |
                                  <strong> Submitted by:</strong> {submission.submittedBy.username} |
                                  <strong> Date:</strong> {submission.submittedAt.toLocaleDateString()}
                                </p>
                                <p className="mb-2">{submission.description}</p>
                                <div className="mb-2">

                                  <strong> Category:</strong> {submission.type === 'book' ? submission.categories : submission.genre + ' - ' + submission.platform}
                                </div>
                                {(submission.readingLinks || submission.platformLinks) && (
                                  <div>
                                    <strong>Links:</strong>
                                    {(submission.readingLinks || submission.platformLinks).map((link, index) => (
                                      <span key={index} className="badge bg-secondary ms-1">
                                        {link.name}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="col-md-4 text-end">
                                <div className="d-grid gap-2">
                                  <button
                                    className="btn btn-success"
                                    onClick={() => handleSubmissionAction(submission.id, 'approve')}
                                  >
                                    <i className="fas fa-check me-2"></i>
                                    Approve
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() => handleSubmissionAction(submission.id, 'reject')}
                                  >
                                    <i className="fas fa-times me-2"></i>
                                    Reject
                                  </button>
                                  <button className="btn btn-outline-primary">
                                    <i className="fas fa-eye me-2"></i>
                                    Preview
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              )}
              
              {activeTab === 'notifications' && (
                <div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                      <h5>No notifications</h5>
                      <p className="text-muted">You are all caught up!</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">All Notifications ({notifications.length})</h6>
                        <div className="btn-group">
                          {notifications.some(n => !n.read) && (
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={markAllAsRead}
                              title="Mark all notifications as read"
                            >
                              <i className="fas fa-check-double me-2"></i>
                              Mark All as Read
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={clearAllNotifications}
                              title="Permanently delete all notifications"
                            >
                              <i className="fas fa-trash me-2"></i>
                              Clear All
                            </button>
                          )}
                        </div>
                      </div>
                      {notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={'card mb-2 ' + (!notification.read ? 'border-primary' : '')}
                          onClick={() => !notification.read && markAsRead(notification.id)}
                          style={{ cursor: !notification.read ? 'pointer' : 'default' }}
                        >
                          <div className="card-body">
                            <div className="d-flex align-items-start">
                              <i className={'fas ' + (
                                notification.type === 'submission' ? 'fa-upload' :
                                notification.type === 'approval' ? 'fa-check-circle' :
                                notification.type === 'rejection' ? 'fa-times-circle' :
                                'fa-cog'
                              ) + ' me-3 mt-1 ' + (
                                notification.type === 'submission' ? 'text-info' :
                                notification.type === 'approval' ? 'text-success' :
                                notification.type === 'rejection' ? 'text-danger' :
                                'text-primary'
                              )}></i>
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start">
                                  <h6 className={'mb-1 ' + (!notification.read ? 'fw-bold' : '')}>
                                    {notification.title}
                                    {!notification.read && (
                                      <span className="badge bg-primary ms-2">New</span>
                                    )}
                                  </h6>
                                  <small className="text-muted">
                                    {notification.timestamp.toLocaleString()}
                                  </small>
                                </div>
                                <p className="mb-0 text-muted">{notification.message}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Rejection Reason Modal */}
      {showRejectModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Reject Submission
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedSubmission(null);
                    setRejectionReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {selectedSubmission && (
                  <>
                    <div className="alert alert-info">
                      <h6 className="mb-2">
                        <i className={'fas ' + (selectedSubmission.type === 'book' ? 'fa-book' : 'fa-gamepad') + ' me-2'}></i>
                        {selectedSubmission.title}
                      </h6>
                      <p className="mb-1">
                        <strong>Type:</strong> {selectedSubmission.type === 'book' ? 'Book' : 'Game'} |
                        <strong> Author/Developer:</strong> {selectedSubmission.type === 'book' ? selectedSubmission.author : selectedSubmission.developer}
                      </p>
                      <p className="mb-0">
                        <strong>Submitted by:</strong> {selectedSubmission.submittedBy.username}
                      </p>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="rejectionReason" className="form-label">
                        <strong>Reason for Rejection *</strong>
                      </label>
                      <textarea
                        id="rejectionReason"
                        className="form-control"
                        rows="4"
                        placeholder="Please provide a detailed reason for rejecting this submission. This message will be sent to the user."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <div className="form-text">
                        Be specific and constructive in your feedback to help the user improve their submission.
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedSubmission(null);
                    setRejectionReason('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleRejectSubmission}
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-2"></i>
                      Reject Submission
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;