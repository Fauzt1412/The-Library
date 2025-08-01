import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { submissionsAPI } from '../services/api';
import FileUploadWithToggle from '../components/FileUploadWithToggle';

const SubmitContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('book');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    categories: '',
    description: '',
    publishedDate: '',
    coverImage: null, // Will store either File object or Cloudinary data object
    readingLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
  });
  
  const [gameForm, setGameForm] = useState({
    title: '',
    genre: '',
    developer: '',
    platform: '',
    releaseDate: '',
    description: '',
    coverImage: null, // Will store either File object or Cloudinary data object
    platformLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
  });
  
  if (!isAuthenticated) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Please log in to submit content.
        </div>
      </div>
    );
  }
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const currentForm = activeTab === 'book' ? bookForm : gameForm;
      
      // Debug: Log the current form state
      console.log('Current form data:', currentForm);
      console.log('Cover image value:', currentForm.coverImage);
      console.log('Cover image type:', typeof currentForm.coverImage);
      
      // Validate coverImage - handle both Cloudinary URLs and File objects
      if (!currentForm.coverImage) {
        console.log('Validation failed: coverImage is falsy');
        setError('Cover image is required');
        setLoading(false);
        return;
      }
      
      // Check if it's a Cloudinary URL (string)
      if (typeof currentForm.coverImage === 'string' && currentForm.coverImage.length === 0) {
        console.log('Validation failed: Cloudinary URL is empty');
        setError('Cover image upload failed. Please try again.');
        setLoading(false);
        return;
      }
      
      // Check if it's a File object
      if (currentForm.coverImage instanceof File && currentForm.coverImage.size === 0) {
        console.log('Validation failed: File object is empty');
        setError('Cover image file is empty. Please select a valid image.');
        setLoading(false);
        return;
      }
      
      console.log('Validation passed! Proceeding with submission...');
      
      // Prepare submission data with proper coverImage handling
      const submissionData = {
        type: activeTab,
        ...currentForm
      };
      
      // Handle coverImage based on type (Cloudinary or File)
      if (currentForm.coverImage && currentForm.coverImage.type === 'cloudinary') {
        // For Cloudinary uploads, send the URL and metadata
        submissionData.coverImage = currentForm.coverImage.cloudinaryUrl;
        submissionData.cloudinaryData = {
          publicId: currentForm.coverImage.publicId,
          width: currentForm.coverImage.width,
          height: currentForm.coverImage.height,
          format: currentForm.coverImage.format,
          bytes: currentForm.coverImage.bytes
        };
        console.log('Sending Cloudinary data:', submissionData.cloudinaryData);
      } else if (currentForm.coverImage instanceof File) {
        // For traditional uploads, keep the File object
        submissionData.coverImage = currentForm.coverImage;
        console.log('Sending File object:', currentForm.coverImage.name);
      }
      
      // Filter out empty links
      if (activeTab === 'book') {
        submissionData.readingLinks = bookForm.readingLinks.filter(link => link.name && link.url);
      } else {
        submissionData.platformLinks = gameForm.platformLinks.filter(link => link.name && link.url);
      }
      
      const response = await submissionsAPI.submit(submissionData);
      
      setSuccess((activeTab === 'book' ? 'Book' : 'Game') + ' submitted successfully! It will be reviewed by an admin before being published. You will receive a notification once the review is complete.');
      
      // Reset form
      if (activeTab === 'book') {
        setBookForm({
          title: '',
          author: '',
          categories: '',
          description: '',
          publishedDate: '',
          coverImage: null, // Reset to null for both Cloudinary and File objects
          readingLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
        });
      } else {
        setGameForm({
          title: '',
          genre: '',
          developer: '',
          platform: '',
          releaseDate: '',
          description: '',
          coverImage: null, // Reset to null for both Cloudinary and File objects
          platformLinks: [{ name: '', url: '', icon: 'fas fa-external-link-alt' }]
        });
      }
    } catch (error) {
      console.error('Error submitting content:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit content. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const renderLinkInputs = (links, type) => {
    return (
      <div className="mb-3">
        <label className="form-label">
          <i className="fas fa-link me-2"></i>
          {type === 'book' ? 'Reading Links' : 'Platform Links'}
        </label>
        {links.map((link, index) => (
          <div key={index} className="card mb-2">
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Platform/Store Name"
                    value={link.name}
                    onChange={(e) => updateLink(type, index, 'name', e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateLink(type, index, 'url', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => removeLink(type, index)}
                    disabled={links.length === 1}
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
          onClick={() => addLink(type)}
        >
          <i className="fas fa-plus me-2"></i>
          Add {type === 'book' ? 'Reading' : 'Platform'} Link
        </button>
      </div>
    );
  };
  
  return (
    <div className="container py-5 fade-in">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="section-title">
            <i className="fas fa-upload me-2"></i>
            Submit Content
          </h1>
          <p className="section-subtitle">
            Share your books and games with the community
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
      
      <div className="card border-0 shadow">
        <div className="card-header">
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button
                className={'nav-link ' + (activeTab === 'book' ? 'active' : '')}
                onClick={() => setActiveTab('book')}
              >
                <i className="fas fa-book me-2"></i>
                Submit Book
              </button>
            </li>
            <li className="nav-item">
              <button
                className={'nav-link ' + (activeTab === 'game' ? 'active' : '')}
                onClick={() => setActiveTab('game')}
              >
                <i className="fas fa-gamepad me-2"></i>
                Submit Game
              </button>
            </li>
          </ul>
        </div>
        
        <div className="card-body">
          <div className="alert alert-info">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Review Process:</strong> All submissions require admin approval before being published. 
            You will receive a notification in your <a href="/notifications" className="alert-link">notifications page</a> once your content is reviewed.
          </div>
          
          <form onSubmit={handleSubmit}>
            {activeTab === 'book' ? (
              <>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Author *</label>
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
                    <label className="form-label">Category *</label>
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
                    <label className="form-label">Published Date *</label>
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
                        console.log('Book FileUpload result:', result);
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
                      label="Book Cover Image *"
                      accept="image/*"
                      maxSize={5 * 1024 * 1024}
                      cloudinaryFolder="books"
                      defaultMethod="cloudinary"
                    />
                  </div>
                </div>
                
                {renderLinkInputs(bookForm.readingLinks, 'book')}
              </>
            ) : (
              <>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={gameForm.title}
                      onChange={(e) => setGameForm({...gameForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Developer *</label>
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
                    <label className="form-label">Genre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={gameForm.genre}
                      onChange={(e) => setGameForm({...gameForm, genre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Platform *</label>
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
                    <label className="form-label">Release Date *</label>
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
                      console.log('Game FileUpload result:', result);
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
                    label="Game Cover Image *"
                    accept="image/*"
                    maxSize={5 * 1024 * 1024}
                    cloudinaryFolder="games"
                    defaultMethod="cloudinary"
                  />
                </div>
                
                {renderLinkInputs(gameForm.platformLinks, 'game')}
              </>
            )}
            
            <div className="mb-3">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows="4"
                value={activeTab === 'book' ? bookForm.description : gameForm.description}
                onChange={(e) => {
                  if (activeTab === 'book') {
                    setBookForm({...bookForm, description: e.target.value});
                  } else {
                    setGameForm({...gameForm, description: e.target.value});
                  }
                }}
                required
              ></textarea>
            </div>
            
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit for Review
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitContent;