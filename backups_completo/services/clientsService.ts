import api from "../api";

const ENDPOINT = "/users/clients";

// 🔹 Buscar todos os clientes
export const getClients = async () => {
  const response = await api.get(ENDPOINT);
  return response.data;
};

// 🔹 Criar um novo cliente
export const createClient = async (clientData: { name: string; email: string; phone?: string }) => {
  return api.post(`${ENDPOINT}/create`, clientData);
};

// 🔹 Atualizar um cliente existente
export const updateClient = async (id: string, clientData: { name: string; email: string; phone?: string }) => {
  return api.put(`${ENDPOINT}/${id}`, clientData);
};

// 🔹 Excluir um cliente
export const deleteClient = async (id: string) => {
  return api.delete(`${ENDPOINT}/${id}`);
};