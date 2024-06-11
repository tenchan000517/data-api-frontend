const presets = {
    preset1: [
      { type: 'nft', chain: 'ethereum', contractAddress: '0x1234...' },
      { type: 'erc20', chain: 'ethereum', contractAddress: '0x5678...' },
      // 他のプリセットデータを追加
    ],
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
  
  // フォーム内にプリセット選択機能を追加
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
  