/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { getCurrentApiKeys } from '../../services/emonAPI';
import '../../styles/WaterCharts.css';

const CHART_CONFIGS = {
    debitInst: {
        feedId: 1696,
        color: '#f70808',
        title: 'DEBIT INST',
        interval: 0  
    },
    volume: {
        feedId: 1719,
        color: '#000000',
        title: 'VOLUME',
        interval: 0,
        maxValue: 25000,
        roundTo: 20000 
    }
};

const TIME_RANGES = {
    both: [
        { label: '1h', value: 60 },
        { label: '30m', value: 30 },
        { label: '15m', value: 15 },
        { label: '5m', value: 5 },
        { label: '1m', value: 1 }
    ]
};

const WaterCharts = () => {
    const [selectedRanges, setSelectedRanges] = useState({
        debitInst: 15,
        volume: 15
    });
    const [chartData, setChartData] = useState({
        debitInst: { labels: [], datasets: [] },
        volume: { labels: [], datasets: [] }
    });

    const { API_KEY } = getCurrentApiKeys();

    const fetchChartData = async (feedId, minutes, chartType) => {
        const now = Math.floor(Date.now() / 1000);
        const start = now - (minutes * 60);

        try {
            const response = await fetch(
                `http://electricwave.ma/energymonitoring/feed/data.json?` +
                `id=${feedId}&` +
                `start=${start * 1000}&` +
                `end=${now * 1000}&` +
                `interval=${CHART_CONFIGS[chartType].interval}&` +
                `skipmissing=1&` + 
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

    const calculateYAxisConfig = (data, chartType, minutes) => {
        if (chartType === 'debitInst') {
            const values = data.map(point => point[1] || 0);
            const maxValue = Math.max(...values);

            const roundedMax = Math.ceil(maxValue * 10) / 10;

            return {
                min: 0,
                max: Math.max(roundedMax, 0.3),
                step: 0.05 
            };
        }

        if (chartType === 'volume') {
            const values = data.map(point => point[1] || 0);
            const maxValue = Math.max(...values);
            const roundedMax = Math.min(25000, Math.ceil(maxValue / 5000) * 5000);

            return {
                min: 0,
                max: roundedMax,
                step: 5000
            };
        }

        return { min: 0, max: 100, step: 20 };
    };

    const updateChartData = async (chartType) => {
        const feedId = CHART_CONFIGS[chartType].feedId;
        const minutes = selectedRanges[chartType];
        const data = await fetchChartData(feedId, minutes, chartType);

        const yAxisConfig = calculateYAxisConfig(data, chartType, minutes);

        const processedData = data.map(point => [
            point[0],
            point[1] === null ? 0 : point[1]
        ]);

        const chartData = {
            labels: processedData.map(point => new Date(point[0]).toLocaleTimeString()),
            datasets: [{
                label: CHART_CONFIGS[chartType].title,
                data: processedData.map(point => point[1]),
                borderColor: CHART_CONFIGS[chartType].color,
                backgroundColor: `${CHART_CONFIGS[chartType].color}33`,
                fill: true,
                tension: 0.4,
                pointRadius: 0
            }]
        };

        setChartData(prev => ({
            ...prev,
            [chartType]: {
                ...chartData,
                yAxisConfig
            }
        }));
    };

    useEffect(() => {
        updateChartData('debitInst');
        updateChartData('volume');

        const interval = setInterval(() => {
            updateChartData('debitInst');
            updateChartData('volume');
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedRanges]);

    const handleTimeRangeChange = (chartType, value) => {
        setSelectedRanges(prev => ({
            ...prev,
            [chartType]: value
        }));
    };

    const getChartOptions = (chartType) => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        spanGaps: true,
        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            y: {
                beginAtZero: true,
                grace: '5%',
                min: 0,
                max: chartType === 'debitInst'
                    ? chartData[chartType]?.yAxisConfig?.max
                    : (chartData[chartType]?.yAxisConfig?.max || 100),
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    count: 7, 
                    autoSkip: false,
                    callback: function (value) {
                        if (chartType === 'debitInst') {
                            return value.toFixed(2); 
                        }
                        return value.toFixed(0);
                    }
                }
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function (context) {
                        if (chartType === 'debitInst') {
                            return `Debit: ${context.raw.toFixed(2)}`;
                        }
                        return `${context.raw}`;
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.4,
                borderWidth: chartType === 'debitInst' ? 2 : 1
            },
            point: {
                radius: 0
            }
        }
    });

    return (
        <div className="water-charts">
            <div className="chart-container-water">
                <div className="chart-header">
                    <h5>{CHART_CONFIGS.debitInst.title}</h5>
                    <div className="time-selector">
                        {TIME_RANGES.both.map(range => (
                            <button
                                key={range.value}
                                className={`time-btn ${selectedRanges.debitInst === range.value ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('debitInst', range.value)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-wrapper">
                    <Line
                        data={chartData.debitInst}
                        options={getChartOptions('debitInst')}
                        height={250}
                    />
                </div>
            </div>

            <div className="chart-container-water">
                <div className="chart-header">
                    <h5>{CHART_CONFIGS.volume.title}</h5>
                    <div className="time-selector">
                        {TIME_RANGES.both.map(range => (
                            <button
                                key={range.value}
                                className={`time-btn ${selectedRanges.volume === range.value ? 'active' : ''}`}
                                onClick={() => handleTimeRangeChange('volume', range.value)}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chart-wrapper">
                    <Line
                        data={chartData.volume}
                        options={getChartOptions('volume')}
                        height={250}
                    />
                </div>
            </div>
        </div>
    );
};

export default WaterCharts;