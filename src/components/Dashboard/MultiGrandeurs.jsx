import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import '../../styles/MultiGrandeurs.css';

const MultiGrandeurs = () => {
    const [values, setValues] = useState({
        tension: 0,
        currents: [0, 0, 0],
        powers: [0, 0, 0],
        apparentPowers: [0, 0, 0],
        powerFactors: [0.67, 0.78, -0.04], // Static values
        temp1: 0,
        temp2: 0
    });

    const fetchValues = async () => {
        try {
            const apiKey = '3ddd9a580253f6c9aab6298f754cf0fd';
            const baseUrl = 'http://electricwave.ma/energymonitoring/feed/value.json';

            const responses = await Promise.all([
                // Tension simple
                fetch(`${baseUrl}?id=28&apikey=${apiKey}`),
                // Courants
                fetch(`${baseUrl}?id=149&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=150&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=151&apikey=${apiKey}`),
                // Puissances
                fetch(`${baseUrl}?id=24&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=25&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=26&apikey=${apiKey}`),
                // Apparent Powers
                fetch(`${baseUrl}?id=156&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=157&apikey=${apiKey}`),
                fetch(`${baseUrl}?id=158&apikey=${apiKey}`),
                // Temperature
                fetch(`${baseUrl}?id=318&apikey=${apiKey}`)
            ]);

            const [
                tensionData,
                current1Data,
                current2Data,
                current3Data,
                power1Data,
                power2Data,
                power3Data,
                apparent1Data,
                apparent2Data,
                apparent3Data,
                temp1Data
            ] = await Promise.all(responses.map(r => r.json()));

            // Calculate power factors (P/S)
            const powerFactor1 = (parseFloat(power1Data) / parseFloat(apparent1Data)).toFixed(2);
            const powerFactor2 = (parseFloat(power2Data) / parseFloat(apparent2Data)).toFixed(2);
            const powerFactor3 = (parseFloat(power3Data) / parseFloat(apparent3Data)).toFixed(2);

            setValues({
                tension: parseFloat(tensionData).toFixed(0),
                currents: [
                    parseFloat(current1Data).toFixed(2),
                    parseFloat(current2Data).toFixed(2),
                    parseFloat(current3Data).toFixed(2)
                ],
                powers: [
                    parseFloat(power1Data).toFixed(0),
                    parseFloat(power2Data).toFixed(0),
                    parseFloat(power3Data).toFixed(0)
                ],
                apparentPowers: [
                    parseFloat(apparent1Data).toFixed(0),
                    parseFloat(apparent2Data).toFixed(0),
                    parseFloat(apparent3Data).toFixed(0)
                ],
                powerFactors: [powerFactor1, powerFactor2, powerFactor3],
                temp1: parseFloat(temp1Data).toFixed(1),
                temp2: '0.0'
            });
        } catch (error) {
            console.error('Error fetching values:', error);
        }
    };

    useEffect(() => {
        // Fetch immediately when component mounts
        fetchValues();

        // Set up interval for subsequent fetches
        const interval = setInterval(fetchValues, 3000);

        // Clean up interval on unmount
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="multigrandeurs-container">
            <div className="data-row">
                <span className="data-label">Tension Simple</span>
                <span className={classNames('data-value', 'value-bold')}>{values.tension}V</span>
            </div>

            <div className={classNames('data-row', 'multiple-values')}>
                <span className="data-label">Puissances (P1,P2,P3)</span>
                <div className="values-container">
                    {values.powers.map((power, index) => (
                        <span key={index} className={classNames('data-value', power < 0 ? 'value-red' : 'value-blue')}>
                            {power}W
                        </span>
                    ))}
                </div>
            </div>

            <div className={classNames('data-row', 'multiple-values')}>
                <span className="data-label">Courants (I1,I2,I3)</span>
                <div className="values-container">
                    {values.currents.map((current, index) => (
                        <span key={index} className={classNames('data-value', 'value-blue')}>
                            {current}A
                        </span>
                    ))}
                </div>
            </div>

            <div className={classNames('data-row', 'multiple-values')}>
                <span className="data-label">Puissances Apparentes (S1,S2,S3)</span>
                <div className="values-container">
                    {values.apparentPowers.map((power, index) => (
                        <span key={index} className="data-value">
                            {power}VA
                        </span>
                    ))}
                </div>
            </div>

            <div className={classNames('data-row', 'multiple-values', 'last-row-margin')}>
                <span className="data-label">Facteurs de Puissances (fp1,fp2,fp3)</span>
                <div className="values-container">
                    {values.powerFactors.map((factor, index) => (
                        <span key={index} className={classNames('data-value', factor < 0 ? 'value-red' : 'value-blue')}>
                            {factor}
                        </span>
                    ))}
                </div>
            </div>

            <div className="data-row">
                <span className="data-label">TEMP LOCAL1</span>
                <span className={classNames('data-value', 'value-red', 'value-bold')}>{values.temp1} °C</span>
            </div>

            <div className="data-row">
                <span className="data-label">TEMP LOCAL2</span>
                <span className={classNames('data-value', 'value-red', 'value-bold')}>{values.temp2} °C</span>
            </div>
        </div>
    );
};

export default MultiGrandeurs;