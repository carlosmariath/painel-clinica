import api from '../api';
import { Branch, BranchWithStats } from '../types/branch';

/**
 * Serviço para gerenciar filiais no frontend
 */
export const getBranches = async (includeInactive: boolean = false): Promise<Branch[]> => {
  const response = await api.get(`/branches${includeInactive ? '?includeInactive=true' : ''}`);
  return response.data;
};

/**
 * Obter uma filial específica pelo ID
 */
export const getBranchById = async (id: string): Promise<Branch> => {
  const response = await api.get(`/branches/${id}`);
  return response.data;
};

/**
 * Obter resumo de estatísticas de uma filial
 */
export const getBranchSummary = async (id: string): Promise<BranchWithStats> => {
  const response = await api.get(`/branches/${id}/summary`);
  return response.data;
};

/**
 * Criar uma nova filial
 */
export const createBranch = async (data: {
  name: string;
  address: string;
  phone: string;
  email?: string;
}): Promise<Branch> => {
  const response = await api.post('/branches', data);
  return response.data;
};

/**
 * Atualizar uma filial existente
 */
export const updateBranch = async (
  id: string,
  data: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    isActive?: boolean;
  }
): Promise<Branch> => {
  const response = await api.patch(`/branches/${id}`, data);
  return response.data;
};

/**
 * Desativar uma filial (soft delete)
 */
export const deactivateBranch = async (id: string): Promise<void> => {
  await api.delete(`/branches/${id}`);
}; 