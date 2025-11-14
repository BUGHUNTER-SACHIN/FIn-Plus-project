import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './FB.jsx';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element not found. Make sure index.html has a <div id="root"></div>');
}

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
