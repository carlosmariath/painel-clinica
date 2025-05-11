/**
 * Interface para representar um serviço oferecido pela clínica
 */
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  averageDuration: number;
  branchId?: string;
} 