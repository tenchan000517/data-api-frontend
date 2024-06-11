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
  const [isPreset, setIsPreset] = useState(false);  // 追加

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setResult(null); // タイプ変更時にデータをリセット
  };

  const handleFetchData = async (fetchFunction, presetFlag = false) => {  // 変更
    console.log('handleFetchData - presetFlag:', presetFlag);  // ログ追加

    setLoading(true);
    setIsPreset(presetFlag);  // 追加
    console.log('handleFetchData - isPreset set to:', presetFlag);  // ログ追加

    try {
      const data = await fetchFunction();
      setResult(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const transformData = (data, type) => {
    let collections = [];
  
    if (type === 'collections' || type === 'nft') {
      // 個別取得の場合
      if (data.collections) {
        collections = data.collections;
      } else if (Array.isArray(data)) {
        // プリセット取得の場合
        collections = data;
      } else {
        console.error('Expected collections to be an array but received:', data);
        return [];
      }
  
      return collections.map(collection => {
        const priceChange = collection.floorSaleChange || {};
        return {
            "トークン名/コレクション名": collection.name || "－",
            "フロアプライス": collection.floorSale?.["1day"] ? `$${collection.floorSale["1day"].toLocaleString()}` : "－",
            "時価総額": collection.volume?.allTime ? `$${collection.volume.allTime.toLocaleString()}` : "－",
            "24時間取引高": collection.volume?.["1day"] ? `$${collection.volume["1day"].toLocaleString()}` : "－",
            "最大供給量": collection.tokenCount ? collection.tokenCount.toLocaleString() : "－",
            "ホルダー数": collection.ownerCount ? collection.ownerCount.toLocaleString() : "－",
            "価格変動（24時間）": priceChange["1day"] ? `${priceChange["1day"].toFixed(2)}%` : "－",
            "価格変動（7日間）": priceChange["7day"] ? `${priceChange["7day"].toFixed(2)}%` : "－",
            "価格変動（30日間）": priceChange["30day"] ? `${priceChange["30day"].toFixed(2)}%` : "－",
            "前日差（フロア価格）": priceChange["1day"] ? `${priceChange["1day"].toFixed(2)}%` : "－",
            "リスト数": collection.onSaleCount ? collection.onSaleCount.toLocaleString() : "－",
          };
        });
      }
    
      if (type === 'ordinals') {
        return data.map(item => ({
          "コレクションID": item.collectionId || "－",
          "フロア価格": item.fp ? `$${item.fp.toLocaleString()}` : "－",
          "フロア価格（値段）": item.fpListingPrice ? `$${item.fpListingPrice.toLocaleString()}` : "－",
          "フロア価格の変動率": item.fpPctChg ? `${item.fpPctChg.toFixed(2)}%` : "－",
          "時価総額": item.marketCap ? `$${item.marketCap.toLocaleString()}` : "－",
          "時価総額（USD）": item.marketCapUsd ? `$${item.marketCapUsd.toLocaleString()}` : "－",
          "保有者数": item.ownerCount ? item.ownerCount.toLocaleString() : "－",
          "供給数": item.totalSupply ? item.totalSupply.toLocaleString() : "－",
          "取引量": item.totalVol ? item.totalVol.toLocaleString() : "－",
          "取引量の変動率": item.volPctChg ? `${item.volPctChg.toFixed(2)}%` : "－",
          "USDレート": item.currencyUsdRate ? `$${item.currencyUsdRate.toFixed(2)}` : "－",
        }));
      }

    if (type === 'brc20') {
      return data.map(item => ({
        "トークン名": item.name || "－",
        "現在価格": item.market_data?.current_price?.usd ? `$${item.market_data.current_price.usd.toLocaleString()}` : "－",
        "時価総額": item.market_data?.market_cap?.usd ? `$${item.market_data.market_cap.usd.toLocaleString()}` : "－",
        "24時間取引高": item.market_data?.total_volume?.usd ? `$${item.market_data.total_volume.usd.toLocaleString()}` : "－",
        "最大供給量": item.market_data?.max_supply ? item.market_data.max_supply.toLocaleString() : "－",
        "24時間価格変動率": item.market_data?.price_change_percentage_24h_in_currency?.usd ? `${item.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%` : "－",
        "7日間価格変動率": item.market_data?.price_change_percentage_7d_in_currency?.usd ? `${item.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2)}%` : "－",
        "30日間価格変動率": item.market_data.price_change_percentage_30d_in_currency?.usd ? `${item.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2)}%` : "－",
        "買い圧・売り圧": item.tickers?.[0]?.bid_ask_spread_percentage ? `${item.tickers[0].bid_ask_spread_percentage.toFixed(2)}%` : "－",
        "主要取引所": item.tickers?.[0]?.market?.name || "－",
        "対USDT価格": item.tickers?.[0]?.converted_last?.usd ? `$${item.tickers[0].converted_last.usd.toLocaleString()}` : "－",
        "総取引高 (BTC)": item.market_data?.total_volume?.btc ? `${item.market_data.total_volume.btc.toLocaleString()} BTC` : "－",
      }));
    }

    return data;
  };

  return (
    <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h1">API Test</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel id="type-label">Type</InputLabel>
        <Select
          labelId="type-label"
          value={type}
          onChange={handleTypeChange} // タイプ変更時にデータをリセット
        >
          <MenuItem value="nft">NFT</MenuItem>
          <MenuItem value="ordinals">Ordinals</MenuItem>
          <MenuItem value="brc20">BRC20</MenuItem>
        </Select>
      </FormControl>

      {type === 'nft' && (
        <NftForm onFetchData={(fetchFunc, isPreset) => {
          console.log('NftForm - onFetchData called with isPreset:', isPreset);  // ログ追加
          handleFetchData(fetchFunc, isPreset);
        }} loading={loading} />
      )}
      {type === 'ordinals' && (
        <OrdinalsForm onFetchData={(fetchFunc) => handleFetchData(fetchFunc, true)} loading={loading} />  // 変更
      )}
      {type === 'brc20' && (
        <Brc20Form onFetchData={(fetchFunc) => handleFetchData(fetchFunc, true)} loading={loading} presets={presetsData} />  // 変更
      )}

      {result && (
        <DataDisplay data={transformData(result, type)} type={type} isPreset={isPreset} />  // 変更
      )}
    </Box>
  );
};

export default ApiForm;
