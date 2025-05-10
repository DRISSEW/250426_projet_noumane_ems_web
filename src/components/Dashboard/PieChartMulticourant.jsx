import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/PieChartPuissance.css';
import { getDashboardType } from '../../services/emonAPI';

const PieChartMulticourant = () => {
    const [currentValues, setCurrentValues] = useState([0, 0, 0]);
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.getAttribute('data-theme') === 'dark'
    );

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const getLastValues = () => {
            const dashboardType = getDashboardType('multicourants');
            const cacheKey = `dashboardData_${dashboardType}_1m`;
            const cachedData = localStorage.getItem(cacheKey);
            const username = localStorage.getItem('username');

            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);
                    console.log('Raw parsed data:', parsedData);

                    if (parsedData?.datasets && Array.isArray(parsedData.datasets)) {
                        // Filter and sort datasets based on user account
                        const currentData = parsedData.datasets
                            .filter(dataset => {
                                const label = dataset.label.toLowerCase();
                                if (username === 'nfis01') {
                                    return (label === 'i1' || label === 'i2' || label === 'i3') ||
                                        (label === 'i1' || label === 'i2' || label === 'i3');
                                } else {
                                    // Default ctm01 behavior
                                    return (label === 'i1' || label === 'i2' || label === 'i3') &&
                                        !label.includes('inst');
                                }
                            })
                            .sort((a, b) => {
                                const order = username === 'nfis01'
                                    ? { 'i1': 0, 'i2': 1, 'i3': 2 }
                                    : { 'i1': 0, 'i2': 1, 'i3': 2 };
                                return order[a.label.toLowerCase()] - order[b.label.toLowerCase()];
                            });

                        console.log('Filtered and sorted currentData:', currentData);

                        // Extract values for each current
                        const values = currentData.map(dataset => {
                            const dataPoints = dataset.data || [];
                            console.log(`Processing ${dataset.label} with ${dataPoints.length} points`);

                            // Find the last valid data point
                            const validPoint = [...dataPoints]
                                .reverse()
                                .find(point => {
                                    const isValid = Array.isArray(point) &&
                                        point.length >= 2 &&
                                        !isNaN(point[1]) &&
                                        point[1] !== null;
                                    if (!isValid) {
                                        console.log(`Invalid point in ${dataset.label}:`, point);
                                    }
                                    return isValid;
                                });

                            const value = validPoint ? validPoint[1] : 0;
                            console.log(`Value for ${dataset.label}:`, value);
                            return value;
                        });

                        console.log('Final values array:', values);

                        // Update state if we have valid values
                        if (values.length === 3) {
                            setCurrentValues(values);
                        } else {
                            console.log('Not updating values - incorrect number of values:', values.length);
                        }
                    }
                } catch (error) {
                    console.error('Error processing multicourant data:', error);
                }
            } else {
                console.log('No cached data found for key:', cacheKey);
            }
        };

        // Initial fetch
        getLastValues();
    }, []);

    // Debug log after state updates
    useEffect(() => {
        console.log('Current values updated:', currentValues);
    }, [currentValues]);

    const pieData = {
        labels: ['Courant 1', 'Courant 2', 'Courant 3'],
        datasets: [
            {
                data: currentValues,
                backgroundColor: [
                    'rgba(54, 235, 232, 0.9)',  // Blue
                    'rgb(239, 99, 129)', // Purple
                    'rgb(53, 152, 218)',  // Orange
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgb(244, 44, 87)',
                    'rgb(0, 104, 174)',
                ],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
                    font: {
                        size: 12,
                        weight: '600'
                    },
                    padding: 15,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            title: {
                display: true,
                text: 'Distribution des Courants',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Segoe UI', sans-serif"
                },
                padding: 20
            },
            tooltip: {
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : '#fff',
                titlecolor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
                bodyColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#666',
                bodyFont: {
                    size: 13
                },
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (context) => {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `${context.label}: ${value.toFixed(2)}A (${percentage}%)`;
                    }
                }
            }
        }
    };

    return (
        <div className="pie-chart-container">
            <Pie data={pieData} options={options} />
        </div>
    );
};

export default PieChartMulticourant;