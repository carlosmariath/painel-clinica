import axios from "axios";

const API_URL = "http://localhost:3000/appointments";

// 🔹 Buscar TODOS os agendamentos (Admin)
export const getAllAppointments = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 🔹 Buscar os agendamentos do CLIENTE logado
export const getClientAppointments = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(`${API_URL}/client`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 🔹 Buscar os agendamentos do TERAPEUTA logado
export const getTherapistAppointments = async () => {
  const token = localStorage.getItem("access_token");

  const response = await axios.get(`${API_URL}/therapist`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

// 🔹 Criar um novo agendamento
export const createAppointment = async (appointmentData: { therapistId: string; date: string; startTime: string; endTime: string }) => {
  const token = localStorage.getItem("access_token");

  return axios.post(API_URL, appointmentData, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Atualizar um agendamento existente
export const updateAppointment = async (id: string, data: any) => {
  const token = localStorage.getItem("access_token");

  return axios.put(`${API_URL}/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Cancelar um agendamento
export const cancelAppointment = async (appointmentId: string) => {
  const token = localStorage.getItem("access_token");

  return axios.post(`${API_URL}/${appointmentId}/cancel`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 🔹 Excluir um agendamento
export const deleteAppointment = async (id: string) => {
  const token = localStorage.getItem("access_token");

  return axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
// 🔹 Atualizar o status do agendamento
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    const token = localStorage.getItem("access_token");
  
    return axios.patch(
      `${API_URL}/${appointmentId}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };