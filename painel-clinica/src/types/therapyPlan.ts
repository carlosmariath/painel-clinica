/**
 * Representa uma filial (versão simplificada)
 */
export interface BranchSummary {
  id: string;
  name: string;
}

/**
 * Representa um plano de terapia completo
 */
export interface TherapyPlan {
  id: string;
  name: string;
  description?: string;
  totalSessions: number;
  totalPrice: number;
  validityDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  branches: BranchSummary[];
  subscriptionCount?: number;
}

/**
 * Dados para criação de um plano de terapia
 */
export interface CreateTherapyPlanDTO {
  name: string;
  description?: string;
  totalSessions: number;
  totalPrice: number;
  validityDays: number;
  isActive?: boolean;
  branchIds: string[];
}

/**
 * Dados para atualização de um plano de terapia
 */
export interface UpdateTherapyPlanDTO extends Partial<CreateTherapyPlanDTO> {
  id: string;
}

/**
 * Filtros para listagem de planos
 */
export interface TherapyPlanFilters {
  branchId?: string;
  isActive?: boolean;
  searchTerm?: string;
}

/**
 * Representa a associação entre um plano e uma filial
 */
export interface TherapyPlanBranchDTO {
  therapyPlanId: string;
  branchId: string;
}

/**
 * Resposta do servidor para operação de remoção
 */
export interface RemoveTherapyPlanResponse {
  success: boolean;
  message: string;
}

/**
 * Estatísticas de um plano de terapia
 */
export interface TherapyPlanStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  completedSubscriptions: number;
  averageSessionsUsed: number;
} 