// src/App.js
import React from 'react';
import DataDisplay from './components/DataComponent';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <DataDisplay />
            </header>
        </div>
    );
}

export default App;
