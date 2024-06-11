import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardHeader, Typography } from '@mui/material';

const DataDisplay = ({ data, type, isPreset, chain }) => {
  console.log('DataDisplay - isPreset:', isPreset);
  console.log('DataDisplay - data:', data);

  const getPriceChangeKeys = (type) => {
    switch (type) {
      case 'collections':
      case 'nft':
        return ['1DAY', '1WEEK', '1MONTH', '前日差（フロア価格）', 'リスト率'];
      case 'ordinals':
        return ['取引量の変動率', '24時間価格変動率'];
      case 'brc20':
        return ['1DAY', '1WEEK', '1MONTH'];
      default:
        return [];
    }
  };

  const getTitle = (type, chain) => {
    switch (type) {
      case 'nft':
        return `NFTマーケット情報（${chain}）`;
      case 'ordinals':
        return 'Ordinalマーケット情報';
      case 'brc20':
        return 'BRC20マーケット情報'; // おすすめの名前に変更可能
      default:
        return 'マーケット情報';
    }
  };

  const renderData = (data) => {
    if (!data || data.length === 0) {
      return <div>No data available</div>;
    }

    const keys = Object.keys(data[0]);
    const priceChangeKeys = getPriceChangeKeys(type);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {keys.map((key) => (
                <TableCell
                  key={key}
                  align={key === 'コレクション' ? 'left' : 'center'}
                  sx={{
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    backgroundColor: key === 'コレクション' ? '#add8e6' : '#d3d3d3',
                    borderRadius: key === 'コレクション' ? '10px' : '0px'
                  }}
                >
                  {key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {keys.map((key) => (
                  <TableCell
                    key={key}
                    align={key === 'コレクション' ? 'left' : (row[key] === "－" ? 'center' : 'right')}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: (key === '買い圧・売り圧' && type === 'brc20')
                        ? parseFloat(row[key]) > 0
                          ? '#e0f7fa'
                          : '#ffebee'
                        : (priceChangeKeys.includes(key) && typeof row[key] === 'string' && row[key] !== "－")
                          ? parseFloat(row[key]) > 0
                            ? '#e0f7fa'
                            : '#ffebee'
                          : 'inherit',
                      color: (key === '買い圧・売り圧' && type === 'brc20')
                        ? parseFloat(row[key]) > 0
                          ? 'green'
                          : 'red'
                        : (priceChangeKeys.includes(key) && typeof row[key] === 'string' && row[key] !== "－")
                          ? parseFloat(row[key]) > 0
                            ? 'green'
                            : 'red'
                          : 'inherit'
                    }}
                  >
                    {priceChangeKeys.includes(key) && typeof row[key] === 'string' && row[key] !== "－"
                      ? `${parseFloat(row[key]) > 0 ? '▲' : '▼'}${Math.abs(parseFloat(row[key])).toFixed(2)}%`
                      : (typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key])
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderSingleCollectionData = () => {
    if (!data || data.length === 0) {
      return <div>No data available</div>;
    }

    const collection = data[0];
    const rows = [
      { label: "トークン名/コレクション名", value: collection["トークン名/コレクション名"] || "－" },
      { label: "シンボル", value: collection["シンボル"] || "－" },
      { label: "フロアプライス", value: collection["フロアプライス"] || "－" },
      { label: "時価総額", value: collection["時価総額"] || "－" },
      { label: "24時間取引高", value: collection["24時間取引高"] || "－" },
      { label: "最大供給量", value: collection["最大供給量"] || "－" },
      { label: "ホルダー数", value: collection["ホルダー数"] || "－" },
      { label: "価格変動（24時間）", value: collection["価格変動（24時間）"] || "－" },
      { label: "価格変動（7日間）", value: collection["価格変動（7日間）"] || "－" },
      { label: "価格変動（30日間）", value: collection["価格変動（30日間）"] || "－" },
      { label: "前日差（フロア価格）", value: collection["前日差（フロア価格）"] || "－" },
      { label: "リスト数", value: collection["リスト数"] || "－" },
      { label: "リスト率", value: collection["リスト率"] || "－" },
    ];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>項目</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>値</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="left" sx={{ fontWeight: 'bold' }}>{row.label}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{typeof row.value === 'object' ? JSON.stringify(row.value) : row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardHeader title={getTitle(type, chain)} />
          <Box>
            {type === 'ordinals' && Array.isArray(data) ? (
              renderData(data)
            ) : type === 'brc20' && Array.isArray(data) ? (
              renderData(data)
            ) : type === 'nft' && Array.isArray(data) ? (
              isPreset ? renderData(data) : renderSingleCollectionData()
            ) : type === 'nft' && !Array.isArray(data) ? (
              renderSingleCollectionData()
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>項目</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>値</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && Object.entries(data).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell align="left" sx={{ fontWeight: 'bold' }}>{key}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>{typeof value === 'object' ? JSON.stringify(value) : value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Card>
      </Grid>
    </Grid>
  );
};

export default DataDisplay;
