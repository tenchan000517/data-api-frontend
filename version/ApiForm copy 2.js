import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import html2canvas from 'html2canvas';
import DataDisplay from './DataDisplay';

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

  const presets = {
    preset1: [
      { type: 'nft', chain: 'ethereum', contractAddress: '0x1234...' },
      { type: 'erc20', chain: 'ethereum', contractAddress: '0x5678...' },
      // 他のプリセットデータを追加
    ],
  };

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
    const results = [];
    for (const { type, chain, contractAddress, symbol, collectionSlug } of presets[preset]) {
      let url = new URL('https://data-api2024.azurewebsites.net/info');
      const params = { type, chain, contractAddress, symbol, collectionSlug };
      Object.keys(params).forEach(key => {
        if (params[key]) url.searchParams.append(key, params[key]);
      });

      try {
        const response = await fetch(url);
        const data = await response.json();
        results.push(data);
      } catch (error) {
        console.error('Error:', error);
      }
    }
    return results;
  };

  const handlePresetSelect = async (preset) => {
    const data = await fetchPresetData(preset);
    setResult(data);
  };

  const transformData = (data, type) => {
    if (type === 'collections') {
      const collection = data.collections[0];
      return {
        "トークン名/コレクション名": collection.name || "N/A",
        "シンボル": collection.symbol || "N/A",
        "現在価格": collection.floorAsk?.price?.usd || "N/A",
        "時価総額": collection.market_cap || "N/A",
        "24時間取引高": collection.volume?.["1day"] || "N/A",
        "発行量": collection.tokenCount || "N/A",
        "最大供給量": collection.max_supply || "N/A",
        "ホルダー数": collection.ownerCount || "N/A",
        "取引回数": collection.trade_count || "N/A",
        "価格変動": {
          "24時間": collection.floorSaleChange?.["1day"] || "N/A",
          "7日間": collection.floorSaleChange?.["7day"] || "N/A",
          "30日間": collection.floorSaleChange?.["30day"] || "N/A",
        },
        "買い圧・売り圧": collection.order_book || "N/A",
        "主要取引所": collection.exchanges || "N/A",
        "デベロッパー活動": collection.developer_activity || "N/A",
        "コミュニティエンゲージメント": collection.community_engagement || "N/A",
        "対USDTの金額": collection.price_usdt || "N/A",
        "対日本円": collection.price_jpy || "N/A",
        "フロアプライス": collection.floorAsk?.price?.usd || "N/A",
        "24時間の売買数及び売上高": collection.sales_volume_24h || "N/A",
        "マーケットキャップ": collection.market_cap || "N/A",
        "前日差（フロア価格）": collection.floor_price_change_24h || "N/A",
        "供給数": collection.tokenCount || "N/A",
        "所有者数": collection.ownerCount || "N/A",
        "リスト数": collection.list_count || "N/A",
      };
    }

    if (type === 'ordinals') {
      return {
        "コレクションID": data.collectionId || "N/A",
        "コレクションシンボル": data.collectionSymbol || "N/A",
        "通貨": data.currency || "N/A",
        "USDレート": data.currencyUsdRate || "N/A",
        "フロア価格": data.fp || "N/A",
        "フロア価格（通貨）": data.fpListingCurrency || "N/A",
        "フロア価格（値段）": data.fpListingPrice || "N/A",
        "フロア価格の変動率": data.fpPctChg || "N/A",
        "画像": data.image || "N/A",
        "リスト数": data.listedCount || "N/A",
        "時価総額": data.marketCap || "N/A",
        "時価総額（USD）": data.marketCapUsd || "N/A",
        "名前": data.name || "N/A",
        "保有者数": data.ownerCount || "N/A",
        "供給数": data.totalSupply || "N/A",
        "取引量": data.totalVol || "N/A",
        "取引数": data.txns || "N/A",
        "取引数の変動率": data.txnsPctChg || "N/A",
        "ユニーク保有者比率": data.uniqueOwnerRatio || "N/A",
        "取引量の変動率": data.volPctChg || "N/A"
      };
    }

    if (type === 'brc20') {
      const marketData = data.market_data || {};
      return {
        "トークン名": data.name || "N/A",
        "シンボル": data.symbol || "N/A",
        "現在価格": marketData.current_price?.usd || "N/A",
        "時価総額": marketData.market_cap?.usd || "N/A",
        "24時間取引高": marketData.total_volume?.usd || "N/A",
        "発行量": marketData.circulating_supply || "N/A",
        "最大供給量": marketData.max_supply || "N/A",
        "ホルダー数": data.community_data?.reddit_subscribers || "N/A",
        "取引回数": data.tickers?.length || "N/A",
        "価格変動": {
          "24時間": marketData.price_change_percentage_24h || "N/A",
          "7日間": marketData.price_change_percentage_7d || "N/A",
          "30日間": marketData.price_change_percentage_30d || "N/A",
        },
        "買い圧・売り圧": data.tickers?.[0]?.bid_ask_spread_percentage || "N/A",
        "主要取引所": data.tickers?.[0]?.market?.name || "N/A",
        "デベロッパー活動": data.developer_data?.commit_count_4_weeks || "N/A",
        "コミュニティエンゲージメント": data.community_data?.twitter_followers || "N/A",
        "対USDTの金額": marketData.current_price?.usdt || "N/A",
        "対日本円": marketData.current_price?.jpy || "N/A",
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
            onChange={e => { setType(e.target.value); toggleFields(e.target.value); }}
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
            onChange={e => handlePresetSelect(e.target.value)}
          >
            <MenuItem value="preset1">プリセット①</MenuItem>
            {/* 他のプリセットも追加 */}
          </Select>
        </FormControl>

        <Box marginY={2}>
          <Button variant="contained" color="primary" type="submit">
            Fetch Data
          </Button>
          <Button variant="contained" color="secondary" onClick={saveDataAsImage} style={{ marginLeft: '10px' }}>
            Save Data as Image
          </Button>
          <Button variant="contained" color="secondary" onClick={() => saveDataToSheet(result)} style={{ marginLeft: '10px' }}>
            Save Data to Google Sheets
          </Button>
        </Box>
      </form>

      <Typography variant="h2">Result:</Typography>
      {result && Array.isArray(result) ? (
        result.map((res, index) => (
          <DataDisplay key={index} data={transformData(res, type)} />
        ))
      ) : (
        result && <DataDisplay data={transformData(result, type)} />
      )}
    </Box>
  );
};

export default ApiForm;
