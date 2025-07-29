import React, { useState, useRef, useEffect } from 'react';
import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinaryUtils';

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentImage = null,
  label = "Upload Image",
  enableCloudinary = true,
  cloudinaryFolder = "library"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage ? `http://localhost:1412${currentImage}` : null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage ? `http://localhost:1412${currentImage}` : null);
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
      if (enableCloudinary && isCloudinaryConfigured()) {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          file, 
          cloudinaryFolder, 
          (progress) => setUploadProgress(progress)
        );
        
        if (result.success) {
          // Return Cloudinary result
          onFileSelect({
            file: file,
            cloudinaryUrl: result.url,
            publicId: result.publicId,
            type: 'cloudinary',
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes
          });
        } else {
          throw new Error(result.error);
        }
      } else {
        // Fallback to traditional file upload
        onFileSelect(file);
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
        {enableCloudinary && isCloudinaryConfigured() && (
          <span className="badge bg-success ms-2">
            <i className="fas fa-cloud me-1"></i>
            Cloudinary
          </span>
        )}
        {enableCloudinary && !isCloudinaryConfigured() && (
          <span className="badge bg-warning ms-2">
            <i className="fas fa-exclamation-triangle me-1"></i>
            Local Upload
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
                <h5>Uploading to {enableCloudinary && isCloudinaryConfigured() ? 'Cloudinary' : 'Server'}...</h5>
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
            {enableCloudinary && isCloudinaryConfigured() && (
              <span className="ms-2">
                <i className="fas fa-cloud me-1"></i>
                Uploaded to Cloudinary
              </span>
            )}
          </small>
        </div>
      )}

      {/* Configuration Warning */}
      {enableCloudinary && !isCloudinaryConfigured() && (
        <div className="alert alert-warning mt-2 mb-0">
          <i className="fas fa-info-circle me-2"></i>
          <small>
            Cloudinary not configured. Using local upload. 
            <a href="#" className="alert-link ms-1" onClick={(e) => {
              e.preventDefault();
              alert('Please check your .env.local file and add your Cloudinary credentials!');
            }}>Setup guide</a>
          </small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;