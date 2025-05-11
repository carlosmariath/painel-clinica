import React, { createContext, useContext, useEffect, useState } from 'react';
import { Branch } from '../types/branch';
import { getBranches } from '../services/branchService';
import { useAuth } from './AuthContext';

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
}

export const BranchContext = createContext<BranchContextType | undefined>(undefined);

interface BranchProviderProps {
  children: React.ReactNode;
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
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getBranches(false); // apenas filiais ativas
        setBranches(data);
        
        // Se não temos filial selecionada e há filiais, selecionar a primeira
        const savedBranchId = localStorage.getItem('currentBranchId');
        
        if (data.length > 0 && !allBranches) {
          if (savedBranchId) {
            // Tentar carregar a filial salva
            const savedBranch = data.find(b => b.id === savedBranchId);
            if (savedBranch) {
              setCurrentBranch(savedBranch);
            } else {
              // Se a filial salva não foi encontrada, usar a primeira
              setCurrentBranch(data[0]);
              localStorage.setItem('currentBranchId', data[0].id);
            }
          } else {
            // Se não há filial salva, usar a primeira
            setCurrentBranch(data[0]);
            localStorage.setItem('currentBranchId', data[0].id);
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

    fetchBranches();
  }, [allBranches]);

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

  return (
    <BranchContext.Provider
      value={{
        currentBranch,
        branches,
        loading,
        error,
        setCurrentBranch,
        setCurrentBranchById,
        isAdmin,
        allBranches,
        setAllBranches
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