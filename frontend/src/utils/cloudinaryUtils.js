// Cloudinary utilities for image management

// Check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.REACT_APP_CLOUDINARY_CLOUD_NAME &&
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  );
};

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = 'library', onProgress = null) => {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error('Cloudinary not configured. Please check environment variables.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);
    
    // Add timestamp for unique filenames
    formData.append('public_id', `${folder}/${Date.now()}-${file.name.split('.')[0]}`);

    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
            format: data.format,
            bytes: data.bytes,
            originalFilename: file.name
          });
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (publicIdOrUrl, options = {}) => {
  if (!publicIdOrUrl) return null;
  
  // If it's already a full URL, return as is
  if (publicIdOrUrl.startsWith('http')) {
    return publicIdOrUrl;
  }
  
  const {
    width = 400,
    height = 600,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;
  
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    return publicIdOrUrl; // Return as-is if Cloudinary not configured
  }
  
  const transformations = [
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicIdOrUrl}`;
};

// Get responsive image URLs for different screen sizes
export const getResponsiveImageUrls = (publicId) => {
  if (!publicId) return {};
  
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 200, crop: 'thumb' }),
    small: getOptimizedImageUrl(publicId, { width: 300, height: 400 }),
    medium: getOptimizedImageUrl(publicId, { width: 600, height: 800 }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1600 }),
    original: getOptimizedImageUrl(publicId, { width: 2000, height: 2000, crop: 'limit' })
  };
};

// Get image URL with fallback
export const getImageSrc = (imagePath, options = {}) => {
  if (!imagePath) {
    return options.placeholder || getLocalPlaceholder(options.type || 'general');
  }
  
  // If it's a Cloudinary public ID (no http), optimize it
  if (!imagePath.startsWith('http') && isCloudinaryConfigured()) {
    return getOptimizedImageUrl(imagePath, options);
  }
  
  // If it's a full URL, use it directly
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a local path, use localhost
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:1412${imagePath}`;
  }
  
  // Default fallback
  return imagePath;
};

// Extract public ID from Cloudinary URL
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) {
    return null;
  }
  
  try {
    const parts = cloudinaryUrl.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    if (uploadIndex === -1) return null;
    
    // Skip transformation parameters and get the public ID
    let publicIdParts = parts.slice(uploadIndex + 1);
    
    // Remove transformation parameters (they start with letters like 'c_', 'w_', etc.)
    publicIdParts = publicIdParts.filter(part => !part.match(/^[a-z]_/));
    
    return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove file extension
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Delete image from Cloudinary (requires backend implementation)
export const deleteFromCloudinary = async (publicId) => {
  try {
    // Note: Deletion requires server-side implementation with API secret
    // This is a placeholder for future backend implementation
    console.log('Delete request for:', publicId);
    
    // For now, just return success
    // In production, you'd call your backend API:
    // const response = await fetch('/api/cloudinary/delete', {
    //   method: 'DELETE',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ publicId })
    // });
    
    return { success: true, message: 'Delete functionality requires backend implementation' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validate Cloudinary configuration
export const validateCloudinaryConfig = () => {
  const issues = [];
  
  if (!process.env.REACT_APP_CLOUDINARY_CLOUD_NAME) {
    issues.push('REACT_APP_CLOUDINARY_CLOUD_NAME is not set');
  }
  
  if (!process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET) {
    issues.push('REACT_APP_CLOUDINARY_UPLOAD_PRESET is not set');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
};

// Import local placeholder utilities for fallback
import { getLocalPlaceholder } from './placeholderUtils';

export default {
  isCloudinaryConfigured,
  uploadToCloudinary,
  getOptimizedImageUrl,
  getResponsiveImageUrls,
  getImageSrc,
  extractPublicId,
  deleteFromCloudinary,
  validateCloudinaryConfig
};