// URL da API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Outras configurações globais da aplicação podem ser adicionadas aqui
export const APP_NAME = 'Painel Clínica';

// Configurações para formatação de data e hora
export const DATE_FORMAT = 'dd/MM/yyyy';
export const TIME_FORMAT = 'HH:mm';
export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// Configurações para formatação de valores monetários
export const CURRENCY_LOCALE = 'pt-BR';
export const CURRENCY_OPTIONS = {
  style: 'currency' as const,
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}; 