import React from 'react';
import { isCloudinaryConfigured } from '../utils/cloudinaryUtils';

const UploadMethodToggle = ({ 
  uploadMethod, 
  onMethodChange, 
  disabled = false,
  showLabels = true 
}) => {
  const cloudinaryAvailable = isCloudinaryConfigured();
  
  return (
    <div className="upload-method-toggle mb-3">
      {showLabels && (
        <label className="form-label d-block mb-2">
          <i className="fas fa-upload me-2"></i>
          Upload Method
        </label>
      )}
      
      <div className="btn-group w-100" role="group" aria-label="Upload method selection">
        <input
          type="radio"
          className="btn-check"
          name="uploadMethod"
          id="localUpload"
          value="local"
          checked={uploadMethod === 'local'}
          onChange={(e) => onMethodChange(e.target.value)}
          disabled={disabled}
        />
        <label 
          className={`btn btn-outline-primary ${uploadMethod === 'local' ? 'active' : ''}`} 
          htmlFor="localUpload"
        >
          <i className="fas fa-server me-2"></i>
          Local Upload
          <small className="d-block text-muted">Upload to server</small>
        </label>

        <input
          type="radio"
          className="btn-check"
          name="uploadMethod"
          id="cloudinaryUpload"
          value="cloudinary"
          checked={uploadMethod === 'cloudinary'}
          onChange={(e) => onMethodChange(e.target.value)}
          disabled={disabled || !cloudinaryAvailable}
        />
        <label 
          className={`btn btn-outline-success ${uploadMethod === 'cloudinary' ? 'active' : ''} ${!cloudinaryAvailable ? 'disabled' : ''}`} 
          htmlFor="cloudinaryUpload"
        >
          <i className="fas fa-cloud me-2"></i>
          Cloudinary
          <small className="d-block text-muted">
            {cloudinaryAvailable ? 'Cloud storage' : 'Not configured'}
          </small>
        </label>
      </div>
      
      {/* Status indicators */}
      <div className="mt-2">
        {uploadMethod === 'local' && (
          <div className="alert alert-info py-2 mb-0">
            <i className="fas fa-info-circle me-2"></i>
            <small>Images will be stored on your server</small>
          </div>
        )}
        
        {uploadMethod === 'cloudinary' && cloudinaryAvailable && (
          <div className="alert alert-success py-2 mb-0">
            <i className="fas fa-check-circle me-2"></i>
            <small>Images will be optimized and stored on Cloudinary CDN</small>
          </div>
        )}
        
        {uploadMethod === 'cloudinary' && !cloudinaryAvailable && (
          <div className="alert alert-warning py-2 mb-0">
            <i className="fas fa-exclamation-triangle me-2"></i>
            <small>Cloudinary not configured. Please check your environment variables.</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadMethodToggle;