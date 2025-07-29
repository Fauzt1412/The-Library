import React, { useState, useRef, useEffect } from 'react';

const FileUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentImage = null,
  label = "Upload Image"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(currentImage ? `http://localhost:1412${currentImage}` : null);
  const [error, setError] = useState('');
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

  const handleFile = (file) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Call parent callback with just the file
    onFileSelect(file);
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
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null);
  };

  return (
    <div className="file-upload-container">
      <label className="form-label">{label}</label>
      
      {/* Upload Area */}
      <div
        className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${error ? 'error' : ''}`}
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
              >
                <i className="fas fa-edit"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <i className="fas fa-cloud-upload-alt fa-3x mb-3"></i>
            <h5>Drag & Drop your image here</h5>
            <p className="text-muted">or click to browse files</p>
            <small className="text-muted">
              Supports: PNG, JPG, JPEG, GIF, WebP (Max {Math.round(maxSize / (1024 * 1024))}MB)
            </small>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger mt-2 mb-0">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* File Info */}
      {preview && !error && (
        <div className="file-info mt-2">
          <small className="text-success">
            <i className="fas fa-check-circle me-1"></i>
            Image ready for upload
          </small>
        </div>
      )}
    </div>
  );
};

export default FileUpload;