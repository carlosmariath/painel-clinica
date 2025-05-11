import axios from 'axios';
import { API_URL } from '../config';

export interface TherapyPlan {
  id: string;
  name: string;
  description?: string;
  sessionCount: number;
  validityDays: number;
  price: number;
  isActive: boolean;
  branchId: string;
}

export interface Subscription {
  id: string;
  clientId: string;
  therapyPlanId: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELED';
  remainingSessions: number;
  totalSessions: number;
  acceptanceToken?: string;
  acceptedAt?: string;
  therapyPlan?: TherapyPlan;
  client?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SessionConsumption {
  id: string;
  subscriptionId: string;
  appointmentId: string;
  consumedAt: string;
  branchId: string;
}

export const therapyPlanService = {
  // Planos de Terapia
  getPlans: async (branchId?: string) => {
    const response = await axios.get(`${API_URL}/therapy-plans${branchId ? `?branchId=${branchId}` : ''}`);
    return response.data;
  },

  getPlanById: async (id: string) => {
    const response = await axios.get(`${API_URL}/therapy-plans/${id}`);
    return response.data;
  },

  createPlan: async (planData: Omit<TherapyPlan, 'id'>) => {
    const response = await axios.post(`${API_URL}/therapy-plans`, planData);
    return response.data;
  },

  updatePlan: async (id: string, planData: Partial<TherapyPlan>) => {
    const response = await axios.patch(`${API_URL}/therapy-plans/${id}`, planData);
    return response.data;
  },

  deletePlan: async (id: string) => {
    const response = await axios.delete(`${API_URL}/therapy-plans/${id}`);
    return response.data;
  },

  // Subscrições de Planos
  getSubscriptions: async (clientId?: string, status?: string, branchId?: string) => {
    let url = `${API_URL}/therapy-plans/subscriptions`;
    const params = new URLSearchParams();
    
    if (clientId) params.append('clientId', clientId);
    if (status) params.append('status', status);
    if (branchId) params.append('branchId', branchId);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await axios.get(url);
    return response.data;
  },

  getSubscriptionById: async (id: string) => {
    const response = await axios.get(`${API_URL}/therapy-plans/subscriptions/${id}`);
    return response.data;
  },

  createSubscription: async (subscriptionData: Omit<Subscription, 'id' | 'status' | 'remainingSessions' | 'acceptanceToken' | 'acceptedAt'>) => {
    const response = await axios.post(`${API_URL}/therapy-plans/subscriptions`, subscriptionData);
    return response.data;
  },

  acceptSubscription: async (token: string) => {
    const response = await axios.post(`${API_URL}/therapy-plans/subscriptions/accept/${token}`);
    return response.data;
  },

  cancelSubscription: async (id: string) => {
    const response = await axios.patch(`${API_URL}/therapy-plans/subscriptions/${id}/cancel`);
    return response.data;
  },

  // Consumo de Sessões
  getConsumptionHistory: async (subscriptionId: string) => {
    const response = await axios.get(`${API_URL}/therapy-plans/consumption/${subscriptionId}`);
    return response.data;
  },

  getSessionsBalance: async (clientId: string) => {
    const response = await axios.get(`${API_URL}/therapy-plans/client/${clientId}/balance`);
    return response.data;
  }
};

export default therapyPlanService; 