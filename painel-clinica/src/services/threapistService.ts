import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// 🔹 Função para obter o token armazenado no Local Storage
const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 🔹 Buscar todos os terapeutas
export const getTherapists = async () => {
  const response = await axios.get(`${API_URL}/therapists`, getAuthHeaders());
  return response.data;
};

// 🔹 Criar um novo terapeuta (Apenas ADMIN pode criar)
export const createTherapist = async (therapistData: { name: string; email: string; phone: string; }) => {
  return axios.post(`${API_URL}/therapists`, therapistData, getAuthHeaders());
};

// 🔹 Atualizar dados do terapeuta
export const updateTherapist = async (id: any, therapistData: { name: string; email: string; phone: string; }) => {
  return axios.put(`${API_URL}/therapists/${id}`, therapistData, getAuthHeaders());
};

// 🔹 Deletar um terapeuta (Apenas ADMIN pode deletar)
export const deleteTherapist = async (id: string) => {
  return axios.delete(`${API_URL}/therapists/${id}`, getAuthHeaders());
};

// 🔹 Buscar a disponibilidade do terapeuta autenticado (sem precisar passar therapistId)
export const getTherapistSchedule = async () => {
  const response = await axios.get(`${API_URL}/therapists/me/schedule`, getAuthHeaders());
  return response.data;
};

// 🔹 Atualizar a disponibilidade do terapeuta autenticado
export const updateTherapistSchedule = async (schedule: { id: number; dayOfWeek: number; startTime: string; endTime: string; }[]) => {
  return axios.post(`${API_URL}/therapists/me/schedule`, schedule, getAuthHeaders());
};

// 🔹 Remover um horário de disponibilidade específico
export const deleteTherapistSchedule = async (scheduleId: any) => {
  return axios.delete(`${API_URL}/therapists/me/schedule/${scheduleId}`, getAuthHeaders());
};