import React, { useState } from 'react';
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

const Brc20Form = ({ onFetchData, loading, presets }) => {
  const [symbol, setSymbol] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [progress, setProgress] = useState(0);

  const fetchBrc20Data = async () => {
    const url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type: 'brc20', symbol };

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    const response = await fetch(url);
    const data = await response.json();
    return data;
  };

  const fetchBrc20PresetData = async () => {
    const results = [];
    const totalPresets = presets[selectedPreset].length;

    for (const [index, presetData] of presets[selectedPreset].entries()) {
      const url = new URL('https://data-api2024.azurewebsites.net/info');
      const params = { type: 'brc20', ...presetData };
      delete params.name;

      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      const response = await fetch(url);
      const data = await response.json();
      results.push(data);

      // 進捗を更新
      setProgress(((index + 1) / totalPresets) * 100);

      // 30秒の遅延を追加
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    return results;
  };

  const handleFetchClick = () => {
    setProgress(0); // プログレスバーをリセット
    if (selectedPreset) {
      onFetchData(fetchBrc20PresetData);
    } else {
      onFetchData(fetchBrc20Data);
    }
  };

  return (
    <form>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Symbol"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
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
      {loading && <LinearProgress variant="determinate" value={progress} />}
    </form>
  );
};

export default Brc20Form;
