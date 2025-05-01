import React, { useEffect, useRef, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

const MainLayout = ({ isDarkMode, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  // Close sidebar on outside click or Escape key
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClick = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [sidebarOpen]);

  return (
    <div className="main-layout">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="main-content">
        <div
          ref={sidebarRef}
          className={`sidebar${sidebarOpen ? ' open' : ''}`}
          aria-hidden={!sidebarOpen}
        >
          <Sidebar />
        </div>
        <main className="content-area">
          {/* Hamburger only on mobile */}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Open sidebar"
            style={{ display: 'none' }}
          >
            <MenuIcon />
          </button>
          <Outlet /> {/* Your routed pages render right here! */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
