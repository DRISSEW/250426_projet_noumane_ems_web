import axios from 'axios';

const BASE_URL = 'http://electricwave.ma/energymonitoring';

// API key configuration based on username
const API_KEYS = {
  ctm01: {
    API_KEY: '3ddd9a580253f6c9aab6298f754cf0fd',
    WRITE_API_KEY: '02f316fd3b4a3a52a8e3ed7a5d7d9ac2'
  },
  nfis01: {
    API_KEY: '2c30da3bca4699eb66c1b0d0698e137f1',
    WRITE_API_KEY: 'faf2d7a337a745078a6e7f74d856fd77'
  }
};

// Create a function to get current API keys
const getCurrentApiKeys = () => {
  const username = localStorage.getItem('username');
  return API_KEYS[username] || API_KEYS.ctm01;
};

export { getCurrentApiKeys };

const getApiKey = () => getCurrentApiKeys().API_KEY;
const getWriteApiKey = () => getCurrentApiKeys().WRITE_API_KEY;

const withBaseUrl = (url) => `${BASE_URL}${url}`;

export const getDashboardList = async () => {
  try {
    const targetUrl = `/dashboard/list.json?apikey=${getWriteApiKey()}`;

    const response = await axios.get(withBaseUrl(targetUrl));

    const dashboards = response.data.map(dashboard => ({
      id: dashboard.id,
      name: dashboard.name,
      alias: dashboard.alias,
      description: dashboard.description,
      main: dashboard.main,
      public: dashboard.public,
    }));

    return dashboards;
  } catch (error) {
    console.error('Error fetching dashboard list:', error);
    throw error;
  }
};

export const getFeedsList = async () => {
  try {
    const cacheKey = 'feedsList';
    const cacheTTLKey = 'feedsListTTL';
    const cacheTTL = 2 * 60 * 60 * 1000; // 1 hour in milliseconds

    // Check if data exists in localStorage and is still valid
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      return JSON.parse(cachedData);
    }

    // Fetch data from the API
    const targetUrl = `/feed/list.json?apikey=${getApiKey()}`;
    const response = await axios.get(withBaseUrl(targetUrl));

    // Save data to localStorage with a TTL
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return response.data;
  } catch (error) {
    console.error('Error fetching feeds list:', error);
    throw error;
  }
};

export const getFeedData = async (feedId, timeRange, intervaldefined, skipmissing) => {
  try {
    const cacheKey = `feedData_${feedId}_${timeRange}`;
    const cacheTTLKey = `feedDataTTL_${feedId}_${timeRange}`;
    const cacheTTL = 2 * 60 * 60 * 1000; 

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      return JSON.parse(cachedData);
    }

    const now = Math.floor(Date.now() / 1000); 
    const timeRanges = {
      '24h': 60 * 60 * 24 + 120,
      '1w': 60 * 60 * 24 * 7 + 900,
      '1m': 60 * 60 * 24 * 30 + 3600,
      'y': 60 * 60 * 24 * 365 + 43200,
      '5y': 60 * 60 * 24 * 365 * 5 + 86400, 
      '10y': 60 * 60 * 24 * 365 * 10 + 86400, 
    };

    const intervalMap = {
      '24h': 120,
      '1w': 900,
      '1m': 3600,
      'y': 43200,
      '5y': 43200 * 5,
      '10y': 43200 * 10,
    };

    const duration = timeRanges[timeRange] || timeRanges['1m']; 
    const interval = intervaldefined || intervalMap[timeRange] || 3600;

    const end = now * 1000; //
    const start = (now - duration) * 1000; 

    const targetUrl = `/feed/data.json?` +
      `id=${feedId}&` +
      `start=${start}&` +
      `end=${end}&` +
      `interval=${interval}&` +
      `skipmissing=${skipmissing || 1}&` +
      `limitinterval=1&` +
      `apikey=${getApiKey()}`;

    const response = await axios.get(withBaseUrl(targetUrl));

    localStorage.setItem(cacheKey, JSON.stringify(response.data));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return response.data;
  } catch (error) {
    console.error(`Error fetching feed data for feed ${feedId}:`, error);
    return [];
  }
};


const DASHBOARD_TYPE_MAPPING = {
  ctm01: {
    multipuissance: '1_MULTIPUISSANCES',
    multicourants: '2_MULTICOURANTS',
    equilibrage: '3_EQUILIBRAGE',
    temperature: '4_TEMPERATURE',
    consommation: '5_CONSOMMATION',
    multigrandeurs: '6_MULTIGRANDEURS',
    modules: '7_14 MODULES',
    currentDetection: '8_CurrentDetection',
    multidebit: '9_MULTIDEBIT',
    eau: 'A10_EAU EW'
  },
  nfis01: {
    multipuissance: '1-MULTI-PUISSANCE',
    multicourants: '2-MULTI-COURANT',
    equilibrage: '3-EQUILIBRAGE',
    temperature: '5-TEMPERATURE',
    consommation: '4-CONSOMMATION',
    multigrandeurs: '6-MULTIGRANDEURS',
  }
};

