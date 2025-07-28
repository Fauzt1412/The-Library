import React from 'react';

const ReadButtonBox = ({ book, className = '', size = 'normal' }) => {
  const getReadingLinks = () => {
    const links = [];
    
    // First, add custom links provided by user/admin (prioritize these)
    if (book.readingLinks && Array.isArray(book.readingLinks)) {
      book.readingLinks.forEach(link => {
        if (link.url && link.name) {
          links.push({
            name: link.name,
            url: link.url,
            icon: link.icon || 'fas fa-external-link-alt',
            color: link.color || '#667eea',
            custom: true,
            priority: true
          });
        }
      });
    }
    
    // Then add default links
    const defaultLinks = [
      {
        name: 'Amazon Kindle',
        url: 'https://www.amazon.com/s?k=' + encodeURIComponent(book.title + ' ' + book.author) + '&i=digital-text',
        icon: 'fab fa-amazon',
        color: '#ff9900',
        custom: false
      },
      {
        name: 'Google Books',
        url: 'https://books.google.com/books?q=' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fab fa-google',
        color: '#4285f4',
        custom: false
      },
      {
        name: 'Apple Books',
        url: 'https://books.apple.com/search?term=' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fab fa-apple',
        color: '#000000',
        custom: false
      },
      {
        name: 'Barnes & Noble',
        url: 'https://www.barnesandnoble.com/s/' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fas fa-book',
        color: '#00704a',
        custom: false
      }
    ];
    
    links.push(...defaultLinks);
    return links;
  };
  
  const readingLinks = getReadingLinks();
  const customLinks = readingLinks.filter(link => link.custom);
  const defaultLinks = readingLinks.filter(link => !link.custom);
  
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const boxSizeClass = size === 'small' ? 'reading-box-small' : size === 'large' ? 'reading-box-large' : 'reading-box-normal';
  
  return (
    <div className={`reading-links-box ${boxSizeClass} ${className}`}>
      <style>{`
        .reading-links-box {
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          background: var(--card-bg);
          box-shadow: 0 4px 6px var(--card-shadow);
          transition: all 0.3s ease;
        }
        
        .reading-links-box:hover {
          border-color: #28a745;
          box-shadow: 0 6px 12px rgba(40, 167, 69, 0.15);
        }
        
        [data-theme="dark"] .reading-links-box:hover {
          box-shadow: 0 6px 12px rgba(40, 167, 69, 0.3);
        }
        
        .reading-box-small {
          padding: 15px;
        }
        
        .reading-box-large {
          padding: 25px;
        }
        
        .reading-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border-color);
        }
        
        .reading-header h5 {
          margin: 0;
          color: #28a745;
          font-weight: 600;
        }
        
        [data-theme="dark"] .reading-header h5 {
          color: #4ade80;
        }
        
        .custom-links-section {
          margin-bottom: 20px;
        }
        
        .custom-links-header {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        [data-theme="dark"] .custom-links-header {
          background: linear-gradient(135deg, #22c55e, #10b981);
        }
        
        .default-links-header {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .link-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--card-bg);
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .link-item:hover {
          border-color: #28a745;
          background: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(40, 167, 69, 0.15);
          text-decoration: none;
          color: var(--text-primary);
        }
        
        [data-theme="dark"] .link-item:hover {
          border-color: #4ade80;
          box-shadow: 0 4px 8px rgba(74, 222, 128, 0.3);
        }
        
        .custom-link-item {
          border: 2px solid #28a745;
          background: var(--card-bg);
        }
        
        [data-theme="dark"] .custom-link-item {
          border-color: #4ade80;
          background: var(--bg-secondary);
        }
        
        .custom-link-item:hover {
          border-color: #20c997;
          background: var(--bg-tertiary);
        }
        
        [data-theme="dark"] .custom-link-item:hover {
          border-color: #10b981;
        }
        
        .link-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          font-size: 1.2rem;
        }
        
        .link-content {
          flex: 1;
        }
        
        .link-name {
          font-weight: 600;
          margin-bottom: 2px;
          color: var(--text-primary);
        }
        
        .link-description {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        
        .external-icon {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        
        .no-links-message {
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
          padding: 20px;
        }
      `}</style>
      
      <div className="reading-header">
        <i className="fas fa-book-open me-2" style={{ fontSize: '1.5rem' }}></i>
        <h5>Reading Options</h5>
      </div>
      
      {customLinks.length > 0 && (
        <div className="custom-links-section">
          <div className="custom-links-header">
            <i className="fas fa-star me-2"></i>
            Publisher's Recommended Links
          </div>
          {customLinks.map((link, index) => (
            <div
              key={`custom-${index}`}
              className="link-item custom-link-item"
              onClick={() => handleLinkClick(link.url)}
            >
              <div className="link-icon">
                <i 
                  className={link.icon} 
                  style={{ color: link.color }}
                ></i>
              </div>
              <div className="link-content">
                <div className="link-name">{link.name}</div>
                <div className="link-description">Recommended by publisher</div>
              </div>
              <i className="fas fa-external-link-alt external-icon"></i>
            </div>
          ))}
        </div>
      )}
      
      {defaultLinks.length > 0 && (
        <div className="default-links-section">
          <div className="default-links-header">
            <i className="fas fa-book-open me-2"></i>
            Other Available Stores
          </div>
          {defaultLinks.map((link, index) => (
            <div
              key={`default-${index}`}
              className="link-item"
              onClick={() => handleLinkClick(link.url)}
            >
              <div className="link-icon">
                <i 
                  className={link.icon} 
                  style={{ color: link.color }}
                ></i>
              </div>
              <div className="link-content">
                <div className="link-name">{link.name}</div>
                <div className="link-description">Search for this book</div>
              </div>
              <i className="fas fa-external-link-alt external-icon"></i>
            </div>
          ))}
        </div>
      )}
      
      {readingLinks.length === 0 && (
        <div className="no-links-message">
          <i className="fas fa-info-circle me-2"></i>
          No reading links available for this book.
        </div>
      )}
      
      <div className="mt-3 pt-3 border-top">
        <small className="text-muted d-flex align-items-center">
          <i className="fas fa-info-circle me-2"></i>
          All links open in a new tab
        </small>
      </div>
    </div>
  );
};

export default ReadButtonBox;