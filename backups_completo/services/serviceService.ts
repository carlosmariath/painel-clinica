import api from "../api";

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description?: string;
}

/**
 * Obter todos os serviços disponíveis
 */
export const getServices = async (): Promise<Service[]> => {
  const response = await api.get("/services");
  return response.data;
};

/**
 * Obter um serviço pelo ID
 */
export const getServiceById = async (id: string): Promise<Service> => {
  const response = await api.get(`/services/${id}`);
  return response.data;
};

/**
 * Criar um novo serviço
 */
export const createService = async (data: {
  name: string;
  description: string;
  price: number;
  averageDuration: number;
  branchId?: string;
}): Promise<Service> => {
  const response = await api.post('/services', data);
  return response.data;
};

/**
 * Atualizar um serviço existente
 */
export const updateService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    averageDuration?: number;
    branchId?: string;
  }
): Promise<Service> => {
  const response = await api.patch(`/services/${id}`, data);
  return response.data;
};

/**
 * Excluir um serviço
 */
export const deleteService = async (id: string): Promise<void> => {
  await api.delete(`/services/${id}`);
}; 