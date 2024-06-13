import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

const GoogleSheetForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const fetchAndWriteData = async (type) => {
    setLoading(true);
    try {
      // データ取得ロジック
      const data = await fetch(`/api/info?type=${type}`);
      const jsonData = await data.json();

      // タイムスタンプを追加
      const timestamp = new Date().toISOString();
      const transformedData = transformData(jsonData, type).map((item) => ({
        Timestamp: timestamp,
        ...item,
      }));

      // Google Sheetsに書き込み
      const payload = {
        requests: [
          {
            spreadsheetId: process.env.REACT_APP_SPREADSHEET_ID,
            sheetName: type === 'nft' ? 'NFT' : type === 'ordinals' ? 'Ordinals' : 'BRC20',
            range: 'A1',
            values: transformedData,
          },
        ],
      };

      const response = await fetch('/api/googleSheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      setResult(result);
    } catch (error) {
      console.error('Error:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
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
          "1MONTH": item.market_data.price_change_percentage_30d_in_currency?.usd ? `${item.market_data.price_change_percentage_30d_in_currency.usd.toFixed(2)}%` : "－",
          "買い圧・売り圧": item.tickers?.[0]?.bid_ask_spread_percentage ? `${item.tickers[0].bid_ask_spread_percentage.toFixed(2)}%` : "－",
          "対USDT価格": item.tickers?.[0]?.converted_last?.usd ? `$${item.tickers[0].converted_last.usd.toLocaleString()}` : "－",
          "総取引高 (BTC)": item.market_data?.total_volume?.btc ? `${item.market_data.total_volume.btc.toLocaleString()} BTC` : "－",
        };
      });
    }

    return data;
  };

  // 初期読み込み時にデータ取得と書き込みを行う
  useEffect(() => {
    const types = ['nft', 'ordinals', 'brc20'];
    types.forEach((type) => {
      fetchAndWriteData(type);
    });
  }, []);

  return (
    <Box>
      <Typography variant="h4">Google Sheets Data Entry</Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => fetchAndWriteData('nft')} 
        disabled={loading}
      >
        Fetch and Write NFT Data
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => fetchAndWriteData('ordinals')} 
        disabled={loading}
      >
        Fetch and Write Ordinals Data
      </Button>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => fetchAndWriteData('brc20')} 
        disabled={loading}
      >
        Fetch and Write BRC20 Data
      </Button>
      {loading && <Typography variant="body1">Loading...</Typography>}
      {result && (
        <Box mt={2}>
          <Typography variant="h6">Result:</Typography>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
};

export default GoogleSheetForm;
