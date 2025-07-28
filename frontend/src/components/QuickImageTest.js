import React from 'react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

const QuickImageTest = () => {
  const testPaths = [
    '/uploads/books/book-1753525696134-209417472.gif',
    '/uploads/games/game-1753525696134-209417472.gif'
  ];

  return (
    <div style={{ 
      padding: '10px', 
      margin: '10px', 
      border: '2px solid red', 
      backgroundColor: '#fff3cd' 
    }}>
      <h6>🚨 Quick Image Test</h6>
      {testPaths.map((path, index) => {
        const url = getImageUrl(path);
        return (
          <div key={index} style={{ marginBottom: '10px' }}>
            <div><strong>Path:</strong> {path}</div>
            <div><strong>Generated URL:</strong> {url}</div>
            <img 
              src={url} 
              alt="test" 
              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
              onLoad={() => console.log('✅ Image loaded:', url)}
              onError={() => console.log('❌ Image failed:', url)}
            />
          </div>
        );
      })}
    </div>
  );
};

export default QuickImageTest;