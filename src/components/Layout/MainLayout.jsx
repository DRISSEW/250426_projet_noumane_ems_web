import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const MainLayout = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="main-layout">
      <Navbar isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

      <div className="main-content">
        <Sidebar />
        <main className="content-area">
          <Outlet /> {/* Your routed pages render right here! */}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
