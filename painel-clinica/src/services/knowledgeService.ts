import api from '../api';
import { AxiosResponse } from 'axios';
import { KnowledgeEntry, Category, FrequentQuestion } from '../types/knowledgeTypes';

// Endpoints para a Base de Conhecimento
const ENDPOINTS = {
  KNOWLEDGE_ENTRIES: '/knowledge',
  CATEGORIES: '/knowledge/categories',
  FREQUENT_QUESTIONS: '/knowledge/frequent-questions'
};

// Funções para manipulação de Entradas de Conhecimento
export const getKnowledgeEntries = async (filters = {}): Promise<KnowledgeEntry[]> => {
  try {
    const response: AxiosResponse<KnowledgeEntry[]> = await api.get(ENDPOINTS.KNOWLEDGE_ENTRIES, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar entradas de conhecimento:', error);
    throw error;
  }
};

export const getKnowledgeEntryById = async (id: string): Promise<KnowledgeEntry> => {
  try {
    const response: AxiosResponse<KnowledgeEntry> = await api.get(`${ENDPOINTS.KNOWLEDGE_ENTRIES}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar entrada de conhecimento com ID ${id}:`, error);
    throw error;
  }
};

export const createKnowledgeEntry = async (data: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<KnowledgeEntry> => {
  try {
    const response: AxiosResponse<KnowledgeEntry> = await api.post(ENDPOINTS.KNOWLEDGE_ENTRIES, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar entrada de conhecimento:', error);
    throw error;
  }
};

export const updateKnowledgeEntry = async (id: string, data: Partial<KnowledgeEntry>): Promise<KnowledgeEntry> => {
  try {
    const response: AxiosResponse<KnowledgeEntry> = await api.put(`${ENDPOINTS.KNOWLEDGE_ENTRIES}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar entrada de conhecimento com ID ${id}:`, error);
    throw error;
  }
};

export const deleteKnowledgeEntry = async (id: string): Promise<void> => {
  try {
    await api.delete(`${ENDPOINTS.KNOWLEDGE_ENTRIES}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir entrada de conhecimento com ID ${id}:`, error);
    throw error;
  }
};

// Funções para manipulação de Categorias
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response: AxiosResponse<Category[]> = await api.get(ENDPOINTS.CATEGORIES);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
};

export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response: AxiosResponse<Category> = await api.get(`${ENDPOINTS.CATEGORIES}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar categoria com ID ${id}:`, error);
    throw error;
  }
};

export const createCategory = async (data: Omit<Category, 'id' | '_count'>): Promise<Category> => {
  try {
    const response: AxiosResponse<Category> = await api.post(ENDPOINTS.CATEGORIES, data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    throw error;
  }
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | '_count'>>): Promise<Category> => {
  try {
    const response: AxiosResponse<Category> = await api.put(`${ENDPOINTS.CATEGORIES}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar categoria com ID ${id}:`, error);
    throw error;
  }
};

export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await api.delete(`${ENDPOINTS.CATEGORIES}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir categoria com ID ${id}:`, error);
    throw error;
  }
};

// Funções para manipulação de Perguntas Frequentes
export const getFrequentQuestions = async (filters = {}): Promise<FrequentQuestion[]> => {
  try {
    const response: AxiosResponse<FrequentQuestion[]> = await api.get(ENDPOINTS.FREQUENT_QUESTIONS, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar perguntas frequentes:', error);
    throw error;
  }
};

export const convertToKnowledgeEntry = async (questionId: string, data: { answer: string; categoryId: string | null; }): Promise<void> => {
  try {
    await api.post(`${ENDPOINTS.FREQUENT_QUESTIONS}/${questionId}/convert`, data);
  } catch (error) {
    console.error(`Erro ao converter pergunta frequente com ID ${questionId}:`, error);
    throw error;
  }
}; 