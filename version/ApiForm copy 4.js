import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import html2canvas from 'html2canvas';
import DataDisplay from './DataDisplay';
import presetsData from './presets.json'; // プリセットJSONをインポート
import ordinalsPresets from './ordinalsPresets.json'; // OrdinalsプリセットJSONをインポート

const ApiForm = () => {
  const [type, setType] = useState('nft');
  const [chain, setChain] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [symbol, setSymbol] = useState('');
  const [collectionSlug, setCollectionSlug] = useState('');
  const [windowValue, setWindowValue] = useState('1d');
  const [sort, setSort] = useState('allTimeVolume');
  const [direction, setDirection] = useState('desc');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(20);
  const [result, setResult] = useState(null);
  const [presets, setPresets] = useState({});
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isPreset, setIsPreset] = useState(false);
  const [loading, setLoading] = useState(false); // ローディング状態を管理

  useEffect(() => {
    // プリセットJSONをセット
    setPresets(presetsData);
  }, []);

  const toggleFields = (type) => {
    setChain('');
    setContractAddress('');
    setSymbol('');
    setCollectionSlug('');
    setWindowValue('1d');
    setSort('allTimeVolume');
    setDirection('desc');
    setOffset(0);
    setLimit(20);

    if (type === 'nft' || type === 'erc20') {
      setChain('ethereum');
    } else if (type === 'collections') {
      setChain('ethereum');
      setSort('allTimeVolume');
      setLimit(20);
    } else if (type === 'ordinals') {
      setWindowValue('1d');
      setSort('volume');
      setLimit(100);
    } else if (type === 'brc20' || type === 'solana') {
      setLimit(20);
    }
  };

  const fetchData = async () => {
    let url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type };

    if (type === 'nft' || type === 'erc20') {
      params.chain = chain;
      params.contractAddress = contractAddress;
    } else if (type === 'ordinals') {
      params.window = windowValue;
      params.sort = sort;
      params.direction = direction;
      params.offset = offset;
      params.limit = limit;
    } else if (type === 'collections') {
      params.chain = chain;
      params.collectionSlug = collectionSlug;
      params.sort = sort;
      params.limit = limit;
    } else if (type === 'pair') {
      params.contractAddress = contractAddress;
      params.symbol = symbol;
    } else if (type === 'brc20' || type === 'solana') {
      params.symbol = symbol;
      params.offset = offset;
      params.limit = limit;
    }

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    try {
      const response = await fetch(url);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    }
  };

  const fetchPresetData = async (preset) => {
    setIsPreset(true);
    setLoading(true); // ローディングを開始
    let url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type: 'ordinals' };
    
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    console.log(`Fetching preset data from URL: ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetched preset data:', data);

      // プリセットの銘柄を抽出
      const presetItems = ordinalsPresets.ordinals;
      const filteredData = presetItems.map(preset => {
        return data.find(item => item.collectionSymbol.toLowerCase() === preset.collectionSymbol.toLowerCase());
      }).filter(Boolean); // 存在する銘柄のみ抽出

      setResult(filteredData);
    } catch (error) {
      console.error('Error fetching preset data:', error, 'for URL:', url);
      setResult({ error: `Error fetching preset data for URL: ${url}` });
    }

    setLoading(false); // ローディングを終了
  };

  const handlePresetSelect = async (preset) => {
    setSelectedPreset(preset);
    await fetchPresetData(preset);
  };

  const transformData = (data, type) => {
    if (type === 'ordinals') {
      return {
        "コレクションID": data.collectionId || "－",
        "コレクションシンボル": data.collectionSymbol || "－",
        "通貨": data.currency || "－",
        "USDレート": data.currencyUsdRate || "－",
        "フロア価格": data.fp || "－",
        "フロア価格（通貨）": data.fpListingCurrency || "－",
        "フロア価格（値段）": data.fpListingPrice || "－",
        "フロア価格の変動率": data.fpPctChg || "－",
        "画像": data.image || "－",
        "リスト数": data.listedCount || "－",
        "時価総額": data.marketCap || "－",
        "時価総額（USD）": data.marketCapUsd || "－",
        "名前": data.name || "－",
        "保有者数": data.ownerCount || "－",
        "供給数": data.totalSupply || "－",
        "取引量": data.totalVol || "－",
        "取引数": data.txns || "－",
        "取引数の変動率": data.txnsPctChg || "－",
        "ユニーク保有者比率": data.uniqueOwnerRatio || "－",
        "取引量の変動率": data.volPctChg || "－"
      };
    }

    return data;
  };

  const saveDataAsImage = async () => {
    const resultElement = document.getElementById('result');
    if (resultElement) {
      const canvas = await html2canvas(resultElement);
      const imageData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imageData;
      link.download = 'result.png';
      link.click();
    }
  };

  const saveDataToSheet = async (data) => {
    try {
      const response = await fetch('https://your-backend-api/save-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      });
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h1">API Test</Typography>
      <form onSubmit={e => { e.preventDefault(); fetchData(); }}>
        <FormControl fullWidth margin="normal">
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={type}
            onChange={e => { setType(e.target.value); toggleFields(e.target.value); setIsPreset(false); }}
          >
            <MenuItem value="nft">NFT</MenuItem>
            <MenuItem value="erc20">ERC20</MenuItem>
            <MenuItem value="ordinals">Ordinals</MenuItem>
            <MenuItem value="brc20">BRC20</MenuItem>
            <MenuItem value="solana">Solana</MenuItem>
            <MenuItem value="collections">Collections</MenuItem>
            <MenuItem value="pair">Token Pair</MenuItem>
          </Select>
        </FormControl>

        {(type === 'nft' || type === 'erc20' || type === 'collections') && (
          <FormControl fullWidth margin="normal">
            <InputLabel id="chain-label">Chain</InputLabel>
            <Select
              labelId="chain-label"
              value={chain}
              onChange={e => setChain(e.target.value)}
            >
              <MenuItem value="ethereum">Ethereum</MenuItem>
              <MenuItem value="polygon">Polygon</MenuItem>
              <MenuItem value="solana">Solana</MenuItem>
              <MenuItem value="bitcoin">Bitcoin</MenuItem>
              <MenuItem value="binance">Binance</MenuItem>
              <MenuItem value="base">Base</MenuItem>
              <MenuItem value="aster">Aster</MenuItem>
              <MenuItem value="astergkevm">AsterGKEVM</MenuItem>
            </Select>
          </FormControl>
        )}

        {(type === 'nft' || type === 'erc20' || type === 'pair') && (
          <TextField
            fullWidth
            margin="normal"
            label="Contract Address"
            value={contractAddress}
            onChange={e => setContractAddress(e.target.value)}
          />
        )}

        {(type === 'brc20' || type === 'solana' || type === 'pair') && (
          <TextField
            fullWidth
            margin="normal"
            label="Symbol"
            value={symbol}
            onChange={e => setSymbol(e.target.value)}
          />
        )}

        {type === 'collections' && (
          <TextField
            fullWidth
            margin="normal"
            label="Collection Slug"
            value={collectionSlug}
            onChange={e => setCollectionSlug(e.target.value)}
          />
        )}

        {type === 'ordinals' && (
          <>
            <TextField
              fullWidth
              margin="normal"
              label="Window"
              value={windowValue}
              onChange={e => setWindowValue(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Sort"
              value={sort}
              onChange={e => setSort(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Direction"
              value={direction}
              onChange={e => setDirection(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Offset"
              type="number"
              value={offset}
              onChange={e => setOffset(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Limit"
              type="number"
              value={limit}
              onChange={e => setLimit(e.target.value)}
            />
          </>
        )}

        <FormControl fullWidth margin="normal">
          <InputLabel id="preset-label">プリセット</InputLabel>
          <Select
            labelId="preset-label"
            value={selectedPreset}
            onChange={e => handlePresetSelect(e.target.value)}
          >
            {Object.keys(presets).map(preset => (
              <MenuItem key={preset} value={preset}>{preset}</MenuItem>
            ))}
            <MenuItem value="ordinals">Ordinals</MenuItem> {/* Ordinalsのプリセットオプションを追加 */}
          </Select>
        </FormControl>

        <Box marginY={2}>
          <Button variant="contained" color="primary" type="submit" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Fetch Data"}
          </Button>
          <Button variant="contained" color="secondary" onClick={saveDataAsImage} style={{ marginLeft: '10px' }} disabled={loading}>
            Save Data as Image
          </Button>
          <Button variant="contained" color="secondary" onClick={() => saveDataToSheet(result)} style={{ marginLeft: '10px' }} disabled={loading}>
            Save Data to Google Sheets
          </Button>
        </Box>
      </form>

      <Typography variant="h2">Result:</Typography>
      {result && Array.isArray(result) ? (
        result.map((res, index) => (
          <DataDisplay key={index} data={transformData(res, res.type || type)} />
        ))
      ) : (
        result && <DataDisplay data={transformData(result, type)} />
      )}
    </Box>
  );
};

export default ApiForm;
