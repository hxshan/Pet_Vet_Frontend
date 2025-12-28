import './App.css'
import PetSearchPage from './pages/PetSearchPage.jsx'
import MedicalRecordPage from './pages/MedicalRecordPage.jsx'
import React, { useState, useEffect } from 'react';

const useRouter = () => {
  const [route, setRoute] = useState('/');
  const [state, setState] = useState(null);

  useEffect(() => {
    const handlePopState = (e) => {
      setRoute(window.location.pathname);
      setState(e.state);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path, options = {}) => {
    window.history.pushState(options.state || null, '', path);
    setRoute(path);
    if (options.state) setState(options.state);
  };

  return { route, state, navigate };
};

const App = () => {
  const { route, state, navigate } = useRouter();

  return (
    <div className="app">
      
      {route === '/' && (
        <PetSearchPage navigate={navigate} />
      )}
      
      {route === '/medical-record' && (
        <MedicalRecordPage navigate={navigate} pet={state?.pet} />
      )}
    </div>
  );
};

export default App