// Update the mapping to include feed IDs per user
const FEED_CONFIG = {
  ctm01: {
    feeds: {
      phase1Power: { name: 'P_PH1', id: 24 },
      phase2Power: { name: 'P_PH2', id: 25 },
      phase3Power: { name: 'P_PH3', id: 26 },
      totalPower: { name: 'P_TOTALE', id: 27 },
      current1: { name: 'i1', id: 149 },
      current2: { name: 'i2', id: 150 },
      current3: { name: 'i3', id: 151 },
      tension: { name: 'TENSION', id: 28 }
    }
  },
  nfis01: {
    feeds: {
      phase1Power: { name: 'P1', id: 1235 },
      phase2Power: { name: 'P2', id: 1236 },
      phase3Power: { name: 'P3', id: 1237 },
      totalPower: { name: 'PT', id: 1238 },
      current1: { name: 'I1', id: 1241 },
      current2: { name: 'I2', id: 1242 },
      current3: { name: 'I3', id: 1243 },
      tension: { name: 'TENSION', id: 1240 }
    }
  }
};


export const getFeedConfig = (genericName) => {
  const username = localStorage.getItem('username');
  const userConfig = FEED_CONFIG[username] || FEED_CONFIG.ctm01;
  return userConfig.feeds[genericName];
};


// Function to get current user's dashboard type
export const getDashboardType = (genericType) => {
  const username = localStorage.getItem('username');
  const userMapping = DASHBOARD_TYPE_MAPPING[username] || DASHBOARD_TYPE_MAPPING.ctm01;
  return userMapping[genericType];
};



const getDashboardConfig = () => {
  return {
    [getDashboardType('multipuissance')]: {
      title: 'Multi-Phase Power Consumption',
      feeds: [
        {
          ...getFeedConfig('phase1Power'),
          color: { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.1)' }
        },
        {
          ...getFeedConfig('phase2Power'),
          color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
        },
        {
          ...getFeedConfig('phase3Power'),
          color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
        },
        {
          ...getFeedConfig('totalPower'),
          color: { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.1)' }
        }
      ]
    },
    [getDashboardType('multicourants')]: {
      title: 'Multi-Phase Current',
      feeds: [
        {
          ...getFeedConfig('current1'),
          color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
        },
        {
          ...getFeedConfig('current2'),
          color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
        },
        {
          ...getFeedConfig('current3'),
          color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
        }
      ]
    },

  };
};

export const getDashboardTypeData = async (type, timeRange) => {
  try {
    const cacheKey = `dashboardData_${type}_${timeRange}`;
    const cacheTTLKey = `dashboardDataTTL_${type}_${timeRange}`;
    const cacheTTL = 2 * 60 * 60 * 1000;//15 minutes in milliseconds

    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      return JSON.parse(cachedData);
    }

    const now = Math.floor(Date.now() / 1000);

    const timeRanges = {
      '24h': 60 * 60 * 24 + 120,       
      '1w': 60 * 60 * 24 * 7 + 900,     
      '1m': 60 * 60 * 24 * 30 + 3600,  
      'y': 60 * 60 * 24 * 365 + 43200,
      '5y': 60 * 60 * 24 * 365 * 5 + 86400, 
      '10y': 60 * 60 * 24 * 365 * 10 + 86400,   
    };

    const intervalMap = {
      '24h': 120,
      '1w': 900,
      '1m': 3600,
      'y': 43200,
      '5y': 43200 * 5,
      '10y': 43200 * 10,
    };

    const duration = timeRanges[timeRange] || timeRanges['1m'];
    const interval = intervalMap[timeRange] || 3600;

    const end = now * 1000;
    const start = (now - duration) * 1000; 

    const dashboardConfigs = getDashboardConfig();
    const config = dashboardConfigs[type];
    if (!config) {
      throw new Error(`Unknown dashboard type: ${type}`);
    }

    const feedDataPromises = config.feeds.map(async (feed) => {
      const targetUrl = `/feed/data.json?` +
        `id=${feed.id}&` +
        `start=${start}&` +
        `end=${end}&` +
        `interval=${interval}&` + 
        `skipmissing=0&` +
        `limitinterval=1&` +
        `apikey=${getWriteApiKey()}`;

      try {
        const response = await axios.get(withBaseUrl(targetUrl));

        if (!Array.isArray(response.data)) {
          console.error(`Invalid data format for feed ${feed.name}:`, response.data);
          return {
            label: feed.name,
            data: [],
            borderColor: feed.color.border,
            backgroundColor: feed.color.background,
            pointRadius: 0,
            borderWidth: 1.5,
            tension: 0.1
          };
        }

        return {
          label: feed.name,
          data: response.data,
          borderColor: feed.color.border,
          backgroundColor: feed.color.background,
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0.1,
          fill: false
        };
      } catch (error) {
        console.error(`Error fetching ${feed.name}:`, error);
        return {
          label: feed.name,
          data: [],
          borderColor: feed.color.border,
          backgroundColor: feed.color.background,
          pointRadius: 0,
          borderWidth: 1.5,
          tension: 0.1
        };
      }
    });

    const datasets = await Promise.all(feedDataPromises);

    const dashboardData = {
      title: config.title,
      type: type,
      datasets: datasets,
    };

    localStorage.setItem(cacheKey, JSON.stringify(dashboardData));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return dashboardData;
  } catch (error) {
    console.error('Error in getDashboardTypeData:', error);
    return {
      type: type,
      datasets: [],
      options: {}
    };
  }
};
