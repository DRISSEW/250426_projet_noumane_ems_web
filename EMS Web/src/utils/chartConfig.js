import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';

// Enregistrer les plugins et éléments nécessaires
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, Filler);

export const createChartConfig = (data, feedName) => {
  return {
    type: 'line',
    data: {
      datasets: [
        {
          label: feedName,
          data: data,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: 'rgb(75, 192, 192)',
          pointHoverBorderColor: 'white',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            displayFormats: {
              hour: 'HH:mm',
            },
          },
          title: {
            display: true,
            text: 'Time',
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            maxRotation: 45,
            minRotation: 45,
            autoSkip: true,
            maxTicksLimit: 8,
            font: {
              size: 8,
            },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Value',
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
          ticks: {
            callback: function (value) {
              return value.toFixed(2);
            },
            font: {
              size: 8,
            },
          },
        },
      },
      plugins: {
        legend: {
          position: 'top',
          display: true,
          labels: {
            font: {
              size: 8,
            },
          },
        },
        title: {
          display: true,
          text: `Feed Data: ${feedName}`,
          font: {
            size: 10,
          },
        },
        tooltip: {
          enabled: true,
          mode: 'nearest',
          intersect: false,
          titleFont: {
            size: 8,
          },
          bodyFont: {
            size: 8,
          },
        },
      },
    },
  };
};

// Configuration pour le thème sombre
export const darkModeConfig = {
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
      },
    },
    title: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
  },
};

// Fonction pour formater les données pour le graphique
export const formatChartData = (rawData) => {
  return rawData.map(([timestamp, value]) => ({
    x: timestamp,
    y: value,
  }));
};
