import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  // Check if the user has a preference for dark mode in local storage
  // const [darkMode, setDarkMode] = useState(() => {
  //   const storedMode = localStorage.getItem('darkMode');
  //   return storedMode === 'true'; // stored as string
  // });
  
  // Save preference when toggled
  
  // useEffect(() => {
  //   document.body.classList.remove('light-mode', 'dark-mode');
  //   document.body.classList.add(darkMode ? 'dark-mode' : 'light-mode');
  //   localStorage.setItem('darkMode', darkMode); // Save to localStorage
  // }, [darkMode]);
  
  useEffect(() => {
    document.body.classList.remove('light-mode', 'dark-mode'); // Remove any previous class
    document.body.classList.add(darkMode ? 'dark-mode' : 'light-mode');
  }, [darkMode]);

  // useEffect(() => {
  //   document.body.className = darkMode ? 'dark-mode' : 'light-mode';
  // }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <header className="header">
      <div className="logo">
        <div className="logo-icon">L</div>
        <span>LingoSync</span>
      </div>
      <nav>
        <ul className="nav-links">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Translate
            </Link>
          </li>
          <li>
            <Link to="/documents" className={location.pathname === '/documents' ? 'active' : ''}>
              Documents
            </Link>
          </li>
          <li>
            <Link to="/images" className={location.pathname === '/images' ? 'active' : ''}>
              Image
            </Link>
          </li>
          <li>
            <Link to="/speech" className={location.pathname === '/speech' ? 'active' : ''}>
              Speech
            </Link>
          </li>
        </ul>
      </nav>
      <div className="theme-toggle">
        <span className={`toggle-label ${!darkMode ? 'active' : ''}`}>Light</span>
        <div className={`toggle-switch ${darkMode ? 'dark' : 'light'}`} onClick={toggleTheme}>
          <div className="toggle-circle"></div>
          {!darkMode && (
            <>
              <span className="dot dot1"></span>
              <span className="dot dot2"></span>
            </>
          )}
        </div>
        <span className={`toggle-label ${darkMode ? 'active' : ''}`}>Dark</span>
      </div>
    </header>
  );
};

export default Header;
