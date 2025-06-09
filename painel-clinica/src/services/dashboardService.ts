import api from "../api";
import { 
  DashboardData, 
  DashboardStats, 
  UpcomingAppointment,
  RevenueChart,
  AppointmentsByTherapist,
  ServiceDistribution 
} from "../types/dashboard";

// Endpoints do dashboard
const ENDPOINTS = {
  stats: "/dashboard/stats",
  upcomingAppointments: "/dashboard/upcoming-appointments",
  revenueChart: "/dashboard/revenue-chart",
  appointmentsByTherapist: "/dashboard/appointments-by-therapist",
  serviceDistribution: "/dashboard/service-distribution",
  fullDashboard: "/dashboard/full"
};

// Obter estatísticas gerais
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get(ENDPOINTS.stats);
  return response.data;
};

// Obter próximos agendamentos
export const getUpcomingAppointments = async (limit: number = 5): Promise<UpcomingAppointment[]> => {
  const response = await api.get(ENDPOINTS.upcomingAppointments, {
    params: { limit }
  });
  return response.data;
};

// Obter gráfico de receita
export const getRevenueChart = async (period: 'week' | 'month' | 'year' = 'month'): Promise<RevenueChart> => {
  const response = await api.get(ENDPOINTS.revenueChart, {
    params: { period }
  });
  return response.data;
};

// Obter agendamentos por terapeuta
export const getAppointmentsByTherapist = async (): Promise<AppointmentsByTherapist[]> => {
  const response = await api.get(ENDPOINTS.appointmentsByTherapist);
  return response.data;
};

// Obter distribuição de serviços
export const getServiceDistribution = async (): Promise<ServiceDistribution[]> => {
  const response = await api.get(ENDPOINTS.serviceDistribution);
  return response.data;
};

// Obter todos os dados do dashboard de uma vez (otimizado)
export const getFullDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get(ENDPOINTS.fullDashboard);
  return response.data;
};