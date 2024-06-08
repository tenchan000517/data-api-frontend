// src/DataDisplay.js
import React, { useState } from 'react';

const DataDisplay = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('https://data-api2024.azurewebsites.net/scrape');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setData(data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Data API Test</h1>
            <button onClick={fetchData}>Fetch Data</button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {data && (
                <div>
                    {Object.entries(data).map(([collectionName, collectionData]) => (
                        <table key={collectionName} style={{ marginBottom: '20px', width: '100%', borderCollapse: 'collapse' }}>
                            <caption style={{ textAlign: 'left', marginBottom: '10px', fontWeight: 'bold', fontSize: '1.2em' }}>{collectionName}</caption>
                            <thead>
                                <tr>
                                    {Object.keys(collectionData).map(key => (
                                        <th key={key} style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2' }}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {Object.values(collectionData).map((value, index) => (
                                        <td key={index} style={{ border: '1px solid #ddd', padding: '8px' }}>{value}</td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DataDisplay;
