import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import '../../styles/ConsumptionDashboard.css';

const ConsumptionDashboard = () => {
    // State to store raw consumption data from API
    const [consumptionData, setConsumptionData] = useState([]);

    // State to store processed statistics
    const [stats, setStats] = useState({
        dailyAvg: 0,
        monthlyAvg: 0,
        yearlyTotal: 0,
        monthlyData: []
    });

    /**
     * Fetches consumption data from the API
     * Endpoint returns daily consumption values for the specified time period
     */
    const fetchConsumptionData = async () => {
        try {
            const response = await fetch(
                'http://electricwave.ma/energymonitoring/feed/data.json?id=1246&start=1714863600000&end=1746486000000&interval=86400&skipmissing=0&limitinterval=1&apikey=3ddd9a580253f6c9aab6298f754cf0fd'
            );
            const data = await response.json();
            setConsumptionData(data);
            processData(data);
        } catch (error) {
            console.error('Error fetching consumption data:', error);
        }
    };

    /**
     * Processes raw consumption data into monthly statistics
     * Converts Wh to kWh by dividing by 1000
     * @param {Array} data - Array of [timestamp, value] pairs from API
     */
    const processData = (data) => {
        const months = {};
        let totalConsumption = 0;
        let dayCount = 0;
        const COST_PER_KWH = 1.7;
        const WH_TO_KWH = 1000;


        // Group data by months and calculate daily readings
        data.forEach(([timestamp, value]) => {
            if (value !== null) {
                const date = new Date(timestamp);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                // Convert each daily value from Wh to kWh immediately
                const dailyKWh = parseFloat(value) / WH_TO_KWH;

                // Debug: Log daily values
                console.log(`Date: ${date}, Raw Value (Wh): ${value}, Converted (kWh): ${dailyKWh}`);

                if (!months[monthKey]) {
                    months[monthKey] = {
                        totalKWh: 0,        // Store directly in kWh
                        days: 0,
                        readings: []
                    };
                }

                // Store already converted kWh values
                months[monthKey].totalKWh += dailyKWh;
                months[monthKey].readings.push(dailyKWh);
                months[monthKey].days++;
                dayCount++;
            }
        });

        // Calculate monthly data (values are already in kWh)
        const monthlyData = Object.entries(months).map(([key, data]) => {
            // Use the total kWh directly
            const monthlyConsumption = data.totalKWh;
            totalConsumption += monthlyConsumption;

            // Debug: Log monthly values
            console.log(`Month: ${key}, Total kWh: ${monthlyConsumption}`);

            // Calculate cost
            const monthlyCost = monthlyConsumption * COST_PER_KWH;

            return {
                month: key,
                consumption: parseFloat(monthlyConsumption.toFixed(2)),
                cost: parseFloat(monthlyCost.toFixed(2))
            };
        });

        // Sort months chronologically
        monthlyData.sort((a, b) => a.month.localeCompare(b.month));

        // Debug: Log final processed data
        console.log('Processed Monthly Data:', monthlyData);

        setStats({
            dailyAvg: (totalConsumption / dayCount).toFixed(2),
            monthlyAvg: (totalConsumption / monthlyData.length).toFixed(2),
            yearlyTotal: totalConsumption.toFixed(2),
            monthlyData
        });
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchConsumptionData();
    }, []);

    /**
     * Creates data structure for pie charts
     * @param {string} type - Either 'consumption' or 'cost'
     * @returns {Object} Chart.js data object
     */
    const createPieData = (type) => ({
        labels: stats.monthlyData.map(item => {
            const [year, month] = item.month.split('-');
            return new Date(year, month - 1).toLocaleString('default', { month: 'long' });
        }),
        datasets: [{
            data: stats.monthlyData.map(item => type === 'consumption' ? item.consumption : item.cost),
            backgroundColor: [
                '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
                '#FF9F40', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                '#9966FF', '#FF9F40'
            ],
            borderWidth: 1
        }]
    });

    /**
     * Creates configuration options for pie charts
     * @param {string} title - Chart title
     * @returns {Object} Chart.js options object
     */
    const pieOptions = (title) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: { size: 11 }
                }
            },
            title: {
                display: true,
                text: title,
                font: { size: 16 }
            }
        }
    });

    return (
        <div className="consumption-dashboard">
            <div className="stats-container">
                <div className="stat-card">
                    <h3>Daily Average</h3>
                    <p>{stats.dailyAvg} kWh</p>
                    <p className="cost">{(parseFloat(stats.dailyAvg) * 1.7).toFixed(2)} DH</p>
                </div>
                <div className="stat-card">
                    <h3>Monthly Average</h3>
                    <p>{stats.monthlyAvg} kWh</p>
                    <p className="cost">{(parseFloat(stats.monthlyAvg) * 1.7).toFixed(2)} DH</p>
                </div>
                <div className="stat-card">
                    <h3>Yearly Total</h3>
                    <p>{stats.yearlyTotal} kWh</p>
                    <p className="cost">{(parseFloat(stats.yearlyTotal) * 1.7).toFixed(2)} DH</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-wrapper">
                    <Pie
                        data={createPieData('consumption')}
                        options={pieOptions('Monthly Consumption (kWh)')}
                    />
                </div>
                <div className="chart-wrapper">
                    <Pie
                        data={createPieData('cost')}
                        options={pieOptions('Monthly Cost (DH)')}
                    />
                </div>
            </div>

            <div className="monthly-breakdown">
                <h3>Monthly Breakdown</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Consumption (kWh)</th>
                                <th>Cost (DH)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.monthlyData.map(item => (
                                <tr key={item.month}>
                                    <td>{new Date(item.month.split('-')[0], item.month.split('-')[1] - 1)
                                        .toLocaleString('default', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td>{item.consumption.toFixed(2)}</td>
                                    <td>{item.cost.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ConsumptionDashboard;