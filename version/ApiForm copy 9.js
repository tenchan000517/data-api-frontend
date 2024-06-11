// ApiForm.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  CircularProgress
} from '@mui/material';
import DataDisplay from './DataDisplay';
import presetsData from './presets.json';
import NftForm from './NftForm';
import OrdinalsForm from './OrdinalsForm';
import Brc20Form from './Brc20Form';

const ApiForm = () => {
  const [type, setType] = useState('nft');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async (fetchFunction) => {
    setLoading(true);
    try {
      const data = await fetchFunction();
      setResult(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h1">API Test</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="type-label">Type</InputLabel>
        <Select
          labelId="type-label"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          <MenuItem value="nft">NFT</MenuItem>
          <MenuItem value="ordinals">Ordinals</MenuItem>
          <MenuItem value="brc20">BRC20</MenuItem>
          {/* 他のタイプを追加 */}
        </Select>
      </FormControl>

      {type === 'nft' && (
        <NftForm onFetchData={handleFetchData} loading={loading} />
      )}
      {type === 'ordinals' && (
        <OrdinalsForm onFetchData={handleFetchData} loading={loading} />
      )}
      {type === 'brc20' && (
        <Brc20Form onFetchData={handleFetchData} loading={loading} presets={presetsData} />
      )}

      <Typography variant="h2">Result:</Typography>
      {result && Array.isArray(result) ? (
        result.map((res, index) => (
          <DataDisplay key={index} data={res} />
        ))
      ) : (
        result && <DataDisplay data={result} />
      )}
    </Box>
  );
};

export default ApiForm;
