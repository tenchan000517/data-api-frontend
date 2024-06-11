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
    if (type === 'collections' && data.collections) {
      const collection = data.collections[0] || {};
      return {
        "トークン名/コレクション名": collection.name || "－",
        "シンボル": collection.symbol || "－",
        "現在価格": collection.floorAsk?.price?.usd || "－",
        "時価総額": collection.market_cap || "－",
        "24時間取引高": collection.volume?.["1day"] || "－",
        "発行量": collection.tokenCount || "－",
        "最大供給量": collection.max_supply || "－",
        "ホルダー数": collection.ownerCount || "－",
        "取引回数": collection.trade_count || "－",
        "価格変動": {
          "24時間": collection.floorSaleChange?.["1day"] || "－",
          "7日間": collection.floorSaleChange?.["7day"] || "－",
          "30日間": collection.floorSaleChange?.["30day"] || "－",
        },
        "買い圧・売り圧": collection.order_book || "－",
        "主要取引所": collection.exchanges || "－",
        "デベロッパー活動": collection.developer_activity || "－",
        "コミュニティエンゲージメント": collection.community_engagement || "－",
        "対USDTの金額": collection.price_usdt || "－",
        "対日本円": collection.price_jpy || "－",
        "フロアプライス": collection.floorAsk?.price?.usd || "－",
        "24時間の売買数及び売上高": collection.sales_volume_24h || "－",
        "マーケットキャップ": collection.market_cap || "－",
        "前日差（フロア価格）": collection.floor_price_change_24h || "－",
        "供給数": collection.tokenCount || "－",
        "所有者数": collection.ownerCount || "－",
        "リスト数": collection.list_count || "－",
      };
    }

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

    if (type === 'brc20') {
      return {
        "トークン名": data.name || "－",
        "シンボル": data.symbol || "－",
        "現在価格": data.market_data?.current_price?.usd ? `$${data.market_data.current_price.usd.toLocaleString()}` : "－",
        "時価総額": data.market_data?.market_cap?.usd ? `$${data.market_data.market_cap.usd.toLocaleString()}` : "－",
        "24時間取引高": data.market_data?.total_volume?.usd ? `$${data.market_data.total_volume.usd.toLocaleString()}` : "－",
        "発行量": data.market_data?.circulating_supply ? data.market_data.circulating_supply.toLocaleString() : "－",
        "最大供給量": data.market_data?.max_supply ? data.market_data.max_supply.toLocaleString() : "－",
        "取引回数": data.tickers?.length ? data.tickers.length.toLocaleString() : "－",
        "24時間価格変動率": data.market_data?.price_change_percentage_24h_in_currency?.usd ? `${data.market_data.price_change_percentage_24h_in_currency.usd.toFixed(2)}%` : "－",
        "7日間価格変動率": data.market_data?.price_change_percentage_7d_in_currency?.usd ? `${data.market_data.price_change_percentage_7d_in_currency.usd.toFixed(2)}%` : "－",
        "30日間価格変動率": data.market_data.price_change_percentage_30d_in_currency?.usd ? `${data.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2)}%` : "－",
        "買い圧・売り圧": data.tickers?.[0]?.bid_ask_spread_percentage ? `${data.tickers[0].bid_ask_spread_percentage.toFixed(2)}%` : "－",
        "主要取引所": data.tickers?.[0]?.market?.name || "－",
        "対USDT価格": data.tickers?.[0]?.converted_last?.usd ? `$${data.tickers[0].converted_last.usd.toLocaleString()}` : "－",
        "総取引高 (BTC)": data.market_data?.total_volume?.btc ? `${data.market_data.total_volume.btc.toLocaleString()} BTC` : "－",
        "総取引高 (ETH)": data.market_data?.total_volume?.eth ? `${data.market_data.total_volume.eth.toLocaleString()} ETH` : "－",
      };
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
          onChange={e => setType(e.target.value)}
        >
          <MenuItem value="nft">NFT</MenuItem>
          <MenuItem value="ordinals">Ordinals</MenuItem>
          <MenuItem value="brc20">BRC20</MenuItem>
          {/* 他のタイプを追加 */}
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