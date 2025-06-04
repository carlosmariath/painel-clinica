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

// 🔹 Buscar a disponibilidade de um terapeuta específico (para admins)
export const getTherapistScheduleById = async (therapistId: string, branchId?: string) => {
  const params = branchId ? { branchId } : {};
  const response = await api.get(`${ENDPOINT}/${therapistId}/schedule`, { params });
  return response.data;
};

// 🔹 Atualizar a disponibilidade do terapeuta autenticado
export const updateTherapistSchedule = async (
  schedule: { 
    dayOfWeek: number; 
    startTime: string; 
    endTime: string;
    branchId: string;
    id?: string; // ID opcional para edição
  }
) => {
  const response = await api.post(`${ENDPOINT}/me/schedule`, schedule);
  return response.data;
};

// 🔹 Atualizar a disponibilidade de um terapeuta específico (para admins)
export const updateTherapistScheduleById = async (
  therapistId: string,
  schedule: { 
    dayOfWeek: number; 
    startTime: string; 
    endTime: string;
    branchId: string;
    id?: string; // ID opcional para edição 
  }
) => {
  const response = await api.post(`${ENDPOINT}/${therapistId}/schedule`, schedule);
  return response.data;
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

// 🔹 Buscar todos os horários de um terapeuta (em todas as filiais)
export const getAllTherapistSchedules = async (therapistId?: string) => {
  try {
    // Se não passar therapistId, pega do terapeuta logado
    const endpoint = therapistId 
      ? `${ENDPOINT}/${therapistId}/schedules/all` 
      : `${ENDPOINT}/me/schedules/all`;
    
    const response = await api.get(endpoint);
    
    // Garantir que os dados retornados são consistentes
    const schedules = response.data || [];
    
    // Verificar se os dados já estão organizados por filial
    if (Array.isArray(schedules)) {
      // Se for um array simples, retorna como está
      return schedules;
    } else {
      // Se for um objeto complexo, tenta extrair os horários
      return schedules.schedules || schedules.data || [];
    }
  } catch (error) {
    console.error("Erro ao buscar horários:", error);
    return []; // Retorna array vazio em caso de erro
  }
};

// 🔹 Remover um horário de um terapeuta
export const removeTherapistSchedule = async (therapistId: string, scheduleId: string) => {
  try {
    const response = await api.delete(`${ENDPOINT}/${therapistId}/schedule/${scheduleId}`);
    return response.data;
  } catch (error: unknown) {
    // Se o erro for 404 (horário não encontrado), retornamos um objeto específico
    const err = error as { response?: { status?: number } };
    if (err.response && err.response.status === 404) {
      return { success: false, message: 'Horário não encontrado' };
    }
    
    // Para outros erros, lançamos o erro para que o componente possa lidar com ele
    throw error;
  }
};

// 🔹 Remover todos os horários de um terapeuta em uma filial específica
export const removeAllTherapistSchedulesFromBranch = async (therapistId: string, branchId: string) => {
  try {
    const response = await api.delete(`${ENDPOINT}/${therapistId}/schedule/branch/${branchId}`);
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: any } };
    if (err.response && err.response.status === 404) {
      return { deleted: 0, message: 'Não foram encontrados horários para excluir' };
    }
    
    if (err.response && err.response.data && err.response.data.message) {
      throw new Error(err.response.data.message);
    }
    
    throw error;
  }
};