import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import DisclosureWorkspace from './pages/DisclosureWorkspace';
import PrivacyPolicy from './pages/PrivacyPolicy';

const App: React.FC = () => {
  // Simple custom router using hash or state
  const [currentPath, setCurrentPath] = useState<string>(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash || '#/');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation Helper
  const navigate = (path: string) => {
    window.location.hash = path;
  };

  // Route Rendering
  if (currentPath === '#/workspace') {
    return <DisclosureWorkspace />;
  }

  if (currentPath.includes('privacy')) {
    return <PrivacyPolicy />;
  }

  return <LandingPage />;
};

export default App;
