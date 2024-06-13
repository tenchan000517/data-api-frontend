import React, { useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import DataDisplay from './DataDisplay';
import presetsData from './presets.json';
import NftForm from './NftForm';
import OrdinalsForm from './OrdinalsForm';
import Brc20Form from './Brc20Form';

const ApiForm = () => {
  const [type, setType] = useState('nft');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPreset, setIsPreset] = useState(false);
  const [chain, setChain] = useState('ethereum');  // 初期チェーン名を設定

  const chainIdToName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'ethereum';
      case 137:
        return 'polygon';
      case 250:
        return 'fantom';
      case 43114:
        return 'avalanche';
      // 他のチェーンIDに対するケースを追加
      default:
        return 'ethereum';
    }
  };

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setResult(null);
  };

  const handleFetchData = async (fetchFunction, presetFlag = false) => {
    console.log('handleFetchData - presetFlag:', presetFlag);

    setLoading(true);
    setIsPreset(presetFlag);
    console.log('handleFetchData - isPreset set to:', presetFlag);

    try {
      const data = await fetchFunction();
      console.log('Fetched data:', data);

      setResult(data);
      if (data.collections && data.collections.length > 0) {
        const chainId = data.collections[0].chainId;
        const chainName = chainIdToName(chainId);
        setChain(chainName);
        console.log('Fetched chain:', chainName);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getCurrency = (type, item) => {
    switch (type) {
      case 'collections':
      case 'nft':
        return item.floorAsk?.price?.currency?.symbol || getCurrencyFromChain(item.chain || 'ethereum');
      case 'ordinals':
        return item.currency || item.fpListingCurrency || 'BTC';
      case 'brc20':
        return 'USD';
      default:
        return '';
    }
  };

  const getCurrencyFromChain = (chain) => {
    switch (chain.toLowerCase()) {
      case 'polygon':
        return 'MATIC';
      case 'solana':
        return 'SOL';
      case 'ethereum':
        return 'ETH';
      // 他のチェーン名に対するケースを追加
      default:
        return 'ETH';
    }
  };

  const transformData = (data, type) => {
    let collections = [];

    if (type === 'collections' || type === 'nft') {
      if (data.collections) {
        collections = data.collections;
      } else if (Array.isArray(data)) {
        collections = data;
      } else {
        console.error('Expected collections to be an array but received:', data);
        return [];
      }

      return collections.map(collection => {
        const priceChange = collection.floorSaleChange || {};
        const currency = getCurrencyFromChain(collection.chain || 'ethereum');
        const listRate = collection.tokenCount && collection.onSaleCount ? ((collection.onSaleCount / collection.tokenCount) * 100).toFixed(2) : '－';
        const marketCap = collection.volume?.allTime 
          ? `${collection.volume.allTime.toLocaleString()} ${currency}`
          : collection.tokenCount && collection.floorSale?.["1day"]
            ? `${(collection.tokenCount * collection.floorSale["1day"]).toLocaleString()} ${currency}`
            : "－";

        return {
          "コレクション": collection.name || "－",
          "フロアプライス": collection.floorSale?.["1day"] ? `${collection.floorSale["1day"].toLocaleString()} ${currency}` : "－",
          "マーケットキャップ": marketCap,
          "24時間取引高": collection.volume?.["1day"] ? `${collection.volume["1day"].toLocaleString()} ${currency}` : "－",
          "最大供給量": collection.tokenCount ? collection.tokenCount.toLocaleString() : "－",
          "ホルダー数": collection.ownerCount ? collection.ownerCount.toLocaleString() : "－",
          "1DAY": priceChange["1day"] ? `${priceChange["1day"].toFixed(2)}%` : "－",
          "1WEEK": priceChange["7day"] ? `${priceChange["7day"].toFixed(2)}%` : "－",
          "1MONTH": priceChange["30day"] ? `${priceChange["30day"].toFixed(2)}%` : "－",
          "リスト率": listRate !== '－' ? `${listRate}%` : "－",
        };
      });
    }

    if (type === 'ordinals') {
      if (!Array.isArray(data)) {
        console.error('Expected ordinals data to be an array but received:', data);
        return [];
      }

      return data.map(item => {
        const currency = getCurrency(type, item);
        return {
          "コレクション": item.collectionId || "－",
          "フロアプライス": item.fp ? `${item.fp.toLocaleString()} ${currency}` : "－",
          "マーケットキャップ": item.marketCap ? `${item.marketCap.toLocaleString()} ${currency}` : "－",
          "マーケットキャップ(USD)": item.marketCapUsd ? `$${item.marketCapUsd.toLocaleString()}` : "－",
          "保有者数": item.ownerCount ? item.ownerCount.toLocaleString() : "－",
          "供給数": item.totalSupply ? item.totalSupply.toLocaleString() : "－",
          "取引量": item.totalVol ? item.totalVol.toLocaleString() : "－",
          "24時間価格変動率": item.fpPctChg ? `${item.fpPctChg.toFixed(2)}%` : "－",
          "取引量の変動率": item.volPctChg ? `${item.volPctChg.toFixed(2)}%` : "－",
        };
      });
    }

    if (type === 'brc20') {
      if (!Array.isArray(data)) {
        console.error('Expected BRC20 data to be an array but received:', data);
        return [];
      }

      return data.map(item => {
        const marketCap = item.market_data?.market_cap?.usd 
        ? `$${item.market_data.market_cap.usd.toLocaleString()}`
        : item.market_data?.max_supply && item.market_data?.current_price?.usd
          ? `$${(item.market_data.max_supply * item.market_data.current_price.usd).toLocaleString()}`
          : "－";
        return {
          "コレクション": item.name || "－",
          "現在価格": item.market_data?.current_price?.usd ? `$${item.market_data.current_price.usd.toLocaleString()}` : "－",
          "マーケットキャップ": marketCap,
          "1DAY Volume": item.market_data?.total_volume?.usd ? `$${item.market_data.total_volume.usd.toLocaleString()}` : "－",
          "供給数": item.market_data?.max_supply ? item.market_data.max_supply.toLocaleString() : "－",
          "1DAY": item.market_data?.price_change_percentage_24h_in_currency?.usd ? `${item.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%` : "－",
        //   "1WEEK": item.market_data?.price_change_percentage_7d_in_currency?.usd ? `${item.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2)}%` : "－",
          "1MONTH": item.market_data.price_change_percentage_30d_in_currency?.usd ? `${item.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2)}%` : "－",
          "買い圧・売り圧": item.tickers?.[0]?.bid_ask_spread_percentage ? `${item.tickers[0].bid_ask_spread_percentage.toFixed(2)}%` : "－",
          "対USDT価格": item.tickers?.[0]?.converted_last?.usd ? `$${item.tickers[0].converted_last.usd.toLocaleString()}` : "－",
          "総取引高 (BTC)": item.market_data?.total_volume?.btc ? `${item.market_data.total_volume.btc.toLocaleString()} BTC` : "－",
        };
      });
    }

    return data;
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h1">ZERO to ONE WEB3 Market Informations</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="type-label">Type</InputLabel>
        <Select
          labelId="type-label"
          value={type}
          onChange={handleTypeChange}
        >
          <MenuItem value="nft">NFT</MenuItem>
          <MenuItem value="ordinals">Ordinals</MenuItem>
          <MenuItem value="brc20">BRC20</MenuItem>
        </Select>
      </FormControl>

      {type === 'nft' && (
        <NftForm onFetchData={(fetchFunc, isPreset) => {
          console.log('NftForm - onFetchData called with isPreset:', isPreset);
          handleFetchData(fetchFunc, isPreset);
        }} loading={loading} />
      )}
      {type === 'ordinals' && (
        <OrdinalsForm onFetchData={(fetchFunc) => handleFetchData(fetchFunc, true)} loading={loading} />
      )}
      {type === 'brc20' && (
        <Brc20Form onFetchData={(fetchFunc) => handleFetchData(fetchFunc, true)} loading={loading} presets={presetsData} />
      )}

      {result && (
        <DataDisplay data={transformData(result, type)} type={type} isPreset={isPreset} chain={chain} />
      )}
    </Box>
  );
};

export default ApiForm;
