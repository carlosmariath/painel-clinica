import api from "../api";

const ENDPOINT = "/users/clients";

// Cache simples para otimização
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Definindo a interface do cliente
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subscriptions?: any[];
}

// 🔹 Buscar todos os clientes (formato original)
export const getClients = async (): Promise<Client[]> => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

// 🔹 Buscar todos os clientes com paginação
export const getClientsPaginated = async (page = 1, limit = 20): Promise<{ data: Client[]; total: number; totalPages: number }> => {
  const cacheKey = `clients_paginated_${page}_${limit}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await api.get(`${ENDPOINT}/paginated?page=${page}&limit=${limit}`);
  
  // Cache the result
  cache.set(cacheKey, { data: response.data, timestamp: Date.now() });
  
  return response.data;
};

// 🔹 Invalidar cache quando necessário
export const invalidateClientsCache = () => {
  for (const key of cache.keys()) {
    if (key.startsWith('clients_')) {
      cache.delete(key);
    }
  }
};

// 🔹 Buscar um cliente pelo ID
export const getClientById = async (id: string): Promise<Client> => {
  const response = await api.get(`${ENDPOINT}/${id}`);
  return response.data;
};

// 🔹 Criar um novo cliente
export const createClient = async (clientData: { 
  name: string; 
  email: string; 
  phone?: string 
}): Promise<Client> => {
  const response = await api.post(ENDPOINT, clientData);
  invalidateClientsCache(); // Invalidar cache após criação
  return response.data;
};

// 🔹 Atualizar um cliente existente
export const updateClient = async (
  id: string, 
  clientData: { 
    name?: string; 
    email?: string; 
    phone?: string 
  }
): Promise<Client> => {
  const response = await api.put(`${ENDPOINT}/${id}`, clientData);
  invalidateClientsCache(); // Invalidar cache após atualização
  return response.data;
};

// 🔹 Excluir um cliente
export const deleteClient = async (id: string): Promise<void> => {
  await api.delete(`${ENDPOINT}/${id}`);
  invalidateClientsCache(); // Invalidar cache após exclusão
};