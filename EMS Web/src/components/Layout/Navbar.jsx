/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardSelector from '../DashboardSelector';

const Navbar = ({ toggleTheme, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    // Retrieve the username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/EWlogo.jpg" alt="Logo" className="navbar-logo" />
        <h1 className="navbar-title">Electric Wave EMS</h1>
        <DashboardSelector />
      </div>

      <div className="navbar-right">
        <IconButton
          onClick={toggleTheme}
          className="icon-button"
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <LightIcon className="icon" /> : <DarkIcon className="icon" />}
        </IconButton>

        <div className="theme-switch">
          <label className="switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
          <span className="theme-label" style={{ fontWeight: 'bold' }}>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
        </div>

        <IconButton
          className="icon-button"
          title="Notifications"
        >
          <NotificationsIcon className="icon" />
        </IconButton>

        {/* Display the username */}
        {username && <span className="navbar-username">{username}</span>}

        <IconButton
          className="icon-button"
          title="Profile"
          onClick={() => navigate('/profile')} // Navigate to profile page
        >
          <AccountCircleIcon className="icon" />
        </IconButton>
      </div>
    </nav>
  );
};

export default Navbar;