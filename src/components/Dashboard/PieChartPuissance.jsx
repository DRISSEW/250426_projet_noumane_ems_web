import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/PieChartPuissance.css';

const PieChartPuissance = () => {
    const [phaseValues, setPhaseValues] = useState([0, 0, 0]);

    useEffect(() => {
        const getLastValues = () => {
            const cacheKey = `dashboardData_1_MULTIPUISSANCES_1m`;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const parsedData = JSON.parse(cachedData);

                    // Ensure we have datasets and they contain data
                    if (parsedData?.datasets && Array.isArray(parsedData.datasets)) {
                        // Get only P_PH1, P_PH2, and P_PH3 data
                        const powerData = parsedData.datasets
                            .filter(dataset => dataset.label.startsWith('P_PH'))
                            .slice(0, 3);

                        const values = powerData.map(dataset => {
                            const lastPoint = dataset.data[dataset.data.length - 1];
                            return lastPoint && Array.isArray(lastPoint) ? lastPoint[1] : 0;
                        });

                        // Only update if we have valid values
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

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#333',  // Default dark color
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
                color: '#333',  // Default dark color
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