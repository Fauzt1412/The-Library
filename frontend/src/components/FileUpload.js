import React, { useState, useRef, useEffect } from 'react';

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentImage = null,
  label = "Upload Image",
  enableBlobUpload = false // New prop to enable Vercel Blob
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage ? `http://localhost:1412${currentImage}` : null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Update preview when currentImage changes
  useEffect(() => {
    if (currentImage) {
      // Handle different image URL formats
      if (currentImage.startsWith('http')) {
        setPreview(currentImage);
      } else {
        setPreview(`http://localhost:1412${currentImage}`);
      }
    } else {
      setPreview(null);
    }
  }, [currentImage]);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (PNG, JPG, JPEG, GIF, WebP)';
    }

    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    return null;
  };

  const uploadToBlob = async (file) => {
    try {
      // Check if Vercel Blob is available
      if (!window.vercelBlob) {
        throw new Error('Vercel Blob not available. Using traditional upload.');
      }

      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;

      // Simulate upload progress
      setUploadProgress(20);

      const response = await fetch('/api/upload-blob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          contentType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadUrl, blobUrl } = await response.json();
      setUploadProgress(50);

      // Upload file to blob storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload to blob storage');
      }

      setUploadProgress(100);

      return {
        success: true,
        blobUrl: blobUrl,
        filename: filename,
        type: 'blob'
      };
    } catch (error) {
      console.warn('Blob upload failed, falling back to traditional upload:', error);
      return {
        success: false,
        error: error.message,
        fallback: true
      };
    }
  };

  const handleFile = async (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);
    
    // Create preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    try {
      if (enableBlobUpload) {
        // Try Vercel Blob upload first
        const blobResult = await uploadToBlob(file);
        
        if (blobResult.success) {
          // Successful blob upload
          onFileSelect({
            file: file,
            blobUrl: blobResult.blobUrl,
            filename: blobResult.filename,
            type: 'blob',
            preview: preview
          });
        } else if (blobResult.fallback) {
          // Fallback to traditional upload
          onFileSelect({
            file: file,
            type: 'traditional',
            preview: preview
          });
        } else {
          throw new Error(blobResult.error);
        }
      } else {
        // Traditional file upload
        onFileSelect({
          file: file,
          type: 'traditional',
          preview: preview
        });
      }
    } catch (error) {
      setError('Upload failed: ' + error.message);
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  return (
    <div className="file-upload-container">
      <label className="form-label">
        {label}
        {enableBlobUpload && (
          <span className="badge bg-primary ms-2">
            <i className="fas fa-cloud me-1"></i>
            Blob Storage
          </span>
        )}
      </label>
      
      {/* Upload Area */}
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
        
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="preview-image" />
            <div className="preview-overlay">
              <button
                type="button"
                className="btn btn-sm btn-danger remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={uploading}
              >
                <i className="fas fa-trash"></i>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary change-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
                disabled={uploading}
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
            {uploading && (
              <div className="upload-overlay">
                <div className="spinner-border text-light" role="status">
                  <span className="visually-hidden">Uploading...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="upload-placeholder">
            {uploading ? (
              <>
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Uploading...</span>
                </div>
                <h5>Uploading...</h5>
                <p className="text-muted">Please wait while we process your image</p>
              </>
            ) : (
              <>
                <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
                <h5>Drag & Drop your image here</h5>
                <p className="text-muted">or click to browse files</p>
                <small className="text-muted">
                  Supports: PNG, JPG, JPEG, GIF, WebP (Max {Math.round(maxSize / (1024 * 1024))}MB)
                </small>
              </>
            )}
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {uploading && uploadProgress > 0 && (
        <div className="progress mt-2">
          <div 
            className="progress-bar progress-bar-striped progress-bar-animated" 
            role="progressbar" 
            style={{ width: `${uploadProgress}%` }}
            aria-valuenow={uploadProgress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          >
            {uploadProgress}%
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mt-2 mb-0">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Success Message */}
      {preview && !error && !uploading && (
        <div className="file-info mt-2">
          <small className="text-success">
            <i className="fas fa-check-circle me-1"></i>
            Image ready for upload
            {enableBlobUpload && (
              <span className="ms-2">
                <i className="fas fa-cloud me-1"></i>
                Using blob storage
              </span>
            )}
          </small>
        </div>
      )}

      {/* Additional Styles */}
      <style jsx>{`
        .file-upload-area {
          border: 2px dashed #dee2e6;
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: var(--bs-body-bg);
          position: relative;
          min-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .file-upload-area:hover {
          border-color: #0d6efd;
          background: var(--bs-primary-bg-subtle);
        }

        .file-upload-area.drag-active {
          border-color: #0d6efd;
          background: var(--bs-primary-bg-subtle);
          transform: scale(1.02);
        }

        .file-upload-area.error {
          border-color: #dc3545;
          background: var(--bs-danger-bg-subtle);
        }

        .file-upload-area.uploading {
          cursor: not-allowed;
          opacity: 0.8;
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: 8px;
          overflow: hidden;
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 8px;
        }

        .preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .preview-container:hover .preview-overlay {
          opacity: 1;
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        .upload-placeholder {
          color: var(--bs-secondary);
        }

        .file-upload-area.uploading .upload-placeholder {
          color: var(--bs-primary);
        }
      `}</style>
    </div>
  );
};

export default FileUpload;