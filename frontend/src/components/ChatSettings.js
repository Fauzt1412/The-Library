import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';

const ChatSettings = ({ onClose, user, onClearMessages }) => {
  const { chatSettings, updateChatSettings, resetChatSettings } = useChat();
  const [tempSettings, setTempSettings] = useState(chatSettings);

  const handleSizeChange = (dimension, value) => {
    const numValue = parseInt(value);
    const minWidth = 250;
    const minHeight = 350;
    
    if (isNaN(numValue)) return;
    if (dimension === 'width' && numValue < minWidth) return;
    if (dimension === 'height' && numValue < minHeight) return;
    
    setTempSettings(prev => ({
      ...prev,
      [dimension]: numValue
    }));
  };

  const handleSave = () => {
    updateChatSettings(tempSettings);
    onClose();
  };

  const handleReset = () => {
    resetChatSettings();
    setTempSettings({
      width: 350,
      height: 500,
      position: { bottom: 90, right: 20 }
    });
  };

  const handleCancel = () => {
    setTempSettings(chatSettings);
    onClose();
  };

  const presetSizes = [
    { name: 'Compact', width: 300, height: 400 },
    { name: 'Default', width: 350, height: 500 },
    { name: 'Large', width: 400, height: 600 },
    { name: 'Extra Large', width: 450, height: 700 }
  ];

  const applyPreset = (preset) => {
    setTempSettings(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
  };

  return (
    <div className="chat-settings-panel">
      <div className="chat-settings-header">
        <h6>
          <i className="fas fa-cog me-2"></i>
          Chat Settings
        </h6>
        <button className="close-settings-btn" onClick={handleCancel}>
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="chat-settings-content">
        {/* Size Presets */}
        <div className="settings-section">
          <label className="settings-label">
            <i className="fas fa-expand-arrows-alt me-2"></i>
            Size Presets
          </label>
          <div className="preset-buttons">
            {presetSizes.map((preset) => (
              <button
                key={preset.name}
                className={`preset-btn ${
                  tempSettings.width === preset.width && tempSettings.height === preset.height
                    ? 'active'
                    : ''
                }`}
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
                <small>{preset.width}×{preset.height}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Size */}
        <div className="settings-section">
          <label className="settings-label">
            <i className="fas fa-ruler-combined me-2"></i>
            Custom Size
          </label>
          <div className="size-inputs">
            <div className="input-group">
              <label htmlFor="width-input">Width:</label>
              <input
                id="width-input"
                type="number"
                min="250"
                max="800"
                value={tempSettings.width}
                onChange={(e) => handleSizeChange('width', e.target.value)}
                className="form-control size-input"
              />
              <span className="input-unit">px</span>
            </div>
            <div className="input-group">
              <label htmlFor="height-input">Height:</label>
              <input
                id="height-input"
                type="number"
                min="350"
                max="900"
                value={tempSettings.height}
                onChange={(e) => handleSizeChange('height', e.target.value)}
                className="form-control size-input"
              />
              <span className="input-unit">px</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="settings-section">
          <label className="settings-label">
            <i className="fas fa-eye me-2"></i>
            Preview
          </label>
          <div className="size-preview">
            <div 
              className="preview-box"
              style={{
                width: `${Math.min(tempSettings.width / 2, 150)}px`,
                height: `${Math.min(tempSettings.height / 3, 100)}px`
              }}
            >
              <span className="preview-text">
                {tempSettings.width} × {tempSettings.height}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Controls - Only visible to admins */}
        {user && user.role === 'admin' && (
          <div className="settings-section admin-section">
            <label className="settings-label">
              <i className="fas fa-shield-alt me-2"></i>
              Admin Controls
            </label>
            <div className="admin-controls">
              <div className="admin-action">
                <div className="admin-action-info">
                  <span className="admin-action-title">
                    <i className="fas fa-trash me-2"></i>
                    Clear All Messages
                  </span>
                  <small className="admin-action-desc">
                    Permanently delete all chat messages
                  </small>
                </div>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={onClearMessages}
                  title="Clear all chat messages permanently"
                >
                  <i className="fas fa-trash me-1"></i>
                  Clear All
                </button>
              </div>
              <div className="admin-info">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Hover over messages to see individual delete buttons
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="settings-info">
          <small className="text-muted">
            <i className="fas fa-info-circle me-1"></i>
            You can also resize by dragging the chat window corners
          </small>
        </div>
      </div>

      <div className="chat-settings-footer">
        <button className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
          <i className="fas fa-undo me-1"></i>
          Reset
        </button>
        <div className="footer-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleCancel}>
            Cancel
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>
            <i className="fas fa-save me-1"></i>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSettings;