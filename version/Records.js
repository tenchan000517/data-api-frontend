import React, { useEffect, useState, useCallback } from 'react';
import schedule from 'node-schedule';
import axios from 'axios';

const Records = () => {
    const [records, setRecords] = useState([]);

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
        <div className="records">
            <h2>Records</h2>
            <button onClick={fetchDataAndRecord} className="fetch-now-button">Fetch Data Now</button>
            <ul>
                {records.map((record, index) => (
                    <li key={index}>{JSON.stringify(record)}</li>
                ))}
            </ul>
        </div>
    );
};

export default Records;
