import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FeedChart from '../Chart/FeedChart';
import PieChartPuissance from './PieChartPuissance';
import { getDashboardTypeData, getFeedData } from '../../services/emonAPI';
import '../../styles/DashboardView.css'; // Import the CSS file for styling
import PieChartMulticourant from './PieChartMulticourant';

const DashboardView = () => {
  const { type } = useParams(); // Get the dynamic "type" parameter from the URL
  const [loading, setLoading] = useState(true); // Loading state for Multipuissance
  const [tensionLoading, setTensionLoading] = useState(true); // Loading state for TENSION
  const [error, setError] = useState(null); // Error state
  const [chartData, setChartData] = useState(null); // Chart data state for Multipuissance
  const [tensionData, setTensionData] = useState(null); // Chart data state for TENSION
  const [waterLoading, setWaterLoading] = useState(true); // Loading state for water consumption
  const [waterData, setWaterData] = useState([]); // Chart data state for water consumption
  const [modulesdata, setmodulesdata] = useState([]); // Loading state for water consumption
  const [modulesLoading, setmodulesLoading] = useState(null); // Chart data state for water consumption
  const [consommationLoading, setConsommationLoading] = useState(true); // Loading state for Consommation
  const [consommationData, setConsommationData] = useState(null); // Chart data state for Consommation
  const [coutLoading, setCoutLoading] = useState(true); // Loading state for Cout
  const [coutData, setCoutData] = useState(null); // Chart data state for Cout
  const [timeRange, setTimeRange] = useState('1m'); // Time range state

  console.log('DashboardView type:', type); // Log the type parameter for debugging

  const timeRanges = {
  '24h': 'D',
  '1w': 'W',
  '1m': 'M',
  'y': 'Y'
  };
  
  // Function to fetch Multipuissance data
  const fetchDashboardData = async (selectedTimeRange) => {
    try {
      setLoading(true);
      const data = await getDashboardTypeData(type, selectedTimeRange); // Fetch Multipuissance data
      setChartData(data); // Update Multipuissance chart data
      setLoading(false);
    } catch (err) {
      setError(`Failed to load data for dashboard: ${type}`);
      setLoading(false);
      console.error('Error fetching dashboard data:', err);
    }
  };

  // Function to fetch TENSION data
  const fetchTensionData = async (selectedTimeRange) => {
    try {
      setTensionLoading(true);
      const data = await getFeedData(28, selectedTimeRange); // Fetch TENSION data using feedId 28
      setTensionData(data); // Update TENSION chart data
      setTensionLoading(false);
    } catch (err) {
      setError('Failed to load TENSION data');
      setTensionLoading(false);
      console.error('Error fetching TENSION data:', err);
    }
  };
  // Update the fetch functions to be simpler
  const fetchWaterData = async (selectedTimeRange) => {
    try {
      setWaterLoading(true);
      const data = await getFeedData(1696, selectedTimeRange);
      setWaterData(data); // Raw data - FeedChart will handle formatting
      setWaterLoading(false);
    } catch (err) {
      setError('Failed to load water data');
      setWaterLoading(false);
      console.error('Error fetching water data:', err);
    }
  };


  const fetchModulesData = async (selectedTimeRange) => {
    try {
      setmodulesLoading(true);
      const data = await getFeedData(149, selectedTimeRange);
      setmodulesdata(data); // Raw data - FeedChart will handle formatting
      setmodulesLoading(false);
    } catch (err) {
      setError('Failed to load modules data');
      setmodulesLoading(false);
      console.error('Error fetching modules data:', err);
    }
  };

  const fetchConsommationData = async(selectedTimeRange, interval, skipmissing) => {
    try {
      setConsommationLoading(true);
      const data = await getFeedData(1246, selectedTimeRange, interval, skipmissing);
      setConsommationData(data); // Update Consommation chart data
      setConsommationLoading(false);
    } catch (err) {
      setError('Failed to load Consommation data');
      setConsommationLoading(false);
      console.error('Error fetching Consommation data:', err);
    }
  };

  const fetchCoutData = async(selectedTimeRange ,interval, skipmissing) => {
    try {
      setCoutLoading(true);
      const data = await getFeedData(1246, selectedTimeRange, interval, skipmissing);
      setCoutData(data); // Update Cout chart data
      setCoutLoading(false);
    }
    catch (err) {
      setError('Failed to load Cout data');
      setCoutLoading(false);
      console.error('Error fetching Cout data:', err);
    }
  }

  // Fetch data when the component mounts or when the time range changes
  useEffect(() => {
    fetchDashboardData(timeRange); // Fetch Multipuissance data
    if (type !== 'Multicourants') {
      fetchTensionData(timeRange); // Fetch TENSION data only if not Multicourants
    }
    if (type === '5_CONSOMMATION') {
      fetchConsommationData(timeRange, 86400, 0); // Fetch Consommation data
      fetchCoutData(timeRange, 86400,0); // Fetch Cout data
    }
    if (type === 'A10_EAU EW') {
      fetchWaterData(timeRange);
    }
    if (type === '7_14 MODULES') {
      fetchModulesData(timeRange);
    }
  }, [type, timeRange]);

  if (loading || (type !== 'Multicourants' && tensionLoading)) return <div className="loading">Loading dashboard...</div>;
  // if (loading || consommationLoading || coutLoading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-view">
      <div className="feeds-chart-area">
        {type !== '1_MULTIPUISSANCES' && type !== '2_MULTICOURANTS' && type !== '8_CurrentDetection' && type !== '7_14 MODULES' && type !== 'A10_EAU EW' && type !== '6_MULTIGRANDEURS' && type !== '4_TEMPERATURE' && type !== '5_CONSOMMATION' && type !== '9_MULTIDEBIT' && type !== 'no name' && type !== 'grafna' && type !=='3_EQUILIBRAGE' &&(
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
                    
                    <div className="chart-container">
                      <FeedChart
                        data={chartData.datasets.map((d) => ({
                          label: d.label,
                          data: d.data,
                        }))}
                        feedName={type} // Use the "type" as the feed name
                        timeRange={timeRange} // Pass the selected time range to the chart
                      />
                </div>
                </div>
          )}

        {/* Conditionally Render TENSION Chart */}
        {type == '1_MULTIPUISSANCES' && (
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
                        feedName={type} // Use the "type" as the feed name
                        timeRange={timeRange} // Pass the selected time range to the chart
                      />
                    </div>
              </div>
              <PieChartPuissance />
            </div>
            <div className="chart-container block2">
              <FeedChart
                data={tensionData}
                feedName="TENSION" // Use "TENSION" as the feed name
                timeRange={timeRange} // Pass the selected time range to the chart
                isTimeRangeAppear = "false"
                />
            </div>
            <div className="instantane">
              <div>
                <h3>PUISSANCE TOTALE INST</h3>
                  <iframe
                    src="http://electricwave.ma/energymonitoring/vis/realtime?embed=1&feedid=27&colour=ff8000&initzoom=5&apikey=3ddd9a580253f6c9aab6298f754cf0fd&embed=1"
                    width="160%"
                    height="250"
                    frameborder="0"
                    scrolling="no"
                    >
                </iframe>
              </div>
              <div>
                <h3>TENSION INST</h3>
                  <iframe
                    src="http://electricwave.ma/energymonitoring/vis/realtime?embed=1&feedid=27&colour=ff8000&initzoom=5&apikey=3ddd9a580253f6c9aab6298f754cf0fd&embed=1"
                    width="160%"
                    height="250"
                    frameborder="0"
                    scrolling="no"
                  >
                  </iframe>
              </div>
            </div>
          </div>
        )}
        {type == '2_MULTICOURANTS' && (
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
                  feedName={type} // Use the "type" as the feed name
                  timeRange={timeRange} // Pass the selected time range to the chart
                />
              </div>
            </div>
            <PieChartMulticourant />
          </div>
          )}
        {type == '5_CONSOMMATION' && (
          <div className="feeds-chart-container-consommation">
            <div className="consumption-chart">
              <h2 className="consumption-title">Consumption (KWH)</h2>
              <iframe
                src="http://electricwave.ma/energymonitoring/vis/bargraph?embed=1&feedid=1246&colour=ff8080&interval=d&units= KWH&dp=&scale=&delta=1&mode=0&initzoom=1&apikey=02f316fd3b4a3a52a8e3ed7a5d7d9ac2"
                frameBorder="0"
                className='iframe-consommation'
                scrolling="no"
              ></iframe>
            </div>
            <div className="consumption-chart">
              <h2 className="consumption-title">Cost (DH)</h2>
              <iframe
                src="http://electricwave.ma/energymonitoring/vis/bargraph?embed=1&feedid=1246&colour=62c400&interval=d&units= DH&dp=&scale=1.7&delta=1&mode=0&initzoom=1&apikey=02f316fd3b4a3a52a8e3ed7a5d7d9ac2"
                frameBorder="0"
                className='iframe-consommation'
                scrolling="no"
              ></iframe>
            </div>
          </div>
        )}

        {(type === '9_MULTIDEBIT' || type === 'no name' || type === 'grafna') && (
          <div className="no-data-message">
            <svg className="no-data-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
              />
            </svg>
            <span>No data available for this dashboard</span>
          </div>
        )}
        {(type === '4_TEMPERATURE') && (
          <div className="no-data-message">
            <svg className="no-data-icon" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
              />
            </svg>
            <span>No data available for this dashboard</span>
          </div>
        )}
        {(type === '3_EQUILIBRAGE') && (
           <div className="field-chart-container">
            <iframe
                src="http://electricwave.ma/energymonitoring/dashboard/view&id=53&apikey=3ddd9a580253f6c9aab6298f754cf0fd&embed=1"
                width="100%"
                height="450"
                frameborder="0"
                scrolling="no"
            >
            </iframe>
          </div>
        )}
        {(type === '6_MULTIGRANDEURS' && (
          
            <iframe
              src="http://electricwave.ma/energymonitoring/dashboard/view&id=55&apikey=3ddd9a580253f6c9aab6298f754cf0fd&embed=1"
              width="100%"
              height="640"
              frameborder="0"
              scrolling='nom'
            >
            </iframe>
        
        ))}
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
                />
              </div>
            </div>
            <div className="feeds-chart-container-consommation">
              <div className="consumption-chart">
                <h2 className="consumption-title">debit Inst :</h2>
                <iframe
                  src="http://electricwave.ma/energymonitoring/vis/realtime?embed=1&feedid=1696&colour=f70808&initzoom=1&apikey=3ddd9a580253f6c9aab6298f754cf0fd"
                  frameBorder="0"
                  className='iframe-consommation'
                  scrolling="no"
                ></iframe>
              </div>
              <div className="consumption-chart">
                <h2 className="consumption-title">VOLUME</h2>
                <iframe
                  src="http://electricwave.ma/energymonitoring/vis/realtime?embed=1&feedid=1719&colour=000000&initzoom=1&apikey=3ddd9a580253f6c9aab6298f754cf0fd"
                  frameBorder="0"
                  className='iframe-consommation'
                  scrolling="no"
                ></iframe>
              </div>
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
              />
            </div>
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
            <span>No data available for this dashboard</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;