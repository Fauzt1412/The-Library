import React, { useState, useEffect } from 'react';

const ServerTest = () => {
  const [serverStatus, setServerStatus] = useState('testing...');
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const testServer = async () => {
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:1412';
      setApiUrl(baseUrl);
      
      try {
        const response = await fetch(`${baseUrl}/health`);
        if (response.ok) {
          const data = await response.json();
          setServerStatus(`✅ Server OK - ${data.status}`);
        } else {
          setServerStatus(`❌ Server Error - ${response.status}`);
        }
      } catch (error) {
        setServerStatus(`❌ Connection Failed - ${error.message}`);
      }
    };

    testServer();
  }, []);

  return (
    <div style={{ 
      padding: '10px', 
      margin: '10px', 
      border: '2px solid blue', 
      backgroundColor: '#e7f3ff' 
    }}>
      <h6>🔧 Server Connection Test</h6>
      <div><strong>API URL:</strong> {apiUrl}</div>
      <div><strong>Status:</strong> {serverStatus}</div>
    </div>
  );
};

export default ServerTest;