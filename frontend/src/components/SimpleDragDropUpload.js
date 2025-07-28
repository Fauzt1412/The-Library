import React, { useState, useRef } from 'react';

const SimpleDragDropUpload = ({ 
  onFileSelect, 
  accept = "image/*", 
  maxSize = 5 * 1024 * 1024,
  currentImage = null,
  label = "Upload Image"
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file';
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return `File size must be less than ${maxSizeMB}MB`;
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
    
    // Call parent callback
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

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      
      {/* Drag and Drop Area */}
      <div
        className={`border-2 border-dashed rounded p-4 text-center position-relative ${
          dragActive ? 'border-primary bg-light' : 'border-secondary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{ cursor: 'pointer', minHeight: '120px' }}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="d-none"
          accept={accept}
          onChange={handleChange}
        />
        
        {preview ? (
          <div>
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
              className="rounded mb-2"
            />
            <p className="mb-0 text-success">
              <i className="fas fa-check-circle me-2"></i>
              File selected successfully
            </p>
            <small className="text-muted">Click to change file</small>
          </div>
        ) : currentImage ? (
          <div>
            <img 
              src={`http://localhost:1412${currentImage}`}
              alt="Current image" 
              style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
              className="rounded mb-2"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none' }} className="text-muted">
              <i className="fas fa-image fa-2x mb-2"></i>
              <p>Current image not available</p>
            </div>
            <p className="mb-0 text-info">
              <i className="fas fa-image me-2"></i>
              Current image
            </p>
            <small className="text-muted">Drag & drop or click to change</small>
          </div>
        ) : (
          <div>
            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
            <p className="mb-2">
              <strong>Drag & drop an image here, or click to select</strong>
            </p>
            <small className="text-muted">
              Supported formats: JPG, PNG, GIF, WebP<br/>
              Maximum size: {Math.round(maxSize / (1024 * 1024))}MB
            </small>
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-danger mt-2">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
    </div>
  );
};

export default SimpleDragDropUpload;