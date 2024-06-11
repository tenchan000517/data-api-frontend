import React, { useState } from 'react';
import { Box, Button, FormControl, TextField, CircularProgress, InputLabel, Select, MenuItem, LinearProgress } from '@mui/material';
import nftPresets from './nftPresets.json';

const NftForm = ({ onFetchData, loading }) => {
  const [chain, setChain] = useState('ethereum');
  const [collectionSlug, setCollectionSlug] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [sort, setSort] = useState('allTimeVolume');
  const [limit, setLimit] = useState(20);
  const [progress, setProgress] = useState(0);

  const fetchNftData = async () => {
    const url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type: 'collections', chain, collectionSlug, sort, limit };

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  const fetchNftPresetData = async () => {
    const results = [];
    const presetItems = nftPresets.presets[selectedPreset];
    const totalPresets = presetItems.length;
  
    for (const [index, presetData] of Object.entries(presetItems)) {
      const url = new URL('https://data-api2024.azurewebsites.net/info');
      const params = { type: 'collections', ...presetData, sort, limit };
  
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });
  
      const response = await fetch(url);
      const data = await response.json();
      results.push(data.collections[0]);
  
      // 進捗を更新
      setProgress(((index + 1) / totalPresets) * 100);
    }
    return results;
  };

  const handleFetchClick = () => {
    setProgress(0); // プログレスバーをリセット
    if (selectedPreset !== '') {
      onFetchData(fetchNftPresetData);
    } else {
      onFetchData(fetchNftData);
    }
  };

  return (
    <form>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Chain"
          value={chain}
          onChange={e => setChain(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Collection Slug"
          value={collectionSlug}
          onChange={e => setCollectionSlug(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="preset-label">プリセット</InputLabel>
        <Select
          labelId="preset-label"
          value={selectedPreset}
          onChange={e => setSelectedPreset(e.target.value)}
        >
          <MenuItem value="">個別取得</MenuItem>
          {nftPresets.presets.map((preset, index) => (
            <MenuItem key={index} value={index}>{`プリセット${index + 1}`}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="sort-label">Sort</InputLabel>
        <Select
          labelId="sort-label"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <MenuItem value="allTimeVolume">All Time Volume</MenuItem>
          <MenuItem value="24hVolume">24h Volume</MenuItem>
          <MenuItem value="7dVolume">7d Volume</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Limit"
          type="number"
          value={limit}
          onChange={e => setLimit(e.target.value)}
        />
      </FormControl>
      <Box marginY={2}>
        <Button variant="contained" color="primary" onClick={handleFetchClick} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Data"}
        </Button>
      </Box>
      {loading && <LinearProgress variant="determinate" value={progress} />}
    </form>
  );
};

export default NftForm;