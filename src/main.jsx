import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { LangProvider } from './i18n.jsx';
import AuthGate from './components/AuthGate.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <AuthGate>{(user) => <App key={user?.uid || 'local'} user={user} />}</AuthGate>
    </LangProvider>
  </React.StrictMode>,
);
