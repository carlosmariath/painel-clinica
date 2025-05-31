import React, { useEffect, useState } from 'react';
import { FormControl, InputLabel, MenuItem, Select, Typography, Box, Chip } from '@mui/material';
import { getBranches } from '../services/branchService';
import { Branch } from '../types/branch';
import { Apartment } from '@mui/icons-material';
import axios from 'axios';
import { useBranch } from '../context/BranchContext';

interface BranchSelectorProps {
  onChange?: (branchId: string | null) => void;
  value?: string | null;
  label?: string;
  showAllOption?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium';
  useGlobalContext?: boolean;  // Se true, usará o contexto global de filial
}

/**
 * Componente para seleção de filial
 * Pode ser usado em formulários, filtros e outros lugares onde seja necessário
 * selecionar uma filial.
 */
const BranchSelector: React.FC<BranchSelectorProps> = ({
  onChange,
  value = null,
  label = 'Filial',
  showAllOption = true,
  disabled = false,
  size = 'small',
  useGlobalContext = false,
}) => {
  // Usar o hook useBranch para acessar o contexto
  const branchContext = useBranch();

  // Desabilitar o uso do contexto global se ele não estiver disponível
  const useGlobalContextIfAvailable = useGlobalContext;

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função auxiliar para extrair mensagem de erro da resposta da API
  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error) && error.response?.data) {
      // Tentar extrair a mensagem de erro da resposta da API
      return error.response.data.message || 'Ocorreu um erro ao carregar filiais';
    }
    
    return 'Erro ao carregar filiais do servidor';
  };

  // Se estiver usando o contexto global, não precisa buscar filiais novamente
  useEffect(() => {
    if (useGlobalContextIfAvailable) {
      return; // O contexto já tem as filiais carregadas
    }
    
    const fetchBranches = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await getBranches(false); // apenas filiais ativas
        setBranches(data);
        
        // Se não temos valor selecionado e há filiais, selecionar a primeira
        if (!value && data.length > 0 && !showAllOption) {
          if (onChange) onChange(data[0].id);
        }
      } catch (err: unknown) {
        const errorMsg = getErrorMessage(err);
        setError(errorMsg);
        console.error('Erro ao carregar filiais:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [onChange, value, showAllOption, useGlobalContextIfAvailable]);

  // Handler para mudança de seleção
  const handleChange = (branchId: string | null) => {
    if (useGlobalContextIfAvailable) {
      branchContext.setCurrentBranchById(branchId);
    } else if (onChange) {
      onChange(branchId);
    }
  };
  
  // Determinar qual lista de filiais e valor usar
  const branchList = useGlobalContextIfAvailable ? branchContext.branches : branches;
  
  // Se estamos usando o contexto global e estamos no modo "todas as filiais", o valor selecionado deve ser vazio
  const selectedValue = useGlobalContextIfAvailable ? 
    (branchContext.allBranches ? '' : (branchContext.currentBranch?.id || '')) : 
    (value || '');
  
  const isLoading = useGlobalContextIfAvailable ? 
    branchContext.loading : 
    loading;

  // Determinar se devemos mostrar a opção "Todas as filiais" - sempre mostrar para administradores
  const showAllOptionFinal = showAllOption || (useGlobalContextIfAvailable && branchContext.isAdmin);

  // Se só temos uma filial e não mostramos a opção "Todas", não precisa mostrar o seletor
  if (branchList.length === 1 && !showAllOption) {
    return (
      <Box display="flex" alignItems="center" sx={{ ml: 1 }}>
        <Chip 
          icon={<Apartment fontSize="small" />}
          label={branchList[0].name} 
          size="small" 
          color="primary" 
          variant="outlined" 
        />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error" variant="caption">{error}</Typography>;
  }

  // Preparando os itens do Menu como um array em vez de usar um Fragment implícito
  const menuItems = [];
  
  // Adicionar opção "Todas as filiais" se necessário
  if (showAllOptionFinal) {
    menuItems.push(
      <MenuItem key="all" value="">
        <em>Todas as filiais</em>
      </MenuItem>
    );
  }
  
  // Adicionar as filiais
  branchList.forEach((branch) => {
    menuItems.push(
      <MenuItem key={branch.id} value={branch.id}>
        {branch.name}
      </MenuItem>
    );
  });

  return (
    <FormControl size={size} sx={{ minWidth: 120 }} disabled={disabled || isLoading}>
      <InputLabel id="branch-selector-label">{label}</InputLabel>
      <Select
        labelId="branch-selector-label"
        value={selectedValue}
        label={label}
        onChange={(e) => handleChange(e.target.value === '' ? null : e.target.value)}
      >
        {menuItems}
      </Select>
    </FormControl>
  );
};

export default BranchSelector; 