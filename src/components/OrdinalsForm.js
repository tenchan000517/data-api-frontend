import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  TextField,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress
} from '@mui/material';
import ordinalsPresets from './ordinalsPresets.json';

const OrdinalsForm = ({ onFetchData, loading }) => {
  const [windowValue, setWindowValue] = useState('1d');
  const [sort, setSort] = useState('volume');
  const [direction, setDirection] = useState('desc');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(100);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [presets, setPresets] = useState({});

  useEffect(() => {
    setPresets(ordinalsPresets);
  }, []);

  const fetchOrdinalsData = async () => {
    const url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = {
      type: 'ordinals',
      window: windowValue,
      sort,
      direction,
      offset,
      limit,
    };

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  const fetchOrdinalsPresetData = async () => {
    const url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type: 'ordinals' };

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);
    const data = await response.json();

    const presetItems = ordinalsPresets[selectedPreset];
    const filteredData = presetItems.map(presetItem => {
      return data.find(item => item.collectionSymbol.toLowerCase() === presetItem.collectionSymbol.toLowerCase());
    }).filter(Boolean); // 存在する銘柄のみ抽出
    return filteredData;
  };

  const handleFetchClick = () => {
    if (selectedPreset) {
      onFetchData(fetchOrdinalsPresetData);
    } else {
      onFetchData(fetchOrdinalsData);
    }
  };

  return (
    <form>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Window"
          value={windowValue}
          onChange={e => setWindowValue(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Direction"
          value={direction}
          onChange={e => setDirection(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Offset"
          type="number"
          value={offset}
          onChange={e => setOffset(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Limit"
          type="number"
          value={limit}
          onChange={e => setLimit(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="preset-label">プリセット</InputLabel>
        <Select
          labelId="preset-label"
          value={selectedPreset}
          onChange={e => setSelectedPreset(e.target.value)}
        >
          {Object.keys(presets).map(preset => (
            <MenuItem key={preset} value={preset}>{preset}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <Box marginY={2}>
        <Button variant="contained" color="primary" onClick={handleFetchClick} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Data"}
        </Button>
      </Box>
      {loading && (
        <Box marginY={2}>
          <LinearProgress />
        </Box>
      )}
    </form>
  );
};

export default OrdinalsForm;
