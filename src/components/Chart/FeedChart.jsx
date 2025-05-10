/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import '../../styles/feed-chart.css';
import { chartTypes } from '../../config/chartTypes.js';
import { useTranslation } from 'react-i18next';

Chart.register(zoomPlugin);

const FeedChart = ({ data, feedName, timeRange, isTimeRangeAppear = true, isFromDashboard = false }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartType, setChartType] = useState('line');
  const [isDashboard, setIsDashboard] = useState(false);
  const { t } = useTranslation();

  const filterDataByTimeRange = (inputData) => {
    if (!inputData || inputData.length === 0) return [];
    const now = new Date().getTime();
    const ranges = {
      '1h': now - 3600000,
      '24h': now - 86400000,
      '1w': now - 604800000,
      '1m': now - 2592000000,
      'y': now - 31536000000,
      '5y': now - 31536000000 * 5,
      '10y': now - 315360000000,
    };

    try {
      return inputData.filter(point => {
        if (Array.isArray(point) && point.length >= 1) {
          return point[0] >= ranges[timeRange];
        }
        return false;
      });
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  };

  const downsampleData = (data, maxPoints) => {
    if (data.length <= maxPoints) return data;
    const factor = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % factor === 0);
  };

  const downsampleBarData = (data, maxBars) => {
    if (data.length <= maxBars) return data;
    const factor = Math.ceil(data.length / maxBars);
    return data.filter((_, index) => index % factor === 0);
  };

  const handleChartTypeChange = (type) => setChartType(type);

  const calculateStats = () => {
    if (!data || data.length === 0) return { average: 'N/A', minimum: 'N/A', maximum: 'N/A', total: 'N/A' };

    let allPoints = [];

    if (Array.isArray(data) && typeof data[0] === 'object' && data[0].hasOwnProperty('data')) {
      data.forEach(d => {
        if (Array.isArray(d.data)) {
          allPoints.push(...d.data);
        }
      });
    }
    else if (Array.isArray(data) && Array.isArray(data[0])) {
      allPoints = data;
    }

    const filteredPoints = filterDataByTimeRange(allPoints);
    const allValues = filteredPoints.map(point => point[1]);

    if (allValues.length === 0) return { average: 'N/A', minimum: 'N/A', maximum: 'N/A', total: 'N/A' };

    const sum = allValues.reduce((acc, val) => acc + val, 0);
    return {
      average: (sum / allValues.length).toFixed(2),
      minimum: Math.min(...allValues).toFixed(2),
      maximum: Math.max(...allValues).toFixed(2),
      total: sum.toFixed(2)
    };
  };

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;

    let allPoints = [];

    if (Array.isArray(data) && typeof data[0] === 'object' && data[0].hasOwnProperty('data')) {
      data.forEach(dataset => {
        const points = filterDataByTimeRange(dataset.data || []);
        allPoints.push(...points);
      });
    }
    else if (Array.isArray(data) && Array.isArray(data[0])) {
      allPoints = filterDataByTimeRange(data);
    }

    const allRows = allPoints.map(point => [
      new Date(point[0]).toISOString(),
      point[1]
    ]);

    const csvContent = [['Timestamp', 'Value'], ...allRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${feedName}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (!data || !chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const defaultColors = [
      { border: 'rgba(75,192,192,1)', bg: 'rgba(75,192,192,0.2)' },
      { border: 'rgba(255,99,132,1)', bg: 'rgba(255,99,132,0.2)' },
      { border: 'rgba(54,162,235,1)', bg: 'rgba(54,162,235,0.2)' },
      { border: 'rgba(255,206,86,1)', bg: 'rgba(255,206,86,0.2)' },
      { border: 'rgba(153,102,255,1)', bg: 'rgba(153,102,255,0.2)' },
    ];

    const datasets = Array.isArray(data)
      ? (data.length > 0 && typeof data[0] === 'object' && data[0].hasOwnProperty('label') && data[0].hasOwnProperty('data'))
        ? data.map((d, i) => {
          const validData = Array.isArray(d.data)
            ? d.data.filter(point => Array.isArray(point) && point.length === 2 && typeof point[0] === 'number' && typeof point[1] === 'number')
            : [];

          const filteredData = filterDataByTimeRange(validData);

          const downsampledData = chartType === 'bar'
            ? downsampleBarData(filteredData, 70)  
            : downsampleData(filteredData, 1000);  

          const formattedData = downsampledData.map(point => ({
            x: point[0],
            y: point[1]
          }));

          if (formattedData.length > 0) setIsDashboard(true);
          let baseConfig = {
            label: d.label || `Dataset ${i + 1}`,
            data: formattedData,
            borderColor: d.borderColor || defaultColors[i % defaultColors.length].border,
            backgroundColor: d.backgroundColor || defaultColors[i % defaultColors.length].bg,
            borderWidth: 0.9,
            spanGaps: true,
            tension: 0.3,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 6,
          };

          switch (chartType) {
            case 'bar':
              baseConfig = {
                ...baseConfig,
                type: 'bar',
                borderRadius: { topLeft: 8, topRight: 8 },
                borderWidth: 1,
                borderSkipped: false,
                barPercentage: 0.8,  
                categoryPercentage: 0.9, 
              };
              break;
            default:
              break;
          }

          return baseConfig;
        })
        : (() => {
          const validData = Array.isArray(data)
            ? data.filter(point =>
              Array.isArray(point) &&
              point.length === 2 &&
              typeof point[0] === 'number' &&
              typeof point[1] === 'number'
            )
            : [];

          console.log('Single Feed chart')
          const filteredData = filterDataByTimeRange(validData);
          const downsampledData = downsampleData(filteredData, 1000);

          if (filteredData.length > 0) setIsDashboard(false);

          const formattedData = downsampledData.map(point => ({
            x: point[0],
            y: point[1]
          }));

          return [{
            label: `${feedName}`,
            data: formattedData,
            borderColor: defaultColors[0].border,
            backgroundColor: defaultColors[0].bg,
            borderWidth: 0.9,
            spanGaps: true,
            tension: 0.3,
            fill: true,
            pointRadius: 0,
            pointHoverRadius: 3,
          }];
        })()
      : [];

    const timeUnit = {
      '1h': 'minute',
      '24h': 'hour',
      '1w': 'day',
      '1m': 'day',
      '2m': 'week',
      'y': 'month',
      '5y': 'month',
      '10y': 'year',
    }[timeRange];

    Chart.register({
      id: 'customValueDisplay',
      beforeDraw(chart) {
        const { ctx, chartArea } = chart;
        const datasets = chart.data.datasets;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, chart.width, chart.height);
        ctx.clip();

        ctx.font = '10px Arial';
        ctx.fillStyle = 'rgb(126, 125, 125)';

        datasets.forEach((dataset, index) => {
          const lastDataPoint = dataset.data[dataset.data.length - 1];
          if (lastDataPoint && lastDataPoint.y !== undefined) {
            const x = chartArea.right - 100; 
            const y = chartArea.top + index * -10; 
            ctx.fillText(`${dataset.label}: ${lastDataPoint.y.toFixed(2)}`, x, y);
          }
        });

        ctx.restore();
      },
    });

    const getDataLimits = (datasets) => {
      let earliestDate = Infinity;
      let latestDate = -Infinity;

      datasets.forEach(dataset => {
        dataset.data.forEach(point => {
          if (point.x < earliestDate) earliestDate = point.x;
          if (point.x > latestDate) latestDate = point.x;
        });
      });

      return {
        min: earliestDate,
        max: Math.min(latestDate, new Date().getTime())
      };
    };

    const limits = getDataLimits(datasets);

    chartInstance.current = new Chart(ctx, {
      type: chartType === 'bar' ? 'bar' : 'line',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'nearest', axis: 'x', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              font: {
                size: 8
              },
              boxWidth: 8,
              padding: 4
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            titleFont: {
              size: 7
            },
            bodyFont: {
              size: 7
            },
            padding: 3,
            bodySpacing: 1,
            titleSpacing: 1
          },
          title: {
            display: true,
            text: feedName,
            font: {
              size: 9
            },
            padding: {
              top: 2,
              bottom: 2
            }
          },
          zoom: {
            limits: {
              x: {
                min: limits.min,
                max: limits.max,
                minRange: 1000 * 60 * 5
              }
            },
            pan: {
              enabled: true,
              mode: 'x',
              onPan: function () {
                const chart = chartInstance.current;
                const xAxis = chart.scales.x;
                if (xAxis.min < limits.min) {
                  xAxis.min = limits.min;
                }
                if (xAxis.max > limits.max) {
                  xAxis.max = limits.max;
                }
              }
            },
            zoom: {
              wheel: {
                enabled: true,
              },
              pinch: {
                enabled: true
              },
              mode: 'x',
              onZoom: function () {
                const chart = chartInstance.current;
                const xAxis = chart.scales.x;
                if (xAxis.min < limits.min) {
                  xAxis.min = limits.min;
                }
                if (xAxis.max > limits.max) {
                  xAxis.max = limits.max;
                }
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: { unit: timeUnit },
            ticks: {
              source: 'auto',
              font: {
                size: 7
              },
              maxRotation: 0,
              autoSkip: true,
              padding: 2
            },
            adapters: { date: { locale: enUS } },
            min: limits.min,
            max: limits.max,
            bounds: 'data',
            grid: {
              display: true,
              drawBorder: true,
              lineWidth: 0.5
            }
          },
          y: {
            beginAtZero: false,
            ticks: {
              font: {
                size: 7
              },
              padding: 2,
              callback: function (value) {
                return value;
              },
            },
            grid: {
              display: true,
              drawBorder: true,
              lineWidth: 0.5
            }
          },
        },
      },
    });

    return () => {
      if (chartInstance) {
        chartInstance.current.destroy();
      }
    };
  }, [data, chartType, timeRange]);

  const stats = calculateStats();

  return (
    <div className="feed-chart-container">
      <div className="chart-header">
        <div className="chart-controls">
          <div className="chart-actions">
            <button
              className="action-button export-button"
              onClick={handleExportCSV}
              title={t('exportCSV')}
            >
              <svg className="action-button-icon" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="chart-type-selector">
          {chartTypes.map((type) => (
            <button key={type.id} className={`chart-type-option ${chartType === type.id ? 'active' : ''}`}
              onClick={() => handleChartTypeChange(type.id)}
              title={type.description}
            >
              <img src={type.icon} alt={type.name} className="chart-type-icon" />
              <span className={'chart-type-name'}>{type.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className={`chart-wrapper ${isFromDashboard ? 'chart-From-Dash' : ''}`}>
        <canvas ref={chartRef} />
      </div>
      {!isDashboard && isTimeRangeAppear && (
        <div className="chart-stats">
          <div className="stat-block">
            <div className="stat-label">{t('chartStats.average')}</div>
            <div className="stat-value">{stats.average}</div>
          </div>
          <div className="stat-block">
            <div className="stat-label">{t('chartStats.minimum')}</div>
            <div className="stat-value">{stats.minimum}</div>
          </div>
          <div className="stat-block">
            <div className="stat-label">{t('chartStats.maximum')}</div>
            <div className="stat-value">{stats.maximum}</div>
          </div>
          <div className="stat-block">
            <div className="stat-label">{t('chartStats.total')}</div>
            <div className="stat-value">{stats.total}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedChart;