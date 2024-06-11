import React from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardHeader } from '@mui/material';

const DataDisplay = ({ data, type, isPreset }) => {
  console.log('DataDisplay - isPreset:', isPreset);
  console.log('DataDisplay - data:', data);

  const renderData = (data) => {
    if (!data || data.length === 0) {
      return <div>No data available</div>;
    }

    const keys = Object.keys(data[0]);

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {keys.map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
              {(type === 'ordinals' || type === 'brc20') && keys.includes('買い圧・売り圧') && <TableCell>買い圧・売り圧</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {keys.map((key) => (
                  <TableCell
                    key={key}
                    style={{
                      color: (key === '買い圧・売り圧' && type === 'brc20')
                        ? parseFloat(row[key]) > 0
                          ? 'green'
                          : 'red'
                        : (key.includes('価格変動') && typeof row[key] === 'number')
                          ? row[key] > 0
                            ? 'green'
                            : 'red'
                          : 'inherit'
                    }}
                  >
                    {key.includes('価格変動') && typeof row[key] === 'number' 
                      ? `${row[key] > 0 ? '▲' : '▼'}${Math.abs(row[key]).toFixed(2)}%`
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
    ];

    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>項目</TableCell>
              <TableCell>値</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.label}</TableCell>
                <TableCell>{typeof row.value === 'object' ? JSON.stringify(row.value) : row.value}</TableCell>
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
          <CardHeader title="Data Display" />
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
                      <TableCell>項目</TableCell>
                      <TableCell>値</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && Object.entries(data).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{typeof value === 'object' ? JSON.stringify(value) : value}</TableCell>
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
