import {Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Add as ExtrasIcon,
  Schedule as ScheduleIcon,
  Event as EventIcon,
  BarChart as VisualizationIcon,
  Email as EmailIcon,
  Input as InputIcon,
  Storage as FeedsIcon,
  ShowChart as GraphsIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const [extrasOpen, setExtrasOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);

  const handleLogout = () => {
    // Remove authentication status from localStorage
    localStorage.removeItem('isAuthenticated');
    // Redirect to login page
    window.location.href = '/login'; // Using window.location to force a full page reload
  };

  const setupItems = [
    { text: 'Inputs', icon: <InputIcon />, path: '/setup/inputs' },
    { text: 'Feeds', icon: <FeedsIcon />, path: '/setup/feeds' },
    { text: 'Dashboards', icon: <DashboardIcon />, path: '/dashboard' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">

        <div className="sidebar-group">
            <div className="sidebar-submenu">
              {setupItems.map((item) => (
                <button
                  key={item.text}
                  className="sidebar-item submenu-item"
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </button>
              ))}
            </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 