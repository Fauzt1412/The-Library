import React, { useState } from 'react';
import { getImageUrl, getPlaceholderImage } from '../utils/imageUtils';

const ImageTester = () => {
  const [testResults, setTestResults] = useState([]);

  const testImageUrls = () => {
    const tests = [
      {
        name: 'Sample book image',
        path: '/uploads/books/book-1753525696134-209417472.gif',
        expected: 'Should load successfully'
      },
      {
        name: 'Non-existent image',
        path: '/uploads/books/non-existent.jpg',
        expected: 'Should fallback to placeholder'
      },
      {
        name: 'Null path',
        path: null,
        expected: 'Should show placeholder'
      },
      {
        name: 'Empty path',
        path: '',
        expected: 'Should show placeholder'
      }
    ];

    const results = tests.map(test => ({
      ...test,
      finalUrl: test.path ? getImageUrl(test.path) : getPlaceholderImage('book'),
      status: 'testing'
    }));

    setTestResults(results);
  };

  const updateTestResult = (index, status, error = null) => {
    setTestResults(prev => prev.map((result, i) => 
      i === index ? { ...result, status, error } : result
    ));
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #007bff', margin: '20px', borderRadius: '8px' }}>
      <h4>🧪 Image URL Tester</h4>
      <button 
        onClick={testImageUrls}
        className="btn btn-primary mb-3"
      >
        Run Image Tests
      </button>

      {testResults.map((test, index) => (
        <div key={index} style={{ 
          border: '1px solid #ddd', 
          padding: '10px', 
          margin: '10px 0',
          borderRadius: '4px',
          backgroundColor: test.status === 'loaded' ? '#d4edda' : 
                          test.status === 'error' ? '#f8d7da' : '#fff3cd'
        }}>
          <h6>{test.name}</h6>
          <div><strong>Path:</strong> {test.path || 'null'}</div>
          <div><strong>Final URL:</strong> {test.finalUrl}</div>
          <div><strong>Expected:</strong> {test.expected}</div>
          <div><strong>Status:</strong> 
            <span style={{ 
              color: test.status === 'loaded' ? 'green' : 
                     test.status === 'error' ? 'red' : 'orange',
              fontWeight: 'bold',
              marginLeft: '5px'
            }}>
              {test.status}
            </span>
          </div>
          
          {test.finalUrl && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={test.finalUrl}
                alt={test.name}
                style={{ 
                  maxWidth: '200px', 
                  height: 'auto',
                  border: '1px solid #ccc'
                }}
                onLoad={() => updateTestResult(index, 'loaded')}
                onError={(e) => {
                  updateTestResult(index, 'error', e.message);
                  e.target.src = getPlaceholderImage('book');
                }}
              />
            </div>
          )}
          
          {test.error && (
            <div style={{ color: 'red', fontSize: '12px', marginTop: '5px' }}>
              Error: {test.error}
            </div>
          )}
        </div>
      ))}

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h6>Environment Info:</h6>
        <div><strong>REACT_APP_API_URL:</strong> {process.env.REACT_APP_API_URL || 'undefined'}</div>
        <div><strong>Current Origin:</strong> {window.location.origin}</div>
      </div>
    </div>
  );
};

export default ImageTester;