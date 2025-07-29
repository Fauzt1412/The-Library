import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';

const TestFileUpload = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadType, setUploadType] = useState('traditional');

  const handleFileSelect = (result) => {
    console.log('File selected:', result);
    setUploadResult(result);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="text-center mb-4">
            <i className="fas fa-upload me-2"></i>
            FileUpload Component Test
          </h1>
          
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Upload Type Selection</h5>
            </div>
            <div className="card-body">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="uploadType"
                  id="traditional"
                  value="traditional"
                  checked={uploadType === 'traditional'}
                  onChange={(e) => setUploadType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="traditional">
                  <i className="fas fa-file-upload me-1"></i>
                  Traditional Upload
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="uploadType"
                  id="blob"
                  value="blob"
                  checked={uploadType === 'blob'}
                  onChange={(e) => setUploadType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blob">
                  <i className="fas fa-cloud me-1"></i>
                  Vercel Blob Upload
                </label>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                {uploadType === 'blob' ? (
                  <>
                    <i className="fas fa-cloud me-2"></i>
                    Blob Upload Test
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-upload me-2"></i>
                    Traditional Upload Test
                  </>
                )}
              </h5>
            </div>
            <div className="card-body">
              <FileUpload
                onFileSelect={handleFileSelect}
                enableBlobUpload={uploadType === 'blob'}
                label={`Upload Image (${uploadType === 'blob' ? 'Blob Storage' : 'Traditional'})`}
                maxSize={10 * 1024 * 1024} // 10MB
              />
            </div>
          </div>

          {uploadResult && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Upload Result
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6>Upload Details:</h6>
                    <ul className="list-unstyled">
                      <li><strong>Type:</strong> 
                        <span className={`badge ms-2 ${uploadResult.type === 'blob' ? 'bg-primary' : 'bg-secondary'}`}>
                          {uploadResult.type}
                        </span>
                      </li>
                      <li><strong>File Name:</strong> {uploadResult.file?.name}</li>
                      <li><strong>File Size:</strong> {uploadResult.file ? Math.round(uploadResult.file.size / 1024) : 0} KB</li>
                      <li><strong>File Type:</strong> {uploadResult.file?.type}</li>
                      {uploadResult.blobUrl && (
                        <li><strong>Blob URL:</strong> 
                          <a href={uploadResult.blobUrl} target="_blank" rel="noopener noreferrer" className="text-break">
                            {uploadResult.blobUrl.substring(0, 50)}...
                          </a>
                        </li>
                      )}
                      {uploadResult.filename && (
                        <li><strong>Generated Filename:</strong> {uploadResult.filename}</li>
                      )}
                    </ul>
                  </div>
                  <div className="col-md-6">
                    {uploadResult.preview && (
                      <div>
                        <h6>Preview:</h6>
                        <img 
                          src={uploadResult.preview} 
                          alt="Upload preview" 
                          className="img-thumbnail"
                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3">
                  <h6>Raw Data:</h6>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify({
                      type: uploadResult.type,
                      filename: uploadResult.filename,
                      blobUrl: uploadResult.blobUrl,
                      hasFile: !!uploadResult.file,
                      hasPreview: !!uploadResult.preview
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="card mt-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Component Features
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>✅ New Features:</h6>
                  <ul>
                    <li>Vercel Blob integration</li>
                    <li>Upload progress tracking</li>
                    <li>Smart fallback system</li>
                    <li>Enhanced error handling</li>
                    <li>Loading states</li>
                    <li>Blob storage badge</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6>🔧 Existing Features:</h6>
                  <ul>
                    <li>Drag and drop</li>
                    <li>File validation</li>
                    <li>Image preview</li>
                    <li>File size limits</li>
                    <li>Type restrictions</li>
                    <li>Remove/change options</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <p className="text-muted">
              <i className="fas fa-lightbulb me-1"></i>
              Try uploading an image to see the updated FileUpload component in action!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestFileUpload;