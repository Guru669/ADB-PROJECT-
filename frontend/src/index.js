import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// --- Console Guard: Silencing environment-side noise (HDS/Extensions) ---
const suppressList = ['WebSocket', 'hooks', 'content_script.js'];
const originalWarn = console.warn;
const originalError = console.error;

console.warn = (...args) => {
  if (typeof args[0] === 'string' && suppressList.some(s => args[0].includes(s))) return;
  originalWarn.apply(console, args);
};

console.error = (...args) => {
  if (typeof args[0] === 'string' && suppressList.some(s => args[0].includes(s))) return;
  originalError.apply(console, args);
};
// -----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
