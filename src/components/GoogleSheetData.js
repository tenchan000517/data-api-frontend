import React, { useState } from 'react';
import { Box, Button, Typography, TextField, MenuItem } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import DataDisplay from './DataDisplay';
import { format } from 'date-fns';

const GoogleSheetData = () => {
  const [date, setDate] = useState(null);
  const [sheetType, setSheetType] = useState('nft');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timestamp, setTimestamp] = useState('');

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleSheetTypeChange = (event) => {
    setSheetType(event.target.value);
  };

  const handleFetchSheetData = async () => {
    if (!date) return;

    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd');
    const requestUrl = `https://data-api2024.azurewebsites.net/api/data?date=${formattedDate}&type=${sheetType}`;

    console.log(`Fetching data from URL: ${requestUrl}`);

    try {
      const response = await axios.get(requestUrl);
      console.log('Data fetched successfully:', response.data);
      setSheetData(response.data);
      if (response.data.length > 0) {
        setTimestamp(format(new Date(response.data[0].タイムスタンプ), 'yyyy MMMM dd HH:mm'));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setSheetData([]);
      alert('データの取得に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <DatePicker
          label="Select Date"
          value={date}
          onChange={handleDateChange}
          renderInput={(params) => <TextField {...params} size="small" sx={{ minWidth: '150px', marginRight: 2 }} />}
        />
        <TextField
          label="Type"
          select
          size="small"
          value={sheetType}
          onChange={handleSheetTypeChange}
          sx={{ minWidth: '150px', marginRight: 2 }}
        >
          <MenuItem value="nft">NFT</MenuItem>
          <MenuItem value="ordinals">Ordinals</MenuItem>
          <MenuItem value="brc20">BRC20</MenuItem>
        </TextField>
        <Button
          variant="contained"
          onClick={handleFetchSheetData}
          disabled={loading}
          sx={{ marginTop: { xs: 2, md: 0 } }}
        >
          Fetch Data
        </Button>
      </Box>
      {sheetData ? (
        <DataDisplay data={sheetData} type={sheetType} timestamp={timestamp} />
      ) : (
        <Typography variant="body1" sx={{ padding: '16px' }}>
          No data available
        </Typography>
      )}
    </LocalizationProvider>
  );
};

export default GoogleSheetData;
