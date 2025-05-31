import api from '../api';
import { 
  TherapyPlan, 
  CreateTherapyPlanDTO, 
  UpdateTherapyPlanDTO,
  TherapyPlanFilters,
  RemoveTherapyPlanResponse,
  TherapyPlanBranchDTO
} from '../types/therapyPlan';

/**
 * Serviço para gerenciar planos de terapia
 */
export const therapyPlanService = {
  /**
   * Busca todos os planos de terapia, com filtros opcionais
   * Se não for passado um branchId, vai usar as filiais do token do usuário
   */
  getPlans: async (filters?: TherapyPlanFilters): Promise<TherapyPlan[]> => {
    try {
      const params = new URLSearchParams();
      
      // O filtro de filial agora é opcional e será tratado pelo backend
      // com base no token do usuário, se não for fornecido
      if (filters?.branchId) {
        params.append('branchId', filters.branchId);
      }
      
      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }
      
      if (filters?.searchTerm) {
        params.append('search', filters.searchTerm);
      }
      
      const queryString = params.toString();
      const endpoint = `/therapy-plans${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Buscando planos de terapia: ${endpoint}`);
      const response = await api.get(endpoint);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar planos de terapia:', error);
      throw error;
    }
  },

  /**
   * Busca um plano específico pelo ID
   */
  getPlanById: async (id: string): Promise<TherapyPlan> => {
    try {
      console.log(`Buscando plano ID: ${id}`);
      const response = await api.get(`/therapy-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar plano ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria um novo plano de terapia
   */
  createPlan: async (planData: CreateTherapyPlanDTO): Promise<TherapyPlan> => {
    try {
      console.log('Criando novo plano:', planData);
      const response = await api.post('/therapy-plans', planData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      throw error;
    }
  },

  /**
   * Atualiza um plano existente
   */
  updatePlan: async (id: string, planData: UpdateTherapyPlanDTO): Promise<TherapyPlan> => {
    try {
      console.log(`Atualizando plano ${id}:`, planData);
      const response = await api.patch(`/therapy-plans/${id}`, planData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar plano ${id}:`, error);
      throw error;
    }
  },

  /**
   * Remove um plano existente
   */
  deletePlan: async (id: string): Promise<RemoveTherapyPlanResponse> => {
    try {
      console.log(`Removendo plano ${id}`);
      const response = await api.delete(`/therapy-plans/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover plano ${id}:`, error);
      throw error;
    }
  },

  /**
   * Adiciona uma filial a um plano
   */
  addBranchToPlan: async (planId: string, branchId: string): Promise<TherapyPlan> => {
    try {
      console.log(`Adicionando filial ${branchId} ao plano ${planId}`);
      const association: TherapyPlanBranchDTO = { therapyPlanId: planId, branchId };
      const response = await api.post(`/therapy-plans/${planId}/branches`, association);
      return response.data;
    } catch (error) {
      console.error(`Erro ao adicionar filial ao plano:`, error);
      throw error;
    }
  },

  /**
   * Remove uma filial de um plano
   */
  removeBranchFromPlan: async (planId: string, branchId: string): Promise<TherapyPlan> => {
    try {
      console.log(`Removendo filial ${branchId} do plano ${planId}`);
      const response = await api.delete(`/therapy-plans/${planId}/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao remover filial do plano:`, error);
      throw error;
    }
  },

  /**
   * Filtra planos localmente com base nos critérios de busca
   */
  filterPlans: (plans: TherapyPlan[], filters: TherapyPlanFilters): TherapyPlan[] => {
    return plans.filter(plan => {
      // Filtrar por status ativo/inativo
      if (filters.isActive !== undefined && plan.isActive !== filters.isActive) {
        return false;
      }

      // Filtrar por filial
      if (filters.branchId && plan.branches && plan.branches.length > 0) {
        const hasBranch = plan.branches.some(branch => branch.id === filters.branchId);
        if (!hasBranch) {
          return false;
        }
      }

      // Filtrar por termo de busca
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const nameMatch = plan.name.toLowerCase().includes(searchLower);
        const descMatch = plan.description?.toLowerCase().includes(searchLower);
        
        if (!nameMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }
};

export default therapyPlanService; 