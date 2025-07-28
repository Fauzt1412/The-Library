import { useState, useEffect } from 'react';

export const useSidebar = () => {
  const [isVisible, setIsVisible] = useState(() => {
    // Get initial state from localStorage or default to false (hidden)
    const saved = localStorage.getItem('sidebarVisible');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Get initial state from localStorage or default to false
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarVisible', JSON.stringify(isVisible));
  }, [isVisible]);
  
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      // Auto-collapse on mobile
      if (window.innerWidth <= 991.98) {
        setIsCollapsed(true);
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsVisible(prev => !prev);
  };
  
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  return {
    isVisible,
    isCollapsed,
    setIsVisible,
    setIsCollapsed,
    toggleSidebar,
    toggleCollapse
  };
};