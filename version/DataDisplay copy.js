import React from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const DataDisplay = ({ data, type }) => {
  const renderValue = (value) => {
    if (Array.isArray(value)) {
      return (
        <Table size="small">
          <TableBody>
            {value.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{index}</TableCell>
                <TableCell>{renderValue(item)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    } else if (typeof value === 'object' && value !== null) {
      return (
        <Table size="small">
          <TableBody>
            {Object.entries(value).map(([subKey, subValue]) => (
              <TableRow key={subKey}>
                <TableCell>{subKey}</TableCell>
                <TableCell>{renderValue(subValue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      );
    }
    return value;
  };

  const renderBRC20Data = () => {
    if (data && data['シンボル'] && data['現在価格']) {
      const priceChangeData = [
        { name: '7d', value: parseFloat(data['7日間価格変動率']) || 0 },
        { name: '24h', value: parseFloat(data['24時間価格変動率']) || 0 },
        { name: '1h', value: parseFloat(data['1時間価格変動率']) || 0 },
      ];

      return (
        <div style={{ width: '100%', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '10px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img src={data['アイコン'] || 'https://via.placeholder.com/24'} alt={data['シンボル']} style={{ width: '24px', height: '24px', marginRight: '5px' }} />
              <strong>{data['シンボル']}</strong>
            </div>
            <div>
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{data['現在価格'] || '－'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ width: '40%' }}>
              <ResponsiveContainer width="100%" height={50}>
                <LineChart data={priceChangeData}>
                  <XAxis dataKey="name" />
                  <YAxis domain={['dataMin', 'dataMax']} hide />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '55%' }}>
              <div style={{ textAlign: 'center' }}>
                <div>1h%</div>
                <div>{data['1時間価格変動率'] || '－'}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div>24h%</div>
                <div>{data['24時間価格変動率'] || '－'}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div>7d%</div>
                <div>{data['7日間価格変動率'] || '－'}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
            <div>
              <div>Market Cap</div>
              <div>{data['時価総額'] || '－'}</div>
            </div>
            <div>
              <div>Volume(24h)</div>
              <div>{data['24時間取引高'] || '－'}</div>
            </div>
            <div>
              <div>Circulating Supply</div>
              <div>{data['発行量'] || '－'}</div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Box>
      <Typography variant="h2">データ表示</Typography>
      {type === 'brc20' && data ? (
        renderBRC20Data()
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>項目</TableCell>
                <TableCell>値</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data && Object.entries(data).map(([key, value]) => (
                <TableRow key={key}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{renderValue(value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DataDisplay;
