import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import axios from 'axios';
import App from './App.tsx';
import './index.css';

// TODO: RESTORE AUTH — hapus interceptor ini setelah auth dibangun ulang
// Global axios interceptor: inject x-mock-role header ke SEMUA request
axios.interceptors.request.use((config) => {
  const mockRole = localStorage.getItem('dev_mock_role') || 'RUMAH_TANGGA';
  config.headers['x-mock-role'] = mockRole;
  return config;
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
