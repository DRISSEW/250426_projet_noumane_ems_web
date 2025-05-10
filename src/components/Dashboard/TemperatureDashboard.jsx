import React, { useEffect, useState } from 'react';
import GaugeChart from 'react-gauge-chart';
import '../../styles/TemperatureDashboard.css';

const batteries = [
  { label: 'V-BAT1', voltage: 2.4, tempLabel: 'TEMP1', temp: 22.6 },
  { label: 'V-BAT2', voltage: 3.0, tempLabel: 'TEMP2', temp: 0 },
  { label: 'V-BAT3', voltage: 2.0, tempLabel: 'TEMP3', temp: 21 },
];

const TemperatureDashboard = () => {
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.getAttribute('data-theme') === 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const gaugeNeedleColor = isDarkMode ? "#ff5252" : "#222";
  const gaugeTextColor = isDarkMode ? "#fff" : "#222";

  return (
    <div className="temp-dashboard">
      {batteries.map((bat, idx) => (
        <div className="temp-block" key={idx}>
          <div className="temp-label">{bat.label}</div>
          <div className="temp-row">
            <GaugeChart
              style={{ width: "80px", height: "60px" }} 
              id={`gauge-${idx}`}
              nrOfLevels={6}
              percent={bat.voltage / 4.2} 
              textColor={gaugeTextColor}
              formatTextValue={() => `${bat.voltage}V`}
              arcsLength={[0.5, 0.5]}
              colors={['#00bfff', '#ff4500']}
              arcPadding={0.02}
              needleColor={gaugeNeedleColor}
              needleBaseColor={gaugeNeedleColor}
            />
            <div className="thermo-block">
              <div className="thermometer">
                <div className="thermo-scale">
                  {[80, 60, 40, 20, 0].map(t => (
                    <div key={t} className="thermo-tick">{t}°</div>
                  ))}
                </div>
                <div className="thermo-mercury" style={{ height: `${bat.temp}%` }} />
              </div>
              <div className="temp-value">
                <span className="temp-label-red">{bat.tempLabel}</span>
                <span className="temp-number">{bat.temp}°C</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TemperatureDashboard;