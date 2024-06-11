import React, { useState } from 'react';

const Settings = () => {
    const [collections, setCollections] = useState([]);
    const [newCollection, setNewCollection] = useState('');

    const addCollection = () => {
        setCollections([...collections, newCollection]);
        setNewCollection('');
    };

    return (
        <div className="settings">
            <h2>Settings</h2>
            <input 
                type="text" 
                value={newCollection} 
                onChange={(e) => setNewCollection(e.target.value)} 
                placeholder="Enter Collection" 
            />
            <button onClick={addCollection} className="add-button">Add Collection</button>
            <ul>
                {collections.map((collection, index) => (
                    <li key={index}>{collection}</li>
                ))}
            </ul>
        </div>
    );
};

export default Settings;
