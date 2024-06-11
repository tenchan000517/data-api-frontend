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

  const handleTypeChange = (event) => {
    setType(event.target.value);
    setResult(null); // タイプ変更時にデータをリセット
  };

  const handleFetchData = async (fetchFunction) => {
    setLoading(true);
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
    if (type === 'collections' || type === 'nft') {
      if (!Array.isArray(data.collections)) {
        console.error('Expected data.collections to be an array but received:', data.collections);
        return [];
      }
      return data.collections.map(collection => {
        const priceChange = collection.floorSaleChange || {};
        return {
          "トークン名/コレクション名": collection.name || "－",
          "シンボル": collection.symbol || "－",
          "フロアプライス": collection.floorSale?.["1day"] || "－",
          "時価総額": collection.volume?.allTime || "－",
          "24時間取引高": collection.volume?.["1day"] || "－",
          "最大供給量": collection.tokenCount || "－",
          "ホルダー数": collection.ownerCount || "－",
          "取引回数": collection.trade_count || "－",
          "価格変動（24時間）": priceChange["1day"] || "－",
          "価格変動（7日間）": priceChange["7day"] || "－",
          "価格変動（30日間）": priceChange["30day"] || "－",
          "対USDTの金額": collection.floorAsk?.price?.usd || "－",
          "対日本円": collection.price_jpy || "－",
          "24時間の売買数及び売上高": collection.sales_volume_24h || "－",
          "マーケットキャップ": collection.volume?.allTime || "－",
          "前日差（フロア価格）": priceChange["1day"] || "－",
          "供給数": collection.tokenCount || "－",
          "所有者数": collection.ownerCount || "－",
          "リスト数": collection.onSaleCount || "－",
        };
      });
    }

    if (type === 'ordinals') {
      return data.map(item => ({
        "コレクションID": item.collectionId || "－",
        "コレクションシンボル": item.collectionSymbol || "－",
        "通貨": item.currency || "－",
        "USDレート": item.currencyUsdRate || "－",
        "フロア価格": item.fp || "－",
        "フロア価格（通貨）": item.fpListingCurrency || "－",
        "フロア価格（値段）": item.fpListingPrice || "－",
        "フロア価格の変動率": item.fpPctChg || "－",
        "画像": item.image || "－",
        "リスト数": item.listedCount || "－",
        "時価総額": item.marketCap || "－",
        "時価総額（USD）": item.marketCapUsd || "－",
        "名前": item.name || "－",
        "保有者数": item.ownerCount || "－",
        "供給数": item.totalSupply || "－",
        "取引量": item.totalVol || "－",
        "取引数": item.txns || "－",
        "取引数の変動率": item.txnsPctChg || "－",
        "ユニーク保有者比率": item.uniqueOwnerRatio || "－",
        "取引量の変動率": item.volPctChg || "－"
      }));
    }

    if (type === 'brc20') {
      return data.map(item => ({
        "トークン名": item.name || "－",
        "シンボル": item.symbol || "－",
        "現在価格": item.market_data?.current_price?.usd ? `$${item.market_data.current_price.usd.toLocaleString()}` : "－",
        "時価総額": item.market_data?.market_cap?.usd ? `$${item.market_data.market_cap.usd.toLocaleString()}` : "－",
        "24時間取引高": item.market_data?.total_volume?.usd ? `$${item.market_data.total_volume.usd.toLocaleString()}` : "－",
        "発行量": item.market_data?.circulating_supply ? item.market_data.circulating_supply.toLocaleString() : "－",
        "最大供給量": item.market_data?.max_supply ? item.market_data.max_supply.toLocaleString() : "－",
        "取引回数": item.tickers?.length ? item.tickers.length.toLocaleString() : "－",
        "24時間価格変動率": item.market_data?.price_change_percentage_24h_in_currency?.usd ? `${item.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%` : "－",
        "7日間価格変動率": item.market_data?.price_change_percentage_7d_in_currency?.usd ? `${item.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2)}%` : "－",
        "30日間価格変動率": item.market_data.price_change_percentage_30d_in_currency?.usd ? `${item.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2)}%` : "－",
        "買い圧・売り圧": item.tickers?.[0]?.bid_ask_spread_percentage ? `${item.tickers[0].bid_ask_spread_percentage.toFixed(2)}%` : "－",
        "主要取引所": item.tickers?.[0]?.market?.name || "－",
        "対USDT価格": item.tickers?.[0]?.converted_last?.usd ? `$${item.tickers[0].converted_last.usd.toLocaleString()}` : "－",
        "総取引高 (BTC)": item.market_data?.total_volume?.btc ? `${item.market_data.total_volume.btc.toLocaleString()} BTC` : "－",
        "総取引高 (ETH)": item.market_data?.total_volume?.eth ? `${item.market_data.total_volume.eth.toLocaleString()} ETH` : "－",
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
        <NftForm onFetchData={handleFetchData} loading={loading} />
      )}
      {type === 'ordinals' && (
        <OrdinalsForm onFetchData={handleFetchData} loading={loading} />
      )}
      {type === 'brc20' && (
        <Brc20Form onFetchData={handleFetchData} loading={loading} presets={presetsData} />
      )}

      {result && Array.isArray(result) ? (
        <DataDisplay data={transformData(result, type)} type={type} />
      ) : (
        result && <DataDisplay data={transformData(result, type)} type={type} />
      )}
    </Box>
  );
};

export default ApiForm;
