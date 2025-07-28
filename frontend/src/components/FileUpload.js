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
    console.log('📷 FileUpload - File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      console.log('❌ FileUpload - Validation error:', validationError);
      return;
    }

    setError('');
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      console.log('✅ FileUpload - Preview created successfully');
    };
    reader.readAsDataURL(file);

    // Call parent callback
    console.log('📤 FileUpload - Calling onFileSelect with file:', file);
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
        className={`border-2 border-dashed rounded p-4 text-center position-relative ${
          dragActive ? 'border-primary bg-light' : 'border-secondary'
        } ${error ? 'border-danger' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{ cursor: 'pointer', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {preview ? (
          <div className="w-100">
            <img 
              src={preview} 
              alt="Preview" 
              style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover' }}
              className="rounded mb-2"
            />
            <div>
              <button
                type="button"
                className="btn btn-sm btn-danger me-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <i className="fas fa-trash me-1"></i>
                Remove
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                <i className="fas fa-edit me-1"></i>
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="w-100">
            <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
            <h5 className="mb-2">Drag & Drop your image here</h5>
            <p className="text-muted mb-2">or click to browse files</p>
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