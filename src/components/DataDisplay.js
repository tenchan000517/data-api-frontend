import React, { useRef, useState } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Card, CardHeader, Button, Typography, TextField, MenuItem, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import html2canvas from 'html2canvas';
import axios from 'axios';
import { format } from 'date-fns';

const DataDisplay = ({ data, type, isPreset, chain }) => {
  const tableRef = useRef(null);
  const [date, setDate] = useState(null);
  const [sheetType, setSheetType] = useState('nft');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

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
    return isHeader ? colorMap[key] || '#4974FF' : 'white';
  };

  const handleExportClick = () => {
    const exportRef = document.createElement('div');
    exportRef.style.padding = '20px';
    exportRef.style.backgroundColor = 'white';

    const title = document.createElement('div');
    title.style.textAlign = 'left';
    title.style.marginBottom = '20px';
    title.style.marginLeft = '20px'; // 左端に接着しないように余白を追加
    title.innerHTML = `
      <div style="display: flex; align-items: center;">
        <img src="/logo552.png" alt="logo" style="width: 40px; height: 40px; margin-right: 10px;" />
        <h2 style="font-family: Arial, sans-serif; font-weight: bold; margin: 0; font-size: 1.25rem;">ZERO to ONE WEB3 Market Informations</h2>
      </div>
      <h3 style="font-family: Arial, sans-serif; font-weight: bold; margin: 10px 0; font-size: 1rem;">${getTitle(type, chain)}</h3>
    `;

    const tableContainer = tableRef.current.cloneNode(true);
    exportRef.appendChild(title);
    exportRef.appendChild(tableContainer);

    document.body.appendChild(exportRef);

    html2canvas(exportRef).then((canvas) => {
      const link = document.createElement('a');
      link.href = canvas.toDataURL();
      link.download = 'data.png';
      link.click();
      document.body.removeChild(exportRef);
    });
  };

  const handleExportHtml = () => {
    if (tableRef.current) {
      const exportRef = document.createElement('div');
      exportRef.style.padding = '20px';
      exportRef.style.backgroundColor = 'white';

      const title = document.createElement('div');
      title.style.textAlign = 'left';
      title.style.marginBottom = '20px';
      title.style.marginLeft = '20px'; // 左端に接着しないように余白を追加
      title.innerHTML = `
        <div style="display: flex; align-items: center;">
          <img src="/logo552.png" alt="logo" style="width: 40px; height: 40px; margin-right: 10px;" />
          <h2 style="font-family: Arial, sans-serif; font-weight: bold; margin: 0; font-size: 1.25rem;">ZERO to ONE WEB3 Market Informations</h2>
        </div>
        <h3 style="font-family: Arial, sans-serif; font-weight: bold; margin: 10px 0; font-size: 1rem;">${getTitle(type, chain)}</h3>
      `;

      const tableContainer = tableRef.current.cloneNode(true);
      exportRef.appendChild(title);
      exportRef.appendChild(tableContainer);

      const html = exportRef.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'data.html';
      link.click();
    }
  };

  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  const handleSheetTypeChange = (event) => {
    setSheetType(event.target.value);
  };

  const handleFetchSheetData = async () => {
    if (!date) return;
  
    setLoading(true);
    const formattedDate = format(date, 'yyyy-MM-dd'); // 修正: 日付のフォーマットを指定
    const requestUrl = `https://data-api2024.azurewebsites.net/api/data?date=${formattedDate}&type=${sheetType}`;
  
    console.log(`Fetching data from URL: ${requestUrl}`); // リクエストURLのログ出力
  
    try {
      const response = await axios.get(requestUrl);
      console.log('Data fetched successfully:', response.data);
      setSheetData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSheetData(null); // エラー時にデータをnullに設定
      alert('データの取得に失敗しました。もう一度お試しください。'); // UIでエラーメッセージを表示
    } finally {
      setLoading(false);
      setHasFetched(true); // データフェッチ後に更新
    }
  };

  const renderData = (data) => {
    if (!data || data.length === 0) {
      return <div>No data available</div>;
    }

    const getKeysOrder = (type) => {
      switch (type) {
        case 'nft':
          return [
            "コレクション",
            "フロアプライス",
            "マーケットキャップ",
            "24時間取引高",
            "最大供給量",
            "ホルダー数",
            "1DAY",
            "1WEEK",
            "1MONTH",
            "リスト率",
          ];
        case 'ordinals':
          return [
            "コレクション",
            "フロアプライス",
            "マーケットキャップ",
            "マーケットキャップ(USD)",
            "保有者数",
            "供給数",
            "取引量",
            "24時間価格変動率",
            "取引量の変動率",
          ];
        case 'brc20':
          return [
            "コレクション",
            "現在価格",
            "マーケットキャップ",
            "1DAY Volume",
            "供給数",
            "1DAY",
            "1MONTH",
            "買い圧・売り圧",
            "対USDT価格",
            "総取引高 (BTC)",
          ];
        default:
          return [];
      }
    };

    const keysOrder = getKeysOrder(type);

    const keys = Object.keys(data[0]).sort((a, b) => {
      const indexA = keysOrder.indexOf(a);
      const indexB = keysOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) {
        return 0;
      }
      if (indexA === -1) {
        return 1;
      }
      if (indexB === -1) {
        return -1;
      }
      return indexA - indexB;
    });

    const priceChangeKeys = getPriceChangeKeys(type);

    console.log('Data:', data);
    console.log('Keys:', keys);

    return (
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'auto' }}>
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
                    padding: '12px',
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
                      padding: '12px',
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
      return null;
    }

    const collection = data[0] || {}; // 修正: data[0]がundefinedの可能性を考慮
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
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>項目</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px' }}>値</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                <TableCell align="left" sx={{ fontWeight: 'bold', padding: '12px' }}>{row.label}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px' }}>{typeof row.value === 'object' ? JSON.stringify(row.value) : row.value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title={
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <img src="/logo553.png" alt="logo" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', fontFamily: 'Arial, sans-serif', fontSize: '1.25rem', paddingRight: '20px' }}>
                      ZERO to ONE WEB3 Market Informations
                    </Typography>
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {getTitle(type, chain)}
                  </Typography>
                </Box>
              }
              action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DatePicker
                    label="Select Date"
                    value={date}
                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} size="small" />}
                  />
                  <TextField
                    label="Type"
                    select
                    size="small"
                    value={sheetType}
                    onChange={handleSheetTypeChange}
                    sx={{ minWidth: '100px' }}
                  >
                    <MenuItem value="nft">NFT</MenuItem>
                    <MenuItem value="ordinals">Ordinals</MenuItem>
                    <MenuItem value="brc20">BRC20</MenuItem>
                  </TextField>
                  <Button 
                    variant="contained" 
                    onClick={handleFetchSheetData} 
                    disabled={loading} 
                    size="small"
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    Fetch Data
                  </Button>
                  <Button variant="contained" onClick={handleExportClick} style={{ marginRight: '8px' }} size="small">
                    画像としてエクスポート
                  </Button>
                  <Button variant="contained" onClick={handleExportHtml} size="small">
                    HTMLとしてエクスポート
                  </Button>
                </Box>
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
                  <Table sx={{ tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px', width: '150px' }}>項目</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.875rem', backgroundColor: '#00e5ff', borderRadius: '10px', color: '#FFFFFF', padding: '12px', width: '150px' }}>値</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data && Object.entries(data).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell align="left" sx={{ fontWeight: 'bold', padding: '12px' }}>{key}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold', padding: '12px' }}>{typeof value === 'object' ? JSON.stringify(value) : value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
            <Box ref={tableRef}>
              {sheetData ? (
                renderData(sheetData)
              ) : (
                hasFetched && (
                <Typography variant="body1" sx={{ padding: '16px' }}>
                  No data available
                </Typography>
                    )
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default DataDisplay;
