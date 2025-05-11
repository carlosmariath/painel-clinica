import axios from 'axios';
import { API_URL } from '../config';

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
    let url = `${API_URL}/finance/transactions`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type) params.append('type', type);
    if (clientId) params.append('clientId', clientId);
    if (branchId) params.append('branchId', branchId);
    if (categoryId) params.append('categoryId', categoryId);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await axios.get(url);
    return response.data;
  },

  getTransactionById: async (id: string) => {
    const response = await axios.get(`${API_URL}/finance/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (transactionData: Omit<FinancialTransaction, 'id'>) => {
    const response = await axios.post(`${API_URL}/finance/transactions`, transactionData);
    return response.data;
  },

  updateTransaction: async (id: string, transactionData: Partial<FinancialTransaction>) => {
    const response = await axios.patch(`${API_URL}/finance/transactions/${id}`, transactionData);
    return response.data;
  },

  deleteTransaction: async (id: string) => {
    const response = await axios.delete(`${API_URL}/finance/transactions/${id}`);
    return response.data;
  },

  // Categorias Financeiras
  getCategories: async (type?: TransactionType) => {
    let url = `${API_URL}/finance/categories`;
    if (type) url += `?type=${type}`;
    
    const response = await axios.get(url);
    return response.data;
  },

  getCategoryById: async (id: string) => {
    const response = await axios.get(`${API_URL}/finance/categories/${id}`);
    return response.data;
  },

  createCategory: async (categoryData: Omit<FinanceCategory, 'id' | '_count'>) => {
    const response = await axios.post(`${API_URL}/finance/categories`, categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: Partial<FinanceCategory>) => {
    const response = await axios.patch(`${API_URL}/finance/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axios.delete(`${API_URL}/finance/categories/${id}`);
    return response.data;
  },

  // Métodos de Pagamento
  getPaymentMethods: async (onlyActive: boolean = false) => {
    let url = `${API_URL}/finance/payment-methods`;
    if (onlyActive) url += `?onlyActive=true`;
    
    const response = await axios.get(url);
    return response.data;
  },

  getPaymentMethodById: async (id: string) => {
    const response = await axios.get(`${API_URL}/finance/payment-methods/${id}`);
    return response.data;
  },

  createPaymentMethod: async (methodData: Omit<PaymentMethod, 'id' | '_count'>) => {
    const response = await axios.post(`${API_URL}/finance/payment-methods`, methodData);
    return response.data;
  },

  updatePaymentMethod: async (id: string, methodData: Partial<PaymentMethod>) => {
    const response = await axios.patch(`${API_URL}/finance/payment-methods/${id}`, methodData);
    return response.data;
  },

  deletePaymentMethod: async (id: string) => {
    const response = await axios.delete(`${API_URL}/finance/payment-methods/${id}`);
    return response.data;
  },

  // Relatórios Financeiros
  getFinancialSummary: async (startDate?: string, endDate?: string, branchId?: string) => {
    let url = `${API_URL}/finance/summary`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (branchId) params.append('branchId', branchId);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await axios.get(url);
    return response.data as FinancialSummary;
  }
};

export default financeService; 