import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

/**
 * 应用程序入口点
 * 渲染主应用组件到DOM
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)