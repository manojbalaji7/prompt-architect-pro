import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully suppress benign environment WebSocket / HMR notifications in iframe preview
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.message || String(event.reason || '');
    if (reason.includes('WebSocket') || reason.includes('ws') || reason.includes('vite')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args.join(' ');
    if (msg.includes('[vite] failed to connect to websocket') || msg.includes('WebSocket closed without opened')) {
      return;
    }
    originalError.apply(console, args);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

