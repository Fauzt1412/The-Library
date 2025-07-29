# 🚀 Vercel Blob Setup Guide

## ✅ Changes Reverted

All placeholder image changes have been reverted back to the original `via.placeholder.com` approach. Your favorites section should now work properly again.

## 🌟 Setting Up Vercel Blob for Image Storage

Vercel Blob is a perfect solution for storing and serving images in your application. Here's how to set it up:

### 1. **Install Vercel Blob Package**

```bash
cd frontend
npm install @vercel/blob
```

### 2. **Environment Variables Setup**

Add to your `frontend/.env.local`:
```env
# Vercel Blob Configuration
BLOB_READ_WRITE_TOKEN=your_blob_token_here
NEXT_PUBLIC_BLOB_STORE_ID=your_store_id_here
```

### 3. **Create Blob Utility Functions**

Create `frontend/src/utils/blobUtils.js`:

```javascript
import { put, del, list } from '@vercel/blob';

// Upload image to Vercel Blob
export const uploadImageToBlob = async (file, filename) => {
  try {
    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    
    return {
      success: true,
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      pathname: blob.pathname
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
export const getOptimizedImageUrl = (blobUrl, width = 400, height = 600, quality = 80) => {
  if (!blobUrl) return null;
  
  // Vercel automatically optimizes images
  const url = new URL(blobUrl);
  url.searchParams.set('w', width.toString());
  url.searchParams.set('h', height.toString());
  url.searchParams.set('q', quality.toString());
  
  return url.toString();
};
```

### 4. **Update FileUpload Component**

Update `frontend/src/components/FileUpload.js`:

```javascript
import React, { useState } from 'react';
import { uploadImageToBlob } from '../utils/blobUtils';

const FileUpload = ({ onFileSelect, currentImage, label, accept = "image/*", maxSize = 5 * 1024 * 1024 }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;

      // Upload to Vercel Blob
      const result = await uploadImageToBlob(file, filename);

      if (result.success) {
        // Pass the blob URL to parent component
        onFileSelect({
          file: file,
          blobUrl: result.url,
          downloadUrl: result.downloadUrl,
          pathname: result.pathname
        });
        setUploadProgress(100);
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 2000);
    }
  };

  return (
    <div className="file-upload-container">
      <label className="form-label">{label}</label>
      
      {currentImage && (
        <div className="current-image mb-3">
          <img 
            src={currentImage} 
            alt="Current" 
            className="img-thumbnail"
            style={{ maxWidth: '200px', maxHeight: '200px' }}
          />
          <p className="text-muted small mt-1">Current image</p>
        </div>
      )}

      <div className="input-group">
        <input
          type="file"
          className="form-control"
          accept={accept}
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading && (
          <div className="input-group-text">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Uploading...</span>
            </div>
          </div>
        )}
      </div>

      {uploading && (
        <div className="progress mt-2">
          <div 
            className="progress-bar" 
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

      <div className="form-text">
        Max file size: {maxSize / (1024 * 1024)}MB. Supported formats: JPG, PNG, GIF, WebP
      </div>
    </div>
  );
};

export default FileUpload;
```

### 5. **Update API Service for Blob URLs**

Update `frontend/src/services/api.js` to handle blob URLs:

```javascript
// Add this helper function
const prepareBlobData = (formData, data, userId) => {
  formData.append('userId', userId);
  
  // Handle blob URLs
  if (data.blobUrl) {
    formData.append('imageUrl', data.blobUrl);
    formData.append('imageType', 'blob');
  }
  
  // Handle traditional file uploads as fallback
  if (data.coverImage && data.coverImage.file) {
    formData.append('coverImage', data.coverImage.file);
  }
  
  return formData;
};

// Update books create method
export const booksAPI = {
  // ... existing methods
  
  create: (bookData) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const formData = new FormData();
    prepareBlobData(formData, bookData, currentUser._id);
    
    formData.append('title', bookData.title);
    formData.append('author', bookData.author);
    formData.append('categories', bookData.categories);
    formData.append('description', bookData.description);
    formData.append('publishedDate', bookData.publishedDate);
    
    if (bookData.readingLinks) {
      formData.append('readingLinks', JSON.stringify(bookData.readingLinks));
    }
    
    return api.post('/books', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Similar updates for update method...
};
```

### 6. **Update Backend to Handle Blob URLs**

Update your backend routes to handle blob URLs:

```javascript
// In your book/game routes
app.post('/API/books', upload.single('coverImage'), async (req, res) => {
  try {
    const { imageUrl, imageType } = req.body;
    
    let coverImagePath = null;
    
    if (imageType === 'blob' && imageUrl) {
      // Use blob URL directly
      coverImagePath = imageUrl;
    } else if (req.file) {
      // Traditional file upload
      coverImagePath = `/uploads/${req.file.filename}`;
    }
    
    const bookData = {
      ...req.body,
      Coverpage: coverImagePath
    };
    
    // Save to database...
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 7. **Update Image Display Components**

Update your image display logic:

```javascript
// In your components
const getImageSrc = (imagePath) => {
  if (!imagePath) {
    return 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover';
  }
  
  // If it's a blob URL, use it directly
  if (imagePath.startsWith('https://') && imagePath.includes('vercel-storage.com')) {
    return imagePath;
  }
  
  // If it's a local path, use localhost
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:1412${imagePath}`;
  }
  
  // Default fallback
  return imagePath;
};

// Usage in components:
<img 
  src={getImageSrc(book.Coverpage)} 
  alt={book.title}
  onError={(e) => {
    e.target.src = 'https://via.placeholder.com/300x400/667eea/white?text=Book+Cover';
  }}
/>
```

### 8. **Environment Setup for Vercel**

Create `vercel.json` in your project root:

```json
{
  "functions": {
    "Server/server.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "BLOB_READ_WRITE_TOKEN": "@blob-token",
    "DATABASE_URL": "@database-url"
  },
  "build": {
    "env": {
      "BLOB_READ_WRITE_TOKEN": "@blob-token"
    }
  }
}
```

### 9. **Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add DATABASE_URL
```

## 🎯 Benefits of Vercel Blob

1. **🚀 Fast CDN**: Global edge network for fast image delivery
2. **📱 Auto Optimization**: Automatic image resizing and format conversion
3. **💰 Cost Effective**: Pay only for what you use
4. **🔒 Secure**: Built-in security and access controls
5. **📈 Scalable**: Handles any amount of traffic
6. **🌐 Global**: Served from edge locations worldwide

## 🔧 Testing Your Setup

1. **Upload Test**: Try uploading an image through your form
2. **Display Test**: Verify images display correctly
3. **Optimization Test**: Check if images are automatically optimized
4. **Fallback Test**: Ensure placeholder images work when blob fails

## 📞 Need Help?

If you encounter any issues:
1. Check Vercel dashboard for blob storage usage
2. Verify environment variables are set correctly
3. Check browser network tab for failed requests
4. Review Vercel function logs for errors

---

This setup will give you professional-grade image handling with automatic optimization and global CDN delivery! 🎉