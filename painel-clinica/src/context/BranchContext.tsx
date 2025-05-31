import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Branch } from '../types/branch';
import { getBranches } from '../services/branchService';
import { useAuth } from './AuthContext';

// Interface para o contexto de filial
interface BranchContextType {
  currentBranch: Branch | null;
  branches: Branch[];
  loading: boolean;
  error: string | null;
  setCurrentBranch: (branch: Branch | null) => void;
  setCurrentBranchById: (branchId: string | null) => void;
  // Adicionado para suportar administradores
  isAdmin: boolean;
  allBranches: boolean;
  setAllBranches: (value: boolean) => void;
  setBranches: (branches: Branch[]) => void;
  loadBranches: () => Promise<void>;
}

// Alterando a definição do contexto para exportá-lo diretamente
export const BranchContext = createContext<BranchContextType>({
  currentBranch: null,
  branches: [],
  loading: false,
  error: null,
  setCurrentBranch: () => {},
  setCurrentBranchById: () => {},
  isAdmin: false,
  allBranches: false,
  setAllBranches: () => {},
  setBranches: () => {},
  loadBranches: async () => {}
});

// Adicionando esta exportação para garantir compatibilidade com importações existentes
export default BranchContext;

interface BranchProviderProps {
  children: ReactNode;
}

/**
 * Provider para gerenciar a filial selecionada globalmente na aplicação
 */
export const BranchProvider: React.FC<BranchProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Flag para indicar se o admin está visualizando todas as filiais
  const [allBranches, setAllBranches] = useState(isAdmin);

  // Carregar filiais ao iniciar
  const loadBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Busca todas as filiais ativas
      const allAvailableBranches = await getBranches(false);
      
      // Filtra as filiais com base nas permissões do usuário
      let userBranches = allAvailableBranches;
      
      // Se o usuário não é admin e tem allowedBranches no JWT, filtra as filiais permitidas
      if (!isAdmin && user?.allowedBranches && user.allowedBranches.length > 0) {
        userBranches = allAvailableBranches.filter(branch => 
          user.allowedBranches?.includes(branch.id)
        );
      }
      
      setBranches(userBranches);
      
      // Se não temos filial selecionada e há filiais, selecionar a primeira
      const savedBranchId = localStorage.getItem('currentBranchId');
      
      if (userBranches.length > 0 && !allBranches) {
        if (savedBranchId) {
          // Tentar carregar a filial salva
          const savedBranch = userBranches.find(b => b.id === savedBranchId);
          if (savedBranch) {
            setCurrentBranch(savedBranch);
          } else {
            // Se a filial salva não foi encontrada, usar a primeira
            setCurrentBranch(userBranches[0]);
            localStorage.setItem('currentBranchId', userBranches[0].id);
          }
        } else {
          // Se não há filial salva, usar a primeira
          setCurrentBranch(userBranches[0]);
          localStorage.setItem('currentBranchId', userBranches[0].id);
        }
      } else if (allBranches) {
        // Se estamos no modo 'todas as filiais', não selecionamos nenhuma filial específica
        setCurrentBranch(null);
      }
    } catch (err) {
      setError('Erro ao carregar filiais');
      console.error('Erro ao carregar filiais:', err);
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar filiais quando o usuário mudar
  useEffect(() => {
    if (user) {
      loadBranches();
    }
  }, [user]);

  // Atualizar o estado de "todas as filiais" quando o usuário mudar
  useEffect(() => {
    setAllBranches(isAdmin);
  }, [isAdmin]);

  // Função para selecionar uma filial pelo ID
  const setCurrentBranchById = (branchId: string | null) => {
    if (!branchId) {
      setCurrentBranch(null);
      localStorage.removeItem('currentBranchId');
      if (isAdmin) {
        setAllBranches(true);
      }
      return;
    }
    
    // Desabilitar o modo "todas as filiais"
    setAllBranches(false);
    
    const branch = branches.find(b => b.id === branchId);
    if (branch) {
      setCurrentBranch(branch);
      localStorage.setItem('currentBranchId', branchId);
    }
  };

  // Efeito para restaurar a filial selecionada do localStorage
  useEffect(() => {
    const savedBranchId = localStorage.getItem('currentBranchId');
    if (savedBranchId && branches.length > 0) {
      const savedBranch = branches.find(b => b.id === savedBranchId);
      if (savedBranch) {
        setCurrentBranch(savedBranch);
      }
    }
  }, [branches]);

  // Modificar setCurrentBranch para salvar a seleção
  const handleSetCurrentBranch = (branch: Branch | null) => {
    setCurrentBranch(branch);
    if (branch) {
      localStorage.setItem('currentBranchId', branch.id);
    } else {
      localStorage.removeItem('currentBranchId');
    }
  };

  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        branches,
        loading,
        error,
        setCurrentBranch: handleSetCurrentBranch,
        setCurrentBranchById,
        isAdmin,
        allBranches,
        setAllBranches,
        setBranches,
        loadBranches
      }}
    >
      {children}
    </BranchContext.Provider>
  );
};

/**
 * Hook para usar o contexto de filial
 */
export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch deve ser usado dentro de um BranchProvider');
  }
  return context;
}; 