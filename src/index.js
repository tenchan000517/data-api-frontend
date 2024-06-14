import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

ReactDOM.render(
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <App />
  </LocalizationProvider>,
  document.getElementById('root')
);
