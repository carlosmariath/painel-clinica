import axios from "axios";

const API_URL = "http://localhost:3000/auth"; // Ajuste para o endpoint correto do seu backend

export const login = async (email: string, password: string) => {
  const response = await axios.post(`${API_URL}/login`, { email, password });
  const access_token = response.data.access_token;

  if (access_token) {
    localStorage.setItem("access_token", access_token);
  }

  return access_token;
};

// 🔹 Nova função para buscar os dados do usuário autenticado
export const getUserProfile = async () => {
  const token = localStorage.getItem("access_token");

  if (!token) return null;

  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data; // Retorna os dados do usuário
};