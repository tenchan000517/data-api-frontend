import React, { useState } from 'react';
import { Box, Button, FormControl, TextField, CircularProgress, InputLabel, Select, MenuItem } from '@mui/material';
import nftPresets from './nftPresets.json';

const NftForm = ({ onFetchData, loading }) => {
  const [chain, setChain] = useState('ethereum');
  const [collectionSlug, setCollectionSlug] = useState('');
  const [preset, setPreset] = useState('individual');  // デフォルトを個別に設定
  const [sort, setSort] = useState('allTimeVolume');
  const [limit, setLimit] = useState(20);

  const fetchNftData = async () => {
    const url = new URL('https://data-api2024.azurewebsites.net/info');
    const params = { type: 'collections', chain, collectionSlug, sort, limit };

    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.append(key, params[key]);
    });

    console.log('Request URL:', url.toString());
    console.log('Request Params:', params);

    const response = await fetch(url);
    const data = await response.json();

    console.log('Response Status:', response.status);
    console.log('Response Data:', data);

    return data;
  };

  const fetchPresetData = async () => {
    const results = [];
    for (const preset of nftPresets.presets) {  // プリセット内の各コレクションをループ処理
        const url = new URL('https://data-api2024.azurewebsites.net/info');
        const params = { type: 'collections', chain: preset.chain, collectionSlug: preset.collectionSlug, sort, limit };

        Object.keys(params).forEach(paramKey => {
            if (params[paramKey]) url.searchParams.append(paramKey, params[paramKey]);
        });

        console.log('Request URL:', url.toString());
        console.log('Request Params:', params);

        const response = await fetch(url);
        const data = await response.json();

        console.log('Response Status:', response.status);
        console.log('Response Data:', data);

        if (data.collections && data.collections.length > 0) {
            results.push(...data.collections);  // `results` 配列に追加
        } else {
            // データが存在しない場合、空のデータを追加
            results.push({
                "トークン名/コレクション名": "－",
                "シンボル": "－",
                "フロアプライス": "－",
                "時価総額": "－",
                "24時間取引高": "－",
                "最大供給量": "－",
                "ホルダー数": "－",
                "取引回数": "－",
                "価格変動（24時間）": "－",
                "価格変動（7日間）": "－",
                "価格変動（30日間）": "－",
                "対USDTの金額": "－",
                "対日本円": "－",
                "24時間の売買数及び売上高": "－",
                "マーケットキャップ": "－",
                "前日差（フロア価格）": "－",
                "供給数": "－",
                "所有者数": "－",
                "リスト数": "－"
            });
        }
    }
    return results;
};


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted');
    console.log('Chain:', chain);
    console.log('Collection Slug:', collectionSlug);
    const isPresetSelected = preset !== 'individual'; // プリセットが選択されているかをチェック
    console.log(isPresetSelected ? 'プリセットが選択されました。' : '個別のコレクションが選択されました。');
    console.log('handleSubmit - isPresetSelected:', isPresetSelected);  // 追加ログ
    if (isPresetSelected) {
      onFetchData(fetchPresetData, true); // プリセットデータ取得関数を渡す
    } else {
      onFetchData(fetchNftData, false); // 個別データ取得関数を渡す
    }
  };

  const handlePresetSelect = (e) => {
    console.log('Preset Selected:', e.target.value);
    const selectedPreset = nftPresets.presets; // プリセットデータ全体を取得するように変更
    if (selectedPreset) {
      console.log('Preset Data:', selectedPreset);
    }
    setPreset(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="preset-label">プリセット</InputLabel>
        <Select
          labelId="preset-label"
          value={preset}
          onChange={handlePresetSelect}
        >
          <MenuItem value="individual">個別</MenuItem>
          {Object.keys(nftPresets).map(key => (
            <MenuItem key={key} value={key}>{key}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Chain"
          value={chain}
          onChange={e => setChain(e.target.value)}
          disabled={preset !== 'individual'}  // プリセット選択時は無効化
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Collection Slug"
          value={collectionSlug}
          onChange={e => setCollectionSlug(e.target.value)}
          disabled={preset !== 'individual'}  // プリセット選択時は無効化
        />
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="sort-label">Sort</InputLabel>
        <Select
          labelId="sort-label"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <MenuItem value="allTimeVolume">All Time Volume</MenuItem>
          <MenuItem value="24hVolume">24h Volume</MenuItem>
          <MenuItem value="7dVolume">7d Volume</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <TextField
          label="Limit"
          type="number"
          value={limit}
          onChange={e => setLimit(e.target.value)}
        />
      </FormControl>
      <Box marginY={2}>
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Fetch Data"}
        </Button>
      </Box>
    </form>
  );
};

export default NftForm;
