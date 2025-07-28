import React from 'react';

const PlayButtonBox = ({ game, className = '', size = 'normal' }) => {
  const getGamingLinks = () => {
    const links = [];
    
    // First, add custom links provided by user/admin (prioritize these)
    if (game.platformLinks && Array.isArray(game.platformLinks)) {
      game.platformLinks.forEach(link => {
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
    
    // Then add relevant default links based on platform
    const defaultLinks = [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/search/?term=' + encodeURIComponent(game.title),
        icon: 'fab fa-steam',
        color: '#1b2838',
        custom: false
      },
      {
        name: 'Epic Games Store',
        url: 'https://store.epicgames.com/en-US/browse?q=' + encodeURIComponent(game.title),
        icon: 'fas fa-gamepad',
        color: '#313131',
        custom: false
      },
      {
        name: 'GOG',
        url: 'https://www.gog.com/games?search=' + encodeURIComponent(game.title),
        icon: 'fas fa-compact-disc',
        color: '#86328a',
        custom: false
      },
      {
        name: 'PlayStation Store',
        url: 'https://store.playstation.com/en-us/search/' + encodeURIComponent(game.title),
        icon: 'fab fa-playstation',
        color: '#003087',
        custom: false
      },
      {
        name: 'Xbox Store',
        url: 'https://www.xbox.com/en-us/games/store/search?q=' + encodeURIComponent(game.title),
        icon: 'fab fa-xbox',
        color: '#107c10',
        custom: false
      },
      {
        name: 'Nintendo eShop',
        url: 'https://www.nintendo.com/us/search/?q=' + encodeURIComponent(game.title),
        icon: 'fas fa-gamepad',
        color: '#e60012',
        custom: false
      }
    ];
    
    // Filter default links based on platform
    const platformKeywords = game.platform ? game.platform.toLowerCase() : '';
    const relevantLinks = defaultLinks.filter(link => {
      if (platformKeywords.includes('pc') || platformKeywords.includes('windows')) {
        return ['Steam', 'Epic Games Store', 'GOG'].includes(link.name);
      }
      if (platformKeywords.includes('playstation') || platformKeywords.includes('ps')) {
        return link.name === 'PlayStation Store';
      }
      if (platformKeywords.includes('xbox')) {
        return link.name === 'Xbox Store';
      }
      if (platformKeywords.includes('nintendo') || platformKeywords.includes('switch')) {
        return link.name === 'Nintendo eShop';
      }
      return true; // Show all if platform is not specific
    });
    
    links.push(...relevantLinks);
    return links;
  };
  
  const gamingLinks = getGamingLinks();
  const customLinks = gamingLinks.filter(link => link.custom);
  const defaultLinks = gamingLinks.filter(link => !link.custom);
  
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  const boxSizeClass = size === 'small' ? 'gaming-box-small' : size === 'large' ? 'gaming-box-large' : 'gaming-box-normal';
  
  return (
    <div className={`gaming-links-box ${boxSizeClass} ${className}`}>
      <style>{`
        .gaming-links-box {
          border: 2px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          background: var(--card-bg);
          box-shadow: 0 4px 6px var(--card-shadow);
          transition: all 0.3s ease;
        }
        
        .gaming-links-box:hover {
          border-color: #007bff;
          box-shadow: 0 6px 12px rgba(0, 123, 255, 0.15);
        }
        
        [data-theme="dark"] .gaming-links-box:hover {
          border-color: #4dabf7;
          box-shadow: 0 6px 12px rgba(77, 171, 247, 0.3);
        }
        
        .gaming-box-small {
          padding: 15px;
        }
        
        .gaming-box-large {
          padding: 25px;
        }
        
        .gaming-header {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--border-color);
        }
        
        .gaming-header h5 {
          margin: 0;
          color: #007bff;
          font-weight: 600;
        }
        
        [data-theme="dark"] .gaming-header h5 {
          color: #4dabf7;
        }
        
        .custom-links-section {
          margin-bottom: 20px;
        }
        
        .custom-links-header {
          background: linear-gradient(135deg, #007bff, #6610f2);
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
          background: linear-gradient(135deg, #4dabf7, #7c3aed);
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
          border-color: #007bff;
          background: var(--bg-tertiary);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.15);
          text-decoration: none;
          color: var(--text-primary);
        }
        
        [data-theme="dark"] .link-item:hover {
          border-color: #4dabf7;
          box-shadow: 0 4px 8px rgba(77, 171, 247, 0.3);
        }
        
        .custom-link-item {
          border: 2px solid #007bff;
          background: var(--card-bg);
        }
        
        [data-theme="dark"] .custom-link-item {
          border-color: #4dabf7;
          background: var(--bg-secondary);
        }
        
        .custom-link-item:hover {
          border-color: #6610f2;
          background: var(--bg-tertiary);
        }
        
        [data-theme="dark"] .custom-link-item:hover {
          border-color: #7c3aed;
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
        
        .platform-badge {
          background: var(--button-secondary);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.7rem;
          margin-left: 8px;
        }
        
        [data-theme="dark"] .platform-badge {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }
        
        .no-links-message {
          text-align: center;
          color: var(--text-muted);
          font-style: italic;
          padding: 20px;
        }
      `}</style>
      
      <div className="gaming-header">
        <i className="fas fa-play me-2" style={{ fontSize: '1.5rem' }}></i>
        <h5>Gaming Platforms</h5>
        {game.platform && (
          <span className="platform-badge">{game.platform}</span>
        )}
      </div>
      
      {customLinks.length > 0 && (
        <div className="custom-links-section">
          <div className="custom-links-header">
            <i className="fas fa-star me-2"></i>
            Publisher's Recommended Platforms
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
                <div className="link-description">Search for this game</div>
              </div>
              <i className="fas fa-external-link-alt external-icon"></i>
            </div>
          ))}
        </div>
      )}
      
      {gamingLinks.length === 0 && (
        <div className="no-links-message">
          <i className="fas fa-info-circle me-2"></i>
          No gaming platform links available for this game.
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

export default PlayButtonBox;