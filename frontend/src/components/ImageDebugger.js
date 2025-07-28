import React, { useState, useEffect } from 'react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

const ImageDebugger = ({ imagePath, title = 'Debug Image' }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [finalUrl, setFinalUrl] = useState('');

  useEffect(() => {
    const url = imagePath ? getImageUrl(imagePath) : getPlaceholderImage('book');
    setFinalUrl(url);
    setImageStatus('loading');
  }, [imagePath]);

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', finalUrl);
    setImageStatus('loaded');
  };

  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', {
      url: finalUrl,
      originalPath: imagePath,
      error: e
    });
    setImageStatus('error');
    e.target.src = getPlaceholderImage('book');
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', maxWidth: '300px' }}>
      <h6>{title}</h6>
      <div>
        <strong>Original Path:</strong> {imagePath || 'null'}
      </div>
      <div>
        <strong>Final URL:</strong> {finalUrl}
      </div>
      <div>
        <strong>Status:</strong> 
        <span style={{ 
          color: imageStatus === 'loaded' ? 'green' : imageStatus === 'error' ? 'red' : 'orange' 
        }}>
          {imageStatus}
        </span>
      </div>
      <div style={{ marginTop: '10px' }}>
        <img 
          src={finalUrl}
          alt={title}
          style={{ maxWidth: '100%', height: 'auto' }}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default ImageDebugger;