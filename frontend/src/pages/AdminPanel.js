import React, { useState, useEffect } from 'react';
import { booksAPI, gamesAPI, usersAPI, notificationsAPI, submissionsAPI, editRequestsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import FileUploadWithToggle from '../components/FileUploadWithToggle';
import { getImageUrl } from '../utils/imageUtils';

const AdminPanel = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  
  // All useState hooks must be called at the top level, before any conditional logic
  const [activeTab, setActiveTab] = useState('books');
  const [books, setBooks] = useState([]);
  const [games, setGames] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [pendingEditRequests, setPendingEditRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Rejection modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // View details modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsSubmission, setDetailsSubmission] = useState(null);
  
  // Edit request modal states
  const [showEditRequestModal, setShowEditRequestModal] = useState(false);
  const [selectedEditRequest, setSelectedEditRequest] = useState(null);
  const [showEditRequestRejectModal, setShowEditRequestRejectModal] = useState(false);
  const [editRequestRejectionReason, setEditRequestRejectionReason] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add' or 'edit'
  const [currentItem, setCurrentItem] = useState(null);

  // Form states
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    categories: '',
    description: '',
    publishedDate: '',
    coverImage: null,
    cloudinaryData: null,
    readingLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
  });

  const [gameForm, setGameForm] = useState({
    title: '',
    genre: '',
    developer: '',
    platform: '',
    releaseDate: '',
    description: '',
    coverImage: null,
    cloudinaryData: null,
    platformLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
  });

  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });

  // useEffect must be called before any conditional returns
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated) {
      fetchData();
    }
  }, [activeTab, isAuthenticated]);

  // Check if user is authenticated - moved after all hooks
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please log in to access the admin panel.
        </div>
      </div>
    );
  }

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🛠️ Admin Panel - Fetching data for tab:', activeTab);
      
      if (activeTab === 'books') {
        const response = await booksAPI.getAll();
        console.log('🛠️ Books response:', {
          status: response.status,
          dataType: typeof response.data,
          hasDataProperty: 'data' in response.data,
          dataValue: response.data
        });
        
        // Handle different response structures
        let booksData = [];
        if (response.data && Array.isArray(response.data.data)) {
          booksData = response.data.data;
        } else if (Array.isArray(response.data)) {
          booksData = response.data;
        } else {
          console.warn('🛠️ Unexpected books response structure:', response.data);
          booksData = [];
        }
        
        console.log('🛠️ Setting books:', { count: booksData.length });
        setBooks(booksData);
        
      } else if (activeTab === 'games') {
        const response = await gamesAPI.getAll();
        console.log('🛠️ Games response:', {
          status: response.status,
          dataType: typeof response.data,
          hasDataProperty: 'data' in response.data,
          dataValue: response.data
        });
        
        // Handle different response structures
        let gamesData = [];
        if (response.data && Array.isArray(response.data.data)) {
          gamesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          gamesData = response.data;
        } else {
          console.warn('🛠️ Unexpected games response structure:', response.data);
          gamesData = [];
        }
        
        console.log('🛠️ Setting games:', { count: gamesData.length });
        setGames(gamesData);
        
      } else if (activeTab === 'users') {
        const response = await usersAPI.getAll();
        console.log('🛠️ Users response:', {
          status: response.status,
          dataType: typeof response.data,
          hasDataProperty: 'data' in response.data,
          dataValue: response.data
        });
        
        // Handle different response structures
        let usersData = [];
        if (response.data && Array.isArray(response.data.data)) {
          usersData = response.data.data;
        } else if (Array.isArray(response.data)) {
          usersData = response.data;
        } else {
          console.warn('🛠️ Unexpected users response structure:', response.data);
          usersData = [];
        }
        
        console.log('🛠️ Setting users:', { count: usersData.length });
        setUsers(usersData);
        
      } else if (activeTab === 'notifications') {
        console.log('🛠️ Fetching notifications, submissions, and edit requests...');
        
        const [notifResponse, submissionsResponse, editRequestsResponse] = await Promise.all([
          notificationsAPI.getAdminNotifications(),
          submissionsAPI.getPending(),
          editRequestsAPI.getPending()
        ]);
        
        console.log('🛠️ Notifications responses:', {
          notifications: {
            status: notifResponse.status,
            dataType: typeof notifResponse.data,
            hasDataProperty: 'data' in notifResponse.data,
            dataValue: notifResponse.data
          },
          submissions: {
            status: submissionsResponse.status,
            dataType: typeof submissionsResponse.data,
            hasDataProperty: 'data' in submissionsResponse.data,
            dataValue: submissionsResponse.data
          },
          editRequests: {
            status: editRequestsResponse.status,
            dataType: typeof editRequestsResponse.data,
            hasDataProperty: 'data' in editRequestsResponse.data,
            dataValue: editRequestsResponse.data
          }
        });
        
        // Handle different response structures for notifications
        let notificationData = [];
        if (notifResponse.data && Array.isArray(notifResponse.data.data)) {
          notificationData = notifResponse.data.data;
        } else if (Array.isArray(notifResponse.data)) {
          notificationData = notifResponse.data;
        } else {
          console.warn('🛠️ Unexpected notifications response structure:', notifResponse.data);
          notificationData = [];
        }
        
        // Handle different response structures for submissions
        let submissionData = [];
        if (submissionsResponse.data && Array.isArray(submissionsResponse.data.data)) {
          submissionData = submissionsResponse.data.data;
        } else if (Array.isArray(submissionsResponse.data)) {
          submissionData = submissionsResponse.data;
        } else {
          console.warn('🛠️ Unexpected submissions response structure:', submissionsResponse.data);
          submissionData = [];
        }
        
        // Handle different response structures for edit requests
        let editRequestData = [];
        if (editRequestsResponse.data && Array.isArray(editRequestsResponse.data.data)) {
          editRequestData = editRequestsResponse.data.data;
        } else if (Array.isArray(editRequestsResponse.data)) {
          editRequestData = editRequestsResponse.data;
        } else {
          console.warn('🛠️ Unexpected edit requests response structure:', editRequestsResponse.data);
          editRequestData = [];
        }
        
        const formattedNotifications = notificationData.map(notification => ({
          ...notification,
          id: notification._id,
          timestamp: new Date(notification.createdAt)
        }));
        
        const formattedSubmissions = submissionData.map(submission => ({
          ...submission,
          id: submission._id,
          submittedAt: new Date(submission.createdAt)
        }));
        
        const formattedEditRequests = editRequestData.map(editRequest => ({
          ...editRequest,
          id: editRequest._id,
          requestedAt: new Date(editRequest.createdAt)
        }));
        
        console.log('🛠️ Setting notifications, submissions, and edit requests:', {
          notificationsCount: formattedNotifications.length,
          submissionsCount: formattedSubmissions.length,
          editRequestsCount: formattedEditRequests.length
        });
        
        setNotifications(formattedNotifications);
        setPendingSubmissions(formattedSubmissions);
        setPendingEditRequests(formattedEditRequests);
      }
      setError('');
    } catch (error) {
      console.error('🛠️ Error fetching data:', {
        tab: activeTab,
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to fetch data. ';
      if (error.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage += 'Access denied. Admin privileges required.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += 'Cannot connect to server. Please check if the server is running.';
      } else {
        errorMessage += error.message || 'Please try again later.';
      }
      
      setError(errorMessage);
      
      // Set empty arrays on error to prevent map errors
      if (activeTab === 'books') setBooks([]);
      else if (activeTab === 'games') setGames([]);
      else if (activeTab === 'users') setUsers([]);
      else if (activeTab === 'notifications') {
        setNotifications([]);
        setPendingSubmissions([]);
        setPendingEditRequests([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalType('add');
    setCurrentItem(null);
    resetForms();
    setShowModal(true);
  };

  const handleEdit = (item) => {
    console.log('🔄 handleEdit - Item data:', item);
    setModalType('edit');
    setCurrentItem(item);
    if (activeTab === 'books') {
      setBookForm({
        title: item.title || '',
        author: item.author || '',
        categories: item.categories || '',
        description: item.description || '',
        publishedDate: item.publishedDate ? item.publishedDate.split('T')[0] : '',
        coverImage: item.Coverpage || null, // Preserve existing image URL
        cloudinaryData: item.cloudinaryData || null, // Preserve existing Cloudinary data
        readingLinks: item.readingLinks && item.readingLinks.length > 0 ? item.readingLinks : [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
      console.log('📚 handleEdit - Book form set:', {
        coverImage: item.Coverpage,
        cloudinaryData: item.cloudinaryData
      });
    } else if (activeTab === 'games') {
      setGameForm({
        title: item.title || '',
        genre: item.genre || '',
        developer: item.developer || '',
        platform: item.platform || '',
        releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '',
        description: item.description || '',
        coverImage: item.coverImage || null, // Preserve existing image URL
        cloudinaryData: item.cloudinaryData || null, // Preserve existing Cloudinary data
        platformLinks: item.platformLinks && item.platformLinks.length > 0 ? item.platformLinks : [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
      console.log('🎮 handleEdit - Game form set:', {
        coverImage: item.coverImage,
        cloudinaryData: item.cloudinaryData
      });
    } else if (activeTab === 'users') {
      setUserForm({
        username: item.username || '',
        email: item.email || '',
        password: '',
        role: item.role || 'user'
      });
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      if (activeTab === 'books') {
        await booksAPI.delete(id);
      } else if (activeTab === 'games') {
        await gamesAPI.delete(id);
      } else if (activeTab === 'users') {
        await usersAPI.delete(id);
      }
      setSuccess('Item deleted successfully');
      fetchData();
    } catch (error) {
      setError('Failed to delete item');
      console.error('Error deleting item:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (activeTab === 'books') {
        console.log('📚 Admin Panel - Submitting book form:', {
          modalType,
          formData: bookForm,
          coverImageType: typeof bookForm.coverImage,
          hasCloudinaryData: !!bookForm.cloudinaryData
        });
        
        if (modalType === 'add') {
          response = await booksAPI.create(bookForm);
        } else {
          response = await booksAPI.update(currentItem._id, bookForm);
        }
      } else if (activeTab === 'games') {
        console.log('🎮 Admin Panel - Submitting game form:', {
          modalType,
          formData: gameForm,
          coverImageType: typeof gameForm.coverImage,
          hasCloudinaryData: !!gameForm.cloudinaryData
        });
        
        if (modalType === 'add') {
          response = await gamesAPI.create(gameForm);
        } else {
          response = await gamesAPI.update(currentItem._id, gameForm);
        }
      } else if (activeTab === 'users') {
        console.log('👤 Admin Panel - Submitting user form:', {
          modalType,
          formData: userForm
        });
        
        if (modalType === 'add') {
          response = await usersAPI.create(userForm);
        } else {
          response = await usersAPI.update(currentItem._id, userForm);
        }
      }

      console.log('✅ Admin Panel - API Response:', response);
      setSuccess(`Item ${modalType === 'add' ? 'created' : 'updated'} successfully`);
      setShowModal(false);
      fetchData();
      resetForms();
    } catch (error) {
      console.error(`❌ Admin Panel - Error ${modalType}ing item:`, {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      setError(`Failed to ${modalType} item: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addLink = (type) => {
    if (type === 'book') {
      setBookForm({
        ...bookForm,
        readingLinks: [...bookForm.readingLinks, { name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
    } else {
      setGameForm({
        ...gameForm,
        platformLinks: [...gameForm.platformLinks, { name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
    }
  };
  
  const removeLink = (type, index) => {
    if (type === 'book') {
      const newLinks = bookForm.readingLinks.filter((_, i) => i !== index);
      setBookForm({ ...bookForm, readingLinks: newLinks });
    } else {
      const newLinks = gameForm.platformLinks.filter((_, i) => i !== index);
      setGameForm({ ...gameForm, platformLinks: newLinks });
    }
  };
  
  const updateLink = (type, index, field, value) => {
    if (type === 'book') {
      const newLinks = [...bookForm.readingLinks];
      newLinks[index][field] = value;
      setBookForm({ ...bookForm, readingLinks: newLinks });
    } else {
      const newLinks = [...gameForm.platformLinks];
      newLinks[index][field] = value;
      setGameForm({ ...gameForm, platformLinks: newLinks });
    }
  };

  // Notification handling functions
  const markAsRead = async (notificationId) => {
    try {
      console.log('🔔 Marking notification as read:', notificationId);
      console.log('🔔 Current user:', user);
      console.log('🔔 User from localStorage:', localStorage.getItem('user'));
      
      if (!user || !user._id) {
        setError('User authentication required. Please refresh the page.');
        return;
      }
      
      console.log('🔔 About to call notificationsAPI.markAsRead with ID:', notificationId);
      await notificationsAPI.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      console.log('✅ Notification marked as read successfully');
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      console.error('❌ Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: {
          method: error.config?.method,
          url: error.config?.url,
          headers: error.config?.headers
        }
      });
      setError('Failed to mark notification as read: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const markAllAsRead = async () => {
    if (!window.confirm('Are you sure you want to mark all notifications as read?')) {
      return;
    }
    
    try {
      if (!user || !user._id) {
        setError('User authentication required. Please refresh the page.');
        return;
      }
      
      await notificationsAPI.markAllAsRead();
      
      // Update local state to mark all as read
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      setSuccess('All notifications marked as read.');
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      setError('Error marking notifications as read: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to permanently delete ALL notifications? This action cannot be undone and will remove all notification history.')) {
      return;
    }
    
    try {
      if (!user || !user._id) {
        setError('User authentication required. Please refresh the page.');
        return;
      }
      
      const response = await notificationsAPI.clearAllNotifications();
      
      // Clear local state
      setNotifications([]);
      
      setSuccess(`All notifications cleared successfully! (${response.data.deletedCount} notifications removed)`);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      setError('Error clearing all notifications: ' + (error.response?.data?.error || error.message));
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
        
        // Refresh notifications
        if (activeTab === 'notifications') {
          fetchData();
        }
        
        setSuccess('Content approved successfully! User has been notified.');
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
      setError('Error ' + action + 'ing submission: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleViewDetails = (submission) => {
    setDetailsSubmission(submission);
    setShowDetailsModal(true);
  };
  
  const handleRejectSubmission = async () => {
    if (!selectedSubmission || !rejectionReason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await submissionsAPI.reject(selectedSubmission.id, rejectionReason.trim());
      
      // Remove from pending submissions
      setPendingSubmissions(prev => 
        prev.filter(sub => sub.id !== selectedSubmission.id)
      );
      
      // Refresh notifications
      if (activeTab === 'notifications') {
        fetchData();
      }
      
      // Close modal and reset state
      setShowRejectModal(false);
      setSelectedSubmission(null);
      setRejectionReason('');
      
      setSuccess('Content rejected successfully! User has been notified with the reason.');
      
    } catch (error) {
      console.error('Error rejecting submission:', error);
      setError('Error rejecting submission: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Edit Request handling functions
  const handleEditRequestAction = async (editRequestId, action, reviewNotes = '') => {
    try {
      console.log(action + ' edit request:', editRequestId);
      
      if (action === 'approve') {
        await editRequestsAPI.approve(editRequestId, reviewNotes);
        
        // Remove from pending edit requests
        setPendingEditRequests(prev => 
          prev.filter(req => req.id !== editRequestId)
        );
        
        // Refresh notifications
        if (activeTab === 'notifications') {
          fetchData();
        }
        
        setSuccess('Edit request approved successfully! Content has been updated and user notified.');
      } else if (action === 'reject') {
        // For reject, open the modal instead of direct action
        const editRequest = pendingEditRequests.find(req => req.id === editRequestId);
        setSelectedEditRequest(editRequest);
        setEditRequestRejectionReason('');
        setShowEditRequestRejectModal(true);
        return; // Don't proceed with the rejection yet
      }
      
    } catch (error) {
      console.error('Error handling edit request:', error);
      setError('Error ' + action + 'ing edit request: ' + (error.response?.data?.error || error.message));
    }
  };
  
  const handleViewEditRequest = (editRequest) => {
    setSelectedEditRequest(editRequest);
    setShowEditRequestModal(true);
  };
  
  const handleRejectEditRequest = async () => {
    if (!selectedEditRequest || !editRequestRejectionReason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await editRequestsAPI.reject(selectedEditRequest.id, editRequestRejectionReason.trim());
      
      // Remove from pending edit requests
      setPendingEditRequests(prev => 
        prev.filter(req => req.id !== selectedEditRequest.id)
      );
      
      // Refresh notifications
      if (activeTab === 'notifications') {
        fetchData();
      }
      
      // Close modal and reset state
      setShowEditRequestRejectModal(false);
      setSelectedEditRequest(null);
      setEditRequestRejectionReason('');
      
      setSuccess('Edit request rejected successfully! User has been notified with the reason.');
      
    } catch (error) {
      console.error('Error rejecting edit request:', error);
      setError('Error rejecting edit request: ' + (error.response?.data?.error || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForms = () => {
    setBookForm({
      title: '',
      author: '',
      categories: '',
      description: '',
      publishedDate: '',
      coverImage: null,
      cloudinaryData: null,
      readingLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
    });
    setGameForm({
      title: '',
      genre: '',
      developer: '',
      platform: '',
      releaseDate: '',
      description: '',
      coverImage: null,
      cloudinaryData: null,
      platformLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
    });
    setUserForm({
      username: '',
      email: '',
      password: '',
      role: 'user'
    });
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    let data = [];
    if (activeTab === 'books') data = Array.isArray(books) ? books : [];
    else if (activeTab === 'games') data = Array.isArray(games) ? games : [];
    else if (activeTab === 'users') data = Array.isArray(users) ? users : [];

    if (data.length === 0) {
      return (
        <div className="text-center py-5">
          <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
          <h5>No {activeTab} found</h5>
          <p className="text-muted">Start by adding some {activeTab}.</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              {activeTab === 'books' && (
                <>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Category</th>

                  <th>Published</th>
                  <th>Actions</th>
                </>
              )}
              {activeTab === 'games' && (
                <>
                  <th>Title</th>
                  <th>Developer</th>
                  <th>Genre</th>
                  <th>Platform</th>
                  <th>Price</th>
                  <th>Actions</th>
                </>
              )}
              {activeTab === 'users' && (
                <>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item._id}>
                {activeTab === 'books' && (
                  <>
                    <td>{item.title}</td>
                    <td>{item.author}</td>
                    <td><span className="badge bg-primary">{item.categories}</span></td>

                    <td>{new Date(item.publishedDate).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </>
                )}
                {activeTab === 'games' && (
                  <>
                    <td>{item.title}</td>
                    <td>{item.developer}</td>
                    <td><span className="badge bg-primary">{item.genre}</span></td>
                    <td><span className="badge bg-secondary">{item.platform}</span></td>

                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </>
                )}
                {activeTab === 'users' && (
                  <>
                    <td>{item.username}</td>
                    <td>{item.email}</td>
                    <td>
                      <span className={`badge ${item.role === 'admin' ? 'bg-danger' : 'bg-success'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(item)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderForm = () => {
    if (activeTab === 'books') {
      return (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={bookForm.title}
                onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Author</label>
              <input
                type="text"
                className="form-control"
                value={bookForm.author}
                onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Category</label>
              <input
                type="text"
                className="form-control"
                value={bookForm.categories}
                onChange={(e) => setBookForm({...bookForm, categories: e.target.value})}
                required
              />
            </div>

          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Published Date</label>
              <input
                type="date"
                className="form-control"
                value={bookForm.publishedDate}
                onChange={(e) => setBookForm({...bookForm, publishedDate: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <FileUploadWithToggle
                onFileSelect={(result) => {
                  console.log('Admin Book FileUpload result:', result);
                  // Handle both upload methods
                  if (result && result.uploadMethod === 'cloudinary') {
                    console.log('Setting Cloudinary data:', result.cloudinaryUrl);
                    setBookForm({...bookForm, coverImage: result.cloudinaryUrl, cloudinaryData: result});
                  } else if (result && result.uploadMethod === 'local') {
                    console.log('Setting local file:', result.file);
                    setBookForm({...bookForm, coverImage: result.file});
                  } else {
                    setBookForm({...bookForm, coverImage: result});
                  }
                }}
                currentImage={modalType === 'edit' && currentItem?.Coverpage ? currentItem.Coverpage : null}
                label="Book Cover Image"
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                cloudinaryFolder="books"
                defaultMethod="cloudinary"
              />
            </div>
          </div>
            <div className="mb-3">
              <label className="form-label">
                <i className="fas fa-link me-2"></i>
                Reading Links
              </label>
              {bookForm.readingLinks.map((link, index) => (
                <div key={index} className="card mb-2">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Platform/Store Name"
                          value={link.name}
                          onChange={(e) => updateLink('book', index, 'name', e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://..."
                          value={link.url}
                          onChange={(e) => updateLink('book', index, 'url', e.target.value)}
                        />
                      </div>
                      <div className="col-md-2">
                        <button
                          type="button"
                          className="btn btn-outline-danger w-100"
                          onClick={() => removeLink('book', index)}
                          disabled={bookForm.readingLinks.length === 1}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => addLink('book')}
              >
                <i className="fas fa-plus me-2"></i>
                Add Reading Link
              </button>
            </div>
            
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows="3"
                value={bookForm.description}
                onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                required
              ></textarea>
            </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (modalType === 'add' ? 'Add Book' : 'Update Book')}
            </button>
          </div>
        </form>
      );
    } else if (activeTab === 'games') {
      return (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                value={gameForm.title}
                onChange={(e) => setGameForm({...gameForm, title: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Developer</label>
              <input
                type="text"
                className="form-control"
                value={gameForm.developer}
                onChange={(e) => setGameForm({...gameForm, developer: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Genre</label>
              <input
                type="text"
                className="form-control"
                value={gameForm.genre}
                onChange={(e) => setGameForm({...gameForm, genre: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Platform</label>
              <input
                type="text"
                className="form-control"
                value={gameForm.platform}
                onChange={(e) => setGameForm({...gameForm, platform: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Release Date</label>
              <input
                type="date"
                className="form-control"
                value={gameForm.releaseDate}
                onChange={(e) => setGameForm({...gameForm, releaseDate: e.target.value})}
                required
              />
            </div>

          </div>
          <div className="mb-3">
            <FileUploadWithToggle
              onFileSelect={(result) => {
                console.log('Admin Game FileUpload result:', result);
                // Handle both upload methods
                if (result && result.uploadMethod === 'cloudinary') {
                  console.log('Setting Cloudinary data:', result.cloudinaryUrl);
                  setGameForm({...gameForm, coverImage: result.cloudinaryUrl, cloudinaryData: result});
                } else if (result && result.uploadMethod === 'local') {
                  console.log('Setting local file:', result.file);
                  setGameForm({...gameForm, coverImage: result.file});
                } else {
                  setGameForm({...gameForm, coverImage: result});
                }
              }}
              currentImage={modalType === 'edit' && currentItem?.coverImage ? currentItem.coverImage : null}
              label="Game Cover Image"
              accept="image/*"
              maxSize={5 * 1024 * 1024}
              cloudinaryFolder="games"
              defaultMethod="cloudinary"
            />
          </div>
          
          <div className="mb-3">
            <label className="form-label">
              <i className="fas fa-link me-2"></i>
              Platform Links
            </label>
            {gameForm.platformLinks.map((link, index) => (
              <div key={index} className="card mb-2">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Platform Name (e.g., Steam)"
                        value={link.name}
                        onChange={(e) => updateLink('game', index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={link.url}
                        onChange={(e) => updateLink('game', index, 'url', e.target.value)}
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeLink('game', index)}
                        disabled={gameForm.platformLinks.length === 1}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => addLink('game')}
            >
              <i className="fas fa-plus me-2"></i>
              Add Platform Link
            </button>
          </div>
          
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={gameForm.description}
              onChange={(e) => setGameForm({...gameForm, description: e.target.value})}
              required
            ></textarea>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (modalType === 'add' ? 'Add Game' : 'Update Game')}
            </button>
          </div>
        </form>
      );
    } else if (activeTab === 'users') {
      return (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                value={userForm.username}
                onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={userForm.email}
                onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Password {modalType === 'edit' && '(leave blank to keep current)'}</label>
              <input
                type="password"
                className="form-control"
                value={userForm.password}
                onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                required={modalType === 'add'}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={userForm.role}
                onChange={(e) => setUserForm({...userForm, role: e.target.value})}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (modalType === 'add' ? 'Add User' : 'Update User')}
            </button>
          </div>
        </form>
      );
    }
  };

  const renderNotifications = () => {
    // Ensure arrays exist before filtering
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const safePendingSubmissions = Array.isArray(pendingSubmissions) ? pendingSubmissions : [];
    const safePendingEditRequests = Array.isArray(pendingEditRequests) ? pendingEditRequests : [];
    
    const unreadCount = safeNotifications.filter(n => !n.read).length;
    const pendingCount = safePendingSubmissions.filter(s => s.status === 'pending').length;
    const editRequestCount = safePendingEditRequests.filter(r => r.status === 'pending').length;
    
    return (
      <div>
        {/* Stats Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 shadow">
              <div className="card-body text-center">
                <i className="fas fa-clock fa-2x text-warning mb-2"></i>
                <h3 className="text-warning">{pendingCount}</h3>
                <p className="text-muted mb-0">Pending Submissions</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow">
              <div className="card-body text-center">
                <i className="fas fa-edit fa-2x text-info mb-2"></i>
                <h3 className="text-info">{editRequestCount}</h3>
                <p className="text-muted mb-0">Edit Requests</p>
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
                <h3 className="text-success">{safeNotifications.filter(n => n.type === 'approval' || n.type === 'edit_approved').length}</h3>
                <p className="text-muted mb-0">Approved Today</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Pending Submissions */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-hourglass-half me-2"></i>
              Pending Submissions ({pendingCount})
            </h5>
          </div>
          <div className="card-body">
            {safePendingSubmissions.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h5>No pending submissions</h5>
                <p className="text-muted">All submissions have been reviewed.</p>
              </div>
            ) : (
              safePendingSubmissions.map(submission => (
                <div key={submission.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`fas ${submission.type === 'book' ? 'fa-book' : 'fa-gamepad'} me-2 text-primary`}></i>
                          <h5 className="mb-0">{submission.title}</h5>
                          <span className={`badge ms-2 ${submission.type === 'book' ? 'bg-info' : 'bg-success'}`}>
                            {submission.type === 'book' ? 'Book' : 'Game'}
                          </span>
                        </div>
                        <p className="text-muted mb-2">
                          <strong>By:</strong> {submission.type === 'book' ? submission.author : submission.developer} |
                          <strong> Submitted by:</strong> {submission.submittedBy?.username} |
                          <strong> Date:</strong> {submission.submittedAt.toLocaleDateString()}
                        </p>
                        <p className="mb-2">{submission.description}</p>
                        <div className="mb-2">
                          <strong>Category:</strong> {submission.type === 'book' ? submission.categories : `${submission.genre} - ${submission.platform}`}
                        </div>
                        {(submission.readingLinks || submission.platformLinks) && (
                          <div>
                            <strong>Links:</strong>
                            {(submission.readingLinks || submission.platformLinks)?.map((link, index) => (
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
                            className="btn btn-info btn-sm"
                            onClick={() => handleViewDetails(submission)}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Details
                          </button>
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
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Pending Edit Requests */}
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">
              <i className="fas fa-edit me-2"></i>
              Pending Edit Requests ({editRequestCount})
            </h5>
          </div>
          <div className="card-body">
            {safePendingEditRequests.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                <h5>No pending edit requests</h5>
                <p className="text-muted">All edit requests have been reviewed.</p>
              </div>
            ) : (
              safePendingEditRequests.map(editRequest => (
                <div key={editRequest.id} className="card mb-3">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-8">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`fas ${editRequest.contentType === 'book' ? 'fa-book' : 'fa-gamepad'} me-2 text-info`}></i>
                          <h5 className="mb-0">{editRequest.contentId?.title || 'Unknown Content'}</h5>
                          <span className={`badge ms-2 ${editRequest.contentType === 'book' ? 'bg-info' : 'bg-success'}`}>
                            {editRequest.contentType === 'book' ? 'Book Edit' : 'Game Edit'}
                          </span>
                        </div>
                        <p className="text-muted mb-2">
                          <strong>Requested by:</strong> {editRequest.requestedBy?.username} |
                          <strong> Date:</strong> {editRequest.requestedAt.toLocaleDateString()}
                        </p>
                        <p className="mb-2">
                          <strong>Change Summary:</strong> {editRequest.changeSummary}
                        </p>
                        <div className="mb-2">
                          <span className="badge bg-warning text-dark">
                            <i className="fas fa-clock me-1"></i>
                            Pending Review
                          </span>
                        </div>
                      </div>
                      <div className="col-md-4 text-end">
                        <div className="d-grid gap-2">
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleViewEditRequest(editRequest)}
                          >
                            <i className="fas fa-eye me-2"></i>
                            View Changes
                          </button>
                          <button
                            className="btn btn-success"
                            onClick={() => handleEditRequestAction(editRequest.id, 'approve')}
                          >
                            <i className="fas fa-check me-2"></i>
                            Approve
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleEditRequestAction(editRequest.id, 'reject')}
                          >
                            <i className="fas fa-times me-2"></i>
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Notifications */}
        <div className="card">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-bell me-2"></i>
                All Notifications ({safeNotifications.length})
              </h5>
              <div className="btn-group">
                {safeNotifications.some(n => !n.read) && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={markAllAsRead}
                    title="Mark all notifications as read"
                  >
                    <i className="fas fa-check-double me-2"></i>
                    Mark All as Read
                  </button>
                )}
                {safeNotifications.length > 0 && (
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
          </div>
          <div className="card-body">
            {safeNotifications.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                <h5>No notifications</h5>
                <p className="text-muted">You are all caught up!</p>
              </div>
            ) : (
              safeNotifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`card mb-2 ${!notification.read ? 'border-primary' : 'border-light'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                  style={{ cursor: !notification.read ? 'pointer' : 'default' }}
                >
                  <div className="card-body">
                    <div className="d-flex align-items-start">
                      <i className={`fas ${
                        notification.type === 'submission' ? 'fa-upload' :
                        notification.type === 'approval' ? 'fa-check-circle' :
                        notification.type === 'rejection' ? 'fa-times-circle' :
                        'fa-cog'
                      } me-3 mt-1 ${
                        notification.type === 'submission' ? 'text-info' :
                        notification.type === 'approval' ? 'text-success' :
                        notification.type === 'rejection' ? 'text-danger' :
                        'text-primary'
                      }`}></i>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
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
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-cog me-2"></i>
            {isAdmin ? 'Admin Panel' : 'Content Management'}
          </h1>
          <p className="section-subtitle">
            {isAdmin ? 'Manage your library and information database' : 'Manage your published content'}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}

      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      {/* Tabs */}
      <div className="card border-0 shadow">
        <div className="card-header bg-white">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'books' ? 'active' : ''}`}
                onClick={() => setActiveTab('books')}
              >
                <i className="fas fa-book me-2"></i>
                Books
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'games' ? 'active' : ''}`}
                onClick={() => setActiveTab('games')}
              >
                <i className="fas fa-gamepad me-2"></i>
                Games
              </button>
            </li>
            {isAdmin && (
              <>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                  >
                    <i className="fas fa-users me-2"></i>
                    Users
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    <i className="fas fa-bell me-2"></i>
                    Notifications
                    {(Array.isArray(pendingSubmissions) && pendingSubmissions.length > 0) || (Array.isArray(pendingEditRequests) && pendingEditRequests.length > 0) ? (
                      <span className="badge bg-danger ms-1">
                        {(Array.isArray(pendingSubmissions) ? pendingSubmissions.length : 0) + (Array.isArray(pendingEditRequests) ? pendingEditRequests.length : 0)}
                      </span>
                    ) : null}
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
        <div className="card-body">
          {activeTab !== 'notifications' ? (
            <>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="mb-0">
                  Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h5>
                <button className="btn btn-primary" onClick={handleAdd}>
                  <i className="fas fa-plus me-2"></i>
                  Add {activeTab.slice(0, -1)}
                </button>
              </div>
              {renderTable()}
            </>
          ) : (
            renderNotifications()
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === 'add' ? 'Add' : 'Edit'} {activeTab.slice(0, -1)}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {renderForm()}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                        <strong>Submitted by:</strong> {selectedSubmission.submittedBy?.username}
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
      
      {/* View Details Modal */}
      {showDetailsModal && detailsSubmission && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={'fas ' + (detailsSubmission.type === 'book' ? 'fa-book' : 'fa-gamepad') + ' me-2'}></i>
                  Submission Details: {detailsSubmission.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsSubmission(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-info-circle me-2"></i>
                          Basic Information
                        </h6>
                      </div>
                      <div className="card-body">
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td><strong>Title:</strong></td>
                              <td>{detailsSubmission.title}</td>
                            </tr>
                            <tr>
                              <td><strong>Type:</strong></td>
                              <td>
                                <span className={`badge ${detailsSubmission.type === 'book' ? 'bg-info' : 'bg-success'}`}>
                                  {detailsSubmission.type === 'book' ? 'Book' : 'Game'}
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td><strong>{detailsSubmission.type === 'book' ? 'Author' : 'Developer'}:</strong></td>
                              <td>{detailsSubmission.type === 'book' ? detailsSubmission.author : detailsSubmission.developer}</td>
                            </tr>

                            <tr>
                              <td><strong>Category:</strong></td>
                              <td>{detailsSubmission.type === 'book' ? detailsSubmission.categories : `${detailsSubmission.genre} - ${detailsSubmission.platform}`}</td>
                            </tr>
                            <tr>
                              <td><strong>{detailsSubmission.type === 'book' ? 'Published' : 'Release'} Date:</strong></td>
                              <td>{new Date(detailsSubmission.type === 'book' ? detailsSubmission.publishedDate : detailsSubmission.releaseDate).toLocaleDateString()}</td>
                            </tr>
                            <tr>
                              <td><strong>Submitted by:</strong></td>
                              <td>{detailsSubmission.submittedBy?.username}</td>
                            </tr>
                            <tr>
                              <td><strong>Submitted on:</strong></td>
                              <td>{detailsSubmission.submittedAt.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-image me-2"></i>
                          Cover Image
                        </h6>
                      </div>
                      <div className="card-body text-center">
                        {detailsSubmission.coverImage ? (
                          <img 
                            src={getImageUrl(detailsSubmission.coverImage, detailsSubmission.type)} 
                            alt={detailsSubmission.title}
                            className="img-fluid rounded shadow"
                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div style={{ display: 'none' }} className="text-muted">
                          <i className="fas fa-image fa-3x mb-2"></i>
                          <p>No cover image available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-align-left me-2"></i>
                          Description
                        </h6>
                      </div>
                      <div className="card-body">
                        <p className="mb-0">{detailsSubmission.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {(detailsSubmission.readingLinks || detailsSubmission.platformLinks) && (
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="fas fa-link me-2"></i>
                            {detailsSubmission.type === 'book' ? 'Reading Links' : 'Platform Links'}
                          </h6>
                        </div>
                        <div className="card-body">
                          {(detailsSubmission.readingLinks || detailsSubmission.platformLinks)?.length > 0 ? (
                            <div className="row">
                              {(detailsSubmission.readingLinks || detailsSubmission.platformLinks).map((link, index) => (
                                <div key={index} className="col-md-6 mb-2">
                                  <div className="card border">
                                    <div className="card-body py-2">
                                      <div className="d-flex align-items-center">
                                        <i className="fas fa-external-link-alt me-2 text-primary"></i>
                                        <div>
                                          <strong>{link.name}</strong><br/>
                                          <small className="text-muted">
                                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                              {link.url}
                                            </a>
                                          </small>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No links provided</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsSubmission(null);
                  }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success me-2"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsSubmission(null);
                    handleSubmissionAction(detailsSubmission.id, 'approve');
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  Approve
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setDetailsSubmission(null);
                    handleSubmissionAction(detailsSubmission.id, 'reject');
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Request View Modal */}
      {showEditRequestModal && selectedEditRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={'fas ' + (selectedEditRequest.contentType === 'book' ? 'fa-book' : 'fa-gamepad') + ' me-2'}></i>
                  Edit Request: {selectedEditRequest.contentId?.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setSelectedEditRequest(null);
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="fas fa-file-alt me-2"></i>
                          Current Content
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <tbody>
                              {Object.entries(selectedEditRequest.originalContent || {}).map(([key, value]) => {
                                if (key === '_id' || key === '__v' || key === 'createdAt' || key === 'updatedAt') return null;
                                return (
                                  <tr key={key}>
                                    <td><strong>{key}:</strong></td>
                                    <td>
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card h-100">
                      <div className="card-header bg-warning">
                        <h6 className="mb-0">
                          <i className="fas fa-edit me-2"></i>
                          Proposed Changes
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <tbody>
                              {Object.entries(selectedEditRequest.proposedChanges || {}).map(([key, value]) => {
                                if (key === '_id' || key === '__v') return null;
                                return (
                                  <tr key={key}>
                                    <td><strong>{key}:</strong></td>
                                    <td className="text-warning">
                                      {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-comment me-2"></i>
                          Change Summary
                        </h6>
                      </div>
                      <div className="card-body">
                        <p className="mb-0">{selectedEditRequest.changeSummary}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="fas fa-info-circle me-2"></i>
                          Request Details
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          <div className="col-md-6">
                            <p><strong>Requested by:</strong> {selectedEditRequest.requestedBy?.username}</p>
                            <p><strong>Content Type:</strong> {selectedEditRequest.contentType}</p>
                          </div>
                          <div className="col-md-6">
                            <p><strong>Request Date:</strong> {selectedEditRequest.requestedAt.toLocaleString()}</p>
                            <p><strong>Status:</strong> <span className="badge bg-warning">{selectedEditRequest.status}</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setSelectedEditRequest(null);
                  }}
                >
                  Close
                </button>
                <button 
                  type="button" 
                  className="btn btn-success me-2"
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setSelectedEditRequest(null);
                    handleEditRequestAction(selectedEditRequest.id, 'approve');
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  Approve Changes
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    setShowEditRequestModal(false);
                    setSelectedEditRequest(null);
                    handleEditRequestAction(selectedEditRequest.id, 'reject');
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  Reject Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Request Rejection Modal */}
      {showEditRequestRejectModal && selectedEditRequest && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-times-circle text-danger me-2"></i>
                  Reject Edit Request
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditRequestRejectModal(false);
                    setSelectedEditRequest(null);
                    setEditRequestRejectionReason('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <h6 className="mb-2">
                    <i className={'fas ' + (selectedEditRequest.contentType === 'book' ? 'fa-book' : 'fa-gamepad') + ' me-2'}></i>
                    {selectedEditRequest.contentId?.title}
                  </h6>
                  <p className="mb-1">
                    <strong>Type:</strong> {selectedEditRequest.contentType === 'book' ? 'Book' : 'Game'} Edit Request
                  </p>
                  <p className="mb-1">
                    <strong>Requested by:</strong> {selectedEditRequest.requestedBy?.username}
                  </p>
                  <p className="mb-0">
                    <strong>Change Summary:</strong> {selectedEditRequest.changeSummary}
                  </p>
                </div>
                
                <div className="mb-3">
                  <label htmlFor="editRequestRejectionReason" className="form-label">
                    <strong>Reason for Rejection *</strong>
                  </label>
                  <textarea
                    id="editRequestRejectionReason"
                    className="form-control"
                    rows="4"
                    placeholder="Please provide a detailed reason for rejecting this edit request. This message will be sent to the user."
                    value={editRequestRejectionReason}
                    onChange={(e) => setEditRequestRejectionReason(e.target.value)}
                    disabled={isSubmitting}
                  />
                  <div className="form-text">
                    Be specific and constructive in your feedback to help the user understand why the changes were rejected.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditRequestRejectModal(false);
                    setSelectedEditRequest(null);
                    setEditRequestRejectionReason('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={handleRejectEditRequest}
                  disabled={isSubmitting || !editRequestRejectionReason.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times me-2"></i>
                      Reject Edit Request
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

export default AdminPanel;