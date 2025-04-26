import React, {  } from 'react';

const EquilibriumDashboard = () => {

    return (
        <div className="field-chart-container">
            <iframe
                src="http://electricwave.ma/energymonitoring/dashboard/view&id=53&apikey=3ddd9a580253f6c9aab6298f754cf0fd&embed=1"
                width="100%"
                height="450"
                frameborder="0"
                scrolling="no"
            >
            </iframe>
        </div>
    );
};

export default EquilibriumDashboard;