import {Dashboard as DashboardIcon,ExitToApp as LogoutIcon,Storage as FeedsIcon,} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    const keysToKeep = ['theme'];

    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    window.location.href = '/login';
  };

  const setupItems = [
    { text: 'feeds', icon: <FeedsIcon />, path: '/setup/feeds' },
    { text: 'dashboards', icon: <DashboardIcon />, path: '/dashboard' },
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
                <span>{t(item.text)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-item" onClick={handleLogout}>
          <LogoutIcon />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;