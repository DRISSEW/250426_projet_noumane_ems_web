import axios from 'axios';

const BASE_URL = 'http://electricwave.ma/energymonitoring';
const API_KEY = '3ddd9a580253f6c9aab6298f754cf0fd';
const WRITE_API_KEY = '02f316fd3b4a3a52a8e3ed7a5d7d9ac2';

//recuperer la liste des tableaux de bord
export const getDashboardList = async () => {
  try {
    const targetUrl = `/dashboard/list.json?apikey=${WRITE_API_KEY}`;

    const response = await axios.get(`${targetUrl}`);

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

//recuperer les donnees d'un tableau de bord
export const getDashboardData = async (dashboardId) => {
  try {
    const targetUrl = `/dashboard/view.json?id=${dashboardId}&apikey=${WRITE_API_KEY}`;

    const response = await axios.get(`${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

//recuperer la liste des flux
export const getFeedsList = async () => {
  try {
    const cacheKey = 'feedsList';
    const cacheTTLKey = 'feedsListTTL';
    const cacheTTL = 60 * 60 * 1000; // 1 hour in milliseconds

    // Check if data exists in localStorage and is still valid
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      console.log('Returning cached feeds list');
      return JSON.parse(cachedData);
    }

    // Fetch data from the API
    const targetUrl = `/feed/list.json?apikey=${API_KEY}`;
    const response = await axios.get(targetUrl);

    // Save data to localStorage with a TTL
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return response.data;
  } catch (error) {
    console.error('Error fetching feeds list:', error);
    throw error;
  }
};

// fonction pour récupérer les données du graphique
export const getFeedData = async (feedId, timeRange, intervaldefined, skipmissing) => {
  try {
    console.log(`Fetching data for feedId: ${feedId}, timeRange: ${timeRange}`);
    const cacheKey = `feedData_${feedId}_${timeRange}`;
    const cacheTTLKey = `feedDataTTL_${feedId}_${timeRange}`;
    const cacheTTL = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if data exists in localStorage and is still valid
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      console.log(`Returning cached data for feed ${feedId}`);
      return JSON.parse(cachedData);
    }

    const now = Math.floor(Date.now() / 1000); // current time in seconds
    const timeRanges = {
      '24h': 60 * 60 * 24 + 120,
      '1w': 60 * 60 * 24 * 7 + 900,
      '1m': 60 * 60 * 24 * 30 + 3600,
      'y': 60 * 60 * 24 * 365 + 43200,
    };

    const intervalMap = {
      '24h': 120,
      '1w': 900,
      '1m': 3600,
      'y': 43200,
    };

    const duration = timeRanges[timeRange] || timeRanges['1m']; // default: 1 week
    const interval = intervaldefined || intervalMap[timeRange] || 3600;

    const end = now * 1000; // in milliseconds
    const start = (now - duration) * 1000; // also in milliseconds

    const targetUrl = `/feed/data.json?` +
      `id=${feedId}&` +
      `start=${start}&` +
      `end=${end}&` +
      `interval=${interval}&` +
      `skipmissing=${skipmissing || 1}&` +
      `limitinterval=1&` +
      `apikey=${API_KEY}`;

    const response = await axios.get(targetUrl);

    // Save data to localStorage with a TTL
    localStorage.setItem(cacheKey, JSON.stringify(response.data));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return response.data;
  } catch (error) {
    console.error(`Error fetching feed data for feed ${feedId}:`, error);
    return [];
  }
};

// Function to fetch data for specific dashboard types
export const getDashboardTypeData = async (dashboardType, timeRange) => {
  try {
    const cacheKey = `dashboardData_${dashboardType}_${timeRange}`;
    const cacheTTLKey = `dashboardDataTTL_${dashboardType}_${timeRange}`;
    const cacheTTL = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if data exists in localStorage and is still valid
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTTL = localStorage.getItem(cacheTTLKey);

    if (cachedData && cachedTTL && Date.now() < parseInt(cachedTTL, 10)) {
      console.log(`Returning cached data for dashboard ${dashboardType}`);
      return JSON.parse(cachedData);
    }

    // Calculate time range
    const now = Math.floor(Date.now() / 1000);

    // Time duration in seconds for each range
    const timeRanges = {
      '24h': 60 * 60 * 24 + 120,        // 1 day + 2 min
      '1w': 60 * 60 * 24 * 7 + 900,     // 7 days + 15 min
      '1m': 60 * 60 * 24 * 30 + 3600,   // 30 days + 1 hour
      'y': 60 * 60 * 24 * 365 + 43200   // 365 days + 12 hours
    };

    const intervalMap = {
      '24h': 120,
      '1w': 900,
      '1m': 3600,
      'y': 43200
    };

    const duration = timeRanges[timeRange] || timeRanges['1m'];
    const interval = intervalMap[timeRange] || 3600;

    const end = now * 1000; // in milliseconds
    const start = (now - duration) * 1000; // also in milliseconds

    // Dashboard configurations mapped to API names
    const dashboardConfigs = {
      '1_MULTIPUISSANCES': {
        title: 'Multi-Phase Power Consumption',
        feeds: [
          {
            id: 24,
            name: 'P_PH1',
            color: { border: 'rgb(255, 99, 132)', background: 'rgba(255, 99, 132, 0.1)' }
          },
          {
            id: 25,
            name: 'P_PH2',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          },
          {
            id: 26,
            name: 'P_PH3',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 27,
            name: 'P_TOTALE',
            color: { border: 'rgb(153, 102, 255)', background: 'rgba(153, 102, 255, 0.1)' }
          }
        ]
      },
      '2_MULTICOURANTS': {
        title: 'Multi-Phase Current',
        feeds: [
          {
            id: 149,
            name: 'i1',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
          {
            id: 150,
            name: 'i2',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 151,
            name: 'i3',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          }
        ]
      },
      '4_TEMPERATURE': {
        title: 'temperature',
        feeds: [
          {
            id: 149,
            name: 'i1',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
          {
            id: 150,
            name: 'i2',
            color: { border: 'rgb(75, 192, 192)', background: 'rgba(75, 192, 192, 0.1)' }
          },
          {
            id: 151,
            name: 'i3',
            color: { border: 'rgb(54, 162, 235)', background: 'rgba(54, 162, 235, 0.1)' }
          }
        ]
      },
      'A10_EAU EW': {
        title: 'Eau',
        feeds: [
          {
            id: 54,
            name: 'EAU EW',
            color: { border: 'rgb(255, 159, 64)', background: 'rgba(255, 159, 64, 0.1)' }
          },
        ]
      },

    };

    // Use the dashboardType directly to fetch the correct configuration
    const config = dashboardConfigs[dashboardType];
    if (!config) {
      throw new Error(`Unknown dashboard type: ${dashboardType}`);
    }

    // Fetch data for all feeds in parallel
    const feedDataPromises = config.feeds.map(async (feed) => {
      const targetUrl = `/feed/data.json?` +
        `id=${feed.id}&` +
        `start=${start}&` +
        `end=${end}&` +
        `interval=${interval}&` + // 1-hour intervals
        `skipmissing=0&` +
        `limitinterval=1&` +
        `apikey=${WRITE_API_KEY}`;

      try {
        const response = await axios.get(`${targetUrl}`);

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

    // Wait for all data to be fetched
    const datasets = await Promise.all(feedDataPromises);

    const dashboardData = {
      title: config.title,
      type: dashboardType,
      datasets: datasets,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'nearest',
          axis: 'x',
          intersect: false
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day',
              displayFormats: {
                hour: 'HH:mm',
                day: 'MMM d',
                week: 'MMM d',
                month: 'MMM yyyy'
              }
            },
            ticks: {
              maxTicksLimit: 10,
              source: 'auto'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              maxTicksLimit: 8
            }
          }
        },
        plugins: {
          decimation: {
            enabled: true,
            algorithm: 'min-max'
          }
        }
      }
    };

    // Save data to localStorage with a TTL
    localStorage.setItem(cacheKey, JSON.stringify(dashboardData));
    localStorage.setItem(cacheTTLKey, (Date.now() + cacheTTL).toString());

    return dashboardData;
  } catch (error) {
    console.error('Error in getDashboardTypeData:', error);
    return {
      type: dashboardType,
      datasets: [],
      options: {}
    };
  }
};

export const checkAvailableFeeds = async () => {
  try {
    const feeds = await getFeedsList();
    // console.log('Available feeds:', feeds);
    // This will show you all available feeds and their IDs
    return feeds;
  } catch (error) {
    console.error('Error checking feeds:', error);
    return [];
  }
};

export const getInputList = async () => {
  try {
    const targetUrl = `/input/list.json&apikey=${WRITE_API_KEY}`;
    const response = await fetch(targetUrl);

    if (!response.ok) {
      throw new Error('Failed to fetch input list');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error('Invalid input list format:', data);
      return {};
    }

    // Group inputs by nodeid
    const groupedInputs = data.reduce((acc, input) => {
      const node = input.nodeid !== undefined && input.nodeid !== null
        ? `Node ${input.nodeid}`
        : 'Node 0'; // Default to "Node 0" if nodeid is missing or invalid
      if (!acc[node]) {
        acc[node] = [];
      }
      acc[node].push(input);
      return acc;
    }, {});

    // Sort nodes numerically (e.g., Node 0, Node 1, Node 2, ...)
    const sortedNodes = Object.keys(groupedInputs)
      .sort((a, b) => {
        const nodeA = parseInt(a.replace('Node ', ''), 10);
        const nodeB = parseInt(b.replace('Node ', ''), 10);
        return nodeA - nodeB;
      })
      .reduce((sortedAcc, node) => {
        sortedAcc[node] = groupedInputs[node];
        return sortedAcc;
      }, {});

    return sortedNodes;
  } catch (error) {
    console.error('Error fetching input list:', error);
    throw error;
  }
};