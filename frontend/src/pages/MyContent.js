import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { editRequestsAPI } from '../services/api';
import { handleImageError, getLocalPlaceholder } from '../utils/placeholderUtils';
import { getImageUrl } from '../utils/imageUtils';
import FileUploadWithToggle from '../components/FileUploadWithToggle';

const MyContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState([]);
  const [editRequests, setEditRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [changeSummary, setChangeSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentResponse, editRequestsResponse] = await Promise.all([
        editRequestsAPI.getMyPublishedContent(),
        editRequestsAPI.getMy()
      ]);
      
      setContent(contentResponse.data.data || []);
      setEditRequests(editRequestsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch your content: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (item) => {
    setSelectedContent(item);
    
    // Initialize form with current content
    if (item.contentType === 'book') {
      setEditForm({
        title: item.title || '',
        author: item.author || '',
        categories: item.categories || '',
        description: item.description || '',
        publishedDate: item.publishedDate ? item.publishedDate.split('T')[0] : '',

        readingLinks: item.readingLinks && item.readingLinks.length > 0 ? 
          item.readingLinks : [{ name: '', url: '', icon: 'fas fa-external-link-alt' }],
        coverImage: null
      });
    } else {
      setEditForm({
        title: item.title || '',
        developer: item.developer || '',
        genre: item.genre || '',
        platform: item.platform || '',
        releaseDate: item.releaseDate ? item.releaseDate.split('T')[0] : '',
        description: item.description || '',

        platformLinks: item.platformLinks && item.platformLinks.length > 0 ? 
          item.platformLinks : [{ name: '', url: '', icon: 'fas fa-external-link-alt' }],
        coverImage: null
      });
    }
    
    setChangeSummary('');
    setShowEditModal(true);
  };
  
  const addLink = (type) => {
    if (type === 'book') {
      setEditForm({
        ...editForm,
        readingLinks: [...editForm.readingLinks, { name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
    } else {
      setEditForm({
        ...editForm,
        platformLinks: [...editForm.platformLinks, { name: '', url: '', icon: 'fas fa-external-link-alt' }]
      });
    }
  };
  
  const removeLink = (type, index) => {
    if (type === 'book') {
      const newLinks = editForm.readingLinks.filter((_, i) => i !== index);
      setEditForm({ ...editForm, readingLinks: newLinks });
    } else {
      const newLinks = editForm.platformLinks.filter((_, i) => i !== index);
      setEditForm({ ...editForm, platformLinks: newLinks });
    }
  };
  
  const updateLink = (type, index, field, value) => {
    if (type === 'book') {
      const newLinks = [...editForm.readingLinks];
      newLinks[index][field] = value;
      setEditForm({ ...editForm, readingLinks: newLinks });
    } else {
      const newLinks = [...editForm.platformLinks];
      newLinks[index][field] = value;
      setEditForm({ ...editForm, platformLinks: newLinks });
    }
  };
  
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Starting edit request submission...');
    console.log('   User:', user);
    console.log('   Selected content:', selectedContent);
    
    if (!changeSummary.trim()) {
      setError('Please provide a summary of your changes.');
      return;
    }
    
    // Validate user authentication
    if (!user || !user._id) {
      setError('User authentication required. Please refresh the page and try again.');
      return;
    }
    
    // Validate selected content
    if (!selectedContent || !selectedContent._id) {
      setError('Invalid content selected. Please try again.');
      return;
    }
    
    console.log('✅ Validation passed, proceeding with submission...');
    
    setIsSubmitting(true);
    try {
      // Prepare the proposed changes
      const proposedChanges = { ...editForm };
      
      // Remove currentImageUrl from proposed changes
      delete proposedChanges.currentImageUrl;
      
      // Filter out empty links
      if (selectedContent.contentType === 'book') {
        proposedChanges.readingLinks = editForm.readingLinks.filter(link => link.name && link.url);
      } else {
        proposedChanges.platformLinks = editForm.platformLinks.filter(link => link.name && link.url);
      }
      
      const editRequestData = {
        contentType: selectedContent.contentType,
        contentId: selectedContent._id,
        proposedChanges,
        changeSummary: changeSummary.trim()
      };
      
      console.log('📤 Submitting edit request data:', editRequestData);
      console.log('   Content Type:', editRequestData.contentType);
      console.log('   Content ID:', editRequestData.contentId);
      console.log('   Change Summary:', editRequestData.changeSummary);
      console.log('   Proposed Changes Keys:', Object.keys(editRequestData.proposedChanges));
      
      const response = await editRequestsAPI.submit(editRequestData);
      console.log('✅ Edit request submitted successfully:', response);
      
      setSuccess('Edit request submitted successfully! It will be reviewed by an admin.');
      setShowEditModal(false);
      setSelectedContent(null);
      setEditForm({});
      setChangeSummary('');
      
      // Refresh edit requests
      fetchData();
      
    } catch (error) {
      console.error('❌ Error submitting edit request:', error);
      console.error('   Error status:', error.response?.status);
      console.error('   Error data:', error.response?.data);
      console.error('   Error message:', error.message);
      console.error('   Full error object:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to submit edit request: ';
      
      if (error.response?.status === 400) {
        errorMessage += error.response.data?.error || 'Invalid request data';
      } else if (error.response?.status === 401) {
        errorMessage += 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage += 'You can only edit your own content.';
      } else if (error.response?.status === 404) {
        errorMessage += 'Content not found. It may have been deleted.';
      } else if (error.response?.status === 500) {
        errorMessage += 'Server error. Please try again later.';
      } else {
        errorMessage += error.response?.data?.error || error.message || 'Unknown error occurred';
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getPendingEditRequest = (contentId) => {
    return editRequests.find(req => 
      req.contentId._id === contentId && req.status === 'pending'
    );
  };
  
  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning',
      approved: 'bg-success',
      rejected: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };
  
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please log in to view your content.
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-edit me-2"></i>
            My Published Content
          </h1>
          <p className="section-subtitle">
            Manage and edit your published books and games
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
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Published Content */}
          <div className="card border-0 shadow mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Published Content ({content.length})
              </h5>
            </div>
            <div className="card-body">
              {content.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                  <h5>No published content</h5>
                  <p className="text-muted">You haven't published any content yet.</p>
                </div>
              ) : (
                <div className="row">
                  {content.map(item => {
                    const pendingEdit = getPendingEditRequest(item._id);
                    return (
                      <div key={item._id} className="col-md-6 col-lg-4 mb-4">
                        <div className="card h-100">
                          <div className="position-relative">
                            <img 
                              src={getImageUrl(item.contentType === 'book' ? item.Coverpage : item.coverImage, item.contentType)}
                              alt={item.title}
                              className="card-img-top"
                              style={{ height: '200px', objectFit: 'cover' }}
                              onError={(e) => handleImageError(e, 'noImage')}
                            />
                            <span className={`badge position-absolute top-0 end-0 m-2 ${item.contentType === 'book' ? 'bg-info' : 'bg-success'}`}>
                              {item.contentType === 'book' ? 'Book' : 'Game'}
                            </span>
                          </div>
                          <div className="card-body d-flex flex-column">
                            <h6 className="card-title">{item.title}</h6>
                            <p className="text-muted small mb-2">
                              By: {item.contentType === 'book' ? item.author : item.developer}
                            </p>
                            <p className="card-text small text-muted flex-grow-1">
                              {item.description.length > 100 ? 
                                item.description.substring(0, 100) + '...' : 
                                item.description
                              }
                            </p>
                            <div className="mt-auto">
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">

                                </small>
                                <small className="text-muted">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                              
                              {pendingEdit && (
                                <div className="mt-2">
                                  <span className={`badge ${getStatusBadge(pendingEdit.status)}`}>
                                    Edit {pendingEdit.status}
                                  </span>
                                </div>
                              )}
                              
                              <div className="mt-2">
                                <button
                                  className="btn btn-primary btn-sm w-100"
                                  onClick={() => handleEdit(item)}
                                  disabled={!!pendingEdit}
                                >
                                  <i className="fas fa-edit me-2"></i>
                                  {pendingEdit ? 'Edit Pending' : 'Request Edit'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Requests History */}
          {editRequests.length > 0 && (
            <div className="card border-0 shadow">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-history me-2"></i>
                  Edit Requests History ({editRequests.length})
                </h5>
              </div>
              <div className="card-body">
                {editRequests.map(request => (
                  <div key={request._id} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="mb-1">
                            <i className={`fas ${request.contentType === 'book' ? 'fa-book' : 'fa-gamepad'} me-2`}></i>
                            {request.contentId?.title}
                          </h6>
                          <p className="text-muted mb-2">{request.changeSummary}</p>
                          <small className="text-muted">
                            Submitted: {new Date(request.createdAt).toLocaleString()}
                          </small>
                          {request.reviewedAt && (
                            <small className="text-muted d-block">
                              Reviewed: {new Date(request.reviewedAt).toLocaleString()}
                            </small>
                          )}
                          {request.reviewNotes && (
                            <div className="mt-2">
                              <small className="text-muted">
                                <strong>Review Notes:</strong> {request.reviewNotes}
                              </small>
                            </div>
                          )}
                        </div>
                        <span className={`badge ${getStatusBadge(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Edit Modal */}
      {showEditModal && selectedContent && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-edit me-2"></i>
                  Request Edit: {selectedContent.title}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContent(null);
                    setEditForm({});
                    setChangeSummary('');
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Your edit request will be reviewed by an admin before the changes are applied to your published content.
                </div>
                
                <form onSubmit={handleSubmitEdit}>
                  {selectedContent.contentType === 'book' ? (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Author</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.author || ''}
                            onChange={(e) => setEditForm({...editForm, author: e.target.value})}
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
                            value={editForm.categories || ''}
                            onChange={(e) => setEditForm({...editForm, categories: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">

                        </div>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Published Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={editForm.publishedDate || ''}
                            onChange={(e) => setEditForm({...editForm, publishedDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <FileUploadWithToggle
                            onFileSelect={(result) => {
                              console.log('MyContent Book FileUpload result:', result);
                              // Handle both upload methods
                              if (result && result.uploadMethod === 'cloudinary') {
                                console.log('Setting Cloudinary data:', result.cloudinaryUrl);
                                setEditForm({...editForm, coverImage: result.cloudinaryUrl, cloudinaryData: result});
                              } else if (result && result.uploadMethod === 'local') {
                                console.log('Setting local file:', result.file);
                                setEditForm({...editForm, coverImage: result.file});
                              } else {
                                setEditForm({...editForm, coverImage: result});
                              }
                            }}
                            currentImage={selectedContent?.Coverpage}
                            label="Book Cover Image (optional)"
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
                        {editForm.readingLinks?.map((link, index) => (
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
                                    disabled={editForm.readingLinks.length === 1}
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
                    </>
                  ) : (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Title</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.title || ''}
                            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Developer</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.developer || ''}
                            onChange={(e) => setEditForm({...editForm, developer: e.target.value})}
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
                            value={editForm.genre || ''}
                            onChange={(e) => setEditForm({...editForm, genre: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Platform</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm.platform || ''}
                            onChange={(e) => setEditForm({...editForm, platform: e.target.value})}
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
                            value={editForm.releaseDate || ''}
                            onChange={(e) => setEditForm({...editForm, releaseDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">

                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <FileUploadWithToggle
                          onFileSelect={(result) => {
                            console.log('MyContent Game FileUpload result:', result);
                            // Handle both upload methods
                            if (result && result.uploadMethod === 'cloudinary') {
                              console.log('Setting Cloudinary data:', result.cloudinaryUrl);
                              setEditForm({...editForm, coverImage: result.cloudinaryUrl, cloudinaryData: result});
                            } else if (result && result.uploadMethod === 'local') {
                              console.log('Setting local file:', result.file);
                              setEditForm({...editForm, coverImage: result.file});
                            } else {
                              setEditForm({...editForm, coverImage: result});
                            }
                          }}
                          currentImage={selectedContent?.coverImage}
                          label="Game Cover Image (optional)"
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
                        {editForm.platformLinks?.map((link, index) => (
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
                                    disabled={editForm.platformLinks.length === 1}
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
                    </>
                  )}
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <strong>Summary of Changes *</strong>
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Please describe what changes you made and why..."
                      value={changeSummary}
                      onChange={(e) => setChangeSummary(e.target.value)}
                      required
                    />
                    <div className="form-text">
                      This summary will help the admin understand your changes.
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedContent(null);
                    setEditForm({});
                    setChangeSummary('');
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleSubmitEdit}
                  disabled={isSubmitting || !changeSummary.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit Edit Request
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

export default MyContent;