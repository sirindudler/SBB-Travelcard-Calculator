import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Router from './Router';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);

// Umami heartbeat — sends periodic pings so visit duration is tracked accurately.
// No cookies or personal data involved; fully privacy-compliant.
(function startHeartbeat() {
  const INTERVAL_MS = 5_000; // every 5 seconds
  let timer: ReturnType<typeof setInterval> | null = null;

  function ping() {
    if (typeof (window as any).umami !== 'undefined') {
      (window as any).umami.track('heartbeat');
    }
  }

  function start() {
    if (!timer) timer = setInterval(ping, INTERVAL_MS);
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stop() : start();
  });

  start();
})();

reportWebVitals();
