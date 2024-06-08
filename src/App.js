import React from 'react';
import ApiForm from './components/ApiForm';  // 新しいコンポーネントをインポート
import './App.css';

function App() {
  return (
    <div className="app-container">
      <ApiForm />  {/* 新しいコンポーネントを追加 */}
    </div>
  );
}

export default App;
