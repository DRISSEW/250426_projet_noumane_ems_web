import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import { Brightness4 as DarkIcon, Brightness7 as LightIcon, Notifications as NotificationsIcon } from '@mui/icons-material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DashboardSelector from '../DashboardSelector';
import LanguageSelector from '../LanguageSelector';
import { useTranslation } from 'react-i18next';

const Navbar = ({ toggleTheme, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src="/darklogo.png" alt="Logo" className="navbar-logo" />
        <div className="select-Dashboard">
           <DashboardSelector />
        </div>
      </div>

      <div className="navbar-right">
        <LanguageSelector />
        <IconButton
          onClick={toggleTheme}
          className="icon-button"
          title={isDarkMode ? t("switchToLight") : t("switchToDark")}
        >
          {isDarkMode ? <LightIcon className="icon" /> : <DarkIcon className="icon" />}
        </IconButton>

        <div className="theme-switch">
          <label className="switch">
            <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
            <span className="slider round"></span>
          </label>
          <span className="theme-label" style={{ fontWeight: 'bold' }}>{isDarkMode ? t("darkMode") : t("lightMode")}</span>
        </div>

        <IconButton
          className="icon-button"
          title={t("notifications")}
        >
          <NotificationsIcon className="icon" />
        </IconButton>

        {/* Display the username */}
        {username && <span className="navbar-username">{username}</span>}

        <IconButton
          className="icon-button"
          title={t("profile")}
          onClick={() => navigate('/profile')} 
        >
          <AccountCircleIcon className="icon" />
        </IconButton>
      </div>
    </nav>
  );
};

export default Navbar;