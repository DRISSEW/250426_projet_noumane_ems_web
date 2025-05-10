/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getDashboardList } from '../../services/emonAPI';
import DashboardCard from './DashboardCard';
import '../../styles/DashboardList.css';

const DashboardList = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await getDashboardList();
        setDashboards(data);
        setLoading(false);
      } catch (err) {
        setError(t('failedLoadDashboards'));
        setLoading(false);
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, [t]);

  if (loading) {
    return (
      <div className="loading">
        <span>{t('loadingDashboards')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="dashboard-list">
      <h2 className="dashboard-list-title">{t('dashboards')}</h2>
      <div className="dashboard-grid">
        {dashboards.map(dashboard => (
          <DashboardCard
            key={dashboard.id}
            id={dashboard.id}
            name={dashboard.name}
            description={dashboard.description}
          />
        ))}
      </div>
    </div>
  );
};

export default DashboardList;