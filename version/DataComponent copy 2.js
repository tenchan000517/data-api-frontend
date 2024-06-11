import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import * as htmlToImage from 'html-to-image';

axios.defaults.baseURL = 'https://data-api2024.azurewebsites.net';

const DataDisplay = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [marketplace, setMarketplace] = useState('');
    const [collection, setCollection] = useState('');

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`/scrape?marketplace=${marketplace}&collection=${collection}`);
            setData(response.data);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const generateXPost = (data) => {
        return `Floor price: ${data.floor_price}, Total volume: ${data.total_volume}`;
    };

    const saveAsImage = async () => {
        const node = document.getElementById('data-chart');
        const dataUrl = await htmlToImage.toPng(node);
        const link = document.createElement('a');
        link.download = 'data-chart.png';
        link.href = dataUrl;
        link.click();
    };

    return (
        <div className="data-display">
            <h1>Data API Test</h1>
            <input 
                type="text" 
                value={marketplace} 
                onChange={(e) => setMarketplace(e.target.value)} 
                placeholder="Enter Marketplace" 
            />
            <input 
                type="text" 
                value={collection} 
                onChange={(e) => setCollection(e.target.value)} 
                placeholder="Enter Collection" 
            />
            <button onClick={fetchData} className="fetch-button">Fetch Data</button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {data && (
                <div>
                    <Line 
                        id="data-chart"
                        data={{
                            labels: data.intervals.map(interval => interval.interval),
                            datasets: [{
                                label: 'Volume',
                                data: data.intervals.map(interval => interval.volume),
                            }]
                        }}
                    />
                    <button onClick={saveAsImage} className="save-button">Save as Image</button>
                    <p>{generateXPost(data)}</p>
                </div>
            )}
        </div>
    );
};

export default DataDisplay;
