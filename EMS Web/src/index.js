import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import './styles/navbar.css';
import './styles/sidebar.css';
import './styles/feeds.css';
import './styles/layout.css';
import './styles/dashboard-selector.css';
import './styles/feed-chart.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
