import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import html2canvas from 'html2canvas';
import DataDisplay from './DataDisplay';
import { transformData } from './utils'; // ここでインポート
import configData from './config.json'; // ここでインポート

const ApiForm = () => {
  const [type, setType] = useState('nft');
  const [chain, setChain] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [collectionSlug, setCollectionSlug] = useState('');
  const [windowValue, setWindowValue] = useState('1d');
  const [sort, setSort] = useState('allTimeVolume');
  const [direction, setDirection] = useState('desc');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState(null);

  const presets = {
    preset1: [
      { type: 'nft', chain: 'ethereum', contractAddress: '0x1234...' },
      { type: 'erc20', chain: 'ethereum', contractAddress: '0x5678...' },
    ],
  };

  const toggleFields = (type) => {
    setChain('');
    setContractAddress('');
    setSymbol('');
    setCollectionSlug('');
    setWindowValue('1d');
    setSort('allTimeVolume');
    setDirection('desc');
    setOffset(0);
    setLimit(20);

    if (type === 'nft' || type === 'erc20') {
      setChain('ethereum');
    } else if (type === 'collections') {
      setChain('ethereum');
      setSort('allTimeVolume');
      setLimit(20);
    } else if (type === 'ordinals') {
      setWindowValue('1d');
      setSort('volume');
      setLimit(100);
    } else if (type === 'brc20' || type === 'solana') {
      setLimit(20);
    }
  };

  const fetchData = async () => {
    let url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type };

    if (type === 'nft' || type === 'erc20') {
      params.chain = chain;
      params.contractAddress = contractAddress;
    } else if (type === 'ordinals') {
      params.window = windowValue;
      params.sort = sort;
      params.direction = direction;
      params.offset = offset;
      params.limit = limit;
    } else if (type === 'collections') {
      params.chain = chain;
      params.collectionSlug = collectionSlug;
      params.sort = sort;
      params.limit = limit;
    } else if (type === 'pair') {
      params.contractAddress = contractAddress;
      params.symbol = symbol;
    } else if (type === 'brc20' || type === 'solana') {
      params.symbol = symbol;
      params.offset = offset;
      params.limit = limit;
    }

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    }
  };

  const fetchPresetData = async (preset) => {
    const results = [];
    for (const { type, chain, contractAddress, symbol, collectionSlug } of presets[preset]) {
      let url = new URL('https://data-api2024.azurewebsites.net/info');
      const params = { type, chain, contractAddress, symbol, collectionSlug };
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      try {
        const response = await fetch(url);
        const data = await response.json();
        results.push(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    return results;
  };

  const handlePresetSelect = async (preset) => {
    const data = await fetchPresetData(preset);
    setResult(data);
  };

  const saveDataAsImage = async () => {
    const resultElement = document.getElementById('result');
    if (resultElement) {
      const canvas = await html2canvas(resultElement);
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'result.png';
      link.click();
    }
  };

  const saveDataToSheet = async (data) => {
    try {
      const response = await fetch('https://your-backend-api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h1">API Test</Typography>
      <form onSubmit={e => { e.preventDefault(); fetchData(); }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            onChange={e => { setType(e.target.value); toggleFields(e.target.value); }}
          >
            {configData.types.map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(type === 'nft' || type === 'erc20' || type === 'collections') && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="chain-label">Chain</InputLabel>
            <Select
              labelId="chain-label"
              value={chain}
              onChange={e => setChain(e.target.value)}
            >
              {configData.chains.map((chain) => (
                <MenuItem key={chain} value={chain}>{chain}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {(type === 'nft' || type === 'erc20' || type === 'pair') && (
          <TextField
            fullWidth
            margin="normal"
            label="Contract Address"
            value={contractAddress}
            onChange={e => setContractAddress(e.target.value)}
          />
        )}

        {(type === 'brc20' || type === 'solana' || type === 'pair') && (
          <TextField
            fullWidth
            margin="normal"
            label="Symbol"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          />
        )}

        {type === 'collections' && (
          <TextField
            fullWidth
            margin="normal"
            label="Collection Slug"
            value={collectionSlug}
            onChange={e => setCollectionSlug(e.target.value)}
          />
        )}

        {type === 'ordinals' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Window"
              value={windowValue}
              onChange={e => setWindowValue(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Direction"
              value={direction}
              onChange={e => setDirection(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Offset"
              type="number"
              value={offset}
              onChange={e => setOffset(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Limit"
              type="number"
              value={limit}
              onChange={e => setLimit(e.target.value)}
            />
          </>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel id="preset-label">プリセット</InputLabel>
          <Select
            labelId="preset-label"
            onChange={e => handlePresetSelect(e.target.value)}
          >
            <MenuItem value="preset1">プリセット①</MenuItem>
            {/* 他のプリセットも追加 */}
          </Select>
        </FormControl>

        <Box marginY={2}>
          <Button variant="contained" color="primary" type="submit">
            Fetch Data
          </Button>
          <Button variant="contained" color="secondary" onClick={saveDataAsImage} style={{ marginLeft: '10px' }}>
            Save Data as Image
          </Button>
          <Button variant="contained" color="secondary" onClick={() => saveDataToSheet(result)} style={{ marginLeft: '10px' }}>
            Save Data to Google Sheets
          </Button>
        </Box>
      </form>

      <Typography variant="h2">Result:</Typography>
      {result && Array.isArray(result) ? (
        result.map((res, index) => (
          <DataDisplay key={index} data={transformData(res, type)} />
        ))
      ) : (
        result && <DataDisplay data={transformData(result, type)} />
      )}
    </Box>
  );
};

export default ApiForm;
