import { useState, useEffect } from 'react';
import { getFeedsList, getFeedData } from '../../services/emonAPI';
import FeedChart from '../Chart/FeedChart';
import '../../styles/FeedsList.css';
import { useTranslation } from 'react-i18next';


const FeedsList = () => {
  const [feeds, setFeeds] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [timeRange, setTimeRange] = useState('1m');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [filteredFeeds, setFilteredFeeds] = useState([]); 
  const { t } = useTranslation();

  const timeRanges = {
    '24h': t('timeRanges.24h'),
    '1w': t('timeRanges.1w'),
    '1m': t('timeRanges.1m'),
    'y': t('timeRanges.y'),
    '5y': t('timeRanges.5y'),
    '10y': t('timeRanges.10y'),
  };

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const data = await getFeedsList();
        setFeeds(data);
        setFilteredFeeds(data); 
      } catch {
        setError('Failed to load feeds');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  const groupedFeeds = filteredFeeds.reduce((acc, feed) => {
    const tag = feed.tag || 'Untagged';
    acc[tag] = acc[tag] || [];
    acc[tag].push(feed);
    return acc;
  }, {});

  const toggleNode = (node) =>
    setExpandedNodes((prev) => ({ ...prev, [node]: !prev[node] }));

  const getTimeDifference = (timestamp) => {
    if (!timestamp) return { text: 'Never', isRecent: false };

    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 10) {
      return { text: 'Just now', isRecent: true };
    } else if (diff < 60) {
      return { text: `${diff} seconds ago`, isRecent: false };
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return { text: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`, isRecent: false };
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return { text: `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`, isRecent: false };
    } else {
      return { text: new Date(timestamp * 1000).toLocaleString(), isRecent: false };
    }
  };

  const handleFeedClick = async (feed, newTimeRange) => {
    try {
      setChartLoading(true);
      const data = await getFeedData(feed.id, newTimeRange || timeRange);
      if (data && Array.isArray(data) && data.length > 0) {
        setSelectedFeed({
          ...feed,
          chartData: data
        });
      } else {
        setSelectedFeed({
          ...feed,
          chartData: []
        });
      }
    } catch (error) {
      console.error('Failed to load feed data:', error);
      setSelectedFeed({
        ...feed,
        chartData: []
      });
    } finally {
      setChartLoading(false);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = feeds.filter((feed) =>
      feed.name.toLowerCase().includes(term)
    );
    setFilteredFeeds(filtered);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter' && filteredFeeds.length === 1) {
      handleFeedClick(filteredFeeds[0]);
    }
  };

  if (loading) {
    return <div className="feeds-loading">{t('Loading')}...</div>;
  }

  if (error) {
    return <div className="feeds-error">{error}</div>;
  }

  return (
    <div className="feeds-container">
      <div className="feeds-header">
        <p className="feeds-title">{t('FeedsByNodes')}</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={handleSearch}
            onKeyPress={handleSearchKeyPress}
            className="search-input"
            aria-label={t('searchPlaceholder')}
          />
        </div>

      </div>

      <div className="feeds-layout">
        <div className="feeds-sidebar">
          <div className="feeds-list">
            {Object.keys(groupedFeeds).length === 0 ? (
              <div className="feeds-empty">{t('noFeedsFound')}</div>
            ) : (
              Object.entries(groupedFeeds).map(([node, feeds]) => (
                <div key={node} className="feed-node">
                  <button
                    className="node-header"
                    onClick={() => toggleNode(node)}
                  >
                    <span className="node-title">{`${node} (${feeds.length})`}</span>
                    <span className={`expand-icon ${expandedNodes[node] ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>

                  {expandedNodes[node] && (
                    <div className="node-content">
                      {feeds.map((feed) => {
                        const updateTime = getTimeDifference(feed.time);
                        return (
                          <button
                            key={feed.id}
                            className={`feed-item ${selectedFeed?.id === feed.id ? 'selected' : ''}`}
                            onClick={() => handleFeedClick(feed)}
                          >
                            <div className="feed-item-header">
                              <span className="feed-name">{feed.name}</span>
                            </div>
                            <div className="feed-item-details">
                              <span className={`feed-value ${!feed.value ? 'no-value' : ''}`}>
                                {t('value')}: {feed.value || t('na')}
                                {feed.unit && ` ${feed.unit}`}
                              </span>
                              <span className={`feed-update ${updateTime.isRecent ? 'recent' : ''}`}>
                                {t('updated')}: {updateTime.text}
                              </span>
                              {feed.datatype && (
                                <span className="feed-type">
                                  {t('type')}: {feed.datatype}
                                </span>
                              )}
                              {feed.processList && (
                                <span className="feed-process">
                                  {t('process')}: {feed.processList}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="feeds-chart-area">
          {selectedFeed ? (
            <div className="chart-container">
              <h3 className="chart-title">{selectedFeed.name}</h3>
              <div className="time-range-selector">
                {Object.entries(timeRanges).map(([value, label]) => (
                  <button
                    key={value}
                    className={`time-range-option ${timeRange === value ? 'active' : ''}`}
                    onClick={() => {
                      setTimeRange(value);
                      handleFeedClick(selectedFeed, value);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {chartLoading ? (
                <div className="feeds-loading">{t('loadingChart')}</div>
              ) : selectedFeed.chartData && selectedFeed.chartData.length > 0 ? (
                <FeedChart
                  data={selectedFeed.chartData}
                  feedName={selectedFeed.name}
                  timeRange={timeRange}
                />
              ) : (
                <div className="no-data-message">
                  <svg className="no-data-icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11,15H13V17H11V15M11,7H13V13H11V7M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20Z"
                    />
                  </svg>
                  <span>{t('noDataAvailable')}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="no-chart-message">{t('selectFeedToView')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedsList;

