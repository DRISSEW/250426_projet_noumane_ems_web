/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { getDashboardList } from '../../services/emonAPI';
import DashboardCard from './DashboardCard';
import '../../styles/DashboardList.css';

const DashboardList = () => {
  const [dashboards, setDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboards = async () => {
      try {
        const data = await getDashboardList();
        setDashboards(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboards');
        setLoading(false);
        console.error('Error fetching dashboards:', err);
      }
    };

    fetchDashboards();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <span>Loading dashboards...</span>
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
      <h2 className="dashboard-list-title">Dashboards</h2>
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