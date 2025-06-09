import api from '../api';

export type TransactionType = 'REVENUE' | 'EXPENSE';

export interface FinancialTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  clientId?: string;
  branchId?: string;
  reference?: string;
  referenceType?: string;
  paymentMethodId?: string;
  financeCategoryId?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  paymentMethod?: {
    id: string;
    name: string;
  };
  financeCategory?: {
    id: string;
    name: string;
    type: TransactionType;
  };
}

export interface FinanceCategory {
  id: string;
  name: string;
  type: TransactionType;
  description?: string;
  _count?: {
    transactions: number;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  _count?: {
    transactions: number;
  };
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  balance: number;
  byCategory: {
    REVENUE?: Record<string, { total: number, count: number }>;
    EXPENSE?: Record<string, { total: number, count: number }>;
  };
  transactionCount: number;
  period: {
    start: string | null;
    end: string | null;
  };
}

export const financeService = {
  // Transações Financeiras
  getTransactions: async (
    startDate?: string,
    endDate?: string,
    type?: TransactionType,
    clientId?: string,
    branchId?: string,
    categoryId?: string
  ) => {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);
    if (clientId) params.append('clientId', clientId);
    if (branchId) params.append('branchId', branchId);
    if (categoryId) params.append('categoryId', categoryId);
    
    const url = `/finance/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await api.get(`/finance/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (transactionData: Omit<FinancialTransaction, 'id'>) => {
    const response = await api.post(`/finance/transactions`, transactionData);
    return response.data;
  },

  updateTransaction: async (id: string, transactionData: Partial<FinancialTransaction>) => {
    const response = await api.patch(`/finance/transactions/${id}`, transactionData);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await api.delete(`/finance/transactions/${id}`);
    return response.data;
  },

  // Categorias Financeiras
  getCategories: async (type?: TransactionType) => {
    const url = `/finance/categories${type ? `?type=${type}` : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await api.get(`/finance/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: Omit<FinanceCategory, 'id' | '_count'>) => {
    const response = await api.post(`/finance/categories`, categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<FinanceCategory>) => {
    const response = await api.patch(`/finance/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await api.delete(`/finance/categories/${id}`);
    return response.data;
  },

  // Métodos de Pagamento
  getPaymentMethods: async (onlyActive: boolean = false) => {
    const url = `/finance/payment-methods${onlyActive ? '?onlyActive=true' : ''}`;
    
    const response = await api.get(url);
    return response.data;
  },

  getPaymentMethodById: async (id: string) => {
    const response = await api.get(`/finance/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (methodData: Omit<PaymentMethod, 'id' | '_count'>) => {
    const response = await api.post(`/finance/payment-methods`, methodData);
    return response.data;
  },

  updatePaymentMethod: async (id: string, methodData: Partial<PaymentMethod>) => {
    const response = await api.patch(`/finance/payment-methods/${id}`, methodData);
    return response.data;
  },

  deletePaymentMethod: async (id: string) => {
    const response = await api.delete(`/finance/payment-methods/${id}`);
    return response.data;
  },

  // Relatórios Financeiros
  getFinancialSummary: async (startDate?: string, endDate?: string, branchId?: string) => {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    
    const url = `/finance/summary${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await api.get(url);
    return response.data as FinancialSummary;
  }
};

export default financeService; 