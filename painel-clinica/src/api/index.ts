import axios from 'axios';
import { API_URL } from '../config';

// Criação da instância do axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona interceptor para incluir token de autenticação em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Obtém o token do localStorage ou estado da aplicação
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento global de erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratamento global de erros
    if (error.response) {
      // Erro na resposta do servidor
      const { status } = error.response;
      
      if (status === 401) {
        // Token expirado ou inválido
        localStorage.removeItem('access_token');
        // Redirecionar para a página de login se necessário
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 