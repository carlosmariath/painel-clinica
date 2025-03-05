// Interface para entradas da base de conhecimento
export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  categoryId: string | null;
  category?: {
    id: string;
    name: string;
  };
  tags: string[];
  viewCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para categorias
export interface Category {
  id: string;
  name: string;
  description: string;
  _count: {
    knowledgeEntries: number;
  };
}

// Interface para perguntas frequentes
export interface FrequentQuestion {
  id: string;
  question: string;
  count: number;
  knowledgeId: string | null;
  lastAskedAt: string;
  autoDetected: boolean;
}

// Interface para filtros de busca de entradas de conhecimento
export interface KnowledgeEntryFilters {
  categoryId?: string;
  searchTerm?: string;
  enabled?: boolean | string;
  page?: number;
  limit?: number;
}

// Interface para filtros de busca de perguntas frequentes
export interface FrequentQuestionFilters {
  onlyWithoutAnswer?: boolean;
  searchTerm?: string;
  page?: number;
  limit?: number;
} 