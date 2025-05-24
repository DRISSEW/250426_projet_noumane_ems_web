import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardList } from '../services/emonAPI';
import { useTranslation } from 'react-i18next';

const DashboardSelector = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const handleDashboardChange = (e) => {
    const dashboardName = e.target.value; 
    navigate(`/dashboard/${dashboardName}`); 
  };
  
  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        setLoading(true);
        const data = await getDashboardList();
        setDashboards(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load dashboards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboards();
  }, []);


  return (
    <div className="dashboard-selector">
      <select
        className="dashboard-select"
        onChange={handleDashboardChange}
        defaultValue=""
        disabled={loading}
      >
        <option value="" disabled>{t('selectDashboard')}</option>
        {dashboards.map((dashboard) => (
          <option key={dashboard.id} value={dashboard.name}>
            {dashboard.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DashboardSelector;