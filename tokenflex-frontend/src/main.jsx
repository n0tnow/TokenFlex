import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Google Fonts yükleyelim (fallback, index.html'de zaten var)
if (!document.getElementById('roboto-font')) {
  const link = document.createElement('link');
  link.id = 'roboto-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
  document.head.appendChild(link);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)