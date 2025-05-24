/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getCurrentApiKeys } from '../../services/emonAPI';
import '../../styles/InstantaneCharts.css';

const CHART_CONFIGS = {
    ctm01: {
        puissanceTotal: {
            feedId: 27,
            color: '#ff8000',
            title: 'PUISSANCE TOTALE INST',
            maxValue: 5000
        },
        tension: {
            feedId: 28,
            color: '#cece00',
            title: 'TENSION INST',
            maxValue: 400
        }
    },
    nfis01: {
        puissanceTotal: {
            feedId: 1238,
            color: '#ff8000',
            title: 'PUISSANCE TOTALE INST',
            maxValue: 550000
        },
        tension: {
            feedId: 1240,
            color: '#cece00',
            title: 'TENSION INST',
            maxValue: 400
        }
    }
};

const TIME_RANGES = {
    puissanceTotal: [
        { label: '1h', value: 60 },
        { label: '30m', value: 30 },
        { label: '15m', value: 15 },
        { label: '5m', value: 5 },
        { label: '1m', value: 1 }
    ],
    tension: [
        { label: '1h', value: 60 },
        { label: '30m', value: 30 },
        { label: '15m', value: 15 },
        { label: '5m', value: 5 },
        { label: '1m', value: 1 }
    ]
};

const InstantaneCharts = () => {
    const [selectedRanges, setSelectedRanges] = useState({
        puissanceTotal: 15,
        tension: 15
    });
    const [chartData, setChartData] = useState({
        puissanceTotal: { labels: [], datasets: [] },
        tension: { labels: [], datasets: [] }
    });

    const username = localStorage.getItem('username') || 'ctm01';
    const { API_KEY } = getCurrentApiKeys();
    const config = CHART_CONFIGS[username];

    const fetchChartData = async (feedId, minutes) => {
        const now = Math.floor(Date.now() / 1000);
        const start = now - (minutes * 60);
        const interval = Math.max(1, Math.floor((minutes * 60) / 200)); 

        try {
            const response = await fetch(
                `http://electricwave.ma/energymonitoring/feed/data.json?` +
                `id=${feedId}&` +
                `start=${start * 1000}&` +
                `end=${now * 1000}&` +
                `interval=${interval}&` +
                `skipmissing=0&` +
                `limitinterval=1&` +
                `apikey=${API_KEY}`
            );
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            return [];
        }
    };

    const updateChartData = async (chartType) => {
        const feedId = config[chartType].feedId;
        const minutes = selectedRanges[chartType];
        const data = await fetchChartData(feedId, minutes);

        const yAxisConfig = calculateYAxisConfig(data, chartType);

        const chartData = {
            labels: data.map(point => new Date(point[0]).toLocaleTimeString()),
            datasets: [{
                label: config[chartType].title,
                data: data.map(point => point[1]),
                borderColor: config[chartType].color,
                backgroundColor: `${config[chartType].color}33`,
                fill: true,
                tension: 0.1,
                pointRadius: 0
            }],
            yAxisConfig 
        };

        setChartData(prev => ({
            ...prev,
            [chartType]: chartData
        }));
    };

    const calculateYAxisConfig = (data, chartType) => {
        if (!data || data.length === 0) {
            return {
                min: 0,
                max: config[chartType].maxValue,
                step: config[chartType].maxValue / 10
            };
        }

        const values = data.map(point => point[1] || 0);
        const maxValue = Math.max(...values);
        const configMaxValue = config[chartType].maxValue;

        if (username === 'nfis01' && chartType === 'puissanceTotal') {
            const roundedMax = Math.ceil(maxValue / 5000) * 5000;
            const max = Math.min(configMaxValue, Math.max(roundedMax, 5000));
            return {
                min: 0,
                max,
                step: 5000
            };
        }

        const roundedMax = Math.ceil(maxValue / 100) * 100;
        const max = Math.min(configMaxValue, Math.max(roundedMax, configMaxValue / 2));
        return {
            min: 0,
            max,
            step: max / 10
        };
    };

    useEffect(() => {
        updateChartData('puissanceTotal');
        updateChartData('tension');

        const interval = setInterval(() => {
            updateChartData('puissanceTotal');
            updateChartData('tension');
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedRanges]);

    const handleTimeRangeChange = (chartType, value) => {
        setSelectedRanges(prev => ({
            ...prev,
            [chartType]: value
        }));
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        spanGaps: true,
        scales: {
            x: {
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                grace: '5%',
                min: 0,
                max: (context) => {
                    const chartType = context.chart.data.datasets[0]?.label?.includes('PUISSANCE')
                        ? 'puissanceTotal'
                        : 'tension';
                    return chartData[chartType]?.yAxisConfig?.max || config[chartType].maxValue;
                },
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    stepSize: (context) => {
                        const chartType = context.chart.data.datasets[0]?.label?.includes('PUISSANCE')
                            ? 'puissanceTotal'
                            : 'tension';
                        
                        if (username === 'nfis01' && chartType === 'puissanceTotal') {
                            return 20000;
                        }
                        return chartType === 'tension' ? 50 : 100;
                    },
                    autoSkip: false,
                    font: {
                        size: 11
                    },
                    callback: function(value) {
                        const chartType = this.chart.data.datasets[0]?.label?.includes('PUISSANCE')
                            ? 'puissanceTotal'
                            : 'tension';

                        if (username === 'nfis01' && chartType === 'puissanceTotal') {
                            return value.toFixed(0);
                        }

                        if (chartType === 'tension') {
                            return value.toFixed(0);
                        } else {
                            return value.toFixed(0);
                        }
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            }
        },
        elements: {
            line: {
                tension: 0.4
            }
        }
    };

    return (
        <div className="instantane">
            <div className="chart-container-inst">
                <div className="chart-header">
                    <h5>{config.puissanceTotal.title}</h5>
                    <div className="time-selector">
                        {TIME_RANGES.puissanceTotal.map(range => (
                            <button
                                key={range.value}
                                className={`time-btn ${selectedRanges.puissanceTotal === range.value ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('puissanceTotal', range.value)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-wrapper">
                    <Line data={chartData.puissanceTotal} options={chartOptions} height={250} />
                </div>
            </div>

            <div className="chart-container-inst">
                <div className="chart-header">
                    <h5>{config.tension.title}</h5>
                    <div className="time-selector">
                        {TIME_RANGES.tension.map(range => (
                            <button
                                key={range.value}
                                className={`time-btn ${selectedRanges.tension === range.value ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('tension', range.value)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-wrapper">
                    <Line data={chartData.tension} options={chartOptions} height={250} />
                </div>
            </div>
        </div>
    );
};

export default InstantaneCharts;