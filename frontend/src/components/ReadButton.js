import React, { useState } from 'react';

const ReadButton = ({ book, className = '', size = 'normal' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const getReadingLinks = () => {
    const links = [];
    
    const defaultLinks = [
      {
        name: 'Amazon Kindle',
        url: 'https://www.amazon.com/s?k=' + encodeURIComponent(book.title + ' ' + book.author) + '&i=digital-text',
        icon: 'fab fa-amazon',
        color: '#ff9900'
      },
      {
        name: 'Google Books',
        url: 'https://books.google.com/books?q=' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fab fa-google',
        color: '#4285f4'
      },
      {
        name: 'Apple Books',
        url: 'https://books.apple.com/search?term=' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fab fa-apple',
        color: '#000000'
      },
      {
        name: 'Barnes and Noble',
        url: 'https://www.barnesandnoble.com/s/' + encodeURIComponent(book.title + ' ' + book.author),
        icon: 'fas fa-book',
        color: '#00704a'
      }
    ];
    
    if (book.readingLinks && Array.isArray(book.readingLinks)) {
      book.readingLinks.forEach(link => {
        if (link.url && link.name) {
          links.push({
            name: link.name,
            url: link.url,
            icon: link.icon || 'fas fa-external-link-alt',
            color: link.color || '#667eea',
            custom: true
          });
        }
      });
    }
    
    links.push(...defaultLinks);
    return links;
  };
  
  const readingLinks = getReadingLinks();
  const sizeClass = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';
  
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowDropdown(false);
  };
  
  return (
    <div className={'dropdown ' + className}>
      <button
        className={'btn btn-success ' + sizeClass + ' dropdown-toggle'}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        <i className="fas fa-book-open me-2"></i>
        Read Now
      </button>
      
      {showDropdown && (
        <>
          <div 
            className="dropdown-backdrop" 
            onClick={() => setShowDropdown(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1000
            }}
          ></div>
          
          <ul className="dropdown-menu show" style={{ zIndex: 1001 }}>
            <li>
              <h6 className="dropdown-header">
                <i className="fas fa-book me-2"></i>
                Available Reading Options
              </h6>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            
            {readingLinks.map((link, index) => (
              <li key={index}>
                <button
                  className="dropdown-item d-flex align-items-center"
                  onClick={() => handleLinkClick(link.url)}
                >
                  <i 
                    className={link.icon + ' me-3'} 
                    style={{ color: link.color, width: '20px' }}
                  ></i>
                  <div>
                    <div className="fw-medium">{link.name}</div>
                    {link.custom && (
                      <small className="text-muted">Custom Link</small>
                    )}
                  </div>
                  <i className="fas fa-external-link-alt ms-auto text-muted"></i>
                </button>
              </li>
            ))}
            
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <div className="dropdown-item-text">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Links open in new tab
                </small>
              </div>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default ReadButton;