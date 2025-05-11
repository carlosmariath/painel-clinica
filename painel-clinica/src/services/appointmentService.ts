import api from "../api";

const ENDPOINT = "/appointments";

// 🔹 Buscar TODOS os agendamentos (Admin)
export const getAllAppointments = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(ENDPOINT, { params });
  return response.data;
};

// 🔹 Buscar os agendamentos do CLIENTE logado
export const getClientAppointments = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(`${ENDPOINT}/client`, { params });
  return response.data;
};

// 🔹 Buscar os agendamentos do TERAPEUTA logado
export const getTherapistAppointments = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(`${ENDPOINT}/therapist`, { params });
  return response.data;
};

// 🔹 Criar um novo agendamento
export const createAppointment = async (appointmentData: { 
  therapistId: string; 
  date: string; 
  startTime: string; 
  endTime: string;
  branchId?: string;
  clientId?: string;
  notes?: string;
}) => {
  return api.post(ENDPOINT, appointmentData);
};

// 🔹 Atualizar um agendamento existente
export const updateAppointment = async (id: string, data: { 
  date?: string; 
  startTime?: string; 
  endTime?: string; 
  status?: string; 
  clientId?: string; 
  therapistId?: string; 
  notes?: string;
  branchId?: string;
}) => {
  console.log(`📝 Atualizando agendamento ${id} com dados:`, data);
  
  try {
    const response = await api.put(`${ENDPOINT}/${id}`, data);
    console.log(`✅ Agendamento ${id} atualizado com sucesso:`, response.data);
    return response;
  } catch (error) {
    console.error(`❌ Erro ao atualizar agendamento ${id}:`, error);
    throw error;
  }
};

// 🔹 Cancelar um agendamento
export const cancelAppointment = async (appointmentId: string) => {
  return api.post(`${ENDPOINT}/${appointmentId}/cancel`, {});
};

// 🔹 Excluir um agendamento
export const deleteAppointment = async (id: string) => {
  return api.delete(`${ENDPOINT}/${id}`);
};

// 🔹 Atualizar o status do agendamento
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  return api.patch(`${ENDPOINT}/${appointmentId}/status`, { status });
};

// 🔹 Listar agendamentos em um intervalo de datas
export const listAppointmentsInRange = async ({
  start,
  end,
  therapistId,
  clientId,
  branchId
}: {
  start: string;
  end: string;
  therapistId?: string;
  clientId?: string;
  branchId?: string;
}) => {
  const params: Record<string, string> = { start, end };
  
  if (therapistId) params.therapistId = therapistId;
  if (clientId) params.clientId = clientId;
  if (branchId) params.branchId = branchId;

  const response = await api.get(`${ENDPOINT}/calendar`, { params });
  return response.data;
};