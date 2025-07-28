import React, { useState } from 'react';

const PlayButton = ({ game, className = '', size = 'normal' }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const getGamingLinks = () => {
    const links = [];
    
    const defaultLinks = [
      {
        name: 'Steam',
        url: 'https://store.steampowered.com/search/?term=' + encodeURIComponent(game.title),
        icon: 'fab fa-steam',
        color: '#1b2838'
      },
      {
        name: 'Epic Games Store',
        url: 'https://store.epicgames.com/en-US/browse?q=' + encodeURIComponent(game.title),
        icon: 'fas fa-gamepad',
        color: '#313131'
      },
      {
        name: 'GOG',
        url: 'https://www.gog.com/games?search=' + encodeURIComponent(game.title),
        icon: 'fas fa-compact-disc',
        color: '#86328a'
      },
      {
        name: 'PlayStation Store',
        url: 'https://store.playstation.com/en-us/search/' + encodeURIComponent(game.title),
        icon: 'fab fa-playstation',
        color: '#003087'
      },
      {
        name: 'Xbox Store',
        url: 'https://www.xbox.com/en-us/games/store/search?q=' + encodeURIComponent(game.title),
        icon: 'fab fa-xbox',
        color: '#107c10'
      },
      {
        name: 'Nintendo eShop',
        url: 'https://www.nintendo.com/us/search/?q=' + encodeURIComponent(game.title),
        icon: 'fas fa-gamepad',
        color: '#e60012'
      }
    ];
    
    if (game.platformLinks && Array.isArray(game.platformLinks)) {
      game.platformLinks.forEach(link => {
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
      return true;
    });
    
    links.push(...relevantLinks);
    return links;
  };
  
  const gamingLinks = getGamingLinks();
  const sizeClass = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';
  
  const handleLinkClick = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowDropdown(false);
  };
  
  return (
    <div className={'dropdown ' + className}>
      <button
        className={'btn btn-primary ' + sizeClass + ' dropdown-toggle'}
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-expanded={showDropdown}
      >
        <i className="fas fa-play me-2"></i>
        Play Now
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
                <i className="fas fa-gamepad me-2"></i>
                Available Gaming Platforms
              </h6>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            
            {gamingLinks.map((link, index) => (
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

export default PlayButton;