import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './views/Home';
import GameRoom from './views/GameRoom';
import './App.css';

/**
 * 主应用组件
 * 配置路由和全局样式
 * @returns {JSX.Element} 应用组件
 */
function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>🧙‍♀️ 女巫毒药 Witch Poison</h1>
        </header>
        
        <main className="App-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/game/:gameId?" element={<GameRoom />} />
          </Routes>
        </main>
        
        <footer className="App-footer">
          <p>© 2024 女巫毒药游戏 v0.1.0</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;