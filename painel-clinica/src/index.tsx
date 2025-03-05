import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { NotificationProvider } from './components/Notification';
// Configuração do Dayjs
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

// Configurar o Dayjs para usar a localização portuguesa
dayjs.locale('pt-br');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
    </NotificationProvider>
  </React.StrictMode>
); 