import React, { useState, useEffect } from 'react';
import '../../styles/EquilibrageVisual.css';

const ModulesVisual = () => {
    const [currentValues, setCurrentValues] = useState({
        i1ref: 0,
        i1: 0,
        i2: 0,
        i3: 0
    });

    const MAX_CURRENT = 15;

    const fetchCurrentValues = async () => {
        try {
            const apiKey = '3ddd9a580253f6c9aab6298f754cf0fd';
            const baseUrl = 'http://electricwave.ma/energymonitoring/feed/value.json';

            const [i1refResponse, i1Response, i2Response, i3Response] = await Promise.all([
                fetch(`${baseUrl}?id=149&apikey=${apiKey}`), 
                fetch(`${baseUrl}?id=498&apikey=${apiKey}`), 
                fetch(`${baseUrl}?id=500&apikey=${apiKey}`),  
                fetch(`${baseUrl}?id=501&apikey=${apiKey}`)  
            ]);

            const [i1refData, i1Data, i2Data, i3Data] = await Promise.all([
                i1refResponse.json(),
                i1Response.json(),
                i2Response.json(),
                i3Response.json()
            ]);

            setCurrentValues({
                i1ref: parseFloat(i1refData).toFixed(2),
                i1: parseFloat(i1Data).toFixed(2),
                i2: parseFloat(i2Data).toFixed(2),
                i3: parseFloat(i3Data).toFixed(2)
            });

        } catch (error) {
            console.error('Error fetching current values:', error);
        }
    };

    useEffect(() => {
        fetchCurrentValues();
        const interval = setInterval(fetchCurrentValues, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="equilibrage-container">
            <div className="current-boxes">
                <div className="current-box">
                    <div className="current-label">I1ref</div>
                    <div className="current-value">{currentValues.i1ref}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i1ref) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i1ref) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : '#ff4444'
                        }}
                    />
                </div>
                <div className="current-box current-box-negative">
                    <div className="current-label">I1_TC1200A</div>
                    <div className="current-value">{currentValues.i1}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i1) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i1) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : '#ff69b4'
                        }}
                    />
                </div>
                <div className="current-box current-box-negative">
                    <div className="current-label">I2_TC1200A</div>
                    <div className="current-value">{currentValues.i2}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i2) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i2) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : '#0099cc'
                        }}
                    />
                </div>
                <div className="current-box current-box-negative">
                    <div className="current-label">I3_TC1200A</div>
                    <div className="current-value">{currentValues.i3}A</div>
                    <div
                        className="current-fill"
                        style={{
                            height: `${(parseFloat(currentValues.i3) / MAX_CURRENT) * 100}%`,
                            backgroundColor: parseFloat(currentValues.i3) > (MAX_CURRENT * 0.8) ?
                                'var(--warning-color)' : '#9933cc'
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ModulesVisual;