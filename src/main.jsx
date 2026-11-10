import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './i18n.jsx';
import AuthGate from './components/AuthGate.jsx';
import './styles.css';

// Service worker doar în versiunea publicată (în dezvoltare ar păstra fișiere vechi).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AuthGate>{(user) => <App key={user?.uid || 'local'} user={user} />}</AuthGate>
    </LangProvider>
  </React.StrictMode>,
);
