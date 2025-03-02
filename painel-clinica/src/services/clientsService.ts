import axios from "axios";

const API_URL = "http://localhost:3000/users/clients";

// 🔹 Buscar todos os clientes
export const getClients = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 🔹 Criar um novo cliente
export const createClient = async (clientData: { name: string; email: string; phone?: string }) => {
  const token = localStorage.getItem("access_token");

  return axios.post(`${API_URL}/create`, clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Atualizar um cliente existente
export const updateClient = async (id: string, clientData: { name: string; email: string; phone?: string }) => {
  const token = localStorage.getItem("access_token");

  return axios.put(`${API_URL}/${id}`, clientData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Excluir um cliente
export const deleteClient = async (id: string) => {
  const token = localStorage.getItem("access_token");

  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};