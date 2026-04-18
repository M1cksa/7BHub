import React from 'react'

// Block analytics batch requests that cause CORS errors
const _origOpen = XMLHttpRequest.prototype.open;
XMLHttpRequest.prototype.open = function(method, url, ...args) {
  if (typeof url === 'string' && url.includes('/analytics/')) {
    this._blocked = true;
    return;
  }
  return _origOpen.call(this, method, url, ...args);
};
const _origSend = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.send = function(...args) {
  if (this._blocked) return;
  return _origSend.call(this, ...args);
};

// Also block via fetch
const _origFetch = window.fetch;
window.fetch = function(input, ...args) {
  const url = typeof input === 'string' ? input : input?.url;
  if (url && url.includes('/analytics/')) {
    return Promise.resolve(new Response('{}', { status: 200 }));
  }
  return _origFetch.call(this, input, ...args);
};
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}