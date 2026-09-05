import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StoreProvider } from './store/store';
import './index.css';

registerSW({ immediate: true });

const root = document.getElementById('root');
if (!root) throw new Error('#root not found');

createRoot(root).render(
  <StrictMode>
    <ErrorBoundary>
      <StoreProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StoreProvider>
    </ErrorBoundary>
  </StrictMode>,
);
