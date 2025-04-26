/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/DashboardCard.css';  // Correction du chemin
import { multiPuissanceConfig, dashboardConfigs } from './dashboardTypes/multiPuissance';


const DashboardCard = ({ id, name, description }) => {
  const navigate = useNavigate();

  const handleView = () => {
    // console.log('clicked');
    if (name) {
      navigate(`/dashboard/${name}`); // Navigate directly using the selected name
    } else {
      window.open(`http://electricwave.ma/energymonitoring/dashboard/view?id=${id}`, '_blank');
    }
  };

  return (
    <div className="dashboard-card">
      <div className="dashboard-info">
        <h3 className="dashboard-name">{name}</h3>
        <p className="dashboard-description">{description || 'No description available'}</p>
        <p className="dashboard-id">ID: {id}</p>
      </div>
      <div className="dashboard-actions">
        <button 
          className="view-button"
          onClick={handleView}
          title="View Dashboard"
        >
          <svg viewBox="0 0 24 24" className="view-icon">
            <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          See
        </button>
      </div>
    </div>
  );
};

export default DashboardCard;
