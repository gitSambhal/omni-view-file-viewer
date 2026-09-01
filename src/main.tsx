/**
 * @license Apache-2.0
 * Developer: Suhail Akhtar (https://suhail.top)
 * OmniView File Studio - Main Application Mount Point
 */

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './services/swRegister.ts';

registerServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

