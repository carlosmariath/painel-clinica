import api from '../api';
import { TherapyPlan } from '../types/therapyPlan';

// Interface do cliente (simplificada)
export interface Client {
  id: string;
  name: string;
  email: string;
}

// Interface de consumo
export interface ConsumptionDetail {
  id: string;
  appointmentId: string;
  consumedAt: string;
  branchId: string;
}

// Interface de assinatura
export interface Subscription {
  id: string;
  clientId: string;
  therapyPlanId: string;
  branchId: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELED';
  totalSessions: number;
  remainingSessions: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  therapyPlan?: TherapyPlan;
}

// Interface para criação de assinatura
export interface CreateSubscriptionDTO {
  clientId: string;
  planId: string;
  branchId?: string;
}

/**
 * Serviço para gerenciar assinaturas de planos de terapia
 */
export const subscriptionService = {
  /**
   * Busca todas as assinaturas, com filtros opcionais e paginação
   */
  getSubscriptions: async (
    clientId?: string,
    status?: string,
    branchId?: string | string[],
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: Subscription[]; total: number; page: number; limit: number; totalPages: number }> => {
    try {
      const params = new URLSearchParams();
      
      if (clientId) {
        params.append('clientId', clientId);
      }
      
      if (status) {
        params.append('status', status);
      }
      
      // Se branchId for um array, adicionar cada ID como parâmetro separado
      if (branchId) {
        if (Array.isArray(branchId)) {
          branchId.forEach(id => {
            if (id) params.append('branchIds', id);
          });
        } else {
          params.append('branchId', branchId);
        }
      }
      
      // Adicionar parâmetros de paginação
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      const queryString = params.toString();
      const endpoint = `/subscriptions${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Buscando assinaturas paginadas: ${endpoint}`);
      const response = await api.get(endpoint);
      
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar assinaturas:', error);
      throw error;
    }
  },

  /**
   * Busca uma assinatura específica pelo ID
   */
  getSubscriptionById: async (id: string): Promise<Subscription> => {
    try {
      console.log(`Buscando assinatura ID: ${id}`);
      const response = await api.get(`/subscriptions/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar assinatura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Cria uma nova assinatura
   */
  createSubscription: async (data: CreateSubscriptionDTO): Promise<Subscription> => {
    try {
      console.log('Criando nova assinatura:', data);
      const response = await api.post('/subscriptions', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      throw error;
    }
  },

  /**
   * Cancela uma assinatura existente
   */
  cancelSubscription: async (id: string): Promise<Subscription> => {
    try {
      console.log(`Cancelando assinatura ${id}`);
      const response = await api.patch(`/subscriptions/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao cancelar assinatura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Remove uma assinatura existente
   */
  deleteSubscription: async (id: string): Promise<void> => {
    try {
      console.log(`Removendo assinatura ${id}`);
      await api.delete(`/subscriptions/${id}`);
    } catch (error) {
      console.error(`Erro ao remover assinatura ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtém o histórico de consumo de uma assinatura
   */
  getConsumptionHistory: async (subscriptionId: string): Promise<ConsumptionDetail[]> => {
    try {
      console.log(`Buscando histórico de consumo da assinatura ${subscriptionId}`);
      const response = await api.get(`/subscriptions/${subscriptionId}/consumption`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar histórico de consumo:`, error);
      throw error;
    }
  }
};

export default subscriptionService; 