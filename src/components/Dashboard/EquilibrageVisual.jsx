/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import '../../styles/EquilibrageVisual.css';
import { getCurrentApiKeys, getFeedConfig } from '../../services/emonAPI';

const EquilibrageVisual = () => {
    const [currentValues, setCurrentValues] = useState({
        i1: 0,
        i2: 0,
        i3: 0
    });

    const MAX_CURRENTS = {
        ctm01: 25,
        nfis01: 1100
    };

    const MAX_CURRENT = MAX_CURRENTS[localStorage.getItem('username')] || MAX_CURRENTS.ctm01;
    const username = localStorage.getItem('username');

    const formatCurrentValue = (value) => {
        if (username === 'nfis01') {
            return Math.round(parseFloat(value));
        }
        return parseFloat(value).toFixed(2);
    };

    const fetchCurrentValues = async () => {
        try {
            const { API_KEY } = getCurrentApiKeys();
            const baseUrl = 'http://electricwave.ma/energymonitoring/feed/value.json';

            const current1Config = getFeedConfig('current1');
            const current2Config = getFeedConfig('current2');
            const current3Config = getFeedConfig('current3');

            const [i1Response, i2Response, i3Response] = await Promise.all([
                fetch(`${baseUrl}?id=${current1Config.id}&apikey=${API_KEY}`),
                fetch(`${baseUrl}?id=${current2Config.id}&apikey=${API_KEY}`),
                fetch(`${baseUrl}?id=${current3Config.id}&apikey=${API_KEY}`)
            ]);

            const [i1Data, i2Data, i3Data] = await Promise.all([
                i1Response.json(),
                i2Response.json(),
                i3Response.json()
            ]);

            setCurrentValues({
                i1: formatCurrentValue(i1Data),
                i2: formatCurrentValue(i2Data),
                i3: formatCurrentValue(i3Data)
            });

        } catch (error) {
            console.error('Error fetching current values:', error);
        }
    };

    useEffect(() => {
        fetchCurrentValues();
        const interval = setInterval(fetchCurrentValues, 2000);
        return () => clearInterval(interval);
    }, []); 

    return (
        <div className="equilibrage-container">
            <div className="current-boxes">
                {['i1', 'i2', 'i3'].map((current, index) => (
                    <div key={current} className="current-box">
                        <div className="current-label">I{index + 1}</div>
                        <div className="current-value">{currentValues[current]}A</div>
                        <div
                            className="current-fill"
                            style={{
                                height: `${(parseFloat(currentValues[current]) / MAX_CURRENT) * 100}%`,
                                backgroundColor: parseFloat(currentValues[current]) > (MAX_CURRENT * 0.8) ?
                                    'var(--warning-color)' : 'var(--primary-color)'
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EquilibrageVisual;