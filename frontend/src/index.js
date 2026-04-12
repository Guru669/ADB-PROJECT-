import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// --- Console Guard & WebSocket Patch: Silencing environment-side noise ---
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

// Intercept WebSocket to prevent Render.com HMR reload loops
const OriginalWebSocket = window.WebSocket;
window.WebSocket = function(url, protocols) {
  if (typeof url === 'string' && url.includes('onrender.com')) {
    if (!window.__websocket_blocked) {
      console.debug("Problematic WebSocket HMR connection intercepted and silenced.");
      window.__websocket_blocked = true;
    }
    return {
      close: () => {},
      send: () => {},
      readyState: 3, 
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }
  return new OriginalWebSocket(url, protocols);
};
window.WebSocket.prototype = OriginalWebSocket.prototype;
// -----------------------------------------------------------------------

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
