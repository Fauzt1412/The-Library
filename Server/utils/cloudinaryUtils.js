// Cloudinary utilities for backend image management
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
  console.log('✅ Cloudinary module loaded successfully');
} catch (error) {
  console.log('⚠️ Cloudinary module not found. Image deletion will be skipped.');
  console.log('💡 Run: cd Server && npm install cloudinary');
  cloudinary = null;
}

// Configure Cloudinary (you'll need to add these to your .env file)
if (cloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Extract public ID from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
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

// Delete image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!cloudinary) {
      console.log('⚠️ Cloudinary not available. Skipping image deletion.');
      return { success: false, error: 'Cloudinary module not installed' };
    }
    
    if (!publicId) {
      console.log('⚠️ No public ID provided for Cloudinary deletion');
      return { success: false, error: 'No public ID provided' };
    }
    
    console.log('🗑️ Attempting to delete from Cloudinary:', publicId);
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      console.log('✅ Successfully deleted from Cloudinary:', publicId);
      return { success: true, result };
    } else {
      console.log('⚠️ Cloudinary deletion result:', result);
      return { success: false, result };
    }
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary:', error);
    return { success: false, error: error.message };
  }
};

// Delete image from Cloudinary using URL
const deleteFromCloudinaryByUrl = async (cloudinaryUrl) => {
  try {
    const publicId = extractPublicId(cloudinaryUrl);
    if (!publicId) {
      console.log('⚠️ Could not extract public ID from URL:', cloudinaryUrl);
      return { success: false, error: 'Could not extract public ID from URL' };
    }
    
    return await deleteFromCloudinary(publicId);
  } catch (error) {
    console.error('❌ Error deleting from Cloudinary by URL:', error);
    return { success: false, error: error.message };
  }
};

// Check if URL is a Cloudinary URL
const isCloudinaryUrl = (url) => {
  return url && typeof url === 'string' && url.includes('cloudinary.com');
};

// Delete image (handles both Cloudinary and local files)
const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) {
      return { success: true, message: 'No image to delete' };
    }
    
    if (isCloudinaryUrl(imagePath)) {
      // Delete from Cloudinary
      console.log('🌤️ Deleting Cloudinary image:', imagePath);
      return await deleteFromCloudinaryByUrl(imagePath);
    } else {
      // Delete local file
      console.log('📁 Local file deletion not implemented yet:', imagePath);
      // TODO: Implement local file deletion if needed
      return { success: true, message: 'Local file deletion skipped' };
    }
  } catch (error) {
    console.error('❌ Error in deleteImage:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  extractPublicId,
  deleteFromCloudinary,
  deleteFromCloudinaryByUrl,
  isCloudinaryUrl,
  deleteImage,
  cloudinary
};