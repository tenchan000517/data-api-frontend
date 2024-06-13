import React, { useRef } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardHeader, Button } from '@mui/material';
import html2canvas from 'html2canvas';

const DataDisplay = ({ data, type, isPreset, chain }) => {
  console.log('DataDisplay - isPreset:', isPreset);
  console.log('DataDisplay - data:', data);
  console.log('DataDisplay - chain:', chain);
  const tableRef = useRef(null);

  const getPriceChangeKeys = (type) => {
    switch (type) {
      case 'collections':
      case 'nft':
        return ['1DAY', '1WEEK', '1MONTH', '前日差（フロア価格）', 'リスト率'];
      case 'ordinals':
        return ['取引量の変動率', '24時間価格変動率'];
      case 'brc20':
        return ['1DAY', '1WEEK', '1MONTH', '買い圧・売り圧'];
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
        return 'BRC20マーケット情報';
      default:
        return 'マーケット情報';
    }
  };

  const getCellColor = (key, isHeader = false) => {
    const colorMap = {
      'コレクション': '#4974FF',
      '現在価格': '#6B5AFF',
      'フロアプライス': '#6B5AFF',
      'マーケットキャップ': '#FF8C00',
      '24時間取引高': '#00FF7F',
      '1DAY Volume': '#00FF7F',
      '最大供給量': '#1E90FF',
      '供給数': '#1E90FF',
      '1DAY': '#FF69B4',
      '1WEEK': '#BA55D3',
      '1MONTH': '#9400D3',
      '買い圧・売り圧': '#8B008B',
      '対USDT価格': '#FF1493',
      '総取引高 (BTC)': '#C71585',
      'ホルダー数': '#FF4500',
      '保有者数': '#FF6347',
      'マーケットキャップ(USD)': '#C71585',
      '取引量': '#40E0D0',
      '24時間価格変動率': '#00FA9A',
      '取引量の変動率': '#3CB371',
      'リスト率': '#2E8B57',
    };
    return isHeader ? colorMap[key] || '#4974FF' : colorMap[key] || 'white';
  };

  const handleExportClick = () => {
    if (tableRef.current) {
      html2canvas(tableRef.current).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'data.png';
        link.click();
      });
    }
  };

  const handleExportHtml = () => {
    if (tableRef.current) {
      const html = tableRef.current.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'data.html';
      link.click();
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
                    backgroundColor: getCellColor(key, true),
                    borderRadius: '10px',
                    color: '#FFFFFF',
                    borderBottom: 'none',
                    padding: '12px', // パディングを12pxに変更
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
                    align={key === 'コレクション' ? 'left' : 'right'}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: (priceChangeKeys.includes(key) && typeof row[key] === 'string' && row[key] !== "－")
                        ? parseFloat(row[key]) > 0
                          ? '#D6E7FF'
                          : '#FFAAF0'
                        : 'white',
                      color: (priceChangeKeys.includes(key) && typeof row[key] === 'string' && row[key] !== "－")
                        ? parseFloat(row[key]) > 0
                          ? 'green'
                          : 'red'
                        : 'inherit',
                      borderBottom: '1px solid #e0e0e0',
                      padding: '12px', // パディングを12pxに変更
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
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>項目</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>値</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="left" sx={{ fontWeight: 'bold', backgroundColor: getCellColor(row.label), padding: '12px' }}>{row.label}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px' }}>{typeof row.value === 'object' ? JSON.stringify(row.value) : row.value}</TableCell>
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
          <CardHeader
            title={getTitle(type, chain)}
            action={
              <>
                <Button variant="contained" onClick={handleExportClick} style={{ marginRight: '8px' }}>
                  画像としてエクスポート
                </Button>
                <Button variant="contained" onClick={handleExportHtml}>
                  HTMLとしてエクスポート
                </Button>
              </>
            }
          />
          <Box ref={tableRef}>
            {type === 'ordinals' && Array.isArray(data) ? (
              renderData(data)
            ) : type === 'brc20' && Array.isArray(data) ? (
              renderData(data)
            ) : type === 'nft' && Array.isArray(data) ? (
              isPreset ? renderData(data) : renderSingleCollectionData()
            ) : type === 'nft' && !Array.isArray(data) ? (
              renderSingleCollectionData()
            ) : (
              <TableContainer component={Paper} sx={{ '& .MuiTable-root': { borderCollapse: 'separate', borderSpacing: '0 8px' } }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>項目</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>値</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data && Object.entries(data).map(([key, value]) => (
                      <TableRow key={key}>
                        <TableCell align="left" sx={{ fontWeight: 'bold', backgroundColor: getCellColor(key), padding: '12px' }}>{key}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px' }}>{typeof value === 'object' ? JSON.stringify(value) : value}</TableCell>
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