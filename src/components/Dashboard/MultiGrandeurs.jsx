/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import '../../styles/MultiGrandeurs.css';
import { getCurrentApiKeys } from '../../services/emonAPI';

const FEED_IDS = {
    ctm01: {
        tension: 28,
        currents: [149, 150, 151],
        powers: [24, 25, 26],
        apparentPowers: [156, 157, 158],
        powerFactors: [153, 154, 155],
        temp1: 318,
        temp2: 319
    },
    nfis01: {
        tension: 1240,
        currents: [1241, 1242, 1243],
        powers: [1235, 1236, 1237],
        apparentPowers: [1255, 1256, 1257],
        powerFactors: [1252, 1253, 1254]
    }
};

const MultiGrandeurs = () => {
    const [values, setValues] = useState({
        tension: 0,
        currents: [0, 0, 0],
        powers: [0, 0, 0],
        apparentPowers: [0, 0, 0],
        powerFactors: [0, 0, 0],
        temp1: 0,
        temp2: 0
    });

    const username = localStorage.getItem('username') || 'ctm01';
    const feedIds = FEED_IDS[username];

    const fetchValues = async () => {
        try {
            const { API_KEY } = getCurrentApiKeys();
            const baseUrl = 'http://electricwave.ma/energymonitoring/feed/value.json';

            const fetchRequests = [
                fetch(`${baseUrl}?id=${feedIds.tension}&apikey=${API_KEY}`),
                ...feedIds.currents.map(id => fetch(`${baseUrl}?id=${id}&apikey=${API_KEY}`)),
                ...feedIds.powers.map(id => fetch(`${baseUrl}?id=${id}&apikey=${API_KEY}`)),
                ...feedIds.apparentPowers.map(id => fetch(`${baseUrl}?id=${id}&apikey=${API_KEY}`)),
                ...feedIds.powerFactors.map(id => fetch(`${baseUrl}?id=${id}&apikey=${API_KEY}`)),
            ];

            if (username === 'ctm01') {
                fetchRequests.push(
                    fetch(`${baseUrl}?id=${feedIds.temp1}&apikey=${API_KEY}`),
                );
            }

            const responses = await Promise.all(fetchRequests);
            const data = await Promise.all(responses.map(r => r.json()));

            let index = 0;
            setValues({
                tension: parseFloat(data[index++]).toFixed(0),
                currents: [
                    parseFloat(data[index++]).toFixed(2),
                    parseFloat(data[index++]).toFixed(2),
                    parseFloat(data[index++]).toFixed(2)
                ],
                powers: [
                    parseFloat(data[index++]).toFixed(0),
                    parseFloat(data[index++]).toFixed(0),
                    parseFloat(data[index++]).toFixed(0)
                ],
                apparentPowers: [
                    parseFloat(data[index++]).toFixed(0),
                    parseFloat(data[index++]).toFixed(0),
                    parseFloat(data[index++]).toFixed(0)
                ],
                powerFactors: [
                    parseFloat(data[index++]).toFixed(2),
                    parseFloat(data[index++]).toFixed(2),
                    parseFloat(data[index++]).toFixed(2)
                ],
                temp1: username === 'ctm01' ? parseFloat(data[index++]).toFixed(1) : null,
                temp2: username === 'ctm01' ? parseFloat(data[index++]).toFixed(1) : null
            });
        } catch (error) {
            console.error('Error fetching values:', error);
        }
    };

    useEffect(() => {
        fetchValues();
        const interval = setInterval(fetchValues, 3000);
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

            {/* Show temperature rows only for ctm01 */}
            {username === 'ctm01' && (
                <>
                    <div className="data-row">
                        <span className="data-label">TEMP LOCAL1</span>
                        <span className={classNames('data-value', 'value-red', 'value-bold')}>
                            {values.temp1} °C
                        </span>
                    </div>
                    <div className="data-row">
                        <span className="data-label">TEMP LOCAL2</span>
                        <span className={classNames('data-value', 'value-red', 'value-bold')}>
                            0 °C
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};

export default MultiGrandeurs;