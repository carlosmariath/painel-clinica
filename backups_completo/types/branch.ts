/**
 * Interface para representar uma filial (branch) no sistema
 */
export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para resumo de estatísticas de uma filial
 */
export interface BranchStats {
  therapists: number;
  totalAppointments: number;
  activeAppointments: number;
  users: number;
  services: number;
}

/**
 * Interface que inclui dados da filial com suas estatísticas
 */
export interface BranchWithStats extends Branch {
  stats: BranchStats;
} 