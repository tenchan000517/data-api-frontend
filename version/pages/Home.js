import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import * as htmlToImage from 'html-to-image';
import schedule from 'node-schedule';

axios.defaults.baseURL = 'https://data-api2024.azurewebsites.net';

const Home = () => {
  const [data, setData] = useState(null);
  const [marketplace, setMarketplace] = useState('');
  const [collection, setCollection] = useState('');
  const [collections, setCollections] = useState([]);
  const [records, setRecords] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`/scrape?marketplace=${marketplace}&collection=${collection}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const addCollection = () => {
    setCollections([...collections, collection]);
    setCollection('');
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

  const fetchDataAndRecord = useCallback(async () => {
    try {
      const response = await axios.get('/scrape?marketplace=Opensea&collection=exampleCollection');
      setRecords(prevRecords => [...prevRecords, response.data]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    const job = schedule.scheduleJob('0 0 * * *', fetchDataAndRecord);

    return () => job.cancel();
  }, [fetchDataAndRecord]);

  return (
    <div>
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
      <button onClick={fetchData}>Fetch Data</button>
      <button onClick={addCollection}>Add Collection</button>
      <ul>
        {collections.map((col, index) => (
          <li key={index}>{col}</li>
        ))}
      </ul>
      {data && (
        <>
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
          <button onClick={saveAsImage}>Save as Image</button>
          <p>{generateXPost(data)}</p>
        </>
      )}
      <h1>Records</h1>
      <button onClick={fetchDataAndRecord}>Fetch Data Now</button>
      <ul>
        {records.map((record, index) => (
          <li key={index}>{JSON.stringify(record)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Home;
