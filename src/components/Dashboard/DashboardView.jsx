/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FeedChart from '../Chart/FeedChart';
import PieChartPuissance from './PieChartPuissance';
import { getDashboardTypeData, getFeedData, getDashboardType, getFeedConfig } from '../../services/emonAPI';
import '../../styles/DashboardView.css';
import PieChartMulticourant from './PieChartMulticourant';
import TemperatureDashboard from './TemperatureDashboard';
import EquilibrageVisual from './EquilibrageVisual';
import MultiGrandeurs from './MultiGrandeurs';
import ModulesVisual from './ModulesVisual';
import ConsumptionDashboard from './ConsumptionDashboard';
import InstantaneCharts from './InstantaneCharts';
import WaterCharts from './WaterCharts';


const DashboardView = () => {
  const { type } = useParams(); 
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true); 
  const [tensionLoading, setTensionLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [chartData, setChartData] = useState(null);
  const [tensionData, setTensionData] = useState(null);
  const [waterData, setWaterData] = useState([]); 
  const [modulesdata, setmodulesdata] = useState([]);
  const [timeRange, setTimeRange] = useState('1m'); 

  const timeRanges = {
    '24h': t('timeRanges.24h'),
    '1w': t('timeRanges.1w'),
    '1m': t('timeRanges.1m'),
    'y': t('timeRanges.y'),
    '5y': t('timeRanges.5y'),
    '10y': t('timeRanges.10y'),
  };

  const fetchDashboardData = async (selectedTimeRange) => {
    try {
      setLoading(true);
      const data = await getDashboardTypeData(type, selectedTimeRange);
      setChartData(data); 
      setLoading(false);
      console.log(data)
    } catch (err) {
      setError(t('failedLoadData') + type);
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  const fetchTensionData = async (selectedTimeRange) => {
    try {
      setTensionLoading(true);
      const tensionConfig = getFeedConfig('tension');
      const data = await getFeedData(tensionConfig.id, selectedTimeRange);
      setTensionData(data);
      setTensionLoading(false);
    } catch (err) {
      setError('Failed to load TENSION data');
      setTensionLoading(false);
      console.error('Error fetching TENSION data:', err);
    }
  };
  const fetchWaterData = async (selectedTimeRange) => {
    try {
      const data = await getFeedData(1696, selectedTimeRange);
      setWaterData(data); 
    } catch (err) {
      setError('Failed to load water data');
      console.error('Error fetching water data:', err);
    }
  };

  const fetchModulesData = async (selectedTimeRange) => {
    try {
      const data = await getFeedData(149, selectedTimeRange);
      setmodulesdata(data); 
    } catch (err) {
      setError('Failed to load modules data');
      console.error('Error fetching modules data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData(timeRange); 
    if (type !== 'Multicourants') {
      fetchTensionData(timeRange); 
    }
    if (type === 'A10_EAU EW') {
      fetchWaterData(timeRange);
    }
    if (type === '7_14 MODULES') {
      fetchModulesData(timeRange);
    }
  }, [type, timeRange]);

  if (loading || (type !== 'Multicourants' && tensionLoading)) {
    return <div className="loading">{t('loadingDashboard')}</div>;
  }
  if (error) return <div className="error">{error}</div>;

  const username = localStorage.getItem('username');

  return (
    <div className="dashboard-view">
      <div className="feeds-chart-area">
        {type === getDashboardType('multipuissance') && (
          <div className='feeds-chart-container'>
            <div className="chart-container block1">
              <div className="chart-multipuissance">
                <div className="time-range-selector">
                  {Object.entries(timeRanges).map(([value, label]) => (
                    <button
                      key={value}
                      className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                      onClick={() => setTimeRange(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="chart-container">
                  <FeedChart
                    data={chartData.datasets.map((d) => ({
                      label: d.label,
                      data: d.data,
                    }))}
                    feedName={type} 
                    timeRange={timeRange} 
                  />
                </div>
              </div>
              <PieChartPuissance />
            </div>
            <div className="chart-container block2">
              <FeedChart
                data={tensionData}
                feedName="TENSION"
                timeRange={timeRange} 
                isTimeRangeAppear="false"
              />
            </div>
            <div className="instantane">
              <InstantaneCharts />
            </div>
          </div>
        )}
        {type === getDashboardType('multicourants') && (
          <div className="chart-container block1">
            <div className="chart chart-multipuissance">
              <div className="time-range-selector">
                {Object.entries(timeRanges).map(([value, label]) => (
                  <button
                    key={value}
                    className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                    onClick={() => setTimeRange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="chart-container">
                <FeedChart
                  data={chartData.datasets.map((d) => ({
                    label: d.label,
                    data: d.data,
                  }))}
                  feedName={type} 
                  timeRange={timeRange} 
                />
              </div>
            </div>
            <PieChartMulticourant />
          </div>
        )}
        {type === getDashboardType('consommation') && (
          <ConsumptionDashboard />
        )}
        {(type === '9_MULTIDEBIT' || type === 'no name' || type === 'grafna') && (
          <div className="no-data-message">
            <svg className="no-data-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
              />
            </svg>
            <span>{t('noDashboardData')}</span>
          </div>
        )}
        {type === getDashboardType('temperature') && (
          <>
            {username === 'nfis01' ? (
              <div className="no-data-message">
                <svg className="no-data-icon" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
                  />
                </svg>
                <span>No data available for this dashboard</span>
              </div>
            ) : (
              <TemperatureDashboard />
            )}
          </>
        )}
        {type === getDashboardType('equilibrage') && (
          <>
            <h2>Equilibrage</h2>
            <EquilibrageVisual />
          </>
        )}
        {type === getDashboardType('multigrandeurs') && (
          <MultiGrandeurs />
        )}
        {(type === 'A10_EAU EW') && (
          <div className="water-dashboard-container">
            <div className="chart-container">
              <div className="time-range-selector">
                {Object.entries(timeRanges).map(([value, label]) => (
                  <button
                    key={value}
                    className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                    onClick={() => setTimeRange(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="chart-wrapper">
                <FeedChart
                  data={waterData}
                  feedName="Debit Eau"
                  timeRange={timeRange}
                  isTimeRangeAppear={true}
                  isFromDashboard={true}
                />
              </div>
            </div>
            <div className="feeds-chart-container-consommation">
              <WaterCharts />
            </div>
          </div>
        )}
        {(type === '7_14 MODULES') && (
          <div className="chart-container">
            <div className="time-range-selector">
              {Object.entries(timeRanges).map(([value, label]) => (
                <button
                  key={value}
                  className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                  onClick={() => setTimeRange(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="chart-wrapper">
              <FeedChart
                data={modulesdata}
                feedName="i1"
                timeRange={timeRange}
                isTimeRangeAppear={true}
                isFromDashboard={true}
              />
            </div>
            <ModulesVisual />
          </div>
        )}
        {(type === '8_CurrentDetection') && (
          <div className="no-data-message">
            <svg className="no-data-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
              />
            </svg>
            <span>{t('noDashboardData')}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;