import React, { useState, useEffect } from 'react';
import '../../styles/EquilibrageVisual.css';

const EquilibrageVisual = () => {
    const [currentValues, setCurrentValues] = useState({
        i1: 0,
        i2: 0,
        i3: 0
    });

    const MAX_CURRENT = 25; // Maximum current value in Amperes

    const fetchCurrentValues = async () => {
        try {
            const apiKey = '3ddd9a580253f6c9aab6298f754cf0fd';
            const baseUrl = 'http://electricwave.ma/energymonitoring/feed/value.json';

            // Fetch all values in parallel
            const [i1Response, i2Response, i3Response] = await Promise.all([
                fetch(`${baseUrl}?id=149&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=150&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=151&apikey=${apiKey}`)
            ]);

            const [i1Data, i2Data, i3Data] = await Promise.all([
                i1Response.json(),
                i2Response.json(),
                i3Response.json()
            ]);
            setCurrentValues({
                i1: parseFloat(i1Data).toFixed(2),
                i2: parseFloat(i2Data).toFixed(2),
                i3: parseFloat(i3Data).toFixed(2)
            });

        } catch (error) {
            console.error('Error fetching current values:', error);
        }
    };

    useEffect(() => {
        // Fetch immediately when component mounts
        fetchCurrentValues();

        // Set up interval for subsequent fetches
        const interval = setInterval(fetchCurrentValues, 2000);

        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, []); // Empty dependency array ensures this only runs once on mount

    return (
        <div className="equilibrage-container">
            <div className="current-boxes">
                <div className="current-box">
                    <div className="current-label">I1</div>
                    <div className="current-value">{currentValues.i1}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i1) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i1) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : 'var(--primary-color)'
                        }}
                    />
                </div>
                <div className="current-box">
                    <div className="current-label">I2</div>
                    <div className="current-value">{currentValues.i2}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i2) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i2) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : 'var(--primary-color)'
                        }}
                    />
                </div>
                <div className="current-box">
                    <div className="current-label">I3</div>
                    <div className="current-value">{currentValues.i3}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i3) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i3) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : 'var(--primary-color)'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default EquilibrageVisual;