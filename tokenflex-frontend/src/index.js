import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Google Fonts yükleyelim (fallback, index.html'de zaten var)
if (!document.getElementById('roboto-font')) {
  const link = document.createElement('link');
  link.id = 'roboto-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
  document.head.appendChild(link);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);