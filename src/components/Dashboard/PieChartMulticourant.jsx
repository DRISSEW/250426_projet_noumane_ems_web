import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/PieChartPuissance.css';

const PieChartMulticourant = () => {
    const [currentValues, setCurrentValues] = useState([0, 0, 0]);

    useEffect(() => {
        const getLastValues = () => {
            const cacheKey = `dashboardData_2_MULTICOURANTS_1m`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);
                    
                    if (parsedData?.datasets && Array.isArray(parsedData.datasets)) {
                        // Get current data and sort to ensure correct order (I1, I2, I3)
                        const currentData = parsedData.datasets
                            .filter(dataset => dataset.label.includes('i'))
                            .filter(dataset => !dataset.label.includes('INST'))
                            .sort((a, b) => a.label.localeCompare(b.label))
                            .slice(0, 3);

                        console.log('Filtered currentData:', currentData);

                        // Extract the last valid value from each dataset
                        const values = currentData.map(dataset => {
                            // Get the last data point that has a valid value
                            const validPoint = dataset.data
                                .slice()
                                .reverse()
                                .find(point => Array.isArray(point) && !isNaN(point[1]));

                            console.log(`Last valid point for ${dataset.label}:`, validPoint);
                            return validPoint ? validPoint[1] : 0;
                        });

                        console.log('Extracted values:', values);

                        // Only update if we have valid values and at least one non-zero value
                        if (values.length === 3 && values.some(v => v !== 0)) {
                            setCurrentValues(values);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing multicourant pie chart data:', error);
                }
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
                    color: '#333',
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
                color: '#333',
                font: {
                    size: 16,
                    weight: 'bold',
                    family: "'Segoe UI', sans-serif"
                },
                padding: 20
            },
            tooltip: {
                backgroundColor: '#fff',
                titleColor: '#333',
                bodyColor: '#666',
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