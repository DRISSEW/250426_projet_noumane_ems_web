import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/PieChartPuissance.css';
import { parse } from 'date-fns';

const PieChartPuissance = () => {
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.getAttribute('data-theme') === 'dark'
    );

    const [phaseValues, setPhaseValues] = useState([0, 0, 0]);

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const getLastValidValue = (dataset) => {
        // Start from the end of the array and find first valid point
        for (let i = dataset.data.length - 1; i >= 0; i--) {
            const point = dataset.data[i];
            if (point && Array.isArray(point) && point[1] !== null) {
                return point[1];
            }
        }
        return 0; // Return 0 if no valid points found
    };

    useEffect(() => {
        const getLastValues = () => {
            const cacheKey = `dashboardData_1_MULTIPUISSANCES_1m`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);

                    if (parsedData?.datasets && Array.isArray(parsedData.datasets)) {
                        const powerData = parsedData.datasets
                            .filter(dataset => dataset.label.startsWith('P_PH'))
                            .slice(0, 3);

                        const values = powerData.map(dataset => getLastValidValue(dataset));

                        if (values.length === 3 && values.some(v => v !== 0)) {
                            setPhaseValues(values);
                        }
                    }
                } catch (error) {
                    console.error('Error parsing pie chart data:', error);
                }
            }
        };

        getLastValues();
    }, []);


    const pieData = {
        labels: ['Phase 1', 'Phase 2', 'Phase 3'],
        datasets: [
            {
                data: phaseValues,
                backgroundColor: [
                    'rgba(72, 207, 173, 0.9)',  // Green
                    'rgba(255, 99, 132, 0.9)',  // Red
                    'rgba(86, 249, 255, 0.9)',  // Yellow
                ],
                borderColor: [
                    'rgb(5, 160, 121)',
                    'rgb(202, 25, 63)',
                    'rgba(4, 189, 195, 0.9)',
                ],
                borderWidth: 2,
            },
        ],
    };

    console.log(pieData)
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
                text: 'Distribution des Puissances',
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
                titleColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : '#333',
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
                        return `${context.label}: ${value.toFixed(2)}kW (${percentage}%)`;
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

export default PieChartPuissance;