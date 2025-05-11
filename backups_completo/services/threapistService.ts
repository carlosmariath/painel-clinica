import api from "../api";

const ENDPOINT = "/therapists";

// 🔹 Buscar todos os terapeutas ou por serviço
export const getTherapists = async (serviceId?: string, branchId?: string) => {
  const params: Record<string, string> = {};
  if (serviceId) params.serviceId = serviceId;
  if (branchId) params.branchId = branchId;
  
  const response = await api.get(ENDPOINT, { params });
  return response.data;
};

// 🔹 Criar um novo terapeuta (Apenas ADMIN pode criar)
export const createTherapist = async (therapistData: { 
  name: string; 
  email: string; 
  phone: string;
  specialty?: string;
  branchIds?: string[];
}) => {
  return api.post(ENDPOINT, therapistData);
};

// 🔹 Atualizar dados do terapeuta
export const updateTherapist = async (id: string, therapistData: { 
  name: string; 
  email: string; 
  phone: string;
  specialty?: string;
}) => {
  return api.patch(`${ENDPOINT}/${id}`, therapistData);
};

// 🔹 Deletar um terapeuta (Apenas ADMIN pode deletar)
export const deleteTherapist = async (id: string) => {
  return api.delete(`${ENDPOINT}/${id}`);
};

// 🔹 Associar serviço ao terapeuta
export const addServiceToTherapist = async (therapistId: string, serviceId: string) => {
  return api.post(`${ENDPOINT}/${therapistId}/services/${serviceId}`);
};

// 🔹 Desassociar serviço do terapeuta
export const removeServiceFromTherapist = async (therapistId: string, serviceId: string) => {
  return api.delete(`${ENDPOINT}/${therapistId}/services/${serviceId}`);
};

// 🔹 Buscar a disponibilidade do terapeuta autenticado (sem precisar passar therapistId)
export const getTherapistSchedule = async (branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(`${ENDPOINT}/me/schedule`, { params });
  return response.data;
};

// 🔹 Atualizar a disponibilidade do terapeuta autenticado
export const updateTherapistSchedule = async (
  schedule: { 
    dayOfWeek: number; 
    startTime: string; 
    endTime: string;
    branchId: string; 
  }
) => {
  return api.post(`${ENDPOINT}/me/schedule`, schedule);
};

// 🔹 Remover um horário de disponibilidade específico
export const deleteTherapistSchedule = async (scheduleId: string) => {
  return api.delete(`${ENDPOINT}/me/schedule/${scheduleId}`);
};

// 🔹 Adicionar filial ao terapeuta
export const addBranchToTherapist = async (therapistId: string, branchId: string) => {
  return api.post(`${ENDPOINT}/${therapistId}/branches/${branchId}`);
};

// 🔹 Remover filial do terapeuta
export const removeBranchFromTherapist = async (therapistId: string, branchId: string) => {
  return api.delete(`${ENDPOINT}/${therapistId}/branches/${branchId}`);
};

// 🔹 Buscar filiais do terapeuta
export const getTherapistBranches = async (therapistId: string) => {
  const response = await api.get(`${ENDPOINT}/${therapistId}/branches`);
  return response.data;
};