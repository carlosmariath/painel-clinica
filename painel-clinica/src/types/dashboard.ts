export interface DashboardStats {
  totalAppointments: number;
  confirmedSessions: number;
  canceledSessions: number;
  pendingSessions: number;
  clientsCount: number;
  activeClients: number;
  newClients: number;
  therapistsCount: number;
  revenue: {
    current: number;
    previous: number;
    trend: number;
  };
  confirmationRate: number;
  appointmentsTrend: number;
  clientsTrend: number;
  revenueTrend: number;
}

export interface UpcomingAppointment {
  id: string;
  clientId: string;
  clientName: string;
  therapistId: string;
  therapistName: string;
  service: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'canceled';
}

export interface RevenueChart {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
  }[];
}

export interface AppointmentsByTherapist {
  therapistId: string;
  therapistName: string;
  count: number;
  percentage: number;
}

export interface ServiceDistribution {
  serviceId: string;
  serviceName: string;
  count: number;
  percentage: number;
}

export interface DashboardData {
  stats: DashboardStats;
  upcomingAppointments: UpcomingAppointment[];
  revenueChart: RevenueChart;
  appointmentsByTherapist: AppointmentsByTherapist[];
  serviceDistribution: ServiceDistribution[];
  lastUpdate: string;
}