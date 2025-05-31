import api from "../api";
import axios from "axios";
import { API_URL } from "../config";

const ENDPOINT = "/auth";

// Login precisa usar axios diretamente porque ainda não temos o token
export const login = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_URL}${ENDPOINT}/login`, { email, password });
    const access_token = response.data.access_token;

    if (access_token) {
      localStorage.setItem("access_token", access_token);
      return access_token;
    } else {
      throw new Error("Token não encontrado na resposta");
    }
  } catch (error) {
    console.error("Erro durante login:", error);
    throw error;
  }
};

// 🔹 Função para buscar os dados do usuário autenticado
export const getUserProfile = async () => {
  // Verificamos se existe um token no localStorage
  if (!localStorage.getItem("access_token")) return null;

  try {
    const response = await api.get(`${ENDPOINT}/me`);
    return response.data; // Retorna os dados do usuário
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    // Se houver erro (ex: token inválido), limpa o token
    localStorage.removeItem("access_token");
    throw error;
  }
};