import React, { useState, useEffect } from 'react';
import { getInputList } from '../../services/emonAPI';
import '../../styles/InputList.css'; // Add styles for the input list if needed

const InputList = () => {
    const [inputs, setInputs] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedNodes, setExpandedNodes] = useState({}); // Track expanded nodes

    useEffect(() => {
        const fetchInputs = async () => {
            try {
                setLoading(true);
                const groupedInputs = await getInputList(); // Fetch and group inputs by nodes
                setInputs(groupedInputs);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch input list');
                setLoading(false);
                console.error('Error fetching input list:', err);
            }
        };

        fetchInputs();
    }, []);

    const toggleNode = (node) => {
        setExpandedNodes((prev) => ({
            ...prev,
            [node]: !prev[node], // Toggle the expanded state of the node
        }));
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        return date.toLocaleString(); // Format the date and time
    };

    const getTimeClass = (timestamp) => {
        const now = Date.now();
        const timeDifference = now - timestamp * 1000; // Convert seconds to milliseconds

        if (timeDifference < 5 * 3600000) {
            // Less than 5 hours
            return 'recent-update';
        } else if (timeDifference > 24 * 3600000) {
            // More than 1 day
            return 'old-update';
        } else {
            // Between 5 hours and 1 day
            return '';
        }
    };

    if (loading) return <div className="loading">Loading inputs...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="input-list">
            <h2>Input List</h2>
            {Object.keys(inputs).map((node) => (
                <div key={node} className="node">
                    <div className="node-header" onClick={() => toggleNode(node)}>
                        <span>{node}</span>
                        <button className="toggle-button">
                            {expandedNodes[node] ? '-' : '+'}
                        </button>
                    </div>
                    {expandedNodes[node] && (
                        <div className="node-inputs">
                            <table className="input-table">
                                <thead>
                                    <tr>
                                        <th>Input Key</th>
                                        <th>Updated</th>
                                        <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inputs[node].map((input) => (
                                        <tr key={input.id}>
                                            <td>{input.name}</td>
                                            <td className={getTimeClass(input.time)}>
                                                {formatTime(input.time)}
                                            </td>
                                            <td>{input.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default InputList;