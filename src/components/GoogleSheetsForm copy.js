import React, { useState } from 'react';
import { Box, Button, FormControl, TextField, CircularProgress } from '@mui/material';

const GoogleSheetsForm = ({ onSubmit, loading }) => {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('');
  const [values, setValues] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedValues = values.split(',').map(value => value.trim());
    onSubmit(spreadsheetId, range, parsedValues);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Spreadsheet ID"
          value={spreadsheetId}
          onChange={(e) => setSpreadsheetId(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Values (comma separated)"
          value={values}
          onChange={(e) => setValues(e.target.value)}
        />
      </FormControl>
      <Button variant="contained" color="primary" type="submit" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Append to Google Sheets'}
      </Button>
    </Box>
  );
};

export default GoogleSheetsForm;
