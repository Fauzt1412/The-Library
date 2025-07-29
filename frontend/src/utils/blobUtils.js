// Vercel Blob utilities for image handling

// Check if Vercel Blob is available
export const isBlobAvailable = () => {
  return !!(process.env.BLOB_READ_WRITE_TOKEN && process.env.NEXT_PUBLIC_BLOB_STORE_ID);
};

// Upload image to Vercel Blob (client-side)
export const uploadImageToBlob = async (file, filename) => {
  try {
    if (!isBlobAvailable()) {
      throw new Error('Vercel Blob not configured');
    }

    // For client-side uploads, we need to use the Vercel Blob API
    // This requires @vercel/blob package
    const { put } = await import('@vercel/blob');
    
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return {
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname,
      size: blob.size
    };
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Vercel Blob
export const deleteImageFromBlob = async (url) => {
  try {
    if (!isBlobAvailable()) {
      throw new Error('Vercel Blob not configured');
    }

    const { del } = await import('@vercel/blob');
    
    await del(url, {
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting from Vercel Blob:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// List all images in blob store
export const listBlobImages = async () => {
  try {
    if (!isBlobAvailable()) {
      throw new Error('Vercel Blob not configured');
    }

    const { list } = await import('@vercel/blob');
    
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return {
      success: true,
      images: blobs
    };
  } catch (error) {
    console.error('Error listing blob images:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (blobUrl, options = {}) => {
  if (!blobUrl) return null;
  
  const {
    width = 400,
    height = 600,
    quality = 80,
    format = 'auto'
  } = options;
  
  try {
    // Check if it's a Vercel blob URL
    if (blobUrl.includes('vercel-storage.com') || blobUrl.includes('blob.vercel-storage.com')) {
      const url = new URL(blobUrl);
      url.searchParams.set('w', width.toString());
      url.searchParams.set('h', height.toString());
      url.searchParams.set('q', quality.toString());
      if (format !== 'auto') {
        url.searchParams.set('fm', format);
      }
      return url.toString();
    }
    
    // Return original URL if not a blob URL
    return blobUrl;
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    return blobUrl;
  }
};

// Get image source with fallback
export const getImageSrc = (imagePath, options = {}) => {
  if (!imagePath) {
    return options.placeholder || 'https://via.placeholder.com/300x400/667eea/white?text=No+Image';
  }
  
  // If it's a blob URL, optimize it
  if (imagePath.includes('vercel-storage.com') || imagePath.includes('blob.vercel-storage.com')) {
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

// Validate blob configuration
export const validateBlobConfig = () => {
  const issues = [];
  
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    issues.push('BLOB_READ_WRITE_TOKEN is not set');
  }
  
  if (!process.env.NEXT_PUBLIC_BLOB_STORE_ID) {
    issues.push('NEXT_PUBLIC_BLOB_STORE_ID is not set');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
};

// Helper to generate unique filename
export const generateBlobFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `${prefix}${timestamp}-${random}-${baseName}.${extension}`;
};

// Blob upload with progress tracking
export const uploadWithProgress = async (file, onProgress = () => {}) => {
  try {
    const filename = generateBlobFilename(file.name, 'upload-');
    
    onProgress(10);
    
    const result = await uploadImageToBlob(file, filename);
    
    if (result.success) {
      onProgress(100);
      return result;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    onProgress(0);
    throw error;
  }
};

export default {
  isBlobAvailable,
  uploadImageToBlob,
  deleteImageFromBlob,
  listBlobImages,
  getOptimizedImageUrl,
  getImageSrc,
  validateBlobConfig,
  generateBlobFilename,
  uploadWithProgress
};