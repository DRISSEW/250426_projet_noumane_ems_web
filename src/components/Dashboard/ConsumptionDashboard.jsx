/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import '../../styles/ConsumptionDashboard.css';
import i18n from '../../i18n';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CONSUMPTION_CONFIGS = {
    ctm01: {
        feedId: 1246,
        apiKey: '3ddd9a580253f6c9aab6298f754cf0fd'
    },
    nfis01: {
        feedId: 1245,
        apiKey: '2c30da3bca4699eb66c1b0d0698e137f1'
    }
};

const ConsumptionDashboard = () => {
    const { t } = useTranslation();
    const [consumptionData, setConsumptionData] = useState([]);
    const [isExporting, setIsExporting] = useState(false);

    const [stats, setStats] = useState({
        dailyAvg: 0,
        monthlyAvg: 0,
        yearlyTotal: 0,
        monthlyData: []
    });

    const [username, setUsername] = useState(() => {
        return localStorage.getItem('username') || 'ctm01';
    });

    const fetchConsumptionData = async () => {
        try {
            const config = CONSUMPTION_CONFIGS[username];
            if (!config) {
                console.error('Invalid username configuration');
                return;
            }

            const response = await fetch(
                `http://electricwave.ma/energymonitoring/feed/data.json?` +
                `id=${config.feedId}&` +
                `start=1731020400000&` +
                `end=1762642800000&` +
                `interval=86400&` +
                `skipmissing=0&` +
                `limitinterval=1&` +
                `apikey=${config.apiKey}`
            );
            const data = await response.json();
            setConsumptionData(data);
            processData(data);
        } catch (error) {
            console.error('Error fetching consumption data:', error);
        }
    };

    const processData = (data) => {
        const months = {};
        let totalConsumption = 0;
        let dayCount = 0;
        const COST_PER_KWH = 2.041;
        const WH_TO_KWH = 1000;

        data.forEach(([timestamp, value]) => {
            if (value !== null) {
                const date = new Date(timestamp);
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                const dailyKWh = parseFloat(value) / WH_TO_KWH;

                if (!months[monthKey]) {
                    months[monthKey] = {
                        totalKWh: 0,
                        days: 0,
                        readings: []
                    };
                }

                months[monthKey].totalKWh += dailyKWh;
                months[monthKey].readings.push(dailyKWh);
                months[monthKey].days++;
                dayCount++;
            }
        });

        const monthlyData = Object.entries(months).map(([key, data]) => {
            const monthlyConsumption = data.totalKWh;
            totalConsumption += monthlyConsumption;
            const monthlyCost = monthlyConsumption * COST_PER_KWH;

            return {
                month: key,
                consumption: parseFloat(monthlyConsumption.toFixed(2)),
                cost: parseFloat(monthlyCost.toFixed(2))
            };
        });

        monthlyData.sort((a, b) => a.month.localeCompare(b.month));
        setStats({
            dailyAvg: (totalConsumption / dayCount).toFixed(2),
            monthlyAvg: (totalConsumption / monthlyData.length).toFixed(2),
            yearlyTotal: totalConsumption.toFixed(2),
            monthlyData
        });
    };

    useEffect(() => {
        fetchConsumptionData();
    }, [username]);

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

    const generatePDF = async () => {
        try {
            const element = document.querySelector('.consumption-dashboard');
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false
            });

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imageWidth = pageWidth - 20;
            const imageHeight = (canvas.height * imageWidth) / canvas.width;

            // Add title
            pdf.setFontSize(16);
            pdf.text(
                `${t('consumption.reportTitle')} - ${username}`,
                pageWidth / 2,
                15,
                { align: 'center' }
            );

            // Add timestamp
            pdf.setFontSize(10);
            pdf.text(
                `${t('consumption.generatedOn')}: ${new Date().toLocaleDateString(i18n.language)}`,
                pageWidth / 2,
                22,
                { align: 'center' }
            );

            // Add dashboard content
            const imageData = canvas.toDataURL('image/png');
            pdf.addImage(imageData, 'PNG', 10, 30, imageWidth, imageHeight);

            // Save PDF
            await pdf.save(`consumption-report-${username}-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert(t('consumption.exportError'));
        } finally {
        }
    };

    return (
        <div className="consumption-dashboard">
            <div className="export-button-container">
                <button
                    onClick={generatePDF}
                    className={`export-pdf-button ${isExporting ? 'loading' : ''}`}
                    disabled={isExporting}
                >
                    <span className="button-content">
                        {t('consumption.exportPDF')}
                    </span>
                </button>
            </div>
            <div className="stats-container">
                <div className="stat-card">
                    <h3>{t('consumption.dailyAverage')}</h3>
                    <p>{stats.dailyAvg} kWh</p>
                    <p className="cost">{(parseFloat(stats.dailyAvg) * 1.7).toFixed(2)} DH</p>
                </div>
                <div className="stat-card">
                    <h3>{t('consumption.monthlyAverage')}</h3>
                    <p>{stats.monthlyAvg} kWh</p>
                    <p className="cost">{(parseFloat(stats.monthlyAvg) * 1.7).toFixed(2)} DH</p>
                </div>
                <div className="stat-card">
                    <h3>{t('consumption.yearlyTotal')}</h3>
                    <p>{stats.yearlyTotal} kWh</p>
                    <p className="cost">{(parseFloat(stats.yearlyTotal) * 1.7).toFixed(2)} DH</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="chart-wrapper">
                    <Pie
                        data={createPieData('consumption')}
                        options={pieOptions(t('consumption.charts.monthlyConsumption'))}
                    />
                </div>
                <div className="chart-wrapper">
                    <Pie
                        data={createPieData('cost')}
                        options={pieOptions(t('consumption.charts.monthlyCost'))}
                    />
                </div>
            </div>

            <div className="monthly-breakdown">
                <h3>{t('consumption.monthlyBreakdown')}</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('consumption.month')}</th>
                                <th>{t('consumption.consumption')}</th>
                                <th>{t('consumption.cost')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.monthlyData.map(item => (
                                <tr key={item.month}>
                                    <td>{new Date(item.month.split('-')[0], item.month.split('-')[1] - 1)
                                        .toLocaleString(i18n.language, { month: 'long', year: 'numeric' })}
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